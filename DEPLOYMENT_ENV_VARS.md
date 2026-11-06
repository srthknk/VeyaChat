# VeyaChat deployment environment variables

This file contains the exact variable names required for Vercel and Render.
Never commit `.env` files, Google client secrets, MongoDB passwords, Cloudinary
secrets, or SMTP app passwords to GitHub.

## 1. Vercel frontend

In Vercel, open:

`Project Settings -> Environment Variables`

Add these variables to **Production**, **Preview**, and **Development**:

| Name | Value |
|---|---|
| `VITE_API_URL` | `https://YOUR-RENDER-SERVICE.onrender.com` |
| `VITE_SOCKET_URL` | `https://YOUR-RENDER-SERVICE.onrender.com` |
| `VITE_GOOGLE_CLIENT_ID` | `1073957587736-0qu8uqnmk1skg6v1p6qfiqkm76v7hss5.apps.googleusercontent.com` |

Replace `YOUR-RENDER-SERVICE` with the actual Render service hostname.
Do not add `/api` to `VITE_API_URL`; the frontend already adds `/api`.

### Vercel project settings

| Setting | Value |
|---|---|
| Framework preset | `Vite` |
| Root directory | `frontend` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |

After changing environment variables, use **Redeploy**. Vite variables are
embedded during the build and are not changed by restarting an old deployment.

## 2. Render backend

Create a Render **Web Service** from the GitHub repository.

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Runtime | `Node` |
| Build command | `npm install` |
| Start command | `npm start` |

In Render, open:

`Service -> Environment -> Add Environment Variable`

Add the following:

### Required server and database variables

| Name | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | `incognito_chat` |
| `JWT_SECRET` | A new long random secret |
| `JWT_EXPIRE` | `365d` |
| `MESSAGE_ENCRYPTION_KEY` | A new long random secret |

Authentication persists through the backend's `HttpOnly` `veya_session` cookie.
Set `CLIENT_URL` and `CLIENT_URL_MOBILE` to the exact deployed Vercel origin,
including `https://`, so credentialed cookies are accepted.

Render provides a `PORT` value automatically. If Render recommends its
provided port, use that value or remove the manually added `PORT` variable.
The application defaults to port `5000` when running locally.

### Frontend CORS variables

Use the exact Vercel URL, without a trailing slash:

| Name | Value |
|---|---|
| `CLIENT_URL` | `https://YOUR-VERCEL-APP.vercel.app` |
| `CLIENT_URL_MOBILE` | `https://YOUR-VERCEL-APP.vercel.app` |

### Google authentication

| Name | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | `1073957587736-0qu8uqnmk1skg6v1p6qfiqkm76v7hss5.apps.googleusercontent.com` |

Do **not** add `GOOGLE_CLIENT_SECRET` to this application. The current Google
Identity Services flow verifies the ID token using the client ID.

### Cloudinary media storage

| Name | Value |
|---|---|
| `CLOUDINARY_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

### Gmail deletion-code email

| Name | Value |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | Your Gmail app password |
| `SMTP_FROM` | `VeyaChat <your-gmail-address@gmail.com>` |

`SMTP_PASS` must be a Gmail **App Password**, not the normal Gmail password.
Keep this value only in Render's environment variables.

## 3. MongoDB Atlas

In MongoDB Atlas:

1. Add Render's network access as allowed access.
2. For initial testing, `0.0.0.0/0` can be used, but restrict access later.
3. Ensure the username and password in `MONGODB_URI` are URL encoded.
4. Use database name `incognito_chat`.

Example format:

```text
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/incognito_chat
```

## 4. Google OAuth configuration

In Google Cloud Console, open:

`APIs & Services -> Credentials -> OAuth 2.0 Client IDs`

Add the Vercel domain to **Authorized JavaScript origins**:

```text
https://YOUR-VERCEL-APP.vercel.app
```

For this Identity Services button, the JavaScript origin is the important
setting. Do not expose a Google client secret in frontend code.

## 5. Deployment order

1. Deploy the Render backend first.
2. Copy the Render URL.
3. Add the Render URL to Vercel as `VITE_API_URL` and `VITE_SOCKET_URL`.
4. Deploy the Vercel frontend.
5. Copy the Vercel URL.
6. Set `CLIENT_URL` and `CLIENT_URL_MOBILE` in Render.
7. Add the Vercel URL in Google OAuth origins.
8. Redeploy both services.

## 6. Production checks

Open:

```text
https://YOUR-RENDER-SERVICE.onrender.com/health
```

It should return:

```json
{
  "success": true,
  "message": "Server is running"
}
```

Then test registration, login, Google login, messaging, typing indicators,
file uploads, deletion OTP email, and mobile PWA installation.
