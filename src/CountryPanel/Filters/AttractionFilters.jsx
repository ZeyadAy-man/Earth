export default function AttractionFilters({ places }) {
  return (places || []).filter((p) =>
    p.properties.categories?.some((c) => c.startsWith("tourism.attraction"))
  );
}