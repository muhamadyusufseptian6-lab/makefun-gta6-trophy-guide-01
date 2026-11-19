# Leonida Platinum Tracker — GTA 6 Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/muhamadyusufseptian6-lab/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/muhamadyusufseptian6-lab/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of
Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze — 28 hidden
on PlayStation until earned). Every trophy shows its official name,
description and grade, a guide written in our own words that cites its
sources, and a flag when it can be missed. A six-stage roadmap leads to
the platinum, and the checklist saves your progress in the browser.

## Open it offline

Double-click `app/index.html` in a desktop browser — no build step, no
network, no account. (Opening it straight from disk works: the app
loads its data from classic scripts, no server needed.) Or serve the
`app/` folder with any static file server and open `index.html`:

```sh
cd app
python3 -m http.server 8080
# open http://localhost:8080
```

Everything the page loads lives under `app/` (HTML, CSS, JavaScript and
`data/trophies.json`). It makes no network requests at run time, so it
works with the network off.

## Features

- **Checklist of all 55 trophies** — official name, description, grade,
  kind, PSN progress count where PSN lists one, and a hidden-on-PSN flag.
- **Saved progress** — tick trophies off; progress is stored in
  `localStorage` and survives reloads. Export it to a JSON file and
  import it back any time.
- **Filters** — by kind (story, missable, collectibles, activities), by
  grade, and by free-text search; plus a hide-earned switch.
- **Spoiler setting** — hides story trophies' names, descriptions and
  guides until they are earned.
- **Roadmap to the platinum** — six ordered stages built from the
  official trophy descriptions: story first, side strands, map and
  collectibles, activities, crime and cash, then 100% and the platinum.
- **Missable trophies flagged** — 18 trophies tied to a single mission or
  story choice, listed on their own tab with a warning.
- **Cited guides** — every trophy's guide names its sources: the
  official list on
  [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
  for name, description and grade, and
  [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi)
  for PSN counts where it has one.

## Honest about what is not known yet

GTA 6 released 19 November 2026 — the game is a day old and detailed
walkthroughs are not verified yet. This guide never invents a specific
location, step or mission detail the official description does not
support. Where a place or step is not pinned down, the guide says so:
"our own advice from the official description, not yet checked in the
game". A cited, honest guide beats an invented one.

Hidden flags follow the frozen official list (28 hidden): the story and
named-mission trophies and the trophies whose descriptions are
deliberately vague are marked hidden on PSN; the rest are shown.

## Layout

- `app/index.html` — the page: header progress, tabs, toolbar, checklist, detail pane.
- `app/style.css` — the look: a sunset-over-Leonida palette, system fonts only, no images.
- `app/app.js` — boot and wiring: loads the data, renders the views, handles export/import.
- `app/js/store.js` — progress persistence (`localStorage`), export and import.
- `app/js/filters.js` — kind/grade/search filters, the spoiler rule, progress counters.
- `app/js/roadmap.js` — the six roadmap stages and their trophy lists.
- `app/js/views.js` — renders the checklist rows, the detail pane and the roadmap.
- `app/data/trophies.json` — the 55 trophies with official data and our guides.
- `app/data/trophies-data.js` — the same 55 trophies as a classic script (data for file://, generated from trophies.json).
- `main.ts` — the entry program: copies `app/` and `screenshots/` to the
  output directory and writes `dossier.json` (Node 22, stdlib only).

## Screenshots

The `screenshots/` folder holds 4 real renders of the running app,
taken in a desktop browser — the checklist with a guide open, the
roadmap, the missable list, and the spoiler setting at work.

## License

MIT — see `LICENSE`.

---

Built for the make.fun bounty **gta6-trophy-guide-01**. If you sign up to
make.fun, use referral code **515temp1** — https://make.fun/r/515temp1
