const storeKey = "de-progress-modules-v1";
const themeKey = "de-progress-theme-v1";
const colors = ["#78e38f", "#b685ff", "#ff6d6d", "#5ab8ff", "#ffd166", "#45d6bd"];
const themes = ["universe", "love", "rainy", "connect", "wormhole", "turbulence"];
const today = new Date();

const defaults = [
  {
    id: crypto.randomUUID(),
    title: "年度进度",
    icon: "📅",
    start: `${today.getFullYear()}-01-01`,
    end: `${today.getFullYear() + 1}-01-01`,
    color: colors[0],
    pulse: true
  },
  {
    id: crypto.randomUUID(),
    title: "新西兰WHV",
    icon: "🇳🇿",
    start: "2024-12-20",
    end: "2026-03-20",
    color: colors[1],
    pulse: false
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
const deleteButton = document.querySelector("#deleteButton");
const colorRow = document.querySelector("#colorRow");
const themeSelect = document.querySelector("#themeSelect");

let modules = loadModules();
let editingId = null;
let selectedColor = colors[0];
let selectedTheme = loadTheme();

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

setTheme(selectedTheme, false);
renderColorChoices();
renderModules();
registerServiceWorker();

function loadModules() {
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey));
    return Array.isArray(saved) && saved.length ? saved : defaults;
  } catch {
    return defaults;
  }
}

function persist() {
  localStorage.setItem(storeKey, JSON.stringify(modules));
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
  selectedColor = module?.color ?? colors[0];
  renderColorChoices();
  dialog.showModal();
}

function closeEditor() {
  dialog.close();
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
    pulse: pulseInput.checked
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
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}
