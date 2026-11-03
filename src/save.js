import {STAGES,MEMORIES,sceneById} from './story.js';
export const SAVE_KEY='life-story:save',SETTINGS_KEY='life-story:settings',BACKUP_KEY='life-story:save:v1-backup',V2_BACKUP_KEY='life-story:save:v2-backup';
export const SAVE_VERSION=3;
export const DEFAULT_SETTINGS={sound:false,ambience:'day',largeText:false,reducedMotion:false};
const strings=value=>Array.isArray(value)?[...new Set(value.filter(v=>typeof v==='string'))]:[];
const stageIds=new Set(STAGES.map(s=>s.id)),memoryIds=new Set(MEMORIES.map(m=>m.id));
export function freshSave(){return {version:3,chapter:1,storyScene:0,stage:'present',x:300,events:[],memories:[],quests:[],visited:['present'],inspected:[],choices:{},dialogueVisits:{},cutscenesSeen:[],interludeReturn:null,legacyArchive:null,playtime:0,updatedAt:null,settings:{...DEFAULT_SETTINGS}};}
export function normalizeSettings(raw={}){return {sound:raw?.sound===true,largeText:raw?.largeText===true,reducedMotion:raw?.reducedMotion===true,ambience:['day','dusk','night','cycle','rain'].includes(raw?.ambience)?raw.ambience:'day'};}
export function normalizeSave(raw){
 if(!raw||![1,2,3].includes(raw.version))return null;
 if(raw.version===1)return {...freshSave(),playtime:Number.isFinite(raw.playtime)?Math.max(0,raw.playtime):0,settings:normalizeSettings(raw.settings),events:['migration:v1'],legacyArchive:{version:1,stage:typeof raw.stage==='string'?raw.stage:'home',memories:strings(raw.memories),events:strings(raw.events),quests:strings(raw.quests)}};
 const storyScene=Number.isInteger(raw.storyScene)&&raw.storyScene>=0&&raw.storyScene<=12?raw.storyScene:0;
 let stage=stageIds.has(raw.stage)?raw.stage:sceneById(storyScene).stage;
 // Completed optional exploration is available only in the parents' period.
 const optional=['alley','playground','store','school'].includes(stage)&&storyScene>=1&&storyScene<=3;
 const interlude=stage==='brother-room'&&[0,2,11].includes(storyScene);
 if(!optional&&!interlude&&stage!==sceneById(storyScene).stage)stage=sceneById(storyScene).stage;
 const width=STAGES.find(s=>s.id===stage).width;
 const choices=Object.fromEntries(Object.entries(raw.choices||{}).filter(([key,value])=>key!=='__proto__'&&typeof value==='string'));
 return {...freshSave(),storyScene,stage,x:Number.isFinite(raw.x)?Math.max(40,Math.min(width-40,raw.x)):300,
  dialogueVisits:Object.fromEntries(Object.entries(raw.dialogueVisits||{}).filter(([k,v])=>k!=='__proto__'&&Number.isInteger(v)&&v>=0).map(([k,v])=>[k,Math.min(v,100000)])),
  cutscenesSeen:strings([...strings(raw.cutscenesSeen),...(raw.version===2?strings(raw.events).filter(e=>['story:hero','story:door','mask-equipped'].includes(e)).map(e=>({'story:hero':'hero','story:door':'door','mask-equipped':'mask'})[e]):[])]).filter(k=>/^(hero|door|mask|brother)(:v1\.2)?$/.test(k)),
  interludeReturn:interlude?{stage:sceneById(storyScene).stage,x:Number.isFinite(raw.interludeReturn?.x)?Math.max(40,Math.min(STAGES.find(s=>s.id===sceneById(storyScene).stage).width-40,raw.interludeReturn.x)):300}:null,
  events:strings(raw.events),memories:strings(raw.memories).filter(id=>memoryIds.has(id)),quests:strings(raw.quests),visited:strings(raw.visited).filter(id=>stageIds.has(id)),inspected:strings(raw.inspected),choices,
  legacyArchive:raw.legacyArchive?.version===1?{version:1,stage:String(raw.legacyArchive.stage||'home'),memories:strings(raw.legacyArchive.memories),events:strings(raw.legacyArchive.events),quests:strings(raw.legacyArchive.quests)}:null,
  playtime:Number.isFinite(raw.playtime)?Math.max(0,raw.playtime):0,updatedAt:typeof raw.updatedAt==='string'?raw.updatedAt:null,settings:normalizeSettings(raw.settings)};
}
export function loadSave(storage){try{
 const store=storage??globalThis.localStorage,serialized=store.getItem(SAVE_KEY);if(!serialized)return {state:null,error:null,migrated:false};
 const raw=JSON.parse(serialized),state=normalizeSave(raw);let backupError=false;
 if(state&&raw.version<3){try{const key=raw.version===1?BACKUP_KEY:V2_BACKUP_KEY;if(!store.getItem(key))store.setItem(key,serialized);}catch{backupError=true;}}
 return {state,error:state?null:(raw?.version>3?'future-version':'invalid'),migrated:raw.version===1,backupError};
 }catch{return {state:null,error:'unavailable',migrated:false};}}
export function writeSave(state,storage){try{
 const store=storage??globalThis.localStorage,previous=store.getItem(SAVE_KEY);let oldVersion=null;
 try{oldVersion=previous?JSON.parse(previous)?.version:null;}catch{/* A new game may replace explicitly discarded corrupt data. */}
 if(oldVersion===1||oldVersion===2){const key=oldVersion===1?BACKUP_KEY:V2_BACKUP_KEY;if(!store.getItem(key))store.setItem(key,previous);}
 state.updatedAt=new Date().toISOString();store.setItem(SAVE_KEY,JSON.stringify(state));return true;
 }catch{return false;}}
export function loadSettings(storage){try{return normalizeSettings(JSON.parse((storage??globalThis.localStorage).getItem(SETTINGS_KEY)||'{}'));}catch{return {...DEFAULT_SETTINGS};}}
export function writeSettings(settings,storage){try{(storage??globalThis.localStorage).setItem(SETTINGS_KEY,JSON.stringify(settings));return true;}catch{return false;}}
