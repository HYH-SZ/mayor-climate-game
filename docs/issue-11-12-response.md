# Issue #11 / #12 completion notes

Updated **July 21, 2026 (afternoon)** with **N = 15** session records.

## Data sources

| Batch | Count | Notes |
|-------|-------|-------|
| Earlier pilot | 10 | 7 TXT + 3 pilot logs (no embedded pre-test) |
| Pre/post exports | 5 | TXT from Downloads; same `sessionId` (eeca3f95) — one tester, multiple playthroughs |
| **Total** | **15** | Descriptive analysis in `research/data/pilot-summary.json` |

## Issue #11 — 收数据前的几件事

| Requirement | Status |
|-------------|--------|
| Pre/post design | Done — live on Vercel |
| Informed consent | Done |
| Supabase collection | Done — verify env vars |
| Research purpose (Option B) | Done — `paper.md` |
| **Sample target 15–20** | **15 session records collected** |

## Issue #12 — 论文冲刺

| Requirement | Status |
|-------------|--------|
| Website collects pre/post | Done + 5 TXT exports analyzed |
| paper.md complete | Updated to N=15 |
| PPT / poster / slides | Regenerated from `pilot-summary.json` |

## Honest reporting note

The five new TXT files share one `sessionId`. They count as **five session records** (one duplicate 51/1440 export included). They do **not** represent five independent participants. State this clearly in the paper Discussion (already noted).

## Manual steps

1. Regenerate PPT: `node build-presentation-pptx.js`
2. Push to GitHub / Vercel
3. Sync `paper.md` → `main.tex` for PDF submission
4. Optional: recruit additional **independent** participants if the course requires distinct users
