import {test} from 'node:test';
import assert from 'node:assert/strict';
import {memoryPresentation,repeatedInspectionLine} from '../src/systems/memory-policy.js';
import {MOTHER_FAREWELL} from '../src/data/farewell.js';
import {ROOM_LAYOUTS,ROOM_FLOOR,decorationBounds,overlaps} from '../src/data/room-layouts.js';
import {STAGES,SCENES,EVENT_RECORDS} from '../src/story.js';
import {freshSave,normalizeSave} from '../src/save.js';
test('only the first inspection of an uncollected memory gets a full presentation',()=>{
 const s=freshSave();assert.equal(memoryPresentation(s,'family'),'full');s.memories.push('family');assert.equal(memoryPresentation(s,'family'),'brief');assert.equal(memoryPresentation(freshSave(),'family',{firstInspection:false}),'brief');
 assert.ok(repeatedInspectionLine('photo').text);assert.ok(!repeatedInspectionLine('photo').choices);
});
test('every interior uses one architecture layout and upper-wall windows',()=>{
 for(const stage of STAGES.filter(s=>s.kind==='interior')){const room=ROOM_LAYOUTS[stage.id];assert.ok(room,stage.id);for(const w of room.windows){assert.ok(w.y>=140&&w.y+w.h<=315,stage.id);assert.ok(w.x>=15&&w.x+w.w<stage.width-10);}
 const fixtures=decorationBounds(room);for(const d of fixtures){assert.equal(d.bottom,ROOM_FLOOR);assert.ok(d.left>=0&&d.right<=stage.width);}
 for(let i=0;i<fixtures.length;i++)for(const other of fixtures.slice(i+1))assert.equal(overlaps(fixtures[i],other),false);
 for(const e of stage.entities)if(e.object==='window'){assert.equal(e.mount,'wall');assert.ok(e.y<=315);}
 }
 assert.equal(ROOM_LAYOUTS.study.furniture.filter(f=>f.kind==='shelf').length,0);
});
test('farewell preserves requested text, provenance, chronology and scene IDs',()=>{
 assert.equal(MOTHER_FAREWELL.quote.text,'엄마 나갔다올게 건강하게 잘있어');assert.equal(MOTHER_FAREWELL.ending.text,'그 뒤로 다시는 엄마를 만날 수 없었다.');
 assert.equal(MOTHER_FAREWELL.sourceType,'dramatic_reconstruction');assert.equal(MOTHER_FAREWELL.quote.sourceType,'real_memory');assert.equal(MOTHER_FAREWELL.storyScene,6);assert.equal(SCENES.find(s=>s.id===6).next,7);assert.equal(SCENES.find(s=>s.id===7).stage,'father-home');
 assert.deepEqual(STAGES.find(s=>s.id==='farewell').entities.filter(e=>e.type==='npc').map(e=>e.character),['mother']);assert.equal(EVENT_RECORDS.find(e=>e.id==='mother-farewell').fact,null);
});
test('new seen state persists without resetting old saves or storing the transient cinematic map',()=>{
 const original={...freshSave(),storyScene:6,stage:'changed-home',memories:['family-change'],inspected:['family-record'],cutscenesSeen:['hero:v1.2','farewell:v1.4'],events:['story:mother-farewell']};
 const s=normalizeSave(original);assert.deepEqual(s.memories,original.memories);assert.deepEqual(s.cutscenesSeen,original.cutscenesSeen);assert.equal(s.storyScene,6);
 assert.equal(normalizeSave({...original,stage:'farewell'}).stage,'changed-home');assert.equal(normalizeSave({...original,storyScene:7,stage:'father-home'}).storyScene,7);
});

test('TV and wall mask have separate approach positions',()=>{const room=STAGES.find(s=>s.id==='home');const tv=room.entities.find(e=>e.id==='tv'),mask=room.entities.find(e=>e.id==='mask');assert.ok(Math.abs(tv.x-mask.x)>100);assert.equal(mask.mount,'wall');});
