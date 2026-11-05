import {buildingGeometry,stageArchitecture} from './data/architecture.js';
import {roomLayout,ROOM_FLOOR} from './data/room-layouts.js';
// 모든 그래픽은 이 프로젝트에서 직접 그리는 오리지널 코드 기반 픽셀아트입니다.
// 캐릭터 교체: 동일한 32×40 프레임 규격의 시트를 로드하고 createCharacters를 대체하세요.
const PALETTE={outline:'#394b40',cream:'#f2deb0',stone:'#a7ad8c',leaf:'#6d875b',darkleaf:'#48684b',wood:'#936946'};
function rng(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
function surface(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return {c,g:c.getContext('2d')};}
function rect(g,x,y,w,h,color){g.fillStyle=color;g.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,Math.ceil(w/2)*2,Math.ceil(h/2)*2);}
function line(g,points,color,width=2){g.strokeStyle=color;g.lineWidth=width;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();}
function poly(g,points,color){g.fillStyle=color;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();}
function text(g,t,x,y,size=15,color='#4c5644'){g.font=`bold ${size}px "Malgun Gothic", sans-serif`;g.textAlign='center';g.fillStyle=color;g.fillText(t,x,y);}
function cloud(g,x,y,s=1){for(const [dx,dy,w,h]of [[0,8,70,10],[12,0,28,20],[38,4,44,15],[8,17,85,7]])rect(g,x+dx*s,y+dy*s,w*s,h*s,'#f8eac9');}
function windowArt(g,x,y,w=32,h=42,warm=false){rect(g,x-3,y-3,w+6,h+6,'#8a9174');rect(g,x,y,w,h,warm?'#f4d18a':'#6e928c');rect(g,x+3,y+3,w-6,h/2-4,warm?'#ffe2a4':'#99b1a1');rect(g,x+w/2-1,y,3,h,'#ddd3aa');rect(g,x,y+h/2,w,3,'#d5c99f');rect(g,x-5,y+h,w+10,5,'#d1c79f');rect(g,x+3,y+3,3,h/2-5,'#c5d2b8');}
function roof(g,x,y,w,h,color='#8e6552'){
  poly(g,[[x-12,y+h],[x+15,y],[x+w-15,y],[x+w+12,y+h]],'#675e4e');
  poly(g,[[x-10,y+h-5],[x+16,y],[x+w-16,y],[x+w+10,y+h-5]],color);
  for(let yy=6;yy<h-3;yy+=7){line(g,[[x+12-yy*.45,y+yy],[x+w-12+yy*.45,y+yy]],'#b08665');}
  for(let xx=22;xx<w-10;xx+=15)line(g,[[x+xx,y+2],[x+xx-5,y+h-5]],'#4b514527');
  rect(g,x-13,y+h-5,w+26,6,'#5c6853');rect(g,x-15,y+h-7,w+30,3,'#d4c399');
}
function building(g,x,base,w,h,options={}){
 const b=buildingGeometry({id:options.id||'distant',x,base,w,h,...options});
 const wall=options.wall||options.wallColor||'#dfc89e',roofColor=options.roofColor||'#8b6e57';
 rect(g,x,base-h+b.roofHeight,w,h-b.roofHeight,wall);
 rect(g,x,base-h+b.roofHeight,8,h-b.roofHeight,'#c2b793');rect(g,x+w-8,base-h+b.roofHeight,8,h-b.roofHeight,'#b8ae8b');
 for(let yy=b.wall.top+12;yy<base-10;yy+=16)rect(g,x+14,yy,w-28,1,'#bba98435');
 roof(g,x-5,base-h,w+10,b.roofHeight,roofColor);
 for(const win of b.windows)windowArt(g,win.left,win.top,win.right-win.left,win.bottom-win.top);
 if(b.entrance){const d=b.entrance;rect(g,d.left,d.top,36,d.bottom-d.top,'#606e58');rect(g,d.left+4,d.top+5,28,d.bottom-d.top-10,'#8a7656');rect(g,d.left+8,d.top+9,20,28,'#91a196');rect(g,d.right-10,d.bottom-22,3,3,'#eed6a1');}
 if(b.sign){const v=b.sign;rect(g,v.left,v.top,v.right-v.left,v.bottom-v.top,'#dce0b5');rect(g,v.left+3,v.top+3,v.right-v.left-6,v.bottom-v.top-6,'#627c62');text(g,b.signText,x+w/2,v.bottom-7,12,'#f5e5b9');}
 rect(g,x-4,base-7,w+8,7,'#8d9577');rect(g,x-8,base,w+16,5,'#c5bda1');
}

