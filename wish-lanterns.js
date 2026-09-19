import * as T from 'three';

export function createWishLanterns(scene, glow, reduced){
  const lights=[];let nextSlot=0;
  const paperCanvas=document.createElement('canvas');paperCanvas.width=256;paperCanvas.height=512;
  const ctx=paperCanvas.getContext('2d');const gradient=ctx.createLinearGradient(0,0,0,512);
  gradient.addColorStop(0,'#b55327');gradient.addColorStop(.55,'#ec9953');gradient.addColorStop(1,'#ffe5a2');ctx.fillStyle=gradient;ctx.fillRect(0,0,256,512);
  for(let i=0;i<3000;i++){ctx.fillStyle=i%2?'#ffffff12':'#6c36100e';ctx.fillRect((i*79)%256,(i*139)%512,1,3);}
  ctx.strokeStyle='#f4d08b60';ctx.lineWidth=2;for(let x=0;x<256;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,512);ctx.stroke();}
  const texture=new T.CanvasTexture(paperCanvas);texture.colorSpace=T.SRGBColorSpace;
  const paper=new T.MeshStandardMaterial({map:texture,emissiveMap:texture,emissive:'#ffbf79',emissiveIntensity:.65,roughness:.9,side:T.DoubleSide});
  const bamboo=new T.MeshStandardMaterial({color:'#936132',roughness:.8});
  const profile=[[.22,-.34],[.3,-.22],[.36,.1],[.34,.36],[.26,.46],[0,.49]];
  const shell=new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),48);
  const ringGeo=new T.TorusGeometry(.222,.012,8,48);
  const flameGeo=new T.SphereGeometry(.06,16,12),flameMat=new T.MeshBasicMaterial({color:'#fff1ba',toneMapped:false});
  const rodGeo=new T.CylinderGeometry(.009,.009,.44,8);
  const ribGeo=new T.TubeGeometry(new T.CatmullRomCurve3(profile.slice(0,-1).map(([r,y])=>new T.Vector3(r+.003,y,0))),24,.0035,5,false);
  const hitGeo=new T.SphereGeometry(.52,12,8),hitMat=new T.MeshBasicMaterial({visible:false});
  const dialog=document.createElement('dialog');dialog.className='wish-reader';dialog.setAttribute('aria-labelledby','wish-reader-title');
  dialog.innerHTML='<form method="dialog"><button class="wish-close" aria-label="关闭心愿">×</button><div class="eyebrow">A LETTER IN THE SKY</div><h2 id="wish-reader-title">灯里藏着的心愿</h2><blockquote></blockquote><p>一盏灯，一份念想。愿你所盼，皆有回响。</p><button class="reader-done">让心愿继续飞翔</button></form>';
  document.body.append(dialog);let selected=null;
  dialog.addEventListener('close',()=>{selected=null;});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});
  function add(text,settled=false){
    if(lights.length>=12){const old=lights.shift();scene.remove(old.group);old.aura.material.dispose();}
    const group=new T.Group();const slot=nextSlot++%12;
    const base=new T.Vector3(-5+(slot%6)*1.9,7.9,-3-Math.floor(slot/6)*2);group.position.copy(base);scene.add(group);
    group.add(new T.Mesh(shell,paper));const ring=new T.Mesh(ringGeo,bamboo);ring.rotation.x=Math.PI/2;ring.position.y=-.34;group.add(ring);
    for(let i=0;i<8;i++){const rib=new T.Mesh(ribGeo,bamboo);rib.rotation.y=i*Math.PI/4;group.add(rib);}
    for(let i=0;i<2;i++){const rod=new T.Mesh(rodGeo,bamboo);rod.rotation.z=Math.PI/2;rod.rotation.y=i*Math.PI/2;rod.position.y=-.34;group.add(rod);}
    const flame=new T.Mesh(flameGeo,flameMat);flame.position.y=-.22;flame.scale.set(.6,1.6,.6);group.add(flame);
    const aura=new T.Sprite(new T.SpriteMaterial({map:glow,color:'#ffb960',transparent:true,opacity:.34,depthWrite:false,blending:T.AdditiveBlending}));aura.scale.set(1.6,1.6,1);group.add(aura);
    const hit=new T.Mesh(hitGeo,hitMat);group.add(hit);
    const light={group,base,age:settled?6:0,targetY:10.5+(slot%3)*1.05,text,aura,flame,hit,phase:slot*1.7};lights.push(light);return light;
  }
  return {
    add,
    pick(ray){scene.updateMatrixWorld(true);const hits=ray.intersectObjects(lights.map(l=>l.hit),false);return hits.length?lights.find(l=>l.hit===hits[0].object):null;},
    open(light){selected=light;dialog.querySelector('blockquote').textContent=light.text;if(!dialog.open)dialog.showModal();},
    update(dt,t){for(const l of lights){if(l===selected)continue;l.age+=dt;const p=reduced?1:Math.min(l.age/6,1),ease=p*p*(3-2*p);l.group.position.set(l.base.x+(reduced?0:Math.sin(t*.32+l.phase)*.18),T.MathUtils.lerp(l.base.y,l.targetY,ease)+(reduced?0:Math.sin(t*.65+l.phase)*.045),l.base.z);l.group.rotation.z=reduced?0:Math.sin(t*.6+l.phase)*.035;l.aura.material.opacity=reduced?.34:.34+Math.sin(t*2+l.phase)*.045;}}
  };
}
