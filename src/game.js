import Phaser from 'phaser';
import { createBackdrops, createStageArt, createCharacters, createObjectArt, createParticleArt } from './art.js';
import { stageById } from './story.js';

const FLOOR=458;
export class LifeScene extends Phaser.Scene{
  constructor(bridge){super('Life');this.bridge=bridge;this.controls={left:false,right:false,jump:false};this.jumpQueued=false;this.nearest=null;this.stage=null;this.isTitle=true;}
  create(){
    this.bridge.portraits=createCharacters(this);createObjectArt(this);createParticleArt(this);createBackdrops(this);
    this.sky=this.add.tileSprite(0,0,4096,540,'sky').setOrigin(0).setScrollFactor(0).setDepth(-30);
    this.hills=this.add.tileSprite(0,0,4096,540,'hillside').setOrigin(0).setScrollFactor(0).setDepth(-20);
    this.keys=this.input.keyboard.addKeys({left:'LEFT',right:'RIGHT',a:'A',d:'D',jump:'SPACE',w:'W',up:'UP',interact:'E'});
    this.input.keyboard.on('keydown-E',e=>{if(!e.repeat)this.bridge.interact();});
    this.input.keyboard.on('keydown-ESC',()=>this.bridge.escape());
    this.input.keyboard.on('keydown-ENTER',e=>{if(!e.repeat)this.bridge.advance();});
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
    this.clearControls();this.isTitle=title;this.nearest=null;this.bridge.onNearest(null);
    this.collider?.destroy();this.stageObjects?.forEach(o=>o.destroy());this.stageObjects=[];this.floor?.destroy();this.player?.destroy();this.playerName?.destroy();this.playerShadow?.destroy();this.entities=[];
    this.stage=stageById(id);const stage=this.stage;
    const add=o=>{this.stageObjects.push(o);return o;};
    add(this.add.image(0,0,createStageArt(this,stage)).setOrigin(0).setDepth(0));
    this.floor=this.add.zone(stage.width/2,FLOOR+12,stage.width,24);this.physics.add.existing(this.floor,true);
    this.physics.world.setBounds(0,-100,stage.width,FLOOR+100);
    this.playerShadow=this.add.ellipse(x,FLOOR+3,39,9,0x344e35,.20).setDepth(3);
    this.player=this.physics.add.sprite(x,FLOOR,'char-child',0).setScale(2).setOrigin(.5,1).setDepth(5);
    this.player.body.setSize(14,31).setOffset(9,8);this.player.setCollideWorldBounds(true);this.player.setMaxVelocity(250,650);
    this.collider=this.physics.add.collider(this.player,this.floor);this.player.anims.play('child-idle');
    this.playerName=this.add.text(x,FLOOR-89,'재원',{fontFamily:'sans-serif',fontSize:'11px',color:'#f9f1d3',stroke:'#617156',strokeThickness:3}).setOrigin(.5).setDepth(7);
    for(const data of stage.entities){
      let sprite;let top;
      if(data.type==='npc'){
        add(this.add.ellipse(data.x,FLOOR+3,35,8,0x344e35,.17).setDepth(2));
        sprite=add(this.add.sprite(data.x,FLOOR,'char-'+data.character,0).setScale(2).setOrigin(.5,1).setDepth(4));sprite.anims.play(data.character+'-idle');top=FLOOR-86;
      }else{
        const art=data.art||(data.type==='event'?'finish':'portal');
        sprite=add(this.add.image(data.x,FLOOR,'obj-'+art).setOrigin(.5,1).setDepth(2));top=FLOOR-sprite.height-12;
      }
      const label=add(this.add.text(data.x,top,data.label,{fontFamily:'sans-serif',fontSize:'11px',color:'#f9f2d9',backgroundColor:'#4b6247d9',padding:{left:7,right:7,top:4,bottom:4}}).setOrigin(.5,1).setDepth(7));
      const indicator=add(this.add.text(data.x,top-32,data.type==='npc'?'···':'✦',{fontFamily:'sans-serif',fontSize:'16px',color:'#fff1bc',stroke:'#63704b',strokeThickness:3}).setOrigin(.5,1).setDepth(7));
      indicator.setVisible(false);
      let sparkle=null;if(data.type==='memory')sparkle=add(this.add.image(data.x+18,top+20,'spark').setAlpha(.8).setDepth(6));
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
  refreshMemories(){for(const e of this.entities||[]){if(e.sparkle)e.sparkle.setVisible(!this.bridge.state?.memories.includes(e.data.memory));}}
  updateSettings(){
    if(!this.atmosphere)return;const interior=['interior','shop'].includes(this.stage?.kind);const a=this.bridge.settings.ambience;
    this.atmosphere.setFillStyle(a==='rain'||a==='night'?0x253c59:0x9a623e,interior?0:(a==='night'?.48:a==='dusk'?.22:a==='rain'?.18:0));
    if(a==='day')this.rain.clear();if(this.player&&!this.isTitle)this.cameras.main.startFollow(this.player,true,this.bridge.settings.reducedMotion?1:.085,1);
  }
  update(time,delta){
    if(!this.player)return;const blocked=this.isTitle||this.bridge.locked();
    const body=this.player.body;
    if(blocked){this.player.setVelocityX(0);this.jumpQueued=false;if(body.blocked.down||body.touching.down)this.player.anims.play('child-idle',true);}
    else{
      const left=this.controls.left||this.keys.left.isDown||this.keys.a.isDown;
      const right=this.controls.right||this.keys.right.isDown||this.keys.d.isDown;
      const axis=(right?1:0)-(left?1:0);this.player.setVelocityX(axis*185);
      if(axis)this.player.setFlipX(axis<0);
      const jump=this.jumpQueued||Phaser.Input.Keyboard.JustDown(this.keys.jump)||Phaser.Input.Keyboard.JustDown(this.keys.w)||Phaser.Input.Keyboard.JustDown(this.keys.up);
      this.jumpQueued=false;
      const grounded=body.blocked.down||body.touching.down;
      if(jump&&grounded){this.player.setVelocityY(-370);this.bridge.sound.effect('jump');}
      if(!grounded){this.player.anims.stop();this.player.setFrame(6);}else this.player.anims.play(axis?'child-walk':'child-idle',true);
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
