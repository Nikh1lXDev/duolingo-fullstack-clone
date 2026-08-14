# Fullstack Deployment Guide (Railway & Vercel)

This document provides complete instructions for deploying the Duolingo fullstack clone to production using Railway for the backend and Vercel for the frontend.

## LOCAL DEVELOPMENT
-----------------

**Backend:**
```bash
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## RAILWAY (Backend)
-------

1. Connect your GitHub repository to Railway.
2. Create a backend service deploying from the repository.
3. Set **Root Directory** to:
   `backend`
4. Configure the **Start Command**:
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Create a persistent Railway Volume.
6. Mount the Volume at:
   `/data`
7. Set Environment Variables:
   - `DATABASE_URL=sqlite:////data/duolingo.db`
   - `SECRET_KEY=<secure-random-value>`
   - `CORS_ORIGINS=http://localhost:3000` (We will update this later).
8. Deploy the service.
9. Generate a Railway public domain (e.g., `https://your-railway-domain.up.railway.app`).
10. Verify the deployment by visiting:
    `https://YOUR-RAILWAY-DOMAIN/api/health`
    It should return HTTP 200 `{"status": "ok"}`.

> [!WARNING]
> **SQLite Persistence Warning**
> The production SQLite database MUST live on the Railway Persistent Volume at `/data/duolingo.db`. 
> Do NOT store it in `/app/duolingo.db`, `/backend/duolingo.db`, or `/tmp/duolingo.db`. 
> The persistent volume is the only way to prevent user data from disappearing after container restarts/redeployments.

## VERCEL (Frontend)
------

1. Import your GitHub repository to Vercel.
2. Set **Root Directory** to:
   `frontend`
3. Set **Framework Preset** to:
   `Next.js`
4. Set Environment Variables:
   - `NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-DOMAIN` (Use the domain you generated in Railway).
5. Deploy the project.
6. Obtain your Vercel production URL (e.g., `https://your-vercel-domain.vercel.app`).

## CORS FINALIZATION
----

Once you have your Vercel URL, you must authorize it to communicate with the backend.

1. Go back to Railway.
2. Update the `CORS_ORIGINS` variable:
   `CORS_ORIGINS=https://YOUR-VERCEL-DOMAIN.vercel.app`
3. Redeploy the backend.

## DATABASE PERSISTENCE TEST
-------------------------

Before opening your application to real users, you must manually verify that the Persistent Volume is functioning correctly.

1. Go to your live Vercel URL.
2. Create or login to a test account.
3. Complete a lesson to earn XP and progress.
4. Change settings, select a course, and save a custom avatar.
5. Go to Railway and manually **Restart** or **Redeploy** the backend service.
6. Wait for it to come back online, then refresh your Vercel URL.
7. Verify that:
   - Your user still exists.
   - Your XP remains.
   - Your lesson progress remains.
   - Your settings remain.
   - Your avatar remains.
   - Your course selection remains.

If any data disappears after the restart, your Volume is not mounted correctly to `/data`. Fix the volume mount path before proceeding.
