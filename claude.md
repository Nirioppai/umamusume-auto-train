# Umamusume Auto Train — Project Context

## 1. Project Overview

An open-source automation bot for the mobile/PC game _Umamusume Pretty Derby_. It automates the training loop: selecting stats to train, managing energy/mood, entering races, buying skills, and handling in-game events. Configuration is managed via a locally-hosted React web UI. The project targets Windows with optional Android emulator/ADB support.

**Status:** Active development. Maintained by CrazyIvanTR, originally created by Samsul Panjul.

---

## 2. Architecture

**Pattern:** Dual-stack — Python automation engine + React/TypeScript config UI, coordinated via a local FastAPI server.

```
Browser (React UI)
    ↕ HTTP (localhost:8001-8010)
FastAPI Server (server/)
    ↕ config.json / config/ presets
Core Bot Engine (core/)
    ↕ PyAutoGUI / ADB
Game Window (Steam or Emulator)
```

**Three-layer decision loop (per training turn):**

1. **State collection** (`core/state.py`) — OCR + color matching extracts mood, turn, stats, energy
2. **Strategy evaluation** (`core/strategies.py`) — Compares stats vs. timeline targets, decides action
3. **Action execution** (`core/actions.py`) — Clicks/navigates game UI via PyAutoGUI or ADB

**Startup flow:**

- `main.py` launches FastAPI server → starts hotkey listener thread
- User opens `http://localhost:<port>`, configures settings, saves preset
- User presses F1 in-game → bot calls `core/skeleton.py:career_lobby()`

**Full architecture doc:** [.planning/codebase/ARCHITECTURE.md](.planning/codebase/ARCHITECTURE.md)

---

## 3. Tech Stack

### Backend (Python 3.10–3.13)

| Purpose           | Library                                           |
| ----------------- | ------------------------------------------------- |
| HTTP API          | FastAPI 0.116.1 + Uvicorn 0.35.0                  |
| Screen automation | PyAutoGUI 0.9.54, MSS 10.0.0                      |
| Image processing  | OpenCV 4.12.0, scikit-image 0.25.2, Pillow 11.3.0 |
| OCR               | EasyOCR 1.7.2 (backed by PyTorch 2.7.1)           |
| Fuzzy matching    | RapidFuzz 3.13.0, Levenshtein 0.27.1              |
| Mobile control    | adbutils 2.10.2                                   |
| CLI               | Click 8.2.1                                       |
| Data validation   | Pydantic 2.11.7                                   |

### Frontend (Node.js / TypeScript)

| Purpose              | Library                                            |
| -------------------- | -------------------------------------------------- |
| UI Framework         | React 19.1.0                                       |
| Build tool           | Vite 7.0.4                                         |
| Styling              | Tailwind CSS 4.1.11                                |
| Component primitives | Radix UI (checkbox, dialog, select, tabs, tooltip) |
| Async state          | TanStack Query 5.90.5 + persist client             |
| Drag-and-drop        | @dnd-kit/core 6.3.1                                |
| Schema validation    | Zod 4.1.12                                         |
| Icons                | lucide-react 0.541.0                               |

**Full stack doc:** [.planning/codebase/STACK.md](.planning/codebase/STACK.md)

---

## 4. Project Structure

