import { ENDPOINTS } from '../config/funnel.js';

const DEDICATED = 'Dedicated Datacenters';
const RADIUS = 'Radius DC';
const I3D = 'i3D';
const US = { country: 'US', countryName: 'United States', supplier: 'Lenovo US', factor: 1, unavailable: [] };
const NE = { country: 'NE', countryName:'Netherlands', supplier: 'Dell Technologies EU', factor: 1, unavailable [] };
const FR = { country: 'FR', countryName:'France', supplier: 'Dell Technologies EU', factor: 1, unavailable [] };
const CA = { country: 'CA', countryName:'Canada', supplier: 'Lenovo US', factor: 1, unavailable [] };

// Partner data centers. `factor` adjusts the sample supplier price per country.
export const LOCATIONS = [
  { id: 'lax', city: 'Los Angeles', region: 'CA', provider: DEDICATED, ...US },
  { id: 'sea', city: 'Seattle', region: 'WA', provider: DEDICATED, ...US },
  { id: 'dfw', city: 'Dallas', region: 'TX', provider: RADIUS, ...US },
  { id: 'chi', city: 'Chicago', region: 'IL', provider: DEDICATED, ...US },
  { id: 'fnt', city: 'Flint', region: 'MI', provider: 'Sectorlink Data Center', ...US },
  { id: 'atl', city: 'Atlanta', region: 'GA', provider: DEDICATED, ...US },
  { id: 'nyc', city: 'New York', region: 'NY', provider: DEDICATED, ...US },
  { id: 'rot', city: 'Rotterdam', region: 'RO', provider: I3D, ...NE },
  { id: 'par', city: 'Paris', region: 'PA', provider: I3D, ...FR },
  { id: 'can', city: 'Montreal', region: 'CA', provider: I3D, ...CA },
  {
    id: 'mtl',
    city: 'Montreal',
    region: 'QC',
    provider: DEDICATED,
    country: 'CA',
    countryName: 'Canada',
    supplier: 'Dell Technologies Canada',
    factor: 1.04,
    unavailable: [],
  },
];

export const DEFAULT_LOCATION = LOCATIONS[0].id;

export const getLocation = (id) => LOCATIONS.find((l) => l.id === id) ?? LOCATIONS[0];

export const locationLabel = (l) => `${l.city}, ${l.region} @ ${l.provider}`;

// Sample Smart Selection configurations. Replace with supplier API data
// (VITE_CATALOG_ENDPOINT); prices are USD supplier prices before CoCo's markup.

const MODELS = [
  {
    id: 'sr650',
    name: 'Lenovo ThinkSystem SR650 V4 (86 cores)',
    rackSpace: '1U',
    cpu: '1 x Intel Xeon 6714P 8C 165W 4.0GHz Processor',
    vcpu: 128,
    ram: '1 x 64GB TruDDR5 6400MHz (2Rx4) RDIMM',
    power: 'ThinkSystem 1300W 230V/115V Platinum CRPS Hot-Swap Power Supply v2.4',
    monthlyYield: '~2113',
    basePrice: 11990,
  },
  {
    id: 'sr650x4',
    name: 'Lenovo ThinkSystem SR650 V4',
    rackSpace: '1U',
    cpu: '1 x Intel Xeon 6714P 8C 165W 4.0GHz Processor',
    vcpu: 128,
    ram: '256GB via 4 x 64GB TruDDR5 6400MHz (2Rx4) RDIMM',
    power: 'ThinkSystem 1300W 230V/115V Platinum CRPS Hot-Swap Power Supply v2.4',
    monthlyYield: '~8452',
    basePrice: 24970,
  },
  {
    id: 'sr650ai',
    name: 'Lenovo ThinkSystem SR650 V4 for AI',
    rackSpace: '1U',
    cpu: '2× Intel Xeon 6530P 32C 225W 2.3GHz Processors',
    gpu: 'NVIDIA RTX PRO 6000 Blackwell Server Edition 96GB PCIe Gen5 Passive GPU',
    vcpu: 128,
    vgpu: 48,
    ram: '512GB via 16 x 32GB TruDDR5 6400MHz (1Rx4) RDIMM',
    storage: '3.84TB NVMe PCIe 5.0 x4 HS SSD',
    power: '2× 3200W 230V Titanium CRPS Premium Hot-Swap Power Supply',
    monthlyYield: '~16232',
    basePrice: 109950,
  },
];

function sampleCatalog(location) {
  return MODELS.filter((m) => !location.unavailable.includes(m.id)).map(({ basePrice, ...m }) => ({
    ...m,
    supplierPrice: Math.round((basePrice * location.factor) / 10) * 10,
    supplier: location.supplier,
    image: null,
    sample: true,
  }));
}

const cache = new Map();

export async function getCatalog(locationId) {
  if (cache.has(locationId)) return cache.get(locationId);
  const location = getLocation(locationId);
  let items = sampleCatalog(location);
  if (ENDPOINTS.catalog) {
    try {
      const query = new URLSearchParams({ location: location.id, country: location.country });
      const res = await fetch(`${ENDPOINTS.catalog}?${query}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) items = data.map((m) => ({ ...m, sample: false }));
      }
    } catch {
      /* fall back to sample catalog */
    }
  }
  cache.set(locationId, items);
  return items;
}
