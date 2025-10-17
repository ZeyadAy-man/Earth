export default function StarFieldGUI({ stars, groupRef }) {
  return (
    <group ref={groupRef}>
      {stars.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
      ))}
    </group>
  );
}
