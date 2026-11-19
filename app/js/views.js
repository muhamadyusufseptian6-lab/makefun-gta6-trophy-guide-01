// views.js — rendering: the checklist rows, the guide detail pane, the
// roadmap stages and the missable-trophy list. All text from the data
// file is inserted with textContent, never as HTML.

import { isSpoilerMasked } from "./filters.js";
import { ROADMAP_STAGES, stageTrophies, stageProgress } from "./roadmap.js";

const GRADE_LABELS = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

const KIND_LABELS = {
  platinum: "Platinum",
  story: "Story",
  collectible: "Collectible",
  activity: "Activity",
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// One checklist row: checkbox, medal, name, description, tags, guide button.
export function renderTrophyRow(trophy, earned, settings, onToggle, onSelect, selectedId) {
  const masked = isSpoilerMasked(trophy, settings, earned);
  const isEarned = earned.has(trophy.id);

  const row = el("li", "trophy-row" + (isEarned ? " earned" : "") + (masked ? " spoiler-hidden" : ""));
  row.dataset.trophyId = String(trophy.id);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = isEarned;
  checkbox.setAttribute("aria-label", "Mark " + trophy.name + " as earned");
  checkbox.addEventListener("change", () => onToggle(trophy.id, checkbox.checked));
  row.appendChild(checkbox);

  const medal = el("span", "medal medal-" + trophy.grade);
  medal.title = GRADE_LABELS[trophy.grade] || trophy.grade;
  row.appendChild(medal);

  const main = el("div", "trophy-main");
  const name = el("h3", null, masked ? "Hidden story trophy" : trophy.name);
  main.appendChild(name);
  const desc = el(
    "p",
    null,
    masked ? "Earn this story trophy to reveal its name and description." : trophy.description,
  );
  main.appendChild(desc);

  const tags = el("div", "tag-row");
  tags.appendChild(el("span", "tag", GRADE_LABELS[trophy.grade] || trophy.grade));
  if (trophy.kind && KIND_LABELS[trophy.kind]) {
    tags.appendChild(el("span", "tag tag-kind-" + trophy.kind, KIND_LABELS[trophy.kind]));
  }
  if (trophy.missable) tags.appendChild(el("span", "tag tag-missable", "Missable"));
  if (trophy.hidden) tags.appendChild(el("span", "tag tag-hidden", "Hidden on PSN"));
  if (typeof trophy.psn_count === "number") {
    tags.appendChild(el("span", "tag", "Target: " + trophy.psn_count.toLocaleString("en-US")));
  }
  main.appendChild(tags);
  row.appendChild(main);

  const guideBtn = el("button", "guide-btn" + (selectedId === trophy.id ? " selected" : ""), "Guide");
  guideBtn.type = "button";
  guideBtn.setAttribute("aria-label", "Read the guide for " + trophy.name);
  guideBtn.setAttribute("aria-pressed", selectedId === trophy.id ? "true" : "false");
  guideBtn.addEventListener("click", () => onSelect(trophy.id));
  row.appendChild(guideBtn);

  return row;
}

// Render a list of trophies into a <ul>. Shows an empty note when none match.
export function renderTrophyList(listEl, trophies, earned, settings, onToggle, onSelect, selectedId) {
  listEl.innerHTML = "";
  if (trophies.length === 0) {
    const note = el("li", "empty-note", "No trophies match these filters. Try clearing the search or a filter.");
    listEl.appendChild(note);
    return;
  }
  for (const trophy of trophies) {
    listEl.appendChild(renderTrophyRow(trophy, earned, settings, onToggle, onSelect, selectedId));
  }
}

// The detail pane: official facts, guide text and cited sources.
export function renderDetail(detailCard, detailEmpty, trophy, earned, settings, onToggle) {
  if (!trophy) {
    detailCard.hidden = true;
    detailEmpty.hidden = false;
    return;
  }
  const masked = isSpoilerMasked(trophy, settings, earned);
  detailEmpty.hidden = true;
  detailCard.hidden = false;

  const medal = detailCard.querySelector("#detailMedal");
  medal.className = "medal medal-" + trophy.grade;
  detailCard.querySelector("#detailGrade").textContent =
    (GRADE_LABELS[trophy.grade] || trophy.grade) + " trophy";
  detailCard.querySelector("#detailName").textContent = masked ? "Hidden story trophy" : trophy.name;
  detailCard.querySelector("#detailDesc").textContent = masked
    ? "Earn this story trophy to reveal its official description."
    : trophy.description;
  detailCard.querySelector("#detailKind").textContent = KIND_LABELS[trophy.kind] || trophy.kind || "—";
  detailCard.querySelector("#detailStage").textContent =
    trophy.roadmap_stage ? "Stage " + trophy.roadmap_stage : "—";
  detailCard.querySelector("#detailCount").textContent =
    typeof trophy.psn_count === "number" ? trophy.psn_count.toLocaleString("en-US") : "No PSN count";
  detailCard.querySelector("#detailHidden").textContent = trophy.hidden ? "Yes — hidden until earned" : "No";
  detailCard.querySelector("#detailMissable").hidden = !trophy.missable;
  detailCard.querySelector("#detailGuide").textContent = masked
    ? "This guide stays hidden with the trophy — earn it first."
    : trophy.guide;

  const sourcesEl = detailCard.querySelector("#detailSources");
  sourcesEl.innerHTML = "";
  const sources = Array.isArray(trophy.sources) && trophy.sources.length > 0
    ? trophy.sources
    : ["Exophase — official trophy list: https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/"];
  for (const source of sources) {
    const item = el("li");
    const urlMatch = String(source).match(/https?:\/\/\S+/);
    if (urlMatch) {
      const before = String(source).slice(0, urlMatch.index);
      if (before) item.appendChild(document.createTextNode(before));
      const link = el("a", null, urlMatch[0]);
      link.href = urlMatch[0];
      link.rel = "noopener";
      item.appendChild(link);
      const after = String(source).slice(urlMatch.index + urlMatch[0].length);
      if (after) item.appendChild(document.createTextNode(after));
    } else {
      item.textContent = source;
    }
    sourcesEl.appendChild(item);
  }

  const earnBtn = detailCard.querySelector("#detailEarnBtn");
  const isEarned = earned.has(trophy.id);
  earnBtn.textContent = isEarned ? "✓ Earned — tap to unmark" : "Mark as earned";
  earnBtn.classList.toggle("earned", isEarned);
  earnBtn.onclick = () => onToggle(trophy.id, !isEarned);
}

// The roadmap view: six stages with their trophies and progress.
export function renderRoadmap(roadmapEl, trophiesById, earned) {
  roadmapEl.innerHTML = "";
  for (const stage of ROADMAP_STAGES) {
    const item = el("li", "roadmap-stage");
    const progress = stageProgress(stage, earned);
    item.appendChild(el("h3", null, stage.title));
    item.appendChild(el("p", null, stage.advice));
    item.appendChild(
      el("p", "stage-progress", progress.done + " of " + progress.total + " earned in this stage"),
    );
    const list = el("ul");
    for (const { trophy, done } of stageTrophies(stage, trophiesById, earned)) {
      const line = el("li", done ? "done" : null, (done ? "✓ " : "") + trophy.name + " — " + trophy.grade);
      list.appendChild(line);
    }
    item.appendChild(list);
    roadmapEl.appendChild(item);
  }
}
