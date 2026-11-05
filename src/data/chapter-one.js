import {REAL_QUOTES,SOURCE_TYPES,OBJECT_TEXT,MEMORY_TEXT,DIALOGUES as NATURAL_DIALOGUES} from './dialogue.js';
// 최신 사용자 기록을 기준으로 합니다. kind는 발화가 아니라 정보의 출처를 뜻합니다.
export const KINDS={fact:'실제 기억',staged:'연출적 재구성',fiction:'창작'};
export const line=(text,kind='fact',speaker='기록',character='adult')=>({text,kind,speaker,character,sourceType:SOURCE_TYPES[kind]});
export const SCENES=[
  {id:1,title:'학장동의 어린 시절 집',stage:'home',goal:'엄마와 인사한 뒤 가족사진을 살펴보세요.',action:'arrival',next:2},
  {id:2,title:'부모님과 함께하는 일상',stage:'home',goal:'엄마와 이야기하고 접힌 종이를 펼쳐 보세요.',action:'mask',next:3},
  {id:3,title:'우하하하! 난 액션가면!',stage:'home',goal:'가면을 쓰고 아버지에게 다가가 ✦ 버튼을 누르세요.',action:'hero',next:4},
  {id:4,title:'시간이 흐른 뒤',stage:'interval',goal:'시간의 책갈피를 조사해 약 1~2년 뒤로 넘어가세요.',action:'interval',next:5},
  {id:5,title:'부서진 방문',stage:'door-home',goal:'방문 쪽으로 다가가세요.',action:'door',next:6},
  {id:6,title:'달라진 가족',stage:'changed-home',goal:'아버지와 이야기한 뒤 사진첩을 살펴보세요.',action:'divorce',next:7},
  {id:7,title:'아버지와 단둘이',stage:'father-home',goal:'아버지와 식사 준비를 하고 달력을 살펴보세요.',action:'father-period',next:8},
  {id:8,title:'새로운 동네, 대연동',stage:'daeyeon',goal:'새 동네를 걸어 조부모님 댁 표지판으로 이동하세요.',action:'daeyeon',next:9},
  {id:9,title:'공부방과 문제집',stage:'study',goal:'할머니·할아버지와 이야기한 뒤 문제집을 펴세요.',action:'study',next:10},
  {id:10,title:'회초리에 관한 기억',stage:'study',goal:'책상 옆 회초리를 살펴보고 책을 덮으세요.',action:'cane',next:11},
  {id:11,title:'현재의 재원',stage:'present',goal:'사진첩에서 기억을 시간 순서대로 정리하세요.',action:'summary',next:12},
  {id:12,title:'다음 이야기',stage:'present-street',goal:'거리 끝의 다음 이야기 표지판을 살펴보세요.',action:'finish',next:null}
];
export const PROLOGUE={id:0,title:'사진첩의 첫 장',stage:'present',goal:'사진첩에 다가가 첫 장을 펼치세요.'};
export function sceneById(id){return id===0?PROLOGUE:SCENES.find(s=>s.id===id)||PROLOGUE;}
export const OPENING=[
 {tag:'PROLOGUE · 2026',title:'사진첩의 첫 장',text:'책장 안쪽에서 사진첩을 찾았다.\n먼지가 묻은 표지를 손으로 쓸어 본다.\n한 장만, 더 펼쳐 볼까.',kind:'staged',sourceType:'dramatic_reconstruction',button:'첫 장 펼치기'},
 {tag:'BUSAN · 1997. 01. 26.',title:'부산에서 시작된 이야기',text:'1997년 1월 26일, 부산에서 태어났다.\n사진 속 작은 아이를 따라가면\n어느새 학장동의 거실에 닿는다.',kind:'staged',sourceType:'dramatic_reconstruction',button:'거실로 들어가기'}
];
export const FACTS={
  family:'어린 재원은 부산 사하구 학장동에서 아버지, 어머니와 함께 생활했습니다. 지역 표기는 제공된 기록을 따르며 실제 주소는 재현하지 않습니다.',
  hero:'부모님이 거실에서 TV를 보고 있을 때, 재원은 액션가면이 그려진 종이가면을 쓰고 포즈를 취했습니다. 아버지는 장난스럽게 재원의 바지를 내리며 웃었습니다. 가족이 함께 웃었던 실제 기억입니다.',
  interval:'액션가면 사건으로부터 약 1~2년이 흐른 뒤 방문 파손 사건이 일어났습니다. 정확한 연도와 당시 나이는 확인되지 않았습니다.',
  door:'아버지가 어머니가 있는 방문을 발로 세게 찼고, 그 충격으로 방문이 부서졌습니다. 어린 재원은 이 장면을 현장에서 직접 목격했습니다. 전해 들은 이야기가 아닙니다.',
  divorce:'방문 파손 사건 이후 얼마 지나지 않아 부모님이 이혼했습니다. 사건의 원인, 당시 가족의 대화, 이혼의 구체적인 사유와 절차는 제공되지 않았습니다. 두 사건 사이의 시간 순서를 이혼의 단일한 원인으로 단정하지 않습니다.',
  father:'부모님의 이혼 이후 약 1~2년 동안 재원은 아버지와 단둘이 생활했습니다. 이 시기의 구체적인 사건, 대화, 생활 분위기와 다음 거처로 이동한 이유는 아직 제공되지 않았습니다.',
  daeyeon:'아버지와 단둘이 지낸 시기 이후 부산 남구 대연동의 조부모님 댁으로 거처를 옮겼습니다. 학장동에서 조부모님과 함께 살았던 것으로 묘사하지 않습니다.',
  study:'조부모님은 공부에 매우 엄격했습니다. 재원은 집에서 공부를 많이 해야 했습니다. 문제를 여러 개 틀리면 심하게 혼났고, 회초리로 체벌을 받기도 했습니다.',
  cane:'회초리 체벌은 실제로 제공된 경험입니다. 구체적인 횟수, 욕설, 상해는 제공되지 않았습니다. 모든 일상이 체벌이었다고 확대하지 않으며 체벌을 좋은 교육 방식으로 정당화하지 않습니다.'
};
// 액션가면의 두 직접 대사입니다. 새 현관 장면의 지정 문구는 별도 재구성 데이터로 관리합니다.
export const QUOTES=REAL_QUOTES;
export const EVENT_RECORDS=[
  {id:'arrival',scene:1,kinds:['fact','staged','fiction'],fact:'family'},
  {id:'brother-paper',scene:null,kinds:['staged','fiction'],fact:null,sourceType:'dramatic_reconstruction',residence:null,ageGap:null,personality:null,witnessOf:[]},
  {id:'mask',scene:2,kinds:['fact','staged'],fact:'hero'},
  {id:'hero',scene:3,kinds:['fact','staged','fiction'],fact:'hero',quotes:QUOTES},
  {id:'interval',scene:4,kinds:['fact','staged'],fact:'interval'},
  {id:'door',scene:5,kinds:['fact','staged'],fact:'door',witness:'direct',cause:null,childEmotion:null},
  {id:'divorce',scene:6,kinds:['fact','staged'],fact:'divorce',cause:null},
  {id:'father-period',scene:7,kinds:['fact','staged'],fact:'father',duration:'약 1~2년',specificEvents:[]},
  {id:'daeyeon',scene:8,kinds:['fact','staged'],fact:'daeyeon'},
  {id:'study',scene:9,kinds:['fact','staged','fiction'],fact:'study'},
  {id:'cane',scene:10,kinds:['fact','staged'],fact:'cane',injury:null,count:null},
  {id:'summary',scene:11,kinds:['staged'],fact:null},
  {id:'finish',scene:12,kinds:['staged'],fact:null}
];
const memory=(id,title,place,symbol,text,kind='fact')=>({id,title,place,symbol,text:MEMORY_TEXT[id],recollection:MEMORY_TEXT[id],sourceNote:text,kinds:[...new Set([kind,'staged'])],sourceTypes:[...new Set([SOURCE_TYPES[kind],'dramatic_reconstruction'])]});
export const MEMORIES=[
  memory('family','함께 살았던 학장동의 집','학장동 부모님 집','▣',FACTS.family),
  memory('hero','액션가면의 추억','학장동 거실','✦',FACTS.hero),
  memory('interval','약 1~2년 뒤의 책갈피','학장동의 같은 집','◷',FACTS.interval),
  memory('door','직접 목격한 부서진 방문','학장동의 같은 집','▥',FACTS.door),
  memory('family-change','달라진 가족의 구성','사진첩의 다음 장','◇',FACTS.divorce),
  memory('father','아버지와 단둘이 지낸 시간','아버지와 보낸 시간','▱',FACTS.father),
  memory('daeyeon','대연동으로 옮긴 거처','부산 남구 대연동','⌂',FACTS.daeyeon),
  memory('workbook','공부가 중심이던 집','대연동 공부방','▤',FACTS.study),
  memory('cane','회초리에 관한 기억','대연동 공부방','╱',FACTS.cane),
  memory('tv','거실의 텔레비전','학장동 거실','▤','부모님이 텔레비전을 보고 있었다는 것은 실제 기억입니다. TV의 외형과 화면 속 풍경은 새로 그린 연출이며 실제 방송 화면은 사용하지 않았습니다.'),
  memory('toy','작은 장난감의 자리','학장동 집','♜','집을 탐험하기 위해 더한 창작 사물입니다. 이 장난감을 실제로 소유했다는 기록이나 구체적인 놀이 사건을 뜻하지 않습니다.','fiction'),
  memory('lamp','골목의 가로등','학장동 동네 맵','♧','두 집 사이의 시간을 천천히 생각해 보는 창작 탐험 공간입니다. 이 가로등이나 이 길에서 실제로 일어난 사건을 주장하지 않습니다.','fiction'),
  memory('swing','그네 옆의 여백','선택 탐험 놀이터','♧','빈 그네를 바라보는 선택 탐험입니다. 실제로 제공되지 않은 친구와의 약속이나 놀이 사건을 인생의 사실로 추가하지 않습니다.','fiction'),
  memory('pencil','연필을 고르는 페이지','선택 탐험 문구점','✎','물건을 자세히 보는 창작 탐험입니다. 공부방의 연필과 이 문구점을 실제 구매 경험으로 연결하지 않습니다.','fiction'),
  memory('desk','공부책상에 남긴 기록','대연동 공부방','▱','공부를 많이 해야 했던 생활환경은 실제 기록입니다. 책상의 크기, 위치와 물건의 배치는 연출적 재구성입니다.'),
  memory('brother','종이 한 장을 사이에 두고','종이 사이의 작은 풍경','▱','형이 있다는 가족관계만 확인되었습니다. 이 종이놀이는 극적 재구성이며 동거 시기·나이 차이·성격과 실제 특정 사건을 확정하지 않습니다.','staged'),
  memory('album','순서대로 놓은 기억','2026년의 사진첩','▣','부모님과 함께 살던 시절 → 함께 웃은 기억 → 약 1~2년 뒤 방문 파손 목격 → 얼마 후 이혼 → 아버지와 약 1~2년 → 대연동 조부모님 댁. 확인된 순서를 바꾸지 않고 정리한 사진첩입니다.','staged')
];

