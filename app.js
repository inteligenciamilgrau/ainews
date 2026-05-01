const DATA_URL = "data/models.json";
const VIEW_PREFS_KEY = "llmTimelineViewPreferences";
const VALID_VIEWS = new Set(["timeline", "years", "table", "sources"]);
const VALID_LANE_MODES = new Set(["company", "all"]);
const VALID_TABLE_DATE_ORDERS = new Set(["desc", "asc"]);
const AI_CATEGORIES = ["LLMs", "Imagem", "Video", "Audio/Transcricao", "Musica"];
const VALID_AI_CATEGORIES = new Set(AI_CATEGORIES);

const state = {
  metadata: {},
  canonicalModels: [],
  filters: {
    query: "",
    aiCategory: "LLMs",
    company: "all",
    type: "all",
    family: "all",
    year: "all",
    yearStart: "all",
    yearEnd: "all"
  },
  tableDateOrder: "desc",
  view: "timeline",
  laneMode: "company",
  selectedId: null
};

const companyColors = {
  OpenAI: "#0f766e",
  Anthropic: "#a16207",
  Google: "#2563eb",
  xAI: "#111827",
  "Moonshot AI": "#7c3aed",
  "Z.AI": "#dc2626",
  Xiaomi: "#ea580c",
  DeepSeek: "#0891b2",
  Suno: "#be185d",
  "Black Forest Labs": "#166534",
  ByteDance: "#0f172a",
  Kuaishou: "#f97316",
  Alibaba: "#c2410c",
  MiniMax: "#7c2d12"
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheElements();
  loadViewPreferences();
  syncViewControls();
  bindEvents();

  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    state.metadata = payload.metadata || {};
    state.canonicalModels = normalizeModels(payload.models || []);
    state.selectedId = allModels()[0]?.id || null;
    renderLastUpdated();
    populateFilters();
    render();
  } catch (error) {
    document.querySelector("main").innerHTML = `
      <section class="error-panel">
        <h2>Falha ao carregar a base</h2>
        <p>${escapeHtml(error.message)}</p>
        <p>Verifique se <code>${DATA_URL}</code> foi publicado no caminho correto.</p>
      </section>
    `;
  }
}

function cacheElements() {
  Object.assign(els, {
    searchInput: document.getElementById("searchInput"),
    aiCategoryFilter: document.getElementById("aiCategoryFilter"),
    companyFilter: document.getElementById("companyFilter"),
    typeFilter: document.getElementById("typeFilter"),
    familyFilter: document.getElementById("familyFilter"),
    yearFilter: document.getElementById("yearFilter"),
    yearStartFilter: document.getElementById("yearStartFilter"),
    yearEndFilter: document.getElementById("yearEndFilter"),
    tableDateOrder: document.getElementById("tableDateOrder"),
    metricModels: document.getElementById("metricModels"),
    metricCompanies: document.getElementById("metricCompanies"),
    metricYears: document.getElementById("metricYears"),
    metricSources: document.getElementById("metricSources"),
    timeline: document.getElementById("timeline"),
    timelineScale: document.getElementById("timelineScale"),
    modelDetails: document.getElementById("modelDetails"),
    yearChart: document.getElementById("yearChart"),
    modelsTable: document.getElementById("modelsTable"),
    sourcesList: document.getElementById("sourcesList")
  });
}

function bindEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.filters.query = event.target.value.trim().toLowerCase();
    saveViewPreferences();
    render();
  });

  for (const [key, element] of [
    ["aiCategory", els.aiCategoryFilter],
    ["company", els.companyFilter],
    ["type", els.typeFilter],
    ["family", els.familyFilter],
    ["year", els.yearFilter],
    ["yearStart", els.yearStartFilter],
    ["yearEnd", els.yearEndFilter]
  ]) {
    element.addEventListener("change", (event) => {
      state.filters[key] = event.target.value;
      if (key === "aiCategory") {
        state.filters.type = "all";
        syncFilterControls();
      }
      saveViewPreferences();
      render();
    });
  }

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      syncViewControls();
      saveViewPreferences();
      render();
    });
  });

  document.querySelectorAll("[data-lane-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.laneMode = button.dataset.laneMode;
      syncViewControls();
      saveViewPreferences();
      renderTimeline(filteredModels());
    });
  });

  els.tableDateOrder.addEventListener("change", (event) => {
    state.tableDateOrder = VALID_TABLE_DATE_ORDERS.has(event.target.value) ? event.target.value : "desc";
    saveViewPreferences();
    renderTable(filteredModels());
  });
}

