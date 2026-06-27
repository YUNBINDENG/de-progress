const storeKey = "de-progress-modules-v1";
const themeKey = "de-progress-theme-v1";
const statsKey = "de-progress-task-stats-v1";
const colors = [
  "#78e38f",
  "#b685ff",
  "#ff6d6d",
  "#5ab8ff",
  "#ffd166",
  "#45d6bd"
];
const themes = ["universe", "love", "rainy", "connect", "wormhole", "turbulence"];
const today = new Date();
const defaultTaskStats = {
  target: 12,
  payslip: [
    { date: "2025-06-21", value: 11 },
    { date: "2025-06-14", value: 10 },
    { date: "2025-06-07", value: 9 },
    { date: "2025-05-31", value: 8 },
    { date: "2025-05-24", value: 7 },
    { date: "2025-05-17", value: 6 },
    { date: "2025-05-10", value: 5 },
    { date: "2025-03-29", value: 4 },
    { date: "2025-03-22", value: 3 },
    { date: "2025-03-15", value: 2 },
    { date: "2025-03-08", value: 1 }
  ],
  salary: [
    { date: "2025-06-21", value: 1365.29 },
    { date: "2025-06-14", value: 1101.98 },
    { date: "2025-06-07", value: 1382.65 },
    { date: "2025-05-31", value: 1297.75 },
    { date: "2025-05-24", value: 914.01 },
    { date: "2025-05-17", value: 159.14 },
    { date: "2025-05-10", value: 65.98 },
    { date: "2025-03-29", value: 1223.07 },
    { date: "2025-03-22", value: 924.67 },
    { date: "2025-03-15", value: 278.5 },
    { date: "2025-03-08", value: 550.2 }
  ],
  hours: [
    { date: "2025-06-21", value: 51.5 },
    { date: "2025-06-14", value: 41.583 },
    { date: "2025-06-07", value: 45.033 },
    { date: "2025-05-31", value: 48.95 },
    { date: "2025-05-24", value: 34.467 },
    { date: "2025-05-17", value: 6 },
    { date: "2025-05-10", value: 2.5 },
    { date: "2025-03-29", value: 44.25 },
    { date: "2025-03-22", value: 33.333 },
    { date: "2025-03-15", value: 10.5 },
    { date: "2025-03-08", value: 20.75 }
  ]
};

const defaults = [
  {
    id: crypto.randomUUID(),
    title: "年度进度",
    icon: "📅",
    start: `${today.getFullYear()}-01-01`,
    end: `${today.getFullYear() + 1}-01-01`,
    color: colors[0],
    pulse: true,
    collapsed: false
  },
  {
    id: crypto.randomUUID(),
    title: "New Zealand",
    icon: "🇳🇿",
    start: "2024-12-20",
    end: "2026-03-20",
    color: colors[1],
    pulse: false,
    collapsed: true
  }
];

const moduleList = document.querySelector("#moduleList");
const template = document.querySelector("#moduleTemplate");
const dialog = document.querySelector("#moduleDialog");
const form = document.querySelector("#moduleForm");
const dialogTitle = document.querySelector("#dialogTitle");
const titleInput = document.querySelector("#titleInput");
const iconInput = document.querySelector("#iconInput");
const startInput = document.querySelector("#startInput");
const endInput = document.querySelector("#endInput");
const pulseInput = document.querySelector("#pulseInput");
const collapsedInput = document.querySelector("#collapsedInput");
const deleteButton = document.querySelector("#deleteButton");
const colorRow = document.querySelector("#colorRow");
const themeSelect = document.querySelector("#themeSelect");
const taskStats = document.querySelector("#taskStats");
const statsToggle = document.querySelector("#statsToggle");
const statsSummary = document.querySelector("#statsSummary");
const payslipTargetText = document.querySelector("#payslipTargetText");
const payslipChart = document.querySelector("#payslipChart");
const salaryChart = document.querySelector("#salaryChart");
const hoursChart = document.querySelector("#hoursChart");
const statDialog = document.querySelector("#statDialog");
const statForm = document.querySelector("#statForm");
const statDialogTitle = document.querySelector("#statDialogTitle");
const statDateInput = document.querySelector("#statDateInput");
const statValueInput = document.querySelector("#statValueInput");
const statValueLabel = document.querySelector("#statValueLabel");
const statDateField = document.querySelector("#statDateField");

