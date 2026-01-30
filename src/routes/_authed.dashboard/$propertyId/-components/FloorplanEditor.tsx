import { useState, useCallback, useRef, useEffect } from 'react'
import type { Room, Point } from '@/types/floorplan'
import { isValidRoom } from '@/types/floorplan'
import { FloorplanCanvas } from './FloorplanCanvas'
import { RoomList } from './RoomList'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'

// Helper hook to detect mobile devices
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

interface FloorplanEditorProps {
  initialRooms: Room[]
  initialAspectRatio: number
  onSave: (data: {
    aspectRatio: number
    rooms: Room[]
    deletedRoomIds: string[]
  }) => Promise<void>
  onCancel: () => void
}

export function FloorplanEditor({
  initialRooms,
  initialAspectRatio,
  onSave,
  onCancel,
}: FloorplanEditorProps) {
  // State management
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const deletedRoomIdsRef = useRef<Set<string>>(new Set())

  // Track if there are unsaved changes
  const hasUnsavedChanges = useRef(false)
  useEffect(() => {
    const roomsChanged = JSON.stringify(rooms) !== JSON.stringify(initialRooms)
    const hasDeleted = deletedRoomIdsRef.current.size > 0
    hasUnsavedChanges.current = roomsChanged || hasDeleted
  }, [rooms, initialRooms])

  // Mobile detection
  const isMobile = useIsMobile()

  // Room management
  const addRoom = useCallback(() => {
    const newRoom: Room = {
      id: `temp-${Date.now()}`,
      name: `Room ${rooms.length + 1}`,
      points: [],
    }
    setRooms((prev) => [...prev, newRoom])
    setSelectedRoomId(newRoom.id)
    setIsDrawing(true)
  }, [rooms.length])

  const updateRoom = useCallback((roomId: string, updates: Partial<Room>) => {
    setRooms((prev) =>
      prev.map((room) => (room.id === roomId ? { ...room, ...updates } : room)),
    )
  }, [])

  const deleteRoom = useCallback(
    (roomId: string) => {
      // Track deletion for server update
      if (!roomId.startsWith('temp-')) {
        deletedRoomIdsRef.current.add(roomId)
      }
      setRooms((prev) => prev.filter((room) => room.id !== roomId))
      if (selectedRoomId === roomId) {
        setSelectedRoomId(null)
      }
    },
    [selectedRoomId],
  )

  // Save/Cancel handlers
  const handleSave = useCallback(async () => {
    // Validate all rooms
    const invalidRooms = rooms.filter((room) => !isValidRoom(room))
    if (invalidRooms.length > 0) {
      alert(
        `Cannot save: ${invalidRooms.length} room(s) have invalid data. Each room needs at least 3 points.`,
      )
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        aspectRatio: 1, // Always use 1:1 aspect ratio
        rooms,
        deletedRoomIds: Array.from(deletedRoomIdsRef.current),
      })
      hasUnsavedChanges.current = false
      deletedRoomIdsRef.current.clear()
    } catch (error) {
      console.error('Failed to save floorplan:', error)
      alert('Failed to save floorplan. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }, [rooms, onSave])

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges.current) {
      setShowUnsavedDialog(true)
    } else {
      onCancel()
    }
  }, [onCancel])

  const handleConfirmCancel = useCallback(() => {
    setShowUnsavedDialog(false)
    hasUnsavedChanges.current = false
    onCancel()
  }, [onCancel])

  // Navigation protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId)

  return (
    <div className="flex h-full flex-col gap-3 sm:gap-6">
      {/* Header with actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <button
            onClick={addRoom}
            className="rounded-lg bg-linear-to-r from-primary-from to-primary-to px-4 py-2 text-sm font-semibold text-text shadow-lg shadow-primary-shadow transition-all duration-200 hover:from-primary-from-hover hover:to-primary-to-hover hover:shadow-primary-shadow-hover disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-base"
            disabled={isDrawing}
          >
            Add Room
          </button>
          {isDrawing ? (
            <span className="text-xs text-text-subtle sm:text-sm">
              {isMobile ? 'Tap to place 3 points' : 'Click to place 3 points'}
            </span>
          ) : selectedRoom ? (
            <span className="hidden text-xs text-text-subtle sm:text-sm md:block">
              {isMobile
                ? 'Tap edge centers to add • Drag points to move'
                : 'Drag edge midpoints to add points • Right-click points to remove • Drag points to move'}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 rounded-lg border border-border-strong bg-surface-elevated px-4 py-2 text-sm font-medium text-text-muted transition-all duration-200 hover:border-border-hover hover:bg-surface-hover hover:text-text disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:py-3 sm:text-base"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-lg bg-success px-4 py-2 text-sm font-semibold text-text shadow-lg transition-all duration-200 hover:bg-success hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:py-3 sm:text-base"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex flex-1 flex-col gap-3 overflow-hidden sm:gap-6 lg:grid lg:grid-cols-[1fr_300px]">
        {/* Canvas */}
        <FloorplanCanvas
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          isDrawing={isDrawing}
          onRoomSelect={setSelectedRoomId}
          onRoomUpdate={updateRoom}
          onDrawingComplete={() => setIsDrawing(false)}
        />

        {/* Room list sidebar - collapsible on mobile */}
        <div className="lg:block">
          <RoomList
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            onRoomSelect={setSelectedRoomId}
            onRoomUpdate={updateRoom}
            onRoomDelete={deleteRoom}
          />
        </div>
      </div>

      {/* Unsaved changes dialog */}
      {showUnsavedDialog && (
        <UnsavedChangesDialog
          onConfirm={handleConfirmCancel}
          onCancel={() => setShowUnsavedDialog(false)}
        />
      )}
    </div>
  )
}
