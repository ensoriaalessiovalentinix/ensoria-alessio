# Ensoria Manager — Specifica Completa

## 1. Nome
**Ensoria Manager** — CRM per tracciamento business clienti

## 2. Infrastructure
- **MVP**: Locale (MacBook), SQLite
- **Produzione**: Cloud privato + PostgreSQL
- **Pattern**: Repository/data-layer astratto, configurazione via env
- **Migrazioni**: Versionate
- **Predisposta per**: Disconnessione/riconnessione senza impatto sul codice

## 3. Schema Dati

```
👤 People (oggetto BASE)
   ├── type: staff | partner | libero professionista | azienda | investor
   │
   ├── Stadio: Contact → Opportunity → Client → Recurring Client
   │
   └── 🏢 Clienti = people con stadio Client o Recurring Client
         ├── Client: ha comprato 1+ volta
         └── Recurring Client: ha comprato 2+ volte
               └── 📊 Progetti (Opportunities, con stadio)
```

### Stadi People
```
Contact → Opportunity → Client → Recurring Client
```

### Stadi Progetti/Opportunities
```
Contact → Opportunity → Proposal → Implementation → Onboarding → Live → Validated
```

## 4. Spazio Progetto (cuore dell'app)
Ogni progetto ha uno spazio dedicato che raccoglie:
- **💬 Conversazioni cross-channel**: webchat, WhatsApp, email, social, **Gmail** (lettura + invio)
- **📎 Files & Links**: allegati, documenti, link di riferimento
- **📋 Requirements / Needs / Goals**: bisogni, obiettivi, requisiti cliente
- **🗺️ Roadmap + Milestone + Timeline**: scadenze, traguardi
- **👥 Collaboratori**: chi lavora al progetto
- **📐 Project Plans**: piani operativi e documenti

## 5. Analytics Layer
Dai dati raccolti si producono:
- **📈 Sentiment Score** — analisi sentiment dalle conversazioni
- **🎯 Alignment to Vision Score** — allineamento progetto alla visione
- **📉 Health Score** — trend, rischio, stato salute
- **📊 Estendibile** — altri score derivati

## 6. Auth & Accesso
| Ruolo | Accesso |
|-------|---------|
| **Admin (Io)** | Pieno |
| **Employees/Partners** | Dati in base al livello partnership |
| **Clienti** | Gratuito, solo dati propri, interazione online |

## 7. Gmail Integration
- Lettura: ✅
- Scrittura (invio): ✅
- Google Cloud Project: `sendmessagesbot` (già configurato)

## 8. Tech Stack (da decidere)
- Backend: ?
- Frontend: ?
- DB Layer: ?
