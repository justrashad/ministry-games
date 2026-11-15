import { useSyncExternalStore } from 'react';

/** Hash routing keeps the app backend-free and lets the built files open from any folder. */
export const ROUTES = ['/', '/new', '/host', '/game', '/join', '/remote', '/buzzer', '/player', '/import', '/print', '/store', '/legal', '/about', '/gift', '/free-printable', '/questions', '/settings', '/history', '/how-to-play'] as const;

/** Screens that fill the whole display with no app header. */
export const FULL_BLEED_ROUTES: readonly Route[] = ['/game', '/buzzer', '/player', '/print'];
export type Route = (typeof ROUTES)[number];

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

export function joinUrl(code: string): string {
  return `${window.location.origin}${window.location.pathname}#/join?code=${encodeURIComponent(code)}`;
}

/**
 * Lemon Squeezy's confirmation button can't link to a "#/…" address, so buyers arrive at
 * "/?key=XXXX". Move that key onto the Store page (#/store?key=XXXX), where it's
 * activated automatically, and clear it from the address bar.
 */
export function consumePurchaseLink(): void {
  if (typeof window === 'undefined') return;
  // Typed addresses like "ministryshowdown.live/join" or "/join?code=FGH2K" open the matching screen.
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  if (path && path !== '/index.html') {
    const route = (ROUTES as readonly string[]).includes(path) ? path : '/';
    const hash = window.location.hash && window.location.hash !== '#' ? window.location.hash : `#${route}${window.location.search}`;
    window.history.replaceState(null, '', `/${hash}`);
    return;
  }
  const params = new URLSearchParams(window.location.search);
  // Plain links for places that reject "#" addresses, e.g. "/?page=legal" opens the legal page.
  const page = params.get('page')?.trim();
  if (page && (ROUTES as readonly string[]).includes(`/${page}`)) {
    params.delete('page');
    const rest = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}#/${page}`);
    return;
  }
  const key = params.get('key')?.trim();
  if (!key) return;
  params.delete('key');
  const rest = params.toString();
  const clean = `${window.location.pathname}${rest ? `?${rest}` : ''}#/store?key=${encodeURIComponent(key)}`;
  window.history.replaceState(null, '', clean);
}

export function gameScreenUrl(): string {
  return `${window.location.origin}${window.location.pathname}${window.location.search}#/game`;
}

/** Opens (or focuses) the TV window. Returns false if a popup blocker stopped it. */
export function openGameScreen(): boolean {
  const win = window.open(gameScreenUrl(), 'survey-showdown-game-screen');
  if (!win) return false;
  win.focus();
  return true;
}
