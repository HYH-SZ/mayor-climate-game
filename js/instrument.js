const STUDY_INSTRUMENT = {
  cognition: [
    { id: "cog1", text: "在风口放置火电会显著降低全城通风效率", type: "tf", answer: true },
    { id: "cog2", text: "风电布置在通风廊道内能更好改善城市微气候", type: "tf", answer: true },
    { id: "cog3", text: "地源热泵在低洼盆地效率最高", type: "tf", answer: true },
    { id: "cog4", text: "居民区附近的高热源不会明显影响建筑能耗", type: "tf", answer: false }
  ],
  attitude: [
    { id: "att1", text: "环保效益比建设成本更重要", type: "likert", labels: ["非常不同意", "不同意", "中立", "同意", "非常同意"] },
    { id: "att2", text: "我愿意为改善微气候支付更高造价", type: "likert", labels: ["非常不同意", "不同意", "中立", "同意", "非常同意"] }
  ],
  gameplay: [
    { id: "budgetChoice", text: "你是否为了节省预算而选择煤电？", type: "choice", options: [{ value: "yes", label: "是" }, { value: "no", label: "否" }] },
    { id: "windUnderstanding", text: "在风口放置煤电会降低全城通风。", type: "choice", options: [{ value: "true", label: "正确" }, { value: "false", label: "错误" }] }
  ],
  decision: [
    { id: "cleanRatio", text: "本局中清洁能源占您总投资的比重", type: "likert", labels: ["很低", "较低", "中等", "较高", "很高"] },
    { id: "costOverEnv", text: "您是否曾为节省预算而选择高污染设施？", type: "choice", options: ["是，多次", "是，一两次", "不确定", "否，基本未选", "完全未选"] }
  ],
  open: [
    { id: "open1", text: "本局中最印象深刻的一次布局决策是什么？为什么？", type: "text" }
  ]
};

function buildSurveySection(form, title, questions, namePrefix = "") {
  const heading = document.createElement("h3");
  heading.textContent = title;
  form.appendChild(heading);

  for (const q of questions) {
    const group = document.createElement("div");
    group.className = "question";
    const fieldName = `${namePrefix}${q.id}`;
    group.innerHTML = `<strong>${q.text}</strong>`;

    if (q.type === "likert") {
      const opts = document.createElement("div");
      opts.className = "choice-opts";
      q.labels.forEach((label, i) => {
        opts.innerHTML += `<label><input type="radio" name="${fieldName}" value="${i + 1}" required> ${label}</label>`;
      });
      group.appendChild(opts);
    } else if (q.type === "choice") {
      const opts = document.createElement("div");
      opts.className = "choice-opts";
      const options = q.options.map((opt, i) =>
        typeof opt === "string"
          ? { value: String(i + 1), label: opt }
          : opt
      );
      options.forEach((opt) => {
        opts.innerHTML += `<label><input type="radio" name="${fieldName}" value="${opt.value}" required> ${opt.label}</label>`;
      });
      group.appendChild(opts);
    } else if (q.type === "tf") {
      group.innerHTML += `
        <div class="choice-opts">
          <label><input type="radio" name="${fieldName}" value="true" required> 正确</label>
          <label><input type="radio" name="${fieldName}" value="false" required> 错误</label>
        </div>`;
    } else if (q.type === "text") {
      group.innerHTML += `<textarea name="${fieldName}" rows="3" required></textarea>`;
    }

    form.appendChild(group);
  }
}

function collectSurveyAnswers(form, questions, namePrefix = "") {
  const answers = {};
  const fd = new FormData(form);
  for (const q of questions) {
    const key = `${namePrefix}${q.id}`;
    answers[q.id] = fd.get(key);
  }
  return answers;
}

function scoreCognition(answers) {
  let score = 0;
  for (const q of STUDY_INSTRUMENT.cognition) {
    if (answers[q.id] === String(q.answer)) score += 1;
  }
  return score;
}

function flattenSurveyBlocks(blocks) {
  return Object.assign({}, ...Object.values(blocks));
}
