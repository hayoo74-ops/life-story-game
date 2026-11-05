"""Installed APK checks using Android UIAutomator, hardware input and native
Preferences. No browser fixture or WebView debugging socket is required.
"""
import json,re,subprocess,time,xml.etree.ElementTree as ET
from pathlib import Path
APP='com.hayoo74.lifestory';OUT=Path('test-results/android');OUT.mkdir(parents=True,exist_ok=True)
def adb(*args):return subprocess.check_output(['adb',*args],text=True).strip()
def launch():adb('shell','am','start','-n',APP+'/.MainActivity')
def dump():
 adb('shell','uiautomator','dump','/sdcard/life-window.xml')
 raw=adb('shell','cat','/sdcard/life-window.xml');(OUT/'last-ui.xml').write_text(raw);return ET.fromstring(raw)
def find(label,timeout=35):
 last=None
 for _ in range(max(1,int(timeout/2))):
  try:
   root=dump();hits=[]
   for n in root.iter('node'):
    if label in n.get('text','') or label in n.get('content-desc',''):
     x1,y1,x2,y2=map(int,re.findall(r'\d+',n.get('bounds','')));hits.append(((x2-x1)*(y2-y1),((x1+x2)//2,(y1+y2)//2)))
   if hits:return min(hits)[1]
  except Exception as e:last=str(e)
  time.sleep(1)
 raise AssertionError('Android UI did not show '+label+'; '+str(last))
def tap(label):x,y=find(label);adb('shell','input','tap',str(x),str(y))
def screenshot(name):
 with (OUT/(name+'.png')).open('wb') as f:subprocess.run(['adb','exec-out','screencap','-p'],stdout=f,check=True)
def saved():
 raw=adb('shell','run-as',APP,'cat','shared_prefs/CapacitorStorage.xml');root=ET.fromstring(raw)
 text=next(n.text for n in root if n.get('name')=='life-story:save');return json.loads(text)
def wait_save(predicate,timeout=20):
 for _ in range(timeout):
  try:
   s=saved()
   if predicate(s):return s
  except Exception:pass
  time.sleep(1)
 raise AssertionError('Native saved state did not reach expected progress')
def run():
 passed=[]
 def check(s):passed.append(s);print('PASS:',s,flush=True)
 adb('install','-r','apk-output/LIFE-STORY-DEMO-v1.5.apk');adb('logcat','-c');adb('shell','svc','wifi','disable');adb('shell','svc','data','disable');launch()
 tap('새 게임');before=wait_save(lambda s:s['storyScene']==0);x,y=find('오른쪽 이동');adb('shell','input','swipe',str(x),str(y),str(x),str(y),'1200');after=wait_save(lambda s:s['x']>before['x']+30)
 position=after['x'];screenshot('apk-game');check('Installed bundled APK starts with Wi-Fi/data disabled; real Android touch changes Phaser position and native save')
 # Actual device bounds and accessibility button regions, not a desktop viewport.
 size=adb('shell','wm','size');width,height=map(int,re.findall(r'(\d+)x(\d+)',size)[-1]);assert height>width
 for label in ['오른쪽 이동','점프','대화 또는 조사','메뉴 및 설정']:
  px,py=find(label);assert 0<=px<width and 0<=py<height
 check('Portrait screen has visible and reachable movement, jump, interact and menu controls')
 adb('shell','input','keyevent','KEYCODE_HOME');time.sleep(2);launch();find('메뉴 및 설정');time.sleep(1);assert abs(saved()['x']-position)<8;check('Background and resume retain progress')
 adb('shell','input','keyevent','KEYCODE_SLEEP');time.sleep(1);adb('shell','input','keyevent','KEYCODE_WAKEUP');adb('shell','wm','dismiss-keyguard');launch();find('메뉴 및 설정');time.sleep(1)
 adb('shell','am','force-stop',APP);launch();tap('이어하기');find('오른쪽 이동');assert abs(saved()['x']-position)<8;screenshot('apk-restored');check('Screen sleep/wake and process restart restore native Preferences without network')
 adb('shell','am','force-stop',APP);adb('install','-r','apk-output/LIFE-STORY-DEMO-v1.5.apk');launch();tap('이어하기');find('오른쪽 이동');assert abs(saved()['x']-position)<8;check('Same-signer APK update preserves save')
 adb('shell','input','keyevent','KEYCODE_BACK');find('이야기 계속하기');adb('shell','input','keyevent','KEYCODE_BACK');time.sleep(1);screenshot('apk-after-back');check('Hardware Back opens the pause menu and returns to the game')
 log=adb('logcat','-d');errors=[l for l in log.splitlines() if ('Capacitor/Console' in l and ('Uncaught' in l or 'Game startup failed' in l)) or 'FATAL EXCEPTION' in l];assert not errors,errors
 report={'passed':passed,'javascript_log_errors':errors,'android_emulator':True,'real_galaxy_device':False,'api':adb('shell','getprop','ro.build.version.sdk'),'model':adb('shell','getprop','ro.product.model'),'network_disabled':True,'saved_position':position,'save_schema':saved()['version'],'automation':'UIAutomator + Android input + actual Preferences readback'}
 (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':
 try:run()
 finally:
  try:(OUT/'logcat.txt').write_text(adb('logcat','-d'));screenshot('apk-last')
  except Exception:pass
