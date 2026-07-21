const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const DATA = JSON.parse(
  fs.readFileSync(path.join(__dirname, "research/data/pilot-summary.json"), "utf8")
);

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Hu Yunhan";
pptx.subject = "Mayor Climate Game Defense";
pptx.title = "Mayor Climate Game";
pptx.company = "Generation AI 2026";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Times New Roman",
  bodyFontFace: "Times New Roman",
  lang: "en-US",
};

const navy = "173B5F";
const blue = "2D6A9F";
const gray = "5A6673";
const footerGray = "6B7280";

function addFooter(slide, n) {
  slide.addText(String(n), {
    x: 12.55,
    y: 7.05,
    w: 0.35,
    h: 0.2,
    fontFace: "Times New Roman",
    fontSize: 12,
    color: "7A8794",
    margin: 0,
  });
}

function addTakeaway(slide, text) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.55,
    y: 6.72,
    w: 12.2,
    h: 0.42,
    fill: { color: "EEF4FA" },
    line: { color: blue, width: 0.6 },
  });
  slide.addText(`Takeaway: ${text}`, {
    x: 0.7,
    y: 6.78,
    w: 11.9,
    h: 0.32,
    fontFace: "Times New Roman",
    fontSize: 10,
    color: footerGray,
    margin: 0,
    fit: "shrink",
  });
}

function addNotes(slide, lines) {
  slide.addNotes(Array.isArray(lines) ? lines.join("\n") : lines);
}

function addTitle(slide, title) {
  slide.addText(title, {
    x: 0.55,
    y: 0.35,
    w: 12.2,
    h: 0.52,
    fontFace: "Times New Roman",
    fontSize: 28,
    bold: true,
    color: navy,
    margin: 0,
    breakLine: false,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.55,
    y: 1.0,
    w: 12.2,
    h: 0,
    line: { color: blue, width: 1.5 },
  });
}

function addBullets(slide, items, opts = {}) {
  const runs = [];
  items.forEach((item, idx) => {
    runs.push({
      text: item,
      options: {
        bullet: opts.numbered ? { type: "number" } : { indent: 14 },
        breakLine: idx !== items.length - 1,
      },
    });
  });

  slide.addText(runs, {
    x: opts.x ?? 0.75,
    y: opts.y ?? 1.25,
    w: opts.w ?? 11.85,
    h: opts.h ?? 5.2,
    fontFace: "Times New Roman",
    fontSize: opts.fontSize ?? 14,
    color: opts.color ?? "111827",
    fit: "resize",
    valign: "top",
    margin: 0.06,
    breakLine: true,
    paraSpaceAfterPt: 8,
    lineSpacingMultiple: 1.15,
  });
}

function addParagraphs(slide, items, opts = {}) {
  slide.addText(items.join("\n\n"), {
    x: opts.x ?? 0.75,
    y: opts.y ?? 1.25,
    w: opts.w ?? 11.85,
    h: opts.h ?? 5.2,
    fontFace: "Times New Roman",
    fontSize: opts.fontSize ?? 14,
    color: opts.color ?? "111827",
    fit: "resize",
    valign: "top",
    margin: 0.06,
    breakLine: true,
    paraSpaceAfterPt: 8,
    lineSpacingMultiple: 1.15,
  });
}

function addStandardSlide(title, items, n, opts = {}) {
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  addTitle(slide, title);
  if (opts.paragraphs) addParagraphs(slide, items, opts);
  else addBullets(slide, items, opts);
  if (opts.takeaway) addTakeaway(slide, opts.takeaway);
  addFooter(slide, n);
  if (opts.notes) addNotes(slide, opts.notes);
  return slide;
}

{
  const slide = pptx.addSlide();
  slide.background = { color: "F4F8FB" };
  slide.addText("Mayor Climate Game", {
    x: 1.1,
    y: 2.05,
    w: 11.1,
    h: 0.7,
    fontFace: "Times New Roman",
    fontSize: 34,
    bold: true,
    align: "center",
    color: navy,
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 3.1,
    y: 3.0,
    w: 7.1,
    h: 0,
    line: { color: blue, width: 2 },
  });
  slide.addText("Hu Yunhan\nResearch Advisor: Lawted Wu", {
    x: 2.2,
    y: 3.35,
    w: 8.9,
    h: 0.9,
    fontFace: "Times New Roman",
    fontSize: 18,
    align: "center",
    color: gray,
    margin: 0,
    lineSpacingMultiple: 1.15,
  });
  addTakeaway(
    slide,
    "A browser serious game for teaching urban energy, carbon, and ventilation tradeoffs (N=15 pilot sessions, July 2026)."
  );
  addFooter(slide, 1);
  addNotes(slide, [
    "Good morning. I am Hu Yunhan.",
    "Today I present Mayor Climate Game—a browser prototype studied with 15 completed session records in July 2026.",
  ]);
}

