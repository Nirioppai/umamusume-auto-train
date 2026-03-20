# Codebase Structure

**Analysis Date:** 2026-03-20

## Directory Layout

```
umamusume-auto-train/
├── main.py                 # Entry point: server startup, hotkey listener
├── config.json             # Active training config (generated from web UI)
├── config.template.json    # Config schema template
├── version.txt             # Version string synced to web/dist
├── requirements.txt        # Python dependencies
│
├── core/                   # Bot automation engine
│   ├── skeleton.py         # Main training loop (career_lobby)
│   ├── state.py            # Game state collection (OCR, color matching)
│   ├── strategies.py       # Training decision logic
│   ├── actions.py          # Atomic game actions (click, train, rest)
│   ├── recognizer.py       # Visual recognition (colors, brightness)
│   ├── ocr.py              # Text extraction from screenshots
│   ├── trainings.py        # Training data parsing
│   ├── events.py           # Event choice selection
│   ├── skill.py            # Skill purchasing
│   ├── claw_machine.py     # Claw machine minigame
│   ├── config.py           # Config loading to module globals
│   └── bot.py              # Global bot state (is_running, hotkey, use_adb)
│
├── server/                 # FastAPI config server
│   ├── main.py             # FastAPI app definition, config/theme endpoints
│   ├── config_store.py     # Config file CRUD (list, load, save, delete presets)
│   ├── legacy_config_store.py  # Backwards compat for old localStorage format
│   ├── theme_store.py      # Theme persistence
│   ├── setup_store.py      # Global setup config (window_name, adb, etc.)
│   └── store_shared.py     # Shared path utilities for config storage
│
├── utils/                  # Shared utilities
│   ├── constants.py        # Screen regions, training positions, mood/year timeline
│   ├── device_action_wrapper.py  # PyAutoGUI/ADB abstraction
│   ├── log.py              # Structured logging
│   ├── screenshot.py       # Image processing (OCR prep, GrabCut, binarization)
│   ├── adb_actions.py      # ADB mobile control
│   ├── pyautogui_actions.py    # PyAutoGUI desktop control
│   ├── shared.py           # Helper functions (check_status_effects, race_type detection)
│   ├── tools.py            # Utility functions (sleep, click, get_secs)
│   └── scenario.py         # Scenario name constants
│
├── web/                    # React config UI
│   ├── package.json        # Node dependencies (React 19, Vite, Tailwind, Radix UI)
│   ├── tsconfig.json       # TypeScript config
│   ├── vite.config.ts      # Vite bundler config
│   ├── eslint.config.js    # ESLint rules
│   ├── sync-version.js     # Script to sync version.txt to dist
│   │
│   ├── index.html          # Entry HTML (mounts React root)
│   │
│   ├── src/
│   │   ├── main.tsx        # React entry point (ReactDOM.createRoot)
│   │   ├── App.tsx         # Main app component (tab router, config editor)
│   │   ├── index.css       # Tailwind directives
│   │   │
│   │   ├── components/
│   │   │   ├── set-up/         # Setup config UI (window, ADB, OCR, notifications)
│   │   │   ├── event/          # Event choice configuration
│   │   │   ├── race-schedule/  # Race calendar & filtering
│   │   │   ├── skill/          # Skill list management
│   │   │   ├── training/       # Training settings (energy, mood, stat weights)
│   │   │   ├── skeleton/       # Training strategy timeline & templates
│   │   │   ├── ui/             # Radix UI primitives (Button, Input, Dialog, etc.)
│   │   │   └── _c/             # Utility components (Tooltips, Sortable)
│   │   │
│   │   ├── hooks/
│   │   │   ├── useConfig.ts         # Config file save/load logic
│   │   │   ├── useConfigPreset.ts   # Preset list management
│   │   │   ├── useImportConfig.ts   # Import JSON preset
│   │   │   └── training-strategy/   # Training strategy mutations
│   │   │
│   │   ├── providers/
│   │   │   ├── Providers.tsx        # Root provider wrapper
│   │   │   └── QueryProvider.tsx    # TanStack Query setup
│   │   │
│   │   ├── types/              # TypeScript interfaces (Config, TrainingStrategy, Stat, etc.)
│   │   ├── constants/          # Race types, stat names
│   │   ├── lib/                # Utility functions (cn for Tailwind merging)
│   │   └── utils/              # Validation helpers
│   │
│   ├── dist/                   # Built output (app.js, index.html)
│   └── eslint.config.js
│
├── config/                 # Preset config files
│   ├── default.json        # Default config for new users
│   ├── config_1.json       # User-created presets
│   ├── config_2.json
│   ├── setup.json          # Setup config (global, shared across presets)
│   └── ...
│
├── data/                   # Game reference data
│   ├── skills.json         # Skill metadata (names, IDs, costs)
│   ├── events.json         # Event reference
│   ├── races.json          # Race data
│   └── race_list_everything.json  # Complete race list
│
├── assets/                 # Game UI templates & reference images
│   ├── buttons/            # Button templates (next, ok, training, etc.)
│   ├── icons/              # Icon templates (event choice, race mission, etc.)
│   ├── scenario_banner/    # Scenario banners for detection
│   ├── ui/                 # UI templates (hint, infirmary, etc.)
│   ├── unity/              # Unity Cup templates
│   └── ...
│
├── themes/                 # Color themes for UI
│   ├── default.json        # Default color scheme
│   └── umas.json           # Uma character themes
│
├── logs/                   # Generated log files
│   └── f2/                 # Device/screenshot logs
│
├── scenarios/              # Scenario-specific logic
│   └── unity.py            # Unity Cup handling
│
├── readmes/                # Documentation
├── references/             # Game reference materials
└── .planning/              # GSD planning documents
    └── codebase/
        ├── ARCHITECTURE.md
        └── STRUCTURE.md
```

