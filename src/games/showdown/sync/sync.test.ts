import { describe, expect, it } from 'vitest';
import { createCodec, isNewer, mergeEnvelope, type GameEnvelope } from '../../../core/sync/envelope';
import { showdownDefinition } from '../engine/syncDefinition';
import type { GameState } from '../types';
import { formatRoomCode, generateRoomCode, isValidRoomCode, normalizeRoomCode, peerIdForRoom, ROOM_ALPHABET } from '../../../core/sync/roomCode';
import { mulberry32 } from '../engine/random';
import { startGame, makeQuestion } from '../engine/testUtils';

const game = startGame([makeQuestion('q1', [10, 5])]);
const { sanitizeEnvelope, sanitizeMessage } = createCodec(showdownDefinition);
const env = (rev: number, origin: string, state = game): GameEnvelope<GameState> => ({ rev, origin, state });

describe('envelope merging', () => {
  it('adopts higher revisions and ignores older ones', () => {
    expect(isNewer(env(3, 'a'), env(2, 'b'))).toBe(true);
    expect(isNewer(env(2, 'a'), env(3, 'b'))).toBe(false);
    expect(mergeEnvelope(env(5, 'a'), env(4, 'b'), false)).toBeNull();
  });

  it('breaks equal-revision ties deterministically and never adopts its own echo', () => {
    expect(isNewer(env(3, 'b'), env(3, 'a'))).toBe(true);
    expect(isNewer(env(3, 'a'), env(3, 'b'))).toBe(false);
    expect(isNewer(env(3, 'a'), env(3, 'a'))).toBe(false);
  });

  it('forced sync from the TV replaces a stale phone game even with a lower revision', () => {
    const phone = env(40, 'phone');
    const tv = env(6, 'tv');
    expect(mergeEnvelope(phone, tv, true)).toBe(tv);
    expect(mergeEnvelope(phone, { rev: 0, origin: 'tv', state: null }, true)?.state).toBeNull();
  });

  it('rejects malformed envelopes and messages', () => {
    expect(sanitizeEnvelope({ rev: 'x', origin: 'a', state: null })).toBeNull();
    expect(sanitizeEnvelope({ rev: 1, origin: 'a', state: { nope: true } })).toBeNull();
    expect(sanitizeEnvelope({ rev: 1, origin: 'a', state: game })).not.toBeNull();
    expect(sanitizeMessage({ type: 'state', envelope: { rev: 1 } })).toBeNull();
    expect(sanitizeMessage({ type: 'launch-missiles' })).toBeNull();
    expect(sanitizeMessage({ type: 'hello', origin: 'x', wantsSync: true })).toEqual({ type: 'hello', origin: 'x', wantsSync: true });
  });
});

describe('room codes', () => {
  it('generates readable codes from the safe alphabet', () => {
    const rng = mulberry32(3);
    for (let i = 0; i < 50; i += 1) {
      const code = generateRoomCode(rng);
      expect(isValidRoomCode(code)).toBe(true);
      expect(code).not.toMatch(/[01ILO]/);
    }
    expect(ROOM_ALPHABET).not.toMatch(/[01ILO]/);
  });

  it('normalizes what people type', () => {
    expect(normalizeRoomCode(' fgh 2k-q')).toBe('FGH2KQ'.slice(0, 6));
    expect(isValidRoomCode(normalizeRoomCode('fgh 2k'))).toBe(true);
    expect(isValidRoomCode('FGH2')).toBe(false);
    expect(isValidRoomCode('FGH0K')).toBe(false);
  });

  it('formats and namespaces codes', () => {
    expect(formatRoomCode('FGH2K')).toBe('FGH 2K');
    expect(peerIdForRoom('FGH2K')).toBe('ministry-showdown-v1-FGH2K');
  });
});

describe('remote actions', () => {
  it('accepts only buzzes and answers with valid shapes', () => {
    expect(sanitizeMessage({ type: 'action', action: { type: 'BUZZ', team: 1 } })).toEqual({ type: 'action', action: { type: 'BUZZ', team: 1 } });
    expect(sanitizeMessage({ type: 'action', action: { type: 'BUZZ', team: 2 } })).toBeNull();
    expect(sanitizeMessage({ type: 'action', action: { type: 'END_GAME' } })).toBeNull();
    expect(sanitizeMessage({ type: 'action', action: { type: 'FC_SUBMIT', text: '  ', player: 0, question: 0 } })).toBeNull();
    expect(sanitizeMessage({ type: 'action', action: { type: 'FC_SUBMIT', text: 'ok', player: 0 } })).toBeNull();
    const long = sanitizeMessage({ type: 'action', action: { type: 'FC_SUBMIT', text: 'x'.repeat(200), player: 1, question: 2 } });
    expect(long && long.type === 'action' && long.action.type === 'FC_SUBMIT' && long.action.text.length).toBe(80);
  });
});
