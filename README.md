# BookIt - Experience Booking Platform

A web app for booking travel experiences. Built with React, TypeScript, Node.js, and PostgreSQL.

## Features

- Browse different experiences
- See available time slots
- Book with customer info and promo codes
- Mobile-friendly design
- Basic booking confirmation

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router
- Axios

**Backend:**
- Node.js + Express
- PostgreSQL
- Express Validator

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
├── server/              # Express backend
│   ├── routes/
│   ├── config/
│   └── scripts/
└── package.json
```

## Setup

### Requirements

- Node.js (v16+)
- PostgreSQL (v12+)

### Install

1. Clone the repo
   ```bash
   git clone <repo-url>
   cd highwayDeliteAssign
   ```

2. Install dependencies
   ```bash
   npm run install:all
   ```

3. Set up database

   Create a PostgreSQL database called `bookit_db` or use your Neon connection string.

   Update `server/config.env`:
   ```env
   PORT=5000
   DATABASE_URL=your_postgres_connection_string
   JWT_SECRET=your_secret
   ```

   For frontend, create `client/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Seed the database
   ```bash
   cd server
   npm run seed
   ```

5. Run development servers
   ```bash
   npm run dev
   ```

   This starts:
   - Backend on `http://localhost:5000`
   - Frontend on `http://localhost:5173`

## Database

Tables:
- `experiences` - experience details
- `slots` - available time slots
- `bookings` - booking records
- `promo_codes` - promo codes

The seed script creates sample data for testing.

## API Endpoints

### Experiences
- `GET /api/experiences` - list all
- `GET /api/experiences/:id` - get details
- `GET /api/experiences/:id/slots` - get slots

### Bookings
- `POST /api/bookings` - create booking
- `GET /api/bookings/:reference` - get by reference

### Promo Codes
- `POST /api/promo/validate` - validate code
- `GET /api/promo/codes` - list codes

### Health
- `GET /api/health` - status check

## Development

Start backend:
```bash
cd server && npm run dev
```

Start frontend:
```bash
cd client && npm run dev
```

## Issues

### Database connection errors
- Check PostgreSQL is running
- Verify credentials in `config.env`

### API errors
- Make sure backend is running
- Check CORS settings

### Build errors
- Delete `node_modules` and reinstall
- Check Node.js version

## License

MIT
