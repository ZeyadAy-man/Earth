import { useEffect, useRef } from "react";
import InitializerStates from "../InitializerStates/InitializerStates";
import IdleGUI from "./GUI/IdleGUI";
import HotelFilters from "./Filters/HotelFilters";
import AttractionFilters from "./Filters/AttractionFilters";
import CountryDetails from "./GUI/CountryDetails";
import { styles } from "./Styles";
import RegionDetails from "./GUI/RegionDetails";
import CityDetails from "./GUI/CityDetails";
import HotelDetails from "./GUI/HotelDetails";
import AttractionDetails from "./GUI/AttractionDetails";
import "./styles.css";
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

  useEffect(() => {
    if (!data) {
      setRegionImage(null);
      setHotelImage(null);
      setAttractionImage(null);
    }
  }, [data]);

  const attractionFetchControllerRef = useRef(null);

  if (!data) {
    return <IdleGUI error={error} styles={styles} />;
  }

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
  const hotels = HotelFilters({ places });
  const attractions = AttractionFilters({ places });

  return (
    <>
      <div style={styles.panel} className="country-panel">
        <CountryDetails
          geoData={geoData}
          country={country}
          weatherData={weatherData}
          capitalImage={capitalImage}
        />

        <hr
          style={{
            border: "none",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            margin: "12px 0",
          }}
        />

        <RegionDetails
          regions={regions}
          loading={loading}
          onRegionSelect={onRegionSelect}
          country={country}
          setSelectedRegionName={setSelectedRegionName}
          setRegionLoading={setRegionLoading}
          setRegionImage={setRegionImage}
          setHotelImage={setHotelImage}
          setAttractionImage={setAttractionImage}
          regionLoading={regionLoading}
          regionImage={regionImage}
        />

        <CityDetails
          cities={cities}
          loading={loading}
          onCitySelect={onCitySelect}
        />

        {/* places */}
        <div style={{ marginTop: 12 }}>
          <label style={{ fontWeight: 700 }}>📍 Top places</label>

          <HotelDetails
            hotels={hotels}
            cityName={cityName}
            countryName={countryName}
            hotelImage={hotelImage}
            setHotelImage={setHotelImage}
            hotelLoading={hotelLoading}
            setHotelLoading={setHotelLoading}
          />

          <AttractionDetails
            attractions={attractions}
            regionName={regionName}
            countryName={countryName}
            attractionImage={attractionImage}
            setAttractionImage={setAttractionImage}
            selectedAttraction={selectedAttraction}
            setSelectedAttraction={setSelectedAttraction}
            imageLoading={imageLoading}
            setImageLoading={setImageLoading}
            loading={loading}
            attractionFetchControllerRef={attractionFetchControllerRef}
            places={places}
          />
        </div>
      </div>
    </>
  );
}
