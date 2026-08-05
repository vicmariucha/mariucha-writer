export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-4"
      onClick={onCancel}
    >
      <div
        className="animate-scale-in w-full max-w-sm rounded-sm border border-border bg-card p-6 shadow-elevate"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-2xl">{title}</h3>
        {description && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>}
        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className="rounded-full bg-destructive px-5 py-2 text-sm text-destructive-foreground transition-opacity hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
