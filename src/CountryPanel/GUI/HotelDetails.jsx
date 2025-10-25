import { useState } from "react";
import { fetchHotelImage } from "../../Hooks/Hooks";
import { styles } from "../Styles";

export default function HotelDetails({
  hotels,
  cityName,
  countryName,
  hotelImage,
  setHotelImage,
  hotelLoading,
  setHotelLoading,
}) {
  const [selectedHotel, setSelectedHotel] = useState({});
  console.log(hotels);

  return (
    <>
      <div style={{ fontSize: 13, opacity: 0.9 }}>Top hotels</div>
      <select
        style={styles.select}
        onChange={(e) => {
          const id = e.target.value;
          const sel = hotels.find((h) => h.properties.place_id === id);
          if (sel) {
            setSelectedHotel(sel);
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
            {h.properties.name || "Unnamed Hotel"}
          </option>
        ))}
      </select>

      {/* 🏨 Hotel image displayed below dropdown */}
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
              marginTop: 8,
            }}
          />
          <a href={selectedHotel.properties.website} target="_blank">{selectedHotel.properties.website}</a>
        </>
      ) : null}
    </>
  );
}
