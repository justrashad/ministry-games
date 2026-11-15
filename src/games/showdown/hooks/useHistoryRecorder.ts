import { useEffect } from 'react';
import type { GameState, HistoryEntry } from '../types';
import { gameWinner } from '../engine/events';
import { fcPlayerTotal, fcTotal } from '../engine/finalChallenge';
import { dispatchGame } from '../sync/gameStore';
import { patchHistoryEntry, saveHistoryEntry } from '../state/historyStore';

/** Host-side: writes finished games (and Final Challenge results) to local history exactly once. */
export function useHistoryRecorder(state: GameState | null): void {
  useEffect(() => {
    if (!state) return;
    if (state.phase === 'gameOver' && !state.recorded.game) {
      const entry: HistoryEntry = {
        id: state.id,
        date: state.endedAt ?? Date.now(),
        setName: state.config.setName,
        teams: state.teams,
        winner: gameWinner(state),
        rounds: state.played,
      };
      saveHistoryEntry(entry);
      dispatchGame({ type: 'MARK_RECORDED', which: 'game' });
      return;
    }
    const fc = state.finalChallenge;
    if (fc && fc.phase === 'complete' && !state.recorded.finalChallenge) {
      const total = fcTotal(fc);
      patchHistoryEntry(state.id, {
        finalChallenge: {
          players: fc.players,
          playerTotals: [fcPlayerTotal(fc, 0), fcPlayerTotal(fc, 1)],
          total,
          target: fc.targetScore,
          reached: total >= fc.targetScore,
          questionIds: fc.questions.map((q) => q.id),
        },
      });
      dispatchGame({ type: 'MARK_RECORDED', which: 'finalChallenge' });
    }
  }, [state]);
}
