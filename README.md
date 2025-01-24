# PTZ Camera Control Web Interface

A Next.js application for controlling PTZ (Pan, Tilt, Zoom) cameras through NATS messaging.

## Features

- Camera selection (1-6)
- Pan control (-55° to 55°)
- Tilt control (-20° to 20°)
- Zoom control (0 to 16000)
- Real-time validation
- NATS message publishing

## Prerequisites

- Node.js 18 or higher
- NATS Server
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ptz-control
```

2. Install dependencies:
```bash
npm install
```

3. Install shadcn/ui components:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button select input label card toast
```

4. Create `.env.local` in root directory:
```env
NATS_URL=nats://localhost:4222 # Replace with your NATS server URL
```

## Development

1. Start NATS server:
```bash
nats-server
```

2. Run development server:
```bash
npm run dev
```

Access at http://localhost:3000

## Project Structure

```
├── app/
│   ├── api/
│   │   └── nats/
│   │       └── route.ts    # NATS API endpoint
│   └── page.tsx            # Main PTZ control interface
├── components/
│   └── ui/                 # shadcn/ui components
├── .env.local             # Environment variables
└── package.json
```

## Usage

1. Select a camera from the dropdown
2. Enter Pan, Tilt, and Zoom values within specified ranges
3. Click "Move Camera" to send command
4. Watch for feedback toast notifications

## Dependencies

- Next.js 14
- React 18
- shadcn/ui
- NATS.js
- TypeScript
- Tailwind CSS
