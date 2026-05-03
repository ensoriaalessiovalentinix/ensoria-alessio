# 🧠 Ensoria OS — v0.2

> CRM System · Gestione pipeline, persone e progetti con interfaccia AI-ready.

**Locale** · [http://localhost:5173](http://localhost:5173)

---

## Indice

- [Avvio Rapido](#avvio-rapido)
- [Web App](#web-app)
- [REST API](#rest-api)
- [MCP Server (AI Agents)](#mcp-server-ai-agents)
- [24 MCP Tools](#24-mcp-tools)
- [Connettere Cursor o Claude Desktop](#connettere-cursor-o-claude-desktop)
- [Architettura](#architettura)
- [Comandi](#comandi)

---

## Avvio Rapido

```bash
# Terminal 1 — Backend API
cd ~/.openclaw/workspace/ensoria-api
npm run dev

# Terminal 2 — Frontend UI
cd ~/.openclaw/workspace/ensoria-ui
npm run dev
```

Poi apri **http://localhost:5173** nel browser.

### Primo login

1. Vai su [http://localhost:5173/register](http://localhost:5173/register)
2. Crea un account (email + password + nome)
3. Sei dentro — Dashboard, People, Projects, Settings

Se il DB è già popolato, puoi anche fare login con:
- **Email:** `admin@ensoria.dev`
- **Password:** `test123`

---

## Web App

| Pagina | URL | Descrizione |
|--------|-----|-------------|
| Dashboard | `/` | Metriche, pipeline Kanban, activity feed |
| People | `/people` | Tabella + filtri + CRUD |
| People Detail | `/people/:id` | Scheda persona + progetti correlati |
| Projects | `/projects` | KanbanBoard a 7 colonne |
| Project Space | `/projects/:id` | 6 tab: 💬 📎 📋 🗺️ 👥 📐 |
| Settings | `/settings` | Impostazioni |

### Pipeline Stages

**People:** `Contact → Opportunity → Client → Recurring Client`
**Projects:** `Contact → Opportunity → Proposal → Implementation → Onboarding → Live → Validated`

---

## REST API

Base URL: `http://localhost:3000/api`

### Autenticazione — Ottenere il JWT

```bash
# Registrazione (una tantum)
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"tuo@email.com","password":"123456","name":"Tuo Nome"}'

# Login (ottieni il token)
curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@ensoria.dev","password":"test123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])"
```

Il token JWT va passato come header:
```
Authorization: Bearer <token>
```

### Endpoint principali

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/people` | Lista persone (`?type=&stage=&search=`) |
| POST | `/api/people` | Crea persona |
| GET | `/api/people/:id` | Dettaglio persona + progetti |
| PATCH | `/api/people/:id/stage` | Cambia stage |
| GET | `/api/projects` | Lista progetti (`?stage=&peopleId=&search=`) |
| POST | `/api/projects` | Crea progetto |
| GET | `/api/projects/:id` | Progetto completo con tutte le relazioni |
| PATCH | `/api/projects/:id/stage` | Cambia stage progetto |
| GET | `/api/dashboard` | Metriche aggregate |
| POST | `/api/auth/me` | Info utente corrente |
| GET | `/health` | Health check |

**Nested resources** (sotto `/api/projects/:id/`):
`conversations`, `requirements`, `milestones`, `collaborators`, `plans`, `files`

---

## MCP Server (AI Agents)

Ensoria OS espone un server **MCP (Model Context Protocol)** che permette ad AI agent (Claude, Cursor, Copilot, ecc.) di interagire direttamente con i dati del CRM.

**Endpoint:** `POST /api/mcp` (Streamable HTTP)
**Auth:** `Authorization: Bearer <jwt>`
**SDK:** `@modelcontextprotocol/sdk` v1.29

### Esempio di connessione via MCP SDK

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:3000/api/mcp"),
  {
    requestInit: {
      headers: {
        Authorization: "Bearer <jwt-token>",
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
    },
  },
);

const client = new Client(
  { name: "my-agent", version: "1.0.0" },
  { capabilities: {} },
);
await client.connect(transport);

// Chiamare un tool
const result = await client.callTool({
  name: "list_people",
  arguments: { stage: "Contact" },
});
```

---

## 24 MCP Tools

Tutti i tool accettano parametri opzionali e restituiscono JSON. Sono raggruppati per dominio.

### 👤 People (7 tools)

| Tool | Descrizione | Parametri |
|------|-------------|-----------|
| `list_people` | Elenca persone con filtri | `type?`, `stage?`, `search?` |
| `get_person` | Dettaglio persona + progetti | `id` |
| `create_person` | Crea nuovo contatto | `name`, `type?`, `email?`, `phone?`, `company?`, `stage?`, `notes?` |
| `update_person` | Modifica persona | `id`, `name?`, `type?`, `email?`, `phone?`, `company?`, `notes?` |
| `change_person_stage` | Cambia stage persona | `id`, `stage` (Contact\|Opportunity\|Client\|Recurring Client) |
| `delete_person` | Elimina persona (irreversibile) | `id` |

### 📊 Projects (5 tools)

| Tool | Descrizione | Parametri |
|------|-------------|-----------|
| `list_projects` | Elenca progetti con filtri | `stage?`, `peopleId?`, `search?` |
| `get_project` | Dettaglio progetto + nested risorse | `id` |
| `create_project` | Crea progetto per una persona | `name`, `peopleId`, `description?`, `value?`, `stage?` |
| `move_project_stage` | Sposta progetto tra stadi | `id`, `stage` (Contact→Opportunity→...→Validated) |
| `delete_project` | Elimina progetto (cascade) | `id` |

### 💬 Conversations (2 tools)

| Tool | Descrizione | Parametri |
|------|-------------|-----------|
| `list_conversations` | Conversazioni di un progetto | `projectId` |
| `add_conversation` | Aggiunge messaggio | `projectId`, `channel?`, `direction?`, `content`, `subject?` |

### 📋 Requirements (2 tools)

| Tool | Descrizione | Parametri |
|------|-------------|-----------|
| `list_requirements` | Requirement di un progetto | `projectId` |
| `add_requirement` | Aggiunge requirement | `projectId`, `title`, `description?`, `category?`, `priority?` |

### 🗺️ Roadmap / Milestones (3 tools)

| Tool | Descrizione | Parametri |
|------|-------------|-----------|
| `list_milestones` | Milestone di un progetto | `projectId` |
| `add_milestone` | Aggiunge milestone | `projectId`, `title`, `description?`, `dueDate?` |
| `update_milestone` | Cambia stato milestone | `projectId`, `id`, `status?`, `title?` |

### 👥 Collaborators (3 tools)

| Tool | Descrizione | Parametri |
|------|-------------|-----------|
| `list_collaborators` | Collaboratori di un progetto | `projectId` |
| `add_collaborator` | Aggiunge collaboratore | `projectId`, `name`, `email?`, `phone?`, `role?` |
| `remove_collaborator` | Rimuove collaboratore | `projectId`, `id` |

### 📐 Plans (2 tools)

| Tool | Descrizione | Parametri |
|------|-------------|-----------|
| `list_plans` | Piani/documenti di un progetto | `projectId` |
| `create_plan` | Crea nuovo piano (markdown) | `projectId`, `title`, `content?` |

### 📈 Dashboard (1 tool)

| Tool | Descrizione | Parametri |
|------|-------------|-----------|
| `get_dashboard` | Metriche aggregate, activity feed | *(nessun parametro)* |

### MCP Resources

Oltre ai tool, il server espone 3 resource template leggibili:

| URI Template | Descrizione |
|-------------|-------------|
| `people://{id}` | Dettaglio persona con progetti |
| `project://{id}` | Progetto completo con tutte le relazioni |
| `dashboard://summary` | Metriche aggregate del CRM |

---

## Connettere Cursor o Claude Desktop

### Cursor

Aggiungi in **Settings → MCP**:

```json
{
  "mcpServers": {
    "ensoria-os": {
      "type": "sse",
      "url": "http://localhost:3000/api/mcp",
      "headers": {
        "Authorization": "Bearer <jwt-token>"
      }
    }
  }
}
```

### Claude Desktop

Usa `mcp-remote` come bridge (Claude Desktop supporta solo stdio):

```json
{
  "mcpServers": {
    "ensoria-os": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:3000/api/mcp"],
      "env": {
        "MCP_REMOTE_HEADERS": "{\"Authorization\": \"Bearer <jwt-token>\"}"
      }
    }
  }
}
```

---

## Architettura

```
./
├── ensoria-api/          # Backend (Fastify 5 + Prisma + SQLite)
│   ├── prisma/
│   │   ├── schema.prisma   # 11 modelli
│   │   └── dev.db          # Database SQLite
│   ├── src/
│   │   ├── app.ts           # Fastify app factory
│   │   ├── config.ts        # Config (port, JWT secret)
│   │   ├── lib/
│   │   │   ├── prisma.ts    # Prisma client
│   │   │   └── errors.ts    # Error handling
│   │   ├── plugins/
│   │   │   └── auth.ts      # JWT auth decorator
│   │   └── modules/
│   │       ├── auth/        # Register, Login, Me
│   │       ├── people/      # CRUD + stage
│   │       ├── projects/    # CRUD + nested + stage
│   │       ├── conversations/
│   │       ├── requirements/
│   │       ├── milestones/
│   │       ├── collaborators/
│   │       ├── plans/
│   │       ├── files/
│   │       ├── dashboard/   # Metriche aggregate
│   │       └── mcp/         # ✨ MCP Server (24 tools + 3 resources)
│   │           ├── mcp.plugin.ts   # Fastify plugin (POST/GET/DELETE)
│   │           ├── mcp.tools.ts    # 24 MCP tool definitions
│   │           └── mcp.resources.ts # 3 MCP resource templates
│   ├── package.json
│   └── tsconfig.json
│
└── ensoria-ui/            # Frontend (React 19 + Vite + Tailwind 4)
    ├── src/
    │   ├── main.tsx         # Entry point
    │   ├── App.tsx          # Router
    │   ├── index.css        # Tailwind + dark theme
    │   ├── lib/
    │   │   └── api.ts       # Fetch wrapper + auth
    │   ├── hooks/           # 9 TanStack Query hooks
    │   ├── stores/
    │   │   └── authStore.ts # Zustand auth
    │   ├── components/
    │   │   ├── ui/          # Button, Input, Card, Dialog, Tabs, Table...
    │   │   ├── layout/      # Sidebar, Header, AppLayout
    │   │   └── shared/      # LoadingSpinner, EmptyState, ErrorMessage
    │   └── pages/           # 8 pages (Login, Register, Dashboard, People...)
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

**Tech Stack:**
- **Backend:** Node.js, Fastify 5, Prisma 7, SQLite, JWT, Zod
- **Frontend:** React 19, Vite 6, Tailwind 4, TanStack Query 5, Zustand 5
- **MCP:** `@modelcontextprotocol/sdk` 1.29 (Streamable HTTP)
- **AI Agent:** DeepSeek (runtime), Claude/Gemini/Cursor via MCP

---

## Comandi

```bash
# Backend
cd ensoria-api
npm run dev        # Avvia su :3000
npm run build      # Compila TypeScript
npm start          # Avvia versione compilata
npm run db:push    # Sincronizza schema Prisma
npm run db:studio  # Apre Prisma Studio (UI database)

# Frontend
cd ensoria-ui
npm run dev        # Avvia su :5173
npm run build      # Build produzione
npm run preview    # Preview build

# Test MCP
cd ensoria-api
npx tsx test-mcp.ts   # Test completo (24 tools + resources)
```

---

## License

v0.2 — Built by [Ensoria](https://github.com/openclaw) per Alessio Valentini.
Parte del workspace OpenClaw.
