import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToToolsSection } from '../utils/scroll';

/**
 * Ensures page scroll is reset to top on route change,
 * or scrolled to targeted hash with sticky header clearance.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash === '#tools' || pathname === '/tools') {
      const timer = setTimeout(() => {
        scrollToToolsSection();
      }, 60);
      return () => clearTimeout(timer);
    } else if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        const timer = setTimeout(() => {
          const navbarHeight = 84;
          const y = element.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        }, 60);
        return () => clearTimeout(timer);
      }
    } else {
      // Regular route change: immediately scroll to top
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return null;
};
