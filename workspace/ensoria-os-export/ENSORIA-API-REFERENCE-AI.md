# Ensoria OS — MCP & API Reference for AI Agents

> Versione per AI Agent. Questo documento descrive come un modello AI
> può interagire con Ensoria OS per gestire il CRM (persone, progetti,
> conversazioni, requisiti, milestone, collaboratori, piani).

---

## Indice

1. [Autenticazione](#1-autenticazione)
2. [MCP Server (per agent con supporto MCP)](#2-mcp-server-per-agent-con-supporto-mcp)
3. [REST API (per agent senza MCP)](#3-rest-api-per-agent-senza-mcp)
4. [Flussi di lavoro comuni](#4-flussi-di-lavoro-comuni)
5. [Schema dati](#5-schema-dati)

---

## 1. Autenticazione

### Registrazione (primo avvio)
```
POST http://localhost:3000/api/auth/register
Body: { "email": "...", "password": "...", "name": "..." }
Risposta: { "data": { "user": { ... }, "token": "eyJ..." } }
```

### Login
```
POST http://localhost:3000/api/auth/login
Body: { "email": "...", "password": "..." }
Risposta: { "data": { "user": { ... }, "token": "eyJ..." } }
```

Il token JWT va passato in ogni richiesta come:
```
Authorization: Bearer eyJ...
```

---

## 2. MCP Server (per agent con supporto MCP)

Endpoint: `POST http://localhost:3000/api/mcp`
Trasporto: Streamable HTTP
Auth: `Authorization: Bearer <jwt>` in ogni richiesta

### Protocollo

Tutte le richieste sono JSON-RPC 2.0 su POST.

**Headers obbligatori:**
```
Content-Type: application/json
Accept: application/json, text/event-stream
Authorization: Bearer <token>
mcp-session-id: <id>  (dopo initialize)
```

### Inizializzazione sessione
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-03-26",
    "capabilities": {},
    "clientInfo": { "name": "perplexity-agent", "version": "1.0" }
  }
}
```
Risposta: session ID nell'header `mcp-session-id`.

### Scoprire i tool
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list",
  "params": {}
}
```
Risposta: 24 tool con nome, descrizione e schema parametri.

### Chiamare un tool
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "list_people",
    "arguments": { "stage": "Contact" }
  }
}
```

### Leggere una risorsa
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "resources/read",
  "params": { "uri": "people://cmop..." }
}
```

---

## 3. REST API (per agent senza MCP)

Se l'AI agent non supporta il protocollo MCP, usa direttamente la REST API.
Base URL: `http://localhost:3000/api`

### Persone (People)

**GET /api/people** — Lista filtrata
```
Query: ?type=partner&stage=Contact&search=Anna
Response: { "data": [ { "id": "...", "name": "...", ... } ] }
```

**POST /api/people** — Crea
```json
{
  "name": "Marta Rossi",
  "type": "partner",
  "email": "marta@email.com",
  "stage": "Opportunity"
}
```

**GET /api/people/:id** — Dettaglio + progetti
**PUT /api/people/:id** — Aggiorna
**PATCH /api/people/:id/stage** — Cambia stage
```json
{ "stage": "Client" }
```
**DELETE /api/people/:id** — Elimina

### Progetti (Projects)

**GET /api/projects** — Lista filtrata
```
Query: ?stage=Implementation&peopleId=...&search=...
```

**POST /api/projects** — Crea
```json
{
  "name": "Sito Web",
  "peopleId": "cmop...",
  "value": 8000,
  "stage": "Proposal",
  "description": "Progetto sito vetrina"
}
```

**GET /api/projects/:id** — Dettaglio completo
Restituisce: people, conversations, files, requirements, milestones, collaborators, plans, analytics

**PATCH /api/projects/:id/stage**
```json
{ "stage": "Implementation" }
```

### Conversazioni (sotto progetto)
```
GET    /api/projects/:id/conversations
POST   /api/projects/:id/conversations
Body:  { "channel": "email", "direction": "inbound", "content": "...", "subject": "..." }
```

### Requisiti (sotto progetto)
```
GET    /api/projects/:id/requirements
POST   /api/projects/:id/requirements
Body:  { "title": "...", "category": "requirement", "priority": "high", "description": "..." }
```

### Milestone (sotto progetto)
```
GET    /api/projects/:id/milestones
POST   /api/projects/:id/milestones
Body:  { "title": "...", "description": "...", "dueDate": "2026-06-01T00:00:00.000Z" }
PATCH  /api/projects/:id/milestones/:mid
Body:  { "status": "completed" }
```

### Collaboratori (sotto progetto)
```
GET    /api/projects/:id/collaborators
POST   /api/projects/:id/collaborators
Body:  { "name": "...", "role": "developer", "email": "..." }
DELETE /api/projects/:id/collaborators/:cid
```

### Piani (sotto progetto)
```
GET    /api/projects/:id/plans
POST   /api/projects/:id/plans
Body:  { "title": "...", "content": "# Markdown..." }
```

### Dashboard
```
GET /api/dashboard
Response: { "data": { "metrics": { "totalPeople": 5, "totalProjects": 3, "pipelineValue": 45000, "winRate": 0.33, "avgDealSize": 15000 }, "stageDistribution": {...}, "recentActivity": [...] } }
```

---

## 4. Flussi di lavoro comuni

### Flusso A: Onboarding cliente
1. `create_person` (name, type, email, stage=Contact)
2. `create_project` (name, peopleId, value, stage=Contact)
3. `add_conversation` (projectId, channel=email, content="...")
4. `add_milestone` (projectId, title="Prima call")
5. `change_person_stage` (stage=Opportunity)

### Flusso B: Proposta → Implementazione
1. `move_project_stage` (stage=Proposal) con valore
2. `add_requirement` (projectId, title, priority)
3. `add_collaborator` (projectId, name, role)
4. `create_plan` (projectId, content=markdown del piano)
5. `move_project_stage` (stage=Implementation)

### Flusso C: Report
1. `get_dashboard` per metriche aggregate
2. `list_people` con filtri per vedere stato pipeline
3. `list_projects` per vedere distribuzione stage

### Flusso D: Ricerca e aggiornamento
1. `list_projects` con `search=` per trovare un progetto
2. `get_project` per dettagli completi
3. `update_milestone` per aggiornare stato
4. `add_conversation` per registrare attività

---

## 5. Schema dati

### People
| Campo | Tipo | Default | Note |
|-------|------|---------|------|
| id | string (cuid) | auto | |
| type | enum | `client` | client, staff, partner, freelancer, company, investor |
| name | string | — | Obbligatorio |
| email | string? | null | |
| phone | string? | null | |
| company | string? | null | |
| stage | string | `Contact` | Contact, Opportunity, Client, Recurring Client |
| notes | string? | null | |
| tags | string | "" | Comma-separated |

### Project
| Campo | Tipo | Default | Note |
|-------|------|---------|------|
| id | string (cuid) | auto | |
| name | string | — | Obbligatorio |
| description | string? | null | |
| stage | string | Contact | 7 stadi (vedi sotto) |
| value | float? | null | Valore in EUR |
| peopleId | string | — | FK → People |

**Project Stages (ordine):**
`Contact → Opportunity → Proposal → Implementation → Onboarding → Live → Validated`

### Conversation
`channel`: webchat, whatsapp, email, social, gmail, manual
`direction`: inbound, outbound

### Requirement
`category`: need, goal, requirement
`status`: open, in-progress, met, cancelled
`priority`: low, medium, high, critical

### Milestone
`status`: pending, in-progress, completed, cancelled

---

## Esempi curl

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@ensoria.dev","password":"test123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

# 2. Chiamare MCP tool (copia-incolla in una singola chiamata)
curl -s -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_dashboard","arguments":{}}}'

# 3. Chiamare REST API
curl -s http://localhost:3000/api/people -H "Authorization: Bearer $TOKEN"
```

---

*Documento generato per AI Agent — Ensoria OS v0.2*
