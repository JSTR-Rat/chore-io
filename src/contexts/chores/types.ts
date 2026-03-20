import { chore } from '@/db';

export type Chore = Pick<
  typeof chore.$inferSelect,
  'id' | 'name' | 'roomId' | 'frequency' | 'frequencyUnit'
> & {
  lastCompletedDate: Date | null;
  isMarkingDone: boolean;
};

export interface ChoresState {
  chores: Chore[];
}
