export default function HotelFilters({ places }) {
  return (places || []).filter((p) =>
    p.properties.categories?.includes("accommodation.hotel" || "accommodation.guest_house" || "accommodation.guest_house")
  );
}
