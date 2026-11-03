// 독창적인 짧은 펜타토닉 선율. 외부 음원과 네트워크를 사용하지 않습니다.
const PATTERNS={childhood:[261.63,329.63,392,440,392,329.63,293.66,261.63],school:[293.66,369.99,440,493.88,440,369.99,329.63,293.66]};
export class Soundtrack{
  constructor(){this.enabled=false;this.context=null;this.timer=null;this.step=0;this.mood='childhood';this.paused=false;}
  unlock(){try{this.context??=new (window.AudioContext||window.webkitAudioContext)();if(this.context.state==='suspended')this.context.resume().catch(()=>{});}catch{} }
  setEnabled(enabled){this.enabled=enabled;if(enabled){this.unlock();this.start();}else this.stop();}
  setMood(mood){this.mood=mood;this.step=0;}
  pause(value){this.paused=value;if(value)this.stop();else if(this.enabled)this.start();}
  start(){this.stop();if(!this.enabled||this.paused||!this.context)return;this.timer=setInterval(()=>{if(this.context.state!=='running')return;const pattern=PATTERNS[this.mood]||PATTERNS.childhood;const f=pattern[this.step++%pattern.length];this.note(f,.8,.026,'sine');if(this.step%4===1)this.note(f/2,1.8,.015,'triangle');},580);}
  stop(){if(this.timer)clearInterval(this.timer);this.timer=null;}
  note(freq,duration=.12,volume=.045,type='sine'){
    if(!this.enabled||!this.context||this.paused)return;try{const t=this.context.currentTime;const o=this.context.createOscillator();const g=this.context.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.context.destination);o.start(t);o.stop(t+duration+.05);}catch{}
  }
  effect(kind){this.unlock();if(kind==='memory'){[523.25,659.25,783.99].forEach((n,i)=>setTimeout(()=>this.note(n,.5,.045),i*115));}else if(kind==='jump')this.note(350,.12,.02,'triangle');else this.note(523.25,.08,.025,'triangle');}
}
