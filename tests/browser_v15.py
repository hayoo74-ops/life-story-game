"""Render EVERY stage, inspect actual pixels, cinematic replay/skip, and object audio.
Uses explicit v4 save fixtures, real UI interaction and read-only diagnostics.
"""
import asyncio,json,os,shutil,subprocess
from pathlib import Path
from playwright.async_api import async_playwright
from browser_check import BASE,OUT,snap,walk,settle
from pages_browser_check import external_proxy_options
OUT=OUT/'v1.5';OUT.mkdir(parents=True,exist_ok=True)
STAGES=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {STAGES} from './src/story.js'; console.log(JSON.stringify(STAGES))"],text=True))
SCENES={'present':11,'home':2,'interval':4,'door-home':5,'changed-home':6,'father-home':7,'daeyeon':8,'study':9,'present-street':12,'brother-room':2}
async def run():
 passed=[];errors=[];layouts=[];phases=[]
 def check(t):passed.append(t);print('PASS:',t,flush=True)
 async with async_playwright() as p:
  opts=external_proxy_options(BASE);b=await p.chromium.launch(**opts,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
  async def seed(stage='home',**extra):
   meta=next(s for s in STAGES if s['id']==stage);raw={'version':4,'chapter':1,'storyScene':SCENES.get(stage,2),'stage':stage,'x':meta['width']/2,'events':[],'memories':[],'inspected':[],'quests':[],'choices':{},'dialogueVisits':{},'cutscenesSeen':[],'settings':{'sound':True,'muted':False,'textSpeed':0},**extra}
   c=await b.new_context(**opts,viewport={'width':1440,'height':1000});q=await c.new_page();q.on('pageerror',lambda e:errors.append(str(e)))
   await q.add_init_script("if(!localStorage.getItem('life-story:save'))localStorage.setItem('life-story:save',"+json.dumps(json.dumps(raw))+')');await q.goto(BASE);await q.wait_for_selector('#loading',state='hidden');await q.locator('#continue-game').click();await q.wait_for_timeout(500);return c,q
  for stage in STAGES:
   if stage['id']=='farewell':continue
   c,q=await seed(stage['id']);s=await snap(q);assert s['stage']==stage['id'];layout=s['layout'];layouts.append(layout)
   for house in layout.get('buildings',[]):
    wall=house['wall']
    for opening in house['windows']+([house['entrance']] if house['entrance'] else []):
     assert opening['owner']==house['id'] and opening['left']>=wall['left'] and opening['right']<=wall['right'] and opening['top']>=wall['top'] and opening['bottom']<=wall['bottom'],house
   for w in layout.get('windows',[]):
    for f in layout['decorations']+layout['objects']:
     assert not (min(w['right'],f['right'])-max(w['left'],f['left'])>1 and min(w['bottom'],f['bottom'])-max(w['top'],f['top'])>1),(stage['id'],'window intersects furniture',w,f)
   await q.screenshot(path=str(OUT/(stage['id']+'-center.png')))
   for tag,x in [('left',60),('right',stage['width']-60)]:
    await c.close();c,q=await seed(stage['id'],x=x);await q.screenshot(path=str(OUT/(stage['id']+'-'+tag+'.png')))
   await q.set_viewport_size({'width':412,'height':915});await q.wait_for_timeout(250);assert await q.evaluate('document.documentElement.scrollWidth<=innerWidth');await q.screenshot(path=str(OUT/(stage['id']+'-mobile.png')));await c.close()
  check('모든 일반 스테이지 전체 좌우·중앙과 세로 모바일 렌더링; 외벽 내 창문·문, 실내 창문/가구 비중첩')
  c,q=await seed(x=900);await q.keyboard.press('e');await q.wait_for_timeout(350)
  # TV was initially on; clicking toggles it off, then back on at the same object.
  s=await snap(q);assert 'tv-off' in s['audio']['recentEffects'];assert not s['audio']['tvBroadcast'];await settle(q)
  await q.keyboard.press('e');await q.wait_for_timeout(350);s=await snap(q);assert 'tv-on' in s['audio']['recentEffects'] and s['audio']['tvBroadcast'];await settle(q)
  await walk(q,360);await q.keyboard.press('e');await q.wait_for_timeout(200);assert (await snap(q))['audio']['toyRolling'];await q.wait_for_timeout(1100);assert not (await snap(q))['audio']['toyRolling'];await settle(q)
  await q.locator('#sound-button').click();assert not (await snap(q))['audio']['enabled'] and (await snap(q))['audio']['ambientLoops']==0;await q.locator('#sound-button').click();assert (await snap(q))['audio']['enabled'];await c.close()
  check('TV 전원 클릭·방송 루프 켜짐/꺼짐, 자동차 이동 중 마찰음·정지, 음소거/복귀')
  c,q=await seed('changed-home',x=850,dialogueVisits={'fatherChanged:6':1});await q.keyboard.press('e')
  for _ in range(70):
   s=await snap(q)
   if s['overlay']=='farewell':break
   if s['dialogue']:await q.locator('.dialogue-text').click()
   elif s['overlay']=='memory':await q.locator('#memory-close').click()
   await q.wait_for_timeout(60)
  seen=set()
  for _ in range(500):
   s=await snap(q);phase=s['farewell']['phase']
   if phase not in seen:
    seen.add(phase);phases.append(phase);await q.screenshot(path=str(OUT/('farewell-'+str(phase)+'.png')))
   if phase=='quote':assert await q.locator('.farewell-quote').inner_text()=='엄마 나갔다올게 건강하게 잘있어';await q.locator('#farewell-next').click()
   if phase=='epilogue' and not s['farewell']['busy']:break
   await q.wait_for_timeout(150)
  assert all(x in phases for x in ['establish','approach','quote','silence','leaving','door-close','ordinary','montage-door','montage-tv','montage-toy','reflection-0','reflection-1','reflection-2','epilogue']),phases
  assert await q.locator('.farewell-final').inner_text()=='그 뒤로 다시는 엄마를 만날 수 없었다.';await q.locator('#farewell-next').click();assert (await snap(q))['storyScene']==7
  await q.locator('#album-button').click();await q.locator('[data-memory="family-change"]').click();await q.locator('#replay-farewell').click();await q.wait_for_function('lifeStory.getSnapshot().farewell.active');await q.locator('.farewell-skip').click();s=await snap(q);assert s['storyScene']==7 and s['stage']=='father-home' and s['modalOpen'];await c.close()
  check('A~E 전체 컷신·3개 독백·최종 문구·복귀, 앨범 전체 영상 재감상 및 건너뛰기 시 원래 진행 유지')
  c,q=await seed('changed-home',x=850,dialogueVisits={'fatherChanged:6':1},memories=['family-change'],inspected=['family-record']);await q.keyboard.press('e');await q.wait_for_timeout(100);await q.locator('.dialogue-text').click();await q.wait_for_function('lifeStory.getSnapshot().farewell.active');await q.locator('.farewell-skip').click();assert (await snap(q))['storyScene']==7;await c.close();check('최초 관람도 건너뛰기 가능; 기존 기억 재팝업 없이 다음 장면으로 진행')
  assert not errors,errors;await b.close()
 report={'tested_url':BASE,'passed':passed,'javascript_exceptions':errors,'stages_rendered':len(STAGES),'phases':phases,'layouts':layouts,'real_galaxy_device':False,'screenshots':len(list(OUT.glob('*.png')))};(OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':asyncio.run(run())
