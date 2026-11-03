import './style.css';
import { registerSW } from 'virtual:pwa-register';
import { createGame } from './game.js';
import { CHAPTERS, STAGES, MEMORIES, OPENING, DIALOGUES, memoryById, stageById } from './story.js';
import { freshSave, loadSave, writeSave, loadSettings, writeSettings } from './save.js';
import { Soundtrack } from './audio.js';

const $=s=>document.querySelector(s);
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const loaded=loadSave();
let state=loaded.state;
let settings={...loadSettings()};
let scene=null,mode='title',modalOpen=false,overlay=null,dialogue=null,nearest=null,toastTimer=null,saveElapsed=0;
let deferredInstall=null,returnFocus=null,storageWarningShown=false;
const sound=new Soundtrack();
const bridge={
  get state(){return state;},get settings(){return settings;},sound,portraits:{},
  locked:()=>mode!=='playing'||modalOpen||Boolean(overlay)||Boolean(dialogue)||document.hidden,
  onReady:s=>{scene=s;$('#loading').hidden=true;updateSettings();if(loaded.error)toast(loaded.error==='future-version'?'더 새로운 버전의 저장 데이터입니다. 이 버전에서는 이어할 수 없습니다.':'저장 데이터를 읽지 못했습니다. 저장소 설정을 확인해 주세요.');},
  onNearest:data=>{nearest=data;renderHint();},
  onStage:s=>{$('#location-text').textContent='부산 · '+s.name;$('#year-text').textContent=s.year;sound.setMood(s.music);updateQuest();},
  onPosition:(x,delta)=>{if(!state||mode!=='playing')return;state.x=Math.round(x);state.playtime+=delta/1000;saveElapsed+=delta;if(saveElapsed>2500){saveElapsed=0;save();}},
  interact,advance:()=>{if(dialogue)advanceDialogue();},escape:()=>{if(modalOpen)closeModal();else if(dialogue)toast('대화창을 눌러 이야기를 이어가 주세요.');else if(!overlay&&mode==='playing')openMenu();}
};
createGame(bridge);

function lockScene(){
  const locked=bridge.locked();if(scene){scene.clearControls();if(locked){scene.physics.pause();scene.anims.pauseAll();}else{scene.physics.resume();scene.anims.resumeAll();}}
  sound.pause(modalOpen||document.hidden);
  renderHint();
}
function save(){
  if(!state)return;state.settings={...settings};const ok=writeSave(state);$('#save-status').textContent=ok?'저장됨':'저장 불가';
  if(!ok&&!storageWarningShown){storageWarningShown=true;toast('자동 저장을 사용할 수 없습니다. 브라우저 저장 공간 또는 설정을 확인해 주세요.');}
  $('#continue-game').disabled=!state;updateAlbumCount();
}
function updateAlbumCount(){$('#album-count').textContent=String(state?.memories.length||0);}
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>{$('#toast').hidden=true;},3800);}
function updateSettings(){
  document.body.classList.toggle('setting-large',settings.largeText);document.body.classList.toggle('setting-reduced',settings.reducedMotion);
  $('#sound-button').classList.toggle('enabled',settings.sound);$('#sound-button').setAttribute('aria-label',settings.sound?'소리 끄기':'소리 켜기');$('#sound-button').title=settings.sound?'소리 끄기':'소리 켜기';
  scene?.updateSettings();writeSettings(settings);
}
function setSound(value){settings.sound=value;sound.setEnabled(value);updateSettings();if(state)save();}

function updateQuest(){
  if(!state)return;const complete=state.events.includes('chapter-1-complete');const greeted=state.events.includes('greet-grandma');
  $('#quest-label').textContent=complete?'첫 장을 간직하며':greeted?'동네 한 바퀴':'따뜻한 인사';
  $('#quest-text').textContent=complete?'언제든 다시 걷고, 남은 추억을 찾아보세요.':!greeted?'할머니께 다가가 인사를 건네세요.':state.stage==='school'?'오른쪽 길의 ‘다음 페이지’를 조사하세요.':'동네를 둘러보며 학교 앞까지 걸어가세요.';
  const index=STAGES.findIndex(s=>s.id===state.stage);$('.journey-route').querySelectorAll('i').forEach((i,j)=>i.classList.toggle('active',j<=index));$('#route-label').textContent=`0${index+1} / 05`;
}
function renderHint(){
  const hint=$('#interaction-hint');if(!nearest||bridge.locked()){hint.hidden=true;return;}
  const collected=nearest.memory&&state?.memories.includes(nearest.memory);
  const action=nearest.type==='npc'?'이야기하기':nearest.type==='portal'?'이동하기':collected?'다시 떠올리기':'살펴보기';
  hint.innerHTML=`<b>✦</b> ${escapeHtml(nearest.label)} <span>· ${action}</span>`;hint.hidden=false;
}
function setPlayingUI(){
  $('#title-screen').hidden=true;$('#pause-button').hidden=false;$('#frame-caption').hidden=true;
  $('#quest-label').textContent='따뜻한 인사';
}
function beginNew(){
  if(!scene)return;sound.unlock();
  if(state){showModal('새로운 첫 페이지','NEW STORY',`<p>지금까지의 진행 상황과 추억 앨범이 새 게임으로 바뀝니다. 처음부터 다시 시작할까요?</p><div class="menu-list"><button id="confirm-new">처음부터 시작 <span>→</span></button><button id="cancel-new">지금 이야기 간직하기 <span>↩</span></button></div>`);$('#confirm-new').onclick=()=>{closeModal();startNew();};$('#cancel-new').onclick=closeModal;}
  else startNew();
}
function startNew(){state=freshSave();state.settings={...settings};save();setPlayingUI();mode='opening';scene.loadStage('alley',980,true);showOpening(0);}
function showOpening(index){
  const page=OPENING[index];overlay='opening';lockScene();const root=$('#cinematic');root.hidden=false;
  root.innerHTML=`<span class="eyebrow">${page.tag}</span><h2>${escapeHtml(page.title)}</h2><p>${escapeHtml(page.text)}</p><button class="primary-button" id="opening-next">${page.button}<span>→</span></button>${page.note?`<small>${escapeHtml(page.note).replaceAll('\n','<br>')}</small>`:''}<div class="cinematic-progress">${OPENING.map((_,i)=>`<i class="${i===index?'active':''}"></i>`).join('')}</div>`;
  $('#opening-next').onclick=()=>{sound.effect('tap');if(index<OPENING.length-1)showOpening(index+1);else{state.events.push('opening-complete');mode='playing';overlay=null;root.hidden=true;scene.loadStage('home',280);state.stage='home';state.x=280;updateQuest();save();lockScene();toast('← → 이동 · ✦ 대화 / 조사 · 집 안을 둘러보세요.');}};
}
function continueGame(){
  if(!scene||!state)return;sound.unlock();setPlayingUI();
  if(!state.events.includes('opening-complete')){mode='opening';showOpening(0);return;}
  mode='playing';scene.loadStage(state.stage,state.x);updateQuest();lockScene();toast('마지막으로 머물던 순간부터 이어집니다.');
}
function goToTitle(){
  save();closeModal();mode='title';overlay=null;dialogue=null;$('#dialogue').hidden=true;$('#cinematic').hidden=true;$('#title-screen').hidden=false;$('#pause-button').hidden=true;$('#frame-caption').hidden=false;$('#interaction-hint').hidden=true;
  $('#location-text').textContent='부산, 그 시절의 골목';$('#year-text').textContent='1997 —';scene.loadStage('alley',1075,true);$('#quest-label').textContent='첫 번째 페이지';$('#quest-text').textContent='모든 이야기는 작은 골목에서 시작된다.';lockScene();
}

