import type { ExchangeRatesData } from '../types/currency';

const CURRENCY_CACHE_KEY = 'toolbox_currency_rates_cache';

const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.45,
  AED: 3.67,
  JPY: 154.2,
  CAD: 1.36,
  AUD: 1.52,
  CHF: 0.90,
  CNY: 7.24,
  SGD: 1.35,
};

export async function fetchExchangeRates(base = 'USD'): Promise<ExchangeRatesData> {
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    if (!res.ok) {
      throw new Error(`Currency API HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data.result === 'success' && data.rates) {
      const result: ExchangeRatesData = {
        base: data.base_code || base,
        rates: data.rates,
        timeLastUpdateUtc: data.time_last_update_utc || new Date().toUTCString(),
        cachedAt: Date.now(),
      };
      try {
        localStorage.setItem(CURRENCY_CACHE_KEY, JSON.stringify(result));
      } catch {
        // ignore
      }
      return result;
    }
    throw new Error('Unexpected currency API payload');
  } catch (err) {
    // Attempt to load from localStorage cache
    const cached = getCachedExchangeRates();
    if (cached) {
      return cached;
    }
    // Final offline fallback
    return {
      base: 'USD',
      rates: FALLBACK_RATES,
      timeLastUpdateUtc: new Date().toUTCString(),
      cachedAt: Date.now(),
    };
  }
}

export function getCachedExchangeRates(): ExchangeRatesData | null {
  try {
    const raw = localStorage.getItem(CURRENCY_CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  if (from === to) return amount;
  const rateFrom = rates[from] ?? 1;
  const rateTo = rates[to] ?? 1;
  // Convert from 'from' to base (USD), then to 'to'
  const inBase = amount / rateFrom;
  return inBase * rateTo;
}
