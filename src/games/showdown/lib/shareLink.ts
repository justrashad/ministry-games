import type { QuestionSet } from '../types';
import { parseQuestionSetText, toExport, type ImportResult } from '../engine/validation';

/*
 * Question sets travel inside the link itself (after the #), so sharing needs
 * no server and the contents are never sent to one: browsers don't transmit
 * the part of a URL after the #.
 * Format: "z" + base64url(deflate-raw(json)) when compression is available,
 * otherwise "j" + base64url(json).
 */

export const LINK_WARN_LENGTH = 60_000;

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((text.length + 3) % 4);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const response = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream));
  return new Uint8Array(await response.arrayBuffer());
}

const canCompress = () => typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';

export async function encodeSetPayload(set: QuestionSet): Promise<string> {
  const { exportedAt: _omit, ...data } = toExport(set);
  void _omit;
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  if (canCompress()) {
    try {
      return `z${toBase64Url(await pipe(bytes, new CompressionStream('deflate-raw')))}`;
    } catch {
      /* fall back to uncompressed */
    }
  }
  return `j${toBase64Url(bytes)}`;
}

export async function decodeSetPayload(payload: string): Promise<ImportResult> {
  const fail = (error: string): ImportResult => ({ ok: false, error, details: [] });
  if (!payload || payload.length < 2) return fail('This link is missing its question set.');
  let bytes: Uint8Array;
  try {
    bytes = fromBase64Url(payload.slice(1));
  } catch {
    return fail('This link looks damaged. Ask for the link to be sent again, and make sure it was copied completely.');
  }
  if (payload[0] === 'z') {
    if (!canCompress()) return fail('This browser is too old to open shared links. Update it, or ask for an exported file instead.');
    try {
      bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
    } catch {
      return fail('This link looks damaged. Ask for the link to be sent again, and make sure it was copied completely.');
    }
  } else if (payload[0] !== 'j') {
    return fail('This link was not made by Ministry Showdown.');
  }
  return parseQuestionSetText(new TextDecoder().decode(bytes));
}

export function shareLinkFor(payload: string): string {
  return `${window.location.origin}${window.location.pathname}#/import?d=${payload}`;
}