const objectMeta=[
  {
    "id": "photo",
    "title": "가족사진",
    "art": "photo",
    "memory": "family",
    "kinds": [
      "fact",
      "staged"
    ]
  },
  {
    "id": "tv",
    "title": "텔레비전",
    "art": "tv",
    "memory": "tv",
    "kinds": [
      "fact",
      "staged"
    ]
  },
  {
    "id": "toy",
    "title": "장난감",
    "art": "toy",
    "memory": "toy",
    "kinds": [
      "fiction",
      "staged"
    ]
  },
  {
    "id": "sofa",
    "title": "거실 소파",
    "art": "sofa",
    "memory": null,
    "kinds": [
      "staged",
      "staged"
    ]
  },
  {
    "id": "shoes",
    "title": "신발장",
    "art": "shelf",
    "memory": null,
    "kinds": [
      "fiction",
      "staged"
    ]
  },
  {
    "id": "window",
    "title": "창문",
    "art": "window",
    "memory": null,
    "kinds": [
      "staged",
      "staged"
    ]
  },
  {
    "id": "mask",
    "title": "종이가면",
    "art": "mask",
    "memory": null,
    "kinds": [
      "fact",
      "staged"
    ]
  },
  {
    "id": "plain-door",
    "title": "아직 닫힌 방문",
    "art": "door",
    "memory": null,
    "kinds": [
      "staged",
      "staged"
    ]
  },
  {
    "id": "calendar",
    "title": "낡은 달력",
    "art": "calendar",
    "memory": "interval",
    "kinds": [
      "fact",
      "staged"
    ]
  },
  {
    "id": "broken-door",
    "title": "갈라진 방문",
    "art": "broken",
    "memory": null,
    "kinds": [
      "fact",
      "staged"
    ]
  },
  {
    "id": "family-record",
    "title": "사진첩의 빈자리",
    "art": "album",
    "memory": "family-change",
    "kinds": [
      "fact",
      "staged"
    ]
  },
  {
    "id": "two-chairs",
    "title": "두 사람의 자리",
    "art": "chairs",
    "memory": null,
    "kinds": [
      "fact",
      "staged"
    ]
  },
  {
    "id": "father-record",
    "title": "넘겨진 달력",
    "art": "calendar",
    "memory": "father",
    "kinds": [
      "fact",
      "staged"
    ]
  },
  {
    "id": "blank-note",
    "title": "빈 공책",
    "art": "notebook",
    "memory": null,
    "kinds": [
      "staged",
      "staged"
    ]
  },
  {
    "id": "new-town",
    "title": "새 동네의 풍경",
    "art": "album",
    "memory": "daeyeon",
    "kinds": [
      "fact",
      "staged"
    ]
  },
  {
    "id": "desk",
    "title": "공부책상",
    "art": "desk",
    "memory": "desk",
    "kinds": [
      "fact",
      "staged"
    ]
  },
  {
    "id": "workbook",
    "title": "문제집",
    "art": "workbook",
    "memory": "workbook",
    "kinds": [
      "fact",
      "staged"
    ]
  },
  {
    "id": "study-pencil",
    "title": "연필",
    "art": "pencil",
    "memory": null,
    "kinds": [
      "staged",
      "staged"
    ]
  },
  {
    "id": "eraser",
    "title": "지우개",
    "art": "eraser",
    "memory": null,
    "kinds": [
      "staged",
      "staged"
    ]
  },
  {
    "id": "clock",
    "title": "시계",
    "art": "clock",
    "memory": null,
    "kinds": [
      "staged",
      "staged"
    ]
  },
  {
    "id": "books",
    "title": "책장",
    "art": "shelf",
    "memory": null,
    "kinds": [
      "staged",
      "staged"
    ]
  },
  {
    "id": "cane",
    "title": "회초리",
    "art": "cane",
    "memory": "cane",
    "kinds": [
      "fact",
      "staged"
    ]
  },
  {
    "id": "study-end",
    "title": "책 덮기",
    "art": "notebook",
    "memory": null,
    "kinds": [
      "staged",
      "staged"
    ]
  },
  {
    "id": "album",
    "title": "현재의 사진첩",
    "art": "album",
    "memory": "album",
    "kinds": [
      "staged",
      "staged"
    ]
  },
  {
    "id": "lamp",
    "title": "가로등",
    "art": "lamp",
    "memory": "lamp",
    "kinds": [
      "fiction",
      "staged"
    ]
  },
  {
    "id": "swing",
    "title": "그네",
    "art": "swing",
    "memory": "swing",
    "kinds": [
      "fiction",
      "staged"
    ]
  },
  {
    "id": "pencil",
    "title": "문구점의 연필",
    "art": "pencil",
    "memory": "pencil",
    "kinds": [
      "fiction",
      "staged"
    ]
  },
  {
    "id": "bag",
    "title": "학교 가방",
    "art": "bag",
    "memory": null,
    "kinds": [
      "fiction",
      "staged"
    ]
  },
  {
    "id": "folded-paper",
    "title": "접힌 종이",
    "art": "paper",
    "memory": null,
    "kinds": [
      "staged",
      "fiction"
    ]
  },
  {
    "id": "brother-paper",
    "title": "종이와 색연필",
    "art": "paper",
    "memory": null,
    "kinds": [
      "staged",
      "fiction"
    ]
  }
];
export const OBJECTS=Object.fromEntries(objectMeta.map(o=>[o.id,{...o,sourceType:'dramatic_reconstruction',lines:OBJECT_TEXT[o.id]}]));


