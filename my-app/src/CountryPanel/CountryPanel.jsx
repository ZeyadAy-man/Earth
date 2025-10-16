import { useRef } from "react";
import InitializerStates from "../InitializerStates/InitializerStates";
import { UNSPLASH_KEY } from "../config";
import HandleSelectAttraction from "./HandleSelectAttraction";
import IdleGUI from "./IdleGUI";

async function HandleRegionSelect({
  e,
  onRegionSelect,
  regions,
  country,
  setSelectedRegionName,
  setRegionLoading,
  setRegionImage,
  setHotelImage,
  setAttractionImage,
}) {
  const idx = Number(e.target.value);
  if (Number.isNaN(idx)) return;
  const region = regions[idx];

  setSelectedRegionName(region.name);
  onRegionSelect(region);

  // fetch region image
  setRegionLoading(true);
  setRegionImage(null);
  setHotelImage(null);
  setAttractionImage(null);

  try {
    const query = `${region.name} ${country?.name?.common || ""} landmarks`;
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=1&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
      }
    );
    const json = await res.json();
    const img =
      json.results?.[0]?.urls?.regular ||
      `https://source.unsplash.com/800x500/?${encodeURIComponent(region.name)}`;
    setRegionImage(img);
  } catch (err) {
    console.warn("Region image fetch failed", err);
    setRegionImage(
      `https://source.unsplash.com/800x500/?${encodeURIComponent(region.name)}`
    );
  } finally {
    setRegionLoading(false);
  }
}

