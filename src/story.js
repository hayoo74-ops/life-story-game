// 사실 기록과 창작 연출을 분리합니다. 아래 인물 대사는 모두 게임을 위한 창작입니다.
export const PROTAGONIST = {
  name: '안재원', birth: '1997-01-26', birthplace: '부산광역시',
  adultHeight: 174, appearance: {child:'child', teen:'teen', youngAdult:'young', adult:'adult'}
};
export const CHAPTERS = [
  {id:1,year:'1997 —',title:'부산에서 시작된 이야기',status:'playable',description:'작은 골목, 그리고 나를 품어 준 사람들'},
  {id:2,year:'성장기',title:'성장과 학교생활',status:'planned',description:'학교생활과 국제신문 명예학생기자단'},
  {id:3,year:'2020 — 2025',title:'새로운 시작',status:'planned',description:'검정고시 합격부터 한양사이버대학교 졸업까지'},
  {id:4,year:'2019 —',title:'사랑이라는 새로운 이야기',status:'planned',description:'2019년 8월 25일, 김서린과 시작한 이야기'},
  {id:5,year:'사회생활',title:'사회생활의 시작',status:'planned',description:'여러 일터에서 쌓아 온 경험들'},
  {id:6,year:'2026',title:'갈등과 선택',status:'planned',description:'주인공의 시점에서 되돌아보는 삶의 전환점'},
  {id:7,year:'2025 — 2026',title:'여행과 일상의 행복',status:'planned',description:'오사카, 마쓰야마, 후쿠오카, 기타큐슈'},
  {id:8,year:'2026 —',title:'아직 끝나지 않은 이야기',status:'planned',description:'나의 이야기는 아직 끝나지 않았다.'}
];
export const FACTS = [
  '안재원은 1997년 1월 26일 부산광역시에서 태어났다.',
  '어린 시절 부모님의 이혼을 경험했으며 조부모님의 보살핌 속에서 성장했다.',
  '학장동에서 성장했다. 게임에서는 행정구를 확정하지 않고 부산 학장동으로 표기한다.'
];
export const OPENING = [
  {tag:'PROLOGUE · 2026',title:'사진첩의 첫 장',text:'현재의 재원이 오래된 사진첩을 펼친다.\n손끝에 닿은 사진 한 장.\n잊은 줄 알았던 골목의 온기가 번진다.',button:'사진을 들여다본다'},
  {tag:'BUSAN · 1997. 01. 26.',title:'부산에서,\n하나의 이야기가 시작됐다.',text:'1997년 1월 26일.\n안재원이 부산에서 태어났다.\n도시의 아침 위로, 작은 삶의 첫 페이지가 열린다.',button:'그 시절로 걸어가기'},
  {tag:'CHAPTER 01 · 어린 시절',title:'나를 품어 준 작은 세계',text:'시간이 흘러, 어린 재원의 동네.\n가족의 모습은 달라졌지만\n곁을 지켜 준 조부모님의 온기가 있었다.\n이제, 익숙한 집에서 하루를 시작해 보자.',button:'기억 속으로',note:'출생과 가족 배경은 제공된 기록에 바탕을 두었습니다.\n장소의 모습, 일상 장면, 모든 대사는 창작 연출입니다.'}
];
export const MEMORIES = [
  {id:'photo',title:'오래된 가족사진',place:'어린 시절 집',symbol:'▣',text:'사진 속 얼굴들을 한참 바라본다. 가족의 모습은 달라졌어도, 어린 나를 돌봐 준 손길은 마음에 남아 있다.',recollection:'낡은 사진의 모서리는 닳아 있었다.\n그 안의 온기까지 닳아 없어지지는 않았다.'},
  {id:'tv',title:'작은 텔레비전',place:'어린 시절 집',symbol:'▤',text:'저녁이면 집 안에 번지던 텔레비전 소리. 특별한 일이 없어도 누군가와 나란히 앉아 있던 시간이 소중했다.',recollection:'화면에는 작은 빛들이 일렁였다.\n방 안에는 혼자가 아니라는 편안함이 있었다.'},
  {id:'toy',title:'손때 묻은 장난감',place:'어린 시절 집',symbol:'♜',text:'작은 장난감으로도 커다란 세계를 만들 수 있었다. 어린 시절의 상상력을 담은 기억의 조각.',recollection:'작은 바퀴가 굴러가던 자리.\n그때는 방 한 칸도 끝없는 모험의 무대였다.'},
  {id:'desk',title:'창가의 책상',place:'어린 시절 집',symbol:'▱',text:'창가로 들어오던 햇볕, 종이에 남은 연필 자국. 무언가를 천천히 배워 가던 시간을 떠올린다.',recollection:'삐뚤빼뚤한 글씨를 쓰던 손.\n모르는 것을 하나씩 알아 가던 마음.'},
  {id:'lamp',title:'골목의 가로등',place:'부산 동네 골목',symbol:'♧',text:'해가 기울면 골목에 불빛이 켜진다. 집으로 향하는 길을 조용히 밝혀 주던 작은 등대.',recollection:'하나둘 불이 켜지면,\n골목은 집으로 돌아가는 길이 되었다.'},
  {id:'swing',title:'빈 그네의 오후',place:'작은 놀이터',symbol:'♧',text:'오르락내리락하던 그네와 모래 위의 발자국. 아무것도 서두르지 않아도 좋았던 오후의 풍경.',recollection:'조금 높이 올라가면,\n늘 보던 동네도 새로운 풍경이 되었다.'},
  {id:'pencil',title:'작은 연필 한 자루',place:'문구점',symbol:'✎',text:'문구점에 놓인 알록달록한 물건들. 작은 연필 한 자루를 고르던 설렘을 떠올리는 조각.',recollection:'무엇을 고를까 오래 망설였다.\n작은 물건에도 마음을 가득 담던 시절.'},
  {id:'bag',title:'학교 가방',place:'학교 앞 거리',symbol:'▥',text:'배움과 만남을 향해 메던 가방. 아직 쓰이지 않은 수많은 페이지가 앞에 기다리고 있다.',recollection:'가방 안에는 책과 공책,\n그리고 이름 붙이지 못한 기대가 담겨 있었다.'}
];

