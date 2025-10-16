import React from "react";
import { useState } from "react";

export default function InitializerStates() {
  const [regionImage, setRegionImage] = useState(null);
  const [regionLoading, setRegionLoading] = useState(false);
  const [hotelImage, setHotelImage] = React.useState(null);
  const [hotelLoading, setHotelLoading] = React.useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [attractionImage, setAttractionImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedRegionName, setSelectedRegionName] = useState(null);

  return {
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
    setSelectedRegionName
  }
}