"""Focused UI checks using explicit saved-state fixtures; not a full playthrough."""
import asyncio,json,os,shutil
from playwright.async_api import async_playwright
from browser_check import BASE,OUT,snap,walk,settle,interact,expected,check_text,play_mini
async def run():
 passed=[];errors=[]
 async with async_playwright() as p:
  exe=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium')
  b=await p.chromium.launch(**({'executable_path':exe} if exe else {}),headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
  async def seeded(raw):
   c=await b.new_context(viewport={'width':412,'height':915});q=await c.new_page();q.on('pageerror',lambda e:(errors.append(str(e)),print('JSERROR:',str(e),flush=True)))
   raw={'version':3,'chapter':1,'events':[],'memories':[],'inspected':[],'quests':[],'choices':{},'dialogueVisits':{},'cutscenesSeen':[],'settings':{'sound':False},**raw}
   await q.add_init_script("if(!localStorage.getItem('life-story:save'))localStorage.setItem('life-story:save',"+json.dumps(json.dumps(raw))+')')
   await q.goto(BASE);await q.wait_for_selector('#loading',state='hidden');await q.locator('#continue-game').click();await q.wait_for_timeout(150);return c,q,raw
  c,q,raw=await seeded({'version':2,'storyScene':7,'stage':'father-home','x':570,'events':['story:hero'],'memories':['hero'],'playtime':130})
  await expected(q,7);assert (await q.evaluate("JSON.parse(localStorage.getItem('life-story:save:v2-backup'))"))['version']==2
  await interact(q,570,1);assert (await snap(q))['choices']['father-meal']=='다 먹고 나갈지 묻는다'
  await walk(q,570);await q.keyboard.press('e');await q.wait_for_timeout(70);assert '나갈 때는' in (await snap(q))['dialogue']['text'];await check_text(q);await settle(q)
  assert (await snap(q))['memories']==['hero'];passed.append('v2 진행 보존·원본 백업·아버지의 다른 선택과 재대화 반응');await c.close()
  c,q,_=await seeded({'storyScene':2,'stage':'brother-room','x':650,'interludeReturn':{'stage':'home','x':1300}})
  await interact(q,650,1);assert (await snap(q))['choices']['brother-shape']=='배'
  await interact(q,460);assert 'brother' in (await snap(q))['memories'];await interact(q,1040);await expected(q,2,'home')
  passed.append('형제 종이놀이의 배 선택·형 전용 컷신·거실 복귀');await c.close()
  for answer in [1,2]:
   c,q,_=await seeded({'storyScene':9,'stage':'study','x':380,'dialogueVisits':{'grandma:9':1,'grandpa:9':1}})
   await interact(q,380,answer);await expected(q,10);assert (await snap(q))['choices']['study-answer'] in ['4','먼저 그림을 볼래요'];await c.close()
  passed.append('공부 오답·그림부터 보기의 자연스러운 반응과 동일 진행')
  c,q,_=await seeded({'storyScene':3,'stage':'home','x':790,'events':['mask-equipped','brother:paper']})
  await q.keyboard.press('e');await q.wait_for_timeout(70);assert '가면 썼네' in (await snap(q))['dialogue']['text'];await settle(q)
  await interact(q,790);assert (await snap(q))['dialogueVisits']['mother:3']==2
  passed.append('가면 착용 후 어머니 대사와 반복 대화 변화');await c.close()
  c,q,_=await seeded({'storyScene':5,'stage':'door-home','x':1215})
  await q.keyboard.press('e');await q.wait_for_function('lifeStory.getSnapshot().overlay==="cutscene"')
  for _ in range(2):
   await q.wait_for_function('!document.querySelector("#visual-next").disabled');await q.keyboard.press('Enter' if _==0 else 'e');await q.wait_for_timeout(30)
  await q.locator('#pause-button').click();await q.wait_for_timeout(300);assert (await snap(q))['modalOpen']
  await q.locator('#menu-title').click();await q.wait_for_timeout(800);assert (await snap(q))['mode']=='title'
  await q.locator('#continue-game').click();await q.wait_for_timeout(130);await expected(q,5);await interact(q,1215);await expected(q,6)
  passed.append('방문 애니메이션 일시정지·타이틀 취소·재진입 복구');await c.close()
  c,q,_=await seeded({'storyScene':12,'stage':'present-street','x':250,'events':['chapter-1-complete'],'memories':['hero','brother']})
  await q.locator('#menu-button').click();await q.locator('#menu-timeline').click();await q.locator('[data-revisit="2"]').click();await expected(q,2,'home');assert (await snap(q))['memories']==['hero','brother']
  await q.locator('#chapters-button').click();await q.locator('[data-chapter="2"]').click();assert '기획 단계' in await q.locator('.modal').inner_text();await q.locator('.close-modal').click();await expected(q,2)
  passed.append('완료 후 재방문·기억 보존·후속 챕터 기획 표시');await c.close()
  c,q,_=await seeded({'storyScene':3,'stage':'home','x':620,'events':['mask-equipped','brother:paper']})
  await q.keyboard.press('e');await play_mini(q);await q.wait_for_function('lifeStory.getSnapshot().overlay==="cutscene"')
  expressions=[]
  while (await snap(q))['overlay']=='cutscene':
   await q.wait_for_function('!document.querySelector("#visual-next").disabled')
   n=int((await q.locator('.beat-counter').inner_text()).split('/')[0]);state=await snap(q)
   if n==3:assert str(next(e for e in state['entities'] if e['id']=='mother')['frame'])=='8'
   if n==7:
    assert str(next(e for e in state['entities'] if e['id']=='mother')['frame'])=='7';await q.screenshot(path=str(OUT/'natural-hero-expressions.png'))
   if n in [12,13,14,15,16]:assert state['playerVisible'] is False
   if n==17:assert state['playerVisible'] is True
   expressions.append(n);await q.locator('#visual-next').click();await q.wait_for_timeout(30)
  await settle(q);await expected(q,4);assert len(expressions)==22
  passed.append('부모 표정 프레임·가족 웃음·장난의 화면 밖 처리·22비트 완료');await c.close()
  assert not errors,errors
  report={'passed':passed,'javascript_exceptions':errors,'fixture_based':True};(OUT/'natural-dialogue-regressions.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2));await b.close()
if __name__=='__main__':asyncio.run(run())
