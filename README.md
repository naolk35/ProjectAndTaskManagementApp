## Project & Task Management App

Role-based project and task management with Admin, Project Manager, and Employee dashboards. Built with React + Vite + Redux Toolkit Query on the frontend and Express + Sequelize on the backend. Includes dark/light mode, Tailwind UI, user search assignment, and task reordering API.

### Monorepo layout

- `frontend/` – React app (Vite, RTK Query, Tailwind)
- `backend/` – Express API (Sequelize, JWT)
- `docker-compose.yml` – DB + services

---

## 1) Setup Instructions

### Prerequisites

- Node.js >= 18
- Docker (optional, for Dockerized setup)

### Environment variables

Create `backend/.env` (for local MySQL; tests auto-use in-memory SQLite):
Or copy examples:

```
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

```
PORT=4000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=project_task_db
DB_USER=root
DB_PASS=
JWT_SECRET=replace_me
```

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:4000/api
```

### Manual setup (local dev)

1. Backend

```
cd backend
npm ci
npm run dev
```

API will listen on `http://localhost:4000`.

2. Frontend

```
cd frontend
npm ci
npm run dev
```

App will start on `http://localhost:5173` (or similar Vite port).

### Dockerized setup

```
docker compose up --build
```

Services (default):

- backend: `http://localhost:4000`
- frontend: `http://localhost:5173`
- db (MySQL) bound in compose

### Tests

- Backend (Jest + Supertest, uses SQLite in-memory):

```
cd backend
npm test
```

- Frontend (Vitest + Testing Library):

```
cd frontend
npm run test
```

### Lint & Build

```
cd frontend && npm run lint && npm run build
cd backend && npm run typecheck && npm run build
```

---

## 2) API Documentation

Base URL: `http://localhost:4000/api`

Auth

- POST `/auth/register` – body: `{ name, email, password, role? }` → `{ token, user }`
- POST `/auth/login` – body: `{ email, password }` → `{ token, user }`

Users (admin only)

- GET `/users` → `User[]`
- POST `/users` – `{ name, email, password, role }` → `User`
- PUT `/users/:id` – `{ name?, email?, password?, role? }` → `User`
- DELETE `/users/:id` → 204

Projects

- GET `/projects` → `Project[]` (admin/manager: all; employee: own)
- POST `/projects` – `{ name, description, owner_id? }` → `Project` (admin/manager)
- PUT `/projects/:id` – `{ name?, description? }` → `Project`
- DELETE `/projects/:id` → 204

Tasks

- GET `/tasks` → `Task[]` (admin: all; manager: own projects; employee: assigned)
- POST `/tasks` – `{ title, description, status?, project_id, assigned_to }` → `Task`
- PUT `/tasks/:id` – `{ title?, description?, status?, assigned_to? }` → `Task`
- DELETE `/tasks/:id` → 204
- POST `/tasks/reorder` – `{ project_id, ordered_ids: number[] }` → `{ ok: true }`

Auth Header: `Authorization: Bearer <token>` for protected routes.

Example – Create Task

```
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Design UI",
  "description": "Create Tailwind layout",
  "project_id": 1,
  "assigned_to": 2
}
```

---

## 3) Screenshots

Place screenshots in `frontend/public/screenshots/` and reference them below:

- Login – `![Login](frontend/public/screenshots/login.png)`
- Admin Dashboard – `![Admin](frontend/public/screenshots/admin.png)`
- Manager Tasks – `![Manager Tasks](frontend/public/screenshots/manager-tasks.png)`
- Employee Tasks – `![Employee](frontend/public/screenshots/employee.png)`

---

## 4) Notes on Decisions

Architecture

- Frontend: React + Vite, Redux Toolkit Query for API; role-based routes via `RequireAuth` guard; Tailwind for styling; reusable UI components (`Card`, `Sidebar`, `Modal`, `DataTable`, `StatusBadge`, `UserAutocomplete`).
- Backend: Express + Sequelize; auth via JWT; role-based authorization middleware; MySQL in dev/prod, SQLite for tests.

Folder structure

- `frontend/src/screens` – pages (Admin/Manager/Employee/Login/Register)
- `frontend/src/components` – UI + widgets (e.g., `DataTable`, `UserAutocomplete`)
- `frontend/src/api` – RTK Query endpoints
- `backend/src/routes` – REST routes (auth/users/projects/tasks)
- `backend/src/models` – Sequelize models

Libraries & rationale

- RTK Query: concise data fetching, caching, and invalidation.
- Tailwind: rapid, consistent, responsive styling with dark mode class.
- Sequelize: familiar ORM, adapters for MySQL and SQLite (tests).
- Testing: Jest/Supertest (backend), Vitest/RTL (frontend).

Task reordering

- DB column `order_index` with `/api/tasks/reorder` bulk update.
- Frontend exposes Save Order now; can be upgraded to drag & drop (e.g., dnd-kit) easily by emitting `ordered_ids` on drop.

Dark/Light mode

- `html.dark` toggled; Tailwind `dark:` variants used. State persisted in `localStorage`.

Known limitations / next steps

- Add true drag & drop for tasks using dnd-kit.
- Expand tests to cover dashboards, filters, and modals.
- Role-based visibility on projects list for employees can be further refined if needed.

---

## 5) CI/CD

GitHub Actions workflows included for backend and frontend (lint/build/test on push/PR). Add deployment steps as required (e.g., Docker build & push).

## Testing

Backend (Jest + Supertest):

- Install deps: `cd backend && npm ci`
- Run tests: `npm test`
- Watch mode: `npm run test:watch`

Frontend (Vitest + React Testing Library):

- Install deps: `cd frontend && npm ci`
- Run tests: `npm test`
- Watch mode: `npm run test:watch`

## CI/CD

GitHub Actions workflow is in `.github/workflows/ci.yml`:

- Backend: typecheck, tests
- Frontend: lint, tests, build

## Submission Guidelines

- Ensure all tests pass locally (backend and frontend).
- Ensure production builds succeed.
- Use clear commit messages (feat, fix, chore, docs).
- Include a concise PR description with:
  - What changed and why
  - Screenshots for UI changes
  - Testing notes (steps to verify)
- Do not commit secrets. Use `.env` locally and repository secrets in CI.
