import * as THREE from "three";

export default function EarthGUI({handleClick}) {
  return (
    <mesh onClick={handleClick} rotation={[0, -Math.PI / 2, 0]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={new THREE.TextureLoader().load("earth.jpg")} />
    </mesh>
  );
}