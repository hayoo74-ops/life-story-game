// Owned facade coordinates: every opening is computed INSIDE its building's wall.
export function buildingGeometry({id='building',x,base,w,h,floors=2,door=true,sign=null,...style}){
 const roofHeight=Math.min(33,Math.floor(h*.25));
 const wall={left:x+8,right:x+w-8,top:base-h+roofHeight+6,bottom:base-8};
 const count=Math.max(1,Math.min(floors,Math.floor((wall.bottom-wall.top)/43)));
 const floorHeight=(wall.bottom-wall.top)/count,cols=Math.max(1,Math.floor((w-32)/52));
 const ww=Math.min(28,(w-32)/cols-12),wh=Math.min(34,floorHeight-16),windows=[];
 const entrance=door&&h>110?{owner:id,left:x+w/2-18,right:x+w/2+18,top:base-70,bottom:base-8}:null;
 const signBox=sign?{owner:id,left:x+16,right:x+w-16,top:base-105,bottom:base-79}:null;
 for(let floor=0;floor<count;floor++)for(let col=0;col<cols;col++){
  const cx=wall.left+(col+.5)*(wall.right-wall.left)/cols;
  const top=wall.top+floor*floorHeight+8;
  const win={owner:id,floor,left:cx-ww/2,right:cx+ww/2,top,bottom:top+wh};
  const intersects=b=>b&&win.left<b.right+6&&win.right>b.left-6&&win.top<b.bottom+6&&win.bottom>b.top-6;
  if(!intersects(entrance)&&!intersects(signBox))windows.push(win);
 }
 return {...style,id,x,base,w,h,floors:count,wall,roof:{left:x-20,right:x+w+20,top:base-h,bottom:base-h+roofHeight},roofHeight,windows,entrance,sign:signBox,signText:sign};
}
export function stageArchitecture(stage){
 let specs=[],trees=[];
 if(stage.variant==='daeyeon'){
  specs=[[130,220,265,3],[710,215,310,3]];trees=[{x:480,base:435,size:.9},{x:1120,base:433,size:1.25}];
 }else if(stage.kind==='town'){
  specs=[[-50,245,224,2],[235,235,257,2],[635,234,195,2],[1090,275,266,2],[1552,245,216,2]];
  trees=[{x:540,base:435,size:.75},{x:980,base:430,size:1.15,pink:true},{x:1460,base:435,size:1.1}];
 }else if(stage.kind==='school'){
  specs=[[650,580,265,3]];trees=[{x:350,base:440,size:1.5,pink:true},{x:1320,base:440,size:1.1}];
 }else if(stage.kind==='park')trees=[{x:160,base:435,size:1.6},{x:1190,base:434,size:1.5,pink:true}];
 const colors=['#d7c69e','#e7d4ac','#cbd0ad','#e0c7a1','#d9cfac'];
 const buildings=specs.filter(([x])=>x<stage.width).map(([x,w,h,floors],i)=>buildingGeometry({id:`${stage.id}:house:${i}`,x,w,h,floors,base:stage.kind==='school'?406:411,door:stage.kind!=='school',wallColor:colors[i%colors.length],sign:i===1&&stage.variant!=='daeyeon'?'학장 이발관':null}));
 // Canopies stay clear of facade footprints. Landscaping belongs in the gaps.
 trees=trees.filter(t=>t.x-55*t.size>=0&&t.x+57*t.size<=stage.width&&!buildings.some(b=>t.x+57*t.size>b.x-20&&t.x-55*t.size<b.x+b.w+20));
 return {buildings,trees};
}
