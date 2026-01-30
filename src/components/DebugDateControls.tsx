import { useDebugDate } from '@/contexts/DebugDateContext'

export function DebugDateControls() {
  const {
    debugDate,
    isEnabled,
    goToPreviousDay,
    goToNextDay,
    resetToToday,
    formatDate,
  } = useDebugDate()

  // Don't render anything if not enabled (user is not admin)
  if (!isEnabled) {
    return null
  }

  return (
    <div className="mb-6 rounded-lg border-2 border-dashed border-yellow-500 bg-yellow-500/10 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-wide text-yellow-500 uppercase">
          👤 Admin - Date Debugger
        </span>
        <button
          onClick={resetToToday}
          className="rounded bg-yellow-500/20 px-2 py-1 text-xs text-yellow-500 transition-colors hover:bg-yellow-500/30"
        >
          Reset to Today
        </button>
      </div>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={goToPreviousDay}
          className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-text transition-colors hover:border-yellow-500"
        >
          ← Previous Day
        </button>
        <div className="min-w-[200px] text-center text-base font-semibold text-text">
          {formatDate(debugDate)}
        </div>
        <button
          onClick={goToNextDay}
          className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-text transition-colors hover:border-yellow-500"
        >
          Next Day →
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-text-muted">
        This controls the "current date" used to calculate days since last
        completion
      </p>
    </div>
  )
}