function tree(g,x,base,size=1,pink=false){
  rect(g,x-5*size,base-100*size,10*size,100*size,'#7d7451');rect(g,x+2*size,base-80*size,3*size,80*size,'#a18b60');
  line(g,[[x,base-64*size],[x-25*size,base-100*size]],'#716b48',5*size);line(g,[[x,base-80*size],[x+25*size,base-125*size]],'#716b48',4*size);
  const colors=pink?['#b88983','#cf9c92','#e3b7a5','#eac5ad']:['#496e50','#64815a','#849967','#a3ae77'];
  const blobs=[[-40,-133,48,34],[-22,-163,53,37],[6,-144,48,38],[-51,-109,61,32],[-16,-122,62,39],[20,-116,37,28],[-30,-145,35,22]];
  blobs.forEach(([a,b,w,h],i)=>rect(g,x+a*size,base+b*size,w*size,h*size,colors[i%4]));
  const r=rng(Math.round(x));for(let i=0;i<38;i++)rect(g,x+(-42+r()*86)*size,base+(-148+r()*51)*size,(4+r()*8)*size,3*size,colors[i%4]);
}
function pot(g,x,y,flower=false){rect(g,x-9,y-15,18,14,'#a07853');rect(g,x-11,y-18,22,5,'#bb9165');rect(g,x-4,y-38,5,22,'#708951');rect(g,x-14,y-32,14,8,'#7d985d');rect(g,x,y-41,12,12,'#9dab70');if(flower){rect(g,x-1,y-44,6,7,'#eac0a1');rect(g,x+6,y-39,7,7,'#dca594');}}
function fence(g,x,y,w){rect(g,x,y-36,w,5,'#dfd4af');rect(g,x,y-17,w,5,'#b6bd98');for(let i=0;i<w;i+=20){rect(g,x+i,y-48,8,50,'#c5ccaa');rect(g,x+i+2,y-48,3,46,'#e0dfbc');}}
function lamp(g,x,y){rect(g,x-3,y-153,7,153,'#5e705b');rect(g,x-10,y-7,20,8,'#75816b');line(g,[[x,y-150],[x,y-166],[x+6,y-172],[x+22,y-172]],'#5e705b',5);rect(g,x+15,y-172,20,5,'#566c55');rect(g,x+18,y-167,13,17,'#f4d797');rect(g,x+15,y-151,20,4,'#60735b');}
function ground(g,w,interior=false){
  rect(g,0,456,w,6,interior?'#8e7453':'#697f58');rect(g,0,462,w,78,interior?'#b3976b':'#c4bea1');
  if(interior){for(let y=467;y<540;y+=17){rect(g,0,y,w,2,'#9c825e');for(let x=(y%2)*60;x<w;x+=120)rect(g,x,y,2,17,'#a78a60');}}
  else{rect(g,0,465,w,6,'#e1d4ac');const r=rng(32);for(let y=480;y<540;y+=18){for(let x=-30+(y%3)*17;x<w;x+=53){rect(g,x,y,45+r()*10,2,'#a5aa8d');rect(g,x,y,2,14,'#b0b295');if(r()>.6)rect(g,x+8,y+6,25,2,'#d1c8a9');}}rect(g,0,526,w,14,'#8e9e76');for(let x=0;x<w;x+=12)rect(g,x,522+(x%3)*2,4,10,'#6e875c');}
}

export function createBackdrops(scene){
  const {c,g}=surface(2048,540);
  const grad=g.createLinearGradient(0,0,0,480);grad.addColorStop(0,'#c0cfbb');grad.addColorStop(.55,'#eddbb6');grad.addColorStop(1,'#f3dcab');g.fillStyle=grad;g.fillRect(0,0,2048,540);
  // Sun, clouds, distant Busan hills, water, and tiny harbor cranes.
  rect(g,1390,93,46,46,'#f5dfab');rect(g,1384,102,58,28,'#f5dfab');
  [100,410,780,1150,1650,1950].forEach((x,i)=>cloud(g,x,65+(i%3)*30,.7+(i%2)*.3));
  poly(g,[[0,294],[130,222],[220,250],[338,152],[430,181],[560,263],[700,196],[830,259],[950,173],[1060,215],[1220,275],[1350,221],[1500,285],[1660,190],[1790,248],[1930,196],[2048,273],[2048,540],[0,540]],'#a4b5a0');
  poly(g,[[0,345],[110,285],[220,317],[340,252],[470,292],[610,243],[750,308],[880,268],[1040,309],[1160,259],[1300,324],[1460,267],[1600,333],[1750,273],[1880,316],[2048,290],[2048,540],[0,540]],'#8fa68f');
  rect(g,0,369,2048,171,'#a9bcaa');for(let x=5;x<2048;x+=37)rect(g,x,390+(x%7)*7,22,2,'#d3d6b6');
  for(let x=850;x<1230;x+=85){rect(g,x,331,4,47,'#95a58e');line(g,[[x-18,340],[x+45,340],[x+29,328],[x+2,328]],'#95a58e',2);}
  scene.textures.addCanvas('sky',c);
  const mid=surface(2048,540);const m=mid.g;const r=rng(45);
  for(let row=0;row<3;row++){for(let x=-20;x<2048;){const w=55+r()*50;const base=345+row*36+(r()-.5)*30;const h=48+r()*44;building(m,Math.round(x),base,w,h,{wall:['#c8c2a0','#bbc2a3','#d8c9a7','#b2bea4'][Math.floor(r()*4)],roofColor:['#8d9b83','#a58b73','#6d8980'][Math.floor(r()*3)],floors:1,door:false,seed:x});x+=w+4;}}
  scene.textures.addCanvas('hillside',mid.c);
}

