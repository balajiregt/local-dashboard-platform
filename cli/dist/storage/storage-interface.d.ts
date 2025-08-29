/**
 * Storage abstraction interface for Playwright Trace Intelligence Platform
 * Supports multiple backends: GitHub, SharePoint, Azure Files, Google Drive, etc.
 */
import { ProcessedTestReport } from '../types';
export interface StorageConfig {
    type: 'github' | 'sharepoint' | 'azure-files' | 'google-drive' | 'local-folder';
    [key: string]: any;
}
export interface GitHubStorageConfig extends StorageConfig {
    type: 'github';
    owner: string;
    repo: string;
    token: string;
    branch?: string;
}
export interface SharePointStorageConfig extends StorageConfig {
    type: 'sharepoint';
    siteUrl: string;
    clientId: string;
    clientSecret: string;
    tenantId: string;
    libraryName: string;
    folderPath?: string;
}
export interface AzureFilesStorageConfig extends StorageConfig {
    type: 'azure-files';
    storageAccount: string;
    shareKey: string;
    shareName: string;
    sasToken?: string;
    folderPath?: string;
}
export interface GoogleDriveStorageConfig extends StorageConfig {
    type: 'google-drive';
    serviceAccountKey: string;
    folderId: string;
    credentials?: any;
}
export interface LocalFolderStorageConfig extends StorageConfig {
    type: 'local-folder';
    basePath: string;
    syncCommand?: string;
}
export interface UploadResult {
    reportId: string;
    reportUrl: string;
    dashboardUrl: string;
    uploadedFiles: string[];
    success: boolean;
    error?: string;
    filesUploaded?: number;
}
export interface AssetInfo {
    originalPath: string;
    fileName: string;
    size: number;
    hash: string;
}
/**
 * Abstract storage interface that all backends must implement
 */
export declare abstract class StorageAdapter {
    protected config: StorageConfig;
    constructor(config: StorageConfig);
    /**
     * Test connection to the storage backend
     */
    abstract testConnection(): Promise<boolean>;
    /**
     * Initialize storage structure (create folders, set permissions, etc.)
     */
    abstract ensureStorageStructure(): Promise<void>;
    /**
     * Upload a complete test report with assets
     */
    abstract uploadReport(report: ProcessedTestReport, assetPaths: string[]): Promise<UploadResult>;
    /**
     * Upload individual assets (screenshots, traces, videos)
     */
    abstract uploadAssets(reportId: string, assetPaths: string[]): Promise<string[]>;
    /**
     * Update the main reports index
     */
    abstract updateReportsIndex(report: ProcessedTestReport): Promise<void>;
    /**
     * Get URL for viewing a specific report
     */
    abstract getReportUrl(reportId: string): string;
    /**
     * Get URL for the main dashboard
     */
    abstract getDashboardUrl(): string;
    /**
     * List all available reports
     */
    abstract listReports(): Promise<ProcessedTestReport[]>;
    /**
     * Download a specific report
     */
    abstract downloadReport(reportId: string): Promise<ProcessedTestReport | null>;
    /**
     * Delete a report and its assets
     */
    abstract deleteReport(reportId: string): Promise<boolean>;
    /**
     * Get direct download URL for an asset
     */
    abstract getAssetUrl(reportId: string, assetPath: string): Promise<string>;
    /**
     * Health check for the storage backend
     */
    healthCheck(): Promise<{
        healthy: boolean;
        latency?: number;
        error?: string;
    }>;
}
/**
 * Storage factory to create appropriate storage adapters
 */
export declare class StorageFactory {
    static create(config: StorageConfig): StorageAdapter;
    static getSupportedTypes(): string[];
}
//# sourceMappingURL=storage-interface.d.ts.map