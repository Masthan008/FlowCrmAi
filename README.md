
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
│   │   ├── schema.prisma          # Database schema (71 models)
│   │   └── seed.ts                # Database seeder
│   │   └── uploads/               # File storage
│   │
│   └── companies/                # Company domain (routes, controller, service, repository, validators)
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

- **Authentication & Authorization** -- Registration, login, JWT access/refresh token rotation with breach detection, role-based access (9 roles), granular permission system.
- **Dashboard** -- KPI cards, trend charts (revenue/leads/deals/conversion), recent activity, upcoming tasks, pipeline overview, team leaderboard, goals tracking, configurable widgets.
- **Leads Management** -- Full CRUD, soft delete, sources/statuses master data, search/filter/sort, pagination, bulk operations (update, archive, restore), duplicate merge, CSV import/export, saved views, assignment (manual/round-robin/load-based), lead scoring, health/SLA tracking, workflow automation, approval flows, 360 workspace (notes, activities, files, timeline, history).
- **Contacts Management** -- Full CRUD, soft delete, rich profile with multi-channel communication, relationship mapping, customer journey tracking, engagement scoring, business/health metrics, communication logs.
- **Tasks Management** -- Full CRUD, Kanban board, priorities, subtasks, checklists, comments, file attachments, time tracking, watchers, dependencies, recurrence, approval workflow, calendar view, productivity analytics.
- **Accounts (KYC & CVR Engine)** -- Core Account directories, parent-child hierarchies, Central Business Register (CVR) Scandinavian corporate lookup & imports, and Know Your Customer (KYC) compliance portals featuring verification checklist audits, risk profiles, document attachments, and history auditing.
- **Company 360° Workspace** -- Timeline events, activity CRUD with type/priority/status, notes with pinning, file upload/download, meetings, tasks, communications, full audit history with field-level change tracking.
- **Meetings & Calendar Scheduler** -- Complete native backend CRUD, organizer/customer scheduler validations, and datetime alignment checks.
- **Product Catalog** -- Categories listing and Product database CRUD featuring price restrictions and unique SKU checks.
- **Deals & Sales Pipelines** -- Deals CRUD, pipeline stages, Kanban board rendering, deal owner assignments, values, expected closing dates, and nested tags.
- **Quotes Management** -- Sales quote engine calculating subtotals, tax rates, and discount deductions. Nested quote items transactional write operations.
- **Invoices & Payments Engine** -- Dynamic balance recalculations, invoice tracking, payment log registering, and automated status adjustments (marking unpaid, partially paid, or paid based on completed payment logs).
- **Enterprise Company Intelligence** -- Customer Journeys tracking, Segment definitions, Tags mappings, Workflows (triggers/conditions/actions), Recommendations (AI-driven next best actions), and Follow-up reminders.

### Placeholder / Coming Soon

Users, Roles, Permissions, Customers, Calendar, Notifications, Reports, Analytics, Settings

## Recent Updates & Bug Fixes

Here are the key issues resolved in the latest releases:

### Release 2.0 (Latest)
1. **CVR Import Validation Relaxation**: Modified phone, industry, sub-industry, and business category validators to handle flexible data patterns (e.g. international phone characters, symbols like `&`, `-`, and numbers in industry names) during corporate lookups and CVR imports.
2. **Form Preprocessors for Empty Inputs**: Integrated Zod preprocessors to map empty/blank form fields (e.g. `foundedYear`, `annualRevenue`, and `employeeCount`) to `null` before passing them to integer/number validation rules, resolving company creation blocking bugs.
3. **Logo URL Validation Phase**: Bound `logo` field check in step 1 of the basic company wizard to prevent moving to step 2 with invalid image extensions.
4. **Employee Directory Seeding**: Updated database seed script to auto-generate default employee listings for proper owner selection dropdown mappings.
5. **Activity Status & Enum Sync**: Swapped default front-end status from `Open` to `Planned` to align with the backend's allowed enum values.
6. **File Upload Content-Type Boundary**: Bound standard `multipart/form-data` content-type header context to frontend Axios file upload requests, enabling correct request parsing on the backend server.
7. **Branch Update Sanitizer**: Configured the backend branch update controller to safely map empty manager ID UUID strings and opening dates to `null` or valid dates, avoiding database constraints failures.
8. **Relaxed Close Dates in Deals**: Allowed expected and actual close dates for Deals to accept non-ISO string formats, supporting standard web date input formats.
9. **Workflow Trigger Types Extension**: Expanded backend workflow triggers enum to allow user-configured conditions (e.g. manual, scheduled, score/health/risk change, etc.).
10. **Nullable Follow-up Details**: Refined validation schemas for Follow-up creation to make description and ownerId optional/nullable to match the DB schema.

