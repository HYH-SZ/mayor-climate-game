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

function noteParagraph(text, opts = {}) {
  const sz = opts.sz || 1200;
  return `<a:p><a:pPr marL="0" indent="0" algn="l"><a:lnSpc><a:spcPct val="115000"/></a:lnSpc><a:buNone/></a:pPr><a:r>${rPr(sz)}<a:t>${escapeXml(text)}</a:t></a:r></a:p>`;
}

function noteParagraphs(texts, opts = {}) {
  return texts.map((t) => noteParagraph(t, opts)).join("");
}

function replaceFooterNote(xml, text) {
  const footerText = footerParagraph(text);
  const emptyFooter =
    /<a:p><a:pPr algn="ctr"\/><a:endParaRPr sz="1350"><a:solidFill><a:schemeClr val="lt1"\/><\/a:solidFill><\/a:endParaRPr><\/a:p>/;
  if (emptyFooter.test(xml)) {
    return xml.replace(emptyFooter, footerText);
  }
  if (xml.includes('y="5047864"')) {
    return xml.replace(
      /(<p:sp>[\s\S]*?y="5047864"[\s\S]*?<a:lstStyle\/>)[\s\S]*?(<\/p:txBody><\/p:sp>)/,
      `$1${footerText}$2`
    );
  }
  const gradFill =
    `<a:gradFill><a:gsLst><a:gs pos="0"><a:srgbClr val="DF02FC"/></a:gs><a:gs pos="50000"><a:srgbClr val="2E3BEE"/></a:gs><a:gs pos="100000"><a:srgbClr val="10E4DF"/></a:gs></a:gsLst><a:lin ang="4800126" scaled="0"/></a:gradFill>`;
  const footerShape =
    `<p:sp><p:nvSpPr><p:cNvPr id="999" name="Footer Note"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="5047864"/><a:ext cx="9144000" cy="104400"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom>${gradFill}<a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="68569" tIns="34275" rIns="68569" bIns="34275" anchor="ctr"><a:normAutofit/></a:bodyPr><a:lstStyle/>${footerText}</p:txBody></p:sp>`;
  return xml.replace("</p:spTree>", `${footerShape}</p:spTree>`);
}

function footerParagraph(text) {
  return `<a:p><a:pPr algn="ctr"><a:lnSpc><a:spcPct val="90000"/></a:lnSpc></a:pPr><a:r><a:rPr lang="en-US" sz="1000" dirty="0"><a:solidFill><a:schemeClr val="lt1"/></a:solidFill><a:latin typeface="Times New Roman"/><a:ea typeface="Times New Roman"/></a:rPr><a:t>${escapeXml(text)}</a:t></a:r></a:p>`;
}

