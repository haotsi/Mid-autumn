import * as T from 'three';

export function homeView(width){const mobile=width<700;return {position:new T.Vector3(mobile?22:25,mobile?18:15,mobile?43:31),target:new T.Vector3(mobile?0:-4,4,0)};}
export function createHomeTransition(camera,controls){
  let transition=null;
  const cancel=()=>{transition=null;controls.enableDamping=true;};
  controls.addEventListener('start',cancel);
  return {
    reset(width,immediate=false){
      // Flush residual orbit damping before capturing the starting pose.
      const pose=camera.position.clone(),target=controls.target.clone();
      controls.enableDamping=false;controls.update();
      camera.position.copy(pose);controls.target.copy(target);
      const home=homeView(width);
      if(immediate){camera.position.copy(home.position);controls.target.copy(home.target);controls.update();cancel();return;}
      const from=new T.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      const to=new T.Spherical().setFromVector3(home.position.clone().sub(home.target));
      to.theta=from.theta+T.MathUtils.euclideanModulo(to.theta-from.theta+Math.PI,Math.PI*2)-Math.PI;
      transition={from,to,target:controls.target.clone(),home,elapsed:0};
    },
    update(dt){
      if(!transition)return;
      const s=transition;s.elapsed+=dt;const p=Math.min(s.elapsed/1.35,1),ease=p*p*p*(p*(p*6-15)+10);
      controls.target.lerpVectors(s.target,s.home.target,ease);
      const orbit=new T.Spherical(T.MathUtils.lerp(s.from.radius,s.to.radius,ease),T.MathUtils.lerp(s.from.phi,s.to.phi,ease),T.MathUtils.lerp(s.from.theta,s.to.theta,ease));
      camera.position.setFromSpherical(orbit).add(controls.target);
      if(p===1){camera.position.copy(s.home.position);controls.target.copy(s.home.target);cancel();}
    }
  };
}
