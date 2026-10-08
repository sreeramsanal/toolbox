import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  RotateCw, 
  Calculator as CalcIcon, 
  AlertTriangle
} from 'lucide-react';
import { playClickSound } from '../utils/sound';

type Unit = 'C' | 'F' | 'K';

export const TemperaturePage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [sourceUnit, setSourceUnit] = useState<Unit>('C');

  const cycleUnit = () => {
    playClickSound();
    if (sourceUnit === 'C') setSourceUnit('F');
    else if (sourceUnit === 'F') setSourceUnit('K');
    else setSourceUnit('C');
  };

  const rawNum = parseFloat(inputValue);
  const isValidNumber = !isNaN(rawNum) && inputValue.trim() !== '';

  // Convert everything to Celsius as common denominator
  let celsius = 0;
  let isBelowAbsoluteZero = false;

  if (isValidNumber) {
    if (sourceUnit === 'C') celsius = rawNum;
    else if (sourceUnit === 'F') celsius = (rawNum - 32) * (5 / 9);
    else if (sourceUnit === 'K') celsius = rawNum - 273.15;

    if (celsius < -273.15) {
      isBelowAbsoluteZero = true;
    }
  }

  // Derive other units
  const fahrenheit = (celsius * 9) / 5 + 32;
  const kelvin = celsius + 273.15;

  const getComfortLabel = (c: number): string => {
    if (c < 0) return 'Freezing / Sub-Zero';
    if (c < 15) return 'Chilly / Crisp';
    if (c < 26) return 'Comfortable / Ambient';
    if (c < 38) return 'Warm / Hot';
    if (c < 70) return 'Extreme Heat';
    return 'Boiling / Industrial';
  };

  const setPreset = (cVal: number) => {
    playClickSound();
    if (sourceUnit === 'C') setInputValue(String(cVal));
    else if (sourceUnit === 'F') setInputValue(String(Number(((cVal * 9) / 5 + 32).toFixed(1))));
    else setInputValue(String(Number((cVal + 273.15).toFixed(2))));
  };

  // Spectrum percentage (-20°C to 100°C)
  const spectrumPercent = Math.min(100, Math.max(0, ((celsius + 20) / 120) * 100));

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-brand-cyan mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
            TEMPERATURE SCALE CONVERTER
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-dark-text">Temperature Converter</h1>
          <p className="text-xs text-dark-text-muted mt-1">
            Convert temperatures instantly across Celsius, Fahrenheit, and Kelvin scales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/calculator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-border bg-dark-surface1 hover:bg-dark-surface2 text-dark-text-secondary text-xs font-mono transition"
          >
            <CalcIcon className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Standard Calculator</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Converter Main Card (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-dark-surface1 border border-dark-border shadow-xl space-y-6">
          
          {/* Source input */}
          <div className="p-4 rounded-xl bg-dark-surface2/70 border border-dark-border">
            <div className="text-[11px] font-mono uppercase text-dark-text-muted mb-2">
              SOURCE MAGNITUDE & SCALE
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="any"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="25"
                className="flex-1 bg-dark-surface1 text-dark-text text-3xl font-mono font-bold px-4 py-2.5 rounded-lg border border-dark-border focus:border-brand-cyan focus:outline-none tabular-nums"
              />

              <select
                value={sourceUnit}
                onChange={(e) => setSourceUnit(e.target.value as Unit)}
                className="bg-dark-surface1 text-dark-text text-sm font-semibold px-4 py-3 rounded-lg border border-dark-border focus:outline-none"
              >
                <option value="C">Celsius (°C)</option>
                <option value="F">Fahrenheit (°F)</option>
                <option value="K">Kelvin (K)</option>
              </select>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-dark-border/50">
              <button
                onClick={cycleUnit}
                className="flex items-center gap-1.5 text-xs font-mono text-brand-cyan hover:underline transition"
              >
                <RotateCw className="w-3.5 h-3.5" /> Cycle Unit
              </button>
              {isBelowAbsoluteZero && (
                <div className="flex items-center gap-1 text-[11px] font-mono text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Below Absolute Zero (Physical Limit)
                </div>
              )}
            </div>
          </div>

          {/* Derived Conversions */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase text-dark-text-muted">
              DERIVED CONVERSIONS
            </div>

            {/* If source is C */}
            {sourceUnit !== 'C' && (
              <div className="p-4 rounded-xl bg-dark-surface2/50 border border-dark-border flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-dark-text-muted uppercase">Celsius</div>
                  <div className="text-2xl font-mono font-bold text-dark-text">
                    {isValidNumber ? celsius.toFixed(2) : '--'} <span className="text-brand-cyan text-lg">°C</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded bg-dark-surface3 border border-dark-border text-dark-text-secondary">
                  METRIC SI
                </span>
              </div>
            )}

            {/* Fahrenheit */}
            {sourceUnit !== 'F' && (
              <div className="p-4 rounded-xl bg-dark-surface2/50 border border-dark-border flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-dark-text-muted uppercase">Fahrenheit</div>
                  <div className="text-2xl font-mono font-bold text-dark-text">
                    {isValidNumber ? fahrenheit.toFixed(2) : '--'} <span className="text-brand-indigo text-lg">°F</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded bg-dark-surface3 border border-dark-border text-dark-text-secondary">
                  IMPERIAL
                </span>
              </div>
            )}

            {/* Kelvin */}
            {sourceUnit !== 'K' && (
              <div className="p-4 rounded-xl bg-dark-surface2/50 border border-dark-border flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-dark-text-muted uppercase">Kelvin</div>
                  <div className="text-2xl font-mono font-bold text-dark-text">
                    {isValidNumber ? Math.max(0, kelvin).toFixed(2) : '--'} <span className="text-brand-emerald text-lg">K</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded bg-dark-surface3 border border-dark-border text-dark-text-secondary">
                  ABSOLUTE
                </span>
              </div>
            )}
          </div>

          {/* Mathematical Principles */}
          <div className="p-3.5 rounded-lg bg-dark-surface2/40 border border-dark-border text-xs font-mono text-dark-text-muted space-y-1">
            <div className="flex items-center justify-between text-dark-text-secondary font-semibold text-[11px] mb-1">
              <span>ACTIVE MATHEMATICAL PRINCIPLES</span>
              <span>Σ Linear Scale</span>
            </div>
            <div>• °F = (°C × 9/5) + 32</div>
            <div>• K = °C + 273.15 (Absolute Zero = 0 K / -273.15 °C)</div>
          </div>

        </div>

        {/* Benchmarks & Thermal Spectrum (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Thermal Benchmarks */}
          <div className="p-6 rounded-2xl bg-dark-surface1 border border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase text-dark-text font-semibold">
                QUICK THERMAL BENCHMARKS
              </span>
              <span className="text-[10px] font-mono text-dark-text-muted">Tap to inject</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setPreset(0)}
                className="p-3 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-left transition"
              >
                <div className="text-base font-mono font-bold text-brand-cyan">0°C</div>
                <div className="text-xs text-dark-text-muted">Freezing Point</div>
              </button>

              <button
                onClick={() => setPreset(21)}
                className="p-3 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-left transition"
              >
                <div className="text-base font-mono font-bold text-brand-emerald">21°C</div>
                <div className="text-xs text-dark-text-muted">Room Temp</div>
              </button>

              <button
                onClick={() => setPreset(37)}
                className="p-3 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-left transition"
              >
                <div className="text-base font-mono font-bold text-brand-amber">37°C</div>
                <div className="text-xs text-dark-text-muted">Human Body</div>
              </button>

              <button
                onClick={() => setPreset(100)}
                className="p-3 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-left transition"
              >
                <div className="text-base font-mono font-bold text-red-400">100°C</div>
                <div className="text-xs text-dark-text-muted">Water Boiling</div>
              </button>
            </div>
          </div>

          {/* Thermal Spectrum Slider */}
          <div className="p-6 rounded-2xl bg-dark-surface1 border border-dark-border">
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <span className="font-semibold text-dark-text uppercase">THERMAL SPECTRUM</span>
              <span className="text-brand-cyan">{isValidNumber ? `${celsius.toFixed(1)}°C / ${getComfortLabel(celsius)}` : '--'}</span>
            </div>

            {/* Spectrum Track */}
            <div className="my-6 relative">
              <div className="w-full h-3 rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 to-red-500 relative" />
              {/* Pointer indicator */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-dark-bg shadow-md transition-all duration-150"
                style={{ left: `${spectrumPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-dark-text-muted">
              <span>-20°C</span>
              <span>0°C</span>
              <span>25°C</span>
              <span>50°C</span>
              <span>100°C</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
