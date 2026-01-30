import { ChoresBoard } from '@/components/ChoresBoard'
import { DebugDateControls } from '@/components/DebugDateControls'
import { useCurrentDate, useDebugDate } from '@/contexts/DebugDateContext'
import { getDB } from '@/db/client'
import { chore, choreHistory, room } from '@/db/schema/app'
import type { Point } from '@/types/floorplan'
import { getSessionData } from '@/utils/auth.functions'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { useState } from 'react'

// Types
interface ChoreData {
  id: string
  name: string
  frequency: number
  frequencyUnit: 'days' | 'weeks' | 'months'
  lastCompletedDate: Date | null
}

interface CreateChoreInput {
  roomId: number
  name: string
  frequency: number
  frequencyUnit: 'days' | 'weeks' | 'months'
}

interface UpdateChoreInput {
  choreId: number
  name: string
  frequency: number
  frequencyUnit: 'days' | 'weeks' | 'months'
}

// Server function to load room data and chores
const loadRoom = createServerFn({ method: 'GET' })
  .inputValidator((data: number) => data)
  .handler(async ({ data: roomId }) => {
    const db = getDB()

    const [roomData] = await db
      .select({
        id: room.id,
        name: room.name,
        points: room.points,
        propertyId: room.propertyId,
      })
      .from(room)
      .where(eq(room.id, roomId))

    if (!roomData) {
      throw new Error('Room not found')
    }

    // Load chores for this room
    const chores = await db
      .select({
        id: chore.id,
        name: chore.name,
        frequency: chore.frequency,
        frequencyUnit: chore.frequencyUnit,
      })
      .from(chore)
      .where(eq(chore.roomId, roomId))

    // For each chore, get the most recent completion from history
    const choresWithHistory = await Promise.all(
      chores.map(async (c) => {
        const [lastCompletion] = await db
          .select({
            completedAt: choreHistory.completedAt,
          })
          .from(choreHistory)
          .where(eq(choreHistory.choreId, c.id))
          .orderBy(desc(choreHistory.completedAt))
          .limit(1)

        return {
          id: String(c.id),
          name: c.name,
          frequency: c.frequency,
          frequencyUnit: c.frequencyUnit as 'days' | 'weeks' | 'months',
          lastCompletedDate: lastCompletion?.completedAt || null,
        }
      }),
    )

    return {
      room: {
        id: String(roomData.id),
        name: roomData.name,
        points: (roomData.points as Point[] | null) || [],
        propertyId: roomData.propertyId,
      },
      chores: choresWithHistory,
    }
  })

// Server function to create a chore
const createChore = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateChoreInput) => data)
  .handler(async ({ data }) => {
    const db = getDB()
    await db.insert(chore).values({
      roomId: data.roomId,
      name: data.name,
      frequency: data.frequency,
      frequencyUnit: data.frequencyUnit,
    })
    return { success: true }
  })

// Server function to update a chore
const updateChore = createServerFn({ method: 'POST' })
  .inputValidator((data: UpdateChoreInput) => data)
  .handler(async ({ data }) => {
    const db = getDB()
    await db
      .update(chore)
      .set({
        name: data.name,
        frequency: data.frequency,
        frequencyUnit: data.frequencyUnit,
        updatedAt: new Date(),
      })
      .where(eq(chore.id, data.choreId))
    return { success: true }
  })

// Server function to delete a chore
const deleteChore = createServerFn({ method: 'POST' })
  .inputValidator((data: number) => data)
  .handler(async ({ data: choreId }) => {
    const db = getDB()
    await db.delete(chore).where(eq(chore.id, choreId))
    return { success: true }
  })

// Server function to mark a chore as done
const markChoreDone = createServerFn({ method: 'POST' })
  .inputValidator((data: { choreId: number; completedAt: Date }) => data)
  .handler(async ({ data }) => {
    const session = await getSessionData()
    if (!session?.user) {
      throw new Error('Not authenticated')
    }

    const db = getDB()

    // Insert a new completion record in choreHistory
    // Use the provided completedAt date (which could be a debug date for admins)
    await db.insert(choreHistory).values({
      choreId: data.choreId,
      userId: session.user.id,
      completedAt: data.completedAt,
    })

    return { success: true }
  })

