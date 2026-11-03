import { STAGES, MEMORIES } from './story.js';
export const SAVE_KEY='life-story:save';
export const SETTINGS_KEY='life-story:settings';
export const SAVE_VERSION=1;
export const DEFAULT_SETTINGS={sound:false,ambience:'day',largeText:false,reducedMotion:false};
const stageIds=new Set(STAGES.map(s=>s.id));
const memoryIds=new Set(MEMORIES.map(m=>m.id));
export function freshSave(){return {version:SAVE_VERSION,chapter:1,stage:'home',x:280,events:[],memories:[],quests:[],visited:['home'],playtime:0,updatedAt:null,settings:{...DEFAULT_SETTINGS}};}
function uniqueStrings(value){return Array.isArray(value)?[...new Set(value.filter(v=>typeof v==='string'))]:[];}
export function normalizeSave(raw){
  if(!raw || raw.version!==SAVE_VERSION) return null;
  const stage=stageIds.has(raw.stage)?raw.stage:'home';
  const width=STAGES.find(s=>s.id===stage).width;
  return {...freshSave(),chapter:1,stage,x:Number.isFinite(raw.x)?Math.min(width-40,Math.max(40,raw.x)):280,
    events:uniqueStrings(raw.events),memories:uniqueStrings(raw.memories).filter(id=>memoryIds.has(id)),
    quests:uniqueStrings(raw.quests),visited:uniqueStrings(raw.visited).filter(id=>stageIds.has(id)),
    playtime:Number.isFinite(raw.playtime)?Math.max(0,raw.playtime):0,updatedAt:typeof raw.updatedAt==='string'?raw.updatedAt:null,
    settings:normalizeSettings(raw.settings)};
}
export function normalizeSettings(raw={}){
  return {sound:raw?.sound===true,largeText:raw?.largeText===true,reducedMotion:raw?.reducedMotion===true,
    ambience:['day','dusk','night','cycle','rain'].includes(raw?.ambience)?raw.ambience:'day'};
}
export function loadSave(storage){
  try{const value=(storage??globalThis.localStorage).getItem(SAVE_KEY);if(!value)return {state:null,error:null};const parsed=JSON.parse(value);const state=normalizeSave(parsed);return {state,error:state?null:(parsed?.version>SAVE_VERSION?'future-version':'invalid')};}
  catch{return {state:null,error:'unavailable'};}
}
export function writeSave(state,storage){
  try{state.updatedAt=new Date().toISOString();(storage??globalThis.localStorage).setItem(SAVE_KEY,JSON.stringify(state));return true;}catch{return false;}
}
export function loadSettings(storage){try{return normalizeSettings(JSON.parse((storage??globalThis.localStorage).getItem(SETTINGS_KEY)||'{}'));}catch{return {...DEFAULT_SETTINGS};}}
export function writeSettings(settings,storage){try{(storage??globalThis.localStorage).setItem(SETTINGS_KEY,JSON.stringify(settings));return true;}catch{return false;}}
