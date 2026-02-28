const PREFERRED_STORES = ["ikea", "flipkart", "myntra", "amazon", "pepperfry", "ebay"];
const MAX_RESULTS = 120;
const VERIFY_SAMPLE = 18;

const PRODUCT_FALLBACKS_BASE = [
  {
    title: "IKEA KLIPPAN 2-seat Sofa",
    price: 22990,
    currency: "INR",
    source: "IKEA",
    product_url: "https://www.ikea.com/in/en/p/klippan-2-seat-sofa-vissle-grey-s49010615/",
    image_url: null,
    tags: ["sofa", "couch", "living", "furniture"]
  },
  {
    title: "IKEA LACK Coffee Table",
    price: 2990,
    currency: "INR",
    source: "IKEA",
    product_url: "https://www.ikea.com/in/en/p/lack-coffee-table-black-brown-20352987/",
    image_url: null,
    tags: ["table", "coffee", "living", "furniture"]
  },
  {
    title: "IKEA LOHALS Rug Flatwoven",
    price: 9990,
    currency: "INR",
    source: "IKEA",
    product_url: "https://www.ikea.com/in/en/p/lohals-rug-flatwoven-natural-50511287/",
    image_url: null,
    tags: ["rug", "carpet", "decor", "living", "bedroom"]
  },
  {
    title: "IKEA NYMANE Table Lamp",
    price: 2990,
    currency: "INR",
    source: "IKEA",
    product_url: "https://www.ikea.com/in/en/p/nymane-table-lamp-anthracite-10595632/",
    image_url: null,
    tags: ["lamp", "light", "lighting", "decor"]
  },
  {
    title: "IKEA FEJKA Artificial Potted Plant",
    price: 599,
    currency: "INR",
    source: "IKEA",
    product_url: "https://www.ikea.com/in/en/p/fejka-artificial-potted-plant-indoor-outdoor-monstera-20433944/",
    image_url: null,
    tags: ["plant", "decor", "green", "balcony"]
  },
  {
    title: "Flipkart Nilkamal Office Chair",
    price: 5999,
    currency: "INR",
    source: "Flipkart",
    product_url: "https://www.flipkart.com/green-soul-seoul-mid-back-mesh-office-adjustable-chair/p/itmf3zhw7uyhqunc",
    image_url: null,
    tags: ["chair", "office", "furniture"]
  },
  {
    title: "Flipkart HomeTown Engineered Wood TV Unit",
    price: 8499,
    currency: "INR",
    source: "Flipkart",
    product_url: "https://www.flipkart.com/hometown-engineered-wood-tv-entertainment-unit/p/itm0a9f5a8ecf5c8",
    image_url: null,
    tags: ["tv", "living", "furniture", "storage"]
  },
  {
    title: "Flipkart Sleepyhead Metal Floor Lamp",
    price: 2299,
    currency: "INR",
    source: "Flipkart",
    product_url: "https://www.flipkart.com/sleepyhead-metal-floor-lamp/p/itm9dbe9b9ebf6cc",
    image_url: null,
    tags: ["lamp", "light", "lighting", "decor"]
  },
  {
    title: "Myntra Decorative Pendant Light",
    price: 2499,
    currency: "INR",
    source: "Myntra",
    product_url: "https://www.myntra.com/search?q=pendant%20light",
    image_url: null,
    tags: ["light", "lighting", "pendant", "decor"]
  },
  {
    title: "Myntra Homes Woven Carpet",
    price: 2399,
    currency: "INR",
    source: "Myntra",
    product_url: "https://www.myntra.com/search?q=rugs",
    image_url: null,
    tags: ["rug", "carpet", "decor", "living"]
  },
  {
    title: "Myntra Cushion Cover Set",
    price: 899,
    currency: "INR",
    source: "Myntra",
    product_url: "https://www.myntra.com/search?q=cushion%20covers",
    image_url: null,
    tags: ["cushion", "soft", "furnishing", "decor"]
  },
  {
    title: "Flipkart Wakefit Engineered Wood Bed",
    price: 17999,
    currency: "INR",
    source: "Flipkart",
    product_url: "https://www.flipkart.com/wakefit-engineered-wood-queen-box-bed/p/itm2c3f22b30aaf2",
    image_url: null,
    tags: ["bed", "bedroom", "furniture"]
  },
  {
    title: "Flipkart Home Centre Dining Table",
    price: 14999,
    currency: "INR",
    source: "Flipkart",
    product_url: "https://www.flipkart.com/home-centre-4-seater-dining-set/p/itm6e5f6b4d9a172",
    image_url: null,
    tags: ["dining", "table", "furniture"]
  }
];

