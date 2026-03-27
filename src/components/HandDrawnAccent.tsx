import React from 'react';

export type HandDrawnAccentVariant = 'ring' | 'arrow' | 'squiggle' | 'gear';

interface HandDrawnAccentProps {
  className?: string;
  colorClassName?: string;
  variant?: HandDrawnAccentVariant;
  seed?: string;
}

const ACCENT_VARIANTS: HandDrawnAccentVariant[] = ['ring', 'arrow', 'squiggle', 'gear'];

const getSeedHash = (seed: string) => {
  const normalizedSeed = seed || 'default';
  let hash = 0;

  for (let i = 0; i < normalizedSeed.length; i += 1) {
    hash = (hash << 5) - hash + normalizedSeed.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
};

export const pickAccentVariant = (seed: string) => {
  const hash = getSeedHash(seed);
  const index = hash % ACCENT_VARIANTS.length;
  return ACCENT_VARIANTS[index];
};

export const pickAccentTransform = (seed: string) => {
  const hash = getSeedHash(`${seed}-transform`);
  const rotations = [-9, -6, -3, 3, 6, 9];
  const scales = [0.92, 0.96, 1, 1.04, 1.08];

  const rotation = rotations[hash % rotations.length];
  const scale = scales[hash % scales.length];

  return {
    transform: `rotate(${rotation}deg) scale(${scale})`,
  } as const;
};
export const HandDrawnAccent: React.FC<HandDrawnAccentProps> = ({
  className = 'h-9 w-9',
  colorClassName = 'text-black',
  variant = 'ring',
  seed = 'default',
}) => {
  const accentStyle = pickAccentTransform(`${seed}-${variant}`);

  const getAccentMarkup = () => {
    if (variant === 'arrow') {
      return (
        <>
          <path
            d="M8 30C13 24 21 20 30 20"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M23 13L33 20L23 27"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="31" r="3" fill="currentColor" />
        </>
      );
    }

    if (variant === 'squiggle') {
      return (
        <>
          <path
            d="M5 16C8 9 14 9 17 16C20 23 26 23 29 16C32 9 38 9 41 16"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M5 29C8 22 14 22 17 29C20 36 26 36 29 29C32 22 38 22 41 29"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </>
      );
    }

    if (variant === 'gear') {
      return (
        <>
          <path
            d="M20 6H24L25 11L30 13L34 10L37 13L34 18L36 23L41 24V28L36 29L34 34L37 39L34 42L30 39L25 41L24 46H20L19 41L14 39L10 42L7 39L10 34L8 29L3 28V24L8 23L10 18L7 13L10 10L14 13L19 11L20 6Z"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="22" cy="26" r="5" stroke="currentColor" strokeWidth="2.6" />
        </>
      );
    }

    return (
      <>
        <circle cx="21.5" cy="21.5" r="16" stroke="currentColor" strokeWidth="3.5" />
        <path
          d="M8 11C11 8 16 8 19 11"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M25 32C28 35 33 35 36 32"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M12 28L16 24L20 28"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 17L28 13L32 17"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    );
  };

  return (
    <svg
      viewBox="0 0 44 44"
      aria-hidden="true"
      className={`${className} ${colorClassName}`}
      style={accentStyle}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {getAccentMarkup()}
    </svg>
  );
};
