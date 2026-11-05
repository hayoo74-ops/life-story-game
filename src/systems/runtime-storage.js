// Browsers keep their existing LocalStorage. Native boots hydrate Preferences
// before the game reads any save, preserving the same keys and schema.
let nativeStore=null;
export function gameStorage(){return nativeStore||globalThis.localStorage;}
export async function initializeNativeStorage(){
 const {Capacitor}=await import('@capacitor/core');if(!Capacitor.isNativePlatform())return;
 const {Preferences}=await import('@capacitor/preferences');const cache=new Map();let pending=Promise.resolve(),failure=null;
 const keys=(await Preferences.keys()).keys.filter(k=>k.startsWith('life-story:'));
 for(const key of keys){const {value}=await Preferences.get({key});if(value!==null)cache.set(key,value);}
 // Preserve a pre-Preferences WebView save without touching any browser's data.
 for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith('life-story:')&&!cache.has(key)){const value=localStorage.getItem(key);await Preferences.set({key,value});cache.set(key,value);}}
 nativeStore={
  getItem:key=>cache.get(key)??null,
  setItem(key,value){cache.set(key,String(value));pending=pending.then(()=>Preferences.set({key,value:String(value)})).catch(error=>{failure=String(error);window.dispatchEvent(new CustomEvent('native-storage-error'));});},
  async flush(){await pending;if(failure)throw new Error(failure);},
  diagnostics:()=>({kind:'Android Preferences',pendingError:failure})
 };
}
export async function flushNativeStorage(){await nativeStore?.flush();}
