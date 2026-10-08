import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import { 
  Search, 
  Moon, 
  Sun, 
  SlidersHorizontal, 
  Menu, 
  X
} from 'lucide-react';
import { QuickSearchModal } from './QuickSearchModal';
import { PreferencesModal } from './PreferencesModal';
import { scrollToToolsSection } from '../utils/scroll';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPrefOpen, setIsPrefOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global keyboard shortcut for Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Tools', path: '/#tools' },
    { label: 'About', path: '/about' },
  ];

  const handleNavClick = (link: { label: string; path: string }, e: React.MouseEvent) => {
    if (link.label === 'Tools') {
      if (location.pathname === '/' || location.pathname === '/tools') {
        e.preventDefault();
        scrollToToolsSection();
        window.history.pushState(null, '', '/#tools');
      } else {
        e.preventDefault();
        navigate('/#tools');
      }
    } else if (link.label === 'Home') {
      if (location.pathname === '/' || location.pathname === '/tools') {
        if (location.hash) {
          window.history.pushState(null, '', '/');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const isLinkActive = (link: { label: string; path: string }) => {
    if (link.label === 'Tools') {
      return location.pathname === '/tools' || location.hash === '#tools';
    }
    if (link.label === 'Home') {
      return (location.pathname === '/' || location.pathname === '') && location.hash !== '#tools';
    }
    return location.pathname === link.path;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-dark-bg/85 backdrop-blur-md border-b border-dark-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-dark-surface1 border border-dark-border flex items-center justify-center p-1.5 shadow-sm group-hover:border-brand-indigo/60 transition">
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#6366F1"/>
                  <circle cx="12" cy="12" r="2.5" fill="#A5B4FC"/>
                </svg>
              </div>
              <span className="font-bold tracking-tight text-base sm:text-lg text-dark-text font-mono">
                TOOLBOX
              </span>
            </Link>
          </div>

          {/* Center: Navigation Pills */}
          <nav className="hidden md:flex items-center p-1 rounded-full bg-dark-surface1/70 border border-dark-border">
            {navLinks.map((link) => {
              const active = isLinkActive(link);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={(e) => handleNavClick(link, e)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-150 ${
                    active
                      ? 'bg-dark-surface2 text-dark-text shadow-sm'
                      : 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-surface2/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Quick Search, Theme Toggle, Preferences */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-dark-surface1 dark:bg-dark-surface1 border border-dark-border dark:border-dark-border text-dark-text-muted hover:text-dark-text hover:border-dark-border-hover transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quick Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-mono bg-dark-surface2 text-dark-text-muted rounded border border-dark-border">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              className="p-2 rounded-lg bg-dark-surface1 dark:bg-dark-surface1 border border-dark-border dark:border-dark-border text-dark-text-secondary hover:text-dark-text hover:border-dark-border-hover transition"
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-brand-indigo" />
              ) : (
                <Sun className="w-4 h-4 text-brand-amber" />
              )}
            </button>

            {/* Preferences / Settings button */}
            <button
              onClick={() => setIsPrefOpen(true)}
              title="Workspace Preferences"
              className="p-2 rounded-lg bg-dark-surface1 dark:bg-dark-surface1 border border-dark-border dark:border-dark-border text-dark-text-secondary hover:text-dark-text hover:border-dark-border-hover transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 md:hidden rounded-lg bg-dark-surface1 dark:bg-dark-surface1 border border-dark-border text-dark-text-secondary"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-dark-border bg-dark-surface1 p-4 space-y-2">
            {navLinks.map((link) => {
              const active = isLinkActive(link);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    handleNavClick(link, e);
                  }}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                    active
                      ? 'bg-dark-surface2 text-dark-text'
                      : 'text-dark-text-secondary hover:bg-dark-surface2 hover:text-dark-text'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Command Palette Modal */}
      <QuickSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      {/* Preferences Modal */}
      <PreferencesModal 
        isOpen={isPrefOpen} 
        onClose={() => setIsPrefOpen(false)} 
      />
    </>
  );
};
