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

- Backend emits Socket.IO event `profile:updated` whenever a profile is saved.
- Frontend listens to this event to update avatars across tabs instantly without calling API refresh.

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
