#!/bin/bash
# Ensoria OS — Setup Script
# Run this script after unzipping Ensoria OS

set -e

echo "🧠  Ensoria OS — Setup\n"

# ── Backend ──
echo "📦  Installing backend dependencies…"
cd ensoria-api
npm install
echo ""

echo "🗄️  Generating Prisma client…"
npx prisma generate
echo ""

echo "📋  Pushing database schema…"
npx prisma db push
echo ""

# ── Frontend ──
cd ../ensoria-ui
echo "📦  Installing frontend dependencies…"
npm install
echo ""

# ── Done ──
cd ..
echo "✅  Setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  To start Ensoria OS:"
echo ""
echo "  Terminal 1 — Backend API"
echo "    cd ensoria-api && npm run dev"
echo ""
echo "  Terminal 2 — Frontend UI"
echo "    cd ensoria-ui && npm run dev"
echo ""
echo "  Then open: http://localhost:5173"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
