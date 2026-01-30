import { useRef, useEffect, useState, useCallback } from 'react'
import type { Room, Point } from '@/types/floorplan'
import { isValidPoint } from '@/types/floorplan'
import { applySnapping, DEFAULT_SNAPPING_CONFIG } from './floorplan-snapping'

interface FloorplanCanvasProps {
  rooms: Room[]
  selectedRoomId: string | null
  isDrawing: boolean
  onRoomSelect: (roomId: string | null) => void
  onRoomUpdate: (roomId: string, updates: Partial<Room>) => void
  onDrawingComplete: () => void
}

export function FloorplanCanvas({
  rooms,
  selectedRoomId,
  isDrawing,
  onRoomSelect,
  onRoomUpdate,
  onDrawingComplete,
}: FloorplanCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  // Always use a square viewBox for the editor (1:1 aspect ratio)
  // This ensures grid snapping works correctly in both dimensions
  const [viewBox] = useState({ width: 1000, height: 1000 })
  const [isMobile, setIsMobile] = useState(() => {
    // Initialize with current window size if available
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768
    }
    return false
  })
  const [draggingPoint, setDraggingPoint] = useState<{
    roomId: string
    pointIndex: number
  } | null>(null)
  const [hoverPoint, setHoverPoint] = useState<{
    roomId: string
    pointIndex: number
  } | null>(null)
  const [hoverMidpoint, setHoverMidpoint] = useState<{
    roomId: string
    edgeIndex: number
  } | null>(null)
  const [draggingMidpoint, setDraggingMidpoint] = useState<{
    roomId: string
    edgeIndex: number
  } | null>(null)
  const [draggingRoom, setDraggingRoom] = useState<{
    roomId: string
    startPoint: Point
  } | null>(null)

  // Local state for live dragging preview (to avoid parent re-renders)
  const [localRoomPoints, setLocalRoomPoints] = useState<{
    roomId: string
    points: Point[]
  } | null>(null)

  // Ref to the currently dragging circle for direct DOM manipulation
  const draggingCircleRef = useRef<SVGCircleElement | null>(null)
  const currentDragPosition = useRef<Point | null>(null)
  const isNewlyCreatedPoint = useRef(false)

  // Refs for all point circles when dragging an entire room
  const roomPointCircles = useRef<Map<string, SVGCircleElement>>(new Map())

  // Track if we just finished dragging to prevent click deselection
  const justFinishedDragging = useRef(false)

  // Long press detection for mobile (to delete points)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const longPressStartPos = useRef<{ x: number; y: number } | null>(null)
  const hasMovedBeyondThreshold = useRef(false)
  const [longPressingPoint, setLongPressingPoint] = useState<{
    roomId: string
    pointIndex: number
  } | null>(null)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Convert SVG coordinates to normalized 0-1 coordinates
  const svgToNormalized = useCallback(
    (
      clientX: number,
      clientY: number,
      anchorPoint: Point | null = null,
      enableAngleSnap: boolean = false,
    ): Point | null => {
      if (!svgRef.current) return null

      const svg = svgRef.current
      const rect = svg.getBoundingClientRect()
      const x = (clientX - rect.left) / rect.width
      const y = (clientY - rect.top) / rect.height

      const rawPoint = { x, y }
      if (!isValidPoint(rawPoint)) return null

      // Apply snapping with angle snapping only when enabled
      const snappedPoint = applySnapping(rawPoint, anchorPoint, {
        ...DEFAULT_SNAPPING_CONFIG,
        angleEnabled: enableAngleSnap,
      })
      return snappedPoint
    },
    [],
  )

  // Helper to get coordinates from mouse or touch event
  const getEventCoordinates = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if ('touches' in e && e.touches.length > 0) {
        return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }
      } else if ('changedTouches' in e && e.changedTouches.length > 0) {
        return {
          clientX: e.changedTouches[0].clientX,
          clientY: e.changedTouches[0].clientY,
        }
      } else {
        return {
          clientX: (e as React.MouseEvent).clientX,
          clientY: (e as React.MouseEvent).clientY,
        }
      }
    },
    [],
  )

  // Handle click/tap for drawing new room or deselecting
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
      // If we just finished dragging, ignore this click to prevent deselection
      if (justFinishedDragging.current) {
        justFinishedDragging.current = false
        return
      }

      // If we're drawing, add a point
      if (isDrawing && selectedRoomId) {
        const room = rooms.find((r) => r.id === selectedRoomId)
        if (!room) return

        // Get anchor point for angle snapping (the last point in the polygon)
        const anchorPoint =
          room.points.length > 0 ? room.points[room.points.length - 1] : null
        const { clientX, clientY } = getEventCoordinates(e)
        const enableAngleSnap = 'shiftKey' in e ? e.shiftKey : false
        const point = svgToNormalized(
          clientX,
          clientY,
          anchorPoint,
          enableAngleSnap,
        )
        if (!point) return

        // Add new point
        const newPoints = [...room.points, point]
        onRoomUpdate(selectedRoomId, {
          points: newPoints,
        })

        // Auto-exit drawing mode after 3 points are placed
        if (newPoints.length === 3) {
          onDrawingComplete()
        }
      } else {
        // If not drawing and clicking on canvas background, deselect
        const target = e.target as SVGElement
        if (
          e.target === e.currentTarget ||
          target.getAttribute('data-background') === 'true'
        ) {
          onRoomSelect(null)
        }
      }
    },
    [
      isDrawing,
      selectedRoomId,
      rooms,
      svgToNormalized,
      onRoomUpdate,
      onDrawingComplete,
      onRoomSelect,
      getEventCoordinates,
    ],
  )

  // Handle point dragging
  const handlePointMouseDown = useCallback(
    (
      e: React.MouseEvent | React.TouchEvent,
      roomId: string,
      pointIndex: number,
    ) => {
      e.stopPropagation()
      e.preventDefault()
      // Only allow dragging points on the selected room
      if (roomId !== selectedRoomId) return

      // For touch events, start long press timer
      if ('touches' in e) {
        const { clientX, clientY } = getEventCoordinates(e)
        longPressStartPos.current = { x: clientX, y: clientY }
        hasMovedBeyondThreshold.current = false

        longPressTimer.current = setTimeout(() => {
          // Only show delete dialog if we haven't moved beyond threshold
          if (!hasMovedBeyondThreshold.current) {
            setLongPressingPoint({ roomId, pointIndex })
            // Clear dragging state since we're showing delete dialog
            setDraggingPoint(null)
            // Vibrate on supported devices
            if (navigator.vibrate) {
              navigator.vibrate(50)
            }
          }
        }, 500) // 500ms long press
      }

      setDraggingPoint({ roomId, pointIndex })
    },
    [selectedRoomId, getEventCoordinates],
  )

  // Handle point removal via right-click or long press
  const handlePointContextMenu = useCallback(
    (e: React.MouseEvent, roomId: string, pointIndex: number) => {
      e.preventDefault()
      e.stopPropagation()
      if (isDrawing) return
      // Only allow removing points on the selected room
      if (roomId !== selectedRoomId) return

      const room = rooms.find((r) => r.id === roomId)
      if (!room) return

      // Don't allow removing if it would leave less than 3 points
      if (room.points.length <= 3) {
        alert('A room must have at least 3 points')
        return
      }

      const newPoints = room.points.filter((_, i) => i !== pointIndex)
      onRoomUpdate(roomId, { points: newPoints })
    },
    [isDrawing, selectedRoomId, rooms, onRoomUpdate],
  )

  // Handle long press point deletion (for mobile)
  const handleConfirmDeletePoint = useCallback(() => {
    if (!longPressingPoint) return

    const room = rooms.find((r) => r.id === longPressingPoint.roomId)
    if (!room) return

    // Don't allow removing if it would leave less than 3 points
    if (room.points.length <= 3) {
      alert('A room must have at least 3 points')
      setLongPressingPoint(null)
      return
    }

    const newPoints = room.points.filter(
      (_, i) => i !== longPressingPoint.pointIndex,
    )
    onRoomUpdate(longPressingPoint.roomId, { points: newPoints })
    setLongPressingPoint(null)
  }, [longPressingPoint, rooms, onRoomUpdate])

  // Handle midpoint mouse/touch down (start creating new point)
  const handleMidpointMouseDown = useCallback(
    (
      e: React.MouseEvent | React.TouchEvent,
      roomId: string,
      edgeIndex: number,
    ) => {
      e.stopPropagation()
      e.preventDefault()
      if (isDrawing) return
      // Only allow adding points on the selected room
      if (roomId !== selectedRoomId) return
      setDraggingMidpoint({ roomId, edgeIndex })
    },
    [isDrawing, selectedRoomId],
  )

  // Handle polygon mouse/touch down (start dragging entire room)
  const handlePolygonMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent, roomId: string) => {
      e.stopPropagation()
      e.preventDefault()
      if (isDrawing) return
      // Only allow dragging the selected room
      if (roomId !== selectedRoomId) return

      const { clientX, clientY } = getEventCoordinates(e)
      const startPoint = svgToNormalized(clientX, clientY)
      if (!startPoint) return

      setDraggingRoom({ roomId, startPoint })
    },
    [isDrawing, selectedRoomId, svgToNormalized, getEventCoordinates],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
      const { clientX, clientY } = getEventCoordinates(e)
      const enableAngleSnap = 'shiftKey' in e ? e.shiftKey : false

      // Check if user has moved beyond threshold (5px) for long press
      if (longPressTimer.current && longPressStartPos.current) {
        const dx = clientX - longPressStartPos.current.x
        const dy = clientY - longPressStartPos.current.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 5) {
          hasMovedBeyondThreshold.current = true
          clearTimeout(longPressTimer.current)
          longPressTimer.current = null
          longPressStartPos.current = null
        }
      }

      // Handle dragging entire room
      if (draggingRoom) {
        const room = rooms.find((r) => r.id === draggingRoom.roomId)
        if (!room) return

        const currentPoint = svgToNormalized(clientX, clientY)
        if (!currentPoint) return

        // Calculate offset from start
        const offsetX = currentPoint.x - draggingRoom.startPoint.x
        const offsetY = currentPoint.y - draggingRoom.startPoint.y

        // Always use the original room points as the base
        const basePoints = room.points

        // Move all points by the offset
        const newPoints = basePoints.map((p, index) => {
          const newPoint = {
            x: Math.max(0, Math.min(1, p.x + offsetX)),
            y: Math.max(0, Math.min(1, p.y + offsetY)),
          }

          // Directly update the circle position for instant feedback
          const circleKey = `${draggingRoom.roomId}-${index}`
          const circleEl = roomPointCircles.current.get(circleKey)
          if (circleEl) {
            circleEl.setAttribute('cx', String(newPoint.x * viewBox.width))
            circleEl.setAttribute('cy', String(newPoint.y * viewBox.height))
          }

          return newPoint
        })

        // Update local state for polygon rendering
        setLocalRoomPoints({ roomId: draggingRoom.roomId, points: newPoints })
        return
      }

      // Handle dragging midpoint (creating new point) - check this FIRST
      if (draggingMidpoint) {
        const room = rooms.find((r) => r.id === draggingMidpoint.roomId)
        if (!room) return

        // Get anchor point for angle snapping (the point before the edge we're splitting)
        const anchorPoint = room.points[draggingMidpoint.edgeIndex]
        const point = svgToNormalized(
          clientX,
          clientY,
          anchorPoint,
          enableAngleSnap,
        )
        if (!point) return

        // Insert new point and continue dragging it
        const newPoints = [
          ...room.points.slice(0, draggingMidpoint.edgeIndex + 1),
          point,
          ...room.points.slice(draggingMidpoint.edgeIndex + 1),
        ]

        // Store current position
        currentDragPosition.current = point
        isNewlyCreatedPoint.current = true

        // Update local state and switch to dragging mode
        setLocalRoomPoints({
          roomId: draggingMidpoint.roomId,
          points: newPoints,
        })
        setDraggingPoint({
          roomId: draggingMidpoint.roomId,
          pointIndex: draggingMidpoint.edgeIndex + 1,
        })
        setDraggingMidpoint(null)
        return
      }

      // Handle dragging existing point (or newly created point)
      if (draggingPoint) {
        const room = rooms.find((r) => r.id === draggingPoint.roomId)
        if (!room) return

        // Use local points if available (for newly created point)
        const basePoints =
          localRoomPoints?.roomId === draggingPoint.roomId
            ? localRoomPoints.points
            : room.points

        // Get anchor point for angle snapping (the previous point in the polygon)
        const prevIndex =
          draggingPoint.pointIndex === 0
            ? basePoints.length - 1
            : draggingPoint.pointIndex - 1
        const anchorPoint = basePoints[prevIndex]

        const point = svgToNormalized(
          clientX,
          clientY,
          anchorPoint,
          enableAngleSnap,
        )
        if (!point) return

        const newPoints = [...basePoints]
        newPoints[draggingPoint.pointIndex] = point

        // Store current position for direct DOM manipulation
        currentDragPosition.current = point

        // Directly update the circle position for instant feedback
        if (draggingCircleRef.current) {
          draggingCircleRef.current.setAttribute(
            'cx',
            String(point.x * viewBox.width),
          )
          draggingCircleRef.current.setAttribute(
            'cy',
            String(point.y * viewBox.height),
          )
        }

        // Update local state for polygon rendering
        setLocalRoomPoints({ roomId: draggingPoint.roomId, points: newPoints })
        return
      }
    },
    [
      draggingPoint,
      draggingMidpoint,
      draggingRoom,
      rooms,
      localRoomPoints,
      svgToNormalized,
      viewBox.width,
      viewBox.height,
      getEventCoordinates,
    ],
  )

  const handleMouseUp = useCallback(() => {
    // Clear long press timer and state
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    longPressStartPos.current = null
    hasMovedBeyondThreshold.current = false

    // Set flag if we were dragging something
    if (draggingPoint || draggingMidpoint || draggingRoom) {
      justFinishedDragging.current = true
      // Reset the flag after a short delay to allow intentional clicks
      setTimeout(() => {
        justFinishedDragging.current = false
      }, 100)
    }

    // Commit the local changes to parent state
    if (localRoomPoints) {
      onRoomUpdate(localRoomPoints.roomId, { points: localRoomPoints.points })
      setLocalRoomPoints(null)
    }

    // Clear refs
    draggingCircleRef.current = null
    currentDragPosition.current = null
    isNewlyCreatedPoint.current = false
    roomPointCircles.current.clear()

    setDraggingPoint(null)
    setDraggingMidpoint(null)
    setDraggingRoom(null)
  }, [
    localRoomPoints,
    onRoomUpdate,
    draggingPoint,
    draggingMidpoint,
    draggingRoom,
  ])

  return (
    <div className="flex h-full touch-none flex-col rounded-lg border border-border bg-surface p-2 shadow-md backdrop-blur-sm sm:p-4">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
        className="h-full w-full cursor-crosshair"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleCanvasClick}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onTouchCancel={handleMouseUp}
      >
        {/* Grid background - square cells in SVG space */}
        <defs>
          {(() => {
            // Create square cells in SVG coordinate space (40 cells in each dimension)
            // Since viewBox is always 1000x1000, gridCellSize is always 25
            const gridCellSize = 25 // 1000 / 40 = 25
            return (
              <pattern
                id="grid"
                width={gridCellSize}
                height={gridCellSize}
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx={gridCellSize / 2}
                  cy={gridCellSize / 2}
                  r="0.6"
                  fill="rgba(96, 165, 250, 0.25)"
                />
              </pattern>
            )
          })()}
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(17, 24, 39, 0.5)"
          data-background="true"
        />
        <rect
          width="100%"
          height="100%"
          fill="url(#grid)"
          data-background="true"
        />

        {/* Render rooms */}
        {rooms.map((room) => {
          const isSelected = room.id === selectedRoomId
          // Use local points if we're actively dragging this room's points
          const displayPoints =
            localRoomPoints?.roomId === room.id
              ? localRoomPoints.points
              : room.points
          const polygonPoints = displayPoints
            .map((p) => `${p.x * viewBox.width},${p.y * viewBox.height}`)
            .join(' ')

          return (
            <g key={room.id}>
              {/* Room polygon */}
              {displayPoints.length >= 3 && (
                <polygon
                  points={polygonPoints}
                  fill={
                    isSelected
                      ? 'rgba(59, 130, 246, 0.3)'
                      : 'rgba(148, 163, 184, 0.2)'
                  }
                  stroke={isSelected ? '#3b82f6' : 'rgba(107, 114, 128, 0.5)'}
                  strokeWidth="2"
                  className={
                    isSelected && !isDrawing
                      ? 'cursor-move transition-colors hover:fill-[rgba(59,130,246,0.4)]'
                      : 'cursor-pointer transition-colors hover:fill-[rgba(59,130,246,0.4)]'
                  }
                  onClick={(e) => {
                    e.stopPropagation()
                    onRoomSelect(room.id)
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation()
                    onRoomSelect(room.id)
                  }}
                  onMouseDown={(e) => {
                    handlePolygonMouseDown(e, room.id)
                  }}
                  onTouchStart={(e) => {
                    handlePolygonMouseDown(e, room.id)
                  }}
                />
              )}

              {/* Edge midpoints - draggable to add points (only visible and interactive on selected room) */}
              {!isDrawing &&
                isSelected &&
                displayPoints.length >= 3 &&
                displayPoints.map((point, index) => {
                  const nextIndex = (index + 1) % displayPoints.length
                  const nextPoint = displayPoints[nextIndex]

                  // Use current drag position if one of these points is being dragged
                  const isDraggingThisPoint =
                    draggingPoint?.roomId === room.id &&
                    draggingPoint?.pointIndex === index
                  const isDraggingNextPoint =
                    draggingPoint?.roomId === room.id &&
                    draggingPoint?.pointIndex === nextIndex

                  const p1 =
                    isDraggingThisPoint && currentDragPosition.current
                      ? currentDragPosition.current
                      : point
                  const p2 =
                    isDraggingNextPoint && currentDragPosition.current
                      ? currentDragPosition.current
                      : nextPoint

                  const midX = ((p1.x + p2.x) / 2) * viewBox.width
                  const midY = ((p1.y + p2.y) / 2) * viewBox.height
                  const isHovered =
                    hoverMidpoint?.roomId === room.id &&
                    hoverMidpoint?.edgeIndex === index

                  return (
                    <g key={`midpoint-${index}`}>
                      {/* Larger invisible hit area for mobile */}
                      {isMobile && (
                        <circle
                          cx={midX}
                          cy={midY}
                          r={22}
                          fill="transparent"
                          className="cursor-crosshair touch-none"
                          onTouchStart={(e) =>
                            handleMidpointMouseDown(e, room.id, index)
                          }
                        />
                      )}
                      {/* Visible midpoint */}
                      <circle
                        cx={midX}
                        cy={midY}
                        r={
                          isMobile ? (isHovered ? 8 : 6.5) : isHovered ? 6 : 4.5
                        }
                        fill="rgba(96, 165, 250, 0.6)"
                        stroke="#ffffff"
                        strokeWidth={isMobile ? '2.5' : '1.5'}
                        className="pointer-events-none cursor-crosshair touch-none"
                        style={{ transition: 'r 0.15s' }}
                      />
                      {/* Desktop mouse events */}
                      {!isMobile && (
                        <circle
                          cx={midX}
                          cy={midY}
                          r={isHovered ? 6 : 4.5}
                          fill="transparent"
                          className="cursor-crosshair"
                          onMouseDown={(e) =>
                            handleMidpointMouseDown(e, room.id, index)
                          }
                          onMouseEnter={() =>
                            setHoverMidpoint({
                              roomId: room.id,
                              edgeIndex: index,
                            })
                          }
                          onMouseLeave={() => setHoverMidpoint(null)}
                        />
                      )}
                    </g>
                  )
                })}

              {/* Room points (vertices) - only show for selected room */}
              {isSelected &&
                displayPoints.map((point, index) => {
                  const isHovered =
                    hoverPoint?.roomId === room.id &&
                    hoverPoint?.pointIndex === index
                  const isDraggingPoint =
                    draggingPoint?.roomId === room.id &&
                    draggingPoint?.pointIndex === index
                  const isDraggingThisRoom = draggingRoom?.roomId === room.id

                  // Use current drag position for instant feedback
                  const displayX =
                    isDraggingPoint && currentDragPosition.current
                      ? currentDragPosition.current.x * viewBox.width
                      : point.x * viewBox.width
                  const displayY =
                    isDraggingPoint && currentDragPosition.current
                      ? currentDragPosition.current.y * viewBox.height
                      : point.y * viewBox.height

                  return (
                    <g key={`point-${room.id}-${index}`}>
                      {/* Larger invisible hit area for mobile */}
                      {isMobile && (
                        <circle
                          cx={displayX}
                          cy={displayY}
                          r={25}
                          fill="transparent"
                          className="cursor-move touch-none"
                          onTouchStart={(e) =>
                            handlePointMouseDown(e, room.id, index)
                          }
                        />
                      )}
                      {/* Visible point */}
                      <circle
                        ref={(el) => {
                          if (isDraggingPoint) {
                            draggingCircleRef.current = el
                          }
                          // Always store refs for selected room points (so they're ready when dragging starts)
                          if (isSelected) {
                            const circleKey = `${room.id}-${index}`
                            if (el) {
                              roomPointCircles.current.set(circleKey, el)
                            } else {
                              roomPointCircles.current.delete(circleKey)
                            }
                          }
                        }}
                        cx={displayX}
                        cy={displayY}
                        r={
                          isMobile
                            ? isDraggingPoint
                              ? 14
                              : isHovered
                                ? 12
                                : 10
                            : isDraggingPoint
                              ? 10
                              : isHovered
                                ? 8
                                : 6
                        }
                        fill="#3b82f6"
                        stroke="#ffffff"
                        strokeWidth={isMobile ? '3' : '2'}
                        className="pointer-events-none cursor-move touch-none"
                        style={{
                          transition:
                            isDraggingPoint || isDraggingThisRoom
                              ? 'none'
                              : 'all 0.15s',
                        }}
                      />
                      {/* Desktop mouse events on the visible circle */}
                      {!isMobile && (
                        <circle
                          cx={displayX}
                          cy={displayY}
                          r={isDraggingPoint ? 10 : isHovered ? 8 : 6}
                          fill="transparent"
                          className="cursor-move"
                          onMouseDown={(e) =>
                            handlePointMouseDown(e, room.id, index)
                          }
                          onContextMenu={(e) =>
                            handlePointContextMenu(e, room.id, index)
                          }
                          onMouseEnter={() =>
                            setHoverPoint({
                              roomId: room.id,
                              pointIndex: index,
                            })
                          }
                          onMouseLeave={() => setHoverPoint(null)}
                        />
                      )}
                    </g>
                  )
                })}

              {/* Room label */}
              {displayPoints.length >= 3 && (
                <text
                  x={
                    (displayPoints.reduce((sum, p) => sum + p.x, 0) /
                      displayPoints.length) *
                    viewBox.width
                  }
                  y={
                    (displayPoints.reduce((sum, p) => sum + p.y, 0) /
                      displayPoints.length) *
                    viewBox.height
                  }
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none text-xs font-semibold select-none sm:text-sm"
                  fill={isSelected ? '#60a5fa' : '#d1d5db'}
                >
                  {room.name}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Long press delete confirmation dialog for mobile */}
      {longPressingPoint && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 max-w-sm rounded-lg border border-border bg-surface p-4 shadow-xl sm:p-6">
            <h3 className="mb-2 text-base font-semibold text-text sm:text-lg">
              Delete Point?
            </h3>
            <p className="mb-4 text-sm text-text-muted">
              Are you sure you want to delete this point?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDeletePoint}
                className="hover:bg-error-hover flex-1 touch-manipulation rounded-lg bg-error px-4 py-2 text-sm font-medium text-text transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setLongPressingPoint(null)}
                className="flex-1 touch-manipulation rounded-lg border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-text-muted transition-all hover:border-border-hover hover:bg-surface-hover hover:text-text"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
