import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import StarField from "../Background/StarField";
import Earth from "../Earth/Earth";

export default function CanvasScene({onCountryClick}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3] }}
      style={{ width: "100vw", height: "100vh", background: "black" }}
    >
      <StarField />
      <ambientLight intensity={2} />
      <directionalLight position={[5, 5, 5]} />
      <Earth onClickLatLon={onCountryClick} capitalCity={null} />
      <OrbitControls enablePan={false} minDistance={1.5} maxDistance={8} />
    </Canvas>
  );
}
