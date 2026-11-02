import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// iOS home-screen icon.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg width="180" height="180" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="9" fill="#0f766e" />
        <path d="M10.5 5.5h8l3.5 3.5v7h-11.5z" fill="#ffffff" />
        <path d="M18.5 5.5V9H22z" fill="#99d6cd" />
        <rect x="6" y="14" width="20" height="9" rx="3" fill="#0a4a45" />
        <circle cx="22" cy="18" r="1.3" fill="#5eead4" />
        <rect x="10.5" y="20" width="11" height="7" rx="1.5" fill="#ffffff" />
        <path d="M13 23h6M13 25h4" stroke="#0f766e" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    size,
  );
}
