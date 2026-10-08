import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-dark-border dark:border-dark-border bg-dark-bg/60 dark:bg-dark-bg/60 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-dark-text-muted">
        
        {/* Left: Brand info */}
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold tracking-tight text-dark-text dark:text-dark-text">
            TOOLBOX
          </span>
          <span className="text-dark-text-muted">Simple tools for everyday tasks.</span>
        </div>

        {/* Center: Clean tagline badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-dark-surface1 border border-dark-border font-mono text-[11px] text-dark-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></span>
          <span>Fast, focused everyday utilities</span>
        </div>

        {/* Right: Navigation links */}
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-dark-text transition">
            Home
          </Link>
          <span className="text-dark-border">/</span>
          <Link to="/about" className="hover:text-dark-text transition">
            About
          </Link>
          <span className="text-dark-border">/</span>
          <span className="text-brand-indigo font-mono text-[11px]">TOOLBOX Suite</span>
        </div>
      </div>
    </footer>
  );
};