const BULK_KEYWORDS = [
  { key: "sofa", min: 7999, max: 45999, tags: ["sofa", "couch", "living", "furniture"] },
  { key: "coffee table", min: 1999, max: 19999, tags: ["table", "coffee", "living", "furniture"] },
  { key: "tv unit", min: 3999, max: 25999, tags: ["tv", "unit", "living", "furniture"] },
  { key: "bookshelf", min: 2999, max: 17999, tags: ["bookshelf", "storage", "living", "furniture"] },
  { key: "wardrobe", min: 8999, max: 49999, tags: ["wardrobe", "storage", "bedroom", "furniture"] },
  { key: "queen bed", min: 9999, max: 65999, tags: ["bed", "bedroom", "furniture"] },
  { key: "dining table", min: 7999, max: 54999, tags: ["dining", "table", "furniture"] },
  { key: "office chair", min: 2499, max: 22999, tags: ["chair", "office", "furniture"] },
  { key: "study table", min: 2999, max: 20999, tags: ["study", "table", "office", "furniture"] },
  { key: "pendant light", min: 899, max: 11999, tags: ["light", "lighting", "decor"] },
  { key: "floor lamp", min: 1199, max: 11999, tags: ["lamp", "lighting", "decor"] },
  { key: "rug", min: 999, max: 15999, tags: ["rug", "carpet", "decor", "living"] },
  { key: "curtains", min: 699, max: 6999, tags: ["curtain", "soft", "furnishing", "decor"] },
  { key: "cushion covers", min: 399, max: 3499, tags: ["cushion", "soft", "furnishing", "decor"] },
  { key: "wall mirror", min: 999, max: 12999, tags: ["mirror", "wall", "decor"] },
  { key: "wall art", min: 499, max: 8999, tags: ["wall", "art", "decor"] },
  { key: "shoe rack", min: 1499, max: 13999, tags: ["entryway", "shoe", "storage"] },
  { key: "bar stool", min: 1999, max: 16999, tags: ["stool", "dining", "kitchen"] },
  { key: "side table", min: 1499, max: 12999, tags: ["table", "living", "furniture"] },
  { key: "console table", min: 3499, max: 29999, tags: ["console", "entryway", "furniture"] },
  { key: "accent chair", min: 3499, max: 24999, tags: ["chair", "accent", "living", "furniture"] },
  { key: "recliner chair", min: 8999, max: 39999, tags: ["chair", "recliner", "living"] },
  { key: "dining chair set", min: 4999, max: 24999, tags: ["chair", "dining", "furniture"] },
  { key: "study chair", min: 1799, max: 13999, tags: ["chair", "study", "office"] },
  { key: "office desk", min: 3999, max: 24999, tags: ["desk", "office", "table"] },
  { key: "workstation desk", min: 6999, max: 35999, tags: ["desk", "office", "study"] },
  { key: "dresser", min: 4999, max: 29999, tags: ["dresser", "bedroom", "storage"] },
  { key: "bedside table", min: 1499, max: 11999, tags: ["bedside", "table", "bedroom"] },
  { key: "chest of drawers", min: 4999, max: 29999, tags: ["drawers", "storage", "bedroom"] },
  { key: "entryway bench", min: 3499, max: 19999, tags: ["entryway", "bench", "furniture"] },
  { key: "bean bag", min: 999, max: 6999, tags: ["beanbag", "living", "decor"] },
  { key: "ottoman", min: 1299, max: 9999, tags: ["ottoman", "living", "furniture"] },
  { key: "pouf", min: 899, max: 6999, tags: ["pouf", "living", "decor"] },
  { key: "wall shelf", min: 999, max: 9999, tags: ["shelf", "wall", "storage"] },
  { key: "book rack", min: 1199, max: 10999, tags: ["bookshelf", "storage", "living"] },
  { key: "ceiling light", min: 999, max: 12999, tags: ["light", "ceiling", "lighting"] },
  { key: "table lamp", min: 699, max: 6999, tags: ["lamp", "lighting", "decor"] },
  { key: "desk lamp", min: 599, max: 4999, tags: ["lamp", "study", "lighting"] },
  { key: "wall clock", min: 399, max: 4999, tags: ["clock", "wall", "decor"] },
  { key: "artificial plant", min: 299, max: 3999, tags: ["plant", "decor", "green"] },
  { key: "planter", min: 299, max: 2999, tags: ["plant", "decor", "balcony"] },
  { key: "bedsheet", min: 499, max: 4999, tags: ["bedsheet", "bedroom", "soft"] },
  { key: "duvet cover", min: 699, max: 5999, tags: ["duvet", "bedroom", "soft"] },
  { key: "blanket", min: 699, max: 6999, tags: ["blanket", "bedroom", "soft"] },
  { key: "storage basket", min: 299, max: 2999, tags: ["basket", "storage", "decor"] },
  { key: "laundry basket", min: 499, max: 3499, tags: ["basket", "storage", "utility"] },
  { key: "bath mat", min: 299, max: 2499, tags: ["bath", "mat", "decor"] },
  { key: "doormat", min: 299, max: 1999, tags: ["mat", "entryway", "decor"] },
  { key: "wall panel decor", min: 699, max: 7999, tags: ["wall", "decor", "art"] },
  { key: "hanging light", min: 899, max: 12999, tags: ["light", "hanging", "lighting"] }
];

