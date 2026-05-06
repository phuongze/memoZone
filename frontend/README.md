# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## Vercel Deploy

Deploy the `frontend/` folder as a Vercel project.

Set these environment variables in Vercel:

```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
VITE_ENABLE_REALTIME=false
```

`frontend/vercel.json` already rewrites all routes to `index.html` so React Router works on refresh.

Keep `VITE_ENABLE_REALTIME=false` when your backend is API-only or deployed without Socket.IO. Set it to `true` only if the backend exposes realtime events.
