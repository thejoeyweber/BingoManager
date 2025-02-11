# Bingo Manager

This repository houses a **full-stack Bingo Manager** application. It allows you to:

- **Create** and manage Bingo games.
- **Add** items (labels, optional images, mandatory flags) to each game’s pool.
- **Generate** multiple Bingo cards, with free vs. pro plan constraints.
- **Host** a live caller screen for item calling.
- **Print** or export cards for participants.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Setup Instructions](#setup-instructions)
- [Local Supabase Setup](#local-supabase-setup)
- [Environment Variables](#environment-variables)
- [Development Scripts](#development-scripts)
- [Deployment](#deployment)
- [License](#license)

---

## Features

1. **Game Creation**  
   - Create Bingo games with a custom title and variant (e.g., 5×5).

2. **Item Pool Management**  
   - Upload or add text-based items, optionally marking some as *mandatory*.

3. **Card Generation**  
   - Randomly shuffle items into a grid, always including mandatory items.  
   - Enforce plan limits (free vs. pro) on total cards.

4. **Caller Screen**  
   - Host or “call” items one-by-one in real time.  
   - Retain a called-history state (e.g., via localStorage).

5. **Print / Export**  
   - Print entire sets of generated cards for physical events.

6. **Plan Constraints**  
   - **Free** membership has item/card limits (and optionally only 1 active game).  
   - **Pro** membership extends or removes these limits.

---

## Tech Stack

- **Frontend**:  
  - [Next.js (App Router)](https://nextjs.org/docs/app)  
  - [Tailwind CSS](https://tailwindcss.com/)  
  - [Shadcn UI](https://ui.shadcn.com/)  
  - [Framer Motion](https://www.framer.com/motion/) for animations

- **Backend**:  
  - [PostgreSQL via Supabase](https://supabase.com/)  
  - [Drizzle ORM](https://orm.drizzle.team/docs/get-started-postgresql)  
  - Next.js **Server Actions** for data mutations

- **Auth**: [Clerk](https://clerk.com/)  
- **Payments**: [Stripe](https://stripe.com/) (optional)  
- **Analytics**: [PostHog](https://posthog.com/) (optional)

---

## Requirements

1. **Node.js** (v16+ recommended)  
2. **Supabase CLI** (for local DB):  
   - [Install docs](https://supabase.com/docs/guides/cli)  
3. **Docker** (required by Supabase CLI to run local containers)  
4. **Clerk** account (for auth dev keys)  
5. **Stripe** account (if using payments)  
6. **PostHog** account (if using analytics)

---

## Setup Instructions

1. **Clone the Repository**  
   bash
   git clone https://github.com/YourOrg/BingoManager.git
   cd BingoManager

2. **Copy .env.example to .env.local**  
   bash
   cp .env.example .env.local

   - Fill out your Clerk keys, DB connection URL, Stripe secrets, etc.  
   - See [Environment Variables](#environment-variables) for details.

3. **Install Dependencies**  
   bash
   npm install

4. **Set Up Supabase Locally** (optional if you already have your own DB)
   - See [Local Supabase Setup](#local-supabase-setup).

5. **Apply Migrations**  
   - Via **Drizzle** (for example):
     bash
     npm run db:migrate

   - Or via **Supabase CLI** (see below).

6. **Run the Dev Server**  
   bash
   npm run dev

   - App is available at http://localhost:3000

---

## Local Supabase Setup

If you want to run a local Postgres instance via Supabase:

1. **Initialize** (if needed):  
   bash
   supabase init

2. **Start** containers:  
   bash
   supabase start

3. **Run or Reset** migrations:  
   - If using Supabase migrations:
     bash
     supabase db reset

   - If using Drizzle .sql files, ensure they’re placed or diffed into supabase/migrations/.

4. **Seed** your DB (optional):
   bash
   supabase db reset

   (Assuming you’ve got a seed.sql or other migration scripts for test data.)

By default, this will expose Postgres at localhost:54322 (and other Supabase services at 54321, 54323, etc.).  
Update your DATABASE_URL in .env.local to match.

---

## Environment Variables

All secrets and credentials go in .env.local. For example:

bash
# DB (Supabase)
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/signup"

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PORTAL_LINK="..."
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY="..."
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY="..."

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="..."

Important: Do not commit .env.local to source control. Keep credentials secure.

---

## Development Scripts

- **npm run dev**: Start the Next.js dev server.  
- **npm run build**: Production build.  
- **npm run start**: Start the production server.  
- **npm run lint**: ESLint checks.  
- **npm run db:migrate**: Apply Drizzle migrations.  
- **npm run format:write**: Prettier formatting of code.

---

## Deployment

You can deploy to [Vercel](https://vercel.com/) or another platform. Ensure you provide the same environment variables in your production environment.

If using a hosted Supabase project, link your local code to that project’s DB. Then push your migrations or schema changes accordingly:

bash
supabase link --project-ref your-project-id
supabase db push

---

## License

MIT License © 2024 Bingo Manager Authors

Feel free to open issues or pull requests for any improvements. Thank you for using Bingo Manager!
