# FuelUp

FuelUp is a local-first gym meal platform prototype for calorie-aware meal planning, pricing, and delivery.

## What it includes

- Daily calorie and macro target calculator
- Personalized meal pricing logic
- Mock auth flow with email + phone OTP style sign-up
- Local-first storage layer designed for a future Supabase migration
- Mobile-first UI prototype for ordering and target tracking

## Stack

- Next.js 16 + App Router
- TypeScript
- Tailwind CSS
- Local mock API layer

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Verification

```bash
npx vitest run src/lib/fuelup-logic.test.ts
npm run build
npm run lint
```

This project keeps a local-first architecture first, with a mock backend layer that can later be swapped to Supabase.
