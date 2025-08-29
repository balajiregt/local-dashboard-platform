import { ProcessedTestReport, CLIConfig } from './types';
export interface GitHubConfig {
    owner: string;
    repo: string;
    token: string;
    branch?: string;
}
export interface UploadResult {
    reportId: string;
    reportUrl: string;
    dashboardUrl: string;
    uploadedFiles: string[];
}
export declare class GitHubUploader {
    private client;
    private config;
    private spinner;
    constructor(config: GitHubConfig);
    uploadReport(report: ProcessedTestReport, assetPaths?: string[]): Promise<UploadResult>;
    testConnection(): Promise<boolean>;
    ensureRepository(): Promise<void>;
    private ensureReportsStructure;
    private ensureDirectory;
    private uploadReportData;
    private uploadAssets;
    private prepareAssetForUpload;
    private updateReportsIndex;
    private createOrUpdateFile;
    private generateReportSummary;
    static fromConfig(config: CLIConfig): GitHubUploader;
}
//# sourceMappingURL=github-uploader.d.ts.map