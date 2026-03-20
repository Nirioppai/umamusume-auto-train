# Technology Stack

**Analysis Date:** 2026-03-20

## Languages

**Primary:**
- Python 3.10-3.13 - Backend automation, image processing, OCR, bot logic
- TypeScript ~5.8.3 - Frontend web application
- JavaScript - Build and dev tooling

**Secondary:**
- CSS - Styling with Tailwind
- JSON - Configuration and data files

## Runtime

**Backend:**
- Python 3.10-3.13 (enforced via `main.py` launcher)

**Frontend:**
- Node.js (via npm) - Development and build

**Desktop Integration:**
- Windows-native APIs for window management and automation
- ADB (Android Debug Bridge) - Optional mobile device control

## Package Managers

**Backend:**
- pip (Python package manager)
- Lockfile: `requirements.txt` (pinned versions)

**Frontend:**
- npm
- Lockfile: Not visible in listing (implicit `package-lock.json`)

## Frameworks

**Backend Server:**
- FastAPI 0.116.1 - REST API server with CORS support
- Uvicorn 0.35.0 - ASGI application server

**Frontend UI:**
- React 19.1.0 - Component-based UI framework
- Vite 7.0.4 - Build tool and dev server

**Testing:**
- Not detected - No test runners or frameworks found

**Build/Dev:**
- Vite 7.0.4 - Frontend bundler
- TypeScript Compiler 5.8.3 - Type checking
- ESLint 9.30.1 - Code linting
- Tailwind CSS 4.1.11 - Utility-first styling

## Key Dependencies

### Frontend (Critical)

- **React 19.1.0** - UI framework
- **Vite 7.0.4** - Build tool with HMR support
- **TypeScript 5.8.3** - Static typing
- **@tanstack/react-query 5.90.5** - Data fetching and caching
- **@tanstack/react-query-persist-client 5.90.7** - Query persistence to localStorage
- **Tailwind CSS 4.1.11** - Styling framework
- **@radix-ui/* 1.3.x-2.2.x** - Accessible component library (checkbox, dialog, radio, select, tabs, tooltip)
- **@dnd-kit/core 6.3.1** - Drag-and-drop functionality
- **@dnd-kit/sortable 10.0.0** - Sortable list enhancement
- **cmdk 1.1.1** - Command/search input component
- **lucide-react 0.541.0** - Icon library
- **zod 4.1.12** - Schema validation
- **clsx 2.1.1** - Classname utility

### Backend (Critical)

- **FastAPI 0.116.1** - HTTP API framework
- **Uvicorn 0.35.0** - ASGI server
- **Pydantic 2.11.7** - Data validation
- **PyAutoGUI 0.9.54** - Screen automation (pixel location, clicks)
- **PyGetWindow 0.0.9** - Window management
- **PyMsgBox 1.0.9** - Message boxes
- **PyScreeze 1.0.1** - Screenshot capture (uses PIL under hood)
- **keyboard 0.13.5** - Global keyboard hotkey listener
- **mss 10.0.0** - Fast screenshot capture

### Computer Vision & Image Processing

- **OpenCV (opencv-python) 4.12.0.88** - Image processing, template matching
- **opencv-python-headless 4.12.0.88** - Server-side variant
- **EasyOCR 1.7.2** - Text recognition from screenshots
- **PyTorch 2.7.1** - Deep learning (used by EasyOCR)
- **torchvision 0.22.1** - Computer vision models
- **torchaudio 2.7.1** - Audio processing
- **scikit-image 0.25.2** - Image algorithms
- **Pillow 11.3.0** - Image operations
- **imageio 2.37.0** - Image I/O

### Data & Processing

- **NumPy 2.2.6** - Numerical computing
- **SciPy 1.15.3** - Scientific computing
- **Pygame 2.6.1** - Game/graphics library (unused/legacy)

### Fuzzy Matching & String Processing

- **Levenshtein 0.27.1** - String similarity
- **RapidFuzz 3.13.0** - Fast fuzzy string matching
- **python-bidi 0.6.6** - Bidirectional text support

### Utilities & System

- **Click 8.2.1** - CLI argument parsing
- **PyYAML 6.0.2** - YAML file handling
- **adbutils 2.10.2** - Python ADB client for Android device control
- **Jinja2 3.1.6** - Template rendering

### Development Dependencies (Frontend)

- **@vitejs/plugin-react 4.6.0** - React support in Vite
- **@tailwindcss/vite 4.1.11** - Tailwind CSS Vite plugin
- **eslint-plugin-react-hooks 5.2.0** - React hooks linting
- **eslint-plugin-react-refresh 0.4.20** - Vite React refresh validation
- **typescript-eslint 8.35.1** - TypeScript linting

## Configuration

**Environment:**
- `.env` files (presence confirmed, contents not read per security policy)
- Environment configuration: `config.json` (main) and `config.template.json` (template reference)
- Setup configuration stored separately in `/config/setup` API

**Build:**
- `vite.config.ts` - Vite configuration with React plugin and Tailwind support
- `tsconfig.json` - TypeScript path alias mapping (`@/*` → `./src/*`)
- `eslint.config.js` - ESLint configuration (TypeScript support, React hooks)
- `web/package.json` - Frontend package definition with scripts: dev, build, watch, lint, preview
- `pyproject.toml` - Python project metadata (requires Python 3.10-3.13)
- `requirements.txt` - Python dependency pinning

## Platform Requirements

**Development:**
- Python 3.10-3.13 (enforced via launcher in `main.py`)
- Node.js (implicit from npm)
- Windows OS (PyGetWindow, PyAutoGUI are Windows-native)

**Production/Deployment:**
- Python 3.10-3.13 runtime
- Windows OS for desktop automation features
- Optional Android device for ADB control
- Browser for web UI (no specific version requirements detected)

**Display:**
- Minimum resolution 1920x1080 (enforced in `main.py` window focus logic)
- Screen capture via MSS or PyScreeze
- OpenCV template matching on captured frames

## Build Output

- Frontend build: `web/dist/` directory
- Single-file JS output: `app.js` (via Vite rollupOptions)
- CSS assets: `assets/[name].[ext]` pattern
- No minification in build (set in `vite.config.ts`)

---

*Stack analysis: 2026-03-20*
