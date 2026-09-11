/**
 * Demo catalogue. Prices are in BDT and roughly match the Bangladeshi market —
 * swap this file for your real catalogue and re-run `npm run seed`.
 */

export const categories = [
  {
    name: "Phones",
    slug: "phones",
    icon: "smartphone",
    order: 1,
    description: "Latest smartphones from every major brand",
    menuBrands: [
      "samsung",
      "xiaomi",
      "realme",
      "oppo",
      "vivo",
      "symphony",
      "tecno",
      "infinix",
      "honor",
      "zte",
    ],
  },
  {
    name: "Featured Phone",
    slug: "featured-phone",
    icon: "phone",
    order: 2,
    description: "Button phones and everyday feature phones",
    menuBrands: ["symphony", "nokia", "proton", "xtra", "motorola", "samsung"],
  },
  {
    name: "Tablet",
    slug: "tablet",
    icon: "tablet",
    order: 3,
    description: "Tablets for work, study and play",
    menuBrands: ["samsung", "xiaomi", "apple", "honor", "realme"],
  },
  {
    name: "Smart Watch",
    slug: "smart-watch",
    icon: "watch",
    order: 4,
    description: "Smart watches and fitness bands",
    menuBrands: ["samsung", "apple", "xiaomi", "realme", "honor"],
  },
  {
    name: "Earbuds",
    slug: "earbuds",
    icon: "headphones",
    order: 5,
    description: "TWS earbuds and wireless headphones",
    menuBrands: ["samsung", "apple", "xiaomi", "realme", "oppo"],
  },
  {
    name: "Accessories",
    slug: "accessories",
    icon: "cable",
    order: 6,
    description: "Chargers, cables, cases and power banks",
    menuBrands: ["samsung", "xiaomi", "realme", "apple"],
  },
  {
    name: "Gadgets",
    slug: "gadgets",
    icon: "cpu",
    order: 7,
    description: "Smart home, cameras and everything else",
    menuBrands: ["xiaomi", "realme", "honor"],
  },
];

export const brands = [
  { name: "Samsung", accent: "#1428a0", country: "South Korea", order: 1 },
  { name: "Apple", accent: "#555555", country: "USA", order: 2 },
  { name: "Xiaomi", accent: "#ff6900", country: "China", order: 3 },
  { name: "Redmi", accent: "#ff6900", country: "China", order: 4 },
  { name: "Realme", accent: "#ffc915", country: "China", order: 5 },
  { name: "OPPO", accent: "#046b4e", country: "China", order: 6 },
  { name: "Vivo", accent: "#415fff", country: "China", order: 7 },
  { name: "iQOO", accent: "#0f1e8a", country: "China", order: 8 },
  { name: "Honor", accent: "#00a0e9", country: "China", order: 9 },
  { name: "Google", accent: "#4285f4", country: "USA", order: 10 },
  { name: "Motorola", accent: "#5c92fa", country: "USA", order: 11 },
  { name: "Nothing", accent: "#111111", country: "UK", order: 12 },
  { name: "Tecno", accent: "#0b57a4", country: "China", order: 13 },
  { name: "Infinix", accent: "#00c853", country: "China", order: 14 },
  { name: "itel", accent: "#e02020", country: "China", order: 15 },
  { name: "Symphony", accent: "#e51c23", country: "Bangladesh", order: 16 },
  { name: "Walton", accent: "#0057b8", country: "Bangladesh", order: 17 },
  { name: "Nokia", accent: "#124191", country: "Finland", order: 18 },
  { name: "HMD", accent: "#0a3d91", country: "Finland", order: 19 },
  { name: "ZTE", accent: "#0059a8", country: "China", order: 20 },
  { name: "Proton", accent: "#00937c", country: "Bangladesh", order: 21 },
  { name: "Xtra", accent: "#c62828", country: "Bangladesh", order: 22 },
  { name: "OnePlus", accent: "#eb0028", country: "China", order: 23 },
];

/**
 * Compact rows keep this file readable.
 * [name, brandSlug, categorySlug, price, oldPrice, availability, networks, flags, blurb]
 * flags: f = featured, n = new arrival, i = instalment available
 */
