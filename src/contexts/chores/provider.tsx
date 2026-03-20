import { useReducer } from 'react';
import { ChoresAction, ChoresContext, ChoresContextType } from './context';
import { Chore, ChoresState } from './types';
import {
  getChore,
  getChoreWithHistory,
  markChoreDone,
  unmarkChoreDone,
} from '@/utils/chore.functions';

const choresReducer = (
  state: ChoresState,
  action: ChoresAction,
): ChoresState => {
  switch (action.type) {
    case 'UPDATE':
      return {
        ...state,
        chores: state.chores.map((chore) =>
          chore.id === action.payload.id
            ? { ...chore, ...action.payload.chore }
            : chore,
        ),
      };
    case 'REMOVE':
      return {
        ...state,
        chores: state.chores.filter((chore) => chore.id !== action.payload.id),
      };
  }
};

interface ChoresProviderProps {
  children: React.ReactNode;
  initialChores: Chore[];
}

export const ChoresProvider = ({
  initialChores,
  children,
}: ChoresProviderProps) => {
  const [state, dispatch] = useReducer(
    choresReducer,
    {
      chores: initialChores,
    },
    (initialState) => initialState,
  );

  const markDone = async (id: Chore['id'], completedAt: Date) => {
    dispatch({
      type: 'UPDATE',
      payload: { id, chore: { isMarkingDone: true } },
    });
    console.log('markDone', id, completedAt);
    const result = await markChoreDone({ data: { choreId: id, completedAt } });
    console.log(result);
    if (!result.success) {
      dispatch({
        type: 'UPDATE',
        payload: { id, chore: { isMarkingDone: false } },
      });
      return;
    }

    const { success: choreSuccess, chore } = await getChoreWithHistory({
      data: { choreId: id, currentDate: completedAt },
    });
    if (!choreSuccess) {
      dispatch({
        type: 'UPDATE',
        payload: { id, chore: { isMarkingDone: false } },
      });
      return;
    }

    dispatch({
      type: 'UPDATE',
      payload: {
        id,
        chore: {
          isMarkingDone: false,
          lastCompletedDate: chore.lastCompletedDate,
        },
      },
    });
  };

  const unmarkDone = async (id: Chore['id'], completedAt: Date) => {
    dispatch({
      type: 'UPDATE',
      payload: { id, chore: { isMarkingDone: true } },
    });
    console.log('unmarkDone', id, completedAt);
    const result = await unmarkChoreDone({
      data: { choreId: id, completedAt },
    });
    console.log(result);
    if (!result.success) {
      dispatch({
        type: 'UPDATE',
        payload: { id, chore: { isMarkingDone: false } },
      });
      return;
    }

    const { success: choreSuccess, chore } = await getChoreWithHistory({
      data: { choreId: id, currentDate: completedAt },
    });
    if (!choreSuccess) {
      dispatch({
        type: 'UPDATE',
        payload: { id, chore: { isMarkingDone: false } },
      });
      return;
    }

    dispatch({
      type: 'UPDATE',
      payload: {
        id,
        chore: {
          isMarkingDone: false,
          lastCompletedDate: chore.lastCompletedDate,
        },
      },
    });
  };

  const value: ChoresContextType = {
    state,
    dispatch,
    markDone,
    unmarkDone,
  };

  return (
    <ChoresContext.Provider value={value}>{children}</ChoresContext.Provider>
  );
};