```
umamusume-auto-train/
├── main.py                  # Entry: server startup + hotkey listener
├── config.json              # Active config (written by web UI)
├── config.template.json     # Config schema + defaults
│
├── core/                    # Bot automation engine
│   ├── skeleton.py          # Main training loop
│   ├── state.py             # Game state collection (OCR, colors)
│   ├── strategies.py        # Training decision logic
│   ├── actions.py           # Atomic game actions
│   ├── recognizer.py        # Color/brightness detection
│   ├── ocr.py               # Text extraction
│   ├── skill.py             # Skill purchasing
│   ├── events.py            # Event choice selection
│   ├── trainings.py         # Training data parsing
│   ├── config.py            # Config → module globals
│   └── bot.py               # Global bot state
│
├── server/                  # FastAPI config server
│   ├── main.py              # App + all endpoints
│   ├── config_store.py      # Preset file CRUD
│   ├── setup_store.py       # Global setup config
│   └── store_shared.py      # Path utilities
│
├── utils/                   # Shared utilities
│   ├── constants.py         # Screen regions, positions, timelines
│   ├── device_action_wrapper.py  # PyAutoGUI/ADB abstraction
│   ├── log.py               # Structured logging
│   ├── screenshot.py        # Image prep for OCR
│   └── tools.py             # sleep, click, generic helpers
│
├── web/                     # React config UI
│   ├── src/
│   │   ├── App.tsx          # Main component (tabs)
│   │   ├── components/      # Tab sections: setup, event, race, skill, training, skeleton
│   │   ├── hooks/           # useConfig, useConfigPreset, useImportConfig
│   │   ├── types/           # TypeScript interfaces (Config, TrainingStrategy, etc.)
│   │   └── providers/       # React Query setup
│   └── dist/                # Built output (committed, served by FastAPI)
│
├── config/                  # Saved user presets (JSON)
├── data/                    # Game reference data (skills, events, races JSON)
├── assets/                  # Template PNGs for button/icon matching
├── themes/                  # UI color themes
├── scenarios/               # Scenario-specific logic (e.g., unity.py)
└── logs/                    # Runtime logs (gitignored)
```

**Full structure doc:** [.planning/codebase/STRUCTURE.md](.planning/codebase/STRUCTURE.md)

---

## 5. Code Conventions

### Naming

| Context                  | Convention                     |
| ------------------------ | ------------------------------ |
| Python files             | `snake_case.py`                |
| Python functions/vars    | `snake_case`                   |
| Python constants/globals | `UPPER_CASE`                   |
| TypeScript components    | `PascalCase.tsx`               |
| TypeScript hooks/utils   | `camelCase.ts`                 |
| TypeScript types         | `PascalCase`                   |
| Zod schemas              | `PascalCase` + `Schema` suffix |
| Template images          | `descriptive_noun_btn.png`     |

### Key patterns

- **Python imports:** stdlib → third-party → local, then module-level state
- **TypeScript imports:** React → third-party → type imports → local components → hooks
- **Path aliases:** `@/` maps to `web/src/` (configured in `tsconfig.json`)
- **Indentation:** 2 spaces (both Python and TypeScript)
- **Linting:** ESLint via `npm run lint` (frontend only); no Python linter configured
- **Error returns:** Python functions return `False` on failure; TypeScript async functions use try/catch with `triggerToast()` for user-facing errors
- **Logging:** `from utils.log import info, warning, error, debug` — never use `print()` directly
- **Config globals:** Loaded once at startup via `core/config.py:reload_config()` using `globals()[name] = value`

**Full conventions doc:** [.planning/codebase/CONVENTIONS.md](.planning/codebase/CONVENTIONS.md)

---

## 6. Integrations

| Integration           | Purpose                                           | Location                                                |
| --------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| **FastAPI / Uvicorn** | Local HTTP server for config UI                   | `server/main.py`, ports 8001–8010                       |
| **PyAutoGUI**         | Mouse/keyboard automation for desktop             | `utils/pyautogui_actions.py`                            |
| **ADB (adbutils)**    | Optional Android device/emulator control          | `utils/adb_actions.py`, toggled via `USE_ADB` config    |
| **EasyOCR + PyTorch** | Text extraction from game screenshots             | `core/ocr.py`                                           |
| **OpenCV**            | Template matching, image processing               | `utils/device_action_wrapper.py`, `utils/screenshot.py` |
| **TanStack Query**    | Frontend data fetching + localStorage persistence | `web/src/providers/QueryProvider.tsx`                   |
| **Zod**               | Runtime schema validation for config              | `web/src/types/index.ts`                                |

**No external APIs, cloud services, databases, or webhooks.** Everything runs locally.

