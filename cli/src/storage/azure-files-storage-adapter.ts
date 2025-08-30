import { ProcessedTestReport } from '../types';
import {
    StorageAdapter,
    AzureFilesStorageConfig,
    UploadResult,
    AssetInfo
} from './storage-interface';

export class AzureFilesStorageAdapter extends StorageAdapter {
    protected config: AzureFilesStorageConfig;

    constructor(config: AzureFilesStorageConfig) {
        super(config);
        this.config = config;
    }

    async testConnection(): Promise<boolean> {
        console.log('Azure Files storage adapter not yet implemented');
        return false;
    }

    async ensureStorageStructure(): Promise<void> {
        throw new Error('Azure Files storage adapter not yet implemented');
    }

    async uploadReport(
        report: ProcessedTestReport,
        assetPaths: string[]
    ): Promise<UploadResult> {
        throw new Error('Azure Files storage adapter not yet implemented');
    }

    async uploadAssets(
        reportId: string,
        assetPaths: string[]
    ): Promise<string[]> {
        throw new Error('Azure Files storage adapter not yet implemented');
    }

    async updateReportsIndex(report: ProcessedTestReport): Promise<void> {
        throw new Error('Azure Files storage adapter not yet implemented');
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
