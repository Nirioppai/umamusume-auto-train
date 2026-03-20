# Codebase Concerns

**Analysis Date:** 2026-03-20

## Tech Debt

**Module State Management via Global Variables:**
- Issue: Multiple modules use module-level globals to maintain state across function calls
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\core\skeleton.py` (lines 85-92, 364), `C:\Active Codebase\UMA\umamusume-auto-train\core\state.py` (lines 21-24)
- Globals used: `aptitudes_cache`, `last_state`, `action_count`, `non_match_count`, `cached_templates`, `cached_unity_templates`
- Impact: Makes testing difficult, introduces hidden dependencies, unclear state mutations, potential race conditions in concurrent scenarios
- Fix approach: Refactor to class-based state management or dependency injection pattern. Create a `GameStateManager` class to encapsulate all mutable state. Pass state as constructor or method parameters rather than relying on global scope.

**Incomplete TODO Items:**
- Issue: Two explicit TODOs indicate known gaps in strategy logic
- Files:
  - `C:\Active Codebase\UMA\umamusume-auto-train\core\strategies.py` (line 28): "add support for last 3 turns not being wasted by resting"
  - `C:\Active Codebase\UMA\umamusume-auto-train\core\strategies.py` (line 299): "Add friend recreations to this evaluation"
- Impact: End-of-turn strategy may not be optimized; friend recreation evaluation incomplete affects decision quality
- Fix approach: Implement remaining strategy logic. Add comprehensive unit tests to verify the new behavior doesn't regress existing paths.

**Questionable Code Comment:**
- Issue: Unclear intent in state.py
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\core\state.py` (line 29): `#??? minimum_mood_junior_year = constants.MOOD_LIST.index(config.MINIMUM_MOOD_JUNIOR_YEAR)` — commented out line with unclear reason
- Impact: Dead code, potential confusion for maintenance
- Fix approach: Either restore with explanation if needed or remove. Document why it was disabled if removing.

**Inefficient State Detection:**
- Issue: Image-based detection for state checks requires multiple asset file lookups per frame
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\core\state.py` (lines 51-55)
- Pattern: Boolean state detection via `device_action.locate()` calls — simple file existence checks that could be optimized
- Impact: Unnecessary image scanning overhead; slow game state detection
- Fix approach: Cache template matches, implement debouncing, or add heuristic-based pre-checks before expensive locate() calls.

**Hardcoded Asset Paths Scattered Throughout:**
- Issue: Image asset paths hardcoded in multiple files
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\core\skeleton.py` (lines 40-51), `C:\Active Codebase\UMA\umamusume-auto-train\core\actions.py` (lines 74-88), `C:\Active Codebase\UMA\umamusume-auto-train\core\state.py` (multiple locations)
- Impact: Adding new assets or refactoring directory structure requires changes across multiple files; no single source of truth
- Fix approach: Create centralized `AssetRegistry` class or config dict in `C:\Active Codebase\UMA\umamusume-auto-train\utils\constants.py` that maps asset names to paths. Replace all hardcoded strings with registry lookups.

**Config Loading Pattern — Dynamic Global Mutation:**
- Issue: Configuration loaded via `globals()[var_name] = value` pattern
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\core\config.py` (lines 12-73)
- Impact: Makes config changes invisible to static analysis, difficult to track which globals are config-backed, impossible to know all available config keys without reading code, type safety lost
- Fix approach: Create `ConfigManager` dataclass that holds all config fields with type annotations. Load once at startup, pass as dependency. Document all required keys in one place.

## Known Bugs

**Potential Race Condition in Screenshot Caching:**
- Symptoms: Stale screenshots used in state detection, especially in rapid decision loops
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\utils\device_action_wrapper.py` (screenshot cache flush logic referenced in lines 35, 80, 96, etc.)
- Trigger: High-frequency action sequences that click multiple times without explicit cache flushes between decisions
- Current mitigation: Manual `flush_screenshot_cache()` calls scattered throughout code
- Risk: Easy to miss a flush point, leading to outdated game state detection

