<div align="center">

  # FlowCRM AI Enterprise

  <p align="center">
    <strong>Enterprise-Grade CRM Platform Powered by AI</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite 8" />
    <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express 5" />
    <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white" alt="Prisma 7" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Docker-20-2496ED?logo=docker&logoColor=white" alt="Docker" />
    <img src="https://img.shields.io/badge/License-ISC-blue" alt="License ISC" />
  </p>

  <br />

  <h4>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#docker-deployment">Deployment</a> •
    <a href="#api-overview">API</a> •
    <a href="#project-structure">Structure</a>
  </h4>

  <br />
</div>

---

FlowCRM is a modern, enterprise-grade Customer Relationship Management (CRM) platform featuring AI-ready capabilities, a role-based permission system, and a comprehensive suite of business tools — from lead tracking and deal pipelines to invoicing, quotes, and company intelligence with CVR/KYC compliance for Scandinavian markets.

Built entirely with **TypeScript**, featuring a **React 19 + Vite 8** frontend with a sleek "glossy" design system, and a **Node.js / Express 5 + Prisma / PostgreSQL** backend following a strict layered architecture.

---

## Features

### Fully Implemented

| Module | Description |
|---|---|
| **Authentication & Authorization** | JWT access/refresh token rotation with breach detection, 9 roles, granular permission system, session management, password reset |
| **Dashboard** | KPI cards, trend charts (revenue, leads, deals, conversion), recent activity, upcoming tasks, pipeline overview, team leaderboard, goals tracking, configurable widgets |
| **Leads Management** | CRUD, soft delete, sources/statuses, search/filter/sort, pagination, bulk operations, duplicate merge, CSV import/export, saved views, assignment (manual, round-robin, load-based), lead scoring, health/SLA tracking, workflow automation, approval flows, 360 workspace |
| **Contacts Management** | CRUD, soft delete, rich multi-channel profiles, relationship mapping, customer journey tracking, engagement scoring, communication logs |
| **Tasks Management** | CRUD, Kanban board, priorities, subtasks, checklists, comments, file attachments, time tracking, watchers, dependencies, recurrence, approval workflow, calendar view, productivity analytics |
| **Accounts (KYC & CVR Engine)** | Core directory, parent-child hierarchies, Central Business Register (CVR) Scandinavian corporate lookup & imports, KYC compliance portals with verification checklists, risk profiles, document management |
| **Company 360° Workspace** | Timeline events, activity CRUD, notes with pinning, file upload/download, meetings, tasks, communications, full audit history with field-level change tracking |
| **Deals & Sales Pipelines** | CRUD, pipeline stages, Kanban board, owner assignments, values, expected closing dates, nested tags |
| **Quotes Management** | Sales quote engine with subtotals, tax rates, discount deductions, nested line items |
| **Invoices & Payments Engine** | Dynamic balance recalculations, payment logging, automated status adjustments (unpaid / partial / paid) |
| **Meetings & Calendar Scheduler** | Native CRUD, organizer/customer validation, datetime alignment checks |
| **Product Catalog** | Categories, product CRUD, price restrictions, unique SKU validation |
| **Enterprise Intelligence** | Customer journeys, segment definitions, tags, workflows (triggers/conditions/actions), AI-driven next-best-action recommendations, follow-up reminders |

### Placeholder / Coming Soon

Users, Roles, Permissions, Customers, Calendar, Notifications, Reports, Analytics, Settings

---

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** (TypeScript) | Runtime |
| **Express 5.x** | REST API framework |
| **PostgreSQL** + **Prisma 7.x** ORM | Database (71 models) |
| **JWT** (access + refresh token rotation, bcrypt) | Authentication |
| **Zod 4.x** | Request validation |
| **Winston** + **Morgan** + **Daily Rotate File** | Logging |
| **Helmet, CORS, Rate Limiting** | Security |
| **Multer** | File uploads |
| **Socket.IO** | Real-time (framework in place) |

