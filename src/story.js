import {catalog} from './systems/catalog.js';
export {CHAPTERS} from './data/chapter-list.js';
export {SCENES,PROLOGUE,OPENING,FACTS,QUOTES,EVENT_RECORDS,KINDS,OBJECTS,MEMORIES,STAGES,DIALOGUES,line} from './data/chapter-one.js';
import {STAGES,MEMORIES,SCENES,PROLOGUE} from './data/chapter-one.js';
export const PROTAGONIST={name:'안재원',birth:'1997-01-26',birthplace:'부산광역시',adultHeight:174};
export function stageById(id){return catalog.stage(id)||catalog.stage('present');}
export function sceneById(id,chapter=1){return catalog.scene(chapter,id)||PROLOGUE;}
export function memoryById(id){return MEMORIES.find(m=>m.id===id);}
export function canPerform(action,state){
 if((state.chapter||1)!==1)return catalog.scene(state.chapter,state.storyScene)?.action===action;
 if(action==='album')return state.storyScene===0||state.storyScene===11;
 if(action==='study-end')return state.storyScene===10&&state.events.includes('story:cane');
 return SCENES.find(s=>s.id===state.storyScene)?.action===action;
}

export {HERO_SEQUENCE,DOOR_SEQUENCE,BROTHER_SEQUENCE,SUMMARY_PAGES,say,narrate,SOURCE_TYPES} from './data/dialogue.js';
export {FAMILY,REQUIRED_TALKS,missingTalk,questGoal} from './data/family.js';