export default function CountryPanel({
  data,
  loading,
  error,
  onRegionSelect,
  onCitySelect,
  countryName,
  cityName,
  regionName,
}) {
  const {
    regionImage,
    setRegionImage,
    regionLoading,
    setRegionLoading,
    hotelImage,
    setHotelImage,
    hotelLoading,
    setHotelLoading,
    selectedAttraction,
    setSelectedAttraction,
    attractionImage,
    setAttractionImage,
    imageLoading,
    setImageLoading,
    selectedRegionName,
    setSelectedRegionName,
  } = InitializerStates();

  const attractionFetchControllerRef = useRef(null);

  if (!data) return <IdleGUI error={error} styles={styles} />;

  const {
    geoData,
    countryData,
    weatherData,
    regions = [],
    cities = [],
    places = [],
    capitalImage,
  } = data;
  const country = countryData?.[0];

  const hotels = (places || []).filter((p) =>
    p.properties.categories?.includes("accommodation.hotel")
  );
  const attractions = (places || []).filter((p) =>
    p.properties.categories?.some((c) => c.startsWith("tourism"))
  );

  async function fetchHotelImage(hotelName) {
    if (!hotelName) return setHotelImage(null);
    setHotelLoading(true);
    const query = `${hotelName} hotel in ${cityName || ""}, ${
      countryName || ""
    }`.trim();
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          query
        )}&per_page=1&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
      );
      const json = await res.json();
      const img = json.results?.[0]?.urls?.regular || null;
      setHotelImage(img);
    } catch (err) {
      console.error("Failed to fetch hotel image", err);
      setHotelImage(null);
    } finally {
      setHotelLoading(false);
    }
  }

  return (
    <div style={styles.panel}>
      {/* header */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {country?.flags?.svg && (
          <img
            src={country.flags.svg}
            alt="flag"
            style={{
              width: 56,
              height: 36,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        )}
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>
            {country?.name?.common}
          </div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>
            {country?.region} • {country?.subregion || ""}
          </div>
        </div>
      </div>

      {/* main info */}
      <div style={{ marginTop: 12 }}>
        <div>
          <b>Capital:</b> {country?.capital?.[0] || "N/A"}
        </div>
        <div>
          <b>Population:</b>{" "}
          {country?.population ? country.population.toLocaleString() : "N/A"}
        </div>
        <div>
          <b>Coordinates:</b> {geoData.lat.toFixed(4)}, {geoData.lon.toFixed(4)}
        </div>
        <div>
          <b>Weather:</b>{" "}
          {weatherData
            ? `${weatherData.weather?.[0]?.description || ""} — ${(
                (weatherData.main?.temp || 0) - 273.15
              ).toFixed(1)}°C`
            : "N/A"}
        </div>
        {/* capital image */}
        {capitalImage ? (
          <img
            src={capitalImage}
            alt="capital"
            style={{
              width: "100%",
              height: 180,
              objectFit: "cover",
              borderRadius: 8,
              marginTop: 8,
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: 180,
              background: "#111",
              borderRadius: 8,
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#777",
            }}
          >
            No capital image
          </div>
        )}
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          margin: "12px 0",
        }}
      />

      {/* regions */}
      <div>
        <label style={{ fontWeight: 700 }}>🏙️ Regions / Governorates</label>
        <div style={{ marginTop: 8 }}>
          {loading.regions ? (
            <div>Loading regions...</div>
          ) : regions.length ? (
            <>
              <select
                style={styles.select}
                onChange={(e) =>
                  HandleRegionSelect({
                    e,
                    onRegionSelect,
                    regions,
                    country,
                    setSelectedRegionName,
                    setRegionLoading,
                    setRegionImage,
                    setHotelImage,
                    setAttractionImage,
                  })
                }
              >
                {" "}
                <option value="" style={{ backgroundColor: "black" }}>
                  Select region
                </option>
                {regions.map((r, i) => (
                  <option
                    key={r.geonameId || r.name}
                    value={i}
                    style={{ backgroundColor: "black" }}
                  >
                    {r.name}
                  </option>
                ))}
              </select>

              {/* region image shown under dropdown */}
              {regionLoading ? (
                <div style={{ marginTop: 8, color: "#aaa" }}>
                  Loading image...
                </div>
              ) : regionImage ? (
                <img
                  src={regionImage}
                  alt="region"
                  style={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginTop: 8,
                  }}
                />
              ) : null}
            </>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.9 }}>
              No regions available.
            </div>
          )}
        </div>
      </div>

      {/* cities */}
      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: 700 }}>🏘️ Cities</label>
        <div style={{ marginTop: 8 }}>
          {loading.cities ? (
            <div>Loading cities...</div>
          ) : cities && cities.length ? (
            <select
              style={styles.select}
              onChange={(e) => {
                const idx = Number(e.target.value);
                if (!Number.isNaN(idx)) onCitySelect(cities[idx]);
              }}
            >
              <option value="" style={{ backgroundColor: "black" }}>
                Select city
              </option>
              {cities.map((c, i) => (
                <option
                  key={c.id}
                  value={i}
                  style={{ backgroundColor: "black" }}
                >
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.9 }}>
              No cities loaded — pick a region first.
            </div>
          )}
        </div>
      </div>

      {/* places */}
      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: 700 }}>📍 Top places</label>
        <div style={{ marginTop: 8 }}>
          {loading.places ? (
            <div>Loading places...</div>
          ) : places && places.length ? (
            <>
              <div style={{ fontSize: 13, opacity: 0.9 }}>Top hotels</div>
              <select
                style={styles.select}
                onChange={(e) => {
                  const id = e.target.value;
                  const sel = hotels.find((h) => h.properties.place_id === id);
                  if (sel) {
                    fetchHotelImage(sel.properties.name);
                  } else {
                    setHotelImage(null);
                  }
                }}
              >
                <option value="">Select a hotel</option>
                {hotels.map((h) => (
                  <option
                    key={h.properties.place_id}
                    value={h.properties.place_id}
                    style={{ backgroundColor: "black" }}
                  >
                    {h.properties.name || "Unnamed Hotel"}
                  </option>
                ))}
              </select>

              {/* 🏨 Hotel image displayed below dropdown */}
              {hotelLoading ? (
                <div style={{ marginTop: 8, color: "#aaa" }}>
                  Loading image...
                </div>
              ) : hotelImage ? (
                <img
                  src={hotelImage}
                  alt="hotel"
                  style={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginTop: 8,
                  }}
                />
              ) : null}

              <div
                style={{
                  fontSize: 13,
                  opacity: 0.9,
                  marginTop: 8,
                  marginBottom: 6,
                }}
              >
                Top attractions
              </div>
              <select
                style={styles.select}
                onChange={(e) => {
                  const i = Number(e.target.value);
                  if (attractions[i])
                    HandleSelectAttraction(
                      attractions[i],
                      setAttractionImage,
                      setSelectedAttraction,
                      setImageLoading,
                      attractionFetchControllerRef,
                      regionName,
                      countryName
                    );
                }}
              >
                <option value="" style={{ backgroundColor: "black" }}>
                  Select an attraction
                </option>
                {attractions.map((a, i) => (
                  <option
                    key={a.properties.place_id}
                    value={i}
                    style={{ backgroundColor: "black" }}
                  >
                    {a.properties.name}
                  </option>
                ))}
              </select>

              {/* 🏰 Attraction image displayed below dropdown */}
              {imageLoading ? (
                <div style={{ marginTop: 8, color: "#aaa" }}>
                  Loading image...
                </div>
              ) : attractionImage ? (
                <img
                  src={attractionImage}
                  alt={selectedAttraction?.properties?.name || "Attraction"}
                  style={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginTop: 8,
                  }}
                />
              ) : null}
            </>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.9 }}>No places loaded.</div>
          )}
        </div>
      </div>

      {error && <div style={{ color: "salmon", marginTop: 8 }}>{error}</div>}
    </div>
  );
}

const styles = {
  panel: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 100,
    background: "rgba(10, 15, 25, 0.75)", // semi-transparent dark
    border: "1px solid rgba(0,255,255,0.2)", // cyan border glow
    borderRadius: 16,
    backdropFilter: "blur(14px) saturate(180%)",
    boxShadow:
      "0 0 25px rgba(0,255,255,0.08), inset 0 0 8px rgba(255,255,255,0.03)",
    padding: 16,
    color: "#e5faff",
    fontFamily: "Inter, 'Segoe UI', sans-serif",
    fontSize: 14,
    maxWidth: 360,
    width: "calc(100% - 40px)",
    maxHeight: "85vh",
    overflowY: "auto",
    transition: "0.3s ease all",
  },
  select: {
    width: "100%",
    padding: "7px 10px",
    borderRadius: 10,
    border: "1px solid rgba(0,255,255,0.3)",
    background: "rgba(255,255,255,0)",
    color: "#e5faff",
    fontSize: 13,
    outline: "none",
    cursor: "pointer",
    transition: "all 0.25s ease",
    backgroundColor: "black",
  },
  label: {
    display: "block",
    fontWeight: 700,
    fontSize: 13,
    color: "#00ffff",
    marginBottom: 6,
    marginTop: 10,
    textShadow: "0 0 6px rgba(0,255,255,0.3)",
  },
};
