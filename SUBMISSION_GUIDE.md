# Quran Hackathon Submission Guide

Use this guide to submit your project professionally and consistently.

## 1. Submission Checklist

- Live application URL (required)
- Public source code repository URL
- Short demo video link (3-5 minutes)
- Problem statement and solution summary
- Architecture and API usage summary
- What is innovative about the project
- Roadmap and next steps

## 2. Hosting Plan (Fast + Reliable)

Recommended setup:

- Frontend: Vercel (artifacts/quran-companion)
- API: Render or Railway (artifacts/api-server)
- Routing: Rewrite frontend /api to backend URL

### Option A: One domain behavior via rewrite

Keep frontend requests as /api and add a rewrite rule on the frontend host so:

- /api/* -> https://YOUR_API_DOMAIN/api/*

This avoids code changes and keeps behavior identical to local development.

### Option B: Same domain reverse proxy

If hosting with Nginx/Caddy, serve frontend static files and proxy /api to the API process.

## 3. Production Readiness Checks

Before submitting:

- /api/healthz returns {"status":"ok"}
- Dashboard loads without errors
- Quran browsing works
- Bookmarks, notes, collections, and goals flows are functional
- Mobile layout is readable and usable
- No console errors on initial page load

## 4. Demo Video Script (3-5 Minutes)

Suggested flow:

1. 0:00-0:30: Intro
- Who this product is for
- Problem: inconsistent Quran engagement

2. 0:30-2:30: Product walkthrough
- Home dashboard and daily habit challenge
- Quran browser and surah reading
- Audio recitation support
- Bookmarks, notes, and collections
- Streak/progress updates

3. 2:30-3:30: Technical proof
- Show API health endpoint
- Show monorepo architecture briefly
- Mention key APIs integrated

4. 3:30-4:30: Why this matters
- Habit formation
- Reflection and memorization support
- Accessibility for modern users

5. 4:30-5:00: Closing
- Roadmap and impact vision

Recording tips:

- Use 1080p if possible
- Keep one browser window and zoom text for clarity
- Avoid background noise; use crisp voice-over
- Add timestamps in the video description

## 5. Application Answer Templates

Edit these before submitting.

### A. Project Summary

Quran Companion is a modern Quran engagement platform designed to help users stay consistent with daily Quran interaction. It combines a clean reading experience with daily micro-habits, memorization support, and personal knowledge tools such as bookmarks, notes, and collections.

### B. Problem and Motivation

Many users reconnect with the Quran in specific seasons but struggle with long-term consistency. Existing experiences are often fragmented between reading, memorization, and reflection workflows. Quran Companion unifies these workflows in one product.

### C. What We Built

- Daily challenge and streak system
- Quran browsing and surah reading interface
- Audio-assisted interaction
- Bookmarks, notes, and thematic collections
- Dashboard analytics for personal progress

### D. API and Technical Integrations

The project uses Quran content endpoints and user-centric endpoints through a typed API layer, with an Express backend and React frontend in a pnpm monorepo. The architecture includes shared schema validation and generated API clients for type-safe integration.

### E. Innovation

The product focuses on behavior design for sustained engagement:

- Daily micro-habit loop
- Frictionless progress tracking
- Memorization-oriented interactions
- Reflection workflows through curated collections

### F. Impact

The app helps users build a practical and repeatable Quran routine that can fit modern schedules while preserving spiritual depth.

### G. Roadmap

- Family and group circles for accountability
- Personalized study plans by user goals
- Better tajwid feedback and recitation scoring
- Offline-first mode and downloadable recitation packs

## 6. Professional Submission Package

Include these links in your final form:

- Live URL: <your deployed frontend URL>
- API URL: <your deployed backend URL>
- GitHub Repo: <your repository URL>
- Demo Video: <YouTube unlisted or Loom URL>

Keep the README in sync with the final deployed version and submission answers.
