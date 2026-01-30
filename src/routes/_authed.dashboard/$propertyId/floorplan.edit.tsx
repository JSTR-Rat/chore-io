import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getDB } from '@/db/client'
import { property, room } from '@/db/schema/app'
import { eq } from 'drizzle-orm'
import { FloorplanEditor } from './-components/FloorplanEditor'
import type { Point } from '@/types/floorplan'
import { createServerFn } from '@tanstack/react-start'

/**
 * Server function to load property floorplan data
 */
const loadFloorplan = createServerFn({ method: 'GET' })
  .inputValidator((data: number) => data)
  .handler(async ({ data: propertyId }) => {
    const db = getDB()

    // Fetch property with aspect ratio
    const [propertyData] = await db
      .select({
        id: property.id,
        name: property.name,
        aspectRatio: property.aspectRatio,
      })
      .from(property)
      .where(eq(property.id, propertyId))

    if (!propertyData) {
      throw new Error('Property not found')
    }

    // Fetch all rooms for this property
    const rooms = await db
      .select({
        id: room.id,
        name: room.name,
        points: room.points,
      })
      .from(room)
      .where(eq(room.propertyId, propertyId))

    return {
      property: propertyData,
      rooms: rooms.map((r) => ({
        id: String(r.id),
        name: r.name,
        points: (r.points as Point[] | null) || [],
      })),
    }
  })

/**
 * Server action to save floorplan changes
 */
const saveFloorplan = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      propertyId: number
      aspectRatio: number
      rooms: Array<{
        id: string
        name: string
        points: Point[]
      }>
      deletedRoomIds: string[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const db = getDB()

    // Update property aspect ratio
    await db
      .update(property)
      .set({ aspectRatio: data.aspectRatio })
      .where(eq(property.id, data.propertyId))

    // Delete removed rooms
    for (const roomId of data.deletedRoomIds) {
      const id = parseInt(roomId, 10)
      if (!isNaN(id)) {
        await db.delete(room).where(eq(room.id, id))
      }
    }

    // Update or create rooms
    for (const roomData of data.rooms) {
      const id = parseInt(roomData.id, 10)

      if (isNaN(id)) {
        // New room - create it
        await db.insert(room).values({
          name: roomData.name,
          propertyId: data.propertyId,
          points: roomData.points as any,
        })
      } else {
        // Existing room - update it
        await db
          .update(room)
          .set({
            name: roomData.name,
            points: roomData.points as any,
          })
          .where(eq(room.id, id))
      }
    }

    return { success: true }
  })

export const Route = createFileRoute(
  '/_authed/dashboard/$propertyId/floorplan/edit',
)({
  loader: async ({ params }) => {
    const propertyId = parseInt(params.propertyId, 10)
    return await loadFloorplan({ data: propertyId })
  },
  component: FloorplanEditorRoute,
})

function FloorplanEditorRoute() {
  const data = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const router = useRouter()

  const handleSave = async (floorplanData: {
    aspectRatio: number
    rooms: Array<{ id: string; name: string; points: Point[] }>
    deletedRoomIds: string[]
  }) => {
    await saveFloorplan({
      data: {
        propertyId: data.property.id,
        ...floorplanData,
      },
    })

    // Invalidate the route cache so fresh data is loaded next time
    await router.invalidate()

    // Navigate back to property view
    navigate({
      to: '/dashboard/$propertyId',
      params: { propertyId: String(data.property.id) },
    })
  }

  const handleCancel = () => {
    navigate({
      to: '/dashboard/$propertyId',
      params: { propertyId: String(data.property.id) },
    })
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end p-3 sm:p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 sm:mb-4 md:mb-6">
          <h1 className="text-xl font-bold text-text sm:text-2xl md:text-3xl">
            Edit Floorplan: {data.property.name}
          </h1>
          <p className="mt-1 text-xs text-text-muted sm:mt-2 sm:text-sm md:text-base">
            Draw and edit room boundaries. Tap to add points, drag to move them.
          </p>
        </div>

        <FloorplanEditor
          initialRooms={data.rooms}
          initialAspectRatio={data.property.aspectRatio || 1.5}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}
