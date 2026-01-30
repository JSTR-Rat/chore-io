// src/components/ChoresBoard.tsx
import { getChoreColor } from '../utils/chore-colors'

// Constants for sizing
const DIMENSIONS = {
  SQUARE_SIZE_MOBILE: 28, // h-7, w-7
  SQUARE_SIZE_DESKTOP: 32, // h-8, w-8
  GAP_MOBILE: 6, // gap-1.5
  GAP_DESKTOP: 8, // gap-2
  FINAL_WEEK_DAYS: 7,
} as const

// Calculated widths
const SQUISHED_BAR_WIDTH = {
  mobile: 62, // (2 * 28) + 6
  desktop: 72, // (2 * 32) + 8
}

const FULL_BAR_WIDTH = {
  mobile: 300, // 62 + (7 * 28) + (7 * 6)
  desktop: 352, // 72 + (7 * 32) + (7 * 8)
}

const MAX_FILL_PERCENT = 79.3 // Percentage of bar before final week section

interface Chore {
  id: string
  name: string
  lastCompletedDate: Date | null
  frequency: number
  frequencyUnit: 'days' | 'weeks' | 'months'
}

interface ChoresBoardProps {
  chores: Chore[]
  onChoreClick: (choreId: string) => void
  currentDate: Date
}

