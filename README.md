# TOOLBOX

> **"Simple tools for everyday tasks."**

Fast, focused utilities that run entirely inside your browser. No accounts, zero trackers, and complete offline capability where applicable.

Built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Framer Motion**, faithfully recreating the **Obsidian Kinetic** developer-tool design system from Google Stitch.

---

## 🛠️ The 9 Utilities

| Tool | Description | Highlights |
|---|---|---|
| **Web Extractor** | Extract clean markdown articles, headings, links, images, and CSS selectors from public URLs. | Instant article reader & selector extraction |
| **Weather** | Atmospheric conditions, hourly projections, multi-day forecasts, wind, pressure, and humidity. | Search any city with instant weather cards |
| **Issue Tracker** | Task manager with status columns, priority ranks, custom tags, and search. | Full backlog management with auto-save |
| **Calculator** | Arithmetic calculator with running calculation history tape and full keyboard input. | Precision math operations & tape ledger |
| **GitHub Profile** | Inspect public developer bios, follower counts, and repositories with stars/forks sorting. | Instant repository search & developer stats |
| **Temperature Converter** | Instant scalar conversion between Celsius, Fahrenheit, and Kelvin with absolute zero validation. | Real-time thermal scale conversions |
| **Countdown** | Accurate target timestamp countdowns with pause/resume and completion fanfare. | Multi-event timers with audio alerts & confetti |
| **Alarm Clock** | Custom browser alarms with day scheduling, snooze, and active audio alert tones. | Repeatable schedules & notifications |
| **Currency Tracker** | Live fiat exchange rates, conversion calculations, and comparison matrices. | Global currency conversion calculator |

---

## 🎨 Design Philosophy: Obsidian Kinetic

- **Dual-Mode Theming**: Seamless switching between Obsidian Dark (`#0a0b0e`) and Clean Light (`#f8fafc`) modes, with system preference auto-detection.
- **Modern Utility Aesthetic**: Compact high-density navigation, crisp typography (`JetBrains Mono`), and subtle neon accent colors (Emerald, Cyan, Indigo, Purple, Amber).
- **Universal Command Palette**: Press `⌘K` or `Ctrl+K` from any screen to instantly search tools, switch themes, or jump to utilities.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested with Node.js v24 LTS)
- npm 9+

### Installation & Development
```bash
# Clone or navigate to the repository
cd toolbox

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will start locally at `http://localhost:5173/`.

### Production Build
```bash
npm run build
```
Creates an optimized static production bundle in `dist/`.

### Deployment to Vercel
The repository includes `vercel.json` configured with SPA client-side routing rewrites:
```bash
# Deploy with Vercel CLI
npx vercel --prod
```
Or connect the repository to your Vercel Dashboard with the default Vite preset:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
