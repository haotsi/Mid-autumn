import * as T from 'three';

// A simplified campus forecourt, not a surveyed reconstruction.
export function buildForecourt(scene){
  const root=new T.Group();root.name='Campus forecourt';scene.add(root);
  const material=color=>new T.MeshStandardMaterial({color,roughness:.94});
  const paving=material('#777b75'),edge=material('#919287'),grass=material('#344b35');
  const earth=material('#26352d'),wood=material('#594331'),shrub=material('#36503b');
  function box(w,h,d,x,y,z,mat){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=true;root.add(m);return m;}
  // Continuous terrain removes the raised circular display-plinth silhouette.
  const ground=new T.Mesh(new T.PlaneGeometry(240,240),earth);ground.rotation.x=-Math.PI/2;ground.position.y=-.075;ground.receiveShadow=true;root.add(ground);
  box(29,.06,25,0,-.04,3.5,paving);
  // Broad rectangular lawns and a clear entrance axis, with perimeter walks.
  for(const x of [-6.7,6.7]){
    box(8.5,.085,10,x,-.018,9,edge);
    box(8.3,.07,9.8,x,.003,9,grass);
  }
  // Instanced slabs keep the additional paving to a single draw call.
  const slabs=[];
  for(let x=-13.75;x<14;x+=.92)for(let z=-7.5;z<16;z+=.82){
    if(z>3.9&&z<14.1&&Math.abs(x)>2.35&&Math.abs(x)<11.05)continue;
    slabs.push([x,z]);
  }
  const tiles=new T.InstancedMesh(new T.BoxGeometry(.895,.018,.795),paving,slabs.length);
  const dummy=new T.Object3D();
  slabs.forEach(([x,z],i)=>{dummy.position.set(x,.002,z);dummy.updateMatrix();tiles.setMatrixAt(i,dummy.matrix);tiles.setColorAt(i,new T.Color().setHSL(.12,.035,.40+(i*17%11)*.006));});
  tiles.receiveShadow=true;root.add(tiles);
  // Paired border beds frame the view without adding a wall of foliage.
  const foliage=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),shrub,40);
  let index=0;
  for(const x of [-13.3,13.3])for(const z of [2,10]){
    box(1.5,.13,3.5,x,.04,z,edge);box(1.32,.12,3.32,x,.07,z,earth);
    for(let i=0;i<10;i++){
      dummy.position.set(x+Math.sin(i*2.4)*.38,.28+(i%3)*.07,z-1.35+i*.3);
      dummy.rotation.set(i*.3,i*1.7,0);dummy.scale.set(.42,.26,.43);dummy.updateMatrix();foliage.setMatrixAt(index++,dummy.matrix);
    }
  }
  foliage.castShadow=true;foliage.receiveShadow=true;root.add(foliage);
  // Two understated benches on paved side walks.
  for(const [x,z] of [[-12.1,6.5],[12.1,11.4]]){
    for(const dz of [-.55,.55])box(.48,.24,.16,x,.12,z+dz,edge);
    for(const dx of [-.16,0,.16])box(.14,.055,1.65,x+dx,.267,z,wood);
  }
  // Restrained foreground stone groups, resting within the lawn.
  const rockGeo=new T.DodecahedronGeometry(1,0);
  for(const [x,z,s] of [[-9.8,12.6,.38],[-9.3,12.8,.22],[9.8,5.1,.30]]){
    const rock=new T.Mesh(rockGeo,edge);rock.position.set(x,s*.36,z);rock.scale.set(s,s*.65,s*.8);rock.rotation.set(.2,x,.15);rock.castShadow=true;rock.receiveShadow=true;root.add(rock);
  }
  return root;
}