// Server function to clear chore history (admin/debug only)
const clearChoreHistory = createServerFn({ method: 'POST' })
  .inputValidator((data: number) => data)
  .handler(async ({ data: choreId }) => {
    const session = await getSessionData()
    if (!session?.user) {
      throw new Error('Not authenticated')
    }

    const db = getDB()

    // Delete all history records for this chore
    await db.delete(choreHistory).where(eq(choreHistory.choreId, choreId))

    return { success: true }
  })

export const Route = createFileRoute(
  '/_authed/dashboard/$propertyId/room/$roomId/',
)({
  loader: async ({ params }) => {
    const roomId = parseInt(params.roomId, 10)
    if (isNaN(roomId)) {
      throw new Error('Invalid room ID')
    }
    return await loadRoom({ data: roomId })
  },
  component: RoomComponent,
})

// Modal Component for Add/Edit Chore
function ChoreModal({
  isOpen,
  onClose,
  chore,
  roomId,
  onSave,
  onDelete,
}: {
  isOpen: boolean
  onClose: () => void
  chore?: ChoreData
  roomId: number
  onSave: () => void
  onDelete?: () => void
}) {
  const [name, setName] = useState(chore?.name || '')
  const [frequency, setFrequency] = useState(chore?.frequency || 1)
  const [frequencyUnit, setFrequencyUnit] = useState<
    'days' | 'weeks' | 'months'
  >(chore?.frequencyUnit || 'weeks')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (chore) {
        // Update existing chore
        await updateChore({
          data: {
            choreId: parseInt(chore.id),
            name,
            frequency,
            frequencyUnit,
          },
        })
      } else {
        // Create new chore
        await createChore({
          data: {
            roomId,
            name,
            frequency,
            frequencyUnit,
          },
        })
      }
      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save chore')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-md rounded-lg bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-bold text-text">
          {chore ? 'Edit Chore' : 'Add New Chore'}
        </h2>

        {error && (
          <div className="mb-4 rounded border border-red-500 bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="choreName"
                className="mb-1 block text-sm font-medium text-text"
              >
                Chore Name
              </label>
              <input
                id="choreName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded border border-border bg-surface-elevated px-3 py-2 text-text focus:ring-2 focus:ring-primary-light focus:outline-none"
                placeholder="e.g., Clean bathroom"
              />
            </div>

            <div>
              <label
                htmlFor="frequency"
                className="mb-1 block text-sm font-medium text-text"
              >
                Frequency
              </label>
              <div className="flex gap-2">
                <input
                  id="frequency"
                  type="number"
                  value={frequency}
                  onChange={(e) => setFrequency(parseInt(e.target.value))}
                  required
                  min="1"
                  className="w-24 rounded border border-border bg-surface-elevated px-3 py-2 text-text focus:ring-2 focus:ring-primary-light focus:outline-none"
                  placeholder="1"
                />
                <select
                  value={frequencyUnit}
                  onChange={(e) =>
                    setFrequencyUnit(
                      e.target.value as 'days' | 'weeks' | 'months',
                    )
                  }
                  className="flex-1 rounded border border-border bg-surface-elevated px-3 py-2 text-text focus:ring-2 focus:ring-primary-light focus:outline-none"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                How often should this chore be done?
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-linear-to-r from-primary-from to-primary-to px-4 py-2 text-text shadow-lg transition-all duration-200 hover:from-primary-from-hover hover:to-primary-to-hover disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-border bg-surface-elevated px-4 py-2 text-text-muted transition-colors hover:text-text"
            >
              Cancel
            </button>
            {chore && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={isSubmitting}
                className="rounded-lg border border-red-500 bg-red-500/10 px-4 py-2 text-red-500 transition-colors hover:bg-red-500/20"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

// Delete Confirmation Dialog
function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  if (!isOpen) return null

  return (
    <div
      className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-lg bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-bold text-text">Delete Chore</h2>
        <p className="mb-6 text-text-muted">
          Are you sure you want to delete this chore? This action cannot be
          undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border bg-surface-elevated px-4 py-2 text-text-muted transition-colors hover:text-text"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function RoomComponent() {
  const { room, chores } = Route.useLoaderData()
  const { propertyId } = Route.useParams()
  const router = useRouter()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedChore, setSelectedChore] = useState<ChoreData | undefined>()

  // Get the current date (either debug date for admins or real date)
  const currentDate = useCurrentDate()
  const { isEnabled: isDebugDateEnabled, formatDate } = useDebugDate()

  // Check if we're using a debug date (not today)
  const isUsingDebugDate =
    isDebugDateEnabled &&
    currentDate.toDateString() !== new Date().toDateString()

  const handleChoreClick = (choreId: string) => {
    const chore = chores.find((c) => c.id === choreId)
    if (chore) {
      setSelectedChore(chore)
      setIsModalOpen(true)
    }
  }

  const handleAddChore = () => {
    setSelectedChore(undefined)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    setIsModalOpen(false)
    setSelectedChore(undefined)
    router.invalidate()
  }

  const handleDeleteClick = () => {
    setIsModalOpen(false)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedChore) {
      await deleteChore({ data: parseInt(selectedChore.id) })
      setIsDeleteDialogOpen(false)
      setSelectedChore(undefined)
      router.invalidate()
    }
  }

  const handleMarkDone = async (choreId: string) => {
    // Use the current date, which could be the debug date for admins
    await markChoreDone({
      data: {
        choreId: parseInt(choreId),
        completedAt: currentDate,
      },
    })
    router.invalidate()
  }

  const handleClearHistory = async (choreId: string) => {
    await clearChoreHistory({ data: parseInt(choreId) })
    router.invalidate()
  }

  return (
    <div className="space-y-6">
      {/* Chores Section */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/dashboard/$propertyId"
          params={{ propertyId }}
          className="shrink rounded-lg border border-border-strong px-4 py-2 text-text-muted transition-colors hover:border-border-hover hover:text-text"
        >
          Back
        </Link>
        <h2 className="grow text-center text-2xl font-bold text-text">
          {room.name}
        </h2>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-text">Chores</h3>
        <button
          onClick={handleAddChore}
          className="rounded-lg bg-linear-to-r from-primary-from to-primary-to px-4 py-2 text-text shadow-lg transition-all duration-200 hover:from-primary-from-hover hover:to-primary-to-hover"
        >
          Add New Chore
        </button>
      </div>

      {/* Admin-only: Debug Date Controls */}
      <DebugDateControls />

      {chores.length === 0 ? (
        <p className="py-8 text-center text-text-muted">
          No chores yet. Click "Add New Chore" to get started.
        </p>
      ) : (
        <div className="space-y-2">
          <ChoresBoard
            chores={chores.map((c) => ({
              ...c,
              lastCompletedDate: c.lastCompletedDate
                ? new Date(c.lastCompletedDate)
                : null,
            }))}
            onChoreClick={handleChoreClick}
            currentDate={currentDate}
          />

          {/* Mark as Done buttons */}
          <div className="mt-4 space-y-2">
            {isUsingDebugDate && (
              <div className="rounded border border-yellow-500/30 bg-yellow-500/10 p-2 text-center text-xs text-yellow-500">
                ⚠️ Using debug date: {formatDate(currentDate)} - Chores will be
                marked as done on this date
              </div>
            )}
            {chores.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between border-t border-border py-2"
              >
                <span className="text-text">{c.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMarkDone(c.id)}
                    className="rounded border border-green-500 bg-green-500/10 px-3 py-1 text-sm text-green-500 transition-colors hover:bg-green-500/20"
                    title={`Mark as done on ${currentDate.toLocaleDateString()}`}
                  >
                    Mark as Done
                  </button>
                  {isUsingDebugDate && (
                    <button
                      onClick={() => handleClearHistory(c.id)}
                      className="rounded border border-red-500 bg-red-500/10 px-3 py-1 text-sm text-red-500 transition-colors hover:bg-red-500/20"
                      title="Clear all history for this chore (admin debug)"
                    >
                      Clear History
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ChoreModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedChore(undefined)
        }}
        chore={selectedChore}
        roomId={parseInt(room.id)}
        onSave={handleSave}
        onDelete={selectedChore ? handleDeleteClick : undefined}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}