// src/components/ChoresBoard.tsx

interface Chore {
  id: string;
  name: string;
  daysSinceLastDone: number;
  maxDaysBetweenChores: number;
}

interface ChoresBoardProps {
  currentDate: Date;
  chores: Chore[];
  onPreviousDay: () => void;
  onNextDay: () => void;
  onChoreClick: (choreId: string) => void;
  formatDate: (date: Date) => string;
}

export function ChoresBoard({
  currentDate,
  chores,
  onPreviousDay,
  onNextDay,
  onChoreClick,
  formatDate,
}: ChoresBoardProps) {
  const getBoxColor = (index: number, maxDays: number) => {
    // Calculate progress from 0 to 1
    const progress = index / (maxDays - 1);

    // Interpolate from green (0, 255, 0) to red (255, 0, 0)
    const red = Math.round(progress * 255);
    const green = Math.round((1 - progress) * 255);

    return `rgb(${red}, ${green}, 0)`;
  };

  const getChoreColor = (daysSince: number, maxDays: number) => {
    // Calculate progress from 0 to 1 based on how close to max
    const progress = Math.min(daysSince / maxDays, 1);

    // Interpolate from green (0, 255, 0) to red (255, 0, 0)
    const red = Math.round(progress * 255);
    const green = Math.round((1 - progress) * 255);

    return `rgb(${red}, ${green}, 0)`;
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-center">Chores</h1>
      <div className="flex items-center justify-center gap-4 my-4">
        <button
          onClick={onPreviousDay}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ← Previous Day
        </button>
        <div className="text-lg font-semibold">{formatDate(currentDate)}</div>
        <button
          onClick={onNextDay}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Next Day →
        </button>
      </div>
      {chores.map((chore) => (
        <div key={chore.id} className="flex items-center py-3 mb-2">
          <button
            onClick={() => onChoreClick(chore.id)}
            className="w-40 text-right text-lg font-medium hover:text-blue-400"
          >
            {chore.name}
          </button>
          <span className="ml-4 inline-flex">
            {Array.from({ length: chore.maxDaysBetweenChores }).map(
              (_, idx) => (
                <span
                  key={idx}
                  className="inline-block w-6 h-6 border-2 border-white mr-2"
                  style={{
                    borderRadius: '3px',
                    backgroundColor:
                      idx < chore.daysSinceLastDone
                        ? getBoxColor(idx, chore.maxDaysBetweenChores)
                        : 'transparent',
                  }}
                ></span>
              )
            )}
          </span>
        </div>
      ))}

      <div className="mt-8 border-t border-gray-500 pt-8">
        <h2 className="text-xl font-bold text-center mb-4">
          Alternative View (Uniform Color)
        </h2>
        {chores.map((chore) => (
          <div key={`alt-${chore.id}`} className="flex items-center py-3 mb-2">
            <button
              onClick={() => onChoreClick(chore.id)}
              className="w-40 text-right text-lg font-medium hover:text-blue-400"
            >
              {chore.name}
            </button>
            <span className="ml-4 inline-flex">
              {Array.from({ length: chore.maxDaysBetweenChores }).map(
                (_, idx) => (
                  <span
                    key={idx}
                    className="inline-block w-6 h-6 border-2 border-white mr-2"
                    style={{
                      borderRadius: '3px',
                      backgroundColor:
                        idx < chore.daysSinceLastDone
                          ? getChoreColor(
                              chore.daysSinceLastDone,
                              chore.maxDaysBetweenChores
                            )
                          : 'transparent',
                    }}
                  ></span>
                )
              )}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
