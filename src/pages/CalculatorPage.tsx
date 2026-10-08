import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Copy, 
  Check, 
  Trash2, 
  Clock, 
  Thermometer
} from 'lucide-react';
import type { CalculationHistoryItem } from '../types/calculator';
import { getStoredCalcHistory, saveStoredCalcHistory } from '../utils/localStorage';
import { playClickSound } from '../utils/sound';

export const CalculatorPage: React.FC = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setHistory(getStoredCalcHistory());
  }, []);

  const inputDigit = (digit: string) => {
    playClickSound();
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  };

  const inputDecimal = () => {
    playClickSound();
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const clearAll = () => {
    playClickSound();
    setDisplayValue('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setExpression('');
  };

  const backspace = () => {
    playClickSound();
    if (waitingForOperand) return;
    if (displayValue.length > 1) {
      setDisplayValue(displayValue.slice(0, -1));
    } else {
      setDisplayValue('0');
    }
  };

  const toggleSign = () => {
    playClickSound();
    const val = parseFloat(displayValue);
    setDisplayValue(String(-val));
  };

  const inputPercent = () => {
    playClickSound();
    const val = parseFloat(displayValue);
    setDisplayValue(String(val / 100));
  };

  const performOperation = (nextOperator: string) => {
    playClickSound();
    const inputValue = parseFloat(displayValue);

    if (prevValue === null) {
      setPrevValue(inputValue);
      setExpression(`${inputValue} ${nextOperator}`);
    } else if (operator) {
      const currentValue = prevValue || 0;
      let calculated = currentValue;

      if (operator === '+') calculated = currentValue + inputValue;
      else if (operator === '-') calculated = currentValue - inputValue;
      else if (operator === '×' || operator === '*') calculated = currentValue * inputValue;
      else if (operator === '÷' || operator === '/') {
        if (inputValue === 0) {
          setDisplayValue('Error');
          setPrevValue(null);
          setOperator(null);
          setWaitingForOperand(true);
          return;
        }
        calculated = currentValue / inputValue;
      }

      // Record in history if evaluating
      if (nextOperator === '=') {
        const resultStr = String(Number(calculated.toFixed(8)));
        const histItem: CalculationHistoryItem = {
          id: String(Date.now()),
          expression: `${currentValue} ${operator} ${inputValue}`,
          result: resultStr,
          timestamp: Date.now(),
        };
        const updatedHistory = [histItem, ...history];
        setHistory(updatedHistory);
        saveStoredCalcHistory(updatedHistory);
        setExpression(`${currentValue} ${operator} ${inputValue} =`);
      } else {
        setExpression(`${calculated} ${nextOperator}`);
      }

      setPrevValue(nextOperator === '=' ? null : calculated);
      setDisplayValue(String(Number(calculated.toFixed(8))));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator === '=' ? null : nextOperator);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (/^[0-9]$/.test(e.key)) {
        inputDigit(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+' || e.key === '-') {
        performOperation(e.key);
      } else if (e.key === '*') {
        performOperation('×');
      } else if (e.key === '/') {
        e.preventDefault();
        performOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        performOperation('=');
      } else if (e.key === 'Escape') {
        clearAll();
      } else if (e.key === 'Backspace') {
        backspace();
      } else if (e.key === '%') {
        inputPercent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(displayValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const clearHistory = () => {
    setHistory([]);
    saveStoredCalcHistory([]);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-brand-emerald mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></span>
            PRECISION ARITHMETIC
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-dark-text">Calculator</h1>
          <p className="text-xs text-dark-text-muted mt-1">
            Fast, high-precision mathematical operations with history tape.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/temperature"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-border bg-dark-surface1 hover:bg-dark-surface2 text-dark-text-secondary text-xs font-mono transition"
          >
            <Thermometer className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Temperature Converter</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Calculator Unit (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-dark-surface1 border border-dark-border shadow-xl flex flex-col justify-between">
          
          {/* LCD Screen / Display */}
          <div className="p-4 rounded-xl bg-dark-surface2/90 border border-dark-border mb-6">
            <div className="flex items-center justify-between text-[11px] font-mono text-dark-text-muted mb-1">
              <span>M: 0.00 • DEG</span>
              <span className="truncate max-w-[200px]">{expression || '0'}</span>
            </div>
            
            <div className="text-right text-4xl sm:text-5xl font-mono font-bold text-dark-text tracking-tight truncate py-2 tabular-nums">
              {displayValue}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-dark-border/50 text-[11px] font-mono text-dark-text-muted">
              <span>Keys: 0-9, +, -, *, /, Enter, Esc</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-dark-text transition"
              >
                {copied ? <Check className="w-3 h-3 text-brand-emerald" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Value'}</span>
              </button>
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            {/* Row 1 */}
            <button
              onClick={clearAll}
              className="py-3.5 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-red-400 font-mono font-bold text-sm transition active:scale-95"
            >
              AC
            </button>
            <button
              onClick={toggleSign}
              className="py-3.5 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-dark-text font-mono text-sm transition active:scale-95"
            >
              +/-
            </button>
            <button
              onClick={inputPercent}
              className="py-3.5 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-dark-text font-mono text-sm transition active:scale-95"
            >
              %
            </button>
            <button
              onClick={() => performOperation('÷')}
              className={`py-3.5 rounded-lg border font-mono font-bold text-base transition active:scale-95 ${
                operator === '÷' ? 'bg-brand-indigo text-white border-brand-indigo' : 'bg-dark-surface3 hover:bg-dark-surface2 text-brand-cyan border-dark-border'
              }`}
            >
              ÷
            </button>

            {/* Row 2 */}
            <button onClick={() => inputDigit('7')} className="py-3.5 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-dark-text font-mono text-base transition active:scale-95">7</button>
            <button onClick={() => inputDigit('8')} className="py-3.5 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-dark-text font-mono text-base transition active:scale-95">8</button>
            <button onClick={() => inputDigit('9')} className="py-3.5 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-dark-text font-mono text-base transition active:scale-95">9</button>
            <button
              onClick={() => performOperation('×')}
              className={`py-3.5 rounded-lg border font-mono font-bold text-base transition active:scale-95 ${
                operator === '×' ? 'bg-brand-indigo text-white border-brand-indigo' : 'bg-dark-surface3 hover:bg-dark-surface2 text-brand-cyan border-dark-border'
              }`}
            >
              ×
            </button>

            {/* Row 3 */}
            <button onClick={() => inputDigit('4')} className="py-3.5 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-dark-text font-mono text-base transition active:scale-95">4</button>
            <button onClick={() => inputDigit('5')} className="py-3.5 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-dark-text font-mono text-base transition active:scale-95">5</button>
            <button onClick={() => inputDigit('6')} className="py-3.5 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-dark-text font-mono text-base transition active:scale-95">6</button>
            <button
              onClick={() => performOperation('-')}
              className={`py-3.5 rounded-lg border font-mono font-bold text-base transition active:scale-95 ${
                operator === '-' ? 'bg-brand-indigo text-white border-brand-indigo' : 'bg-dark-surface3 hover:bg-dark-surface2 text-brand-cyan border-dark-border'
              }`}
            >
              -
            </button>

            {/* Row 4 */}
            <button onClick={() => inputDigit('1')} className="py-3.5 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-dark-text font-mono text-base transition active:scale-95">1</button>
            <button onClick={() => inputDigit('2')} className="py-3.5 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-dark-text font-mono text-base transition active:scale-95">2</button>
            <button onClick={() => inputDigit('3')} className="py-3.5 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-dark-text font-mono text-base transition active:scale-95">3</button>
            <button
              onClick={() => performOperation('+')}
              className={`py-3.5 rounded-lg border font-mono font-bold text-base transition active:scale-95 ${
                operator === '+' ? 'bg-brand-indigo text-white border-brand-indigo' : 'bg-dark-surface3 hover:bg-dark-surface2 text-brand-cyan border-dark-border'
              }`}
            >
              +
            </button>

            {/* Row 5 */}
            <button onClick={() => inputDigit('0')} className="col-span-2 py-3.5 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-dark-text font-mono text-base transition active:scale-95">0</button>
            <button onClick={inputDecimal} className="py-3.5 rounded-lg bg-dark-surface2 hover:bg-dark-surface3 border border-dark-border text-dark-text font-mono text-base transition active:scale-95">.</button>
            <button
              onClick={() => performOperation('=')}
              className="py-3.5 rounded-lg bg-brand-indigo hover:bg-brand-indigo/90 border border-brand-indigo text-white font-mono font-bold text-lg shadow-glow-indigo transition active:scale-95"
            >
              =
            </button>
          </div>

        </div>

        {/* Calculation History Tape (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-dark-surface1 border border-dark-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-dark-border mb-4">
              <div className="text-xs font-mono uppercase font-semibold text-dark-text flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-emerald" />
                SESSION CALCULATION TAPE
              </div>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="p-1 text-dark-text-muted hover:text-red-400 transition"
                  title="Clear Tape"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-dark-text-muted">
                  No calculations in current session. Calculations appear here automatically.
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setDisplayValue(item.result)}
                    className="p-3 rounded-lg bg-dark-surface2/60 hover:bg-dark-surface2 border border-dark-border cursor-pointer transition flex items-center justify-between font-mono text-xs"
                  >
                    <span className="text-dark-text-muted">{item.expression}</span>
                    <span className="text-brand-emerald font-bold">= {item.result}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-dark-border/60 text-[11px] font-mono text-dark-text-muted flex items-center justify-between">
            <span>Deterministic Math</span>
            <span className="text-brand-emerald">Zero External Compute Round-trips</span>
          </div>
        </div>

      </div>

    </div>
  );
};
