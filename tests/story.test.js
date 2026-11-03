import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CHAPTERS,STAGES,MEMORIES,DIALOGUES} from '../src/story.js';
test('챕터 1의 다섯 장소는 양방향으로 연결되고 후속 챕터는 잠겨 있다',()=>{
  assert.equal(STAGES.length,5);assert.deepEqual(CHAPTERS.filter(c=>c.status==='playable').map(c=>c.id),[1]);
  for(const stage of STAGES){for(const portal of stage.entities.filter(e=>e.type==='portal')){const target=STAGES.find(s=>s.id===portal.target);assert.ok(target);assert.ok(target.entities.some(e=>e.target===stage.id));assert.ok(portal.spawn>=40&&portal.spawn<target.width-40);}}
  const visited=new Set();const walk=id=>{if(visited.has(id))return;visited.add(id);STAGES.find(s=>s.id===id).entities.filter(e=>e.type==='portal').forEach(e=>walk(e.target));};walk('home');assert.equal(visited.size,5);
});
test('모든 기억과 NPC에는 유효한 데이터가 있고 모든 대화 선택은 다음으로 이어진다',()=>{
  const found=[];function validateLines(lines){assert.ok(lines.length>0);for(const l of lines){assert.equal(typeof l.speaker,'string');assert.equal(typeof l.text,'string');if(l.choices){assert.ok(l.choices.length>=2);for(const c of l.choices)validateLines(c.lines);}}}
  for(const stage of STAGES){for(const entity of stage.entities){assert.ok(entity.x>0&&entity.x<stage.width);if(entity.memory){assert.ok(MEMORIES.some(m=>m.id===entity.memory));found.push(entity.memory);}if(entity.type==='npc'){assert.equal(typeof DIALOGUES[entity.dialogue],'function');validateLines(DIALOGUES[entity.dialogue]({events:[]}));validateLines(DIALOGUES[entity.dialogue]({events:['greet-grandma','chapter-1-complete']}));}}}
  assert.equal(new Set(found).size,MEMORIES.length);
});
