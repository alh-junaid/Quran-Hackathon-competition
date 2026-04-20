# Quran Companion

A modern Quran engagement application focused on consistency, reflection, and memorization support.

This repository contains the complete monorepo for the Quran Hackathon submission, including the React client, Express API server, shared API types, and database schema.

## Project Goal

Quran Companion helps users build a sustainable relationship with the Quran through:

- Daily micro-habits
- Structured reading flows
- Bookmarks, notes, and collections
- Memorization support and recitation-oriented interactions
- Progress visibility through streaks and dashboard metrics

## Core Features

- Daily challenge flow with streak updates
- Smart daily plan with selectable time and focus modes
- Weekly progress summary from recent reading sessions
- Contextual reflection prompt for daily Quran engagement
- Quran browsing and surah reading experience
- Verse bookmarks and personal notes
- Thematic collections for study and tadabbur
- Dashboard summary for engagement metrics
- Audio playback support for recitation

## Architecture

This is a pnpm workspace monorepo with:

- Frontend app: artifacts/quran-companion (React + Vite + Tailwind)
- API server: artifacts/api-server (Express + TypeScript)
- Shared API client: lib/api-client-react
- Shared API schema/types: lib/api-spec and lib/api-zod
- Database layer: lib/db (Drizzle)

API routes are exposed under /api, including health checks, Quran content, bookmarks, notes, goals, collections, and dashboard endpoints.

## Tech Stack

- TypeScript
- React + Vite
- Tailwind CSS
- TanStack Query
- Express 5
- Drizzle ORM
- Zod
- pnpm workspaces

## Local Development

Prerequisites:

- Node.js 24+
- pnpm

Install dependencies:

```bash
pnpm install
```

Run client + API together:

```bash
pnpm run dev
```

Default local ports:

- Frontend: 5173
- API: 4000

Health check:

```text
GET http://localhost:4000/api/healthz
```

## Build and Typecheck

Typecheck all packages:

```bash
pnpm run typecheck
```

Production build:

```bash
pnpm run build
```

## Deployment Notes

The frontend expects API routes under /api. In production, deploy with one of these patterns:

- Same-domain setup with reverse proxy (recommended): route /api to the API server
- Separate frontend/backend domains with an edge rewrite from frontend /api to backend

Ensure CORS and HTTPS are enabled for production traffic.

## Submission Resources

For a complete submission checklist (hosting, demo video, and form-answer template), see SUBMISSION_GUIDE.md.

## License

MIT
