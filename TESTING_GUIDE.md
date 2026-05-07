# ZedIdeaArena - Complete Testing Plan & Validation Guide

**Status**: Ready for Full System Testing  
**Test Date**: May 7, 2026  
**Environment**: Staging/Production Ready

---

## PRE-TESTING CHECKLIST

Before running tests, ensure:
- [ ] Backend server running (`npm run dev` in backend/)
- [ ] Frontend dev server running (`npm run dev` in frontend/)
- [ ] Firebase credentials configured in serviceAccountKey.json
- [ ] Stripe test keys configured in backend .env
- [ ] Didit.me test credentials configured
- [ ] CORS configured correctly
- [ ] All environment variables set

---

## 1. AUTHENTICATION FLOW TESTING

### 1.1 Sign Up Flow
**Path**: `/ → /auth/signup`

```
TEST 1.1.1: Sign Up with Email
- Navigate to /auth/signup
- Fill: Full Name, Email (new), Password (6+ chars)
- Click "Create Account"
- Expected: 
  ✓ Account created in Firebase
  ✓ User synced to Firestore with status 'contestant'
  ✓ Redirected to /dashboard
  ✓ Token stored in localStorage

TEST 1.1.2: Sign Up Validation
- Try email already in use → "Email already registered"
- Try weak password (< 6 chars) → "Password should be 6+ chars"
- Try invalid email format → "Invalid email"
- Leave fields blank → Validation errors shown

TEST 1.1.3: Sign Up with Google
- Click "Sign in with Google"
- Select Gmail account
- Expected:
  ✓ Firebase handles OAuth
  ✓ User profile created
  ✓ Redirected to /dashboard

TEST 1.1.4: Sign Up with GitHub
- Click "Sign in with GitHub"
- Authorize app
- Expected:
  ✓ Account created with GitHub email
  ✓ User synced to Firestore
  ✓ Redirected to /dashboard
```

### 1.2 Login Flow
**Path**: `/auth/login`

```
TEST 1.2.1: Login with Valid Credentials
- Enter email: [test-user-email]
- Enter password: [test-password]
- Check "Remember Me"
- Click "Sign In"
- Expected:
  ✓ Firebase authenticates user
  ✓ Backend syncs user data
  ✓ Redirected to /dashboard
  ✓ User profile loads

TEST 1.2.2: Login Error Handling
- Wrong password → "Incorrect password"
- Non-existent email → "No account found"
- Too many attempts → "Too many failed attempts. Try again later"
- Invalid email → Validation error

TEST 1.2.3: Token Management
- Check localStorage has 'token'
- Navigate to protected page
- Verify token in Authorization header
```

### 1.3 Logout Flow
```
TEST 1.3.1: Logout Function
- While logged in, click "Exit Arena" in sidebar
- Expected:
  ✓ Token removed from localStorage
  ✓ Redirected to /auth/login
  ✓ Trying to access /dashboard shows login
```

---

## 2. DASHBOARD OVERVIEW TESTING

**Path**: `/dashboard`

```
TEST 2.1: Dashboard Loads
- Navigate to /dashboard
- Expected:
  ✓ Welcome message displays user name
  ✓ Stats show: Total Ideas, Drafts, Published
  ✓ KYC Banner shows current status
  ✓ Recent ideas listed

TEST 2.2: Dashboard Stats Accuracy
- API call to /stats/global should return:
  { activeIdeas, communityMembers, fundingDistributed, countries }
- Stats card displays correct numbers
- Verify numbers match Firestore data

TEST 2.3: Role Switching
- Click role pills in header
- Switch between: Contestant → Voter → Admin
- Dashboard layout adjusts based on role
- Admin only: Shows "Admin Panel" in sidebar
```

---

## 3. IDEA CREATION & MANAGEMENT

**Path**: `/dashboard/ideas`

