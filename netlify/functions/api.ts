import { lemonSqueezyClient, route, type Route } from '../../server/core/licensing';
import type { TitleContent } from '../../server/core/licensing';
import { SHOWDOWN_TITLE } from '../../server/showdown/title';
import { THEOPARDY_TITLE } from '../../server/theopardy/title';

/** Every title this function can serve. The site's TITLE setting picks one; with none set it is Ministry Showdown. */
const TITLES: Record<string, TitleContent> = {
  showdown: SHOWDOWN_TITLE,
  theopardy: THEOPARDY_TITLE,
};

const ROUTES: Record<string, Route> = {
  '/api/activate': 'activate',
  '/api/validate': 'validate',
  '/api/deactivate': 'deactivate',
  '/api/pack': 'pack',
  '/api/catalog': 'catalog',
};

const MAX_BODY_BYTES = 4096;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export default async (req: Request): Promise<Response> => {
  const name = ROUTES[new URL(req.url).pathname];
  if (!name) return json(404, { ok: false, error: 'Unknown request.' });
  if (name !== 'catalog' && req.method !== 'POST') return json(405, { ok: false, error: 'Use POST.' });
  let body: Record<string, unknown> = {};
  if (req.method === 'POST') {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) return json(413, { ok: false, error: 'Request too large.' });
    try {
      const parsed: unknown = text ? JSON.parse(text) : {};
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) body = parsed as Record<string, unknown>;
    } catch {
      return json(400, { ok: false, error: 'Invalid request.' });
    }
  }
  const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
  const title = TITLES[(env.TITLE ?? '').trim() || 'showdown'];
  if (!title) {
    console.error('Store configuration error: unknown TITLE', env.TITLE);
    return json(503, { ok: false, error: 'The store is not open yet.' });
  }
  const result = await route(name, body, env, lemonSqueezyClient(), title);
  // Never expose configuration details to visitors; they are logged for the owner instead.
  if (result.body.configError) {
    console.error('Store configuration error:', result.body.configError);
    delete result.body.configError;
  }
  return json(result.status, result.body);
};

// Netlify reads this statically at build time, so the paths must be written out literally.
export const config = {
  path: ['/api/activate', '/api/validate', '/api/deactivate', '/api/pack', '/api/catalog'],
};
