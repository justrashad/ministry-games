import type { Level, TrueFalseQuestion } from '../../../core/questions/types';

/** A true statement: id, category, level, statement, scripture reference. */
export function truth(id: string, category: string, level: Level, statement: string, reference: string): TrueFalseQuestion {
  return { id, type: 'truefalse', category, level, statement, isTrue: true, reference };
}

/** A false statement, with the correction shown after the call. */
export function myth(id: string, category: string, level: Level, statement: string, correction: string, reference: string): TrueFalseQuestion {
  return { id, type: 'truefalse', category, level, statement, isTrue: false, correction, reference };
}

export interface StatementPack {
  id: string;
  name: string;
  description: string;
  statements: TrueFalseQuestion[];
}
