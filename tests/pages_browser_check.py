"""Verify the Pages project path in a local preview or an already deployed site."""
import asyncio,json,os,shutil,time,urllib.request
from urllib.parse import urljoin,urlsplit,unquote
from playwright.async_api import async_playwright
from browser_check import BASE,OUT,snap,start,interact,expected

async def run():
 deadline=time.monotonic()+40
 while True:
  try:
   with urllib.request.urlopen(BASE,timeout=1) as r:assert r.status==200
   break
  except Exception:
   if time.monotonic()>deadline:raise RuntimeError('Preview server did not become ready at '+BASE)
   await asyncio.sleep(.25)
 passed=[];errors=[];bad_responses=[];online=True
 def check(label):passed.append(label);print('PASS:',label,flush=True)
 async with async_playwright() as p:
  executable=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium')
  local_preview=urlsplit(BASE).hostname in {'localhost','127.0.0.1','::1'}
  proxy_options={}
  proxy_url=(os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy') or os.environ.get('HTTP_PROXY')) if not local_preview else None
  if proxy_url:
   configured=urlsplit(proxy_url);host=configured.hostname
   authority=f'[{host}]' if ':' in host else host
   if configured.port:authority+=f':{configured.port}'
   proxy={'server':f'{configured.scheme}://{authority}'}
   if configured.username is not None:proxy['username']=unquote(configured.username)
   if configured.password is not None:proxy['password']=unquote(configured.password)
   proxy_options={'proxy':proxy}
  browser=await p.chromium.launch(**({'executable_path':executable} if executable else {}),**proxy_options,headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
  context=await browser.new_context(**proxy_options,viewport={'width':412,'height':915},is_mobile=True,has_touch=True,device_scale_factor=1)
  page=await context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('response',lambda r:bad_responses.append({'url':r.url,'status':r.status}) if online and r.status>=400 else None)
  await start(page)
  assert await page.locator('canvas').count()==1
  urls=await page.locator('script[src],link[href]').evaluate_all('(items)=>items.map(e=>e.src||e.href)')
  assert urls and all(u.startswith(BASE) for u in urls),urls
  manifest_url=await page.locator('link[rel=manifest]').get_attribute('href')
  response=await context.request.get(urljoin(BASE,manifest_url));assert response.status==200
  manifest=await response.json();scope=urlsplit(BASE).path
  assert manifest['scope']==scope and manifest['start_url']==scope,manifest
  for icon in manifest['icons']:
   image=await context.request.get(urljoin(BASE,icon['src']));assert image.status==200 and image.headers.get('content-type','').startswith('image/'),icon
  await context.request.get(urljoin(BASE,'sw.js'))
  check('프로젝트 하위 경로에서 게임·JS·CSS·아이콘·manifest 로딩')
  cdp=await context.new_cdp_session(page)
  boxes=[await page.locator(f'[data-control={key}]').bounding_box() for key in ['right','jump']]
  points=[{'x':b['x']+b['width']/2,'y':b['y']+b['height']/2,'id':i+1} for i,b in enumerate(boxes)]
  before=await snap(page)
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':points[:1]})
  await page.wait_for_function('(x)=>lifeStory.getSnapshot().x>x+8',arg=before['x'])
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':points})
  await page.wait_for_function('(y)=>lifeStory.getSnapshot().y<y-10',arg=before['y'])
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  await page.wait_for_function('lifeStory.getSnapshot().grounded',timeout=10000);await page.wait_for_timeout(500)
  stopped=await snap(page);await page.wait_for_timeout(250);assert abs((await snap(page))['x']-stopped['x'])<1
  check('412×915 모바일 터치 이동·점프 동시 입력·해제 후 정지')
  await interact(page,650);await expected(page,1,'home')
  await interact(page,790);assert (await snap(page))['dialogueVisits']['mother:1']==1
  await interact(page,170);await expected(page,2,'home');assert 'family' in (await snap(page))['memories']
  check('새 게임·오프닝·NPC 대화·선택지·기억 획득·다음 장면')
  await interact(page,1410);assert (await snap(page))['stage']=='alley'
  await interact(page,70);await expected(page,2,'home')
  check('집과 골목 왕복 이동·동적 장소 리소스 로딩')
  for width,height in [(412,915),(915,412)]:
   await page.set_viewport_size({'width':width,'height':height});await page.wait_for_timeout(180)
   layout=await page.evaluate('''()=>{const frame=document.querySelector('.game-frame').getBoundingClientRect(),dock=document.querySelector('.play-dock').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,overlap:frame.bottom>dock.top+1,controls:[...document.querySelectorAll('.control')].every(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight+1})}}''')
   assert not layout['overflow'] and not layout['overlap'] and layout['controls'],layout
  await page.set_viewport_size({'width':412,'height':915});await page.wait_for_timeout(1600)
  await page.screenshot(path=str(OUT/'pages-mobile.png'),full_page=True)
  check('세로·가로 레이아웃과 터치 영역·조작 UI 겹침 방지')
  await page.evaluate('navigator.serviceWorker.ready')
  # First installation can be active without controlling the already-open page.
  actual_scope=await page.evaluate('(async()=> (await navigator.serviceWorker.ready).scope)()')
  assert actual_scope==BASE,(actual_scope,BASE)
  saved=await snap(page)
  old_save=await page.evaluate("JSON.parse(localStorage.getItem('life-story:save'))")
  assert old_save['version']==4 and old_save['storyScene']==2
  online=False;await context.set_offline(True)
  # An uncached navigation inside the project must fall back to its own index.
  await page.goto(urljoin(BASE,'offline-check'));await page.wait_for_selector('#loading',state='hidden')
  await page.wait_for_function('navigator.serviceWorker.controller!==null')
  await page.locator('#continue-game').click();await page.wait_for_timeout(120)
  restored=await snap(page)
  assert restored['storyScene']==saved['storyScene'] and restored['stage']==saved['stage'] and restored['memories']==saved['memories'] and restored['choices']==saved['choices']
  check('프로젝트 범위 PWA·오프라인 fallback·기존 키의 저장 복원')
  assert not errors,errors
  assert not bad_responses,bad_responses
  report={'tested_url':BASE,'passed':passed,'javascript_exceptions':errors,'failed_http_responses':bad_responses,'base_path':scope,'service_worker_scope':actual_scope,'local_production_preview':local_preview,'publicly_deployed':not local_preview,'real_galaxy_device':False,'save_version':old_save['version']}
  (OUT/'pages-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2));await browser.close()

if __name__=='__main__':asyncio.run(run())
