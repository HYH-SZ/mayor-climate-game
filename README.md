# Mayor Climate Simulation Game

Mayor Climate Simulation Game is a browser-based MVP about urban microclimate, energy planning, and carbon reduction. The player acts as a mayor with a limited budget and places energy facilities on a 12x12 city grid.

## Online Access

https://mayor-climate-game.vercel.app

## Study Flow (Issue #11)

The live site now follows a research-ready sequence:

1. **Informed consent** — anonymous, voluntary participation explained on the first screen
2. **Pre-test** — four cognition items + two attitude items (stored with a unique `sessionId`)
3. **Gameplay** — one round on the 12×12 grid with live metrics
4. **Post-test** — same cognition/attitude items plus gameplay-specific questions
5. **Submit** — full session (pre + post + layout) saved to Supabase and downloadable as TXT

Pre-test rows are inserted when the participant starts the game; the same row is updated when the session is completed.

See `docs/issue-11-12-response.md` for how GitHub issues #11 and #12 were addressed.

## What It Does

The game asks a simple social science question: when students can see the climate cost of their choices, will they still choose the cheapest high-carbon option?

Players choose between coal power, wind power, and ground-source heat pumps. The page immediately updates three indicators: average temperature, average wind speed, and carbon emissions.

## How To Play

1. Open `index.html` locally or visit the Vercel link above.
2. Read and accept the consent screen.
3. Complete the **pre-test** questionnaire.
4. Choose a facility, click the map to place it, and watch indicators update.
5. Click **Finish**, complete the **post-test**, and download the TXT report (data also saves to Supabase when configured).

## Week 5 Backend and AI

This project now includes two Vercel serverless functions:

- `api/submit.js` - saves each game result into Supabase.
- `api/chat.js` - safely calls DeepSeek from the server and returns an AI summary.

The frontend never contains secret keys. Keys must be added in Vercel:

1. Open Vercel project `mayor-climate-game`.
2. Go to Settings > Environment Variables.
3. Add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DEEPSEEK_API_KEY`
4. Redeploy the project.

Create the Supabase table by running the SQL in:

`supabase/schema.sql`

After setup, user results are stored in Supabase table:

`public.game_results`

Columns include `session_id`, `study_phase` (`pre` or `complete`), `pre_survey`, `post_survey`, `layout`, and `metrics`.

If upgrading an existing Supabase project, run the migration comments at the bottom of `supabase/schema.sql`.

## Week 3 Deliverables

- `spec.md` - MVP specification
- `research/` - structured research archive
- `index.html` - playable single-file MVP

## Midterm Deliverables

- `midterm-draft.md` - English draft for the midterm defense
- `midterm.pptx` - generated PowerPoint deck
- `make-pptx.js` - script used to generate the deck

## Repository Structure

```text
mayor-climate-game/
├── index.html
├── spec.md
├── README.md
├── vercel.json
├── api/
│   ├── chat.js
│   └── submit.js
├── supabase/
│   └── schema.sql
├── css/
├── js/
└── research/
    ├── questions.md
    ├── sources.md
    ├── summary.md
    └── data/
        ├── README.md
        ├── key-quotes.md
        └── key-statistics.md
```