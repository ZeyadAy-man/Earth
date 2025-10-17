import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export default function HandleEarthClick( onClickLatLon ) {
  const { camera } = useThree();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  return (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1);
    const intersection = raycaster.ray.intersectSphere(
      sphere,
      new THREE.Vector3()
    );
    if (!intersection) return;
    const p = intersection.clone().normalize();
    const lat = Math.asin(p.y) * (180 / Math.PI);
    const lon = Math.atan2(p.x, p.z) * (180 / Math.PI);
    onClickLatLon({ lat, lon });
  }
}