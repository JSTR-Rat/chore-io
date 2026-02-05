// src/components/ChoresBoard.tsx
import { Button } from '@headlessui/react';
import { getChoreColor } from '../utils/chore-colors';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

// Constants for sizing
const DIMENSIONS = {
  SQUARE_SIZE_MOBILE: 28, // h-7, w-7
  SQUARE_SIZE_DESKTOP: 32, // h-8, w-8
  GAP_MOBILE: 6, // gap-1.5
  GAP_DESKTOP: 8, // gap-2
  FINAL_WEEK_DAYS: 7,
} as const;

// Calculated widths
const SQUISHED_BAR_WIDTH = {
  mobile: 62, // (2 * 28) + 6
  desktop: 72, // (2 * 32) + 8
};

const FULL_BAR_WIDTH = {
  mobile: 300, // 62 + (7 * 28) + (7 * 6)
  desktop: 352, // 72 + (7 * 32) + (7 * 8)
};

const MAX_FILL_PERCENT = 79.3; // Percentage of bar before final week section

interface Chore {
  id: number;
  name: string;
  lastCompletedDate: Date | null;
  frequency: number;
  frequencyUnit: 'days' | 'weeks' | 'months';
}

interface ChoresBoardProps {
  chores: Chore[];
  onChoreClick: (choreId: number) => void;
  onDeleteClick: (choreId: number) => void;
  currentDate: Date;
}

