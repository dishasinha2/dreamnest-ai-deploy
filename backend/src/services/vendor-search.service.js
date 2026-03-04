function toNumber(v, fallback = null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function cityFromAddress(address = "", fallbackCity = "") {
  const text = String(address || "").trim();
  if (!text) return fallbackCity;
  const parts = text.split(",").map((x) => x.trim()).filter(Boolean);
  if (!parts.length) return fallbackCity;
  if (parts.length === 1) return parts[0];
  return parts[Math.max(0, parts.length - 2)] || fallbackCity;
}

function mapResult(item, city, queryLabel) {
  const website = item.website || item.link || "";
  const mapsLink = item.gps_coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${item.gps_coordinates.latitude},${item.gps_coordinates.longitude}`
    : "";

  return {
    id: `external:${item.place_id || item.data_id || item.position || item.title}`,
    name: item.title || "Vendor",
    city: cityFromAddress(item.address, city),
    service_types: [queryLabel],
    phone: item.phone || "",
    whatsapp: "",
    website: website || mapsLink || "",
    maps_url: mapsLink,
    about: item.type || "Local business",
    years_exp: 0,
    avg_rating: toNumber(item.rating, null),
    review_count: toNumber(item.reviews, 0),
    portfolio: [],
    external: true
  };
}

async function fetchMapsVendors(city, queryLabel, limit = 20) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey || !city) return [];

  const params = new URLSearchParams({
    engine: "google_maps",
    q: `${queryLabel} in ${city}`,
    hl: "en",
    gl: "in",
    api_key: apiKey
  });

  const url = `https://serpapi.com/search.json?${params.toString()}`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const data = await r.json();
  const rows = Array.isArray(data.local_results) ? data.local_results : [];
  return rows.slice(0, limit).map((x) => mapResult(x, city, queryLabel));
}

export async function searchExternalVendorsByCity(city) {
  const normalizedCity = String(city || "").trim();
  if (!normalizedCity) return [];

  const queries = [
    "interior designer",
    "home renovation contractor",
    "carpenter",
    "modular kitchen designer",
    "false ceiling contractor"
  ];

  const all = [];
  for (const q of queries) {
    try {
      const rows = await fetchMapsVendors(normalizedCity, q, 20);
      all.push(...rows);
    } catch {
      // Ignore upstream failures and return available results.
    }
  }

  const dedup = new Map();
  for (const v of all) {
    const key = `${String(v.name || "").toLowerCase()}|${String(v.city || "").toLowerCase()}`;
    if (!dedup.has(key)) dedup.set(key, v);
  }

  return Array.from(dedup.values()).slice(0, 60);
}
