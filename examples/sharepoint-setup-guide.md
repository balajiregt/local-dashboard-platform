# SharePoint Setup Guide for Playwright Trace Intelligence Platform

This guide walks you through setting up SharePoint Online as your storage backend for the Playwright Trace Intelligence Platform.

## Prerequisites

- Microsoft 365 subscription with SharePoint Online
- SharePoint site collection with admin permissions
- Azure AD admin access (for app registration)
- PowerShell or Azure CLI access

## Step-by-Step Setup

### 1. Create SharePoint Site and Document Library

```powershell
# Connect to SharePoint Online
Connect-SPOService -Url https://yourtenant-admin.sharepoint.com

# Create a new site collection (if needed)
New-SPOSite -Url "https://yourtenant.sharepoint.com/sites/playwright-reports" `
  -Title "Playwright Test Reports" `
  -Owner "admin@yourtenant.onmicrosoft.com" `
  -StorageQuota 25600 `
  -Template "STS#3"
```

Or create manually:
1. Go to SharePoint Admin Center
2. Create new site collection: "Playwright Test Reports"
3. Note the site URL (e.g., `https://yourtenant.sharepoint.com/sites/playwright-reports`)

### 2. Register Azure AD Application

#### Option A: Azure Portal (Recommended)

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. Click "New registration"
3. Fill in details:
   - **Name**: `Playwright Reports CLI`
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: Leave blank
4. Click "Register"

5. **Configure API Permissions**:
   - Go to "API permissions"
   - Click "Add a permission"
   - Select "Microsoft Graph"
   - Choose "Application permissions"
   - Add these permissions:
     - `Sites.ReadWrite.All`
     - `Files.ReadWrite.All`
   - Click "Grant admin consent for [Your Organization]"

6. **Create Client Secret**:
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Description: "Playwright CLI Access"
   - Expires: 12 months (or as per policy)
   - Copy the secret value immediately

7. **Note down these values**:
   - Application (client) ID
   - Directory (tenant) ID
   - Client secret value

#### Option B: PowerShell/CLI

```powershell
# Install required modules
Install-Module AzureAD -Force
Connect-AzureAD

# Create the application
$app = New-AzureADApplication -DisplayName "Playwright Reports CLI" `
  -IdentifierUris "https://playwright-reports-cli"

# Create service principal
$sp = New-AzureADServicePrincipal -AppId $app.AppId

# Create client secret
$secret = New-AzureADApplicationPasswordCredential -ObjectId $app.ObjectId `
  -CustomKeyIdentifier "PlaywrightCLI" -EndDate (Get-Date).AddMonths(12)

Write-Host "Application ID: $($app.AppId)"
Write-Host "Tenant ID: $((Get-AzureADTenantDetail).ObjectId)"
Write-Host "Client Secret: $($secret.Value)"
```

### 3. Configure SharePoint Permissions

Grant the registered app permissions to your SharePoint site:

```powershell
# Connect to your SharePoint site
Connect-PnPOnline -Url "https://yourtenant.sharepoint.com/sites/playwright-reports" -Interactive

# Grant app permissions
Grant-PnPSiteCollectionAppCatalogAccess -PermissionXml @"
<AppPermissionRequests AllowAppOnlyPolicy="true">
  <AppPermissionRequest Scope="http://sharepoint/content/sitecollection/web" Right="FullControl" />
</AppPermissionRequests>
"@ -AppId "YOUR_APP_ID_HERE"
```

### 4. Configure Playwright Reports CLI

Create a configuration file for your SharePoint setup:

```json
{
  "storage": {
    "type": "sharepoint",
    "siteUrl": "https://yourtenant.sharepoint.com/sites/playwright-reports",
    "clientId": "your-application-id",
    "clientSecret": "your-client-secret",
    "tenantId": "your-tenant-id",
    "libraryName": "Documents",
    "folderPath": "/PlaywrightReports"
  },
  "localConfig": {
    "uploadPath": "./test-results",
    "developer": "Default Developer"
  }
}
```

Initialize the CLI with SharePoint:

```bash
# Initialize with config file
playwright-reports init --config ./sharepoint-config.json

# Or initialize interactively
playwright-reports init --storage sharepoint
# Follow the prompts to enter:
# - Site URL
# - Client ID
# - Client Secret
# - Tenant ID
# - Document Library name
# - Folder path (optional)
```

### 5. Test the Setup

```bash
# Test connection
playwright-reports status

# Test upload (dry run first)
playwright-reports upload --dry-run --intent "testing-sharepoint-setup"

# Actual upload
playwright-reports upload --intent "testing-sharepoint-setup"
```

