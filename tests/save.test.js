import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshSave,normalizeSave,loadSave,writeSave,loadSettings,writeSettings,SAVE_KEY} from '../src/save.js';
const storage=()=>{const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};};
test('전체 진행 및 설정이 저장 후 동일하게 복원된다',()=>{
  const store=storage();const state={...freshSave(),stage:'school',x:1340,events:['opening-complete','greet-grandma','chapter-1-complete'],memories:['photo','bag'],quests:['greeting','neighborhood-walk'],visited:['home','alley','playground','store','school'],settings:{sound:true,ambience:'rain',largeText:true,reducedMotion:false}};
  assert.equal(writeSave(state,store),true);assert.deepEqual(loadSave(store).state,state);
  writeSettings(state.settings,store);assert.deepEqual(loadSettings(store),state.settings);
});
test('손상된 좌표·스테이지·중복 데이터는 안전하게 정규화된다',()=>{
  const state=normalizeSave({...freshSave(),stage:'missing',x:Infinity,memories:['photo','missing','photo'],events:['a','a',null],visited:['home','bad']});
  assert.equal(state.stage,'home');assert.equal(state.x,280);assert.deepEqual(state.memories,['photo']);assert.deepEqual(state.events,['a']);assert.deepEqual(state.visited,['home']);
  assert.equal(normalizeSave({...freshSave(),stage:'school',x:100000}).x,1610);
  assert.equal(normalizeSave({...freshSave(),x:-100}).x,40);
});
test('새 버전과 손상된 저장은 덮어쓰지 않고 오류를 반환한다',()=>{
  const store=storage();store.setItem(SAVE_KEY,'{');assert.equal(loadSave(store).error,'unavailable');assert.equal(store.getItem(SAVE_KEY),'{');
  store.setItem(SAVE_KEY,JSON.stringify({version:999}));assert.equal(loadSave(store).error,'future-version');
  assert.equal(loadSave(storage()).state,null);
});
test('저장 공간 차단 및 용량 오류는 게임을 중단시키지 않는다',()=>{
  const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('quota');}};
  assert.equal(loadSave(blocked).state,null);assert.equal(writeSave(freshSave(),blocked),false);assert.equal(writeSettings({},blocked),false);
});
