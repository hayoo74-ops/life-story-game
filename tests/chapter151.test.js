import {recordChoice,albumTraces} from '../src/systems/progress.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {clockReading} from '../src/systems/wall-clocks.js';
import {DIALOGUES,OBJECT_TEXT,HERO_SEQUENCE} from '../src/data/dialogue.js';
import {STAGES,MEMORIES} from '../src/story.js';
import {stageArchitecture} from '../src/data/architecture.js';
import {freshSave,normalizeSave} from '../src/save.js';
function walk(lines,fn){for(const line of lines){fn(line);for(const c of line.choices||[])walk(c.lines,fn);}}
test('clock follows local device hours/minutes at midday and midnight, independently of story time',()=>{
 const a=clockReading(new Date(2026,10,5,13,45,30));assert.equal(a.label,'13:45');assert.equal(a.hourAngle,1.75*Math.PI/6);assert.equal(a.minuteAngle,45*Math.PI/30);
 assert.equal(clockReading(new Date(2026,10,6,0,1)).label,'00:01');assert.equal(clockReading(new Date(2026,10,5,23,59)).label,'23:59');
});
test('all parent branches and hero child lines use casual speech; grandparents keep respectful replies',()=>{
 const polite=/(요|습니다|세요|죠)[.!?]?$/;
 for(const key of ['mother','father','fatherChanged','fatherAlone'])for(const storyScene of [1,2,3,6,7])for(let visit=0;visit<3;visit++)for(const tv of ['뭐 하나 보여 줄래요','옆에 앉을래요']){
  const s={...freshSave(),storyScene,events:visit%2?['brother:paper']:[],dialogueVisits:{[key+':'+storyScene]:visit},choices:{'father-tv':tv,'father-meal':'수저를 놓는다'}};
  walk(DIALOGUES[key](s),l=>{if(l.character==='child'){assert.ok(!polite.test(l.text),l.text);for(const c of l.choices||[])assert.ok(!polite.test(c.label),c.label);}});
 }
 walk([...OBJECT_TEXT.tv,...OBJECT_TEXT.sofa,...OBJECT_TEXT.mask,...HERO_SEQUENCE],l=>{if(l.character==='child')assert.ok(!polite.test(l.text),l.text);});
 for(const key of ['grandma','grandpa'])for(const storyScene of [9,10])for(let n=0;n<3;n++)walk(DIALOGUES[key]({...freshSave(),storyScene,dialogueVisits:{[key+':'+storyScene]:n}}),l=>{if(l.character==='child')assert.match(l.text,/(요|죠)[.!?]?$/);});
 assert.match(OBJECT_TEXT.books.at(-1).text,/요\.$/);
});
test('visible casual options retain prior saved choice values and old progress',()=>{
 const option=DIALOGUES.father({...freshSave(),storyScene:2}).find(l=>l.choices).choices[1];assert.equal(option.label,'뭐 하나 보여 줄래');assert.equal(option.value,'뭐 하나 보여 줄래요');
 const old={...freshSave(),storyScene:7,stage:'father-home',memories:['family','tv','hero'],choices:{'father-tv':option.value}};const restored=normalizeSave(old);assert.equal(restored.version,4);assert.equal(restored.storyScene,7);assert.deepEqual(restored.memories,old.memories);assert.deepEqual(restored.choices,old.choices);recordChoice(restored,'father-tv',option.value,option.label);assert.equal(restored.choices['father-tv'],option.value);assert.equal(albumTraces(restored).find(t=>t.id==='father-tv').text,option.label);restored.memoryTraces['father-tv'].value=option.value;assert.equal(albumTraces(restored).find(t=>t.id==='father-tv').text,option.label);
});
test('N64 memory is optional, factual recollection with staged art, using the existing save schema',()=>{
 const memory=MEMORIES.find(m=>m.id==='console64');assert.ok(memory.kinds.includes('fact'));assert.ok(memory.kinds.includes('staged'));assert.match(memory.text,/부모님과.*첫 콘솔게임기/);assert.match(memory.text,/슈퍼마리오64/);
 const object=STAGES.find(s=>s.id==='home').entities.find(e=>e.id==='console64');assert.equal(object.parentId,'tv');assert.equal(object.mount,'attachment');
 const s=normalizeSave({...freshSave(),storyScene:2,stage:'home',memories:['console64'],inspected:['console64']});assert.deepEqual(s.memories,['console64']);assert.deepEqual(s.inspected,['console64']);
});
test('parents have explicit sofa seats within the cushion rather than cropped standing frames',()=>{
 const home=STAGES.find(s=>s.id==='home'),sofa=home.entities.find(e=>e.id==='sofa');
 for(const id of ['father','mother']){const npc=home.entities.find(e=>e.id===id);assert.equal(npc.pose,'seated');assert.equal(npc.seatId,'sofa');assert.ok(npc.x-32>sofa.x-127&&npc.x+32<sofa.x+127);}
 assert.ok(!STAGES.find(s=>s.id==='farewell').entities.find(e=>e.type==='npc').pose);
});
test('districts have distinct period architecture without invented business names or window/utility collisions',()=>{
 const old=stageArchitecture(STAGES.find(s=>s.id==='alley')),urban=stageArchitecture(STAGES.find(s=>s.id==='daeyeon'));assert.equal(old.era,'late-1990s');assert.equal(urban.era,'mid-2000s');assert.ok(old.buildings.every(b=>b.roofType==='tile'));assert.ok(urban.buildings.every(b=>b.roofType==='flat'));
 for(const s of STAGES){const a=stageArchitecture(s);for(const b of a.buildings){assert.equal(b.sign,null);for(const w of b.windows){assert.ok(w.top>b.roof.bottom);for(const pole of a.utilities)assert.ok(pole.x+25<w.left||pole.x-17>w.right);for(const wire of a.wires)assert.ok(w.top>wire.bottom);}}}
});
