import Phaser from 'phaser';
import { createBackdrops, createStageArt, createCharacters, createObjectArt, createParticleArt, createNarrativeArt } from './art.js';
import { stageById } from './story.js';

const FLOOR=458;
export class LifeScene extends Phaser.Scene{
  constructor(bridge){super('Life');this.bridge=bridge;this.controls={left:false,right:false,jump:false};this.jumpQueued=false;this.nearest=null;this.stage=null;this.isTitle=true;}
  create(){
    this.bridge.portraits=createCharacters(this);createObjectArt(this);createNarrativeArt(this);createParticleArt(this);createBackdrops(this);
    this.sky=this.add.tileSprite(0,0,4096,540,'sky').setOrigin(0).setScrollFactor(0).setDepth(-30);
    this.hills=this.add.tileSprite(0,0,4096,540,'hillside').setOrigin(0).setScrollFactor(0).setDepth(-20);
    this.keys=this.input.keyboard.addKeys({left:'LEFT',right:'RIGHT',a:'A',d:'D',jump:'SPACE',w:'W',up:'UP',interact:'E'});
    this.input.keyboard.on('keydown-E',e=>{if(!e.repeat)this.bridge.interact();});
    this.input.keyboard.on('keydown-ESC',()=>this.bridge.escape());
    this.input.keyboard.on('keydown-ENTER',e=>{if(!e.repeat&&this.bridge.advance())e.preventDefault();});
    this.input.keyboard.addCapture(['SPACE','UP','DOWN','LEFT','RIGHT']);
    this.rain=this.add.graphics().setScrollFactor(0).setDepth(11);this.atmosphere=this.add.rectangle(0,0,4096,540,0xad814e,0).setOrigin(0).setScrollFactor(0).setDepth(10);
    this.lampGlow=this.add.graphics().setScrollFactor(0).setDepth(12).setBlendMode(Phaser.BlendModes.ADD);
    this.scale.on('resize',()=>{if(this.stage){this.cameras.main.setBounds(0,0,Math.max(this.stage.width,this.scale.width),540);if(this.isTitle)this.cameras.main.setScroll(Math.max(0,1075-this.scale.width*.65),0);}});
    this.loadStage('alley',920,true);
    this.bridge.onReady(this);
  }
  setControl(key,value){if(key==='jump'&&value&&!this.controls.jump)this.jumpQueued=true;this.controls[key]=value;}
  clearControls(){this.controls={left:false,right:false,jump:false};this.jumpQueued=false;if(this.player?.body)this.player.setVelocityX(0);}
  loadStage(id,x,title=false){
    this.visualGeneration=(this.visualGeneration||0)+1;this.tweens.killAll();this.visualActive=false;this.clearControls();this.isTitle=title;this.nearest=null;this.bridge.onNearest(null);
    this.cameras.main.setZoom(1);
    this.collider?.destroy();this.stageObjects?.forEach(o=>o.destroy());this.stageObjects=[];this.floor?.destroy();this.player?.destroy();this.playerName?.destroy();this.playerShadow?.destroy();this.entities=[];
    this.stage=stageById(id);const stage=this.stage;
    const add=o=>{this.stageObjects.push(o);return o;};
    add(this.add.image(0,0,createStageArt(this,stage)).setOrigin(0).setDepth(0));
    this.floor=this.add.zone(stage.width/2,FLOOR+12,stage.width,24);this.physics.add.existing(this.floor,true);
    this.physics.world.setBounds(0,-100,stage.width,FLOOR+100);
    this.playerShadow=this.add.ellipse(x,FLOOR+3,39,9,0x344e35,.20).setDepth(3);
    this.playerKey=stage.player||(!title&&this.bridge.state?.storyScene===3?'hero':'child');
    this.player=this.physics.add.sprite(x,FLOOR,'char-'+this.playerKey,0).setScale(2).setOrigin(.5,1).setDepth(5);
    this.player.body.setSize(14,31).setOffset(9,8);this.player.setCollideWorldBounds(true);this.player.setMaxVelocity(250,650);
    this.collider=this.physics.add.collider(this.player,this.floor);this.player.anims.play(this.playerKey+'-idle');
    this.playerName=this.add.text(x,FLOOR-89,'재원',{fontFamily:'sans-serif',fontSize:'11px',color:'#f9f1d3',stroke:'#617156',strokeThickness:3}).setOrigin(.5).setDepth(7);
    for(const data of stage.entities){
      let sprite;let top;
      if(data.type==='npc'){
        add(this.add.ellipse(data.x,FLOOR+3,35,8,0x344e35,.17).setDepth(2));
        sprite=add(this.add.sprite(data.x,FLOOR,'char-'+data.character,0).setScale(2).setOrigin(.5,1).setDepth(4));sprite.anims.play(data.character+'-idle');top=FLOOR-86;if(stage.variant==='family'&&['father','mother'].includes(data.id)){sprite.setCrop(0,0,32,32);sprite.setFlipX(data.id==='mother');}
      }else{
        const art=data.art||(data.type==='event'?'finish':'portal');
        sprite=add(this.add.image(data.x,FLOOR,'obj-'+art).setOrigin(.5,1).setDepth(2));top=FLOOR-sprite.height-12;
      }
      const label=add(this.add.text(data.x,top,data.label,{fontFamily:'sans-serif',fontSize:'11px',color:'#f9f2d9',backgroundColor:'#4b6247d9',padding:{left:7,right:7,top:4,bottom:4}}).setOrigin(.5,1).setDepth(7));
      const indicator=add(this.add.text(data.x,top-32,data.type==='npc'?'···':'✦',{fontFamily:'sans-serif',fontSize:'16px',color:'#fff1bc',stroke:'#63704b',strokeThickness:3}).setOrigin(.5,1).setDepth(7));
      indicator.setVisible(false);
      let sparkle=null;if(data.type==='object')sparkle=add(this.add.image(data.x+18,top+20,'spark').setAlpha(.8).setDepth(6));
      this.entities.push({data,sprite,label,indicator,sparkle,top});
    }
    const interior=['interior','shop'].includes(stage.kind);this.sky.setVisible(!interior);this.hills.setVisible(!interior);
    this.cameras.main.setBounds(0,0,Math.max(stage.width,this.scale.width),540);
    this.cameras.main.startFollow(this.player,true,this.bridge.settings.reducedMotion?1:.085,1);
    this.cameras.main.setScroll(Phaser.Math.Clamp(x-this.scale.width/2,0,Math.max(0,stage.width-this.scale.width)),0);
    if(title){this.player.setX(1075);this.cameras.main.stopFollow();this.cameras.main.setScroll(Math.max(0,1075-this.scale.width*.65),0);this.playerName.setVisible(false);for(const e of this.entities){e.label.setVisible(false);e.indicator.setVisible(false);}}
    else{this.bridge.onStage(stage);this.cameras.main.fadeIn(this.bridge.settings.reducedMotion?0:420,241,229,199);}
    this.updateSettings();this.refreshMemories();
  }
  refreshMemories(){for(const e of this.entities||[]){if(e.sparkle)e.sparkle.setVisible(!this.bridge.state?.inspected.includes(e.data.id));}}
  startVisual(kind){
    this.visualGeneration=(this.visualGeneration||0)+1;this.visualActive=true;this.visualKind=kind;this.visualObjects=[];
    this.visualStart={x:this.player.x,y:this.player.y,key:this.playerKey};this.player.setVisible(true).setAngle(0).setY(FLOOR);this.player.anims.stop();
    this.cameras.main.stopFollow();
    if(kind==='hero'){
      this.player.setPosition(540,FLOOR).setTexture('char-hero',0).setFlipX(false);
      this.cameras.main.setScroll(Phaser.Math.Clamp(680-this.scale.width/2,0,this.stage.width-this.scale.width),0);
    }else if(kind==='brother'){
      this.player.setPosition(410,FLOOR).setFlipX(false);
      this.cameras.main.setScroll(Phaser.Math.Clamp(540-this.scale.width/2,0,this.stage.width-this.scale.width),0);
    }else if(kind==='door'){
      this.player.setPosition(1020,FLOOR).setFlipX(false);
      const father=this.entities.find(e=>e.data.id==='father-door');if(father){father.sprite.setX(1120);father.label.setX(1120);}
      this.cameras.main.setScroll(Phaser.Math.Clamp(1150-this.scale.width/2,0,this.stage.width-this.scale.width),0);
    }
  }
  async playBeat(action){
    const gen=this.visualGeneration,reduced=this.bridge.settings.reducedMotion;
    const actor=id=>this.entities.find(e=>e.data.id===id)?.sprite;
    const add=o=>{this.stageObjects.push(o);if(this.visualActive)this.visualObjects.push(o);return o;};
    const wait=ms=>new Promise(resolve=>this.time.delayedCall(reduced?Math.min(ms,80):ms,resolve));
    if(action==='wear-mask'){await this.playVisual('mask');return;}
    if(action==='door-impact'){await this.playVisual('door');return;}
    let duration=0;
    if(action==='watch-tv'){
      const glow=add(this.add.rectangle(710,382,48,34,0xb9d7b0,.22).setDepth(3));
      if(!reduced)this.tweens.add({targets:glow,alpha:.65,yoyo:true,repeat:-1,duration:450});
      for(const id of ['father','mother']){const p=actor(id);if(p)this.tweens.add({targets:p,y:FLOOR-2,yoyo:true,duration:240});}
      duration=260;
    }else if(action==='step-forward'){
      this.tweens.add({targets:this.player,x:570,duration:reduced?50:260});duration=270;
    }else if(action==='hero-pose'){
      this.player.setVisible(true).setTexture('char-hero',6);this.bridge.sound.effect('tap');duration=160;
    }else if(action==='mother-look'||action==='mother-smile'){
      const mother=actor('mother');if(mother){mother.setFrame(action==='mother-smile'?7:8);this.tweens.add({targets:mother,y:FLOOR-3,angle:-2,yoyo:true,duration:180});}duration=200;
    }else if(action==='father-prank'){
      const father=actor('father');if(father){father.setCrop();father.setFrame(7);this.tweens.add({targets:father,x:600,duration:200});}
      this.player.setVisible(false);this.playerName.setVisible(false);this.playerShadow.setVisible(false);duration=210;
    }else if(action==='tv-cutaway'){
      this.player.setVisible(false);this.cameras.main.setZoom(reduced?1:1.25);
      this.cameras.main.setScroll(Phaser.Math.Clamp(720-this.scale.width/2,0,this.stage.width-this.scale.width),0);
      duration=160;
    }else if(action==='family-laugh'){
      const laugh=add(this.add.text(650,338,'하 하 하',{fontSize:'16px',color:'#fff0bd',stroke:'#7c8060',strokeThickness:3}).setDepth(14));
      this.tweens.add({targets:laugh,y:322,alpha:0,duration:700});
      for(const id of ['father','mother']){const p=actor(id);if(p){p.setFrame(7);this.tweens.add({targets:p,y:FLOOR-3,yoyo:true,repeat:2,duration:100});}}
      this.bridge.sound.effect('laugh');duration=260;
    }else if(action==='adjust-mask'){
      this.cameras.main.setZoom(1);this.player.setVisible(true).setTexture('char-hero',0);this.playerName.setVisible(true);this.playerShadow.setVisible(true);
      this.tweens.add({targets:this.player,angle:3,yoyo:true,duration:150});duration=180;
    }else if(action==='warm-fade'){
      const warm=add(this.add.rectangle(0,0,4096,540,0xffd18a,.05).setOrigin(0).setScrollFactor(0).setDepth(13));
      this.tweens.add({targets:warm,alpha:.18,duration:300});duration=300;
    }else if(action==='door-approach'){
      if(!reduced)this.cameras.main.setZoom(1.04);duration=180;
    }else if(action==='door-silence'){
      this.bridge.sound.setMood('quiet');duration=0;
    }else if(action==='brother-hold'){
      const brother=actor('brother');if(brother)this.tweens.add({targets:brother,x:620,angle:-3,duration:220});duration=230;
    }else if(action==='paper-fold'){
      const shape=this.bridge.state?.choices['brother-shape'];const g=add(this.add.graphics().setDepth(6));
      g.fillStyle(0xeee3b9,1);
      if(shape==='비행기')g.fillTriangle(493,405,583,387,540,427);else{g.fillTriangle(496,402,581,402,552,426);g.fillRect(519,391,41,12);}
      g.lineStyle(2,0xa0b096,1);g.lineBetween(516,405,560,400);
      this.tweens.add({targets:g,y:-8,yoyo:true,duration:220});this.bridge.sound.effect('tap');duration=240;
    }else if(action==='toy-roll'){
      const toy=actor('toy');if(toy)this.tweens.add({targets:toy,x:toy.x+35,yoyo:true,duration:260});duration=0;
    }
    if(duration)await wait(duration);
    if(gen!==this.visualGeneration)return;
  }
  equipMask(){
    const mask=this.add.image(this.player.x,this.player.y-115,'mask-worn').setScale(2).setDepth(9);
    this.stageObjects.push(mask);this.tweens.add({targets:mask,y:this.player.y-52,duration:this.bridge.settings.reducedMotion?80:450,onComplete:()=>{mask.destroy();this.playerKey='hero';this.player.setTexture('char-hero',0);}});
  }
  async playVisual(kind){
    this.visualActive=true;const generation=this.visualGeneration,reduced=this.bridge.settings.reducedMotion;
    const wait=ms=>new Promise(resolve=>this.time.delayedCall(ms,resolve));
    if(kind==='mask'){this.equipMask();await wait(reduced?100:500);return;}
    this.player.anims.stop();this.cameras.main.stopFollow();
    if(kind==='hero'){
      const father=this.entities.find(e=>e.data.id==='father')?.sprite;
      this.player.setPosition(570,FLOOR);this.playerKey='hero';this.player.setTexture('char-hero',6).setFlipX(false);
      if(father){father.setCrop();father.setY(FLOOR);this.tweens.add({targets:father,y:FLOOR-3,yoyo:true,repeat:3,duration:120});}
      this.cameras.main.setScroll(Phaser.Math.Clamp(660-this.scale.width/2,0,this.stage.width-this.scale.width),0);
      const warm=this.add.rectangle(0,0,4096,540,0xffcf7c,.10).setOrigin(0).setScrollFactor(0).setDepth(13);this.stageObjects.push(warm);
      const laugh=this.add.text(650,340,'하 하 하',{fontSize:'15px',color:'#fff2c8',stroke:'#817f55',strokeThickness:3}).setDepth(14);this.stageObjects.push(laugh);
      this.tweens.add({targets:laugh,y:320,alpha:.5,yoyo:true,repeat:2,duration:220});this.bridge.sound.effect('laugh');await wait(reduced?160:760);
    }else if(kind==='door'){
      const door=this.entities.find(e=>e.data.id==='door')?.sprite,fatherEntity=this.entities.find(e=>e.data.id==='father-door'),father=fatherEntity?.sprite;
      this.player.setPosition(1020,FLOOR).setFrame(0).setFlipX(false);
      this.cameras.main.setScroll(Phaser.Math.Clamp(1150-this.scale.width/2,0,this.stage.width-this.scale.width),0);
      if(father){father.anims.stop();father.setPosition(1120,FLOOR);fatherEntity.label.setX(1140);}
      if(!reduced)this.cameras.main.setZoom(1.04);
      const leg=this.add.rectangle(1131,434,32,10,0x54665a).setOrigin(0,.5).setDepth(6);this.stageObjects.push(leg);
      this.tweens.add({targets:leg,x:1170,angle:-12,duration:reduced?40:220});
      if(father)this.tweens.add({targets:father,x:1140,duration:reduced?40:220});
      await wait(reduced?50:230);if(generation!==this.visualGeneration)return;leg.setVisible(false);if(door)door.setTexture('obj-broken');
      this.bridge.sound.effect('impact');
      if(!reduced)this.cameras.main.shake(100,.002);
      for(let i=0;i<7;i++){
        const chip=this.add.rectangle(1190+i%3*13,345+i*10,7+i%2*4,20,0xb19a70).setDepth(6);this.stageObjects.push(chip);
        this.tweens.add({targets:chip,x:1170+i*13,y:451,angle:i%2?35:-20,duration:reduced?50:350+i*20,ease:'Quad.easeIn'});
      }
      await wait(reduced?100:550); // Only animation length; no forced dramatic waiting.
    }
  }
  endVisual(){
    this.visualGeneration++;this.tweens.killAll();for(const o of this.visualObjects||[])o.destroy();this.visualObjects=[];
    this.visualActive=false;this.player.setVisible(true).setAngle(0);this.playerName.setVisible(true);this.playerShadow.setVisible(true);
    if(this.visualStart)this.player.setPosition(this.visualStart.x,FLOOR);
    for(const e of this.entities){if(e.data.type!=='npc')continue;e.sprite.setPosition(e.data.x,FLOOR).setAngle(0).setFrame(0);e.label.setX(e.data.x);if(this.stage.variant==='family'&&['father','mother'].includes(e.data.id))e.sprite.setCrop(0,0,32,32);}
    if(this.visualKind==='door')this.entities.find(e=>e.data.id==='door')?.sprite.setTexture('obj-broken');
    this.cameras.main.setZoom(1);this.cameras.main.startFollow(this.player,true,this.bridge.settings.reducedMotion?1:.085,1);
  }
  updateSettings(){
    if(!this.atmosphere)return;const interior=['interior','shop'].includes(this.stage?.kind);const a=this.bridge.settings.ambience;
    this.atmosphere.setFillStyle(a==='rain'||a==='night'?0x253c59:0x9a623e,interior?0:(a==='night'?.48:a==='dusk'?.22:a==='rain'?.18:0));
    if(a==='day')this.rain.clear();if(this.player&&!this.isTitle)this.cameras.main.startFollow(this.player,true,this.bridge.settings.reducedMotion?1:.085,1);
  }
  update(time,delta){
    if(!this.player)return;this.bridge.onTick?.(delta);const blocked=this.isTitle||this.bridge.locked();
    const body=this.player.body;
    if(blocked){this.player.setVelocityX(0);this.jumpQueued=false;if(!this.visualActive&&(body.blocked.down||body.touching.down))this.player.anims.play(this.playerKey+'-idle',true);}
    else{
      const left=this.controls.left||this.keys.left.isDown||this.keys.a.isDown;
      const right=this.controls.right||this.keys.right.isDown||this.keys.d.isDown;
      const axis=(right?1:0)-(left?1:0);this.player.setVelocityX(axis*185);
      if(axis)this.player.setFlipX(axis<0);
      const jump=this.jumpQueued||Phaser.Input.Keyboard.JustDown(this.keys.jump)||Phaser.Input.Keyboard.JustDown(this.keys.w)||Phaser.Input.Keyboard.JustDown(this.keys.up);
      this.jumpQueued=false;
      const grounded=body.blocked.down||body.touching.down;
      if(jump&&grounded){this.player.setVelocityY(-370);this.bridge.sound.effect('jump');}
      if(!grounded){this.player.anims.stop();this.player.setFrame(6);}else this.player.anims.play(this.playerKey+(axis?'-walk':'-idle'),true);
      if(this.player.y>FLOOR+90||!Number.isFinite(this.player.x)){this.player.setPosition(this.stage.spawn,FLOOR-10).setVelocity(0);}
      this.bridge.onPosition(this.player.x,delta);
    }
    this.playerShadow.setPosition(this.player.x,FLOOR+3).setAlpha(Phaser.Math.Clamp(1-(FLOOR-this.player.y)/180,.15,1)*.2).setScale(Phaser.Math.Clamp(1-(FLOOR-this.player.y)/220,.4,1),1);
    this.playerName.setPosition(this.player.x,this.player.y-88);
    this.hills.tilePositionX=this.cameras.main.scrollX*.27;
    this.sky.tilePositionX=this.cameras.main.scrollX*.08+(this.bridge.settings.reducedMotion?0:time*.0008);
    let nearest=null,dist=102;
    for(const entity of this.entities){
      const d=Math.abs(entity.data.x-this.player.x);
      if(d<dist&&Math.abs(this.player.y-FLOOR)<100){nearest=entity;dist=d;}
      if(entity.sparkle&&entity.sparkle.visible&&!this.bridge.settings.reducedMotion)entity.sparkle.setY(entity.top+20+Math.sin(time*.002+entity.data.x)*5).setAlpha(.55+Math.sin(time*.003)*.35);
    }
    if(blocked)nearest=null;
    for(const e of this.entities){e.indicator.setVisible(!this.isTitle&&e===nearest);e.label.setAlpha(e===nearest?1:.8);}
    if(nearest!==this.nearest){this.nearest=nearest;this.bridge.onNearest(nearest?.data||null);}
    const interior=['interior','shop'].includes(this.stage.kind);let ambience=this.bridge.settings.ambience;
    if(ambience==='cycle'){
      const progress=(Math.sin(time/42000-Math.PI/2)+1)/2;
      this.atmosphere.setFillStyle(0x253c59,interior?0:progress*.48);ambience=progress>.65?'night':progress>.3?'dusk':'day';
    }
    this.rain.clear();this.lampGlow.clear();
    if(ambience==='rain'&&!interior){
      this.rain.lineStyle(1,0xe0e9d8,.38);for(let i=0;i<65;i++){const x=(i*73.7+time*.065)%(this.scale.width+80)-30;const y=(i*47.3+time*.29)%540;this.rain.lineBetween(x,y,x-5,y+13);}
    }else if(ambience==='dusk'&&!interior){
      this.rain.fillStyle(0xfbe5a0,.7);for(let i=0;i<9;i++){const x=(i*191)%this.scale.width;const y=370+Math.sin(time*.001+i)*24;this.rain.fillRect(x,y,2,2);}
    }else if(ambience==='night'&&!interior){
      for(let i=0;i<35;i++){this.rain.fillStyle(0xf9edcf,.25+(i%3)*.16);this.rain.fillRect((i*137.3)%this.scale.width,36+(i*71)%150,2,2);}
    }
    if(interior||['dusk','night','rain'].includes(ambience)){
      let points=interior?(this.stage.kind==='interior'?[[720,172]]:[[90,143],[420,143],[750,143],[1080,143]]):this.entities.filter(e=>e.data.art==='lamp').map(e=>[e.data.x+24,295]);
      if(this.stage.kind==='town')points.push([589,299],[1484,299]);
      for(const [worldX,y]of points){const x=worldX-this.cameras.main.scrollX;for(let i=3;i>0;i--){this.lampGlow.fillStyle(0xf9d591,.025+(3-i)*.015);this.lampGlow.fillCircle(x,y,18+i*12);}}
    }
  }
}

export function createGame(bridge){
  const host=document.querySelector('#game');const size=()=>({width:Math.round(host.clientWidth/host.clientHeight*540),height:540});
  const game=new Phaser.Game({type:Phaser.AUTO,parent:host,...size(),backgroundColor:'#c7d2b5',pixelArt:true,roundPixels:true,
    scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
    physics:{default:'arcade',arcade:{gravity:{y:880},debug:false}},
    input:{activePointers:4},scene:[new LifeScene(bridge)],audio:{noAudio:true},render:{antialias:false},
    fps:{target:60,forceSetTimeOut:false},banner:false});
  const observer=new ResizeObserver(()=>{const s=size();if(s.width>0)game.scale.setGameSize(s.width,s.height);});observer.observe(host);
  game.events.once('destroy',()=>observer.disconnect());
  return game;
}
