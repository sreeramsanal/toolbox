import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { WebExtractorPage } from './pages/WebExtractorPage';
import { WeatherPage } from './pages/WeatherPage';
import { IssueTrackerPage } from './pages/IssueTrackerPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { TemperaturePage } from './pages/TemperaturePage';
import { CountdownPage } from './pages/CountdownPage';
import { AlarmPage } from './pages/AlarmPage';
import { CurrencyPage } from './pages/CurrencyPage';
import { GitHubProfilePage } from './pages/GitHubProfilePage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ScrollToTop } from './components/ScrollToTop';

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-dark-bg text-dark-text dark:bg-dark-bg dark:text-dark-text transition-colors duration-200">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tools" element={<HomePage />} />
              <Route path="/web-extractor" element={<WebExtractorPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/issues" element={<IssueTrackerPage />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/temperature" element={<TemperaturePage />} />
              <Route path="/countdown" element={<CountdownPage />} />
              <Route path="/alarm" element={<AlarmPage />} />
              <Route path="/currency" element={<CurrencyPage />} />
              <Route path="/github" element={<GitHubProfilePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
