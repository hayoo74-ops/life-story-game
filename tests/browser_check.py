"""Production build를 대상으로 실제 키보드 및 CDP 멀티터치로 플레이합니다.
사용: npm run build && npm run preview (별도 터미널)
      python tests/browser_check.py
요구: pip install playwright / 시스템 Chromium 또는 Playwright Chromium
"""
import asyncio, json, os, shutil
from pathlib import Path
from playwright.async_api import async_playwright

BASE=os.environ.get('GAME_URL','http://localhost:4173/')
OUT=Path('test-results');OUT.mkdir(exist_ok=True)

async def snap(page): return await page.evaluate('lifeStory.getSnapshot()')
async def walk(page,target):
    before=await snap(page)
    if abs(before['x']-target)<10:return
    key='ArrowRight' if before['x']<target else 'ArrowLeft'
    await page.keyboard.down(key)
    try:await page.wait_for_function('(x)=>Math.abs(lifeStory.getSnapshot().x-x)<10',arg=target,timeout=int(abs(before['x']-target)/100*1000+4000))
    except Exception:
        await page.screenshot(path=str(OUT/'failure.png'));print('Movement failure:',await snap(page),flush=True);raise
    finally:await page.keyboard.up(key)
    await page.wait_for_timeout(60)

async def press_e(page):await page.keyboard.press('e');await page.wait_for_timeout(120)
async def talk(page):
    await press_e(page)
    for _ in range(15):
        s=await snap(page)
        if not s['dialogue']:return
        if s['dialogue']['choices']:await page.locator('.choice-button').first.click()
        else:await page.locator('#dialogue').click()
        await page.wait_for_timeout(80)
    raise AssertionError('대화가 끝나지 않습니다')

async def memory(page,target,expected):
    await walk(page,target);await press_e(page)
    assert (await snap(page))['overlay']=='memory'
    assert expected in (await snap(page))['memories']
    await page.locator('#memory-close').click()

async def transition(page,target,stage):
    await walk(page,target);await press_e(page)
    assert (await snap(page))['stage']==stage

async def new_game(page):
    await page.goto(BASE);await page.wait_for_selector('#loading',state='hidden')
    await page.locator('#new-game').click()
    for _ in range(3):await page.locator('#opening-next').click()
    await page.wait_for_timeout(500)
    assert (await snap(page))['stage']=='home'

