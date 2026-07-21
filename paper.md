# Mayor Climate Game — Paper Draft

> Student manuscript draft for Generation AI 2026. Results below use **N = 15** completed session records with verified exports (July 2026): 10 earlier sessions plus 5 pre/post TXT exports.

---

## Abstract

Urban learners must reason about coupled tradeoffs among energy cost, carbon emissions, and ventilation-sensitive siting, yet professional simulation tools remain inaccessible in many classrooms. This student paper reports *Mayor Climate Game*, a browser-based serious game deployed at `https://mayor-climate-game.vercel.app`, and an exploratory pilot with **15 completed session records** (July 2026). Participants allocated a fixed municipal budget across coal, wind, and ground-source heat pump facilities on a terrain-typed 12 × 12 grid while monitoring simplified climate indicators. The live site administers matched cognition and attitude items before and after gameplay (linked by `sessionId`), with informed consent on the first screen and automatic logging to Supabase. In the full pilot sample, all 15 sessions answered the ventilation item correctly and none placed coal on wind outlets; 11 of 15 reported budget-driven coal motivation. Final scores ranged from 51 to 88 (*M* ≈ 76.9) and total carbon from 0 to 1,440 t CO₂e (*M* ≈ 438 t). Five pre/post exports showed cognition stable at 3/4 before and after. Findings are interpreted cautiously as preliminary descriptive patterns rather than confirmatory evidence.

---

## Introduction

Cities confront rising heat, cooling-related energy demand, and pressure to reduce greenhouse-gas emissions. Urban heat is not only a weather problem—it is connected to energy use, public health, and planning decisions. When cities depend heavily on air conditioning, electricity demand and emissions can rise; the International Energy Agency notes that cooling demand is growing quickly and that building design, natural ventilation, and urban form also matter.

Urban ventilation corridors and wind outlets can help dissipate heat and pollution when land-use and energy siting respect airflow pathways. Research on ventilation planning in Beijing, Guiyang, and other cities shows that parks, green space, water systems, roads, and prevailing wind direction can all shape ventilation performance. Other studies use GIS, remote sensing, WRF, and CFD to identify heat islands and airflow barriers. These tools are powerful but difficult for non-expert learners to use in a short classroom session.

Serious games offer a complementary path. Energy and heat-planning games can help users learn tradeoffs by making choices and receiving immediate feedback. The gap addressed here is that many existing tools are either professional simulators or general education games—not lightweight browser prototypes that both teach a concept and automatically log player choices for research.

*Mayor Climate Game* was developed as a research prototype that combines rule-based microclimate feedback with automatic session recording. The present study adopts **intervention framing (Option B)**: the game is treated as a short learning intervention, and the primary research interest is whether matched pre-play and post-play cognition and attitude scores change after one round with live metrics. Behavioral logs (facility mix, carbon, score, ventilation-sensitive placement) provide secondary evidence of how choices relate to self-reported understanding.

**Research question.** How does *Mayor Climate Game* affect energy layout choices and post-play understanding of tradeoffs among cost, carbon emissions, and urban ventilation for undergraduate participants?

**Hypothesis.** After playing one round with live metrics and advisory cues, participants will place fewer high-carbon coal facilities in ventilation-sensitive cells and will show accurate understanding of the budget–carbon–ventilation tradeoff on post-play measures, relative to pre-play responses.

---

## Methods

### Artifact

We deployed *Mayor Climate Game* as a browser-based, single-page application hosted on Vercel at `https://mayor-climate-game.vercel.app`. The artifact required no installation; participants opened the public URL in a standard web browser.

Participants acted as a city mayor with a fixed budget of **CNY 10 million** (remaining budget displayed in the left panel). The city was represented as a **12 × 12** grid with five terrain types visible on the map: normal zones, residential areas, ventilation corridors, wind outlets, and low basins (color-coded in the interface). Participants selected one of three facility types from the left panel—**coal power** (80 万元, 120 t CO₂e), **wind power** (200 万元, 0 t CO₂e), or **ground-source heat pump** (160 万元, 15 t CO₂e)—and clicked grid cells to place facilities; clicking an occupied cell removed the facility and refunded its cost.