let modules = loadModules();
let taskData = loadTaskStats();
let editingId = null;
let selectedColor = colors[0];
let selectedTheme = loadTheme();
let editingStatType = "payslip";

document.querySelector("#todayText").textContent = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "full"
}).format(today);

document.querySelector("#addModuleButton").addEventListener("click", () => {
  openEditor();
});
document.querySelector("#closeDialogButton").addEventListener("click", closeEditor);
document.querySelector("#cancelButton").addEventListener("click", closeEditor);
deleteButton.addEventListener("click", deleteCurrentModule);
form.addEventListener("submit", saveCurrentModule);
themeSelect.addEventListener("change", () => {
  setTheme(themeSelect.value);
  haptic("theme");
});
statsToggle.addEventListener("click", () => {
  taskStats.classList.toggle("is-collapsed");
  const isExpanded = !taskStats.classList.contains("is-collapsed");
  statsToggle.setAttribute("aria-expanded", String(isExpanded));
  haptic("light");
});
document.querySelector("#closeStatDialogButton").addEventListener("click", closeStatEditor);
document.querySelector("#cancelStatButton").addEventListener("click", closeStatEditor);
statForm.addEventListener("submit", saveStatEntry);
taskStats.addEventListener("click", handleStatAction);

setTheme(selectedTheme, false);
renderColorChoices();
renderModules();
renderTaskStats();
registerServiceWorker();

function loadModules() {
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey));
    return Array.isArray(saved) && saved.length ? saved.map(normalizeModule) : defaults;
  } catch {
    return defaults;
  }
}

function normalizeModule(module) {
  const title = module.title === "新西兰WHV" ? "New Zealand" : module.title;
  return {
    ...module,
    title,
    collapsed: typeof module.collapsed === "boolean" ? module.collapsed : title === "New Zealand"
  };
}

function persist() {
  localStorage.setItem(storeKey, JSON.stringify(modules));
}

function loadTaskStats() {
  try {
    const saved = JSON.parse(localStorage.getItem(statsKey));
    return {
      target: normalizeTarget(saved?.target),
      payslip: normalizeStatList(saved?.payslip, "payslip"),
      salary: normalizeStatList(saved?.salary, "salary"),
      hours: normalizeStatList(saved?.hours, "hours")
    };
  } catch {
    return cloneDefaultStats();
  }
}

function cloneDefaultStats() {
  return {
    target: defaultTaskStats.target,
    payslip: normalizeStatList(defaultTaskStats.payslip, "payslip"),
    salary: normalizeStatList(defaultTaskStats.salary, "salary"),
    hours: normalizeStatList(defaultTaskStats.hours, "hours")
  };
}

function normalizeTarget(value) {
  const target = Number(value);
  return Number.isFinite(target) && target > 0 ? target : defaultTaskStats.target;
}

