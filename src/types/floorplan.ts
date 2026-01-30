/**
 * Floorplan Type Definitions
 *
 * These types define the structure for property floorplan data.
 * All coordinates are normalized to 0-1 range for resolution independence.
 */

/**
 * A point in normalized coordinate space (0-1)
 * x: horizontal position (0 = left, 1 = right)
 * y: vertical position (0 = top, 1 = bottom)
 */
export type Point = {
  x: number // 0–1
  y: number // 0–1
}

/**
 * A room represented as a closed polygon
 * - Minimum 3 points required
 * - Points define vertices in order (clockwise or counter-clockwise)
 * - Polygon is implicitly closed (last point connects to first)
 */
export type Room = {
  id: string
  name: string
  points: Point[] // closed polygon, min 3 points
}

/**
 * Complete floorplan data for a property
 */
export type PropertyFloorplan = {
  rooms: Room[]
  aspectRatio: number // width / height
}

/**
 * Validation helper: Check if a point is within valid 0-1 bounds
 */
export function isValidPoint(point: Point): boolean {
  return point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1
}

/**
 * Validation helper: Check if a room has valid structure
 */
export function isValidRoom(room: Room): boolean {
  return (
    room.id.length > 0 &&
    room.name.length > 0 &&
    room.points.length >= 3 &&
    room.points.every(isValidPoint)
  )
}

/**
 * Validation helper: Check if floorplan data is valid
 */
export function isValidFloorplan(floorplan: PropertyFloorplan): boolean {
  return floorplan.aspectRatio > 0 && floorplan.rooms.every(isValidRoom)
}
