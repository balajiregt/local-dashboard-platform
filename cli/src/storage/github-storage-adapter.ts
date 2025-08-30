import axios, { AxiosInstance } from 'axios';
import { readFileSync, createReadStream, statSync } from 'fs';
import { basename, join, dirname } from 'path';
import { createHash } from 'crypto';
import { ProcessedTestReport } from '../types';
import {
    StorageAdapter,
    GitHubStorageConfig,
    UploadResult,
    AssetInfo
} from './storage-interface';

export class GitHubStorageAdapter extends StorageAdapter {
    private client: AxiosInstance;
    protected config: GitHubStorageConfig;

    constructor(config: GitHubStorageConfig) {
        super(config);
        this.config = config;

        this.client = axios.create({
            baseURL: 'https://api.github.com',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${this.config.token}`,
                'User-Agent': 'playwright-reports-cli',
            },
        });
    }

    async testConnection(): Promise<boolean> {
        try {
            const response = await this.client.get(`/repos/${this.config.owner}/${this.config.repo}`);
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    async ensureStorageStructure(): Promise<void> {
        try {
            // Check if reports directory exists
            await this.client.get(
                `/repos/${this.config.owner}/${this.config.repo}/contents/reports`
            );
        } catch (error: any) {
            if (error.response?.status === 404) {
                // Create reports directory
                await this.createOrUpdateFile(
                    'reports/.gitkeep',
                    '',
                    'Create reports directory',
                    false
                );
            }
        }
    }

    async uploadReport(
        report: ProcessedTestReport,
        assetPaths: string[]
    ): Promise<UploadResult> {
        try {
            await this.ensureStorageStructure();

            const reportId = report.execution.uniqueId;
            const reportPath = `reports/${reportId}`;

            // Upload main report data
            await this.uploadReportData(reportPath, report);

            // Upload assets (screenshots, traces, videos)
            const uploadedAssets = await this.uploadAssets(reportPath, assetPaths);

            // Update reports index
            await this.updateReportsIndex(report);

            // Generate result URLs
            const result: UploadResult = {
                reportId,
                reportUrl: `https://github.com/${this.config.owner}/${this.config.repo}/tree/${this.config.branch || 'main'}/reports/${reportId}`,
                dashboardUrl: `https://${this.config.owner}.github.io/${this.config.repo}`,
                uploadedFiles: [
                    `${reportPath}/report.json`,
                    ...uploadedAssets,
                ],
                success: true,
                filesUploaded: uploadedAssets.length + 1,
            };

            return result;

        } catch (error) {
            return {
                reportId: report.execution.uniqueId,
                reportUrl: '',
                dashboardUrl: '',
                uploadedFiles: [],
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                filesUploaded: 0,
            };
        }
    }

    async uploadAssets(
        reportId: string,
        assetPaths: string[]
    ): Promise<string[]> {
        const uploadedFiles: string[] = [];

        for (const assetPath of assetPaths) {
            try {
                if (statSync(assetPath).isFile()) {
                    const fileName = basename(assetPath);
                    const filePath = `reports/${reportId}/${fileName}`;

                    await this.uploadFile(filePath, assetPath);
                    uploadedFiles.push(filePath);
                }
            } catch (error) {
                console.warn(`Failed to upload asset ${assetPath}:`, error);
            }
        }

        return uploadedFiles;
    }

    async updateReportsIndex(report: ProcessedTestReport): Promise<void> {
        try {
            // Get current index
            let index = { reports: [], lastUpdated: new Date().toISOString() };

            try {
                const response = await this.client.get(
                    `/repos/${this.config.owner}/${this.config.repo}/contents/reports/index.json`
                );

                const currentContent = Buffer.from(response.data.content, 'base64').toString('utf8');
                index = JSON.parse(currentContent);
            } catch (error: any) {
                if (error.response?.status !== 404) {
                    throw error;
                }
                // Index doesn't exist, create new one
            }

            // Add new report to index
            const reportSummary = {
                id: report.execution.uniqueId,
                timestamp: report.execution.timestamp.toISOString(),
                developer: report.execution.developer,
                branch: report.execution.branch,
                summary: report.summary,
                url: `reports/${report.execution.uniqueId}/report.json`,
            };

            index.reports.unshift(reportSummary); // Add to beginning
            index.lastUpdated = new Date().toISOString();

            // Keep only the last 100 reports in the index
            if (index.reports.length > 100) {
                index.reports = index.reports.slice(0, 100);
            }

            // Update the index file
            await this.createOrUpdateFile(
                'reports/index.json',
                JSON.stringify(index, null, 2),
                `Update reports index with report ${report.execution.reportNumber}`
            );

        } catch (error) {
            console.warn('Failed to update reports index:', error);
        }
    }

