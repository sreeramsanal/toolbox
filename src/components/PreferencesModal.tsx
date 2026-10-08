import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { X, Moon, Sun, Volume2, VolumeX, Trash2, Check, SlidersHorizontal } from 'lucide-react';
import { playClickSound } from '../utils/sound';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('toolbox_sound_enabled') !== 'false';
  });
  const [clearedNotice, setClearedNotice] = useState(false);

  if (!isOpen) return null;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('toolbox_sound_enabled', String(next));
    if (next) playClickSound();
  };

  const handleClearData = () => {
    if (window.confirm('Reset all locally stored data (issues, alarms, countdowns)?')) {
      localStorage.clear();
      setClearedNotice(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-dark-surface1 dark:bg-dark-surface1 border border-dark-border dark:border-dark-border rounded-xl shadow-2xl overflow-hidden p-6 text-dark-text dark:text-dark-text"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-dark-border dark:border-dark-border">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-brand-indigo/10 text-brand-indigo">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-dark-text dark:text-dark-text">Workspace Preferences</h2>
              <p className="text-xs text-dark-text-muted">Personalize your application settings</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-dark-text-muted hover:text-dark-text transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-5 text-sm">
          {/* Theme selection */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-dark-text-muted mb-2">
              Appearance Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                  theme === 'dark' 
                    ? 'border-brand-indigo bg-brand-indigo/10 text-brand-indigo' 
                    : 'border-dark-border hover:bg-dark-surface2 text-dark-text-secondary'
                }`}
              >
                <Moon className="w-4 h-4" /> Dark Mode
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                  theme === 'light' 
                    ? 'border-brand-indigo bg-brand-indigo/10 text-brand-indigo' 
                    : 'border-dark-border hover:bg-dark-surface2 text-dark-text-secondary'
                }`}
              >
                <Sun className="w-4 h-4" /> Light Mode
              </button>
            </div>
          </div>

          {/* Audio Feedback */}
          <div className="flex items-center justify-between py-2 border-t border-dark-border/60">
            <div>
              <div className="text-sm font-medium text-dark-text">Audio Effects & Alarms</div>
              <div className="text-xs text-dark-text-muted">Audio chimes and click sounds</div>
            </div>
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border transition ${
                soundEnabled 
                  ? 'border-brand-emerald bg-brand-emerald/10 text-brand-emerald' 
                  : 'border-dark-border text-dark-text-muted'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Reset data */}
          <div className="pt-2">
            <button
              onClick={handleClearData}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition"
            >
              <Trash2 className="w-4 h-4" /> Reset Workspace Data
            </button>
            {clearedNotice && (
              <div className="mt-2 text-center text-xs text-brand-emerald flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5" /> Workspace data cleared!
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-dark-border text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-brand-indigo hover:bg-brand-indigo/90 text-white text-xs font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