export function createStageArt(scene,stage){
  const key='stage-'+stage.id;if(scene.textures.exists(key))return key;
  const {c,g}=surface(stage.width,540);const w=stage.width;
  if(stage.kind==='interior'){
    drawRoom(g,stage);
  }else if(stage.kind==='shop'){
    rect(g,0,0,w,458,'#e1d6ac');rect(g,0,85,w,24,'#8c9c75');rect(g,0,109,w,5,'#c1bb90');
    // Cubby shelves full of distinct stationery.
    const r=rng(59);for(let x=215;x<1100;x+=270){rect(g,x,150,220,241,'#8e805b');rect(g,x+6,156,208,228,'#bdab7c');for(let row=0;row<3;row++){const yy=180+row*65;for(let j=0;j<12;j++){const bh=23+r()*25;rect(g,x+12+j*16,yy+35-bh,10, bh,['#bd8371','#91a786','#d6c297','#8aa29a','#d6b575'][Math.floor(r()*5)]);rect(g,x+14+j*16,yy+26-bh,6,3,'#eee0af');}rect(g,x+3,yy+36,214,7,'#8f7d55');}}
    rect(g,434,358,155,97,'#a9956b');rect(g,426,352,173,12,'#d7c89b');rect(g,450,374,125,59,'#bbaa7e');rect(g,465,389,95,27,'#7c926b');text(g,'작은 문구점',513,407,12,'#eee2b8');
    rect(g,465,327,47,24,'#72836a');rect(g,473,320,28,18,'#9ab099');rect(g,1215,190,65,266,'#8b9875');windowArt(g,1222,204,48,174);
    for(let x=90;x<w;x+=330){rect(g,x,113,3,21,'#8d9471');rect(g,x-24,135,50,8,'#e3dfb4');rect(g,x-19,142,40,4,'#f7e3a5');}
    ground(g,w,true);pot(g,1170,458,true);
  }else{
    // Trees and retaining walls make each outdoor place part of the same neighborhood.
    rect(g,0,411,w,47,'#a4ae89');for(let x=0;x<w;x+=46){rect(g,x,416,42,15,'#b4b99b');rect(g,x+22,436,40,15,'#899c7b');rect(g,x,413,42,2,'#c8c8a4');}
    const architecture=stageArchitecture(stage);
    for(const b of architecture.buildings)building(g,b.x,b.base,b.w,b.h,{...b,wall:b.wallColor,sign:b.signText});
    for(const t of architecture.trees)tree(g,t.x,t.base,t.size,t.pink);
    if(stage.kind==='town'){
      fence(g,475,416,150);fence(g,1372,416,160);

      lamp(g,565,457);lamp(g,1460,457);pot(g,228,457,true);pot(g,465,457);pot(g,1090,457,true);pot(g,1365,457);
      // Laundry, electric poles, and hand-laid overhead wires.
      line(g,[[480,290],[620,301]],'#718566',2);['#e8ddbf','#8eaaa1','#c99d87'].forEach((color,i)=>{rect(g,494+i*35,293+i*2,23,29,color);rect(g,489+i*35,294+i*2,32,9,color);});
      for(let x=140;x<w;x+=670){rect(g,x,115,9,341,'#a49a72');rect(g,x-21,137,52,7,'#7e896d');rect(g,x-15,126,5,17,'#bdc2a0');rect(g,x+20,126,5,17,'#bdc2a0');g.strokeStyle='#6d7f62';g.lineWidth=1.5;g.beginPath();g.moveTo(x-670,126);g.quadraticCurveTo(x-330,192,x,126);g.stroke();}
    }else if(stage.kind==='park'){
      fence(g,0,397,w);
      rect(g,300,435,770,21,'#d4c49b');rect(g,310,439,750,15,'#dfcda0');
      // Climbing slide, sandbox, bench.
      rect(g,335,299,9,150,'#7a8f69');rect(g,407,299,9,150,'#7a8f69');for(let yy=316;yy<444;yy+=21)rect(g,343,yy,65,5,'#b3b492');rect(g,323,291,110,12,'#a48164');poly(g,[[424,300],[551,440],[535,446],[409,304]],'#ac9171');poly(g,[[432,302],[555,438],[545,443],[421,303]],'#c9b78b');
      rect(g,1100,391,122,10,'#9e8963');rect(g,1100,407,122,9,'#b29a70');rect(g,1098,424,128,9,'#b29a70');rect(g,1110,432,8,24,'#677b5b');rect(g,1203,432,8,24,'#677b5b');
      for(let x=580;x<1080;x+=42){rect(g,x,452,16,2,'#bfae88');}
    }else if(stage.kind==='school'){
      rect(g,900,196,82,185,'#b5b796');rect(g,916,303,52,98,'#637f70');rect(g,940,303,4,98,'#d6cba2');rect(g,916,304,52,6,'#d6cba2');
      rect(g,920,221,38,38,'#ece0b9');line(g,[[939,226],[939,239],[948,244]],'#6c7c60',3);text(g,'배움이 자라는 곳',942,291,13,'#647555');
      fence(g,180,435,410);fence(g,1260,435,310);rect(g,583,338,30,119,'#9b9e7a');rect(g,575,330,46,12,'#bac09a');rect(g,1240,338,30,119,'#9b9e7a');rect(g,1233,330,44,12,'#bac09a');
      pot(g,670,455);pot(g,1160,455,true);
      rect(g,44,320,165,75,'#7e926d');rect(g,50,326,153,63,'#d0d2ac');text(g,'천천히, 함께',127,352,17);text(g,'오늘도 좋은 하루',127,376,11);rect(g,60,395,7,61,'#85916d');rect(g,185,395,7,61,'#85916d');
    }
    ground(g,w);const r=rng(123);for(let i=0;i<w/24;i++){const x=r()*w;rect(g,x,450,3,7,'#7b905e');if(i%5===0)rect(g,x-2,448,6,3,'#e6d4a0');}
    // A subtle path line, not a blocking boundary.
    rect(g,0,495,w,2,'#ded1ad80');
  }
  if(stage.variant==='daeyeon'){rect(g,433,340,154,34,'#aab99a');text(g,'대연동의 골목',510,362,16,'#4d6551');}
  scene.textures.addCanvas(key,c);return key;
}

