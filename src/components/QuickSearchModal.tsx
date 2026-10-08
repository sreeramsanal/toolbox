import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe,
  CloudSun, 
  CheckSquare, 
  Calculator, 
  Thermometer, 
  Hourglass, 
  Bell, 
  DollarSign, 
  Search, 
  X, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOOLS = [
  { id: 'web-extractor', name: 'Web Extractor', desc: 'Extract useful information from any public webpage', path: '/web-extractor', icon: Globe, color: 'text-brand-emerald' },
  { id: 'weather', name: 'Weather', desc: 'Current conditions and 5-day forecast', path: '/weather', icon: CloudSun, color: 'text-brand-cyan' },
  { id: 'issues', name: 'Issue Tracker', desc: 'Local task and bug tracker', path: '/issues', icon: CheckSquare, color: 'text-brand-purple' },
  { id: 'calculator', name: 'Calculator', desc: 'High-precision mathematical calculator', path: '/calculator', icon: Calculator, color: 'text-brand-emerald' },
  { id: 'github', name: 'GitHub Profile', desc: 'Inspect public developers and repositories', path: '/github', icon: GithubIcon, color: 'text-brand-indigo' },
  { id: 'temperature', name: 'Temperature Converter', desc: 'Celsius, Fahrenheit, and Kelvin', path: '/temperature', icon: Thermometer, color: 'text-brand-cyan' },
  { id: 'countdown', name: 'Countdown', desc: 'Milestone timers and deadlines', path: '/countdown', icon: Hourglass, color: 'text-brand-emerald' },
  { id: 'alarm', name: 'Alarm Clock', desc: 'Browser-based acoustic alerts', path: '/alarm', icon: Bell, color: 'text-brand-purple' },
  { id: 'currency', name: 'Currency Tracker', desc: 'Live exchange rates and conversion', path: '/currency', icon: DollarSign, color: 'text-brand-cyan' },
];

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const filtered = TOOLS.filter(t => 
    t.name.toLowerCase().includes(query.toLowerCase()) || 
    t.desc.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          navigate(filtered[selectedIndex].path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filtered, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-dark-surface1 dark:bg-dark-surface1 border border-dark-border dark:border-dark-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center px-4 py-3.5 border-b border-dark-border dark:border-dark-border gap-3">
          <Search className="w-5 h-5 text-dark-text-muted" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a tool name or utility to jump..."
            className="flex-1 bg-transparent text-dark-text dark:text-dark-text placeholder:text-dark-text-muted focus:outline-none text-sm font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded text-dark-text-muted hover:text-dark-text transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-mono bg-dark-surface2 text-dark-text-muted rounded border border-dark-border">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-dark-text-muted">
              No matching utilities found for "{query}"
            </div>
          ) : (
            filtered.map((tool, idx) => {
              const Icon = tool.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    navigate(tool.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-dark-surface2 dark:bg-dark-surface2 text-dark-text' 
                      : 'text-dark-text-secondary hover:bg-dark-surface2/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md bg-dark-surface3 dark:bg-dark-surface3 ${tool.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-dark-text dark:text-dark-text flex items-center gap-2">
                        {tool.name}
                        {isSelected && <span className="text-[10px] uppercase font-mono tracking-wider text-brand-indigo">Select</span>}
                      </div>
                      <div className="text-xs text-dark-text-muted">{tool.desc}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <ArrowRight className="w-4 h-4 text-brand-indigo animate-pulse" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-dark-surface2/60 dark:bg-dark-surface2/60 border-t border-dark-border dark:border-dark-border flex items-center justify-between text-xs text-dark-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 text-[10px] font-mono bg-dark-surface1 rounded border border-dark-border">↑</kbd>
              <kbd className="px-1 py-0.5 text-[10px] font-mono bg-dark-surface1 rounded border border-dark-border">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 text-[10px] font-mono bg-dark-surface1 rounded border border-dark-border">↵</kbd>
              open
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-brand-indigo">
            <Sparkles className="w-3 h-3" /> 8 Utilities Active
          </div>
        </div>
      </div>
    </div>
  );
};