function renderLastUpdated() {
  const element = document.getElementById("lastUpdated");
  if (!element) return;

  const correction = state.metadata.last_correction;
  const date = correction?.date || state.metadata.updated_at;
  const description = correction?.description_pt;
  const formattedDate = date ? formatDate(date) : "data nao informada";
  element.textContent = description
    ? `Ultima atualizacao: ${formattedDate} - ${description}`
    : `Ultima atualizacao: ${formattedDate}`;
}

function normalizeModels(models) {
  return models
    .filter(Boolean)
    .map((model) => ({
      ...model,
      sources: normalizeSources(model),
      ai_category: normalizeAiCategories(model.ai_category),
      model_type: Array.isArray(model.model_type) ? model.model_type : String(model.model_type || "").split(",").map((item) => item.trim()).filter(Boolean),
      year: Number(String(model.release_date || "").slice(0, 4)),
      timestamp: Date.parse(`${model.release_date}T00:00:00`)
    }))
    .sort((a, b) => a.timestamp - b.timestamp || a.company.localeCompare(b.company) || a.model.localeCompare(b.model));
}

function normalizeAiCategories(value) {
  const rawCategories = Array.isArray(value) ? value : value ? [value] : ["LLMs"];
  const categories = rawCategories
    .map((category) => String(category).trim())
    .filter((category) => VALID_AI_CATEGORIES.has(category));

  return categories.length ? categories : ["LLMs"];
}

function allModels() {
  return state.canonicalModels;
}

function normalizeSources(model) {
  const rawSources = Array.isArray(model.sources)
    ? model.sources
    : model.source
      ? [model.source]
      : [];

  return rawSources
    .map((source) => ({
      source,
      url: normalizeHttpsUrl(source?.url)
    }))
    .filter(({ source, url }) => source && url)
    .map(({ source, url }) => ({
      title: source.title || "Fonte oficial",
      url,
      publisher: source.publisher || model.company,
      date_basis: source.date_basis || ""
    }));
}

function normalizeHttpsUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function populateFilters() {
  const models = allModels();
  fillSelect(els.aiCategoryFilter, ["LLMs", "all", ...AI_CATEGORIES.filter((category) => category !== "LLMs")], "Todos");
  fillSelect(els.companyFilter, ["all", ...unique(models.map((model) => model.company))], "Todas");
  fillSelect(els.typeFilter, ["all", ...unique(models.flatMap((model) => model.model_type))], "Todos");
  fillSelect(els.familyFilter, ["all", ...unique(models.map((model) => model.family))], "Todas");

  const years = unique(models.map((model) => model.year)).sort((a, b) => a - b);
  fillSelect(els.yearFilter, ["all", ...years], "Todos");
  fillSelect(els.yearStartFilter, ["all", ...years], "Inicio");
  fillSelect(els.yearEndFilter, ["all", ...years], "Fim");
  syncFilterControls();
  saveViewPreferences();
}

function fillSelect(element, values, allLabel) {
  element.innerHTML = values.map((value) => {
    const label = value === "all" ? allLabel : value;
    return `<option value="${escapeHtml(String(value))}">${escapeHtml(String(label))}</option>`;
  }).join("");
}

