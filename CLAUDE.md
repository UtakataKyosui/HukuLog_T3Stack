# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `npm run dev` - Start Next.js development server with Turbo
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run preview` - Build and start for preview

**Code Quality:**
- `npm run check` - Run Biome linter and formatter checks
- `npm run check:write` - Run Biome checks and auto-fix
- `npm run check:unsafe` - Run Biome checks with unsafe fixes
- `npm run typecheck` - Run TypeScript type checking

**Database:**
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes directly to database
- `npm run db:studio` - Open Drizzle Studio for database management

**Testing:**
- `npm run test` - Run Playwright end-to-end tests
- `npm run test:ui` - Run Playwright tests with interactive UI
- `npm run test:headed` - Run Playwright tests in headed mode (visible browser)

## Architecture

This is a T3 Stack application using:
- **Next.js 15** with App Router and React 19
- **tRPC** for type-safe API layer with React Query integration
- **Drizzle ORM** with PostgreSQL database
- **NextAuth.js** for authentication (configured with Discord provider)
- **Biome** for linting and formatting
- **Tailwind CSS v4** for styling
- **Playwright** for end-to-end testing

**Key Architecture Patterns:**

**Database Layer (`src/server/db/`):**
- Uses multi-project schema with `workspace_` table prefix
- Database connection in `index.ts`, schema definitions in `schema.ts`
- Drizzle config points to PostgreSQL with environment-based URL

**API Layer (`src/server/api/`):**
- tRPC router structure with `root.ts` as main router
- Individual routers in `routers/` directory (currently `post.ts`)
- Type-safe procedures with Zod validation

**Authentication (`src/server/auth/`):**
- NextAuth.js with Drizzle adapter
- Session extension to include user ID
- Discord OAuth provider configured

**Client-Side tRPC (`src/trpc/`):**
- React Query integration with custom hooks
- Server-side caller for SSR scenarios
- Query client configuration

**Environment Configuration:**
- Uses `@t3-oss/env-nextjs` for type-safe environment variables
- Configuration in `src/env.js`

**Testing (`tests/`):**
- Uses Playwright for end-to-end testing
- Test files follow `*.spec.ts` naming convention
- Tests include filter functionality, pagination, and user interactions
- Components use `data-testid` attributes for reliable test selectors

**Path Aliases:**
- `@/*` maps to `src/*` for cleaner imports

The codebase follows T3 Stack conventions with strict TypeScript settings and integrated tooling for development workflow.