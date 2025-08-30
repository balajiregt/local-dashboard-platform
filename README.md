# Playwright Test Results Dashboard

This repository serves as the backend storage and dashboard for Playwright test results. It provides a centralized location for your team to view and analyze test execution reports.

## 🚀 Features

- **Test Results Storage** - Centralized storage for all Playwright test reports
- **Web Dashboard** - React-based dashboard to view test results
- **Multiple Storage Backends** - Support for GitHub, SharePoint, Google Drive, Azure Files, and local folders
- **CLI Tool** - Command-line interface for uploading test results
- **GitHub Pages** - Automatic deployment of the dashboard

## 📊 Dashboard

The dashboard is automatically deployed to GitHub Pages and available at:
**https://balajiregt.github.io/local-dashboard-platform**

## 🛠️ Setup

### 1. Enable GitHub Pages

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Set "Source" to "GitHub Actions"
4. The dashboard will be automatically deployed when you push to the main branch

### 2. Install CLI Tool

```bash
# Clone this repository
git clone https://github.com/balajiregt/local-dashboard-platform.git
cd local-dashboard-platform

# Run setup script
./setup-cli.sh

# Or manually install
npm install
cd cli && npm install && npm run build
npm install -g ./cli
```

### 3. Initialize Configuration

```bash
# Initialize with this repository
playwright-reports init --repo balajiregt/local-dashboard-platform
```

## 📤 Uploading Test Results

### From Your Playwright Project

```bash
# Run tests with tracing
npx playwright test --trace=on

# Upload results to dashboard
playwright-reports sync
```

### CLI Commands

```bash
# Initialize configuration
playwright-reports init --repo balajiregt/local-dashboard-platform

# Upload test results
playwright-reports upload

# Sync test results (recommended)
playwright-reports sync

# Check status
playwright-reports status

# List recent reports
playwright-reports list
```

## 🏗️ Architecture

- **Frontend**: React dashboard application
- **Storage**: GitHub repository (with support for other backends)
- **CLI**: Node.js tool for uploading test results
- **Deployment**: GitHub Actions + GitHub Pages

## 📁 Repository Structure

```
local-dashboard-platform/
├── frontend/          # React dashboard application
├── cli/              # CLI tool for uploading test results
├── reports/          # Test results storage
├── .github/          # GitHub Actions workflows
└── README.md         # This file
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📖 Documentation

- [CLI Usage Guide](CLI_USAGE.md) - Complete CLI reference
- [Dashboard Guide](docs/dashboard-guide.md) - Dashboard usage instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **CLI Issues**: Check [CLI_USAGE.md](CLI_USAGE.md)
- **Dashboard Issues**: Check GitHub Pages settings
- **Repository Issues**: Verify repository permissions and settings
