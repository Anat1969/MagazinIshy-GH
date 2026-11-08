import { useEffect, useState } from 'react';

// Hash routes so "copy link" always carries the current view, and so the relative
// build in app/ works from raw.githack.
export type Route =
  | { page: 'home' }
  | { page: 'cases'; open: string | null }
  | { page: 'issue' }
  | { page: 'creations' }
  | { page: 'article'; id: string };

export function parseHash(): Route {
  const h = decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));
  const [page, id] = h.split('/');
  if (page === 'a' && id) return { page: 'article', id };
  if (page === 'cases') return { page: 'cases', open: id || null };
  if (page === 'issue') return { page: 'issue' };
  if (page === 'creations') return { page: 'creations' };
  return { page: 'home' };
}

export function useRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const on = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export const go = (path: string) => {
  window.location.hash = path;
};
