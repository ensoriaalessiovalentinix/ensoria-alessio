# Google Workspace Skill

Skill per interagire con **Gmail, Google Drive e Contatti** tramite comandi naturali.

## 📌 **Requisiti**
- Token OAuth2 salvato in `/Users/alessio/.openclaw/workspace/google_token.json`.
- API Google abilitate (Gmail, Drive, People).
- Scopes richiesti:
  - `https://www.googleapis.com/auth/gmail.modify`
  - `https://www.googleapis.com/auth/drive.readonly`
  - `https://www.googleapis.com/auth/contacts.readonly`

## 🛠 **Comandi supportati**
| Comando (esempio)                          | Descrizione                                                                                     |
|--------------------------------------------|-------------------------------------------------------------------------------------------------|
| `Cerca email da <mittente>`                | Cerca le ultime 5 email da un mittente (es. "Anna Lucido").                                  |
| `Trova contatto <nome>`                    | Cerca un contatto per nome (es. "Jacopo Buizza").                                             |
| `Invia email a <destinatario>: <testo>`    | Invia una email (es. "Invia email a Anna: Ci vediamo domani?").                              |
| `Cerca file su Drive <nome_file>`          | Cerca un file su Drive (es. "Contratto Affitto").                                            |

## 🚀 **Esempi d'uso**
```
- "Cerca email da Amazon"
- "Trova il numero di Jacopo Buizza"
- "Invia email a pingme@alessiovalentini.co.uk: Test da Ensoria"
- "Cerca file su Drive Fattura 2026"
```

## ⚠️ **Limitazioni**
- **Privacy**: Non legge il contenuto delle email oltre quanto necessario per eseguire i comandi.
- **Sicurezza**: Il token è salvato localmente e non condiviso.
- **Revoca accesso**: Puoi revocare l'accesso in qualsiasi momento da [Google Account Permissions](https://myaccount.google.com/permissions).

## 📂 **File della skill**
- Script: `/Users/alessio/.openclaw/workspace/google_workspace_skill.py`
- Token: `/Users/alessio/.openclaw/workspace/google_token.json`
- Credenziali: `/Users/alessio/.openclaw/workspace/google_oauth_credentials.json`