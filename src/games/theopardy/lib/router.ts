import { useSyncExternalStore } from 'react';

/** Hash routing keeps the app backend-free and lets the built files open from any folder. */
export const ROUTES = ['/', '/new', '/host', '/game', '/join', '/remote', '/buzzer'] as const;
export type Route = (typeof ROUTES)[number];

/** Screens that fill the whole display with no app header. */
export const FULL_BLEED_ROUTES: readonly Route[] = ['/game', '/buzzer'];

function current(): Route {
  const raw = (typeof window === 'undefined' ? '' : window.location.hash).replace(/^#/, '') || '/';
  const path = raw.split('?')[0];
  return (ROUTES as readonly string[]).includes(path) ? (path as Route) : '/';
}

function subscribe(listener: () => void): () => void {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, current, () => '/' as Route);
}

export function navigate(route: Route, params?: Record<string, string>): void {
  const query = params ? `?${new URLSearchParams(params).toString()}` : '';
  if (current() === route && !query) return;
  window.location.hash = `${route}${query}`;
  window.scrollTo({ top: 0 });
}

/** Reads a query parameter from the hash, e.g. #/join?code=FGH2K. */
export function getHashParam(name: string): string | null {
  const hash = typeof window === 'undefined' ? '' : window.location.hash;
  const query = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
  return new URLSearchParams(query).get(name);
}

export function routeUrl(route: Route, params?: Record<string, string>): string {
  const query = params ? `?${new URLSearchParams(params).toString()}` : '';
  return `${window.location.origin}${window.location.pathname}#${route}${query}`;
}

/** Typed addresses like "/join" (no "#") open the matching screen. */
export function adoptTypedPath(): void {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  if (!path || path === '/index.html') return;
  const route = (ROUTES as readonly string[]).includes(path) ? path : '/';
  const hash = window.location.hash && window.location.hash !== '#' ? window.location.hash : `#${route}${window.location.search}`;
  window.history.replaceState(null, '', `/${hash}`);
}
