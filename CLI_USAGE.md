# Playwright Reports CLI Usage Guide

This CLI tool allows you to upload Playwright test results directly to your dashboard backend without creating pull requests. It supports multiple storage backends including GitHub, SharePoint, Google Drive, Azure Files, and local folders.

## Quick Start

### 1. Initialize Configuration

```bash
# Initialize with GitHub backend (recommended for most users)
playwright-reports init --repo balajiregt/local-dashboard-platform

# Or specify a different storage backend
playwright-reports init --storage sharepoint
```

### 2. Run Your Playwright Tests

```bash
# Run tests with tracing enabled
npx playwright test --trace=on

# Or with specific options
npx playwright test --trace=on --screenshot=on --video=on
```

### 3. Upload Test Results

```bash
# Upload test results to your configured backend
playwright-reports upload

# Upload with custom options
playwright-reports upload --developer "Your Name" --environment "staging"

# Upload only failed tests
playwright-reports upload --failures-only

# Dry run to see what would be uploaded
playwright-reports upload --dry-run
```

### 4. Sync Test Results (Recommended)

```bash
# Sync test results (same as upload but with better feedback)
playwright-reports sync

# Auto-commit and push changes (GitHub only)
playwright-reports sync --auto-commit

# Watch mode for continuous syncing
playwright-reports sync --watch
```

## Storage Backend Management

### List Available Backends

```bash
playwright-reports storage --list
```

### Switch Storage Backend

```bash
# Switch to SharePoint
playwright-reports storage --set sharepoint

# Switch to Google Drive
playwright-reports storage --set google-drive

# Switch to Azure Files
playwright-reports storage --set azure-files

# Switch to local folder
playwright-reports storage --set local-folder
```

### Configure Storage Backend

```bash
# Configure specific backend
playwright-reports storage --configure sharepoint
playwright-reports storage --configure google-drive
```

## Configuration

The CLI stores configuration in `.playwright-reports.json` in your project directory. You can also set a global configuration.

### GitHub Configuration

```json
{
  "name": "My Playwright Project",
  "repository": "owner/repo",
  "storage": {
    "type": "github"
  },
  "localConfig": {
    "developer": "Your Name",
    "uploadPath": "./test-results",
    "includeSuccessful": true,
    "includeFailures": true,
    "autoUpload": false
  },
  "github": {
    "token": "your-github-token",
    "pages": {
      "url": "https://owner.github.io/repo",
      "source": "gh-pages"
    }
  }
}
```

### SharePoint Configuration

```json
{
  "storage": {
    "type": "sharepoint",
    "siteUrl": "https://yourtenant.sharepoint.com/sites/yoursite",
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "tenantId": "your-tenant-id",
    "libraryName": "Documents",
    "folderPath": "/PlaywrightReports"
  }
}
```

## Environment Variables

- `GITHUB_TOKEN`: GitHub personal access token
- `USER`: Your username (auto-detected from git config)

## Examples

### Basic Workflow

```bash
# 1. Initialize
playwright-reports init --repo balajiregt/local-dashboard-platform

# 2. Run tests
npx playwright test --trace=on

# 3. Sync results
playwright-reports sync

# 4. View dashboard
open https://balajiregt.github.io/local-dashboard-platform
```

### Team Development

```bash
# Each developer initializes with their own config
playwright-reports init --repo balajiregt/local-dashboard-platform

# Run tests and sync
npx playwright test
playwright-reports sync

# Results are immediately available to the team
```

### CI/CD Integration

```bash
# In your CI pipeline
npx playwright test --trace=on
playwright-reports sync --auto-commit
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Ensure your GitHub token has `repo` scope
   - Check if token is expired

2. **Repository Not Found**
   - Verify repository name format: `owner/repo`
   - Ensure you have access to the repository

3. **Test Results Not Found**
   - Run `npx playwright test --trace=on` first
   - Check the upload path in configuration

4. **Storage Backend Not Working**
   - Use `playwright-reports storage --list` to see available options
   - Check backend-specific configuration

### Getting Help

```bash
# Show help
playwright-reports --help

# Show command-specific help
playwright-reports upload --help
playwright-reports sync --help
playwright-reports storage --help

# Check status
playwright-reports status
```

## Advanced Features

### Watch Mode

```bash
# Continuously monitor test results directory
playwright-reports sync --watch
```

### Custom Paths

```bash
# Upload from custom test results directory
playwright-reports upload --path ./custom-test-results

# Sync from specific location
playwright-reports sync --path ./custom-test-results
```

### Environment-Specific Uploads

```bash
# Upload with environment context
playwright-reports upload --environment "production"
playwright-reports upload --environment "staging"
playwright-reports upload --environment "development"
```

## Integration with Existing Projects

The CLI works with any Playwright project structure. It automatically detects:

- Test results directory (`test-results` by default)
- Git branch and commit information
- Developer name from git config
- Test execution metadata

No changes to your existing Playwright configuration are required!