**Stat Gains OCR Retry Loop Without Upper Bound:**
- Symptoms: Game state reading hangs or times out unexpectedly
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\core\state.py` (line 347): recursive retry without clear termination condition beyond `attempts` parameter
- Trigger: Scenario where stat gains screenshot is consistently unreadable (UI corruption, resolution change, etc.)
- Workaround: Config-based attempt limits, dry-run mode to skip stat gain checks
- Risk: Infinite recursion possible if termination condition not properly enforced

**Config Key Mismatch at Runtime:**
- Symptoms: KeyError exceptions during config load, game initialization fails
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\core\config.py` (line 70-71): catches KeyError but message is not actionable at deploy time
- Trigger: config.json out of sync with config.template.json after upstream changes
- Current mitigation: User must manually copy missing keys from template
- Risk: Silent failures if new config keys added to code but not template

## Security Considerations

**No Input Validation on Game State Parsing:**
- Risk: OCR output used directly without bounds checking; malformed strings could crash decision logic
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\core\state.py` (lines 258-347 stat parsing, line 382-396 mood parsing)
- Current mitigation: Try-catch in some paths, but not comprehensive
- Recommendations: Add strict parsing guards, define valid value ranges (e.g., mood must be in MOOD_LIST), log parsing failures with context for debugging

**No Bounds Checking on Array Access:**
- Risk: Accessing `stat_screenshots[0]` without verifying list is non-empty
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\core\state.py` (line 299, array access after loop that might not populate it)
- Recommendations: Assert preconditions before array access, raise informative errors with game state context

**Direct Execution of Action Names via globals():**
- Risk: In `C:\Active Codebase\UMA\umamusume-auto-train\core\actions.py` (line 24): `globals()[self.func](self.options)` allows arbitrary function execution if func is user-controlled
- Current mitigation: Action names validated against fixed action set elsewhere
- Recommendations: Use explicit action dispatch dict instead of globals() lookup. Whitelist allowed action names.

## Performance Bottlenecks

**Image Template Matching on Every Frame:**
- Problem: Multiple `device_action.locate()` calls per decision cycle, each scans full screenshot
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\core\state.py` (lines 51-73), `C:\Active Codebase\UMA\umamusume-auto-train\core\skeleton.py` (template caching at lines 28-38, 54, 62)
- Cause: No spatial caching or region-of-interest optimization; templates re-searched on every call
- Improvement path:
  1. Implement region-of-interest based searches (templates for UI buttons typically appear in same screen areas)
  2. Cache match results between frames with TTL (e.g., 500ms)
  3. Profile to find hottest locate() calls and optimize those first

**OCR Processing on Every Training Display:**
- Problem: EasyOCR on full training stat regions multiple times per decision
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\core\state.py` (lines 75-109)
- Cause: Called for every training option evaluation; no caching of results between swipes
- Improvement path: Cache training stat OCR for duration of training menu open, invalidate on layout changes

**Recursive Retry Logic in Stat Gains Detection:**
- Problem: get_stat_gains() recursively retries without exponential backoff
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\core\state.py` (lines 258-349)
- Improvement path: Implement exponential backoff, add max retry limit with clear error reporting, profile to find why OCR fails

## Fragile Areas

**State Collection Functions — Tight Coupling to UI Layout:**
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\core\state.py` (all collection functions: lines 26-623)
- Why fragile: All functions depend on exact pixel positions, button locations, color values from constants (assumed to be in `C:\Active Codebase\UMA\umamusume-auto-train\utils\constants.py`)
- Safe modification:
  1. Always capture new game screenshots when UI layout changes
  2. Regenerate constants (colors, regions, button positions) against new layout
  3. Add visual regression tests comparing before/after OCR output
  4. Test coverage: Need comprehensive integration tests that capture real game state, not mocked screenshots

**Strategy Decision Logic — Multiple Interdependent Conditions:**
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\core\strategies.py` (lines 27-94)
- Why fragile: 27-step decision flow with nested conditions, state mutations from evaluate_training_alternatives(), dynamic action list modification
- Safe modification:
  1. Add detailed logging at each decision point (already present)
  2. Capture decision traces to `.planning/debug/` for analysis
  3. Unit test individual decision branches in isolation with mocked state
  4. Test coverage: Strategy testing is critical — test gaps here directly impact game outcome

**Training Data Fingerprinting — Brittle Equality Check:**
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\core\state.py` (lines 111-164)
- Why fragile: Heuristic-based detection of "all trainings locked" by comparing fingerprints; if game adds new training stat types, fingerprinting breaks
- Safe modification:
  1. When adding new stat types, update training_fingerprint() and is_valid_training() in lockstep
  2. Test with actual locked training scenarios
  3. Test coverage: Missing — should have unit tests for training lock detection

