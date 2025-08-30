import { ProcessedTestReport } from '../types';
import {
    StorageAdapter,
    GoogleDriveStorageConfig,
    UploadResult,
    AssetInfo
} from './storage-interface';

export class GoogleDriveStorageAdapter extends StorageAdapter {
    protected config: GoogleDriveStorageConfig;

    constructor(config: GoogleDriveStorageConfig) {
        super(config);
        this.config = config;
    }

    async testConnection(): Promise<boolean> {
        console.log('Google Drive storage adapter not yet implemented');
        return false;
    }

    async ensureStorageStructure(): Promise<void> {
        throw new Error('Google Drive storage adapter not yet implemented');
    }

    async uploadReport(
        report: ProcessedTestReport,
        assetPaths: string[]
    ): Promise<UploadResult> {
        throw new Error('Google Drive storage adapter not yet implemented');
    }

    async uploadAssets(
        reportId: string,
        assetPaths: string[]
    ): Promise<string[]> {
        throw new Error('Google Drive storage adapter not yet implemented');
    }

    async updateReportsIndex(report: ProcessedTestReport): Promise<void> {
        throw new Error('Google Drive storage adapter not yet implemented');
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
