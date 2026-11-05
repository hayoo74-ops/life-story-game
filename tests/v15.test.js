import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildingGeometry,stageArchitecture} from '../src/data/architecture.js';
import {STAGES} from '../src/story.js';
import {MOTHER_FAREWELL} from '../src/data/farewell.js';
import {freshSave,normalizeSave} from '../src/save.js';
const contained=(a,b)=>a.left>=b.left&&a.right<=b.right&&a.top>=b.top&&a.bottom<=b.bottom;
test('building openings belong to their facade at every hillside and street scale',()=>{
 for(let w=55;w<=600;w+=19)for(let h=48;h<=330;h+=23)for(const floors of [1,2,3]){
  const b=buildingGeometry({id:'owned',x:13,base:411,w,h,floors});
  for(const a of [...b.windows,b.entrance].filter(Boolean)){assert.equal(a.owner,b.id);assert.ok(contained(a,b.wall),JSON.stringify({w,h,a,b}));assert.ok(a.top>b.roof.bottom);}
 }
});
test('every outdoor stage uses nonoverlapping architecture and gap landscaping',()=>{
 for(const stage of STAGES){const {buildings,trees}=stageArchitecture(stage);for(const b of buildings)for(const t of trees)assert.ok(t.x+57*t.size<=b.x-20||t.x-55*t.size>=b.x+b.w+20);}
 const d=stageArchitecture(STAGES.find(s=>s.id==='daeyeon'));assert.equal(d.buildings.length,3);assert.ok(d.buildings.every(b=>b.roofType==='flat'));
});
test('farewell distinguishes exact remembered quote from artistic voice-over',()=>{
 assert.equal(MOTHER_FAREWELL.quote.sourceType,'real_memory');assert.equal(MOTHER_FAREWELL.quote.text,'엄마 나갔다올게 건강하게 잘있어');
 assert.deepEqual(MOTHER_FAREWELL.reflections.map(l=>l.text),['그날, 엄마는 나갔다 온다고 했다.','나는 그 말이 정말 외출 인사인 줄 알았다.','건강하게 잘있어.']);assert.ok(MOTHER_FAREWELL.reflections.every(l=>l.sourceType==='dramatic_reconstruction'));
 assert.equal(MOTHER_FAREWELL.ending.text,'그 뒤로 다시는 엄마를 만날 수 없었다.');
});
test('v1.5 does not reset v4 progress or v1.4 seen markers',()=>{const s=freshSave();s.storyScene=7;s.stage='father-home';s.memories=['family-change'];s.cutscenesSeen=['farewell:v1.4','farewell:v1.5'];const out=normalizeSave(s);assert.equal(out.storyScene,7);assert.deepEqual(out.cutscenesSeen,s.cutscenesSeen);assert.deepEqual(out.memories,s.memories);});