## Test Coverage Gaps

**No Unit Tests for State Collection:**
- What's not tested: Individual state collection functions (mood, turn, year, stats, aptitudes, energy)
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\core\state.py` (all collection functions)
- Risk: Changes to OCR logic, region constants, or parsing break silently — only caught by full integration runs
- Priority: **High** — these are critical game state detection paths

**No Unit Tests for Strategy Decisions:**
- What's not tested: Decision logic in `C:\Active Codebase\UMA\umamusume-auto-train\core\strategies.py`
- Risk: Training alternative evaluation, recreation vs rest vs training choices lack validation against expected behavior
- Priority: **High** — strategy is core to bot performance

**No Unit Tests for Configuration Loading:**
- What's not tested: Config reload, missing key detection, type conversion
- Files: `C:\Active Codebase\UMA\umamusume-auto-train\core\config.py`
- Risk: Config initialization failures only caught at runtime during full bot execution
- Priority: **Medium** — affects startup, not core logic

**No Integration Tests:**
- What's not tested: Full game turn loop, state → action → state transitions
- Risk: Regressions in interaction between modules (state + strategy + actions) invisible until manual testing
- Priority: **Medium** — requires game environment/mocking infrastructure

## Scaling Limits

**Single-Threaded Event Loop:**
- Current capacity: Processes one game frame decision per iteration; no parallelism
- Limit: Decision latency increases linearly with number of template matches and OCR calls
- Scaling path:
  1. Profile current decision time (measure end-to-end cycle)
  2. Consider async screenshot capture + OCR processing in background thread
  3. Implement decision pipeline: capture → process → decide → act, with parallel processing stages
  4. Risk: Async adds complexity and potential race conditions; profile first to confirm bottleneck

**Screenshot Cache Unbounded:**
- Current capacity: In-memory cache grows unbounded if flush logic is missed
- Limit: Memory exhaustion on very long bot runs
- Scaling path: Implement LRU cache with configurable size, add metrics to monitor cache size

**Config Value Distribution Across 50+ Global Variables:**
- Current capacity: Each config.json key becomes a module-level global
- Limit: Hard to add new configuration options, no validation, no type safety
- Scaling path: See earlier "Config Loading Pattern" tech debt item

## Missing Critical Features

**No Persistent Decision Logging for Audit Trail:**
- Problem: Individual decision context (state, alternatives considered, chosen action, outcome) not captured in structured format
- Blocks: Can't analyze decision quality, debug unexpected behavior, or replay scenarios
- Needed for: Advanced strategy tuning, root cause analysis of poor runs

**No Health Check / Sanity Validation Loop:**
- Problem: Bot proceeds with no verification that game state makes sense
- Blocks: Early detection of game crashes, UI layout changes, or unexpected conditions
- Needed for: Robustness in unattended runs

**No Atomic Config Reload:**
- Problem: Config changes require full bot restart
- Blocks: Dynamic tuning during runs, A/B testing of parameters
- Needed for: Real-time strategy optimization

## Dependencies at Risk

**EasyOCR Heavy Dependency:**
- Risk: Large model download on first use, slow GPU initialization, failures in resource-constrained environments
- Impact: OCR path failures cascade to state detection failures cascade to bot stop
- Migration plan: Implement fallback to lightweight Tesseract-based OCR for critical paths (mood, energy) and keep EasyOCR for optional features (stat gains). Graceful degradation on OCR failure.

**PyAutoGUI / ADB Action Mapping:**
- Risk: Tight coupling between action logic and input method (PyAutoGUI vs ADB)
- Impact: Adding new input method or fixing input bugs requires changes across action.py and device_action_wrapper.py
- Migration plan: Create `InputController` interface with `PyAutoGUIController` and `ADBController` implementations. Inject at startup, call uniform methods.

**Game Asset Templates (hardcoded paths):**
- Risk: Game UI updates break asset paths, new game client versions have different button locations
- Impact: State detection and action execution stop working
- Migration plan: See "Hardcoded Asset Paths" tech debt item. Centralize in asset registry with fallback paths.

---

*Concerns audit: 2026-03-20*
