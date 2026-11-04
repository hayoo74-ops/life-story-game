import {DIALOGUES,say,narrate,HERO_SEQUENCE} from './dialogue.js';
export function npcLines(e,state){
 const lines=DIALOGUES[e.dialogue](state);const repeated=(state.dialogueVisits[e.dialogue+':'+state.storyScene]||0)>0;
 if(repeated&&e.id==='brother'&&state.minigames.paper?.distance)lines.unshift(say('brother',state.minigames.paper.distance>=210?'아까 종이 멀리 갔지? 날개가 딱 맞았어.':'접힌 선은 그대로네. 다음엔 힘을 바꿔 볼까?'));
 if(repeated&&e.id==='mother'&&state.inspected.includes('drawer'))lines.unshift(say('mother','서랍은 다 봤나? 종이는 구겨지지 않게 넣어 둬라.'));
 if(repeated&&e.id==='grandpa'&&state.minigames.study?.answered===3)lines.unshift(say('grandpa',state.minigames.study.correct===3?'세 문제 다 셌구나. 적은 것도 다시 봐라.':'천천히 다시 세면 된다. 네가 적은 것부터 보자.'));
 return lines;
}
export function objectReaction(kind,state,previous,fallback){
 if(kind==='television')return [say('child',state.on?'켰다. 화면이 반짝거리네.':'껐다. 방이 조용해졌네.')];
 if(kind==='drawer')return [say('child',previous.opened?'다시 넣고… 살살 닫아야지.':'접힌 종이가 있네. 선이 반듯하다.')];
 if(kind==='rest')return [say('child',previous.naps?'조금 더 쉬니까 괜찮네.':'잠깐 누웠더니 방이 다르게 보인다.')];
 return fallback;
}
export const PHOTO_RECALL=[narrate('사진의 가장자리를 따라 손끝을 옮긴다. 종이 접히는 소리와 TV의 빛이 함께 떠오른다.'),say('child','이 사진 옆에 종이도 놓아 볼까.')];
export function heroPages(state){const pages=structuredClone(HERO_SEQUENCE),pose=state.choices['hero-pose'],p=pages.find(p=>p.action==='mother-smile');if(p&&pose)p.text=pose==='번쩍'?'팔을 쭉 들었네. 아이고, 멋있다.':pose==='힘차게'?'기운도 좋네. 엄마도 보고 있다.':p.text;return pages;}
