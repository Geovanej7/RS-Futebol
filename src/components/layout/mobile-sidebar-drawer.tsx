import * as Dialog from '@radix-ui/react-dialog';
import { Sidebar } from './sidebar';

export function MobileSidebarDrawer({
  open,
  onOpenChange,
  alertCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alertCount: number;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in lg:hidden" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 h-full w-72 max-w-[85vw] outline-none lg:hidden"
        >
          <Dialog.Title className="sr-only">Menu de navegação</Dialog.Title>
          <Sidebar alertCount={alertCount} variant="mobile" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
