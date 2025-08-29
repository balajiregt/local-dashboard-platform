import { TestExecutionIntent, ExecutionInsights, ExecutionMetadata, UploadOptions } from './types';
export declare class ReportManager {
    private static instance;
    private reportNumberFile;
    private reportsDir;
    private constructor();
    static getInstance(): ReportManager;
    generateUniqueReportId(): string;
    getNextReportNumber(): Promise<number>;
    captureExecutionIntent(options?: Partial<UploadOptions>): Promise<TestExecutionIntent>;
    captureExecutionMetadata(): Promise<ExecutionMetadata>;
    captureExecutionInsights(intent: TestExecutionIntent, results: any[], options?: {
        confidence?: number;
    }): Promise<ExecutionInsights>;
    private mapIntentToPurpose;
    private getGitCommit;
    private getGitDiff;
    private getCodeChanges;
    private summarizeResults;
}
//# sourceMappingURL=report-manager.d.ts.map