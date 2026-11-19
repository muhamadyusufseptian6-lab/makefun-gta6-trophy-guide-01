// app.js — boot and wiring for the Leonida Platinum Tracker.
// Classic script (no ES modules): index.html loads the other scripts
// with plain <script> tags first, so their top-level declarations are
// globals this file can use directly. The trophy data arrives as
// window.TROPHY_DATA from data/trophies-data.js — a file under app/,
// loaded by a plain script tag, never fetched over the network — then
// this file wires the checklist, the filters, the spoiler setting,
// the views, and progress export/import.

// Trophy data, loaded by data/trophies-data.js before this script.
// Fail loudly (instead of rendering an empty page) if it did not load.
const TROPHY_DATA = window.TROPHY_DATA;
if (!Array.isArray(TROPHY_DATA)) {
  throw new Error(
    "GTA 6 Trophy Guide: trophy data failed to load — window.TROPHY_DATA is missing. " +
    "Check that data/trophies-data.js is present and loaded before app.js.",
  );
}

const state = {
  trophies: [],
  trophiesById: new Map(),
  earned: loadEarned(),
  settings: loadSettings(),
  kind: "all",
  grade: "all",
  query: "",
  view: "checklist",
  selectedId: null,
};

const $ = (id) => document.getElementById(id);

const trophyListEl = $("trophyList");
const missableListEl = $("missableList");
const roadmapEl = $("roadmapList");
const resultLineEl = $("resultLine");
const detailCard = $("detailCard");
const detailEmpty = $("detailEmpty");

// Refresh every visible part after any state change.
function renderAll() {
  renderHeader();
  renderCurrentView();
  renderSelectedDetail();
}

function renderHeader() {
  const summary = progressSummary(state.trophies, state.earned);
  $("earnedCount").textContent = String(summary.earnedCount);
  $("progressFill").style.width = summary.percent + "%";
  $("progressBar").setAttribute("aria-valuenow", String(summary.earnedCount));
  $("progressNote").textContent =
    summary.percent + "% to the platinum — " + summary.earnedCount + " of " + summary.total + " trophies";
  const counts = countByGrade(state.trophies, state.earned);
  const labels = { platinum: "Platinum", gold: "Gold", silver: "Silver", bronze: "Bronze" };
  const list = $("gradeCounts");
  list.innerHTML = "";
  for (const grade of ["platinum", "gold", "silver", "bronze"]) {
    const [got, total] = counts[grade];
    const item = document.createElement("li");
    const medal = document.createElement("span");
    medal.className = "medal medal-" + grade;
    item.appendChild(medal);
    item.appendChild(document.createTextNode(labels[grade] + " " + got + "/" + total));
    list.appendChild(item);
  }
  const missableTotal = state.trophies.filter((t) => t.missable).length;
  $("missableCount").textContent = String(missableTotal);
}

function currentFilterState() {
  return {
    kind: state.kind,
    grade: state.grade,
    query: state.query,
    hideEarned: state.settings.hideEarned,
  };
}

function renderCurrentView() {
  const filters = currentFilterState();
  if (state.view === "checklist") {
    const shown = filterTrophies(state.trophies, filters, state.earned);
    renderTrophyList(trophyListEl, shown, state.earned, state.settings, toggleEarned, selectTrophy, state.selectedId);
    resultLineEl.textContent =
      "Showing " + shown.length + " of " + state.trophies.length + " trophies" +
      (state.earned.size > 0 ? " — " + state.earned.size + " earned." : ".");
  } else if (state.view === "missables") {
    const missable = state.trophies.filter((t) => t.missable);
    renderTrophyList(missableListEl, missable, state.earned, state.settings, toggleEarned, selectTrophy, state.selectedId);
    resultLineEl.textContent = missable.length + " missable trophies — do them when they come up.";
  } else {
    renderRoadmap(roadmapEl, state.trophiesById, state.earned);
    resultLineEl.textContent = "Six stages from the first mission to the platinum.";
  }
}

