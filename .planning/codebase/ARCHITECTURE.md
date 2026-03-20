# Architecture

**Analysis Date:** 2026-03-20

## Pattern Overview

**Overall:** Dual-stack automation system with Python backend automation engine and React/TypeScript web configuration UI

**Key Characteristics:**
- Server-driven architecture: FastAPI backend (`server/main.py`) provides configuration and theme APIs
- Decoupled control: Bot automation runs independently via hotkey listener thread, config applied from web UI
- State management: Three-layer decision system (state collection → strategy evaluation → action execution)
- Template-based training: Strategy engine uses timeline-based templates to decide training actions

## Layers

**Presentation (Web UI):**
- Purpose: Configuration management and bot control interface
- Location: `web/src/` (React 19 + TypeScript)
- Contains: Tab-based UI for setup, events, races, skills, training, timeline configuration
- Depends on: FastAPI server for config persistence, Tailwind CSS for styling
- Used by: End users via browser at `http://localhost:8001-8010`
- Framework: React with Radix UI primitives, TanStack Query for async state

**Configuration & Storage:**
- Purpose: Persist training strategy, race schedules, event choices, skill lists, setup parameters
- Location: `server/` (FastAPI + file-based storage)
- Contains: Config store (`config_store.py`), legacy migrations, theme loading, setup config handler
- Endpoints: `GET/POST /config/setup`, `GET /themes`, config file CRUD operations
- Depends on: `config.json` file, `config/` directory (preset files), `themes/` directory

**Automation Engine (Core):**
- Purpose: Screen automation, decision-making, action execution
- Location: `core/` (Python 3.10-3.14)
- Contains: State collection, strategy evaluation, action execution, OCR/recognizer, skill buying
- Key modules:
  - `skeleton.py`: Entry point for career training loop (`career_lobby`)
  - `state.py`: Game state collection (mood, turn, stats, aptitudes, energy)
  - `strategies.py`: Strategy class determines training/racing/resting decisions
  - `actions.py`: Atomic game actions (click buttons, perform trainings)
  - `recognizer.py`: Color-based UI recognition, brightness detection
  - `ocr.py`: Text extraction from game screen
  - `skill.py`: Skill purchasing logic
  - `events.py`: Event choice selection
  - `trainings.py`: Training data extraction, stat gains
- Depends on: PyAutoGUI for mouse/keyboard, OpenCV for image processing, ADB for mobile control
- Used by: Hotkey listener in `main.py`

**Utilities & Support:**
- Purpose: Shared helpers, logging, device control abstraction
- Location: `utils/` (Python)
- Contains: Constants, logging setup, ADB wrapper, device action abstraction, screenshot utilities, tool functions
- Key exports:
  - `constants.py`: Training positions, screen bounding boxes, mood/year timeline, race info
  - `device_action_wrapper.py`: Abstraction over PyAutoGUI/ADB for clicks, locates, screenshots
  - `log.py`: Structured logging with file/console output, debug mode support

## Data Flow

**Startup Flow:**

1. `main.py:start_server()` → launches FastAPI server on available port (8001-8010)
2. Hotkey listener thread starts, waits for F1/F2/etc press
3. User opens web UI in browser, loads `index.html`
4. Web UI fetches config from `/config/setup` and available presets
5. User configures settings, clicks "Apply Preset"
6. Config saved to `config.json` and setup globals stored by server
7. User presses F1 in-game
8. Hotkey listener calls `main():career_lobby()`

**Training Turn Flow:**

1. `skeleton.py:career_lobby()` initializes:
   - Loads strategy from `config.TRAINING_STRATEGY["timeline"]`
   - Initializes ADB or window focus
   - Caches template images for fast matching

2. State Collection (`state.py:collect_main_state()`):
   - Screenshot and OCR current mood
   - Extract turn number (e.g., "Turn 23")
   - Extract year/month (e.g., "Junior Year Early May")
   - Get current stat levels (Speed, Power, Stamina, etc.)
   - Get energy level (remaining/max)
   - Detect available events/race missions

3. Strategy Evaluation (`strategies.py:Strategy.decide()`):
   - Validate state has required fields
   - Get training template for current year from timeline
   - Read target stat set from template
   - Calculate stat gaps (target - current)
   - Evaluate action options: do_training, do_rest, do_recreation, do_race
   - Apply special logic: energy thresholds, mood management, status effects
   - Return Action object with selected function and modifiers

4. Action Collection (`state.py:collect_training_state()`):
   - Opens training menu
   - Iterates each training type (Speed, Power, etc.)
   - Extracts: stat gains, support card bonuses, random chance
   - Returns training_results dict with all options

5. Action Execution:
   - `actions.py` functions execute based on `action.func`:
     - `do_training(options)` → locate training button, click specified training type
     - `do_rest(options)` → click rest button
     - `do_recreation(options)` → select date event
     - `do_race(options)` → navigate race, select position

