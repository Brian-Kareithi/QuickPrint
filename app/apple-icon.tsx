import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg width="180" height="180" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="9" fill="#003249" />
        <path d="M10.5 5.5h8l3.5 3.5v7h-11.5z" fill="#ffffff" />
        <path d="M18.5 5.5V9H22z" fill="#80ced7" />
        <rect x="6" y="14" width="20" height="9" rx="3" fill="#007ea7" />
        <circle cx="22" cy="18" r="1.3" fill="#ccdbdc" />
        <rect x="10.5" y="20" width="11" height="7" rx="1.5" fill="#ffffff" />
        <path d="M13 23h6M13 25h4" stroke="#003249" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    size,
  );
}
