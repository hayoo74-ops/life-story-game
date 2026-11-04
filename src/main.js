import './style.css';
import {registerSW} from 'virtual:pwa-register';
import {createGame} from './game.js';
import {CHAPTERS,SCENES,MEMORIES,OPENING,DIALOGUES,OBJECTS,FACTS,KINDS,FAMILY,EVENT_RECORDS,HERO_SEQUENCE,DOOR_SEQUENCE,BROTHER_SEQUENCE,SUMMARY_PAGES,say,narrate,missingTalk,questGoal,sceneById,memoryById,stageById,canPerform} from './story.js';
import {freshSave,loadSave,writeSave,loadSettings,writeSettings} from './save.js';
import {Soundtrack} from './audio.js';
import {npcLines,objectReaction,PHOTO_RECALL,heroPages} from './data/experience.js';
import {FarewellDirector} from './systems/farewell.js';
import {MOTHER_FAREWELL} from './data/farewell.js';
import {memoryPresentation,repeatedInspectionLine} from './systems/memory-policy.js';
import {TextPlayer} from './systems/text-player.js';
import {Minigames} from './systems/minigames.js';
import {recordChoice,recordMini,rememberLine,lineId,albumTraces,unlockedPhoto} from './systems/progress.js';
import {exportSave,parseSaveFile,importSaveText} from './systems/save-files.js';
import {normalizeSettings} from './save.js';
import {catalog} from './systems/catalog.js';
import {CHAPTER_PLANS} from './data/chapter-plans.js';
const $=s=>document.querySelector(s);
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const loaded=loadSave();let state=loaded.state,settings=loaded.state?.settings||loadSettings();
let scene=null,mode='title',modalOpen=false,overlay=null,dialogue=null,nearest=null,toastTimer=null,saveElapsed=0,visualToken=0;
let deferredInstall=null,returnFocus=null,storageWarningShown=false,deferredToast=null;
const sound=new Soundtrack(),textPlayer=new TextPlayer();
const miniRoot=document.createElement('div');miniRoot.id='mini-root';miniRoot.hidden=true;$('.game-frame').append(miniRoot);
let miniDone=null;
const minis=new Minigames({root:miniRoot,scene:()=>scene,state:()=>state,sound,
 onProgress:(id,value)=>{state.minigames[id]={...state.minigames[id],...value,sourceType:'dramatic_reconstruction'};save();},
 onChoice:(id,value)=>{recordChoice(state,id,value);save();},onResult:(id,value)=>{recordMini(state,id,value);save();},
 onDone:()=>{overlay=null;const done=miniDone;miniDone=null;done?.();lockScene();},onPause:()=>openMenu()});
const farewell=new FarewellDirector({root:$('#cinematic'),scene:()=>scene,sound,text:textPlayer,settings:()=>settings,state:()=>state,portraits:()=>bridge.portraits,onPause:()=>openMenu(),onLine:line=>{rememberLine(state,line);save();}});
function runMini(id,done){overlay='minigame';miniDone=done;lockScene();minis.start(id);}

