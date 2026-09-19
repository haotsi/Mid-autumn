import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {buildCourtyard} from './courtyard.js';
import {createMoonTexture} from './moon.js';
import {createHomeTransition} from './camera-home.js';
import {createWishLanterns} from './wish-lanterns.js';
const host=document.querySelector('#scene');
const loadingScreen=document.querySelector('#loading-screen'),loadingTitle=document.querySelector('#loading-title'),loadingDetail=document.querySelector('#loading-detail'),loadingBar=document.querySelector('#loading-progress-bar'),loadingPercent=document.querySelector('#loading-percent'),loadingTip=document.querySelector('#loading-tip'),loadingActions=document.querySelector('#loading-actions'),loadingRetry=document.querySelector('#loading-retry'),loadingHelp=document.querySelector('#loading-help');
let loadingFinished=false,loadingFailed=false;
function setLoading(value,detail,tip){const progress=Number.isFinite(value)?Math.max(0,Math.min(100,value)):0;loadingBar.style.width=`${progress}%`;loadingPercent.textContent=`${Math.round(progress)}%`;if(detail)loadingDetail.textContent=detail;if(tip)loadingTip.textContent=tip;}
function showLoadingSlow(){if(loadingFinished||loadingFailed)return;loadingScreen.classList.add('loading-screen-slow');loadingActions.hidden=false;loadingHelp.hidden=false;loadingDetail.textContent='加载时间比预期久一些…';loadingTip.textContent='请保持页面打开，加载完成后会自动进入场景';loadingHelp.textContent='如果网络较慢，请保持页面打开；超过一段时间仍未完成时，可以点击“重新加载”。';}
function showLoadingError(message){loadingFailed=true;loadingScreen.classList.add('loading-screen-error');loadingTitle.textContent='北大楼还没有点亮';loadingDetail.textContent=message;loadingTip.textContent='请检查网络或本地预览地址';loadingActions.hidden=false;loadingHelp.hidden=false;loadingHelp.textContent='如果你使用的是本地预览，请确认页面通过 http://127.0.0.1:5173 打开。';}
function finishLoading(){if(loadingFinished)return;loadingFinished=true;clearTimeout(slowTimer);setLoading(100,'北大楼已点亮','欢迎来到中秋夜');loadingActions.hidden=true;loadingHelp.hidden=true;setTimeout(()=>loadingScreen.classList.add('loading-screen-done'),420);}
const slowTimer=setTimeout(showLoadingSlow,8000);
setLoading(8,'正在准备月光与庭院…','月光正在洒进北大楼');
const scene=new T.Scene();scene.background=new T.Color('#0b1526');scene.fog=new T.FogExp2('#0b1526',.012);
let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch(error){showLoadingError('无法启动 3D，请开启浏览器硬件加速后刷新。');console.error(error);throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.14;host.append(renderer.domElement);setLoading(20,'正在准备渲染环境…','正在校准月色与灯火');
const camera=new T.PerspectiveCamera(39,innerWidth/innerHeight,.1,180);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI/2-.035;controls.minDistance=10;controls.maxDistance=49;controls.enablePan=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const homeTransition=createHomeTransition(camera,controls);
function reset(){homeTransition.reset(innerWidth,reduced);}
homeTransition.reset(innerWidth,true);
scene.add(new T.AmbientLight('#7186a1',.5));
scene.add(new T.HemisphereLight('#b8c9e7','#3a3029',1.3));
const moonlight=new T.DirectionalLight('#b8c9ed',1.08);moonlight.position.set(-10,22,10);scene.add(moonlight);
const key=new T.DirectionalLight('#ffd09a',1.48);key.position.set(5,15,18);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.radius=5;key.shadow.blurSamples=8;Object.assign(key.shadow.camera,{left:-18,right:18,top:18,bottom:-18,far:65});key.shadow.bias=-.0005;scene.add(key);
const fill=new T.DirectionalLight('#7190b8',.36);fill.position.set(-16,9,-14);scene.add(fill);
loadingRetry.addEventListener('click',()=>location.reload());
function mat(color,extra={}){return new T.MeshStandardMaterial({color,roughness:.85,...extra});}
function mesh(geo,material,pos,parent=scene){const m=new T.Mesh(geo,material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const stone=mat('#687479'),gold=mat('#bb8741',{metalness:.35}),wood=mat('#4b3023');
mesh(new T.CylinderGeometry(12.4,12.8,.55,96),mat('#485b58'),[0,-.38,0]);
mesh(new T.CylinderGeometry(12.1,12.2,.12,96),mat('#5e6964'),[0,-.045,0]);
mesh(new T.PlaneGeometry(240,240),mat('#172635'),[0,-.68,0]).rotation.x=-Math.PI/2;
for(let z=4;z<11;z+=.85)for(let x=-1.8;x<=1.8;x+=.92)mesh(new T.BoxGeometry(.85,.045,.77),stone,[x,.045,z]);
setLoading(32,'正在加载北大楼模型…','模型文件正在从本地读取');
new GLTFLoader().load('./assets/north-building.glb',g=>{g.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(g.scene);finishLoading();},xhr=>{if(xhr.total){const ratio=Math.max(0,Math.min(1,xhr.loaded/xhr.total));setLoading(34+ratio*60,`正在加载北大楼模型… ${Math.round(ratio*100)}%`,ratio>.72?'楼体即将完成，正在点亮庭院':'正在接收模型文件');}else setLoading(52,'正在接收北大楼模型…','模型大小暂时无法估算，请稍候');},error=>{showLoadingError('北大楼模型加载失败，场景暂时无法完整显示。');console.error(error);});
// The moon is a distant billboard texture, so it reads as sky scenery instead of a nearby 3D prop.
const moon=new T.Sprite(new T.SpriteMaterial({map:createMoonTexture(),transparent:true,depthWrite:false,fog:false,toneMapped:false}));
moon.position.set(0,17,-24);moon.scale.set(7.2,7.2,1);scene.add(moon);
function glowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,1,64,64,64);g.addColorStop(0,'rgba(255,221,155,.38)');g.addColorStop(.45,'rgba(255,216,143,.13)');g.addColorStop(1,'rgba(255,216,143,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new T.CanvasTexture(c);}
const glow=glowTexture();const halo=new T.Sprite(new T.SpriteMaterial({map:glow,transparent:true,depthWrite:false,fog:false,toneMapped:false,blending:T.AdditiveBlending,opacity:.42}));halo.position.copy(moon.position);halo.scale.set(14,14,1);halo.renderOrder=-1;scene.add(halo);
let moonVisibility=1;
// Subtle lunar surface patches, all generated locally.
let seed=42;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const starPos=[];for(let i=0;i<400;i++)starPos.push((random()-.5)*150,12+random()*65,-25-random()*60);const starsG=new T.BufferGeometry();starsG.setAttribute('position',new T.Float32BufferAttribute(starPos,3));scene.add(new T.Points(starsG,new T.PointsMaterial({color:'#cdd9ea',size:.075,transparent:true,opacity:.65})));
const {lanterns,warmLights,clickable}=buildCourtyard(scene);clickable.push(moon);
const wishFlight=createWishLanterns(scene,glow,reduced);
// Osmanthus trees frame the courtyard.
for(const [x,z] of [[-9,1],[9,-1]]){
  mesh(new T.CylinderGeometry(.12,.22,2.5,16),wood,[x,1.25,z]);
  const bed=mesh(new T.TorusGeometry(1.35,.065,10,64),stone,[x,.045,z]);bed.rotation.x=Math.PI/2;
  mesh(new T.CylinderGeometry(1.3,1.3,.025,48),mat('#303b2b'),[x,.028,z]);
  const leaves=new T.InstancedMesh(new T.SphereGeometry(1,8,6),mat('#36563c'),1250);
  const flowers=new T.InstancedMesh(new T.IcosahedronGeometry(.022,1),mat('#d6b467'),180);
  const dummy=new T.Object3D(),clusters=[];
  for(let i=0;i<10;i++){
    const a=i*2.4,r=.55+random()*.65,center=new T.Vector3(x+Math.cos(a)*r,2.55+random()*1.0,z+Math.sin(a)*r);clusters.push(center);
    const start=new T.Vector3(x,1.5,z),d=center.clone().sub(start);
    const branch=mesh(new T.CylinderGeometry(.025,.065,d.length(),10),wood,start.clone().add(center).multiplyScalar(.5).toArray());branch.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());
  }
  for(let i=0;i<1250;i++){
    const c=clusters[i%clusters.length],a=random()*Math.PI*2,v=random()*2-1,r=Math.cbrt(random())*.8,s=Math.sqrt(1-v*v);
    dummy.position.set(c.x+r*s*Math.cos(a),c.y+r*v*.8,c.z+r*s*Math.sin(a));dummy.rotation.set(random()*Math.PI,random()*Math.PI,random()*Math.PI);dummy.scale.set(.06+random()*.04,.017,.12+random()*.06);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);leaves.setColorAt(i,new T.Color().setHSL(.24+random()*.08,.25,.13+random()*.12));
    if(i<180){dummy.scale.setScalar(1);dummy.updateMatrix();flowers.setMatrixAt(i,dummy.matrix);}
  }
  leaves.castShadow=true;leaves.receiveShadow=true;scene.add(leaves,flowers);
}
const petals=new Float32Array(180*3);for(let i=0;i<petals.length;i+=3){petals[i]=(random()-.5)*24;petals[i+1]=random()*12;petals[i+2]=(random()-.5)*18;}const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(petals,3));scene.add(new T.Points(pg,new T.PointsMaterial({color:'#efc578',size:.055,transparent:true,opacity:.8})));
const clouds=[];for(let i=0;i<9;i++){const s=new T.Sprite(new T.SpriteMaterial({map:glow,color:'#8498b0',transparent:true,opacity:.13,depthWrite:false}));s.position.set(-30+i*8,10+random()*4,-24-random()*8);s.scale.set(18,3,1);scene.add(s);clouds.push(s);}
let festive=true;document.querySelector('#mood').onclick=e=>{festive=!festive;e.currentTarget.textContent=festive?'◉ 灯火夜景':'☾ 静谧月夜';e.currentTarget.setAttribute('aria-pressed',String(festive));key.intensity=festive?1.48:.72;moonlight.intensity=festive?1.08:.86;fill.intensity=festive?.36:.24;warmLights.forEach(l=>l.intensity=festive?2.2:.35);lanterns.forEach(g=>g.userData.bodyMaterial.emissiveIntensity=festive?.38:.1);};
let timer;const wishes=['但愿人长久，千里共婵娟。','愿此刻月光，照亮每一份思念。','桂香入梦，月满人间。中秋快乐。'];let wi=0;function wish(){const el=document.querySelector('#blessing');el.textContent=wishes[wi++%wishes.length];el.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('show'),5000);}
const wishPanel=document.querySelector('#wish-panel'),wishForm=document.querySelector('#wish-form'),wishInput=document.querySelector('#wish-input'),wishCount=document.querySelector('#wish-count'),wishLog=document.querySelector('#wish-log');
function renderWishLog(items){wishLog.replaceChildren();items.slice(-3).reverse().forEach(text=>{const row=document.createElement('p');row.textContent=text;wishLog.append(row);});}
function savedWishes(){try{return JSON.parse(localStorage.getItem('mid-autumn-wishes')||'[]').filter(text=>typeof text==='string').slice(-12);}catch{return[];}}
function storeWish(text){const items=[...savedWishes(),text].slice(-12);try{localStorage.setItem('mid-autumn-wishes',JSON.stringify(items));}catch{}renderWishLog(items);}
function createWishLight(text){wishFlight.add(text);}
function openWishPanel(){wishPanel.hidden=false;wishInput.value='';wishCount.textContent='0 / 42';requestAnimationFrame(()=>wishInput.focus());}
function closeWishPanel(){wishPanel.hidden=true;}
wishInput.addEventListener('input',()=>{wishCount.textContent=`${wishInput.value.length} / 42`;});
wishForm.addEventListener('submit',event=>{event.preventDefault();const text=wishInput.value.trim();if(!text)return;createWishLight(text);storeWish(text);closeWishPanel();wishInput.blur();const el=document.querySelector('#blessing');el.textContent='心愿已升起，愿月光替你收藏。';el.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('show'),5000);});
document.querySelector('#wish').onclick=openWishPanel;document.querySelector('#wish-close').onclick=closeWishPanel;wishPanel.addEventListener('click',event=>{if(event.target===wishPanel)closeWishPanel();});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!wishPanel.hidden)closeWishPanel();});renderWishLog(savedWishes());savedWishes().forEach(text=>wishFlight.add(text,true));document.querySelector('#reset').onclick=reset;document.querySelector('.brand').onclick=e=>{e.preventDefault();reset();};
const ray=new T.Raycaster(),pointer=new T.Vector2();let down;
function pointerRay(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);}
renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6){down=null;return;}down=null;pointerRay(e);const light=wishFlight.pick(ray);if(light){wishFlight.open(light);return;}if(ray.intersectObjects(clickable.filter(o=>o.visible)).length)wish();});
renderer.domElement.addEventListener('pointermove',e=>{if(e.buttons)return;pointerRay(e);renderer.domElement.style.cursor=wishFlight.pick(ray)?'pointer':'grab';});
renderer.domElement.addEventListener('pointercancel',()=>down=null);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const clock=new T.Clock();function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;if(!reduced){lanterns.forEach((g,i)=>g.rotation.z=Math.sin(t*.7+i)*.035);for(let i=0;i<petals.length;i+=3){petals[i]+=.12*dt;petals[i+1]-=.3*dt;if(petals[i+1]<.1)petals[i+1]=12;if(petals[i]>12)petals[i]=-12;}pg.attributes.position.needsUpdate=true;clouds.forEach((s,i)=>clouds[i].position.x+=Math.sin(t*.1+i)*dt*.08);}wishFlight.update(dt,t);const frontView=camera.position.z>1.4;const desiredMoonVisibility=frontView?1:0;moonVisibility=T.MathUtils.damp(moonVisibility,desiredMoonVisibility,8,dt);moon.visible=frontView||moonVisibility>.01;halo.visible=moon.visible;moon.material.opacity=moonVisibility;halo.material.opacity=.42*moonVisibility;homeTransition.update(dt);controls.update();renderer.render(scene,camera);}frame();
