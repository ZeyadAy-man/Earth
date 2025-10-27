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
  if (!res.ok) throw new Error("Geonames search failed");
  const json = await res.json();
  const first = (json.geonames || [])[0];
  return first?.geonameId || null;
}

export async function fetchRegionsGeoNames(countryCode, countryName) {
  if (!GEO_NAMES_USERNAME) throw new Error("Missing GeoNames username");
  let countryId = await fetchCountryGeoNameId(countryCode, countryName);
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

export async function fetchCitiesGeoNames(region, countryCode) {
  if (!GEO_NAMES_USERNAME) throw new Error("Missing GeoNames username");
  let cities = [];

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

  const categories = [
    "accommodation.hotel",
    "accommodation.guest_house",
    "tourism.attraction",
    "entertainment.theme_park",
    "entertainment.cinema",
    "airport.military"
  ].join(",");

  const url = `https://api.geoapify.com/v2/places?categories=${encodeURIComponent(
    categories
  )}&filter=circle:${lon},${lat},${radius}&limit=120&apiKey=${GEOAPIFY_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Geoapify failed");
  const json = await res.json();
  return json.features || [];
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
      console.log(data.results[0].urls.small || data.results[0].urls.regular || null)
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

const WIKIDATA_SPARQL = "https://query.wikidata.org/sparql";

export async function fetchGeoNamesGet(geonameId) {
  if (!GEO_NAMES_USERNAME) throw new Error("Missing GeoNames username");
  const url = `https://secure.geonames.org/getJSON?geonameId=${geonameId}&username=${GEO_NAMES_USERNAME}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("GeoNames getJSON failed");
  return res.json();
}
/**
 * Fetch area, industries, climate from Wikidata by GeoNames ID
 */
export async function fetchWikidataByGeonameId(geonameId) {
  if (!geonameId) return null;

  const query = `
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
SELECT ?area ?industryLabel ?climateLabel WHERE {
  ?region wdt:P1566 "${geonameId}".
  OPTIONAL { ?region wdt:P2046 ?area. }
  OPTIONAL { ?region wdt:P452 ?industry.
             SERVICE wikibase:label { bd:serviceParam wikibase:language "en". ?industry rdfs:label ?industryLabel. } }
  OPTIONAL { ?region wdt:P2564 ?climate.
             SERVICE wikibase:label { bd:serviceParam wikibase:language "en". ?climateLabel. } }
}
LIMIT 50
`;
  const url = `${WIKIDATA_SPARQL}?format=json&query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "Accept": "application/sparql-results+json",
      "User-Agent": "YourApp/1.0 (youremail@example.com)"
    }
  });
  if (!res.ok) {
    console.warn("Wikidata SPARQL failed", res.status);
    return null;
  }
  const json = await res.json();
  const rows = json.results?.bindings || [];
  const result = { area_km2: null, main_economic_activities: [], climate: null };

  for (const r of rows) {
    if (r.area && r.area.value) result.area_km2 = Number(r.area.value);
    if (r.industryLabel && r.industryLabel.value) result.main_economic_activities.push(r.industryLabel.value);
    if (r.climateLabel && r.climateLabel.value) result.climate = r.climateLabel.value;
  }

  return result;
}

/**
 * Enrich a region object with population, area, industries, airports, climate
 */
export async function enrichRegion(region) {
  const { geonameId } = region;
  const out = { ...region, population: null, area_km2: null, main_economic_activities: [], climate: null, airports: [] };

  try {
    // 1) Population from GeoNames
    const gn = await fetchGeoNamesGet(geonameId);
    if (gn && gn.population) out.population = Number(gn.population);

    // 2) Wikidata enrichment
    const wd = await fetchWikidataByGeonameId(geonameId); // دالة جديدة SPARQL
    if (wd) {
      if (wd.area_km2) out.area_km2 = wd.area_km2;
      if (wd.main_economic_activities?.length) out.main_economic_activities = wd.main_economic_activities;
      if (wd.climate) out.climate = wd.climate;
      if (wd.airports?.length) out.airports = wd.airports;
    }

    return out;
  } catch (err) {
    console.error("enrichRegion error", err);
    return out;
  }
}

/**
 * Batch enrich multiple regions
 */
export async function enrichRegionsBatch(regions, batchSize = 6, delayMs = 200) {
  const results = [];
  for (let i = 0; i < regions.length; i += batchSize) {
    const batch = regions.slice(i, i + batchSize);
    const enriched = await Promise.all(batch.map(r => enrichRegion(r)));
    results.push(...enriched);
    await new Promise(res => setTimeout(res, delayMs)); // rate limit friendly
  }
  return results;
}