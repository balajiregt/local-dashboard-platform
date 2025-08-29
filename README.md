# Playwright Trace Intelligence Platform

An AI-powered Playwright trace analysis platform that automatically collects and analyzes Playwright trace files to provide deep insights into test execution, performance, and failure patterns.

## 🚀 Features

- **Local Test Report Upload** - Simple CLI tool to upload Playwright test results
- **GitHub-First Architecture** - Frontend on GitHub Pages, data in GitHub repo
- **Zero Infrastructure** - No servers, Docker, or complex setup needed
- **Team-Wide Visibility** - Consolidated test reports from all team members
- **Historical Tracking** - Track test trends across local executions over time
- **Organization-Private** - All data stays within your GitHub organization

### 🧠 Enhanced Insights & Intelligence

- **Unique Report Tracking** - Every report gets a unique ID and sequential number
- **Test Execution Intent** - Capture why you're running tests (debugging, validation, regression, etc.)
- **Real-time Insights** - Understand what you expected vs what actually happened
- **Smart Expectations** - Track when tests fail/pass as expected or surprise you
- **Automated Context** - Captures git commits, code changes, and related tickets
- **Learning Capture** - Document what you discovered and next steps
- **Confidence Tracking** - Rate your confidence in results and track over time

## 🏗️ Architecture

This platform uses a GitHub-first architecture:

- **Frontend**: React SPA hosted on GitHub Pages
- **CLI Tool**: Node.js tool for uploading local test results
- **Data Storage**: GitHub repository files (JSON/markdown)
- **Processing**: GitHub Actions for trace analysis
- **Authentication**: GitHub OAuth + repository access

## 📦 Project Structure

```
playwright-trace-intelligence-platform/
├── frontend/          # React dashboard application
├── cli/              # CLI tool for uploading test results
├── .github/          # GitHub Actions workflows
│   └── workflows/
├── docs/             # Documentation
└── examples/         # Example configurations
```

## 🛠️ Quick Start

### 1. Setup (One-time)

```bash
# Clone or use this template repository
git clone https://github.com/yourorg/playwright-trace-intelligence-platform.git
cd playwright-trace-intelligence-platform

# Install dependencies
npm run install:all

# Enable GitHub Pages in your repository settings
# Add your OpenAI API key to GitHub Secrets (optional, for AI features)
```

### 2. Upload Test Results

```bash
# Install CLI tool globally
npm install -g ./cli

# Initialize in your Playwright project
playwright-reports init --repo yourorg/playwright-reports

# After running Playwright tests
npx playwright test --trace=on

# Upload results with insights
playwright-reports upload \
  --intent "development" \
  --reasoning "Testing new user authentication feature" \
  --goals "Verify login works,Check edge cases" \
  --confidence 8

# For debugging sessions
playwright-reports upload \
  --intent "debugging" \
  --expect-failures \
  --reasoning "Reproducing login timeout issue" \
  --target-tests "auth login"
```

### 3. View Reports

Navigate to `https://yourorg.github.io/playwright-reports` to view your team's consolidated test reports.

## 🔧 Development

```bash
# Start development servers
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## 📖 Documentation

- [Getting Started Guide](docs/getting-started.md)
- [CLI Reference](docs/cli-reference.md)
- [Dashboard Guide](docs/dashboard-guide.md)
- [API Documentation](docs/api.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details. 