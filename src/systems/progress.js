export function recordChoice(state,id,value,displayValue=value){state.choices[id]=value;state.memoryTraces[id]={value:displayValue,sourceType:'dramatic_reconstruction'};}
export function recordMini(state,id,result){
 const old=state.minigames[id]||{};
 state.minigames[id]={...old,...result,plays:(old.plays||0)+1,sourceType:'dramatic_reconstruction'};
 if(id==='paper')state.minigames[id].bestDistance=Math.max(old.bestDistance||0,result.distance||0);
 state.memoryTraces['mini:'+id]={value:id==='paper'?`${result.variant} · ${result.distance}칸`:id==='hero'?result.pose:`문제 ${result.answered}개 · 정답 ${result.correct}개`,sourceType:'dramatic_reconstruction'};
}
export function unlockedPhoto(state){return state.inspected.includes('photo')&&(state.inspected.includes('television')||state.inspected.includes('tv'))&&state.events.includes('brother:paper');}
export function albumTraces(state){return Object.entries(state.memoryTraces||{}).map(([id,t])=>({id,text:id==='father-tv'?({'옆에 앉을래요':'옆에 앉을래','뭐 하나 보여 줄래요':'뭐 하나 보여 줄래'}[t.value]||t.value):t.value,sourceType:t.sourceType}));}
export function lineId(line){const value=(line.speaker||'')+'\0'+line.text;let hash=2166136261;for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(36);}
export function rememberLine(state,line){const id=lineId(line);if(!state.readLineIds.includes(id))state.readLineIds.push(id);state.readLineIds=state.readLineIds.slice(-2000);const last=state.dialogueLog.at(-1);if(last?.id!==id){state.dialogueLog.push({id,speaker:line.speaker||'',text:line.text,sourceType:line.sourceType,scene:state.storyScene,chapter:state.chapter});state.dialogueLog=state.dialogueLog.slice(-250);}}
