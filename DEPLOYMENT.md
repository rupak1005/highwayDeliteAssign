# Deployment Guide

This guide covers deploying BookIt to production.

## Deployment Architecture

- **Frontend**: Vercel (React app)
- **Backend**: Railway/Render (Node.js API)
- **Database**: Neon (PostgreSQL)

## 1. Deploy Backend (Railway or Render)

### Option A: Railway (Recommended)

1. Go to [railway.app](https://railway.app) and sign up/login

2. Click "New Project" → "Deploy from GitHub repo"

3. Connect your repository

4. Add environment variables in the Railway dashboard:
   ```
   PORT=5000
   NODE_ENV=production
   DATABASE_URL=your_neon_connection_string
   JWT_SECRET=your_random_secret
   ```

5. Railway will auto-detect Node.js and deploy

6. Note your backend URL (e.g., `https://your-app.up.railway.app`)

### Option B: Render

1. Go to [render.com](https://render.com) and sign up

2. Click "New" → "Web Service"

3. Connect your GitHub repo

4. Settings:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Environment: Node

5. Add environment variables:
   ```
   PORT=5000
   NODE_ENV=production
   DATABASE_URL=your_neon_connection_string
   JWT_SECRET=your_random_secret
   ```

6. Note your backend URL

## 2. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login

2. Click "New Project" → Import your GitHub repo

3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Add environment variables:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```

5. Click "Deploy"

## 3. Update CORS Settings

After deploying backend, update `server/index.js`:

```javascript
app.use(cors({
  origin: [
    'https://your-frontend-vercel-app.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
```

Redeploy the backend after this change.

## 4. Database Setup

1. Make sure your Neon database is accessible
2. Run the seed script on your production database:
   ```bash
   cd server
   npm run seed
   ```

Or connect via psql and run the seed manually.

## 5. Testing

1. Visit your Vercel frontend URL
2. Check that it can reach your backend API
3. Test booking flow
4. Check API health endpoint

## Troubleshooting

### CORS Errors
- Make sure backend CORS includes your Vercel domain
- Check for trailing slashes in URLs

### API Connection Fails
- Verify `VITE_API_URL` environment variable in Vercel
- Check backend logs on Railway/Render
- Test backend URL directly in browser

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if Neon database is not paused
- Ensure connection string includes SSL params

## Environment Variables Summary

### Vercel (Frontend)
- `VITE_API_URL` - Your backend API URL

### Railway/Render (Backend)
- `PORT` - Server port (usually 5000)
- `NODE_ENV` - production
- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - Random secret for JWT tokens

