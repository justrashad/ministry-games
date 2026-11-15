/** Room codes skip look-alike characters (0/O, 1/I/L) so they are easy to read off a TV. */
export const ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LENGTH = 5;
const PEER_PREFIX = 'ministry-showdown-v1-';

export function generateRoomCode(rng: () => number = Math.random): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i += 1) code += ROOM_ALPHABET[Math.floor(rng() * ROOM_ALPHABET.length)];
  return code;
}

/** Uppercases and strips spaces/dashes so "fig 42-q" style typing still works. */
export function normalizeRoomCode(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, '');
}

export function isValidRoomCode(code: string): boolean {
  return code.length === ROOM_CODE_LENGTH && [...code].every((c) => ROOM_ALPHABET.includes(c));
}

export function peerIdForRoom(code: string): string {
  return `${PEER_PREFIX}${code}`;
}

export function formatRoomCode(code: string): string {
  return code.length === ROOM_CODE_LENGTH ? `${code.slice(0, 3)} ${code.slice(3)}` : code;
}