    async getReportUrl(reportId: string): string {
        return `https://github.com/${this.config.owner}/${this.config.repo}/tree/${this.config.branch || 'main'}/reports/${reportId}`;
    }

    async getDashboardUrl(): string {
        return `https://${this.config.owner}.github.io/${this.config.repo}`;
    }

    async listReports(): Promise<ProcessedTestReport[]> {
        try {
            const response = await this.client.get(
                `/repos/${this.config.owner}/${this.config.repo}/contents/reports/index.json`
            );

            const content = Buffer.from(response.data.content, 'base64').toString('utf8');
            const index = JSON.parse(content);

            // Convert index entries to ProcessedTestReport format
            return index.reports.map((entry: any) => ({
                execution: {
                    uniqueId: entry.id,
                    reportNumber: 0,
                    timestamp: new Date(entry.timestamp),
                    developer: entry.developer,
                    branch: entry.branch,
                    environment: 'local',
                    duration: 0,
                },
                summary: entry.summary,
                results: [],
            }));
        } catch (error) {
            return [];
        }
    }

    async downloadReport(reportId: string): Promise<ProcessedTestReport | null> {
        try {
            const response = await this.client.get(
                `/repos/${this.config.owner}/${this.config.repo}/contents/reports/${reportId}/report.json`
            );

            const content = Buffer.from(response.data.content, 'base64').toString('utf8');
            return JSON.parse(content);
        } catch (error) {
            return null;
        }
    }

    async deleteReport(reportId: string): Promise<boolean> {
        try {
            // Delete report directory
            await this.client.delete(
                `/repos/${this.config.owner}/${this.config.repo}/contents/reports/${reportId}`,
                {
                    data: {
                        message: `Delete report ${reportId}`,
                        sha: await this.getDirectorySha(`reports/${reportId}`),
                    },
                }
            );
            return true;
        } catch (error) {
            return false;
        }
    }

    async getAssetUrl(reportId: string, assetPath: string): Promise<string> {
        return `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/${this.config.branch || 'main'}/reports/${reportId}/${assetPath}`;
    }

    private async uploadReportData(reportPath: string, report: ProcessedTestReport): Promise<void> {
        const reportData = JSON.stringify(report, null, 2);
        await this.createOrUpdateFile(
            `${reportPath}/report.json`,
            reportData,
            `Add test report ${report.execution.reportNumber}`
        );
    }

    private async uploadFile(filePath: string, localPath: string): Promise<void> {
        const content = readFileSync(localPath, 'base64');
        await this.createOrUpdateFile(
            filePath,
            content,
            `Add asset ${basename(localPath)}`,
            true
        );
    }

    private async createOrUpdateFile(
        path: string,
        content: string,
        message: string,
        isBinary: boolean = false,
        sha?: string
    ): Promise<void> {
        const payload: any = {
            message,
            content: isBinary ? content : Buffer.from(content).toString('base64'),
            branch: this.config.branch || 'main',
        };

        if (sha) {
            payload.sha = sha;
        }

        await this.client.put(
            `/repos/${this.config.owner}/${this.config.repo}/contents/${path}`,
            payload
        );
    }

    private async getDirectorySha(path: string): Promise<string> {
        try {
            const response = await this.client.get(
                `/repos/${this.config.owner}/${this.config.repo}/contents/${path}`
            );
            return response.data.sha;
        } catch (error) {
            return '';
        }
    }
}
