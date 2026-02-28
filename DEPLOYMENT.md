# DreamNest Deployment (Default Stack)

## Stack
- Frontend: Vercel
- Backend API: Render (Web Service)
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

## 3) Deploy backend on Render
1. Render -> New -> Web Service -> connect GitHub repo
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `DB_HOST=<MYSQLHOST>`
   - `DB_PORT=<MYSQLPORT>`
   - `DB_USER=<MYSQLUSER>`
   - `DB_PASSWORD=<MYSQLPASSWORD>`
   - `DB_NAME=<MYSQLDATABASE>`
   - `DB_SSL=true`
   - `JWT_SECRET=<long_random_secret>`
   - `ADMIN_SECRET=<admin_secret>`
   - `GROQ_API_KEY=<your_groq_key>`
   - `GROQ_MODEL=llama-3.3-70b-versatile`
   - `GROQ_VISION_MODEL=llama-3.2-90b-vision-preview`
   - `SERPAPI_KEY=<your_serpapi_key>`
   - `CORS_ORIGIN=<your_vercel_url>`
6. Deploy and open health URL:
   - `https://<render-service>.onrender.com/api/health`

## 4) Deploy frontend on Vercel
1. Vercel -> New Project -> import same GitHub repo
2. Root Directory: `frontend`
3. Framework: Vite
4. Environment variable:
   - `VITE_API_BASE=https://<render-service>.onrender.com`
5. Deploy

## 5) Final CORS update
After Vercel deploy, set backend `CORS_ORIGIN` to:
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
- First Render cold start can take time on free tier.
- If products load slowly, disable `Exact verified links only`.