const bridge={get suspended(){return modalOpen||document.hidden;},get state(){return state;},get settings(){return settings;},sound,portraits:{},
 locked:()=>mode!=='playing'||modalOpen||Boolean(overlay)||Boolean(dialogue)||document.hidden,
 onReady:s=>{scene=s;$('#loading').hidden=true;updateSettings();sound.configure(settings);if(loaded.error)toast(loaded.error==='future-version'?'더 새로운 버전의 저장입니다.':'저장을 읽지 못했습니다. 브라우저 저장 설정을 확인해 주세요.');},
 onNearest:data=>{nearest=data;renderHint();},
 onStage:s=>{$('#location-text').textContent=s.name;$('#year-text').textContent=s.year;sound.setMood(s.music);updateQuest();},
 onTick:delta=>{if(state&&mode==='playing'&&!document.hidden&&!modalOpen){state.playtime+=delta/1000;saveElapsed+=delta;if(saveElapsed>2500){saveElapsed=0;save();}}},
 onPosition:x=>{if(state&&mode==='playing')state.x=Math.round(x);},
 interact,advance:()=>{if(modalOpen)return false;if(overlay==='farewell'){farewell.advance();return true;}if(dialogue){if(dialogue.lines[dialogue.index].choices&&!textPlayer.typing)return false;advanceDialogue();return true;}if(overlay==='cutscene'){$('#visual-next')?.click();return true;}return false;},escape:()=>{if(modalOpen)closeModal();else if(mode==='playing')openMenu();}
};
createGame(bridge);
function lockScene(){const locked=bridge.locked();textPlayer.pause(modalOpen||document.hidden);minis.pause(modalOpen||document.hidden);farewell.pause(modalOpen||document.hidden);if(scene?.input.keyboard){if(modalOpen)scene.input.keyboard.disableGlobalCapture();else scene.input.keyboard.enableGlobalCapture();}if(scene){scene.clearControls();scene.time.paused=modalOpen||document.hidden;if(modalOpen||document.hidden)scene.tweens.pauseAll();else scene.tweens.resumeAll();if(locked){scene.physics.pause();scene.anims.pauseAll();}else{scene.physics.resume();scene.anims.resumeAll();}}sound.pause(modalOpen||document.hidden);sound.duck(Boolean(dialogue)||Boolean(overlay));renderHint();if(overlay!=='farewell'&&deferredToast){const message=deferredToast;deferredToast=null;toast(message);}}
function save(){if(!state)return;state.settings={...settings};const ok=writeSave(state);$('#save-status').textContent=ok?'저장됨':'저장 불가';if(!ok&&!storageWarningShown){storageWarningShown=true;toast('자동 저장을 사용할 수 없습니다. 저장 공간과 브라우저 설정을 확인해 주세요.');}$('#continue-game').disabled=false;updateAlbumCount();}
function updateAlbumCount(){$('#album-count').textContent=state?.memories.length||0;}
function toast(message){if(overlay==='farewell'){deferredToast=message;return;}clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>{$('#toast').hidden=true;},3500);}
function updateSettings(){settings=normalizeSettings(settings);document.body.dataset.textSize=settings.textSize;document.body.classList.toggle('setting-contrast',settings.highContrast);document.body.classList.toggle('setting-captions',settings.captionBackground);document.body.classList.toggle('setting-large',settings.largeText);sound.configure(settings);document.body.classList.toggle('setting-reduced',settings.reducedMotion);$('#sound-button').classList.toggle('enabled',settings.sound);$('#sound-button').setAttribute('aria-label',settings.sound?'소리 끄기':'소리 켜기');scene?.updateSettings();scene?.syncObjects();writeSettings(settings);}
function setSound(value){settings.sound=value;settings.muted=!value;sound.unlock();updateSettings();if(state)save();}
function updateQuest(){if(!state)return;const current=sceneById(state.storyScene);$('#quest-label').textContent=state.stage==='brother-room'?'종이 한 장':state.storyScene===0?'프롤로그':`장면 ${String(state.storyScene).padStart(2,'0')}`;$('#quest-text').textContent=questGoal(state,current.goal);$('#route-label').textContent=`${String(state.storyScene).padStart(2,'0')} / 12`;$('.journey-route').querySelectorAll('i').forEach((i,j)=>i.classList.toggle('active',j<=Math.floor(state.storyScene/3)));$('#scene-label').textContent=state.stage==='brother-room'?'막간 · 종이 한 장':`${state.storyScene===0?'PROLOGUE':`SCENE ${String(state.storyScene).padStart(2,'0')}`} · ${current.title}`;$('#scene-label').hidden=mode!=='playing';}
function renderHint(){const h=$('#interaction-hint');if(!nearest||bridge.locked()){h.hidden=true;return;}h.innerHTML=`<b>✦</b> ${escapeHtml(nearest.label)} · ${nearest.type==='portal'?'이동':'대화 / 조사'}`;h.hidden=false;}
function setPlayingUI(){$('#title-screen').hidden=true;$('#pause-button').hidden=false;$('#frame-caption').hidden=true;$('#scene-label').hidden=false;}
function beginNew(){if(!scene)return;sound.unlock();if(state){showModal('새로운 첫 페이지','NEW STORY','<p>현재 진행을 새 게임으로 바꿀까요? 이전 버전의 백업은 보존됩니다.</p><div class="menu-list"><button id="confirm-new">새 게임 시작 →</button><button id="cancel-new">돌아가기 ↩</button></div>');$('#confirm-new').onclick=()=>{closeModal();startNew();};$('#cancel-new').onclick=closeModal;}else startNew();}
function startNew(){cancelExperience();state=freshSave();state.settings={...settings};mode='playing';setPlayingUI();scene.loadStage('present',300);save();lockScene();}
function cancelExperience(){visualToken++;farewell.cancel();$('#pause-button').hidden=mode!=='playing';textPlayer.cancel();minis.cancel();miniDone=null;scene?.endInteraction();if(scene?.visualActive)scene.endVisual();overlay=null;dialogue=null;$('#dialogue').hidden=true;$('#cinematic').hidden=true;}
function enterScene(id){cancelExperience();state.storyScene=id;state.interludeReturn=null;if(id===10&&state.inspected.includes('cane')){mark('story:cane');if(!state.quests.includes('scene:10'))state.quests.push('scene:10');}const current=sceneById(id);state.stage=current.stage;state.x=stageById(current.stage).spawn;if(!state.visited.includes(current.stage))state.visited.push(current.stage);scene.loadStage(state.stage,state.x);updateQuest();save();lockScene();}
function showOpening(index){overlay='opening';lockScene();const p=OPENING[index],root=$('#cinematic');root.className='cinematic';root.hidden=false;root.innerHTML=`<span class="eyebrow">${p.tag}</span><h2>${p.title}</h2><p>${escapeHtml(p.text)}</p><button class="primary-button" id="opening-next">${p.button} →</button>`;$('#opening-next').onclick=()=>{if(index<OPENING.length-1)showOpening(index+1);else{overlay=null;root.hidden=true;mark('opening-complete');enterScene(1);}};}
function continueGame(){if(!scene||!state)return;sound.unlock();mode='playing';setPlayingUI();scene.loadStage(state.stage,state.x);updateQuest();lockScene();if(loaded.backupError)toast('이전 저장을 백업하지 못했습니다. 원본을 덮어쓰지 않습니다.');else if(loaded.migrated)toast('이전 수집 목록은 앨범에 보관했습니다. 새 이야기의 첫 장부터 시작합니다.');}
function goToTitle(){save();cancelExperience();closeModal();mode='title';overlay=null;dialogue=null;$('#dialogue').hidden=true;$('#cinematic').hidden=true;$('#title-screen').hidden=false;$('#pause-button').hidden=true;$('#scene-label').hidden=true;$('#frame-caption').hidden=false;scene.loadStage('alley',1075,true);$('#location-text').textContent='부산, 기억의 두 동네';$('#year-text').textContent='1997 —';lockScene();}
function completeAction(action){if(!canPerform(action,state))return;mark('story:'+action);const current=sceneById(state.storyScene,state.chapter);catalog.complete(state,action);if(!state.quests.includes('scene:'+current.id))state.quests.push('scene:'+current.id);if(action==='cane'){save();updateQuest();return;}if(action==='finish'){finishChapter();return;}enterScene(current.next);}
function mark(flag){if(!state.events.includes(flag))state.events.push(flag);}
function gate(action){
 if(!(canPerform(action,state)||action==='brother-enter'&&state.storyScene===2))return true;
 const who=missingTalk(state);
 if(who){const name=({mother:'엄마',fatherChanged:'아버지',fatherAlone:'아버지',grandma:'할머니',grandpa:'할아버지'})[who];showLines([say('child',`${name}한테 먼저 가 봐야겠다.`)]);return false;}
 if(action==='mask'&&!state.events.includes('brother:paper')){showLines([say('child','저기 접힌 종이가 먼저 눈에 들어오네. 한번 펴 볼까.')]);return false;}
 return true;
}
function interact(){if(!modalOpen&&overlay==='farewell'){farewell.advance();return;}if(!modalOpen&&overlay==='cutscene'){$('#visual-next')?.click();return;}if(dialogue){advanceDialogue();return;}if(bridge.locked()||!nearest)return;const e=nearest;scene.clearControls();sound.effect('tap');
 if(e.type==='portal'){if(state.storyScene>3)return;overlay='transition';lockScene();sound.effect('door-open');const token=++visualToken;scene.cameras.main.fadeOut(settings.reducedMotion?0:180,241,229,199);scene.time.delayedCall(settings.reducedMotion?1:190,()=>{if(token!==visualToken)return;state.stage=e.target;state.x=e.spawn;if(!state.visited.includes(e.target))state.visited.push(e.target);overlay=null;scene.loadStage(e.target,e.spawn);sound.effect('door-close');save();lockScene();});return;}
 if(e.type==='npc'){
  if(e.id==='father'&&canPerform('hero',state)){runHero();return;}
  const key=e.dialogue+':'+state.storyScene;showLines(npcLines(e,state),()=>{state.dialogueVisits[key]=(state.dialogueVisits[key]||0)+1;mark('talk:'+e.id);mark('talk:'+key);updateQuest();save();});return;
 }
 if(e.type==='object'){investigate(e);return;}handleEvent(e.event);
}
async function investigate(e){const o=OBJECTS[e.object];if(!o)return;const action=e.object==='photo'&&state.storyScene===1?'arrival':e.object==='mask'?'mask':e.action;
 if(action&&!gate(action))return;
 if(action==='brother-fold'&&!(state.dialogueVisits['brother:'+state.storyScene]>0)){showLines([say('child','형한테 어떻게 접을지 먼저 물어봐야겠다.')]);return;}
 const repeated=state.inspected.includes(e.id);
 const key=state.stage+':'+e.id,previous=state.objectStates[key]||{};
 let lines=repeated?[repeatedInspectionLine(e.object)]:o.lines;
 if(o.interaction){
  overlay='interaction';lockScene();const token=++visualToken;
  state.objectStates[key]={...previous,...(o.interaction==='television'?{on:previous.on===false}:o.interaction==='drawer'?{opened:!previous.opened}:o.interaction==='rest'?{naps:(previous.naps||0)+1}:{})};
  if(!await scene.performInteraction(o.interaction,{...e,...state.objectStates[key]})||token!==visualToken)return;
  overlay=null;
  lines=objectReaction(o.interaction,state.objectStates[key],previous,lines);
 }
 showLines(lines,()=>{scene.endInteraction();if(!state.inspected.includes(e.id))state.inspected.push(e.id);scene.refreshMemories();save();
  const after=()=>{
   if(action==='brother-enter'){enterBrother();return;}
   if(action==='brother-fold'){if(repeated&&state.events.includes('brother:paper'))return;runVisual('brother',BROTHER_SEQUENCE,()=>runMini('paper',()=>{mark('brother:paper');save();updateQuest();revealMemory('brother');}));return;}
   if(action==='mask'&&canPerform('mask',state)){runVisual('mask',[{...say('child','이렇게 쓰면… 보여요! 이제 아빠한테 가 봐야지.'),action:'wear-mask'}],()=>{mark('mask-equipped');completeAction('mask');});return;}
   if(action==='study'&&canPerform('study',state)){runStudy();return;}
   if(e.object==='photo'&&unlockedPhoto(state)&&!state.unlockedRecalls.includes('family-photo')){
    state.unlockedRecalls.push('family-photo');recordChoice(state,'family-photo','사진 옆에 종이 한 장을 떠올림');save();
    if(!repeated)showLines(PHOTO_RECALL);return;
   }
   if(action==='divorce'&&canPerform(action,state)){runFarewell();return;}
   if(action&&canPerform(action,state))completeAction(action);
  };
  if(o.memory)revealMemory(o.memory,after,{firstInspection:!repeated,silentBrief:true});else after();
 });
}
function enterBrother(){if(![0,2,11].includes(state.storyScene))return;state.interludeReturn={stage:state.stage,x:state.x};state.stage='brother-room';state.x=230;if(!state.visited.includes(state.stage))state.visited.push(state.stage);scene.loadStage(state.stage,state.x);save();lockScene();}
function exitBrother(){const target=state.interludeReturn||{stage:sceneById(state.storyScene).stage,x:900};state.stage=target.stage;state.x=target.x;state.interludeReturn=null;scene.loadStage(state.stage,state.x);save();lockScene();}
function handleEvent(action){
 if(action==='brother-exit'){exitBrother();return;}
 if(action==='album'){if(state.storyScene===0)showOpening(0);else if(state.storyScene===11)openSummary();return;}
 if(!gate(action))return;
 if(action==='door'&&canPerform(action,state)){runDoor();return;}
 if(action==='father-period'&&canPerform(action,state)){if(!state.inspected.includes('father-record')){showLines([say('child','달력을 한번 보고 가야겠다.')]);return;}completeAction(action);return;}
 if(action==='daeyeon'&&canPerform(action,state)){showLines([say('child','여기구나. 안으로 들어가 보자.')],()=>revealMemory('daeyeon',()=>completeAction(action)));return;}
 if(action==='study-end'){if(canPerform(action,state))showLines(OBJECTS['study-end'].lines,()=>enterScene(11));else showLines([say('child','책상 옆에 놓인 게 눈에 밟힌다.')]);return;}
 if(action==='finish'&&canPerform(action,state)){showLines([say('adult','이제 다음 장으로 가 보자.')],()=>completeAction(action));return;}
}
function showLines(lines,onComplete=()=>{}){dialogue={lines:structuredClone(lines),index:0,onComplete};lockScene();renderDialogue();}
function renderDialogue(){const l=dialogue.lines[dialogue.index],root=$('#dialogue'),portrait=l.speaker?bridge.portraits[l.character==='adult'&&l.speaker==='재원'&&scene.playerKey!=='adult'?'child':l.character]:null;
 const seen=state.readLineIds.includes(lineId(l));root.hidden=false;root.innerHTML=`<div class="dialogue-top">${portrait?`<img class="portrait" src="${portrait}" alt="">`:''}<span class="speaker">${escapeHtml(l.speaker||'')}</span><div class="dialogue-tools"><button id="dialogue-history" aria-label="이전 대화 기록">기록</button><button id="dialogue-pause" aria-label="대화 일시정지">Ⅱ</button></div></div><p class="dialogue-text" aria-live="off"></p>${l.choices?`<div class="choices" hidden>${l.choices.map((c,i)=>`<button class="choice-button" data-choice="${i}">${escapeHtml(c.label)}</button>`).join('')}</div>`:`<div class="dialogue-bottom"><span>${dialogue.index+1} / ${dialogue.lines.length}</span><button class="next-line">다음 →</button></div>`}${seen?'<button id="seen-line" class="skip-scene">읽은 대사 바로 보기</button>':''}`;
 if(l.action)scene.playBeat(l.action);
 root.onclick=e=>{if(!e.target.closest('button'))advanceDialogue();};$('.next-line')?.addEventListener('click',()=>advanceDialogue());
 $('#dialogue-history').onclick=openHistory;$('#dialogue-pause').onclick=openMenu;$('#seen-line')?.addEventListener('click',()=>textPlayer.reveal());
 root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=e=>{e.stopPropagation();if(textPlayer.typing||modalOpen)return;const c=l.choices[Number(b.dataset.choice)];recordChoice(state,l.choiceId,c.label);save();dialogue.lines.splice(dialogue.index+1,0,...c.lines);advanceDialogue(true);});
 textPlayer.start(l.text,{cps:settings.textSpeed,onText:text=>{const p=root.querySelector('.dialogue-text');if(p)p.textContent=text;},onReady:()=>{rememberLine(state,l);root.querySelector('.choices')?.removeAttribute('hidden');save();},autoDelay:settings.autoAdvance&&!l.choices?settings.autoDelay:null,onAuto:()=>advanceDialogue()});
}
function advanceDialogue(selected=false){if(!dialogue||modalOpen)return;if(textPlayer.reveal())return;if(dialogue.lines[dialogue.index].choices&&!selected)return;textPlayer.cancel();dialogue.index++;if(dialogue.index>=dialogue.lines.length){const done=dialogue.onComplete;dialogue=null;$('#dialogue').hidden=true;done();lockScene();}else renderDialogue();}
function openHistory(){showModal('지나온 대화','DIALOGUE HISTORY',`<div class="dialogue-history">${(state?.dialogueLog||[]).map(l=>`<article><b>${escapeHtml(l.speaker||'그때의 생각')}</b><p>${escapeHtml(l.text)}</p><small>챕터 ${l.chapter} · 장면 ${l.scene}</small></article>`).join('')||'<p>끝까지 읽은 대사가 여기에 남습니다.</p>'}</div>`);$('.dialogue-history')?.lastElementChild?.scrollIntoView({block:'nearest'});}
function revealMemory(id,onClose=()=>{},options={}){const m=memoryById(id);if(!m){onClose();return;}const presentation=memoryPresentation(state,id,options),fresh=!state.memories.includes(id);if(fresh){state.memories.push(id);mark('memory:'+id);save();scene.refreshMemories();if(!['door','cane'].includes(id))sound.effect('memory');}if(presentation==='brief'){if(options.silentBrief)onClose();else showLines([repeatedInspectionLine(id)],onClose);return;}overlay='memory';lockScene();const root=$('#cinematic');root.hidden=false;root.className='cinematic memory-reveal';root.innerHTML=`<span class="eyebrow">${fresh?'기억의 조각':'다시 떠올리며'}</span><span class="memory-icon">${m.symbol}</span><h2>${m.title}</h2><p>${escapeHtml(m.text)}</p><button class="primary-button" id="memory-close">간직하고 계속 →</button><small>${state.memories.length} / ${MEMORIES.length} · ${m.place}</small>`;$('#memory-close').onclick=()=>{root.hidden=true;overlay=null;onClose();lockScene();};}
function runVisual(kind,pages,done){const token=++visualToken,seenKey=kind+':v1.2';overlay='cutscene';lockScene();scene.startVisual(kind);const root=$('#cinematic');root.className='cinematic visual-cutscene '+kind;root.hidden=false;let i=0,finished=false;
 const finish=()=>{if(finished||token!==visualToken)return;finished=true;visualToken++;scene.endVisual();if(!state.cutscenesSeen.includes(seenKey))state.cutscenesSeen.push(seenKey);save();root.hidden=true;overlay=null;done();lockScene();};
 const render=async()=>{if(finished||token!==visualToken)return;const p=pages[i],portrait=p.speaker?bridge.portraits[p.character]:null;
  root.innerHTML=`<span class="cutscene-tag">${({hero:'거실의 작은 영웅',door:'부서진 방문',mask:'종이가면',brother:'종이 한 장'})[kind]}</span><div class="cutscene-card"><div class="dialogue-top">${portrait?`<img class="portrait" src="${portrait}" alt="">`:''}<span class="speaker">${escapeHtml(p.speaker||'')}</span><span class="beat-counter">${i+1} / ${pages.length}</span></div><p>${escapeHtml(p.text)}</p><div class="cutscene-actions"><button class="primary-button" id="visual-next">다음 →</button>${state.cutscenesSeen.includes(seenKey)?'<button class="skip-scene" id="visual-skip">본 장면 건너뛰기</button>':''}</div></div>`;
  $('#visual-next').disabled=true;$('#visual-next').onclick=()=>{i++;if(i<pages.length)render();else finish();};$('#visual-skip')?.addEventListener('click',finish);
  rememberLine(state,p);if(p.action)await scene.playBeat(p.action);
  if(token===visualToken&&!finished&&$('#visual-next'))$('#visual-next').disabled=false;
 };render();
}
function runFarewell(){overlay='farewell';$('#pause-button').hidden=true;clearTimeout(toastTimer);$('#toast').hidden=true;$('#quest-text').textContent='현관 앞에서 엄마의 인사를 들어보세요.';save();lockScene();farewell.start(()=>{mark('story:mother-farewell');if(!state.cutscenesSeen.includes(MOTHER_FAREWELL.seenKey))state.cutscenesSeen.push(MOTHER_FAREWELL.seenKey);save();overlay=null;completeAction('divorce');lockScene();});}
function runHero(){runMini('hero',()=>runVisual('hero',heroPages(state),()=>revealMemory('hero',()=>completeAction('hero'))));}
function runDoor(){sound.setMood('quiet');runVisual('door',DOOR_SEQUENCE,()=>revealMemory('door',()=>completeAction('door')));}
function runStudy(){showLines([say('grandpa','자, 여기부터 같이 세어 보자.')],()=>runMini('study',()=>showLines([say('grandma','다 적었으면 끝까지 다시 읽어라.'),say('child','네. 제가 센 것부터 볼게요.')],()=>revealMemory('workbook',()=>completeAction('study')))));}
function openSummary(){let i=SUMMARY_PAGES.findIndex((_,j)=>!state.events.includes('summary:'+j));if(i<0)i=0;overlay='summary';lockScene();const root=$('#cinematic');root.className='cinematic';root.hidden=false;const render=()=>{root.innerHTML=`<span class="eyebrow">사진첩 · ${i+1} / ${SUMMARY_PAGES.length}</span><h2>한 장씩, 천천히.</h2><p>${escapeHtml(SUMMARY_PAGES[i].text)+(i===SUMMARY_PAGES.length-1?`<br><br>${albumTraces(state).map(t=>escapeHtml(t.text)).join(' · ')}`:'')}</p><button class="primary-button" id="summary-next">다음 장 →</button>`;$('#summary-next').onclick=()=>{mark('summary:'+i);save();i++;if(i<SUMMARY_PAGES.length)render();else{root.hidden=true;overlay=null;revealMemory('album',()=>completeAction('summary'));}};};render();}
function finishChapter(){mark('chapter-1-complete');state.chapterProgress[state.chapter]??={scenes:[],complete:false};state.chapterProgress[state.chapter].complete=true;save();overlay='ending';lockScene();const root=$('#cinematic');root.hidden=false;root.className='cinematic';root.innerHTML=`<span class="eyebrow">CHAPTER 01 · COMPLETE</span><h2>같은 사진첩 속,<br>서로 다른 날들.</h2><p>거실의 웃음, 부서진 방문.<br>아버지와 지낸 시간, 대연동의 책상.<br><br>책장을 덮었다가, 다시 손을 얹는다.<br>다음 장에는 어떤 풍경이 기다릴까.</p><button class="primary-button" id="ending-next">첫 장을 간직하며 →</button>`;$('#ending-next').onclick=()=>{root.innerHTML='<span class="eyebrow">LIFE STORY</span><h2>다음 페이지에서 만나요.</h2><p>안재원의 기억을 바탕으로<br>이야기·대사·픽셀아트·연출: LIFE STORY<br><br>챕터 2–8은 준비 중입니다.</p><button class="primary-button" id="ending-explore">사진첩으로 돌아가기 ↩</button>';$('#ending-explore').onclick=()=>{root.hidden=true;overlay=null;enterScene(11);};};}

