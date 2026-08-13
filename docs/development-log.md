# Duolingo Fullstack Clone — Development Log

## Phase 0 — Project Audit
Status: Complete

Record:
- The original project contained only: `node_modules`, `package.json`, `package-lock.json`.
- No application code or Git repository existed.

## Phase 1 — Project Foundation
Status: Complete

### Objective
Establish the monorepo architecture with a clear separation between a Next.js frontend and a FastAPI backend.

### Architecture Decisions
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, ESLint. Separated in `frontend/`.
- **Backend**: FastAPI, Uvicorn, SQLAlchemy, Pydantic, SQLite. Separated in `backend/`.
- **Version Control**: Git initialized at the root level with a comprehensive `.gitignore` properly excluding node_modules and Python venvs.

### Dependencies
- Frontend: `next`, `react`, `react-dom`, `tailwindcss`, `eslint`.
- Backend: `fastapi[standard]`, `uvicorn`, `sqlalchemy`, `pydantic`, `pytest`, `httpx`.

### Tests
- Backend `GET /api/health` automated test using pytest and TestClient.
- Frontend linting.

### Files Created
- `frontend/` scaffolding
- `backend/` scaffolding with basic modular architecture
- `.gitignore` (Root)
- `README.md` (Root)
- `docs/development-log.md`

### Verification Results
- Backend automated test passed (pytest).
- Frontend linting passed (eslint).
- FastAPI backend started successfully on port 8000 and responded to `GET /api/health` with `{"status": "ok"}` (200 OK).
- Next.js frontend started successfully on port 3000 and responded with 200 OK.
- Git status is clean and `.gitignore` properly excludes `node_modules` and `venv`.

### Git Commit
- Ready for initial commit.

### Known Issues
- None yet.

### Next Step
- Proceed to Phase 2 (Design System/Implementation).

## Phase 2 — Database, Seed Data and Core API Foundation
Status: Complete

### Database Architecture
- SQLite with SQLAlchemy 2.x ORM.
- Models organized modularly in `backend/app/models/`.
- Pydantic v2 used for schema validation and response formatting.

### Entity Relationships
- `User` (1:1) `UserStats`
- `Course` (1:N) `Unit` (1:N) `Skill` (1:N) `Lesson` (1:N) `Exercise`
- `User` (1:N) `UserSkillProgress` (M:1) `Skill`
- `User` (1:N) `UserLessonProgress` (M:1) `Lesson`

### Seed Data
- Deterministic seeding script (`seed.py`).
- 1 Demo Learner
- 1 Course ("English for Beginners")
- 3 Units, 6 Skills, 12 Lessons, 60 Exercises.
- Progression state features an unlocked, in-progress, completed, and locked skill.

### API Endpoints
- Standard GET endpoints for all entities.
- `/api/users/{id}/learning-path` computes and returns course progression, unlocking logic, and skill crowns in a single frontend-friendly response.
- `GET /api/health` works as established in Phase 1.

### Progression Logic
- Deterministic progression logic: the first skill starts unlocked; completing a skill unlocks the next skill sequentially.

### Testing Results
- 13 passed tests using `pytest` and an in-memory SQLite database.
- Confirmed explicit 404 responses and database uniqueness constraints.

### Important Decisions
- Options for `Exercise` are stored as JSON text for SQLite compatibility.
- `UserStats` contains aggregated counts like `lessons_completed`.

### Known Limitations
- Hardcoded IDs are used for fetching seeded data.
- No real authentication; assumes `user_id = 1` for the demo learner.
- Simple sequential progression, not full graph progression.

### Next Phase
- Phase 3 (Design System and Frontend Implementation).

## Phase 3 — Design System and Core Frontend App Shell
Status: Complete

### Architecture & Tokens
- **Design Principles**: UI/UX Pro Max principles implemented.
- **Tokens**: Expanded `globals.css` with deep semantic color palette (Brand, Accents, Status, Neutrals), shadows, and border radii matching a playful, gamified learning language.
- **Typography**: Replaced default fonts with `Nunito` for a rounded, accessible, educational feel.
- **Dependencies**: Added `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`.

