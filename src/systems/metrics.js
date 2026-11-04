export class FrameMetrics{
 constructor(limit=1200){this.values=new Float32Array(limit);this.count=0;this.index=0;this.last=null;}
 sample(now,active=true){if(!active){this.last=null;return;}if(this.last!=null){const ms=now-this.last;if(ms>0&&ms<1000){this.values[this.index++%this.values.length]=ms;this.count=Math.min(this.count+1,this.values.length);}}this.last=now;}
 report(){if(!this.count)return {samples:0,fps:0,p50:0,p95:0,p99:0};const a=Array.from(this.values.slice(0,this.count)).sort((x,y)=>x-y),mean=a.reduce((s,v)=>s+v,0)/a.length;const q=p=>+a[Math.min(a.length-1,Math.floor((a.length-1)*p))].toFixed(2);return {samples:a.length,fps:+(1000/mean).toFixed(1),p50:q(.5),p95:q(.95),p99:q(.99),max:+a.at(-1).toFixed(2)};}
}
