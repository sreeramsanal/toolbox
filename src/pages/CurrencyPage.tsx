import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeftRight, 
  RefreshCw, 
  Hourglass, 
  Bell, 
  AlertCircle
} from 'lucide-react';
import type { ExchangeRatesData } from '../types/currency';
import { fetchExchangeRates, convertCurrency, getCachedExchangeRates } from '../services/currencyService';
import { playClickSound } from '../utils/sound';

const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AED', 'JPY', 'CAD', 'AUD', 'SGD', 'CHF'];

export const CurrencyPage: React.FC = () => {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [ratesData, setRatesData] = useState<ExchangeRatesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Popular table base
  const [tableBase, setTableBase] = useState('INR');

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExchangeRates('USD');
      setRatesData(data);
    } catch (err: unknown) {
      const cached = getCachedExchangeRates();
      if (cached) {
        setRatesData(cached);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to retrieve exchange rates');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    playClickSound();
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const parsedAmount = parseFloat(amount) || 0;
  const converted = ratesData 
    ? convertCurrency(parsedAmount, fromCurrency, toCurrency, ratesData.rates)
    : 0;

  const unitRate = ratesData
    ? convertCurrency(1, fromCurrency, toCurrency, ratesData.rates)
    : 0;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-brand-cyan mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
            CURRENCY CONVERTER & RATES
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-dark-text">Currency Tracker</h1>
          <p className="text-xs text-dark-text-muted mt-1">
            Real-time exchange rates and instant currency conversion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/countdown"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-border bg-dark-surface1 hover:bg-dark-surface2 text-dark-text-secondary text-xs font-mono transition"
          >
            <Hourglass className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Countdown</span>
          </Link>
          <Link
            to="/alarm"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-border bg-dark-surface1 hover:bg-dark-surface2 text-dark-text-secondary text-xs font-mono transition"
          >
            <Bell className="w-3.5 h-3.5 text-brand-purple" />
            <span>Alarm Clock</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Spot Conversion Card (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-dark-surface1 border border-dark-border shadow-xl space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
            <span className="text-xs font-mono uppercase font-semibold text-dark-text">
              MULTI-CURRENCY SPOT CONVERTER
            </span>
            <button
              onClick={loadRates}
              disabled={loading}
              className="flex items-center gap-1 text-[11px] font-mono text-brand-cyan hover:underline disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Rates</span>
            </button>
          </div>

          {/* Amount input & From currency */}
          <div className="p-4 rounded-xl bg-dark-surface2/60 border border-dark-border">
            <div className="text-[10px] font-mono uppercase text-dark-text-muted mb-1.5">
              Send Amount
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                className="flex-1 bg-dark-surface1 text-dark-text text-2xl font-mono font-bold px-3.5 py-2.5 rounded-lg border border-dark-border focus:border-brand-cyan focus:outline-none tabular-nums"
              />
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="bg-dark-surface1 text-dark-text text-sm font-mono font-bold px-3 py-3 rounded-lg border border-dark-border focus:outline-none"
              >
                {POPULAR_CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleSwap}
              className="p-2.5 rounded-full bg-dark-surface1 hover:bg-dark-surface2 border border-dark-border text-brand-cyan shadow-md transition active:scale-90"
              title="Swap Currencies"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Converted Output & To currency */}
          <div className="p-4 rounded-xl bg-dark-surface2/60 border border-dark-border">
            <div className="text-[10px] font-mono uppercase text-dark-text-muted mb-1.5">
              Receive Estimation
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-dark-text truncate tabular-nums">
                {converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="bg-dark-surface1 text-dark-text text-sm font-mono font-bold px-3 py-3 rounded-lg border border-dark-border focus:outline-none"
              >
                {POPULAR_CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ratio telemetry and sparkline curve */}
          <div className="p-4 rounded-xl bg-dark-surface2/40 border border-dark-border space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-dark-text-muted">
                1 {fromCurrency} = <strong className="text-brand-cyan">{unitRate.toFixed(4)} {toCurrency}</strong>
              </span>
              <span className="text-[10px] text-brand-emerald">Spread: 0.00% (Direct Market)</span>
            </div>

            {/* Sparkline visualization */}
            <div className="h-10 w-full relative flex items-end">
              <svg viewBox="0 0 300 40" className="w-full h-full text-brand-cyan" fill="none">
                <path
                  d="M0 35 C 50 32, 100 38, 150 20 C 200 10, 250 28, 300 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

        </div>

        {/* Popular Rates Table (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-dark-surface1 border border-dark-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-dark-border mb-4">
              <div className="text-xs font-mono uppercase font-semibold text-dark-text">
                POPULAR RATES
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono">
                <span className="text-dark-text-muted">Target:</span>
                <select
                  value={tableBase}
                  onChange={(e) => setTableBase(e.target.value)}
                  className="bg-dark-surface2 text-dark-text px-2 py-0.5 rounded border border-dark-border"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              {POPULAR_CURRENCIES.filter(c => c !== tableBase).slice(0, 6).map((cur) => {
                const rate = ratesData
                  ? convertCurrency(1, cur, tableBase, ratesData.rates)
                  : 0;
                return (
                  <div
                    key={cur}
                    onClick={() => {
                      setFromCurrency(cur);
                      setToCurrency(tableBase);
                    }}
                    className="p-3 rounded-lg bg-dark-surface2/60 hover:bg-dark-surface2 border border-dark-border flex items-center justify-between cursor-pointer transition font-mono text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-dark-text">{cur}</span>
                      <span className="text-dark-text-muted">→</span>
                      <span className="text-dark-text-secondary">{tableBase}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-dark-text">
                        {rate.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-dark-border/60 text-[11px] font-mono text-dark-text-muted flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-brand-emerald">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></span>
              Live Open Exchange Rates
            </span>
            <span>Direct Market Feed</span>
          </div>
        </div>

      </div>

    </div>
  );
};
