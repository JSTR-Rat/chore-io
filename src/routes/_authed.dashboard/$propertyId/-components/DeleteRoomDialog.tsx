interface DeleteRoomDialogProps {
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteRoomDialog({
  onConfirm,
  onCancel,
}: DeleteRoomDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-text">Delete Room?</h2>
        <p className="mb-6 text-text-muted">
          Deleting this room will also{' '}
          <span className="font-semibold text-error-text">
            permanently delete any chores assigned to it
          </span>
          . This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-border-strong bg-surface-elevated px-4 py-2 font-medium text-text-muted transition-all hover:border-border-hover hover:bg-surface-hover hover:text-text"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-error px-4 py-2 font-semibold text-text shadow-lg transition-all hover:bg-error hover:shadow-xl"
          >
            Delete Room
          </button>
        </div>
      </div>
    </div>
  )
}
