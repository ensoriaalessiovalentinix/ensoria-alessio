#!/usr/bin/env python3
"""
Script per integrare Perplexity Personal Computer (PC) in OpenClaw.

Funzionalità:
- Invia richieste a Perplexity PC tramite API.
- Gestisce automazioni avanzate (es. report, email, analisi dati).
- Restituisce risultati in formato strutturato.

Requisiti:
- API key di Perplexity configurata in OpenClaw.
- Account Perplexity PC attivo.
"""

import requests
import json
import argparse
import os
from datetime import datetime

# Configurazione
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY", "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")
PERPLEXITY_PC_URL = "https://api.perplexity.ai/personal-computer/completions"


def send_to_perplexity_pc(prompt, output_format="text"):
    """
    Invia una richiesta a Perplexity PC e restituisce il risultato.
    
    Args:
        prompt (str): Il prompt in linguaggio naturale.
        output_format (str): Formato di output (text, json, markdown).
    
    Returns:
        dict: Risposta da Perplexity PC.
    """
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "sonar-pro",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "output_format": output_format
    }
    
    response = requests.post(PERPLEXITY_PC_URL, headers=headers, data=json.dumps(payload))
    
    if response.status_code != 200:
        raise Exception(f"Errore Perplexity PC: {response.text}")
    
    return response.json()


def save_output(result, output_format="text"):
    """
    Salva il risultato in un file.
    
    Args:
        result (dict): Risposta da Perplexity PC.
        output_format (str): Formato di output.
    
    Returns:
        str: Percorso del file salvato.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"perplexity_output_{timestamp}.{output_format}"
    filepath = os.path.join(os.getcwd(), filename)
    
    with open(filepath, "w") as f:
        if output_format == "json":
            json.dump(result, f, indent=2)
        else:
            f.write(result.get("content", ""))
    
    return filepath


def main():
    parser = argparse.ArgumentParser(description="Integra Perplexity PC in OpenClaw.")
    parser.add_argument("--prompt", type=str, required=True, help="Prompt in linguaggio naturale.")
    parser.add_argument("--format", type=str, default="text", choices=["text", "json", "markdown"], help="Formato di output.")
    args = parser.parse_args()
    
    try:
        print(f"🔍 Invio richiesta a Perplexity PC: {args.prompt}")
        result = send_to_perplexity_pc(args.prompt, args.format)
        
        print("✅ Risposta ricevuta!")
        filepath = save_output(result, args.format)
        
        print(f"📄 Risultato salvato in: {filepath}")
        print("\n🔹 Anteprima:")
        if args.format == "json":
            print(json.dumps(result, indent=2))
        else:
            print(result.get("content", "")[:500] + "...")  # Anteprima dei primi 500 caratteri
            
    except Exception as e:
        print(f"❌ Errore: {e}")


if __name__ == "__main__":
    main()