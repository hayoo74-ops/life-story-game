import {say,narrate} from './dialogue.js';
// User-directed scene. No death, disappearance, legal cause, or later whereabouts are inferred.
export const MOTHER_FAREWELL={
 id:'mother-farewell',seenKey:'farewell:v1.4',stage:'farewell',storyScene:6,nextScene:7,
 sourceType:'dramatic_reconstruction',
 quote:say('mother','엄마 나갔다올게 건강하게 잘있어',{kind:'staged',sourceType:'dramatic_reconstruction'}),
 ending:narrate('그 뒤로 다시는 엄마를 만날 수 없었다'),
 timing:{establish:750,silence:1400,walk:1100,leave:260,close:450,fade:1200,textFade:850,hold:1300},
 blocking:{child:685,mother:800,door:900,outside:940,camera:805},
 sourceNote:'사용자가 지정한 대사·중앙 문구를 사용하는 현관 작별 장면의 극적 재구성. 비, 조명과 동선은 예술적 연출이며 사망·실종·이혼 원인이나 이후 행방을 새로 확정하지 않습니다.'
};
