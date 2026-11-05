# Veya Deployment Guide

## Recommended architecture

- Frontend: Vercel
- Backend: Render, Railway, or Fly.io
- Database: MongoDB Atlas
- Media: Cloudinary

The current backend is a long-running Express and Socket.IO server. Vercel is excellent for the frontend, but Socket.IO requires a persistent backend process, so deploy the backend on Render, Railway, or Fly.io unless you refactor it into a separate WebSocket service.

## 1. Prepare MongoDB Atlas

1. Open MongoDB Atlas.
2. Add the backend hosting provider IP range to Network Access. For development, `0.0.0.0/0` works but is less restrictive.
3. Create a database user with a strong password.
4. Copy the driver connection string.
5. The app database name is `incognito_chat`.

## 2. Deploy the backend

Create a new web service from the repository.

Build command:

```text
npm install
```

Start command:

```text
npm start
```

Set these environment variables in the backend host:

```text
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=incognito_chat
JWT_SECRET=<strong-random-secret>
JWT_EXPIRE=365d
MESSAGE_ENCRYPTION_KEY=<strong-random-secret>
CLIENT_URL=https://your-veya-app.vercel.app
CLIENT_URL_MOBILE=https://your-veya-app.vercel.app
CLOUDINARY_NAME=<cloudinary-name>
CLOUDINARY_API_KEY=<cloudinary-key>
CLOUDINARY_API_SECRET=<cloudinary-secret>
```

After the first deploy, verify:

```text
https://your-backend-host/health
```

Then initialize indexes once from a local terminal using the production environment values:

```powershell
cd backend
npm run db:init
```

## 3. Deploy the frontend to Vercel

1. Import the repository into Vercel.
2. Set the project root to `frontend`.
3. Build command:

```text
npm run build
```

4. Output directory:

```text
dist
```

5. Add frontend environment variables:

```text
VITE_API_URL=https://your-backend-host
VITE_SOCKET_URL=https://your-backend-host
```

6. Deploy.

Update the backend `CLIENT_URL` to the final Vercel domain after Vercel creates it, then restart the backend.

## 4. PWA installation

The frontend includes a manifest and service worker. Open the deployed HTTPS Vercel URL on Android Chrome, choose the three-dot menu, and select **Install app** or **Add to Home screen**.

## 5. Production checks

- Confirm `/health` returns HTTP 200.
- Register a test account.
- Login from two devices.
- Test real-time messages and typing indicators.
- Test image, video, audio, PDF, and document uploads.
- Test clear chat and delete chat from both devices.
- Confirm MongoDB TTL indexes exist for `messages.expiresAt`.
- Confirm Cloudinary uploads work.
- Rotate any credentials that were used during local development.
