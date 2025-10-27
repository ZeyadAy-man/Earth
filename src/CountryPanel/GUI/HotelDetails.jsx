import { useState } from "react";
import { fetchHotelImage } from "../../Hooks/Hooks";
import { styles } from "../Styles";
import { FiPhone, FiMapPin, FiGlobe } from "react-icons/fi";
import { MdStarRate } from "react-icons/md";

export default function HotelDetails({
  hotels,
  cityName,
  countryName,
  hotelImage,
  setHotelImage,
  hotelLoading,
  setHotelLoading,
}) {
  const [selectedHotel, setSelectedHotel] = useState(null);

  return (
    <div
      style={{
        background: "rgba(20,20,20,0.8)",
        padding: 14,
        borderRadius: 10,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
        Top hotels
      </div>

      <select
        style={{ ...styles.select, marginBottom: 10 }}
        onChange={(e) => {
          const id = e.target.value;
          const sel = hotels.find((h) => h.properties.place_id === id);
          setSelectedHotel(sel || null);

          if (sel) {
            fetchHotelImage(
              sel.properties.name,
              cityName,
              countryName,
              setHotelImage,
              setHotelLoading
            );
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
            {h.properties.address_line1 || h.properties.name}
          </option>
        ))}
      </select>

      {hotelLoading ? (
        <div style={{ marginTop: 8, color: "#aaa" }}>Loading image...</div>
      ) : hotelImage ? (
        <>
          <img
            src={hotelImage}
            alt="hotel"
            style={{
              width: "100%",
              height: 180,
              objectFit: "cover",
              borderRadius: 8,
              marginTop: 6,
              marginBottom: 10,
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {selectedHotel?.properties.website && (
              <a
                href={selectedHotel.properties.website}
                target="_blank"
                style={{
                  color: "#58a6ff",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <FiGlobe /> Visit Website
              </a>
            )}

            {selectedHotel?.properties.address_line1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <FiMapPin /> {selectedHotel.properties.address_line1}
              </div>
            )}

            {selectedHotel?.properties.contact?.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <FiPhone /> {selectedHotel.properties.contact.phone}
              </div>
            )}

            {selectedHotel?.properties.accommodation?.stars && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MdStarRate /> {selectedHotel.properties.accommodation.stars} Stars
              </div>
            )}

            {selectedHotel?.geometry?.coordinates && (
              <a
                href={`https://www.google.com/maps?q=${selectedHotel.geometry.coordinates[1]},${selectedHotel.geometry.coordinates[0]}`}
                target="_blank"
                style={{
                  marginTop: 8,
                  padding: "8px 10px",
                  textAlign: "center",
                  borderRadius: 6,
                  border: "1px solid #444",
                  textDecoration: "none",
                  color: "#ddd",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                Open in Google Maps
              </a>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
