#!/usr/bin/env python3
"""
Skill per Google Workspace (Gmail, Drive, Contatti).
Comandi supportati:
- Cerca email da <mittente>
- Trova contatto <nome>
- Invia email a <destinatario>: <testo>
- Cerca file su Drive <nome_file>
"""

import json
import requests
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configurazione
TOKEN_PATH = "/Users/alessio/.openclaw/workspace/google_token.json"

# Carica il token
with open(TOKEN_PATH) as f:
    token_data = json.load(f)

ACCESS_TOKEN = token_data["access_token"]
HEADERS = {"Authorization": f"Bearer {ACCESS_TOKEN}"}


def search_emails(query, max_results=5):
    """Cerca email per mittente o oggetto."""
    url = "https://www.googleapis.com/gmail/v1/users/me/messages"
    params = {
        "q": query,
        "maxResults": max_results
    }
    response = requests.get(url, headers=HEADERS, params=params)
    if response.status_code != 200:
        return f"Errore: {response.status_code} - {response.text}"
    
    messages = response.json().get("messages", [])
    if not messages:
        return "Nessuna email trovata."
    
    results = []
    for msg in messages:
        msg_url = f"https://www.googleapis.com/gmail/v1/users/me/messages/{msg['id']}"
        msg_response = requests.get(msg_url, headers=HEADERS)
        if msg_response.status_code != 200:
            continue
        
        msg_data = msg_response.json()
        headers = msg_data.get("payload", {}).get("headers", [])
        subject = next((h["value"] for h in headers if h["name"] == "Subject"), "Nessun oggetto")
        sender = next((h["value"] for h in headers if h["name"] == "From"), "Mittente sconosciuto")
        date = next((h["value"] for h in headers if h["name"] == "Date"), "Data sconosciuta")
        
        results.append(f"Da: {sender}\nOggetto: {subject}\nData: {date}\n")
    
    return "\n".join(results) if results else "Nessuna email trovata."


def find_contact(name):
    """Cerca un contatto per nome."""
    url = "https://people.googleapis.com/v1/people:searchContacts"
    params = {
        "query": name,
        "readMask": "names,emailAddresses,phoneNumbers"
    }
    response = requests.get(url, headers=HEADERS, params=params)
    if response.status_code != 200:
        return f"Errore: {response.status_code} - {response.text}"
    
    contacts = response.json().get("results", [])
    if not contacts:
        return "Contatto non trovato."
    
    results = []
    for contact in contacts:
        person = contact.get("person", {})
        names = person.get("names", [])
        emails = person.get("emailAddresses", [])
        phones = person.get("phoneNumbers", [])
        
        if names:
            email = emails[0]["value"] if emails else "Non disponibile"
            phone = phones[0]["value"] if phones else "Non disponibile"
            results.append(f"Nome: {names[0]['displayName']}\nEmail: {email}\nTelefono: {phone}")
    
    return "\n\n".join(results) if results else "Contatto non trovato."


def send_email(to, subject, body):
    """Invia una email."""
    url = "https://www.googleapis.com/gmail/v1/users/me/messages/send"
    
    message = MIMEMultipart()
    message["to"] = to
    message["from"] = "me"
    message["subject"] = subject
    message.attach(MIMEText(body, "plain"))
    
    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
    payload = {"raw": raw_message}
    
    response = requests.post(url, headers=HEADERS, json=payload)
    if response.status_code != 200:
        return f"Errore: {response.status_code} - {response.text}"
    
    return f"Email inviata a {to}"


def search_drive_file(query, max_results=5):
    """Cerca un file su Google Drive."""
    url = "https://www.googleapis.com/drive/v3/files"
    params = {
        "q": f"name contains '{query}' and trashed = false",
        "fields": "files(id, name, webViewLink)",
        "pageSize": max_results
    }
    response = requests.get(url, headers=HEADERS, params=params)
    if response.status_code != 200:
        return f"Errore: {response.status_code} - {response.text}"
    
    files = response.json().get("files", [])
    if not files:
        return "Nessun file trovato."
    
    results = []
    for file in files:
        results.append(f"Nome: {file['name']}\nLink: {file.get('webViewLink', 'Non disponibile')}")
    
    return "\n\n".join(results) if results else "Nessun file trovato."


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python google_workspace_skill.py <command> [args]")
        print("Commands:")
        print("  search_emails <query>")
        print("  find_contact <name>")
        print("  send_email <to> <subject> <body>")
        print("  search_drive <query>")
        sys.exit(1)
    
    command = sys.argv[1]
    if command == "search_emails" and len(sys.argv) >= 3:
        print(search_emails(" ".join(sys.argv[2:])))
    elif command == "find_contact" and len(sys.argv) >= 3:
        print(find_contact(" ".join(sys.argv[2:])))
    elif command == "send_email" and len(sys.argv) >= 5:
        print(send_email(sys.argv[2], sys.argv[3], " ".join(sys.argv[4:])))
    elif command == "search_drive" and len(sys.argv) >= 3:
        print(search_drive_file(" ".join(sys.argv[2:])))
    else:
        print("Comando non valido o argomenti mancanti.")