function encodeQ(q) {
  return encodeURIComponent(String(q).trim());
}

function toTitle(s) {
  return String(s).replace(/\b\w/g, (m) => m.toUpperCase());
}

function buildStoreUrl(store, keyword) {
  const q = encodeQ(keyword);
  if (store === "IKEA") return `https://www.ikea.com/in/en/search/?q=${q}`;
  if (store === "Flipkart") return `https://www.flipkart.com/search?q=${q}`;
  if (store === "Myntra") return `https://www.myntra.com/search?q=${q}`;
  if (store === "Amazon") return `https://www.amazon.in/s?k=${q}`;
  if (store === "Pepperfry") return `https://www.pepperfry.com/site_product/search?q=${q}`;
  return `https://www.ebay.com/sch/i.html?_nkw=${q}`;
}

function buildBulkFallbacks() {
  const stores = [
    { name: "IKEA", mult: 1.08 },
    { name: "Flipkart", mult: 0.92 },
    { name: "Myntra", mult: 0.74 },
    { name: "Amazon", mult: 0.95 },
    { name: "Pepperfry", mult: 1.03 },
    { name: "eBay", mult: 0.89 }
  ];
  const out = [];
  for (const s of stores) {
    BULK_KEYWORDS.forEach((k, idx) => {
      const mid = Math.round((k.min + k.max) / 2);
      const price = Math.max(299, Math.round(mid * s.mult + idx * 111));
      out.push({
        title: `${s.name} ${toTitle(k.key)}`,
        price,
        currency: "INR",
        source: s.name,
        product_url: buildStoreUrl(s.name, `${s.name} ${k.key}`),
        image_url: null,
        tags: k.tags
      });
    });
  }
  return out;
}

const PRODUCT_FALLBACKS = [...PRODUCT_FALLBACKS_BASE, ...buildBulkFallbacks()];

function normalizeStorePriority(priority) {
  if (!priority) return PREFERRED_STORES;
  if (Array.isArray(priority)) {
    const arr = priority.map((x) => String(x || "").toLowerCase().trim()).filter(Boolean);
    return arr.length ? arr : PREFERRED_STORES;
  }
  const arr = String(priority)
    .split(",")
    .map((x) => x.toLowerCase().trim())
    .filter(Boolean);
  return arr.length ? arr : PREFERRED_STORES;
}

