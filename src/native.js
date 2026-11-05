import {Capacitor} from '@capacitor/core';
import {flushNativeStorage} from './systems/runtime-storage.js';
export const isNative=()=>Capacitor.isNativePlatform();
export async function installNativeLifecycle({pause,back}){
 if(!isNative())return;
 const {App}=await import('@capacitor/app');const {StatusBar}=await import('@capacitor/status-bar');const {SplashScreen}=await import('@capacitor/splash-screen');
 await StatusBar.hide().catch(()=>{});await SplashScreen.hide().catch(()=>{});
 await App.addListener('appStateChange',({isActive})=>{pause(!isActive);if(!isActive)flushNativeStorage().catch(()=>window.dispatchEvent(new CustomEvent('native-storage-error')));});
 await App.addListener('backButton',()=>back(()=>App.exitApp()));
 document.body.classList.add('native-app');
}
export async function nativeExport(text){
 if(!isNative())return false;
 const {Filesystem,Directory,Encoding}=await import('@capacitor/filesystem');const {Share}=await import('@capacitor/share');
 const {uri}=await Filesystem.writeFile({path:'life-story-save.json',data:text,directory:Directory.Cache,encoding:Encoding.UTF8});await Share.share({title:'LIFE STORY 저장 백업',files:[uri]});return true;
}