### Component Structure
- **UI Primitives (`src/components/ui/`)**: Built strictly tactile, reusable components (`Button`, `IconButton`, `Card`, `StatPill`, `ProgressBar`, `ProgressRing`, `Badge`, `EmptyState`, etc.).
- **Interactive States**: Full support for hover, focus, active/pressed (Framer Motion scale down), and disabled states.
- **Motion (`src/components/motion/`)**: Added `PageTransition` wrapper gracefully handling `prefers-reduced-motion` without forcing a global client boundary.
- **Illustrations (`src/components/illustrations/`)**: Implemented original vector components (`Logo.tsx`, `MascotPlaceholder.tsx`).

### Application Shell
- **Responsive Navigation**: Implemented `Sidebar` (Desktop) and `MobileNav` (Bottom fixed navigation for mobile/tablet).
- **TopStats Header**: Configured standard `StatPill` components accepting dynamic props (ready for API hookup).
- **Layout Constraints**: The `main` content area is centrally constrained to a `max-w-4xl` layout to let the upcoming learning path breathe.

### Routes
- Created polished placeholders for `/` (Home), `/leaderboard`, `/quests`, `/profile`, `/shop`, and `/settings`.

### Backend Interoperability
- Did NOT implement complex mutations or gamification engines.
- `types/api.ts` maps directly to FastAPI Python schemas.
- `api.ts` client expanded with proper TypeScript validation.
- All 13 backend pytest tests remain passing.

### Next Phase
- Phase 4 (Guided Learning Path and Component Data Wiring).

## Phase 4 — Guided Learning Path and Real API Data Wiring
Status: Complete

### Architecture & Data Wiring
- **`api.ts` Extension**: Real backend calls implemented using strict `User`, `Course`, `LearningPath`, and `Skill` TypeScript interfaces matched with FastAPI schemas.
- **TopStats Data Fetching**: Created `LayoutStats.tsx` as a client-side wrapper in `layout.tsx` to fetch `GET /api/users/1` and pass `streak`, `xp`, `hearts`, and `gems` down to the pure presentational `TopStats` component, without polluting the server layout.
- **Learning Path Orchestration**: Created `LearningPathContainer.tsx` to manage data fetching (`GET /api/users/1/learning-path`), loading skeletons, and error retries, keeping `page.tsx` extremely thin.

### Presentational Components
- **`CourseHeader.tsx`**: Dynamic header displaying the course's name and description.
- **`UnitSection.tsx`**: Component that maps through backend units, varying background colors per unit and structuring the skills hierarchy.
- **`SkillNode.tsx`**: Interactive circular SVG node rendering the `ProgressRing`. Implemented four visually distinct states: `Completed`, `In-Progress`, `Available` (with subtle pulse animation), and `Locked` (muted/grayscale).
- **`PathConnector.tsx`**: A genuinely responsive SVG connector implementation utilizing `viewBox` and `preserveAspectRatio="none"` to draw winding lines between nodes without horizontal overflow across any viewport size (375px to 1920px).
- **`Modal.tsx` & `SkillPreviewModal.tsx`**: An accessible, keyboard-trappable modal utilizing `framer-motion` for entrance/exit animations.

### Strict Boundaries Maintained
- No lesson execution, XP mutation, or game mechanics were implemented.
- The 13 existing backend tests remained untouched and continue to pass perfectly.

### Next Phase
- Phase 5 (Lesson Engine and Interactive Exercises).


## Phase 5: Lesson Engine and Interactive Exercise Player
- **Date**: 2026-08-13
- **Summary**: Implemented the core interactive lesson player. Updated the database seed with realistic English-learning content for all six exercise types (multiple_choice, translate, word_bank, match_pairs, fill_blank, type_answer). Built the LessonPlayer state machine on the frontend and client-side deterministic answer validation (evaluateAnswer.ts). Implemented two new API endpoints (
ext-lesson and update-progress) ensuring idempotency without mutation of external gamification states (XP/hearts/streaks). All 15 backend tests pass and frontend lint passes.
