# FlowForge AI

FlowForge AI is a modern AI-driven productivity platform for managing projects, tasks, workspaces, deadlines, and team activity in one place. It combines a polished dashboard experience, secure authentication, PostgreSQL-backed data models, and a scalable Next.js architecture built for real-world product workflows.

This project is designed to feel like a complete SaaS product rather than a demo. It includes protected routing, database-backed user and workspace systems, dashboard intelligence, task workflows, developer-friendly testing, and an architecture that is ready to extend with additional AI features, collaboration tools, and production-grade observability.

Live demo: https://flowforge-ai-rose.vercel.app

---

## Table of Contents

- Overview
- Why this project stands out
- Core product features
- Architecture overview
- Technology stack
- Project structure
- Environment setup
- Install and run
- Authentication system
- State management
- Database design
- Dashboard and analytics architecture
- Testing and quality
- Production considerations
- Roadmap

---

## Overview

FlowForge AI is built around a simple but powerful idea: teams need a workspace where they can manage work without friction. The application gives users a place to:

- create and manage workspaces
- create and organize projects
- track tasks across statuses, priorities, and due dates
- view team activity and project progress
- stay on top of deadlines and workload through dashboards
- secure their data with session-based authentication and protected routes

The app is implemented in Next.js using the App Router, TypeScript, Prisma, PostgreSQL, and Auth.js. It follows a full-stack architecture that keeps the frontend and backend close together while remaining modular and maintainable.

---

## Why this project stands out

This project is more than a basic task tracker. It was built with SaaS product thinking in mind:

- polished dashboard UI with decision-friendly analytics
- role-aware workspace and project organization
- secure auth with session protection and redirect handling
- real database modeling instead of mock-only data
- state management that keeps workspace context consistent
- modern frontend quality with strong validation and test coverage
- extensible architecture for AI features, planning insights, and automation

It demonstrates how a real application can combine design polish, technical structure, and business usefulness in one codebase.

---

## Core features

### Authentication and security

- email/password signup and login
- OAuth providers for Google and GitHub
- protected route middleware
- callback-based redirect after login
- session handling via JWT strategy
- password reset and email verification flows
- user avatar support
- secure password hashing with bcrypt
- environment-based configuration for secrets and provider credentials

### Workspaces and collaboration

- workspace creation and selection
- workspace-based data separation
- member and invite model support
- workspace lifecycle management
- project organization inside selected workspaces

### Product and task management

- project creation and management
- task creation, updating, filtering, and tracking
- due date tracking
- priority and status management
- activity logging for key task changes
- project/task metadata including favorite/archived flags and color/icon styling

### Dashboard intelligence

- summary cards for workloads and progress
- recent tasks overview
- activity feed
- burn-down trend visualization
- task distribution by status
- upcoming deadline tracking
- mini calendar with deadline indicators

### Developer experience

- TypeScript throughout the app
- Prisma schema-first database modeling
- testing with Vitest and Playwright
- accessibility checks with axe
- linting and formatting standards
- Sentry error monitoring and Vercel analytics integration

---

## Architecture overview

The application follows a modern full-stack Next.js architecture.

### Frontend

The UI is built with React 19 and Next.js App Router. Pages and route groups are organized under src/app. App Router features are used for server components, route handlers, and nested dashboard pages.

### Backend

The app uses route handlers under src/app/api for all core server-side operations:

- authentication flows
- workspace APIs
- project APIs
- task APIs
- dashboard metric endpoints
- AI-related route handlers

### Data layer

Prisma is the central data layer, connected to PostgreSQL via Prisma Postgres adapter. Models define users, workspaces, members, projects, tasks, sessions, and activity logs.

### Authentication layer

Auth.js (NextAuth v5) handles sessions and provider integrations. The credentials provider is customized to support both database-backed users and a safe demo admin fallback for local development and testing.

### Middleware and route protection

A custom middleware layer checks whether a user is authenticated before allowing access to protected routes. If not logged in, users are redirected to /login with a callbackUrl so they can return to the page they originally wanted.

### State management

Client state is handled with Zustand for lightweight global UI state such as:

- active workspace selection
- sidebar open/closed behavior

The dashboard also uses a custom hook for fetching and aggregating data from multiple API endpoints.

---

## Technology stack

### Core web stack

| Category | Technology |
| --- | --- |
| Framework | Next.js 16.2.12 |
| Runtime | React 19.2.4 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| App Router | Next.js App Router |
| UI motion | Framer Motion |
| Icons | Lucide React |

### Authentication and security

| Category | Technology |
| --- | --- |
| Auth | Auth.js / NextAuth v5 beta |
| Session strategy | JWT |
| Password hashing | bcryptjs |
| Prisma adapter | @auth/prisma-adapter |
| OAuth providers | Google, GitHub |
| Route protection | Next.js middleware |

### Data and persistence

| Category | Technology |
| --- | --- |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| DB adapter | @prisma/adapter-pg |
| Client | @prisma/client |

### Form handling and validation

