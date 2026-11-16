/* ==========================================================================
   DARBAK — Theme Controller
   Handles light/dark mode toggle and persistence.
   The actual theme *application* happens in an inline <head> script
   (to prevent FOUC). This module only wires up the toggle button.
   ========================================================================== */

const STORAGE_KEY = 'darbak:theme';

/**
 * Get current theme from the DOM.
 * @returns {'light'|'dark'}
 */
function getCurrentTheme() {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'dark' ? 'dark' : 'light';
}

/**
 * Update the toggle button's ARIA state and label.
 * @param {HTMLButtonElement} btn
 * @param {'light'|'dark'} theme
 */
function syncButton(btn, theme) {
  const isDark = theme === 'dark';
  btn.setAttribute('aria-pressed', String(isDark));
  btn.setAttribute(
    'aria-label',
    isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الليلي'
  );
  btn.setAttribute(
    'title',
    isDark ? 'الوضع الفاتح' : 'الوضع الليلي'
  );
}

/**
 * Persist the theme to localStorage (best-effort).
 * @param {'light'|'dark'} theme
 */
function persist(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {
    /* ignore: localStorage may be unavailable */
  }
}

/**
 * Initialize the theme toggle.
 * Safe to call multiple times — will only bind once.
 */
export function initTheme() {
  const btn = document.querySelector('[data-theme-toggle]');
  if (!btn || btn.dataset.themeBound === 'true') return;

  btn.dataset.themeBound = 'true';

  // Sync on initial load
  syncButton(btn, getCurrentTheme());

  // Toggle on click
  btn.addEventListener('click', () => {
    const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    persist(next);
    syncButton(btn, next);
  });

  // Follow OS preference changes ONLY if user has never chosen manually
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemChange = (e) => {
    let hasUserChoice = false;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      hasUserChoice = stored === 'light' || stored === 'dark';
    } catch (err) { /* ignore */ }

    if (hasUserChoice) return;

    const next = e.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    syncButton(btn, next);
  };

  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', onSystemChange);
  } else if (typeof mql.addListener === 'function') {
    // Safari < 14 fallback
    mql.addListener(onSystemChange);
  }
}