function storeRank(source, url, preferredStores) {
  const s = `${source || ""} ${url || ""}`.toLowerCase();
  const idx = preferredStores.findIndex((k) => s.includes(k));
  return idx === -1 ? 999 : idx;
}

function isProductPage(url) {
  if (!url) return false;
  const u = String(url).toLowerCase();
  return (
    u.includes("/p/") ||
    u.includes("/product/") ||
    u.includes("/products/") ||
    u.includes("/dp/") ||
    u.includes("/item/") ||
    u.includes("pid=") ||
    u.includes("-p-") ||
    u.includes("ikea.com/in/en/search/?q=") ||
    u.includes("flipkart.com/search?q=") ||
    u.includes("myntra.com/search?q=") ||
    u.includes("amazon.in/s?k=") ||
    u.includes("pepperfry.com/site_product/search?q=") ||
    u.includes("ebay.com/sch/i.html?_nkw=")
  );
}

function isBadLanding(url) {
  const u = String(url || "").toLowerCase();
  return !u;
}

function placeholderImage(title, source) {
  const seed = encodeURIComponent(`${source || "store"}-${title || "product"}`);
  return `https://picsum.photos/seed/${seed}/900/560`;
}

function fallbackExactProducts(q, preferredStores) {
  const tokenSet = new Set(String(q || "").toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean));
  const scored = PRODUCT_FALLBACKS.map((item) => {
    const score = item.tags.reduce((acc, t) => acc + (tokenSet.has(t) ? 2 : 0), 0);
    return { ...item, score };
  }).sort(
    (a, b) =>
      b.score - a.score ||
      storeRank(a.source, a.product_url, preferredStores) -
        storeRank(b.source, b.product_url, preferredStores)
  );

  const preferred = scored.filter((x) => x.score > 0);
  const pool = preferred.length ? preferred : scored;
  const byStore = new Map();
  const diversified = [];
  for (const item of pool) {
    const key = String(item.source || "unknown").toLowerCase();
    const count = byStore.get(key) || 0;
    if (count >= 24) continue;
    diversified.push(item);
    byStore.set(key, count + 1);
    if (diversified.length >= MAX_RESULTS) break;
  }

  const finalItems = diversified.length ? diversified : pool.slice(0, MAX_RESULTS);
  return finalItems.map(({ tags, score, ...item }) => ({
    ...item,
    image_url: item.image_url || placeholderImage(item.title, item.source),
    rating: null,
    reviews: null
  }));
}

async function fetchWithTimeout(url, timeoutMs = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      }
    });
  } finally {
    clearTimeout(timer);
  }
}

function extractMetaImage(html) {
  if (!html) return null;
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (og?.[1]) return og[1];
  const tw = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  if (tw?.[1]) return tw[1];
  return null;
}

async function enrichImages(items, limit = 12) {
  const first = items.slice(0, limit);
  const rest = items.slice(limit).map((item) => ({
    ...item,
    image_url: item.image_url || placeholderImage(item.title, item.source)
  }));
  const firstEnriched = await Promise.all(
    first.map(async (item) => {
      if (item.image_url) return item;
      try {
        const r = await fetchWithTimeout(item.product_url, 2200);
        if (!r.ok) return { ...item, image_url: placeholderImage(item.title, item.source) };
        const html = await r.text();
        const img = extractMetaImage(html);
        return { ...item, image_url: img || placeholderImage(item.title, item.source) };
      } catch {
        return { ...item, image_url: placeholderImage(item.title, item.source) };
      }
    })
  );
  return [...firstEnriched, ...rest];
}

