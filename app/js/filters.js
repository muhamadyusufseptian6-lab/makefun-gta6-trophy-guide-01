// filters.js — the checklist filters: kind, grade, search text, and the
// spoiler rule that hides story trophies until they are earned.

// Kinds offered by the toolbar. "missable" is a flag, not a kind field:
// it matches any trophy whose missable flag is true. There is no "online"
// kind: the official 55-trophy list has no online trophies, so no online
// filter is shown rather than an empty one.
export const KINDS = ["all", "story", "missable", "collectible", "activity"];

export const GRADE_ORDER = ["platinum", "gold", "silver", "bronze"];

// Does one trophy pass the active filters? `state` carries
// { kind, grade, query, hideEarned } and `earned` is the earned Set.
export function trophyMatchesFilters(trophy, state, earned) {
  if (state.kind === "story" && trophy.kind !== "story") return false;
  if (state.kind === "missable" && trophy.missable !== true) return false;
  if (state.kind === "collectible" && trophy.kind !== "collectible") return false;
  if (state.kind === "activity" && trophy.kind !== "activity") return false;
  if (state.grade !== "all" && trophy.grade !== state.grade) return false;
  if (state.hideEarned && earned.has(trophy.id)) return false;
  if (state.query) {
    const haystack = (trophy.name + " " + trophy.description).toLowerCase();
    if (!haystack.includes(state.query)) return false;
  }
  return true;
}

// Apply the filters to the whole list, keeping official id order.
export function filterTrophies(trophies, state, earned) {
  return trophies.filter((t) => trophyMatchesFilters(t, state, earned));
}

// The spoiler rule: a story trophy whose name and description stay hidden
// until it is earned. Only story-kind trophies are ever masked; the
// platinum, collectibles and activities are never spoilers.
export function isSpoilerMasked(trophy, settings, earned) {
  return settings.spoiler === true && trophy.kind === "story" && !earned.has(trophy.id);
}

// Count earned trophies per grade, for the header counters.
export function countByGrade(trophies, earned) {
  const counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const trophy of trophies) {
    const slot = counts[trophy.grade];
    if (!slot) continue;
    slot[1] += 1;
    if (earned.has(trophy.id)) slot[0] += 1;
  }
  return counts;
}

// Overall progress: earned count, total, and whole percent.
export function progressSummary(trophies, earned) {
  const total = trophies.length;
  const earnedCount = trophies.reduce((n, t) => n + (earned.has(t.id) ? 1 : 0), 0);
  const percent = total === 0 ? 0 : Math.round((earnedCount / total) * 100);
  return { earnedCount, total, percent };
}