### 3.1 Create New Idea
```
TEST 3.1.1: Multi-Step Form Submission
Step 1 - Identity:
- Full Name: [pre-filled if exists]
- DOB: [date picker]
- Nationality: [dropdown]
- ID Number: [input]
- Click Next

Step 2 - Concept:
- Title: "My Amazing App"
- Category: [dropdown]
- Competition: [select or create]
- Description: [textarea, min 50 chars]
- Problem Statement: [textarea]
- Click Next

Step 3 - Pitch:
- Upload video (or paste URL)
- Upload image/thumbnail
- Upload pitch deck PDF
- Add social links (optional)
- Click Next

Step 4 - Guidelines:
- Checkbox: "I agree to guidelines"
- Checkbox: "I accept terms"
- Click Next

Step 5 - Commit:
- Review entry fee: $10.00
- Click "Pay & Submit Idea"
- Redirected to payment page

TEST 3.1.2: Form Validation
- Try submitting empty fields → Error shown
- Try video > 500MB → File too large error
- Try invalid URL → Validation error
- Try without checking guidelines → Cannot proceed

TEST 3.1.3: Draft Saving
- Fill Step 1 & 2
- Click "Save Draft"
- Expected:
  ✓ Data saved to Firestore
  ✓ Can edit later
  ✓ Shows in "My Ideas" as Draft
```

### 3.2 View My Ideas
```
TEST 3.2.1: Ideas List
- Navigate to /dashboard/ideas
- Expected:
  ✓ Shows all user's ideas (drafts + submitted)
  ✓ Cards show: Title, Category, Status, Image
  ✓ Draft ideas have "Edit" button
  ✓ Published ideas show vote count

TEST 3.2.2: Empty State
- First-time user sees: "The Arena Awaits"
- CTA button: "Submit Your First Vision"
- Click → Redirects to /dashboard/ideas/new
```

### 3.3 View Idea Details
```
TEST 3.3.1: Idea Detail Page (/dashboard/ideas/[id])
- Navigate to specific idea
- Expected:
  ✓ Full idea content displays
  ✓ Video embeds properly
  ✓ Creator info shows (name, role, socials)
  ✓ Vote count displays
  ✓ Status badge shows

TEST 3.3.2: Owner Actions
- If you're the owner:
  ✓ Edit button available
  ✓ Delete button available
  ✓ Publishing status shows
  ✓ Payment status shows

TEST 3.3.3: Non-Owner Actions
- If idea is published & paid:
  ✓ Can cast vote (if qualified)
  ✓ Cannot edit/delete
  ✓ See creator profile
```

---

## 4. PAYMENT FLOW TESTING

**Path**: `/dashboard/payment`

### 4.1 Contestant Payment (Idea Submission)
```
TEST 4.1.1: Payment Intent Creation
- Submitting idea triggers payment page
- URL params: type=contestant&ideaId=[id]&amount=10
- Expected:
  ✓ Amount displays: "$10.00"
  ✓ Stripe element loads
  ✓ Payment description shows idea title

TEST 4.1.2: Payment Processing
- Use Stripe test card: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits
- Click "Pay"
- Expected:
  ✓ Loading spinner shows
  ✓ Payment processes (takes 2-3 seconds)
  ✓ Webhook received & processed
  ✓ Idea status → 'submitted'
  ✓ Idea payment_status → 'paid'
  ✓ Redirected to /dashboard?payment=success

TEST 4.1.3: Payment Failure
- Use Stripe test card: 4000 0000 0000 0002
- Click "Pay"
- Expected:
  ✓ Payment fails
  ✓ Error message displayed
  ✓ Idea remains in draft
  ✓ Can retry payment

TEST 4.1.4: Webhook Processing
- Monitor backend logs for webhook events
- Expected:
  ✓ payment_intent.succeeded event logged
  ✓ Firestore updated: ideas[id].payment_status = 'paid'
  ✓ users[uid].competition_participant = true
```