const rows = [
  // ---------------------------- flagships ----------------------------
  ["Samsung Galaxy S26 Ultra 12/512GB Official", "samsung", "phones", 189999, 199999, "in-stock", ["5G"], "fni", "The 200MP periscope flagship with a titanium frame and Galaxy AI built in."],
  ["Samsung Galaxy S26 Plus 12/256GB Official", "samsung", "phones", 139999, 149999, "in-stock", ["5G"], "fi", "Big, bright ProScaler display with all-day battery and 45W charging."],
  ["Samsung Galaxy S26 8/256GB Official", "samsung", "phones", 114999, 124999, "in-stock", ["5G"], "fi", "The compact flagship — same cameras, easier on one hand."],
  ["Apple iPhone 17 Pro Max 512GB", "apple", "phones", 229999, 239999, "in-stock", ["5G"], "fni", "A20 Pro chip, tetraprism zoom and the brightest display Apple has shipped."],
  ["Apple iPhone 17 Pro 256GB", "apple", "phones", 179999, null, "in-stock", ["5G"], "fi", "Pro cameras and ProMotion in the smaller titanium body."],
  ["Apple iPhone 17 128GB", "apple", "phones", 129999, 134999, "in-stock", ["5G"], "fi", "The everyday iPhone with the Dynamic Island and USB-C."],
  ["Apple iPhone 16 128GB Official", "apple", "phones", 104999, 119999, "in-stock", ["5G"], "i", "Last year's flagship at a much friendlier price."],
  ["Google Pixel 10 Pro 256GB", "google", "phones", 149999, null, "pre-order", ["5G"], "fn", "Tensor G6, seven years of updates and the best point-and-shoot camera around."],
  ["Google Pixel 10 128GB", "google", "phones", 99999, 109999, "in-stock", ["5G"], "f", "Clean Android, brilliant photos, no bloatware."],
  ["OnePlus 15 Pro 16/512GB", "oneplus", "phones", 134999, 142999, "in-stock", ["5G"], "fi", "Snapdragon flagship silicon with 100W SUPERVOOC charging."],
  ["Nothing Phone (4) 12/256GB", "nothing", "phones", 84999, 89999, "in-stock", ["5G"], "fn", "Glyph interface, transparent back — nothing else looks like it."],
  ["Xiaomi 16 Pro 12/512GB Global", "xiaomi", "phones", 124999, 132999, "in-stock", ["5G"], "fi", "Leica-tuned quad camera and a 6000mAh silicon-carbon battery."],
  ["Xiaomi 16 12/256GB Global", "xiaomi", "phones", 94999, null, "in-stock", ["5G"], "f", "Compact flagship with Leica optics and 90W charging."],
  ["Honor Magic 8 Pro 12/512GB Official", "honor", "phones", 119999, 129999, "in-stock", ["5G"], "fi", "Falcon camera system with a class-leading periscope zoom."],
  ["Vivo X300 Pro 16/512GB", "vivo", "phones", 129999, null, "in-stock", ["5G"], "fi", "ZEISS APO telephoto and V3+ imaging chip for real portrait work."],
  ["OPPO Find X9 Pro 16/512GB", "oppo", "phones", 127999, 135999, "in-stock", ["5G"], "fi", "Hasselblad colour science with a 6500mAh battery."],
  ["iQOO 15 12/256GB Official", "iqoo", "phones", 89999, 94999, "in-stock", ["5G"], "fn", "Gaming-first flagship — 144Hz display and a dedicated Q3 chip."],

  // ---------------------------- upper mid ----------------------------
  ["Samsung Galaxy A57 8/256GB Official", "samsung", "phones", 52999, 56999, "in-stock", ["5G"], "fi", "Six years of updates, OIS camera and a 5000mAh battery."],
  ["Samsung Galaxy A37 8/128GB Official", "samsung", "phones", 36999, 39999, "in-stock", ["5G"], "i", "Super AMOLED at a mid-range price."],
  ["Samsung Galaxy M36 8/128GB", "samsung", "phones", 28999, 31999, "in-stock", ["5G"], "", "Battery monster for people who forget their charger."],
  ["Redmi Note 15 Pro+ 12/256GB", "redmi", "phones", 42999, 46999, "in-stock", ["5G"], "fi", "200MP main camera and 120W HyperCharge."],
  ["Redmi Note 15 Pro 8/256GB", "redmi", "phones", 32999, 35999, "in-stock", ["5G"], "f", "The value benchmark — AMOLED, big battery, clean design."],
  ["Redmi Note 15 8/128GB", "redmi", "phones", 24999, 27999, "in-stock", ["5G"], "", "Everything you need, nothing you don't."],
  ["Realme 15 Pro 5G 12/256GB", "realme", "phones", 38999, 42999, "in-stock", ["5G"], "f", "Curved AMOLED and 80W SUPERVOOC in a slim body."],
  ["Realme 15 5G 8/128GB", "realme", "phones", 27999, 29999, "in-stock", ["5G"], "", "Fast charging and a bright 120Hz panel."],
  ["Realme Narzo 80 Pro 8/128GB", "realme", "phones", 22999, 24999, "in-stock", ["5G"], "", "Gaming-tuned Dimensity chip on a budget."],
  ["OPPO Reno 15 5G 12/256GB", "oppo", "phones", 46999, 49999, "in-stock", ["5G"], "fi", "Portrait specialist with a very slim profile."],
  ["OPPO A6 Pro 8/256GB", "oppo", "phones", 25999, 27999, "in-stock", ["5G"], "", "IP69 rated and built to survive a Dhaka monsoon."],
  ["Vivo V60 5G 12/256GB Official", "vivo", "phones", 47999, 51999, "in-stock", ["5G"], "f", "ZEISS portrait cameras made for weddings and events."],
  ["Vivo Y400 Pro 8/128GB", "vivo", "phones", 26999, null, "in-stock", ["5G"], "", "Quad-curved AMOLED with a huge battery."],
  ["Honor 400 Pro 12/256GB", "honor", "phones", 54999, 58999, "in-stock", ["5G"], "f", "200MP AI camera and 100W wired charging."],
  ["Honor X10 8/256GB Official", "honor", "phones", 23999, 25999, "in-stock", ["5G"], "", "Drop-tested build with a 6600mAh battery."],
  ["Motorola Edge 70 Ultra 12/512GB", "motorola", "phones", 79999, 84999, "in-stock", ["5G"], "fi", "Pantone-validated display and near-stock Android."],
  ["Motorola G96 5G 8/128GB", "motorola", "phones", 21999, 23999, "in-stock", ["5G"], "", "Clean Android with stereo Dolby Atmos speakers."],
  ["Nothing Phone (4a) 8/256GB", "nothing", "phones", 34999, null, "in-stock", ["5G"], "n", "The affordable Glyph phone."],
  ["ZTE Nubia Neo 4 8/256GB", "zte", "phones", 19999, 22999, "in-stock", ["5G"], "", "Shoulder triggers and a 120Hz screen for mobile gamers."],
  ["Google Pixel 10a 128GB", "google", "phones", 62999, null, "pre-order", ["5G"], "n", "Pixel cameras and Tensor at half the flagship price."],

  // ---------------------------- budget 4G/5G ----------------------------
  ["Infinix Note 50 Pro 8/256GB", "infinix", "phones", 23999, 26999, "in-stock", ["5G"], "", "Big AMOLED, bigger battery, 45W charging."],
  ["Infinix Hot 60 6/128GB", "infinix", "phones", 14999, 16499, "in-stock", ["4G"], "", "Slim, light and surprisingly quick for the money."],
  ["Tecno Camon 40 Pro 8/256GB", "tecno", "phones", 21999, 23999, "in-stock", ["5G"], "", "Camera-first budget phone with OIS."],
  ["Tecno Spark 40 6/128GB", "tecno", "phones", 13499, 14999, "in-stock", ["4G"], "", "Entry-level 120Hz display and a 5200mAh battery."],
  ["itel A90 4/128GB", "itel", "phones", 9999, 10999, "in-stock", ["4G"], "", "Dependable first smartphone."],
  ["Symphony Z70 6/128GB", "symphony", "phones", 12490, 13490, "in-stock", ["4G"], "", "Locally supported Android with a big display."],
  ["Symphony Innova 40 4/64GB", "symphony", "phones", 9490, null, "in-stock", ["4G"], "", "Simple, affordable and easy to service."],
  ["Walton Primo RX9 8/128GB", "walton", "phones", 17990, 19990, "in-stock", ["4G"], "", "Made in Bangladesh with a nationwide service network."],
  ["Xiaomi Redmi A5 4/64GB", "redmi", "phones", 10999, 11999, "in-stock", ["4G"], "", "The cheapest way into MIUI."],
  ["Samsung Galaxy A07 4/64GB Official", "samsung", "phones", 13999, 14999, "out-of-stock", ["4G"], "", "Entry Galaxy with Samsung's warranty behind it."],
  ["Realme C75 6/128GB", "realme", "phones", 15999, 17499, "in-stock", ["4G"], "", "IP69 water resistance at an entry price."],

  // ---------------------------- feature phones ----------------------------
  ["Proton ECO Turquoise Dual SIM Feature Phone", "proton", "featured-phone", 990, null, "in-stock", ["2G"], "f", "Two SIMs, a torch and a battery that lasts a week."],
  ["Symphony D11 Ink Black Dual SIM Feature Phone", "symphony", "featured-phone", 1400, null, "in-stock", ["2G"], "f", "Classic keypad phone with an FM radio and torch."],
  ["Nokia 3310 Dual Sim Feature Phone Official", "nokia", "featured-phone", 7999, null, "out-of-stock", ["2G"], "f", "The legend, back in production."],
  ["HMD 101 Feature Phone (Dual Sim)", "hmd", "featured-phone", 2170, null, "in-stock", ["2G"], "f", "Simple, sturdy and made to last."],
  ["Xtra X40 Feature Phone (Dual Sim)", "xtra", "featured-phone", 1790, null, "in-stock", ["2G"], "", "Loud speaker, long battery, easy keys."],
  ["Proton Glow Feature Phone (Dual Sim)", "proton", "featured-phone", 1500, null, "in-stock", ["2G"], "", "Bright torch and a wireless FM radio."],
  ["Nokia 225 4G Official", "nokia", "featured-phone", 6260, null, "in-stock", ["4G"], "", "4G calling on a keypad phone."],
  ["Symphony A30 Feature Phone", "symphony", "featured-phone", 1265, null, "in-stock", ["2G"], "", "Everyday backup phone."],
  ["Motorola A20 Feature Phone", "motorola", "featured-phone", 2890, null, "in-stock", ["2G"], "", "Big buttons and a big display."],
  ["Xtra Power 4G Feature Phone", "xtra", "featured-phone", 3490, null, "pre-order", ["4G"], "n", "4G hotspot in a keypad phone."],

  // ---------------------------- tablets ----------------------------
  ["Samsung Galaxy Tab S11 Ultra 12/256GB", "samsung", "tablet", 149999, 159999, "in-stock", ["5G"], "fi", "14.6-inch AMOLED with the S Pen in the box."],
  ["Samsung Galaxy Tab S11 8/128GB WiFi", "samsung", "tablet", 79999, null, "in-stock", ["4G"], "i", "Premium Android tablet for study and streaming."],
  ["Apple iPad Air M4 11-inch 128GB", "apple", "tablet", 94999, 99999, "in-stock", ["4G"], "fi", "M4 power in Apple's thinnest tablet body."],
  ["Apple iPad 11th Gen 128GB WiFi", "apple", "tablet", 54999, null, "in-stock", ["4G"], "", "The everyday iPad."],
  ["Xiaomi Pad 8 Pro 8/256GB", "xiaomi", "tablet", 44999, 47999, "in-stock", ["4G"], "f", "144Hz display and quad speakers for the price of a mid-range phone."],
  ["Honor Pad X10 6/128GB", "honor", "tablet", 22999, 24999, "in-stock", ["4G"], "", "Big screen, small budget."],
  ["Realme Pad 3 8/128GB", "realme", "tablet", 26999, null, "in-stock", ["4G"], "", "Light enough to hold through a whole movie."],

  // ---------------------------- smart watches ----------------------------
  ["Samsung Galaxy Watch 9 Classic 46mm", "samsung", "smart-watch", 44999, 48999, "in-stock", ["4G"], "f", "Rotating bezel, sapphire glass, proper Wear OS."],
  ["Samsung Galaxy Watch 9 44mm Bluetooth", "samsung", "smart-watch", 32999, null, "in-stock", ["4G"], "", "Sleep tracking and body composition on your wrist."],
  ["Apple Watch Series 11 45mm GPS", "apple", "smart-watch", 59999, 63999, "in-stock", ["4G"], "fi", "The most complete health tracker Apple makes."],
  ["Apple Watch SE 3 40mm GPS", "apple", "smart-watch", 32999, null, "in-stock", ["4G"], "", "All the essentials, none of the extra cost."],
  ["Xiaomi Watch S5 Active", "xiaomi", "smart-watch", 8999, 9999, "in-stock", ["4G"], "", "Two week battery and 150+ sport modes."],
  ["Realme Watch 5 Pro", "realme", "smart-watch", 5499, 6499, "in-stock", ["4G"], "", "Bright AMOLED, honest price."],
  ["Honor Band 10", "honor", "smart-watch", 3999, null, "in-stock", ["4G"], "", "Slim fitness band with real sleep insights."],

  // ---------------------------- earbuds ----------------------------
  ["Samsung Galaxy Buds4 Pro", "samsung", "earbuds", 24999, 27999, "in-stock", ["4G"], "f", "Adaptive ANC with 24-bit Hi-Fi audio."],
  ["Apple AirPods Pro 3", "apple", "earbuds", 29999, 31999, "in-stock", ["4G"], "fi", "Best-in-class noise cancellation and Adaptive Audio."],
  ["Apple AirPods 4", "apple", "earbuds", 18999, null, "in-stock", ["4G"], "", "Open-fit comfort with Personalised Spatial Audio."],
  ["Xiaomi Redmi Buds 7 Pro", "redmi", "earbuds", 4999, 5999, "in-stock", ["4G"], "", "55dB ANC for under five thousand taka."],
  ["Realme Buds Air 7 Pro", "realme", "earbuds", 6999, 7999, "in-stock", ["4G"], "", "Dual drivers and 48 hours of playback."],
  ["OPPO Enco Air 4 Pro", "oppo", "earbuds", 5499, null, "in-stock", ["4G"], "", "Comfortable half-in-ear fit for long days."],

  // ---------------------------- accessories & gadgets ----------------------------
  ["Samsung 45W Super Fast Charger (Type-C)", "samsung", "accessories", 3499, 3999, "in-stock", ["4G"], "", "Official 45W PPS adapter with cable."],
  ["Apple 20W USB-C Power Adapter", "apple", "accessories", 2999, null, "in-stock", ["4G"], "", "The charger Apple no longer puts in the box."],
  ["Xiaomi 20000mAh 33W Power Bank", "xiaomi", "accessories", 3299, 3799, "in-stock", ["4G"], "f", "Charges a phone three times over."],
  ["Realme 65W SuperDart Car Charger", "realme", "accessories", 1899, null, "in-stock", ["4G"], "", "Fast charging for the drive to work."],
  ["Samsung Galaxy S26 Ultra Silicone Case", "samsung", "accessories", 2499, 2999, "in-stock", ["4G"], "", "Official case with a soft-touch finish."],
  ["Xiaomi Smart Air Purifier 5", "xiaomi", "gadgets", 21999, 24999, "in-stock", ["4G"], "f", "HEPA filtration sized for a Dhaka living room."],
  ["Xiaomi Smart Camera C500 Pro", "xiaomi", "gadgets", 5499, 5999, "in-stock", ["4G"], "", "2K pan-tilt camera with AI person detection."],
  ["Realme Smart TV Stick 4K", "realme", "gadgets", 4999, null, "pre-order", ["4G"], "n", "Turns any TV into a Google TV."],
  ["Honor Choice Portable Bluetooth Speaker", "honor", "gadgets", 3499, 3999, "in-stock", ["4G"], "", "IPX7 speaker that survives the beach."],
];

