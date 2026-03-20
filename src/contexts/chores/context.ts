import { createContext } from 'react';
import { Chore, ChoresState } from './types';

export type ChoresAction =
  | {
      type: 'UPDATE';
      payload: { id: Chore['id']; chore: Partial<Omit<Chore, 'id'>> };
    }
  | {
      type: 'REMOVE';
      payload: { id: Chore['id'] };
    };

export interface ChoresContextType {
  state: ChoresState;
  dispatch: React.Dispatch<ChoresAction>;
  markDone: (id: Chore['id'], completedAt: Date) => Promise<void>;
  unmarkDone: (id: Chore['id'], completedAt: Date) => Promise<void>;
}

export const ChoresContext = createContext<ChoresContextType | null>(null);