function showModal(title,eyebrow,body){
  returnFocus=document.activeElement;modalOpen=true;lockScene();$('#modal-root').innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"><div class="modal-header"><div><span class="eyebrow">${eyebrow}</span><h2 id="modal-title">${title}</h2></div><button class="close-modal" aria-label="닫기">×</button></div>${body}</section></div>`;
  $('.close-modal').onclick=closeModal;$('.modal-backdrop').onclick=e=>{if(e.target.classList.contains('modal-backdrop'))closeModal();};$('.modal').focus();
}
function closeModal(){modalOpen=false;$('#modal-root').innerHTML='';lockScene();if(returnFocus?.isConnected)returnFocus.focus();}
function openAlbum(){
 showModal('추억 앨범','THE MEMORY ALBUM',`<div class="modal-subtitle"><span>다시 펼쳐 보는 작은 순간들</span><span>${state?.memories.length||0} / ${MEMORIES.length}</span></div><div class="menu-list"><button id="album-family">가족과 이야기의 출처 <span>↗</span></button></div><div class="album-grid">${MEMORIES.map(m=>{const found=state?.memories.includes(m.id);return `<button class="memory-card ${found?'found':'locked'}" data-memory="${m.id}" ${found?'':'disabled'}><span class="memory-symbol">${found?m.symbol:'◇'}</span><h3>${found?m.title:'아직 펼치지 않은 기억'}</h3><p>${m.place}</p></button>`;}).join('')}</div>${state&&albumTraces(state).length?`<h3>이번 사진첩의 흔적</h3><ul class="trace-list">${albumTraces(state).map(t=>`<li>${escapeHtml(t.text)}</li>`).join('')}</ul>`:''}${state?.legacyArchive?`<p class="modal-note">이전 버전 수집 목록 ${state.legacyArchive.memories.length}개 보관: ${state.legacyArchive.memories.map(escapeHtml).join(', ')||'없음'}</p>`:''}`);
 $('#album-family').onclick=openRecords;
 document.querySelectorAll('[data-memory]:not(:disabled)').forEach(b=>{b.onclick=()=>{const m=memoryById(b.dataset.memory);showModal(m.title,'MEMORY',`<p>${escapeHtml(m.text)}</p>${m.id==='family-change'&&state.events.includes('story:mother-farewell')?`<blockquote class="farewell-album">${escapeHtml(MOTHER_FAREWELL.quote.text)}<br><br>${escapeHtml(MOTHER_FAREWELL.ending.text)}</blockquote>`:''}${m.id==='family'&&state.unlockedRecalls.includes('family-photo')?'<p>사진 옆에 떠올린 종이 한 장. 접힌 선과 화면의 빛을 함께 기억했다.</p>':''}<details class="source-details"><summary>출처와 제작 메모</summary><p>${m.kinds.map(k=>KINDS[k]).join(' / ')}</p><p>${escapeHtml(m.sourceNote)}</p>${m.id==='family-change'?`<p>${escapeHtml(MOTHER_FAREWELL.sourceNote)}</p>`:''}<p>대사와 일상 반응은 별도 표시가 없는 한 fictional_dialogue입니다. 핵심 사건·두 직접 대사 외의 장면 배치는 dramatic_reconstruction으로 관리합니다.</p></details><div class="menu-list"><button id="album-back">앨범으로 돌아가기 ↩</button></div>`);$('#album-back').onclick=openAlbum;};});
}
function openRecords(){showModal('가족과 이야기의 출처','STORY NOTES',`<p>실제 기억의 핵심 사건을 유지하며 일상 대사·독백·반응을 창작했습니다. 아래 정보는 플레이 중 대화와 구분하는 제작 메모입니다.</p><div class="family-grid">${FAMILY.map(f=>`<article class="family-profile"><img class="portrait" src="${bridge.portraits[f.character]||''}" alt=""><h3>${f.name} <small>${f.relationship}</small></h3><p>${escapeHtml(f.note)}</p></article>`).join('')}</div><h3>사건의 순서</h3>${Object.values(FACTS).map(t=>`<p>${escapeHtml(t)}</p>`).join('')}<p class="modal-note">real_memory = 제공된 기억 / fictional_dialogue = 창작 일상 대사 / dramatic_reconstruction = 화면·문학적 독백·형제 막간의 재구성. 형의 동거 시기·나이 차이·성격과 두 사건의 참여는 지정하지 않았습니다. 조부모 개별 체벌 행위자도 특정하지 않습니다.</p>`);}
function openTimeline(){const revisit=Boolean(state?.events.includes('chapter-1-complete'));showModal('첫 장의 열두 장면','CHAPTER 01 · STORY RECORD',`<div class="chapter-list">${SCENES.map(c=>`<${revisit?'button':'div'} class="chapter-item ${revisit?'chapter-plan':''}" ${revisit?`data-revisit="${c.id}"`:''}><span>${String(c.id).padStart(2,'0')}</span><div><h3>${c.title}</h3><p>${c.goal}</p></div><small>${revisit?'재방문 ↗':state?.quests.includes('scene:'+c.id)?'읽음 ✓':state?.storyScene===c.id?'현재':'다음 기록'}</small></${revisit?'button':'div'}>`).join('')}</div><p class="modal-note">확인된 순서와 상대 시간 간격을 따릅니다. ${revisit?'장면을 누르면 수집한 기억을 보존한 채 다시 방문합니다.':'첫 장을 완료하면 이전 장면을 다시 방문할 수 있습니다.'}</p>`);document.querySelectorAll('[data-revisit]').forEach(b=>b.onclick=()=>{const id=Number(b.dataset.revisit);closeModal();enterScene(id);});}
function openChapters(){showModal('여덟 장의 이야기','THE CHAPTERS',`<div class="chapter-list">${CHAPTERS.map(ch=>`<button class="chapter-item chapter-plan" data-chapter="${ch.id}"><span>0${ch.id}</span><div><h3>${ch.title}</h3><p>${ch.year} · ${ch.description}</p></div><small>${ch.id===1?(state?.chapterProgress[1]?.complete||state?.events.includes('chapter-1-complete')?'완료 · 재방문 가능':state?'진행 중':'플레이 가능'):'준비 중'} ↗</small></button>`).join('')}</div><p class="modal-note">각 장을 누르면 이야기 설계를 읽을 수 있습니다. 챕터 2–8은 기획 데이터만 있으며 플레이할 수 없습니다.</p>`);document.querySelectorAll('[data-chapter]').forEach(b=>b.onclick=()=>{const p=CHAPTER_PLANS.find(c=>c.id===Number(b.dataset.chapter));const fields=[['핵심 스토리',p.core],['확인된 기록',p.facts],['장소',p.places],['등장인물',p.characters],['전환점',p.turn],['메인 퀘스트',p.mainQuest],['선택 상호작용',p.side],['감정선의 연출 목표',p.emotion],['예상 분량',p.duration],['그래픽·애니메이션',p.graphics]];showModal(CHAPTERS[p.id-1].title,p.id===1?'플레이 가능':'기획 단계 · 준비 중',fields.map(([k,v])=>`<p><strong>${k}</strong><br>${escapeHtml(Array.isArray(v)?v.join(' · '):v)}</p>`).join(''));});}
function openSettings(){
  showModal('나에게 맞는 속도로','SETTINGS',`<div class="settings-row"><label for="setting-sound">배경음악과 효과음</label><button id="setting-sound" class="toggle ${settings.sound?'on':''}">${settings.sound?'켜짐':'꺼짐'}</button></div><div class="settings-row"><label for="setting-ambience">동네의 분위기</label><select id="setting-ambience"><option value="day">따뜻한 낮</option><option value="dusk">해 질 무렵</option><option value="night">고요한 밤</option><option value="cycle">낮과 밤의 흐름</option><option value="rain">비 오는 날</option></select></div><div class="settings-row"><label for="setting-large">대화 글자 크게</label><button id="setting-large" class="toggle ${settings.largeText?'on':''}">${settings.largeText?'켜짐':'꺼짐'}</button></div><div class="settings-row"><label for="setting-motion">화면 움직임 줄이기</label><button id="setting-motion" class="toggle ${settings.reducedMotion?'on':''}">${settings.reducedMotion?'켜짐':'꺼짐'}</button></div><div class="menu-list" style="margin-top:20px"><button id="install-game">홈 화면에 추가하기 <span>↗</span></button><button id="how-to">조작 방법과 작품 안내 <span>→</span></button></div><p class="modal-note">진행 상황은 이 기기의 브라우저에 자동 저장됩니다. 브라우저 데이터 삭제 또는 시크릿 모드에서는 저장이 유지되지 않을 수 있습니다. 최초 리소스 캐싱이 완료되면 오프라인으로 플레이할 수 있습니다.</p>`);
  const extra=document.createElement('div');extra.className='expanded-settings';extra.innerHTML=`
  ${[['masterVolume','전체 음량'],['musicVolume','배경음악 음량'],['sfxVolume','효과음 음량']].map(([key,label])=>`<div class="settings-row"><label for="${key}">${label}</label><input id="${key}" type="range" min="0" max="1" step="0.05" value="${settings[key]}"></div>`).join('')}
  <div class="settings-row"><label for="textSize">대화 글자 크기</label><select id="textSize"><option value="normal">기본</option><option value="large">크게</option><option value="xlarge">아주 크게</option></select></div>
  <div class="settings-row"><label for="textSpeed">대사 출력 속도</label><select id="textSpeed"><option value="15">천천히</option><option value="35">보통</option><option value="70">빠르게</option><option value="0">즉시 표시</option></select></div>
  ${[['autoAdvance','대화 자동 진행'],['highContrast','고대비'],['captionBackground','자막 배경 강화']].map(([key,label])=>`<div class="settings-row"><label for="${key}">${label}</label><input id="${key}" type="checkbox" ${settings[key]?'checked':''}></div>`).join('')}
  <p class="modal-note">자동 진행은 선택지와 장면 연출 앞에서 멈춥니다. 소리는 기본 음소거이며 직접 켤 수 있습니다. 조작키 변경은 이번 버전에서 지원하지 않습니다.</p>`;
  $('.modal-header').after(extra);
  for(const key of ['masterVolume','musicVolume','sfxVolume'])$('#'+key).oninput=e=>{settings[key]=Number(e.target.value);updateSettings();save();};
  for(const key of ['textSize','textSpeed']){$('#'+key).value=settings[key];$('#'+key).onchange=e=>{settings[key]=key==='textSpeed'?Number(e.target.value):e.target.value;updateSettings();save();};}
  for(const key of ['autoAdvance','highContrast','captionBackground'])$('#'+key).onchange=e=>{settings[key]=e.target.checked;updateSettings();save();};
  $('#setting-ambience').value=settings.ambience;
  $('#setting-ambience').onchange=e=>{settings.ambience=e.target.value;updateSettings();save();};
  $('#setting-sound').onclick=()=>{setSound(!settings.sound);openSettings();};
  for(const [id,key]of [['large','largeText'],['motion','reducedMotion']])$('#setting-'+id).onclick=()=>{settings[key]=!settings[key];if(key==='largeText')settings.textSize=settings[key]?'large':'normal';updateSettings();save();openSettings();};
  $('#install-game').onclick=async()=>{if(deferredInstall){await deferredInstall.prompt();deferredInstall=null;}else{showModal('게임을 홈 화면에','PLAY ANYTIME',`<p>안드로이드 Chrome 또는 삼성 인터넷의 브라우저 메뉴에서 ‘홈 화면에 추가’ 또는 ‘앱 설치’를 선택해 주세요.</p><p>HTTPS로 서비스된 게임을 한 번 온라인으로 열고 리소스 캐싱을 마친 뒤에는 오프라인에서도 즐길 수 있습니다.</p><p class="modal-note">설치 메뉴는 브라우저와 개인 접근 제한 환경에 따라 지원 여부가 다릅니다.</p>`);}};
  $('#how-to').onclick=openHelp;
}
function openHelp(){showModal('기억을 따라 걷는 법','HOW TO PLAY','<p>← → 버튼을 누르고 이동하며 ↟ 버튼으로 점프하세요. 사람과 사물 가까이에서 ✦ 버튼을 누르면 대화하거나 살펴봅니다.</p><p>대화창을 누르면 다음 대사로 이어집니다. 선택지는 직접 누르세요. 하단의 목표를 따라 가족과 이야기하고 사물을 조사하면 다음 장면으로 넘어갑니다.</p><p>이미 본 장면에는 건너뛰기 버튼이 나타납니다. 첫 장을 완료한 뒤에는 열두 장면 메뉴에서 이전 장면을 다시 방문할 수 있습니다.</p><p>방향키/A·D 이동, Space/W 점프, E 조사, Enter 대화 진행, Esc 메뉴. 선택지는 Tab·Enter로도 고를 수 있습니다.</p><div class="menu-list"><button id="help-notes">가족과 이야기의 출처 ↗</button></div>');$('#help-notes').onclick=openRecords;}
function openMenu(){
  if(!scene)return;
  showModal(mode==='title'?'이야기를 펼치기 전에':'잠시, 쉬어 가기','LIFE STORY',`<div class="menu-list">${mode==='playing'?'<button id="menu-resume">이야기 계속하기 <span>→</span></button>':''}<button id="menu-files">저장 파일 내보내기 / 가져오기 <span>↗</span></button><button id="menu-history">이전 대화 기록 <span>▤</span></button><button id="menu-performance">실행 상태 <span>↗</span></button><button id="menu-records">가족과 이야기의 출처 <span>↗</span></button><button id="menu-album">추억 앨범 <span>▤</span></button><button id="menu-settings">설정 <span>☷</span></button><button id="menu-timeline">첫 장의 열두 장면 <span>▤</span></button><button id="menu-chapters">여덟 장의 이야기 <span>↗</span></button><button id="menu-help">조작 방법과 작품 안내 <span>?</span></button>${mode!=='title'?'<button id="menu-title">저장하고 타이틀로 <span>↩</span></button>':''}</div><p class="modal-note">${state?`챕터 1 · ${stageById(state.stage).name} · 기억 ${state.memories.length} / ${MEMORIES.length}`:'기억의 첫 페이지가 당신을 기다리고 있습니다.'}</p>`);
  $('#menu-files').onclick=openSaveFiles;$('#menu-history').onclick=openHistory;$('#menu-performance').onclick=openPerformance;$('#menu-resume')?.addEventListener('click',closeModal);$('#menu-timeline').onclick=openTimeline;$('#menu-records').onclick=openRecords;$('#menu-album').onclick=openAlbum;$('#menu-settings').onclick=openSettings;$('#menu-chapters').onclick=openChapters;$('#menu-help').onclick=openHelp;$('#menu-title')?.addEventListener('click',goToTitle);
}

