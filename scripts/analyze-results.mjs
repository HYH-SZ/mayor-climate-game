import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
for (const line of env.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, "");
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const res = await fetch(
  `${url.replace(/\/$/, "")}/rest/v1/game_results?select=id,score,metrics,survey,layout,created_at&order=created_at.asc`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
);
const rows = await res.json();
if (!Array.isArray(rows)) {
  console.error(rows);
  process.exit(1);
}

function layoutFingerprint(row) {
  const layout = Array.isArray(row.layout) ? row.layout : [];
  return layout
    .map((c) => `${c.x},${c.y}:${c.facility || ""}`)
    .sort()
    .join("|");
}

function hasCoalOnOutlet(row) {
  const layout = Array.isArray(row.layout) ? row.layout : [];
  return layout.some(
    (c) =>
      c.facility === "coal" &&
      (c.terrain === "outlet" || c.terrainKey === "outlet")
  );
}

function surveyVentCorrect(row) {
  const s = row.survey || {};
  return s.windUnderstanding === "correct" || s.wind === "correct";
}

function surveyBudgetYes(row) {
  return (row.survey || {}).budgetChoice === "yes";
}

function carbonOf(row) {
  return row.metrics?.carbon ?? row.metrics?.totalCarbon ?? null;
}

const ventCorrect = rows.filter(surveyVentCorrect).length;
const budgetYes = rows.filter(surveyBudgetYes).length;
const coalOutletSessions = rows.filter(hasCoalOnOutlet).length;

const groups = new Map();
for (const row of rows) {
  const fp = layoutFingerprint(row);
  if (!groups.has(fp)) {
    groups.set(fp, { count: 0, score: row.score, carbon: carbonOf(row) });
  }
  groups.get(fp).count += 1;
}

const layoutStats = [...groups.values()]
  .sort((a, b) => b.count - a.count)
  .map((g) => ({ n: g.count, score: g.score, carbon: g.carbon }));

const summary = {
  total: rows.length,
  ventCorrect,
  budgetYes,
  coalOutletSessions,
  uniqueLayouts: groups.size,
  layoutStats,
  scores: rows.map((r) => ({ score: r.score, carbon: carbonOf(r) }))
};

console.log(JSON.stringify(summary, null, 2));
fs.writeFileSync("research/data/pilot-summary.json", JSON.stringify(summary, null, 2));
