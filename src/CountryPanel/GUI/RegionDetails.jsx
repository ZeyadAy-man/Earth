import HandleRegionSelect from "../Handles/HandleSelectRegion";
import { styles } from "../Styles";

export default function RegionDetails({ regions, loading, onRegionSelect, country, setSelectedRegionName, setRegionLoading, setRegionImage, setHotelImage, setAttractionImage, regionLoading, regionImage }) {
  return (
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
  );
}