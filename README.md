# QuickPrint Web

Next.js 16 frontend for the QuickPrint multi-tenant print shop management platform.

## Stack

- **Framework:** Next.js 16, React 19
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Forms:** React Hook Form, Zod
- **Upload:** react-dropzone
- **Icons:** Lucide

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

### Public

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth/login` | Sign in |
| `/auth/register` | Create account |
| `/shop/[slug]` | Customer upload portal (branded per shop) |

### Dashboard (shop owner)

| Route | Description |
|-------|-------------|
| `/dashboard` | Overview with stats and recent orders |
| `/dashboard/orders` | Searchable order list |
| `/dashboard/queue` | Real-time 3-column print queue |
| `/dashboard/analytics` | Charts for revenue, orders, hours, utilization |
| `/dashboard/branding` | Theme editor with live preview |
| `/dashboard/pricing` | Per-item pricing configuration |
| `/dashboard/qrcode` | QR code view, download, and poster |
| `/dashboard/settings` | Shop information |

### Admin

| Route | Description |
|-------|-------------|
| `/admin` | Platform administration |
| `/admin?tab=shops` | Shop management |
| `/admin?tab=retention` | Deletion compliance |

### Other

| Route | Description |
|-------|-------------|
| `/notifications` | Notification center |

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- `NEXT_PUBLIC_API_URL` is the backend's base URL. It may include `/api`; the client
  appends that path when it is omitted. The default is `http://localhost:4000/api`.
- `NEXT_PUBLIC_APP_URL` is the public address embedded in shop QR codes. In production,
  set it to a domain or LAN address that customers' phones can reach. If omitted, the
  browser's current origin is used.

The browser tab and iOS home-screen icons are generated from `app/icon.tsx` and
`app/apple-icon.tsx` respectively.

## Build

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t quickprint-web .
docker run -p 3000:3000 quickprint-web
```
