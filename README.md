# Our Secret Space

Private couple web app for wishlist, love counter, and memory places.

## Stack

- Frontend: React (Vite) + Tailwind CSS + Framer Motion + Lucide React
- Backend: Node.js + Express + JWT + MongoDB (with JSON fallback for local dev)

## Project Structure

- `frontend/`: React client
- `backend/`: Express API

## Run Backend

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Default demo accounts (from `.env.example` hashes):

- `memory_admin` / `moonlight2026`
- `love_guest` / `starlove2026`

## Run Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.
Backend runs at `http://localhost:5000`.

## API Endpoints

All endpoints below require `Authorization: Bearer <jwt>` except login.

- `POST /api/auth/login`
- `GET /api/wishes`
- `POST /api/wishes`
- `PATCH /api/wishes/:id`
- `GET /api/counter`
- `PATCH /api/counter` (set start date/time, couple name)
- `POST /api/counter/invites` (send invite code for date schedule)
- `PATCH /api/counter/invites/:id` (accept/reject invite by code)
- `GET /api/profile` (my profile + partner profile)
- `PATCH /api/profile` (update my profile)

## Realtime Updates

- Realtime is optional and disabled by default for Vercel serverless deploys.
- When the backend runs as a long-lived server, it can support realtime hooks again, but Vercel serverless should be treated as API-only.

## Home Features (New)

- Home now focuses on anniversary counting only.

## Invite Management (Profile Page)

- Both users can propose a date time and send an invite code to partner.
- Receiver enters code to accept invite; accepted invite updates `startDate` automatically.
- Manual start date/time editor is available on Profile.
- Milestones are generated from `startDate` (7, 30, 100, 365, 730 days).

## Profile Management

- New `Profile` page for editing display name, role label, bio, and favorite date spot.
- Support avatar upload from local image file (stored as `avatarUrl`).
- Profile data is stored in `backend/data/counter.json` under `profiles`.

## Home Decoration

- Home shows couple portrait (2 avatars) and display names of both dating accounts.
- If no avatar is uploaded yet, initials are shown as aesthetic placeholders.

## MongoDB Storage

In `backend/.env`:

```env
USE_MONGO=true
MONGODB_URI=mongodb://localhost:27017/our-secret-space
```

MongoDB is the recommended deploy target because it keeps all app state in one managed database. When `USE_MONGO=false`, data is loaded from:

- `backend/data/wishes.json`
- `backend/data/counter.json`

For local MongoDB development, start the container from `backend/` with `docker compose up -d` and set `USE_MONGO=true` in `backend/.env`.

## Deploying The Database

Use MongoDB Atlas for production. The app does not need any schema migration step because it reads and writes JSON-like documents.

1. Create a free cluster in MongoDB Atlas.
2. Add a database user with read/write access.
3. In Network Access, allow your backend host IP, or temporarily allow access from `0.0.0.0/0` during testing.
4. Copy the Atlas connection string and put it into the backend environment as `MONGODB_URI`.
5. Set `USE_MONGO=true` in the backend environment.
6. Set a strong `JWT_SECRET`.
7. Restart the backend so it connects to Atlas and seeds data from `backend/data/counter.json` and `backend/data/wishes.json` on first run if the collections are empty.

Example production backend env:

```env
USE_MONGO=true
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/our-secret-space?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_ORIGIN=https://your-frontend-domain.vercel.app
```

If you deploy the backend on a host like Render/Railway/Fly.io, store these values in that host's secret environment variables. If you deploy the backend on Vercel, set the project root to `backend/` and keep `CLIENT_ORIGIN` pointed at your frontend domain.

## Deploying Backend On Vercel

The backend now runs as a serverless API through `backend/api/[...path].js`.

1. Create a new Vercel project and set the root directory to `backend/`.
2. Add the production env vars in Vercel:

```env
USE_MONGO=true
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/our-secret-space?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_ORIGIN=https://your-frontend-domain.vercel.app
```

For a Vercel multi-service project, the frontend can use:

```env
VITE_API_URL=/_/backend/api
VITE_SOCKET_URL=/_/backend
VITE_ENABLE_REALTIME=false
```

3. Deploy.
4. Test `GET /api/health` on the Vercel backend URL.

Important limitations on Vercel:

- No long-lived Socket.IO server.
- The backend is API-only.
- Keep the frontend realtime flag off: `VITE_ENABLE_REALTIME=false`.

Quick verification after deploy:

```bash
GET /api/health
GET /api/counter
GET /api/wishes
```

You should log in once, then create or update a wish/profile and confirm the same data is visible after refreshing the browser.
