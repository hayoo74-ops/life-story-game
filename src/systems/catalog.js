import {SCENES,PROLOGUE,STAGES,OBJECTS,DIALOGUES,MEMORIES} from '../data/chapter-one.js';
import {CHAPTERS} from '../data/chapter-list.js';
import {CHAPTER_PLANS} from '../data/chapter-plans.js';
import {MINI_DEFINITIONS} from '../data/minigames.js';
export {MINI_DEFINITIONS};
export class ChapterCatalog{
 constructor(){this.chapters=new Map();this.stages=new Map();}
 register(def){
  if(!Number.isInteger(def.id)||this.chapters.has(def.id))throw Error('Duplicate/invalid chapter');
  if(def.status==='playable'){
   if(!def.scenes?.length||!def.stages?.length||!def.entry)throw Error('Playable chapters require complete runtime data');
   const ids=new Set(def.scenes.map(s=>s.id));if(ids.size!==def.scenes.length)throw Error('Duplicate scene');
   for(const s of def.scenes){if(!def.stages.some(t=>t.id===s.stage))throw Error('Missing scene stage');if(s.next!=null&&!ids.has(s.next))throw Error('Missing next scene');}
   for(const stage of def.stages){if(this.stages.has(stage.id)||stage.width<200)throw Error('Duplicate/invalid stage');for(const e of stage.entities){if(e.type==='npc'&&!def.npcs[e.dialogue])throw Error('Missing NPC');if(e.type==='object'&&!def.objects[e.object])throw Error('Missing object');}}
   for(const stage of def.stages){for(const e of stage.entities)if(e.type==='portal'&&!def.stages.some(t=>t.id===e.target))throw Error('Missing portal target');this.stages.set(stage.id,{...stage,chapter:def.id});}
  }
  this.chapters.set(def.id,def);return this;
 }
 chapter(id){return this.chapters.get(id);}
 scene(chapter,id){return this.chapter(chapter)?.scenes?.find(s=>s.id===id);}
 stage(id){return this.stages.get(id);}
 complete(state,action){
  const s=this.scene(state.chapter,state.storyScene);if(!s||s.action!==action)return null;
  const entry=state.chapterProgress[state.chapter]??={scenes:[],complete:false};
  if(!entry.scenes.includes(s.id))entry.scenes.push(s.id);
  if(s.next==null)entry.complete=true;
  return {next:s.next,chapterComplete:entry.complete};
 }
}
export const catalog=new ChapterCatalog();
for(const chapter of CHAPTERS)catalog.register({
 ...chapter,plan:CHAPTER_PLANS.find(p=>p.id===chapter.id),
 scenes:chapter.id===1?[PROLOGUE,...SCENES]:[],stages:chapter.id===1?STAGES:[],
 entry:chapter.id===1?{scene:0,stage:'present'}:null,
 npcs:chapter.id===1?DIALOGUES:{},objects:chapter.id===1?OBJECTS:{},memories:chapter.id===1?MEMORIES:[],
 minigames:chapter.id===1?Object.keys(MINI_DEFINITIONS):[],
 plannedSystems:({2:['classroom','article-writing'],3:['learning'],4:['conversation'],5:['work-tasks'],6:['monitoring'],7:['travel-photos'],8:['album']})[chapter.id]||[]
});
export function chapterSupported(id){return catalog.chapter(id)?.status==='playable';}