During gameplay, the interface displayed:

- **Remaining budget** (left panel)
- **Three real-time city-level indicators** (right panel): average temperature (°C), average wind speed (m/s), and total carbon emissions (t)
- A **mission cue** and optional **step-level impact card** after each placement
- Rule-based text tips when risky placements occurred (e.g., coal at a wind outlet)

When participants clicked **Finish** (结算), a **post-test modal** opened. Before download, the interface also showed the session score in the main panel. Participants could then download a human-readable **TXT report** and trigger server-side storage via `/api/submit`.

On TXT download or post-test submission, the client POSTed the session payload to a Vercel serverless endpoint (`/api/submit`), which inserted or updated a row in Supabase (`public.game_results`) when backend credentials were configured. Stored fields included `session_id`, `study_phase`, `budget_used`, `score`, `metrics`, `layout`, `pre_survey`, `post_survey`, `survey`, and `raw_result`. If Supabase submission failed, local download still proceeded.

**Material boundaries (simulation and “AI” components).** The deployed MVP used a **simplified, rule-based microclimate model** implemented in client-side JavaScript. It was **not** a CFD, WRF, GIS, or other professional urban-climate simulation. An optional post-play **DeepSeek** summary button, when enabled, called `/api/chat` after gameplay only and did not drive in-game mechanics.

The authors used an AI coding assistant to help implement the web artifact, convert manuscript drafts to APA LaTeX, and fix compilation errors. All research content, data interpretation, and references were produced and verified by the author.

### Design

The study uses a **single-session within-subject pre/post design** (implemented in the live site as of July 2026):

1. **Informed consent** on the first screen
2. **Pre-test**: four true/false cognition items and two five-point attitude items (matched instrument)
3. **One unrestricted gameplay round** with continuous metric feedback
4. **Post-test**: the same cognition and attitude items, plus gameplay-specific items (budget motivation, ventilation rule check, decision tendency, one open-ended reflection)

All items for one participant share a client-generated **`sessionId`** (UUID) so pre, gameplay, and post records can be linked in Supabase.

**Primary outcomes (pre/post change framing).**

| Outcome | Definition |
|---------|------------|
| Cognition score change | Post-test minus pre-test count of correct true/false items (0–4) |
| Attitude item change | Post-test minus pre-test rating on each five-point Likert item |

**Secondary / behavioral outcomes.**

| Variable | Source |
|----------|--------|
| `budgetUsed` | 1000 − remaining budget (万元) |
| `score` | Composite client-side score from carbon, temperature deviation, and wind |
| `metrics.carbon` | Total carbon emissions after last placement |
| `layout` | `{x, y, terrain, facility}` for each placement |
| Coal on `outlet` / `corridor` | Parsed from `layout` |
| Post-only gameplay items | e.g., `budgetChoice`, `windUnderstanding` |

**Pilot wave note.** Ten sessions were collected before the built-in pre-test screen; five additional TXT exports (July 21 afternoon) include matched pre/post cognition scores. All 15 session records are included in descriptive results below.

### Consent

Before any survey or gameplay, participants saw a **research consent screen** stating that:

- participation was **anonymous** (no name or student ID collected);
- participation was **voluntary** and could be stopped at any time by closing the page;
- data would be used **only for this course research project**;
- anonymous records would be saved to the researcher database (Supabase) and could also be downloaded locally as a TXT report.

Participants clicked **“我同意参与”** to continue to the pre-test or **“不同意，退出”** to leave. This replaced the earlier gameplay-only onboarding modal as the first research gate.

### Recruitment, Coding, and Analysis

**Recruitment.**

- **Population:** undergraduate volunteers associated with the Generation AI 2026 Research Project course context
- **Channel:** shared public Vercel link (`mayor-climate-game.vercel.app`) and in-class / class-group invitations
- **Target sample:** 15–20 completed sessions for the full pre/post wave; **current sample:** *N* = 15 session records (10 earlier + 5 pre/post TXT exports), July 2026
- **Inclusion:** adults who completed one gameplay round and post-play export or server log
- **Dates:** July 2026

