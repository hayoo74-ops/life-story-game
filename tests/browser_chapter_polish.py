"""Focused actual UI tests for repeat inspection, interior geometry, and the farewell."""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright
from browser_check import BASE,OUT,snap,interact,settle,walk,expected
from pages_browser_check import external_proxy_options
async def run():
 passed=[];errors=[];layouts=[]
 def check(t):passed.append(t);print('PASS:',t,flush=True)
 async with async_playwright() as p:
  proxy_options=external_proxy_options(BASE)
  b=await p.chromium.launch(**proxy_options,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
  async def seed(**values):
   raw={'version':4,'chapter':1,'storyScene':2,'stage':'home','x':900,'events':[],'memories':[],'inspected':[],'quests':[],'choices':{},'dialogueVisits':{},'cutscenesSeen':[],'settings':{'sound':False,'textSpeed':0},**values}
   c=await b.new_context(**proxy_options,viewport={'width':412,'height':915});q=await c.new_page();q.on('pageerror',lambda e:(errors.append(str(e)),print('JSERROR',str(e),flush=True)))
   await q.add_init_script("if(!localStorage.getItem('life-story:save'))localStorage.setItem('life-story:save',"+json.dumps(json.dumps(raw))+')')
   await q.goto(BASE);await q.wait_for_selector('#loading',state='hidden');await q.locator('#continue-game').click();await q.wait_for_timeout(500);return c,q
  c,q=await seed()
  await q.keyboard.press('e');await q.wait_for_function('lifeStory.getSnapshot().dialogue!==null');await q.locator('.dialogue-text').click();await q.wait_for_selector('#memory-close');assert (await snap(q))['overlay']=='memory';await q.locator('#memory-close').click()
  for _ in range(3):
   await q.wait_for_timeout(100);await q.keyboard.press('e');await q.wait_for_function('lifeStory.getSnapshot().dialogue!==null');s=await snap(q);assert s['dialogue']['index']==0 and not s['dialogue']['choices'];await q.locator('.dialogue-text').click();await q.wait_for_timeout(100);assert (await snap(q))['overlay'] is None and not (await snap(q))['dialogue'];assert await q.locator('#memory-close:visible').count()==0
  assert (await snap(q))['memories'].count('tv')==1
  await q.locator('#album-button').click();await q.locator('[data-memory="tv"]').click();assert '텔레비전' in await q.locator('.modal').inner_text();await q.locator('.close-modal').click()
  await q.reload();await q.wait_for_selector('#loading',state='hidden');await q.locator('#continue-game').click();await q.wait_for_timeout(150);await interact(q,900);assert (await snap(q))['memories'].count('tv')==1
  check('TV 첫 조사만 기억 팝업·재조사 한 줄·앨범 재열람·새로고침 후 유지');await c.close()
  cases=[('home',2,900),('interval',4,460),('door-home',5,1000),('changed-home',6,500),('father-home',7,400),('brother-room',2,600),('study',9,700),('present',11,650)]
  def overlap(a,b):return min(a['right'],b['right'])-max(a['left'],b['left'])>1 and min(a['bottom'],b['bottom'])-max(a['top'],b['top'])>1
  for stage,story,x in cases:
   c,q=await seed(stage=stage,storyScene=story,x=x)
   layout=(await snap(q))['layout'];assert layout and layout['stage']==stage
   for w in layout['windows']:assert w['bottom']<=315
   fixtures=layout['objects']+layout['decorations']
   for obj in layout['objects']:
    if obj['mount']=='floor':assert abs(obj['bottom']-layout['floor'])<1,obj
    elif obj['mount']=='attachment':
     parent=next(p for p in layout['objects'] if p['id']==obj['parentId']);assert obj['left']>=parent['left'] and obj['right']<=parent['right'] and obj['top']>=parent['top'] and obj['bottom']<=parent['bottom']
    else:assert obj['bottom']<=315,obj
    assert obj['depth']<layout['playerDepth']
   for i,a in enumerate(fixtures):
    for other in fixtures[i+1:]:
     if a.get('parentId')==other['id'] or other.get('parentId')==a['id']:continue
     assert not overlap(a,other),(stage,a,other)
   layouts.append(layout)
   if stage in ['home','study']:
    await q.set_viewport_size({'width':1440,'height':1000});await q.wait_for_timeout(1400);await q.screenshot(path=str(OUT/f'polish-{stage}.png'))
   await c.close()
  check('실내 8곳의 실제 표시 경계: 창문 벽면·바닥 정렬·가구 비중첩·캐릭터 레이어')
  c,q=await seed(storyScene=6,stage='changed-home',x=850,dialogueVisits={'fatherChanged:6':1},settings={'sound':True,'textSpeed':0})
  await q.keyboard.press('e')
  for _ in range(60):
   s=await snap(q)
   if s['overlay']=='farewell':break
   if s['dialogue']:await q.locator('.dialogue-text').click()
   elif s['overlay']=='memory':await q.locator('#memory-close').click()
   await q.wait_for_timeout(50)
  await q.wait_for_function('lifeStory.getSnapshot().farewell.phase==="quote"')
  assert await q.locator('.farewell-quote').inner_text()=='엄마 나갔다올게 건강하게 잘있어';s=await snap(q);assert s['visualStage']=='farewell' and s['storyScene']==6;assert s['audio']['cinematicAmbience']=='rain' and s['audio']['ambientLoops']>=2
  assert s['camera']['left']<s['x']<s['camera']['right'],'child must share the portrait frame'
  assert all(s['camera']['left']<a['x']<s['camera']['right'] for a in s['actors']),'mother must share the portrait frame'
  assert await q.locator('[data-control]:disabled').count()==4
  assert (await q.evaluate("JSON.parse(localStorage.getItem('life-story:save')).stage"))=='changed-home'
  await q.screenshot(path=str(OUT/'farewell-quote.png'))
  await q.locator('#farewell-next').click();await q.wait_for_function('lifeStory.getSnapshot().farewell.phase==="silence"');assert (await snap(q))['audio']['rainOpenness']==1
  await q.locator('.farewell-pause').click();before=await snap(q);await q.wait_for_timeout(1700);assert (await snap(q))['farewell']['phase']==before['farewell']['phase'];assert (await snap(q))['audio']['ambientLoops']==0
  await q.locator('#menu-resume').click();await q.wait_for_timeout(250);await q.screenshot(path=str(OUT/'farewell-rain.png'))
  await q.wait_for_function('lifeStory.getSnapshot().farewell.phase==="epilogue"',timeout=60000)
  assert await q.locator('.farewell-final').inner_text()=='그 뒤로 다시는 엄마를 만날 수 없었다.'
  assert await q.locator('#cinematic').evaluate('(e)=>getComputedStyle(e).backgroundColor')=='rgb(5, 9, 12)'
  await q.wait_for_function('!lifeStory.getSnapshot().farewell.busy');await q.screenshot(path=str(OUT/'farewell-final.png'))
  for width,height in [(360,740),(412,915),(915,412)]:
   await q.set_viewport_size({'width':width,'height':height});await q.wait_for_timeout(150)
   assert await q.locator('.farewell-final').is_visible()
   assert await q.evaluate('document.documentElement.scrollWidth<=innerWidth')
   button=await q.locator('#farewell-next').bounding_box();assert button['height']>=44 and button['x']>=0 and button['x']+button['width']<=width
  await q.locator('#farewell-next').click();await expected(q,7,'father-home');assert (await snap(q))['audio']['cinematicAmbience'] is None
  assert 'story:mother-farewell' in (await snap(q))['events']
  await q.locator('#album-button').click();await q.locator('[data-memory="family-change"]').click();assert '엄마 나갔다올게 건강하게 잘있어' in await q.locator('.modal').inner_text();await q.locator('.close-modal').click()
  check('이혼 기록→현관 작별→아버지 단둘이: 정확한 대사·비·정지/재개·암전·문구·모바일 UI·앨범');await c.close()
  c,q=await seed(storyScene=6,stage='changed-home',x=850,dialogueVisits={'fatherChanged:6':1},memories=['family-change'],inspected=['family-record'])
  await q.keyboard.press('e');await q.wait_for_function('lifeStory.getSnapshot().dialogue!==null');await q.locator('.dialogue-text').click();await q.wait_for_function('lifeStory.getSnapshot().farewell.phase==="quote"')
  await q.locator('.farewell-pause').click();await q.locator('#menu-title').click();assert (await snap(q))['mode']=='title';assert not (await snap(q))['farewell']['active']
  await q.locator('#continue-game').click();await q.wait_for_timeout(250);await expected(q,6,'changed-home');await interact(q,850);await expected(q,7,'father-home')
  check('이미 조사한 진행 사물도 작별 장면 연결 유지·중단 후 체크포인트 복원');await c.close()
  assert not errors,errors
  report={'tested_url':BASE,'passed':passed,'javascript_exceptions':errors,'layouts':layouts,'fixture_based':True,'real_galaxy_device':False};(OUT/'chapter-polish-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({'passed':passed,'javascript_exceptions':errors},ensure_ascii=False,indent=2));await b.close()
if __name__=='__main__':asyncio.run(run())
