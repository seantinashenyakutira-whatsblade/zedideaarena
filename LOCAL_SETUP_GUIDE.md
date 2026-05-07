# ZedIdeaArena - Local Development & GitHub Deployment Guide

**Date**: May 7, 2026  
**Status**: Complete Setup Instructions  

---

## TABLE OF CONTENTS
1. Prerequisites
2. Environment Setup
3. Running Backend Locally
4. Running Frontend Locally
5. Testing Both Together
6. Pushing to GitHub
7. Troubleshooting

---

## 1️⃣ PREREQUISITES

Before you start, install these on your machine:

### Required Software
```bash
# Node.js (includes npm)
# Download: https://nodejs.org/ (v18 or higher)
# Verify installation:
node --version    # Should be v18+
npm --version     # Should be v8+

# Git
# Download: https://git-scm.com/
# Verify installation:
git --version
```

### Required Accounts & Keys
You'll need:
- ✅ Firebase project with credentials (serviceAccountKey.json)
- ✅ Stripe test API keys
- ✅ Didit.me test credentials
- ✅ GitHub account (already have it: github.com/seantinashenyakutira-whatsblade)

---

## 2️⃣ ENVIRONMENT SETUP

### Step 1: Configure Backend Environment Variables

```bash
# Navigate to backend folder
cd backend

# Create .env file
# Copy from .env.example or create new file with:
touch .env

# Open .env with text editor and add:
PORT=5000
NODE_ENV=development
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_WEBHOOK_SECRET
DIDIT_WORKFLOW_ID=your_test_workflow_id
DIDIT_API_KEY=your_test_api_key
DIDIT_WEBHOOK_SECRET=your_test_webhook_secret
DIDIT_CALLBACK_URL=http://localhost:3000/dashboard/kyc/callback
CORS_ORIGIN=http://localhost:3000
```

### Step 2: Add Firebase Credentials to Backend

```bash
# Copy your Firebase serviceAccountKey.json to backend root
# File location: backend/serviceAccountKey.json

# Get this from:
# 1. Firebase Console > Project Settings
# 2. Service Accounts tab
# 3. Generate new private key
# 4. Save the JSON file as serviceAccountKey.json in backend/ folder
```

### Step 3: Configure Frontend Environment Variables

```bash
# Navigate to frontend folder
cd frontend

# Create .env.local file
# Copy from .env.example or create new file with:
touch .env.local

# Open .env.local with text editor and add:
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY_HERE
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

### Step 4: Get Your Keys

**Stripe Test Keys:**
```
1. Go to https://dashboard.stripe.com/test/keys
2. Copy "Secret key" (starts with sk_test_)
3. Copy "Publishable key" (starts with pk_test_)
4. Add to .env files
```

**Firebase Keys:**
```
1. Go to Firebase Console
2. Click Project Settings (gear icon)
3. Service Accounts tab
4. Copy the Web SDK configuration
5. Add to frontend .env.local
```

---

## 3️⃣ RUNNING BACKEND LOCALLY

### Step 1: Install Backend Dependencies

```bash
# From root directory
cd backend

# Install npm packages
npm install

# Output should show:
# added XXX packages
# Verify no error messages
```

### Step 2: Start Backend Server

```bash
# Option A: Development mode (with auto-reload)
npm run dev

# Expected output:
# > nodemon src/index.js
# Server highly active on port 5000

# Option B: Production mode (no auto-reload)
npm start

# Expected output:
# Server highly active on port 5000
```

### Step 3: Verify Backend is Running

**In a new terminal window:**

```bash
# Test the health endpoint
curl http://localhost:5000/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2026-05-07T...",
#   "services": {
#     "firebase": "connected",
#     "stripe": "initialized",
#     "didit": "keys_present"
#   }
# }

# If successful: ✅ Backend is working!
# If failed: Check .env variables and Firebase credentials
```

### Step 4: Test Backend API

```bash
# Test landing page
curl http://localhost:5000/

# Expected response:
# {
#   "status": "success",
#   "message": "Zed Idea Arena API - Ready to Run",
#   "version": "1.0.0"
# }
```

**Keep this terminal window open** with backend running while you start frontend.

---

## 4️⃣ RUNNING FRONTEND LOCALLY

### Step 1: Open New Terminal Window

```bash
# Open a SECOND terminal window (keep backend running in first)
# Navigate to root directory
cd zedideaarena

# Then go to frontend
cd frontend
```

### Step 2: Install Frontend Dependencies

```bash
# Install npm packages
npm install

# Expected output:
# added XXX packages
# Verify no error messages
```

### Step 3: Start Frontend Dev Server

```bash
# Start development server
npm run dev

# Expected output:
# > next dev
#  ▲ Next.js 14.x.x
#  - Local:        http://localhost:3000
#  - Environments: .env.local
#
# Ready in 2.5s

# The server is now running!
```

### Step 4: Open in Browser

```bash
# Open your browser and go to:
http://localhost:3000

