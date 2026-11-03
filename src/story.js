export {CHAPTERS} from './data/chapter-list.js';
export {SCENES,PROLOGUE,OPENING,FACTS,QUOTES,EVENT_RECORDS,KINDS,OBJECTS,MEMORIES,STAGES,DIALOGUES,line,sceneById} from './data/chapter-one.js';
import {STAGES,MEMORIES,SCENES} from './data/chapter-one.js';
export const PROTAGONIST={name:'안재원',birth:'1997-01-26',birthplace:'부산광역시',adultHeight:174};
export function stageById(id){return STAGES.find(s=>s.id===id)||STAGES.find(s=>s.id==='present');}
export function memoryById(id){return MEMORIES.find(m=>m.id===id);}
export function canPerform(action,state){
 if(action==='album')return state.storyScene===0||state.storyScene===11;
 if(action==='study-end')return state.storyScene===10&&state.events.includes('story:cane');
 return SCENES.find(s=>s.id===state.storyScene)?.action===action;
}

export {HERO_SEQUENCE,DOOR_SEQUENCE,BROTHER_SEQUENCE,SUMMARY_PAGES,say,narrate,SOURCE_TYPES} from './data/dialogue.js';
export {FAMILY,REQUIRED_TALKS,missingTalk,questGoal} from './data/family.js';
