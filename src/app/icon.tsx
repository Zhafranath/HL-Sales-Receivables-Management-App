import type { Metadata } from 'next';

export const metadata: Metadata = {};

export default function Icon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hlFavGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#3f3f46" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="7" fill="url(#hlFavGrad)" />
      <rect x="1" y="1" width="30" height="30" rx="7" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
      <text
        x="16"
        y="20.5"
        textAnchor="middle"
        fill="white"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="13"
        fontWeight="700"
        letterSpacing="-0.3"
      >
        HL
      </text>
      <rect x="7" y="22.5" width="10" height="1.8" rx="0.9" fill="#fbbf24" />
    </svg>
  );
}