| Category | Technology |
| --- | --- |
| Forms | react-hook-form |
| Validation | zod |
| Resolver | @hookform/resolvers |

### Dashboard and data visualization

| Category | Technology |
| --- | --- |
| Charts | Recharts |
| Date utilities | date-fns |
| Drag & drop | @dnd-kit/core and @dnd-kit/sortable |
| Utility helpers | clsx, tailwind-merge, class-variance-authority |

### State and user experience

| Category | Technology |
| --- | --- |
| Global state | Zustand |
| Theme system | next-themes |
| Analytics | @vercel/analytics |
| Error monitoring | @sentry/nextjs |
| Bundle analysis | @next/bundle-analyzer |

### Development and quality assurance

| Category | Technology |
| --- | --- |
| Testing | Vitest |
| UI Testing | Testing Library |
| E2E Testing | Playwright |
| Accessibility testing | axe-core |
| Linting | ESLint |
| Formatting | Prettier |
| Environment config | dotenv-style env usage |

---

## Project structure

```text
flowforge-ai/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── public/
│   └── font/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   ├── api/
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── register/
│   │   ├── reset-password/
│   │   ├── verify-email/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── ...
│   ├── auth.config.ts
│   ├── auth.ts
│   ├── components/
│   │   ├── ai/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   ├── project/
│   │   ├── providers/
│   │   ├── task/
│   │   └── ui/
│   ├── hooks/
│   │   └── use-dashboard-data.ts
│   ├── lib/
│   │   ├── email.ts
│   │   ├── error-reporting.ts
│   │   ├── prisma.ts
│   │   ├── schemas.ts
│   │   ├── shortcuts.ts
│   │   ├── site.ts
│   │   └── utils.ts
│   ├── store/
│   │   ├── sidebar-store.ts
│   │   └── workspace-store.ts
│   ├── types/
│   ├── instrumentation.ts
│   ├── instrumentation-client.ts
│   ├── proxy.ts
│   └── ...
├── tests/
│   └── e2e/
├── .env.example or local env configuration
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── prisma.config.ts
├── playwright.config.ts
├── tsconfig.json
├── vitest.config.ts
├── vitest.setup.ts
├── README.md
└── ...
```

### Important app folders

#### src/app
This is the main Next.js route and screen layer. It contains public pages, dashboard routes, and all API route handlers.

#### src/components
Most UI logic lives here, grouped by feature area:

- auth: login, register, verification, reset flows
- dashboard: analytics widgets and summary cards
- layout: navbar, sidebar, shell, theme toggle
- task: task management UI
- project: workspace/project UI
- ui: reusable design system building blocks

#### src/lib
Utility code, database helpers, validation logic, error reporting, and app-specific helpers live here.

#### src/store
This project uses Zustand to manage selected workspace state and sidebar state without adding heavyweight application state libraries.

#### src/hooks
Custom hooks provide reusable client-side logic such as dashboard data fetching and aggregation.

---

## Environment setup

Before running the app, make sure you have the following installed:

- Node.js 20+
- npm or pnpm
- PostgreSQL database
- Git

### Required environment variables

Create a local environment file or update your environment with values such as:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/flowforge_ai"
AUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"

AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
```

The project uses Auth.js and Prisma, so the authentication secret and database URL are important for the app to work correctly.

---

## Install and run

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

Generate Prisma client and sync schema with Postgres:

```bash
npx prisma generate
npx prisma db push
```

If you are creating migration history:

```bash
npx prisma migrate dev --name init
```

### 3. Start the app in development mode

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

### 4. Production build

```bash
npm run build
npm run start
```

---

## Authentication system

Authentication is a major part of the product and is implemented with Auth.js v5.

### How it works

- the app uses JWT-based session strategy
- a Prisma adapter connects Auth.js to the app database
- the credentials provider validates the user email/password
- Google/GitHub OAuth can also be configured
- middleware prevents access to private routes without a valid session

### Auth configuration

The auth setup is split across two files:

- src/auth.ts: main provider registration and session callbacks
- src/auth.config.ts: edge-safe base configuration for middleware compatibility

This separation ensures the authentication logic can be used in both server-side routes and middleware without causing runtime issues.

### Login redirect flow

The app uses callbackUrl-aware redirects:

- unauthenticated users are redirected to /login
- the original destination is stored in the URL
- after successful sign-in, the user is returned to the denied page or protected destination

This pattern is important for a polished product experience and matches modern SaaS app behavior.

### Demo credential support

The auth logic includes a local demo fallback account to support development and testing when the database is not yet fully seeded. This is useful for onboarding and ensures the login flow works reliably during local development.

---

## State management

### Zustand stores

The project uses Zustand in a minimal but effective way.

#### Workspace store
Location: src/store/workspace-store.ts

This store tracks:

- all available workspaces
- the currently selected workspace
- persistence in localStorage so the app remembers the last active workspace

This is important because the app is workspace-centric and many dashboard and sidebar features depend on the active workspace.

#### Sidebar store
Location: src/store/sidebar-store.ts

This store tracks whether the sidebar is open or closed, making layout toggling simple and lightweight without needing context or a large state library.

### Dashboard data hook

Location: src/hooks/use-dashboard-data.ts

This hook fetches multiple dashboard datasets in parallel, including:

- stats
- activity feed
- recent tasks
- task distribution
- burn-down data
- deadlines

It also centralizes loading and error handling which keeps the dashboard components clean and easier to maintain.

---

## Database design

The Prisma schema defines the foundation of the product.

### Core data models

#### User
Represents registered users and stores:

- name and email
- password hash
- verification metadata
- image/avatar
- workspace ownership and memberships
- tasks and projects
- activities and tokens

#### Workspace
Represents a user's work environment and includes:

- name and unique slug
- logo URL
- owner user relationship
- members and invites
- projects

#### WorkspaceMember
Tracks membership roles and permissions such as:

- admin
- member
- viewer

#### Project
Tracks work groupings such as:

- name and description
- status
- archived/favorite
- color and icon
- workspace relationship
- task relationships

#### Task
Represents the actual work item with properties like:

- title
- description
- priority
- due date
- status
- project relation
- user ownership

#### ActivityLog
Captures user actions over time so the app can show activity feeds, recent updates, and product intelligence.

### Why the schema matters

This is not a toy database. It is a structured product model that supports real multi-tenant-style workspaces and task flows. The schema is intentionally designed for extension with permissions, comments, labels, comments, milestones, and team collaboration features.

---

## Dashboard and analytics architecture

The dashboard is a key feature because it transforms raw task data into useful operational insights.

### Data flow

1. the client loads the dashboard page
2. the custom hook triggers several API requests in parallel
3. route handlers query the Prisma database
4. the results are transformed into chart-ready data
5. cards, tables, and visualizations render in the UI

### Components included

- Summary cards
- Activity feed
- Burn-down chart
- Task distribution chart
- Mini calendar
- Recent tasks panel

### Visualization approach

The dashboard uses Recharts to provide interactive and responsive visualization. This gives the app a polished, product-like view of workloads and progress without needing a heavy analytics framework.

---

## API design

The API layer is organized around feature boundaries and authenticated operations.

Examples include:

- /api/workspaces
- /api/projects
- /api/tasks
- /api/dashboard/stats
- /api/dashboard/activities
- /api/dashboard/deadlines
- /api/dashboard/burndown
- /api/dashboard/task-distribution

These endpoints validate the user session before operating on data. That keeps the app secure and aligns with the role-based product design.

---

## UI and product experience

The user experience is intentionally polished with:

- modern glassmorphism-inspired surfaces
- responsive layouts
- clean card-based design
- consistent spacing and typography
- motion for transitions and detail feedback
- theme support for system/light/dark modes
- accessible navigation and UI states

This makes the product feel like a real SaaS dashboard instead of a static prototype.

---

## Testing and quality

The project includes modern testing practices.

### Unit and component tests

Using Vitest and Testing Library, the app validates UI behavior and logic.

### End-to-end testing

Playwright supports browser-based validation of flows such as the login flow and interaction tests.

### Accessibility checks

The project includes axe-based testing to catch accessibility issues and raise the quality bar for real users.

### Observability

- Sentry captures runtime errors and helps monitor production issues
- Vercel Analytics tracks product usage and telemetry signals

---

## Production considerations

This project is already structured in a way that is close to production readiness.

### What is already strong

- secure authentication and route guards
- database-backed persistence
- real analytics and dashboard flows
- environment-driven configuration
- monitoring integration
- testing harness

### What would be next before large-scale deployment

- more role-based permission checks across workspaces
- stronger validation and audit trails on every mutation
- file storage for avatars and documents using S3/Cloudinary
- real email delivery via Resend, SendGrid, or SES
- background jobs for notifications and report generation
- CI/CD pipeline with lint, test, and build checks
- caching and performance tuning for larger datasets

---

## Example user journey

A typical user flow in FlowForge AI looks like this:

1. user visits the application
2. if unauthenticated, the middleware redirects them to /login
3. they sign in with credentials or OAuth
4. they open the dashboard
5. the app loads metrics and task information for the selected workspace
6. they create or manage projects and tasks
7. activity feed and analytics update accordingly
8. the user stays focused on work thanks to clear progress visibility

This is exactly the type of workflow a real digital workspace product needs.

---

## Why this project is impressive

FlowForge AI demonstrates a strong combination of:

- product thinking
- modern frontend engineering
- secure backend patterns
- database modeling discipline
- data visualization
- user-focused design
- scalable architecture

It is not just a page with a form or a mockup; it is a structured application that resembles the kind of platform a real SaaS team would build for internal productivity or customer-facing project management.

---

## Getting started summary

```bash
git clone https://github.com/iliya-baghjari/flowforge-ai.git
cd flowforge-ai
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Then open http://localhost:3000 and begin using the workspace dashboard.

---

## Final note

FlowForge AI is a practical, modern project management platform built with the latest Next.js patterns and production-minded engineering decisions. It balances product polish, technical depth, and extensibility, making it a strong example of a full-stack SaaS application built from the ground up.