function syncFilterControls() {
  els.searchInput.value = state.filters.query;
  state.filters.aiCategory = optionExists(els.aiCategoryFilter, state.filters.aiCategory) ? state.filters.aiCategory : "LLMs";
  state.filters.company = optionExists(els.companyFilter, state.filters.company) ? state.filters.company : "all";
  state.filters.type = optionExists(els.typeFilter, state.filters.type) ? state.filters.type : "all";
  state.filters.family = optionExists(els.familyFilter, state.filters.family) ? state.filters.family : "all";
  state.filters.year = optionExists(els.yearFilter, state.filters.year) ? state.filters.year : "all";
  state.filters.yearStart = optionExists(els.yearStartFilter, state.filters.yearStart) ? state.filters.yearStart : "all";
  state.filters.yearEnd = optionExists(els.yearEndFilter, state.filters.yearEnd) ? state.filters.yearEnd : "all";

  els.aiCategoryFilter.value = state.filters.aiCategory;
  els.companyFilter.value = state.filters.company;
  els.typeFilter.value = state.filters.type;
  els.familyFilter.value = state.filters.family;
  els.yearFilter.value = state.filters.year;
  els.yearStartFilter.value = state.filters.yearStart;
  els.yearEndFilter.value = state.filters.yearEnd;
  els.tableDateOrder.value = VALID_TABLE_DATE_ORDERS.has(state.tableDateOrder) ? state.tableDateOrder : "desc";
}

function syncViewControls() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.view);
  });
  document.querySelectorAll("[data-lane-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.laneMode === state.laneMode);
  });
}

function loadViewPreferences() {
  try {
    const prefs = JSON.parse(localStorage.getItem(VIEW_PREFS_KEY) || "{}");
    if (VALID_VIEWS.has(prefs.view)) state.view = prefs.view;
    if (VALID_LANE_MODES.has(prefs.laneMode)) state.laneMode = prefs.laneMode;
    if (VALID_TABLE_DATE_ORDERS.has(prefs.tableDateOrder)) state.tableDateOrder = prefs.tableDateOrder;
    if (prefs.filters && typeof prefs.filters === "object") {
      state.filters = {
        ...state.filters,
        ...Object.fromEntries(
          Object.entries(prefs.filters)
            .filter(([key, value]) => key in state.filters && typeof value === "string")
        )
      };
    }
  } catch {
    localStorage.removeItem(VIEW_PREFS_KEY);
  }
}

function saveViewPreferences() {
  try {
    localStorage.setItem(VIEW_PREFS_KEY, JSON.stringify({
      view: state.view,
      laneMode: state.laneMode,
      tableDateOrder: state.tableDateOrder,
      filters: state.filters
    }));
  } catch {
    // Prefer keeping the app usable when browser storage is unavailable.
  }
}

function optionExists(select, value) {
  return [...select.options].some((option) => option.value === String(value));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
}

function filteredModels() {
  return allModels().filter((model) => {
    const queryTarget = [
      model.model,
      model.company,
      model.family,
      model.release_stage,
      model.description_pt,
      ...(model.ai_category || []),
      ...(model.model_type || [])
    ].join(" ").toLowerCase();

    if (state.filters.query && !queryTarget.includes(state.filters.query)) return false;
    if (state.filters.aiCategory !== "all" && !model.ai_category.includes(state.filters.aiCategory)) return false;
    if (state.filters.company !== "all" && model.company !== state.filters.company) return false;
    if (state.filters.type !== "all" && !model.model_type.includes(state.filters.type)) return false;
    if (state.filters.family !== "all" && model.family !== state.filters.family) return false;
    if (state.filters.year !== "all" && model.year !== Number(state.filters.year)) return false;
    if (state.filters.yearStart !== "all" && model.year < Number(state.filters.yearStart)) return false;
    if (state.filters.yearEnd !== "all" && model.year > Number(state.filters.yearEnd)) return false;
    return true;
  });
}

function render() {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active-view", view.id === `${state.view}View`);
  });

  const models = filteredModels();
  if (!models.some((model) => model.id === state.selectedId)) {
    state.selectedId = models[0]?.id || null;
  }

  renderMetrics(models);
  renderTimeline(models);
  renderYearChart(models);
  renderTable(models);
  renderSources(models);
  renderDetails(models.find((model) => model.id === state.selectedId));
}

function renderMetrics(models) {
  const years = models.map((model) => model.year).filter(Boolean);
  els.metricModels.textContent = models.length;
  els.metricCompanies.textContent = unique(models.map((model) => model.company)).length;
  els.metricYears.textContent = years.length ? `${Math.min(...years)}-${Math.max(...years)}` : "-";
  els.metricSources.textContent = models.reduce((total, model) => total + model.sources.length, 0);
}

