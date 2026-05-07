# ⚡ QUICK START - 5 Minutes to Running Locally

**Copy & Paste Commands Here**

---

## STEP 1: Open 3 Terminal Windows

Open THREE separate terminal windows/tabs. Label them:
- Terminal 1: Backend
- Terminal 2: Frontend  
- Terminal 3: Git

---

## STEP 2: Configure Environment Files

### Terminal 1 (Backend Setup)

```bash
cd backend

# Create .env file and add this:
cat > .env << EOF
PORT=5000
NODE_ENV=development
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_SECRET
DIDIT_WORKFLOW_ID=your_workflow_id
DIDIT_API_KEY=your_api_key
DIDIT_WEBHOOK_SECRET=your_webhook_secret
DIDIT_CALLBACK_URL=http://localhost:3000/dashboard/kyc/callback
CORS_ORIGIN=http://localhost:3000
EOF

# Add your Firebase file
# Place your serviceAccountKey.json in this folder
ls -la serviceAccountKey.json  # Verify it exists
```

### Terminal 2 (Frontend Setup)

```bash
cd frontend

# Create .env.local file and add this:
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
EOF
```

---

## STEP 3: Run Backend

### Terminal 1

```bash
# You should be in: zedideaarena/backend

npm install
npm run dev

# Wait for message: "Server highly active on port 5000"
# Keep this running ✅
```

---

## STEP 4: Run Frontend

### Terminal 2

```bash
# Navigate to: zedideaarena/frontend

npm install
npm run dev

# Wait for message: "Ready in X.Xs"
# Then go to: http://localhost:3000
# Keep this running ✅
```

---

## STEP 5: Test in Browser

```
1. Open http://localhost:3000 in your browser
2. You should see the landing page
3. Click "Sign In" or "Join Now"
4. Try to sign up with test email
5. Expected: Dashboard loads with your name ✅
```

---

## STEP 6: Push to GitHub

### Terminal 3

```bash
# Navigate to project root
cd zedideaarena

# Initialize git
git init

# Configure git (first time only)
git config --global user.name "Sean Tinasha Shenyakutira"
git config --global user.email "dodgysean9@gmail.com"

# Add all files
git add .

# Create commit
git commit -m "Initial commit: Production ready ZedIdeaArena application"

# Add remote (your GitHub URL)
git remote add origin https://github.com/seantinashenyakutira-whatsblade/zedideaarena.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main

# When asked for password: Use Personal Access Token from GitHub
```

---

## ✅ VERIFY SUCCESS

### Backend Check
```bash
# In new terminal, run:
curl http://localhost:5000/health

# Expected output:
# {"status":"healthy","services":{"firebase":"connected","stripe":"initialized"}}
```

### Frontend Check
```
- Open http://localhost:3000
- Page loads without errors
- Logo and buttons visible
```

### GitHub Check
```
- Go to: https://github.com/seantinashenyakutira-whatsblade/zedideaarena
- Verify all files are there
- Branch shows "main"
```

---

## 🐛 If Something Fails

### Backend won't start
```bash
# Check if port 5000 is free
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Check .env file exists
cat backend/.env

# Check Firebase file exists
ls -la backend/serviceAccountKey.json
```

### Frontend won't start
```bash
# Check if port 3000 is free
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Check .env.local exists
cat frontend/.env.local

# Clear cache and reinstall
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### GitHub push fails
```bash
# Generate Personal Access Token:
# 1. GitHub > Settings > Developer settings > Tokens
# 2. Generate new token, copy it
# 3. When git asks for password, paste token

# Or use GitHub CLI:
gh auth login
```

---

## 📝 ENVIRONMENT VARIABLE SOURCES

### Get Stripe Keys
- Dashboard: https://dashboard.stripe.com/test/keys
- Copy: Secret key (sk_test_...) and Publishable key (pk_test_...)

### Get Firebase Keys
- Console: https://console.firebase.google.com
- Project > Settings > Web SDK configuration
- Copy the config object values

### Get Didit.me Keys
- Dashboard: https://didit.me/dashboard
- Copy: Workflow ID and API Key from settings

---

## 🎯 Common Commands You'll Need

```bash
# Stop a running process
Ctrl + C  # In any terminal

# Install dependencies (do this once per folder)
npm install

# Start development server
npm run dev  # Frontend
npm run dev  # Backend

# Check git status
git status

# See recent commits
git log --oneline

# Push changes after making them
git add .
git commit -m "Your message"
git push origin main

# Pull latest changes from GitHub
git pull origin main
```

---

## ⏱️ Timeline

- **2-5 min**: Set up environment files
- **3-5 min**: Install dependencies & start servers
- **2-3 min**: Test in browser
- **2-3 min**: Push to GitHub
- **Total**: ~10-15 minutes ✅

---

## 🎉 WHAT'S NEXT

Once running locally successfully:

1. **Test Features** → See TESTING_GUIDE.md
2. **Deploy to Staging** → See DEPLOYMENT_CHECKLIST.md
3. **Deploy to Production** → See DEPLOYMENT_CHECKLIST.md

---

**You've got this!** 🚀