### 4.2 Voter Payment
```
TEST 4.2.1: Voter Entry Fee
- From Voting page, click "Pay to Vote"
- URL params: type=voter&amount=15
- Expected:
  ✓ Amount displays: "$15.00"
  ✓ Description: "Voter Arena Entry Fee"

TEST 4.2.2: Payment Success
- Complete payment with valid card
- Expected:
  ✓ users[uid].voter_payment_status = 'paid'
  ✓ Vote button becomes active
  ✓ Can now cast votes
```

---

## 5. VOTING SYSTEM TESTING

**Path**: `/dashboard/voting`

### 5.1 Voting Arena
```
TEST 5.1.1: Access Requirements
- Not KYC verified: 
  ✓ "Must be verified to vote" message
  ✓ CTA: Go to KYC
- KYC verified but not paid:
  ✓ "Pay entry fee to vote" message
  ✓ CTA: Go to payment
- Both verified + paid:
  ✓ Can see all public ideas
  ✓ Vote button enabled

TEST 5.1.2: Ideas Display
- GET /ideas/public returns paid & submitted ideas
- Expected:
  ✓ Ideas sorted by recent or votes (TBD)
  ✓ Shows: Image, Title, Category, Creator
  ✓ Vote count visible
  ✓ Creator info visible

TEST 5.1.3: Search & Filter
- Search by title
- Filter by category
- Expected:
  ✓ Real-time search works
  ✓ Results update immediately
  ✓ Empty state if no results

TEST 5.1.4: Voting Restrictions
- Try to vote for own idea:
  ✓ "Cannot vote for your own idea"
- Try to vote twice for same idea:
  ✓ "You have already voted for this"
- Vote for different idea:
  ✓ Transaction completes
  ✓ Vote recorded
  ✓ Vote count increments
  ✓ Button shows "Voted"

TEST 5.1.5: Vote Recording
- Backend logs transaction
- Expected:
  ✓ votes[docId] created with userId, ideaId, timestamp
  ✓ ideas[ideaId].votes_count incremented by 1
  ✓ Frontend reflects new count
```

---

## 6. KYC VERIFICATION TESTING

**Path**: `/dashboard/kyc`

### 6.1 KYC Initiation
```
TEST 6.1.1: Start Verification
- Click "Begin Verification"
- Expected:
  ✓ API POST to /kyc/submit
  ✓ Didit.me session created
  ✓ Redirected to Didit.me verification page
  ✓ users[uid].kyc_status = 'pending'
  ✓ Session ID stored in Firestore

TEST 6.1.2: Didit.me Flow (External)
- At Didit.me:
  ✓ User selects document type
  ✓ Scans ID/Passport
  ✓ Takes selfie
  ✓ Liveness check
  ✓ Waits for verification result

TEST 6.1.3: Webhook Reception
- Didit.me sends webhook with status
- Backend receives webhook to /kyc/webhook
- Expected:
  ✓ Webhook signature verified
  ✓ Status mapped: Approved → 'verified'
  ✓ Status mapped: Rejected → 'rejected'
  ✓ users[uid].kyc_status updated
  ✓ users[uid].is_verified = true/false
```

### 6.2 Verification Status
```
TEST 6.2.1: Status Display
- Navigate to /dashboard/kyc after verification
- Expected:
  ✓ Unverified: "Start Verification" button
  ✓ Pending: "Verification in progress..." + processing icon
  ✓ Verified: ✓ Approved badge + next steps
  ✓ Rejected: ✗ Rejected badge + retry button

TEST 6.2.2: Role-Based Gates
- Unverified user tries to vote:
  ✓ Blocked: "Complete KYC to continue"
- Unverified user submits idea:
  ✓ Can still create & pay
  ✓ But cannot vote on others
```

---

## 7. COMPETITIONS TESTING

**Path**: `/dashboard/competitions`

