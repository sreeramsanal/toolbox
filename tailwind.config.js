/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: 'rgb(var(--bg-rgb) / <alpha-value>)',
          surface1: 'rgb(var(--surface-1-rgb) / <alpha-value>)',
          surface2: 'rgb(var(--surface-2-rgb) / <alpha-value>)',
          surface3: 'rgb(var(--surface-3-rgb) / <alpha-value>)',
          border: 'rgb(var(--border-rgb) / <alpha-value>)',
          'border-hover': 'rgb(var(--border-hover-rgb) / <alpha-value>)',
          text: 'rgb(var(--text-primary-rgb) / <alpha-value>)',
          'text-secondary': 'rgb(var(--text-secondary-rgb) / <alpha-value>)',
          'text-muted': 'rgb(var(--text-muted-rgb) / <alpha-value>)',
        },
        light: {
          bg: '#FAFAFA',
          surface1: '#FFFFFF',
          surface2: '#F3F4F6',
          surface3: '#E5E7EB',
          border: '#E2E8F0',
          'border-hover': '#CBD5E1',
          text: '#0F172A',
          'text-secondary': '#334155',
          'text-muted': '#64748B',
        },
        brand: {
          indigo: 'var(--brand-indigo, #6366F1)',
          'indigo-light': '#4F46E5',
          cyan: '#06B6D4',
          emerald: '#10B981',
          crimson: '#EF4444',
          amber: '#F59E0B',
          purple: '#A855F7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      boxShadow: {
        'glow-indigo': '0 0 20px -3px rgba(99, 102, 241, 0.35)',
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.35)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
      }
    },
  },
  plugins: [],
}
