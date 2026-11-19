// roadmap.js — the six-stage road to the platinum, built from the
// official trophy descriptions. Each stage names the trophies it covers
// and the order to earn them in; stage 6 closes with 100% and the platinum.

const ROADMAP_STAGES = [
  {
    stage: 1,
    title: "Play the story",
    advice:
      "Finish the story first. Chapters 1–4 and the named missions unlock in order — play them through, keep a save before the final mission, and tick each one off as it pops.",
    trophyIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 48],
  },
  {
    stage: 2,
    title: "Finish the side strands",
    advice:
      "Clear the character strands — Andy, Kenton, Billy, Randy and Tyrone — plus 8 stranger strands across Leonida. Finish one strand at a time instead of starting them all.",
    trophyIds: [22, 23, 24, 25, 26, 27],
  },
  {
    stage: 3,
    title: "Clear the map: collectibles and exploration",
    advice:
      "Sweep Leonida region by region: all 52 areas, the 18 meditation spots, the card sets, the WAiNK spots, 100 vehicles, the 8 garages and the 10 Scooter Bros registrations.",
    trophyIds: [28, 30, 31, 35, 42, 54, 55],
  },
  {
    stage: 4,
    title: "Master the activities",
    advice:
      "Gold all 42 Shooting Range challenges, win races and drone races, beat Cal at fishing, finish an arcade game and a bowling game, and try all 9 activity types.",
    trophyIds: [15, 16, 17, 18, 19, 20, 21, 29, 32, 36, 44, 45, 46, 51],
  },
  {
    stage: 5,
    title: "Crime, chaos and cash",
    advice:
      "The open-world crime set: vaults, armored trucks, gang operations, jewelry-store stealth, the wanted-level escapes, and the money goals — $250,000 laundered, $100,000 spent.",
    trophyIds: [33, 34, 37, 38, 39, 40, 41, 43, 47, 49, 50, 52, 53],
  },
  {
    stage: 6,
    title: "100% and the platinum",
    advice:
      "Mop up whatever the in-game completion checklist still shows — open the game's own 100% screen to see what is left — reach 100% completion, and the platinum pops on its own right after.",
    trophyIds: [14, 1],
  },
];

// Look up a stage record by its number. Returns null for an unknown stage.
function stageForNumber(stageNumber) {
  return ROADMAP_STAGES.find((s) => s.stage === stageNumber) || null;
}

// The stage a trophy belongs to, from its roadmap_stage field.
function stageOfTrophy(trophy) {
  return stageForNumber(trophy.roadmap_stage);
}

// Trophies of one stage, in official id order, with earned flags attached.
function stageTrophies(stage, trophiesById, earned) {
  return stage.trophyIds
    .map((id) => trophiesById.get(id))
    .filter((t) => t !== undefined)
    .map((t) => ({ trophy: t, done: earned.has(t.id) }));
}

// How far a stage is: earned count and total.
function stageProgress(stage, earned) {
  const done = stage.trophyIds.filter((id) => earned.has(id)).length;
  return { done, total: stage.trophyIds.length };
}