/** Rough spec sheet derived from price tier — replace with real data any time. */
function specsFor(price, category, networks) {
  if (category === "featured-phone") {
    return {
      display: '1.8" TFT 120x160',
      processor: "Unisoc 6531F",
      ram: "32 MB",
      storage: "32 MB (microSD up to 32GB)",
      battery: "1200 mAh removable",
      rearCamera: "0.3 MP",
      frontCamera: "None",
      os: "Feature phone OS",
      sim: "Dual SIM",
      weight: "78 g",
    };
  }
  if (category === "smart-watch" || category === "earbuds") {
    return {
      display: category === "smart-watch" ? '1.43" AMOLED' : "—",
      battery: category === "smart-watch" ? "410 mAh" : "38 mAh + case",
      os: category === "smart-watch" ? "Wear OS / RTOS" : "—",
      weight: category === "smart-watch" ? "34 g" : "5.2 g per bud",
    };
  }
  if (category === "accessories" || category === "gadgets") {
    return { weight: "—" };
  }

  const tier = price >= 100000 ? "flagship" : price >= 35000 ? "upper" : price >= 18000 ? "mid" : "entry";
  const table = {
    flagship: {
      display: '6.8" LTPO AMOLED 120Hz, 2600 nits',
      processor: "Flagship 3nm octa-core",
      ram: "12 GB",
      storage: "512 GB UFS 4.1",
      battery: "5500 mAh, 80W wired",
      rearCamera: "200 MP + 50 MP periscope + 12 MP ultrawide",
      frontCamera: "32 MP",
    },
    upper: {
      display: '6.7" AMOLED 120Hz, 1800 nits',
      processor: "Upper mid-range octa-core",
      ram: "8 GB",
      storage: "256 GB UFS 3.1",
      battery: "5200 mAh, 67W wired",
      rearCamera: "108 MP + 8 MP ultrawide + 2 MP macro",
      frontCamera: "16 MP",
    },
    mid: {
      display: '6.7" AMOLED 120Hz',
      processor: "Mid-range octa-core",
      ram: "8 GB",
      storage: "128 GB",
      battery: "5000 mAh, 45W wired",
      rearCamera: "50 MP + 2 MP depth",
      frontCamera: "16 MP",
    },
    entry: {
      display: '6.6" HD+ IPS 90Hz',
      processor: "Entry octa-core",
      ram: "4 GB",
      storage: "64 GB (expandable)",
      battery: "5000 mAh, 18W wired",
      rearCamera: "50 MP + 0.3 MP",
      frontCamera: "8 MP",
    },
  }[tier];

  return {
    ...table,
    os: "Android 16",
    sim: `Dual SIM (${networks.join(" / ")})`,
    weight: category === "tablet" ? "480 g" : "195 g",
  };
}

