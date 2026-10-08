import { ENDPOINTS } from '../config/funnel.js';

export const COUNTRIES = [
  { id: 'US', name: 'United States', city: 'Dallas', supplier: 'Dell Technologies US', factor: 1, unavailable: [] },
  { id: 'GB', name: 'United Kingdom', city: 'London', supplier: 'Dell Technologies UK', factor: 1.07, unavailable: [] },
  { id: 'NL', name: 'Netherlands', city: 'Amsterdam', supplier: 'Dell Technologies NL', factor: 1.06, unavailable: [] },
  { id: 'DK', name: 'Denmark', city: 'Copenhagen', supplier: 'Dell Technologies DK', factor: 1.1, unavailable: ['r4715'] },
  { id: 'BE', name: 'Belgium', city: 'Brussels', supplier: 'Dell Technologies BE', factor: 1.06, unavailable: ['r5715'] },
  { id: 'AU', name: 'Australia', city: 'Sydney', supplier: 'Dell Technologies AU', factor: 1.12, unavailable: [] },
  { id: 'ZA', name: 'South Africa', city: 'Johannesburg', supplier: 'Dell Technologies ZA', factor: 1.15, unavailable: ['r4715', 'r5715'] },
  { id: 'AE', name: 'Dubai', city: 'Dubai', supplier: 'Dell Technologies UAE', factor: 1.05, unavailable: ['r4715'] },
  { id: 'SG', name: 'Singapore', city: 'Singapore', supplier: 'Dell Technologies SG', factor: 1.08, unavailable: [] },
];

// Sample Smart Selection configurations. Replace with supplier API data
// (VITE_CATALOG_ENDPOINT); prices are USD supplier prices before CoCo's markup.
const MODELS = [
  {
    id: 'r660',
    name: 'PowerEdge R660 Rack Smart Selection',
    u: 1,
    cpu: '2× Intel Xeon Silver 4410Y (12 cores each)',
    vcpu: 48,
    ram: '64 GB DDR5',
    storage: '2× 480 GB SSD',
    network: '2× 10 GbE',
    basePrice: 8900,
  },
  {
    id: 'r670',
    name: 'PowerEdge R670 Smart Selection',
    u: 1,
    cpu: '2× Intel Xeon 6 (16 cores each)',
    vcpu: 64,
    ram: '128 GB DDR5',
    storage: '2× 960 GB NVMe',
    network: '2× 25 GbE',
    basePrice: 12600,
  },
  {
    id: 'r4715',
    name: 'PowerEdge R4715 Smart Selection',
    u: 1,
    cpu: '1× AMD EPYC 9005 (32 cores)',
    vcpu: 64,
    ram: '128 GB DDR5',
    storage: '2× 960 GB NVMe',
    network: '2× 25 GbE',
    basePrice: 11400,
  },
  {
    id: 'r5715',
    name: 'Dell PowerEdge R5715 Smart Selection',
    u: 2,
    cpu: '1× AMD EPYC 9005 (64 cores)',
    vcpu: 128,
    ram: '256 GB DDR5',
    storage: '4× 1.92 TB NVMe',
    network: '2× 25 GbE',
    basePrice: 17900,
  },
  {
    id: 'r770',
    name: 'PowerEdge R770 Smart Selection',
    u: 2,
    cpu: '2× Intel Xeon 6 (32 cores each)',
    vcpu: 128,
    ram: '256 GB DDR5',
    storage: '4× 1.92 TB NVMe',
    network: '2× 25 GbE',
    basePrice: 21800,
  },
];

export const getCountry = (id) => COUNTRIES.find((c) => c.id === id) ?? COUNTRIES[0];

function sampleCatalog(countryId) {
  const country = getCountry(countryId);
  return MODELS.filter((m) => !country.unavailable.includes(m.id)).map(({ basePrice, ...m }) => ({
    ...m,
    supplierPrice: Math.round((basePrice * country.factor) / 10) * 10,
    supplier: country.supplier,
    image: null,
    sample: true,
  }));
}

const cache = new Map();

export async function getCatalog(countryId) {
  if (cache.has(countryId)) return cache.get(countryId);
  let items = sampleCatalog(countryId);
  if (ENDPOINTS.catalog) {
    try {
      const res = await fetch(`${ENDPOINTS.catalog}?country=${encodeURIComponent(countryId)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) items = data.map((m) => ({ ...m, sample: false }));
      }
    } catch {
      /* fall back to sample catalog */
    }
  }
  cache.set(countryId, items);
  return items;
}
