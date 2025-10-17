import HandleSelectAttraction from "../Handles/HandleSelectAttraction";
import { styles } from "../Styles";

export default function AttractionDetails({ attractions, regionName, countryName, attractionImage, setAttractionImage, selectedAttraction, setSelectedAttraction, imageLoading, setImageLoading, loading, attractionFetchControllerRef, places }) {
  return (
    <div style={{ marginTop: 8 }}>
      {loading.places ? (
        <div>Loading places...</div>
      ) : places && places.length ? (
        <>
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
            <div style={{ marginTop: 8, color: "#aaa" }}>Loading image...</div>
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
  );
}