**Coding.**

- **Cognition items:** each true/false item coded correct = 1, incorrect = 0; summed to `cognitionScore` (0–4) at pre and post
- **Attitude items:** five-point Likert responses stored as 1–5 at pre and post
- **Gameplay items:** `budgetChoice` (yes/no), `windUnderstanding` (correct/incorrect)
- **Behavioral logs:** facility counts and terrain flags extracted from `layout` JSON
- **Open-ended item:** stored verbatim; thematic coding planned when *N* is sufficient

**Statistical analysis.**

- **Software:** descriptive analysis in Python/Node scripts and manual verification from exported TXT reports; inferential tests planned in R or Python for the pre/post wave
- **Pilot wave (*N* = 10):** descriptive statistics only (proportions, ranges, means where appropriate); **no inferential tests** because of small *N* and because pre-test was absent for this wave
- **Pre/post wave (ongoing):** paired comparisons on cognition total and attitude items (e.g., Wilcoxon signed-rank or paired *t*-test depending on distribution); associations between self-reported budget motivation and observed coal use examined with Spearman correlation where appropriate
- **Interpretation:** all claims treated as **exploratory** given the simplified model and classroom sample

---

## Results

Fifteen completed session records were verified in July 2026 (ten earlier exports plus five pre/post TXT reports from the updated consent → pre → play → post flow).

### Survey and knowledge items

- **Ventilation understanding:** 15/15 answered the ventilation rule item correctly
- **Budget motivation (self-report):** 11/15 reported choosing coal to save budget; 4/15 reported they did not

### Behavioral placement

- **Coal on wind outlets:** 0/15 sessions placed coal on `outlet` cells
- **Score range:** 51–88 (*M* ≈ 76.9)
- **Total carbon range:** 0–1,440 t CO₂e (*M* ≈ 438 t)

### Layout patterns

Nine sessions fell in a **lower-carbon band** (0–120 t) with scores mostly 84–88. Six sessions fell in a **higher-carbon band** (240–1,440 t) with scores of 51–81.

### Pre/post cognition (subset *n* = 5)

All five pre/post exports scored **3/4** on cognition items both before and after gameplay (mean change = 0). This subset is too small for inferential pre/post tests but confirms the data pipeline works.

No inferential tests were conducted for the full sample.

---

## Discussion

Pilot data partially support the hypothesis that a short browser session can elicit accurate ventilation knowledge and avoid the most ventilation-sensitive coal placement, even when most participants report budget pressure (11/15). The spread in carbon outcomes (0 vs. 1,440 t) shows that cost-focused strategies can diverge sharply in emissions depending on facility mix.

These patterns should be read against clear limits. The microclimate model is heuristic, not predictive CFD. The sample is *N* = 15 session records—not 15 independently recruited participants; five pre/post exports share one `sessionId` (one tester, multiple playthroughs). Pre/post cognition showed no change (3/4 → 3/4) in the five-export subset. Inferential claims remain exploratory.

Future work should pre-register primary outcomes, complete paired pre/post analysis, and compare alternative advisory conditions. Connecting logged layouts to ventilation literature and serious-game learning mechanisms will clarify whether the artifact mainly assesses declarative understanding or also shifts siting behavior—a question the updated study flow is designed to address.

---

## References

Guan, Y., Chen, H., & Zhou, X. (2015). Study of urban ventilation corridor planning method based on a case study of Guiyang, China.

International Energy Agency. (2023). *Staying cool without overheating the energy system*.

International Energy Agency. (2023). *Sustainable, affordable cooling can save tens of thousands of lives each year*.

Zheng, Y., et al. (2022). Urban ventilation planning and its associated benefits based on numerical experiments: A case study in Beijing, China.

Serious game for neighbourhood energy choices. (2019). [Full bibliographic details in `references.bib`.]

---

## Acknowledgements

Thank you to Lawted Wu for course structure, GitHub issue feedback, and research design guidance. Thank you to classmates and volunteers who tested the game and contributed session data.