function openSaveFiles(){showModal('이야기 보관함','SAVE FILE',`<p>진행 상태를 JSON 파일로 보관하거나 복구합니다. 복구 직전의 기존 저장은 이 브라우저에 백업됩니다. 진행 중인 대화·놀이를 가져오면 해당 장면의 자유 탐색부터 다시 시작합니다.</p><div class="menu-list"><button id="export-save" ${state?'':'disabled'}>현재 진행 내보내기 ↓</button><label for="import-save">저장 파일 선택 (최대 2MB)</label><input id="import-save" type="file" accept=".json,application/json"></div><p id="file-result" role="status"></p>`);
 $('#export-save').onclick=()=>{save();const blob=new Blob([exportSave(state)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='life-story-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 $('#import-save').onchange=async e=>{const file=e.target.files[0];if(!file)return;const output=$('#file-result');if(file.size>2*1024*1024){output.textContent='파일이 너무 큽니다. 최대 2MB입니다.';return;}let text;try{text=await file.text();}catch{output.textContent='파일을 읽지 못했습니다.';return;}const result=parseSaveFile(text);if(!result.ok){output.textContent=result.error;return;}
 output.innerHTML=`챕터 ${result.state.chapter} · ${escapeHtml(stageById(result.state.stage).name)} · 기억 ${result.state.memories.length}개 · 저장 v${result.fromVersion}<button id="confirm-import" class="primary-button">이 진행으로 복구하기 →</button>`;
 $('#confirm-import').onclick=()=>{const applied=importSaveText(text);if(!applied.ok){output.textContent=applied.error;return;}cancelExperience();$('#dialogue').hidden=true;$('#cinematic').hidden=true;state=applied.state;settings=state.settings;updateSettings();mode='playing';setPlayingUI();closeModal();scene.loadStage(state.stage,state.x);updateQuest();save();lockScene();toast('진행을 복구했습니다.');};
 };
}
function openPerformance(){const m=scene.metrics.report(),a=sound.diagnostics();showModal('이 기기의 실행 상태','PERFORMANCE',`<p>자유 탐색 중 최근 ${m.samples}프레임<br>평균 ${m.fps} FPS · 중앙값 ${m.p50}ms<br>95% ${m.p95}ms · 99% ${m.p99}ms</p><p>오디오 소스 ${a.activeSources}개 · 환경 루프 ${a.ambientLoops}개</p><p class="modal-note">현재 브라우저에서 측정한 값입니다. 일시정지·대화·연출·백그라운드 시간은 제외합니다. 기기와 화면 크기에 따라 다릅니다.</p>`);}

// Pointer capture와 각 버튼별 pointerId 집합으로 동시 입력 및 버튼 밖 release를 처리합니다.
const heldPointers=new Map();
document.querySelectorAll('[data-control]').forEach(button=>{
  const key=button.dataset.control;heldPointers.set(key,new Set());
  button.addEventListener('pointerdown',e=>{e.preventDefault();sound.unlock();if(bridge.locked())return;button.setPointerCapture(e.pointerId);heldPointers.get(key).add(e.pointerId);button.classList.add('pressed');if(key==='interact')interact();else scene?.setControl(key,true);});
  const release=e=>{heldPointers.get(key).delete(e.pointerId);if(!heldPointers.get(key).size){button.classList.remove('pressed');if(key!=='interact')scene?.setControl(key,false);}};
  button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);button.addEventListener('contextmenu',e=>e.preventDefault());
});
function clearInput(){scene?.clearControls();for(const pointers of heldPointers.values())pointers.clear();document.querySelectorAll('.control.pressed').forEach(b=>b.classList.remove('pressed'));}
$('#new-game').onclick=beginNew;$('#continue-game').onclick=continueGame;$('#continue-game').disabled=!state;
$('#album-button').onclick=openAlbum;$('#sound-button').onclick=()=>setSound(!settings.sound);$('#menu-button').onclick=openMenu;$('#pause-button').onclick=openMenu;$('#chapters-button').onclick=openChapters;
$('.brand').onclick=e=>{e.preventDefault();if(mode==='title')return;openMenu();};
window.addEventListener('blur',()=>{clearInput();if(mode==='playing'&&!modalOpen&&!overlay&&!dialogue)openMenu();});
document.addEventListener('visibilitychange',()=>{clearInput();if(document.hidden){save();if(mode==='playing'&&!modalOpen&&!overlay&&!dialogue)openMenu();}lockScene();});
window.addEventListener('pagehide',save);
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;});
document.addEventListener('keydown',e=>{
  if(dialogue&&!modalOpen&&!textPlayer.typing&&/^[1-9]$/.test(e.key)){$(`[data-choice="${Number(e.key)-1}"]`)?.click();e.preventDefault();}
  if(modalOpen&&e.key==='Tab'){const items=[...$('.modal').querySelectorAll('button:not(:disabled),select,input:not(:disabled),a[href],summary')];const first=items[0],last=items.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===$('.modal'))){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
});
updateAlbumCount();
registerSW({onOfflineReady(){toast('오프라인 준비 완료 · 이 기기에서 다시 만나요.');},onNeedRefresh(){toast('새 버전이 준비되었습니다. 진행 상황을 저장하고 게임을 다시 열어 주세요.');},onRegisterError(){toast('오프라인 리소스를 저장하지 못했습니다. 온라인으로는 계속 플레이할 수 있습니다.');}});

