import * as T from 'three';

// Deterministic, locally generated lunar surface; no remote texture requests.
export function createMoonTexture(){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const cx=w/2,cy=h/2,radius=w*.47;
  let seed=713;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  const grids=[8,16,32,64,128,256].map(n=>({n,data:Float32Array.from({length:n*n},random)}));
  function noise(u,v,{n,data}){const x=u*n,y=v*n,ix=Math.floor(x),iy=Math.floor(y);let a=x-ix,b=y-iy;a=a*a*(3-2*a);b=b*b*(3-2*b);const at=(i,j)=>data[((j%n+n)%n)*n+(i%n+n)%n];return T.MathUtils.lerp(T.MathUtils.lerp(at(ix,iy),at(ix+1,iy),a),T.MathUtils.lerp(at(ix,iy+1),at(ix+1,iy+1),a),b);}
  const pixels=ctx.createImageData(w,h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const distance=Math.hypot(x-cx,y-cy);if(distance>radius)continue;
    const u=x/w,v=y/h;let f=0;grids.forEach((g,i)=>f+=(noise(u,v,g)-.5)*[48,30,20,12,7,4][i]);
    const c=209+f+(random()-.5)*8,k=(y*w+x)*4;
    pixels.data[k]=c+10;pixels.data[k+1]=c+6;pixels.data[k+2]=c-5;pixels.data[k+3]=255;
  }ctx.putImageData(pixels,0,0);
  // Broad irregular basalt plains, with soft boundaries and overlapping lobes.
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.clip();
  for(let i=0;i<36;i++){
    const x=random()*w,y=(.22+random()*.53)*h,rx=28+random()*95,ry=22+random()*53;
    ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);const grad=ctx.createRadialGradient(0,0,.1,0,0,1);grad.addColorStop(0,'rgba(66,70,73,.30)');grad.addColorStop(.6,'rgba(72,76,79,.23)');grad.addColorStop(1,'rgba(90,94,97,0)');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  for(let i=0;i<1700;i++){
    const x=random()*w,y=random()*h,r=1.1+Math.pow(random(),5)*18;
    const g=ctx.createRadialGradient(x-r*.16,y-r*.12,r*.12,x,y,r);g.addColorStop(0,'rgba(73,76,79,.11)');g.addColorStop(.66,'rgba(83,85,86,.17)');g.addColorStop(.81,'rgba(250,246,225,.25)');g.addColorStop(1,'rgba(225,221,205,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
  }
  const light=ctx.createRadialGradient(w*.31,h*.28,10,w*.5,h*.5,radius*1.15);light.addColorStop(0,'rgba(255,249,222,.24)');light.addColorStop(.58,'rgba(255,242,211,.03)');light.addColorStop(1,'rgba(35,41,49,.25)');ctx.fillStyle=light;ctx.fillRect(0,0,w,h);
  ctx.restore();
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=T.RepeatWrapping;texture.anisotropy=4;return texture;
}