### Frontend

| Technology | Purpose |
|---|---|
| **React 19.x** | UI framework |
| **Vite 8.x** | Build tool |
| **React Router DOM 7.x** | Client-side routing |
| **Zustand 5.x** (11 stores) | State management |
| **Axios 1.x** (auth interceptors) | HTTP client |
| **react-hook-form** + **Zod** | Form management |
| **Recharts 3.x** | Charts & graphs |
| **TanStack React Table 8.x** | Data tables |
| **Framer Motion 12.x** | Animations |
| **Lucide React** | Icons |
| **Tailwind CSS 3.x** (custom design system) | Styling |
| **Oxlint** (Rust-based) | Linting |
| **jsPDF** + **html2canvas** | PDF generation |

### Infrastructure

| Technology | Purpose |
|---|---|
| **Docker** + **Docker Compose** | Containerization & orchestration |
| **Nginx** | Reverse proxy & static file serving |
| **Jenkins** | CI/CD pipeline |

---

## Quick Start

### Prerequisites

- Node.js (latest LTS)
- PostgreSQL 16+
- npm or yarn
- Docker & Docker Compose (optional, for containerized deployment)

### Option A: Docker Compose (Production)

```bash
# Clone the repository
git clone <repo-url>
cd flowcrm-ai-enterprise

# Configure environment
cp .env.example .env
# Edit .env with your production values

# Build and start all services
docker compose up -d --build
```

| Service | Access |
|---|---|
| Frontend (UI) | `http://localhost:7080` |
| Backend (API) | `http://localhost:5003/api/v1` |
| PostgreSQL | `localhost:45432` |

### Option B: Local Development

#### 1. Clone & Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 2. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
```

#### 3. Setup Database

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

This seeds 9 roles, 80+ permissions, lead sources/statuses, and a default admin user:

> **Email:** `admin@flowcrm.ai`
> **Password:** `Password@123`

#### 4. Run

```bash
# Terminal 1 - Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 - Frontend (http://localhost:5173)
cd frontend
npm run dev
```

---

## Scripts

### Backend

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run production server |

### Frontend

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run lint` | Lint with Oxlint |
| `npm run preview` | Preview production build |

---

## Architecture

### Layered Pattern

```
Routes (HTTP definitions)
  → Middleware (auth, permission, validation, rate limiting, audit)
    → Controller (request parsing, response formatting)
      → Service (business logic)
        → Repository (data access via Prisma)
          → Prisma ORM → PostgreSQL
```

### API Response Format

All endpoints return a standardized JSON envelope:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human-readable message",
  "data": { },
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 100,
    "totalPages": 5
  },
  "timestamp": "2026-07-16T12:00:00.000Z",
  "requestId": "uuid"
}
```

### Database

- **ORM:** Prisma 7.x with `@prisma/adapter-pg`
- **Models:** 71 database models with full auditing
- **Soft Deletes:** Every table includes `deletedAt`, `deletedBy`, and `version` fields
- **UUIDs:** All primary keys use UUID v4
- **Timestamps:** Automatic `createdAt`, `updatedAt` on all models
- **Migrations:** Managed via `npx prisma migrate dev`

---

## Docker Deployment

### Environment Variables (Root `.env`)

| Variable | Default | Description |
|---|---|---|
| `DB_HOST_PORT` | `45432` | Host port for PostgreSQL |
| `API_HOST_PORT` | `5003` | Host port for backend API |
| `WEB_HOST_PORT` | `7080` | Host port for frontend web UI |
| `POSTGRES_USER` | `flowcrm` | Database user |
| `POSTGRES_PASSWORD` | *(change in production)* | Database password |
| `POSTGRES_DB` | `flowcrm_db` | Database name |
| `JWT_SECRET` | *(change in production)* | Access token signing key |
| `JWT_REFRESH_SECRET` | *(change in production)* | Refresh token signing key |
| `JWT_EXPIRES_IN` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token TTL |
| `CLIENT_URL` | `http://localhost:7080` | Frontend CORS origin |

