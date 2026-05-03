#!/bin/bash

# Comando per eseguire automazioni con Perplexity PC da OpenClaw.
# Uso: /perplexity "prompt"

PROMPT="$1"
FORMAT="text"  # Puoi modificare in json o markdown se necessario

python3 /Users/alessio/.openclaw/workspace/perplexity_pc_automation.py --prompt "$PROMPT" --format "$FORMAT"