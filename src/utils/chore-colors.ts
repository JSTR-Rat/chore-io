/**
 * Chore color configuration
 * This is the single source of truth for chore colors and progress thresholds
 */

export const COLOR_PALETTE = [
  {color: '#10b981', limit: 0.65},  // emerald-500: calm, plenty of time remaining
  {color: '#84cc16', limit: 0.80},  // lime-500: still comfortable, no urgency
  {color: '#eab308', limit: 0.90},  // yellow-500: attention needed, getting close
  {color: '#f97316', limit: 0.97},  // orange-500: urgent, deadline approaching
  {color: '#ef4444', limit: 1.0},   // red-500: critical, overdue or very close
] as const;

/**
 * Get the appropriate color for a chore based on its progress
 * @param daysSince - Number of days since the chore was last completed
 * @param totalDays - Total number of days in the chore's frequency period
 * @returns The color as a hex string
 */
export function getChoreColor(daysSince: number, totalDays: number): string {
  // Calculate progress from 0 to 1 based on how close to due date
  const progress = Math.min(daysSince / totalDays, 1)

  // Return color based on progress thresholds
  for (const { color, limit } of COLOR_PALETTE) {
    if (progress <= limit) return color;
  }
  // Fallback in case progress > 1
  return COLOR_PALETTE[COLOR_PALETTE.length - 1].color;
}
