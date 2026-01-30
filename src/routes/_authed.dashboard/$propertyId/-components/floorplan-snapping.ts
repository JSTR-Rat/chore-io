import type { Point } from '@/types/floorplan'

/**
 * Configuration for snapping behavior
 */
export interface SnappingConfig {
  /** Enable/disable grid snapping */
  gridEnabled: boolean
  /** Grid size in normalized coordinates (0-1) */
  gridSize: number
  /** Enable/disable angle snapping */
  angleEnabled: boolean
  /** Angles to snap to (in degrees) */
  snapAngles: number[]
  /** Distance threshold for angle snapping (in normalized units) */
  angleSnapThreshold: number
}

/**
 * Default snapping configuration
 */
export const DEFAULT_SNAPPING_CONFIG: SnappingConfig = {
  gridEnabled: true,
  gridSize: 0.025, // 40 grid points in each dimension (1 / 0.025 = 40)
  angleEnabled: true,
  snapAngles: [0, 45, 90, 135, 180, 225, 270, 315], // All 45-degree increments
  angleSnapThreshold: 0.1, // How far the point needs to move before angle snapping kicks in
}

/**
 * Snap a point to the nearest grid position
 */
function snapToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  }
}

/**
 * Calculate the angle in degrees between two points
 */
function calculateAngle(from: Point, to: Point): number {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const angleRad = Math.atan2(dy, dx)
  const angleDeg = (angleRad * 180) / Math.PI
  // Normalize to 0-360
  return angleDeg < 0 ? angleDeg + 360 : angleDeg
}

/**
 * Find the nearest snap angle
 */
function findNearestSnapAngle(angle: number, snapAngles: number[]): number {
  let nearest = snapAngles[0]
  let minDiff = Math.abs(angle - nearest)

  for (const snapAngle of snapAngles) {
    const diff = Math.abs(angle - snapAngle)
    if (diff < minDiff) {
      minDiff = diff
      nearest = snapAngle
    }
  }

  return nearest
}

/**
 * Snap a point to a specific angle relative to an anchor point
 */
function snapToAngle(
  point: Point,
  anchorPoint: Point,
  snapAngles: number[],
  threshold: number,
): Point {
  const dx = point.x - anchorPoint.x
  const dy = point.y - anchorPoint.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Only snap if we've moved far enough from the anchor
  if (distance < threshold) {
    return point
  }

  const currentAngle = calculateAngle(anchorPoint, point)
  const snappedAngle = findNearestSnapAngle(currentAngle, snapAngles)

  // Convert snapped angle back to radians
  const snappedAngleRad = (snappedAngle * Math.PI) / 180

  // Calculate new point position at the snapped angle
  return {
    x: anchorPoint.x + distance * Math.cos(snappedAngleRad),
    y: anchorPoint.y + distance * Math.sin(snappedAngleRad),
  }
}

/**
 * Apply snapping to a point based on configuration
 *
 * @param point - The point to snap
 * @param anchorPoint - Optional anchor point for angle snapping (typically the previous point in a polygon)
 * @param config - Snapping configuration
 * @returns The snapped point
 */
export function applySnapping(
  point: Point,
  anchorPoint: Point | null,
  config: SnappingConfig = DEFAULT_SNAPPING_CONFIG,
): Point {
  let snappedPoint = { ...point }

  // Apply angle snapping first (if we have an anchor point)
  if (config.angleEnabled && anchorPoint) {
    snappedPoint = snapToAngle(
      snappedPoint,
      anchorPoint,
      config.snapAngles,
      config.angleSnapThreshold,
    )
  }

  // Apply grid snapping
  if (config.gridEnabled) {
    snappedPoint = snapToGrid(snappedPoint, config.gridSize)
  }

  // Ensure point stays within bounds [0, 1]
  snappedPoint.x = Math.max(0, Math.min(1, snappedPoint.x))
  snappedPoint.y = Math.max(0, Math.min(1, snappedPoint.y))

  return snappedPoint
}
