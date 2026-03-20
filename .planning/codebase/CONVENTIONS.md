# Coding Conventions

**Analysis Date:** 2026-03-20

## Naming Patterns

**Files:**
- Python: `snake_case.py` (e.g., `device_action_wrapper.py`, `core/actions.py`)
- TypeScript/TSX: `PascalCase.tsx` for components (e.g., `EventList.tsx`, `App.tsx`)
- TypeScript: `camelCase.ts` for hooks and utilities (e.g., `useConfig.ts`, `index.ts`)
- CSS: `kebab-case.css` (e.g., `base.css`, `optimizer.css`)

**Functions:**
- Python: `snake_case` for all functions (e.g., `buy_skill()`, `is_skill_match()`, `do_training()`)
- TypeScript: `camelCase` for regular functions and hooks (e.g., `useConfig()`, `sanitizeFileName()`, `triggerToast()`)
- React components: `PascalCase` (e.g., `EventList()`, `App()`)

**Variables:**
- Python:
  - Global constants: `UPPER_CASE` (e.g., `SLEEP_TIME_MULTIPLIER`, `PRIORITY_STAT`)
  - Module-level state: `snake_case` (e.g., `is_bot_running`, `use_adb`, `hotkey`)
  - Local variables: `snake_case` (e.g., `previous_action_count`, `shopping_list`)
- TypeScript:
  - Constants: `UPPER_CASE` or `camelCase` depending on scope
  - State and regular vars: `camelCase` (e.g., `selected`, `eventSelected`, `toast`)
  - Type definitions: `PascalCase` (e.g., `EventData`, `Config`)

**Types:**
- TypeScript: `PascalCase` for interfaces and types (e.g., `EventChoicesType`, `EventData`, `Props`)
- Zod schemas: `PascalCase` + `Schema` suffix (e.g., `ConfigSchema`, `RaceScheduleSchema`)

## Code Style

**Formatting:**
- No explicit formatter configured in this codebase
- Implied style: 2-space indentation (observed in TSX/JSON files)
- Python uses 2-space indentation as well

**Linting:**
- TypeScript/Web: ESLint configured via `web/eslint.config.js`
  - Uses `@eslint/js` (JavaScript recommended rules)
  - Uses `typescript-eslint` (TypeScript recommended rules)
  - Uses `eslint-plugin-react-hooks` (React Hooks rules)
  - Uses `eslint-plugin-react-refresh` (React Refresh rules)
- Run command: `npm run lint` (from `web/package.json`)
- Python: No formal linter configured (pre-commit hooks in `.githooks/` but no linting rules observed)

## Import Organization

**TypeScript Order:**
1. React hooks and utilities (e.g., `import { useState } from "react"`)
2. Third-party libraries (e.g., `import { Badge } from "../ui/badge"`)
3. Type imports (e.g., `import type { EventData } from "@/types/event.type"`)
4. Local component imports (e.g., `import EventList from "./_c/EventList/Main"`)
5. Local utility/hook imports (e.g., `import { useConfig } from "./hooks/useConfig"`)

**Path Aliases:**
- `@/` prefix used for absolute imports from `src/` directory (e.g., `@/types/event.type`, `@/components/_c/Tooltips`)
- Relative imports for same-directory access (e.g., `../ui/badge`, `./_c/EventList/Main`)

**Python Order:**
1. Standard library imports (e.g., `import json`, `import logging`)
2. Third-party library imports (e.g., `import pyautogui`, `import Levenshtein`)
3. Local module imports (e.g., `import utils.constants as constants`, `import core.config as config`)
4. Module-level state/constants after imports (e.g., `previous_action_count = -1`)

## Error Handling

**Patterns:**
- **Python**: Exception handling with specific exception types:
  - `KeyError` for missing config keys (e.g., `core/config.py` line 70)
  - `ValueError` for invalid data states (e.g., `core/skeleton.py`)
  - `RuntimeError` for critical failures (e.g., config loading failure)
  - Exception logged with `error()` wrapper function before re-raising or returning False
- **TypeScript**: Try-catch blocks in async functions with error logging to `console.error()`:
  - Example: `web/src/hooks/useConfig.ts` lines 17-31 (HTTP error handling)
  - User-facing errors via `triggerToast()` utility function
