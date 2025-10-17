import { useRef } from "react";
import StarFieldGUI from "./StarFieldGUI";
import StarFieldLogic from "./StarFieldLogic";

export default function StarField() {
  const groupRef = useRef();
  const stars = StarFieldLogic({ groupRef });
  return <StarFieldGUI stars={stars} groupRef={groupRef} />;
}
