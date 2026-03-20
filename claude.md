# Umamusume Auto Train — Project Context

## 1. Project Overview

An open-source automation bot for the mobile/PC game *Umamusume Pretty Derby*. It automates the training loop: selecting stats to train, managing energy/mood, entering races, buying skills, and handling in-game events. Configuration is managed via a locally-hosted React web UI. The project targets Windows with optional Android emulator/ADB support.

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
| Purpose | Library |
|---|---|
| HTTP API | FastAPI 0.116.1 + Uvicorn 0.35.0 |
| Screen automation | PyAutoGUI 0.9.54, MSS 10.0.0 |
| Image processing | OpenCV 4.12.0, scikit-image 0.25.2, Pillow 11.3.0 |
| OCR | EasyOCR 1.7.2 (backed by PyTorch 2.7.1) |
| Fuzzy matching | RapidFuzz 3.13.0, Levenshtein 0.27.1 |
| Mobile control | adbutils 2.10.2 |
| CLI | Click 8.2.1 |
| Data validation | Pydantic 2.11.7 |

### Frontend (Node.js / TypeScript)
| Purpose | Library |
|---|---|
| UI Framework | React 19.1.0 |
| Build tool | Vite 7.0.4 |
| Styling | Tailwind CSS 4.1.11 |
| Component primitives | Radix UI (checkbox, dialog, select, tabs, tooltip) |
| Async state | TanStack Query 5.90.5 + persist client |
| Drag-and-drop | @dnd-kit/core 6.3.1 |
| Schema validation | Zod 4.1.12 |
| Icons | lucide-react 0.541.0 |

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
| Context | Convention |
|---|---|
| Python files | `snake_case.py` |
| Python functions/vars | `snake_case` |
| Python constants/globals | `UPPER_CASE` |
| TypeScript components | `PascalCase.tsx` |
| TypeScript hooks/utils | `camelCase.ts` |
| TypeScript types | `PascalCase` |
| Zod schemas | `PascalCase` + `Schema` suffix |
| Template images | `descriptive_noun_btn.png` |

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

| Integration | Purpose | Location |
|---|---|---|
| **FastAPI / Uvicorn** | Local HTTP server for config UI | `server/main.py`, ports 8001–8010 |
| **PyAutoGUI** | Mouse/keyboard automation for desktop | `utils/pyautogui_actions.py` |
| **ADB (adbutils)** | Optional Android device/emulator control | `utils/adb_actions.py`, toggled via `USE_ADB` config |
| **EasyOCR + PyTorch** | Text extraction from game screenshots | `core/ocr.py` |
| **OpenCV** | Template matching, image processing | `utils/device_action_wrapper.py`, `utils/screenshot.py` |
| **TanStack Query** | Frontend data fetching + localStorage persistence | `web/src/providers/QueryProvider.tsx` |
| **Zod** | Runtime schema validation for config | `web/src/types/index.ts` |

**No external APIs, cloud services, databases, or webhooks.** Everything runs locally.

**CORS:** Restricted to `^http://(localhost|127\.0\.0\.1)(:\d+)?$` — localhost only.

**Full integrations doc:** [.planning/codebase/INTEGRATIONS.md](.planning/codebase/INTEGRATIONS.md)

---

## 7. Key Files & Links

| File | Purpose |
|---|---|
| [`main.py`](main.py) | Bot entry point — server startup, hotkey listener |
| [`core/skeleton.py`](core/skeleton.py) | Training loop — called on F1 press |
| [`core/strategies.py`](core/strategies.py) | Decision logic — what to do each turn |
| [`core/state.py`](core/state.py) | Game state collection via OCR + color matching |
| [`core/actions.py`](core/actions.py) | Atomic game actions (click, train, rest, race) |
| [`core/config.py`](core/config.py) | Config loading to module globals |
| [`utils/constants.py`](utils/constants.py) | Screen coordinates, regions, game timeline |
| [`utils/device_action_wrapper.py`](utils/device_action_wrapper.py) | PyAutoGUI/ADB abstraction layer |
| [`server/main.py`](server/main.py) | FastAPI app + all API endpoints |
| [`config.json`](config.json) | Active training config (generated by web UI) |
| [`config.template.json`](config.template.json) | Config schema and defaults |
| [`web/src/App.tsx`](web/src/App.tsx) | React root component |
| [`web/src/types/index.ts`](web/src/types/index.ts) | TypeScript types + Zod schemas |
| [`requirements.txt`](requirements.txt) | Python dependencies |
| [`web/package.json`](web/package.json) | Node dependencies + build scripts |
| [`README.md`](README.md) | Setup and usage guide |
| [`.planning/codebase/](`.planning/codebase/) | Architecture, structure, conventions docs |

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
