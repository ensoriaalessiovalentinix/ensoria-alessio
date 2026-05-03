#!/usr/bin/env python3
"""
Google OAuth2 Client per OpenClaw/Ensoria.
Gestisce l'autenticazione, il salvataggio del token e il refresh automatico.
"""

import os
import json
import time
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import requests

# Configurazione
CREDENTIALS_PATH = "/Users/alessio/.openclaw/workspace/google_oauth_credentials.json"
TOKEN_PATH = "/Users/alessio/.openclaw/workspace/google_token.json"
SCOPES = [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/contacts.readonly",
    "https://www.googleapis.com/auth/gmail.modify"
]
REDIRECT_URI = "http://localhost:8080"
PORT = 8080

# Carica le credenziali
with open(CREDENTIALS_PATH) as f:
    credentials = json.load(f)

CLIENT_ID = credentials["installed"]["client_id"]
CLIENT_SECRET = credentials["installed"]["client_secret"]

# Handler per il server locale
class OAuthCallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = parse_qs(urlparse(self.path).query)
        if "code" in query:
            self.server.auth_code = query["code"][0]
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(b"<h1>Autenticazione completata!</h1><p>Puoi chiudere questa finestra.</p>")
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"<h1>Errore</h1><p>Codice di autorizzazione non trovato.</p>")

    def log_message(self, format, *args):
        # Disabilita i log del server per pulizia
        pass


def get_auth_url():
    """Genera l'URL per l'autorizzazione OAuth2."""
    auth_url = (
        "https://accounts.google.com/o/oauth2/auth?"
        f"client_id={CLIENT_ID}&"
        f"redirect_uri={REDIRECT_URI}&"
        f"response_type=code&"
        f"scope={' '.join(SCOPES)}&"
        "access_type=offline&"
        "prompt=consent"
    )
    return auth_url


def exchange_code_for_token(auth_code):
    """Scambia il codice di autorizzazione per un token."""
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": auth_code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    response = requests.post(token_url, data=data)
    return response.json()


def save_token(token_data):
    """Salva il token su file."""
    with open(TOKEN_PATH, "w") as f:
        json.dump(token_data, f)


def load_token():
    """Carica il token da file."""
    if os.path.exists(TOKEN_PATH):
        with open(TOKEN_PATH) as f:
            return json.load(f)
    return None


def refresh_token(refresh_token):
    """Refresh del token di accesso."""
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    response = requests.post(token_url, data=data)
    return response.json()


def authenticate():
    """Esegue il flusso di autenticazione OAuth2."""
    # Avvia il server locale
    server = HTTPServer(("localhost", PORT), OAuthCallbackHandler)
    server.auth_code = None
    
    # Apri il browser per l'autorizzazione
    auth_url = get_auth_url()
    print(f"Apri questo URL nel browser per autorizzare Ensoria:\n{auth_url}")
    webbrowser.open(auth_url)
    
    # Aspetta il codice di autorizzazione
    while server.auth_code is None:
        server.handle_request()
    
    # Scambia il codice per il token
    token_data = exchange_code_for_token(server.auth_code)
    save_token(token_data)
    print("Autenticazione completata! Token salvato.")
    return token_data


def get_valid_token():
    """Ottiene un token valido (nuovo o refreshato)."""
    token_data = load_token()
    
    if not token_data:
        return authenticate()
    
    # Se il token è scaduto, refreshalo
    if time.time() > token_data.get("created", 0) + token_data.get("expires_in", 0):
        print("Token scaduto. Refresh in corso...")
        refreshed_token = refresh_token(token_data["refresh_token"])
        token_data.update({
            "access_token": refreshed_token["access_token"],
            "expires_in": refreshed_token["expires_in"],
            "created": time.time()
        })
        save_token(token_data)
    
    return token_data


if __name__ == "__main__":
    print("Avvio autenticazione Google OAuth2...")
    token = get_valid_token()
    print(f"Token di accesso: {token['access_token']}")