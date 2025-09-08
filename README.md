# CMutils - FC25 Career Mode Utility

A focused, high-contrast single-page web application for managing Football Career (FC25-like) save data locally in the browser. The project is intentionally small and dependency-light: it provides season and squad management, player CRUD, a notes area, transfers tracking, season statistics editing, and visual analytics — all persisted to localStorage and exportable as JSON.

## Project overview

- Manage multiple seasons, each with its own roster, transfers, trophies and season record.
- Maintain two squad views: Main Squad and Youth Academy.
- Add, edit, remove and reorder players (drag & drop within position groups).
- Keep quick notes tied to each season using the Notes tab.
- Export and import the entire dataset as JSON for backup or sharing.

## Features

- Season management (add/select seasons, currency selection per season).
- Player CRUD (modal-based forms with validation).
- Notes panel for freeform season-specific notes.
- Transfers: categorized lists for tracking player movement.
- Season stats editor: structured entries for season records, trophies and player awards.
- Charts and position-aggregated statistics using Chart.js.

## Quick Start (Windows PowerShell)

1. Open PowerShell and change to the project folder:

```powershell
cd "C:\Users\pctopcall10\Desktop\cmutils"
```

2. Open the app:

```powershell
Start-Process "index.html"
```

Or serve on a local server for full CDN behavior:

```powershell
python -m http.server 8000
# then open http://localhost:8000
```

## Tech stack

- HTML, CSS, JavaScript (no build step)
- Tailwind CSS via CDN
- Chart.js via CDN
- LocalStorage for persistence

## Files and folders

```
cmutils/
├─ index.html         # App UI and layout
├─ style.css          # Additional styling
├─ script.js          # Application logic (state, UI rendering, charts)
├─ data/
│  └─ sample.json     # Example dataset
├─ flags/             # Optional SVG flags used by COUNTRY_MAP
└─ README.md          # This file
```

## Data model (high level)

Each season stored by the app is an object with metadata, rosters and several auxiliary collections. Top-level example fields:

- id: string | null
- name: season label (e.g. "2025/2026")
- currency: "USD" | "EUR" | "GBP"
- roster: { main_squad: { players }, youth_academy: { players } }
- matches: aggregated season record objects
- trophies: array of trophy objects (name, scope, competition)
- playerAwards: array of player award entries
- transfers: object with categories: forSale, sold, released, retired, loan, toBuyClub, toBuyReleased
- notes: array of freeform note objects (see below)

Player objects contain fields such as id, firstName, lastName, nationality (3-letter code), role, overall, potential, age, contractEnd (YYYY-MM-DD), skills, weakFoot, foot, totalStats, value, wage, appearances, goals, assists, cleanSheets, yellowCards, redCards, avgRating.

Notes structure

Notes are stored per-season in the `notes` array. Each note is a simple object; example:

```json
{
   "id": "k9xq3z8",
   "title": "Pre-season targets",
   "content": "Sign a left-footed CB and reduce wage costs.",
   "createdAt": "2025-09-08T12:34:56.000Z",
   "updatedAt": "2025-09-08T12:34:56.000Z"
}
```

Notes are persisted as part of the season object and saved to localStorage along with the rest of the app state.

Local storage and import/export

- The entire application state is saved to browser localStorage under the key `cmutils_data` as a JSON string with a top-level `seasons` array.
- To inspect notes or other data in the browser console:

```javascript
const data = JSON.parse(localStorage.getItem('cmutils_data'));
console.log(data.seasons.map(s => ({ id: s.id, name: s.name, notes: s.notes }))); 
```

- Use the Export JSON and Load JSON buttons in the app to download and restore the full dataset (including notes).

## Position groups (drag & drop boundaries)

Players are ordered only within these groups:

- Goalkeepers: GK
- Defenders: LB, CB, RB
- Midfielders: CDM, LM, CM, RM, CAM
- Forwards: LW, ST, RW

If you add new roles, update `POSITION_GROUPS` in `script.js`.

## Flags and nationality

The app includes a `flags/` folder and a `COUNTRY_MAP` used to render small flag icons for player nationalities (three-letter codes mapped to SVG files).

## Charts and statistics

- Charts live in the Charts panel and include averages and distributions by role and position.
- A Position Averages table displays aggregated metrics per position group.

## Troubleshooting

- Sample data not loading: ensure `data/sample.json` exists and is valid JSON; check the browser console for errors.
- Charts not displaying: ensure Chart.js is reachable and canvases are present in the DOM when charts are initialized.
- Flags not showing: verify `flags/` filenames match entries in `COUNTRY_MAP`.

## Contributing

- No build process — edit `script.js` / `index.html` directly and test in a browser.
- Preserve field names used in `data/sample.json` to keep import/export compatible.


