// One owned timer; pausing stores remaining time instead of advancing off-screen.
export class TextPlayer{
 constructor(clock={now:()=>performance.now(),set:(f,t)=>setTimeout(f,t),clear:id=>clearTimeout(id)}){this.clock=clock;this.timer=null;this.paused=false;this.cancel();}
 cancel(){if(this.timer!=null)this.clock.clear(this.timer);this.timer=null;this.active=false;this.ready=true;this.autoRemaining=null;}
 start(text,options={}){this.cancel();this.active=true;this.parts=Array.from(text);this.options=options;this.visible=0;this.ready=false;this.cps=options.cps||0;this.elapsed=0;this.anchor=this.clock.now();this.options.onText?.('');if(!this.cps)this.reveal();else this.schedule();}
 schedule(){if(!this.active||this.paused||this.timer!=null)return;this.anchor=this.clock.now();this.timer=this.clock.set(()=>{this.timer=null;if(this.paused||!this.active)return;const elapsed=this.clock.now()-this.anchor;if(this.ready){this.autoRemaining-=elapsed;if(this.autoRemaining<=0){this.active=false;this.options.onAuto?.();}else this.schedule();return;}this.elapsed+=elapsed;this.visible=Math.min(this.parts.length,Math.floor(this.elapsed*this.cps/1000));this.options.onText?.(this.parts.slice(0,this.visible).join(''));if(this.visible>=this.parts.length)this.finish();else this.schedule();},this.ready?Math.min(100,this.autoRemaining):32);}
 finish(){this.ready=true;this.options.onText?.(this.parts.join(''));this.options.onReady?.();if(this.options.autoDelay!=null){this.autoRemaining=this.options.autoDelay;this.schedule();}}
 reveal(){if(!this.active||this.ready)return false;if(this.timer!=null)this.clock.clear(this.timer);this.timer=null;this.visible=this.parts.length;this.finish();return true;}
 pause(value){if(this.paused===value)return;if(value){if(this.timer!=null){const elapsed=this.clock.now()-this.anchor;if(this.ready&&this.autoRemaining!=null)this.autoRemaining=Math.max(0,this.autoRemaining-elapsed);else this.elapsed+=elapsed;this.clock.clear(this.timer);this.timer=null;}}this.paused=value;if(!value&&this.active&&(!this.ready||this.autoRemaining!=null))this.schedule();}
 get typing(){return this.active&&!this.ready;}
}