**CORS:** Restricted to `^http://(localhost|127\.0\.0\.1)(:\d+)?$` — localhost only.

**Full integrations doc:** [.planning/codebase/INTEGRATIONS.md](.planning/codebase/INTEGRATIONS.md)

---

## 7. Key Files & Links

| File                                                               | Purpose                                           |
| ------------------------------------------------------------------ | ------------------------------------------------- |
| [`main.py`](main.py)                                               | Bot entry point — server startup, hotkey listener |
| [`core/skeleton.py`](core/skeleton.py)                             | Training loop — called on F1 press                |
| [`core/strategies.py`](core/strategies.py)                         | Decision logic — what to do each turn             |
| [`core/state.py`](core/state.py)                                   | Game state collection via OCR + color matching    |
| [`core/actions.py`](core/actions.py)                               | Atomic game actions (click, train, rest, race)    |
| [`core/config.py`](core/config.py)                                 | Config loading to module globals                  |
| [`utils/constants.py`](utils/constants.py)                         | Screen coordinates, regions, game timeline        |
| [`utils/device_action_wrapper.py`](utils/device_action_wrapper.py) | PyAutoGUI/ADB abstraction layer                   |
| [`server/main.py`](server/main.py)                                 | FastAPI app + all API endpoints                   |
| [`config.json`](config.json)                                       | Active training config (generated by web UI)      |
| [`config.template.json`](config.template.json)                     | Config schema and defaults                        |
| [`web/src/App.tsx`](web/src/App.tsx)                               | React root component                              |
| [`web/src/types/index.ts`](web/src/types/index.ts)                 | TypeScript types + Zod schemas                    |
| [`requirements.txt`](requirements.txt)                             | Python dependencies                               |
| [`web/package.json`](web/package.json)                             | Node dependencies + build scripts                 |
| [`README.md`](README.md)                                           | Setup and usage guide                             |
| [`.planning/codebase/](`.planning/codebase/)                       | Architecture, structure, conventions docs         |

---

## 8. How to Work in This Project

### Common tasks

**Add a new config option:**

1. Add key + default to `config.template.json`
2. Add `load_var()` call in `core/config.py:reload_config()`
3. Add input in `web/src/components/set-up/SetUpSection.tsx` (or relevant tab)
4. Add property to `web/src/types/index.ts:Config`
5. If setup-global (shared across presets): update `server/setup_store.py`

**Add a new game action:**

1. Implement `def do_new_action(options):` in `core/actions.py`
2. Add `action.func = "do_new_action"` in strategy decision logic (`core/strategies.py`)
3. Add button template PNG to `assets/buttons/`

**Add a new web UI component:**

1. Create in `web/src/components/feature_name/`
2. Use `@/` path alias for imports from `src/`
3. Use Tailwind + `cn()` utility for class merging

**Run the bot:**

```bash
python main.py        # starts server + hotkey listener
# Press F1 in-game to start/stop
```

**Build the web UI:**

```bash
cd web && npm run build   # outputs to web/dist/
```

### Mandatory: log every change to the Updates section

**After every change to this codebase, append an entry to the `## Updates` section at the bottom of this file.** This is required — not optional. It keeps a running log that helps detect merge conflicts with upstream and catch future incompatibilities.

**Format:**

```
### YYYY-MM-DD — Short description of what was done

| # | File(s) | What changed |
|---|---------|-------------|
| 1 | `path/to/file.py` | One sentence describing the specific change |
| 2 | `path/to/another.tsx` | One sentence describing the specific change |
```

**Rules:**

- One entry per session/task, not per file. Group all files touched in one task into one table.
- Date is today's date. Description is the task, not the implementation detail.
- File paths use backtick code formatting.
- "What changed" must describe the _actual change_ — not just "updated" or "modified". Say what was added, removed, fixed, or refactored.
- If upstream commits are merged, add entries for those too, summarizing what they changed.

### Things Claude should know