# You should see:
# ✅ Landing page loads
# ✅ ZedIdeaArena logo displays
# ✅ Sign In / Join Now buttons visible
# ✅ No console errors (check DevTools: F12)
```

---

## 5️⃣ TESTING BOTH TOGETHER

### Test 1: Authentication Flow

```
1. Go to http://localhost:3000/auth/signup
2. Fill in:
   - Full Name: Test User
   - Email: test@example.com
   - Password: TestPass123
3. Click "Create Account"
4. Expected:
   ✅ No errors in browser console
   ✅ Account created
   ✅ Redirected to /dashboard
   ✅ Welcome message shows your name
```

### Test 2: Login Flow

```
1. Go to http://localhost:3000/auth/login
2. Use credentials from Test 1
3. Click "Sign In"
4. Expected:
   ✅ Logs in successfully
   ✅ Redirected to /dashboard
   ✅ User data loads
```

### Test 3: Backend API Connection

```
# In browser DevTools (F12 > Network tab):
1. Log in
2. Watch network requests
3. Should see:
   ✅ POST http://localhost:5000/api/user/login (200 OK)
   ✅ GET http://localhost:5000/api/user/profile (200 OK)
   ✅ Response shows user data
```

### Test 4: Create an Idea

```
1. Go to /dashboard
2. Click "New Idea" button
3. Fill in first step:
   - Full Name: Test User
   - Date of Birth: Any date
   - Nationality: Any country
4. Click Next
5. Expected:
   ✅ Form advances to step 2
   ✅ No console errors
   ✅ Data saved to console (check DevTools)
```

### Test 5: Check Backend Logs

```bash
# In backend terminal (running npm run dev):
# You should see logs like:
# [AUTH] User logged in: [user-id]
# [AUTH] New user created: [user-id]
# [IDEA] Draft saved: [idea-id]

# If you see these: ✅ Frontend & Backend communicating!
```

---

## 6️⃣ PUSHING TO GITHUB

### Step 1: Verify Git Installation

```bash
# Check git is installed
git --version

# Should output: git version 2.x.x or higher
```

### Step 2: Configure Git (First Time Only)

```bash
# Set your name and email
git config --global user.name "Sean Tinasha Shenyakutira"
git config --global user.email "dodgysean9@gmail.com"

# Verify configuration
git config --global --list
```

### Step 3: Initialize Git Repository

```bash
# Navigate to project root
cd zedideaarena

# Initialize git repository
git init

# Verify git repo created
git status

# Expected output:
# On branch master (or main)
# No commits yet
# Untracked files:
#   .gitignore
#   backend/
#   frontend/
#   README.md
#   ... etc
```

### Step 4: Add All Files to Git

```bash
# Add all files to staging area
git add .

# Verify files are staged
git status

# Expected output:
# On branch master
# Changes to be committed:
#   new file: .gitignore
#   new file: backend/...
#   ... etc (all files listed)
```

### Step 5: Create Initial Commit

```bash
# Create commit with message
git commit -m "Initial commit: Full ZedIdeaArena application - Production ready"

# Expected output:
# [master (root-commit) xxxxx] Initial commit...
#  XXX files changed, XXXXX insertions(+)
```

### Step 6: Add GitHub Remote

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/seantinashenyakutira-whatsblade/zedideaarena.git

# Verify remote added
git remote -v

# Expected output:
# origin  https://github.com/seantinashenyakutira-whatsblade/zedideaarena.git (fetch)
# origin  https://github.com/seantinashenyakutira-whatsblade/zedideaarena.git (push)
```

### Step 7: Rename Branch to Main (Optional but Recommended)

```bash
# Rename master to main
git branch -M main

# Verify branch renamed
git branch

# Expected output:
# * main
```

### Step 8: Push to GitHub

```bash
# Push to GitHub
git push -u origin main

# You may be asked for credentials:
# Option 1: Username & Personal Access Token
#   - Username: seantinashenyakutira-whatsblade
#   - Password: [Your GitHub Personal Access Token]
#
# Option 2: GitHub CLI authentication
#   - Will open browser for authentication

# Expected output:
# Enumerating objects: XXX, done.
# Counting objects: 100% (XXX/XXX), done.
# Compressing objects: 100% (XXX/XXX), done.
# Writing objects: 100% (XXX/XXX), done.
# Total XXX (delta XXX), reused 0 (delta 0)
# remote: Resolving deltas: 100% (XXX/XXX), done.
# To https://github.com/seantinashenyakutira-whatsblade/zedideaarena.git
#  * [new branch]      main -> main
# Branch 'main' set up to track remote branch 'main' from 'origin'.
```

### Step 9: Verify on GitHub

```bash
# Open browser and go to:
https://github.com/seantinashenyakutira-whatsblade/zedideaarena

# You should see:
✅ All your files uploaded
✅ Branch is "main"
✅ Recent commit showing your message
✅ File count matches local
```

---

## 7️⃣ IMPORTANT FILES TO EXCLUDE FROM GIT

### Create .gitignore File

