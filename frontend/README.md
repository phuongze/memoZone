# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## Vercel Deploy

Deploy the `frontend/` folder as a Vercel project.

Set these environment variables in Vercel:

```env
VITE_API_URL=/_/backend/api
VITE_SOCKET_URL=/_/backend
VITE_ENABLE_REALTIME=false
```

`frontend/vercel.json` already rewrites all routes to `index.html` so React Router works on refresh.

Keep `VITE_ENABLE_REALTIME=false` when your backend is API-only or deployed without Socket.IO. Set it to `true` only if the backend exposes realtime events.

## Multi-Service Vercel

If you deploy the whole repo as one Vercel multi-service project, use the root [`vercel.json`](../vercel.json) file.

The frontend will call the backend under `/_/backend/api` by default in production if `VITE_API_URL` is not set.
