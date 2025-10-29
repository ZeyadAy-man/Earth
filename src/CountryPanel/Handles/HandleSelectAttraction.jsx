import { fetchAttractionImage } from "../../Hooks/Hooks";

export default async function HandleSelectAttraction(
  attraction,
  setAttractionImage,
  setSelectedAttraction,
  setImageLoading,
  attractionFetchControllerRef,
  regionName,
  countryName
) {
  if (!attraction) return;

  setAttractionImage(null);
  setSelectedAttraction(attraction);
  setImageLoading(true);
  console.log(attraction)
  try {
    if (attractionFetchControllerRef.current) {
      attractionFetchControllerRef.current.abort();
    }
  } catch (error) {
    console.warn("Previous attraction fetch abort error:", error);
  }

  const controller = new AbortController();
  attractionFetchControllerRef.current = controller;
  const { signal } = controller;

  const currentAttractionName =
    attraction.properties?.name || attraction.name || "";

  try {
    const image = await fetchAttractionImage(
      currentAttractionName,
      regionName,
      countryName,
      signal
    );

    if (attractionFetchControllerRef.current === controller) {
      setAttractionImage(image);
      setImageLoading(false);
    } else {
      // If it's not current, ignore the result
    }
  } catch (err) {
    if (err && err.name === "AbortError") {
      // aborted — ignore
    } else {
      console.error("Failed to fetch attraction image:", err);
      if (attractionFetchControllerRef.current === controller) {
        setAttractionImage(null);
        setImageLoading(false);
      }
    }
  }
}