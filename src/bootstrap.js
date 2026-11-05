import {initializeNativeStorage} from './systems/runtime-storage.js';
try{await initializeNativeStorage();await import('./main.js');}
catch(error){console.error('Game startup failed',error);const node=document.querySelector('#loading');if(node)node.textContent='게임을 열지 못했습니다. 앱을 다시 실행해 주세요. 저장 데이터는 삭제하지 않습니다.';}
