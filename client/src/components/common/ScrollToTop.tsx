import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Resets scroll to the top on every NEW navigation (clicking a link), so each
 * page starts at the top instead of wherever the previous page was scrolled.
 * Skips browser back/forward (navigationType 'POP'), where the user expects
 * their previous scroll position to be restored.
 *
 * Note: this fires on pathname change only — not on search-param changes — so
 * in-page filtering/sorting (e.g. on the products page) is left untouched.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navType]);

  return null;
}
