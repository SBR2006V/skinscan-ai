# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Lens AI

Polished mobile app (Expo, `artifacts/lens-ai`) for AI image recognition with a small Express backend (`artifacts/api-server`).

### Architecture

- **Mobile**: Expo Router app with `(auth)` (welcome / login / signup) and `(tabs)` (Home, History, Updates, Profile) groups, plus modal `scan` and detail `result/[id]`.
- **State**: Local-first via `@react-native-async-storage/async-storage`. Three React contexts: `AuthContext` (account + session), `HistoryContext` (scan history), `NotificationsContext` (in-app updates). No backend DB.
- **Auth**: Lightweight client-side email + password (FNV-style hash), plus a "Continue with Google" button that provisions a guest demo account so the demo flow works without OAuth on the free tier.
- **AI backend**: `POST /api/ai/analyze` in `artifacts/api-server/src/routes/ai.ts` calls OpenAI vision (`gpt-5.4`, JSON-only response) through the Replit AI Integrations proxy and returns `{ title, category, confidence, summary, details, tags, suggestions, precautions }`.
- **API contract**: `lib/api-spec/openapi.yaml` defines `/ai/analyze`. Run `pnpm --filter @workspace/api-spec run codegen` after changes; generated `useAnalyzeImage` hook is exported from `@workspace/api-client-react`.
- **Networking**: `app/_layout.tsx` calls `setBaseUrl(\`https://${EXPO_PUBLIC_DOMAIN}\`)` once so all hooks hit the API server.
- **UI**: Inter font family, custom `Button` / `Input` / `Card` / `ConfidenceRing` / `Avatar` in `components/ui.tsx`, animated welcome + scan screens, BlurView tab bar on iOS, web-safe insets (`67px` top, `84px` bottom).
- **Theming**: `constants/colors.ts` defines `light` and `dark` palettes; `useColors` auto-switches with the system color scheme.

### Free-tier notes

- Real Google OAuth (Clerk / Replit Auth) is not wired — the "Continue with Google" button is a guest stub.
- Body limit on the API server is bumped to 20mb to fit base64-encoded photos.
