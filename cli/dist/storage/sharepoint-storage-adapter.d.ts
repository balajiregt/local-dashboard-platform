/**
 * SharePoint storage adapter for Playwright Trace Intelligence Platform
 * Uses Microsoft Graph API to store reports in SharePoint Online
 */
import { ProcessedTestReport } from '../types';
import { StorageAdapter, SharePointStorageConfig, UploadResult } from './storage-interface';
export declare class SharePointStorageAdapter extends StorageAdapter {
    private client;
    protected config: SharePointStorageConfig;
    private authToken;
    private baseGraphUrl;
    private siteId;
    private driveId;
    constructor(config: SharePointStorageConfig);
    testConnection(): Promise<boolean>;
    ensureStorageStructure(): Promise<void>;
    uploadReport(report: ProcessedTestReport, assetPaths: string[]): Promise<UploadResult>;
    uploadAssets(reportId: string, assetPaths: string[]): Promise<string[]>;
    updateReportsIndex(report: ProcessedTestReport): Promise<void>;
    getReportUrl(reportId: string): string;
    getDashboardUrl(): string;
    listReports(): Promise<ProcessedTestReport[]>;
    downloadReport(reportId: string): Promise<ProcessedTestReport | null>;
    deleteReport(reportId: string): Promise<boolean>;
    getAssetUrl(reportId: string, assetPath: string): Promise<string>;
    private ensureAuthenticated;
    private ensureSiteAndDrive;
    private ensureReportsFolder;
    private getReportsBasePath;
    private createFolder;
    private uploadFile;
    private uploadLargeFile;
    private downloadFile;
    private deleteFolder;
    private getFileInfo;
    private calculateFileHash;
}
//# sourceMappingURL=sharepoint-storage-adapter.d.ts.map