export function createCharacters(scene){
  const variants={
    child:{hair:'#3f4239',shirt:'#c78860',pants:'#596d61',skin:'#ebc49a'},
    hero:{hair:'#3f4239',shirt:'#c78860',pants:'#596d61',skin:'#ebc49a'},
    brother:{hair:'#454d43',shirt:'#7c94a3',pants:'#596878',skin:'#e9c29a'},
    father:{hair:'#3c433c',shirt:'#77908b',pants:'#4d615b',skin:'#e5bd92'},
    mother:{hair:'#5a493d',shirt:'#be947f',pants:'#6b7761',skin:'#ebc7a1'},
    neighbor:{hair:'#615e4c',shirt:'#9caa7c',pants:'#6b7869',skin:'#d9b991'},
    teen:{hair:'#3d403b',shirt:'#e3dfc3',pants:'#485c58',skin:'#e7c39a'},
    young:{hair:'#3b403b',shirt:'#6e9290',pants:'#535e58',skin:'#e7c39a'},
    adult:{hair:'#393f3b',shirt:'#697b6c',pants:'#4a5553',skin:'#e7c39a'},
    grandma:{hair:'#a8aaa0',shirt:'#9d8f9b',pants:'#6c7769',skin:'#e9c5a0'},
    grandpa:{hair:'#9b9f8b',shirt:'#89926a',pants:'#5d6b60',skin:'#ddba91'},
    friend:{hair:'#4b493b',shirt:'#84a298',pants:'#798a70',skin:'#e8c499'},
    shopkeeper:{hair:'#625341',shirt:'#c09776',pants:'#687962',skin:'#dfb991'}
  };
  const portraits={};
  for(const [key,p] of Object.entries(variants)){
    const {c,g}=surface(32*13,40);g.imageSmoothingEnabled=false;
    for(let f=0;f<13;f++){
      g.save();g.translate(f*32,0);const bob=f===1?1:0;g.translate(0,bob);
      // Sprite pixels deliberately remain single pixels here.
      const r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
      const tall=['teen','young','adult','grandpa','shopkeeper','father','mother','neighbor','brother'].includes(key);const top=tall?1:4;const cy=tall?14:17;
      r(11,top,10,2,p.hair);r(9,top+2,15,7,p.hair);r(8,top+5,17,5,p.hair);r(10,top+7,13,9,p.skin);r(11,top+14,10,3,p.skin);r(9,top+9,2,5,p.skin);r(23,top+9,2,4,p.skin);
      r(10,top+7,3,3,p.hair);r(13,top+7,8,1,'#b58b67');r(15,top+10,1,2,'#3e493c');r(21,top+10,1,2,'#3e493c');r(19,top+14,3,1,'#bf8d70');r(12,top+12,2,2,'#e3ad8b');
      if(f===7){r(18,top+13,1,1,'#ad7b63');r(19,top+14,4,1,'#ad7b63');r(23,top+13,1,1,'#ad7b63');}
      if(f===8){r(19,top+13,3,3,'#a27963');r(20,top+14,1,1,'#ecc79c');}
      if(key==='brother'){r(14,cy+2,5,2,'#d7e1d0');r(12,cy+8,10,2,'#607d91');}
      if(key==='mother'){r(8,top+6,2,13,p.hair);r(23,top+6,3,14,p.hair);}
      if(key==='hero'){r(9,top+8,16,6,'#527e63');r(11,top+9,4,2,'#f3ddb0');r(20,top+9,3,2,'#f3ddb0');r(16,top+6,3,3,'#e0c77b');}
      if(key==='grandma'){r(8,top+1,6,5,p.hair);r(7,top+3,5,4,'#bfc0ae');r(11,top+7,11,2,'#bab9a5');r(11,top+9,6,4,'#777f70');r(18,top+9,6,4,'#777f70');r(12,top+10,4,2,p.skin);r(19,top+10,4,2,p.skin);}
      if(key==='grandpa'){r(8,top+1,16,5,'#879275');r(7,top+5,19,2,'#687b5e');r(11,top+9,6,4,'#77816d');r(18,top+9,6,4,'#77816d');r(12,top+10,4,2,p.skin);r(19,top+10,4,2,p.skin);}
      r(10,cy,14,13,p.shirt);r(12,cy,10,2,'#eed3a6');r(10,cy+4,3,9,p.shirt);r(21,cy+2,3,11,p.shirt);r(13,cy+3,8,10,p.shirt);
      if(key==='child'||key==='hero'){r(14,cy+3,7,3,'#e6c28d');r(17,cy+6,3,3,'#b16b50');r(12,cy+11,12,2,'#aa6d4f');}
      if(['grandma','shopkeeper'].includes(key)){r(14,cy+3,7,12,'#d2c7aa');r(13,cy+10,10,6,'#e0d2b0');r(16,cy+9,4,3,'#a99d84');}
      if(key==='teen'){r(15,cy+2,2,11,'#687d69');r(11,cy+4,2,6,'#5e7565');}
      const walk=f>=2&&f<=5;const swing=walk?[0,2,0,-2][f-2]:0;const jump=f===6;
      r(8,cy+3+swing,3,8,p.shirt);r(8,cy+10+swing,3,3,p.skin);r(24,cy+3-swing,3,8,p.shirt);r(24,cy+10-swing,3,3,p.skin);
      r(12,cy+13,11,5,p.pants);r(12,cy+17,4,jump?2:5+(walk?swing:0),p.pants);r(19,cy+17,4,jump?4:5-(walk?swing:0),p.pants);
      r(10,cy+21+(walk?swing:0)-(jump?3:0),6,3,'#4a4b3d');r(19,cy+21-(walk?swing:0)-(jump?1:0),7,3,'#4a4b3d');r(11,cy+21+(walk?swing:0)-(jump?3:0),4,1,'#ac9c7a');
      if(jump){r(8,cy-1,3,5,p.shirt);r(24,cy-1,3,5,p.shirt);}
      if(f===9||f===10){r(7,cy+8,22,6,'#eee1b6');r(17,cy+8,1,6,'#a49271');r(10,cy+10,5,1,'#899879');r(20,cy+10,5,1,'#899879');r(f===9?23:25,cy+4,2,7,'#c49a5d');}
      if(f===11||f===12){r(5,cy-3,4,10,p.shirt);r(5,cy-6,4,4,p.skin);r(25,f===11?cy+3:cy-5,4,8,p.shirt);r(25,f===11?cy+10:cy-8,4,4,p.skin);}
      g.restore();
    }
    const tex=scene.textures.addCanvas('char-'+key,c);for(let f=0;f<13;f++)tex.add(f,0,f*32,0,32,40);
    scene.anims.create({key:key+'-idle',frames:[{key:'char-'+key,frame:0},{key:'char-'+key,frame:1}],frameRate:1.5,repeat:-1});
    scene.anims.create({key:key+'-read',frames:[9,10].map(f=>({key:'char-'+key,frame:f})),frameRate:3,repeat:-1});
    scene.anims.create({key:key+'-walk',frames:[2,3,4,5].map(f=>({key:'char-'+key,frame:f})),frameRate:9,repeat:-1});
    const portrait=surface(32,40);portrait.g.drawImage(c,0,0,32,40,0,0,32,40);portraits[key]=portrait.c.toDataURL();
  }
  return portraits;
}

