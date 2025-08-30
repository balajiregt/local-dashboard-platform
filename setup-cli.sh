#!/bin/bash

# Playwright Reports CLI Setup Script
# This script helps you set up the CLI tool for uploading test results

set -e

echo "🚀 Setting up Playwright Reports CLI..."
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build the CLI
echo ""
echo "🔨 Building CLI tool..."
cd cli
npm install
npm run build
cd ..

# Install CLI globally
echo ""
echo "🌐 Installing CLI globally..."
npm install -g ./cli

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Initialize configuration:"
echo "   playwright-reports init --repo balajiregt/local-dashboard-platform"
echo ""
echo "2. Run your Playwright tests:"
echo "   npx playwright test --trace=on"
echo ""
echo "3. Upload test results:"
echo "   playwright-reports sync"
echo ""
echo "4. View your dashboard:"
echo "   open https://balajiregt.github.io/local-dashboard-platform"
echo ""
echo "For more help, run: playwright-reports --help"
