import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

const DEFAULT_TRIGGER_CLASS =
  'flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue disabled:opacity-60 data-[placeholder]:text-text-muted';

export interface SelectOption {
  value: string;
  label: string;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
  disabled,
  id,
  triggerClassName,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  id?: string;
  triggerClassName?: string;
}) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger id={id} aria-label={ariaLabel} className={triggerClassName ?? DEFAULT_TRIGGER_CLASS}>
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown size={15} className="shrink-0 text-text-muted" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-72 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border bg-surface shadow-xl data-[state=open]:animate-[drawer-overlay-in_150ms_ease-out_forwards] data-[state=closed]:animate-[drawer-overlay-out_120ms_ease-in_forwards]"
        >
          <SelectPrimitive.ScrollUpButton className="flex items-center justify-center py-1 text-text-muted">
            <ChevronUp size={14} />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="p-1">
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                className="relative flex cursor-pointer select-none items-center rounded-md py-2 pl-7 pr-3 text-sm text-text-primary outline-none data-[highlighted]:bg-surface-alt"
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2 flex items-center">
                  <Check size={14} className="text-accent-blue" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex items-center justify-center py-1 text-text-muted">
            <ChevronDown size={14} />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
