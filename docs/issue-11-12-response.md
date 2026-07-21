# Issue #11 / #12 completion notes

This document tracks how the repository addresses the two teacher issues.

## Issue #11 — 收数据前的几件事

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Pre/post design | Done | Consent → pre-test → game → post-test; same `sessionId` |
| Informed consent first screen | Done | `#consent-modal` in `index.html` |
| Supabase data collection | Done | `/api/submit` stores `session_id`, `pre_survey`, `post_survey`; pre row inserted at pre-test, updated at completion |
| Research purpose (Option B) | Done | Documented in `paper.md` — intervention framing with pre/post change as primary outcome |
| Model boundary | Done | Stated in consent copy, `paper.md`, and in-game heuristic disclaimer |

## Issue #12 — 论文冲刺

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Website collects pre/post to Supabase | Done | See flow above; verify with one full test session after Vercel env vars are set |
| Move Intro + References into `paper.md` | Done | From `midterm-draft.md` |
| Real Results + Discussion | Done | N=10 verified sessions in `paper.md` (no fabricated data) |
| Methods TODOs (Consent, Recruitment, Analysis) | Done | Filled in `paper.md` |
| Abstract | Done | Added last in `paper.md` |

## Manual steps for the student

1. Run the SQL migration block at the bottom of `supabase/schema.sql` if the table already exists.
2. Confirm Vercel env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Play through once on https://mayor-climate-game.vercel.app and verify two rows or one updated row in Supabase.
4. Recruit 15–20 new participants using the **new** pre/post flow for paired analysis.
5. Sync `main.tex` from `paper.md` if submitting via Overleaf.
