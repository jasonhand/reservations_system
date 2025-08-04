# Development Guide

## Quick Start

### Option 1: Frontend Only (Mock Data)
If you just want to see the UI and browse sites with mock data:

```bash
npm install
npm run dev:frontend
```

Visit http://localhost:3000 - you'll see a development banner indicating mock mode is active.

### Option 2: Full Stack Development
For complete functionality including reservations and admin features:

```bash
npm install
npm run dev
```

This starts both:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Development Features

### Mock Data Mode
When the backend server is not running, the application automatically switches to mock data mode:

- ✅ **Working**: Site browsing, filtering, site details
- ❌ **Limited**: Reservations, admin functions, email verification

### Full Stack Mode
When both servers are running:

- ✅ **All features working**: Complete reservation system
- ✅ **Database**: SQLite with sample data
- ✅ **Email**: Development email service
- ✅ **Admin**: Full dashboard functionality

## Database Setup

Initialize the database with sample data:

```bash
npm run db:seed
```

Reset and reseed the database:

```bash
npm run db:reset
```

## Code Quality

```bash
npm run lint          # Check linting
npm run typecheck     # Check TypeScript
npm run format        # Format code
```

## Building for Production

```bash
npm run build
```

## Troubleshooting

### Port Conflicts
If ports 3000 or 3001 are in use:
- Frontend: Set `PORT=3002 npm run dev:frontend`
- Backend: Set `PORT=3003 npm run dev:backend`

### Database Issues
- Delete `server/database/reservations.db` and run `npm run db:seed`

### API Errors
- Check the development banner for connection status
- Ensure backend server is running on http://localhost:3001

## Project Structure

```
src/
├── components/     # React components
├── pages/         # Route pages
├── utils/         # API client and utilities
└── types/         # TypeScript definitions

server/
├── routes/        # Express API routes
├── models/        # Database models
└── scripts/       # Database utilities
```

For more details, see the main [README.md](./README.md)