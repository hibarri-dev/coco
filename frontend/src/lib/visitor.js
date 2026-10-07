import { useEffect, useState } from 'react';

const CACHE_KEY = 'coco-visitor-geo';

function fromTimeZone() {
  let timezone = '';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    /* ignore */
  }
  const city = timezone.includes('/') ? timezone.split('/').pop().replace(/_/g, ' ') : '';
  return { city, region: '', country: '', countryCode: '', timezone, ip: '', source: 'timezone' };
}

let pending = null;

function lookup() {
  if (pending) return pending;
  pending = (async () => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {
      /* ignore */
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      if (!res.ok) throw new Error(String(res.status));
      const d = await res.json();
      if (d.error) throw new Error(d.reason);
      const geo = {
        city: d.city || '',
        region: d.region || '',
        country: d.country_name || '',
        countryCode: d.country_code || '',
        timezone: d.timezone || '',
        ip: d.ip || '',
        source: 'ip',
      };
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(geo));
      } catch {
        /* ignore */
      }
      return geo;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  })();
  return pending;
}

/* City wording comes from the IP lookup; scheduling always uses the device clock's time zone. */
export function useVisitor() {
  const [visitor, setVisitor] = useState(fromTimeZone);
  useEffect(() => {
    let alive = true;
    lookup().then((geo) => {
      if (alive && geo) setVisitor((v) => ({ ...v, ...geo, city: geo.city || v.city }));
    });
    return () => {
      alive = false;
    };
  }, []);
  return visitor;
}
