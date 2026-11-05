// All sounds are synthesized here. No external samples, voices or commercial music.
const SONGS={
 childhood:{notes:[261.63,329.63,392,440,392,329.63,293.66,261.63],tempo:630},
 school:{notes:[293.66,369.99,440,493.88,440,369.99,329.63,293.66],tempo:560},
 daily:{notes:[220,261.63,329.63,293.66,261.63,220,196,220],tempo:800},
 study:{notes:[220,261.63,293.66,261.63,220,196,220,196],tempo:900},
 alone:{notes:[196,220,261.63,220,174.61,196,220,196],tempo:1050},
 present:{notes:[261.63,392,329.63,293.66,329.63,261.63,220,261.63],tempo:880}
};
export class Soundtrack{
 constructor(){this.enabled=false;this.context=null;this.timer=null;this.envTimer=null;this.step=0;this.mood='childhood';this.paused=false;this.settings={masterVolume:.7,musicVolume:.4,sfxVolume:.7};this.nodes=new Set();this.loops=[];this.delays=new Set();this.cinematicAmbience=null;this.environment={indoors:true,weather:'day',tv:false};this.lastEffects=new Map();this.ducked=false;this.stats={effects:0,tones:0};this.recentEffects=[];this.toyMotion=null;}
 unlock(){try{if(!this.context||this.context.state==='closed'){this.context=new (window.AudioContext||window.webkitAudioContext)();this.master=this.context.createGain();this.music=this.context.createGain();this.sfx=this.context.createGain();this.ambient=this.context.createGain();this.music.connect(this.master);this.sfx.connect(this.master);this.ambient.connect(this.master);this.master.connect(this.context.destination);this.noise=this.context.createBuffer(1,this.context.sampleRate*2,this.context.sampleRate);const a=this.noise.getChannelData(0);let seed=91437;for(let i=0;i<a.length;i++){seed=(seed*1664525+1013904223)>>>0;a[i]=(seed/4294967296*2-1)*.6;}this.mix();}if(['suspended','interrupted'].includes(this.context.state))this.context.resume().catch(()=>{});}catch{} }
 configure(settings){this.settings={...settings};const enabled=settings.sound===true&&!settings.muted;if(this.enabled!==enabled)this.setEnabled(enabled);this.mix();}
 setEnabled(enabled){this.enabled=enabled;if(enabled){this.unlock();this.start();}else this.stop();this.mix();}
 mix(){if(!this.context||!this.master)return;const t=this.context.currentTime;const smooth=(gain,value)=>{gain.gain.cancelScheduledValues(t);gain.gain.setTargetAtTime(Math.max(0,value),t,.035);};smooth(this.master,this.enabled&&!this.paused?this.settings.masterVolume??.7:0);smooth(this.music,(this.settings.musicVolume??.4)*(this.ducked?.28:1));smooth(this.sfx,this.settings.sfxVolume??.7);smooth(this.ambient,(this.settings.sfxVolume??.7)*(this.ducked?.5:1));}
 duck(value){if(this.ducked===value)return;this.ducked=value;this.mix();}
 setMood(mood){if(this.mood===mood)return;this.mood=mood;this.step=0;if(this.enabled&&!this.paused)this.start();}
 setEnvironment(environment){const next={...this.environment,...environment};if(JSON.stringify(next)===JSON.stringify(this.environment))return;this.environment=next;if(this.enabled&&!this.paused)this.startAmbient();}
 pause(value){if(this.paused===value)return;this.paused=value;if(value)this.stop();else if(this.enabled){this.unlock();this.start();}this.mix();}
 schedule(fn,ms){const id=setTimeout(()=>{this.delays.delete(id);if(this.enabled&&!this.paused)fn();},ms);this.delays.add(id);}
 start(){this.stop();if(!this.enabled||this.paused||!this.context)return;this.mix();if(this.mood!=='quiet'){const song=SONGS[this.mood]||SONGS.daily;this.timer=setInterval(()=>{if(this.context.state!=='running')return;const note=song.notes[this.step++%song.notes.length];this.note(note,.9,.038,'sine','music');if(this.step%4===1)this.note(note/2,1.7,.023,'triangle','music');},song.tempo);}this.startAmbient();}
 setCinematicAmbience(value){this.cinematicAmbience=value;if(this.enabled&&!this.paused)this.startAmbient();}
 setRainOpenness(value){if(!this.cinematicAmbience)return;this.cinematicAmbience.openness=Math.max(0,Math.min(1,value));if(this.context)for(const n of this.loops){if(n.role==='cinematic-rain')n.gain.gain.setTargetAtTime(.006+.04*this.cinematicAmbience.openness,this.context.currentTime,.3);}}
 startAmbient(){this.stopAmbient();if(!this.enabled||this.paused||!this.context||(this.mood==='quiet'&&!this.cinematicAmbience))return;if(this.cinematicAmbience?.type==='rain'){this.loopNoise('lowpass',450,.014);this.loopNoise('highpass',1100,.006+.04*this.cinematicAmbience.openness);this.loops.at(-1).role='cinematic-rain';if(this.cinematicAmbience.tv!==false)this.televisionLoop();this.ambientTicks(true);return;}const e=this.environment;if(e.indoors)this.loopNoise('lowpass',260,.006);else this.loopNoise('lowpass',700,e.weather==='rain'?.009:.012);if(e.weather==='rain'&&!e.indoors)this.loopNoise('highpass',650,.026);if(e.tv)this.televisionLoop();this.ambientTicks(e.weather==='rain');}
 // A low, deliberately unintelligible original radio texture; no sampled programme or speech.
 televisionLoop(){
  this.loopNoise('bandpass',740,.006);const voice=this.loops.at(-1);voice.role='tv-broadcast';
  const t=this.context.currentTime;for(let i=0;i<160;i++)voice.gain.gain.setValueAtTime(.002+(Math.sin(i*2.3)**2)*.009,t+i*.11);
  this.loopNoise('lowpass',95,.002);this.loops.at(-1).role='crt-hum';
 }
 ambientTicks(rain){let ticks=0;this.envTimer=setInterval(()=>{ticks++;
  if(this.environment.indoors&&ticks%2===0)this.effect('clock');
  if(rain){if(ticks%3===0)this.burst(.06,.009,2300,'bandpass');if(ticks%29===0)this.effect('thunder');}
  else if(!this.environment.indoors){if(ticks%11===0)this.burst(2,.012,180,'lowpass');if(ticks%13===0){this.note(1800,.085,.008,'sine','sfx',2700);this.schedule(()=>this.note(2200,.06,.005,'sine','sfx',3000),120);}}
 },1000);}
 setCinematicTV(value){if(this.cinematicAmbience){this.cinematicAmbience.tv=value;if(this.enabled&&!this.paused)this.startAmbient();}}
 startToyMotion(){
  this.stopToyMotion();if(!this.enabled||this.paused||!this.context)return;
  this.loopNoise('bandpass',850,0);const n=this.loops.pop();n.role='toy-wheels';this.toyMotion=n;
  this.effect('toy-contact');
 }
 updateToyMotion(speed){if(!this.toyMotion||!this.context)return;const v=Math.min(1,Math.abs(speed)/180),n=this.toyMotion,t=this.context.currentTime;n.gain.gain.setTargetAtTime(.028*v,t,.025);n.filter.frequency.setTargetAtTime(380+1000*v,t,.025);n.source.playbackRate.setTargetAtTime(.35+v,t,.025);}
 stopToyMotion(){const n=this.toyMotion;if(!n)return;try{n.source.stop();}catch{}n.source.disconnect();n.filter.disconnect();n.gain.disconnect();this.toyMotion=null;this.effect('toy-contact');}
 loopNoise(type,frequency,volume){const source=this.context.createBufferSource(),filter=this.context.createBiquadFilter(),gain=this.context.createGain();source.buffer=this.noise;source.loop=true;filter.type=type;filter.frequency.value=frequency;gain.gain.value=volume;source.connect(filter);filter.connect(gain);gain.connect(this.ambient);source.start();this.loops.push({source,filter,gain});}
 stopAmbient(){this.stopToyMotion();if(this.envTimer)clearInterval(this.envTimer);this.envTimer=null;for(const n of this.loops){try{n.source.stop();}catch{}n.source.disconnect();n.filter.disconnect();n.gain.disconnect();}this.loops=[];}
 stop(){if(this.timer)clearInterval(this.timer);this.timer=null;this.stopAmbient();for(const id of this.delays)clearTimeout(id);this.delays.clear();for(const n of this.nodes){try{n.source.stop();}catch{}n.source.disconnect();n.gain.disconnect();n.filter?.disconnect();}this.nodes.clear();}
 track(source,gain,filter){const n={source,gain,filter};this.nodes.add(n);source.onended=()=>{source.disconnect();gain.disconnect();filter?.disconnect();this.nodes.delete(n);};}
 note(freq,duration=.12,volume=.04,type='sine',bus='sfx',endFreq=null){
  if(!this.enabled||!this.context||this.paused||this.nodes.size>30||(bus==='sfx'&&this.settings.sfxVolume===0))return;
  try{const t=this.context.currentTime,o=this.context.createOscillator(),g=this.context.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(endFreq)o.frequency.exponentialRampToValueAtTime(endFreq,t+duration);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(Math.min(volume,.1),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(bus==='music'?this.music:this.sfx);this.track(o,g);o.start(t);o.stop(t+duration+.02);this.stats.tones++;}catch{}
 }
 burst(duration,volume,frequency=1200,type='highpass'){if(!this.enabled||this.paused||!this.context||this.settings.sfxVolume===0||this.nodes.size>30)return;try{const t=this.context.currentTime,s=this.context.createBufferSource(),f=this.context.createBiquadFilter(),g=this.context.createGain();s.buffer=this.noise;f.type=type;f.frequency.value=frequency;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(volume,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+duration);s.connect(f);f.connect(g);g.connect(this.sfx);this.track(s,g,f);s.start(t);s.stop(t+duration+.02);}catch{}}
 effect(kind){
  if(!this.enabled||this.paused)return;this.unlock();const now=performance.now(),gap=kind.startsWith('step')?220:kind==='pencil'?280:40;if(now-(this.lastEffects.get(kind)||-1e9)<gap)return;this.lastEffects.set(kind,now);this.stats.effects++;this.recentEffects.push(kind);this.recentEffects=this.recentEffects.slice(-24);
  if(kind==='impact'){this.burst(.12,.05,260,'lowpass');return;}
  if(kind==='thunder'){this.burst(.8,.035,130,'lowpass');return;}
  if(kind==='clock'){this.burst(.012,.009,1800,'bandpass');return;}
  if(kind.startsWith('step')){this.burst(.035,kind==='step-wood'?.035:.024,kind==='step-wood'?1100:1900,'lowpass');if(kind==='step-wet')this.burst(.09,.018,1400,'highpass');return;}
  if(kind==='paper'){this.burst(.12,.025,1300);return;}
  if(kind==='pencil'){this.burst(.06,.018,2200,'bandpass');return;}
  if(kind==='drawer'){this.burst(.22,.028,600,'bandpass');this.schedule(()=>this.burst(.04,.02,240,'lowpass'),190);return;}
  if(kind==='door-open'||kind==='door-close'){this.burst(.018,.018,1700,'bandpass');this.schedule(()=>this.burst(kind==='door-close'?.12:.35,.028,kind==='door-close'?190:580,'lowpass'),kind==='door-close'?70:30);return;}
  if(kind==='tv-on'||kind==='tv-off'){this.burst(.018,.028,1800,'bandpass');if(kind==='tv-on')this.schedule(()=>this.burst(.28,.013,3600,'highpass'),60);return;}
  if(kind==='toy'||kind==='toy-contact'){this.burst(.035,.023,620,'bandpass');return;}
  if(kind==='laugh'){[392,440,392,523].forEach((n,i)=>this.schedule(()=>this.note(n,.09,.025,'triangle'),i*125));return;}
  if(kind==='memory'){[523.25,659.25,783.99].forEach((n,i)=>this.schedule(()=>this.note(n,.5,.045),i*115));return;}
  if(kind==='jump'){this.note(350,.12,.02,'triangle','sfx',480);return;}
  this.burst(.012,.009,1500,'bandpass');
 }
 diagnostics(){return {recentEffects:[...this.recentEffects],toyRolling:Boolean(this.toyMotion),tvBroadcast:this.loops.some(n=>n.role==='tv-broadcast'),loopRoles:this.loops.map(n=>n.role||'environment'),cinematicAmbience:this.cinematicAmbience?.type||null,rainOpenness:this.cinematicAmbience?.openness||0,enabled:this.enabled,paused:this.paused,context:this.context?.state||'uninitialized',activeSources:this.nodes.size,ambientLoops:this.loops.length,musicTimer:Boolean(this.timer),environmentTimer:Boolean(this.envTimer),pendingEffects:this.delays.size,mood:this.mood,volumes:{master:this.settings.masterVolume,music:this.settings.musicVolume,sfx:this.settings.sfxVolume},...this.stats};}
 dispose(){this.stop();this.context?.close().catch(()=>{});}
}