export function createObjectArt(scene){
  const specs={photo:[80,133],tv:[105,121],toy:[67,27],desk:[132,104],lamp:[80,190],swing:[170,175],pencil:[100,94],bag:[62,62],portal:[62,103],finish:[74,110]};
  for(const [key,[w,h]] of Object.entries(specs)){
    const {c,g}=surface(w,h);const r=(x,y,a,b,col)=>rect(g,x,y,a,b,col);
    if(key==='photo'){
      r(4,92,72,41,'#9f8760');r(0,87,80,7,'#bc9e6e');r(9,99,62,24,'#af966b');r(33,109,13,3,'#756c4b');
      r(14,2,54,75,'#7d7450');r(18,6,46,67,'#d2ba87');r(22,10,38,59,'#aec2a2');r(24,48,34,21,'#7f9578');r(29,27,10,14,'#e9c49b');r(26,40,16,23,'#939e85');r(43,20,10,14,'#dbb98e');r(40,34,16,28,'#a1887c');r(36,43,8,11,'#e6c194');r(33,52,13,15,'#c7936c');r(12,77,58,7,'#e5ce9e');
    }else if(key==='tv'){
      r(11,82,86,39,'#8e7855');r(8,77,91,7,'#b39b6d');r(20,92,30,14,'#716e51');r(57,92,30,14,'#716e51');
      r(13,18,79,60,'#65765f');r(18,22,56,48,'#b5c6a2');r(21,26,49,39,'#789e91');r(23,29,45,11,'#99b9a0');poly(g,[[23,53],[37,42],[48,51],[58,43],[68,54],[68,65],[23,65]],'#b9c59c');r(79,30,7,7,'#c2c7a4');r(79,44,7,7,'#bfc3a1');r(79,57,7,8,'#3f5949');line(g,[[45,18],[35,2]],'#768368',3);line(g,[[47,18],[60,4]],'#768368',3);
    }else if(key==='toy'){
      r(6,11,53,9,'#c18a5d');r(17,3,27,12,'#cfa578');r(22,5,17,7,'#aec1a3');r(12,19,11,8,'#586752');r(44,19,11,8,'#586752');r(15,21,5,4,'#b4b48d');r(47,21,5,4,'#b4b48d');r(3,11,8,5,'#e4c482');
    }else if(key==='desk'){
      r(5,47,120,10,'#a28b5f');r(11,58,9,46,'#897a55');r(111,58,9,46,'#897a55');r(81,58,30,23,'#b19b6f');r(91,68,10,3,'#776b49');r(19,37,52,8,'#e3dcba');r(46,34,31,5,'#bda87c');r(72,12,7,33,'#7e8c61');r(64,4,25,17,'#b2bc85');r(91,29,19,17,'#ba9870');r(96,16,3,19,'#7e9b74');r(102,12,3,19,'#b88264');
    }else if(key==='lamp'){
      lamp(g,29,190);r(37,28,25,4,'#d8d3aa');
    }else if(key==='swing'){
      line(g,[[15,175],[43,8],[126,8],[157,175]],'#8a8461',7);line(g,[[42,9],[15,175]],'#b49c71',3);r(34,3,104,10,'#a98f64');line(g,[[65,16],[63,128]],'#78866d',2);line(g,[[111,16],[113,128]],'#78866d',2);r(58,128,60,9,'#b08d62');r(58,128,60,3,'#d1b085');r(7,169,17,6,'#6b7f5c');r(148,169,17,6,'#6b7f5c');
    }else if(key==='pencil'){
      r(8,51,85,8,'#ad9263');r(14,59,7,35,'#8e7e55');r(79,59,7,35,'#8e7e55');r(25,21,43,30,'#c6b17e');r(30,25,33,22,'#d9c697');for(let i=0;i<5;i++){r(28+i*7,4+(i%2)*4,3,27,['#b97b5c','#829c7b','#d0b76d','#7f9c91','#b49282'][i]);r(28+i*7,2+(i%2)*4,3,3,'#e5d3a3');}r(55,45,26,5,'#e7ddbd');
    }else if(key==='bag'){
      r(21,4,20,8,'#8a7755');r(25,7,12,4,'#e1cda4');r(10,14,43,42,'#a78056');r(14,16,35,38,'#bb9562');r(14,17,35,14,'#c6a372');r(22,31,19,20,'#9f7e52');r(24,33,15,13,'#c6aa7a');r(29,29,5,6,'#e6d2a5');r(7,23,5,29,'#6e7857');r(52,23,5,29,'#6e7857');r(12,55,39,5,'#8f7753');
    }else{
      r(w/2-4,45,8,h-45,'#8e916c');r(4,12,w-8,42,'#7d8f65');r(8,16,w-16,34,'#c9d0a6');text(g,key==='finish'?'✦':'→',w/2,42,25,'#667b50');r(w/2-10,h-6,20,6,'#a2a582');
    }
    scene.textures.addCanvas('obj-'+key,c);
  }
}

