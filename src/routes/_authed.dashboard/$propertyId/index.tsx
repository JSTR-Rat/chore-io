import {
  createFileRoute,
  Link,
  useNavigate,
  getRouteApi,
} from '@tanstack/react-router'
import { useMemo } from 'react'
import type { Point, Room } from '@/types/floorplan'
import { DebugDateControls } from '@/components/DebugDateControls'
import { useCurrentDate } from '@/contexts/DebugDateContext'
import { getChoreColor } from '@/utils/chore-colors'

const parentRoute = getRouteApi('/_authed/dashboard/$propertyId')

export const Route = createFileRoute('/_authed/dashboard/$propertyId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const data = parentRoute.useLoaderData()
  const { propertyId } = Route.useParams()
  const currentDate = useCurrentDate()

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

  // Calculate room colors based on the current (debug) date
  const roomsWithColors = useMemo(() => {
    const currentTime = currentDate.getTime()
    const roomData = new Map<number, { color: string; progress: number }>()

    for (const choreData of data.chores) {
      const totalDays = frequencyToDays(
        choreData.frequency,
        choreData.frequencyUnit as 'days' | 'weeks' | 'months',
      )

      // Calculate days since last completion
      const daysSince = choreData.lastCompletedAt
        ? Math.floor(
            (currentTime - choreData.lastCompletedAt * 1000) /
              (1000 * 60 * 60 * 24),
          )
        : 999 // Never completed

      // Calculate progress (0 to 1)
      const progress = Math.min(daysSince / totalDays, 1)

      // Get color for this chore
      const choreColor = getChoreColor(daysSince, totalDays)

      // Update room color if this chore is more urgent (higher progress)
      const existing = roomData.get(choreData.roomId)
      if (!existing || progress > existing.progress) {
        roomData.set(choreData.roomId, { color: choreColor, progress })
      }
    }

    return data.rooms.map((r) => ({
      ...r,
      color: roomData.get(Number(r.id))?.color || '#6b7280', // Default to gray if no chores
    }))
  }, [data.rooms, data.chores, currentDate])

  return (
    <div className="min-h-screen bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header with property info and actions */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">
              {data.property.name}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Property ID: {propertyId} • {data.rooms.length} room
              {data.rooms.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/dashboard"
              className="rounded border border-border bg-surface px-4 py-2 text-text transition-colors hover:bg-surface-hover"
            >
              Back to Dashboard
            </Link>
            <Link
              to="/dashboard/$propertyId/floorplan/edit"
              params={{ propertyId }}
              className="rounded bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-hover"
            >
              Edit Floorplan
            </Link>
          </div>
        </div>

        {/* Admin Date Debugger */}
        <DebugDateControls />

        <div className="mb-6">
          {data.rooms.length > 0 ? (
            <FloorPlan
              rooms={roomsWithColors}
              aspectRatio={data.property.aspectRatio || 1.5}
              propertyId={propertyId}
            />
          ) : (
            <div className="rounded-lg border border-border bg-surface p-8 text-center shadow-lg">
              <p className="mb-4 text-text-muted">
                No floor plan has been created for this property yet.
              </p>
              <Link
                to="/dashboard/$propertyId/floorplan/edit"
                params={{ propertyId }}
                className="inline-block rounded bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-hover"
              >
                Create Floor Plan
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Read-only floor plan display component
type FloorPlanProps = {
  rooms: (Room & { color?: string })[]
  aspectRatio: number
  propertyId: string
}

function normalizePoints(
  points: Point[],
  width: number,
  height: number,
): string {
  return points.map((p) => `${p.x * width},${p.y * height}`).join(' ')
}

function FloorPlan({ rooms, aspectRatio, propertyId }: FloorPlanProps) {
  const navigate = useNavigate()

  // Calculate viewBox dimensions to maintain aspect ratio in a square container
  const baseSize = 1000
  const width = aspectRatio >= 1 ? baseSize : baseSize * aspectRatio
  const height = aspectRatio >= 1 ? baseSize / aspectRatio : baseSize

  const handleRoomClick = (roomId: string) => {
    navigate({
      to: '/dashboard/$propertyId/room/$roomId' as any,
      params: { propertyId, roomId } as any,
    })
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        width: '100%',
        maxWidth: '100%',
        height: 'auto',
        maxHeight: '500px',
      }}
    >
      {rooms.map((room) => (
        <polygon
          key={room.id}
          points={normalizePoints(room.points, width, height)}
          className="hover:stroke-text-light cursor-pointer stroke-text-muted hover:opacity-80"
          style={{
            vectorEffect: 'non-scaling-stroke',
            fill: room.color || '#374151', // Use room color or default gray
            transition: 'opacity 0.2s',
          }}
          onClick={() => handleRoomClick(room.id)}
        />
      ))}
    </svg>
  )
}