function normalizeStatList(list, type) {
  const fallback = defaultTaskStats[type] ?? [];
  const source = Array.isArray(list) && list.length ? list : fallback;
  return source
    .map((item) => ({
      date: item.date,
      value: Number(item.value)
    }))
    .filter((item) => item.date && Number.isFinite(item.value))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function persistTaskStats() {
  localStorage.setItem(statsKey, JSON.stringify(taskData));
}

function loadTheme() {
  const saved = localStorage.getItem(themeKey);
  return themes.includes(saved) ? saved : "universe";
}

function setTheme(theme, shouldSave = true) {
  selectedTheme = themes.includes(theme) ? theme : "universe";
  document.body.className = `theme-${selectedTheme}`;
  themeSelect.value = selectedTheme;
  if (shouldSave) localStorage.setItem(themeKey, selectedTheme);
}

function haptic(kind = "light") {
  if (!("vibrate" in navigator)) return;
  const patterns = {
    light: 8,
    save: [12, 24, 12],
    delete: [24, 28, 36],
    theme: [10, 16, 10]
  };
  navigator.vibrate(patterns[kind] ?? patterns.light);
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function wholeDays(start, end) {
  const ms = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
    Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  return Math.max(1, Math.round(ms / 86400000));
}

function stats(module) {
  const start = parseDate(module.start);
  const end = parseDate(module.end);
  const total = wholeDays(start, end);
  const rawPassed = wholeDays(start, today);
  const passed = Math.min(Math.max(rawPassed, 0), total);
  const percent = Math.min(100, Math.max(0, (passed / total) * 100));
  return { start, end, total, passed, percent };
}

function renderModules() {
  moduleList.innerHTML = "";
  modules.forEach((module) => {
    const item = template.content.firstElementChild.cloneNode(true);
    const { start, end, total, passed, percent } = stats(module);
    const cols = total > 420 ? 28 : 25;
    const dash = 113.1 - (113.1 * percent / 100);

    item.style.setProperty("--accent", module.color);
    item.style.setProperty("--dash", dash.toFixed(2));
    item.style.setProperty("--cols", cols);
    item.classList.toggle("is-collapsed", module.collapsed);
    item.querySelector(".module-icon").textContent = module.icon;
    item.querySelector(".module-title").textContent = module.title;
    item.querySelector(".module-range").textContent = `${formatDate(start)} - ${formatDate(end)}`;
    item.querySelector(".ring-text").textContent = `${Math.round(percent)}%`;
    item.querySelector(".day-count").textContent = `${passed}/${total} 天`;
    item.querySelector(".percent-text").textContent = `${percent.toFixed(2)}%`;

    const grid = item.querySelector(".dot-grid");
    const todayIndex = Math.max(0, Math.min(passed, total - 1));
    for (let index = 0; index < total; index += 1) {
      const dot = document.createElement("span");
      dot.className = "dot";
      if (index < passed) dot.classList.add("done");
      if (module.pulse && index === todayIndex) dot.classList.add("today");
      grid.append(dot);
    }

    item.querySelector(".card-edit").addEventListener("click", () => openEditor(module.id));
    moduleList.append(item);
  });
}

function formatDate(date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function renderTaskStats() {
  const payslipData = taskData.payslip;
  const salaryData = taskData.salary;
  const hoursData = taskData.hours;
  const latestPayslip = payslipData[0];
  const target = taskData.target;
  const maxSalary = Math.max(...salaryData.map((item) => item.value));
  const totalIncome = salaryData.reduce((sum, item) => sum + item.value, 0);
  const totalHours = hoursData.reduce((sum, item) => sum + item.value, 0);

  payslipTargetText.textContent = target;

  statsSummary.innerHTML = [
    ["Payslip", `${latestPayslip?.value ?? 0}/${target}`],
    ["总收入", money(totalIncome)],
    ["总工时", `${totalHours.toFixed(1)}h`]
  ].map(([label, value]) => `<div class="summary-pill"><span>${label}</span><strong>${value}</strong></div>`).join("");

  renderPayslipChart(target);
  renderSalaryChart(maxSalary);
  renderHoursChart();
  resetChartScroll();
}

function renderPayslipChart(target) {
  const width = 920;
  const height = 136;
  const padding = { top: 18, right: 18, bottom: 24, left: 8 };
  const usableWidth = width - padding.left - padding.right;
  const usableHeight = height - padding.top - padding.bottom;
  const data = taskData.payslip;
  const spacing = data.length > 1 ? usableWidth / (data.length - 1) : 0;
  const points = data.map((item, index) => {
    const x = padding.left + spacing * index;
    const y = padding.top + usableHeight - (item.value / target) * usableHeight;
    return { ...item, label: formatStatDate(item.date), x, y };
  });
  const path = points.map((point, index) => `${index ? "L" : "M"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const targetY = padding.top;

  payslipChart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img">
      <line x1="${padding.left}" y1="${targetY}" x2="${width - padding.right}" y2="${targetY}" stroke="rgba(255,255,255,.34)" stroke-dasharray="5 5"/>
      <path d="${path}" fill="none" stroke="var(--accent-ui)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      ${points.map((point, index) => `
        <circle class="${index === 0 ? "latest-point" : ""}" cx="${point.x}" cy="${point.y}" r="${index === 0 ? 6 : 4.5}" fill="var(--accent-ui)"></circle>
        <text class="chart-value" x="${point.x}" y="${point.y - 9}" text-anchor="middle">${point.value}</text>
      `).join("")}
      ${points.filter((_, index) => index % 2 === 0 || index === points.length - 1).map((point) => `
        <text class="chart-axis-label" x="${point.x}" y="${height - 6}" text-anchor="middle">${point.label}</text>
      `).join("")}
      <text class="chart-axis-label" x="${width - padding.right}" y="${targetY - 6}" text-anchor="end">目标 ${target}</text>
    </svg>
  `;
}

function renderSalaryChart(maxSalary) {
  const data = taskData.salary;
  salaryChart.innerHTML = `<div class="bar-row" style="--count:${data.length}">
    ${data.map((item, index) => {
      const height = Math.max(4, (item.value / maxSalary) * 100);
      return `
        <div class="bar-item ${item.value === maxSalary ? "is-high" : ""} ${index === 0 ? "is-latest" : ""}">
          <span class="bar-value">${shortMoney(item.value)}</span>
          <div class="bar-column" style="height:${height}%"></div>
          <span class="bar-label">${formatStatDate(item.date).replace(" ", "<br>")}</span>
        </div>
      `;
    }).join("")}
  </div>`;
}

function renderHoursChart() {
  const data = taskData.hours;
  const maxHours = Math.max(...data.map((item) => item.value));
  hoursChart.innerHTML = `<div class="hours-row" style="--count:${data.length}">
    ${data.map((item, index) => {
      const height = Math.max(4, (item.value / maxHours) * 100);
      return `
        <div class="hours-item ${index === 0 ? "is-latest" : ""}">
          <span class="hours-value">${trimNumber(item.value)}</span>
          <div class="hours-column" style="height:${height}%"></div>
          <span class="hours-label">${formatStatDate(item.date).replace(" ", "<br>")}</span>
        </div>
      `;
    }).join("")}
  </div>`;
}

function resetChartScroll() {
  requestAnimationFrame(() => {
    [payslipChart, salaryChart, hoursChart].forEach((chart) => {
      chart.scrollLeft = 0;
    });
  });
}

function money(value) {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function shortMoney(value) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${Math.round(value)}`;
}

function trimNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatStatDate(value) {
  const date = parseDate(value);
  return new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "short" }).format(date);
}

function handleStatAction(event) {
  const button = event.target.closest("[data-stat-action]");
  if (!button) return;
  const type = button.dataset.statType;
  const action = button.dataset.statAction;
  if (!["payslip", "salary", "hours"].includes(type)) return;

  if (action === "add") {
    openStatEditor(type);
    return;
  }

  if (action === "target") {
    openTargetEditor();
    return;
  }

  if (action === "delete") {
    deleteLatestStat(type);
  }
}

function openStatEditor(type) {
  editingStatType = type;
  statDateField.hidden = false;
  statDateInput.required = true;
  const labels = {
    payslip: ["添加集签数据", "累计 payslip 数"],
    salary: ["添加税后薪资", "税后薪资"],
    hours: ["添加每周工时", "总工时"]
  };
  const latest = taskData[type][0];
  statDialogTitle.textContent = labels[type][0];
  statValueLabel.textContent = labels[type][1];
  statDateInput.value = dateInputValue(today);
  statValueInput.value = type === "payslip" ? String((latest?.value ?? 0) + 1) : "";
  statValueInput.step = type === "payslip" ? "1" : "0.01";
  openModal(statDialog, statDateInput);
  haptic("light");
}

function openTargetEditor() {
  editingStatType = "target";
  statDialogTitle.textContent = "设置集签目标";
  statValueLabel.textContent = "目标 payslip 数";
  statValueInput.value = String(taskData.target);
  statValueInput.step = "1";
  statDateField.hidden = true;
  statDateInput.required = false;
  openModal(statDialog, statValueInput);
  haptic("light");
}

function closeStatEditor() {
  closeModal(statDialog);
  statDateField.hidden = false;
  statDateInput.required = true;
}

function saveStatEntry(event) {
  event.preventDefault();
  const value = Number(statValueInput.value);
  if (!Number.isFinite(value) || value < 0) {
    statValueInput.reportValidity();
    return;
  }

  if (editingStatType === "target") {
    taskData.target = Math.max(1, Math.round(value));
    persistTaskStats();
    renderTaskStats();
    haptic("save");
    closeStatEditor();
    return;
  }

  const next = { date: statDateInput.value, value };
  taskData[editingStatType] = [
    next,
    ...taskData[editingStatType].filter((item) => item.date !== next.date)
  ].sort((a, b) => b.date.localeCompare(a.date));
  persistTaskStats();
  renderTaskStats();
  haptic("save");
  closeStatEditor();
}

function deleteLatestStat(type) {
  if (taskData[type].length <= 1) return;
  taskData[type] = taskData[type].slice(1);
  persistTaskStats();
  renderTaskStats();
  haptic("delete");
}

function renderColorChoices() {
  colorRow.innerHTML = "";
  colors.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "color-choice";
    button.style.setProperty("--swatch", color);
    button.setAttribute("aria-label", `选择颜色 ${color}`);
    button.addEventListener("click", () => {
      selectedColor = color;
      haptic("light");
      renderColorChoices();
    });
    if (color === selectedColor) button.classList.add("active");
    colorRow.append(button);
  });

  const customLabel = document.createElement("label");
  const customInput = document.createElement("input");
  const customColor = colors.includes(selectedColor) ? "#c8d6e5" : selectedColor;
  customLabel.className = "color-choice custom-color-choice";
  customLabel.style.setProperty("--swatch", customColor);
  customLabel.setAttribute("aria-label", "自定义颜色");
  customLabel.title = "自定义颜色";
  if (!colors.includes(selectedColor)) customLabel.classList.add("active");
  customInput.type = "color";
  customInput.value = customColor;
  customInput.addEventListener("input", () => {
    selectedColor = customInput.value;
    customLabel.style.setProperty("--swatch", selectedColor);
    customLabel.classList.add("active");
    haptic("light");
  });
  customInput.addEventListener("change", renderColorChoices);
  customLabel.append(customInput);
  colorRow.append(customLabel);
}

function openEditor(id = null) {
  haptic("light");
  editingId = id;
  const module = modules.find((item) => item.id === id);
  dialogTitle.textContent = module ? "编辑模块" : "添加模块";
  deleteButton.hidden = !module;
  titleInput.value = module?.title ?? "";
  iconInput.value = module?.icon ?? "📌";
  startInput.value = module?.start ?? dateInputValue(today);
  endInput.value = module?.end ?? dateInputValue(addDays(today, 100));
  pulseInput.checked = module?.pulse ?? true;
  collapsedInput.checked = module?.collapsed ?? false;
  selectedColor = module?.color ?? colors[0];
  renderColorChoices();
  openModal(dialog, titleInput);
}

function closeEditor() {
  closeModal(dialog);
}

function openModal(modal, focusTarget) {
  modal.hidden = false;
  requestAnimationFrame(() => {
    focusTarget?.focus({ preventScroll: true });
    focusTarget?.select?.();
  });
}

function closeModal(modal) {
  modal.hidden = true;
}

function saveCurrentModule(event) {
  event.preventDefault();
  if (parseDate(endInput.value) <= parseDate(startInput.value)) {
    endInput.setCustomValidity("结束日期要晚于开始日期");
    endInput.reportValidity();
    return;
  }
  endInput.setCustomValidity("");

  const next = {
    id: editingId ?? crypto.randomUUID(),
    title: titleInput.value.trim(),
    icon: iconInput.value.trim() || "📌",
    start: startInput.value,
    end: endInput.value,
    color: selectedColor,
    pulse: pulseInput.checked,
    collapsed: collapsedInput.checked
  };

  if (editingId) {
    modules = modules.map((item) => item.id === editingId ? next : item);
  } else {
    modules = [next, ...modules];
  }
  persist();
  haptic("save");
  renderModules();
  closeEditor();
}

function deleteCurrentModule() {
  if (!editingId) return;
  modules = modules.filter((item) => item.id !== editingId);
  persist();
  haptic("delete");
  renderModules();
  closeEditor();
}

function dateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (["127.0.0.1", "localhost"].includes(location.hostname)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}