// 자동화는 실제 화면·입력·저장으로 검증합니다. 읽기 전용 진단 정보만 노출합니다.
window.lifeStory={getSnapshot:()=>({farewell:farewell.diagnostics(),visualStage:scene?.stage?.id,layout:scene?.layoutSnapshot(),playerFrame:scene?.player?.frame?.name,displayObjects:scene?.children.length,visualObjects:scene?.visualObjects?.filter(o=>o.active).length||0,typing:textPlayer.typing,mini:minis.diagnostics(),performance:scene?.metrics.report(),audio:sound.diagnostics(),objectStates:structuredClone(state?.objectStates||{}),minigames:structuredClone(state?.minigames||{}),memoryTraces:structuredClone(state?.memoryTraces||{}),unlockedRecalls:[...(state?.unlockedRecalls||[])],dialogueLogSize:state?.dialogueLog.length,chapterProgress:structuredClone(state?.chapterProgress||{}),mode,storyScene:state?.storyScene,dialogueVisits:{...state?.dialogueVisits},cutscenesSeen:[...(state?.cutscenesSeen||[])],entities:(scene?.entities||[]).map(e=>({id:e.data.id,character:e.data.character,x:e.data.x,frame:e.sprite.frame?.name})),playerVisible:scene?.player?.visible,inspected:[...(state?.inspected||[])],choices:{...state?.choices},stage:state?.stage,x:scene?.player?.x,y:scene?.player?.y,grounded:scene?.player?.body?.blocked.down,memories:[...(state?.memories||[])],events:[...(state?.events||[])],nearest:nearest?.id,dialogue:dialogue?{speaker:dialogue.lines[dialogue.index]?.speaker,index:dialogue.index,choices:Boolean(dialogue.lines[dialogue.index]?.choices),text:dialogue.lines[dialogue.index]?.text,kind:dialogue.lines[dialogue.index]?.kind}:null,overlay,modalOpen,settings:{...settings}})};