export function createParticleArt(scene){
  const {c,g}=surface(8,8);rect(g,2,0,4,8,'#f7e4ba');rect(g,0,2,8,4,'#f7e4ba');scene.textures.addCanvas('spark',c);
}

export function createNarrativeArt(scene){
 const specs={mask:[80,70],sofa:[340,98],shelf:[114,220],window:[122,140],calendar:[80,132],album:[100,100],chairs:[125,85],notebook:[80,92],workbook:[88,105],eraser:[70,80],cane:[70,132],clock:[80,140],paper:[120,95],door:[120,270],broken:[120,270]};
 for(const [key,[w,h]]of Object.entries(specs)){
  const {c,g}=surface(w,h);const r=(x,y,a,b,col)=>rect(g,x,y,a,b,col);
  if(key==='paper'){r(4,64,112,8,'#a39674');r(12,72,8,23,'#7e8068');r(101,72,8,23,'#7e8068');r(19,22,78,40,'#eee5bf');line(g,[[57,23],[57,61]],'#b7c1a2',2);for(let i=0;i<3;i++)r(92+i*6,7+i*3,4,32,['#a27964','#729585','#d2b578'][i]);}
  else if(['door','broken'].includes(key)){
   r(0,0,w,h,'#796f55');r(7,7,w-14,h-7,'#baab83');r(14,16,91,238,'#ac9871');
   if(key==='door'){r(23,25,72,98,'#b5b899');r(22,137,73,100,'#c0ad82');r(91,141,7,7,'#6f7151');}
   else{poly(g,[[21,23],[91,17],[77,67],[94,107],[63,133],[83,175],[51,225],[23,235],[38,172],[21,137],[39,83]],'#455347');line(g,[[80,23],[62,73],[89,106],[53,133],[67,181],[45,229]],'#6e7055',6);r(15,257,70,10,'#8d7955');}
  }else if(key==='mask'){
   r(36,3,8,4,'#8c7e5e');line(g,[[40,7],[35,23]],'#b0a589',2);r(17,28,48,37,'#487965');r(13,35,56,23,'#639178');r(20,39,14,9,'#efd5a0');r(47,39,14,9,'#efd5a0');r(36,20,8,14,'#e5cc7e');r(30,25,20,6,'#e5cc7e');line(g,[[13,44],[3,35],[4,60],[17,56]],'#bec2a1',2);
  }else if(key==='sofa'){
   r(12,20,314,65,'#849677');r(25,8,286,55,'#b2b99a');r(7,46,26,37,'#8b9d7e');r(310,46,25,37,'#8b9d7e');r(33,57,275,21,'#c0c3a1');for(let x=41;x<300;x+=88)r(x,60,78,15,'#a5b28f');r(28,82,12,16,'#6b7c5e');r(298,82,12,16,'#6b7c5e');
  }else if(key==='shelf'){
   r(4,0,106,h,'#9b8b63');for(let y=14;y<h-32;y+=41){for(let x=12;x<102;x+=15){r(x,y,10,30,['#b69b77','#82977b','#8aa49c'][x%3]);r(x+2,y+4,6,2,'#e9d9ad');}r(9,y+32,97,6,'#786f50');}
  }else if(key==='window'){windowArt(g,8,2,106,126);}
  else if(key==='chairs'){
   for(const x of [3,73]){r(x,13,46,40,'#9e946e');r(x+3,16,40,34,'#b5b294');r(x-2,51,52,9,'#8b8761');r(x+3,60,6,25,'#797c5e');r(x+37,60,6,25,'#797c5e');}
  }else if(key==='cane'){
   r(10,110,50,8,'#8e8a68');r(17,118,6,14,'#6e785a');r(48,118,6,14,'#6e785a');line(g,[[28,105],[42,12]],'#b39767',5);line(g,[[31,105],[45,12]],'#cdb88b',2);r(33,5,23,4,'#c2aa7a');
  }else if(key==='clock'){
   r(8,0,64,94,'#8d8c69');r(15,8,50,49,'#e8dfb8');line(g,[[40,14],[40,32],[56,35]],'#657354',3);r(36,63,7,20,'#b4aa78');r(30,80,20,8,'#d1be86');r(27,94,26,46,'#9ba481');
  }else if(key==='eraser'){
   r(6,62,58,7,'#9a936e');r(12,69,6,11,'#7d815e');r(54,69,6,11,'#7d815e');r(13,34,45,25,'#c99d9a');r(32,34,26,25,'#c8ceaf');r(36,38,18,16,'#7a9683');
  }else{
   r(8,h-25,w-16,7,'#9b9169');r(12,h-18,6,18,'#7d7e5a');r(w-18,h-18,6,18,'#7d7e5a');
   if(key==='calendar'){r(14,9,w-28,80,'#eee0b8');r(14,9,w-28,16,'#9aa781');for(let y=38;y<79;y+=15)for(let x=23;x<w-18;x+=13)r(x,y,6,6,'#a3ae87');}
   else if(key==='album'){r(5,21,42,49,'#c7b27e');r(51,21,42,49,'#dfd2a6');r(10,26,31,31,'#7e9b87');r(57,27,29,31,'#a2b193');r(46,19,5,53,'#917b56');r(14,33,10,15,'#e5c399');r(63,35,10,15,'#dcc096');}
   else{r(12,12,w-24,h-42,key==='workbook'?'#adba93':'#b49c79');r(18,18,w-36,h-54,'#ede2ba');for(let y=28;y<h-40;y+=10)r(24,y,w-48,2,'#a4b08b');r(14,13,3,h-44,'#879474');}
  }
  scene.textures.addCanvas('obj-'+key,c);
 }
 const m=surface(16,10);rect(m.g,0,2,16,7,'#528468');rect(m.g,2,4,4,2,'#f1db9b');rect(m.g,10,4,4,2,'#f1db9b');rect(m.g,7,0,2,4,'#e6cc81');scene.textures.addCanvas('mask-worn',m.c);
}

