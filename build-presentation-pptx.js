const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

const TEMPLATE = process.env.PPT_TEMPLATE || path.join(
  __dirname,
  "assets",
  "Generation-AI-Presentation-Template.pptx"
);
const OUTPUT = path.join(__dirname, "mayor-climate-presentation.pptx");
const DATA = JSON.parse(
  fs.readFileSync(path.join(__dirname, "research/data/pilot-summary.json"), "utf8")
);

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rPr(sz = 1600, opts = {}) {
  const bold = opts.bold ? ' b="1"' : "";
  const color = opts.color ? `<a:solidFill><a:srgbClr val="${opts.color}"/></a:solidFill>` : "";
  const font = opts.font || "Times New Roman";
  return `<a:rPr lang="en-US" sz="${sz}" dirty="0"${bold}>${color}<a:latin typeface="${font}"/><a:ea typeface="${font}"/><a:cs typeface="${font}"/></a:rPr>`;
}

function paragraph(text, opts = {}) {
  const sz = opts.sz || 1600;
  if (opts.bullet === false) {
    return `<a:p><a:pPr><a:lnSpc><a:spcPct val="115000"/></a:lnSpc><a:buNone/></a:pPr><a:r>${rPr(sz, opts)}<a:t>${escapeXml(text)}</a:t></a:r></a:p>`;
  }
  return `<a:p><a:pPr marL="171450" indent="-171450"><a:lnSpc><a:spcPct val="115000"/></a:lnSpc><a:buChar char="●"/></a:pPr><a:r>${rPr(sz, opts)}<a:t>${escapeXml(text)}</a:t></a:r></a:p>`;
}

function paragraphs(items, opts = {}) {
  return items.map((t) => paragraph(t, opts)).join("");
}

function replaceBodyBullets(xml, items, opts = {}) {
  const marker = "指导问题：";
  const idx = xml.indexOf(marker);
  if (idx === -1) throw new Error("Body marker not found in slide XML");
  const lstStyleEnd = xml.lastIndexOf("</a:lstStyle>", idx);
  const txBodyEnd = xml.indexOf("</p:txBody>", idx);
  if (lstStyleEnd === -1 || txBodyEnd === -1) throw new Error("txBody bounds not found");
  const head = xml.slice(0, lstStyleEnd + "</a:lstStyle>".length);
  const tail = xml.slice(txBodyEnd);
  return head + paragraphs(items, opts) + tail;
}

function replaceTitleSlide(xml) {
  let out = xml;
  out = out.replace(
    /<a:t>Title<\/a:t>/,
    `<a:t>Mayor Climate Game: A Browser-Based Prototype for Teaching Urban Energy and Ventilation Tradeoffs</a:t>`
  );
  out = out.replace(/<a:t>______     Research Advisor<\/a:t>/, `<a:t>Hu Yunhan     Research Advisor</a:t>`);
  out = out.replace(/<a:t>______<\/a:t>/, `<a:t>Lawted Wu</a:t>`);
  return out;
}

function replaceThankYouSlide(xml) {
  return xml
    .replace(/<a:t>Student Name<\/a:t>/g, `<a:t>Hu Yunhan</a:t>`)
    .replace(/<a:t>______   Research Advisor<\/a:t>/g, `<a:t>Lawted Wu   Research Advisor</a:t>`)
    .replace(/<a:t>______<\/a:t>/g, `<a:t>Lawted Wu</a:t>`);
}

