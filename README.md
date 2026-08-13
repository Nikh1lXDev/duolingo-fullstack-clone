# Duolingo Full-Stack Clone

A full-stack learning platform web application built with FastAPI and Next.js, featuring interactive language lessons, gamified learning mechanics, server-side session authentication, and dynamic user progress tracking.

---

## 🌟 Features

- **Interactive Learning Path**: Multi-unit course progression with visual skill nodes, crown progression, and locked/unlocked state mechanics.
- **Dynamic Lesson Engine**: Interactive exercise engine supporting 6 distinct exercise types:
  - `multiple_choice`
  - `translate`
  - `word_bank`
  - `match_pairs`
  - `fill_blank`
  - `type_answer`
- **Gamification System**:
  - **Hearts System**: 5-heart maximum, automatic deduction on incorrect answers, heart regeneration, and gem refill.
  - **XP & Daily Goals**: XP earned per completed lesson with daily XP target progress tracking.
  - **Streaks**: Automatic daily streak calculation and tracking based on user activity dates.
  - **Gems & Shop**: In-game currency system with a Shop for heart refills.
- **Leaderboard**: Real-time rank calculation comparing users by total XP and streak metrics.
- **Quests System**: Dynamic daily quests (e.g., Earn 20 XP, Complete 3 Lessons) tracking active progress.
- **Secure Server-Side Session Authentication**:
  - Argon2 password hashing via `pwdlib`.
  - Database-backed opaque session tokens (`auth_sessions` table storing SHA-256 token hashes).
  - HttpOnly `duolingo_session` cookies with `SameSite=Lax` and configurable expiration.
  - Backend-authoritative `/api/users/me/*` routes using FastAPI's `get_current_user` dependency.
  - User isolation ensuring private, authenticated access to profile, settings, and progress data.
- **User Settings & Preferences**: Persistent preferences (sound toggle, notifications, learning language) with cross-user isolation.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI
- **ASGI Server**: Uvicorn
- **ORM**: SQLAlchemy 2.x
- **Validation**: Pydantic v2
- **Password Hashing**: `pwdlib` with Argon2 backend
- **Database**: SQLite (`duolingo.db`)
- **Testing**: Pytest

---

## 📁 Architecture Overview

```
Duolingo/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI route handlers (auth, users, courses, lessons, etc.)
│   │   ├── core/         # Security, config, password hashing, database session
│   │   ├── models/       # SQLAlchemy ORM models (User, AuthSession, UserStats, UserSettings, Course, etc.)
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   └── services/     # Business logic (gamification, auth, settings)
│   ├── tests/            # Pytest test suite (69 test cases)
│   └── duolingo.db       # SQLite database (git-ignored)
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js App Router pages (/, /login, /signup, /profile, /quests, /leaderboard, /shop, /settings, /lesson/[lessonId])
│   │   ├── components/   # React components (layout, learning-path, lesson, exercise types, ui)
│   │   ├── context/      # AuthContext for session management
│   │   ├── lib/          # API client (fetch wrapper with credentials: "include")
│   │   └── types/        # TypeScript type definitions
│   └── package.json
├── docs/                 # Architecture & feature documentation
└── README.md
```

---

## 🔒 Security Architecture

- **Session Management**: Opaque random session tokens are generated on login/registration, sent to the browser via HttpOnly cookie, and hashed with SHA-256 before storage in SQLite.
- **Identity Isolation**: Frontend sends `credentials: "include"` on API calls. The backend resolves the logged-in user through `get_current_user()` and serves `/api/users/me/*` endpoints, preventing unauthorized access across user accounts.
- **No Client Storage**: Authentication credentials and tokens are NEVER stored in `localStorage`, `sessionStorage`, or client-side JavaScript.

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Backend Setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

#### Seed Database
```powershell
python -m app.db.seed
```

#### Run Backend Server
```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API will be available at `http://127.0.0.1:8000` (OpenAPI docs at `http://127.0.0.1:8000/docs`).

### 2. Frontend Setup

```powershell
cd frontend
npm install
```

#### Run Development Server
```powershell
npm run dev
```
The frontend application will be available at `http://localhost:3000`.

---

## 🧪 Testing & Production Build

### Backend Tests
Run the comprehensive Pytest suite (69 test cases):
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pytest -v
```

### Frontend Linting
```powershell
cd frontend
npm run lint
```

### Frontend Production Build
```powershell
cd frontend
npm run build
npm run start
```

---

## 🔑 Environment Variables & Configuration

### Backend (.env / Defaults)
- `SECRET_KEY`: Secret string for cryptographic operations.
- `SESSION_EXPIRE_DAYS`: Session token expiration in days (default: `7`).
- `DATABASE_URL`: SQLAlchemy connection URI (default: `sqlite:///./duolingo.db`).

---

## 📌 Known Limitations

- **Responsive Viewport Verification**: Full live viewport verification across all breakpoints (375px–1920px) was constrained by browser-subagent quota limits. Responsive layout compatibility was additionally validated through static CSS code inspection and available 375px mobile screenshots.
- **Single Course Baseline**: Seed data includes 1 primary course ("English for Beginners") with 3 units and 6 skills. Additional courses can be added via database seed extensions.
