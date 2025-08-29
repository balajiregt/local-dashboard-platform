# Storage Backend Options for Playwright Trace Intelligence Platform

This document outlines various **non-hosted storage options** for the Playwright Trace Intelligence Platform, allowing teams to store test reports without relying on external hosting services.

## Overview

The platform supports multiple storage backends through a pluggable architecture. All options maintain the core principle of **zero infrastructure** - no servers, databases, or hosted services to maintain.

## Supported Storage Backends

### 1. GitHub Repository Storage (Current Default)

**Best for**: Teams already using GitHub, open-source projects, small to medium teams

**Pros:**
- ✅ Zero infrastructure cost (uses existing GitHub subscription)
- ✅ Enterprise-grade security and permissions
- ✅ Built-in version control and audit trail
- ✅ GitHub Pages for dashboard hosting
- ✅ Easy collaboration and sharing
- ✅ Automatic backups and redundancy

**Cons:**
- ❌ Requires GitHub account/organization
- ❌ File size limits (100MB per file, 1GB per repo recommended)
- ❌ API rate limits for high-volume usage

**Configuration:**
```typescript
{
  type: 'github',
  owner: 'your-org',
  repo: 'playwright-reports',
  token: 'ghp_xxxxxxxxxxxx',
  branch: 'main'
}
```

**Setup:**
```bash
# Initialize GitHub storage
playwright-reports init --storage github --repo your-org/playwright-reports

# Upload with GitHub storage
playwright-reports upload --intent "development"
```

---

### 2. Microsoft SharePoint Online

**Best for**: Enterprise teams using Microsoft 365, large organizations with SharePoint infrastructure

**Pros:**
- ✅ Enterprise compliance and governance
- ✅ Integration with Microsoft 365 ecosystem
- ✅ Advanced permissions and access control
- ✅ Large file storage capacity
- ✅ Power BI integration for advanced analytics
- ✅ Existing corporate authentication (Azure AD)

**Cons:**
- ❌ Requires Microsoft 365 subscription
- ❌ More complex authentication setup
- ❌ Requires SharePoint administration knowledge

**Configuration:**
```typescript
{
  type: 'sharepoint',
  siteUrl: 'https://yourorg.sharepoint.com/sites/playwright-reports',
  clientId: 'your-app-client-id',
  clientSecret: 'your-app-secret',
  tenantId: 'your-tenant-id',
  libraryName: 'Documents',
  folderPath: '/PlaywrightReports'
}
```

**Setup:**
```bash
# Initialize SharePoint storage
playwright-reports init --storage sharepoint \
  --site-url "https://yourorg.sharepoint.com/sites/playwright-reports" \
  --client-id "your-app-id"

# Upload with SharePoint
playwright-reports upload --storage sharepoint
```

**Prerequisites:**
1. Register Azure AD application with SharePoint permissions
2. Create SharePoint site and document library
3. Configure app permissions for Sites.ReadWrite.All

---

### 3. Azure Files Storage

**Best for**: Teams using Azure infrastructure, need high storage capacity, hybrid cloud scenarios

**Pros:**
- ✅ Massive storage capacity (up to 100TB per share)
- ✅ SMB/NFS protocol support
- ✅ Can be mounted as network drive
- ✅ Azure AD integration
- ✅ Excellent performance for large files
- ✅ Built-in encryption and backup

**Cons:**
- ❌ Requires Azure subscription
- ❌ More complex networking setup
- ❌ Costs scale with storage usage

**Configuration:**
```typescript
{
  type: 'azure-files',
  storageAccount: 'playwrightreports',
  shareKey: 'your-storage-account-key',
  shareName: 'reports',
  sasToken: 'optional-sas-token',
  folderPath: '/team-reports'
}
```

**Setup:**
```bash
# Initialize Azure Files storage
playwright-reports init --storage azure-files \
  --storage-account "playwrightreports" \
  --share-name "reports"

# Upload with Azure Files
playwright-reports upload --storage azure-files
```

---

### 4. Google Drive for Business

**Best for**: Teams using Google Workspace, need easy sharing and collaboration

**Pros:**
- ✅ Familiar Google interface
- ✅ Excellent sharing and collaboration features
- ✅ Google Workspace integration
- ✅ Automatic sync across devices
- ✅ Version history and recovery
- ✅ Good mobile access

**Cons:**
- ❌ Requires Google Workspace subscription
- ❌ API quotas and rate limits
- ❌ Less suitable for very large files

