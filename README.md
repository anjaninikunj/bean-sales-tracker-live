# Bean Sales Tracker Pro - Deployment Guide

## 1. Local Setup
1. Copy all files into your folder.
2. Run `npm install`
3. Run `npm run dev` (Frontend) and `node server.js` (Backend).

## 2. GitHub Push
```bash
git init
git add .
git commit -m "Fix tsconfig for Vercel"
git push origin main
```

## 3. Render.com (Backend)
- **Root Directory**: Leave EMPTY.
- **Start Command**: `node server.js`
- **Environment Variables**: `DB_USER`, `DB_PASSWORD`, `DB_SERVER`, `DB_NAME`.

## 4. Vercel.com (Frontend)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
   - `VITE_API_URL`: Your Render URL (e.g., `https://bean-sales-api.onrender.com`)

## 5. Troubleshooting Vercel Build
If you see "TS6305" error, ensure your `tsconfig.json` has `vite.config.ts` in the `exclude` array. This is already updated in the current version.
