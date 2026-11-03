// Player-facing story text. Provenance stays in data and the record menu.
export const REAL_QUOTES={child:'우하하하! 난 액션가면!',father:'액션가면은 빤쓰만 입고 있는다.'};
export const SOURCE_TYPES={fact:'real_memory',fiction:'fictional_dialogue',staged:'dramatic_reconstruction'};
const NAMES={child:'재원',hero:'재원',adult:'재원',father:'아버지',mother:'어머니',brother:'형',grandma:'할머니',grandpa:'할아버지',friend:'동네 아이',neighbor:'이웃',shopkeeper:'문구점 주인'};
export function say(character,text,extra={}){return {character,speaker:NAMES[character]||character,text,kind:'fiction',sourceType:'fictional_dialogue',...extra};}
export function narrate(text,extra={}){return {character:'adult',speaker:'',text,kind:'staged',sourceType:'dramatic_reconstruction',...extra};}
export function choice(id,character,text,branches){return {...say(character,text),choiceId:id,choices:branches.map(([label,lines])=>({label,lines}))};}
const child=t=>say('child',t),dad=t=>say('father',t),mom=t=>say('mother',t),bro=t=>say('brother',t),gm=t=>say('grandma',t),gp=t=>say('grandpa',t);
const visit=(s,key)=>(s.dialogueVisits?.[`${key}:${s.storyScene}`]||0);
export const DIALOGUES={
 mother:s=>s.storyScene===3?(visit(s,'mother')%2===0?[mom('가면 썼네? 아빠한테도 보여 줘 봐라.'),child('지금 보여 줘도 돼요?'),mom('응. 저기 앉아 계시네. 한번 불러 봐.')]:[mom('가면 쓰고 앞은 잘 보이나?'),child('네. 눈 구멍이랑 딱 맞아요.'),mom('그래. 발밑 보고 걸어라.')]):s.storyScene===1?(visit(s,'mother')===0?[
  mom('재원아, 일어났나? 거실에 와 봐라.'),child('엄마, 저 사진에 있는 게 나예요?'),mom('그래. 궁금하면 가까이서 봐. 액자는 넘어뜨리지 말고.'),
  choice('mother-photo','child','엄마는 사진 찍을 때 뭘 보고 있었어요?',[
   ['엄마 얼굴을 가리킨다',[mom('엄마 얼굴 말이가? 네가 자꾸 움직여서 너 보고 있었지.'),child('그럼 이번엔 내가 엄마 볼게요.')]],
   ['내 모습을 찾아본다',[mom('네 모습부터 찾았네. 여기 조그맣게 나온 거 보이지?'),child('찾았다! 여기 있다.')]]
  ])
 ]:[mom('사진 찾았나?'),child(s.choices?.['mother-photo']==='엄마 얼굴을 가리킨다'?'엄마도 찾았어요.':'내가 어디 있는지 알겠어요.'),mom('그래. 손으로 살살 봐라.')]):visit(s,'mother')===0?[
  mom('아까부터 뭘 그렇게 만지작거리노?'),child('종이가 있어요. 뭘 만들까 생각 중이에요.'),mom('그럼 책상에 펴 놓고 해. 다 하고 나면 종이 조각도 챙기고.'),child('네. 다 만들면 보여 줄게요.')
 ]:s.events.includes('brother:paper')?[
  mom('종이는 다 봤나?'),child('네. 이제 가면 써 볼래요.'),mom('거기 눈 구멍부터 맞춰 봐. 앞이 보여야지.')
 ]:[mom('접힌 데부터 살살 펴 봐. 찢어지겠다.'),child('조심해서 할게요.')],
 father:s=>s.storyScene===2&&s.events.includes('brother:paper')?(visit(s,'father')%2===0?[dad('준비하는 거 있다더니, 다 됐나?'),child('조금만 더요. 다 되면 보여 줄게요.'),dad('그래. 아빠 여기 있으니까 불러라.')]:[dad('이제 가면도 찾아봤나?'),child('눈 구멍이 있어서 앞도 보여요.'),dad('그러면 한번 써 보고 와 봐라.')]):visit(s,'father')===0?[
  dad('뭐 하고 놀았노?'),child('아직요. 아빠는 뭐 봐요?'),dad('텔레비전 보고 있지. 네가 앞에 서면 아빠가 안 보인다.'),
  choice('father-tv','child','그럼 나는 어디 있을까요?',[
   ['옆에 앉을래요',[dad('그래, 옆으로 와 봐. 여기 자리 있다.'),child('조금만 앉아 있을게요.')]],
   ['뭐 하나 보여 줄래요',[dad('뭔데? 준비되면 불러라.'),child('지금은 비밀이에요.')]]
  ])
 ]:s.choices?.['father-tv']==='뭐 하나 보여 줄래요'?[
  dad('아까 보여 준다던 거, 준비됐나?'),child('조금만 더 기다려요!'),dad('알았다. 다 되면 아빠 불러라.')
 ]:[dad('잠깐 앉아 있더니 또 일어났네.'),child('보고 싶은 게 있어서요.'),dad('그래. 발밑에 장난감은 보고 다녀라.')],
 doorFather:()=>[narrate('문 앞에서 발걸음이 멎었다.'),child('……')],
 fatherChanged:s=>visit(s,'fatherChanged')===0?[
  dad('재원아. 신발 어디 있는지 봐라.'),child('여기 있어요.'),dad('그래. 급하게 신지 말고 뒤꿈치까지 넣어라.'),
  choice('father-shoes','child','끈이 자꾸 풀려요.',[
   ['한 번 더 묶어 본다',[dad('고리 두 개를 잡고 천천히 당겨 봐.'),child('이번엔 됐어요.')]],
   ['잠깐 앉아서 신는다',[dad('그래. 앉아서 신으면 되지.'),child('이제 안 벗겨져요.')]]
  ])
 ]:[dad('신발은 다 신었나?'),child('네.'),dad('그러면 옆에 둔 것만 한번 보고 가자.')],
 fatherAlone:s=>visit(s,'fatherAlone')===0?[
  dad('밥 먹을 준비하자. 손 씻었나?'),child('아직요.'),dad('그럼 손부터 씻고 와라.'),
  choice('father-meal','child','나도 뭐 할까요?',[
   ['수저를 놓는다',[dad('수저통 저기 있다. 두 개씩 꺼내면 된다.'),child('하나, 둘. 여기 놓을게요.')]],
   ['다 먹고 나갈지 묻는다',[child('밥 먹고 밖에 나가요?'),dad('먹고 나서 챙겨 보자. 우선 앉아라.')]]
  ]),narrate('두 사람이 마주 앉을 자리가 놓여 있었다.')
 ]:s.choices?.['father-meal']==='수저를 놓는다'?[
  dad('수저는 잘 놓았네.'),child('두 개씩 꺼냈어요.'),dad('그래. 네 자리에도 하나씩 놓고.')
 ]:[dad('나갈 때는 겉에 걸칠 것도 챙겨라.'),child('알겠어요. 신발은 현관에 있어요.')],
 grandma:s=>s.storyScene>=10?[
  gm('문제집 다 봤으면 책부터 정리해라.'),child('연필도 넣을까요?'),gm('그래. 지우개도 같이 챙기고.')
 ]:visit(s,'grandma')===0?[
  gm('재원아, 책상 앞에 앉아라. 문제집 펴고.'),child('몇 쪽이에요?'),gm('접어 둔 데부터 봐라. 먼저 문제를 끝까지 읽고 풀어야 한다.'),
  choice('grandma-prep','child','준비됐어요.',[
   ['연필을 먼저 꺼낸다',[gm('연필심은 괜찮나? 너무 짧으면 깎고.'),child('이 정도면 쓸 수 있어요.')]],
   ['문제를 소리 내어 읽는다',[gm('그래. 빠뜨린 말 없는지 보고 읽어라.'),child('천천히 읽어 볼게요.')]]
  ])
 ]:[gm('아직 시작 안 했나?'),child('이제 펼칠게요.'),gm('딴 데 보지 말고 한 문제씩 해라.')],
 grandpa:s=>s.storyScene>=10?[
  gp('다 본 문제는 표시해 뒀나?'),child('여기까지 했어요.'),gp('그래. 책을 덮기 전에 한번 더 살펴봐라.')
 ]:visit(s,'grandpa')===0?[
  gp('어디까지 풀었는지 보자.'),child('여기부터 하려고요.'),gp('답만 쓰지 말고 어떻게 셌는지도 써 봐라.'),
  choice('grandpa-method','child','어떻게 써요?',[
   ['동그라미를 그려 본다',[gp('그린 걸 하나씩 짚어 봐라. 빠뜨리지 말고.'),child('하나씩 세면 되죠?')]],
   ['숫자를 한 줄씩 적는다',[gp('글씨를 붙여 쓰면 다시 볼 때 헷갈린다.'),child('조금 띄워서 쓸게요.')]]
  ])
 ]:[gp('아까 고른 방법으로 한번 해 봐라.'),child(s.choices?.['grandpa-method']==='동그라미를 그려 본다'?'동그라미부터 그릴게요.':'숫자를 나란히 써 볼게요.')],
 brother:s=>s.storyScene===11?[
  bro('또 종이 보고 있네.'),child('이번엔 뭐 접을까?'),bro(s.choices?.['brother-shape']==='비행기'?'아까처럼 날개를 접어 볼래?':'이번에는 가운데 선을 먼저 맞춰 보자.'),
  choice('brother-again','child','이번에는…',[
   ['내가 먼저 접을래',[bro('그래. 나는 이쪽 잡고 있을게.'),child('선이 맞으면 말해 줘.')]],
   ['같이 선부터 그리자',[bro('자, 네가 그쪽 끝을 잡아.'),child('이제 안 움직여.')]]
  ])
 ]:visit(s,'brother')===0?[
  bro('이 종이, 반으로 접어 볼까?'),child('뭘 만들 건데?'),bro('네가 골라. 나는 여기부터 잡을게.'),
  choice('brother-shape','child','뭐가 좋을까?',[
   ['비행기',[bro('그럼 양쪽 날개가 비슷해야겠다.'),child('내 쪽이 조금 더 크네.'),bro('한번 펴서 다시 맞춰 보자.')]],
   ['배',[bro('배면 아래쪽이 벌어져야겠네.'),child('여기를 이렇게 열면 돼?'),bro('응. 종이가 찢어지지 않게 천천히.')]]
  ])
 ]:[bro('아까 접은 선이 여기 남았네.'),child(s.choices?.['brother-shape']==='비행기'?'이번엔 날개를 똑같이 접어 볼래.':'이번엔 바닥을 조금 더 넓게 만들래.'),bro('그러면 이쪽부터 해 봐. 나는 반대쪽 잡을게.')],
 neighbor:s=>visit(s,'neighbor')%2===0?[
  say('neighbor','천천히 가라. 모퉁이 돌면 그늘이 있으니 잘 보고.'),child('저쪽으로 가면 놀이터예요?'),say('neighbor','그래. 담 따라 조금만 가면 보인다.')
 ]:[say('neighbor','한 바퀴 돌고 오는 길이가?'),child('구경할 게 많네요.'),say('neighbor','그러게. 늘 다니는 길도 가만 보면 그렇지.')],
 friend:s=>visit(s,'friend')%2===0?[
  say('friend','그네 비었다. 잠깐 있다 갈래?'),choice('friend-play','child','나는…',[
   ['그네를 구경할래',[say('friend','바람 불면 혼자 조금씩 움직여. 봐 봐.'),child('정말 움직이네.')]],
   ['조금 더 걸어갈래',[say('friend','그러면 저쪽 문구점도 들러 봐.'),child('응. 갔다 올게.')]]
  ])
 ]:[say('friend','돌아왔네?'),child(s.choices?.['friend-play']==='조금 더 걸어갈래'?'문구점 쪽도 구경했어.':'그네 소리가 여기까지 들려.'),say('friend','나는 조금 더 있다 갈 거야.')],
 shopkeeper:s=>visit(s,'shopkeeper')%2===0?[
  say('shopkeeper','어서 온나. 뭐 찾는 거 있니?'),child('연필 구경해도 돼요?'),say('shopkeeper','그럼. 색깔별로 나란히 놓여 있다.'),choice('shop-pencil','child','어느 게 좋을까?',[
   ['초록 연필을 본다',[say('shopkeeper','그건 옆에 지우개도 있네.'),child('끝에 달려 있네요.')]],
   ['빨간 연필을 본다',[say('shopkeeper','그건 표시할 때 잘 보이겠다.'),child('여기 있는 것 중에 제일 눈에 띄어요.')]]
  ])
 ]:[say('shopkeeper','아까 보던 연필, 다시 볼래?'),child('네. 잠깐만 더 볼게요.'),say('shopkeeper','그래. 보고 제자리에만 놓아라.')],
 daeyeonNeighbor:s=>visit(s,'daeyeonNeighbor')%2===0?[
  say('neighbor','어디 찾는 집 있니?'),child('저쪽으로 가려고요.'),say('neighbor','오른쪽 길 따라가면 된다. 급하게 뛰지 말고.'),child('네, 감사합니다.')
 ]:[say('neighbor','길은 찾았나?'),child('네. 이제 알겠어요.'),say('neighbor','그래. 천천히 가라.')]
};
const inspect=(a,b,c)=>[child(a),choice(c||a.slice(0,8),'child',b[0],b.slice(1))];
export const OBJECT_TEXT={
 photo:[child('여기 있는 게 나구나. 얼굴이 작아서 잘 안 보였네.'),choice('photo','child','사진을 조금 가까이 볼까?',[
  ['얼굴을 하나씩 본다',[child('엄마, 아빠… 그리고 나. 다 같이 있네.'),narrate('재원은 액자의 모서리를 두 손으로 잡았다.')]],
  ['사진을 제자리에 둔다',[child('넘어지면 안 되니까. 살짝 세워 두자.'),mom('그래, 거기 놓으면 된다.')]]
 ])],
 tv:[child('화면에서 불빛이 계속 바뀐다.'),mom('너무 가까이 가면 뒤에 있는 사람은 안 보인다.'),child('조금 옆으로 갈게요.')],
 toy:[child('바퀴가 조금 뻑뻑하네.'),choice('toy','child','어디까지 굴러갈까?',[
  ['살짝 밀어 본다',[narrate('작은 바퀴가 바닥의 이음새를 하나 넘었다.',{action:'toy-roll'}),child('오, 거기까지 갔다.')]],
  ['뒤로 당겨 본다',[child('이번엔 반대쪽으로.'),narrate('재원은 장난감을 다시 손안으로 가져왔다.')]]
 ])],
 sofa:[child('여기 앉으면 텔레비전이 잘 보이겠다.'),dad('발 올리지 말고 옆에 앉아라.'),child('금방 일어날 거예요. 보여 줄 게 있거든요.')],
 shoes:[child('내 신발은 아래쪽에 있네.'),choice('shoes','child','조금 비뚤어져 있다.',[
  ['나란히 놓는다',[child('이쪽이 왼발, 이쪽이 오른발. 됐다.')]],
  ['발을 살짝 넣어 본다',[child('뒤꿈치를 눌러 신으면 또 벗겨지겠네. 앉아서 신어야지.')]]
 ])],
 window:[child('창문 틈으로 바깥 소리가 들린다.'),narrate('재원은 잠깐 귀를 기울였다. 골목을 지나는 발소리가 멀어졌다.'),child('조금 더 둘러보고 갈까.')],
 mask:[child('눈이 여기 있네. 내 눈이랑 맞나?'),mom('거꾸로 쓰는 건 아니제?'),child('알아요. 이렇게 쓰는 거예요!')],
 'plain-door':[child('문이 닫혀 있다. 손잡이가 나보다 조금 높네.'),narrate('재원은 문 앞에 잠깐 섰다가 거실 쪽으로 몸을 돌렸다.')],
 calendar:[narrate('그날의 웃음에서, 약 1~2년이 흘렀다.',{kind:'fact',sourceType:'real_memory'}),narrate('익숙한 방 안으로 다시 빛이 들어왔다. 재원은 방문 쪽을 바라보았다.')],
 'broken-door':[narrate('문에는 크게 갈라진 자국이 남아 있었다.'),child('……'),narrate('바닥에 떨어진 조각 너머로, 문이 있던 자리를 바라보았다.')],
 'family-record':[narrate('방문이 부서진 그날 이후, 얼마 지나지 않아 부모님은 이혼했다.',{kind:'fact',sourceType:'real_memory'}),narrate('익숙했던 집의 모습이 달라졌다. 재원은 사진첩의 다음 장을 넘겼다.')],
 'two-chairs':[child('수저를 놓을 자리가 두 군데다.'),choice('two-chairs','child','내 자리는 이쪽인가?',[
  ['의자를 조금 당긴다',[narrate('의자가 바닥을 짧게 스쳤다.'),child('이제 앉으면 되겠다.')]],
  ['수저를 나란히 놓는다',[child('하나씩, 나란히. 아빠 것도 여기.')]]
 ])],
 'father-record':[narrate('부모님이 이혼한 뒤, 아버지와 단둘이 지내는 시간이 이어졌다.',{kind:'fact',sourceType:'real_memory'}),narrate('약 1~2년 동안의 날들이 지나갔다.',{kind:'fact',sourceType:'real_memory'}),child('신발부터 챙겨야겠다.')],
 'blank-note':[say('adult','빈 페이지가 아직 남아 있네.'),choice('blank-note','adult','무엇부터 적을까?',[
  ['떠오르는 말을 기다린다',[say('adult','서두르지는 말자. 천천히 넘겨도 되니까.')]],
  ['책갈피를 끼워 둔다',[say('adult','여기는 다시 펼쳐 봐야겠다.')]]
 ])],
 'new-town':[narrate('그 뒤, 거처는 부산 남구 대연동의 조부모님 댁으로 옮겨졌다.',{kind:'fact',sourceType:'real_memory'}),child('이쪽 길이구나. 집까지 한번 가 보자.')],
 desk:[child('문제집이 펼쳐져 있다. 연필은 여기 놓으면 되겠네.'),gm('준비 다 했으면 앉아라.'),child('네. 먼저 문제부터 읽을게요.')],
 workbook:[child('동그라미랑 숫자가 나란히 있다.'),choice('workbook','child','어디부터 볼까?',[
  ['그림부터 센다',[child('하나씩 짚으면 빠뜨리지 않겠지.')]],
  ['문장을 먼저 읽는다',[child('중간에 안 멈추고 끝까지 읽어 보자.')]]
 ])],
 'study-pencil':[child('잡았더니 손가락에 자국이 조금 남는다.'),choice('study-pencil','child','연필을 다시 잡아 볼까?',[
  ['힘을 조금 뺀다',[child('이렇게 잡으니까 좀 덜 미끄럽네.')]],
  ['공책 위에 선을 긋는다',[narrate('짧은 선 하나가 종이 위에 남았다.'),child('이제 써진다.')]]
 ])],
 eraser:[child('지우개 모서리가 둥글어졌다.'),choice('eraser','child','가루가 조금 묻어 있네.',[
  ['손으로 털어 낸다',[child('종이 밖으로 살살. 됐다.')]],
  ['지우개를 돌려 잡는다',[child('이쪽 모서리는 아직 쓸 수 있겠다.')]]
 ])],
 clock:[narrate('시계가 같은 간격으로 소리를 냈다.'),child('한 문제만 더 보고 시간을 봐야지.')],
 books:[child('책마다 두께가 다르다.'),gp('꺼낸 책은 자리에 다시 꽂아 둬라.'),child('이쪽에 있던 거니까, 여기.')],
 cane:[narrate('공부를 많이 해야 했다. 문제를 여러 개 틀리면 심하게 혼났다.',{kind:'fact',sourceType:'real_memory'}),narrate('회초리를 맞기도 했다.',{kind:'fact',sourceType:'real_memory'}),narrate('재원은 펼쳐진 문제집으로 시선을 돌렸다.')],
 'study-end':[child('여기까지 봤어요.'),gm('그럼 책하고 연필 챙겨라.'),narrate('문제집이 덮이는 소리가 났다.')],
 album:[say('adult','한 장씩 넘겨 보자. 앞뒤가 뒤섞이지 않게.')],
 lamp:[child('가로등 아래만 바닥색이 조금 다르네.'),narrate('빛이 닿은 자리에서 재원의 그림자가 짧아졌다.')],
 swing:[child('아무도 안 타는데 조금 움직인다.'),choice('swing','child','바람 때문인가?',[
  ['잠깐 바라본다',[narrate('그네가 천천히 돌아왔다. 줄에서 작은 소리가 났다.')]],
  ['모래 위를 내려다본다',[child('여기저기 발자국이 있다. 내 것도 하나 남았네.')]]
 ])],
 pencil:[child('연필이 색깔별로 나란히 있다.'),choice('pencil','child','어느 쪽을 볼까?',[
  ['초록색',[child('초록색은 가면이랑 닮았다.')]],
  ['빨간색',[child('빨간색으로 그리면 눈에 잘 띄겠다.')]]
 ])],
 bag:[child('가방을 들면 등에 딱 붙을까?'),narrate('재원은 가방의 손잡이를 잠깐 쥐어 보았다.'),child('오늘은 여기 두고, 집으로 돌아가야지.')],
 'folded-paper':[child('접힌 자국이 두 줄이다. 한번 펴 볼까?'),narrate('종이를 펴자, 작은 풍경이 그 사이로 펼쳐졌다.')],
 'brother-paper':[child('형, 이쪽 좀 잡아 줘.'),bro('응. 네가 접을 쪽은 여기네. 준비됐어?'),child('이제 같이 해 보자.')]
};
export const HERO_SEQUENCE=[
 {...dad('거기서 뭘 그렇게 꼼지락거리노?'),action:'watch-tv'},
 child('잠깐만요! 아직 등장하면 안 돼요.'),
 {...mom('뭘 준비했길래 그래?'),action:'mother-look'},
 {...child('잘 보세요. 이제 나옵니다!'),action:'step-forward'},
 narrate('종이가면 뒤에서 손이 번쩍 올라왔다.',{action:'hero-pose'}),
 say('child',REAL_QUOTES.child,{kind:'fact',sourceType:'real_memory',action:'hero-pose'}),
 {...mom('어머, 우리 집에 영웅이 왔네.'),action:'mother-smile'},
 dad('영웅님, 오늘은 무슨 일로 오셨습니까?'),
 child('둘 다 꼼짝 마세요!'),
 mom('우리는 텔레비전 보고 있는데요?'),
 {...child('그럼 내가 여기를 지킬게요.'),action:'hero-pose'},
 say('father',REAL_QUOTES.father,{kind:'fact',sourceType:'real_memory',action:'father-prank'}),
 narrate('아버지가 장난스럽게 바지를 내리자, 거실에 웃음이 터졌다.',{kind:'fact',sourceType:'real_memory',action:'tv-cutaway'}),
 {...dad('하하하! 그래야 진짜 액션가면이지!'),action:'family-laugh'},
 child('아빠아! 다시 입을 거예요!'),
 mom('아이고, 그만 놀려요. 가면이 삐뚤어졌다.'),
 {...child('가면은 안 벗겨졌죠?'),action:'adjust-mask'},
 mom('응, 아직 멋있다. 한 번만 더 해 봐.'),
 dad('이번에는 아빠도 제대로 볼게.'),
 {...child('준비… 우하하하!'),action:'hero-pose'},
 narrate('텔레비전 소리 사이로 웃음이 한 번 더 번졌다.',{action:'family-laugh'}),
 narrate('그날의 웃음은 오랜 시간이 흘러도 기억에 남았다.',{action:'warm-fade'})
];
export const DOOR_SEQUENCE=[
 narrate('익숙한 거실인데, 발걸음이 문 앞에서 멎었다.',{action:'door-approach'}),
 say('child','엄마는 방 안에…',{kind:'staged',sourceType:'dramatic_reconstruction'}),
 narrate('갑자기 아버지의 발이 문으로 향했다.',{action:'door-impact'}),
 narrate('쾅. 문이 부서졌다.',{kind:'fact',sourceType:'real_memory'}),
 say('child','……',{kind:'staged',sourceType:'dramatic_reconstruction'}),
 narrate('어머니가 있는 방문이 부서지는 장면을, 어린 나는 그 자리에서 보았다.',{kind:'fact',sourceType:'real_memory',action:'door-silence'}),
 narrate('바닥에 떨어진 조각 앞에서 시간이 잠깐 멈춘 듯했다.')
];
export const BROTHER_SEQUENCE=[
 bro('그쪽 끝 좀 잡아 줄래?'),
 {...child('이만큼?'),action:'brother-hold'},
 bro('응. 선이 비뚤어지면 한번 펴면 되지.'),
 child('내 쪽도 맞춰 볼게.'),
 narrate('두 손이 종이의 양 끝에 놓였다.',{action:'paper-fold'}),
 bro('자, 이제 펴 봐.'),
 child('가운데 선이 생겼다.'),
 bro('다음 모양은 네가 골라.'),
 narrate('종이 한 장을 사이에 두고, 두 목소리가 잠깐 이어졌다.')
];
export const SUMMARY_PAGES=[
 narrate('부산 학장동. 어린 나는 그 집에서 아버지, 어머니와 함께 살았다.',{kind:'fact',sourceType:'real_memory'}),
 narrate('종이가면을 쓰고 외치던 나와, 함께 웃던 부모님. 거실의 웃음이 먼저 떠오른다.'),
 narrate('그로부터 약 1~2년이 흘렀다.',{kind:'fact',sourceType:'real_memory'}),
 narrate('아버지가 어머니가 계신 방문을 발로 찼다. 문은 부서졌다. 나는 그 앞에 있었다.',{kind:'fact',sourceType:'real_memory'}),
 narrate('얼마 지나지 않아 부모님은 이혼했다.',{kind:'fact',sourceType:'real_memory'}),
 narrate('그다음 약 1~2년은 아버지와 단둘이 살았다.',{kind:'fact',sourceType:'real_memory'}),
 narrate('그 뒤 부산 남구 대연동의 조부모님 댁으로 거처를 옮겼다.',{kind:'fact',sourceType:'real_memory'}),
 narrate('공부가 많았다. 문제를 여러 개 틀리면 심하게 혼났고, 회초리를 맞기도 했다. 사진첩을 넘기던 손을 잠시 멈췄다.')
];
export const MEMORY_TEXT={
 family:'부모님과 함께 있던 학장동의 집. 사진 속 얼굴을 하나씩 짚어 본다.',hero:'종이가면을 쓰고 외쳤다. 텔레비전 소리보다 크게, 가족의 웃음이 거실에 번졌다.',interval:'웃음이 남은 날에서 약 1~2년. 같은 집의 문 앞에 다시 서게 되었다.',door:'아버지가 어머니가 있는 방문을 발로 찼다. 문이 부서지는 장면을 나는 그 자리에서 보았다.','family-change':'얼마 지나지 않아 부모님은 이혼했다. 사진첩의 다음 페이지를 넘긴다.',father:'부모님이 이혼한 뒤 약 1~2년, 아버지와 단둘이 살았다.',daeyeon:'거처를 옮긴 곳은 부산 남구 대연동, 조부모님 댁이었다.',workbook:'책상 앞에서 문제집을 펼치고 답을 적고 지우던 시간. 집에서는 공부를 많이 해야 했다.',cane:'문제를 여러 개 틀리면 심하게 혼났고, 회초리로 체벌을 받기도 했다.',tv:'부모님은 텔레비전을 보고 있었다. 나는 그 앞에서 영웅이 될 준비를 했다.',toy:'바퀴가 바닥의 이음새를 하나 넘었다. 손바닥만 한 모험이 잠깐 굴러갔다.',lamp:'가로등 아래, 빛이 닿은 만큼 길의 색이 달라졌다.',swing:'바람이 밀고 간 그네가 천천히 돌아왔다.',pencil:'나란한 연필들 사이에서 색 하나를 오래 바라보았다.',desk:'책상 앞에 앉아 문제를 읽는다. 연필을 고쳐 잡고 종이에 선을 긋는다.',album:'함께 웃던 집, 부서진 방문, 아버지와의 시간, 대연동의 공부방. 서로 다른 기억을 한 장씩 놓는다.',brother:'종이의 한쪽은 내가, 다른 쪽은 형이 잡았다. 가운데에 선 하나가 남았다.'
};
