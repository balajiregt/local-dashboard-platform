#!/bin/bash

# Playwright Trace Intelligence Platform - Setup Example
# This script demonstrates how to set up the platform for your team

set -e

echo "🚀 Playwright Trace Intelligence Platform Setup"
echo "================================================"

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node --version)"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

# Check git
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed."
    exit 1
fi

# Check GitHub CLI (optional)
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found"
    HAS_GH_CLI=true
else
    echo "⚠️  GitHub CLI not found (optional, but recommended)"
    HAS_GH_CLI=false
fi

echo "✅ Prerequisites check completed"
echo ""

# Get repository information
echo "📝 Repository Configuration"
echo "============================"

if [ -z "$GITHUB_REPO" ]; then
    read -p "Enter your GitHub repository (owner/repo): " GITHUB_REPO
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo "GitHub Personal Access Token is required for uploading reports."
    echo "Create one at: https://github.com/settings/tokens"
    echo "Required permissions: repo (full access)"
    read -sp "Enter your GitHub token: " GITHUB_TOKEN
    echo ""
fi

# Validate repository format
if [[ ! "$GITHUB_REPO" =~ ^[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+$ ]]; then
    echo "❌ Invalid repository format. Expected: owner/repo"
    exit 1
fi

OWNER=$(echo "$GITHUB_REPO" | cut -d '/' -f 1)
REPO=$(echo "$GITHUB_REPO" | cut -d '/' -f 2)
DASHBOARD_URL="https://${OWNER}.github.io/${REPO}"

echo "✅ Repository: $GITHUB_REPO"
echo "✅ Dashboard URL: $DASHBOARD_URL"
echo ""

# Option 1: Use GitHub Template (Recommended)
echo "🎯 Setup Options"
echo "================"
echo "1. Use GitHub Template (Recommended)"
echo "2. Manual Setup"
echo ""

read -p "Choose option (1 or 2): " SETUP_OPTION

if [ "$SETUP_OPTION" = "1" ]; then
    echo ""
    echo "📋 GitHub Template Setup"
    echo "========================"
    echo ""
    echo "To use the GitHub template:"
    echo "1. Visit: https://github.com/playwright-trace-intelligence/template"
    echo "2. Click 'Use this template'"
    echo "3. Create repository: $GITHUB_REPO"
    echo "4. Clone your new repository"
    echo "5. Run this script in your cloned repository"
    echo ""
    echo "Once you've created the repository from the template, continue with the CLI setup below."
    echo ""
else
    echo ""
    echo "🔧 Manual Setup"
    echo "==============="
    echo ""
    
    # Create basic repository structure
    echo "Creating repository structure..."
    
    mkdir -p .github/workflows
    mkdir -p reports
    mkdir -p docs
    
    # Create basic README
    cat > README.md << EOF
# $REPO - Playwright Test Reports

Automated Playwright test report consolidation platform.

## Dashboard

View reports at: [$DASHBOARD_URL]($DASHBOARD_URL)

## Quick Start

1. Install CLI tool:
   \`\`\`bash
   npm install -g playwright-reports-cli
   \`\`\`

2. Configure:
   \`\`\`bash
   playwright-reports init --repo $GITHUB_REPO
   \`\`\`

3. Upload test results:
   \`\`\`bash
   npx playwright test --trace=on
   playwright-reports upload
   \`\`\`

## Documentation

- [Getting Started](docs/getting-started.md)
- [CLI Reference](docs/cli-reference.md)
EOF

    # Create initial reports index
    cat > reports/index.json << EOF
{
  "version": "1.0.0",
  "lastUpdated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "reports": []
}
EOF

    echo "✅ Repository structure created"
fi

# CLI Setup
echo ""
echo "🛠️  CLI Tool Setup"
echo "=================="

# Check if CLI tool is already installed
if command -v playwright-reports &> /dev/null; then
    echo "✅ playwright-reports CLI already installed"
else
    echo "📦 Installing playwright-reports CLI..."
    npm install -g playwright-reports-cli
    echo "✅ CLI tool installed"
fi

# Initialize CLI configuration
echo "🔧 Configuring CLI..."

# Set environment variables
export GITHUB_TOKEN="$GITHUB_TOKEN"

# Initialize configuration
playwright-reports init \
    --repo "$GITHUB_REPO" \
    --token "$GITHUB_TOKEN"

echo "✅ CLI configured"

# GitHub Pages Setup
echo ""
echo "🌐 GitHub Pages Setup"
echo "====================="

if [ "$HAS_GH_CLI" = true ]; then
    echo "🔧 Enabling GitHub Pages..."
    
    # Check if already enabled
    if gh api repos/"$GITHUB_REPO"/pages &>/dev/null; then
        echo "✅ GitHub Pages already enabled"
    else
        echo "📄 Enabling GitHub Pages..."
        gh api --method POST repos/"$GITHUB_REPO"/pages \
            --field source='{"branch":"gh-pages","path":"/"}'
        echo "✅ GitHub Pages enabled"
    fi
else
    echo "📋 Manual GitHub Pages Setup Required"
    echo "======================================"
    echo ""
    echo "To enable GitHub Pages manually:"
    echo "1. Go to: https://github.com/$GITHUB_REPO/settings/pages"
    echo "2. Under 'Source', select 'Deploy from a branch'"
    echo "3. Select branch: 'gh-pages'"
    echo "4. Select folder: '/ (root)'"
    echo "5. Click 'Save'"
    echo ""
    echo "Your dashboard will be available at: $DASHBOARD_URL"
fi

# Test Configuration
echo ""
echo "🧪 Testing Configuration"
echo "========================"

echo "🔍 Testing GitHub connection..."
if playwright-reports status; then
    echo "✅ GitHub connection successful"
else
    echo "❌ GitHub connection failed"
    echo "Please check your token and repository permissions"
fi

# Example test run
echo ""
echo "📝 Example Usage"
echo "================"

cat << EOF
Your Playwright Trace Intelligence Platform is now set up!

🎯 Next Steps:
1. Run your Playwright tests with tracing enabled:
   npx playwright test --trace=on

2. Upload the results:
   playwright-reports upload

3. View your dashboard:
   $DASHBOARD_URL

📚 Documentation:
- Getting Started: docs/getting-started.md
- CLI Reference: https://github.com/playwright-trace-intelligence/cli

🔧 Configuration:
- Local config: .playwright-reports.json
- Global config: ~/.playwright-reports/config.json

💡 Pro Tips:
- Use --failures-only to upload only failed tests
- Add --intent debugging for better insights
- Set up automatic uploads with --auto-upload

🎉 Happy testing!
EOF

echo ""
echo "✅ Setup completed successfully!" 