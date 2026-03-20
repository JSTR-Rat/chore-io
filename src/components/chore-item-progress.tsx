import { Chore } from '@/contexts/chores/types';
import { useCurrentDate } from '@/hooks/useCurrentDate';
import { getChoreColor } from '@/utils/chore-colors';
import { calculateDaysSince, frequencyToDays } from '@/utils/date';
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

interface ChoreItemProgressProps {
  lastCompletedDate: Date | null;
  frequency: Chore['frequency'];
  frequencyUnit: Chore['frequencyUnit'];
}

export function ChoreItemProgress({
  lastCompletedDate,
  frequency,
  frequencyUnit,
}: ChoreItemProgressProps) {
  const currentDate = useCurrentDate();
  const rawDaysSince = calculateDaysSince(lastCompletedDate, currentDate);
  const daysSinceLastDone = Math.max(0, rawDaysSince);
  const totalDays = frequencyToDays(frequency, frequencyUnit);
  const daysRemaining = totalDays - daysSinceLastDone;
  const choreColor = getChoreColor(daysSinceLastDone, totalDays);

  const displayMode =
    daysRemaining > DIMENSIONS.FINAL_WEEK_DAYS &&
    totalDays > DIMENSIONS.FINAL_WEEK_DAYS
      ? 'progressBar'
      : totalDays <= DIMENSIONS.FINAL_WEEK_DAYS
        ? 'daySquares'
        : 'hybrid';

  return (
    <div className="flex flex-wrap gap-1.5 px-2 sm:gap-2 sm:px-0">
      {displayMode === 'progressBar' && (
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
        <div className="flex w-full flex-col">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {renderDaySquares(0, totalDays, daysSinceLastDone, choreColor)}
          </div>
          <ChoreSubtext
            daysSinceLastDone={daysSinceLastDone}
            totalDays={totalDays}
          />
        </div>
      )}

      {displayMode === 'hybrid' && (
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
      </div>
    </div>
  );
}

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
        className="inline-block h-7 w-7 rounded-md border-2 border-border-strong bg-surface-input sm:h-8 sm:w-8"
        style={{
          backgroundColor: daysSinceLastDone >= dayEnd ? choreColor : undefined,
        }}
      />
    );
  });
};

// Render progress bar for long-duration chores
const renderProgressBar = (
  daysSinceLastDone: number,
  totalDaysInBar: number,
  choreColor: string,
  isSquished: boolean = false,
  totalDays?: number,
) => {
  const progress = Math.min((daysSinceLastDone / totalDaysInBar) * 100, 100);

  return (
    <>
      {/* Mobile bar */}
      <div
        className={clsx(
          'relative h-7 w-full overflow-hidden border-2 border-border-strong bg-surface-input sm:hidden',
          isSquished ? 'rounded-r-md' : 'rounded-l-md',
        )}
        style={{
          width: isSquished ? `${SQUISHED_BAR_WIDTH.mobile}px` : `100%`,
          maxWidth: isSquished
            ? `${SQUISHED_BAR_WIDTH.mobile}px`
            : `${FULL_BAR_WIDTH.mobile}px`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            width: `${progress}%`,
            backgroundColor: choreColor,
          }}
        />
      </div>

      {/* Desktop bar */}
      <div
        className={clsx(
          'relative hidden h-8 max-w-full overflow-hidden border-2 border-border-strong bg-surface-input sm:block',
          isSquished ? 'rounded-r-md' : 'rounded-l-md',
        )}
        style={{
          width: isSquished ? `${SQUISHED_BAR_WIDTH.desktop}px` : '100%',
          maxWidth: isSquished
            ? `${SQUISHED_BAR_WIDTH.desktop}px`
            : `${FULL_BAR_WIDTH.desktop}px`,
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            width: `${progress}%`,
            backgroundColor: choreColor,
          }}
        />
      </div>
    </>
  );
};
