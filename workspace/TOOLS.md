# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod

### Google Workspace

- **Token**: `/Users/alessio/.openclaw/workspace/google_token.json`
- **Credenziali OAuth2**: `/Users/alessio/.openclaw/workspace/google_oauth_credentials.json`
- **Scopes**: Gmail (lettura/scrittura), Drive (sola lettura), Contatti (sola lettura)
- **Project ID**: `sendmessagesbot` (Google Cloud)
- **Revoca accesso**: [https://myaccount.google.com/permissions](https://myaccount.google.com/permissions)
- **Abilita API**: Gmail, Drive, People (se disabilitate)
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## Related

- [Agent workspace](/concepts/agent-workspace)
