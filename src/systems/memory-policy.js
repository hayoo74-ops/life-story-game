import {narrate} from '../data/dialogue.js';
const RESPONSES={photo:'낯익은 얼굴들을 마음속에만 담아 두었다.',toy:'손끝에 익은 장난감이다.',books:'익숙한 책등을 천천히 훑어보았다.',desk:'책상에 남은 자국은 그대로다.',window:'창밖을 잠깐 바라보았다.'};
export function repeatedInspectionLine(objectId){return narrate(RESPONSES[objectId]||'이미 여러 번 보았던 기억이다.');}
export function memoryPresentation(state,id,{firstInspection=true}={}){return firstInspection&&!state.memories.includes(id)?'full':'brief';}
