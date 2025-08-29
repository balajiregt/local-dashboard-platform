"use strict";
/**
 * SharePoint storage adapter for Playwright Trace Intelligence Platform
 * Uses Microsoft Graph API to store reports in SharePoint Online
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharePointStorageAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const path_1 = require("path");
const crypto_1 = require("crypto");
const storage_interface_1 = require("./storage-interface");
class SharePointStorageAdapter extends storage_interface_1.StorageAdapter {
    constructor(config) {
        super(config);
        this.authToken = null;
        this.siteId = null;
        this.driveId = null;
        this.config = config;
        this.baseGraphUrl = 'https://graph.microsoft.com/v1.0';
        this.client = axios_1.default.create({
            baseURL: this.baseGraphUrl,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'playwright-reports-cli',
            },
        });
        // Add auth interceptor
        this.client.interceptors.request.use(async (config) => {
            await this.ensureAuthenticated();
            if (this.authToken) {
                config.headers.Authorization = `Bearer ${this.authToken.access_token}`;
            }
            return config;
        });
    }
    async testConnection() {
        try {
            await this.ensureAuthenticated();
            await this.ensureSiteAndDrive();
            return true;
        }
        catch (error) {
            console.error('SharePoint connection test failed:', error);
            return false;
        }
    }
    async ensureStorageStructure() {
        await this.ensureSiteAndDrive();
        await this.ensureReportsFolder();
    }
    async uploadReport(report, assetPaths) {
        try {
            await this.ensureStorageStructure();
            const reportId = report.execution.uniqueId;
            const reportFolderPath = `${this.getReportsBasePath()}/${reportId}`;
            // Create report folder
            await this.createFolder(reportFolderPath);
            // Upload main report JSON
            const reportJsonPath = `${reportFolderPath}/report.json`;
            await this.uploadFile(reportJsonPath, JSON.stringify(report, null, 2));
            // Upload assets
            const uploadedAssets = await this.uploadAssets(reportId, assetPaths);
            // Update reports index
            await this.updateReportsIndex(report);
            return {
                reportId,
                reportUrl: this.getReportUrl(reportId),
                dashboardUrl: this.getDashboardUrl(),
                uploadedFiles: [reportJsonPath, ...uploadedAssets],
                success: true,
                filesUploaded: 1 + uploadedAssets.length,
            };
        }
        catch (error) {
            return {
                reportId: report.execution.uniqueId,
                reportUrl: '',
                dashboardUrl: this.getDashboardUrl(),
                uploadedFiles: [],
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                filesUploaded: 0,
            };
        }
    }
    async uploadAssets(reportId, assetPaths) {
        const uploadedAssets = [];
        const assetsBasePath = `${this.getReportsBasePath()}/${reportId}/assets`;
        // Create assets folder
        await this.createFolder(assetsBasePath);
        for (const assetPath of assetPaths) {
            try {
                const fileName = (0, path_1.basename)(assetPath);
                const hash = this.calculateFileHash(assetPath);
                const hashedFileName = `${hash}${(0, path_1.extname)(fileName)}`;
                const sharePointPath = `${assetsBasePath}/${hashedFileName}`;
                const fileContent = (0, fs_1.readFileSync)(assetPath);
                await this.uploadFile(sharePointPath, fileContent);
                uploadedAssets.push(sharePointPath);
            }
            catch (error) {
                console.warn(`Failed to upload asset ${assetPath}:`, error);
            }
        }
        return uploadedAssets;
    }
    async updateReportsIndex(report) {
        const indexPath = `${this.getReportsBasePath()}/index.json`;
        try {
            // Try to get existing index
            let existingIndex = { reports: [] };
            try {
                const indexFile = await this.downloadFile(indexPath);
                if (indexFile) {
                    existingIndex = JSON.parse(indexFile);
                }
            }
            catch (error) {
                // Index doesn't exist yet, start with empty
            }
            // Add/update this report in the index
            const reportSummary = {
                id: report.execution.uniqueId,
                timestamp: report.execution.timestamp,
                developer: report.execution.developer,
                branch: report.execution.branch,
                environment: report.execution.environment,
                totalTests: report.summary.total,
                passed: report.summary.passed,
                failed: report.summary.failed,
                duration: report.execution.duration,
            };
            // Remove existing entry if it exists
            existingIndex.reports = existingIndex.reports.filter((r) => r.id !== report.execution.uniqueId);
            // Add new entry at the beginning
            existingIndex.reports.unshift(reportSummary);
            // Keep only last 100 reports
            existingIndex.reports = existingIndex.reports.slice(0, 100);
            // Upload updated index
            await this.uploadFile(indexPath, JSON.stringify(existingIndex, null, 2));
        }
        catch (error) {
            console.warn('Failed to update reports index:', error);
        }
    }
    getReportUrl(reportId) {
        if (!this.siteId)
            return '';
        return `${this.config.siteUrl}/_layouts/15/Doc.aspx?sourcedoc=%7B${reportId}%7D`;
    }
    getDashboardUrl() {
        // For SharePoint, this would be a custom app or Power BI dashboard
        return `${this.config.siteUrl}/SitePages/PlaywrightDashboard.aspx`;
    }
    async listReports() {
        try {
            const indexPath = `${this.getReportsBasePath()}/index.json`;
            const indexContent = await this.downloadFile(indexPath);
            if (!indexContent)
                return [];
            const index = JSON.parse(indexContent);
            const reports = [];
            for (const reportSummary of index.reports) {
                const report = await this.downloadReport(reportSummary.id);
                if (report) {
                    reports.push(report);
                }
            }
            return reports;
        }
        catch (error) {
            console.warn('Failed to list reports:', error);
            return [];
        }
    }
    async downloadReport(reportId) {
        try {
            const reportPath = `${this.getReportsBasePath()}/${reportId}/report.json`;
            const reportContent = await this.downloadFile(reportPath);
            if (!reportContent)
                return null;
            return JSON.parse(reportContent);
        }
        catch (error) {
            console.warn(`Failed to download report ${reportId}:`, error);
            return null;
        }
    }
    async deleteReport(reportId) {
        try {
            const reportFolderPath = `${this.getReportsBasePath()}/${reportId}`;
            await this.deleteFolder(reportFolderPath);
            // Update index to remove the report
            const indexPath = `${this.getReportsBasePath()}/index.json`;
            try {
                const indexContent = await this.downloadFile(indexPath);
                if (indexContent) {
                    const index = JSON.parse(indexContent);
                    index.reports = index.reports.filter((r) => r.id !== reportId);
                    await this.uploadFile(indexPath, JSON.stringify(index, null, 2));
                }
            }
            catch (error) {
                console.warn('Failed to update index after deletion:', error);
            }
            return true;
        }
        catch (error) {
            console.warn(`Failed to delete report ${reportId}:`, error);
            return false;
        }
    }
    async getAssetUrl(reportId, assetPath) {
        const sharePointPath = `${this.getReportsBasePath()}/${reportId}/assets/${assetPath}`;
        try {
            const file = await this.getFileInfo(sharePointPath);
            return file.downloadUrl;
        }
        catch (error) {
            console.warn(`Failed to get asset URL for ${assetPath}:`, error);
            return '';
        }
    }
    // Private helper methods
    async ensureAuthenticated() {
        if (this.authToken && Date.now() < this.authToken.expires_at) {
            return; // Token is still valid
        }
        try {
            const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;
            const params = new URLSearchParams();
            params.append('client_id', this.config.clientId);
            params.append('client_secret', this.config.clientSecret);
            params.append('scope', 'https://graph.microsoft.com/.default');
            params.append('grant_type', 'client_credentials');
            const response = await axios_1.default.post(tokenUrl, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            this.authToken = {
                ...response.data,
                expires_at: Date.now() + (response.data.expires_in * 1000) - 60000, // 1 minute buffer
            };
        }
        catch (error) {
            throw new Error(`SharePoint authentication failed: ${error}`);
        }
    }
    async ensureSiteAndDrive() {
        if (this.siteId && this.driveId)
            return;
        try {
            // Get site ID from URL
            const siteUrl = new URL(this.config.siteUrl);
            const hostname = siteUrl.hostname;
            const sitePath = siteUrl.pathname;
            const siteResponse = await this.client.get(`/sites/${hostname}:${sitePath}`);
            this.siteId = siteResponse.data.id;
            // Get document library drive ID
            const drivesResponse = await this.client.get(`/sites/${this.siteId}/drives`);
            const targetDrive = drivesResponse.data.value.find((drive) => drive.name === this.config.libraryName);
            if (!targetDrive) {
                throw new Error(`Document library '${this.config.libraryName}' not found`);
            }
            this.driveId = targetDrive.id;
        }
        catch (error) {
            throw new Error(`Failed to initialize SharePoint site: ${error}`);
        }
    }
    async ensureReportsFolder() {
        const reportsPath = this.getReportsBasePath();
        await this.createFolder(reportsPath);
    }
    getReportsBasePath() {
        const folderPath = this.config.folderPath || '';
        return folderPath ? `${folderPath}/reports` : 'reports';
    }
    async createFolder(path) {
        try {
            const pathParts = path.split('/').filter(p => p);
            let currentPath = '';
            for (const part of pathParts) {
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                try {
                    await this.client.get(`/drives/${this.driveId}/root:/${currentPath}`);
                }
                catch (error) {
                    // Folder doesn't exist, create it
                    await this.client.post(`/drives/${this.driveId}/root${currentPath ? ':/' + currentPath.split('/').slice(0, -1).join('/') : ''}/children`, {
                        name: part,
                        folder: {},
                        '@microsoft.graph.conflictBehavior': 'fail',
                    });
                }
            }
        }
        catch (error) {
            console.warn(`Failed to create folder ${path}:`, error);
        }
    }
    async uploadFile(path, content) {
        const contentBuffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
        if (contentBuffer.length < 4 * 1024 * 1024) { // Less than 4MB
            // Simple upload
            await this.client.put(`/drives/${this.driveId}/root:/${path}:/content`, contentBuffer, {
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
            });
        }
        else {
            // Large file upload session (for assets > 4MB)
            await this.uploadLargeFile(path, contentBuffer);
        }
    }
    async uploadLargeFile(path, content) {
        // Create upload session
        const sessionResponse = await this.client.post(`/drives/${this.driveId}/root:/${path}:/createUploadSession`, {});
        const uploadUrl = sessionResponse.data.uploadUrl;
        const chunkSize = 327680; // 320KB chunks
        for (let start = 0; start < content.length; start += chunkSize) {
            const end = Math.min(start + chunkSize, content.length);
            const chunk = content.slice(start, end);
            await axios_1.default.put(uploadUrl, chunk, {
                headers: {
                    'Content-Range': `bytes ${start}-${end - 1}/${content.length}`,
                    'Content-Length': chunk.length.toString(),
                },
            });
        }
    }
    async downloadFile(path) {
        try {
            const response = await this.client.get(`/drives/${this.driveId}/root:/${path}:/content`, { responseType: 'text' });
            return response.data;
        }
        catch (error) {
            return null;
        }
    }
    async deleteFolder(path) {
        await this.client.delete(`/drives/${this.driveId}/root:/${path}`);
    }
    async getFileInfo(path) {
        const response = await this.client.get(`/drives/${this.driveId}/root:/${path}`);
        return response.data;
    }
    calculateFileHash(filePath) {
        const content = (0, fs_1.readFileSync)(filePath);
        return (0, crypto_1.createHash)('sha256').update(content).digest('hex').substring(0, 16);
    }
}
exports.SharePointStorageAdapter = SharePointStorageAdapter;
//# sourceMappingURL=sharepoint-storage-adapter.js.map