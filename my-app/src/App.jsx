import CountryPanel from "./CountryPanel/CountryPanel";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import StarField from "./Background/StarField";
import {
  reverseGeocode,
  getCountryFromRestCountries,
  getWeather,
  fetchCapitalImage,
  fetchRegionsGeoNames,
  fetchRegionsWikidata,
  fetchCitiesGeoNames,
  fetchPlacesGeoapify,
} from "./Hooks/Hooks";
import Earth from "./Earth/Earth";

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState({
    country: false,
    regions: false,
    cities: false,
    places: false,
  });
  const [error, setError] = useState(null);

  const [selectedCountryName, setSelectedCountryName] = useState(null);
  const [selectedRegionName, setSelectedRegionName] = useState(null);
  const [selectedCityName, setSelectedCityName] = useState(null);

  async function onCountryClick({ lat, lon }) {
    setError(null);
    setLoading((s) => ({ ...s, country: true, regions: true }));
    setSelectedCityName(null);
    setSelectedRegionName(null);
    try {
      const rev = await reverseGeocode(lat, lon);
      const countryCode = rev.address?.country_code?.toUpperCase();
      console.log("Reverse geocode country code:", countryCode, rev);
      if (!countryCode) throw new Error("No country at that location");

      const countryData = await getCountryFromRestCountries(countryCode);
      const weatherData = await getWeather(lat, lon);

      const countryName = countryData?.[0]?.name?.common || null;
      setSelectedCountryName(countryName);

      const capitalName = countryData?.[0]?.capital?.[0] || null;
      let capitalImage = null;
      try {
        capitalImage = await fetchCapitalImage(capitalName, countryName);
      } catch (err) {
        console.warn("Capital image failed", err);
        capitalImage = null;
      }

      let regions = [];
      try {
        regions = await fetchRegionsGeoNames(countryCode, countryName);
        console.log(
          "Country Code: ",
          countryCode,
          "Country Name: ",
          countryName,
          "Regions:",
          regions
        );
      } catch (err) {
        console.warn("GeoNames regions failed, trying Wikidata", err);
        try {
          regions = await fetchRegionsWikidata(countryCode);
        } catch (err2) {
          console.warn("Wikidata regions failed", err2);
          regions = [];
        }
      }

      setData({
        geoData: { ...rev, lat, lon },
        countryData,
        weatherData,
        capitalImage,
        regions,
        cities: [],
        places: [],
      });

      // reset previous selections
      setSelectedRegionName(null);
      setSelectedCityName(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load country");
    } finally {
      setLoading((s) => ({ ...s, country: false, regions: false }));
    }
  }

  // region selected -> load cities
  async function onRegionSelect(region) {
    setError(null);
    setLoading((s) => ({ ...s, cities: true }));
    setData((d) => ({ ...d, cities: [], places: [] }));
    setSelectedRegionName(region?.name || null);
    setSelectedCityName(null); // reset city when region changes

    try {
      const countryCode = data?.countryData?.[0]?.cca2;
      const cities = await fetchCitiesGeoNames(region, countryCode);

      // sort by name and dedupe
      const seen = new Set();
      const dedup = [];
      for (const c of cities || []) {
        const key = `${c.name}-${c.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          dedup.push(c);
        }
      }
      dedup.sort((a, b) => a.name.localeCompare(b.name));
      setData((d) => ({ ...d, cities: dedup }));
    } catch (err) {
      console.error(err);
      setError("Failed to load cities");
    } finally {
      setLoading((s) => ({ ...s, cities: false }));
    }
  }

  // city selected -> load places
  async function onCitySelect(city) {
    setError(null);
    setLoading((s) => ({ ...s, places: true }));
    setData((d) => ({ ...d, places: [] }));
    setSelectedCityName(city?.name || null);

    try {
      let lat = city.latitude;
      let lon = city.longitude;

      if (!lat || !lon) {
        const q = encodeURIComponent(`${city.name}, ${selectedCountryName}`);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`
        );
        const j = await res.json();
        if (j && j[0]) {
          lat = parseFloat(j[0].lat);
          lon = parseFloat(j[0].lon);
        }
      }

      if (!lat || !lon) throw new Error("City coordinates not found");

      const places = await fetchPlacesGeoapify(lat, lon);
      setData((d) => ({ ...d, places }));
    } catch (err) {
      console.error(err);
      setError("Failed to load places");
    } finally {
      setLoading((s) => ({ ...s, places: false }));
    }
  }

  return (
    <>
      <CanvasScene onCountryClick={onCountryClick} />
      <CountryPanel
        data={data}
        loading={loading}
        error={error}
        onRegionSelect={onRegionSelect}
        onCitySelect={onCitySelect}
        countryName={selectedCountryName}
        cityName={selectedCityName}
        regionName={selectedRegionName}
      />
    </>
  );
}
function CanvasScene({onCountryClick}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3] }}
      style={{ width: "100vw", height: "100vh", background: "black" }}
    >
      <StarField />
      <ambientLight intensity={3} />
      <directionalLight position={[5, 5, 5]} />
      <Earth onClickLatLon={onCountryClick} capitalCity={null} />
      <OrbitControls enablePan={false} minDistance={1.5} maxDistance={8} />
    </Canvas>
  );
}
