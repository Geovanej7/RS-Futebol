import { useState } from 'react';
import { cn } from '@/lib/cn';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function Avatar({
  name,
  src,
  size = 'md',
}: {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [erro, setErro] = useState(false);
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-lg',
  }[size];

  if (src && !erro) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setErro(true)}
        className={cn('shrink-0 rounded-full object-cover', sizeClasses)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue to-accent-purple font-semibold text-white',
        sizeClasses,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
