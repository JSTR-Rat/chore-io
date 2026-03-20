import { Chore } from '@/contexts/chores/types';
import { useProperty } from '@/contexts/property/useProperty';
import { useRoom } from '@/contexts/room/useRoom';
import { useCurrentDate } from '@/hooks/useCurrentDate';
import {
  getChoreHistory,
  markChoreDone,
  unmarkChoreDone,
} from '@/utils/chore.functions';
import { getAttachedChoresOptions } from '@/utils/room.queries';
import { Button } from '@headlessui/react';
import {
  ArrowPathIcon,
  CheckIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/solid';
import { animated, useSpring } from '@react-spring/web';
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useDrag } from '@use-gesture/react';
import clsx from 'clsx';
import { FC, useCallback, useMemo, useRef } from 'react';
import { ChoreItemProgress } from './chore-item-progress';
import { isSameDay } from '@/utils/date';
import { getChoreHistoryOptions, getChoreOptions } from '@/utils/chore.queries';

interface ChoreItemProps {
  choreId: number;
}

export const ChoreItem: FC<ChoreItemProps> = ({ choreId }) => {
  const { propertyId } = useProperty();
  const { roomId } = useRoom();
  const navigate = useNavigate();

  const { data: chore } = useSuspenseQuery(getChoreOptions(choreId));
  const { data: choreHistory, isLoading: isLoadingChoreHistory } = useQuery(
    getChoreHistoryOptions(choreId),
  );

  const currentDate = useCurrentDate();

  const wasCompletedToday = useMemo(() => {
    if (!choreHistory) return false;
    return choreHistory.some((date) => isSameDay(date, currentDate));
  }, [currentDate, choreHistory]);

  const lastCompletedDate = useMemo(() => {
    if (!choreHistory) return null;
    const dates = choreHistory.filter((date) => date <= currentDate);
    if (dates.length === 0) return null;
    return dates[dates.length - 1];
  }, [choreHistory, currentDate]);

  const queryClient = useQueryClient();

  const { mutate: markDone, isPending: isMarkingDone } = useMutation({
    mutationFn: async ({
      choreId,
      completedAt,
    }: {
      choreId: number;
      completedAt: Date;
    }) =>
      await markChoreDone({
        data: {
          choreId,
          completedAt,
        },
      }),
    onMutate: async ({
      choreId,
      completedAt,
    }: {
      choreId: number;
      completedAt: Date;
    }) => {
      const queryKey = getChoreHistoryOptions(choreId).queryKey;
      await queryClient.cancelQueries({ queryKey });
      const previousHistory = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: Date[]) =>
        [...old, completedAt].sort((a, b) => b.getTime() - a.getTime()),
      );

      return { previousHistory };
    },
    onError: (error, { choreId, completedAt }, context) => {
      queryClient.setQueryData(
        getChoreHistoryOptions(choreId).queryKey,
        context?.previousHistory || [],
      );
    },
    onSettled: (data, error, { choreId }, context) => {
      queryClient.invalidateQueries({
        queryKey: getChoreHistoryOptions(choreId).queryKey,
      });
    },
  });

  const { mutate: unmarkDone, isPending: isUnmarkingDone } = useMutation({
    mutationFn: async ({
      choreId,
      completedAt,
    }: {
      choreId: number;
      completedAt: Date;
    }) =>
      await unmarkChoreDone({
        data: {
          choreId,
          completedAt,
        },
      }),
    onMutate: async ({
      choreId,
      completedAt,
    }: {
      choreId: number;
      completedAt: Date;
    }) => {
      const queryKey = getChoreHistoryOptions(choreId).queryKey;
      await queryClient.cancelQueries({ queryKey });
      const previousHistory = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: Date[]) =>
        old.filter((date) => !isSameDay(date, completedAt)),
      );

      return { previousHistory };
    },
    onError: (error, { choreId, completedAt }, context) => {
      queryClient.setQueryData(
        getChoreHistoryOptions(choreId).queryKey,
        context?.previousHistory || [],
      );
    },
    onSettled: (data, error, { choreId }, context) => {
      queryClient.invalidateQueries({
        queryKey: getChoreHistoryOptions(choreId).queryKey,
      });
    },
  });

  const toggleDone = useCallback(() => {
    if (wasCompletedToday) {
      unmarkDone({ choreId: chore.id, completedAt: currentDate });
    } else {
      markDone({ choreId: chore.id, completedAt: currentDate });
    }
  }, [markDone, unmarkDone, wasCompletedToday, chore.id, currentDate]);

  const navigateToEditChore = useCallback(() => {
    navigate({
      to: '/dashboard/$propertyId/room/$roomId/edit/$choreId',
      params: { propertyId, roomId, choreId: chore.id },
    });
  }, [propertyId, roomId, chore.id, navigate]);

  const choreItemRef = useRef<HTMLDivElement>(null);
  const doneButtonRef = useRef<HTMLDivElement>(null);
  const choreSliderRef = useRef<HTMLDivElement>(null);

  const [{ x }, api] = useSpring(() => ({
    x: 0,
    config: { tension: 300, friction: 30 },
  }));

  const [{ borderWidth }, borderApi] = useSpring(() => ({
    borderWidth: 0,
  }));

  const bind = useDrag(
    ({ down, offset: [ox], last }) => {
      const doneButton = doneButtonRef.current;
      if (!doneButton) return;

      // if (choreItemRef.current) {
      //   if (ox > 0) {
      //     choreItemRef.current.style.setProperty('overflow', 'hidden');
      //   } else {
      //     choreItemRef.current.style.removeProperty('overflow');
      //   }
      // }

      // choreSliderRef.current?.style.removeProperty('border-right-width');

      if (down) {
        if (ox >= doneButton.offsetWidth * 0.75) {
          api.start({ x: doneButton.offsetWidth, immediate: false });
          // choreSliderRef.current?.style.setProperty('border-right-width', '0');
        } else {
          api.start({
            x: ox,
            immediate: x.get() < doneButton.offsetWidth * 0.75,
            config: {
              duration: 100,
            },
          });
        }
      } else if (last) {
        if (ox >= doneButton.offsetWidth * 0.75) {
          toggleDone();
          api.start({ x: 0 });
        } else if (ox <= -doneButton.offsetWidth / 2) {
          api.start({ x: -doneButton.offsetWidth });
        } else {
          api.start({ x: 0 });
        }
      }
    },
    {
      axis: 'x',
      bounds: (state) => {
        const doneButton = doneButtonRef.current;
        if (!doneButton) return { left: 0, right: 0 };
        const doneButtonRect = doneButton.getBoundingClientRect();
        return {
          left: -doneButtonRect.width,
          right: doneButton.offsetWidth,
        };
      },
      rubberband: false,
      from: () => [x.get(), 0],
      pointer: { touch: true },
      preventScroll: true,
    },
  );

  return (
    <div
      ref={choreItemRef}
      className="relative -ml-8 grid grid-cols-[1fr_auto] overflow-hidden rounded-lg pl-8 select-none"
    >
      {/* Draggable chore content */}
      <animated.div
        ref={choreSliderRef}
        {...bind()}
        style={{
          x,
          touchAction: 'none',
        }}
        className="relative z-10 -mr-0.5 flex min-w-0 flex-col gap-2 overflow-hidden rounded-l-lg border-y border-l border-border-strong bg-surface-elevated px-1 py-1 sm:flex-row sm:items-center sm:gap-4"
      >
        {/* <div className="absolute top-0 right-0 bottom-0 left-0 -z-10 bg-surface-elevated" /> */}

        {/* Chore name */}
        <div className="flex items-center justify-between px-2 sm:w-64 sm:shrink-0 sm:justify-start sm:px-0">
          <div className="overflow-wrap w-full text-left text-base font-medium wrap-break-word text-text-muted sm:text-lg">
            {chore.name}
          </div>
        </div>

        <ChoreItemProgress
          lastCompletedDate={lastCompletedDate}
          frequency={chore.frequency}
          frequencyUnit={chore.frequencyUnit}
        />
      </animated.div>
      <div className="relative flex h-full">
        <Button
          onClick={navigateToEditChore}
          className="group absolute right-full flex aspect-square h-full cursor-pointer items-center justify-center border-y border-border bg-orange-400/90 p-4 text-text/80 transition-all hover:bg-orange-400 hover:text-text"
        >
          <Cog6ToothIcon className="w-8 transition-all group-hover:scale-120" />
        </Button>
        <Button
          ref={doneButtonRef}
          onClick={toggleDone}
          disabled={isLoadingChoreHistory || isMarkingDone || isUnmarkingDone}
          className={clsx(
            'group flex aspect-square h-full cursor-pointer items-center justify-center rounded-r-lg border-y border-r border-border p-4 transition-all',
            wasCompletedToday
              ? 'bg-transparent text-accent-green-light hover:bg-background/20'
              : 'bg-accent-green-light/80 text-text hover:bg-accent-green-light',
            isLoadingChoreHistory ? 'bg-surface' : '',
          )}
        >
          <div className="absolute z-20 h-full w-full rounded-r-lg border-y border-r border-border-strong" />
          {isLoadingChoreHistory ? (
            <ArrowPathIcon className="w-8 animate-spin" />
          ) : (
            <CheckIcon className="w-8 transition-all group-hover:scale-120" />
          )}
        </Button>
      </div>
    </div>
  );
};
