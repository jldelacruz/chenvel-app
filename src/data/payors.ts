// Dummy data for the Payments table. Replace with real data (e.g. an API call) later.

export type PayorRow = {
  id: string;
  payor: string;
  paidAmount: number;
  availableAmount: number;
};

const names = [
  'Acme Corporation', 'Blue Ridge Holdings', 'Cedar Lane Partners', 'Delta Logistics',
  'Evergreen Health', 'Foxtrot Media', 'Granite Builders', 'Harbor Freight Co.',
  'Ironwood Capital', 'Juniper Foods', 'Keystone Insurance', 'Lakeside Clinic',
  'Maple Street Bakery', 'Northwind Traders', 'Oakridge Schools', 'Pinecrest Realty',
  'Quantum Analytics', 'Redwood Energy', 'Summit Outfitters', 'Trident Marine',
  'Union Supply', 'Vertex Software', 'Willow Creek Farms', 'Xenon Labs',
  'Yellowstone Travel', 'Zenith Telecom', 'Atlas Engineering', 'Beacon Pharmacy',
  'Copperfield Legal', 'Driftwood Hotels', 'Echo Valley Dairy', 'Falcon Aviation',
  'Golden Gate Motors', 'Highland Textiles', 'Indigo Design Studio', 'Jasper Mining',
  'Kingfisher Seafood', 'Lighthouse Charities', 'Meridian Bank', 'Nova Fitness',
  'Orchid Florists', 'Pioneer Hardware',
];

// Seeded random numbers, so the dummy amounts look varied but are the same on every load.
function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = seededRandom(2026);
const amountBetween = (min: number, max: number) => Math.round((min + random() * (max - min)) * 100) / 100;

export const payors: PayorRow[] = names.map((payor, i) => ({
  id: String(i + 1),
  payor,
  paidAmount: amountBetween(250, 9250),
  availableAmount: amountBetween(500, 15500),
}));