**Configuration:**
```typescript
{
  type: 'google-drive',
  serviceAccountKey: '/path/to/service-account.json',
  folderId: 'your-google-drive-folder-id',
  credentials: {
    // Service account credentials
  }
}
```

**Setup:**
```bash
# Initialize Google Drive storage
playwright-reports init --storage google-drive \
  --service-account "/path/to/credentials.json" \
  --folder-id "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
```

---

### 5. Local Network Folder

**Best for**: On-premise teams, air-gapped environments, simple file server setups

**Pros:**
- ✅ Complete control over data
- ✅ No external dependencies
- ✅ Fast local network access
- ✅ Can use existing file servers
- ✅ Simple backup strategies
- ✅ No API limits or costs

**Cons:**
- ❌ Requires network infrastructure
- ❌ Manual backup and redundancy
- ❌ Limited remote access
- ❌ No built-in collaboration features

**Configuration:**
```typescript
{
  type: 'local-folder',
  basePath: '/shared/playwright-reports',
  syncCommand: 'rsync -av {source} backup-server:/backups/', // Optional
}
```

**Setup:**
```bash
# Initialize local folder storage
playwright-reports init --storage local-folder \
  --base-path "/shared/playwright-reports"

# Upload with local storage
playwright-reports upload --storage local-folder
```

## Comparison Matrix

| Feature | GitHub | SharePoint | Azure Files | Google Drive | Local Folder |
|---------|--------|------------|-------------|--------------|--------------|
| **Setup Complexity** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| **Storage Capacity** | 1GB+ | 25TB+ | 100TB+ | 15GB+ | Unlimited* |
| **File Size Limit** | 100MB | 250GB | 1TB | 5TB | Unlimited* |
| **Collaboration** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ |
| **Security** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐** |
| **Cost** | Free/Low | Subscription | Pay-per-use | Subscription | Hardware only |
| **Performance** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

*Limited by hardware  
**Depends on implementation

## Migration Between Backends

The platform supports migrating between storage backends:

```bash
# Export from current backend
playwright-reports export --output ./backup

# Change storage configuration
playwright-reports init --storage sharepoint

# Import to new backend
playwright-reports import --input ./backup
```

## Frontend Dashboard Options

Each storage backend supports different dashboard deployment options:

### GitHub Pages Dashboard
- Automatic deployment via GitHub Actions
- Free hosting for public repos
- Custom domain support
- Built-in SSL/TLS

### SharePoint App/Power BI Dashboard
- Custom SharePoint application pages
- Power BI embedded reports
- Integration with Microsoft ecosystem
- Enterprise SSO integration

### Static Site Dashboard
- Deploy to any static hosting (Netlify, Vercel, etc.)
- Works with any storage backend
- Custom CI/CD integration
- CDN distribution

## Configuration Management

Use environment variables or config files to manage multiple storage backends:

```bash
# .env file
PLAYWRIGHT_STORAGE_TYPE=sharepoint
PLAYWRIGHT_SHAREPOINT_SITE_URL=https://yourorg.sharepoint.com/sites/reports
PLAYWRIGHT_SHAREPOINT_CLIENT_ID=your-client-id
PLAYWRIGHT_SHAREPOINT_CLIENT_SECRET=your-secret
PLAYWRIGHT_SHAREPOINT_TENANT_ID=your-tenant-id

# Or use config file
playwright-reports init --config ./config/sharepoint.json
```

## Best Practices

### Security
1. **Use service accounts** instead of personal accounts
2. **Implement least-privilege access** for storage permissions
3. **Rotate credentials** regularly
4. **Enable audit logging** where available
5. **Use secure credential storage** (Azure Key Vault, etc.)

### Performance
1. **Choose storage close to your team** geographically
2. **Implement caching** for frequently accessed reports
3. **Use compression** for large trace files
4. **Batch uploads** when possible
5. **Monitor storage quotas** and usage

### Maintenance
1. **Implement automated cleanup** for old reports
2. **Set up monitoring** for storage health
3. **Create backup strategies** appropriate for your backend
4. **Document access procedures** for your team
5. **Test disaster recovery** procedures

## Getting Started

1. **Choose your storage backend** based on your team's infrastructure
2. **Follow the setup guide** for your chosen backend
3. **Configure authentication** and permissions
4. **Test with a small upload** before full deployment
5. **Train your team** on the upload process
6. **Set up monitoring** and maintenance procedures

For detailed setup instructions for each backend, see the specific guides in the `/docs/backends/` folder. 