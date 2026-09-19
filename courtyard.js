import * as T from 'three';

// Architectural model is normalized: furniture uses ~0.5 scene units per metre.
export function buildCourtyard(scene) {
  const lanterns=[], warmLights=[], clickable=[];
  const material=(color,more={})=>new T.MeshStandardMaterial({color,roughness:.65,...more});
  const timber=material('#473125'), brass=material('#be9453',{metalness:.65,roughness:.36});
  const stone=material('#727675'), porcelain=material('#abc5be',{roughness:.23,metalness:.08});
  function add(geometry,mat,position,parent=scene){const object=new T.Mesh(geometry,mat);object.position.set(...position);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;}
  function rod(a,b,r,mat,parent=scene){const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);const o=add(new T.CylinderGeometry(r,r,delta.length(),12),mat,start.clone().add(end).multiplyScalar(.5).toArray(),parent);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;}
  function ring(radius,tube,y,mat,parent){const o=add(new T.TorusGeometry(radius,tube,8,48),mat,[0,y,0],parent);o.rotation.x=Math.PI/2;return o;}
  function lathe(profile,mat,pos,parent=scene){return add(new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),48),mat,pos,parent);}

  function hangingLantern(x,y,z){
    // The pivot is the attachment point; cord and lamp swing as one assembly.
    const pivot=new T.Group();pivot.position.set(x,y,z);scene.add(pivot);
    rod([0,0,0],[0,-.18,0],.009,brass,pivot);
    const bodyMaterial=material('#ac2819',{emissive:'#ff6f27',emissiveIntensity:.38,roughness:.82});
    const body=add(new T.SphereGeometry(.215,48,32),bodyMaterial,[0,-.415,0],pivot);body.scale.y=1.12;clickable.push(body);
    for(const yy of [-.19,-.64]){
      add(new T.CylinderGeometry(.082,.082,.035,32),brass,[0,yy,0],pivot);
      ring(.083,.008,yy,brass,pivot);
    }
    // Open longitudinal ribs follow the silk surface without crossing the caps.
    for(let i=0;i<12;i++){
      const angle=i*Math.PI/6,points=[];
      for(let j=0;j<=24;j++){const t=.34+j/24*(Math.PI-.68);points.push(new T.Vector3(.217*Math.sin(t)*Math.cos(angle),-.415+.243*Math.cos(t),.217*Math.sin(t)*Math.sin(angle)));}
      add(new T.TubeGeometry(new T.CatmullRomCurve3(points),24,.0028,5,false),brass,[0,0,0],pivot);
    }
    rod([0,-.66,0],[0,-.73,0],.007,brass,pivot);
    add(new T.SphereGeometry(.02,12,8),brass,[0,-.73,0],pivot);
    const tassel=material('#a92a1e');
    for(let i=0;i<12;i++){const a=i*Math.PI/6;rod([Math.cos(a)*.011,-.75,Math.sin(a)*.011],[Math.cos(a)*.027,-.89,Math.sin(a)*.027],.003,tassel,pivot);}
    const light=new T.PointLight('#ffac59',2.2,3,2);light.position.set(0,-.44,0);pivot.add(light);
    pivot.userData.bodyMaterial=bodyMaterial;warmLights.push(light);lanterns.push(pivot);
  }
  for(const x of [-2.15,2.15])for(const z of [4.5,9,13.5]){
    const inward=x>0?-1:1,hook=x+inward*.34;
    add(new T.CylinderGeometry(.16,.2,.13,24),stone,[x,.08,z]);
    add(new T.CylinderGeometry(.048,.067,1.83,16),timber,[x,1.0,z]);
    for(const yy of [.18,1.73])add(new T.CylinderGeometry(.069,.069,.05,16),brass,[x,yy,z]);
    rod([x,1.88,z],[hook,1.88,z],.031,timber);
    rod([x,1.57,z],[hook,1.88,z],.017,timber);
    add(new T.SphereGeometry(.064,16,12),brass,[x,1.95,z]);
    hangingLantern(hook,1.88,z);
  }

  // Tea table: 1.15 m diameter, 0.76 m high. Chairs: 0.44 m seat height.
  const tea=new T.Group();tea.position.set(11.9,.018,5.6);scene.add(tea);
  add(new T.CylinderGeometry(.575,.575,.045,64),timber,[0,.38,0],tea);
  ring(.565,.012,.394,brass,tea);
  lathe([[.47,0],[.48,.015],[.48,.07],[.46,.08]],timber,[0,.277,0],tea);
  for(const x of [-.32,.32])for(const z of [-.32,.32])rod([x*1.14,.025,z*1.14],[x,.355,z],.024,timber,tea);
  for(const z of [-.32,.32])rod([-.35,.13,z],[.35,.13,z],.013,timber,tea);
  for(const x of [-.32,.32])rod([x,.13,-.35],[x,.13,.35],.013,timber,tea);
  function chair(angle){
    const group=new T.Group();group.position.set(Math.sin(angle)*.84,0,Math.cos(angle)*.84);group.rotation.y=angle;tea.add(group);
    add(new T.BoxGeometry(.25,.03,.25),timber,[0,.22,0],group);
    add(new T.BoxGeometry(.21,.012,.21),material('#a58c60'),[0,.242,0],group);
    for(const x of [-.095,.095])for(const z of [-.095,.095])rod([x*1.15,.012,z*1.15],[x,.21,z],.013,timber,group);
    for(const x of [-.105,.105])rod([x,.22,.105],[x,.47,.13],.012,timber,group);
    for(const y of [.31,.44])rod([-.105,y,.12],[.105,y,.12],.018,timber,group);
    for(const x of [-.05,0,.05])rod([x,.31,.12],[x,.44,.12],.006,timber,group);
  }
  chair(.2);chair(2.35);chair(4.4);
  // Closed ceramic profiles have real rims, interiors and contact with the table.
  add(new T.BoxGeometry(.44,.012,.27),material('#746245'),[-.08,.409,-.06],tea);
  lathe([[0,0],[.047,0],[.062,.025],[.066,.06],[.05,.089],[.03,.095]],porcelain,[-.13,.415,-.06],tea);
  lathe([[0,0],[.039,0],[.042,.008],[.03,.015],[0,.018]],porcelain,[-.13,.51,-.06],tea);
  add(new T.SphereGeometry(.012,16,10),brass,[-.13,.536,-.06],tea);
  const spoutCurve=new T.CatmullRomCurve3([new T.Vector3(-.078,.449,-.06),new T.Vector3(-.041,.465,-.06),new T.Vector3(-.025,.50,-.06)]);
  add(new T.TubeGeometry(spoutCurve,16,.012,10,false),porcelain,[0,0,0],tea);
  add(new T.TorusGeometry(.043,.008,12,32),porcelain,[-.198,.467,-.06],tea);
  const teaMat=material('#654323',{roughness:.18});
  for(const [x,z] of [[.045,.02],[-.23,.15],[.15,-.11]]){
    lathe([[0,0],[.043,0],[.047,.007],[.042,.012],[0,.012]],porcelain,[x,.403,z],tea);
    lathe([[.017,0],[.022,.004],[.029,.035],[.025,.035],[.019,.008],[0,.008]],porcelain,[x,.415,z],tea);
    add(new T.CylinderGeometry(.023,.023,.002,24),teaMat,[x,.442,z],tea);
  }
  lathe([[0,0],[.13,0],[.15,.012],[.145,.025],[.12,.015],[0,.012]],porcelain,[.24,.403,.18],tea);
  const pastry=material('#b47b32'),emboss=material('#d4a453');
  for(const [x,z] of [[.19,.18],[.29,.18]]){
    add(new T.CylinderGeometry(.043,.043,.029,48),pastry,[x,.433,z],tea);
    for(let i=0;i<12;i++){const a=i*Math.PI/6;add(new T.CylinderGeometry(.009,.009,.029,10),pastry,[x+.038*Math.cos(a),.433,z+.038*Math.sin(a)],tea);}
    const decoration=new T.Group();decoration.position.set(x,.449,z);tea.add(decoration);ring(.03,.002,0,emboss,decoration);
    for(let i=0;i<4;i++){const a=i*Math.PI/2;const petal=add(new T.TorusGeometry(.009,.0018,6,16),emboss,[Math.cos(a)*.011,0,Math.sin(a)*.011],decoration);petal.rotation.x=Math.PI/2;}
  }
  return {lanterns,warmLights,clickable};
}
