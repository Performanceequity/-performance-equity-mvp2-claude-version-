# Performance Equity MVP v2.0

**IMPORTANT: Read `SESSION_LOG.md` in this directory for recent changes and full context.**

## Quick Context

This is a React/TypeScript mobile-first demo app for Performance Equity - a "FICO score for fitness" verification system.

## Key Concepts

- **PES (Performance Equity Score):** 0-999 rating like FICO - NOT redeemable, determines your tier
- **PE (Performance Equity):** Actual credits earned from sessions - IS redeemable currency
- **GAVL:** Guardian Access Verification Layer - 5-layer anti-fraud verification
- **SCS:** Session Confidence Score - determines if session is AUTO, CONFIRM, or QUARANTINE

## Run Dev Server

```bash
npm run dev -- --host
```

## Deployment

- Vercel auto-deploys from GitHub on push
- Production: https://performance-equity-mvp2-claude-vers.vercel.app/

## Key Directories

- `src/screens/` - All page components
- `src/components/` - Reusable UI components
- `src/types/` - TypeScript definitions
- `src/services/mockData.ts` - All demo data
- `src/constants/` - Colors, config

## Last Session: January 30, 2026

Fixed: GAVL dot color, Overview layout (REDEEM button, section reorder), calendar color vibrancy.

See `SESSION_LOG.md` for full details.

---

## Global Memory

For cross-project context (people, preferences, full glossary), see: `~/claude-memory/CLAUDE.md`
