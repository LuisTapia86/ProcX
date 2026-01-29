# ProcX - Anti-Procrastination App

ProcX is a web application that helps users beat procrastination through daily challenges and skill-based rewards.

## Features

- **User Authentication**: Email/password authentication via Supabase
- **Daily Challenges**: Users can join up to 3 challenges and do daily check-ins
- **Points System**: Earn points for check-ins with streak bonuses
- **Monthly Leaderboard**: Top 100 users displayed
- **Reward Pool**: 80% of subscriptions go to monthly prizes
- **Skill-Based Rewards**: Winners selected by points ranking, not luck
- **Admin Panel**: Manage challenges, periods, and payouts
- **Bilingual**: Spanish and English support

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL with RLS)
- **Payments**: Stripe (MXN currency)
- **Validation**: Zod

---

## Setup Instructions

### Prerequisites

- Node.js 20+ installed
- npm or yarn
- Supabase account (free tier works)
- Stripe account (test mode works)

### Step 1: Install Dependencies

```bash
cd C:\Users\PC\Desktop\proyectos_python\ProcX
npm install
```

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready
3. Go to **Settings > API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Run Database Migrations

1. Go to Supabase **SQL Editor**
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run**
4. Copy and paste the contents of `supabase/migrations/002_rls_policies.sql`
5. Click **Run**

### Step 4: Create Storage Bucket (for KYC documents)

1. Go to Supabase **Storage**
2. Create a new bucket called `kyc-documents`
3. Set it to **Private**
4. Add these policies in the bucket settings:
   - Allow users to upload to their own folder
   - Allow admins to view all files

### Step 5: Setup Stripe

1. Go to [stripe.com](https://stripe.com) and create an account
2. Go to **Developers > API keys** and copy:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

3. Create a Product:
   - Go to **Products > Add Product**
   - Name: "ProcX Monthly Subscription"
   - Price: 99 MXN, recurring monthly
   - Copy the Price ID → `STRIPE_PRICE_ID`

4. Setup Webhook:
   - Go to **Developers > Webhooks**
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
   - Copy Webhook Secret → `STRIPE_WEBHOOK_SECRET`

### Step 6: Create Environment File

Create a `.env.local` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Then edit `.env.local` with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID=price_xxx

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 7: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Creating the First Admin User

1. Go to `http://localhost:3000/auth/signup` and create a new account
2. Verify your email (check Supabase **Authentication > Users**)
3. Go to Supabase **SQL Editor** and run:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

4. Refresh the app - you should now see an "Admin" link in Settings

---

## Project Structure

```
ProcX/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/           # Admin API routes
│   │   │   ├── auth/callback/   # Auth callback
│   │   │   ├── checkin/         # Check-in API
│   │   │   ├── stripe/          # Stripe checkout/portal
│   │   │   └── webhooks/stripe/ # Stripe webhooks
│   │   ├── admin/               # Admin pages
│   │   ├── app/                 # Main app pages
│   │   ├── auth/                # Login/signup
│   │   ├── privacy/             # Privacy policy
│   │   ├── terms/               # Terms of service
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx             # Landing page
│   ├── components/
│   │   └── AppLayout.tsx        # App navigation
│   ├── lib/
│   │   ├── i18n/                # Translations
│   │   ├── supabase/            # Supabase clients
│   │   └── stripe.ts            # Stripe config
│   ├── types/
│   │   └── database.ts          # TypeScript types
│   └── middleware.ts            # Auth middleware
├── supabase/
│   └── migrations/              # SQL migrations
├── public/
├── .env.example
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## Points System

| Difficulty | Points per Check-in |
|------------|---------------------|
| Very Easy  | 5                   |
| Easy       | 8                   |
| Medium     | 12                  |
| Hard       | 18                  |
| Very Hard  | 25                  |
| Extreme    | 35                  |

### Streak Bonuses (one-time per challenge)

| Day | Bonus Points |
|-----|--------------|
| 3   | +10          |
| 5   | +20          |
| 10  | +50          |
| 15  | +80          |
| 21  | +120         |
| 30  | +200         |

---

## Prize Distribution

| Pool Size       | Winners | Distribution                           |
|-----------------|---------|----------------------------------------|
| < $5,000 MXN    | 3       | 50% / 30% / 20%                        |
| $5,000-$19,999  | 5       | 35% / 25% / 18% / 12% / 10%            |
| $20,000+        | 10      | 25% / 18% / 14% / 11% / 9% / 7% / 6% / 5% / 3% / 2% |

---

## Monthly Workflow (Admin)

1. **Start of month**: Create a new period in Admin > Periods
2. **During month**: Users subscribe, complete challenges, earn points
3. **End of month**: Close the period to generate winners automatically
4. **After closing**: Contact winners for KYC verification
5. **Manual payout**: Transfer prizes via bank transfer within 5 days

---

## Security Features

- Row Level Security (RLS) on all database tables
- Server-side admin verification
- Stripe webhook signature verification
- Idempotent webhook processing
- Rate limiting on check-in endpoints
- Private KYC document storage

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to update:
- `NEXT_PUBLIC_APP_URL` to your production domain
- Use production Stripe keys (not test keys)
- Update Stripe webhook endpoint

---

## Support

For questions or issues, check the codebase documentation or contact the development team.

---

## License

Private - All rights reserved.