- **Windows-only:** PyAutoGUI and PyGetWindow are Windows-native. Do not suggest cross-platform alternatives for these.
- **No test suite:** There are no unit or integration tests. Verification is done by running the bot.
- **Config is global state:** `core/config.py` loads values into module-level globals at startup. Config changes require a restart or `reload_config()` call.
- **Device abstraction is critical:** Always route screen interactions through `utils/device_action_wrapper.py`, never call PyAutoGUI or ADB directly in core logic.
- **OCR is the fragile layer:** EasyOCR misreads are the most common source of bugs. See `CONCERNS.md` for known failure modes.
- **`web/dist/` is committed:** The built frontend is committed to the repo so users don't need Node.js to run the bot.
- **Logging convention:** Use `from utils.log import info, warning, error, debug` — never use bare `print()`.
- **Two separate CLAUDs.md files exist:** The root `CLAUDE.md` (checked in) covers the UMA Calculator sub-project. This `claude.md` covers the automation bot.

### Gotchas

- `lowerSkillId` and `skillId` on `SkillObj` are only set when loading from CSV (not from fallback `skills_lib.json`)
- Multiple bot instances share `config.json` — they don't have isolated configs
- ADB mode and desktop mode use the same code path via `device_action_wrapper.py` — check `bot.use_adb` flag, not the library directly
- Template image confidence thresholds matter — too low causes false positives, too high causes missed matches

---

## Updates (Latest entries are listed first)

### 2026-04-02 — Race schedule importer with named saved schedules

| # | File(s) | What changed |
|---|---------|-------------|
| 1 | `utils/race_schedule_store.py` _(new)_ | Added CRUD for named schedule files in `constants/races/` — list, load, save (overwrite), delete; validates names against filesystem-dangerous chars and guards against directory traversal |
| 2 | `server/main.py` | Added 4 endpoints: `GET /race-schedules` (list names), `GET /race-schedules/{name}` (fetch raw entries), `POST /race-schedules/{name}` (save), `DELETE /race-schedules/{name}` (delete) |
| 3 | `web/src/constants/raceSchedule.constant.ts` _(new)_ | Parser utility — `turnToDate()`, `dateToTurn()`, `parseRaceSchedule()` (stored format → `RaceScheduleType[]`), `toExportFormat()` (reverse); single middleman so format changes don't propagate elsewhere |
| 4 | `web/src/hooks/useRaceSchedules.ts` _(new)_ | Hook exposing `scheduleNames`, `fetchSchedule`, `saveSchedule`, `deleteSchedule` against the new server endpoints |
| 5 | `web/src/components/race-schedule/RaceImporter.tsx` _(new)_ | UI panel with Import JSON (file picker → parse → name → save), Save Current (serialize active config schedule back to export format), and a list of saved schedules with Load / Delete per entry |
| 6 | `web/src/components/race-schedule/RaceListSection.tsx` | Added `<RaceImporter>` below the calendar; wires `onLoadSchedule` to `updateConfig("race_schedule", races)` so loading a saved schedule injects it into the active config |

### 2026-03-30 — Resolve merge conflicts with upstream/unity_cup_beta

| # | File(s) | What changed |
|---|---------|-------------|
| 1 | `core/bot.py` | Kept `bot_start_time = None` (local, for timed logging) and added `instance = 1` from upstream |
| 2 | `server/main.py` | Kept local `/config/scenario` GET+POST endpoints and added upstream's `/api/webhook` POST endpoint |
| 3 | `web/src/components/set-up/SetUpSection.tsx` | Kept local `useCallback`, `SCENARIO_LABELS`, and single-quote style; added upstream's `WebhookSettings` import |

### 2026-03-20 — Persist scenario selection across bot restarts