export function createInteractionArt(scene){
 for(const id of ['drawer','bed','shoes']){const {c,g}=surface(id==='bed'?136:id==='shoes'?80:72,id==='shoes'?94:72);
  if(id==='shoes'){rect(g,3,5,74,85,'#84735b');rect(g,8,10,64,73,'#ae9470');for(const y of [28,56]){rect(g,7,y+17,66,5,'#76654d');for(const x of [15,45]){rect(g,x,y,23,11,'#626857');rect(g,x+9,y-5,12,7,'#717866');rect(g,x,y+10,25,3,'#c4b38e');}}rect(g,9,86,7,8,'#6f6953');rect(g,64,86,7,8,'#6f6953');scene.textures.addCanvas('obj-'+id,c);continue;}
  if(id==='drawer'){rect(g,3,7,66,61,'#735f49');rect(g,7,11,58,53,'#b49b6c');for(let y=15;y<60;y+=23){rect(g,11,y,50,19,'#d0b584');rect(g,31,y+7,10,4,'#7f7958');}rect(g,2,5,68,5,'#e0c798');}
  else{rect(g,4,26,7,46,'#8d795b');rect(g,125,37,7,35,'#8d795b');rect(g,10,43,116,22,'#bba479');rect(g,13,34,109,20,'#d2c7a0');rect(g,16,30,29,13,'#efe4c5');rect(g,52,34,70,20,'#839e91');for(let x=57;x<120;x+=14)rect(g,x,35,3,17,'#b3c5ab');}
  scene.textures.addCanvas('obj-'+id,c);
 }
}

