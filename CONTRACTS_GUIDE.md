# Contracts Integration Guide

This guide summarizes how to wire the front-end, back-end, and Anchor program together.

## 1) Build & Deploy (Anchor)
1. From `contracts/solana`:
   - `anchor build`
   - `anchor deploy` (devnet)
2. Capture the deployed program ID and update:
   - `/Users/xuyanjun/Documents/New project/sx.com/services/api/.env` → `SOLANA_PROGRAM_ID`
   - `/Users/xuyanjun/Documents/New project/sx.com/apps/web/.env.local` → `NEXT_PUBLIC_SOLANA_PROGRAM_ID`
3. Ensure IDL exists at:
   - `contracts/solana/target/idl/solana.json`

## 2) Backend (Indexer)
1. Configure `.env`:
   - `SOLANA_RPC_URL` (Helius devnet)
   - `SOLANA_PROGRAM_ID`
   - `INDEXER_API_KEY`
2. Start backend:
   - `cd services/api && npm run dev`
3. Optional: enable indexer worker
   - `ENABLE_INDEXER_WORKER=true`

## 3) Frontend
1. Configure `.env.local`:
   - `NEXT_PUBLIC_SOLANA_RPC_URL`
   - `NEXT_PUBLIC_SOLANA_PROGRAM_ID`
   - `NEXT_PUBLIC_API_BASE_URL`
   - `INDEXER_API_KEY` (for `/api/index/replay`)
2. Start frontend:
   - `cd apps/web && npm run dev`

## 4) Smoke Check
- Open `/status` page for health + indexer state
- Create profile on `/profile`, then check `/status` for indexer updates
- Create post on `/compose`, then check feed on `/`

## Notes
- Indexer parses events emitted by the program. Make sure you keep the IDL updated after any program changes.
- `INDEXER_API_KEY` is used by the front-end server route to securely call `/api/index/replay`.
