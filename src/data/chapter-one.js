// 최신 사용자 기록을 기준으로 합니다. kind는 발화가 아니라 정보의 출처를 뜻합니다.
export const KINDS={fact:'실제 기억',staged:'연출적 재구성',fiction:'창작'};
export const line=(text,kind='fact',speaker='기록',character='adult')=>({text,kind,speaker,character});
export const SCENES=[
  {id:1,title:'학장동의 어린 시절 집',stage:'home',goal:'가족사진을 살펴보며 이 집의 첫 페이지를 여세요.',action:'arrival',next:2},
  {id:2,title:'부모님과 함께하는 일상',stage:'home',goal:'거실을 둘러본 뒤 종이가면을 찾아 착용하세요.',action:'mask',next:3},
  {id:3,title:'우하하하! 난 액션가면!',stage:'home',goal:'가면을 쓰고 아버지에게 다가가 ✦ 버튼을 누르세요.',action:'hero',next:4},
  {id:4,title:'시간이 흐른 뒤',stage:'interval',goal:'시간의 책갈피를 조사해 약 1~2년 뒤로 넘어가세요.',action:'interval',next:5},
  {id:5,title:'부서진 방문',stage:'door-home',goal:'방문에 다가가 직접 목격한 기억을 확인하세요.',action:'door',next:6},
  {id:6,title:'달라진 가족',stage:'changed-home',goal:'가족 구성의 변화를 담은 기록을 살펴보세요.',action:'divorce',next:7},
  {id:7,title:'아버지와 단둘이',stage:'father-home',goal:'약 1~2년의 기록을 확인한 뒤 다음 기억으로 이동하세요.',action:'father-period',next:8},
  {id:8,title:'새로운 동네, 대연동',stage:'daeyeon',goal:'새 동네를 걸어 조부모님 댁 표지판으로 이동하세요.',action:'daeyeon',next:9},
  {id:9,title:'공부방과 문제집',stage:'study',goal:'공부책상에서 문제집을 살펴보세요.',action:'study',next:10},
  {id:10,title:'회초리에 관한 기억',stage:'study',goal:'회초리의 기록을 확인하고 공부의 페이지를 닫으세요.',action:'cane',next:11},
  {id:11,title:'현재의 재원',stage:'present',goal:'사진첩에서 기억을 시간 순서대로 정리하세요.',action:'summary',next:12},
  {id:12,title:'다음 이야기',stage:'present-street',goal:'거리 끝의 다음 이야기 표지판을 살펴보세요.',action:'finish',next:null}
];
export const PROLOGUE={id:0,title:'사진첩의 첫 장',stage:'present',goal:'사진첩에 다가가 첫 장을 펼치세요.'};
export function sceneById(id){return id===0?PROLOGUE:SCENES.find(s=>s.id===id)||PROLOGUE;}
export const OPENING=[
  {tag:'PROLOGUE · 2026',title:'사진첩의 첫 장',text:'현재의 재원이 사진첩을 펼칩니다.\n이 사진첩과 현재의 방은 기억을 따라가기 위한 연출입니다.\n그 안에 담는 사건은 재원이 직접 제공한 기록을 따릅니다.',kind:'staged',button:'첫 기록 펼치기'},
  {tag:'BUSAN · 1997. 01. 26.',title:'부산에서 시작된 이야기',text:'안재원은 1997년 1월 26일 부산에서 태어났습니다.\n이제 부모님과 함께 살았던 학장동 시절로 갑니다.\n당시 나이와 사건의 정확한 연도는 지정하지 않습니다.',kind:'fact',button:'학장동의 집으로'}
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
// 실제로 제공된 직접 대사는 이 두 문장뿐입니다.
export const QUOTES={child:'우하하하! 난 액션가면!',father:'액션가면은 빤쓰만 입고 있는다.'};
export const EVENT_RECORDS=[
  {id:'arrival',scene:1,kinds:['fact','staged'],fact:'family'},
  {id:'mask',scene:2,kinds:['fact','staged'],fact:'hero'},
  {id:'hero',scene:3,kinds:['fact','staged'],fact:'hero',quotes:QUOTES},
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
const memory=(id,title,place,symbol,text,kind='fact')=>({id,title,place,symbol,text,recollection:text,kinds:[kind,'staged']});
export const MEMORIES=[
  memory('family','함께 살았던 학장동의 집','학장동 부모님 집','▣',FACTS.family),
  memory('hero','액션가면의 추억','학장동 거실','✦',FACTS.hero),
  memory('interval','약 1~2년 뒤의 책갈피','학장동의 같은 집','◷',FACTS.interval),
  memory('door','직접 목격한 부서진 방문','학장동의 같은 집','▥',FACTS.door),
  memory('family-change','달라진 가족의 구성','가족 변화의 기록','◇',FACTS.divorce),
  memory('father','아버지와 단둘이 지낸 시간','상징적으로 재구성한 공간','▱',FACTS.father),
  memory('daeyeon','대연동으로 옮긴 거처','부산 남구 대연동','⌂',FACTS.daeyeon),
  memory('workbook','공부가 중심이던 집','대연동 공부방','▤',FACTS.study),
  memory('cane','회초리에 관한 기억','대연동 공부방','╱',FACTS.cane),
  memory('tv','거실의 텔레비전','학장동 거실','▤','부모님이 텔레비전을 보고 있었다는 것은 실제 기억입니다. TV의 외형과 화면 속 풍경은 새로 그린 연출이며 실제 방송 화면은 사용하지 않았습니다.'),
  memory('toy','작은 장난감의 자리','학장동 집','♜','집을 탐험하기 위해 더한 창작 사물입니다. 이 장난감을 실제로 소유했다는 기록이나 구체적인 놀이 사건을 뜻하지 않습니다.','fiction'),
  memory('lamp','골목의 가로등','학장동 동네 맵','♧','두 집 사이의 시간을 천천히 생각해 보는 창작 탐험 공간입니다. 이 가로등이나 이 길에서 실제로 일어난 사건을 주장하지 않습니다.','fiction'),
  memory('swing','그네 옆의 여백','선택 탐험 놀이터','♧','빈 그네를 바라보는 선택 탐험입니다. 실제로 제공되지 않은 친구와의 약속이나 놀이 사건을 인생의 사실로 추가하지 않습니다.','fiction'),
  memory('pencil','연필을 고르는 페이지','선택 탐험 문구점','✎','물건을 자세히 보는 창작 탐험입니다. 공부방의 연필과 이 문구점을 실제 구매 경험으로 연결하지 않습니다.','fiction'),
  memory('desk','공부책상에 남긴 기록','대연동 공부방','▱','공부를 많이 해야 했던 생활환경은 실제 기록입니다. 책상의 크기, 위치와 물건의 배치는 연출적 재구성입니다.'),
  memory('album','순서대로 놓은 기억','2026년의 사진첩','▣','부모님과 함께 살던 시절 → 함께 웃은 기억 → 약 1~2년 뒤 방문 파손 목격 → 얼마 후 이혼 → 아버지와 약 1~2년 → 대연동 조부모님 댁. 확인된 순서를 바꾸지 않고 정리한 사진첩입니다.','staged')
];

function reflection(id,title,art,intro,detail,alternative,memoryId=null,kind='staged'){
  return {id,title,art,memory:memoryId,kinds:[kind,'staged'],lines:[line(intro,kind),{
    ...line('지금 이 사물을 어떤 관점에서 더 살펴볼까요?','staged','현재의 시선'),choiceId:id,
    choices:[{label:'기록의 맥락을 읽는다',lines:[line(detail,kind)]},{label:'남겨 둔 여백을 살핀다',lines:[line(alternative,'staged')]}]
  }]};
}
export const OBJECTS=Object.fromEntries([
  reflection('photo','가족사진','photo',FACTS.family,'첫 집의 가족 구성은 아버지·어머니·재원입니다. 이후의 대연동 생활과 구분해 기록합니다. 사진 속 얼굴은 실제 사진을 복원한 것이 아니라 일반적인 픽셀 인물입니다.','실제 사진의 촬영 시점과 촬영 장소는 제공되지 않았습니다. 이 액자는 가족 구성을 이해하도록 놓은 장치이며 사진 촬영 사건을 추가하지 않습니다.','family','fact'),
  reflection('tv','텔레비전','tv','액션가면의 기억에서 부모님은 거실에 앉아 TV를 보고 있었습니다.','이때 재원은 종이가면을 쓰고 부모님 앞에 섰습니다. TV는 그 기억 속 공간을 연결하는 사물입니다. 어떤 방송을 보고 있었는지와 TV 기종은 확정하지 않습니다.','화면에는 저작권이 있는 만화 장면 대신 직접 그린 산과 하늘을 넣었습니다. 원작 명칭을 기록하는 것과 원작 이미지를 복제하는 것은 구분했습니다.','tv','fact'),
  reflection('toy','장난감','toy','거실 바닥에 작은 장난감을 배치했습니다. 탐험을 위한 창작 사물입니다.','이 사물은 기억 사이에서 잠시 머물 자리를 만듭니다. 어떤 장난감을 가지고 놀았는지는 아직 기록이 없습니다. 실제 경험을 추가할 때 이 데이터를 교체할 수 있습니다.','비어 있는 기록을 억지로 채우지 않는 것도 이 사진첩을 만드는 방식입니다. 장난감에 얽힌 사건을 확인한 뒤에만 실제 기억으로 바꿉니다.','toy','fiction'),
  reflection('sofa','거실 소파','sofa','부모님이 함께 TV를 보고 있던 장면을 위한 자리입니다.','부모님이 거실에서 TV를 보았다는 사실을 배치로 표현했습니다. 소파의 유무·색·모양은 확인되지 않았기 때문에 화면의 가구는 연출입니다.','같은 공간을 두 번 돌아보더라도 한 장면이 다른 장면의 의미를 지워 버리지는 않습니다. 웃었던 사건과 이후에 목격한 사건을 각각 기록합니다.'),
  reflection('shoes','신발장','shelf','현관과 거실의 경계를 보여 주는 신발장입니다.','학장동의 집 안을 직접 걸어 보기 위한 창작 배치입니다. 신발의 주인이나 누군가가 집을 나간 날, 돌아온 시간을 이 사물로 추측하지 않습니다.','실제 집의 평면도나 주소는 제공되지 않았습니다. 화면 속 출입구 위치를 실제 주거지의 정보로 이해하지 않도록 기록의 표식을 남깁니다.',null,'fiction'),
  reflection('window','창문','window','창문 너머로 부산의 주거지역을 재구성했습니다.','배경의 집과 산은 한 도시의 분위기를 담은 그림입니다. 정확한 전망·층수·주택 형태를 사실로 확정하지 않습니다.','집 밖 골목·놀이터·문구점은 선택 탐험 공간입니다. 거기에 등장하는 익명의 인물을 실제로 만난 사람이라고 기록하지 않습니다.'),
  reflection('mask','종이가면','mask','재원은 액션가면이 그려진 종이가면을 쓰고 있었습니다.','실제 기억에는 원작 캐릭터가 등장합니다. 게임에서는 그 이름을 대사에 남기고, 가면의 그림은 초록색 별 무늬의 독창적인 영웅으로 새로 만들었습니다.','가면을 쓰는 애니메이션과 거실에서 걷는 동작은 장면을 연결하는 연출입니다. 당시 나이와 정확한 포즈의 각도까지 사실로 단정하지 않습니다.',null,'fact'),
  reflection('plain-door','아직 닫힌 방문','door','같은 집 안의 방문입니다. 처음 장면에서는 아직 파손 사건 이전입니다.','가족이 함께 웃은 기억과 방문 파손은 약 1~2년의 간격을 둡니다. 두 사건을 같은 날의 일처럼 이어 붙이지 않습니다.','문 앞을 살펴본다는 선택만으로 이후 사건이 발생하지 않습니다. 시간의 책갈피를 넘긴 뒤에만 다음 시기의 기록으로 이동합니다.'),
  reflection('calendar','시간의 책갈피','calendar',FACTS.interval,'달력에는 특정 연도나 나이를 인쇄하지 않았습니다. 확인된 것은 두 사건 사이에 약 1~2년이 흘렀다는 상대적인 기간입니다.','기억 사이의 빈 시간을 새로운 사건으로 메우지 않습니다. 화면의 빛이 바뀌고 같은 집이 다시 나타나는 것은 시간 전환을 위한 연출입니다.','interval','fact'),
  reflection('broken-door','방문에 남은 기록','broken',FACTS.door,'목격한 당사자가 어린 재원이라는 사실을 명시합니다. 아버지와 어머니가 무엇을 말했는지, 왜 사건이 일어났는지는 기록하지 않습니다.','문 조각과 충격음, 낮은 시점의 카메라는 연출적 재구성입니다. 인물의 부상이나 추가 폭력, 당시 아이의 행동·감정은 덧붙이지 않습니다.',null,'fact'),
  reflection('family-record','가족 구성의 변화','album',FACTS.divorce,'이혼 직후의 생활은 조부모님 댁으로 바로 연결되지 않습니다. 다음 장면에는 아버지와 단둘이 지낸 약 1~2년이 별도의 구간으로 들어갑니다.','이혼 과정의 법적 절차, 마지막 대화, 누가 어떤 감정을 느꼈는지는 확인되지 않았습니다. 등장인물 구성과 페이지 전환으로만 변화를 나타냅니다.','family-change','fact'),
  reflection('two-chairs','두 사람의 자리','chairs',FACTS.father,'두 개의 의자는 두 사람이 함께 생활했다는 사실만을 보여 주는 상징입니다. 당시 거처의 실제 가구와 배치를 재현한 것은 아닙니다.','행복했다거나 방치되었다고 판정하지 않습니다. 아버지와 어떤 대화를 나눴는지와 대연동으로 옮긴 이유도 제공되지 않은 채로 남깁니다.',null,'fact'),
  reflection('father-record','약 1~2년의 기록','calendar',FACTS.father,'이 기간은 가족 구성의 변화를 이해하는 데 필요한 독립된 시기입니다. 부모님의 이혼과 조부모님 댁 생활 사이에서 생략하지 않습니다.','추후 실제 일상 기록을 받으면 이 시기의 오브젝트와 사건을 추가할 수 있습니다. 지금은 확인되지 않은 사건으로 플레이 시간을 채우지 않습니다.','father','fact'),
  reflection('blank-note','아직 쓰지 않은 기록','notebook','이 시기의 구체적인 일상은 아직 제공되지 않았습니다.','장소와 사물은 사건의 증거가 아닙니다. 배경에 그려진 식탁, 문, 창문을 근거로 실제 가족의 생활 방식을 추론하지 않습니다.','빈 기록을 비극이나 행복으로 단정하는 대신 여백으로 둡니다. 나중에 확인된 사실을 추가할 수 있는 페이지입니다.',null,'staged'),
  reflection('new-town','대연동의 기록','album',FACTS.daeyeon,'학장동 집과 대연동 조부모님 댁은 별개의 맵입니다. 이동한 정확한 날짜와 이동 과정은 재현하지 않습니다.','두 지역의 색감과 길의 모습이 다른 것은 장소를 구분하기 위한 그림입니다. 실제 동·호수나 주택 주소는 추가하지 않습니다.','daeyeon','fact'),
  reflection('desk','공부책상','desk',FACTS.study,'책상은 엄격한 공부 중심의 생활을 이해하는 출발점입니다. 공부 시간의 분 단위 일정이나 성적, 당시 과목은 제공되지 않았습니다.','많이 공부했던 사실을 표현하면서도 모든 하루가 똑같았다고 단정하지 않습니다. 다음의 문제는 체험을 위해 새로 만든 예시이며 실제 시험이 아닙니다.','desk','fact'),
  reflection('workbook','문제집','workbook','문제를 여러 개 틀리면 심하게 혼났다는 기록이 있습니다.','틀린 답을 고른 플레이어를 벌주는 시스템으로 만들지 않습니다. 학습 결과를 평가하는 게임이 아니라 당시 생활환경을 이해하는 장면입니다.','문제집에 적힌 문항, 점수와 날짜는 재현하지 않습니다. 실제 회초리 체벌의 횟수나 신체 상해도 알 수 없는 사실로 남깁니다.','workbook','fact'),
  reflection('study-pencil','연필','pencil','공부방의 연필은 공부 중심의 생활을 표현하는 연출 사물입니다.','연필의 모양이나 구매 장소는 확인되지 않았습니다. 문구점 탐험에서 보았던 물건과 실제 이 연필의 소유 이력을 연결하지 않습니다.','작은 사물에 오래 머물 수 있지만 그 시간이 실제 기억을 대신 만들지는 않습니다. 확인된 생활환경과 배경 소품의 경계를 남깁니다.'),
  reflection('eraser','지우개','eraser','지우개는 답을 고쳐 볼 수 있게 놓인 연출 사물입니다.','문제를 많이 틀렸을 때 심하게 혼났다는 기록을 다루지만, 실수가 체벌을 받아야 할 이유라는 메시지는 전하지 않습니다.','현재의 플레이어는 맞히든 틀리든, 풀이를 건너뛰든 같은 기록으로 이어집니다. 일부러 오답을 골라야만 이야기가 열리는 구조가 아닙니다.'),
  reflection('clock','시계','clock','많이 공부해야 했던 생활을 보여 주기 위한 시계입니다.','몇 시부터 몇 시까지 공부했는지와 매일의 정확한 일정은 제공되지 않았습니다. 시곗바늘을 사실적인 공부 시간표로 사용하지 않습니다.','강제 대기를 통해 공부의 시간을 흉내 내지 않습니다. 기록을 읽고 머무를 속도는 지금 플레이어가 고릅니다.'),
  reflection('books','책장','shelf','공부방에 책장을 배치했습니다. 구체적인 책 목록은 창작 배치입니다.','어떤 책을 몇 권 읽었는지, 어떤 과목을 잘했는지, 성적이 이후의 진로를 결정했는지는 이 어린 시절 기록에 없습니다.','책장에 새 자료가 들어갈 자리를 남겼습니다. 확인된 학업의 다음 사건들은 후속 챕터에서 별도로 다루며 이 시절과 임의로 연결하지 않습니다.',null,'staged'),
  reflection('cane','회초리','cane',FACTS.cane,'재원은 문제를 여러 개 틀리면 심하게 혼났으며 회초리로 체벌을 받기도 했다고 설명했습니다. 이 사실을 단순한 코믹한 공부 장면으로 축소하지 않습니다.','화면에서는 회초리의 상징만 보여 줍니다. 때리는 동작이나 신체 상해를 추가하지 않으며, 당시의 구체적인 욕설·횟수·감정을 대신 만들어 내지 않습니다.','cane','fact'),
  reflection('study-end','공부의 페이지 닫기','notebook','공부 장면을 마친 뒤 현재의 사진첩으로 돌아갈 수 있습니다.','한 장면이 끝났다고 해서 어린 시절의 모든 하루가 설명된 것은 아닙니다. 엄격한 양육의 경험과 아직 기록되지 않은 일상을 구분해 둡니다.','현재로 돌아오는 화면은 연출적 재구성입니다. 과거의 재원이 그때 어떤 결론을 내렸는지나 가족을 어떻게 평가했는지는 지정하지 않습니다.'),
  reflection('album','현재의 사진첩','album','2026년 현재의 사진첩에서 기록을 다시 펼칩니다.','사건을 하나의 원인과 결과로 단순화하지 않고 순서대로 놓습니다. 서로 다른 시기의 생활과 두 개의 상대적인 1~2년 간격을 구별합니다.','현재의 방과 사진첩은 연출입니다. 이 선택은 기억을 읽는 방식이며 실제 현재의 주거지나 마음 상태를 주장하지 않습니다.','album','staged'),
  reflection('lamp','가로등','lamp','동네의 길을 살펴보는 선택 탐험입니다.','여기서 만나는 이웃은 창작 배경 인물입니다. 실제 인맥이나 당시의 대화를 추가하지 않습니다.','주요 사건을 바로 이어 보고 싶다면 집으로 돌아가 시간의 책갈피를 사용할 수 있습니다. 모든 탐험 사물을 수집할 필요는 없습니다.','lamp','fiction'),
  reflection('swing','그네','swing','작은 놀이터는 기억 사이를 걸을 수 있도록 더한 창작 맵입니다.','그네를 타며 나눴던 실제 대화나 친구의 신원을 만들지 않습니다. 여기서는 배경과 기록의 차이를 생각하며 잠시 머물 수 있습니다.','같은 지도를 다시 방문해도 진행이 되돌아가지 않습니다. 이 탐험은 가족의 실제 사건 순서를 바꾸지 않습니다.','swing','fiction'),
  reflection('pencil','문구점의 연필','pencil','알록달록한 연필을 살펴보는 선택 탐험입니다.','이 문구점의 위치와 주인은 창작입니다. 실제로 어떤 문구점을 다녔는지, 무엇을 구매했는지는 확인되지 않았습니다.','기억의 조각에는 실제 기억과 창작이 각각 표시됩니다. 수집했다고 해서 이 연필 구매가 실제 사건으로 바뀌지는 않습니다.','pencil','fiction'),
  reflection('bag','학교 가방','bag','후속 이야기로 이어질 배움의 상징입니다.','학교 앞 거리는 선택 탐험 맵입니다. 특정 학교의 이름이나 재학 연도, 실제 교우관계를 이 배경에서 확정하지 않습니다.','성장과 학교생활, 명예학생기자단의 기록은 준비 중인 챕터 2에서 다룹니다. 이 가방으로 후속 챕터가 완성된 것으로 표시하지 않습니다.',null,'fiction')
].map(o=>[o.id,o]));

const object=(id,x,key,extra={})=>({id,x,label:OBJECTS[key].title,type:'object',object:key,art:OBJECTS[key].art,...extra});
const event=(id,x,label,action,art='finish')=>({id,x,label,type:'event',event:action,art});
const npc=(id,x,label,character,dialogue,kind='fact')=>({id,x,label,type:'npc',character,dialogue,kinds:[kind,'staged']});
const portal=(id,x,label,target,spawn)=>({id,x,label,type:'portal',target,spawn});
const homeProps=()=>[object('photo',170,'photo'),object('toy',360,'toy'),object('sofa',660,'sofa'),object('tv',720,'tv'),object('mask',890,'mask'),object('shoes',1070,'shoes'),object('plain-door',1240,'plain-door')];
export const STAGES=[
  {id:'home',name:'학장동 · 부모님과 살던 집',location:'부산 사하구 학장동',year:'어린 시절 · 연도 미상',width:1480,spawn:250,kind:'interior',variant:'family',music:'childhood',entities:[...homeProps(),npc('father',620,'아버지','father','father'),npc('mother',790,'어머니','mother','mother'),portal('out',1410,'동네 둘러보기','alley',150)]},
  {id:'interval',name:'학장동 · 같은 집',location:'부산 사하구 학장동',year:'약 1~2년 뒤',width:1360,spawn:340,kind:'interior',variant:'interval',music:'quiet',entities:[object('calendar',820,'calendar',{action:'interval'}),object('window',460,'window')]},
  {id:'door-home',name:'학장동 · 방문 앞',location:'부산 사하구 학장동',year:'연도·나이 미상',width:1360,spawn:900,kind:'interior',variant:'tension',music:'quiet',entities:[npc('father-door',1060,'아버지','father','doorFather'),event('door',1215,'방문 · 목격한 기억','door','door')]},
  {id:'changed-home',name:'달라진 가족',location:'학장동 시절 이후의 기록',year:'얼마 지나지 않아',width:1360,spawn:400,kind:'interior',variant:'changed',music:'quiet',entities:[object('family-record',850,'family-record',{action:'divorce'}),object('broken-door',1215,'broken-door'),npc('father-changed',590,'아버지','father','fatherChanged')]},
  {id:'father-home',name:'아버지와 단둘이',location:'거처 미상 · 상징적 공간',year:'약 1~2년 동안',width:1200,spawn:250,kind:'interior',variant:'father-only',music:'quiet',entities:[object('two-chairs',400,'two-chairs'),npc('father-alone',570,'아버지','father','fatherAlone'),object('father-record',780,'father-record'),object('blank-note',990,'blank-note'),event('father-next',1120,'다음 거처의 기록','father-period')]},
  {id:'daeyeon',name:'대연동 · 새로운 동네',location:'부산 남구 대연동',year:'그 시기 이후',width:1480,spawn:160,kind:'town',variant:'daeyeon',music:'quiet',entities:[object('new-town',350,'new-town'),npc('daeyeon-neighbor',660,'익명의 이웃 · 창작','neighbor','daeyeonNeighbor','fiction'),object('window',920,'window'),event('grandparents-home',1300,'조부모님 댁으로','daeyeon','portal')]},
  {id:'study',name:'대연동 · 조부모님 댁 공부방',location:'부산 남구 대연동',year:'연도·나이 미상',width:1660,spawn:230,kind:'interior',variant:'study',music:'study',entities:[object('desk',380,'desk',{action:'study'}),object('workbook',540,'workbook'),npc('grandma',690,'할머니','grandma','grandma'),object('eraser',840,'eraser'),object('study-pencil',980,'study-pencil'),npc('grandpa',1100,'할아버지','grandpa','grandpa'),object('cane',1230,'cane',{action:'cane'}),object('clock',1400,'clock'),event('study-end',1550,'공부의 페이지 닫기','study-end','notebook'),object('books',90,'books')]},
  {id:'present',name:'현재 · 사진첩 앞',location:'현재의 방 · 연출',year:'2026',width:1200,spawn:300,kind:'interior',variant:'present',player:'adult',music:'childhood',entities:[event('album',650,'사진첩 펼치기','album','album'),object('note-present',990,'blank-note')]},
  {id:'present-street',name:'현재 · 다음 이야기로',location:'현재의 거리 · 연출',year:'2026',width:1250,spawn:230,kind:'town',variant:'present',player:'adult',music:'childhood',entities:[event('finish',1090,'다음 이야기','finish'),object('present-lamp',660,'lamp')]},
  {id:'alley',name:'학장동 동네 · 선택 탐험',location:'학장동 · 창작 배경',year:'어린 시절 · 연도 미상',width:1680,spawn:150,kind:'town',music:'childhood',entities:[portal('back',70,'부모님 집으로','home',1310),npc('neighbor',430,'골목의 이웃 · 창작','neighbor','neighbor','fiction'),object('lamp',920,'lamp'),portal('out',1550,'놀이터로','playground',150)]},
  {id:'playground',name:'놀이터 · 선택 탐험',location:'창작 탐험 공간',year:'연도 미상',width:1350,spawn:150,kind:'park',music:'school',entities:[portal('back',70,'골목으로','alley',1440),npc('friend',420,'동네 아이 · 창작','friend','friend','fiction'),object('swing',780,'swing'),portal('out',1240,'문구점으로','store',150)]},
  {id:'store',name:'문구점 · 선택 탐험',location:'창작 탐험 공간',year:'연도 미상',width:1260,spawn:150,kind:'shop',music:'school',entities:[portal('back',70,'놀이터로','playground',1130),npc('shopkeeper',480,'문구점 주인 · 창작','shopkeeper','shopkeeper','fiction'),object('pencil',820,'pencil'),portal('out',1150,'학교 앞으로','school',150)]},
  {id:'school',name:'학교 앞 · 선택 탐험',location:'창작 탐험 공간',year:'연도 미상',width:1400,spawn:150,kind:'school',music:'school',entities:[portal('back',70,'문구점으로','store',1040),object('bag',850,'bag'),portal('homeward',1250,'집으로 돌아가기','home',1310)]}
];
export const DIALOGUES={
  father:()=>[line('이 집에서 아버지와 어머니, 어린 재원이 함께 생활했습니다.','fact','기록 · 아버지','father'),line('아버지의 실제 말로 확인된 문장은 액션가면 장면에서만 재생합니다. 다른 대화를 가족의 실제 발언으로 만들지 않습니다.','staged')],
  mother:()=>[line('액션가면 사건 당시 어머니는 아버지와 거실에서 TV를 보고 있었습니다.','fact','기록 · 어머니','mother'),line('어머니가 당시 어떤 말을 했는지, 어떤 표정을 지었는지는 제공되지 않았습니다. 이 인물의 위치와 일반적인 외형은 연출입니다.','staged')],
  doorFather:()=>[line('아버지가 방문을 발로 차서 부쉈고 어린 재원이 직접 목격한 사건입니다.','fact','기록 · 아버지','father'),line('사건의 원인이나 가족 사이의 말은 추가하지 않습니다. 오른쪽 방문을 조사하면 목격한 기억이 재생됩니다.','staged')],
  fatherChanged:()=>[line(FACTS.divorce,'fact','가족 변화의 기록','father'),line('다음 장면은 조부모님 댁이 아니라 아버지와 단둘이 지냈던 시기입니다.','fact')],
  fatherAlone:()=>[line(FACTS.father,'fact','아버지와 단둘이','father'),line('확인되지 않은 행복, 방치, 폭력, 대화 또는 이동 이유를 이 인물에게 부여하지 않습니다. 두 사람의 구성만을 남겨 둡니다.','staged')],
  grandma:()=>[line('조부모님은 공부에 매우 엄격했습니다. 재원은 집에서 공부를 많이 해야 했습니다.','fact','기록 · 할머니','grandma'),line('구체적으로 누가 어떤 말을 했는지와 체벌을 행한 사람의 개별 역할은 제공되지 않았습니다. 할머니의 실제 대사로 욕설이나 꾸중을 창작하지 않습니다.','staged')],
  grandpa:()=>[line('문제를 여러 개 틀리면 심하게 혼났고 회초리로 체벌을 받기도 했다는 기록입니다.','fact','기록 · 할아버지','grandpa'),line('조부모님과의 모든 일상이 체벌이었다고 확대하지 않습니다. 엄격했던 성장 환경을 표현하되 교육적 미덕으로 정당화하지 않습니다.','staged')],
  neighbor:()=>[line('안녕하세요. 이 골목에서는 천천히 걸어도 괜찮아요. 저쪽에 작은 놀이터가 있어요.','fiction','골목의 이웃','neighbor'),line('이 인물은 창작 배경 NPC이며 재원이 실제로 만났던 사람을 재현한 것은 아닙니다.','staged')],
  friend:()=>[line('그네 옆에서 잠깐 쉬었다 갈래? 멀리 가고 싶으면 오른쪽으로 길이 이어져.','fiction','동네 아이','friend'),line('이 대화는 창작입니다. 어린 재원의 실제 친구나 당시의 감정을 대신 정하지 않습니다.','staged')],
  shopkeeper:()=>[line('어서 오세요. 연필과 공책은 천천히 둘러봐도 좋아요.','fiction','문구점 주인','shopkeeper'),line('이 가게에서 실제 구매를 했다는 기록은 없습니다. 이야기를 탐험하기 위해 더한 창작 공간입니다.','staged')],
  daeyeonNeighbor:()=>[line('새로운 길을 둘러보고 계시군요. 오른쪽에 집으로 향하는 표지판이 있어요.','fiction','대연동의 이웃','neighbor'),line('이웃과 주고받은 실제 대화나 구체적인 이사 과정은 제공되지 않았습니다. 이 인물과 대사는 창작입니다.','staged')]
};