```bash
# In project root (zedideaarena/), create .gitignore
# Add these lines to exclude sensitive files:

# Backend
backend/.env
backend/serviceAccountKey.json
backend/node_modules/
backend/dist/
backend/.DS_Store

# Frontend
frontend/.env.local
frontend/.env.*.local
frontend/node_modules/
frontend/.next/
frontend/out/
frontend/.DS_Store

# General
.vscode/
.idea/
*.log
npm-debug.log*
yarn-debug.log*
.DS_Store
```

### Add and Commit .gitignore

```bash
# If .gitignore already exists and needs updating:
git add .gitignore
git commit -m "Update .gitignore with environment files"
git push origin main
```

---

## 📋 COMPLETE WORKFLOW SUMMARY

### Terminal 1: Backend
```bash
cd zedideaarena/backend
npm install
npm run dev
# Runs on http://localhost:5000
# Keep this running
```

### Terminal 2: Frontend
```bash
cd zedideaarena/frontend
npm install
npm run dev
# Runs on http://localhost:3000
# Keep this running
```

### Terminal 3: Git Commands
```bash
cd zedideaarena
git init
git add .
git commit -m "Initial commit: Production ready ZedIdeaArena"
git remote add origin https://github.com/seantinashenyakutira-whatsblade/zedideaarena.git
git branch -M main
git push -u origin main
```

---

## ✅ VERIFICATION CHECKLIST

After completing all steps:

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Health check returns success (curl http://localhost:5000/health)
- [ ] Landing page loads without errors
- [ ] Can sign up successfully
- [ ] Can login successfully
- [ ] Dashboard shows user data
- [ ] Backend logs show user activity
- [ ] All files pushed to GitHub
- [ ] GitHub repo shows "main" branch
- [ ] GitHub repo shows your files

---

## 🔧 TROUBLESHOOTING

### Issue: "Port 5000 already in use"

```bash
# Find process using port 5000
# macOS/Linux:
lsof -i :5000

# Windows:
netstat -ano | findstr :5000

# Kill the process:
# macOS/Linux:
kill -9 <PID>

# Windows:
taskkill /PID <PID> /F
```

### Issue: "Port 3000 already in use"

```bash
# Same as above but for port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### Issue: "Cannot find serviceAccountKey.json"

```bash
# Make sure file is in correct location:
zedideaarena/backend/serviceAccountKey.json

# And .env points to it:
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### Issue: "NEXT_PUBLIC_API_URL not configured"

```bash
# Make sure .env.local exists in frontend/
# And has:
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Then restart frontend: Stop (Ctrl+C) and npm run dev again
```

### Issue: "Git push asks for password"

```bash
# Use Personal Access Token instead of password:
# 1. Go to GitHub > Settings > Developer settings > Personal access tokens
# 2. Generate new token (check "repo" permission)
# 3. Copy token
# 4. When asked for password, paste token

# Or use GitHub CLI:
gh auth login
# Follow prompts to authenticate
```

### Issue: "npm install fails"

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install
```

### Issue: "Firebase connection fails"

```bash
# Check:
1. serviceAccountKey.json exists in backend/
2. FIREBASE_SERVICE_ACCOUNT_PATH is correct in .env
3. Firebase project is active and not deleted
4. Internet connection is working
5. Try: curl http://localhost:5000/health
```

---

## 📚 QUICK REFERENCE COMMANDS

### Backend Commands
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start with auto-reload
npm start            # Start production mode
npm test             # Run tests (if configured)
```

### Frontend Commands
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Check code style
```

### Git Commands
```bash
git status           # Check current status
git add .            # Stage all changes
git commit -m "msg"  # Create commit
git push             # Push to remote
git log              # View commit history
git diff             # See changes
```

---

## 🎯 NEXT STEPS AFTER LOCAL TESTING

Once everything works locally:

1. **Test All Features** (Use TESTING_GUIDE.md)
   - Sign up/Login
   - Create ideas
   - Payment flow
   - Voting
   - KYC

2. **Deploy to Staging** (Use DEPLOYMENT_CHECKLIST.md)
   - Set up Vercel for frontend
   - Set up Render for backend
   - Configure webhooks
   - Run final tests

3. **Deploy to Production**
   - Use production API keys
   - Switch to live Stripe keys
   - Monitor for errors

---

## 💡 HELPFUL TIPS

### Keep Two Terminals Open
Always keep backend and frontend running in separate terminal windows while developing.

### Check Console Errors
- **Browser**: Press F12 > Console tab
- **Backend**: Watch terminal output
- Errors here are the first place to check when debugging

### Use DevTools Network Tab
- **Browser**: Press F12 > Network tab
- Watch API calls being made
- See request/response data

### Git Workflow
```bash
# After making changes:
git status                    # See what changed
git add .                     # Stage changes
git commit -m "description"   # Create commit
git push origin main          # Push to GitHub
```

### Environment Variables
- **Backend**: Changes need npm restart
- **Frontend**: Changes need npm restart
- Always verify .env and .env.local files are created

---

## 🚀 SUCCESS!

Once you complete these steps:

✅ Your application is running locally  
✅ Frontend & Backend communicating  
✅ Code is pushed to GitHub  
✅ You can now deploy to production  

**You're ready to go live!** 🎉

