"""Record current-browser frame times; no real-device or 60-FPS guarantee."""
import asyncio,json,os,shutil
from browser_check import BASE,OUT,snap
from playwright.async_api import async_playwright
async def run():
 results=[];errors=[]
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
  for weather in ['day','rain']:
   c=await b.new_context(viewport={'width':412,'height':915},device_scale_factor=1);q=await c.new_page();q.on('pageerror',lambda e:errors.append(str(e)))
   raw={'version':4,'chapter':1,'storyScene':2,'stage':'alley','x':250,'events':[],'memories':[],'settings':{'sound':True,'muted':False,'ambience':weather}}
   await q.add_init_script("localStorage.setItem('life-story:save',"+json.dumps(json.dumps(raw))+')')
   await q.goto(BASE);await q.wait_for_selector('#loading',state='hidden');await q.locator('#continue-game').click();await q.wait_for_timeout(1000)
   before=await snap(q)
   await q.keyboard.down('ArrowRight');await q.wait_for_timeout(7000);await q.keyboard.up('ArrowRight');await q.wait_for_timeout(1000);await q.keyboard.down('ArrowLeft');await q.wait_for_timeout(7000);await q.keyboard.up('ArrowLeft');await q.wait_for_timeout(1000)
   after=await snap(q);assert after['performance']['samples']>50;assert after['displayObjects']==before['displayObjects']
   for _ in range(6):
    await q.locator('#pause-button').click();paused=(await snap(q))['audio'];assert paused['activeSources']==0 and paused['ambientLoops']==0;await q.locator('#menu-resume').click();await q.wait_for_timeout(60)
   final=await snap(q);assert final['audio']['activeSources']<=31 and final['audio']['ambientLoops']<=3
   results.append({'weather':weather,'viewport':'412x915','device_scale_factor':1,'frames':after['performance'],'display_objects_before':before['displayObjects'],'display_objects_after':after['displayObjects'],'audio':final['audio']})
   await c.close()
  assert not errors,errors
  report={'browser':b.version,'engine':'Chromium headless, SwiftShader enabled','isolated_run':True,'real_mobile_device':False,'sample':'about 17 seconds free exploration per weather; current browser only','results':results,'javascript_exceptions':errors}
  (OUT/'performance-v1.3.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2));await b.close()
if __name__=='__main__':asyncio.run(run())