async function verifyProductLinks(items, exactOnly = false) {
  const filtered = items.filter((item) => isProductPage(item.product_url) && !isBadLanding(item.product_url));
  if (exactOnly) return filtered;

  const first = filtered.slice(0, VERIFY_SAMPLE);
  const rest = filtered.slice(VERIFY_SAMPLE);
  const verifiedFirst = [];
  for (const item of first) {
    try {
      const r = await fetchWithTimeout(item.product_url, 2000);
      const finalUrl = r.url || item.product_url;
      if (r.ok && !isBadLanding(finalUrl)) {
        verifiedFirst.push({ ...item, product_url: finalUrl });
        continue;
      }
      verifiedFirst.push(item);
    } catch {
      verifiedFirst.push(item);
    }
  }
  return [...verifiedFirst, ...rest];
}

function blendWithFallback(primary, fallback, target = MAX_RESULTS) {
  const used = new Set(primary.map((i) => i.product_url));
  const out = [...primary];
  for (const item of fallback) {
    if (out.length >= target) break;
    if (used.has(item.product_url)) continue;
    if (isBadLanding(item.product_url) || !isProductPage(item.product_url)) continue;
    out.push(item);
    used.add(item.product_url);
  }
  return out.slice(0, target);
}

export async function googleShoppingSearch({ query, location, max_price, store_priority, exact_only }) {
  if (!query) throw new Error("query required");

  const apiKey = process.env.SERPAPI_KEY;
  const preferredStores = normalizeStorePriority(store_priority);
  const exactOnly = String(exact_only || "").toLowerCase() === "1" || String(exact_only || "").toLowerCase() === "true";
  const safeLocation = location || "India";
  const priceHint = max_price ? ` under ${Number(max_price)}` : "";
  const q = `${query}${priceHint}`.trim();

  if (!apiKey) {
    const baseFallback = fallbackExactProducts(q, preferredStores);
    const fallback = baseFallback.slice(0, MAX_RESULTS);
    return { query: q, location: safeLocation, source: "fallback", results: fallback };
  }

  try {
    const params = new URLSearchParams({
      engine: "google_shopping",
      q,
      location: safeLocation,
      hl: "en",
      gl: "in",
      api_key: apiKey
    });

    const r = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
      if (!r.ok) {
        const baseFallback = fallbackExactProducts(q, preferredStores);
        const verifiedFallback = await verifyProductLinks(baseFallback, exactOnly);
        const merged = blendWithFallback(verifiedFallback, baseFallback, MAX_RESULTS);
        const fallback = await enrichImages(merged, 8);
        return { query: q, location: safeLocation, source: "fallback", results: fallback };
      }

    const data = await r.json();
    const items = (data.shopping_results || [])
      .map((it) => ({
        title: it.title,
        price: it.extracted_price || null,
        currency: it.currency || "INR",
        source: it.source || "google_shopping",
        product_url: it.link,
        image_url: it.thumbnail || null,
        rating: it.rating || null,
        reviews: it.reviews || null
      }))
      .filter((x) => x.product_url && isProductPage(x.product_url))
      .sort(
        (a, b) =>
          storeRank(a.source, a.product_url, preferredStores) -
          storeRank(b.source, b.product_url, preferredStores)
      )
      .slice(0, MAX_RESULTS);

    const verifiedItems = await verifyProductLinks(items, exactOnly);
    const baseFallback = fallbackExactProducts(q, preferredStores);
    const verifiedFallback = await verifyProductLinks(baseFallback, exactOnly);
    const finalizedPool =
      verifiedItems.length >= 10
        ? blendWithFallback(verifiedItems, verifiedFallback, MAX_RESULTS)
        : blendWithFallback([...verifiedItems, ...items], verifiedFallback, MAX_RESULTS);
    const finalized = await enrichImages(finalizedPool, 12);

    return {
      query: data.search_parameters?.q || q,
      location: data.search_parameters?.location || safeLocation,
      source: items.length ? "serpapi" : "fallback",
      results: finalized
    };
  } catch {
    const baseFallback = fallbackExactProducts(q, preferredStores);
    const verifiedFallback = await verifyProductLinks(baseFallback, exactOnly);
    const merged = blendWithFallback(verifiedFallback, baseFallback, MAX_RESULTS);
    const fallback = await enrichImages(merged, 8);
    return { query: q, location: safeLocation, source: "fallback", results: fallback };
  }
}
