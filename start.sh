#!/bin/bash
echo "🌱 Starting PrintMint..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
npm run dev