### Release 1.0 (Previous)
1. **Date-Only Validator Compatibility**: Fixed `companyActivity.validator` and `companyIntelligence.validator` schemas to accept date-only strings (e.g. `2026-07-12`) instead of strictly requiring full ISO datetimes, resolving activity and follow-up logging failures.
2. **Prisma List Fields Formatting**: Updated deals service array sanitizer to map undefined tags to `[]` instead of `null`, preventing Prisma database insert errors.
3. **Address Form Validations**: Enforced text-only constraint for `country`, `state`, and `city` inputs, and digits-only constraint for `postalCode` (postal code) fields on both backend validators and frontend layouts.
4. **Logo URL Validation**: Restricted logo URLs to valid image extensions (`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`, `.ico`) on both backend and frontend schemas.
5. **Route Prefix & Ordering Alignments**: Added missing `/api/v1` and `/companies` prefixes to segments, tags, and workflows frontend services. Mounted static config endpoints above parameterized matches in contacts router to resolve route lookup collision.
6. **Workspace Access & Permissions**: Aligned all company 360/intelligence endpoints with the standard seeded permission checks (`companies:view` and `companies:edit`) to avoid authorization roadblocks.
7. **Rate Limiting Adjustments**: Increased threshold limits inside `rateLimiter.ts` to prevent request blocks during heavy user navigation or active automated testing.
8. **Payments Registry Trace**: Replaced query parameters in `getPayments` to fetch payments by tracing `Customer` → `Invoice` → `Payment` database relations.

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
- `GET|POST|PUT|DELETE /companies/*` (50+ endpoints including hierarchy, branches, departments, 360 workspace, revenue, business network, customer journey)
- `GET /companies/:id/hierarchy`, `/hierarchy/tree` -- Organization hierarchy
- `GET|POST|PUT|DELETE /companies/:id/branches/*` -- Branch management
- `GET|POST|PUT|DELETE /companies/:id/departments/*` -- Department management
- `GET /companies/:id/contacts` -- Contact directory
- `GET /companies/:id/leads`, `/deals`, `/quotes`, `/invoices`, `/payments` -- Related business data
- `GET|POST|DELETE /companies/:id/revenue/*` -- Revenue tracking & dashboard
- `GET|POST|PUT|DELETE /companies/:id/business-network/*` -- Business network management
- `GET|POST|DELETE /companies/:id/customer-journey/*` -- Customer journey milestones
- `GET /companies/:id/timeline`, `/activities`, `/notes`, `/files`, `/history` -- 360° workspace
- `GET|POST|PUT|DELETE /products/*` -- Products catalog CRUD & categories list
- `GET|POST|PUT|DELETE /meetings/*` -- Scheduled calendar meetings
- `GET|POST|PUT|DELETE /quotes/*` -- Sales quote calculations and state CRUD
- `GET|POST|PUT|DELETE /invoices/*` -- Billing invoices, payments logs, and balances recalculator

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
- **Models:** 71 database models with full auditing
- **Soft deletes:** Every table includes `deletedAt`, `deletedBy`, and `version` fields
- **UUIDs:** All primary keys use UUID v4
- **Timestamps:** Automatic `createdAt`, `updatedAt` on all models
- **Migrations:** Managed via `npx prisma migrate dev`

## License

ISC License