export function ChoresBoard({
  chores,
  onChoreClick,
  onDeleteClick,
  currentDate,
}: ChoresBoardProps) {
  const calculateDaysSince = (lastCompleted: Date | null): number => {
    if (!lastCompleted) return 999; // Never completed
    const diffTime = currentDate.getTime() - lastCompleted.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper to convert frequency to days
  const frequencyToDays = (
    frequency: number,
    unit: 'days' | 'weeks' | 'months',
  ): number => {
    switch (unit) {
      case 'days':
        return frequency;
      case 'weeks':
        return frequency * 7;
      case 'months':
        return frequency * 30;
    }
  };

  // Render progress bar for long-duration chores
  const renderProgressBar = (
    daysSinceLastDone: number,
    totalDaysInBar: number,
    choreColor: string,
    isSquished: boolean = false,
    totalDays?: number,
  ) => {
    // Calculate progress percentage
    // let progress: number
    // if (!isSquished && totalDays) {
    //   // Full bar: scale progress to stop at final week marker
    //   const daysBeforeFinalWeek = totalDays - DIMENSIONS.FINAL_WEEK_DAYS
    //   progress = Math.min(
    //     (daysSinceLastDone / daysBeforeFinalWeek) * MAX_FILL_PERCENT,
    //     MAX_FILL_PERCENT,
    //   )
    // } else {
    //   progress = Math.min((daysSinceLastDone / totalDaysInBar) * 100, 100)
    // }
    const progress = Math.min((daysSinceLastDone / totalDaysInBar) * 100, 100);

    return (
      <>
        {/* Mobile bar */}
        <div
          className={clsx(
            'relative h-7 w-full overflow-hidden border-2 border-border-strong sm:hidden',
            isSquished ? 'rounded-r-md' : 'rounded-l-md',
          )}
          style={{
            width: isSquished ? `${SQUISHED_BAR_WIDTH.mobile}px` : `100%`,
            maxWidth: isSquished
              ? `${SQUISHED_BAR_WIDTH.mobile}px`
              : `${FULL_BAR_WIDTH.mobile}px`,
          }}
        >
          {/* Progress fill */}
          <div
            className="absolute inset-0"
            style={{
              width: `${progress}%`,
              backgroundColor: choreColor,
            }}
          >
            {/* {isSquished && <div className="text-black text-center w-full">...</div>} */}
          </div>
        </div>

        {/* Desktop bar */}
        <div
          className={clsx(
            'relative hidden h-8 max-w-full overflow-hidden border-2 border-border-strong sm:block',
            isSquished ? 'rounded-r-md' : 'rounded-l-md',
          )}
          style={{
            width: isSquished ? `${SQUISHED_BAR_WIDTH.desktop}px` : '100%',
            maxWidth: isSquished
              ? `${SQUISHED_BAR_WIDTH.desktop}px`
              : `${FULL_BAR_WIDTH.desktop}px`,
          }}
        >
          {/* Progress fill */}
          <div
            className={clsx(
              'absolute inset-0 flex items-center justify-center',
            )}
            style={{
              width: `${progress}%`,
              backgroundColor: choreColor,
            }}
          >
            {/* {isSquished && <div className="text-white">...</div>} */}
          </div>
        </div>
      </>
    );
  };

  // Render individual day squares
  const renderDaySquares = (
    startDay: number,
    numSquares: number,
    daysSinceLastDone: number,
    choreColor: string,
  ) => {
    return Array.from({ length: numSquares }).map((_, idx) => {
      const dayStart = startDay + idx;
      const dayEnd = dayStart + 1;

      return (
        <span
          key={idx}
          className="inline-block h-7 w-7 rounded-md border-2 border-border-strong sm:h-8 sm:w-8"
          style={{
            backgroundColor:
              daysSinceLastDone >= dayEnd ? choreColor : 'transparent',
          }}
        />
      );
    });
  };

  return (
    <>
      {chores.map((chore) => {
        const rawDaysSince = calculateDaysSince(chore.lastCompletedDate);
        // If completed in the future, treat as clean (0 days since)
        const daysSinceLastDone = Math.max(0, rawDaysSince);
        const totalDays = frequencyToDays(chore.frequency, chore.frequencyUnit);
        const daysRemaining = totalDays - daysSinceLastDone;

        // Calculate unified color for entire chore based on overall progress
        const choreColor = getChoreColor(daysSinceLastDone, totalDays);

        // Determine which display mode to use
        const displayMode =
          daysRemaining > DIMENSIONS.FINAL_WEEK_DAYS &&
          totalDays > DIMENSIONS.FINAL_WEEK_DAYS
            ? 'progressBar'
            : totalDays <= DIMENSIONS.FINAL_WEEK_DAYS
              ? 'daySquares'
              : 'hybrid';

        return (
          <div key={chore.id} className="mb-1 py-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              {/* Chore name and frequency */}
              <div className="flex items-center justify-between sm:w-64 sm:shrink-0 sm:justify-start">
                <button
                  onClick={() => onChoreClick(chore.id)}
                  className="overflow-wrap w-full text-left text-base font-medium wrap-break-word text-text-muted transition-colors hover:text-primary-light sm:text-lg"
                >
                  {chore.name}
                </button>
                {/* <span className="ml-2 text-xs whitespace-nowrap text-text-muted sm:text-sm">
                  Every {chore.frequency} {chore.frequencyUnit}
                </span> */}
              </div>

              {/* Progress visualization */}
              <div className="flex w-full flex-wrap gap-1.5 sm:gap-2">
                {displayMode === 'progressBar' && (
                  // Mode 1: Single progress bar for chores with >7 days remaining
                  <div className="flex w-full flex-col">
                    {renderProgressBar(
                      daysSinceLastDone,
                      totalDays - DIMENSIONS.FINAL_WEEK_DAYS,
                      choreColor,
                      false,
                      totalDays,
                    )}
                    <ChoreSubtext
                      daysSinceLastDone={daysSinceLastDone}
                      totalDays={totalDays}
                    />
                  </div>
                )}

                {displayMode === 'daySquares' && (
                  // Mode 2: Individual day squares only (for short-duration chores)
                  <div className="flex w-full flex-col">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {renderDaySquares(
                        0,
                        totalDays,
                        daysSinceLastDone,
                        choreColor,
                      )}
                    </div>
                    <ChoreSubtext
                      daysSinceLastDone={daysSinceLastDone}
                      totalDays={totalDays}
                    />
                  </div>
                )}

                {displayMode === 'hybrid' && (
                  // Mode 3: Squished progress bar + 7 day squares
                  <div className="flex w-full flex-col">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {renderProgressBar(
                        Math.min(
                          daysSinceLastDone,
                          totalDays - DIMENSIONS.FINAL_WEEK_DAYS,
                        ),
                        totalDays - DIMENSIONS.FINAL_WEEK_DAYS,
                        choreColor,
                        true,
                      )}
                      {renderDaySquares(
                        totalDays - DIMENSIONS.FINAL_WEEK_DAYS,
                        DIMENSIONS.FINAL_WEEK_DAYS,
                        daysSinceLastDone,
                        choreColor,
                      )}
                    </div>

                    <ChoreSubtext
                      daysSinceLastDone={daysSinceLastDone}
                      totalDays={totalDays}
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-row gap-2">
                <Button
                  onClick={() => onChoreClick(chore.id)}
                  className="shrink rounded-md border border-border-strong bg-surface-elevated p-2 text-xs font-medium text-text-muted transition-all hover:border-border-hover hover:bg-surface-hover hover:text-text"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => onDeleteClick(chore.id)}
                  className="shrink rounded-md border border-border-strong bg-surface-elevated p-2 text-xs font-medium text-text-muted transition-all hover:border-border-hover hover:bg-surface-hover hover:text-text"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function ChoreSubtext({
  daysSinceLastDone,
  totalDays,
}: {
  daysSinceLastDone: number;
  totalDays: number;
}) {
  const daysRemaining = Math.max(0, totalDays - daysSinceLastDone);
  const weeksRemainingReal = daysRemaining / 7;
  const weeksRemaining = Math.floor(weeksRemainingReal);
  const monthsRemainingReal = daysRemaining / 30;
  const monthsRemaining = Math.floor(monthsRemainingReal);
  return (
    <div className="mt-1 flex text-xs text-text-muted">
      <div className="flex justify-center">
        {daysRemaining <= 0 ? (
          <b>Due</b>
        ) : monthsRemainingReal >= 1 ? (
          <span>
            Due in
            {monthsRemainingReal % 1 > 0 ? ' over ' : ''}
            <b className="px-1">{monthsRemaining}</b>
            month{monthsRemaining > 1 ? 's' : ''}
          </span>
        ) : weeksRemainingReal > 2 ? (
          <span>
            Due in
            {weeksRemainingReal % 1 > 0 ? ' over ' : ''}
            <b className="px-1">{weeksRemaining}</b>
            week{weeksRemaining > 1 ? 's' : ''}
          </span>
        ) : (
          <span>
            Due in
            <b className="px-1">{daysRemaining}</b>
            day{daysRemaining > 1 ? 's' : ''}
          </span>
        )}
        {/* <span>({daysRemaining} days)</span>
        <span>({weeksRemainingReal} weeks)</span>
        <span>({monthsRemainingReal} months)</span> */}
      </div>
    </div>
  );
}
