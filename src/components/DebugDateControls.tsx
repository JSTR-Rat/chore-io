import {
  useNavigate,
  useSearch,
  useLoaderData,
  useRouter,
} from '@tanstack/react-router';
import { formatDateForParam, formatDateDisplay } from '@/utils/date';

export function DebugDateControls() {
  const navigate = useNavigate();
  const router = useRouter();
  const search = useSearch({ from: '/_authed/dashboard' });
  const { isAdmin } = useLoaderData({ from: '/_authed/dashboard' });

  // Don't render anything if not enabled (user is not admin)
  if (!isAdmin) {
    return null;
  }

  const currentDate = search.date
    ? new Date(search.date + 'T12:00:00')
    : new Date();

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, date: formatDateForParam(newDate) }),
    });
    router.invalidate();
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, date: formatDateForParam(newDate) }),
    });
    router.invalidate();
  };

  const resetToToday = () => {
    const today = formatDateForParam(new Date());
    navigate({
      to: '.',
      search: (prev) => {
        return { ...prev, date: today };
      },
    });
    router.invalidate();
  };

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
          {formatDateDisplay(currentDate)}
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
  );
}