### 7.1 View Competitions
```
TEST 7.1.1: Competitions List
- Navigate to /competitions
- Expected:
  ✓ GET /api/competitions returns list
  ✓ Shows: Title, Status, Countdown, Prize
  ✓ Active competitions highlighted
  ✓ Upcoming competitions show countdown
  ✓ Closed competitions archived

TEST 7.1.2: Competition Details
- Click on competition
- Expected:
  ✓ Shows full description
  ✓ Shows submission deadline
  ✓ Shows prize pool
  ✓ Shows participant count
  ✓ Button: "Submit Idea to This Competition"

TEST 7.1.3: Filter & Sort
- Filter by status: Active/Upcoming/Closed
- Sort by deadline
- Expected:
  ✓ Filters work correctly
  ✓ Sorting updates display
```

### 7.2 Submit to Competition
```
TEST 7.2.1: Competition-Specific Submission
- From competition detail, click "Submit Idea"
- Idea form loads with competition_id pre-filled
- Expected:
  ✓ Competition field is locked/disabled
  ✓ Can create new idea for this competition
  ✓ On payment success, idea linked to competition
```

---

## 8. ADMIN PANEL TESTING

**Path**: `/dashboard/admin`

### 8.1 Admin Access Control
```
TEST 8.1.1: Non-Admin Block
- Login as contestant
- Try to access /dashboard/admin
- Expected:
  ✓ Redirected to /dashboard
  ✓ Error: "Admin access required"
  ✓ Admin menu item not in sidebar

TEST 8.1.2: Admin Access
- Login as admin
- Navigate to /dashboard/admin
- Expected:
  ✓ Page loads
  ✓ Admin menu item visible in sidebar
  ✓ All admin sections accessible
```

### 8.2 Admin Dashboard Stats
```
TEST 8.2.1: Stats Display
- Expected:
  ✓ Total users count
  ✓ Total ideas count
  ✓ Paid ideas count
  ✓ Verified users count
  ✓ Revenue stats (if applicable)

TEST 8.2.2: Real-Time Updates
- Monitor stats changes in real-time
- Expected:
  ✓ New user signup → users count increases
  ✓ Idea submission → ideas count increases
  ✓ Payment completion → revenue updates
```

### 8.3 Manage Ideas
```
TEST 8.3.1: Ideas List
- Admin sees all ideas (not just own)
- Shows: Title, Creator, Status, Payment Status
- Can filter by status/creator

TEST 8.3.2: Moderate Ideas
- Can flag inappropriate idea
- Can block/delete idea
- Expected:
  ✓ Idea removed from public voting
  ✓ Creator notified (optional)
  ✓ Action logged

TEST 8.3.3: Create Competition
- Click "Create Competition"
- Form:
  - Title
  - Description
  - Thumbnail URL
  - Start/End Date
  - Submission Deadline
  - Entry Fee
  - Status
- Click "Create"
- Expected:
  ✓ POST /api/admin/competitions
  ✓ Competition created in Firestore
  ✓ Appears in competitions list
```

---

## 9. SETTINGS & PROFILE TESTING

**Path**: `/dashboard/settings`

### 9.1 Account Settings
```
TEST 9.1.1: Profile Information
- Navigate to settings
- Expected:
  ✓ Profile picture displays
  ✓ Name, Email editable
  ✓ Bio, Profession editable
  ✓ Changes saved to Firestore

TEST 9.1.2: KYC Status
- Shows current KYC status
- If unverified, "Start Verification" button
- If verified, shows ✓ badge

TEST 9.1.3: Role Management
- Shows current role: Contestant/Voter/Admin
- Can switch between Contestant and Voter
- Admin role cannot be changed via UI
```

### 9.2 Security
```
TEST 9.2.1: Password Change
- Current password field
- New password field
- Confirm password field
- Click "Change Password"
- Expected:
  ✓ Firebase auth password updated
  ✓ Confirmation message
  ✓ Session maintained

TEST 9.2.2: Logout
- Click "Logout"
- Expected:
  ✓ Token cleared
  ✓ Redirected to /auth/login
  ✓ Cannot access /dashboard
```