function renderTimeline(models) {
  if (!models.length) {
    els.timelineScale.innerHTML = "";
    els.timeline.innerHTML = `<div class="empty-state">Nenhum modelo no filtro atual.</div>`;
    return;
  }

  const min = Math.min(...models.map((model) => model.timestamp));
  const max = Math.max(...models.map((model) => model.timestamp));
  const span = Math.max(max - min, 1);
  const years = buildScaleYears(models);
  els.timelineScale.innerHTML = years.map((year) => {
    const left = ((Date.parse(`${year}-01-01T00:00:00`) - min) / span) * 100;
    return `<span style="left:clamp(24px, ${clamp(left, 0, 100)}%, calc(100% - 24px))">${year}</span>`;
  }).join("");

  const laneGroups = state.laneMode === "all"
    ? [["Todos", models]]
    : unique(models.map((model) => model.company)).map((company) => [company, models.filter((model) => model.company === company)]);

  els.timeline.innerHTML = laneGroups.map(([label, laneModels]) => {
    const events = laneModels.map((model, index) => {
      const left = ((model.timestamp - min) / span) * 100;
      const color = colorFor(model.company);
      const stack = index % 4;
      return `
        <button class="timeline-event ${model.id === state.selectedId ? "selected" : ""}"
          type="button"
          data-id="${escapeHtml(model.id)}"
          style="left:clamp(82px, ${clamp(left, 0, 100)}%, calc(100% - 82px)); --event-color:${color}; --stack:${stack};"
          title="${escapeHtml(model.company)} - ${escapeHtml(model.model)}">
          <span>${formatDate(model.release_date)}</span>
          <strong>${escapeHtml(model.model)}</strong>
        </button>
      `;
    }).join("");

    return `
      <div class="timeline-lane">
        <div class="lane-label">${escapeHtml(label)}</div>
        <div class="lane-track">${events}</div>
      </div>
    `;
  }).join("");

  els.timeline.querySelectorAll(".timeline-event").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedId = button.dataset.id;
      render();
    });
  });
}

function buildScaleYears(models) {
  const minYear = Math.min(...models.map((model) => model.year));
  const maxYear = Math.max(...models.map((model) => model.year));
  const years = [];
  for (let year = minYear; year <= maxYear; year += 1) years.push(year);
  return years;
}

function renderDetails(model) {
  if (!model) {
    els.modelDetails.innerHTML = `<div class="empty-state">Selecione um modelo.</div>`;
    return;
  }

  els.modelDetails.innerHTML = `
    <div class="detail-heading">
      <span class="dot" style="background:${colorFor(model.company)}"></span>
      <div>
        <p>${escapeHtml(model.company)} - ${escapeHtml(model.family)}</p>
        <h2>${escapeHtml(model.model)}</h2>
      </div>
    </div>
    <dl>
      <div><dt>Data</dt><dd>${formatDate(model.release_date)}</dd></div>
      <div><dt>Estagio</dt><dd>${escapeHtml(model.release_stage)}</dd></div>
      <div><dt>Tipo de IA</dt><dd>${model.ai_category.map(categoryPill).join("")}</dd></div>
      <div><dt>Tipos</dt><dd>${model.model_type.map(typePill).join("")}</dd></div>
      <div><dt>Confianca</dt><dd>${escapeHtml(model.confidence || "nao informada")}</dd></div>
    </dl>
    <p>${escapeHtml(model.description_pt || "")}</p>
    ${renderSourceBasis(model)}
    ${renderSourceLinks(model, "primary")}
  `;
}

