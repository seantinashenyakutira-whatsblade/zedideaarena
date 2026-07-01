# ZedIdeaArena Waitlist Landing Page Setup

**Status**: Active from July 1, 2026 → July 15, 2026

## Overview

The public homepage (`/`) has been temporarily converted to a clean waitlist landing page while we conduct final testing and review before the July 15 launch.

### What Changed

- **`frontend/app/page.tsx`** - Now redirects `/` → `/waitlist`
- **`frontend/app/waitlist/page.tsx`** - New waitlist landing page (created)
- **All other routes** - Remain fully functional and accessible

## What's Still Accessible

✅ **User Routes**: `/auth/login`, `/auth/signup`  
✅ **Dashboard**: `/dashboard`, all authenticated features  
✅ **Admin Panel**: `/admin` routes  
✅ **Competitions**: All competition routes work normally  
✅ **Voting System**: Active and functional  
✅ **Payments**: Stripe integration active  

**Only** the public homepage (`/`) redirects to waitlist.

## Waitlist Form Integration

### Frontend (Already Done)
- Form fields: name (required), email (required), interest (optional)
- Success/error states with feedback
- Responsive design with animations
- Located at `/waitlist`

### Backend Setup Required

**Create API endpoint:**
```
POST /api/waitlist/signup
```

**Expected body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "interest": "tech"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "You've been added to the waitlist"
}
```

### Database Setup (Supabase)

Run this in your Supabase SQL Editor:

```sql
-- Create waitlist_signups table
CREATE TABLE waitlist_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  interest varchar(50),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Add unique constraint on email to prevent duplicates
ALTER TABLE waitlist_signups ADD CONSTRAINT unique_waitlist_email UNIQUE(email);

-- Create indexes for faster queries
CREATE INDEX idx_waitlist_email ON waitlist_signups(email);
CREATE INDEX idx_waitlist_created ON waitlist_signups(created_at DESC);

-- Optional: Enable RLS if your auth policies require it
ALTER TABLE waitlist_signups ENABLE ROW LEVEL SECURITY;
```

### Example Backend Implementation (Express.js)

Add to your backend routes:

```javascript
// backend/src/routes/waitlist.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.post('/signup', async (req, res) => {
  try {
    const { name, email, interest } = req.body;

    // Validation
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required' 
      });
    }

    // Check if already on waitlist
    const { data: existing } = await supabase
      .from('waitlist_signups')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      return res.status(200).json({ 
        success: true, 
        message: 'You are already on the waitlist' 
      });
    }

    // Add to waitlist
    const { data, error } = await supabase
      .from('waitlist_signups')
      .insert([{
        name: name.trim(),
        email: email.trim().toLowerCase(),
        interest: interest || null
      }])
      .select();

    if (error) throw error;

    // TODO: Send welcome email
    // await sendWaitlistConfirmationEmail(email, name);

    return res.status(201).json({
      success: true,
      message: 'You have been added to the waitlist',
      data: data[0]
    });
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong'
    });
  }
});

module.exports = router;
```

**Register in your main server file:**
```javascript
// backend/src/index.js or server.js
const waitlistRouter = require('./routes/waitlist');
app.use('/api/waitlist', waitlistRouter);
```

## Landing Page Features

### Copy & Messaging
- **Headline**: "Great ideas deserve to be seen."
- **Subheadline**: Focus on visibility, discovery, builders getting noticed
- ✅ No launch date shown anywhere
- ✅ No prize money emphasis
- ✅ No mention of active competitions

### Sections
1. **Hero** - Headline, subheadline, waitlist form
2. **Why We're Building This** - 4 value propositions
3. **How It Will Work** - 4-step process
4. **Who It's For** - Innovators & Community Members
5. **CTA** - Call to join waitlist

### Design
- Purple/blue gradient accents (#6366F1, #22D3EE)
- Dark premium aesthetic (#0A0A0F)
- Framer Motion animations
- Fully responsive (mobile-first)
- Fast loading

## Monitoring Signups

Query your Supabase dashboard:

```sql
-- Total signups
SELECT COUNT(*) FROM waitlist_signups;

-- By interest
SELECT interest, COUNT(*) as count 
FROM waitlist_signups 
GROUP BY interest 
ORDER BY count DESC;

-- By date
SELECT DATE(created_at), COUNT(*) 
FROM waitlist_signups 
GROUP BY DATE(created_at) 
ORDER BY DATE(created_at) DESC;
```

## Restoration After July 15, 2026

To restore the full landing page:

**Option A: Restore from git history**
```bash
# Find the commit before the redirect was added
git log --oneline | head -5

# Restore the original page.tsx
git show <original-commit>:frontend/app/page.tsx > frontend/app/page.tsx
git add frontend/app/page.tsx
git commit -m "Restore full landing page after launch"
```

**Option B: Manual update**
1. Replace the redirect in `frontend/app/page.tsx` with the original full landing page
2. Keep `/waitlist` available if you want to continue collecting signups
3. Commit and deploy

## Timeline

| Date | Action |
|------|--------|
| July 1, 2026 | Waitlist launched, homepage redirects to `/waitlist` |
| July 1-15 | Collect signups, review system, test features |
| July 15, 2026 | **LAUNCH**: Restore full landing page, competitions go live |

## Notes

- All authentication and user-facing features remain active during waitlist period
- Existing users can still sign in and access their accounts
- The waitlist is purely for new visitors to the public homepage
- Consider adding email verification before sending launch notifications
- Set up email templates for welcome/confirmation messages
