# ZedIdeaArena

**Pitch. Compete. Win.**

A full-stack SaaS platform for idea competitions. Contestants submit ideas with pitch videos, voters pay to vote on ideas, and admins manage the entire ecosystem.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │   Backend       │
│   Next.js 15    │────▶│   Express.js    │
│   React 19      │     │   Port 5000     │
│   Tailwind v4   │     │                 │
└─────────────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Supabase      │     │   Stripe        │
│   Auth + DB     │     │   Payments      │
│   Storage       │     │   Webhooks      │
└─────────────────┘     └─────────────────┘
```

## Features

- **Dual Mode System**: Switch between Contestant and Voter modes
- **Contestant Mode**: Submit ideas, upload pitch videos, pay entry fees, compete
- **Voter Mode**: Get verified by admin, pay voter fee, vote on ideas (1 vote per competition)
- **Admin Panel**: Verify users, manage competitions, approve/reject ideas, view all data
- **Stripe Payments**: Secure payment processing for contestant and voter entry fees
- **Supabase Auth**: Email/password + Google OAuth
- **Supabase Storage**: File uploads for pitch videos and images
- **Row Level Security**: Data isolation at database level

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | Express.js, Node.js |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Storage | Supabase Storage |
| Payments | Stripe |
| Deployment | Frontend: Vercel, Backend: Render/Railway |

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- Stripe account

### Environment Variables

#### Backend (`backend/.env`)

```
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Installation

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd frontend && npm install
```

### Development

```bash
# Start backend (terminal 1)
cd backend && npm run dev

# Start frontend (terminal 2)
cd frontend && npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the SQL migration in `scripts/migrate-to-supabase.sql` in your Supabase SQL Editor
3. Create a storage bucket named `uploads` with public access

### Stripe Webhook

For local development, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:5000/api/payment/webhook
```

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Backend (Render/Railway)

1. Deploy the `backend/` directory
2. Set environment variables
3. Configure Stripe webhook URL to your deployed backend

## Admin Setup

Admin access is automatically granted to these emails on first login:

- dybrahimovic28@gmail.com
- seantinashenyakutira@gmail.com
- chenaichapto@gmail.com

## Project Structure

```
zedideaarena/
├── backend/
│   ├── src/
│   │   ├── config/supabase.js
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── ideaController.js
│   │   │   ├── mediaController.js
│   │   │   ├── paymentController.js
│   │   │   ├── userController.js
│   │   │   └── voteController.js
│   │   ├── middleware/authMiddleware.js
│   │   ├── routes/
│   │   └── index.js
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── auth/login/page.tsx
│   │   ├── auth/signup/page.tsx
│   │   ├── dashboard/
│   │   └── page.tsx
│   ├── components/
│   ├── hooks/useAuth.ts
│   ├── lib/
│   │   ├── api.js
│   │   └── supabase.js
│   ├── services/
│   └── package.json
├── scripts/migrate-to-supabase.sql
└── vercel.json
```

## License

All rights reserved.
