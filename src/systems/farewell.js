import {MOTHER_FAREWELL as STORY} from '../data/farewell.js';

// Phaser's scene clock owns every interval. Menu, app backgrounding, replay and
// cancellation share the same timer/tween cleanup; no detached wall-clock tasks.
export class FarewellDirector {
 constructor(options){Object.assign(this,options);this.active=false;this.paused=false;this.token=0;this.tasks=new Set();this.phase=null;}
 async wait(ms){if(!this.active)return false;const token=this.token;return new Promise(resolve=>{const task={resolve,event:null};task.event=this.scene().time.delayedCall(ms,()=>{this.tasks.delete(task);resolve(this.active&&token===this.token);});this.tasks.add(task);});}
 setPhase(phase,busy=true){this.phase=phase;this.busy=busy;this.root.dataset.farewellPhase=phase;}
 pause(value){this.paused=value;}
 controls(){this.root.querySelector('.farewell-pause')?.addEventListener('click',this.onPause);this.root.querySelector('.farewell-skip')?.addEventListener('click',()=>{if(!this.paused)this.finish();});}
 buttons(){return '<button class="farewell-pause" aria-label="작별 장면 일시정지">Ⅱ</button><button class="farewell-skip">장면 건너뛰기</button>';}
 blank(){this.root.className='cinematic visual-cutscene farewell-cutscene';this.root.innerHTML=this.buttons();this.controls();}
 async start(onComplete){
  this.cancel();this.active=true;this.paused=false;this.token++;this.onComplete=onComplete;this.root.hidden=false;this.blank();
  this.scene().loadStage(STORY.stage,STORY.blocking.child);this.scene().beginFarewell();
  this.sound.setMood('quiet');this.sound.setCinematicAmbience({type:'rain',openness:0,tv:true});
  this.setPhase('establish');this.scene().farewellBeat('play');
  if(!await this.wait(STORY.timing.establish))return;
  this.setPhase('approach');this.scene().farewellBeat('approach');
  if(!await this.wait(this.settings().reducedMotion?300:STORY.timing.approach))return;
  this.quote();
 }
 quote(){
  this.setPhase('quote',false);this.root.innerHTML=this.buttons()+'<section class="farewell-card" aria-label="엄마의 인사"><div class="dialogue-top"><img class="portrait" alt=""><span class="speaker">엄마</span></div><p class="farewell-quote"></p><button id="farewell-next" class="primary-button" disabled>계속 →</button></section>';
  this.root.querySelector('.portrait').src=this.portraits().mother;this.controls();this.root.querySelector('#farewell-next').onclick=()=>this.advance();this.root.querySelector('.farewell-quote').onclick=()=>this.advance();
  this.text.start(STORY.quote.text,{cps:this.settings().textSpeed,onText:value=>{const node=this.root.querySelector('.farewell-quote');if(node)node.textContent=value;},onReady:()=>{if(!this.active||this.phase!=='quote')return;this.onLine(STORY.quote);this.root.querySelector('#farewell-next').disabled=false;}});
 }
 advance(){if(!this.active||this.paused||this.busy)return false;if(this.phase==='quote'){if(this.text.reveal())return true;this.text.cancel();this.depart();return true;}if(this.phase==='epilogue'){this.finish();return true;}return false;}
 async depart(){
  this.setPhase('silence');this.blank();this.scene().farewellBeat('open');this.sound.setRainOpenness(1);this.sound.effect('door-open');
  if(!await this.wait(STORY.timing.silence))return;
  this.setPhase('leaving');this.scene().farewellBeat('leave');
  if(!await this.wait(this.settings().reducedMotion?300:STORY.timing.walk+STORY.timing.leave))return;
  this.setPhase('door-close');this.scene().farewellBeat('close');
  if(!await this.wait(this.settings().reducedMotion?100:STORY.timing.close))return;
  this.sound.effect('door-close');this.sound.setRainOpenness(.12);
  this.setPhase('ordinary');this.scene().farewellBeat('ordinary');
  if(!await this.wait(STORY.timing.ordinary))return;
  for(const shot of ['door','tv','toy']){
   this.setPhase('montage-'+shot);this.scene().farewellBeat(shot);
   if(!await this.wait(STORY.timing.montage))return;
  }
  this.sound.setCinematicTV(false);this.sound.setRainOpenness(0);
  this.setPhase('fade');this.scene().cameras.main.fadeOut(this.settings().reducedMotion?0:STORY.timing.fade,5,9,12);
  if(!await this.wait(this.settings().reducedMotion?100:STORY.timing.fade+40))return;
  this.root.className='cinematic farewell-epilogue';
  for(let i=0;i<STORY.reflections.length;i++){
   this.setPhase('reflection-'+i);if(!await this.card(STORY.reflections[i]))return;
  }
  this.setPhase('epilogue');await this.card(STORY.ending,true);
 }
 async card(line,last=false){
  this.root.innerHTML=this.buttons()+'<p class="farewell-final" aria-live="polite"></p>'+(last?'<button id="farewell-next" class="farewell-continue" disabled>다음 기억으로 →</button>':'');this.controls();
  const node=this.root.querySelector('.farewell-final');node.textContent=line.text;node.style.opacity=this.settings().reducedMotion?'1':'0';this.onLine(line);
  const fade=(from,to)=>{if(this.settings().reducedMotion){node.style.opacity=String(to);return;}this.scene().tweens.addCounter({from,to,duration:STORY.timing.textFade,onUpdate:tween=>node.style.opacity=String(tween.getValue())});};
  fade(0,1);if(!await this.wait(STORY.timing.textFade+STORY.timing.textHold))return false;
  if(last){this.busy=false;const next=this.root.querySelector('#farewell-next');next.disabled=false;next.onclick=()=>this.advance();return true;}
  fade(1,0);return this.wait(STORY.timing.textFade+250);
 }
 finish(){if(!this.active||this.paused)return;const done=this.onComplete;this.cancel();done?.();}
 cancel(){this.token++;const wasActive=this.active;this.active=false;this.onComplete=null;for(const task of this.tasks){task.event.remove(false);task.resolve(false);}this.tasks.clear();if(wasActive){this.text.cancel();this.scene()?.endVisual();this.scene()?.cameras.main.resetFX();this.sound.setCinematicAmbience(null);this.root.hidden=true;delete this.root.dataset.farewellPhase;}}
 diagnostics(){return {active:this.active,phase:this.phase,busy:Boolean(this.busy),paused:this.paused,pendingTimers:this.tasks.size};}
}
