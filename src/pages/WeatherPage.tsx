import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Wind, 
  Droplets, 
  Gauge, 
  Sun, 
  SunMedium, 
  CloudRain, 
  Compass, 
  AlertCircle, 
  RefreshCw, 
  Clock
} from 'lucide-react';
import type { WeatherData, WeatherLocation } from '../types/weather';
import { fetchWeather, searchCities, getCachedWeather } from '../services/weatherService';

export const WeatherPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<WeatherLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load cached weather if available from previous search
  useEffect(() => {
    const cached = getCachedWeather();
    if (cached) {
      setWeather(cached);
    }
  }, []);

  const loadLocationWeather = async (loc: WeatherLocation) => {
    setLoading(true);
    setError(null);
    setSearchResults([]);
    setQuery('');
    try {
      const data = await fetchWeather(loc);
      setWeather(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve weather data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    try {
      const results = await searchCities(query);
      if (results.length === 0) {
        setError(`No cities matching "${query}" were found. Try another city.`);
      } else if (results.length === 1) {
        loadLocationWeather(results[0]);
      } else {
        setSearchResults(results);
      }
    } catch {
      setError('Network error while searching for city. Check your connection.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-brand-cyan mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
            LIVE ATMOSPHERIC CONDITIONS
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-dark-text">Weather</h1>
          <p className="text-xs text-dark-text-muted mt-1">
            Current atmospheric conditions and multi-day forecasting.
          </p>
        </div>

        {weather && (
          <div className="flex items-center gap-2 text-xs font-mono text-dark-text-muted self-start md:self-auto bg-dark-surface1 px-3 py-1.5 rounded-lg border border-dark-border">
            <MapPin className="w-3.5 h-3.5 text-brand-indigo" />
            <span>Ref: {weather.location.latitude.toFixed(2)}, {weather.location.longitude.toFixed(2)}</span>
            <span className="text-dark-border">|</span>
            <span>Updated {weather.lastUpdated}</span>
          </div>
        )}
      </div>

      {/* Search Bar & Presets */}
      <div className="p-4 rounded-xl bg-dark-surface1 border border-dark-border mb-8">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city (e.g., Paris, New York, Mumbai, Sydney)..."
              className="w-full bg-dark-surface2 text-dark-text placeholder:text-dark-text-muted pl-10 pr-4 py-2.5 rounded-lg border border-dark-border focus:border-brand-indigo focus:outline-none text-xs font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-brand-indigo hover:bg-brand-indigo/90 text-white text-xs font-medium transition disabled:opacity-50"
          >
            {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Search</span>
          </button>
        </form>

        {/* City Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="mb-3 p-2 bg-dark-surface2 rounded-lg border border-dark-border space-y-1">
            <div className="text-[10px] font-mono uppercase text-dark-text-muted px-2 py-1">
              Select Location:
            </div>
            {searchResults.map((loc, i) => (
              <button
                key={i}
                onClick={() => loadLocationWeather(loc)}
                className="w-full text-left px-3 py-1.5 rounded-md text-xs text-dark-text hover:bg-dark-surface3 flex items-center justify-between transition"
              >
                <span>{loc.name}, {loc.country}</span>
                <span className="font-mono text-[10px] text-dark-text-muted">
                  {loc.latitude.toFixed(2)}, {loc.longitude.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3 mb-8">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-12 text-center rounded-xl bg-dark-surface1 border border-dark-border mb-6">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-cyan mx-auto mb-3" />
          <p className="text-xs font-mono text-dark-text-secondary">Fetching weather data from Open-Meteo...</p>
        </div>
      )}

      {/* Idle State when no location searched yet */}
      {!loading && !weather && !error && (
        <div className="p-12 text-center rounded-2xl bg-dark-surface1 border border-dark-border text-dark-text-muted">
          <SunMedium className="w-10 h-10 mx-auto mb-3 opacity-30 text-dark-text" />
          <h3 className="text-sm font-semibold text-dark-text mb-1">Check Atmospheric Weather</h3>
          <p className="text-xs max-w-sm mx-auto">
            Search for any city above to view real-time temperature, humidity, wind conditions, and 5-day forecasts.
          </p>
        </div>
      )}

      {/* Main Weather Display */}
      {!loading && weather && (
        <div className="space-y-6">
          
          {/* Top Bento Row: Current Condition & Sensor Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Hero Card (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-xl bg-dark-surface1 border border-dark-border flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-dark-text">
                  <MapPin className="w-4 h-4 text-brand-cyan" />
                  <span>{weather.location.name}, {weather.location.country}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-mono text-dark-text-muted bg-dark-surface2 px-2.5 py-1 rounded-md border border-dark-border">
                  <Clock className="w-3 h-3 text-brand-emerald" />
                  <span>Local: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="my-6 flex items-center justify-between">
                <div>
                  <div className="text-6xl sm:text-7xl font-bold font-mono tracking-tight text-dark-text">
                    {weather.current.temperature}°<span className="text-brand-cyan text-4xl">C</span>
                  </div>
                  <div className="text-base font-medium text-dark-text-secondary mt-2 flex items-center gap-2">
                    <span>{weather.current.condition}</span>
                    <span className="text-dark-border">•</span>
                    <span>Feels like {weather.current.feelsLike}°</span>
                  </div>
                </div>

                <div className="w-24 h-24 rounded-2xl bg-dark-surface2 border border-dark-border flex items-center justify-center p-3 shadow-inner">
                  {weather.current.isDay ? (
                    <Sun className="w-12 h-12 text-brand-amber animate-pulse" />
                  ) : (
                    <SunMedium className="w-12 h-12 text-brand-indigo" />
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-dark-border/60 flex flex-wrap items-center justify-between text-xs font-mono text-dark-text-muted gap-2">
                <div className="flex items-center gap-2">
                  <span>H: <strong className="text-dark-text">{weather.current.highTemp}°</strong></span>
                  <span>•</span>
                  <span>L: <strong className="text-dark-text">{weather.current.lowTemp}°</strong></span>
                </div>
                <div className="flex items-center gap-1 text-brand-emerald">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></span>
                  <span>Barometer: Steady ({weather.current.pressure} hPa)</span>
                </div>
              </div>
            </div>

            {/* Right: Sensor Metrics Grid (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-xl bg-dark-surface1 border border-dark-border">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-dark-border/60">
                <div className="text-xs font-mono uppercase tracking-wider text-dark-text font-semibold flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-brand-cyan" />
                  SENSOR METRICS
                </div>
                <span className="text-[10px] font-mono text-brand-emerald">Calibrated Real-Time</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-dark-surface2/60 border border-dark-border">
                  <div className="flex items-center justify-between text-[11px] font-mono text-dark-text-muted mb-1">
                    <span>HUMIDITY</span>
                    <Droplets className="w-3.5 h-3.5 text-brand-cyan" />
                  </div>
                  <div className="text-lg font-mono font-bold text-dark-text">{weather.current.humidity}%</div>
                  <div className="text-[10px] text-dark-text-muted mt-0.5">Dew Point: {weather.current.dewPoint}°</div>
                </div>

                <div className="p-3 rounded-lg bg-dark-surface2/60 border border-dark-border">
                  <div className="flex items-center justify-between text-[11px] font-mono text-dark-text-muted mb-1">
                    <span>WIND</span>
                    <Wind className="w-3.5 h-3.5 text-brand-emerald" />
                  </div>
                  <div className="text-lg font-mono font-bold text-dark-text">{weather.current.windSpeed} km/h</div>
                  <div className="text-[10px] text-dark-text-muted mt-0.5">Gusts: {weather.current.windGusts} km/h</div>
                </div>

                <div className="p-3 rounded-lg bg-dark-surface2/60 border border-dark-border">
                  <div className="flex items-center justify-between text-[11px] font-mono text-dark-text-muted mb-1">
                    <span>PRESSURE</span>
                    <Compass className="w-3.5 h-3.5 text-brand-indigo" />
                  </div>
                  <div className="text-lg font-mono font-bold text-dark-text">{weather.current.pressure} hPa</div>
                  <div className="text-[10px] text-dark-text-muted mt-0.5">Mean Sea Level</div>
                </div>

                <div className="p-3 rounded-lg bg-dark-surface2/60 border border-dark-border">
                  <div className="flex items-center justify-between text-[11px] font-mono text-dark-text-muted mb-1">
                    <span>UV INDEX</span>
                    <Sun className="w-3.5 h-3.5 text-brand-amber" />
                  </div>
                  <div className="text-lg font-mono font-bold text-dark-text">{weather.current.uvIndex} of 11</div>
                  <div className="text-[10px] text-dark-text-muted mt-0.5">
                    {weather.current.uvIndex > 5 ? 'High (Protection req.)' : 'Moderate'}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Middle Row: Hourly Forecast */}
          <div className="p-6 rounded-xl bg-dark-surface1 border border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-mono uppercase tracking-wider text-dark-text font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-cyan" />
                Hourly Forecast
              </div>
              <span className="text-[11px] font-mono text-dark-text-muted">Next 6 Hours Projected</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {weather.hourly.map((h, i) => (
                <div key={i} className="p-3 rounded-lg bg-dark-surface2/70 border border-dark-border text-center flex flex-col items-center justify-between">
                  <div className="text-xs font-mono text-dark-text-muted mb-1">{h.time}</div>
                  <div className="my-2 p-2 rounded-lg bg-dark-surface3 text-brand-cyan">
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <div className="text-base font-mono font-bold text-dark-text mb-1">{h.temperature}°</div>
                  <div className="text-[10px] text-dark-text-secondary truncate w-full mb-1">{h.condition}</div>
                  <div className="text-[10px] font-mono text-brand-cyan font-medium">
                    {h.precipitationProbability}% precip
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row: 5-Day Forecast & Solar Track */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 5-Day Forecast (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-xl bg-dark-surface1 border border-dark-border">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-mono uppercase tracking-wider text-dark-text font-semibold">
                  5-Day Forecast
                </div>
                <span className="text-[10px] font-mono text-dark-text-muted">Thermal Gradient Range</span>
              </div>

              <div className="space-y-3">
                {weather.daily.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-dark-surface2/50 border border-dark-border text-xs">
                    <div className="w-24 font-medium text-dark-text">{d.dayName}</div>
                    <div className="flex items-center gap-2 flex-1 max-w-xs px-2">
                      <span className="text-dark-text-muted text-[11px] truncate w-24">{d.condition}</span>
                      <div className="flex-1 h-2 rounded-full bg-dark-surface3 relative overflow-hidden flex items-center">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-indigo"
                          style={{ width: `${Math.min(100, Math.max(30, (d.highTemp - d.lowTemp) * 10))}%` }}
                        />
                      </div>
                    </div>
                    <div className="font-mono text-right w-24 text-dark-text">
                      <span className="text-brand-cyan">{d.lowTemp}°</span>
                      <span className="text-dark-text-muted mx-1">/</span>
                      <span className="font-bold">{d.highTemp}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Solar Track & Geolocation Map (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Solar Track Arc */}
              <div className="p-5 rounded-xl bg-dark-surface1 border border-dark-border">
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <span className="font-semibold text-dark-text uppercase flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-brand-amber" /> SOLAR TRACK
                  </span>
                  <span className="text-dark-text-muted text-[10px]">Daylight Window</span>
                </div>

                <div className="relative h-20 flex items-center justify-center my-2">
                  {/* Visual arc */}
                  <div className="w-48 h-24 border-t-2 border-brand-cyan/60 rounded-t-full flex items-center justify-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-brand-amber shadow-glow-amber border-2 border-dark-surface1" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-dark-border/60">
                  <div>
                    <span className="text-[10px] text-dark-text-muted block">SUNRISE</span>
                    <strong className="text-dark-text">{weather.sunrise}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-dark-text-muted block">SUNSET</span>
                    <strong className="text-dark-text">{weather.sunset}</strong>
                  </div>
                </div>
              </div>

              {/* Geographic Coordinates Card */}
              <div className="p-4 rounded-xl bg-dark-surface1 border border-dark-border flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="text-[10px] uppercase text-dark-text-muted">LOCATION COORD</div>
                  <div className="text-dark-text font-bold">
                    {weather.location.latitude.toFixed(4)}° N, {weather.location.longitude.toFixed(4)}° E
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded bg-brand-cyan/10 text-brand-cyan text-[11px] border border-brand-cyan/20">
                  Open-Meteo Verified
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