| #   | File(s)                                        | What changed                                                                                                                                                                     |
| --- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `constants/scenarios.json` _(new)_             | Added JSON file storing `available` scenario list and `selected` scenario name; persists across F1 restarts                                                                      |
| 2   | `utils/scenario_store.py` _(new)_              | Added shared read/write utility for `constants/scenarios.json` — `load_selected_scenario()`, `save_selected_scenario()`, `load_scenarios()`; used by both server and core        |
| 3   | `server/main.py`                               | Added `GET /config/scenario` and `POST /config/scenario` endpoints; validates scenario against allowed list before saving                                                        |
| 4   | `core/skeleton.py`                             | Replaced `constants.SCENARIO_NAME = ""` at `career_lobby()` startup with `load_selected_scenario()` so a persisted scenario is restored instead of re-detected on every F1 press |
| 5   | `web/src/components/set-up/SetUpSection.tsx`   | Added Scenario selector dropdown in Trainer Set-Up section; fetches available/selected from `/config/scenario`, saves on change, shows "Auto-detect" option for empty selection  |
| 6   | `web/dist/app.js`, `web/dist/assets/index.css` | Rebuilt frontend bundle to ship UI changes                                                                                                                                       |

### 2026-03-20 — Migrate epithet data to single JSON source of truth

| # | File(s) | What changed |
|---|---------|-------------|
| 1 | `constants/epithets.json` | Restructured to include `color` and `races` per epithet — now the single file to edit when adding epithets |
| 2 | `web/src/data/epithets.ts` | Replaced hardcoded data with import from `@constants/epithets.json`; derives `EPITHET_COLORS` and `RACE_EPITHET_MAP` at module load |
| 3 | `web/vite.config.ts` | Added `@constants` alias pointing to `../constants/` |
| 4 | `web/tsconfig.app.json` | Added `@constants/*` path alias so TypeScript resolves the JSON import |
| 5 | `web/src/index.css` | Added `@source "../../constants/epithets.json"` so Tailwind v4 includes color utility classes defined as string values in the JSON |
| 6 | `web/dist/app.js`, `web/dist/assets/index.css` | Rebuilt frontend bundle |

### 2026-03-20 — Fix epithet year-scoping in race schedule

| # | File(s) | What changed |
|---|---------|-------------|
| 1 | `web/src/components/race-schedule/race-schedule/RaceDateCard.tsx` | Added `getEpithetForYear()` helper; Senior epithets now only display on Senior Year cards, Classic epithets only on Classic Year cards |
| 2 | `web/src/components/race-schedule/race-schedule/RaceCard.tsx` | Same `getEpithetForYear()` helper added; `year` prop now destructured and used for epithet filtering |
| 3 | `web/dist/app.js` | Rebuilt frontend bundle |

### 2026-03-20 — Race schedule epithet indicators

| # | File(s) | What changed |
|---|---------|-------------|
| 1 | `constants/epithets.json` _(new)_ | Added JSON file mapping epithet names (Classic Triple Crown, Triple Tiara, Senior Spring/Autumn Triple Crown) to their constituent race names |
| 2 | `web/src/data/epithets.ts` _(new)_ | Added TypeScript module exporting `EPITHETS` and `RACE_EPITHET_MAP` (flat race→epithet lookup) for use in React components |
| 3 | `web/src/components/race-schedule/race-schedule/RaceDateCard.tsx` | Added epithet name row below race info on selected-race trigger cards |
| 4 | `web/src/components/race-schedule/race-schedule/RaceCard.tsx` | Added epithet name row (★ prefixed, purple) in the dialog race card above the fans row |
| 5 | `web/dist/app.js`, `web/dist/assets/index.css` | Rebuilt frontend bundle to ship UI changes |

### 2026-03-20 — Race schedule UI improvements

| #   | File(s)                                                           | What changed                                                                                                                                                                                                                                                                  |
| --- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `web/src/components/race-schedule/race-schedule/RaceDateCard.tsx` | Removed duplicate race-name span that was rendering selected race names twice without badges; replaced `truncate` with proper wrapping layout so race name + grade badge + terrain info stack correctly on small cards; downsized text and badge heights for small-screen fit |
| 2   | `web/dist/app.js`, `web/dist/assets/index.css`                    | Rebuilt frontend bundle to ship UI changes                                                                                                                                                                                                                                    |

