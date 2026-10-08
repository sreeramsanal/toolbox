import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Globe,
  CloudSun, 
  CheckSquare, 
  Calculator as CalcIcon, 
  Thermometer, 
  Hourglass, 
  Bell, 
  DollarSign, 
  ArrowRight, 
  ArrowUpRight,
  Zap, 
  Lock, 
  LayoutGrid 
} from 'lucide-react';
import { GithubIcon } from '../components/GithubIcon';
import { getCachedWeather } from '../services/weatherService';
import { getStoredIssues, getStoredCalcHistory, getStoredCountdowns, getStoredAlarms } from '../utils/localStorage';
import { getCachedGitHubUser } from '../services/githubService';
import { getCachedExchangeRates } from '../services/currencyService';
import { getCachedWebExtraction } from '../services/webExtractorService';
import { scrollToToolsSection } from '../utils/scroll';

type CategoryFilter = 'all' | 'calc' | 'productivity' | 'dev';

interface ToolTheme {
  stripeBg: string;
  iconContainerClass: string;
  badgeClass: string;
  dotClass: string;
  launchButtonClass: string;
}

const TOOL_THEMES: Record<string, ToolTheme> = {
  'web-extractor': {
    stripeBg: 'bg-cyan-500',
    iconContainerClass: 'bg-cyan-50 text-cyan-600 border-cyan-200/60 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30',
    dotClass: 'bg-cyan-500',
    launchButtonClass: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30',
  },
  'weather': {
    stripeBg: 'bg-sky-500',
    iconContainerClass: 'bg-sky-50 text-sky-600 border-sky-200/60 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30',
    dotClass: 'bg-sky-500',
    launchButtonClass: 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30',
  },
  'issues': {
    stripeBg: 'bg-emerald-500',
    iconContainerClass: 'bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
    dotClass: 'bg-emerald-500',
    launchButtonClass: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  'calculator': {
    stripeBg: 'bg-indigo-500',
    iconContainerClass: 'bg-indigo-50 text-indigo-600 border-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30',
    dotClass: 'bg-indigo-500',
    launchButtonClass: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30',
  },
  'github': {
    stripeBg: 'bg-purple-500',
    iconContainerClass: 'bg-purple-50 text-purple-600 border-purple-200/60 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30',
    dotClass: 'bg-purple-500',
    launchButtonClass: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
  },
  'temperature': {
    stripeBg: 'bg-amber-500',
    iconContainerClass: 'bg-amber-50 text-amber-600 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
    dotClass: 'bg-amber-500',
    launchButtonClass: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
  },
  'countdown': {
    stripeBg: 'bg-teal-500',
    iconContainerClass: 'bg-teal-50 text-teal-600 border-teal-200/60 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/30',
    dotClass: 'bg-teal-500',
    launchButtonClass: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:hover:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30',
  },
  'alarm': {
    stripeBg: 'bg-rose-500',
    iconContainerClass: 'bg-rose-50 text-rose-600 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
    dotClass: 'bg-rose-500',
    launchButtonClass: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30',
  },
  'currency': {
    stripeBg: 'bg-emerald-500',
    iconContainerClass: 'bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
    dotClass: 'bg-emerald-500',
    launchButtonClass: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
  },
};

export const HomePage: React.FC = () => {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const navigate = useNavigate();
  const location = useLocation();

  // Local live state previews
  const [webExtractorPreview, setWebExtractorPreview] = useState('Single-URL reader & parser');
  const [weatherPreview, setWeatherPreview] = useState('Check atmospheric forecast');
  const [issuesPreview, setIssuesPreview] = useState('No active tasks');
  const [calcPreview, setCalcPreview] = useState('Ready for calculations');
  const [githubPreview, setGithubPreview] = useState('Search developer profiles');
  const [countdownPreview, setCountdownPreview] = useState('No active countdowns');
  const [alarmPreview, setAlarmPreview] = useState('No active alarms');
  const [currencyPreview, setCurrencyPreview] = useState('USD / EUR / GBP / INR');

  useEffect(() => {
    // Web Extractor
    const cachedWeb = getCachedWebExtraction();
    if (cachedWeb) {
      setWebExtractorPreview(`${cachedWeb.domain} (${cachedWeb.wordCount.toLocaleString()} words)`);
    } else {
      setWebExtractorPreview('Single-URL reader & parser');
    }

    // Weather
    const cachedWeather = getCachedWeather();
    if (cachedWeather) {
      setWeatherPreview(`${cachedWeather.current.temperature}°C • ${cachedWeather.location.name}`);
    } else {
      setWeatherPreview('Check atmospheric forecast');
    }

    // Issues
    const issues = getStoredIssues();
    const openCount = issues.filter(i => i.status === 'OPEN').length;
    const inProgressCount = issues.filter(i => i.status === 'IN PROGRESS').length;
    if (issues.length > 0) {
      setIssuesPreview(`${openCount} open • ${inProgressCount} in progress`);
    } else {
      setIssuesPreview('No active tasks');
    }

    // Calculator
    const history = getStoredCalcHistory();
    if (history.length > 0) {
      const last = history[history.length - 1];
      setCalcPreview(`${last.expression} = ${last.result}`);
    } else {
      setCalcPreview('Ready for calculations');
    }

    // GitHub
    const ghUser = getCachedGitHubUser();
    if (ghUser) {
      setGithubPreview(`@${ghUser.login} • ${ghUser.public_repos} repos`);
    } else {
      setGithubPreview('Search developer profiles');
    }

    // Countdowns
    const countdowns = getStoredCountdowns();
    if (countdowns.length > 0) {
      const active = countdowns[0];
      const diff = Math.max(0, active.targetTimestamp - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setCountdownPreview(`${active.title}: ${days}d ${hours}h left`);
    } else {
      setCountdownPreview('No active countdowns');
    }

    // Alarms
    const alarms = getStoredAlarms();
    const enabledAlarm = alarms.find(a => a.enabled);
    if (enabledAlarm) {
      setAlarmPreview(`Next: ${enabledAlarm.time} (${enabledAlarm.label})`);
    } else {
      setAlarmPreview('No active alarms');
    }

    // Currency
    const cur = getCachedExchangeRates();
    if (cur && cur.rates['INR']) {
      const inrRate = (cur.rates['INR'] * 100).toFixed(2);
      setCurrencyPreview(`100 USD = ₹${inrRate} INR`);
    } else {
      setCurrencyPreview('USD / EUR / GBP / INR');
    }
  }, []);

  // Handle smooth scroll when navigating to #tools or /tools
  useEffect(() => {
    if (location.hash === '#tools' || location.pathname === '/tools') {
      const timer = setTimeout(() => {
        scrollToToolsSection();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  const tools = [
    {
      id: 'web-extractor',
      title: 'Web Extractor',
      badge: 'Extractor',
      category: 'dev',
      description: 'Extract useful text, headings, links, images, and CSS selectors from public web pages.',
      previewLabel: 'Recent Target',
      previewValue: webExtractorPreview,
      path: '/web-extractor',
      icon: Globe,
      iconColor: 'text-brand-emerald',
      iconBg: 'bg-brand-emerald/10',
    },
    {
      id: 'weather',
      title: 'Weather',
      badge: 'Forecast',
      category: 'productivity',
      description: 'Check current conditions, barometric metrics, and localized atmospheric forecasts.',
      previewLabel: 'Location Preview',
      previewValue: weatherPreview,
      path: '/weather',
      icon: CloudSun,
      iconColor: 'text-brand-cyan',
      iconBg: 'bg-brand-cyan/10',
    },
    {
      id: 'issues',
      title: 'Issue Tracker',
      badge: 'Tasks',
      category: 'productivity',
      description: 'Track tasks, blockers, and bugs directly in browser memory without sign-ins.',
      previewLabel: 'Task Ledger',
      previewValue: issuesPreview,
      path: '/issues',
      icon: CheckSquare,
      iconColor: 'text-brand-purple',
      iconBg: 'bg-brand-purple/10',
    },
    {
      id: 'calculator',
      title: 'Calculator',
      badge: 'Math',
      category: 'calc',
      description: 'Quick high-precision mathematical operations without interrupting flow.',
      previewLabel: 'Recent Tape',
      previewValue: calcPreview,
      path: '/calculator',
      icon: CalcIcon,
      iconColor: 'text-brand-emerald',
      iconBg: 'bg-brand-emerald/10',
    },
    {
      id: 'github',
      title: 'GitHub Profile',
      badge: 'Developer',
      category: 'dev',
      description: 'Explore public developer profiles, repo stars, contribution maps, and releases.',
      previewLabel: 'Target Snapshot',
      previewValue: githubPreview,
      path: '/github',
      icon: GithubIcon,
      iconColor: 'text-brand-indigo',
      iconBg: 'bg-brand-indigo/10',
    },
    {
      id: 'temperature',
      title: 'Temperature',
      badge: 'Converter',
      category: 'calc',
      description: 'Convert instantly between Celsius, Fahrenheit, and Kelvin scientific units.',
      previewLabel: 'Standard Bench',
      previewValue: '25°C = 77.00°F = 298.15K',
      path: '/temperature',
      icon: Thermometer,
      iconColor: 'text-brand-cyan',
      iconBg: 'bg-brand-cyan/10',
    },
    {
      id: 'countdown',
      title: 'Countdown',
      badge: 'Timer',
      category: 'productivity',
      description: 'Countdown precisely to product releases, project launches, or deadlines.',
      previewLabel: 'Active Timer',
      previewValue: countdownPreview,
      path: '/countdown',
      icon: Hourglass,
      iconColor: 'text-brand-emerald',
      iconBg: 'bg-brand-emerald/10',
    },
    {
      id: 'alarm',
      title: 'Alarm',
      badge: 'Clock',
      category: 'productivity',
      description: 'Set lightweight acoustic alerts that trigger on schedule.',
      previewLabel: 'Active Alert',
      previewValue: alarmPreview,
      path: '/alarm',
      icon: Bell,
      iconColor: 'text-brand-purple',
      iconBg: 'bg-brand-purple/10',
    },
    {
      id: 'currency',
      title: 'Currency',
      badge: 'Exchange',
      category: 'calc',
      description: 'Convert international FX pairs with zero spreads and clean numeric ratios.',
      previewLabel: 'Spot Rates',
      previewValue: currencyPreview,
      path: '/currency',
      icon: DollarSign,
      iconColor: 'text-brand-cyan',
      iconBg: 'bg-brand-cyan/10',
    },
  ];

  const filteredTools = tools.filter(t => {
    if (filter === 'all') return true;
    return t.category === filter;
  });

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Hero Section with Ambient Gradient & Dot Grid Texture */}
      <section className="relative isolate w-full overflow-hidden pt-20 pb-16 flex flex-col items-center text-center">
        {/* Light Mode Ambient Gradient */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 dark:hidden"
          style={{
            background: 'radial-gradient(ellipse 85% 70% at 50% 32%, rgba(99, 102, 241, 0.22) 0%, rgba(56, 189, 248, 0.16) 35%, rgba(240, 244, 255, 0.5) 60%, transparent 85%)',
          }}
        />

        {/* Dark Mode Ambient Gradient */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 hidden dark:block"
          style={{
            background: 'radial-gradient(ellipse 85% 70% at 50% 32%, rgba(99, 102, 241, 0.32) 0%, rgba(6, 182, 212, 0.18) 38%, rgba(11, 12, 14, 0) 80%)',
          }}
        />

        {/* Subtle Tech Dot Grid Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 opacity-40 dark:opacity-25"
          style={{
            backgroundImage: 'radial-gradient(rgba(100, 116, 139, 0.35) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 35%, black 20%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 35%, black 20%, transparent 80%)',
          }}
        />

        {/* Hero Content Container - elevated at z-10 */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col items-center">
          {/* Hero Title */}
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-dark-text max-w-3xl leading-[1.1] mb-6">
            Simple tools. <br />
            Built for <span className="text-brand-indigo dark:text-brand-indigo">everyday use.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-dark-text-secondary max-w-2xl leading-relaxed mb-8 px-4">
            Fast, focused utilities that work right in your browser. Zero setup, zero accounts, zero analytics bloat.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#tools"
              onClick={(e) => {
                e.preventDefault();
                scrollToToolsSection();
                window.history.pushState(null, '', '/#tools');
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-indigo hover:bg-brand-indigo/90 text-white text-xs font-semibold shadow-glow-indigo transition"
            >
              <span>Explore tools</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => {
                scrollToToolsSection();
                window.history.pushState(null, '', '/#tools');
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-dark-surface1 border border-slate-200 dark:border-dark-border text-slate-700 dark:text-dark-text hover:bg-slate-50 dark:hover:bg-dark-surface2 text-xs font-medium transition shadow-sm"
            >
              <span>View all tools</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-dark-surface2 border border-slate-200 dark:border-dark-border text-slate-500 dark:text-dark-text-muted">⌘T</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200/80 dark:border-dark-border scroll-mt-24">
        
        {/* Section Header & Category Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-dark-text">Tools</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase bg-slate-100 dark:bg-dark-surface2 text-slate-700 dark:text-dark-text-secondary rounded-full border border-slate-200 dark:border-dark-border font-semibold">
                {tools.length} UTILITIES READY
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-dark-text-muted">
              Everything you need, without the clutter. High-frequency workspace utilities.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 dark:bg-dark-surface1 border border-slate-200 dark:border-dark-border">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                filter === 'all' 
                  ? 'bg-white dark:bg-dark-surface2 text-slate-900 dark:text-dark-text shadow-sm border border-slate-200/80 dark:border-transparent' 
                  : 'text-slate-600 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-dark-text'
              }`}
            >
              All ({tools.length})
            </button>
            <button
              onClick={() => setFilter('calc')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                filter === 'calc' 
                  ? 'bg-white dark:bg-dark-surface2 text-slate-900 dark:text-dark-text shadow-sm border border-slate-200/80 dark:border-transparent' 
                  : 'text-slate-600 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-dark-text'
              }`}
            >
              Calculators & Converters
            </button>
            <button
              onClick={() => setFilter('productivity')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                filter === 'productivity' 
                  ? 'bg-white dark:bg-dark-surface2 text-slate-900 dark:text-dark-text shadow-sm border border-slate-200/80 dark:border-transparent' 
                  : 'text-slate-600 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-dark-text'
              }`}
            >
              Productivity & Timers
            </button>
            <button
              onClick={() => setFilter('dev')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                filter === 'dev' 
                  ? 'bg-white dark:bg-dark-surface2 text-slate-900 dark:text-dark-text shadow-sm border border-slate-200/80 dark:border-transparent' 
                  : 'text-slate-600 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-dark-text'
              }`}
            >
              Dev & Web
            </button>
          </div>
        </div>

        {/* 9 Tool Cards Grid (4 columns desktop, 2 tablet, 1 mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTools.map((t) => {
            const Icon = t.icon;
            const theme = TOOL_THEMES[t.id] || TOOL_THEMES['calculator'];
            return (
              <div
                key={t.id}
                onClick={() => navigate(t.path)}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-dark-surface1 border border-slate-200/90 dark:border-dark-border hover:border-slate-300 dark:hover:border-dark-border-hover transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl overflow-hidden"
              >
                {/* Top colored accent stripe */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] ${theme.stripeBg}`} />

                <div>
                  {/* Top: Icon & Badge */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`p-2.5 rounded-xl border ${theme.iconContainerClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border flex items-center gap-1.5 ${theme.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${theme.dotClass}`}></span>
                      <span>{t.badge}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-dark-text mb-1 group-hover:text-brand-indigo transition-colors tracking-tight">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-dark-text-muted leading-relaxed line-clamp-2 mb-4">
                    {t.description}
                  </p>
                </div>

                {/* Bottom: Live Preview & Launch Link */}
                <div className="pt-2">
                  <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-dark-surface2/60 border border-slate-100 dark:border-dark-border/60 mb-3.5">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-dark-text-muted mb-1 flex items-center justify-between">
                      <span>{t.previewLabel}</span>
                      <span className="text-[9px] text-brand-emerald font-semibold">Local</span>
                    </div>
                    <div className="text-xs font-mono font-semibold text-slate-800 dark:text-dark-text truncate">
                      {t.previewValue}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium font-mono border transition-all duration-150 ${theme.launchButtonClass}`}
                    >
                      <span>Launch Tool</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <div className="p-2 rounded-xl border border-slate-200 dark:border-dark-border text-slate-400 dark:text-dark-text-muted group-hover:text-slate-700 dark:group-hover:text-dark-text group-hover:border-slate-300 dark:group-hover:border-dark-border-hover transition">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architectural Principles Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/80 dark:border-dark-border">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-[11px] font-mono uppercase tracking-widest text-brand-indigo mb-2 font-semibold">
            CORE PRINCIPLES
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-dark-text mb-3">
            Small tools. Zero friction.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-dark-text-muted leading-relaxed">
            Built with modern web standards for immediate utility. Zero tracking or clutter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Fast */}
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface1 border border-slate-200/90 dark:border-dark-border flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-brand-indigo/10 text-brand-indigo">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-dark-text-muted">01 // EFFICIENCY</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-dark-text mb-2">FAST</h3>
              <p className="text-xs text-slate-600 dark:text-dark-text-muted leading-relaxed mb-6">
                Designed to get you in, get the job done, and get out. Instant responsiveness without waiting.
              </p>
            </div>
            <div className="text-[11px] font-mono text-brand-emerald flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></span>
              Immediate Responsiveness
            </div>
          </div>

          {/* Card 2: Private */}
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface1 border border-slate-200/90 dark:border-dark-border flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-brand-cyan/10 text-brand-cyan">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-dark-text-muted">02 // INTEGRITY</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-dark-text mb-2">PRIVATE</h3>
              <p className="text-xs text-slate-600 dark:text-dark-text-muted leading-relaxed mb-6">
                Useful tools designed for speed without unnecessary accounts or logins. Your work stays saved right on your device.
              </p>
            </div>
            <div className="text-[11px] font-mono text-brand-cyan flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></span>
              Always Ready
            </div>
          </div>

          {/* Card 3: Simple */}
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface1 border border-slate-200/90 dark:border-dark-border flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-brand-emerald/10 text-brand-emerald">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-dark-text-muted">03 // CLARITY</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-dark-text mb-2">SIMPLE</h3>
              <p className="text-xs text-slate-600 dark:text-dark-text-muted leading-relaxed mb-6">
                No complicated workflows, just focused single-purpose utilities engineered with clean, intuitive interfaces.
              </p>
            </div>
            <div className="text-[11px] font-mono text-brand-emerald flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></span>
              Distraction-Free
            </div>
          </div>

        </div>
      </section>

      {/* Keyboard Hotkey Tip Banner */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-white dark:bg-dark-surface2/50 border border-slate-200/90 dark:border-dark-border text-xs text-slate-600 dark:text-dark-text-muted font-mono gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-brand-indigo/15 text-brand-indigo text-[10px] uppercase font-bold">HOTKEY</span>
            <span>Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-dark-surface1 rounded border border-slate-200 dark:border-dark-border text-slate-800 dark:text-dark-text font-bold">⌘K</kbd> anywhere to trigger quick search or jump to tools.</span>
          </div>
          <div className="text-brand-emerald text-[11px] font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></span>
            READY TO USE
          </div>
        </div>
      </div>

    </div>
  );
};
