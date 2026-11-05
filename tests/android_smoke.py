"""Real installed APK on Android emulator; CDP drives its bundled WebView.
No browser LocalStorage fixture is substituted for native Preferences.
"""
import asyncio,json,re,subprocess,time,urllib.request
from pathlib import Path
from playwright.async_api import async_playwright
APP='com.hayoo74.lifestory';OUT=Path('test-results/android');OUT.mkdir(parents=True,exist_ok=True)
def adb(*args):return subprocess.check_output(['adb',*args],text=True).strip()
def launch():adb('shell','am','start','-n',APP+'/.MainActivity')
async def attach(p):
 for _ in range(90):
  try:
   sockets=adb('shell','cat','/proc/net/unix');name=re.findall(r'@(webview_devtools_remote[^\s]*)',sockets)[-1];adb('forward','tcp:9222','localabstract:'+name)
   with urllib.request.urlopen('http://127.0.0.1:9222/json/version',timeout=2) as r:json.load(r)
   b=await p.chromium.connect_over_cdp('http://127.0.0.1:9222');page=b.contexts[0].pages[0];await page.wait_for_function('!!window.lifeStory',timeout=25000);await page.wait_for_selector('#loading',state='hidden');return b,page
  except Exception:await asyncio.sleep(1)
 raise RuntimeError('Bundled WebView debugging endpoint did not start')
async def run():
 passed=[];errors=[]
 def check(s):passed.append(s);print('PASS:',s,flush=True)
 adb('install','-r','apk-output/LIFE-STORY-DEMO-v1.5.apk');adb('shell','svc','wifi','disable');adb('shell','svc','data','disable');launch()
 async with async_playwright() as p:
  b,q=await attach(p);q.on('pageerror',lambda e:errors.append(str(e)))
  assert q.url.startswith('https://localhost'),q.url
  await q.locator('#new-game').click();await q.wait_for_timeout(500)
  snapshot=lambda:q.evaluate('lifeStory.getSnapshot()')
  before=(await snapshot())['x'];box=await q.locator('[data-control=right]').bounding_box();x=int(box['x']+box['width']/2);y=int(box['y']+box['height']/2)
  session=await b.contexts[0].new_cdp_session(q)
  await session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':1}]});await q.wait_for_timeout(600);await session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});await q.wait_for_timeout(100)
  assert (await snapshot())['x']>before+40
  assert await q.evaluate('document.documentElement.scrollWidth<=innerWidth')
  await q.screenshot(path=str(OUT/'apk-game.png'));check('Installed APK launches offline from packaged https://localhost assets; touch movement and portrait UI work')
  await q.locator('#menu-button').click();position=(await snapshot())['x'];await q.wait_for_timeout(750)
  adb('shell','input','keyevent','KEYCODE_HOME');await asyncio.sleep(2);launch();await q.wait_for_timeout(1000);assert (await snapshot())['modalOpen'];await q.locator('#menu-resume').click()
  check('App background and return preserve position and menu pause')
  adb('shell','input','keyevent','KEYCODE_SLEEP');await asyncio.sleep(1);adb('shell','input','keyevent','KEYCODE_WAKEUP');adb('shell','wm','dismiss-keyguard');launch();await q.wait_for_timeout(1000)
  if not (await snapshot())['modalOpen']:await q.locator('#menu-button').click()
  await q.wait_for_timeout(400);adb('shell','am','force-stop',APP);await b.close();launch();b,q=await attach(p);await q.locator('#continue-game').click();await q.wait_for_timeout(300)
  s=await q.evaluate('lifeStory.getSnapshot()');assert abs(s['x']-position)<8,(s['x'],position)
  check('Native Preferences restore progress after screen sleep, force-stop and process restart, without network')
  # Reinstall with the same stable DEMO signer is an app update, not an uninstall.
  adb('shell','am','force-stop',APP);await b.close();adb('install','-r','apk-output/LIFE-STORY-DEMO-v1.5.apk');launch();b,q=await attach(p);await q.locator('#continue-game').click();await q.wait_for_timeout(300);assert abs((await q.evaluate('lifeStory.getSnapshot()'))['x']-position)<8
  await q.screenshot(path=str(OUT/'apk-restored.png'));check('Same-signer APK update preserves native save')
  adb('shell','input','keyevent','KEYCODE_BACK');await q.wait_for_timeout(300);assert (await q.evaluate('lifeStory.getSnapshot()'))['modalOpen'];adb('shell','input','keyevent','KEYCODE_BACK');await q.wait_for_timeout(300);assert not (await q.evaluate('lifeStory.getSnapshot()'))['modalOpen'];check('Android hardware Back opens menu then closes it')
  assert not errors,errors;await b.close()
 report={'passed':passed,'javascript_exceptions':errors,'android_emulator':True,'real_galaxy_device':False,'api':adb('shell','getprop','ro.build.version.sdk'),'model':adb('shell','getprop','ro.product.model'),'network_disabled':True}
 (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':
 try:asyncio.run(run())
 finally:
  try:(OUT/'logcat.txt').write_text(adb('logcat','-d','-t','1000'))
  except Exception:pass