## Directory Purposes

**core/**
- Purpose: Bot automation engine - state collection, decision making, action execution
- Contains: Python modules for OCR, image recognition, strategy evaluation, game actions
- Key files: `skeleton.py` (entry point), `strategies.py` (decision logic), `state.py` (game state)

**server/**
- Purpose: FastAPI REST server for config persistence and theme management
- Contains: Config CRUD endpoints, setup globals storage, theme listing
- Key files: `main.py` (FastAPI app), `config_store.py` (preset file management)

**utils/**
- Purpose: Shared Python utilities - logging, device control, image processing, constants
- Contains: Device abstraction, screenshot utilities, logging setup, game constants
- Key files: `device_action_wrapper.py` (PyAutoGUI/ADB abstraction), `constants.py` (game layout)

**web/**
- Purpose: React configuration UI for bot training settings
- Contains: TypeScript components, hooks, types, styling
- Key files: `src/App.tsx` (main component), `src/main.tsx` (entry point)

**config/**
- Purpose: Preset training configuration files
- Contains: JSON configs created/edited via web UI, applied via bot
- Generated: Yes, by web UI save operations
- Committed: Yes, but users often have local changes

**data/**
- Purpose: Static game reference data (skills, events, races)
- Contains: JSON files mapping game objects to metadata
- Generated: No, manually curated or imported
- Committed: Yes

**assets/**
- Purpose: Template images and reference screenshots for UI recognition
- Contains: PNG files for button/icon matching, scenario detection
- Generated: No, created externally or extracted from game
- Committed: Yes

**logs/**
- Purpose: Runtime logs and debug artifacts
- Contains: Log files, screenshots, debug output
- Generated: Yes, during bot execution
- Committed: No

## Key File Locations

**Entry Points:**
- `main.py`: Main entry point - loads config, starts server, runs hotkey listener
- `web/index.html`: Web UI entry point - mounts React app
- `core/skeleton.py`: Bot training loop - called when hotkey pressed

**Configuration:**
- `config.json`: Active training config (created from template, edited via UI)
- `config.template.json`: Config schema and defaults
- `config/`: Directory containing preset config files

**Core Logic:**
- `core/state.py`: Game state collection via OCR and image recognition
- `core/strategies.py`: Training decision logic (mood, stats, timing)
- `core/actions.py`: Game action execution (clicks, navigation)

**Testing:**
- No dedicated test directory - unit/integration tests not found
- Debug mode via `--debug` CLI flag in `utils/log.py`

**UI Components:**
- `web/src/components/`: Tab-based sections (setup, events, races, skills, training, timeline)
- `web/src/ui/`: Primitive components (Button, Input, Dialog, etc.)

**Data & Reference:**
- `data/`: Game reference JSON files
- `assets/`: Template images for UI recognition
- `constants.py`: Screen coordinates, training positions, game timeline

## Naming Conventions

**Files:**
- Python modules: `snake_case.py` (e.g., `device_action_wrapper.py`, `core/state.py`)
- React components: `PascalCase.tsx` (e.g., `App.tsx`, `EventSection.tsx`)
- Config files: `config_N.json` for presets, `config.json` for active
- Template images: `descriptive_noun_btn.png` (e.g., `next_btn.png`, `training_btn.png`)

**Directories:**
- Python: `snake_case` (e.g., `core/`, `utils/`, `scenarios/`)
- React: `kebab-case` (e.g., `race-schedule/`, `skeleton/`, `set-up/`)
- Utility dirs: `plural_nouns` (e.g., `assets/`, `buttons/`, `icons/`)

**Classes & Functions:**
- Classes: `PascalCase` (e.g., `Action`, `Strategy`)
- Functions: `snake_case` (e.g., `collect_main_state()`, `do_training()`)
- Config globals: `UPPER_CASE` (e.g., `PRIORITY_STAT`, `TRAINING_STRATEGY`)

**Variables:**
- Public: `camelCase` (TypeScript) or `snake_case` (Python)
- Private/internal: `_leading_underscore` prefix
- Constants: `UPPER_CASE`

## Where to Add New Code

**New Feature (e.g., new training strategy function):**
- Primary code: `core/trainings.py` or new `core/new_feature.py`
- Strategy integration: Update `core/strategies.py:decide()` to call new function
- Config key: Add to `config.template.json` and `core/config.py:reload_config()`
- Tests: Add debug logging via `utils/log.py:debug()`

**New Game Action (e.g., new button interaction):**
- Implementation: `core/actions.py` as new function `def do_new_action(options):`
- Usage: Add `action.func = "do_new_action"` in `core/strategies.py` decision logic
- Template: Add button image to `assets/buttons/` directory

**New Configuration Option:**
- Schema: Add key to `config.template.json` with default value
- Python: Add `load_var()` call in `core/config.py:reload_config()`
- Web UI: Add input component in `web/src/components/set-up/SetUpSection.tsx` or relevant tab
- Type: Add property to `web/src/types/index.ts:Config` interface
- API: If setup-global, update `server/setup_store.py`

**Web UI Component:**
- File: Create in `web/src/components/feature_name/` directory
- Props: Use TypeScript interfaces from `web/src/types/`
- Styling: Use Tailwind CSS classes + `cn()` utility for merging
- Imports: Use `@/` path alias for absolute imports (configured in `tsconfig.json`)

**Game Reference Data:**
- New reference: Create JSON file in `data/` directory
- Format: Document structure in comments or README
- Loading: Import in relevant core module (e.g., `state.py`, `skill.py`)

**Shared Helper:**
- Shared logic: `utils/shared.py` for game-domain helpers
- Device abstraction: `utils/device_action_wrapper.py` for screen/input operations
- Constants: `utils/constants.py` for magic numbers, screen coordinates, mappings
- Tools: `utils/tools.py` for generic utilities (sleep, click, path handling)

## Special Directories

**assets/buttons/:**
- Purpose: Template PNG images for button location matching
- Generated: No, created externally or extracted from game
- Committed: Yes
- Usage: `device_action.locate_and_click("assets/buttons/training_btn.png")`

**assets/scenario_banner/:**
- Purpose: Scenario banners for scenario type detection
- Generated: No
- Committed: Yes
- Pattern: One PNG per scenario, named by scenario (e.g., `aoharu.png`, `ura.png`)

**config/:**
- Purpose: Directory containing preset training configs
- Generated: Yes, created when user saves new preset via web UI
- Committed: Yes (but users often have local modifications)
- Files: Multiple `config_N.json` files + `default.json`, `setup.json`

**logs/:**
- Purpose: Runtime logs and debug artifacts
- Generated: Yes, created during bot execution
- Committed: No (in `.gitignore`)
- Structure: `logs/f2/` for F2 device, timestamped log files

**scenarios/:**
- Purpose: Scenario-specific automation logic
- Generated: No
- Committed: Yes
- Example: `unity.py` for Unity Cup special handling

**web/dist/:**
- Purpose: Built/bundled web UI (JavaScript, HTML)
- Generated: Yes, by `vite build` command
- Committed: Yes (for server distribution)
- Triggering: `npm run build` or `npm run watch`

---

*Structure analysis: 2026-03-20*
