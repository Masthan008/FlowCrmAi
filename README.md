
# FlowCRM AI Enterprise

A modern, enterprise-grade Customer Relationship Management (CRM) platform powered by AI-ready features. Built with TypeScript throughout, featuring a React 19 + Vite 8 frontend and a Node.js/Express 5 + Prisma/PostgreSQL backend.

## Tech Stack

### Backend
| Technology | |
|---|---|
| **Runtime** | Node.js (TypeScript 6.x) |
| **Framework** | Express 5.x |
| **Database** | PostgreSQL via Prisma 7.x ORM |
| **Auth** | JWT (access + refresh token rotation), bcrypt |
| **Validation** | Zod 4.x |
| **Logging** | Winston + Morgan + Daily Rotate File |
| **Security** | Helmet, CORS, Rate Limiting, Cookie Parser |
| **File Upload** | Multer |
| **Real-time** | Socket.IO (framework in place) |

### Frontend
| Technology | |
|---|---|
| **Framework** | React 19.x |
| **Build Tool** | Vite 8.x |
| **Routing** | React Router DOM 7.x |
| **State** | Zustand 5.x |
| **HTTP** | Axios 1.x (with auth interceptors) |
| **Forms** | react-hook-form + Zod |
| **Charts** | Recharts 3.x |
| **Tables** | TanStack React Table 8.x |
| **Animations** | Framer Motion 12.x |
| **Icons** | Lucide React |
| **Styling** | Tailwind CSS 3.x |
| **Linting** | Oxlint (Rust-based) |

## Project Structure

```
flowcrm-ai-enterprise/
├── backend/
│   ├── src/
│   │   ├── server.ts              # Entry point
│   │   ├── app.ts                 # Express app setup
│   │   ├── config/                # Environment config
│   │   ├── database/              # Prisma client & connection
│   │   ├── middlewares/           # Auth, validation, logging, etc.
│   │   ├── helpers/               # Response helpers
│   │   ├── repositories/          # Data access layer
│   │   ├── services/              # Business logic
│   │   ├── controllers/           # HTTP handlers
│   │   ├── routes/v1/             # API route definitions
│   │   ├── leads/                 # Lead domain (routes, controller, service, repository, validators)
│   │   ├── contacts/              # Contact domain
│   │   ├── tasks/                 # Task domain
│   │   └── dashboard/             # Dashboard domain
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (66 models)
│   │   └── seed.ts                # Database seeder
│   └── uploads/                   # File storage
│
└── frontend/
    └── src/
        ├── main.tsx               # React entry
        ├── App.tsx                # Root component
        ├── layouts/               # Dashboard layout
        ├── routes/                # Route configuration
        ├── components/
        │   ├── ui/                # Reusable UI components (Button, Card, Modal, Table, etc.)
        │   └── auth/              # Auth guards
        ├── services/              # API client layer
        ├── store/                 # Zustand stores
        ├── pages/                 # Page components (16+ pages)
        ├── types/                 # TypeScript interfaces
        └── styles/                # Global CSS + Tailwind
```

## Features

### Fully Implemented

- **Authentication & Authorization** -- Registration, login, JWT access/refresh token rotation with breach detection, role-based access (9 roles), granular permission system
- **Dashboard** -- KPI cards, trend charts (revenue/leads/deals/conversion), recent activity, upcoming tasks, pipeline overview, team leaderboard, goals tracking, configurable widgets
- **Leads Management** -- Full CRUD, soft delete, sources/statuses master data, search/filter/sort, pagination, bulk operations (update, archive, restore), duplicate merge, CSV import/export, saved views, assignment (manual/round-robin/load-based), lead scoring, health/SLA tracking, workflow automation, approval flows, 360 workspace (notes, activities, files, timeline, history)
- **Contacts Management** -- Full CRUD, soft delete, rich profile with multi-channel communication, relationship mapping, customer journey tracking, engagement scoring, business/health metrics, communication logs
- **Tasks Management** -- Full CRUD, Kanban board, priorities, subtasks, checklists, comments, file attachments, time tracking, watchers, dependencies, recurrence, approval workflow, calendar view, productivity analytics

### Placeholder / Coming Soon

Users, Roles, Permissions, Customers, Companies, Deals, Activities, Calendar, Meetings, Products, Quotes, Invoices, Payments, Notifications, Reports, Analytics, Settings

## Architecture

### Layered Pattern
```
Routes (HTTP definition)
  → Middleware (auth, permission, validation, rate limiting, audit)
    → Controller (request parsing, response formatting)
      → Service (business logic)
        → Repository (data access via Prisma)
          → Prisma ORM → PostgreSQL
```

### API Base URL: `http://localhost:5000/api/v1`

Standardized JSON response format across all endpoints:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human-readable message",
  "data": { ... },
  "pagination": { "page": 1, "limit": 20, "totalItems": 100, "totalPages": 5 },
  "timestamp": "2026-06-27T...",
  "requestId": "uuid"
}
```

### Key API Endpoints

- `GET /health` -- API + database health check
- `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`
- `GET /auth/me`, `PUT /auth/profile`, `PUT /auth/change-password`
- `POST /auth/forgot-password`, `/auth/reset-password`
- `GET /auth/sessions`, `DELETE /auth/sessions/:id`
- `GET /dashboard/overview`, `/charts`, `/activities`, `/tasks`, `/deals`
- `GET /dashboard/business-overview`, `/pipeline`, `/revenue`, `/team`, `/goals`, `/health`
- `GET|POST|PUT|DELETE /leads/*` (30+ endpoints)
- `GET|POST|PUT|DELETE /contacts/*` (25+ endpoints)
- `GET|POST|PUT|DELETE /tasks/*` (30+ endpoints)

## Prerequisites

- **Node.js** (latest LTS)
- **PostgreSQL** database
- **npm** or **yarn**

## Setup

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Configuration

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:

| Variable | Description | Default |
|---|---|---|
| `PORT` | API server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/flowcrm_db?schema=public` |
| `JWT_SECRET` | Access token signing key | (change me) |
| `JWT_REFRESH_SECRET` | Refresh token signing key | (change me) |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |

### 3. Database Setup

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

The seeder creates 9 roles, 80+ permissions, lead sources/statuses, and a default admin user:
- **Email:** `admin@flowcrm.ai`
- **Password:** `Password@123`

### 4. Run

```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 5173)
cd frontend
npm run dev
```

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

## Database

- **ORM:** Prisma 7.x with `@prisma/adapter-pg`
- **Models:** 66 database models with full auditing
- **Soft deletes:** Every table includes `deletedAt`, `deletedBy`, and `version` fields
- **UUIDs:** All primary keys use UUID v4
- **Timestamps:** Automatic `createdAt`, `updatedAt` on all models
- **Migrations:** Managed via `npx prisma migrate dev`

## License

ISC License
