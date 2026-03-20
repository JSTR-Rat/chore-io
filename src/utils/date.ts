/**
 * Format a date as yyyy-mm-dd for use in URL query params.
 */
export function formatDateForParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a yyyy-mm-dd string into a Date. Returns null if invalid.
 */
export function parseDateParam(value: string | undefined): Date | null {
  if (!value || typeof value !== 'string') return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(
    Date.UTC(parseInt(year!, 10), parseInt(month!, 10) - 1, parseInt(day!, 10)),
  );
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Format a date for display (e.g. "Wed, Jan 15, 2025").
 */
export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getTimezoneAgnosticDate(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
  );
}

/**
 * Calculate the number of days since a given date.
 * @param lastCompleted - The date to calculate days since. If null, returns 999.
 * @param currentDate - The current date.
 * @returns The number of days since the given date. If the last completed date is null, returns 999.
 */
export function calculateDaysSince(
  lastCompleted: Date | null,
  currentDate: Date,
): number {
  if (!lastCompleted) {
    return 999; // Never completed
  }
  const diffTime = currentDate.getTime() - lastCompleted.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if two dates are the same day.
 * @param date1 - The first date.
 * @param date2 - The second date.
 * @returns True if the dates are the same day, false otherwise.
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  const date1UTC = Date.UTC(
    date1.getFullYear(),
    date1.getMonth(),
    date1.getDate(),
    0,
    0,
    0,
    0,
  );
  const date2UTC = Date.UTC(
    date2.getFullYear(),
    date2.getMonth(),
    date2.getDate(),
    0,
    0,
    0,
    0,
  );
  return date1UTC === date2UTC;
}

/**
 * Convert a frequency and unit to the number of days.
 * @param frequency - The frequency of the chore.
 * @param unit - The unit of the frequency.
 * @returns The number of days in the frequency.
 */
export function frequencyToDays(
  frequency: number,
  unit: 'days' | 'weeks' | 'months',
): number {
  switch (unit) {
    case 'days':
      return frequency;
    case 'weeks':
      return frequency * 7;
    case 'months':
      return frequency * 30;
  }
}