function interact(){
  if(dialogue){advanceDialogue();return;}if(bridge.locked()||!nearest)return;
  const entity=nearest;sound.effect('tap');scene.clearControls();
  if(entity.type==='npc')startDialogue(entity);
  else if(entity.type==='memory')revealMemory(entity.memory);
  else if(entity.type==='portal'){
    state.stage=entity.target;state.x=entity.spawn;if(!state.visited.includes(entity.target))state.visited.push(entity.target);
    scene.loadStage(entity.target,entity.spawn);updateQuest();save();
  }else if(entity.event==='finish'){
    if(!state.events.includes('greet-grandma')){showLines([{speaker:'안재원',character:'child',text:'먼저 집에 계신 할머니께 인사드려야겠어. 왼쪽 길을 따라 집으로 돌아가 보자.'}]);return;}
    finishChapter();
  }
}
function startDialogue(entity){
  const lines=DIALOGUES[entity.dialogue]?.(state)||[{speaker:entity.label,text:'반가워요.'}];
  showLines(lines,()=>{const flag='talk-'+entity.id;if(!state.events.includes(flag))state.events.push(flag);if(entity.id==='grandma'&&!state.events.includes('greet-grandma')){state.events.push('greet-grandma');state.quests.push('greeting');toast('새로운 걸음 · 학교 앞까지 동네를 둘러보세요.');}updateQuest();save();});
}
function showLines(lines,onComplete=()=>{}){dialogue={lines:structuredClone(lines),index:0,onComplete};lockScene();renderDialogue();}
function renderDialogue(){
  const line=dialogue.lines[dialogue.index];const root=$('#dialogue');root.hidden=false;
  const portrait=bridge.portraits[line.character||'child'];
  root.innerHTML=`<div class="dialogue-top">${portrait?`<img class="portrait" src="${portrait}" alt="">`:''}<span class="speaker">${escapeHtml(line.speaker)}</span><span class="fiction-tag">기억을 바탕으로 한 창작 대사</span></div><p class="dialogue-text">${escapeHtml(line.text)}</p>${line.choices?`<div class="choices">${line.choices.map((choice,i)=>`<button class="choice-button" data-choice="${i}">${escapeHtml(choice.label)}</button>`).join('')}</div>`:`<div class="dialogue-bottom"><span>터치하여 다음 이야기</span><button class="next-line">${dialogue.index===dialogue.lines.length-1?'대화 마치기':'다음'} →</button></div>`}`;
  root.onclick=e=>{if(e.target.closest('[data-choice]'))return;advanceDialogue();};
  root.querySelectorAll('[data-choice]').forEach(button=>{button.onclick=e=>{e.stopPropagation();const choice=line.choices[Number(button.dataset.choice)];const choiceEvent=`choice:${line.speaker}:${choice.label}`;if(!state.events.includes(choiceEvent))state.events.push(choiceEvent);dialogue.lines.splice(dialogue.index+1,0,...choice.lines);advanceDialogue(true);};});
}
function advanceDialogue(choiceSelected=false){
  if(!dialogue||modalOpen)return;const current=dialogue.lines[dialogue.index];if(current.choices&&!choiceSelected)return;
  sound.effect('tap');dialogue.index++;if(dialogue.index>=dialogue.lines.length){const onComplete=dialogue.onComplete;dialogue=null;$('#dialogue').hidden=true;onComplete();lockScene();}else renderDialogue();
}
function revealMemory(id){
  const memory=memoryById(id);if(!memory)return;const isNew=!state.memories.includes(id);
  if(isNew){state.memories.push(id);state.events.push('memory:'+id);save();scene.refreshMemories();sound.effect('memory');}
  overlay='memory';lockScene();const root=$('#cinematic');root.classList.add('memory-reveal');root.hidden=false;
  root.innerHTML=`<span class="eyebrow">${isNew?'A FRAGMENT OF MEMORY · 기억의 조각':'FROM THE MEMORY ALBUM'}</span><span class="memory-icon">${memory.symbol}</span><h2>${memory.title}</h2><p>${escapeHtml(memory.recollection)}</p><button class="primary-button" id="memory-close">${isNew?'앨범에 간직하기':'다시 걷기'} <span>✦</span></button><small>${state.memories.length} / ${MEMORIES.length} 개의 기억 · 회상 장면은 창작 연출입니다.</small>`;
  $('#memory-close').onclick=()=>{root.hidden=true;root.classList.remove('memory-reveal');overlay=null;lockScene();};
}
function finishChapter(){
  const first=!state.events.includes('chapter-1-complete');if(first){state.events.push('chapter-1-complete');state.quests.push('neighborhood-walk');save();sound.effect('memory');}
  overlay='ending';lockScene();const root=$('#cinematic');root.hidden=false;
  root.innerHTML=`<span class="eyebrow">CHAPTER 01 · COMPLETE</span><h2>작은 골목이,\n나의 세상 전부였던 날.</h2><p>집과 골목, 놀이터와 문구점.\n평범한 풍경 속에 나를 키워 준 마음들이 있었다.\n이 기억은 다음 걸음의 힘이 된다.</p><button class="primary-button" id="ending-next">첫 장을 간직하며 <span>→</span></button><small>기억의 조각 ${state.memories.length} / ${MEMORIES.length} · 챕터 1 완료</small>`;
  $('#ending-next').onclick=()=>{
    root.innerHTML=`<span class="eyebrow">LIFE STORY · 나의 인생</span><h2>첫 번째 이야기를\n이곳에 간직합니다.</h2><p>안재원의 실제 기록을 바탕으로\n픽셀아트 · 시나리오 · 게임 제작: LIFE STORY\n\n후속 챕터 2–8은 준비 중입니다.\n첫 번째 챕터에서 못다 모은 추억을 찾아보세요.</p><button class="primary-button" id="ending-explore">골목으로 돌아가기 <span>↩</span></button><small>인물의 외형, 장소의 배치, 일상 대화는 창작입니다.\n실제 사진을 사용하지 않은 오리지널 픽셀아트입니다.</small>`;
    $('#ending-explore').onclick=()=>{root.hidden=true;overlay=null;updateQuest();lockScene();};
  };
}