const HIGHLIGHTS = {
  phones: [
    "Official warranty with countrywide service",
    "0% EMI available up to 12 months",
    "Free screen protector fitted in store",
    "7 day easy replacement policy",
  ],
  "featured-phone": [
    "Dual SIM with long standby",
    "Built-in torch and FM radio",
    "1 year official warranty",
  ],
  tablet: [
    "Official warranty with countrywide service",
    "0% EMI available up to 12 months",
    "Free tempered glass fitted in store",
  ],
  "smart-watch": ["1 year official warranty", "Free strap fitting", "Genuine sealed box"],
  earbuds: ["1 year official warranty", "Genuine sealed box", "7 day replacement policy"],
  accessories: ["6 month warranty", "Genuine product guarantee"],
  gadgets: ["1 year official warranty", "Genuine product guarantee"],
};

export const products = rows.map(
  (
    [name, brandSlug, categorySlug, price, oldPrice, availability, networks, flags, blurb],
    index
  ) => ({
    name,
    brandSlug,
    categorySlug,
    price,
    oldPrice,
    availability,
    networks,
    stock: availability === "out-of-stock" ? 0 : 5 + ((index * 7) % 40),
    isFeatured: flags.includes("f"),
    isNewArrival: flags.includes("n"),
    instalment: flags.includes("i"),
    rating: Number((3.8 + ((index * 13) % 12) / 10).toFixed(1)),
    numReviews: 4 + ((index * 17) % 180),
    sold: (index * 23) % 400,
    shortDescription: blurb,
    description: `${blurb}\n\nEvery unit sold by Mobile.com.bd is 100% original with an official Bangladesh warranty. Order online for same-day delivery inside Dhaka, or pick it up from any of our showrooms. Instalment plans are available on selected cards with 0% interest for up to 12 months.`,
    highlights: HIGHLIGHTS[categorySlug] ?? HIGHLIGHTS.phones,
    colors:
      categorySlug === "phones" || categorySlug === "featured-phone"
        ? ["Midnight Black", "Titanium Grey", "Ocean Blue"]
        : [],
    specs: specsFor(price, categorySlug, networks),
    tags: [brandSlug, categorySlug, ...networks.map((n) => n.toLowerCase())],
  })
);
