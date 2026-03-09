# Indian Cloud Kitchen (ICK) - Stockholm

An aggregator platform for Indian Cloud Kitchens in Stockholm. Built with Next.js, PostgreSQL, Prisma, and Stripe.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account (for payments)

### Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and fill in your values:

```bash
cp .env.example .env
```

3. Set up the database:

```bash
npx prisma migrate dev --name init
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **PostgreSQL** with Prisma ORM
- **NextAuth.js** for authentication
- **Stripe** for payments
- **Tailwind CSS** for styling

## Features

- Browse Indian Cloud Kitchens in Stockholm
- View food menus by category
- Shopping cart and Stripe checkout
- Customer ratings and reviews
- Kitchen owner dashboard for menu management
- Admin panel for kitchen approval
