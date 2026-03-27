import React from 'react';

type OverlaySlot = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

interface DecorativeOverlayProps {
  slot?: OverlaySlot;
  className?: string;
  children: React.ReactNode;
}

const slotClasses: Record<OverlaySlot, string> = {
  'top-left': '-left-3 -top-3',
  'top-right': '-right-3 -top-3',
  'bottom-left': '-bottom-3 -left-3',
  'bottom-right': '-bottom-3 -right-3',
  center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
};

export const DecorativeOverlay: React.FC<DecorativeOverlayProps> = ({
  slot = 'top-right',
  className = '',
  children,
}) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-30 ${slotClasses[slot]} ${className}`}
    >
      {children}
    </div>
  );
};
