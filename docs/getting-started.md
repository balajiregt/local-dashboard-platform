# Getting Started with Playwright Trace Intelligence Platform

This guide will help you set up and start using the Playwright Trace Intelligence Platform to consolidate your team's local test results.

## Overview

The Playwright Trace Intelligence Platform provides:
- **Local Test Upload**: CLI tool to upload Playwright test results to GitHub
- **Team Dashboard**: GitHub Pages-hosted dashboard for viewing consolidated reports
- **Zero Infrastructure**: Everything runs on GitHub - no servers to maintain
- **Private & Secure**: All data stays within your GitHub organization
- **Enhanced Insights**: Capture test execution intent and insights for better debugging

## Prerequisites

- Node.js 18+ installed
- Playwright tests already set up in your project
- GitHub repository for storing reports
- GitHub account with repository access
- GitHub Personal Access Token

## Quick Start

### 1. Installation

```bash
# Install the CLI tool globally
npm install -g playwright-reports-cli

# Or install locally in your project
npm install --save-dev playwright-reports-cli
```

### 2. Initialize Configuration

```bash
# Run the initialization wizard
npx playwright-reports init

# Or provide options directly
npx playwright-reports init --repo yourorg/playwright-reports
```

The wizard will ask for:
- **Project name**: A friendly name for your project
- **GitHub repository**: In format `owner/repo` (will be created if it doesn't exist)
- **GitHub token**: Personal access token (optional, can use GITHUB_TOKEN env var)
- **Developer name**: Your name for attribution
- **Test results path**: Path to your Playwright test results (default: `./test-results`)

### 3. Set up GitHub Repository

1. **Create Repository**: Create a GitHub repository for storing reports (e.g., `yourorg/playwright-reports`)

2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Set source to "GitHub Actions"
   - The dashboard will be available at `https://yourorg.github.io/playwright-reports`

3. **Set GitHub Token** (optional):
   ```bash
   export GITHUB_TOKEN=your_token_here
   ```

### 4. Run Tests and Upload Results

```bash
# Run Playwright tests with tracing enabled
npx playwright test --trace=on

# Upload all results
playwright-reports upload

# Upload only failures
playwright-reports upload --failures-only

# Upload with context and intent
playwright-reports upload --intent debugging --reasoning "Investigating payment flow issues"
```

### 5. View Your Dashboard

Visit `https://yourorg.github.io/playwright-reports` to see your team's consolidated test reports.

## Configuration

### Local Configuration (`.playwright-reports.json`)

```json
{
  "name": "My Playwright Project",
  "repository": "myorg/playwright-reports",
  "github": {
    "token": "optional-if-using-env-var",
    "pages": {
      "url": "https://myorg.github.io/playwright-reports",
      "source": "gh-pages"
    }
  },
  "localConfig": {
    "developer": "Your Name",
    "uploadPath": "./test-results",
    "includeSuccessful": false,
    "includeFailures": true,
    "autoUpload": false
  },
  "playwright": {
    "testDir": "./tests",
    "traceDir": "./test-results",
    "tracePaths": [
      "test-results/**/trace.zip",
      "test-results/**/*.png",
      "test-results/**/*.webm"
    ],
    "browsers": ["chromium", "firefox", "webkit"],
    "devices": ["Desktop Chrome", "iPhone 13", "iPad"],
    "collectTraces": "retain-on-failure",
    "collectScreenshots": "only-on-failure",
    "collectVideos": "retain-on-failure"
  }
}
```

### Environment Variables

- `GITHUB_TOKEN`: Your GitHub Personal Access Token
- `GITHUB_REPO`: Repository in format `owner/repo`

## Enhanced Features

### Test Execution Intent

The platform captures your intent when running tests to provide better insights:

```bash
# Specify your testing purpose
playwright-reports upload --intent debugging --reasoning "Investigating payment flow issues"

# Set expectations
playwright-reports upload --expect-failures --target-tests "payment,checkout"

# Add goals and context
playwright-reports upload --goals "verify-fix,test-edge-cases" --context "After fixing API timeout issue"
```

### Execution Insights

After uploading, the CLI will prompt you to capture insights:
- What you expected vs what actually happened
- Surprising results
- What you learned
- Next steps
- Confidence level in the results

### Advanced Upload Options

```bash
# Upload with custom developer name
playwright-reports upload --developer "John Doe"

# Upload with branch information
playwright-reports upload --branch "feature/new-checkout"

# Upload with environment context
playwright-reports upload --environment "staging"

# Dry run to see what would be uploaded
playwright-reports upload --dry-run

# Upload specific test results directory
playwright-reports upload --path ./custom-test-results
```

## CLI Commands

### `init`
Initialize configuration for the CLI tool.
```bash
playwright-reports init [--repo <repository>] [--token <token>] [--global]
```

### `upload`
Upload test results to GitHub repository.
```bash
playwright-reports upload [options]
```

Options:
- `--developer <name>`: Override developer name
- `--branch <branch>`: Specify git branch
- `--environment <env>`: Environment name (default: local)
- `--failures-only`: Upload only failed tests
- `--path <path>`: Custom test results directory
- `--dry-run`: Show what would be uploaded
- `--intent <intent>`: Test execution intent
- `--expect-failures`: Whether you expect tests to fail
- `--reasoning <text>`: Why you're running these tests
- `--goals <goals>`: Comma-separated list of goals
- `--confidence <1-10>`: Your confidence in the results

### `status`
Show current configuration and connection status.
```bash
playwright-reports status
```

### `list`
List recent test reports.
```bash
playwright-reports list [--limit <number>]
```

## Team Setup

### Using GitHub Template (Recommended)

1. Visit: `https://github.com/playwright-trace-intelligence/template`
2. Click "Use this template"
3. Create your team's repository
4. Clone and run the setup script:
   ```bash
   git clone https://github.com/yourorg/your-repo.git
   cd your-repo
   ./setup.sh
   ```

### Manual Setup

1. Create a new GitHub repository for reports
2. Run the setup script:
   ```bash
   curl -sSL https://raw.githubusercontent.com/playwright-trace-intelligence/platform/main/examples/setup-example.sh | bash
   ```

## Troubleshooting

### Common Issues

1. **Authentication Error**
   - Verify your GitHub token has `repo` permissions
   - Check that the token isn't expired
   - Ensure the repository exists and you have access

2. **No Test Results Found**
   - Verify the test results path in configuration
   - Ensure Playwright is configured to generate traces
   - Check that tests have been run recently

3. **Dashboard Not Loading**
   - Verify GitHub Pages is enabled
   - Check that the repository is public or you're logged into GitHub
   - Wait a few minutes for GitHub Pages to deploy

4. **Upload Fails**
   - Check your internet connection
   - Verify repository name format (`owner/repo`)
   - Ensure you have write permissions to the repository

### Getting Help

- Check the [CLI Reference](./cli-reference.md)
- Review [Usage Examples](../examples/insights-usage-examples.md)
- Open an issue on GitHub
- Join our Discord community

## Best Practices

### For Individual Developers

1. **Run tests with tracing** for better debugging information
2. **Use meaningful intent descriptions** when uploading
3. **Capture insights** after test runs to build team knowledge
4. **Upload failures immediately** for team visibility

### For Teams

1. **Establish naming conventions** for branches and environments
2. **Regular cleanup** of old reports (automated via GitHub Actions)
3. **Review team insights** weekly to identify patterns
4. **Set up notifications** for critical test failures

### CI/CD Integration

While primarily designed for local development, you can integrate with CI/CD:

```yaml
# GitHub Actions example
- name: Upload test results
  if: failure()
  run: |
    npm install -g playwright-reports-cli
    playwright-reports upload --environment "ci" --developer "CI Bot"
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Next Steps

1. **Set up your first project** following this guide
2. **Explore the dashboard** features and filtering options
3. **Train your team** on capturing meaningful insights
4. **Customize the platform** for your team's workflow
5. **Consider AI enhancements** for advanced failure analysis (Phase 2)

## Security & Privacy

- All data stays within your GitHub organization
- Uses GitHub's enterprise-grade security
- No external services or data sharing
- Audit trail via Git history
- Access control via GitHub permissions

---

Ready to get started? Run the setup script or follow the manual installation steps above! 