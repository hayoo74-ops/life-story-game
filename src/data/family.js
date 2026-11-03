export const FAMILY=[
 {id:'jaewon',name:'안재원',relationship:'주인공',character:'child',sourceType:'real_memory',note:'1997년 1월 26일 부산 출생.'},
 {id:'father',name:'아버지',relationship:'아버지',character:'father',sourceType:'real_memory',note:'학장동의 가족 기억과 이혼 이후 약 1~2년의 단독 동거 기간에 등장합니다. 일상 대사는 fictional_dialogue입니다.'},
 {id:'mother',name:'어머니',relationship:'어머니',character:'mother',sourceType:'real_memory',note:'학장동의 부모님 거실에 등장합니다. 핵심 사건 외의 반응과 일상 대사는 fictional_dialogue입니다.'},
 {id:'brother',name:'형',relationship:'형제',character:'brother',sourceType:'real_memory',ageGap:null,residence:null,personality:null,witnessOf:[],note:'형이 있다는 관계만 확인되었습니다. 종이놀이와 그 대사는 dramatic_reconstruction / fictional_dialogue입니다. 동거 시기·나이 차이·성격·액션가면 및 방문 사건 참여는 확정하지 않습니다.'},
 {id:'grandfather',name:'할아버지',relationship:'조부',character:'grandpa',sourceType:'real_memory',note:'대연동 생활의 가족입니다. 공부 지도 대사는 fictional_dialogue이며 개별 체벌 행위자를 특정하지 않습니다.'},
 {id:'grandmother',name:'할머니',relationship:'조모',character:'grandma',sourceType:'real_memory',note:'대연동 생활의 가족입니다. 공부 지도 대사는 fictional_dialogue이며 개별 체벌 행위자를 특정하지 않습니다.'}
];
export const REQUIRED_TALKS={1:['mother'],2:['mother'],6:['fatherChanged'],7:['fatherAlone'],9:['grandma','grandpa']};
export function missingTalk(state){return (REQUIRED_TALKS[state.storyScene]||[]).find(key=>!(state.dialogueVisits?.[`${key}:${state.storyScene}`]>0));}
export function questGoal(state,fallback){
 if(state.stage==='brother-room')return state.events.includes('brother:paper')?'형과 더 이야기하거나 오른쪽 길로 돌아가세요.':'형과 이야기한 뒤 종이를 함께 접어 보세요.';
 const missing=missingTalk(state);
 if(missing)return ({mother:'엄마',fatherChanged:'아버지',fatherAlone:'아버지',grandma:'할머니',grandpa:'할아버지'})[missing]+'에게 다가가 이야기를 나눠 보세요.';
 if(state.storyScene===2)return state.events.includes('brother:paper')?'종이가면을 찾아 착용하세요.':'접힌 종이를 펼쳐 보세요.';
 return fallback;
}