export const STAGES = [
  {id:'home',name:'어린 시절 집',year:'어린 시절',width:1360,spawn:280,kind:'interior',music:'childhood',
    entities:[
      {id:'family-photo',x:190,label:'가족사진',type:'memory',memory:'photo',art:'photo'},
      {id:'grandma',x:490,label:'할머니',type:'npc',character:'grandma',dialogue:'grandma'},
      {id:'television',x:700,label:'텔레비전',type:'memory',memory:'tv',art:'tv'},
      {id:'toy-car',x:865,label:'장난감',type:'memory',memory:'toy',art:'toy'},
      {id:'writing-desk',x:1050,label:'책상',type:'memory',memory:'desk',art:'desk'},
      {id:'exit',x:1250,label:'골목으로',type:'portal',target:'alley',spawn:150}
    ]},
  {id:'alley',name:'부산 동네 골목',year:'어린 시절',width:1880,spawn:150,kind:'town',music:'childhood',
    entities:[
      {id:'back',x:70,label:'집으로',type:'portal',target:'home',spawn:1150},
      {id:'grandpa',x:520,label:'할아버지',type:'npc',character:'grandpa',dialogue:'grandpa'},
      {id:'streetlamp',x:960,label:'가로등',type:'memory',memory:'lamp',art:'lamp'},
      {id:'exit',x:1750,label:'놀이터로',type:'portal',target:'playground',spawn:150}
    ]},
  {id:'playground',name:'작은 놀이터',year:'어린 시절',width:1500,spawn:150,kind:'park',music:'school',
    entities:[
      {id:'back',x:70,label:'골목으로',type:'portal',target:'alley',spawn:1640},
      {id:'neighbor',x:440,label:'동네 아이',type:'npc',character:'friend',dialogue:'friend'},
      {id:'swing-set',x:780,label:'그네',type:'memory',memory:'swing',art:'swing'},
      {id:'exit',x:1370,label:'문구점으로',type:'portal',target:'store',spawn:150}
    ]},
  {id:'store',name:'작은 문구점',year:'어린 시절',width:1310,spawn:150,kind:'shop',music:'school',
    entities:[
      {id:'back',x:70,label:'놀이터로',type:'portal',target:'playground',spawn:1270},
      {id:'shopkeeper',x:500,label:'문구점 주인',type:'npc',character:'shopkeeper',dialogue:'shopkeeper'},
      {id:'pencil-box',x:845,label:'연필',type:'memory',memory:'pencil',art:'pencil'},
      {id:'exit',x:1190,label:'학교 앞으로',type:'portal',target:'school',spawn:150}
    ]},
  {id:'school',name:'학교 앞 거리',year:'어린 시절',width:1650,spawn:150,kind:'school',music:'school',
    entities:[
      {id:'back',x:70,label:'문구점으로',type:'portal',target:'store',spawn:1080},
      {id:'school-friend',x:540,label:'동네 아이',type:'npc',character:'friend',dialogue:'schoolFriend'},
      {id:'schoolbag',x:900,label:'학교 가방',type:'memory',memory:'bag',art:'bag'},
      {id:'school-gate',x:1350,label:'다음 페이지',type:'event',event:'finish'}
    ]}
];

