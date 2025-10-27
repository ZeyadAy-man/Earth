import { styles } from "../Styles";

export default function CityDetails({ cities, loading, onCitySelect }) {

  return (
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
              <option key={c.id} value={i} style={{ backgroundColor: "black" }}>
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
  );
}
