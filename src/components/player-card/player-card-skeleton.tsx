const SIZE_CLASSES: Record<'md' | 'lg', string> = {
  md: 'w-[168px] sm:w-[188px]',
  lg: 'w-[260px] sm:w-[300px]',
};

export function PlayerCardSkeleton({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <div
      className={`skeleton aspect-[5/7] rounded-xl border-2 border-border ${SIZE_CLASSES[size]}`}
      aria-hidden="true"
    />
  );
}
