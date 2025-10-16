import HandleEarthClick from "./EarthClickLogic";
import EarthGUI from "./EarthGUI";

export default function Earth({ onClickLatLon }) {
  const handleClick = HandleEarthClick(onClickLatLon);
  return (
    <EarthGUI handleClick={handleClick}/>
  );
}