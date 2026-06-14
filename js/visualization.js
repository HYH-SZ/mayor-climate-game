const Visualization = {
  heatCanvas: null, windSvg: null, gridEl: null,
  init(gridEl) {
    this.gridEl = gridEl;
    this.heatCanvas = document.getElementById("heat-canvas");
    this.windSvg = document.getElementById("wind-svg");
  },
  render(cells, summary) {
    this._renderHeatmap(cells);
    this._renderWind(cells);
    this._renderMetrics(summary);
    this._renderBars(summary);
  },
  _renderHeatmap(cells) {
    const canvas = this.heatCanvas, ctx = canvas.getContext("2d"), size = CONFIG.gridSize;
    const rect = this.gridEl.getBoundingClientRect();
    canvas.width = rect.width; canvas.height = rect.height;
    const cellW = canvas.width / size, cellH = canvas.height / size;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const temp = cells[y][x].temp, t = Math.max(20, Math.min(35, temp)), ratio = (t - 20) / 15;
      ctx.fillStyle = "rgb(" + (50 + ratio * 205) + "," + (150 - ratio * 120) + "," + (220 - ratio * 200) + ")";
      ctx.globalAlpha = 0.55; ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
    }
    ctx.globalAlpha = 1;
  },
  _renderWind(cells) {
    const svg = this.windSvg, size = CONFIG.gridSize, rect = this.gridEl.getBoundingClientRect();
    svg.setAttribute("width", rect.width); svg.setAttribute("height", rect.height);
    while (svg.lastChild && svg.lastChild.tagName !== "defs") svg.removeChild(svg.lastChild);
    const cellW = rect.width / size, cellH = rect.height / size;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const cell = cells[y][x];
      if (cell.terrain !== "corridor" && cell.terrain !== "outlet") continue;
      const cx = x * cellW + cellW / 2, cy = y * cellH + cellH / 2;
      const len = Math.min(cellW, cellH) * 0.35 * (cell.wind / CONFIG.baseWind);
      const blocked = cell.facility && CONFIG.facilities[cell.facility].windBlock > 0.4;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", cx); line.setAttribute("y1", cy);
      line.setAttribute("x2", cx + len); line.setAttribute("y2", cy);
      line.setAttribute("stroke", blocked ? "#e53935" : "#1565c0");
      line.setAttribute("stroke-width", blocked ? "3" : "2");
      line.setAttribute("marker-end", blocked ? "url(#arrow-red)" : "url(#arrow-blue)");
      svg.appendChild(line);
    }
  },
  _renderMetrics(summary) {
    const fields = {
      "metric-avg-temp": summary.avgTemp + "C",
      "metric-wind": summary.avgWind + " m/s",
      "metric-carbon": summary.totalCarbon + " t",
      "metric-energy": summary.totalEnergy + " kWh",
      "metric-heat-island": (summary.heatIsland > 0 ? "+" : "") + summary.heatIsland + "C",
      "metric-score": summary.score + " 分"
    };
    for (const [id, val] of Object.entries(fields)) {
      const el = document.getElementById(id); if (el) el.textContent = val;
    }
  },
  _renderBars(summary) {
    const carbonBar = document.getElementById("bar-carbon");
    const pct = Math.min(100, (summary.totalCarbon / CONFIG.carbonThreshold) * 100);
    carbonBar.style.width = pct + "%";
    carbonBar.className = "bar-fill" + (pct > 100 ? " danger" : pct > 70 ? " warn" : "");
    document.getElementById("bar-energy").style.width = Math.min(100, summary.totalEnergy / 50) + "%";
  },
  highlightCells(coords) {
    document.querySelectorAll(".grid-cell").forEach(el => el.classList.remove("highlight"));
    for (const [x, y] of coords) {
      const el = document.querySelector('.grid-cell[data-x="' + x + '"][data-y="' + y + '"]');
      if (el) el.classList.add("highlight");
    }
  },
  clearHighlight() { document.querySelectorAll(".grid-cell").forEach(el => el.classList.remove("highlight")); }
};
