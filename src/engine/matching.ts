import type { Question } from '../types';

/**
 * Lightweight answer matching for the Final Challenge. It is intentionally
 * forgiving on phrasing ("Take a walk" ~ "Go for a walk") and the host can
 * always override the result, so it never has to be perfect.
 */

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'to', 'for', 'of', 'some', 'my', 'our', 'your', 'his', 'her', 'their', 'its',
  'go', 'goes', 'going', 'went', 'take', 'takes', 'taking', 'took', 'have', 'has', 'having',
  'do', 'does', 'doing', 'did', 'get', 'gets', 'getting', 'with', 'in', 'on', 'at', 'and', 'or',
  'be', 'is', 'are', 'it', 'we', 'you', 'i', 'them', 'they', 'something', 'thing', 'things', 'someone',
  // Spanish (accents are removed before this list is checked)
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'y', 'o', 'e', 'u', 'con', 'en', 'por', 'para',
  'mi', 'mis', 'tu', 'tus', 'su', 'sus', 'nuestro', 'nuestra', 'nuestros', 'nuestras', 'lo', 'le', 'les', 'se', 'que',
  'ir', 'va', 'van', 'hacer', 'hace', 'algo', 'alguien', 'cosa', 'cosas', 'es', 'son',
]);

function stem(word: string): string {
  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(text: string): string[] {
  const words = normalizeText(text).split(' ').filter(Boolean);
  const meaningful = words.filter((w) => !STOP_WORDS.has(w));
  return (meaningful.length > 0 ? meaningful : words).map(stem);
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const curr = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr.push(Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost));
    }
    prev = curr;
  }
  return prev[b.length];
}

function tokensEqual(a: string, b: string): boolean {
  if (a === b) return true;
  const longest = Math.max(a.length, b.length);
  return longest >= 5 && levenshtein(a, b) <= 1;
}

export function similarity(input: string, candidate: string): number {
  const a = tokenize(input);
  const b = tokenize(candidate);
  if (a.length === 0 || b.length === 0) return 0;
  let shared = 0;
  const used = new Set<number>();
  for (const token of a) {
    const idx = b.findIndex((other, i) => !used.has(i) && tokensEqual(token, other));
    if (idx >= 0) {
      used.add(idx);
      shared += 1;
    }
  }
  const union = a.length + b.length - shared;
  const jaccard = union > 0 ? shared / union : 0;
  const containment = shared / Math.min(a.length, b.length);
  const joinedA = a.join(' ');
  const joinedB = b.join(' ');
  const maxLen = Math.max(joinedA.length, joinedB.length);
  const editRatio = maxLen > 0 ? 1 - levenshtein(joinedA, joinedB) / maxLen : 0;
  return Math.max(jaccard, containment * 0.9, editRatio >= 0.8 ? editRatio : 0);
}

export const MATCH_THRESHOLD = 0.6;

export interface MatchResult {
  answerId: string;
  confidence: number;
}

export function matchAnswer(question: Question, input: string): MatchResult | null {
  if (!input.trim()) return null;
  const candidates: { answerId: string; text: string }[] = question.answers.map((a) => ({ answerId: a.id, text: a.text }));
  for (const alt of question.alternateAnswers ?? []) {
    if (question.answers.some((a) => a.id === alt.matchesAnswerId)) {
      candidates.push({ answerId: alt.matchesAnswerId, text: alt.acceptedAnswer });
    }
  }
  let best: MatchResult | null = null;
  for (const candidate of candidates) {
    const score = similarity(input, candidate.text);
    if (score >= MATCH_THRESHOLD && (!best || score > best.confidence)) {
      best = { answerId: candidate.answerId, confidence: score };
    }
  }
  return best;
}
