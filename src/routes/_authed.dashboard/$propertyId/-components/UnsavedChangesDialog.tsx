interface UnsavedChangesDialogProps {
  onConfirm: () => void
  onCancel: () => void
}

export function UnsavedChangesDialog({
  onConfirm,
  onCancel,
}: UnsavedChangesDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-text">
          Unsaved Changes
        </h2>
        <p className="mb-6 text-text-muted">
          You have unsaved changes. Are you sure you want to leave without
          saving?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-border-strong bg-surface-elevated px-4 py-2 font-medium text-text-muted transition-all hover:border-border-hover hover:bg-surface-hover hover:text-text"
          >
            Keep Editing
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-error px-4 py-2 font-semibold text-text shadow-lg transition-all hover:bg-error hover:shadow-xl"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  )
}