function replaceNotesBody(xml, paragraphs) {
  const bodyStart = xml.indexOf('<p:ph type="body"');
  if (bodyStart === -1) return xml;
  const txBodyStart = xml.indexOf("<p:txBody>", bodyStart);
  const txBodyEnd = xml.indexOf("</p:txBody>", txBodyStart);
  if (txBodyStart === -1 || txBodyEnd === -1) return xml;
  const head = xml.slice(0, txBodyStart);
  const lstStyleEnd = xml.indexOf("</a:lstStyle>", txBodyStart);
  const prefix =
    lstStyleEnd !== -1 && lstStyleEnd < txBodyEnd
      ? xml.slice(txBodyStart, lstStyleEnd + "</a:lstStyle>".length)
      : xml.slice(txBodyStart, xml.indexOf("<a:lstStyle/>", txBodyStart) + "<a:lstStyle/>".length);
  return head + prefix + noteParagraphs(paragraphs, { sz: 1200 }) + xml.slice(txBodyEnd);
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

const slideFooterNotes = {
  1: "Note: This instruction slide should be deleted before submission. The deck presents Mayor Climate Game—a browser prototype for teaching urban energy and ventilation tradeoffs.",
  2: "Takeaway: I present Mayor Climate Game—a browser serious game where players learn how city energy choices affect budget, carbon emissions, and urban ventilation (Hu Yunhan; advisor: Lawted Wu).",
  3: "Takeaway: We ask whether one play session helps learners understand budget–carbon–ventilation tradeoffs—and whether live feedback leads them to avoid blocking airflow with coal plants.",
  4: "Takeaway: Cities must balance cheap energy, low carbon, and good airflow. Professional CFD tools are powerful but too hard for beginners; this game makes tradeoffs visible through play.",
  5: "Takeaway: Cooling demand is rising and ventilation corridors matter, yet few classroom-ready browser tools combine playable simulation, live metrics, and automatic research logging.",
  6: `Takeaway: N = ${DATA.total} one-round sessions (July 2026). Players placed facilities on a 12×12 grid; we logged scores, carbon totals, survey answers, and full layout JSON for each session.`,
  7: `Takeaway: ${DATA.ventCorrect}/${DATA.total} answered ventilation correctly; ${DATA.coalOutletSessions}/${DATA.total} blocked outlets. Carbon ranged ${DATA.carbonRange[0]}–${DATA.carbonRange[1]} t—clean layouts scored 84–88; heavy-coal layouts scored 51–81.`,
  8: "Takeaway: Budget pressure was common (8/10), but facility mix—not stated motivation alone—drove carbon outcomes. Short browser play can teach tradeoffs textbooks alone cannot show.",
  9: "Takeaway: The pilot supports ventilation learning and safer siting, but N=10 limits generalization. Next: pre-register outcomes, expand the sample, and test advisory conditions.",
  10: "Takeaway: References cover sustainable cooling, urban ventilation planning, and serious-game methods. Full bibliography and paper: github.com/HYH-SZ/mayor-climate-game.",
  11: "Thank you for your attention. I welcome questions about the live demo (mayor-climate-game.vercel.app), data collection, or plans for a larger study.",
};

const slideSpeakerNotes = {
  1: [
    "This slide is template instructions only—delete it before you submit the deck.",
    "The presentation covers Mayor Climate Game: a browser-based serious game for teaching urban energy layout and ventilation tradeoffs, based on N=10 pilot sessions collected in July 2026.",
  ],
  3: [
    "This slide introduces the research scope and main question.",
    "Mayor Climate Game is a classroom-ready browser tool. Players place coal plants, wind turbines, and ground-source heat pumps on a city grid with a fixed budget.",
    "Research question: How does one play session shape facility choices and understanding of budget–carbon–ventilation tradeoffs?",
    "Hypothesis: after seeing live score and carbon feedback, participants avoid coal on ventilation-sensitive cells and answer the ventilation rule correctly.",
  ],
  4: [
    "Urban areas face rising heat and growing cooling-related energy demand, which increases emissions pressure.",
    "Ventilation corridors can improve urban airflow—but only if energy facilities are not placed where they block wind pathways.",
    "Tools like CFD, WRF, and GIS are accurate but require expert training—too heavy for introductory learners.",
    "Serious games offer immediate feedback and automatically log every choice, making them useful for both teaching and exploratory research.",
  ],
  5: [
    "IEA (2023) documents rising cooling demand and policy context for sustainable cooling.",
    "Zheng et al. (2022) and Guan et al. (2015) show why urban ventilation corridor planning and careful facility siting matter.",
    "Prior serious games (e.g., neighbourhood energy games, 2019) reveal preferences through logged player choices.",
    "Our gap: few lightweight browser prototypes combine play, visible metrics, and research-grade session logging in one package.",
  ],
  6: [
    "The artifact is deployed on Vercel: a 12×12 grid, CNY 10 million budget, and three facility types (coal, wind, ground-source heat pump).",
    `Sample: N = ${DATA.total} sessions—seven exported TXT reports plus three earlier pilot logs—each participant played one round in July 2026.`,
    "Measures: two post-play survey items, final score, total carbon (tonnes CO₂e), and the full facility layout saved as JSON.",
    "Analysis is descriptive. The in-game microclimate model uses rule-based heuristics, not full CFD simulation.",
  ],
  7: [
    `${DATA.ventCorrect} of ${DATA.total} participants answered the ventilation survey item correctly.`,
    `${DATA.budgetYes} of ${DATA.total} reported choosing coal to save budget; ${DATA.budgetNo} chose zero-coal wind layouts instead.`,
    `${DATA.coalOutletSessions} of ${DATA.total} placed coal on wind outlets—none did.`,
    `Scores ranged ${DATA.scoreRange[0]}–${DATA.scoreRange[1]} (mean ≈ ${DATA.meanScore}); carbon ${DATA.carbonRange[0]}–${DATA.carbonRange[1]} t (mean ≈ ${Math.round(DATA.meanCarbon)}).`,
    "Pattern: lower carbon (0–120 t, n=7) co-occurred with scores 84–88; higher carbon (240–1440 t, n=3) with scores 51–81.",
    "Live demo: mayor-climate-game.vercel.app",
  ],
  8: [
    "Findings partially support the hypothesis: ventilation knowledge was strong and no participant blocked ventilation outlets.",
    "Budget pressure remains salient—most players cited cost—but two still built zero-coal wind layouts.",
    "Carbon outcomes varied sharply by facility mix, not by stated budget motivation alone.",
    "A short browser session can make abstract cost–carbon–ventilation tradeoffs concrete for classroom discussion.",
  ],
  9: [
    "Answer to the research question: the game supports declarative ventilation understanding and safer siting behavior in this pilot.",
    "Limitations: N=10, simplified rule-based model, exploratory design—not confirmatory statistical evidence.",
    "Future work: pre-register outcomes, expand sample size, and test alternative in-game advisory messages.",
  ],
  10: [
    "These references anchor the cooling-demand context, ventilation corridor literature, and serious-game methodology.",
    "Full bibliography and the working paper are in the project repository: github.com/HYH-SZ/mayor-climate-game.",
  ],
};

const slideNotesFiles = {
  1: "ppt/notesSlides/notesSlide1.xml",
  3: "ppt/notesSlides/notesSlide2.xml",
  4: "ppt/notesSlides/notesSlide3.xml",
  5: "ppt/notesSlides/notesSlide4.xml",
  6: "ppt/notesSlides/notesSlide5.xml",
  7: "ppt/notesSlides/notesSlide6.xml",
  8: "ppt/notesSlides/notesSlide7.xml",
  9: "ppt/notesSlides/notesSlide8.xml",
  10: "ppt/notesSlides/notesSlide9.xml",
};

async function main() {
  if (!fs.existsSync(TEMPLATE)) {
    throw new Error(`Template not found: ${TEMPLATE}`);
  }

  const buf = fs.readFileSync(TEMPLATE);
  const zip = await JSZip.loadAsync(buf);

  const slide2 = await zip.file("ppt/slides/slide2.xml").async("string");
  zip.file("ppt/slides/slide2.xml", replaceFooterNote(replaceTitleSlide(slide2), slideFooterNotes[2]));

  for (const [num, items] of Object.entries(slideContent)) {
    const file = `ppt/slides/slide${num}.xml`;
    const xml = await zip.file(file).async("string");
    const updated = replaceFooterNote(replaceBodyBullets(xml, items, { sz: 1500 }), slideFooterNotes[num]);
    zip.file(file, updated);
  }

  const slide11 = await zip.file("ppt/slides/slide11.xml").async("string");
  zip.file(
    "ppt/slides/slide11.xml",
    replaceFooterNote(replaceThankYouSlide(slide11), slideFooterNotes[11])
  );

  const slide1 = await zip.file("ppt/slides/slide1.xml").async("string");
  zip.file("ppt/slides/slide1.xml", replaceFooterNote(slide1, slideFooterNotes[1]));

  for (const [num, noteFile] of Object.entries(slideNotesFiles)) {
    const notes = slideSpeakerNotes[num];
    if (!notes) continue;
    const xml = await zip.file(noteFile).async("string");
    zip.file(noteFile, replaceNotesBody(xml, notes));
  }

  const out = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(OUTPUT, out);
  console.log(`Generated ${OUTPUT}`);
  console.log("Note: Delete slide 1 (instructions) before final submission.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