### 6. Create SharePoint Dashboard (Optional)

#### Option A: SharePoint List/Library Views

1. Go to your SharePoint site
2. Navigate to the PlaywrightReports folder
3. Create custom views to display report summaries
4. Add calculated columns for pass rates, etc.

#### Option B: Power BI Integration

Create a Power BI report that connects to your SharePoint data:

```json
{
  "dataSource": {
    "type": "SharePoint",
    "siteUrl": "https://yourtenant.sharepoint.com/sites/playwright-reports",
    "listName": "Documents",
    "folderPath": "/PlaywrightReports"
  },
  "queries": [
    {
      "name": "ReportIndex",
      "source": "/PlaywrightReports/reports/index.json"
    }
  ]
}
```

## Environment Variables Configuration

For CI/CD pipelines, use environment variables:

```bash
# .env file or CI/CD variables
PLAYWRIGHT_STORAGE_TYPE=sharepoint
PLAYWRIGHT_SHAREPOINT_SITE_URL=https://yourtenant.sharepoint.com/sites/playwright-reports
PLAYWRIGHT_SHAREPOINT_CLIENT_ID=your-client-id
PLAYWRIGHT_SHAREPOINT_CLIENT_SECRET=your-client-secret
PLAYWRIGHT_SHAREPOINT_TENANT_ID=your-tenant-id
PLAYWRIGHT_SHAREPOINT_LIBRARY_NAME=Documents
PLAYWRIGHT_SHAREPOINT_FOLDER_PATH=/PlaywrightReports
```

## Troubleshooting

### Common Issues

#### 1. Authentication Failures

**Error**: `SharePoint authentication failed`

**Solutions**:
- Verify client ID, secret, and tenant ID are correct
- Check if admin consent was granted for API permissions
- Ensure client secret hasn't expired

#### 2. Permission Denied

**Error**: `Access denied to SharePoint site`

**Solutions**:
- Verify app has been granted permissions to the site collection
- Check if the service principal has proper SharePoint permissions
- Ensure the document library exists and is accessible

#### 3. Site Not Found

**Error**: `SharePoint site not found`

**Solutions**:
- Verify the site URL is correct and accessible
- Check if the site collection exists
- Ensure you have access to the site

### Testing Connection

```bash
# Enable verbose logging
DEBUG=playwright-reports:* playwright-reports status

# Test specific components
playwright-reports test-auth
playwright-reports test-upload --dry-run
```

## Security Best Practices

### 1. App Registration Security
- Use certificate-based authentication instead of client secrets for production
- Rotate client secrets regularly (every 6-12 months)
- Use Azure Key Vault to store secrets securely

### 2. SharePoint Permissions
- Grant minimum required permissions (Sites.ReadWrite.All)
- Use site-specific permissions rather than tenant-wide when possible
- Regular audit of app permissions and access

### 3. Data Governance
- Implement retention policies for test reports
- Set up alerts for large file uploads
- Monitor storage usage and quota

## Advanced Configuration

### Custom Document Library

If you want to use a custom document library instead of the default "Documents":

```powershell
# Create custom library
Connect-PnPOnline -Url "https://yourtenant.sharepoint.com/sites/playwright-reports"
New-PnPList -Title "PlaywrightReports" -Template DocumentLibrary

# Update configuration
{
  "libraryName": "PlaywrightReports"
}
```

### Content Types and Metadata

Add custom content types for better organization:

```powershell
# Add content type for test reports
Add-PnPContentType -Name "PlaywrightReport" -Group "Custom" -ParentContentTypeId "0x0101"

# Add custom columns
Add-PnPField -List "PlaywrightReports" -DisplayName "TestEnvironment" -InternalName "TestEnvironment" -Type Text
Add-PnPField -List "PlaywrightReports" -DisplayName "PassRate" -InternalName "PassRate" -Type Number
```

### Automation with Power Automate

Create automated workflows:

1. **Email notifications** when new reports are uploaded
2. **Teams notifications** for failed test runs
3. **Data processing** flows to generate summaries

## Support and Resources

- [SharePoint REST API Documentation](https://docs.microsoft.com/en-us/sharepoint/dev/apis/rest/)
- [Microsoft Graph API for SharePoint](https://docs.microsoft.com/en-us/graph/api/resources/sharepoint)
- [PnP PowerShell Documentation](https://pnp.github.io/powershell/)
- [Azure AD App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app) 