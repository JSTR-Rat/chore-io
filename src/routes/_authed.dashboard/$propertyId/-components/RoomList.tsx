import { useState } from 'react'
import type { Room } from '@/types/floorplan'
import { DeleteRoomDialog } from './DeleteRoomDialog'

interface RoomListProps {
  rooms: Room[]
  selectedRoomId: string | null
  onRoomSelect: (roomId: string | null) => void
  onRoomUpdate: (roomId: string, updates: Partial<Room>) => void
  onRoomDelete: (roomId: string) => void
}

export function RoomList({
  rooms,
  selectedRoomId,
  onRoomSelect,
  onRoomUpdate,
  onRoomDelete,
}: RoomListProps) {
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null)

  const handleStartEdit = (room: Room) => {
    setEditingRoomId(room.id)
    setEditingName(room.name)
  }

  const handleSaveEdit = () => {
    if (editingRoomId && editingName.trim()) {
      onRoomUpdate(editingRoomId, { name: editingName.trim() })
      setEditingRoomId(null)
      setEditingName('')
    }
  }

  const handleCancelEdit = () => {
    setEditingRoomId(null)
    setEditingName('')
  }

  const handleDeleteClick = (roomId: string) => {
    setDeleteRoomId(roomId)
  }

  const handleConfirmDelete = () => {
    if (deleteRoomId) {
      onRoomDelete(deleteRoomId)
      setDeleteRoomId(null)
    }
  }

  return (
    <div className="flex max-h-64 flex-col rounded-lg border border-border bg-surface shadow-md backdrop-blur-sm lg:max-h-full">
      <div className="border-b border-border p-3 sm:p-4">
        <h2 className="text-base font-semibold text-text sm:text-lg">Rooms</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {rooms.length === 0 ? (
          <div className="p-3 text-center text-xs text-text-subtle sm:p-4 sm:text-sm">
            No rooms yet. Tap "Add Room" to get started.
          </div>
        ) : (
          <ul className="space-y-1">
            {rooms.map((room) => {
              const isSelected = room.id === selectedRoomId
              const isEditing = editingRoomId === room.id
              const isValid = room.points.length >= 3

              return (
                <li
                  key={room.id}
                  className={`cursor-pointer touch-manipulation rounded-md border p-2 transition-all sm:p-3 ${
                    isSelected
                      ? 'border-primary bg-accent-blue-bg shadow-sm'
                      : 'border-border hover:border-border-hover hover:bg-surface-hover active:bg-surface-hover'
                  }`}
                  onClick={() => !isEditing && onRoomSelect(room.id)}
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full rounded-md border border-border bg-surface-input px-2 py-1.5 text-xs text-text placeholder:text-text-placeholder focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none sm:px-3 sm:py-2 sm:text-sm"
                        placeholder="Room name"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit()
                          if (e.key === 'Escape') handleCancelEdit()
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 touch-manipulation rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-primary-hover"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 touch-manipulation rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-muted transition-all hover:border-border-hover hover:bg-surface-hover hover:text-text"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-medium text-text sm:text-base">
                            {room.name}
                          </h3>
                          <p className="text-xs text-text-subtle">
                            {room.points.length} point
                            {room.points.length !== 1 ? 's' : ''}
                            {!isValid && (
                              <span className="ml-1 text-error-text sm:ml-2">
                                (needs ≥3)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartEdit(room)
                          }}
                          className="flex-1 touch-manipulation rounded-md border border-border bg-surface-elevated px-2 py-1.5 text-xs font-medium text-text-muted transition-all hover:border-border-hover hover:bg-surface-hover hover:text-text active:bg-surface-hover sm:px-3"
                        >
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(room.id)
                          }}
                          className="flex-1 touch-manipulation rounded-md border border-error-border-subtle px-2 py-1.5 text-xs font-medium text-error transition-all hover:border-error-border hover:bg-error-bg hover:text-error-text active:bg-error-bg sm:px-3"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {deleteRoomId && (
        <DeleteRoomDialog
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteRoomId(null)}
        />
      )}
    </div>
  )
}
