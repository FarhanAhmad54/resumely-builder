# Resumely - Deployment Guide

This guide explains how to deploy Resumely to **Render.com** for free hosting.

## Prerequisites

- GitHub account
- Git installed on your computer

## Step 1: Push to GitHub

1. **Create a new repository** on GitHub:
   - Go to https://github.com/new
   - Name it `resumely` (or any name you prefer)
   - Keep it **Public** (required for free tier)
   - Do NOT initialize with README (we already have code)

2. **Initialize Git and push** (run in the project folder):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Resumely Resume Builder"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/resumely.git
   git push -u origin main
   ```

## Step 2: Deploy to Render

1. **Go to Render.com**: https://render.com
2. **Sign up/Login** with your GitHub account
3. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `resumely` repository

4. **Configure the service**:
   | Setting | Value |
   |---------|-------|
   | Name | `resumely` |
   | Root Directory | `backend` |
   | Runtime | `Node` |
   | Build Command | `npm install` |
   | Start Command | `node server.js` |

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | (Generate a random 64-character string) |
   | `JWT_EXPIRES_IN` | `7d` |

6. **Click "Create Web Service"**

## Step 3: Wait for Deployment

- Render will build and deploy your app (takes 2-5 minutes)
- You'll get a URL like: `https://resumely.onrender.com`

## Step 4: Verify Deployment

1. Visit your app URL
2. Check the API health: `https://YOUR-APP.onrender.com/api/health`
3. Test creating and saving a resume

---

## Activating Google AdSense Ads

### Step 1: Create AdSense Account
1. Go to https://adsense.google.com
2. Sign up with your Google account
3. Add your Render URL as your site

### Step 2: Get Approved
- AdSense will review your site (takes 1-2 weeks)
- Your site needs real content and traffic

### Step 3: Replace Ad Codes
Once approved, update `index.html`:
1. Replace `ca-pub-XXXXXXXXXXXXXXXX` with your Publisher ID
2. Replace `XXXXXXXXXX` with your ad slot IDs

---

## Troubleshooting

### Site not loading?
- Check Render logs in the dashboard
- Verify environment variables are set

### API errors?
- Make sure JWT_SECRET is set
- Check that all dependencies installed

### Database issues?
- The app uses in-memory SQLite by default
- Data resets on each deploy (consider upgrading to persistent storage)

---

## Free Tier Limitations

| Service | Limit |
|---------|-------|
| Render Web Service | 750 hours/month |
| Sleep after inactivity | 15 minutes |
| Cold start | ~30 seconds |

> **Note**: On free tier, the app "sleeps" after 15 minutes of inactivity. First visit after sleep takes ~30 seconds to load.
