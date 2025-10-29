import { UNSPLASH_KEY } from "../../config";

export default async function HandleRegionSelect({
  e,
  onRegionSelect,
  regions,
  country,
  setSelectedRegionName,
  setRegionLoading,
  setRegionImage,
  setHotelImage,
  setAttractionImage,
}) {
  const idx = Number(e.target.value);
  if (Number.isNaN(idx)) return;
  const region = regions[idx];

  setSelectedRegionName(region.name);
  onRegionSelect(region);

  setRegionLoading(true);
  setRegionImage(null);
  setHotelImage(null);
  setAttractionImage(null);

  try {
    const query = `${region.name} ${country?.name?.common || ""} landmarks`;
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=1&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
      }
    );
    const json = await res.json();
    const img =
      json.results?.[0]?.urls?.regular ||
      `https://source.unsplash.com/800x500/?${encodeURIComponent(region.name)}`;
    setRegionImage(img);
  } catch (err) {
    console.warn("Region image fetch failed", err);
    setRegionImage(
      `https://source.unsplash.com/800x500/?${encodeURIComponent(region.name)}`
    );
  } finally {
    setRegionLoading(false);
  }
}