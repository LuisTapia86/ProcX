# ProcX — Anti-Procrastination App

ProcX is a portfolio prototype that explores how daily challenges, accountability, streaks, and points could help users reduce procrastination and build consistent habits.

> **Project status:** Work in progress — not a production service. ProcX was not commercially launched. Real-money subscriptions, prize distribution, KYC, and payout flows were not completed or validated for production.

## Live preview

[View the prototype interface](https://proc-x.vercel.app)

The deployed version is for demonstration purposes only. Do not enter real payment information, identity documents, or other sensitive personal data.

## Implemented in the prototype

- **Authentication:** Email/password flows using Supabase Auth
- **Challenge tracking:** Challenge catalog, enrollment, and daily check-ins
- **Points and streaks:** Points calculation with streak bonuses
- **Leaderboard:** Monthly ranking interface
- **Administration:** Interfaces for managing challenges and reward periods
- **Database security:** PostgreSQL schema with Supabase Row Level Security policies
- **Internationalization:** Spanish and English interface
- **Payments exploration:** Stripe Checkout, customer portal, and webhook code written for test mode

## Planned or incomplete

- Production-ready subscriptions and billing lifecycle
- Real-money reward pools and payouts
- End-to-end KYC verification
- Legal and regulatory validation
- Automated tests, monitoring, and production hardening

## Tech stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes and Server Actions
- **Database and authentication:** Supabase and PostgreSQL
- **Validation:** Zod
- **Payments prototype:** Stripe test mode
- **Deployment:** Vercel

## Local development

### Prerequisites

- Node.js 20 or newer
- npm
- A Supabase development project
- Optional Stripe test-mode account

### Installation

```bash
git clone https://github.com/LuisTapia86/ProcX.git
cd ProcX
npm install
```

Copy `.env.example` to `.env.local` and add development or test credentials only.

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Project structure

```text
src/
├── app/                 # Pages, API routes, authentication and administration
├── components/          # Shared interface components
├── lib/                 # Supabase, Stripe, security and internationalization
└── types/               # Database types

supabase/
└── migrations/          # Database schema and Row Level Security policies
```

## Security notes

The prototype includes Row Level Security policies, server-side administrator checks, Stripe webhook signature verification code, and configurable CAPTCHA and rate-limiting mechanisms.

These controls have not undergone an independent security audit. The application must not be used to process real payments, prizes, identity documents, or sensitive user information in its current state.

## License

Source available for portfolio review. All rights reserved.