function showModal(title,eyebrow,body){
  returnFocus=document.activeElement;modalOpen=true;lockScene();$('#modal-root').innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"><div class="modal-header"><div><span class="eyebrow">${eyebrow}</span><h2 id="modal-title">${title}</h2></div><button class="close-modal" aria-label="닫기">×</button></div>${body}</section></div>`;
  $('.close-modal').onclick=closeModal;$('.modal-backdrop').onclick=e=>{if(e.target.classList.contains('modal-backdrop'))closeModal();};$('.modal').focus();
}
function closeModal(){modalOpen=false;$('#modal-root').innerHTML='';lockScene();if(returnFocus?.isConnected)returnFocus.focus();}
function openAlbum(){
  showModal('추억 앨범','THE MEMORY ALBUM',`<div class="modal-subtitle"><span>작은 순간들을 오래 간직하는 방법</span><span>${state?.memories.length||0} / ${MEMORIES.length}</span></div><div class="album-grid">${MEMORIES.map(memory=>{const found=state?.memories.includes(memory.id);return `<button class="memory-card ${found?'found':'locked'}" data-memory="${memory.id}" ${found?'':'disabled'}><span class="memory-symbol">${found?memory.symbol:'◇'}</span><h3>${found?memory.title:'아직 만나지 못한 기억'}</h3><p>${memory.place}${found?'<br>기억 다시 읽기 ↗':''}</p></button>`;}).join('')}</div><p class="modal-note">기억의 조각은 선택적으로 수집할 수 있습니다. 사진과 사물에 다가가 ✦ 버튼으로 살펴보세요. 회상 내용은 제공된 사실에 상상력을 더한 창작 연출입니다.</p>`);
  document.querySelectorAll('[data-memory]:not(:disabled)').forEach(button=>{button.onclick=()=>{const memory=memoryById(button.dataset.memory);showModal(memory.title,'A FRAGMENT OF MEMORY',`<p>${escapeHtml(memory.text)}</p><p>${escapeHtml(memory.recollection).replaceAll('\n','<br>')}</p><p class="modal-note">${memory.place}에서 발견한 기억 · 창작 회상</p><div class="menu-list"><button id="album-back">앨범으로 돌아가기 <span>↩</span></button></div>`);$('#album-back').onclick=openAlbum;};});
}
function openChapters(){
  showModal('여덟 장의 이야기','THE CHAPTERS',`<div class="chapter-list">${CHAPTERS.map(ch=>`<div class="chapter-item ${ch.status==='playable'?'available':''}"><span>0${ch.id}</span><div><h3>${ch.title}</h3><p>${ch.year} · ${ch.description}</p></div><small>${ch.status==='playable'?(state?.events.includes('chapter-1-complete')?'완료 ✓':'플레이 가능'):'준비 중'}</small></div>`).join('')}</div><p class="modal-note">현재 챕터 1만 플레이할 수 있습니다. 이후의 기록은 각 챕터를 완성한 뒤 차례로 추가됩니다. 챕터는 연대순과 주제별 구성을 함께 따릅니다.</p>`);
}
function openSettings(){
  showModal('나에게 맞는 속도로','SETTINGS',`<div class="settings-row"><label for="setting-sound">배경음악과 효과음</label><button id="setting-sound" class="toggle ${settings.sound?'on':''}">${settings.sound?'켜짐':'꺼짐'}</button></div><div class="settings-row"><label for="setting-ambience">동네의 분위기</label><select id="setting-ambience"><option value="day">따뜻한 낮</option><option value="dusk">해 질 무렵</option><option value="night">고요한 밤</option><option value="cycle">낮과 밤의 흐름</option><option value="rain">비 오는 날</option></select></div><div class="settings-row"><label for="setting-large">대화 글자 크게</label><button id="setting-large" class="toggle ${settings.largeText?'on':''}">${settings.largeText?'켜짐':'꺼짐'}</button></div><div class="settings-row"><label for="setting-motion">화면 움직임 줄이기</label><button id="setting-motion" class="toggle ${settings.reducedMotion?'on':''}">${settings.reducedMotion?'켜짐':'꺼짐'}</button></div><div class="menu-list" style="margin-top:20px"><button id="install-game">홈 화면에 추가하기 <span>↗</span></button><button id="how-to">조작 방법과 작품 안내 <span>→</span></button></div><p class="modal-note">진행 상황은 이 기기의 브라우저에 자동 저장됩니다. 브라우저 데이터 삭제 또는 시크릿 모드에서는 저장이 유지되지 않을 수 있습니다. 최초 리소스 캐싱이 완료되면 오프라인으로 플레이할 수 있습니다.</p>`);
  $('#setting-ambience').value=settings.ambience;
  $('#setting-ambience').onchange=e=>{settings.ambience=e.target.value;updateSettings();save();};
  $('#setting-sound').onclick=()=>{setSound(!settings.sound);openSettings();};
  for(const [id,key]of [['large','largeText'],['motion','reducedMotion']])$('#setting-'+id).onclick=()=>{settings[key]=!settings[key];updateSettings();save();openSettings();};
  $('#install-game').onclick=async()=>{if(deferredInstall){await deferredInstall.prompt();deferredInstall=null;}else{showModal('게임을 홈 화면에','PLAY ANYTIME',`<p>안드로이드 Chrome 또는 삼성 인터넷의 브라우저 메뉴에서 ‘홈 화면에 추가’ 또는 ‘앱 설치’를 선택해 주세요.</p><p>HTTPS로 서비스된 게임을 한 번 온라인으로 열고 리소스 캐싱을 마친 뒤에는 오프라인에서도 즐길 수 있습니다.</p><p class="modal-note">설치 메뉴는 브라우저와 개인 접근 제한 환경에 따라 지원 여부가 다릅니다.</p>`);}};
  $('#how-to').onclick=openHelp;
}
function openHelp(){
  showModal('기억의 골목을 걷는 법','HOW TO PLAY',`<p>왼쪽의 ← → 버튼을 누르고 있으면 계속 이동합니다. 이동하면서 오른쪽 ↟ 버튼을 함께 눌러 점프할 수 있습니다.</p><p>사람이나 사물에 가까이 가면 ✦ 표시가 나타납니다. ✦ 대화 / 조사 버튼을 눌러 상호작용하세요. 대화창을 누르면 다음 대사로 넘어가고, 선택지는 직접 눌러 고릅니다.</p><p>길 끝의 화살표 표지판에서 ✦ 버튼을 누르면 다음 장소로 이동합니다. 학교 앞 오른쪽의 ‘다음 페이지’를 조사하면 챕터 1이 완료됩니다.</p><p>키보드: 방향키 / A·D 이동, Space / W 점프, E 대화·조사, Enter 대화 진행, Esc 메뉴.</p><p class="modal-note">이 작품은 안재원이 제공한 기록을 바탕으로 합니다. 1997년 1월 26일 부산 출생, 조부모님의 보살핌 속에서 성장한 배경 외에 구체적인 일상 장면과 모든 대사는 창작입니다. 학장동의 행정구와 유년기 연도는 확정하지 않습니다. 게임의 지형과 인물 외형은 실제 모습을 재현하지 않습니다.</p>`);
}
function openMenu(){
  if(!scene)return;
  showModal(mode==='title'?'이야기를 펼치기 전에':'잠시, 쉬어 가기','LIFE STORY',`<div class="menu-list">${mode==='playing'?'<button id="menu-resume">이야기 계속하기 <span>→</span></button>':''}<button id="menu-album">추억 앨범 <span>▤</span></button><button id="menu-settings">설정 <span>☷</span></button><button id="menu-chapters">여덟 장의 이야기 <span>↗</span></button><button id="menu-help">조작 방법과 작품 안내 <span>?</span></button>${mode!=='title'?'<button id="menu-title">저장하고 타이틀로 <span>↩</span></button>':''}</div><p class="modal-note">${state?`챕터 1 · ${stageById(state.stage).name} · 기억 ${state.memories.length} / ${MEMORIES.length}`:'기억의 첫 페이지가 당신을 기다리고 있습니다.'}</p>`);
  $('#menu-resume')?.addEventListener('click',closeModal);$('#menu-album').onclick=openAlbum;$('#menu-settings').onclick=openSettings;$('#menu-chapters').onclick=openChapters;$('#menu-help').onclick=openHelp;$('#menu-title')?.addEventListener('click',goToTitle);
}

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
  if(modalOpen&&e.key==='Tab'){const items=[...$('.modal').querySelectorAll('button:not(:disabled),select,a[href]')];const first=items[0],last=items.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===$('.modal'))){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
});
updateAlbumCount();
registerSW({onOfflineReady(){toast('오프라인 준비 완료 · 이 기기에서 다시 만나요.');},onNeedRefresh(){toast('새 버전이 준비되었습니다. 진행 상황을 저장하고 게임을 다시 열어 주세요.');},onRegisterError(){toast('오프라인 리소스를 저장하지 못했습니다. 온라인으로는 계속 플레이할 수 있습니다.');}});

// 자동화는 실제 화면·입력·저장으로 검증합니다. 읽기 전용 진단 정보만 노출합니다.
window.lifeStory={getSnapshot:()=>({mode,stage:state?.stage,x:scene?.player?.x,y:scene?.player?.y,grounded:scene?.player?.body?.blocked.down,memories:[...(state?.memories||[])],events:[...(state?.events||[])],nearest:nearest?.id,dialogue:dialogue?{speaker:dialogue.lines[dialogue.index]?.speaker,index:dialogue.index,choices:Boolean(dialogue.lines[dialogue.index]?.choices)}:null,overlay,modalOpen,settings:{...settings}})};