export const DIALOGUES = {
  grandma: ({events}) => events.includes('greet-grandma') ? [
    {speaker:'할머니',character:'grandma',text:'천천히 둘러보고 오렴. 네가 돌아올 집은 여기 있으니까.'},
    {speaker:'안재원',character:'child',text:'네! 동네를 걷다가 학교 앞까지 가 볼게요.'}
  ] : [
    {speaker:'할머니',character:'grandma',text:'재원아, 잘 잤니? 창문으로 햇볕이 참 곱게 들어오는구나.'},
    {speaker:'안재원',character:'child',text:'할머니, 오늘은 동네를 좀 둘러보고 싶어요.'},
    {speaker:'할머니',character:'grandma',text:'그래. 익숙한 길에서도 새로운 걸 만날 수 있지. 나가기 전에 뭘 하고 싶니?',choices:[
      {label:'사진을 보고 싶어요',lines:[{speaker:'할머니',character:'grandma',text:'저기 가족사진이 있단다. 오래된 사진에는 그때의 마음도 함께 남아 있는 것 같아.'}]},
      {label:'다녀와서 이야기할래요',lines:[{speaker:'할머니',character:'grandma',text:'좋지. 네가 보고 온 것들을 나에게도 들려주렴. 함께 들으면 내 추억도 될 테니까.'}]}
    ]},
    {speaker:'할머니',character:'grandma',text:'학교 앞까지 천천히 걸어 보렴. 길 건널 땐 꼭 주위를 살피고. 잘 다녀와, 재원아.'}
  ],
  grandpa: ({events}) => [
    {speaker:'할아버지',character:'grandpa',text:'재원이로구나. 오늘 골목은 어때 보이니?'},
    {speaker:'안재원',character:'child',text:'맨날 보던 길인데, 천천히 보니까 조금 달라 보여요.'},
    {speaker:'할아버지',character:'grandpa',text:events.includes('chapter-1-complete')?'잘 둘러보고 왔구나. 앞으로도 네 속도로 걸어가면 된단다.':'그렇지. 서두르지 않아도 된단다. 저쪽 놀이터도 한번 둘러보렴.'}
  ],
  friend: () => [
    {speaker:'동네 아이',character:'friend',text:'안녕! 잠깐 쉬었다 갈래? 그네가 비어 있어.'},
    {speaker:'안재원',character:'child',text:'여기는 시간이 조금 천천히 가는 것 같아.'},
    {speaker:'동네 아이',character:'friend',text:'그럼 오늘은 뭐 하고 놀까?',choices:[
      {label:'하늘을 올려다볼래',lines:[{speaker:'안재원',character:'child',text:'구름이 아주 멀리 가네. 저 구름은 어디까지 갈까?'}]},
      {label:'그네를 구경할래',lines:[{speaker:'동네 아이',character:'friend',text:'줄을 잡고 하늘 쪽으로! 조금만 높아져도 세상이 달라 보여.'}]}
    ]},
    {speaker:'동네 아이',character:'friend',text:'다음에 또 보자. 저 길을 따라가면 문구점이야.'}
  ],
  shopkeeper: () => [
    {speaker:'문구점 주인',character:'shopkeeper',text:'어서 오렴. 구경은 천천히 해도 괜찮아.'},
    {speaker:'안재원',character:'child',text:'연필도 공책도, 다 다른 이야기가 들어 있을 것 같아요.'},
    {speaker:'문구점 주인',character:'shopkeeper',text:'아직은 빈 공책이지. 앞으로 네가 채워 넣으면 된단다. 저쪽 연필도 한번 살펴보렴.'}
  ],
  schoolFriend: () => [
    {speaker:'동네 아이',character:'friend',text:'여기까지 왔네! 저기 학교 앞이야.'},
    {speaker:'안재원',character:'child',text:'집에서 여기까지, 참 많은 게 있었구나.'},
    {speaker:'동네 아이',character:'friend',text:'가방도 살펴보고, 오른쪽 길의 ‘다음 페이지’로 가 봐. 오늘의 이야기가 기다릴 거야.'}
  ]
};

export function stageById(id){return STAGES.find(s=>s.id===id) || STAGES[0];}
export function memoryById(id){return MEMORIES.find(m=>m.id===id);}
