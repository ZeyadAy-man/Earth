import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { useState } from "react"

function CountryPanel({ data }) {
  if (!data) return null;

  const { geoData, countryData, weatherData } = data;
  const country = countryData[0]; // restcountries returns array

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        width: "300px",
        background: "rgba(20,20,20,0.9)",
        color: "white",
        borderRadius: "12px",
        padding: "16px",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
        <img
          src={country.flags.svg}
          alt="flag"
          style={{ width: "50px", marginRight: "12px", borderRadius: "4px" }}
        />
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{country.name.common}</h2>
      </div>

      <p><b>Capital:</b> {country.capital?.[0]}</p>
      <p><b>Region:</b> {country.region}</p>
      <p><b>Population:</b> {country.population.toLocaleString()}</p>
      <p><b>Coordinates:</b> {geoData.lat}, {geoData.lon}</p>
      <p>
        <b>Weather:</b> {weatherData.weather?.[0]?.description} —{" "}
        {(weatherData.main.temp - 273.15).toFixed(1)}°C
      </p>
    </div>
  );
}
function Earth() {
  const [coords, setCoords] = useState(null)
  const [data, setData] = useState(null);
  const { camera, gl } = useThree()
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()

  async function handleClick(event) {
    // Convert mouse to NDC
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(pointer, camera)

    // Raycast to a perfect sphere (radius = 1)
    const sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1)
    const intersection = raycaster.ray.intersectSphere(sphere, new THREE.Vector3())

    if (intersection) {
      const p = intersection.clone().normalize()
      const lat = Math.asin(p.y) * (180 / Math.PI)
      const lon = Math.atan2(p.x, p.z) * (180 / Math.PI)
      setCoords({ lat, lon })
      const info = await getCountryInfo(lat, lon);
      console.log(info);
      setData(info);
      if(info){
        console.log(info);
      }
      console.log(`Latitude: ${lat.toFixed(2)}°`)
      console.log(`Longitude: ${lon.toFixed(2)}°`)
    }
  }

  return (
    <>
      {/* Earth visual (globe texture or GLTF) */}
      <mesh onClick={handleClick} rotation={[0, -Math.PI / 2, 0]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial map={new THREE.TextureLoader().load("earth.jpg")} />
      </mesh>
      <CountryPanel data={data} />

      {/* Optional overlay */}
    </>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 3] }} style={{backgroundColor: 'black', width: '100vw', height: '100vh'}}>
      <ambientLight intensity={5} />
      <directionalLight position={[5, 5, 5]} />
      <Earth />
      <OrbitControls />
    </Canvas>
  )
}
async function getCountryInfo(lat, lon) {
  try {
    // Reverse geocode
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    const geoData = await geoRes.json();
    const countryCode = geoData.address?.country_code?.toUpperCase();
    if (!countryCode) return null;

    // Country details
    const countryRes = await fetch(
      `https://restcountries.com/v3.1/alpha/${countryCode}`
    );
    const countryData = await countryRes.json();

    // Weather
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=66f213737d90379c9824318bd51c5aae`
    );
    const weatherData = await weatherRes.json();

    return { geoData: { ...geoData, lat, lon }, countryData, weatherData };
  } catch (err) {
    console.error("Error fetching country info:", err);
    return null;
  }
}