### CI/CD (Jenkins)

The included `Jenkinsfile` supports two deployment modes:

- **Local deploy** — Jenkins runs on the VPS and executes `deploy.sh`
- **Remote SSH deploy** — Jenkins connects to a remote VPS, pulls the branch, and runs `deploy.sh`

Parameters: `DEPLOY_TARGET`, `BRANCH`, `ACTION` (deploy / down / restart / logs), SSH credentials.

---

## API Overview

**Base URL:** `http://localhost:5000/api/v1`

### Endpoints

| Group | Endpoints |
|---|---|
| **Health** | `GET /health` |
| **Auth** | `POST register`, `login`, `refresh`, `logout` — `GET me` — `PUT profile`, `change-password` — `POST forgot-password`, `reset-password` — `GET sessions`, `DELETE sessions/:id` |
| **Dashboard** | `GET overview`, `charts`, `activities`, `tasks`, `deals`, `business-overview`, `pipeline`, `revenue`, `team`, `goals`, `health` |
| **Leads** | 30+ endpoints (CRUD, bulk, merge, import/export, assignment, scoring, workflow, approval) |
| **Contacts** | 25+ endpoints (CRUD, profiles, communication logs) |
| **Tasks** | 30+ endpoints (CRUD, Kanban, subtasks, checklists, time tracking, recurrence, approval) |
| **Companies** | 50+ endpoints (hierarchy, branches, departments, 360 workspace, revenue, business network, customer journey, KYC, CVR) |
| **Products** | CRUD + categories |
| **Meetings** | Full calendar scheduling CRUD |
| **Quotes** | Full CRUD with line items, tax & discount calculations |
| **Invoices** | Full CRUD + payments logging + balance recalculation |

---

## Project Structure

```
flowcrm-ai-enterprise/
├── .env.example                         # Docker Compose environment template
├── docker-compose.yml                   # Service orchestration
├── Jenkinsfile                          # CI/CD pipeline
├── deploy.sh                            # Production deployment script
│
├── backend/
│   ├── Dockerfile                       # Multi-stage Node.js build
│   ├── docker-entrypoint.sh             # Prisma push + seed on start
│   ├── prisma/
│   │   ├── schema.prisma                # 71 database models
│   │   └── seed.js                      # Default data seeder
│   └── src/
│       ├── server.ts                    # Entry point
│       ├── app.ts                       # Express app setup
│       ├── config/                      # Environment config
│       ├── database/                    # Prisma client
│       ├── middlewares/                 # Auth, permission, validation, logging, etc.
│       ├── helpers/                     # Response utilities
│       ├── routes/v1/                   # Route definitions
│       ├── controllers/                 # HTTP handlers
│       ├── services/                    # Business logic
│       ├── repositories/                # Data access layer
│       └── {domain}/                    # leads, contacts, tasks, companies,
│                                        # deals, invoices, quotes, products,
│                                        # meetings, dashboard
│
└── frontend/
    ├── Dockerfile                       # Multi-stage Vite + Nginx build
    ├── nginx.docker.conf                # Nginx reverse proxy config
    └── src/
        ├── main.tsx                     # React entry point
        ├── App.tsx                      # Root component
        ├── routes/                      # Route definitions
        ├── layouts/                     # Dashboard layout
        ├── components/
        │   ├── ui/                      # 19 reusable UI components
        │   └── auth/                    # Route guards
        ├── pages/                       # 20+ page components
        ├── services/                    # API client layer
        ├── store/                       # 11 Zustand stores
        ├── types/                       # TypeScript interfaces
        ├── styles/                      # Global CSS + Tailwind
        └── utils/                       # Utilities
```

---

## License

[ISC](https://opensource.org/licenses/ISC)
