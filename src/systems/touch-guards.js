// Keep long holds as game input. Do not cancel taps on menus, selects or file inputs.
export function installTouchGuards(root=document){
 const button=e=>e.target?.closest?.('button,.control');
 for(const type of ['contextmenu','selectstart','dragstart'])root.addEventListener(type,e=>{if(button(e)&&e.cancelable)e.preventDefault();},{capture:true});
 for(const type of ['touchstart','touchmove'])root.addEventListener(type,e=>{if(e.target?.closest?.('[data-control]')&&e.cancelable)e.preventDefault();},{capture:true,passive:false});
}
