import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

export default function EarthGUI({ handleClick }) {
  const texture = useLoader(THREE.TextureLoader, "niceImage.jpg");

  return (
    <mesh onClick={handleClick} rotation={[0, -Math.PI / 2, 0]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
