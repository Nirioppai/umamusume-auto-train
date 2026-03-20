# External Integrations

**Analysis Date:** 2026-03-20

## APIs & External Services

**Android Debug Bridge (ADB):**
- **Service:** adbutils 2.10.2 Python client
- **Purpose:** Optional Android device control for running Umamusume on emulator or physical device
- **Usage:** Initialization via `utils.adb_actions.init_adb()`, toggled with `USE_ADB` config flag
- **When used:** Replaces Windows window focus logic when `bot.use_adb = True`
- **Configuration:**
  - `DEVICE_ID` in config (device identifier)
  - Runtime flag: `--use-adb <device_id>`

**Game API/Web Services:**
- Not detected - Application appears to be client-side automation only
- No external HTTP calls to game servers detected
- Data scraping via web tools (see `devtools/scrape_races.py` uses requests library)

## Data Storage

**Local Filesystem Only:**
- Configuration: `config.json` (JSON file-based)
- Presets: `data/` directory (file-based storage via `server/config_store.py`)
- Events data: `data/events.json`
- Races data: `data/races.json`
- Themes: `themes/` directory (custom theme JSON files)
- Logs: `logs/` directory
- Screenshots/assets: `assets/` directory

**No Cloud Storage:**
- Application uses only local filesystem
- No database (SQLite, PostgreSQL, MongoDB, etc.)
- No cloud providers (AWS, Google Cloud, Azure)

**Browser localStorage:**
- Used for theme preference (`localStorage.theme`)
- Used for application state backup (JSON serialization)
- Persisted via React Query persist client (`@tanstack/react-query-persist-client`)

## Authentication & Identity

**Auth Model:**
- Localhost-only CORS access
- No user authentication system detected
- No login/logout mechanism

**Security Measures:**
- CORS restricted to `http://localhost` and `http://127.0.0.1` on any port
- Path validation: `safe_resolve()` blocks directory traversal (`../../` attacks)
- Filename validation: `safe_name()` regex restricts to alphanumeric, hyphen, underscore

**Server Location:**
- Application runs on `127.0.0.1` (localhost only)
- Port auto-detection: tries ports 8001-8009 sequentially
- UI accessible via `http://localhost:<port>`

## Monitoring & Observability

**Error Tracking:**
- Not detected - No third-party error tracking (Sentry, Rollbar, etc.)

**Logs:**
- Python backend: File-based logging via `utils.log` module
- Log output: `logs/` directory
- Levels: debug, info, warning, error
- Format: Custom logger with colors (via logging module + colorama)

**Console/Debug:**
- Frontend: Native browser `console.error()` for client-side exceptions
- Backend: Print statements and logging module

**Performance Monitoring:**
- Not detected

## CI/CD & Deployment

**Hosting:**
- Application is self-hosted locally
- No cloud deployment (not a SaaS application)
- Desktop application running on user's machine

**CI/CD Pipeline:**
- Not detected
- No GitHub Actions, Jenkins, or other CI systems found
- Manual version management via `version.txt` file

**Build Process:**
- Frontend: `npm run build` (Vite build command in `web/package.json`)
- Backend: No build step (Python source files run directly)
- Version sync: `sync-version.js` script (called in watch mode)

## Environment Configuration

**Required Environment Variables:**
- `.env` file present (not examined per security policy)
- Configuration loaded via `config.json` and API store

**Configuration Via UI:**
- Setup config API: `GET/POST /config/setup`
- Main config API: `GET/POST /config`
- Theme API: `GET/POST /theme/<name>`
- Config presets: CRUD via `/configs` endpoints

**Key Configuration Areas:**
- Bot behavior (sleep multipliers, window names)
- ADB settings (device ID, use_adb flag)
- OCR settings (GPU usage for EasyOCR)
- Notifications (enabled, volume, types)
- Training/race/skill parameters

## Webhooks & Callbacks

**Incoming Webhooks:**
- Not detected

**Outgoing Webhooks:**
- Not detected

## HTTP API Endpoints

**Server:** FastAPI application in `server/main.py`

**Configuration Endpoints:**
- `GET /config` - Retrieve current configuration
- `POST /config` - Update configuration
- `GET /config/setup` - Get setup-specific config
- `POST /config/setup` - Save setup config
- `GET /config/applied-preset` - Get currently applied preset ID
- `POST /config/applied-preset` - Set applied preset

**Preset Management:**
- `GET /configs` - List all saved config presets
- `POST /configs` - Create new preset
- `GET /configs/{name}` - Get specific preset
- `PUT /configs/{name}` - Update preset
- `DELETE /configs/{name}` - Delete preset
- `POST /configs/{name}/duplicate` - Clone preset

**Theme Endpoints:**
- `GET /themes` - List all themes (custom + default)
- `GET /theme/{name}` - Get theme JSON
- `POST /theme/{name}` - Save custom theme

**Data & Search:**
- `GET /data/{path:path}` - Serve files from `data/` directory
- `GET /event/{text}` - Search events by keyword

**Static Files:**
- `GET /` - Serve `web/dist/index.html`
- `GET /{path:path}` - Serve static assets from `web/dist`
- `GET /version.txt` - Serve version number

**Notifications:**
- `GET /notifs` - List available notification audio files

## Data Fetching (Frontend)

**HTTP Client:**
- Native `fetch()` API (no axios or custom HTTP library)
- Cache busting: `{ cache: "no-store" }` on version and config requests

**React Query Integration:**
- Library: `@tanstack/react-query 5.90.5`
- Persistence: `@tanstack/react-query-persist-client` + `@tanstack/query-async-storage-persister`
- Used in components: EventListSection, EventSection, RaceSchedule, SkillList
- Query keys and refetch strategies configured per component

**Data Endpoints Called:**
- `/config/setup` - Setup configuration fetch
- `/themes` - Theme list
- `/theme/{name}` - Individual theme
- `/data/events.json` - Event choices and decisions
- `/data/races.json` - Race schedule data
- `/data/skills_all.json` - Skills metadata (inferred from CLAUDE.md)
- `/version.txt` - Version check

## File Operations

**CSV/JSON Data Sources:**
- `assets/uma_skills.csv` - Skill database (from CLAUDE.md context)
- `skills_all.json` - Skill metadata with costs and versions
- `data/events.json` - Event choice data
- `data/races.json` - Race schedule
- Config files: JSON format

**File Upload/Download:**
- Export config: `exportOldConfigs()` creates Blob and downloads as JSON
- Import config: Via file input (implementation in `useImportConfig` hook)
- Screenshot assets: Loaded from `assets/buttons/` for template matching

## Security & CORS

**CORS Configuration:**
- Origin regex: `^http://(localhost|127\.0\.0\.1)(:\d+)?$`
- Allows credentials
- Allows all methods (`["*"]`)
- Allows all headers (`["*"]`)

**API Security:**
- Localhost-only restriction (only accessible from same machine)
- Path resolution validation to prevent directory traversal
- Filename validation regex (alphanumeric + hyphen/underscore only)

**Data Privacy:**
- All data stored locally (no remote transmission)
- Browser DevTools accessible (no obscuration)
- No analytics or telemetry detected

---

*Integration audit: 2026-03-20*
