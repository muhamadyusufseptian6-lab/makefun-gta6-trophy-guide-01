// store.js — saved trophy progress: localStorage persistence plus
// export-to-file and import-from-file. No network, no cookies.

export const STORAGE_KEY = "gta6-trophy-guide-progress-v1";
export const SETTINGS_KEY = "gta6-trophy-guide-settings-v1";

// Load the set of earned trophy ids from localStorage.
// Returns a Set of numbers; corrupt or missing data yields an empty set.
export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    // Only ids 1–55 can be real trophies; anything else is stale or corrupt.
    return new Set(parsed.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
  } catch (_error) {
    return new Set();
  }
}

// Persist the earned set. Returns true when the write worked.
export function saveEarned(earnedSet) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earnedSet].sort((a, b) => a - b)));
    return true;
  } catch (_error) {
    return false;
  }
}

// Load UI settings (spoiler mode, hide-earned) from localStorage.
export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { spoiler: false, hideEarned: false };
    const parsed = JSON.parse(raw);
    return {
      spoiler: parsed.spoiler === true,
      hideEarned: parsed.hideEarned === true,
    };
  } catch (_error) {
    return { spoiler: false, hideEarned: false };
  }
}

// Persist UI settings. Returns true when the write worked.
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (_error) {
    return false;
  }
}

// Build the export document for a download: versioned, so imports can
// be checked before they touch the saved state.
export function buildExportDocument(earnedSet, settings) {
  return {
    app: "gta6-trophy-guide-01",
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earnedSet].sort((a, b) => a - b),
    settings: { spoiler: !!settings.spoiler, hideEarned: !!settings.hideEarned },
  };
}

// Download the export document as a JSON file (browser-side only).
export function downloadExport(earnedSet, settings) {
  const doc = buildExportDocument(earnedSet, settings);
  const text = JSON.stringify(doc, null, 2);
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "gta6-trophy-progress.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return doc.earned.length;
}

// Parse an imported file's text. Returns { earned, settings } on success,
// or { error } with a human-readable reason on failure. Never throws.
export function parseImportDocument(text, knownIds) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (_error) {
    return { error: "That file is not valid JSON." };
  }
  const earnedList = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(earnedList)) {
    return { error: "That file has no earned-trophy list in it." };
  }
  const known = new Set(knownIds);
  const earned = new Set();
  for (const id of earnedList) {
    if (Number.isInteger(id) && known.has(id)) earned.add(id);
  }
  const settings = {
    spoiler: parsed && parsed.settings ? parsed.settings.spoiler === true : false,
    hideEarned: parsed && parsed.settings ? parsed.settings.hideEarned === true : false,
  };
  return { earned, settings };
}
