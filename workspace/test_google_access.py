#!/usr/bin/env python3
"""
Test di accesso a Google APIs (Gmail, Drive, Contatti).
"""

import json
import requests

# Carica il token
TOKEN_PATH = "/Users/alessio/.openclaw/workspace/google_token.json"
with open(TOKEN_PATH) as f:
    token_data = json.load(f)

ACCESS_TOKEN = token_data["access_token"]
HEADERS = {"Authorization": f"Bearer {ACCESS_TOKEN}"}


def test_gmail():
    """Legge le ultime 3 email (solo oggetto e mittente)."""
    url = "https://www.googleapis.com/gmail/v1/users/me/messages"
    params = {
        "maxResults": 3,
        "q": "in:inbox"
    }
    response = requests.get(url, headers=HEADERS, params=params)
    if response.status_code != 200:
        print(f"Errore Gmail: {response.status_code} - {response.text}")
        return
    
    messages = response.json().get("messages", [])
    print(f"📧 Ultime {len(messages)} email:")
    for msg in messages:
        msg_url = f"https://www.googleapis.com/gmail/v1/users/me/messages/{msg['id']}"
        msg_response = requests.get(msg_url, headers=HEADERS)
        if msg_response.status_code != 200:
            print(f"  - Errore nel recupero del messaggio {msg['id']}")
            continue
        
        msg_data = msg_response.json()
        headers = msg_data.get("payload", {}).get("headers", [])
        subject = next((h["value"] for h in headers if h["name"] == "Subject"), "Nessun oggetto")
        sender = next((h["value"] for h in headers if h["name"] == "From"), "Mittente sconosciuto")
        print(f"  - Da: {sender}")
        print(f"    Oggetto: {subject}\n")


def test_drive():
    """Conta i file recenti su Drive."""
    url = "https://www.googleapis.com/drive/v3/files"
    params = {
        "pageSize": 1,
        "fields": "files(id, name), nextPageToken",
        "q": "trashed = false"
    }
    response = requests.get(url, headers=HEADERS, params=params)
    if response.status_code != 200:
        print(f"Errore Drive: {response.status_code} - {response.text}")
        return
    
    files = response.json().get("files", [])
    print(f"📁 File recenti su Drive: {len(files)} (esempio: {files[0]['name'] if files else 'Nessun file'})")


def test_contacts():
    """Conta i contatti."""
    url = "https://people.googleapis.com/v1/people/me/connections"
    params = {
        "pageSize": 1,
        "personFields": "names"
    }
    response = requests.get(url, headers=HEADERS, params=params)
    if response.status_code != 200:
        print(f"Errore Contatti: {response.status_code} - {response.text}")
        return
    
    connections = response.json().get("connections", [])
    print(f"👥 Contatti: {response.json().get('totalPeople', 0)} (esempio: {connections[0]['names'][0]['displayName'] if connections else 'Nessun contatto'})")


if __name__ == "__main__":
    print("🔍 Test di accesso a Google APIs...")
    test_gmail()
    test_drive()
    test_contacts()