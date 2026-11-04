import {MOTHER_FAREWELL as STORY} from '../data/farewell.js';

// A scene-clock owned sequence: menus, hidden tabs and cancellation stop every beat.
export class FarewellDirector {
 constructor({root,scene,sound,text,settings,state,portraits,onPause,onLine}) {
  Object.assign(this,{root,scene,sound,text,settings,state,portraits,onPause,onLine});
  this.active=false;this.paused=false;this.token=0;this.tasks=new Set();this.phase=null;
 }
 async wait(ms) {
  if(!this.active)return false;
  const token=this.token;
  return new Promise(resolve=>{
   const task={resolve,event:null};
   task.event=this.scene().time.delayedCall(ms,()=>{this.tasks.delete(task);resolve(this.active&&token===this.token);});
   this.tasks.add(task);
  });
 }
 setPhase(phase,busy=true){this.phase=phase;this.busy=busy;this.root.dataset.farewellPhase=phase;}
 pause(value){this.paused=value;}
 controls(){
  this.root.querySelector('.farewell-pause')?.addEventListener('click',this.onPause);
  this.root.querySelector('.farewell-skip')?.addEventListener('click',()=>{if(!this.paused&&this.state().cutscenesSeen.includes(STORY.seenKey))this.finish();});
 }
 pauseButton(){return '<button class="farewell-pause" aria-label="작별 장면 일시정지">Ⅱ</button>';}
 async start(onComplete){
  this.cancel();this.active=true;this.token++;this.onComplete=onComplete;
  this.root.hidden=false;this.root.className='cinematic visual-cutscene farewell-cutscene';
  const seen=this.state().cutscenesSeen.includes(STORY.seenKey);
  this.root.innerHTML=this.pauseButton()+(seen?'<button class="farewell-skip">본 장면 건너뛰기</button>':'');this.controls();
  this.scene().loadStage(STORY.stage,STORY.blocking.child);this.scene().beginFarewell();
  this.sound.setMood('quiet');this.sound.setCinematicAmbience({type:'rain',openness:0});
  this.setPhase('establish');
  if(!await this.wait(STORY.timing.establish))return;
  this.quote();
 }
 quote(){
  this.setPhase('quote',false);
  const seen=this.state().cutscenesSeen.includes(STORY.seenKey);
  this.root.innerHTML=this.pauseButton()+(seen?'<button class="farewell-skip">본 장면 건너뛰기</button>':'')+'<section class="farewell-card"><div class="dialogue-top"><img class="portrait" alt=""><span class="speaker">엄마</span></div><p class="farewell-quote"></p><button id="farewell-next" class="primary-button" disabled>계속 →</button></section>';
  this.root.querySelector('.portrait').src=this.portraits().mother;
  this.controls();this.root.querySelector('#farewell-next').onclick=()=>this.advance();
  this.root.querySelector('.farewell-quote').onclick=()=>this.advance();
  this.text.start(STORY.quote.text,{cps:this.settings().textSpeed,onText:value=>{const node=this.root.querySelector('.farewell-quote');if(node)node.textContent=value;},onReady:()=>{if(!this.active||this.phase!=='quote')return;this.onLine(STORY.quote);this.root.querySelector('#farewell-next').disabled=false;}});
 }
 advance(){
  if(!this.active||this.paused||this.busy)return false;
  if(this.phase==='quote'){if(this.text.reveal())return true;this.text.cancel();this.depart();return true;}
  if(this.phase==='epilogue'){this.finish();return true;}
  return false;
 }
 async depart(){
  this.setPhase('silence');this.root.querySelector('.farewell-card')?.remove();
  this.scene().farewellBeat('open');this.sound.setRainOpenness(1);this.sound.effect('door-open');
  if(!await this.wait(STORY.timing.silence))return;
  this.setPhase('leaving');this.scene().farewellBeat('leave');
  if(!await this.wait(this.settings().reducedMotion?180:STORY.timing.walk+STORY.timing.leave))return;
  this.setPhase('door-close');this.scene().farewellBeat('close');this.sound.effect('door-close');this.sound.setRainOpenness(.12);
  if(!await this.wait(this.settings().reducedMotion?100:STORY.timing.close))return;
  this.setPhase('fade');this.scene().cameras.main.fadeOut(this.settings().reducedMotion?0:STORY.timing.fade,5,9,12);
  if(!await this.wait(this.settings().reducedMotion?80:STORY.timing.fade+40))return;
  this.setPhase('epilogue');this.root.className='cinematic farewell-epilogue';
  this.root.innerHTML=this.pauseButton()+'<p class="farewell-final"></p><button id="farewell-next" class="farewell-continue" disabled>다음 기억으로 →</button>';
  const text=this.root.querySelector('.farewell-final');text.textContent=STORY.ending.text;text.style.opacity=this.settings().reducedMotion?'1':'0';
  this.controls();this.root.querySelector('#farewell-next').onclick=()=>this.advance();this.onLine(STORY.ending);
  if(!this.settings().reducedMotion)this.scene().tweens.addCounter({from:0,to:1,duration:STORY.timing.textFade,onUpdate:tween=>{text.style.opacity=String(tween.getValue());}});
  if(!await this.wait((this.settings().reducedMotion?0:STORY.timing.textFade)+STORY.timing.hold))return;
  this.busy=false;this.root.querySelector('#farewell-next').disabled=false;
 }
 finish(){if(!this.active||this.paused)return;const done=this.onComplete;this.cancel();done?.();}
 cancel(){
  this.token++;const wasActive=this.active;this.active=false;this.onComplete=null;
  for(const task of this.tasks){task.event.remove(false);task.resolve(false);}this.tasks.clear();
  if(wasActive){this.text.cancel();this.scene()?.endVisual();this.scene()?.cameras.main.resetFX();this.sound.setCinematicAmbience(null);this.root.hidden=true;delete this.root.dataset.farewellPhase;}
 }
 diagnostics(){return {active:this.active,phase:this.phase,busy:Boolean(this.busy),paused:this.paused,pendingTimers:this.tasks.size};}
}