// Optional everyday props are staged interactions, not additional biographical facts.
OBJECTS.shoes.art='shoes';
OBJECTS.drawer={id:'drawer',title:'작은 서랍',art:'drawer',sourceType:'dramatic_reconstruction',kinds:['staged','fiction'],lines:[{speaker:'재원',character:'child',text:'뭐가 들어 있을까?',sourceType:'fictional_dialogue'}]};
OBJECTS.bed={id:'bed',title:'잠깐 쉬기',art:'bed',sourceType:'dramatic_reconstruction',kinds:['staged','fiction'],lines:[{speaker:'재원',character:'child',text:'눈 좀 붙였다가 다시 일어날까.',sourceType:'fictional_dialogue'}]};
for(const [id,interaction]of Object.entries({tv:'television',toy:'toy',photo:'photo',desk:'read',drawer:'drawer',bed:'rest',books:'read',workbook:'read'}))OBJECTS[id].interaction=interaction;

const object=(id,x,key,extra={})=>({id,x,label:OBJECTS[key].title,type:'object',object:key,art:OBJECTS[key].art,...extra});
const event=(id,x,label,action,art='finish')=>({id,x,label,type:'event',event:action,art});
const npc=(id,x,label,character,dialogue,kind='fact')=>({id,x,label:label.replace(' · 창작',''),type:'npc',character,dialogue,kinds:[kind,'staged'],sourceType:'fictional_dialogue'});
const portal=(id,x,label,target,spawn)=>({id,x,label,type:'portal',target,spawn});
const homeProps=()=>[object('photo',170,'photo'),object('toy',360,'toy'),object('sofa',660,'sofa',{scale:.85}),object('tv',900,'tv'),object('mask',485,'mask',{mount:'wall',y:310}),object('shoes',1050,'shoes'),object('drawer',1150,'drawer'),object('plain-door',1390,'plain-door')];
export const STAGES=[
  {id:'brother-room',name:'막간 · 종이 한 장',location:'시기와 거처를 지정하지 않는 막간',year:'기억 사이',width:1180,spawn:230,kind:'interior',variant:'brother',music:'childhood',sourceType:'dramatic_reconstruction',entities:[npc('brother',650,'형','brother','brother','staged'),object('brother-paper',460,'brother-paper',{action:'brother-fold'}),event('brother-exit',1040,'다시 사진 속으로','brother-exit','portal')]},
  {id:'home',name:'학장동 · 부모님과 살던 집',location:'부산 사하구 학장동',year:'어린 시절',width:1580,spawn:250,kind:'interior',variant:'family',music:'childhood',entities:[...homeProps(),npc('father',620,'아버지','father','father'),npc('mother',790,'어머니','mother','mother'),object('folded-paper',1270,'folded-paper',{action:'brother-enter',scale:.8}),portal('out',1510,'동네 둘러보기','alley',150)]},
  {id:'interval',name:'학장동 · 같은 집',location:'부산 사하구 학장동',year:'약 1~2년 뒤',width:1360,spawn:340,kind:'interior',variant:'interval',music:'quiet',entities:[object('calendar',820,'calendar',{action:'interval'}),object('window',460,'window',{mount:'wall',y:300})]},
  {id:'door-home',name:'학장동 · 방문 앞',location:'부산 사하구 학장동',year:'어린 시절',width:1360,spawn:900,kind:'interior',variant:'tension',music:'quiet',entities:[npc('father-door',1060,'아버지','father','doorFather'),event('door',1215,'방문 · 목격한 기억','door','door')]},
  {id:'farewell',name:'학장동 · 집 현관',location:'현관 · 작별의 장면',year:'어린 시절',width:1200,spawn:685,kind:'interior',variant:'farewell',music:'quiet',transient:true,entities:[object('farewell-toy',550,'toy'),object('farewell-tv',420,'tv'),npc('farewell-mother',800,'엄마','mother','mother'),event('farewell-door',900,'현관문','farewell','door')]},
  {id:'changed-home',name:'달라진 가족',location:'학장동 시절 이후의 기록',year:'얼마 지나지 않아',width:1360,spawn:400,kind:'interior',variant:'changed',music:'quiet',entities:[object('family-record',850,'family-record',{action:'divorce'}),object('broken-door',1215,'broken-door'),npc('father-changed',590,'아버지','father','fatherChanged')]},
  {id:'father-home',name:'아버지와 단둘이',location:'거처 미상 · 상징적 공간',year:'약 1~2년 동안',width:1200,spawn:250,kind:'interior',variant:'father-only',music:'alone',entities:[object('bed',120,'bed'),object('two-chairs',400,'two-chairs'),npc('father-alone',570,'아버지','father','fatherAlone'),object('father-record',780,'father-record'),object('blank-note',990,'blank-note'),event('father-next',1120,'집 밖으로','father-period')]},
  {id:'daeyeon',name:'대연동 · 새로운 동네',location:'부산 남구 대연동',year:'그 시기 이후',width:1480,spawn:160,kind:'town',variant:'daeyeon',music:'quiet',entities:[object('new-town',350,'new-town'),npc('daeyeon-neighbor',660,'익명의 이웃 · 창작','neighbor','daeyeonNeighbor','fiction'),object('window',860,'window',{mount:'wall',y:250,scale:.46,buildingId:'daeyeon:house:1'}),event('grandparents-home',1300,'조부모님 댁으로','daeyeon','portal')]},
  {id:'study',name:'대연동 · 조부모님 댁 공부방',location:'부산 남구 대연동',year:'어린 시절',width:1660,spawn:230,kind:'interior',variant:'study',music:'study',entities:[object('desk',380,'desk',{action:'study'}),object('workbook',540,'workbook'),npc('grandma',690,'할머니','grandma','grandma'),object('eraser',840,'eraser'),object('study-pencil',980,'study-pencil'),npc('grandpa',1100,'할아버지','grandpa','grandpa'),object('cane',1230,'cane',{action:'cane'}),object('clock',1400,'clock',{mount:'wall',y:310}),event('study-end',1550,'공부의 페이지 닫기','study-end','notebook'),object('books',90,'books')]},
  {id:'present',name:'현재 · 사진첩 앞',location:'현재의 방 · 연출',year:'2026',width:1200,spawn:300,kind:'interior',variant:'present',player:'adult',music:'present',entities:[event('album',650,'사진첩 펼치기','album','album'),object('note-present',1100,'blank-note'),object('folded-paper-present',920,'folded-paper',{action:'brother-enter'})]},
  {id:'present-street',name:'현재 · 다음 이야기로',location:'현재의 거리 · 연출',year:'2026',width:1250,spawn:230,kind:'town',variant:'present',player:'adult',music:'present',entities:[event('finish',1090,'다음 이야기','finish'),object('present-lamp',660,'lamp')]},
  {id:'alley',name:'학장동 골목',location:'학장동 · 창작 배경',year:'어린 시절',width:1680,spawn:150,kind:'town',music:'childhood',entities:[portal('back',70,'부모님 집으로','home',1310),npc('neighbor',430,'골목의 이웃 · 창작','neighbor','neighbor','fiction'),object('lamp',920,'lamp'),portal('out',1550,'놀이터로','playground',150)]},
  {id:'playground',name:'작은 놀이터',location:'창작 탐험 공간',year:'어린 시절',width:1350,spawn:150,kind:'park',music:'school',entities:[portal('back',70,'골목으로','alley',1440),npc('friend',420,'동네 아이 · 창작','friend','friend','fiction'),object('swing',780,'swing'),portal('out',1240,'문구점으로','store',150)]},
  {id:'store',name:'문구점',location:'창작 탐험 공간',year:'어린 시절',width:1260,spawn:150,kind:'shop',music:'school',entities:[portal('back',70,'놀이터로','playground',1130),npc('shopkeeper',480,'문구점 주인 · 창작','shopkeeper','shopkeeper','fiction'),object('pencil',820,'pencil'),portal('out',1150,'학교 앞으로','school',150)]},
  {id:'school',name:'학교 앞',location:'창작 탐험 공간',year:'어린 시절',width:1400,spawn:150,kind:'school',music:'school',entities:[portal('back',70,'문구점으로','store',1040),object('bag',850,'bag'),portal('homeward',1250,'집으로 돌아가기','home',1310)]}
];
export const DIALOGUES=NATURAL_DIALOGUES;

EVENT_RECORDS.push({id:'mother-farewell',scene:6,kinds:['staged'],fact:null,sourceType:'dramatic_reconstruction'});
for(const event of EVENT_RECORDS){event.sourceTypes=event.kinds.map(k=>SOURCE_TYPES[k]);}
