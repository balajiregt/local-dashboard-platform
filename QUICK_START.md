# 🚀 Quick Start: Integrate with Your Project in 5 Minutes

This guide gets you up and running with the dashboard in your existing Playwright project immediately.

## ⚡ Super Quick Setup (2 commands)

```bash
# 1. Copy the CLI to your project and install globally
cp -r /Users/bky13/Desktop/local_dashboard_platform/cli /tmp/playwright-reports-cli
cd /tmp/playwright-reports-cli && npm install -g .

# 2. Initialize in your Playwright project
cd /path/to/your/playwright/project
playwright-reports init --local
```

That's it! Now when you run tests, you can upload them to the dashboard.

## 📋 What This Does

- ✅ Installs the `playwright-reports` CLI tool globally
- ✅ Creates local configuration in your project  
- ✅ Sets up data processing for your trace files
- ✅ Enables dashboard visualization of your tests

## 🎯 Basic Usage

```bash
# Run your tests with tracing
npx playwright test --trace=on

# Upload results to local dashboard
playwright-reports upload --local

# Start the dashboard
playwright-reports dashboard
```

## 🔧 Integration Options

### Option 1: Local Dashboard (Fastest)

Best for quick debugging and local development:

```bash
# Configure for local usage
playwright-reports init --local

# Run tests and upload
npx playwright test --trace=on
playwright-reports upload --local

# View dashboard at http://localhost:3000
playwright-reports dashboard
```

### Option 2: GitHub Team Dashboard

Best for teams and CI/CD:

```bash
# Configure for GitHub
playwright-reports init --repo your-username/your-dashboard-repo

# Run tests and upload
npx playwright test --trace=on
playwright-reports upload

# Team views at https://your-username.github.io/your-dashboard-repo
```

## 📁 What Gets Created

In your project directory:
```
your-project/
├── .playwright-reports.json    # Configuration
├── test-results/              # Your existing test results
└── playwright-dashboard/      # Local dashboard (if using --local)
    ├── data/                  # Processed trace data
    ├── frontend/              # Dashboard UI
    └── tools/                 # Processing scripts
```

## 🎬 Complete Example

```bash
# Example: Setting up in an existing project
cd ~/my-awesome-app

# Install the CLI
cp -r /Users/bky13/Desktop/local_dashboard_platform/cli /tmp/playwright-reports-cli
cd /tmp/playwright-reports-cli && npm install -g .

# Go back to your project
cd ~/my-awesome-app

# Initialize local dashboard
playwright-reports init --local

# Run your tests
npx playwright test --trace=on

# Upload and view
playwright-reports upload --local
playwright-reports dashboard

# Open http://localhost:3000 in your browser
```

## 🚀 Advanced Integration

Add to your `package.json`:

```json
{
  "scripts": {
    "test:dashboard": "npx playwright test --trace=on && playwright-reports upload --local && playwright-reports dashboard",
    "test:upload": "playwright-reports upload",
    "dashboard:start": "playwright-reports dashboard"
  }
}
```

Then just run:
```bash
npm run test:dashboard
```

## 🎯 Next Steps

1. **Try it out**: Run the quick setup above
2. **Customize**: Edit `.playwright-reports.json` for your needs  
3. **Team setup**: Use GitHub integration for team dashboards
4. **CI/CD**: Add upload commands to your pipeline

📚 **Full Documentation**: See `PROJECT_INTEGRATION_GUIDE.md` for comprehensive setup options.

Happy testing! 🎭✨ 