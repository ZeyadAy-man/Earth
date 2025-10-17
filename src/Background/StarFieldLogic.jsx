import { useState } from "react";
import { useFrame } from "@react-three/fiber";

export default function StarFieldLogic({ groupRef }) {
  const [stars] = useState(() =>
    Array.from({ length: 1300 }, () => [
      (Math.random() - 0.5) * 1300,
      (Math.random() - 0.5) * 1300,
      -Math.random() * 1300,
    ])
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.01;
  });

  return stars;
}