addStandardSlide(
  "Research Question & Hypothesis",
  [
    "Research Question: How does Mayor Climate Game affect energy layout choices and post-play understanding of budget–carbon–ventilation tradeoffs?",
    "Hypothesis: After one round with live metrics, participants will avoid coal on ventilation-sensitive cells and show accurate understanding of the tradeoff on post-play measures.",
  ],
  2,
  {
    paragraphs: true,
    x: 0.8,
    y: 1.55,
    w: 11.7,
    h: 4.4,
    fontSize: 16,
    takeaway:
      "We ask whether one play session helps learners understand cost, carbon, and ventilation—and whether they avoid blocking airflow with coal.",
    notes: [
      "State the research question clearly.",
      "Hypothesis focuses on both declarative knowledge and safer siting behavior.",
    ],
  }
);

addStandardSlide(
  "Background",
  [
    "Cities face hotter summers, higher cooling demand, and pressure to reduce carbon emissions.",
    "Urban heat connects to energy use, public health, and planning—not weather alone.",
    "When cities rely only on air conditioning, electricity demand and emissions can rise.",
    "My project asks: with limited money, will players still choose cleaner energy when the page shows the climate cost of each choice?",
  ],
  3,
  {
    takeaway:
      "Cities must balance cheap energy, low carbon, and good airflow—this game makes those tradeoffs visible without expert simulation tools.",
    notes: ["Keep background short; link to IEA cooling demand context if asked."],
  }
);

addStandardSlide(
  "Literature Review",
  [
    "Urban ventilation corridors help move heat and pollution when siting respects airflow (Beijing, Guiyang cases).",
    "GIS, WRF, and CFD tools are powerful but hard for non-experts to use in a short class session.",
    "IEA: cooling is not only about air conditioners—design and ventilation matter.",
    "Serious games let learners explore tradeoffs through choices; my gap is a lightweight browser tool that also logs research data.",
  ],
  4,
  {
    fontSize: 13,
    takeaway:
      "Few classroom-ready browser tools combine playable simulation, live metrics, and automatic session logging.",
    notes: ["Cite Zheng et al. 2022, Guan et al. 2015, IEA 2023, neighbourhood game 2019."],
  }
);

addStandardSlide(
  "Research Design / Method",
  [
    "Artifact: Vercel-hosted 12×12 grid; CNY 10M budget; coal, wind, and ground-source heat pumps; live temp / wind / carbon.",
    `Sample: N = ${DATA.total} session records (10 earlier + 5 pre/post TXT exports), July 2026.`,
    "Flow: informed consent → pre-test (4 cognition + 2 attitude items) → one gameplay round → post-test → Supabase + TXT export.",
    "Measures: pre/post cognition score, budget motivation, ventilation rule item, composite score, carbon, layout JSON.",
    "Analysis: descriptive coding only; rule-based microclimate model—not CFD.",
  ],
  5,
  {
    fontSize: 13,
    takeaway:
      "Consent and matched pre/post items are now built into the live site; each session is linked by sessionId.",
    notes: [
      "Emphasize material boundaries: heuristic model, not professional simulation.",
      "Five pre/post exports share one sessionId (one tester, multiple playthroughs)—state honestly if asked.",
    ],
  }
);