const slideContent = {
  3: [
    "Scope: browser serious game teaching urban energy layout and post-play learning",
    "RQ: How does Mayor Climate Game shape facility choices and understanding of budget–carbon–ventilation tradeoffs?",
    "Hypothesis: after one round with live metrics, participants avoid coal on ventilation-sensitive cells and answer the ventilation rule correctly",
  ],
  4: [
    "Cities face rising heat, cooling-related energy demand, and emissions pressure",
    "Urban ventilation corridors help when energy siting respects airflow pathways",
    "Professional CFD/WRF/GIS tools are powerful but hard for non-expert learners",
    "Serious games offer immediate feedback and automatically logged behavioral choices",
  ],
  5: [
    "IEA (2023): rising cooling demand and sustainable cooling policy context",
    "Zheng et al. (2022); Guan et al. (2015): urban ventilation corridors and siting",
    "Serious games can reveal preferences through logged choices (Neighbourhood Game, 2019)",
    "Gap: few classroom-ready browser tools combine play, metrics, and research logging",
  ],
  6: [
    "Artifact: Vercel-hosted 12×12 grid game; CNY 10M budget; coal / wind / ground-source heat pump",
    `Sample: N = ${DATA.total} sessions (7 TXT exports + 3 pilot logs), July 2026, one round each`,
    "Measures: 2 post-play survey items + final score, carbon (t CO₂e), and layout JSON",
    "Analysis: descriptive coding from session logs; rule-based microclimate model (not CFD)",
  ],
  7: [
    `${DATA.ventCorrect}/${DATA.total} answered the ventilation item correctly; ${DATA.budgetYes}/${DATA.total} reported choosing coal to save budget`,
    `${DATA.coalOutletSessions}/${DATA.total} placed coal on wind outlets`,
    `Score range ${DATA.scoreRange[0]}–${DATA.scoreRange[1]} (mean ≈ ${DATA.meanScore}); carbon ${DATA.carbonRange[0]}–${DATA.carbonRange[1]} t (mean ≈ ${Math.round(DATA.meanCarbon)})`,
    "Pattern: lower carbon (0–120 t, n=7) → scores 84–88; higher carbon (240–1440 t, n=3) → scores 51–81",
    "Live demo: mayor-climate-game.vercel.app",
  ],
  8: [
    "Findings partially support the hypothesis: strong ventilation knowledge; no coal on outlets",
    "Budget pressure remains salient (8/10), yet 2/10 chose zero-coal wind layouts",
    "Carbon outcomes vary sharply by facility mix—not by stated budget motivation alone",
    "Short browser sessions can make cost–carbon–ventilation tradeoffs visible to learners",
  ],
  9: [
    "Answer to RQ: the game supports declarative ventilation understanding and safer siting behavior",
    "Limitations: N=10, simplified rule-based model, exploratory pilot—not confirmatory evidence",
    "Future work: pre-register outcomes, expand sample size, test alternative advisory conditions",
  ],
  10: [
    "IEA (2023). Staying Cool / Sustainable Cooling outlook reports.",
    "Zheng, Y., et al. (2022). Review of urban ventilation corridors.",
    "Guan, T., et al. (2015). Guiyang urban ventilation environment analysis.",
    "Serious game for neighbourhood energy choices (2019).",
    "Full references: github.com/HYH-SZ/mayor-climate-game (paper.pdf)",
  ],
};

async function main() {
  if (!fs.existsSync(TEMPLATE)) {
    throw new Error(`Template not found: ${TEMPLATE}`);
  }

  const buf = fs.readFileSync(TEMPLATE);
  const zip = await JSZip.loadAsync(buf);

  const slide2 = await zip.file("ppt/slides/slide2.xml").async("string");
  zip.file("ppt/slides/slide2.xml", replaceTitleSlide(slide2));

  for (const [num, items] of Object.entries(slideContent)) {
    const file = `ppt/slides/slide${num}.xml`;
    const xml = await zip.file(file).async("string");
    zip.file(file, replaceBodyBullets(xml, items, { sz: 1500 }));
  }

  const slide11 = await zip.file("ppt/slides/slide11.xml").async("string");
  zip.file("ppt/slides/slide11.xml", replaceThankYouSlide(slide11));

  const out = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(OUTPUT, out);
  console.log(`Generated ${OUTPUT}`);
  console.log("Note: Delete slide 1 (instructions) before final submission.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
