#!/usr/bin/env python3
"""
1. Trova email e numero di Jacopo Buizza (contatti + email).
2. Invia i dati a pingme@alessiovalentini.co.uk.
3. Legge l'ultima email e la inoltra a alessiovalentinix@gmail.com.
"""

import json
import requests
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Carica il token
TOKEN_PATH = "/Users/alessio/.openclaw/workspace/google_token.json"
with open(TOKEN_PATH) as f:
    token_data = json.load(f)

ACCESS_TOKEN = token_data["access_token"]
HEADERS = {"Authorization": f"Bearer {ACCESS_TOKEN}"}


def find_jacopo_buizza():
    """Cerca Jacopo Buizza nei contatti e nelle email."""
    print("🔍 Cerco Jacopo Buizza nei contatti...")
    
    # Cerca nei contatti
    url = "https://people.googleapis.com/v1/people:searchContacts"
    params = {
        "query": "Jacopo Buizza",
        "readMask": "names,emailAddresses,phoneNumbers"
    }
    response = requests.get(url, headers=HEADERS, params=params)
    if response.status_code != 200:
        print(f"Errore contatti: {response.status_code} - {response.text}")
        return None
    
    contacts = response.json().get("results", [])
    for contact in contacts:
        person = contact.get("person", {})
        names = person.get("names", [])
        emails = person.get("emailAddresses", [])
        phones = person.get("phoneNumbers", [])
        
        if names and "Jacopo Buizza" in names[0].get("displayName", ""):
            email = emails[0]["value"] if emails else "Non trovato"
            phone = phones[0]["value"] if phones else "Non trovato"
            print(f"✅ Trovato nei contatti: {names[0]['displayName']} | Email: {email} | Telefono: {phone}")
            return {
                "name": names[0]["displayName"],
                "email": email,
                "phone": phone,
                "source": "Contatti Google"
            }
    
    # Se non trovato nei contatti, cerca nelle email
    print("🔍 Cerco Jacopo Buizza nelle email...")
    url = "https://www.googleapis.com/gmail/v1/users/me/messages"
    params = {
        "q": "Jacopo Buizza",
        "maxResults": 5
    }
    response = requests.get(url, headers=HEADERS, params=params)
    if response.status_code != 200:
        print(f"Errore email: {response.status_code} - {response.text}")
        return None
    
    messages = response.json().get("messages", [])
    for msg in messages:
        msg_url = f"https://www.googleapis.com/gmail/v1/users/me/messages/{msg['id']}"
        msg_response = requests.get(msg_url, headers=HEADERS)
        if msg_response.status_code != 200:
            continue
        
        msg_data = msg_response.json()
        headers = msg_data.get("payload", {}).get("headers", [])
        subject = next((h["value"] for h in headers if h["name"] == "Subject"), "Nessun oggetto")
        sender = next((h["value"] for h in headers if h["name"] == "From"), "Mittente sconosciuto")
        
        if "Jacopo Buizza" in sender:
            # Estrai l'email dal campo "From" (es. "Jacopo Buizza <jacopo@example.com>")
            if "<" in sender and ">" in sender:
                email = sender.split("<")[1].split(">")[0]
            else:
                email = sender
            print(f"✅ Trovato nelle email: {sender} | Oggetto: {subject}")
            return {
                "name": "Jacopo Buizza",
                "email": email,
                "phone": "Non trovato (controlla firme email)",
                "source": f"Email del {msg_data.get('internalDate', 'data sconosciuta')}"
            }
    
    print("❌ Jacopo Buizza non trovato nei contatti o nelle email.")
    return None


def send_email(to, subject, body):
    """Invia una email tramite Gmail API."""
    url = "https://www.googleapis.com/gmail/v1/users/me/messages/send"
    
    # Crea il messaggio
    message = MIMEMultipart()
    message["to"] = to
    message["from"] = "me"
    message["subject"] = subject
    message.attach(MIMEText(body, "plain"))
    
    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
    payload = {"raw": raw_message}
    
    response = requests.post(url, headers=HEADERS, json=payload)
    if response.status_code != 200:
        print(f"Errore invio email: {response.status_code} - {response.text}")
        return False
    
    print(f"✅ Email inviata a {to}")
    return True


def get_latest_email_content():
    """Legge il contenuto dell'ultima email ricevuta."""
    url = "https://www.googleapis.com/gmail/v1/users/me/messages"
    params = {
        "maxResults": 1,
        "q": "in:inbox"
    }
    response = requests.get(url, headers=HEADERS, params=params)
    if response.status_code != 200:
        print(f"Errore recupero ultima email: {response.status_code} - {response.text}")
        return None
    
    messages = response.json().get("messages", [])
    if not messages:
        print("❌ Nessuna email trovata.")
        return None
    
    msg_url = f"https://www.googleapis.com/gmail/v1/users/me/messages/{messages[0]['id']}?format=full"
    msg_response = requests.get(msg_url, headers=HEADERS)
    if msg_response.status_code != 200:
        print(f"Errore recupero dettagli email: {msg_response.status_code} - {msg_response.text}")
        return None
    
    msg_data = msg_response.json()
    headers = msg_data.get("payload", {}).get("headers", [])
    subject = next((h["value"] for h in headers if h["name"] == "Subject"), "Nessun oggetto")
    sender = next((h["value"] for h in headers if h["name"] == "From"), "Mittente sconosciuto")
    
    # Estrai il corpo dell'email
    body = ""
    if "parts" in msg_data["payload"]:
        for part in msg_data["payload"]["parts"]:
            if part["mimeType"] == "text/plain":
                body_data = part["body"]["data"]
                body = base64.urlsafe_b64decode(body_data).decode("utf-8")
                break
    else:
        if msg_data["payload"]["mimeType"] == "text/plain":
            body_data = msg_data["payload"]["body"]["data"]
            body = base64.urlsafe_b64decode(body_data).decode("utf-8")
    
    return {
        "subject": subject,
        "sender": sender,
        "body": body
    }


if __name__ == "__main__":
    # Task 1: Trova Jacopo Buizza
    jacopo = find_jacopo_buizza()
    
    # Task 2: Invia i dati a pingme@alessiovalentini.co.uk
    if jacopo:
        email_body = (
            f"Nome: {jacopo['name']}\n"
            f"Email: {jacopo['email']}\n"
            f"Telefono: {jacopo['phone']}\n"
            f"Fonte: {jacopo['source']}"
        )
        send_email(
            to="pingme@alessiovalentini.co.uk",
            subject="Dati di contatto: Jacopo Buizza",
            body=email_body
        )
    else:
        send_email(
            to="pingme@alessiovalentini.co.uk",
            subject="Dati di contatto: Jacopo Buizza",
            body="❌ Jacopo Buizza non trovato nei contatti o nelle email."
        )
    
    # Task 3: Leggi l'ultima email e inoltrala
    latest_email = get_latest_email_content()
    if latest_email:
        inoltro_body = (
            f"Mittente: {latest_email['sender']}\n"
            f"Oggetto: {latest_email['subject']}\n"
            f"Corpo:\n{latest_email['body']}"
        )
        send_email(
            to="alessiovalentinix@gmail.com",
            subject=f"Inoltrato: {latest_email['subject']}",
            body=inoltro_body
        )