function renderYearChart(models) {
  if (!models.length) {
    els.yearChart.innerHTML = `<div class="empty-state">Nenhum modelo no filtro atual.</div>`;
    return;
  }

  const byYear = new Map();
  models.forEach((model) => {
    if (!byYear.has(model.year)) byYear.set(model.year, []);
    byYear.get(model.year).push(model);
  });

  const maxCount = Math.max(...[...byYear.values()].map((items) => items.length));
  els.yearChart.innerHTML = [...byYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, yearModels]) => {
      const byCompany = unique(yearModels.map((model) => model.company)).map((company) => {
        const count = yearModels.filter((model) => model.company === company).length;
        const width = (count / yearModels.length) * 100;
        return `<span title="${escapeHtml(company)}: ${count}" style="width:${width}%; background:${colorFor(company)}"></span>`;
      }).join("");
      return `
        <div class="year-row">
          <div class="year-label">${year}</div>
          <div class="year-bar-wrap">
            <div class="year-bar" style="width:${Math.max((yearModels.length / maxCount) * 100, 6)}%">
              ${byCompany}
            </div>
          </div>
          <div class="year-count">${yearModels.length}</div>
          <div class="year-models">${yearModels.map((model) => escapeHtml(model.model)).join(", ")}</div>
        </div>
      `;
    }).join("");
}

function renderTable(models) {
  const sortedModels = sortModelsForTable(models);
  els.modelsTable.innerHTML = sortedModels.map((model) => `
    <tr>
      <td>${formatDate(model.release_date)}</td>
      <td><span class="company-chip" style="--chip-color:${colorFor(model.company)}">${escapeHtml(model.company)}</span></td>
      <td><strong>${escapeHtml(model.model)}</strong></td>
      <td>${escapeHtml(model.family)}</td>
      <td>${model.ai_category.map(categoryPill).join("")}</td>
      <td>${model.model_type.map(typePill).join("")}</td>
      <td>${escapeHtml(model.description_pt || "")}</td>
      <td>${renderSourceLinks(model, "compact")}</td>
    </tr>
  `).join("");
}

function sortModelsForTable(models) {
  const direction = state.tableDateOrder === "asc" ? 1 : -1;
  return [...models].sort((a, b) => (
    ((a.timestamp - b.timestamp) * direction)
    || a.company.localeCompare(b.company)
    || a.model.localeCompare(b.model)
  ));
}

function renderSources(models) {
  const groups = unique(models.map((model) => model.company)).map((company) => {
    const items = models.filter((model) => model.company === company);
    return `
      <section class="source-group">
        <h2><span class="dot" style="background:${colorFor(company)}"></span>${escapeHtml(company)}</h2>
        <ul>
          ${items.map((model) => `
            <li>
              <time>${formatDate(model.release_date)}</time>
              <strong>${escapeHtml(model.model)}</strong>
              ${renderSourceLinks(model, "compact")}
              ${renderSourceBasis(model)}
            </li>
          `).join("")}
        </ul>
      </section>
    `;
  }).join("");
  els.sourcesList.innerHTML = groups || `<div class="empty-state">Nenhuma fonte no filtro atual.</div>`;
}

function renderSourceLinks(model, variant = "compact") {
  const sources = model.sources || [];
  if (!sources.length) return `<span class="muted-text">Sem fonte</span>`;

  const className = variant === "primary" ? "source-links-list primary" : "source-links-list compact";
  return `
    <div class="${className}">
      ${sources.map((source) => `
        <a class="${variant === "primary" ? "primary-link" : ""}"
          href="${escapeAttribute(source.url)}"
          target="_blank"
          rel="noreferrer">${escapeHtml(source.title)}</a>
      `).join("")}
    </div>
  `;
}

function renderSourceBasis(model) {
  const sources = (model.sources || []).filter((source) => source.date_basis);
  if (!sources.length) return "";
  if (sources.length === 1) return `<p class="date-basis">${escapeHtml(sources[0].date_basis)}</p>`;

  return `
    <ul class="source-basis-list">
      ${sources.map((source) => `
        <li><strong>${escapeHtml(source.title)}:</strong> ${escapeHtml(source.date_basis)}</li>
      `).join("")}
    </ul>
  `;
}

function colorFor(company) {
  return companyColors[company] || "#475569";
}

function typePill(type) {
  return `<span class="type-pill">${escapeHtml(type)}</span>`;
}

function categoryPill(category) {
  return `<span class="type-pill category-pill">${escapeHtml(category)}</span>`;
}

function formatDate(value) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
