import {sceneById} from './story.js';
import {catalog,chapterSupported} from './systems/catalog.js';
export const SAVE_KEY='life-story:save',SETTINGS_KEY='life-story:settings',BACKUP_KEY='life-story:save:v1-backup',V2_BACKUP_KEY='life-story:save:v2-backup',V3_BACKUP_KEY='life-story:save:v3-backup';
export const SAVE_VERSION=4;
export const DEFAULT_SETTINGS={sound:false,muted:true,masterVolume:.7,musicVolume:.4,sfxVolume:.7,ambience:'day',largeText:false,textSize:'normal',textSpeed:35,autoAdvance:false,autoDelay:1800,highContrast:false,captionBackground:true,reducedMotion:false};
const strings=value=>Array.isArray(value)?[...new Set(value.filter(v=>typeof v==='string'))]:[];
export function freshSave(){return {version:4,chapter:1,storyScene:0,stage:'present',x:300,events:[],memories:[],quests:[],visited:['present'],inspected:[],choices:{},objectStates:{},minigames:{},memoryTraces:{},unlockedRecalls:[],dialogueLog:[],readLineIds:[],chapterProgress:{1:{scenes:[],complete:false}},dialogueVisits:{},cutscenesSeen:[],interludeReturn:null,legacyArchive:null,playtime:0,updatedAt:null,settings:{...DEFAULT_SETTINGS}};}
const clamp=(v,min,max,fallback)=>Number.isFinite(v)?Math.min(max,Math.max(min,v)):fallback;
const safeKeys=o=>Object.entries(o&&typeof o==='object'&&!Array.isArray(o)?o:{}).filter(([k])=>!['__proto__','constructor','prototype'].includes(k));
function normalizeMini(id,value={}){
 const v=value&&typeof value==='object'?value:{};
 const common={plays:Math.floor(clamp(v.plays,0,100000,0)),sourceType:'dramatic_reconstruction'};
 if(id==='paper')return {...common,foldSteps:Math.floor(clamp(v.foldSteps,0,3,0)),distance:Math.round(clamp(v.distance,0,260,0)),bestDistance:Math.round(clamp(v.bestDistance,0,260,clamp(v.distance,0,260,0))),variant:v.variant==='배'?'배':'비행기'};
 if(id==='hero')return {...common,pose:['번쩍','당당하게','힘차게'].includes(v.pose)?v.pose:'당당하게'};
 const answers=typeof v.answers==='string'?v.answers.split(',').filter(a=>/^[012]$/.test(a)).slice(0,3):[];
 return {...common,answers:answers.join(','),answered:answers.length,correct:answers.filter(a=>a==='0').length};
}
export function normalizeSettings(raw={}){
 const sound=typeof raw?.muted==='boolean'?!raw.muted:raw?.sound===true;
 const textSize=['normal','large','xlarge'].includes(raw?.textSize)?raw.textSize:raw?.largeText?'large':'normal';
 return {sound,muted:!sound,masterVolume:clamp(raw?.masterVolume,0,1,.7),musicVolume:clamp(raw?.musicVolume,0,1,.4),sfxVolume:clamp(raw?.sfxVolume,0,1,.7),
  largeText:textSize!=='normal',textSize,textSpeed:[0,15,35,70].includes(raw?.textSpeed)?raw.textSpeed:35,autoAdvance:raw?.autoAdvance===true,autoDelay:clamp(raw?.autoDelay,800,6000,1800),
  highContrast:raw?.highContrast===true,captionBackground:raw?.captionBackground!==false,reducedMotion:raw?.reducedMotion===true,ambience:['day','dusk','night','cycle','rain'].includes(raw?.ambience)?raw.ambience:'day'};
}
export function normalizeSave(raw){
 if(!raw||![1,2,3,4].includes(raw.version))return null;
 if(raw.version===1)return {...freshSave(),playtime:Number.isFinite(raw.playtime)?Math.max(0,raw.playtime):0,settings:normalizeSettings(raw.settings),events:['migration:v1'],legacyArchive:{version:1,stage:typeof raw.stage==='string'?raw.stage:'home',memories:strings(raw.memories),events:strings(raw.events),quests:strings(raw.quests)}};
 const chapter=Number.isInteger(raw.chapter)?raw.chapter:1;if(!chapterSupported(chapter))return null;
 const storyScene=Number.isInteger(raw.storyScene)&&raw.storyScene>=0&&catalog.scene(chapter,raw.storyScene)?raw.storyScene:catalog.chapter(chapter).entry.scene;
 let stage=catalog.stage(raw.stage)?raw.stage:sceneById(storyScene,chapter).stage;
 // Completed optional exploration is available only in the parents' period.
 const optional=['alley','playground','store','school'].includes(stage)&&storyScene>=1&&storyScene<=3;
 const interlude=stage==='brother-room'&&[0,2,11].includes(storyScene);
 if(!optional&&!interlude&&stage!==sceneById(storyScene,chapter).stage)stage=sceneById(storyScene,chapter).stage;
 const width=catalog.stage(stage).width;
 const currentMemoryIds=new Set(catalog.chapter(chapter).memories.map(m=>m.id));
 const choices=Object.fromEntries(Object.entries(raw.choices||{}).filter(([key,value])=>key!=='__proto__'&&typeof value==='string'));
 return {...freshSave(),chapter,storyScene,stage,x:Number.isFinite(raw.x)?Math.max(40,Math.min(width-40,raw.x)):300,
  dialogueVisits:Object.fromEntries(Object.entries(raw.dialogueVisits||{}).filter(([k,v])=>k!=='__proto__'&&Number.isInteger(v)&&v>=0).map(([k,v])=>[k,Math.min(v,100000)])),
  cutscenesSeen:strings([...strings(raw.cutscenesSeen),...(raw.version===2?strings(raw.events).filter(e=>['story:hero','story:door','mask-equipped'].includes(e)).map(e=>({'story:hero':'hero','story:door':'door','mask-equipped':'mask'})[e]):[])]).filter(k=>/^(hero|door|mask|brother)(:v1\.2)?$/.test(k)),
  interludeReturn:interlude?{stage:sceneById(storyScene,chapter).stage,x:Number.isFinite(raw.interludeReturn?.x)?Math.max(40,Math.min(catalog.stage(sceneById(storyScene,chapter).stage).width-40,raw.interludeReturn.x)):300}:null,
  objectStates:Object.fromEntries(safeKeys(raw.objectStates).map(([k,v])=>[k,{on:v?.on!==false,opened:v?.opened===true,naps:Math.floor(clamp(v?.naps,0,999,0))}])),
  minigames:Object.fromEntries(safeKeys(raw.minigames).filter(([k])=>['paper','hero','study'].includes(k)).map(([k,v])=>[k,normalizeMini(k,v)])),
  memoryTraces:Object.fromEntries(safeKeys(raw.memoryTraces).filter(([,v])=>typeof v?.value==='string').map(([k,v])=>[k,{value:v.value.slice(0,200),sourceType:'dramatic_reconstruction'}])),
  unlockedRecalls:strings(raw.unlockedRecalls),readLineIds:strings(raw.readLineIds).slice(-2000),
  dialogueLog:Array.isArray(raw.dialogueLog)?raw.dialogueLog.filter(l=>typeof l?.text==='string'&&typeof l?.speaker==='string').slice(-250).map(l=>({id:String(l.id||''),speaker:l.speaker.slice(0,60),text:l.text.slice(0,2000),sourceType:['real_memory','fictional_dialogue','dramatic_reconstruction'].includes(l.sourceType)?l.sourceType:'dramatic_reconstruction',scene:Math.floor(clamp(l.scene,0,999,0)),chapter:Math.floor(clamp(l.chapter,1,999,1))})):[],
  chapterProgress:Object.fromEntries([...new Map([['1',{scenes:[],complete:false}],...safeKeys(raw.chapterProgress).filter(([k])=>/^\d+$/.test(k)).map(([k,v])=>[k,{scenes:Array.isArray(v?.scenes)?[...new Set(v.scenes.filter(Number.isInteger))]:[],complete:v?.complete===true}])])]),
  events:strings(raw.events),memories:strings(raw.memories).filter(id=>currentMemoryIds.has(id)),quests:strings(raw.quests),visited:strings(raw.visited).filter(id=>Boolean(catalog.stage(id))),inspected:strings(raw.inspected),choices,
  legacyArchive:raw.legacyArchive?.version===1?{version:1,stage:String(raw.legacyArchive.stage||'home'),memories:strings(raw.legacyArchive.memories),events:strings(raw.legacyArchive.events),quests:strings(raw.legacyArchive.quests)}:null,
  playtime:Number.isFinite(raw.playtime)?Math.max(0,raw.playtime):0,updatedAt:typeof raw.updatedAt==='string'?raw.updatedAt:null,settings:normalizeSettings(raw.settings)};
}
export const backupKey=v=>v===1?BACKUP_KEY:v===2?V2_BACKUP_KEY:V3_BACKUP_KEY;
export function loadSave(storage){try{
 const store=storage??globalThis.localStorage,serialized=store.getItem(SAVE_KEY);if(!serialized)return {state:null,error:null,migrated:false};
 const raw=JSON.parse(serialized),state=normalizeSave(raw);let backupError=false;
 if(state&&raw.version<4){try{const key=backupKey(raw.version);if(!store.getItem(key))store.setItem(key,serialized);}catch{backupError=true;}}
 return {state,error:state?null:(raw?.version>4?'future-version':'invalid'),migrated:raw.version===1,backupError};
 }catch{return {state:null,error:'unavailable',migrated:false};}}
export function writeSave(state,storage){try{
 const store=storage??globalThis.localStorage,previous=store.getItem(SAVE_KEY);let oldVersion=null;
 try{oldVersion=previous?JSON.parse(previous)?.version:null;}catch{/* A new game may replace explicitly discarded corrupt data. */}
 if(oldVersion>=1&&oldVersion<4){const key=backupKey(oldVersion);if(!store.getItem(key))store.setItem(key,previous);}
 state.updatedAt=new Date().toISOString();store.setItem(SAVE_KEY,JSON.stringify(state));return true;
 }catch{return false;}}
export function loadSettings(storage){try{return normalizeSettings(JSON.parse((storage??globalThis.localStorage).getItem(SETTINGS_KEY)||'{}'));}catch{return {...DEFAULT_SETTINGS};}}
export function writeSettings(settings,storage){try{(storage??globalThis.localStorage).setItem(SETTINGS_KEY,JSON.stringify(settings));return true;}catch{return false;}}
