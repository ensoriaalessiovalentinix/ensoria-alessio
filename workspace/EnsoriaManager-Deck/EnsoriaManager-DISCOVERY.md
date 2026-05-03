# Ensoria Manager — Discovery & Design Document

## 🔍 Market Analysis — App Simili

### 1. Twenty CRM (40.5K ⭐ GitHub)
- **Stack**: React + NestJS + PostgreSQL + Redis + GraphQL
- **Licenza**: AGPL-3.0
- **Cosa fa bene**: Custom objects/fields via GUI, Email/Calendar sync (Google), visual workflow builder, roles & permissions, global search
- **Cosa manca**: UI un po' basic, no AI features, no charts nativi, no multi-tenancy
- **Perché è rilevante**: Il miglior reference per un CRM moderno open-source. Architettura solida (NestJS backend).

### 2. Chatwoot (25K ⭐ GitHub)
- **Stack**: Ruby on Rails + Vue.js + PostgreSQL
- **Licenza**: MIT
- **Cosa fa bene**: Inbox unificato cross-channel (webchat, email, WhatsApp, FB, IG, Telegram, LINE, SMS), agent assignment, automation rules, CSAT surveys, reporting
- **Perché è rilevante**: Il reference PERFETTO per il modulo conversazioni cross-channel. Pattern da copiare.

### 3. Atomic CRM (MIT licensed)
- **Stack**: React + shadcn/ui + Supabase + PostgreSQL
- **Cosa fa bene**: Solo 15K LOC, SSO/SAML, Kanban pipeline board, model studio, MCP Server per AI, mobile UI eccellente
- **Perché è rilevante**: Il miglior template per costruire un CRM custom. Stack moderno, leggero, estensibile.

### 4. Frappe CRM (Python + Vue.js)
- **Cosa fa bene**: WhatsApp nativo, contatti/deal management, workflow automation
- **Perché è rilevante**: Reference per integrazione WhatsApp

### 5. Customer Health Scoring (MCP Pattern)
- **Architettura**: Multi-agent (data integration → analysis → recommendation)
- **Scoring model**: Usage (40%) + Relationship (30%) + Support (30%)
- **Weighted composite score**: 0-100 con soglie (Green/Yellow/Red)
- **Perché è rilevante**: Pattern da copiare per il nostro Analytics Layer

---

## 🎨 UI/UX Design Patterns

### Dashboard Principale
- Pipeline Kanban (drag & drop) — deal cards con valore, stage, close date, owner
- Metric cards: pipeline value, win rate, avg deal size, sales cycle
- Activity feed cronologico
- Team leaderboards

### Layout di Riferimento
- Sidebar navigazione (sinistra) — collapse/expand
- Header con search globale + user menu
- Main content area flessibile (lista/dettaglio/kanban)
- Dark/light mode
- Keyboard shortcuts (Cmd+K per command palette)

### Spazio Progetto — Pattern consigliato
- Tab-based navigation: Conversations | Files | Requirements | Roadmap | Collaborators | Plans | Analytics
- Left panel: project info + quick stats + stage indicator
- Main panel: active tab content
- Right panel (optional): activity feed, notes

### Mobile
- Bottom navigation (mobile)
- Responsive: lista → dettaglio drill-down
- PWA-ready per installazione su mobile

---

## 🏗️ Engineering Solution Design

### Tech Stack Raccomandato

| Layer | MVP | Produzione |
|-------|-----|------------|
| **Backend** | Node.js + Express/Fastify | NestJS (come Twenty CRM) |
| **Frontend** | React + shadcn/ui + TanStack Query | React + Next.js |
| **Database** | SQLite (better-sqlite3) | PostgreSQL |
| **ORM** | Prisma (astrae DB layer) | Prisma |
| **Auth** | JWT + bcrypt | JWT + OAuth2 + SSO |
| **Omnichannel** | Pattern Chatwoot | Integrazione nativa |
| **AI/Analytics** | OpenAI/Claude API + scripts | MCP server dedicato |
| **Gmail** | Google API (project `sendmessagesbot`) | Webhook + push notifications |
| **File Storage** | Filesystem locale | S3-compatible |
| **Deploy** | Local (Docker) | Docker + cloud VPS |

### Architettura Backend (NestJS-like pattern)

```
ensoria-api/
├── src/
│   ├── modules/
│   │   ├── people/          # CRUD + stage management
│   │   ├── projects/        # CRUD + pipeline stages
│   │   ├── conversations/   # Cross-channel unified inbox
│   │   ├── files/           # File upload/link management
│   │   ├── requirements/    # Needs/goals/requirements
│   │   ├── roadmap/         # Milestones, timelines
│   │   ├── collaborators/   # Team/project assignment
│   │   ├── plans/           # Project plans
│   │   ├── analytics/       # Scoring engine
│   │   ├── auth/            # JWT, roles, permissions
│   │   ├── gmail/           # Gmail integration
│   │   └── webhooks/        # External integrations
│   ├── common/
│   │   ├── database/        # Prisma service
│   │   ├── guards/          # Auth guards
│   │   └── decorators/      # Custom decorators
│   └── main.ts
├── prisma/
│   └── schema.prisma        # Database schema
└── package.json
```