### 2026-03-20 — Bot logging, server port, OCR, and run script

| #   | File(s)        | What changed                                                                                                                                                                                   |
| --- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `utils/log.py` | Added `_TimedFormatter` class — log messages now include current wall-clock time and elapsed time since last hotkey press (e.g. `[INFO] 12:07 PM \| 0h 2m 15s Since Last f1 Key Press \| ...`) |
| 2   | `core/bot.py`  | Added `bot_start_time` module-level variable, set when hotkey is pressed, consumed by `_TimedFormatter`                                                                                        |
| 3   | `main.py`      | Changed default server start port from `8000` to `8001`; records `bot.bot_start_time = time.time()` on hotkey press                                                                            |
| 4   | `core/ocr.py`  | Switched EasyOCR reader from `gpu=False` to `gpu=True`                                                                                                                                         |
| 5   | `_run.bat`     | Added Windows batch script as a one-click launcher                                                                                                                                             |

### 2026-03-20 — MANT scenario banner

| #   | File(s)                           | What changed                                   |
| --- | --------------------------------- | ---------------------------------------------- |
| 1   | `assets/scenario_banner/mant.png` | Added banner image for MANT scenario detection |

### 2026-03-19 — Race schedule filter bug fixes (`core/state.py`)

Three successive patches to `filter_race_schedule()`:

| #   | Commit    | What changed                                                                                                                                                                          |
| --- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `353a3cb` | Fixed `KeyError` crash — switched from shallow `.copy()` to `copy.deepcopy()` on `RACE_SCHEDULE_CONF`; moved `import copy` to module scope                                            |
| 2   | `fab1e69` | Fixed iteration bug — was removing from `config.RACE_SCHEDULE[date]` while iterating `schedule[date]`; corrected to remove from the list being iterated and deep-copy back at the end |
| 3   | `bc2f19b` | Refactored filtering to build a `new_list` instead of mutating during iteration; pre-computed `valid_names` set for O(1) lookup                                                       |

### 2026-03-15 — UI config management overhaul

| #   | File(s)                                                                   | What changed                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `server/config_store.py` _(new)_                                          | Full file-based preset CRUD — list, load, save, delete, duplicate config presets stored as `config/config_N.json` files; includes `_deep_merge` to backfill missing keys from `config.template.json` |
| 2   | `server/setup_store.py` _(new)_                                           | Separate store for global setup config (window name, ADB, OCR settings) shared across all presets                                                                                                    |
| 3   | `server/store_shared.py` _(new)_                                          | Shared path utilities, `safe_resolve()` (directory traversal guard), `safe_name()` (filename validation regex)                                                                                       |
| 4   | `server/legacy_config_store.py` _(new)_                                   | Backwards-compat shim to import presets from old browser `localStorage` JSON export format                                                                                                           |
| 5   | `migrate_local_storage_presets.py` _(new)_                                | CLI script to migrate old `localStorage` preset exports into `config/` files                                                                                                                         |
| 6   | `server/main.py`                                                          | Added full preset CRUD endpoints (`GET/POST /configs`, `GET/PUT/DELETE /configs/{name}`, `POST /configs/{name}/duplicate`), setup config endpoints, applied-preset tracking                          |
| 7   | `web/src/App.tsx`, `hooks/useConfigPreset.ts`, `hooks/useImportConfig.ts` | Web UI wired to new preset API — preset list, create, rename, delete, import, duplicate, apply                                                                                                       |
| 8   | `update_config.py`                                                        | Refactored to use new `server/config_store.py` deep-merge logic                                                                                                                                      |

### 2026-03-15 — Config deep-merge fix

| #   | File(s)            | What changed                                                                                         |
| --- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| 1   | `update_config.py` | Fixed `_deep_merge` to correctly recurse into nested dicts instead of overwriting entire sub-objects |
