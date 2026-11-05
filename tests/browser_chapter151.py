"""v1.5.1 patch regression: real stage changes, device Date, seat art, N64 and touch.
The date mock changes Date only; animation/input timers keep running normally.
"""
import asyncio,json,os,shutil
from datetime import datetime,timezone
from pathlib import Path
from playwright.async_api import async_playwright
from browser_check import BASE,OUT,snap,walk,settle,interact
from pages_browser_check import external_proxy_options
OUT=OUT/'v1.5.1';OUT.mkdir(parents=True,exist_ok=True)
async def run():
 passed=[];errors=[];clocks=[]
 def check(t):passed.append(t);print('PASS:',t,flush=True)
 async with async_playwright() as p:
  opts=external_proxy_options(BASE);b=await p.chromium.launch(**opts,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
  async def seed(stage='home',story=2,x=1190,tz='Asia/Seoul',**extra):
   c=await b.new_context(**opts,viewport={'width':412,'height':915},is_mobile=True,has_touch=True,timezone_id=tz);q=await c.new_page();q.on('pageerror',lambda e:errors.append(str(e)))
   await q.clock.set_fixed_time(datetime(2026,11,5,1,23,45,tzinfo=timezone.utc))
   await q.add_init_script("window.__vibrations=[];navigator.vibrate=(x)=>{__vibrations.push(x);return true}")
   raw={'version':4,'chapter':1,'storyScene':story,'stage':stage,'x':x,'settings':{'sound':False,'textSpeed':0},'events':[],'memories':[],'inspected':[],'quests':[],'choices':{},'dialogueVisits':{},**extra}
   await q.add_init_script("if(!localStorage.getItem('life-story:save'))localStorage.setItem('life-story:save',"+json.dumps(json.dumps(raw))+')');await q.goto(BASE);await q.wait_for_selector('#loading',state='hidden');await q.locator('#continue-game').click();await q.wait_for_timeout(500);return c,q
  c,q=await seed();s=await snap(q);assert s['clock']['reading']['label']=='10:23';assert s['clock']['labelCount']==1 and s['clock']['labels'][0]['text']=='10:23';clocks.append(s['clock'])
  await q.screenshot(path=str(OUT/'clock-before.png'))
  for _ in range(3):
   await interact(q,1510);assert (await snap(q))['stage']=='alley';assert (await snap(q))['clock']['labelCount']==0 and (await snap(q))['clock']['faces']==[]
   await interact(q,70);assert (await snap(q))['stage']=='home';clock=(await snap(q))['clock'];assert clock['labelCount']==1 and clock['labels'][0]['text']=='10:23';assert clock['faces'][0]['x']==1190;clocks.append(clock)
  await walk(q,1190);await q.wait_for_timeout(500);await q.screenshot(path=str(OUT/'clock-return.png'))
  await q.locator('#pause-button').click();await q.clock.set_fixed_time(datetime(2026,11,5,13,49,5,tzinfo=timezone.utc));await q.locator('#menu-resume').click();assert (await snap(q))['clock']['reading']['label']=='22:49'
  # Same event used by a hidden tab; the native app separately receives App state.
  await q.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))")
  await q.clock.set_fixed_time(datetime(2026,11,5,15,1,0,tzinfo=timezone.utc));await q.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))")
  if (await snap(q))['modalOpen']:await q.locator('#menu-resume').click()
  assert (await snap(q))['clock']['reading']['label']=='00:01';await c.close()
  c,q=await seed(tz='America/New_York');assert (await snap(q))['clock']['reading']['label']=='20:23';await c.close()
  c,q=await seed('study',9,1400);assert (await snap(q))['clock']['reading']['label']=='10:23';assert (await snap(q))['clock']['faces'][0]['id']=='clock';await q.screenshot(path=str(OUT/'study-clock.png'));await c.close()
  check('집↔시계 없는 골목 3회 왕복: 중복/잔상 없음; 한국·뉴욕 로컬 시각, 분/시/자정, 일시정지·숨김 복귀, 공부방 시계 동기화')
  c,q=await seed(x=730);s=await snap(q);mother=next(a for a in s['actors'] if a['id']=='mother');assert mother['x']==730 and mother['pose']=='seated' and mother['texture']=='char-mother-seated'
  await walk(q,500);await q.wait_for_timeout(700);await q.screenshot(path=str(OUT/'sofa-mobile.png'));await q.set_viewport_size({'width':1440,'height':1000});await q.wait_for_timeout(500);await q.screenshot(path=str(OUT/'home-console-wide.png'))
  await walk(q,730);await q.keyboard.press('e');await settle(q);await walk(q,620);await q.keyboard.press('e');await q.wait_for_function('lifeStory.getSnapshot().dialogue!==null');await settle(q,1);assert (await snap(q))['choices']['father-tv']=='뭐 하나 보여 줄래요';await q.keyboard.press('e');await q.wait_for_function('lifeStory.getSnapshot().dialogue!==null');assert '준비됐나' in (await snap(q))['dialogue']['text'];await settle(q)
  check('엄마 전용 착석 프레임/좌표, 부모 반말 대화와 기존 선택 값에 따른 후속 반응')
  await walk(q,864);await q.keyboard.press('e');await q.wait_for_function('lifeStory.getSnapshot().dialogue!==null');await q.locator('.dialogue-text').click();await q.wait_for_selector('#memory-close');assert '슈퍼마리오64' in await q.locator('#cinematic').inner_text();await q.screenshot(path=str(OUT/'console-memory.png'));await q.locator('#memory-close').click()
  for _ in range(2):
   await q.wait_for_function('lifeStory.getSnapshot().nearest==="console64"');await q.keyboard.press('e');await q.wait_for_function('lifeStory.getSnapshot().dialogue!==null');await q.locator('.dialogue-text').click();await q.wait_for_timeout(80);assert (await snap(q))['overlay'] is None
  await q.locator('#album-button').click();await q.locator('[data-memory="console64"]').click();assert '부모님과 함께했던 첫 콘솔게임기' in await q.locator('.modal').inner_text();await q.locator('.close-modal').click();await q.reload();await q.wait_for_selector('#loading',state='hidden');await q.locator('#continue-game').click();assert (await snap(q))['memories'].count('console64')==1
  check('닌텐도64 첫 조사 기억·재조사 한 줄·앨범 재열람·저장 재시작 유지');await c.close()
  c,q=await seed(x=250);button=q.locator('[data-control=right]');box=await button.bounding_box();before=(await snap(q))['x']
  session=await c.new_cdp_session(q);point={'x':box['x']+box['width']/2,'y':box['y']+box['height']/2,'id':1}
  await session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[point]});await q.wait_for_timeout(2200);await session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});await q.wait_for_timeout(250)
  after=(await snap(q))['x'];assert after>before+80;await q.wait_for_timeout(200);assert abs((await snap(q))['x']-after)<3
  assert await button.evaluate('(e)=>{const s=getComputedStyle(e);return s.userSelect==="none"&&s.touchAction==="none"}')
  assert not await button.evaluate('(e)=>e.dispatchEvent(new MouseEvent("contextmenu",{bubbles:true,cancelable:true}))')
  assert await q.evaluate('__vibrations.length')==0 and await q.evaluate('getSelection().toString()')=='';await c.close();check('모바일 Chromium 터치 에뮬레이션: 2.2초 롱프레스 이동 유지/해제 정지, 선택·contextmenu 취소, JS 진동 호출 없음')
  for stage,story in [('alley',2),('daeyeon',8)]:
   c,q=await seed(stage,story,760);await q.set_viewport_size({'width':1440,'height':1000});await q.wait_for_timeout(400);layout=(await snap(q))['layout'];assert all(b['sign'] is None for b in layout['buildings']);await q.screenshot(path=str(OUT/(stage+'-district.png')));await c.close()
  check('학장동 기와 주택/생활 골목과 대연동 평지붕 중층 주거·포장도로 실제 렌더, 임의 상호 없음')
  assert not errors,errors;await b.close()
 (OUT/'report.json').write_text(json.dumps({'tested_url':BASE,'passed':passed,'javascript_exceptions':errors,'clock_checks':clocks,'fixture_based':True,'physical_haptic_actuator_tested':False,'real_galaxy_device':False},ensure_ascii=False,indent=2))
if __name__=='__main__':asyncio.run(run())
