// Coordinates are world pixels. Furniture uses the shared floor; windows stay on the wall.
export const ROOM_FLOOR=458;
const warm={wall:'#ded0b0',upper:'#bcad8d',beam:'#968267',skirt:'#9f896a',floor:'#b79c74'};
const quiet={...warm,wall:'#bdc4b7',upper:'#9ca99c',beam:'#738477'};
export const ROOM_LAYOUTS={
 home:{palette:warm,windows:[{x:250,y:160,w:176,h:132}],clock:{x:1190,y:161},light:{x:720,y:158},frames:[{x:610,y:174,w:70,h:66}],furniture:[]},
 interval:{palette:warm,windows:[],clock:{x:1050,y:164},light:{x:720,y:158},frames:[],furniture:[]},
 'door-home':{palette:quiet,windows:[{x:280,y:160,w:160,h:130}],clock:{x:900,y:160},light:{x:720,y:158},frames:[],furniture:[]},
 'changed-home':{palette:quiet,windows:[{x:280,y:160,w:160,h:130}],clock:{x:1050,y:161},light:{x:720,y:158},frames:[],furniture:[{id:'low-bench',kind:'bench',x:320,w:220,h:80}]},
 'father-home':{palette:quiet,windows:[{x:250,y:160,w:150,h:130}],clock:{x:910,y:161},light:{x:620,y:158},frames:[],furniture:[{id:'meal-table',kind:'table',x:560,w:126,h:72}]},
 'brother-room':{palette:{...warm,wall:'#c9cdbb'},windows:[{x:230,y:157,w:160,h:130}],clock:null,light:{x:600,y:158},frames:[],furniture:[{id:'background-shelf',kind:'shelf',x:870,w:100,h:200}]},
 study:{palette:warm,windows:[{x:740,y:154,w:160,h:128},{x:1080,y:154,w:130,h:128}],clock:null,light:{x:630,y:158},frames:[{x:240,y:172,w:64,h:60}],furniture:[]},
 present:{palette:quiet,windows:[{x:260,y:154,w:176,h:132},{x:780,y:154,w:170,h:132}],clock:{x:1060,y:162},light:{x:620,y:158},frames:[],furniture:[{id:'reading-bench',kind:'bench',x:290,w:240,h:86}]},
 farewell:{palette:{...warm,wall:'#a9ada0',upper:'#8b9689',beam:'#6a776a'},windows:[{x:260,y:158,w:150,h:126}],clock:null,light:{x:720,y:158},frames:[],furniture:[{id:'entry-shoes',kind:'rack',x:1040,w:80,h:86}]}
};
export function roomLayout(stage){return ROOM_LAYOUTS[typeof stage==='string'?stage:stage.id]||null;}
export function decorationBounds(room){return (room?.furniture||[]).map(f=>({...f,left:f.x-f.w/2,right:f.x+f.w/2,top:ROOM_FLOOR-f.h,bottom:ROOM_FLOOR,role:'decoration'}));}
export function overlaps(a,b,epsilon=1){return Math.min(a.right,b.right)-Math.max(a.left,b.left)>epsilon&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>epsilon;}