// Single source for interior architecture; never paint a second copy of an interactive shelf.
function drawRoom(g,stage){
 const room=roomLayout(stage),p=room.palette,w=stage.width,floor=ROOM_FLOOR;
 rect(g,0,0,w,floor,p.wall);rect(g,0,0,w,106,p.upper);rect(g,0,103,w,8,p.beam);
 for(let x=18;x<w;x+=46)for(let y=135;y<430;y+=38){rect(g,x,y,2,3,'#8e7c5b18');}
 for(let x=52;x<w;x+=455){rect(g,x,111,8,335,p.beam+'38');}
 rect(g,0,440,w,18,p.skirt);
 for(const v of room.windows){
  windowArt(g,v.x,v.y,v.w,v.h);rect(g,v.x-10,v.y-7,v.w+20,5,p.beam);
  rect(g,v.x-12,v.y,12,v.h+10,'#ece0bd');rect(g,v.x+v.w,v.y,13,v.h+10,'#d9ceb0');
  for(let y=v.y+6;y<v.y+v.h;y+=12){rect(g,v.x-9,y,3,7,'#bfba9d');rect(g,v.x+v.w+4,y,3,7,'#b4b69b');}
 }
 for(const f of room.frames){rect(g,f.x,f.y,f.w,f.h,'#9c8867');rect(g,f.x+5,f.y+5,f.w-10,f.h-10,'#d9c8a2');line(g,[[f.x+13,f.y+f.h-15],[f.x+f.w/2,f.y+18],[f.x+f.w-12,f.y+f.h-15]],'#9eab88',4);}
 if(room.clock){const {x,y}=room.clock;rect(g,x-20,y-20,40,43,'#8c785c');rect(g,x-15,y-15,30,31,'#eee2be');line(g,[[x,y-10],[x,y],[x+9,y+6]],'#6c775d',2);}
 const lamp=room.light;if(lamp){rect(g,lamp.x-1,110,3,lamp.y-110,'#827252');poly(g,[[lamp.x-23,lamp.y],[lamp.x+23,lamp.y],[lamp.x+14,lamp.y-17],[lamp.x-14,lamp.y-17]],'#aa9570');rect(g,lamp.x-17,lamp.y,34,5,'#e5d09d');}
 ground(g,w,true);
 for(const f of room.furniture){const x=f.x-f.w/2,y=floor-f.h;
  if(f.kind==='bench'){rect(g,x+5,y+12,f.w-10,f.h-17,'#8f9b7b');rect(g,x+14,y,f.w-28,45,'#aab395');rect(g,x+12,y+f.h-30,f.w-24,16,'#c1c3a4');rect(g,x+12,floor-10,8,10,'#6d765c');rect(g,x+f.w-20,floor-10,8,10,'#6d765c');}
  else if(f.kind==='shelf'){rect(g,x,y,f.w,f.h,'#938066');for(let yy=y+10;yy<floor-20;yy+=48){for(let xx=x+9;xx<x+f.w-12;xx+=15)rect(g,xx,yy,10,32,'#9baf92');rect(g,x+5,yy+35,f.w-10,5,'#6f7159');}}
  else if(f.kind==='table'){rect(g,x,y,f.w,9,'#bcaa7f');rect(g,x+8,y+9,8,f.h-9,'#82775b');rect(g,x+f.w-16,y+9,8,f.h-9,'#82775b');rect(g,x+25,y-5,25,4,'#dfd8bc');rect(g,x+f.w-46,y-8,13,7,'#9cab92');}
  else{rect(g,x,y,f.w,f.h,'#796d58');rect(g,x+5,y+5,f.w-10,f.h-10,'#a08b6c');rect(g,x+8,y+f.h/2,f.w-16,4,'#655f4f');}
 }
}
