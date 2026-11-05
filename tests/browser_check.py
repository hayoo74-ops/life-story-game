"""Run against npm run preview. Requires Python Playwright and Chromium.
GAME_URL and CHROMIUM_PATH can override the defaults. No gameplay setters are used.
"""
import asyncio,json,os,shutil,time,re
from pathlib import Path
from playwright.async_api import async_playwright
BASE=os.environ.get('GAME_URL','http://localhost:4173/life-story-game/')
OUT=Path('test-results');OUT.mkdir(exist_ok=True)
async def snap(page):return await page.evaluate('lifeStory.getSnapshot()')
async def walk(page,x):
 s=await snap(page)
 if abs(s['x']-x)<9:return
 key='ArrowRight' if s['x']<x else 'ArrowLeft'
 await page.keyboard.down(key)
 try:await page.wait_for_function('(x)=>Math.abs(lifeStory.getSnapshot().x-x)<9',arg=x,timeout=int(abs(s['x']-x)/95*1000+4000))
 except Exception:
  print('Movement failure',await snap(page),flush=True);await page.screenshot(path=str(OUT/'failure.png'));raise
 finally:await page.keyboard.up(key)
 await page.wait_for_timeout(45)
PLAY_TEXT=[]
BANNED=re.compile(r'실제 발언|확인되지|재구성입니다|사용자가 제공|실제 기록|사실로|제작|창작|실제 기억|연출입니다|기록을 확인|추가하지 않|지정하지 않')
async def check_text(page):
 for selector in ['#dialogue:not([hidden])','#cinematic:not([hidden])']:
  for element in await page.locator(selector).all():
   text=await element.inner_text();assert not BANNED.search(text),text;PLAY_TEXT.append(text)
 assert await page.locator('#dialogue .fiction-tag').count()==0
async def play_mini(page,answer=0):
 for _ in range(120):
  s=await snap(page)
  if not s.get('mini',{}).get('active'):return
  if s['modalOpen']:await page.locator('.close-modal').click()
  buttons=page.locator('#mini-root button:not(:disabled):not(.mini-pause)')
  if await page.locator('#mini-done').count():await page.locator('#mini-done').click()
  elif await page.locator('[data-pose]:not(:disabled)').count():await page.locator('[data-pose]').first.click()
  elif await page.locator('[data-answer]:not(:disabled)').count():await page.locator('[data-answer]').nth(answer).click()
  elif await buttons.count():await buttons.first.click()
  await page.wait_for_timeout(120)
 raise AssertionError(('Mini stuck',await snap(page)))
async def settle(page,answer=0):
 for _ in range(650):
  s=await snap(page)
  await check_text(page)
  if s['dialogue']:
   if s.get('typing'):
    await page.locator('.next-line').click() if await page.locator('.next-line').count() else await page.locator('.dialogue-text').click()
    await page.wait_for_timeout(40);continue
   if s['dialogue']['choices']:
    choices=page.locator('.choice-button');await choices.nth(min(answer,await choices.count()-1)).click()
   else:await page.locator('#dialogue').click()
  elif s['overlay']=='minigame':await play_mini(page,answer)
  elif s['overlay'] in ['interaction','transition']:await page.wait_for_timeout(200)
  elif s['overlay']=='farewell':
   if s['farewell']['phase']=='quote':await page.keyboard.press('Enter')
   elif s['farewell']['phase']=='epilogue' and not s['farewell']['busy']:await page.locator('#farewell-next').click()
   else:await page.wait_for_timeout(150)
  elif s['overlay']=='memory':await page.locator('#memory-close').click()
  elif s['overlay']=='cutscene':
   await page.locator('#visual-next').wait_for();await page.wait_for_function('!document.querySelector("#visual-next").disabled');await page.locator('#visual-next').click()
  elif s['overlay']=='opening':await page.locator('#opening-next').click()
  else:return
  await page.wait_for_timeout(45)
 raise AssertionError(('Conversation stuck',await snap(page)))
async def interact(page,x,answer=0):
 await walk(page,x);await page.keyboard.press('e');await page.wait_for_timeout(60);await settle(page,answer)