6. Post-action state refresh → loop continues

**State Management:**
- Config state: File-based (`config.json`), loaded once on startup, applied to globals in `core.config`
- Game state: Collected fresh each turn via OCR/color matching, not persisted
- Last action: Tracked in `skeleton.last_state` to detect UI changes
- Caches: Template images, aptitudes (refreshed at year boundaries)

## Key Abstractions

**Strategy (class):**
- Purpose: Encapsulates training decision logic per timeline
- Examples: `core/strategies.py:Strategy`
- Pattern: Configuration object `TRAINING_STRATEGY` contains `timeline` (year→template mapping) and `templates` (name→{target_stat_set, training_function, risk_profile})
- Usage: Loaded from config.json, instantiated in `career_lobby()`, called per turn via `strategy.decide(state, action)`

**Action (class):**
- Purpose: Represents a game action (training, rest, race) with options
- Examples: `core/actions.py:Action`
- Pattern: Constructor takes options dict, `run()` method dispatches to globals function, dict-like access via `__getitem__`/`__setitem__`
- Usage: Populated by strategy, executed by skeleton loop

**State Collection Functions:**
- Purpose: Extract game state via OCR + color matching
- Examples: `collect_main_state()`, `collect_training_state()`, `get_aptitudes()`, `get_training_data()`
- Pattern: Return `CleanDefaultDict` with nested dicts for stats, training results, aptitudes
- State shape: `{ current_mood, turn, year, energy_level, max_energy, current_stats: {speed, power, ...}, aptitudes, available_actions, ... }`

**Device Action Wrapper:**
- Purpose: Abstraction over PyAutoGUI (desktop) and ADB (mobile)
- Location: `utils/device_action_wrapper.py`
- Functions: `screenshot(region_xywh, region_ltrb)`, `locate_and_click(template, confidence, region)`, `click(target, duration)`, `multi_match_templates()`
- Selection: Uses `bot.use_adb` flag to route calls to ADB or PyAutoGUI

**Config Loading:**
- Purpose: One-time initialization of training strategy from JSON
- Location: `core/config.py:reload_config()` and `load_training_strategy()`
- Pattern: Config keys mapped to module-level globals (e.g., `PRIORITY_STAT`, `SKILL_LIST`, `TRAINING_STRATEGY`)
- Web integration: Served by `server/config_store.py`, persisted as `config.json` in project root

## Entry Points

**Bot Automation:**
- Location: `main.py:start_server()` → `hotkey_listener()` → `main():career_lobby()`
- Triggers: User presses hotkey (F1-F10 assigned dynamically)
- Responsibilities: Window focus, config load, strategy initialization, turn loop execution

**Web Configuration:**
- Location: `web/src/main.tsx` → `App.tsx`
- Triggers: Browser navigation to `http://localhost:<port>`
- Responsibilities: Load presets, render tabs, persist config changes, apply preset

**Server API:**
- Location: `server/main.py:app` (FastAPI)
- Triggers: Web UI fetch requests
- Responsibilities: Config CRUD, theme listing, setup config persistence

## Error Handling

**Strategy:** Try-catch in hotkey listener, state validation before decision, action fallback to `no_action`

**Patterns:**
- State validation: `Strategy.validate_state(state)` checks for required keys (mood, turn, year, energy_level)
- Action fallback: If no valid actions, `action.func = "skip_turn"` logged as warning
- OCR failures: Logged as error, may cause action to fail silently (e.g., training button not found)
- Image matching: Confidence threshold prevents false positives, `min_search_time` timeout prevents hangs
- Device errors: BotStopException raised by device wrapper, caught by skeleton loop to exit gracefully

## Cross-Cutting Concerns

**Logging:**
- Framework: Custom logger in `utils/log.py` with file + console output
- Levels: debug, info, warning, error
- Output: `logs/` directory with timestamped files
- Debug mode: `--debug` CLI flag controls verbosity

**Validation:**
- Config schema: `config.template.json` defines all keys, enforced by `reload_config()` KeyError catch
- State keys: `Strategy.validate_state()` checks required fields before decision
- Web input: TypeScript types in `web/src/types/` (Config, TrainingStrategy, etc.)

**Authentication:**
- None - localhost-only CORS restriction in FastAPI (`allow_origin_regex=^http://(localhost|127\.0\.0\.1)`)
- Web UI assumes single local user

**Performance:**
- Template caching: Images pre-loaded in `skeleton.cached_templates` dict to avoid disk reads
- State caching: Aptitudes cached in `state.aptitudes_cache`, refreshed only at year boundaries
- DP optimization: Strategy evaluation uses efficient stat-gap calculation, not full simulation

---

*Architecture analysis: 2026-03-20*
