/**
 * Smoothly scrolls to the #tools section with clearance for the sticky navbar.
 */
export const scrollToToolsSection = () => {
  const el = document.getElementById('tools');
  if (el) {
    const navbarHeight = 84; // 64px sticky navbar + 20px comfortable breathing space
    const y = el.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }
};
