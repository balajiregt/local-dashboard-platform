import { ProcessedTestReport, UploadOptions } from './types';
export declare class TraceProcessor {
    private testResultsPath;
    private options;
    private reportManager;
    constructor(testResultsPath: string, options?: UploadOptions);
    processTestResults(): Promise<ProcessedTestReport>;
    private mapStatusToOutcome;
    private determineExpectedOutcome;
    private calculateEnhancedSummary;
    private collectTestRun;
    private processTestFiles;
    private findTestDirectories;
    private processTestDirectory;
    private parseTestDirectoryName;
    private determineTestStatus;
    private findTraceFile;
    private collectScreenshots;
    private collectVideos;
    private collectErrors;
    private collectTestSteps;
    private extractErrorsFromTrace;
    private extractStepsFromTrace;
    private inferActionFromFilename;
    private extractExecutionMetadata;
    private detectCIProvider;
    generateReportId(): string;
}
//# sourceMappingURL=trace-processor.d.ts.map