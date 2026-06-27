const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const draftPath = path.join(__dirname, "midterm-draft.md");
if (!fs.existsSync(draftPath)) throw new Error("midterm-draft.md is missing.");

const draft = fs.readFileSync(draftPath, "utf8");
const requiredSections = [
  "Title",
  "Research Question & Hypothesis",
  "Background",
  "Literature Review",
  "Research Design / Method",
  "Research Plan & Challenges",
  "Expected Results — user study not yet run",
  "References",
  "Acknowledgements",
];

function parseSections(markdown) {
  const sections = {};
  const parts = markdown.split(/^## /m).filter(Boolean);
  for (const part of parts) {
    const lines = part.trim().split(/\r?\n/);
    const title = lines.shift().trim();
    sections[title] = lines.join("\n").trim();
  }
  return sections;
}

function assertEnglishOnly(text, sectionTitle) {
  if (/[\u3400-\u9fff]/.test(text)) throw new Error(`Chinese text found in section: ${sectionTitle}`);
}

function linesFromSection(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\d+\.\s+/, "").replace(/^-\s+/, ""));
}

const sections = parseSections(draft);
for (const title of requiredSections) {
  if (!sections[title]) throw new Error(`Missing or empty section: ${title}`);
  assertEnglishOnly(title + "\n" + sections[title], title);
}

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Hu Yunhan";
pptx.subject = "Midterm Defense";
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
    h: opts.h ?? 5.65,
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
    h: opts.h ?? 5.65,
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
  addFooter(slide, n);
}

{
  const slide = pptx.addSlide();
  slide.background = { color: "F4F8FB" };
  const titleLines = linesFromSection(sections.Title);
  slide.addText(titleLines[0], {
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
  slide.addText(`${titleLines[1]}\n${titleLines[2]}`, {
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
  addFooter(slide, 1);
}

addStandardSlide("Research Question & Hypothesis", linesFromSection(sections["Research Question & Hypothesis"]), 2, { paragraphs: true, x: 0.8, y: 1.55, w: 11.7, h: 4.6, fontSize: 16 });
addStandardSlide("Background", linesFromSection(sections.Background), 3);
addStandardSlide("Literature Review", linesFromSection(sections["Literature Review"]), 4, { fontSize: 13 });
addStandardSlide("Research Design / Method", linesFromSection(sections["Research Design / Method"]), 5, { fontSize: 13 });
addStandardSlide("Research Plan & Challenges", linesFromSection(sections["Research Plan & Challenges"]), 6, { fontSize: 13 });

{
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  addTitle(slide, "Expected Results — user study not yet run");
  addBullets(slide, linesFromSection(sections["Expected Results — user study not yet run"]), { x: 0.75, y: 1.3, w: 6.25, h: 5.55, fontSize: 14 });
  slide.addShape(pptx.ShapeType.rect, {
    x: 7.35,
    y: 1.45,
    w: 5.15,
    h: 4.25,
    fill: { color: "F3F4F6", transparency: 15 },
    line: { color: "8A95A3", width: 1.2, dash: "dash" },
  });
  slide.addText("Insert prototype screenshot here", {
    x: 7.75,
    y: 3.22,
    w: 4.35,
    h: 0.45,
    fontFace: "Times New Roman",
    fontSize: 16,
    italic: true,
    align: "center",
    color: "6B7280",
    margin: 0,
  });
  addFooter(slide, 7);
}

addStandardSlide("References", linesFromSection(sections.References), 8, { paragraphs: true, fontSize: 12, x: 0.75, y: 1.15, w: 11.85, h: 5.8 });
addStandardSlide("Acknowledgements", linesFromSection(sections.Acknowledgements), 9, { paragraphs: true, x: 1.05, y: 2.05, w: 11.1, h: 2.6, fontSize: 18 });

const outputPath = path.join(__dirname, "midterm.pptx");
pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`Generated ${outputPath}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });