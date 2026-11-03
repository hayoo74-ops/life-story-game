"""Run against npm run preview. Requires Python Playwright and Chromium.
GAME_URL and CHROMIUM_PATH can override the defaults. No gameplay setters are used.
"""
import asyncio,json,os,shutil,time
from pathlib import Path
from playwright.async_api import async_playwright
BASE=os.environ.get('GAME_URL','http://localhost:4173/')
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
async def settle(page,answer=0):
 for _ in range(110):
  s=await snap(page)
  if s['dialogue']:
   if s['dialogue']['choices']:
    choices=page.locator('.choice-button');await choices.nth(min(answer,await choices.count()-1)).click()
   else:await page.locator('#dialogue').click()
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
  page=await context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  await start(page)
  # Real CDP multi-touch, with simultaneous movement and jump, then release.
  cdp=await context.new_cdp_session(page)
  boxes=[await page.locator(f'[data-control={k}]').bounding_box() for k in ['right','jump']]
  touches=[{'x':b['x']+b['width']/2,'y':b['y']+b['height']/2,'id':i+1} for i,b in enumerate(boxes)]
  before=await snap(page)
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':touches[:1]});await page.wait_for_timeout(150)
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':touches});await page.wait_for_timeout(170)
  during=await snap(page);assert during['x']>before['x']+15 and during['y']<before['y']-15
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});await page.wait_for_timeout(850)
  stopped=await snap(page);await page.wait_for_timeout(150);assert abs((await snap(page))['x']-stopped['x'])<1 and abs(stopped['y']-460)<5
  check('동시 터치 이동·점프, 해제 후 정지와 착지')
  await page.locator('#pause-button').click();paused=await snap(page);await page.keyboard.down('ArrowRight');await page.wait_for_timeout(150);await page.keyboard.up('ArrowRight');assert (await snap(page))['x']==paused['x'];await page.locator('#menu-resume').click()
  check('일시정지와 재개')
  await interact(page,650);await expected(page,1,'home')
  await interact(page,170);await expected(page,2)
  # Parents first. All optional home objects except mask, which advances the timeline.
  for x in [620,790,360,660,720,1070,1240]:await interact(page,x)
  await interact(page,1410);assert (await snap(page))['stage']=='alley'
  for x in [430,920]:await interact(page,x)
  await interact(page,1550);assert (await snap(page))['stage']=='playground'
  for x in [420,780]:await interact(page,x)
  await interact(page,1240);assert (await snap(page))['stage']=='store'
  for x in [480,820]:await interact(page,x)
  await interact(page,1150);assert (await snap(page))['stage']=='school'
  await interact(page,850);await interact(page,1250);assert (await snap(page))['stage']=='home'
  check('기존 선택 탐험 4개 맵, 익명 창작 NPC와 사물 조사')
  await interact(page,890);await expected(page,3)
  # Resume with mask and correct quest before the special hero event.
  old=await snap(page);await page.reload();await page.wait_for_selector('#loading',state='hidden');await page.locator('#continue-game').click();await expected(page,3)
  assert 'mask-equipped' in (await snap(page))['events']
  await walk(page,620);await page.keyboard.press('e');await page.wait_for_timeout(500);await page.screenshot(path=str(OUT/'hero-mobile.png'))
  await settle(page);await expected(page,4,'interval')
  check('가면 착용, 저장 복원, 실제 두 대사와 전용 영웅 회상')
  await interact(page,460);await interact(page,820);await expected(page,5,'door-home')
  await interact(page,1060)
  await walk(page,1215);await page.keyboard.press('e');await page.wait_for_timeout(850);await page.screenshot(path=str(OUT/'door-mobile.png'))
  assert (await snap(page))['overlay']=='cutscene'
  # Interrupted cutscene resumes at the safe event boundary, never in a locked overlay.
  await page.reload();await page.wait_for_selector('#loading',state='hidden');await page.locator('#continue-game').click();await expected(page,5)
  await interact(page,1215);await expected(page,6,'changed-home')
  check('상대 시간 간격, 방문 파손 목격 애니메이션, 컷신 중 재실행 복구')
  for x in [590,1215,850]:await interact(page,x)
  await expected(page,7,'father-home')
  for x in [400,570,990,780]:await interact(page,x)
  await interact(page,1120);await expected(page,8,'daeyeon')
  check('이혼과 아버지 단독 동거 기간을 별도 장면으로 유지')
  for x in [350,660,920]:await interact(page,x)
  await page.screenshot(path=str(OUT/'daeyeon-mobile.png'))
  await interact(page,1300);await expected(page,9,'study')
  # All non-core study props and both grandparents.
  for x in [90,540,690,840,980,1100,1400]:await interact(page,x)
  await interact(page,380,0);await expected(page,10)
  assert (await snap(page))['choices']['study-answer']=='5'
  await interact(page,1230);await expected(page,10)
  assert 'story:cane' in (await snap(page))['events']
  await page.screenshot(path=str(OUT/'study-mobile.png'))
  await interact(page,1550);await expected(page,11,'present')
  check('대연동 별도 맵·조부모·공부·정답 경로·회초리 기록과 페이지 종료')
  await walk(page,650);await page.keyboard.press('e');await page.wait_for_timeout(100)
  for _ in range(8):await page.locator('#summary-next').click()
  await settle(page);await expected(page,12,'present-street')
  await interact(page,1090);assert 'chapter-1-complete' in (await snap(page))['events']
  await page.locator('#ending-next').click();await page.locator('#ending-explore').click();await expected(page,11)
  final=await snap(page)
  assert len(final['memories'])==16,final['memories']
  assert len(final['choices'])>=10
  assert len(final['inspected'])>=20
  check('12장면 전체 완료·16개 기억·20개 이상 조사·10회 이상 선택·크레딧')
  await page.locator('#album-button').click();assert await page.locator('.memory-card.found').count()==16
  await page.locator('[data-memory=hero]').click();assert '실제 기억' in await page.locator('.modal').inner_text();await page.locator('.close-modal').click()
  await page.locator('#menu-button').click();await page.locator('#menu-settings').click();await page.locator('#setting-ambience').select_option('rain');await page.locator('#setting-large').click();await page.locator('.close-modal').click()
  await page.reload();await page.wait_for_selector('#loading',state='hidden');await page.locator('#continue-game').click();assert len((await snap(page))['memories'])==16 and (await snap(page))['settings']['largeText']
  check('앨범 분류 재열람·설정·장면·수집·선택 저장과 복원')
  # Story dialogue and controls fit all portrait/landscape sizes.
  await interact(page,990) # inspect optional note, then explicitly open it for layout checks.
  await walk(page,990);await page.keyboard.press('e');await page.wait_for_timeout(100)
  for w,h in [(360,740),(412,915),(915,412),(1440,1000)]:
   await page.set_viewport_size({'width':w,'height':h});await page.wait_for_timeout(200)
   layout=await page.evaluate('''()=>{const f=document.querySelector('.game-frame').getBoundingClientRect(),d=document.querySelector('.play-dock').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,overlap:f.bottom>d.top+1,buttons:[...document.querySelectorAll('.control')].every(b=>{const r=b.getBoundingClientRect();return r.bottom<=innerHeight+1&&r.left>=0&&r.right<=innerWidth&&r.width>=44&&r.height>=44})}}''')
   assert not layout['overflow'] and not layout['overlap'] and layout['buttons'],(w,h,layout)
   await page.screenshot(path=str(OUT/f'layout-{w}x{h}.png'),full_page=True)
  await settle(page);check('모바일 세로·가로와 데스크톱: 대화·조작 영역 경계')
  await page.evaluate('navigator.serviceWorker.ready');await page.wait_for_function('navigator.serviceWorker.controller!==null');await context.set_offline(True)
  await page.reload();await page.wait_for_selector('#loading',state='hidden');await page.locator('#continue-game').click();assert len((await snap(page))['memories'])==16
  check('새 리소스 캐싱 후 네트워크 차단 상태에서 이어하기')
  await context.close()
  # Focused branch checks use save fixtures but interact through real UI.
  for answer in [1,2]:
   c=await browser.new_context(viewport={'width':412,'height':915});q=await c.new_page();q.on('pageerror',lambda e:errors.append(str(e)))
   await q.add_init_script("if(!localStorage.getItem('life-story:save'))localStorage.setItem('life-story:save',JSON.stringify({version:2,storyScene:9,stage:'study',x:380,events:[],memories:[],quests:[],visited:['study'],inspected:[],choices:{},settings:{sound:false}}))")
   await q.goto(BASE);await q.wait_for_selector('#loading',state='hidden');await q.locator('#continue-game').click();await interact(q,380,answer);await expected(q,10);assert (await snap(q))['choices']['study-answer'] in ['4','풀이 대신 기록 읽기'];await c.close()
  check('공부 오답·풀이 건너뛰기 모두 동일하게 다음 장면 진행')
  c=await browser.new_context(viewport={'width':412,'height':915});q=await c.new_page();q.on('pageerror',lambda e:errors.append(str(e)))
  await q.add_init_script("if(!localStorage.getItem('life-story:save'))localStorage.setItem('life-story:save',JSON.stringify({version:1,stage:'school',x:1000,events:['greet-grandma'],memories:['photo','bag'],quests:['greeting'],settings:{ambience:'night'},playtime:180}))")
  await q.goto(BASE);await q.wait_for_selector('#loading',state='hidden');await q.locator('#continue-game').click();await expected(q,0,'present')
  migrated=await snap(q);assert migrated['settings']['ambience']=='night'
  backup=await q.evaluate("JSON.parse(localStorage.getItem('life-story:save:v1-backup'))");assert backup['memories']==['photo','bag']
  await q.locator('#album-button').click();assert '이전 버전 수집 목록 2개' in await q.locator('.modal').inner_text();await q.locator('.close-modal').click()
  await interact(q,650);await expected(q,1)
  check('실제 v1 저장의 원본 백업·설정·이전 수집 목록 보존 및 새 시나리오 진입')
  await c.close()
  c=await browser.new_context(viewport={'width':412,'height':915});q=await c.new_page();q.on('pageerror',lambda e:errors.append(str(e)))
  await start(q)
  for x in [650,170,890,620,820,1215,850,780,1120,1300,380,1230,1550]:await interact(q,x,2)
  await expected(q,11)
  await walk(q,650);await q.keyboard.press('e');await q.wait_for_timeout(100)
  for _ in range(8):await q.locator('#summary-next').click()
  await settle(q);await expected(q,12);await interact(q,1090)
  minimal=await snap(q);assert 'chapter-1-complete' in minimal['events'];assert not any(m in minimal['memories'] for m in ['tv','toy','lamp','swing','pencil'])
  check('선택 탐험·선택 조각 수집 없이 주요 경로 완료')
  assert not errors,errors
  report={'passed':passed,'javascript_exceptions':errors,'automated_seconds':round(time.monotonic()-started),'playtime_is_human_measurement':False,'real_android_device':False,'full_route':{'memories':len(final['memories']),'inspected':len(final['inspected']),'choices':len(final['choices'])}}
  (OUT/'browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2));await browser.close()
if __name__=='__main__':asyncio.run(run())
