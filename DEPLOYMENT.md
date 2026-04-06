# DreamNest Deployment

## Stack
- Frontend: Vercel
- Backend API: Railway
- Database: Railway MySQL

## 1) Push code to GitHub
```bash
git add .
git commit -m "deploy setup"
git push origin main
```

## 2) Create Railway MySQL
1. Railway -> New Project -> Provision MySQL
2. Copy these values from Railway variables:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

## 3) Deploy backend on Railway
1. Railway -> New Project -> Deploy from GitHub Repo
2. Select this repository
3. Railway will use the repo-level `railway.json` file to build and start from `backend`
4. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `DB_HOST=<MYSQLHOST>`
   - `DB_PORT=<MYSQLPORT>`
   - `DB_USER=<MYSQLUSER>`
   - `DB_PASSWORD=<MYSQLPASSWORD>`
   - `DB_NAME=<MYSQLDATABASE>`
   - `DB_SSL=false`
   - `JWT_SECRET=<long_random_secret>`
   - `ADMIN_SECRET=<admin_secret>`
   - `GROQ_API_KEY=<your_groq_key>`
   - `GROQ_MODEL=llama-3.3-70b-versatile`
   - `GROQ_VISION_MODEL=llama-3.2-90b-vision-preview`
   - `SERPAPI_KEY=<your_serpapi_key>`
   - `CORS_ORIGIN=<your_vercel_url>`
5. Deploy and open health URL:
   - `https://<railway-service>.up.railway.app/api/health`

## 4) Deploy frontend on Vercel
1. Vercel -> New Project -> import same GitHub repo
2. Root Directory: `frontend`
3. Framework: Vite
4. Environment variable:
   - `VITE_API_BASE=https://<railway-service>.up.railway.app`
5. Deploy

## 5) Final CORS update
After Vercel deploy, set Railway backend `CORS_ORIGIN` to:
- `https://<your-vercel-app>.vercel.app`

Re-deploy backend.

## 6) Post-deploy checks
1. Open frontend URL
2. Register/login
3. Create project
4. Save requirements
5. Run AI planning
6. Open marketplace
7. Open chatbot + Pinterest links

## Notes
- Do not include a trailing slash in `VITE_API_BASE`.
- Test `https://<railway-service>.up.railway.app/api/health` before connecting Vercel.
- If products load slowly, disable `Exact verified links only`.
