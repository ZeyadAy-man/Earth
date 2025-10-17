import {
  GEO_NAMES_USERNAME,
  GEOAPIFY_KEY,
  OPENWEATHER_KEY,
  UNSPLASH_KEY,
} from "../config";

export async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=5&addressdetails=1`
  );
  if (!res.ok) throw new Error("Reverse geocode failed");
  return res.json();
}

export async function getCountryFromRestCountries(alpha2) {
  const res = await fetch(`https://restcountries.com/v3.1/alpha/${alpha2}`);
  if (!res.ok) throw new Error("restcountries failed");
  return res.json();
}

export async function getWeather(lat, lon) {
  if (!OPENWEATHER_KEY) return null;
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}`
  );
  if (!res.ok) return null;
  return res.json();
}

export async function fetchCapitalImage(capitalName, countryName) {
  if (!capitalName) return null;

  // Emphasize famous landmarks / tourist attractions in search
  const query = `${capitalName} ${countryName || ""} famous landmarks OR monuments OR attractions`;

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&per_page=6&orientation=landscape`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_KEY}`,
      },
    });

    if (!res.ok) {
      console.warn("Unsplash API failed:", res.status);
      return `https://source.unsplash.com/800x500/?${encodeURIComponent(
        capitalName + " landmark"
      )}`;
    }

    const json = await res.json();
    if (json.results && json.results.length > 0) {
      // Prefer most relevant photo by popularity (likes + relevance)
      const best = json.results.sort((a, b) => b.likes - a.likes)[0];
      return best.urls?.regular || best.urls?.small || best.urls?.thumb || null;
    } else {
      return `https://source.unsplash.com/800x500/?${encodeURIComponent(
        capitalName + " landmark"
      )}`;
    }
  } catch (err) {
    console.warn("fetchCapitalImage error:", err);
    return `https://source.unsplash.com/800x500/?${encodeURIComponent(
      capitalName + " landmark"
    )}`;
  }
}

export async function fetchCountryGeoNameId(countryCode, countryName) {
  const q = countryName
    ? `q=${encodeURIComponent(countryName)}`
    : `country=${countryCode}`;
  const url = `https://secure.geonames.org/searchJSON?${q}&featureCode=PCLI&maxRows=10&username=${GEO_NAMES_USERNAME}`;
  const res = await fetch(url);
  console.log("GeoNames country search res:", res);
  if (!res.ok) throw new Error("Geonames search failed");
  const json = await res.json();
  const first = (json.geonames || [])[0];
  return first?.geonameId || null;
}

export async function fetchRegionsGeoNames(countryCode, countryName) {
  if (!GEO_NAMES_USERNAME) throw new Error("Missing GeoNames username");
  let countryId = await fetchCountryGeoNameId(countryCode, countryName);
  console.log("Country GeoNameId:", countryCode, "Country Name:", countryName, "ID:", countryId);
  
  if(countryId == 1814991 && countryCode === "US" && countryName === "United States") {
    countryId = 6252001;
  }
  if(countryId == 294640 &&countryCode === "IL"){
    countryId = 6254930;
  }
  
  if (!countryId) return [];

  const childrenUrl = `https://secure.geonames.org/childrenJSON?geonameId=${countryId}&username=${GEO_NAMES_USERNAME}`;
  const res = await fetch(childrenUrl);
  if (!res.ok) throw new Error("Geonames children failed");
  const json = await res.json();
  console.log("GeoNames regions fetched:", (json.geonames || []));
  const regions = (json.geonames || []).map((g) => ({
    name: g.name,
    geonameId: g.geonameId,
    adminCode1: g.adminCodes1?.ISO3166_2 || g.adminCode1 || null,
    bbox: g.bbox
      ? [g.bbox.west, g.bbox.south, g.bbox.east, g.bbox.north]
      : null,
  }));

  return regions;
}

