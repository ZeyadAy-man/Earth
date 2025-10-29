import { reverseGeocode } from "../../Hooks/Hooks";
import { getCountryFromRestCountries } from "../../Hooks/Hooks";
import { getWeather } from "../../Hooks/Hooks";
import { fetchCapitalImage } from "../../Hooks/Hooks";
import { fetchRegionsGeoNames } from "../../Hooks/Hooks";
import { fetchRegionsWikidata } from "../../Hooks/Hooks";

export default async function onCountryClick(
  lat,
  lon,
  setData,
  setSelectedCountryName,
  setSelectedRegionName,
  setSelectedCityName,
  setError,
  setLoading
) {
  setError(null);
  setLoading((s) => ({ ...s, country: true, regions: true }));
  setSelectedCityName(null);
  setSelectedRegionName(null);
  try {
    const rev = await reverseGeocode(lat, lon);
    const countryCode = rev.address?.country_code?.toUpperCase();
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

    setSelectedRegionName(null);
    setSelectedCityName(null);
  } catch (err) {
    console.error(err);
    setError(err.message || "Failed to load country");
  } finally {
    setLoading((s) => ({ ...s, country: false, regions: false }));
  }
}
