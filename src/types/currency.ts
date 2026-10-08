export interface ExchangeRatesData {
  base: string;
  rates: Record<string, number>;
  timeLastUpdateUtc: string;
  cachedAt: number;
}
