# Ensoria Manager — Phase 2 Implementation Plan

> **Documento di implementazione dettagliato per costruire il CRM MVP.**
> Revisione necessaria prima di qualsiasi scrittura di codice.
> *AleX reviewa → approva → implemento → review finale.*

---

## Indice

1. [Tech Stack Definitivo](#1-tech-stack-definitivo)
2. [Struttura Progetti](#2-struttura-progetti)
3. [Database Schema Completo (Prisma)](#3-database-schema-completo-prisma)
4. [API Routes Dettagliate](#4-api-routes-dettagliate)
5. [Component Tree Frontend](#5-component-tree-frontend)
6. [Route Map Frontend](#6-route-map-frontend)
7. [Auth Flow](#7-auth-flow)
8. [Data Flow](#8-data-flow)
9. [Build Order (Step-by-Step)](#9-build-order-step-by-step)
10. [File-by-File Checklist](#10-file-by-file-checklist)

---

## 1. Tech Stack Definitivo

| Layer | Tecnologia | Versione | Note |
|-------|-----------|----------|------|
| **Runtime** | Node.js | 20+ | LTS |
| **Backend Framework** | Fastify | 5.x | Performante, schema-based, plugin system |
| **ORM** | Prisma | 6.x | Type-safe, migrazioni, SQLite → PostgreSQL swap |
| **Database (MVP)** | SQLite (via `@prisma/client`) | — | Nessun server richiesto |
| **Auth** | `@fastify/jwt` + `bcryptjs` | — | JWT stateless |
| **Validation** | Zod | 3.x | Schema validation condivisibile |
| **CORS** | `@fastify/cors` | — | Dev locale |
| **Frontend** | React + Vite + TypeScript | React 19 / Vite 6 | Build veloce |
| **UI Library** | shadcn/ui | Latest | Componenti copiati, non dipendenza |
| **CSS** | Tailwind CSS v4 | 4.x | Utility-first |
| **Routing** | React Router v7 | 7.x | Data loading patterns |
| **Server State** | TanStack Query | 5.x | Cache, refetch, mutations |
| **Client State** | Zustand | 5.x | Auth state, UI state |
| **HTTP Client** | fetch (native) | — | Con wrapper type-safe |

### Perché Fastify invece di Express?

- Performance 2x+ su Express
- Schema-based validation nativa
- Plugin system modulare (ogni modulo è un plugin Fastify)
- TypeScript first
- Meno boilerplate per auth, CORS, validation

### Perché Vite invece di Next.js?

- MVP locale senza SSR
- Build più veloce
- Meno complessità
- PWA-ready via `vite-plugin-pwa` se serve
- React Router v7 dà data fetching patterns simili a Next.js

---

## 2. Struttura Progetti

```
~/workspace/
├── ensoria-api/                     # Backend
│   ├── prisma/
│   │   └── schema.prisma           # Database schema
│   ├── src/
│   │   ├── index.ts                # Entry point: create app, start server
│   │   ├── app.ts                  # Fastify app setup (plugins, routes)
│   │   ├── config.ts               # Environment config
│   │   ├── lib/
│   │   │   ├── prisma.ts           # Prisma client singleton
│   │   │   └── errors.ts           # Custom error classes + handler
│   │   ├── plugins/
│   │   │   ├── auth.ts             # @fastify/jwt plugin + decorator
│   │   │   └── cors.ts             # @fastify/cors plugin
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts     # POST /api/auth/register, /login
│   │   │   │   ├── auth.service.ts    # Business logic
│   │   │   │   └── auth.schema.ts     # Zod schemas
│   │   │   ├── people/
│   │   │   │   ├── people.routes.ts   # CRUD /api/people
│   │   │   │   ├── people.service.ts
│   │   │   │   └── people.schema.ts
│   │   │   ├── projects/
│   │   │   │   ├── projects.routes.ts # CRUD /api/projects
│   │   │   │   ├── projects.service.ts
│   │   │   │   └── projects.schema.ts
│   │   │   ├── conversations/
│   │   │   │   ├── conversations.routes.ts
│   │   │   │   ├── conversations.service.ts
│   │   │   │   └── conversations.schema.ts
│   │   │   ├── requirements/
│   │   │   │   ├── requirements.routes.ts
│   │   │   │   ├── requirements.service.ts
│   │   │   │   └── requirements.schema.ts
│   │   │   ├── milestones/
│   │   │   │   ├── milestones.routes.ts
│   │   │   │   ├── milestones.service.ts
│   │   │   │   └── milestones.schema.ts
│   │   │   ├── collaborators/
│   │   │   │   ├── collaborators.routes.ts
│   │   │   │   ├── collaborators.service.ts
│   │   │   │   └── collaborators.schema.ts
│   │   │   ├── plans/
│   │   │   │   ├── plans.routes.ts
│   │   │   │   ├── plans.service.ts
│   │   │   │   └── plans.schema.ts
│   │   │   ├── files/
│   │   │   │   ├── files.routes.ts
│   │   │   │   ├── files.service.ts
│   │   │   │   └── files.schema.ts
│   │   │   └── dashboard/
│   │   │       ├── dashboard.routes.ts  # GET /api/dashboard
│   │   │       └── dashboard.service.ts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── ensoria-ui/                      # Frontend
│   ├── public/
│   ├── src/
│   │   ├── main.tsx                 # Entry point
│   │   ├── App.tsx                  # Router + providers
│   │   ├── index.css               # Tailwind imports + global styles
│   │   ├── lib/
│   │   │   ├── api.ts              # Fetch wrapper + base URL
│   │   │   ├── utils.ts            # cn() helper
│   │   │   └── auth.ts             # Token management
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── usePeople.ts
│   │   │   ├── useProjects.ts
│   │   │   ├── useConversations.ts
│   │   │   ├── useRequirements.ts
│   │   │   ├── useMilestones.ts
│   │   │   ├── useCollaborators.ts
│   │   │   ├── usePlans.ts
│   │   │   └── useDashboard.ts
│   │   ├── stores/
│   │   │   └── authStore.ts        # Zustand auth store
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   └── ....
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── AppLayout.tsx
│   │   │   ├── people/
│   │   │   │   ├── PeopleTable.tsx
│   │   │   │   ├── PeopleForm.tsx
│   │   │   │   ├── PeopleCard.tsx
│   │   │   │   └── StageBadge.tsx
│   │   │   ├── projects/
│   │   │   │   ├── KanbanBoard.tsx
│   │   │   │   ├── KanbanColumn.tsx
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   ├── ProjectForm.tsx
│   │   │   │   └── ProjectsTable.tsx
│   │   │   ├── conversations/
│   │   │   │   ├── ConversationFeed.tsx
│   │   │   │   └── ConversationForm.tsx
│   │   │   ├── requirements/
│   │   │   │   ├── RequirementList.tsx
│   │   │   │   └── RequirementForm.tsx
│   │   │   ├── milestones/
│   │   │   │   ├── MilestoneList.tsx
│   │   │   │   └── MilestoneForm.tsx
│   │   │   ├── collaborators/
│   │   │   │   └── CollaboratorList.tsx
│   │   │   ├── plans/
│   │   │   │   ├── PlanList.tsx
│   │   │   │   └── PlanForm.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── MetricCard.tsx
│   │   │   │   ├── ActivityFeed.tsx
│   │   │   │   └── StageDistribution.tsx
│   │   │   └── shared/
│   │   │       ├── LoadingSpinner.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       └── ErrorMessage.tsx
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       ├── RegisterPage.tsx
│   │       ├── DashboardPage.tsx
│   │       ├── PeoplePage.tsx
│   │       ├── PeopleDetailPage.tsx
│   │       ├── ProjectsPage.tsx
│   │       ├── ProjectSpacePage.tsx   # Main project detail with tabs
│   │       └── SettingsPage.tsx
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── vite.config.ts
│   └── package.json
└── PHASE2-IMPL-PLAN.md             # Questo file
```

---

## 3. Database Schema Completo (Prisma)

```prisma
// Schema unico. SQLite in MVP, PostgreSQL in produzione.
// Cambia solo la DATABASE_URL nel .env.

datasource db {
  provider = "sqlite"  // → "postgresql" in produzione
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ─── AUTH ───────────────────────────────────────

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // hashed with bcrypt
  name      String
  role      String   @default("admin") // admin | employee | partner
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─── PEOPLE ─────────────────────────────────────

model People {
  id        String   @id @default(cuid())
  type      String   // staff | partner | freelancer | company | investor
  name      String
  email     String?
  phone     String?
  company   String?
  stage     String   @default("Contact") // Contact | Opportunity | Client | Recurring Client
  notes     String?
  tags      String   @default("")        // Comma-separated tags
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  projects       Project[]
  activities     Activity[]
}

// ─── PROJECTS ───────────────────────────────────

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  stage       String   @default("Contact") // Contact → Opportunity → Proposal → Implementation → Onboarding → Live → Validated
  value       Float?   // Deal value / project budget
  peopleId    String
  people      People   @relation(fields: [peopleId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  conversations Conversation[]
  files         ProjectFile[]
  requirements  Requirement[]
  milestones    Milestone[]
  collaborators Collaborator[]
  plans         ProjectPlan[]
  analytics     AnalyticsRecord[]
}

// ─── PROJECT SPACE TABLES ───────────────────────

model Conversation {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  channel   String   // webchat | whatsapp | email | social | gmail | manual
  direction String   // inbound | outbound
  subject   String?
  content   String
  metadata  String?  // JSON string for channel-specific data
  sentiment Float?   // -1 to 1
  createdAt DateTime @default(now())
}

model ProjectFile {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  name      String
  url       String   // Local path or URL
  type      String   // file | link
  mimeType  String?
  size      Int?     // bytes
  createdAt DateTime @default(now())
}

model Requirement {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  title       String
  description String?
  category    String   // need | goal | requirement
  status      String   @default("open") // open | in-progress | met | cancelled
  priority    String   @default("medium") // low | medium | high | critical
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Milestone {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  title       String
  description String?
  dueDate     DateTime?
  status      String   @default("pending") // pending | in-progress | completed | cancelled
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Collaborator {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  name        String
  email       String?
  phone       String?
  role        String?  // developer | designer | consultant | etc.
  notes       String?
  createdAt   DateTime @default(now())
}

model ProjectPlan {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  title       String
  content     String   // Markdown or plain text
  version     Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ─── ANALYTICS ─────────────────────────────────

model AnalyticsRecord {
  id              String   @id @default(cuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id])
  sentimentScore  Float?   // 0-100
  alignmentScore  Float?   // 0-100
  healthScore     Float?   // 0-100
  engagementScore Float?   // 0-100
  rawData         String?  // JSON with detailed metrics
  generatedAt     DateTime @default(now())
}

// ─── ACTIVITY LOG ──────────────────────────────

model Activity {
  id          String   @id @default(cuid())
  peopleId    String?
  people      People?  @relation(fields: [peopleId], references: [id])
  projectId   String?
  type        String   // created | updated | stage_changed | note_added
  description String
  metadata    String?  // JSON with change details
  createdAt   DateTime @default(now())
}
```

### Stage Validation Constants (in code, not DB)

**People stages:**
```
Contact → Opportunity → Client → Recurring Client
```

**Project stages:**
```
Contact → Opportunity → Proposal → Implementation → Onboarding → Live → Validated
```

La validazione degli stage è in codice (non enums SQLite). Questo permette di cambiare gli stadi senza migrazioni.

---

## 4. API Routes Dettagliate

Tutte le route sono prefissate con `/api/`.
Le route protette richiedono header `Authorization: Bearer <token>`.

### Auth

| Method | Route | Auth | Body | Response | Description |
|--------|-------|------|------|----------|-------------|
| POST | `/api/auth/register` | ❌ | `{ email, password, name }` | `{ user, token }` | Register admin |
| POST | `/api/auth/login` | ❌ | `{ email, password }` | `{ user, token }` | Login |
| GET | `/api/auth/me` | ✅ | — | `{ user }` | Current user info |

### Dashboard

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/dashboard` | ✅ | Pipeline summary, metrics, recent activity |

**Response shape:**
```json
{
  "metrics": {
    "totalPeople": 42,
    "totalProjects": 18,
    "pipelineValue": 125000,
    "winRate": 0.35,
    "avgDealSize": 15000
  },
  "stageDistribution": {
    "Contact": 5,
    "Opportunity": 8,
    "Client": 3,
    "RecurringClient": 2
  },
  "recentActivity": [
    { "id": "...", "type": "stage_changed", "description": "...", "createdAt": "..." }
  ],
  "projectsByStage": {
    "Contact": [{ "id": "...", "name": "...", "value": 5000, "people": {...} }],
    "Opportunity": [...],
    "Proposal": [...]
  }
}
```

### People

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/people` | ✅ | List people (query: `?type=&stage=&search=`) |
| GET | `/api/people/:id` | ✅ | Get person with projects |
| POST | `/api/people` | ✅ | Create person |
| PUT | `/api/people/:id` | ✅ | Update person |
| PATCH | `/api/people/:id/stage` | ✅ | Change stage (body: `{ stage }`) |
| DELETE | `/api/people/:id` | ✅ | Delete person |

### Projects

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/projects` | ✅ | List projects (query: `?stage=&peopleId=&search=`) |
| GET | `/api/projects/:id` | ✅ | Get project with all relations |
| POST | `/api/projects` | ✅ | Create project |
| PUT | `/api/projects/:id` | ✅ | Update project |
| PATCH | `/api/projects/:id/stage` | ✅ | Change stage |
| DELETE | `/api/projects/:id` | ✅ | Delete project |

### Conversations (nested under project)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/projects/:projectId/conversations` | ✅ | List conversations |
| POST | `/api/projects/:projectId/conversations` | ✅ | Add conversation entry |

### Requirements (nested under project)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/projects/:projectId/requirements` | ✅ | List requirements |
| POST | `/api/projects/:projectId/requirements` | ✅ | Create requirement |
| PUT | `/api/projects/:projectId/requirements/:id` | ✅ | Update requirement |
| DELETE | `/api/projects/:projectId/requirements/:id` | ✅ | Delete requirement |

### Milestones (nested under project)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/projects/:projectId/milestones` | ✅ | List milestones |
| POST | `/api/projects/:projectId/milestones` | ✅ | Create milestone |
| PUT | `/api/projects/:projectId/milestones/:id` | ✅ | Update milestone |
| DELETE | `/api/projects/:projectId/milestones/:id` | ✅ | Delete milestone |

### Collaborators (nested under project)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/projects/:projectId/collaborators` | ✅ | List collaborators |
| POST | `/api/projects/:projectId/collaborators` | ✅ | Add collaborator |
| DELETE | `/api/projects/:projectId/collaborators/:id` | ✅ | Remove collaborator |

### Plans (nested under project)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/projects/:projectId/plans` | ✅ | List plans |
| POST | `/api/projects/:projectId/plans` | ✅ | Create plan |
| PUT | `/api/projects/:projectId/plans/:id` | ✅ | Update plan |
| DELETE | `/api/projects/:projectId/plans/:id` | ✅ | Delete plan |

### Files (nested under project)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/projects/:projectId/files` | ✅ | List files |
| POST | `/api/projects/:projectId/files` | ✅ | Add file entry |

### Standard Response Format

```json
// Success
{ "data": {...} }
{ "data": [...] }
{ "data": {...}, "meta": { "total": 42, "page": 1 } }

// Error
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
```

### HTTP Status Codes Usati
- `200` — OK
- `201` — Created
- `400` — Bad Request / Validation Error
- `401` — Unauthorized (no token)
- `403` — Forbidden (wrong role)
- `404` — Not Found
- `409` — Conflict (duplicate email, etc.)
- `500` — Internal Server Error

---

## 5. Component Tree Frontend

```
<App>
  <QueryClientProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            ← AppLayout contiene Sidebar + Header + Outlet →
            
            <Route path="/" element={<DashboardPage />} />
            <Route path="/people" element={<PeoplePage />} />
            <Route path="/people/:id" element={<PeopleDetailPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectSpacePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
</App>
```

### AppLayout Structure

```
┌───────────────────────────────────────────────────┐
│  Header                                           │
│  ┌─────────────────────────────────────────────┐  │
│  │  Search (Cmd+K)          User Avatar ▼      │  │
│  └─────────────────────────────────────────────┘  │
├──────┬────────────────────────────────────────────┤
│      │                                            │
│ Side │  Main Content (Outlet)                     │
│ bar  │                                            │
│      │                                            │
│ 🏠   │                                            │
│ Dash │                                            │
│      │                                            │
│ 👤   │                                            │
│ Peop │                                            │
│      │                                            │
│ 📊   │                                            │
│ Proj │                                            │
│      │                                            │
│ ⚙️   │                                            │
│ Sett │                                            │
│      │                                            │
└──────┴────────────────────────────────────────────┘
```

### Pagina Dashboard

```
<DashboardPage>
  <MetricCard label="Persone Totali" value={42} icon={👤} />
  <MetricCard label="Progetti Attivi" value={18} icon={📊} />
  <MetricCard label="Pipeline Value" value={€125K} icon={💰} />
  <MetricCard label="Win Rate" value={35%} icon={🎯} />
  
  <KanbanBoard>                              ← Mini pipeline su dashboard
    <KanbanColumn stage="Contact">
      <ProjectCard /> ...
    </KanbanColumn>
    <KanbanColumn stage="Opportunity">
      <ProjectCard /> ...
    </KanbanColumn>
    ...
  </KanbanBoard>
  
  <ActivityFeed />                           ← Attività recenti
</DashboardPage>
```

### Pagina People

```
<PeoplePage>
  <Header + Search + Filter>
  <PeopleTable>
    <PeopleRow name={} type={} stage=<StageBadge /> email={} projects={} />
  </PeopleTable>
  <Dialog>←<PeopleForm /> → Create/Edit</Dialog>
</PeoplePage>
```

### Pagina ProjectSpace

```
<ProjectSpacePage>
  <ProjectHeader>                          ← Nome, stage, value, cliente
    <StageBadge />
    <StageChanger />                       ← Dropdown per cambiare stage
  </ProjectHeader>
  
  <Tabs defaultValue="conversations">
    <TabsList>
      <TabsTrigger value="conversations">💬 Conversations</TabsTrigger>
      <TabsTrigger value="files">📎 Files</TabsTrigger>
      <TabsTrigger value="requirements">📋 Requirements</TabsTrigger>
      <TabsTrigger value="roadmap">🗺️ Roadmap</TabsTrigger>
      <TabsTrigger value="collaborators">👥 Collaborators</TabsTrigger>
      <TabsTrigger value="plans">📐 Plans</TabsTrigger>
    </TabsList>
    
    <TabsContent value="conversations">
      <ConversationFeed />                 ← Timeline di conversazioni
      <ConversationForm />                 ← Aggiungi conversazione
    </TabsContent>
    
    <TabsContent value="files">
      <FileList />
      <FileUpload />
    </TabsContent>
    
    <TabsContent value="requirements">
      <RequirementList />
      <RequirementForm />
    </TabsContent>
    
    <TabsContent value="roadmap">
      <MilestoneList />
      <MilestoneForm />
    </TabsContent>
    
    <TabsContent value="collaborators">
      <CollaboratorList />
      <AddCollaborator />
    </TabsContent>
    
    <TabsContent value="plans">
      <PlanList />
      <PlanForm />
    </TabsContent>
  </Tabs>
</ProjectSpacePage>
```

---

## 6. Route Map Frontend

| Path | Page | Description |
|------|------|-------------|
| `/login` | LoginPage | Auth login form |
| `/register` | RegisterPage | First-time admin registration |
| `/` | DashboardPage | Pipeline + metrics + activity feed |
| `/people` | PeoplePage | Table/list of all people |
| `/people/:id` | PeopleDetailPage | Person details + their projects |
| `/projects` | ProjectsPage | Full Kanban pipeline board |
| `/projects/:id` | ProjectSpacePage | Project detail with 6 tabs |
| `/settings` | SettingsPage | App settings (future) |

### Sidebar Navigation Items

| Icon | Label | Path | Badge |
|------|-------|------|-------|
| 🏠 | Dashboard | `/` | — |
| 👤 | People | `/people` | Count |
| 📊 | Projects | `/projects` | Active count |
| ⚙️ | Settings | `/settings` | — |

---

## 7. Auth Flow

```
Registration (first use):
  POST /api/auth/register → { user, token }
  → Token salvato in localStorage
  → Redirect a Dashboard

Login:
  POST /api/auth/login → { user, token }
  → Token salvato in localStorage
  → Redirect a Dashboard

Auth guard (frontend):
  <ProtectedRoute>
    → Check token in localStorage
    → GET /api/auth/me per validare
    → Se 401 → redirect a /login
    → Se OK → render child route

Logout:
  → Remove token da localStorage
  → Redirect a /login

Backend auth guard (Fastify hook):
  → Extract Bearer token
  → Verify JWT
  → Decode user info → attach a request
  → Se invalido → 401
```

### Zustand Auth Store

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}
```

---

## 8. Data Flow

### Pattern Generale

```
User Action → React Component → TanStack Query Hook → fetch() → Fastify Route → Service → Prisma → SQLite
                                                                                                    ↓
User sees UI update ← TanStack Query cache update ← Response JSON ← Fastify reply ← Service ← Prisma
```

### Esempio: Creazione Persona

```
1. User compila <PeopleForm /> e clicca "Salva"
2. useMutation da usePeople.ts → POST /api/people con body
3. people.routes.ts valida con schema Zod → people.service.ts
4. Service chiama prisma.people.create({ data: {...} })
5. Service logga attività: Activity.create({ type: "created", ... })
6. Response 201 { data: { id, name, ... } }
7. TanStack Query invalida key ["people"] → refresh lista
8. UI si aggiorna
```

### TanStack Query Keys

```typescript
// Struttura query keys per cache management
["dashboard"]                    // Dashboard data
["people"]                       // People list
["people", id]                   // Single person
["projects"]                     // Projects list
["projects", id]                 // Single project
["projects", id, "conversations"] // Project conversations
["projects", id, "requirements"]  // Project requirements
["projects", id, "milestones"]    // Project milestones
["projects", id, "collaborators"] // Project collaborators
["projects", id, "plans"]         // Project plans
["projects", id, "files"]         // Project files
```

### Mutations con Optimistic Updates

```typescript
// Pattern per tutte le CRUD mutations
const mutation = useMutation({
  mutationFn: (data) => api.post(`/api/people`, data),
  onMutate: async (newPerson) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["people"] });
    // Snapshot previous value
    const previous = queryClient.getQueryData(["people"]);
    // Optimistically update cache
    queryClient.setQueryData(["people"], (old) => [...old, newPerson]);
    return { previous };
  },
  onError: (err, newPerson, context) => {
    // Rollback on error
    queryClient.setQueryData(["people"], context.previous);
  },
  onSettled: () => {
    // Refetch to ensure consistency
    queryClient.invalidateQueries({ queryKey: ["people"] });
  },
});
```

---

## 9. Build Order (Step-by-Step)

L'implementazione segue questo ordine preciso. Ogni step produce un risultato testabile.

### Fase A — Backend Foundation (8 step)

| # | Step | Cosa si costruisce | Risultato testabile |
|---|------|-------------------|---------------------|
| A1 | Scaffold | `package.json`, `tsconfig.json`, `.env`, Prisma init | `npm run dev` parte |
| A2 | Prisma schema | Tutti i modelli (User, People, Project, Conversation, etc.) | `npx prisma db push` OK |
| A3 | App setup | `index.ts`, `app.ts`, `config.ts`, `lib/prisma.ts`, error handler | Server ascolta su :3000 |
| A4 | Auth module | Register + Login + JWT middleware + `/me` | Registrazione e login funzionano |
| A5 | People module | CRUD routes + stage management + search/filter | API People funzionante |
| A6 | Projects module | CRUD routes + stage change + nested resources | API Projects funzionante |
| A7 | Project nested modules | Conversations, Requirements, Milestones, Collaborators, Plans, Files | Tutte le sub-API funzionanti |
| A8 | Dashboard module | Aggregated metrics query | `GET /api/dashboard` risponde |

### Fase B — Frontend Foundation (5 step)

| # | Step | Cosa si costruisce | Risultato testabile |
|---|------|-------------------|---------------------|
| B1 | Scaffold | Vite + React + TypeScript + Tailwind + shadcn/ui init | `npm run dev` mostra pagina |
| B2 | App setup | Router, AppLayout (Sidebar + Header), ProtectedRoute | Navigazione tra pagine vuote |
| B3 | Auth UI | LoginPage, RegisterPage, auth store | Login/register flusso completo |
| B4 | API layer | `lib/api.ts`, tutte le TanStack Query hooks | Dati da backend arrivano |
| B5 | Shared components | LoadingSpinner, EmptyState, ErrorMessage, StageBadge | Componenti riutilizzabili |

### Fase C — Frontend Pages (6 step)

| # | Step | Cosa si costruisce | Risultato testabile |
|---|------|-------------------|---------------------|
| C1 | DashboardPage | MetricCards, mini Kanban, ActivityFeed | Dashboard con dati reali |
| C2 | PeoplePage | PeopleTable, PeopleForm dialog, search/filter | CRUD persone completo |
| C3 | PeopleDetailPage | Person card + related projects list | Dettaglio persona |
| C4 | ProjectsPage | KanbanBoard completo con drag-simulato (click stage) | Pipeline visuale |
| C5 | ProjectSpacePage | Header + Tabs + tutti i nested forms/liste | Spazio progetto completo |
| C6 | SettingsPage | Basic placeholder | — |

### Totale stima: ~150 files tra backend e frontend

---

## 10. File-by-File Checklist

### Backend (ensoria-api/) — ~45 files

```
[x] package.json
[x] tsconfig.json
[ ] .env
[ ] prisma/schema.prisma
[ ] src/index.ts
[ ] src/app.ts
[ ] src/config.ts
[ ] src/lib/prisma.ts
[ ] src/lib/errors.ts
[ ] src/plugins/auth.ts
[ ] src/modules/auth/auth.routes.ts
[ ] src/modules/auth/auth.service.ts
[ ] src/modules/auth/auth.schema.ts
[ ] src/modules/people/people.routes.ts
[ ] src/modules/people/people.service.ts
[ ] src/modules/people/people.schema.ts
[ ] src/modules/projects/projects.routes.ts
[ ] src/modules/projects/projects.service.ts
[ ] src/modules/projects/projects.schema.ts
[ ] src/modules/conversations/conversations.routes.ts
[ ] src/modules/conversations/conversations.service.ts
[ ] src/modules/conversations/conversations.schema.ts
[ ] src/modules/requirements/requirements.routes.ts
[ ] src/modules/requirements/requirements.service.ts
[ ] src/modules/requirements/requirements.schema.ts
[ ] src/modules/milestones/milestones.routes.ts
[ ] src/modules/milestones/milestones.service.ts
[ ] src/modules/milestones/milestones.schema.ts
[ ] src/modules/collaborators/collaborators.routes.ts
[ ] src/modules/collaborators/collaborators.service.ts
[ ] src/modules/collaborators/collaborators.schema.ts
[ ] src/modules/plans/plans.routes.ts
[ ] src/modules/plans/plans.service.ts
[ ] src/modules/plans/plans.schema.ts
[ ] src/modules/files/files.routes.ts
[ ] src/modules/files/files.service.ts
[ ] src/modules/files/files.schema.ts
[ ] src/modules/dashboard/dashboard.routes.ts
[ ] src/modules/dashboard/dashboard.service.ts
[ ] src/types/index.ts
```

### Frontend (ensoria-ui/) — ~105 files

```
[ ] package.json
[ ] tsconfig.json
[ ] tsconfig.app.json
[ ] tsconfig.node.json
[ ] vite.config.ts
[ ] tailwind.config.ts
[ ] postcss.config.js
[ ] index.html
[ ] src/main.tsx
[ ] src/App.tsx
[ ] src/index.css
[ ] src/lib/api.ts
[ ] src/lib/utils.ts
[ ] src/lib/auth.ts
[ ] src/stores/authStore.ts
[ ] src/hooks/useAuth.ts
[ ] src/hooks/usePeople.ts
[ ] src/hooks/useProjects.ts
[ ] src/hooks/useConversations.ts
[ ] src/hooks/useRequirements.ts
[ ] src/hooks/useMilestones.ts
[ ] src/hooks/useCollaborators.ts
[ ] src/hooks/usePlans.ts
[ ] src/hooks/useDashboard.ts
[ ] src/components/ui/button.tsx
[ ] src/components/ui/input.tsx
[ ] src/components/ui/card.tsx
[ ] src/components/ui/badge.tsx
[ ] src/components/ui/dialog.tsx
[ ] src/components/ui/dropdown-menu.tsx
[ ] src/components/ui/select.tsx
[ ] src/components/ui/tabs.tsx
[ ] src/components/ui/table.tsx
[ ] src/components/ui/textarea.tsx
[ ] src/components/ui/label.tsx
[ ] src/components/ui/separator.tsx
[ ] src/components/ui/avatar.tsx
[ ] src/components/ui/skeleton.tsx
[ ] src/components/ui/toast.tsx
[ ] src/components/ui/command.tsx (per Cmd+K)
[ ] src/components/layout/Sidebar.tsx
[ ] src/components/layout/Header.tsx
[ ] src/components/layout/AppLayout.tsx
[ ] src/components/people/PeopleTable.tsx
[ ] src/components/people/PeopleForm.tsx
[ ] src/components/people/PeopleCard.tsx
[ ] src/components/people/StageBadge.tsx
[ ] src/components/projects/KanbanBoard.tsx
[ ] src/components/projects/KanbanColumn.tsx
[ ] src/components/projects/ProjectCard.tsx
[ ] src/components/projects/ProjectForm.tsx
[ ] src/components/projects/ProjectsTable.tsx
[ ] src/components/conversations/ConversationFeed.tsx
[ ] src/components/conversations/ConversationForm.tsx
[ ] src/components/requirements/RequirementList.tsx
[ ] src/components/requirements/RequirementForm.tsx
[ ] src/components/milestones/MilestoneList.tsx
[ ] src/components/milestones/MilestoneForm.tsx
[ ] src/components/collaborators/CollaboratorList.tsx
[ ] src/components/collaborators/AddCollaborator.tsx
[ ] src/components/plans/PlanList.tsx
[ ] src/components/plans/PlanForm.tsx
[ ] src/components/dashboard/MetricCard.tsx
[ ] src/components/dashboard/ActivityFeed.tsx
[ ] src/components/dashboard/StageDistribution.tsx
[ ] src/components/shared/LoadingSpinner.tsx
[ ] src/components/shared/EmptyState.tsx
[ ] src/components/shared/ErrorMessage.tsx
[ ] src/components/shared/ProtectedRoute.tsx
[ ] src/pages/LoginPage.tsx
[ ] src/pages/RegisterPage.tsx
[ ] src/pages/DashboardPage.tsx
[ ] src/pages/PeoplePage.tsx
[ ] src/pages/PeopleDetailPage.tsx
[ ] src/pages/ProjectsPage.tsx
[ ] src/pages/ProjectSpacePage.tsx
[ ] src/pages/SettingsPage.tsx
```

---

## Appendice: Decisioni Tecniche Chiave

### 1. Stage come stringhe, non enum

Gli stage sono validati via costanti in codice, non enums nel DB. Questo permette:
- Cambiare stage senza migrazioni
- Aggiungere/rimuovere stadi al volo
- Validazione centralizzata

### 2. Activity log

Un modello `Activity` traccia tutte le modifiche significative (creazione, cambio stage, etc.). Questo alimenta:
- ActivityFeed sulla dashboard
- Audit trail per ogni persona/progetto
- Base per l'analytics engine futuro

### 3. Nessuna dipendenza su drag & drop library

MVP: cambio stage via dropdown/modal (non drag). Se serve drag in futuro, `@dnd-kit/core` è la scelta. Questo semplifica la Kanban iniziale.

### 4. SQLite per MVP

`better-sqlite3` sotto Prisma. Zero configurazione server. Migrazione a PostgreSQL via cambio `DATABASE_URL` e `provider` in schema.prisma.

### 5. Tokens nel frontend

JWT salvato in `localStorage`. Per produzione si passa a `httpOnly` cookies + refresh tokens. Per MVP locale va bene così.

### 6. Nessun file upload server-side reale

I file sono registrati come entry nel DB con path/URL. Per MVP l'upload è manuale (copia in directory locale + riferimento). Upload streaming reale in post-MVP.

### 7. Single admin per MVP

Il sistema auth per MVP ha un singolo admin (AleX). I ruoli multipli (employee/partner/client) sono post-MVP, ma lo schema è già predisposto con campo `role`.

---

## Prossimo Passo

Quando approvi questo documento, implemento nell'ordine:

1. **Build Fase A** — Backend foundation
2. **Test backend con curl/Thunder Client**
3. **Build Fase B** — Frontend foundation  
4. **Test login/register flusso completo**
5. **Build Fase C** — Tutte le pagine
6. **Review finale** — Test end-to-end

⚠️ **Regola:** dopo ogni fase ti faccio revieware prima di passare alla successiva.

---

*Documento generato da Ensoria il 2 Maggio 2026 • In attesa di revisione AleX*