- **Default returns**: Functions return `False` on error (Python) or empty state (TypeScript)

## Logging

**Framework:** Python uses `logging` module with custom wrappers in `utils/log.py`

**Patterns:**
- Import log functions: `from utils.log import info, warning, error, debug`
- Log functions available: `info()`, `warning()`, `error()`, `debug()`
- All logging functions are wrappers that auto-format floats to 2 decimals using regex
- Logging levels: DEBUG and INFO (configured via `--debug` argument in `utils/log.py`)
- Format: Functions pre-pend `[DEBUG]`, `[INFO]`, etc. in console output
- Log files: Rotated file handler configured in `init_logging()` (logs in `logs/` directory)

**TypeScript:**
- No structured logging framework observed
- Uses `console.error()` for catching and reporting errors
- Toast notifications for user-facing messages via `triggerToast()` hook

## Comments

**When to Comment:**
- Class docstrings used for complex data structures (e.g., `CleanDefaultDict` in `utils/shared.py` has extensive docstring explaining behavior)
- Inline comments for non-obvious logic or workarounds (e.g., "Key is created here for chaining" in `__setitem__`)
- TODO comments for incomplete features (e.g., `core/strategies.py` lines indicate future work)

**JSDoc/TSDoc:**
- Not consistently used in this codebase
- Type information captured via TypeScript types instead
- Function signatures are relied upon for documentation

## Function Design

**Size:** Functions generally 10-50 lines; core loops can exceed 100 lines
- Example: `buy_skill()` in `core/skill.py` is ~70 lines with nested loops
- Action functions in `core/actions.py` are 5-20 lines for focused tasks

**Parameters:**
- Python functions accept `options` dict or `state` dict for flexibility
  - Example: `do_training(options)` unpacks from `options["training_name"]`
  - Example: `buy_skill(state, action_count, race_check=False)` with defaults
- TypeScript functions use typed props objects:
  - Example: `Props` type in `EventList.tsx` explicitly lists required props
  - Destructuring in function signature (e.g., `function EventList({ data, groupedChoices, ... }: Props)`)

**Return Values:**
- Python: Functions return `bool` (success/failure), `None`, or data structures
  - Actions return `False` on failure, `True`/`None`/data on success
  - No explicit null returns observed; `None` used for optional values
- TypeScript: Functions return Promise<void> for async operations, JSX for components
  - Hooks return object with state and handlers (e.g., `{ config, setConfig, saveConfig, toast }`)

## Module Design

**Exports:**
- **Python**: No explicit `__all__` observed; modules export all public functions and classes
- **TypeScript**: Named exports (e.g., `export default function EventList()`, `export function useConfig()`)
- Type-only exports: `export type Config = z.infer<typeof ConfigSchema>`

**Barrel Files:**
- TypeScript: `types/index.ts` re-exports all type definitions from subdirectories
- No Python barrel files observed; modules import directly from specific files

## Structural Patterns

**Class Usage:**
- Python: Minimal class usage observed. Primary class is `Action` in `core/actions.py` (lines 16-50):
  - Encapsulates function name and options
  - Methods: `run()` (executes function), `get()` (safe option access), `__repr__()`, `__str__()`
  - No inheritance patterns observed
- Python utility class: `CleanDefaultDict` in `utils/shared.py` extends `dict` with recursive creation and numeric-zero behavior
- TypeScript: No classes observed; function-based and hook-based patterns used exclusively

**Async Patterns:**
- Python: Synchronous functions with explicit `sleep()` waits from `utils.tools`
- TypeScript: Async/await for API calls (e.g., `useConfig.ts` line 16: `const res = await fetch()`)

## Configuration Conventions

**Python Config:**
- Loaded once at startup via `config.reload_config()` in `main.py`
- Config values exposed as module-level globals: `PRIORITY_STAT`, `USE_ADB`, etc.
- Values loaded via `load_var(name, value)` which uses `globals()[name] = value`
- Config structure uses snake_case keys matching Python module constants

**TypeScript Config:**
- Zod schema validation (`ConfigSchema`) in `types/index.ts`
- Config state managed by `useConfig()` hook
- Types inferred from schema: `export type Config = z.infer<typeof ConfigSchema>`

---

*Convention analysis: 2026-03-20*
