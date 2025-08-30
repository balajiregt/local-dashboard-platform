import { ProcessedTestReport } from '../types';
import {
    StorageAdapter,
    LocalFolderStorageConfig,
    UploadResult,
    AssetInfo
} from './storage-interface';

export class LocalFolderStorageAdapter extends StorageAdapter {
    protected config: LocalFolderStorageConfig;

    constructor(config: LocalFolderStorageConfig) {
        super(config);
        this.config = config;
    }

    async testConnection(): Promise<boolean> {
        console.log('Local Folder storage adapter not yet implemented');
        return false;
    }

    async ensureStorageStructure(): Promise<void> {
        throw new Error('Local Folder storage adapter not yet implemented');
    }

    async uploadReport(
        report: ProcessedTestReport,
        assetPaths: string[]
    ): Promise<UploadResult> {
        throw new Error('Local Folder storage adapter not yet implemented');
    }

    async uploadAssets(
        reportId: string,
        assetPaths: string[]
    ): Promise<string[]> {
        throw new Error('Local Folder storage adapter not yet implemented');
    }

    async updateReportsIndex(report: ProcessedTestReport): Promise<void> {
        throw new Error('Local Folder storage adapter not yet implemented');
    }

    async getReportUrl(reportId: string): string {
        return '';
    }

    async getDashboardUrl(): string {
        return '';
    }

    async listReports(): Promise<ProcessedTestReport[]> {
        return [];
    }

    async downloadReport(reportId: string): Promise<ProcessedTestReport | null> {
        return null;
    }

    async deleteReport(reportId: string): Promise<boolean> {
        return false;
    }

    async getAssetUrl(reportId: string, assetPath: string): Promise<string> {
        return '';
    }
}
