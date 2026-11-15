import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { Check } from 'lucide-react';
import type { Answer, RevealEntry, RoundState } from '../../types';
import { useT } from '../../../../core/i18n/i18n';

interface AnswerCardProps {
  rank: number;
  answer: Answer;
  entry: RevealEntry | undefined;
  delayMs: number;
  showHiddenPoints: boolean;
}

function AnswerCard({ rank, answer, entry, delayMs, showHiddenPoints }: AnswerCardProps) {
  const t = useT();
  const visible = !!entry?.visible;
  const lockedIn = !!entry && !entry.visible;
  const label = visible
    ? `${t('Answer {n}', { n: rank })}: ${answer.text}, ${t('{n} points', { n: answer.points })}${entry?.source === 'shown' ? `, ${t('not scored')}` : ''}`
    : `${t('Answer {n}', { n: rank })}: ${t('hidden')}${lockedIn ? `, ${t('locked in')}` : ''}`;
  return (
    <li className={`answer-card ${visible ? 'is-revealed' : ''}`} style={{ '--delay': `${delayMs}ms` } as CSSProperties} aria-label={label}>
      <div className="answer-inner">
        <div className="answer-face answer-front" aria-hidden>
          <span className="answer-rank">{rank}</span>
          {lockedIn && (
            <span className="flex items-center gap-1 rounded-full bg-gold-300 px-3 py-1 font-display text-sm font-bold text-ink">
              <Check className="h-4 w-4" /> {t('Locked in')}
            </span>
          )}
          {showHiddenPoints && !lockedIn && (
            <span className="absolute right-4 font-display text-[clamp(1rem,2vw,2rem)] font-bold text-gold-200/80">{answer.points}</span>
          )}
        </div>
        <div className="answer-face answer-back" aria-hidden>
          <span className="answer-text">{answer.text}</span>
          {entry?.source === 'steal' && <span className="answer-tag">{t('Stolen')}</span>}
          <span className={`answer-points ${entry?.source === 'shown' ? 'opacity-60' : ''}`}>{answer.points}</span>
        </div>
      </div>
    </li>
  );
}

interface AnswerBoardProps {
  round: RoundState;
  showHiddenPoints: boolean;
}

/**
 * Column-major board (1-4 left, 5-8 right) like a stage sign.
 * When several answers flip in the same update they cascade in rank order.
 */
export function AnswerBoard({ round, showHiddenPoints }: AnswerBoardProps) {
  const t = useT();
  const answers = round.question.answers;
  const prevVisible = useRef<Set<string>>(new Set(answers.filter((a) => round.revealed[a.id]?.visible).map((a) => a.id)));
  const delays = useRef<Record<string, number>>({});
  const roundKey = `${round.index}:${round.question.id}`;
  const lastRoundKey = useRef(roundKey);

  const visibleNow = answers.filter((a) => round.revealed[a.id]?.visible).map((a) => a.id);
  if (lastRoundKey.current !== roundKey) {
    prevVisible.current = new Set();
    delays.current = {};
  }
  const newlyVisible = visibleNow.filter((id) => !prevVisible.current.has(id));
  if (newlyVisible.length > 1) newlyVisible.forEach((id, i) => (delays.current[id] = i * 140));
  else if (newlyVisible.length === 1) delays.current[newlyVisible[0]] = 0;

  useLayoutEffect(() => {
    prevVisible.current = new Set(visibleNow);
    lastRoundKey.current = roundKey;
  });

  const single = answers.length <= 4;
  const rows = single ? answers.length : Math.ceil(answers.length / 2);
  return (
    <ol
      className="answer-board"
      style={{ '--rows': Math.max(rows, 1), '--cols': single ? 1 : 2 } as CSSProperties}
      aria-label={t('Answer board, {n} of {total} revealed', { n: visibleNow.length, total: answers.length })}
    >
      {answers.map((answer, i) => (
        <AnswerCard key={answer.id} rank={i + 1} answer={answer} entry={round.revealed[answer.id]} delayMs={delays.current[answer.id] ?? 0} showHiddenPoints={showHiddenPoints} />
      ))}
    </ol>
  );
}