### Architettura Frontend

```
ensoria-ui/
├── src/
│   ├── components/          # shadcn/ui + custom components
│   ├── pages/
│   │   ├── dashboard/       # Main dashboard
│   │   ├── people/          # People list/detail
│   │   ├── projects/        # Projects pipeline/detail
│   │   ├── project/         # Single project space (tabs)
│   │   ├── analytics/       # Scores & insights
│   │   ├── settings/        # Configurazione
│   │   └── auth/            # Login/register
│   ├── hooks/               # Custom hooks
│   ├── api/                 # API client (TanStack Query)
│   ├── stores/              # State management
│   └── App.tsx
├── tailwind.config.js
└── package.json
```

### Database Schema (Prisma)

```prisma
model People {
  id          String   @id @default(cuid())
  type        String   // staff | partner | freelancer | company | investor
  name        String
  email       String?
  phone       String?
  company     String?
  stage       String   // Contact | Opportunity | Client | Recurring Client
  tags        String[] // For flexibility
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  projects    Project[]
  contacts    Contact[]
  activities  Activity[]
}

model Project {
  id            String   @id @default(cuid())
  name          String
  description   String?
  stage         String   // Contact | Opportunity | Proposal | Implementation | Onboarding | Live | Validated
  peopleId      String
  people        People   @relation(fields: [peopleId], references: [id])
  
  conversations Conversation[]
  files         ProjectFile[]
  requirements  Requirement[]
  milestones    Milestone[]
  collaborators Collaborator[]
  plans         ProjectPlan[]
  analytics     AnalyticsRecord[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Conversation {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  channel     String   // webchat | whatsapp | email | social | gmail
  direction   String   // inbound | outbound
  content     String
  metadata    Json?    // channel-specific metadata
  sentiment   Float?   // -1 to 1
  createdAt   DateTime @default(now())
}

model AnalyticsRecord {
  id              String   @id @default(cuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id])
  sentimentScore  Float?
  alignmentScore  Float?
  healthScore     Float?
  generatedAt     DateTime @default(now())
}
```

---

## 🚀 Feature Roadmap — MVP vs Post-MVP

### MVP (Iterazione 1)
- [ ] Auth: login/register per admin
- [ ] People CRUD + stage management
- [ ] Projects CRUD + pipeline stages (Kanban)
- [ ] Spazio progetto: tabs base
- [ ] Conversazioni: manual insert + timeline
- [ ] Files & links: upload + URL save
- [ ] Requirements/Goals CRUD
- [ ] Roadmap: milestones + timeline
- [ ] Collaborators: aggiunta/rimozione
- [ ] Dashboard: pipeline view + metric cards

### Post-MVP Features Suggerite
- [ ] **Omnichannel inbox**: integrazione Chatwoot-style (webchat, WhatsApp, email, social)
- [ ] **Gmail sync**: lettura + invio, attachment sync
- [ ] **Client portal**: accesso gratuito per clienti ai propri dati
- [ ] **Analytics engine**: sentiment scoring AI, alignment score, health score
- [ ] **Employee/Partner roles**: livelli di accesso granulari
- [ ] **Webhook integrations**: Zapier/n8n style
- [ ] **Mobile app**: PWA o nativa
- [ ] **AI assistant**: assistente che suggerisce azioni basate sui dati
- [ ] **Automation rules**: workflow triggers (es: stage change → email)
- [ ] **Reports & dashboards**: export CSV, charts custom
- [ ] **Multi-tenancy**: isolamento dati per futuro hosting cloud
- [ ] **Calendar sync**: Google Calendar integration
- [ ] **Billing integration**: Stripe per fatturazione
- [ ] **Knowledge base**: documentazione condivisa per progetto

---

## 📐 Scoring Model Design (per Analytics Layer)

```
Health Score = Sentiment(30%) + Alignment(25%) + Project Progress(20%) + Engagement(15%) + Communication Volume(10%)

Sentiment Score (0-100):
  - Derived from conversation analysis (NLP)
  - Weighted by recency (recent conversations count more)
  - Thresholds: Positive > 65, Neutral 35-65, Negative < 35

Alignment to Vision Score (0-100):
  - Based on requirements/goals alignment with business vision
  - Manual + AI-assisted scoring
  - Tracked over time for trend analysis
```
