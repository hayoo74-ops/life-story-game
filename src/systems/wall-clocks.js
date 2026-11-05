// The story year never changes this clock: use the device's current LOCAL time.
export function clockReading(date=new Date()){
 const hours=date.getHours(),minutes=date.getMinutes(),seconds=date.getSeconds();
 return {hours,minutes,seconds,label:`${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`,hourAngle:((hours%12)+minutes/60)*Math.PI/6,minuteAngle:minutes*Math.PI/30,secondAngle:seconds*Math.PI/30};
}
export class WallClocks{
 constructor(scene){this.scene=scene;this.graphics=scene.add.graphics().setDepth(2.6);this.labels=[];this.faces=[];this.lastSecond=null;this.reading=null;}
 reset(stage,room,entities){
  this.graphics.clear();for(const label of this.labels)label.destroy();this.labels=[];this.faces=[];this.lastSecond=null;this.reading=null;this.stage=stage.id;
  if(room?.clock)this.faces.push({id:'wall-clock',...room.clock,r:14,case:true});
  for(const e of entities)if(e.data.object==='clock'){const b=e.sprite.getBounds(),scale=e.sprite.scaleX;this.faces.push({id:e.data.id,x:b.left+40*scale,y:b.top+32*scale,r:19*scale,case:false});}
  for(const f of this.faces)this.labels.push(this.scene.add.text(f.x,f.y+f.r+9,'',{fontFamily:'monospace',fontSize:'12px',color:'#405146',backgroundColor:'#eee2be',padding:{left:2,right:2,top:1,bottom:1}}).setOrigin(.5,0).setDepth(2.7));
  this.refresh(true);
 }
 refresh(force=false,date=new Date()){
  if(!this.faces.length)return;const second=Math.floor(date.getTime()/1000);if(!force&&second===this.lastSecond)return;this.lastSecond=second;this.reading=clockReading(date);
  const g=this.graphics;g.clear();
  for(let i=0;i<this.faces.length;i++){
   const f=this.faces[i],r=f.r;
   if(f.case){g.fillStyle(0x8c785c);g.fillRect(f.x-24,f.y-23,48,66);g.fillStyle(0xeee2be);g.fillRect(f.x-19,f.y-18,38,37);}
   g.lineStyle(1,0x8e9276);for(let tick=0;tick<12;tick++){const a=tick*Math.PI/6;g.beginPath();g.moveTo(f.x+Math.sin(a)*(r-2),f.y-Math.cos(a)*(r-2));g.lineTo(f.x+Math.sin(a)*r,f.y-Math.cos(a)*r);g.strokePath();}
   for(const [a,length,width,color]of [[this.reading.hourAngle,r*.53,3,0x465749],[this.reading.minuteAngle,r*.83,2,0x465749],[this.reading.secondAngle,r*.88,1,0xa87764]]){
    g.lineStyle(width,color);g.beginPath();g.moveTo(f.x,f.y);g.lineTo(f.x+Math.sin(a)*length,f.y-Math.cos(a)*length);g.strokePath();
   }
   g.fillStyle(0x465749);g.fillCircle(f.x,f.y,2);this.labels[i].setText(this.reading.label);
  }
 }
 snapshot(){return {stage:this.stage,faces:this.faces.map(f=>({...f})),labelCount:this.labels.length,labels:this.labels.map(l=>({text:l.text,x:l.x,y:l.y,active:l.active})),reading:this.reading?{...this.reading}:null,depth:this.graphics.depth};}
}