async def expected(page,scene,stage=None):
 s=await snap(page);assert s['storyScene']==scene,s
 if stage:assert s['stage']==stage,s
async def start(page):
 await page.goto(BASE);await page.wait_for_selector('#loading',state='hidden');await page.locator('#new-game').click();await expected(page,0,'present')
async def run():
 passed=[];errors=[];started=time.monotonic()
 def check(label):passed.append(label);print('PASS:',label,flush=True)
 async with async_playwright() as p:
  exe=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium')
  browser=await p.chromium.launch(**({'executable_path':exe} if exe else {}),headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
  context=await browser.new_context(viewport={'width':412,'height':915},is_mobile=True,has_touch=True,device_scale_factor=1)
  page=await context.new_page();page.on('pageerror',lambda e:(errors.append(str(e)),print('JSERROR:',str(e),flush=True)))
  await start(page)
  cdp=await context.new_cdp_session(page)
  boxes=[await page.locator(f'[data-control={k}]').bounding_box() for k in ['right','jump']]
  points=[{'x':b['x']+b['width']/2,'y':b['y']+b['height']/2,'id':i+1} for i,b in enumerate(boxes)]
  before=await snap(page);await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':points[:1]});await page.wait_for_timeout(130);await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':points});await page.wait_for_timeout(160)
  moving=await snap(page);assert moving['x']>before['x']+10 and moving['y']<before['y']-10
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});await page.wait_for_timeout(900);await page.wait_for_function('lifeStory.getSnapshot().grounded',timeout=8000);stopped=await snap(page);await page.wait_for_timeout(120);assert abs((await snap(page))['x']-stopped['x'])<1 and abs(stopped['y']-460)<5
  await page.locator('#pause-button').click();old=await snap(page);await page.keyboard.down('ArrowRight');await page.wait_for_timeout(130);await page.keyboard.up('ArrowRight');assert (await snap(page))['x']==old['x'];await page.locator('#menu-resume').click()
  check('이동·점프 멀티터치, 해제 후 정지, 일시정지·재개')
  await interact(page,650);await expected(page,1,'home')
  await interact(page,170);await expected(page,1);assert 'photo' not in (await snap(page))['inspected']
  await walk(page,790);await page.keyboard.press('e');await page.wait_for_timeout(80)
  assert (await snap(page))['dialogue']['speaker']=='어머니';await page.screenshot(path=str(OUT/'natural-mother.png'));await settle(page)
  first=await snap(page);assert first['dialogueVisits']['mother:1']==1
  await walk(page,790);await page.keyboard.press('e');await page.wait_for_timeout(60);assert '사진 찾았나' in (await snap(page))['dialogue']['text'];await settle(page)
  await interact(page,170);await expected(page,2)
  await interact(page,620);await interact(page,620);await interact(page,790)
  await interact(page,485);await expected(page,2);assert 'mask-equipped' not in (await snap(page))['events']
  check('엄마 필수 대화, 가족 반복 대사·선택 반응, 사물만으로 진행 불가')
  await interact(page,1300);assert (await snap(page))['stage']=='brother-room'
  assert any(e['character']=='brother' for e in (await snap(page))['entities'])
  await interact(page,650);assert (await snap(page))['choices']['brother-shape']=='비행기'
  await walk(page,460);await page.keyboard.press('e');await page.wait_for_timeout(80)
  while (await snap(page))['dialogue']:
   await page.locator('#dialogue').click();await page.wait_for_timeout(50)
  assert (await snap(page))['overlay']=='cutscene';assert await page.locator('#visual-skip').count()==0
  await page.screenshot(path=str(OUT/'brother-paper.png'));await settle(page)
  assert 'brother' in (await snap(page))['memories'];await interact(page,650);assert (await snap(page))['dialogueVisits']['brother:2']==2
  # Save reload in the interlude preserves return point and choice.
  await page.reload();await page.wait_for_selector('#loading',state='hidden');await page.locator('#continue-game').click();await page.wait_for_timeout(100)
  assert (await snap(page))['stage']=='brother-room' and (await snap(page))['choices']['brother-shape']=='비행기'
  await interact(page,1040);await expected(page,2,'home')
  check('형 전용 픽셀 캐릭터·선택·종이 접기 컷신·반복 대화·막간 저장 복원')
  for x in [360,660,900,1050,1390]:await interact(page,x)
  await interact(page,1510);assert (await snap(page))['stage']=='alley'
  for x in [430,920]:await interact(page,x)
  await interact(page,1550)
  for x in [420,780]:await interact(page,x)
  await interact(page,1240)
  for x in [480,820]:await interact(page,x)
  await interact(page,1150);await interact(page,850);await interact(page,1250);assert (await snap(page))['stage']=='home'
  check('기존 선택 탐험 맵과 배경 NPC·사물의 자연스러운 대화 유지')
  await interact(page,485);await expected(page,3)
  await walk(page,620);await page.keyboard.press('e');await page.wait_for_timeout(70)
  await play_mini(page)
  assert (await snap(page))['overlay']=='cutscene' and await page.locator('#visual-skip').count()==0
  assert not any(e['character']=='brother' for e in (await snap(page))['entities'])
  hero_lines=[]
  while (await snap(page))['overlay']=='cutscene':
   await check_text(page);hero_lines.append(await page.locator('.cutscene-card p').inner_text())
   counter=await page.locator('.beat-counter').inner_text()
   if counter.startswith('7 /'):await page.screenshot(path=str(OUT/'natural-hero.png'))
   await page.wait_for_function('!document.querySelector("#visual-next").disabled')
   await page.locator('#visual-next').click();await page.wait_for_timeout(40)
  assert len(hero_lines)==22,hero_lines
  assert '우하하하! 난 액션가면!' in hero_lines and '액션가면은 빤쓰만 입고 있는다.' in hero_lines
  # Only after all 22 beats does the revised scene become skippable.
  assert (await snap(page))['overlay']=='memory'
  await page.reload();await page.wait_for_selector('#loading',state='hidden');await page.locator('#continue-game').click();await page.wait_for_timeout(120)
  await walk(page,620);await page.keyboard.press('e');await play_mini(page);await page.wait_for_selector('#visual-skip');await page.locator('#visual-skip').click();await settle(page);await expected(page,4,'interval')
  check('액션가면 22개 대사·행동, 부모 반응, 첫 관람 필수·재관람 건너뛰기')
  await interact(page,460);await interact(page,820);await expected(page,5,'door-home')
  assert not any(e['character']=='brother' for e in (await snap(page))['entities'])
  await walk(page,1215);await page.keyboard.press('e');await page.wait_for_timeout(220)
  for _ in range(2):
   await page.wait_for_function('!document.querySelector("#visual-next").disabled');await page.locator('#visual-next').click();await page.wait_for_timeout(40)
  await page.wait_for_timeout(800);await page.screenshot(path=str(OUT/'natural-door.png'))
  await settle(page);await expected(page,6,'changed-home')
  check('방문 파손 직접 목격, 문학적 독백·충격음·정적, 형 비참여')
  await interact(page,850);await expected(page,6)
  await interact(page,590);await interact(page,850);await expected(page,7,'father-home')
  await interact(page,1120);await expected(page,7)
  await interact(page,570);assert (await snap(page))['choices']['father-meal']=='수저를 놓는다'
  await walk(page,570);await page.keyboard.press('e');await page.wait_for_timeout(60);assert '수저는 잘 놓았네' in (await snap(page))['dialogue']['text'];await page.screenshot(path=str(OUT/'father-meal.png'));await settle(page)
  for x in [400,990,780]:await interact(page,x)
  await interact(page,1120);await expected(page,8,'daeyeon')
  check('이혼 이후 순서 유지, 아버지와 식사 준비 대화·선택 후속 반응')
  for x in [350,660,920]:await interact(page,x)
  await interact(page,1300);await expected(page,9,'study')
  await interact(page,380);await expected(page,9)
  await interact(page,690);await interact(page,690);await interact(page,1100);await interact(page,1100)
  for x in [90,540,840,980,1400]:await interact(page,x)
  await interact(page,380);await expected(page,10);assert (await snap(page))['choices']['study-answer']=='5'
  await walk(page,690);await page.keyboard.press('e');await page.wait_for_timeout(50);assert '정리' in (await snap(page))['dialogue']['text'];await page.screenshot(path=str(OUT/'grandma-after-study.png'));await settle(page)
  await interact(page,1100);await interact(page,1230);await interact(page,1550);await expected(page,11,'present')
  check('조부모 필수 대화·공부 선택·공부 전후 대사·체벌 기억의 비특정 서술')
  await interact(page,920);assert (await snap(page))['stage']=='brother-room'
  await walk(page,650);await page.keyboard.press('e');await page.wait_for_timeout(50);assert '또 종이' in (await snap(page))['dialogue']['text'];await settle(page);await interact(page,1040);await expected(page,11)
  await walk(page,650);await page.keyboard.press('e');await page.wait_for_timeout(70)
  for _ in range(8):await check_text(page);await page.locator('#summary-next').click()
  await settle(page);await expected(page,12)
  await interact(page,1090);assert 'chapter-1-complete' in (await snap(page))['events']
  await page.locator('#ending-next').click();await page.locator('#ending-explore').click()
  final=await snap(page);assert len(final['memories'])==17,final['memories']
  check('12장면과 형제 막간 포함 전체 완료·기억 17개·형의 후기 대화')
  await page.locator('#album-button').click();assert await page.locator('.memory-card.found').count()==17
  await page.locator('#album-family').click();assert '형' in await page.locator('.modal').inner_text() and '동거 시기' in await page.locator('.modal').inner_text();await page.screenshot(path=str(OUT/'family-source-notes.png'));await page.locator('.close-modal').click()
  await page.locator('#menu-button').click();await page.locator('#menu-settings').click();await page.locator('#setting-large').click();await page.locator('.close-modal').click()
  await page.reload();await page.wait_for_selector('#loading',state='hidden');await page.locator('#continue-game').click();assert len((await snap(page))['memories'])==17 and (await snap(page))['dialogueVisits']['brother:2']==2
  await walk(page,1100);await page.keyboard.press('e');await page.wait_for_timeout(80)
  for w,h in [(360,740),(412,915),(915,412),(1440,1000)]:
   await page.set_viewport_size({'width':w,'height':h});await page.wait_for_timeout(180)
   layout=await page.evaluate('''()=>{const f=document.querySelector('.game-frame').getBoundingClientRect(),d=document.querySelector('.play-dock').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,overlap:f.bottom>d.top+1,buttons:[...document.querySelectorAll('.control')].every(b=>{const r=b.getBoundingClientRect();return r.bottom<=innerHeight+1&&r.left>=0&&r.right<=innerWidth&&r.width>=44&&r.height>=44})}}''')
   assert not layout['overflow'] and not layout['overlap'] and layout['buttons'],(w,h,layout)
   await page.screenshot(path=str(OUT/f'natural-layout-{w}x{h}.png'),full_page=True)
  await settle(page)
  check('출처는 기록 메뉴에서만 확인, 가족·선택·반복 이력 저장, 모바일·가로·데스크톱 UI')
  await page.evaluate('navigator.serviceWorker.ready');await page.wait_for_function('navigator.serviceWorker.controller!==null');await context.set_offline(True);await page.reload();await page.wait_for_selector('#loading',state='hidden');await page.locator('#continue-game').click();assert len((await snap(page))['memories'])==17
  check('오프라인 리소스와 최신 저장으로 이어하기')
  assert not errors,errors
  report={'passed':passed,'javascript_exceptions':errors,'full_route':{'memories':len(final['memories']),'choices':len(final['choices']),'dialogue_visits':final['dialogueVisits']},'hero_beats':len(hero_lines),'checked_play_text_screens':len(PLAY_TEXT),'automated_seconds':round(time.monotonic()-started),'human_playtime_measured':False,'real_android_device':False}
  (OUT/'natural-dialogue-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));(OUT/'natural-dialogue-transcript.txt').write_text('\n\n---\n\n'.join(PLAY_TEXT));print(json.dumps(report,ensure_ascii=False,indent=2));await browser.close()
if __name__=='__main__':asyncio.run(run())
