import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  CheckCircle2,
  LayoutGrid
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-indigo/15 border border-brand-indigo/30 text-brand-indigo text-xs font-mono mb-4">
          <Sparkles className="w-3.5 h-3.5" /> OVERVIEW
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-dark-text mb-4">
          About TOOLBOX
        </h1>
        <p className="text-sm sm:text-base text-dark-text-secondary leading-relaxed">
          Simple tools for everyday tasks. Fast, focused utilities that run right in your browser.
        </p>
      </div>

      {/* Main Narrative Card */}
      <div className="p-8 rounded-2xl bg-dark-surface1 border border-dark-border shadow-xl space-y-6 text-sm text-dark-text-secondary leading-relaxed mb-8">
        
        <h2 className="text-lg font-bold text-dark-text">
          Simple Tools. Built for Everyday Use.
        </h2>
        <p>
          TOOLBOX was designed as a clean, distraction-free suite of everyday productivity utilities. Whether you need a quick calculation, weather updates, a milestone countdown, task tracking, or web extraction, your workflow shouldn’t be interrupted by sign-up forms, account walls, or unnecessary complexity.
        </p>
        <p>
          Every tool is built to be fast, responsive, and available instantly. Your preferences and workspace data stay saved directly on your device, ensuring a seamless experience every time you return.
        </p>

      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        <div className="p-5 rounded-xl bg-dark-surface1 border border-dark-border">
          <div className="p-2.5 rounded-lg bg-brand-indigo/10 text-brand-indigo w-fit mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-dark-text mb-1">Instant Speed</h3>
          <p className="text-xs text-dark-text-muted leading-relaxed">
            Quick responses with zero lag. Open any tool and get straight to work with no loading delays or account logins.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-dark-surface1 border border-dark-border">
          <div className="p-2.5 rounded-lg bg-brand-cyan/10 text-brand-cyan w-fit mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-dark-text mb-1">Persistent Workspace</h3>
          <p className="text-xs text-dark-text-muted leading-relaxed">
            Your tasks, calculations, custom alarms, and countdown milestones remain saved on your device so you never lose progress.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-dark-surface1 border border-dark-border">
          <div className="p-2.5 rounded-lg bg-brand-emerald/10 text-brand-emerald w-fit mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-dark-text mb-1">Private by Design</h3>
          <p className="text-xs text-dark-text-muted leading-relaxed">
            No intrusive trackers, advertising cookies, or personal profiles. Your activities and data remain completely yours.
          </p>
        </div>

      </div>

      {/* Included Utilities Section */}
      <div className="p-6 rounded-2xl bg-dark-surface1 border border-dark-border text-xs">
        <div className="text-dark-text font-bold mb-3 flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-brand-indigo" />
          <span>INCLUDED TOOLS</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-dark-text-secondary font-mono">
          <div className="p-2.5 rounded bg-dark-surface2 border border-dark-border">
            <span className="text-dark-text font-semibold block">Web Extractor</span>
            Clean article & content reader
          </div>
          <div className="p-2.5 rounded bg-dark-surface2 border border-dark-border">
            <span className="text-dark-text font-semibold block">Weather</span>
            Real-time conditions & forecasts
          </div>
          <div className="p-2.5 rounded bg-dark-surface2 border border-dark-border">
            <span className="text-dark-text font-semibold block">Issue Tracker</span>
            Local task & backlog organizer
          </div>
          <div className="p-2.5 rounded bg-dark-surface2 border border-dark-border">
            <span className="text-dark-text font-semibold block">Calculator</span>
            Math operations with tape history
          </div>
          <div className="p-2.5 rounded bg-dark-surface2 border border-dark-border">
            <span className="text-dark-text font-semibold block">Countdown</span>
            Milestone timers & celebrations
          </div>
          <div className="p-2.5 rounded bg-dark-surface2 border border-dark-border">
            <span className="text-dark-text font-semibold block">Alarm Clock</span>
            Custom time alerts & schedules
          </div>
          <div className="p-2.5 rounded bg-dark-surface2 border border-dark-border">
            <span className="text-dark-text font-semibold block">Currency</span>
            Live rates & conversion calculator
          </div>
          <div className="p-2.5 rounded bg-dark-surface2 border border-dark-border">
            <span className="text-dark-text font-semibold block">Temperature</span>
            Celsius, Fahrenheit & Kelvin
          </div>
          <div className="p-2.5 rounded bg-dark-surface2 border border-dark-border">
            <span className="text-dark-text font-semibold block">GitHub Profile</span>
            Developer stats & repositories
          </div>
        </div>
      </div>

    </div>
  );
};
