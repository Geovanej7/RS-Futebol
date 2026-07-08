import * as Dialog from '@radix-ui/react-dialog';
import { Loader2, X } from 'lucide-react';

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  isPending = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content
          aria-describedby="confirm-dialog-description"
          className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-bg p-5 outline-none"
        >
          <div className="mb-3 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-text-primary">{title}</Dialog.Title>
            <Dialog.Close aria-label="Fechar" className="rounded-lg p-1 text-text-secondary hover:bg-surface-alt">
              <X size={18} />
            </Dialog.Close>
          </div>

          <p id="confirm-dialog-description" className="text-sm text-text-secondary">
            {description}
          </p>

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close
              type="button"
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt"
            >
              Cancelar
            </Dialog.Close>
            <button
              type="button"
              disabled={isPending}
              onClick={onConfirm}
              className="flex items-center justify-center gap-2 rounded-lg bg-accent-red px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
