"""Feature UI checks with explicit v3-save fixtures; full playthrough is separate."""
import asyncio,json,os,shutil
from browser_check import BASE,OUT,snap,walk,settle,interact,expected,play_mini
from playwright.async_api import async_playwright
async def run():
 passed=[];errors=[]
 def check(t):passed.append(t);print('PASS:',t,flush=True)
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
  async def seed(**extra):
   raw={'version':3,'chapter':1,'storyScene':2,'stage':'home','x':720,'events':[],'memories':[],'quests':[],'inspected':[],'choices':{},'settings':{'sound':False,'textSpeed':0},**extra}
   c=await b.new_context(viewport={'width':412,'height':915},accept_downloads=True);q=await c.new_page();q.on('pageerror',lambda e:(errors.append(str(e)),print('JSERROR:',str(e),flush=True)))
   await q.add_init_script("if(!localStorage.getItem('life-story:save'))localStorage.setItem('life-story:save',"+json.dumps(json.dumps(raw))+')')
   await q.goto(BASE);await q.wait_for_selector('#loading',state='hidden');await q.locator('#continue-game').click();await q.wait_for_timeout(150);return c,q
  c,q=await seed(storyScene=1,x=790,settings={'sound':False,'textSpeed':15})
  await q.keyboard.press('e');await q.wait_for_timeout(150);assert (await snap(q))['typing']
  await q.keyboard.press('Escape');before=await q.locator('.dialogue-text').inner_text();await q.wait_for_timeout(650);assert before==await q.locator('.dialogue-text').inner_text()
  await q.locator('#menu-resume').click();await q.keyboard.press('Enter');assert not (await snap(q))['typing']
  await q.locator('#dialogue-history').click();assert '일어났나' in await q.locator('.dialogue-history').inner_text();await q.locator('.close-modal').click()
  while not (await snap(q))['dialogue']['choices']:await q.keyboard.press('Enter');await q.wait_for_timeout(30)
  await q.keyboard.press('Enter');await q.locator('[data-choice="1"]').focus();await q.keyboard.press('Enter');await settle(q)
  assert (await snap(q))['choices']['mother-photo']=='내 모습을 찾아본다'
  await q.locator('#pause-button').click();await q.locator('#menu-settings').click();await q.locator('#textSize').select_option('xlarge');await q.locator('#textSpeed').select_option('0');await q.locator('#highContrast').check();await q.locator('#autoAdvance').check();await q.locator('#musicVolume').fill('0.15');await q.locator('#sfxVolume').fill('0.25');await q.locator('.close-modal').click();await q.wait_for_timeout(150)
  await q.keyboard.press('e');await q.wait_for_timeout(200);assert await q.locator('.dialogue-text').evaluate('(e)=>getComputedStyle(e).fontSize')=='21px'
  await q.keyboard.press('Escape');idx=(await snap(q))['dialogue']['index'];await q.wait_for_timeout(2200);assert (await snap(q))['dialogue']['index']==idx
  await q.locator('#menu-resume').click();await q.wait_for_timeout(1900);assert (await snap(q))['dialogue']['index']>idx
  await settle(q);await q.reload();await q.wait_for_selector('#loading',state='hidden');s=await snap(q);assert s['settings']['textSize']=='xlarge' and s['settings']['highContrast'] and s['settings']['musicVolume']==.15
  check('타이핑·정지·기록·Enter 선택·자동 진행·큰 글씨·설정 복원');await c.close()
  c,q=await seed()
  await interact(q,720);assert (await snap(q))['objectStates']['home:tv']['on'] is False
  await q.reload();await q.wait_for_selector('#loading',state='hidden');await q.locator('#continue-game').click();assert (await snap(q))['objectStates']['home:tv']['on'] is False
  await interact(q,1150);assert (await snap(q))['objectStates']['home:drawer']['opened']
  await interact(q,790);await interact(q,790);await q.keyboard.press('e');assert '서랍' in (await snap(q))['dialogue']['text'];await settle(q)
  await interact(q,1150);assert not (await snap(q))['objectStates']['home:drawer']['opened']
  await interact(q,360);assert 'toy' in (await snap(q))['inspected']
  check('TV 저장·서랍 열고 닫기·후속 대화·장난감 동작');await c.close()
  c,q=await seed(x=170,events=['brother:paper'],inspected=['photo','tv'],memories=['family'])
  await interact(q,170);assert 'family-photo' in (await snap(q))['unlockedRecalls'];await q.locator('#album-button').click();await q.locator('[data-memory="family"]').click();assert '접힌 선' in await q.locator('.modal').inner_text()
  check('조건부 사진 회상 해금·앨범 반영');await c.close()
  c,q=await seed(stage='brother-room',x=460,dialogueVisits={'brother:2':1},choices={'brother-shape':'비행기'})
  await q.keyboard.press('e')
  for _ in range(40):
   s=await snap(q)
   if s['overlay']=='minigame':break
   if s['dialogue']:await q.locator('.dialogue-text').click()
   elif s['overlay']=='cutscene':await q.wait_for_function('!document.querySelector("#visual-next").disabled');await q.locator('#visual-next').click()
   await q.wait_for_timeout(50)
  assert (await snap(q))['mini']['active'];await q.locator('#mini-primary').click();await q.wait_for_timeout(450);assert (await snap(q))['minigames']['paper']['foldSteps']==1
  await q.locator('.mini-pause').click();assert (await snap(q))['mini']['paused'];await q.locator('#menu-resume').click()
  while (await snap(q))['mini']['phase']=='fold':await q.locator('#mini-primary').click();await q.wait_for_timeout(450)
  await q.locator('.mini-pause').click();assert not (await snap(q))['mini']['animationFrame'];await q.locator('#menu-resume').click();assert (await snap(q))['mini']['animationFrame']
  await q.locator('#mini-primary').click();await q.wait_for_selector('#mini-done');await q.screenshot(path=str(OUT/'paper-minigame.png'));await q.locator('#mini-primary').click();await q.locator('#mini-primary').click();await q.wait_for_selector('#mini-done');await q.locator('#mini-done').click();await settle(q)
  s=await snap(q);assert s['minigames']['paper']['plays']==2 and s['minigames']['paper']['bestDistance']>=s['minigames']['paper']['distance'];assert 'brother' in s['memories']
  await q.locator('#pause-button').click();await q.locator('#menu-files').click()
  async with q.expect_download() as dl:await q.locator('#export-save').click()
  download=await dl.value;path=OUT/'exported-save.json';await download.save_as(path);assert json.loads(path.read_text())['state']['minigames']['paper']['plays']==2
  old=await q.evaluate("localStorage.getItem('life-story:save')")
  for name,content in [('bad.json','{'),('future.json',json.dumps({**json.loads(old),'version':99}))]:
   await q.locator('#import-save').set_input_files({'name':name,'mimeType':'application/json','buffer':content.encode()});assert await q.locator('#confirm-import').count()==0;assert await q.evaluate("localStorage.getItem('life-story:save')")==old
  await q.locator('#import-save').set_input_files(str(path));await q.locator('#confirm-import').click();await expected(q,2,'brother-room');assert (await snap(q))['overlay'] is None;assert await q.evaluate("localStorage.getItem('life-story:save:before-import')")==old
  check('종이놀이·거리·재시도·정지·실제 JSON 다운로드와 검증·복구');await c.close()
  c,q=await seed(storyScene=9,stage='study',x=90)
  await q.keyboard.press('e');await q.wait_for_timeout(180);assert (await snap(q))['playerFrame'] in [9,10];await settle(q)
  check('책 조사 중 독서 프레임과 종료 뒤 입력 복원');await c.close()
  c,q=await seed(storyScene=9,stage='study',x=380,dialogueVisits={'grandma:9':1,'grandpa:9':1})
  await interact(q,380,1);s=await snap(q);assert s['storyScene']==10 and s['minigames']['study']['answered']==3 and s['minigames']['study']['correct']==0
  await interact(q,1100);await q.keyboard.press('e');assert '다시 세면' in (await snap(q))['dialogue']['text'];await settle(q)
  check('공부 오답 3문제 후 진행·결과에 따른 후속 대화');await c.close()
  c,q=await seed(storyScene=7,stage='father-home',x=120)
  await interact(q,120);assert (await snap(q))['objectStates']['father-home:bed']['naps']==1
  await q.locator('#sound-button').click();await q.wait_for_timeout(400);assert (await snap(q))['audio']['enabled']
  for _ in range(4):
   await q.locator('#pause-button').click();a=(await snap(q))['audio'];assert a['activeSources']==0 and a['ambientLoops']==0 and not a['musicTimer'];await q.locator('#menu-resume').click();await q.wait_for_timeout(100)
  a=(await snap(q))['audio'];assert a['activeSources']<=31 and a['ambientLoops']<=3 and a['musicTimer'];await q.locator('#sound-button').click();a=(await snap(q))['audio'];assert not a['enabled'] and a['activeSources']==0 and not a['environmentTimer']
  check('침대 휴식·Web Audio 실행·반복 정지 리소스 정리·음소거');await c.close()
  c,q=await seed(storyScene=3,x=620,events=['mask-equipped','brother:paper','chapter-1-complete'])
  await q.keyboard.press('e');await q.locator('[data-pose="2"]').click();await q.wait_for_selector('#mini-primary');assert (await snap(q))['choices']['hero-pose']=='힘차게';await q.locator('#mini-primary').click();assert (await snap(q))['overlay']=='cutscene'
  await q.locator('#pause-button').click();await q.locator('#menu-timeline').click();await q.locator('[data-revisit="2"]').click();s=await snap(q);assert s['overlay'] is None and not s['mini']['active'] and not s['dialogue'];await walk(q,400)
  check('액션가면 자세 선택·컷신 중 재방문 취소·입력 복원');await c.close()
  assert not errors,errors
  report={'passed':passed,'javascript_exceptions':errors,'fixture_based':True,'browser':'Headless Chromium','real_android_device':False};(OUT/'expansion-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2));await b.close()
if __name__=='__main__':asyncio.run(run())