export async function fetchCitiesGeoNames(region, countryCode) {
  if (!GEO_NAMES_USERNAME) throw new Error("Missing GeoNames username");
  let cities = [];
  // console.log("Fetching cities for region:", region, "Country:", countryCode);
  // Attempt 1 - search using adminCode1
  if (region.adminCode1) {
    const url = `https://secure.geonames.org/searchJSON?country=${countryCode}&adminCode1=${encodeURIComponent(
      region.adminCode1
    )}&featureClass=P&maxRows=500&username=${GEO_NAMES_USERNAME}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.geonames?.length) {
      cities = json.geonames.map((c) => ({
        id: c.geonameId,
        name: c.name,
        latitude: parseFloat(c.lat),
        longitude: parseFloat(c.lng),
      }));
      if (cities.length) return cities;
    }
  }

  // Attempt 2 - children of region's geonameId
  if (region.geonameId) {
    const url = `https://secure.geonames.org/childrenJSON?geonameId=${region.geonameId}&username=${GEO_NAMES_USERNAME}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.geonames?.length) {
      cities = json.geonames
        .filter(
          (g) =>
            (g.fcodeName || "").toLowerCase().includes("populated place") ||
            g.population > 0
        )
        .map((c) => ({
          id: c.geonameId,
          name: c.name,
          latitude: parseFloat(c.lat),
          longitude: parseFloat(c.lng),
        }));
      if (cities.length) return cities;
    }
  }

  // Attempt 3 - search by region name as fallback
  if (region.name) {
    const url = `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(
      region.name
    )}&country=${countryCode}&featureClass=P&maxRows=500&username=${GEO_NAMES_USERNAME}`;
    const res = await fetch(url);
    const json = await res.json();
    cities = (json.geonames || []).map((c) => ({
      id: c.geonameId,
      name: c.name,
      latitude: parseFloat(c.lat),
      longitude: parseFloat(c.lng),
    }));
  }

  return cities;
}

export async function fetchPlacesGeoapify(lat, lon) {
  if (!GEOAPIFY_KEY) return [];
  const radius = 30000;
  const categories = "accommodation.hotel,tourism";
  const url = `https://api.geoapify.com/v2/places?categories=${encodeURIComponent(
    categories
  )}&filter=circle:${lon},${lat},${radius}&limit=40&apiKey=${GEOAPIFY_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geoapify failed");
  const json = await res.json();
  return json.features || [];
}

export async function fetchRegionsWikidata(countryCode) {
  const query = `
SELECT DISTINCT ?label WHERE {
  ?country wdt:P297 "${countryCode}".
  ?region wdt:P17 ?country.
  VALUES ?inst { wd:Q10864048 wd:Q23259 wd:Q43189 wd:Q310686 wd:Q258831 }
  ?region wdt:P31 ?inst.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 500`;
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(
    query
  )}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Wikidata SPARQL failed");
  const json = await res.json();
  const bindings = json.results?.bindings || [];
  const seen = new Set();
  return bindings
    .map((b) => b.label.value)
    .filter((n) => {
      if (seen.has(n)) return false;
      seen.add(n);
      return true;
    })
    .map((name) => ({ name, geonameId: null }));
}

export async function fetchAttractionImage(attractionName, regionName, countryName, signal) {
  try {
    const query = `${attractionName}${regionName ? ", " + regionName : ""}${
      countryName ? ", " + countryName : ""
    }`;

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&per_page=1&orientation=landscape`;

    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
      signal,
    });

    if (!res.ok) {
      // If aborted, let caller handle; otherwise warn
      if (res.status === 403 || res.status === 401) {
        console.warn("Unsplash auth / rate limit issue:", res.status);
      }
      return null;
    }

    const data = await res.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].urls.small || data.results[0].urls.regular || null;
    } else {
      // fallback: query by attraction name only
      const fallbackUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        attractionName
      )}&per_page=1&orientation=landscape`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
        signal,
      });
      if (!fallbackRes.ok) return null;
      const fallbackData = await fallbackRes.json();
      return fallbackData.results?.[0]?.urls?.small || null;
    }
  } catch (error) {
    if (error.name === "AbortError") {
      // fetch was aborted — caller expects this possibility
      return null;
    }
    console.error("Error fetching attraction image:", error);
    return null;
  }
}

export async function fetchHotelImage(hotelName, cityName, countryName, setHotelImage, setHotelLoading) {
  
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