addStandardSlide(
  "Results",
  [
    `${DATA.ventCorrect}/${DATA.total} answered the ventilation item correctly; ${DATA.budgetYes}/${DATA.total} reported choosing coal to save budget.`,
    `${DATA.coalOutletSessions}/${DATA.total} placed coal on wind outlets.`,
    `Score range ${DATA.scoreRange[0]}–${DATA.scoreRange[1]} (mean ≈ ${DATA.meanScore}); carbon ${DATA.carbonRange[0]}–${DATA.carbonRange[1]} t (mean ≈ ${Math.round(DATA.meanCarbon)}).`,
    DATA.patterns[3],
    `Pre/post subset (n=${DATA.prePostSessions}): cognition ${DATA.prePostCognition.preMean}/4 → ${DATA.prePostCognition.postMean}/4 (no change in this subset).`,
    "No inferential tests—exploratory pilot only.",
  ],
  6,
  {
    fontSize: 13,
    takeaway: `${DATA.ventCorrect}/${DATA.total} knew ventilation rules; 0 blocked outlets. Carbon 0–1440 t—clean layouts scored higher.`,
    notes: [
      `${DATA.ventCorrect}/${DATA.total} ventilation correct.`,
      `${DATA.budgetYes}/${DATA.total} budget motivation yes.`,
      "Point to spread between 0 t and 1440 t carbon outcomes.",
    ],
  }
);

{
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  addTitle(slide, "Discussion, Demo & Limitations");
  addBullets(
    slide,
    [
      "Findings partially support the hypothesis: strong ventilation knowledge; no coal on outlets.",
      `Budget pressure remains salient (${DATA.budgetYes}/${DATA.total}), yet ${DATA.budgetNo}/${DATA.total} chose zero-coal layouts.`,
      "Carbon outcomes vary by facility mix—not stated motivation alone.",
      "Limitations: N=15 session records; simplified model; pre/post subset too small for gain claims.",
      "Live demo: mayor-climate-game.vercel.app",
    ],
    { x: 0.75, y: 1.25, w: 6.35, h: 4.9, fontSize: 13 }
  );
  slide.addShape(pptx.ShapeType.rect, {
    x: 7.35,
    y: 1.45,
    w: 5.15,
    h: 4.25,
    fill: { color: "F3F4F6", transparency: 15 },
    line: { color: blue, width: 1.2 },
  });
  slide.addText("mayor-climate-game\n.vercel.app", {
    x: 7.75,
    y: 3.05,
    w: 4.35,
    h: 0.9,
    fontFace: "Times New Roman",
    fontSize: 18,
    bold: true,
    align: "center",
    color: navy,
    margin: 0,
  });
  slide.addText("Insert screenshot or QR here", {
    x: 7.75,
    y: 4.0,
    w: 4.35,
    h: 0.35,
    fontFace: "Times New Roman",
    fontSize: 12,
    italic: true,
    align: "center",
    color: "6B7280",
    margin: 0,
  });
  addTakeaway(
    slide,
    "Short browser play makes tradeoffs concrete; sample is exploratory—do not over-generalize beyond these 15 sessions."
  );
  addFooter(slide, 7);
  addNotes(slide, [
    "Offer to open live demo if time allows.",
    "Acknowledge limitations openly—it strengthens credibility.",
  ]);
}

addStandardSlide(
  "References",
  [
    "Guan, Y., Chen, H., & Zhou, X. (2015). Study of urban ventilation corridor planning method based on a case study of Guiyang, China.",
    "International Energy Agency. (2023). Staying cool without overheating the energy system.",
    "International Energy Agency. (2023). Sustainable, affordable cooling can save tens of thousands of lives each year.",
    "Zheng et al. (2022). Urban ventilation planning and its associated benefits based on numerical experiments: A case study in Beijing, China.",
  ],
  8,
  {
    paragraphs: true,
    fontSize: 12,
    x: 0.75,
    y: 1.15,
    w: 11.85,
    h: 5.2,
    takeaway: "References cover cooling demand, ventilation corridors, and serious-game methods.",
    notes: ["Full bibliography in paper.md and references.bib."],
  }
);

addStandardSlide(
  "Acknowledgements",
  [
    "Thank you to Lawted Wu for course structure, GitHub feedback, and research design guidance.",
    "Thank you to classmates and volunteers who tested the game and contributed session data.",
    "Thank you for your attention—questions welcome.",
  ],
  9,
  {
    paragraphs: true,
    x: 1.05,
    y: 2.05,
    w: 11.1,
    h: 2.6,
    fontSize: 18,
    takeaway: "Thank you for your constructive feedback.",
    notes: ["Pause for questions."],
  }
);

const outputPath = path.join(__dirname, "midterm.pptx");
pptx
  .writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`Generated ${outputPath}`);
    console.log("Slides: 9 (midterm layout) — updated with N=15 results, pre/post method, footer takeaways.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