async def main():
    class Checks(list):
        def append(self,value):super().append(value);print('PASS:',value,flush=True)
    results=Checks();errors=[]
    async with async_playwright() as p:
        executable=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium')
        browser=await p.chromium.launch(**({'executable_path':executable} if executable else {}),headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
        context=await browser.new_context(viewport={'width':412,'height':915},is_mobile=True,has_touch=True,device_scale_factor=1)
        page=await context.new_page();page.on('pageerror',lambda err:errors.append(str(err)))
        await new_game(page)
        await memory(page,190,'photo')
        await walk(page,490);await talk(page)
        assert 'greet-grandma' in (await snap(page))['events']
        results.append('NPC 대화와 선택지 완료')

        # Two real touch points: hold right, then press jump while continuing to hold.
        session=await context.new_cdp_session(page)
        rb=await page.locator('[data-control=right]').bounding_box();jb=await page.locator('[data-control=jump]').bounding_box()
        right={'x':rb['x']+rb['width']/2,'y':rb['y']+rb['height']/2,'id':1}
        jump={'x':jb['x']+jb['width']/2,'y':jb['y']+jb['height']/2,'id':2}
        before=await snap(page)
        await session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[right]})
        await page.wait_for_timeout(220)
        await session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[right,jump]})
        await page.wait_for_timeout(200);during=await snap(page)
        assert during['x']>before['x']+20 and during['y']<before['y']-20,(before,during)
        await session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        await page.wait_for_timeout(1000);stopped=await snap(page);await page.wait_for_timeout(220)
        assert abs((await snap(page))['x']-stopped['x'])<1
        assert abs(stopped['y']-460)<5
        results.append('실제 멀티터치 이동 + 점프, release 후 정지 및 착지')

        # Pause must preserve position and resume.
        await page.locator('#pause-button').click();paused=await snap(page)
        await page.keyboard.down('ArrowRight');await page.wait_for_timeout(250);await page.keyboard.up('ArrowRight')
        assert abs((await snap(page))['x']-paused['x'])<1
        await page.locator('#menu-resume').click()
        results.append('일시정지 및 재개')

        for x,mid in [(700,'tv'),(865,'toy'),(1050,'desk')]:await memory(page,x,mid)
        await transition(page,1250,'alley');await walk(page,520);await talk(page)
        await memory(page,960,'lamp')
        await page.screenshot(path=str(OUT/'alley-mobile.png'))
        await transition(page,1750,'playground');await walk(page,440);await talk(page);await memory(page,780,'swing')
        await transition(page,1370,'store');await walk(page,500);await talk(page);await memory(page,845,'pencil')
        await transition(page,1190,'school');await walk(page,540);await talk(page);await memory(page,900,'bag')
        assert len((await snap(page))['memories'])==8
        await walk(page,1350);await press_e(page)
        assert 'chapter-1-complete' in (await snap(page))['events']
        await page.locator('#ending-next').click();await page.locator('#ending-explore').click()
        results.append('5개 장소 전체 탐험, NPC 전원 대화, 8개 기억, 챕터 완료와 크레딧')

        await page.locator('#album-button').click();assert await page.locator('.memory-card.found').count()==8
        await page.locator('[data-memory=photo]').click();assert await page.locator('#modal-title').inner_text()=='오래된 가족사진'
        await page.locator('.close-modal').click()
        before=await snap(page)
        await page.reload();await page.wait_for_selector('#loading',state='hidden');await page.locator('#continue-game').click()
        after=await snap(page)
        assert after['stage']==before['stage'] and abs(after['x']-before['x'])<20 and len(after['memories'])==8
        results.append('앨범 재열람 및 새로고침 후 위치·진행·기억 복원')

        await page.locator('#menu-button').click();await page.locator('#menu-settings').click()
        await page.locator('#setting-ambience').select_option('rain');await page.locator('#setting-large').click()
        await page.locator('.close-modal').click();await page.reload();await page.wait_for_selector('#loading',state='hidden');await page.locator('#continue-game').click()
        assert (await snap(page))['settings']['ambience']=='rain' and (await snap(page))['settings']['largeText']
        results.append('설정 변경 및 복원')

        for w,h in [(360,740),(412,915),(915,412),(1440,1000)]:
            await page.set_viewport_size({'width':w,'height':h});await page.wait_for_timeout(350)
            layout=await page.evaluate('''()=>{const f=document.querySelector('.game-frame').getBoundingClientRect();const d=document.querySelector('.play-dock').getBoundingClientRect();return {overlap:f.bottom>d.top+1,overflow:document.documentElement.scrollWidth>innerWidth,buttons:[...document.querySelectorAll('.control')].map(b=>{const r=b.getBoundingClientRect();return {left:r.left,right:r.right,bottom:r.bottom,top:r.top,width:r.width,height:r.height}})}}''')
            assert not layout['overlap'] and not layout['overflow'],layout
            assert all(b['left']>=0 and b['right']<=w+1 and b['bottom']<=h+1 and b['width']>=44 and b['height']>=44 for b in layout['buttons']),(w,h,layout)
            await page.screenshot(path=str(OUT/f'layout-{w}x{h}.png'))
        results.append('360×740 · S24 크기 412×915 · 가로 · 데스크톱 레이아웃')

        await page.evaluate('navigator.serviceWorker.ready.then(()=>true)')
        await page.wait_for_function('navigator.serviceWorker.controller!==null')
        await context.set_offline(True);await page.reload();await page.wait_for_selector('#loading',state='hidden');await page.locator('#continue-game').click()
        assert (await snap(page))['stage']=='school' and len((await snap(page))['memories'])==8
        results.append('네트워크 차단 후 캐시에서 전체 게임 재실행')
        await context.set_offline(False)
        await context.close()
        # A separate fresh profile proves main story does not require collecting fragments.
        second=await browser.new_context(viewport={'width':412,'height':915});minimal=await second.new_page();await minimal.bring_to_front();minimal.on('pageerror',lambda e:errors.append(str(e)))
        await new_game(minimal);await walk(minimal,490);await talk(minimal)
        for x,stage in [(1250,'alley'),(1750,'playground'),(1370,'store'),(1190,'school')]:await transition(minimal,x,stage)
        await walk(minimal,1350);await press_e(minimal)
        assert (await snap(minimal))['memories']==[] and 'chapter-1-complete' in (await snap(minimal))['events']
        results.append('기억 0개 상태에서도 메인 스토리 완료')
        assert not errors,errors
        report={'passed':results,'runtime_errors':errors,'browser':'시스템 Chromium / Playwright','real_android_device':False}
        (OUT/'browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
        print(json.dumps(report,ensure_ascii=False,indent=2))
        await browser.close()

asyncio.run(main())
