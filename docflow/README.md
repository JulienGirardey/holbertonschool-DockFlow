# DocFlow

DocFlow is a full‑stack Next.js application to create, edit and generate technical documentation with AI assistance. It was built as a student project (Holberton School) and uses the Next.js App Router with server and API routes.

## Quick start

Install dependencies and run the dev server:

```bash
npm install
npm run dev
# or
pnpm install
pnpm dev
```

Open http://localhost:3000 in your browser.

## Requirements

- Node.js 18+
- PostgreSQL (or any DB supported by Prisma via DATABASE_URL)
- Environment variables:
  - DATABASE_URL
  - JWT_SECRET
  - GROQ_API_KEY (optional, for Groq AI)
  - OPENAI_API_KEY (optional if adding OpenAI)

## Project structure (important files)

- App entry & pages:
  - [app/page.tsx](app/page.tsx)
  - [app/layout.tsx](app/layout.tsx)
  - [app/dashboard/page.tsx](app/dashboard/page.tsx)
  - [app/loading.tsx](app/loading.tsx)

- Components:
  - [`CreateDocumentForm`](app/components/CreateDocumentForm.tsx) — [app/components/CreateDocumentForm.tsx](app/components/CreateDocumentForm.tsx)
  - [`EditDocumentForm`](app/components/EditDocumentForm.tsx) — [app/components/EditDocumentForm.tsx](app/components/EditDocumentForm.tsx)
  - [`MainContent`](app/components/MainContent.tsx) — [app/components/MainContent.tsx](app/components/MainContent.tsx)
  - [`ThemeToggle`](app/components/ThemeToggle.tsx) — [app/components/ThemeToggle.tsx](app/components/ThemeToggle.tsx)
  - [`Header`](app/components/Header.tsx) — [app/components/Header.tsx](app/components/Header.tsx)
  - Sidebar — [app/components/sidebar.tsx](app/components/sidebar.tsx)

- API routes:
  - Documents list / create: [app/api/documents/route.ts](app/api/documents/route.ts)
  - Document CRUD: [app/api/documents/[id]/route.ts](app/api/documents/[id]/route.ts)
  - AI generation: [app/api/documents/[id]/generate/route.ts](app/api/documents/[id]/generate/route.ts)
  - Auth: [app/api/auth/register/route.ts](app/api/auth/register/route.ts), [app/api/auth/login/route.ts](app/api/auth/login/route.ts), [app/api/auth/logout/route.ts](app/api/auth/logout/route.ts), [app/api/auth/me/route.ts](app/api/auth/me/route.ts), [app/api/auth/delete/route.ts](app/api/auth/delete/route.ts)
  - Settings: [app/api/settings/route.ts](app/api/settings/route.ts)
  - AI request details: [app/api/ai-requests/[id]/route.ts](app/api/ai-requests/[id]/route.ts)

- Backend helpers:
  - Auth helpers: [`getUserIdFromToken`, `verifyToken`, `generateToken`] in [lib/auth.ts](lib/auth.ts)
  - Prisma single instance helper: [lib/prisma.ts](lib/prisma.ts)
  - Generated Prisma client: [app/generated/prisma](app/generated/prisma)
  - DB seed script: [prisma/seed.ts](prisma/seed.ts)

- Styles:
  - Global CSS: [app/global.css](app/global.css)
  - Tailwind config: [tailwind.config.js](tailwind.config.js)
  - ESLint: [eslint.config.mjs](eslint.config.mjs)

## Database (Prisma)

1. Configure DATABASE_URL in .env.
2. Generate client / apply migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

3. Seed sample data:

```bash
node prisma/seed.ts
```

See the seed script: [prisma/seed.ts](prisma/seed.ts)

## Authentication & tokens

The project uses JWTs. Token helpers live in [lib/auth.ts](lib/auth.ts). API routes use cookie-based authentication (credentials: 'include') and helper `getUserIdFromToken` to extract user id from cookie or Authorization header.

## AI generation

AI generation logic and rate limits are implemented in:
- [app/api/documents/[id]/generate/route.ts](app/api/documents/[id]/generate/route.ts)

Groq SDK is used when GROQ_API_KEY is provided, with a fallback generator (see `generateFallback` in the same file).

## Common commands

- Dev: npm run dev
- Build: npm run build
- Start (production): npm run start
- Lint: npm run lint (if configured)

## Deployment

Deploy to Vercel or any Node platform. Ensure environment variables are set (DATABASE_URL, JWT_SECRET, GROQ_API_KEY/OPENAI_API_KEY if used). On Vercel, use the App Router build settings by default.

## Testing

The repository includes a recommended testing strategy:
- Unit tests for components and utilities
- Integration tests for API routes
- E2E tests for user flows (Playwright / Cypress)

Add test tooling and scripts as needed.

## Notes / Tips

- Avoid multiple Prisma instances in dev — see [lib/prisma.ts](lib/prisma.ts).
- Language configuration uses i18n at [lib/i18n.ts](lib/i18n.ts). Default language resources: [en/translation.json](en/translation.json) and [fr/translation.json](fr/translation.json).
- Dashboard UI and data fetching are implemented in [app/dashboard/page.tsx](app/dashboard/page.tsx) and [app/components/MainContent.tsx](app/components/MainContent.tsx).
- Use API endpoints under [app/api](app/api) for programmatic access.

## Where to start editing

- UI / marketing & landing: [app/page.tsx](app/page.tsx)
- User workspace / core app: [app/dashboard/page.tsx](app/dashboard/page.tsx)
- Document editor: [app/components/EditDocumentForm.tsx](app/components/EditDocumentForm.tsx) and [`CreateDocumentForm`](app/components/CreateDocumentForm.tsx)

## License

This project is available under the MIT License. See the included LICENSE file for the full text.

Copyright (c) 2025 Julien GIRARDEY

## Contribution

Maintainer: Julien GIRARDEY

Contributions are welcome. Suggested workflow:
- Fork the repository.
- Create a feature branch (git checkout -b feature/your-feature).
- Commit changes with clear messages.
- Open a pull request describing your changes.