export function ChoresBoard({
  chores,
  onChoreClick,
  currentDate,
}: ChoresBoardProps) {
  const calculateDaysSince = (lastCompleted: Date | null): number => {
    if (!lastCompleted) return 999 // Never completed
    const diffTime = currentDate.getTime() - lastCompleted.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  // Helper to convert frequency to days
  const frequencyToDays = (
    frequency: number,
    unit: 'days' | 'weeks' | 'months',
  ): number => {
    switch (unit) {
      case 'days':
        return frequency
      case 'weeks':
        return frequency * 7
      case 'months':
        return frequency * 30
    }
  }

  // Render progress bar for long-duration chores
  const renderProgressBar = (
    daysSinceLastDone: number,
    totalDaysInBar: number,
    choreColor: string,
    isSquished: boolean = false,
    totalDays?: number,
  ) => {
    // Calculate progress percentage
    let progress: number
    if (!isSquished && totalDays) {
      // Full bar: scale progress to stop at final week marker
      const daysBeforeFinalWeek = totalDays - DIMENSIONS.FINAL_WEEK_DAYS
      progress = Math.min(
        (daysSinceLastDone / daysBeforeFinalWeek) * MAX_FILL_PERCENT,
        MAX_FILL_PERCENT,
      )
    } else {
      progress = Math.min((daysSinceLastDone / totalDaysInBar) * 100, 100)
    }

    return (
      <>
        {/* Mobile bar */}
        <div
          className="relative h-7 border-2 border-border-strong overflow-hidden sm:hidden"
          style={{
            borderRadius: '3px',
            width: isSquished ? `${SQUISHED_BAR_WIDTH.mobile}px` : `${FULL_BAR_WIDTH.mobile}px`,
          }}
        >
          {/* Final week indicator: divider line and ellipsis */}
          {!isSquished && totalDays && (
            <>
              {/* Vertical divider line slightly inside the final week section */}
              <div 
                className="absolute top-2 bottom-2 w-0.5 bg-border-strong opacity-50"
                style={{ right: '58px' }}
              />
              {/* Ellipsis centered in the final week section */}
              <div
                className="absolute top-0 bottom-0 right-0 flex items-center justify-center text-text-muted opacity-40"
                style={{ width: `${SQUISHED_BAR_WIDTH.mobile}px` }}
              >
                ...
              </div>
            </>
          )}
          {/* Progress fill */}
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
          className="relative hidden h-8 border-2 border-border-strong overflow-hidden sm:block"
          style={{
            borderRadius: '3px',
            width: isSquished ? `${SQUISHED_BAR_WIDTH.desktop}px` : `${FULL_BAR_WIDTH.desktop}px`,
          }}
        >
          {/* Final week indicator: divider line and ellipsis */}
          {!isSquished && totalDays && (
            <>
              {/* Vertical divider line slightly inside the final week section */}
              <div 
                className="absolute top-2 bottom-2 w-0.5 bg-border-strong opacity-50"
                style={{ right: '68px' }}
              />
              {/* Ellipsis centered in the final week section */}
              <div
                className="absolute top-0 bottom-0 right-0 flex items-center justify-center text-text-muted opacity-40"
                style={{ width: `${SQUISHED_BAR_WIDTH.desktop}px` }}
              >
                ...
              </div>
            </>
          )}
          {/* Progress fill */}
          <div
            className="absolute inset-0"
            style={{
              width: `${progress}%`,
              backgroundColor: choreColor,
            }}
          />
        </div>
      </>
    )
  }

  // Render individual day squares
  const renderDaySquares = (
    startDay: number,
    numSquares: number,
    daysSinceLastDone: number,
    choreColor: string,
  ) => {
    return Array.from({ length: numSquares }).map((_, idx) => {
      const dayStart = startDay + idx
      const dayEnd = dayStart + 1

      return (
        <span
          key={idx}
          className="inline-block h-7 w-7 border-2 border-border-strong sm:h-8 sm:w-8"
          style={{
            borderRadius: '3px',
            backgroundColor: daysSinceLastDone >= dayEnd ? choreColor : 'transparent',
          }}
        />
      )
    })
  }

  return (
    <>
      {chores.map((chore) => {
        const rawDaysSince = calculateDaysSince(chore.lastCompletedDate)
        // If completed in the future, treat as clean (0 days since)
        const daysSinceLastDone = Math.max(0, rawDaysSince)
        const totalDays = frequencyToDays(chore.frequency, chore.frequencyUnit)
        const daysRemaining = totalDays - daysSinceLastDone

        // Calculate unified color for entire chore based on overall progress
        const choreColor = getChoreColor(daysSinceLastDone, totalDays)

        // Determine which display mode to use
        const displayMode =
          daysRemaining >= DIMENSIONS.FINAL_WEEK_DAYS &&
          totalDays > DIMENSIONS.FINAL_WEEK_DAYS
            ? 'progressBar'
            : totalDays <= DIMENSIONS.FINAL_WEEK_DAYS
              ? 'daySquares'
              : 'hybrid'

        return (
          <div key={chore.id} className="mb-2 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              {/* Chore name and frequency */}
              <div className="flex items-center justify-between sm:w-64 sm:shrink-0 sm:justify-start">
                <button
                  onClick={() => onChoreClick(chore.id)}
                  className="text-left text-base font-medium text-text-muted transition-colors hover:text-primary-light sm:text-lg"
                >
                  {chore.name}
                </button>
                <span className="ml-2 text-xs whitespace-nowrap text-text-muted sm:text-sm">
                  Every {chore.frequency} {chore.frequencyUnit}
                </span>
              </div>

              {/* Progress visualization */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {displayMode === 'progressBar' && (
                  // Mode 1: Single progress bar for chores with >7 days remaining
                  <div className="flex flex-col">
                    {renderProgressBar(
                      daysSinceLastDone,
                      totalDays,
                      choreColor,
                      false,
                      totalDays,
                    )}
                    {/* Subtext labels - Mobile */}
                    <div
                      className="relative mt-1 h-4 text-xs text-text-muted sm:hidden"
                      style={{ width: `${FULL_BAR_WIDTH.mobile}px` }}
                    >
                      <div
                        className="absolute flex justify-center"
                        style={{ left: 0, width: `${MAX_FILL_PERCENT}%` }}
                      >
                        {totalDays - DIMENSIONS.FINAL_WEEK_DAYS} days
                      </div>
                      <div
                        className="absolute flex justify-center"
                        style={{ right: 0, width: `${100 - MAX_FILL_PERCENT}%` }}
                      >
                        {DIMENSIONS.FINAL_WEEK_DAYS} days
                      </div>
                    </div>
                    {/* Subtext labels - Desktop */}
                    <div
                      className="relative mt-1 hidden h-4 text-xs text-text-muted sm:block"
                      style={{ width: `${FULL_BAR_WIDTH.desktop}px` }}
                    >
                      <div
                        className="absolute flex justify-center"
                        style={{ left: 0, width: `${MAX_FILL_PERCENT}%` }}
                      >
                        {totalDays - DIMENSIONS.FINAL_WEEK_DAYS} days
                      </div>
                      <div
                        className="absolute flex justify-center"
                        style={{ right: 0, width: `${100 - MAX_FILL_PERCENT}%` }}
                      >
                        {DIMENSIONS.FINAL_WEEK_DAYS} days
                      </div>
                    </div>
                  </div>
                )}

                {displayMode === 'daySquares' && (
                  // Mode 2: Individual day squares only (for short-duration chores)
                  <div className="flex flex-col">
                    <div className="flex gap-1.5 sm:gap-2">
                      {renderDaySquares(
                        0,
                        totalDays,
                        daysSinceLastDone,
                        choreColor,
                      )}
                    </div>
                    {/* Subtext label */}
                    <div 
                      className="mt-1 flex text-xs text-text-muted"
                      style={{
                        width: totalDays === 1 
                          ? `${DIMENSIONS.SQUARE_SIZE_MOBILE}px` 
                          : `${2 * DIMENSIONS.SQUARE_SIZE_MOBILE + DIMENSIONS.GAP_MOBILE}px`
                      }}
                    >
                      <div 
                        className="flex justify-center sm:hidden"
                        style={{
                          width: totalDays === 1 
                            ? `${DIMENSIONS.SQUARE_SIZE_MOBILE}px` 
                            : `${2 * DIMENSIONS.SQUARE_SIZE_MOBILE + DIMENSIONS.GAP_MOBILE}px`
                        }}
                      >
                        {totalDays} days
                      </div>
                      <div 
                        className="hidden justify-center sm:flex"
                        style={{
                          width: totalDays === 1 
                            ? `${DIMENSIONS.SQUARE_SIZE_DESKTOP}px` 
                            : `${2 * DIMENSIONS.SQUARE_SIZE_DESKTOP + DIMENSIONS.GAP_DESKTOP}px`
                        }}
                      >
                        {totalDays} days
                      </div>
                    </div>
                  </div>
                )}

                {displayMode === 'hybrid' && (
                  // Mode 3: Squished progress bar + 7 day squares
                  <div className="flex w-full flex-col">
                    <div className="flex gap-1.5 sm:gap-2">
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
                    {/* Subtext labels - Mobile */}
                    <div
                      className="relative mt-1 flex h-4 items-center text-xs text-text-muted sm:hidden"
                      style={{ width: `${FULL_BAR_WIDTH.mobile}px` }}
                    >
                      <div
                        className="flex justify-center"
                        style={{ width: `${SQUISHED_BAR_WIDTH.mobile}px` }}
                      >
                        {totalDays - DIMENSIONS.FINAL_WEEK_DAYS} days
                      </div>
                      {/* Gap space with centered divider */}
                      <div
                        className="flex justify-center"
                        style={{ width: `${DIMENSIONS.GAP_MOBILE}px` }}
                      >
                        <div className="h-3 w-0.5 bg-border-strong opacity-50" />
                      </div>
                      <div
                        className="flex justify-center"
                        style={{ width: `${SQUISHED_BAR_WIDTH.mobile}px` }}
                      >
                        {DIMENSIONS.FINAL_WEEK_DAYS} days
                      </div>
                    </div>
                    {/* Subtext labels - Desktop */}
                    <div
                      className="relative mt-1 hidden h-4 items-center text-xs text-text-muted sm:flex"
                      style={{ width: `${FULL_BAR_WIDTH.desktop}px` }}
                    >
                      <div
                        className="flex justify-center"
                        style={{ width: `${SQUISHED_BAR_WIDTH.desktop}px` }}
                      >
                        {totalDays - DIMENSIONS.FINAL_WEEK_DAYS} days
                      </div>
                      {/* Gap space with centered divider */}
                      <div
                        className="flex justify-center"
                        style={{ width: `${DIMENSIONS.GAP_DESKTOP}px` }}
                      >
                        <div className="h-3 w-0.5 bg-border-strong opacity-50" />
                      </div>
                      <div
                        className="flex justify-center"
                        style={{ width: `${SQUISHED_BAR_WIDTH.desktop}px` }}
                      >
                        {DIMENSIONS.FINAL_WEEK_DAYS} days
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
