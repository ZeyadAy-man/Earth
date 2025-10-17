export default function CountryDetails({geoData, country, weatherData, capitalImage}) {
  return (
    <>
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
    </>
  );
}