"""Focused UI regression checks after a completed full browser_check.py run.
Fixtures set up specific event boundaries; these do not claim a second full playthrough.
"""
import asyncio,json,os,shutil
from playwright.async_api import async_playwright
from browser_check import BASE,OUT,snap,walk,settle,interact,expected
async def run():
 passed=[];errors=[]
 async with async_playwright() as p:
  exe=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium')
  b=await p.chromium.launch(**({'executable_path':exe} if exe else {}),headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
  async def seeded(raw):
   c=await b.new_context(viewport={'width':412,'height':915});q=await c.new_page();q.on('pageerror',lambda e:errors.append(str(e)))
   raw={'version':2,'chapter':1,'events':[],'memories':[],'inspected':[],'quests':[],'choices':{},'settings':{'sound':False},**raw}
   await q.add_init_script("if(!localStorage.getItem('life-story:save'))localStorage.setItem('life-story:save',"+json.dumps(json.dumps(raw))+')')
   await q.goto(BASE);await q.wait_for_selector('#loading',state='hidden');await q.locator('#continue-game').click();await q.wait_for_timeout(150);return c,q
  c,q=await seeded({'storyScene':12,'stage':'present-street','x':250,'events':['chapter-1-complete'],'memories':['hero']})
  await q.screenshot(path=str(OUT/'present-street-mobile.png'))
  await q.locator('#menu-button').click();await q.locator('#menu-timeline').click();await q.locator('[data-revisit="2"]').click();await expected(q,2,'home');assert (await snap(q))['memories']==['hero']
  await interact(q,720);assert 'tv' in (await snap(q))['memories'] and 'hero' in (await snap(q))['memories']
  await q.locator('#chapters-button').click();await q.locator('[data-chapter="2"]').click();assert '기획 단계' in await q.locator('.modal').inner_text();assert '명예학생기자단' in await q.locator('.modal').inner_text();await q.locator('.close-modal').click();await expected(q,2)
  passed.append('완료 후 이전 장면 재방문·기억 보존·미구현 챕터 설계 열람');await c.close()
  c,q=await seeded({'storyScene':9,'stage':'study','x':1230})
  await interact(q,1230);await expected(q,9);assert 'cane' in (await snap(q))['inspected']
  await interact(q,380);await expected(q,10);assert 'story:cane' in (await snap(q))['events']
  await interact(q,1550);await expected(q,11)
  passed.append('회초리를 먼저 조사한 경우 중복 강제 조사 없이 공부 장면 종료');await c.close()
  c,q=await seeded({'storyScene':5,'stage':'door-home','x':1215})
  await q.keyboard.press('e');await q.wait_for_function('lifeStory.getSnapshot().overlay==="cutscene"')
  await q.locator('#pause-button').click();assert (await snap(q))['modalOpen']
  await q.wait_for_timeout(400);assert (await snap(q))['storyScene']==5
  await q.locator('#menu-title').click();await q.wait_for_timeout(800);assert (await snap(q))['mode']=='title'
  await q.locator('#continue-game').click();await q.wait_for_timeout(150);await expected(q,5)
  await interact(q,1215);await expected(q,6)
  passed.append('컷신 메뉴 일시정지·타이틀 취소·안전한 재진입 및 사건 완료');await c.close()
  assert not errors,errors
  report={'passed':passed,'javascript_exceptions':errors,'fixture_based':True}
  (OUT/'browser-regression-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2));await b.close()
if __name__=='__main__':asyncio.run(run())
