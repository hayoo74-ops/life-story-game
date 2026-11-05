import {say,narrate} from './dialogue.js';
// Only the mother's quoted words are a remembered utterance. Weather, actions and
// adult voice-over are artistic reconstruction; no later whereabouts are inferred.
export const MOTHER_FAREWELL={
 id:'mother-farewell',seenKey:'farewell:v1.5',stage:'farewell',storyScene:6,nextScene:7,
 sourceType:'dramatic_reconstruction',
 quote:say('mother','엄마 나갔다올게 건강하게 잘있어',{kind:'fact',sourceType:'real_memory'}),
 reflections:[narrate('그날, 엄마는 나갔다 온다고 했다.'),narrate('나는 그 말이 정말 외출 인사인 줄 알았다.'),narrate('건강하게 잘있어.')],
 ending:narrate('그 뒤로 다시는 엄마를 만날 수 없었다.'),
 timing:{establish:2400,approach:2000,silence:1400,walk:1900,leave:400,close:900,ordinary:2600,montage:2400,fade:1600,textFade:850,textHold:2100,textOut:650,hold:1700},
 blocking:{child:570,mother:760,door:900,outside:940,camera:660},
 sourceNote:'엄마의 직접 대사는 사용자가 실제 기억으로 지정한 real_memory입니다. 비·장난감 놀이·외출 준비·현관 동선·몽타주·독백은 dramatic_reconstruction입니다. 사망·실종·이혼 원인이나 이후 행방을 새로 확정하지 않습니다.'
};
