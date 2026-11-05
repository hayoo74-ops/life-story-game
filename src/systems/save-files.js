import {gameStorage} from './runtime-storage.js';
import {normalizeSave,SAVE_KEY,writeSave,SAVE_VERSION} from '../save.js';
import {catalog,chapterSupported} from './catalog.js';
const LIMIT=2*1024*1024;
export const IMPORT_BACKUP_KEY='life-story:save:before-import';
export function checksum(value){let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0');}
export function exportSave(state,now=new Date().toISOString()){
 const copy=JSON.parse(JSON.stringify(state));return JSON.stringify({format:'LIFE_STORY_SAVE',formatVersion:1,createdAt:now,checksum:checksum(JSON.stringify(copy)),state:copy},null,2);
}
export function parseSaveFile(text){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>LIMIT)return {ok:false,error:'파일이 너무 크거나 읽을 수 없습니다. 최대 2MB입니다.'};
 let envelope;try{envelope=JSON.parse(text);}catch{return {ok:false,error:'JSON 파일이 손상되었습니다.'};}
 let raw=envelope;
 if(envelope?.format!==undefined){if(envelope.format!=='LIFE_STORY_SAVE'||envelope.formatVersion!==1||!envelope.state)return {ok:false,error:'지원하지 않는 저장 파일 형식입니다.'};raw=envelope.state;if(envelope.checksum!==checksum(JSON.stringify(raw)))return {ok:false,error:'파일 내용의 무결성 검사가 실패했습니다.'};}
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||!Number.isInteger(raw.version))return {ok:false,error:'게임 저장 데이터가 아닙니다.'};
 if(raw.version>SAVE_VERSION)return {ok:false,error:'더 새로운 게임 버전의 저장 파일입니다.'};
 if(raw.version<1)return {ok:false,error:'지원하지 않는 이전 버전입니다.'};
 if(!chapterSupported(raw.chapter||1))return {ok:false,error:'아직 플레이할 수 없는 챕터의 저장입니다.'};
 if(typeof raw.stage!=='string'||!Number.isFinite(raw.x)||!Array.isArray(raw.events)||!Array.isArray(raw.memories))return {ok:false,error:'필수 진행 정보가 올바르지 않습니다.'};
 if(raw.version>=2&&(!Number.isInteger(raw.storyScene)||!catalog.scene(raw.chapter||1,raw.storyScene)))return {ok:false,error:'장면 정보가 올바르지 않습니다.'};
 if(!catalog.stage(raw.stage))return {ok:false,error:'알 수 없는 장소입니다.'};
 for(const key of ['events','memories','quests','visited','inspected','readLineIds'])if(raw[key]!==undefined&&(!Array.isArray(raw[key])||raw[key].some(v=>typeof v!=='string')))return {ok:false,error:'목록 데이터의 형식이 잘못되었습니다.'};
 for(const key of ['choices','settings','dialogueVisits','objectStates','minigames','memoryTraces','chapterProgress'])if(raw[key]!==undefined&&(!raw[key]||typeof raw[key]!=='object'||Array.isArray(raw[key])))return {ok:false,error:'저장 항목의 형식이 잘못되었습니다.'};
 const state=normalizeSave(raw);if(state&&raw.version>=2&&state.stage!==raw.stage)return {ok:false,error:'장면과 장소가 서로 맞지 않습니다.'};return state?{ok:true,state,fromVersion:raw.version}:{ok:false,error:'저장 데이터를 복구할 수 없습니다.'};
}
export function importSaveText(text,storage){
 const parsed=parseSaveFile(text);if(!parsed.ok)return parsed;
 try{const target=storage??gameStorage(),old=target.getItem(SAVE_KEY);if(old!==null)target.setItem(IMPORT_BACKUP_KEY,old);if(!writeSave(parsed.state,target))return {ok:false,error:'저장 공간이 부족해 복구하지 못했습니다. 기존 진행은 유지됩니다.'};return parsed;}
 catch{return {ok:false,error:'브라우저 저장소에 쓸 수 없습니다. 기존 진행은 유지됩니다.'};}
}