---

## 10. ERROR HANDLING & EDGE CASES

### 10.1 Network Errors
```
TEST 10.1.1: API Down
- Disable internet or mock API failure
- Try to load dashboard
- Expected:
  ✓ Error message displayed
  ✓ Retry button available
  ✓ App doesn't crash

TEST 10.1.2: Timeout
- Simulate slow API (> 30s timeout)
- Expected:
  ✓ Timeout error shown
  ✓ Retry option provided
```

### 10.2 Data Validation
```
TEST 10.2.1: Malformed Data
- Send invalid data via API
- Expected:
  ✓ Backend returns 400 error
  ✓ Frontend shows error message
  ✓ Form doesn't submit

TEST 10.2.2: Concurrent Actions
- Try to vote while payment processing
- Try to edit idea while uploading
- Expected:
  ✓ Actions are queued or blocked
  ✓ User gets clear feedback
```

### 10.3 Authentication Errors
```
TEST 10.3.1: Token Expiration
- Token expires during session
- Try to make API call
- Expected:
  ✓ 401 error received
  ✓ User redirected to login
  ✓ Message: "Session expired. Please login again"

TEST 10.3.2: Invalid Token
- Manually edit localStorage token
- Try to access protected page
- Expected:
  ✓ 401 error
  ✓ Redirected to login
```

---

## 11. PERFORMANCE TESTING

```
TEST 11.1: Page Load Times
- Landing page: < 2s (first paint)
- Dashboard: < 3s (first paint)
- Ideas list: < 2s (paginated)

TEST 11.2: Large Data Sets
- Voting page with 100+ ideas: < 3s
- Scrolling should be smooth (60 FPS)
- Search should respond < 500ms

TEST 11.3: Bundle Size
- Frontend bundle: < 500KB gzipped
- Check with: npm run build && npm run analyze
```

---

## 12. MOBILE RESPONSIVENESS

```
TEST 12.1: Mobile Layout
- Test on iPhone 12, 13, 14
- Test on Android devices
- Expected:
  ✓ All text readable
  ✓ Buttons tappable (48px min)
  ✓ Forms work without horizontal scroll
  ✓ Videos/images responsive

TEST 12.2: Touch Interactions
- Sidebar opens/closes with hamburger
- Modals swipeable to close
- Buttons have hover/focus states
```

---

## 13. BROWSER COMPATIBILITY

```
TEST 13.1: Chrome
- Version: Latest 2 versions
- Status: ✓ Primary support

TEST 13.2: Firefox
- Version: Latest 2 versions
- Status: ✓ Full support

TEST 13.3: Safari
- macOS & iOS
- Status: ✓ Full support

TEST 13.4: Edge
- Latest version
- Status: ✓ Full support
```

---

## TEST EXECUTION GUIDE

### Run All Tests
```bash
# Frontend tests
cd frontend
npm run test

# Backend tests  
cd backend
npm run test

# Integration tests
npm run test:integration
```

### Manual Testing Checklist
- [ ] Complete auth flow with provided credentials
- [ ] Create & submit an idea
- [ ] Make a payment
- [ ] Verify KYC
- [ ] Cast a vote
- [ ] Test admin functions
- [ ] Check all pages on mobile
- [ ] Test error states
- [ ] Verify no console errors
- [ ] Check network requests in DevTools

---

## SIGN-OFF

**Tester**: _______________  
**Date**: _______________  
**Pass/Fail**: _______________  
**Issues Found**: _______________  
**Critical Blockers**: _______________  

---

## ISSUE TRACKING

Use this format for any issues found:

```
[Issue #001]
Category: [Auth/Payment/Voting/Admin/UI]
Severity: [Critical/High/Medium/Low]
Description: Clear description of issue
Steps to Reproduce: 1. 2. 3.
Expected: What should happen
Actual: What actually happened
Device/Browser: [Device, OS, Browser version]
Screenshot: [Attach if applicable]
```