function renderSelectedDetail() {
  const trophy = state.selectedId === null ? null : state.trophiesById.get(state.selectedId) || null;
  renderDetail(detailCard, detailEmpty, trophy, state.earned, state.settings, toggleEarned);
}

function toggleEarned(id, earnedNow) {
  if (earnedNow) state.earned.add(id);
  else state.earned.delete(id);
  saveEarned(state.earned);
  renderAll();
}

function selectTrophy(id) {
  state.selectedId = id;
  renderCurrentView();
  renderSelectedDetail();
  // Keep the detail pane in view on small screens, where it sits below
  // the checklist; on wide screens it is already beside the list.
  detailCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setView(view) {
  state.view = view;
  $("checklistView").hidden = view !== "checklist";
  $("roadmapView").hidden = view !== "roadmap";
  $("missablesView").hidden = view !== "missables";
  $("toolbar").style.display = view === "checklist" ? "" : "none";
  for (const tab of document.querySelectorAll(".tab")) {
    tab.classList.toggle("active", tab.dataset.view === view);
  }
  renderCurrentView();
}

function setStatus(message) {
  $("saveStatus").textContent = message;
}

function wireToolbar() {
  $("searchInput").addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderCurrentView();
  });
  for (const btn of document.querySelectorAll(".kind-btn")) {
    btn.addEventListener("click", () => {
      state.kind = btn.dataset.kind;
      for (const other of document.querySelectorAll(".kind-btn")) {
        other.classList.toggle("active", other === btn);
      }
      renderCurrentView();
    });
  }
  $("gradeSelect").addEventListener("change", (event) => {
    state.grade = event.target.value;
    renderCurrentView();
  });
  const spoilerToggle = $("spoilerToggle");
  spoilerToggle.checked = state.settings.spoiler;
  spoilerToggle.addEventListener("change", () => {
    state.settings.spoiler = spoilerToggle.checked;
    saveSettings(state.settings);
    renderAll();
  });
  const hideEarnedToggle = $("hideEarnedToggle");
  hideEarnedToggle.checked = state.settings.hideEarned;
  hideEarnedToggle.addEventListener("change", () => {
    state.settings.hideEarned = hideEarnedToggle.checked;
    saveSettings(state.settings);
    renderCurrentView();
  });
}

function wireTabs() {
  for (const tab of document.querySelectorAll(".tab")) {
    tab.addEventListener("click", () => setView(tab.dataset.view));
  }
}

function wireSaveBar() {
  $("exportBtn").addEventListener("click", () => {
    const count = downloadExport(state.earned, state.settings);
    setStatus("Exported " + count + " earned trophies to gta6-trophy-progress.json.");
  });
  $("importBtn").addEventListener("click", () => $("importFile").click());
  $("importFile").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = parseImportDocument(
        String(reader.result),
        state.trophies.map((t) => t.id),
      );
      if (result.error) {
        setStatus("Import failed: " + result.error);
        return;
      }
      state.earned = result.earned;
      state.settings = { ...state.settings, ...result.settings };
      saveEarned(state.earned);
      saveSettings(state.settings);
      $("spoilerToggle").checked = state.settings.spoiler;
      $("hideEarnedToggle").checked = state.settings.hideEarned;
      renderAll();
      setStatus("Imported " + state.earned.size + " earned trophies.");
    };
    reader.readAsText(file);
    event.target.value = "";
  });
  $("resetBtn").addEventListener("click", () => {
    if (!window.confirm("Reset all progress? This clears every earned trophy.")) return;
    state.earned = new Set();
    state.selectedId = null;
    saveEarned(state.earned);
    renderAll();
    setStatus("Progress reset.");
  });
}

// Boot: read the trophy data from window.TROPHY_DATA, then render.
// No fetch, no network: the data is one of the app's own files.
function boot() {
  const data = TROPHY_DATA;
  const list = Array.isArray(data) ? data : data.trophies;
  state.trophies = Array.isArray(list) ? list : [];
  state.trophiesById = new Map(state.trophies.map((t) => [t.id, t]));
  wireToolbar();
  wireTabs();
  wireSaveBar();
  renderAll();
}

boot();
