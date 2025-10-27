import HandleSelectAttraction from "../Handles/HandleSelectAttraction";
import { styles } from "../Styles";
import { MdStarRate } from "react-icons/md";
import { FiMapPin, FiPhone, FiGlobe } from "react-icons/fi";

export default function AttractionDetails({
  attractions,
  regionName,
  countryName,
  attractionImage,
  setAttractionImage,
  selectedAttraction,
  setSelectedAttraction,
  imageLoading,
  setImageLoading,
  loading,
  attractionFetchControllerRef,
  places,
}) {
  return (
    <>
      <div style={{ fontSize: 13, opacity: 0.9 }}>Top attractions</div>

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
        <option value="">Select an attraction</option>
        {attractions.map((a, i) => (
          <option
            key={a.properties.place_id}
            value={i}
            style={{ backgroundColor: "black" }}
          >
            {a.properties.address_line1}
          </option>
        ))}
      </select>

      {/* 🏰 Attraction image */}
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

      {/* 🗺️ Details Section */}
      {selectedAttraction && (
        <div style={{ marginTop: 10 }}>
          {selectedAttraction?.properties.website && (
            <a
              href={selectedAttraction.properties.website}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#58a6ff",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                margin: "6px 0",
              }}
            >
              <FiGlobe /> Visit Website
            </a>
          )}

          {selectedAttraction?.properties.address_line1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                margin: "6px 0",
              }}
            >
              <FiMapPin /> {selectedAttraction.properties.address_line1}
            </div>
          )}

          {selectedAttraction?.properties.contact?.phone && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                margin: "6px 0",
              }}
            >
              <FiPhone /> {selectedAttraction.properties.contact.phone}
            </div>
          )}

          {selectedAttraction?.properties.accommodation?.stars && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                margin: "6px 0",
              }}
            >
              <MdStarRate />{" "}
              {selectedAttraction.properties.accommodation.stars} Stars
            </div>
          )}

          {selectedAttraction?.geometry?.coordinates && (
            <a
              href={`https://www.google.com/maps?q=${selectedAttraction.geometry.coordinates[1]},${selectedAttraction.geometry.coordinates[0]}`}
              target="_blank"
              rel="noreferrer"
              style={{
                marginTop: 8,
                padding: "8px 10px",
                textAlign: "center",
                borderRadius: 6,
                border: "1px solid #444",
                textDecoration: "none",
                color: "#ddd",
                display: "block",
                cursor: "pointer",
                transition: "0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  "rgba(255,255,255,0.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              Open in Google Maps
            </a>
          )}
        </div>
      )}
    </>
  );
}
