export interface PlaywrightTestResult {
    id: string;
    testRunId: string;
    testTitle: string;
    testFile: string;
    browser: string;
    device?: string;
    status: 'passed' | 'failed' | 'skipped' | 'timedOut' | 'interrupted';
    duration: number;
    retries: number;
    traceFile?: string;
    screenshots: Screenshot[];
    videos: Video[];
    errors: PlaywrightError[];
    steps: TestStep[];
}
export interface PlaywrightTestRun {
    id: string;
    projectId: string;
    commitHash?: string;
    branch?: string;
    environment?: string;
    developer?: string;
    startedAt: Date;
    completedAt: Date;
    duration: number;
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    browsers: BrowserExecution[];
    traces: TraceFile[];
    metadata: PlaywrightExecutionMetadata;
}
export interface ProcessedTestReport {
    execution: {
        id: string;
        reportNumber: number;
        uniqueId: string;
        developer: string;
        timestamp: Date;
        startTime: Date;
        endTime: Date;
        branch?: string;
        environment: string;
        duration: number;
        intent: TestExecutionIntent;
        insights: ExecutionInsights;
        metadata: ExecutionMetadata;
    };
    results: {
        testName: string;
        status: 'passed' | 'failed' | 'skipped';
        duration: number;
        error?: string;
        screenshots: string[];
        traceFile?: string;
        intent?: TestIntent;
        expectedOutcome?: 'pass' | 'fail';
        actualOutcome: 'pass' | 'fail' | 'skip';
        outcomeMatch: boolean;
    }[];
    summary: {
        total: number;
        passed: number;
        failed: number;
        skipped: number;
        expectedFails: number;
        unexpectedFails: number;
        expectedPasses: number;
        unexpectedPasses: number;
    };
}
export interface TestExecutionIntent {
    purpose: 'development' | 'debugging' | 'regression' | 'validation' | 'exploration' | 'ci-cd' | 'manual';
    description?: string;
    expectFailures: boolean;
    targetTests?: string[];
    goals: string[];
    context?: string;
}
export interface ExecutionInsights {
    reasoning: string;
    expectedBehavior: string;
    actualBehavior: string;
    surprises: string[];
    learnings: string[];
    nextSteps: string[];
    confidence: number;
}
export interface ExecutionMetadata {
    gitCommit?: string;
    gitDiff?: string;
    codeChanges?: string[];
    relatedTickets?: string[];
    testRunReason: string;
    tags: string[];
}
export interface TestIntent {
    purpose: 'verify-fix' | 'check-regression' | 'explore-behavior' | 'reproduce-bug' | 'validate-feature';
    expectedOutcome: 'pass' | 'fail';
    reasoning: string;
}
export interface CLIConfig {
    name: string;
    repository: string;
    github: {
        token?: string;
        pages: {
            url: string;
            source: string;
        };
    };
    localConfig: {
        developer: string;
        uploadPath: string;
        includeSuccessful: boolean;
        includeFailures: boolean;
        autoUpload: boolean;
    };
    playwright: {
        testDir: string;
        traceDir: string;
        tracePaths: string[];
        browsers: string[];
        devices: string[];
        collectTraces: string;
        collectScreenshots: string;
        collectVideos: string;
    };
}
export interface Screenshot {
    id: string;
    timestamp: number;
    base64Data?: string;
    filePath: string;
    width: number;
    height: number;
    actionBefore?: string;
}
export interface Video {
    id: string;
    filePath: string;
    duration: number;
    size: number;
}
export interface PlaywrightError {
    message: string;
    stack: string;
    location: {
        file: string;
        line: number;
        column: number;
    };
    screenshot?: string;
    domSnapshot?: string;
}
export interface TestStep {
    id: string;
    title: string;
    duration: number;
    error?: PlaywrightError;
    steps?: TestStep[];
}
export interface BrowserExecution {
    name: string;
    version: string;
    channel?: string;
}
export interface TraceFile {
    id: string;
    testResultId: string;
    filePath: string;
    fileSize: number;
    extractedData?: TraceData;
}
export interface TraceData {
    screenshots: Screenshot[];
    networkRequests: NetworkRequest[];
    domSnapshots: DOMSnapshot[];
    consoleMessages: ConsoleMessage[];
    actions: PlaywrightAction[];
    performance: PerformanceMetrics;
}
export interface NetworkRequest {
    id: string;
    url: string;
    method: string;
    status: number;
    duration: number;
    size: number;
    failed: boolean;
    errorMessage?: string;
}
export interface DOMSnapshot {
    id: string;
    timestamp: number;
    html: string;
}
export interface ConsoleMessage {
    id: string;
    type: 'log' | 'error' | 'warning' | 'info';
    text: string;
    timestamp: number;
}
export interface PlaywrightAction {
    id: string;
    type: 'click' | 'fill' | 'goto' | 'waitFor' | 'expect' | 'screenshot';
    selector?: string;
    value?: string;
    timestamp: number;
    duration: number;
    screenshot?: string;
    error?: PlaywrightError;
}
export interface PerformanceMetrics {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
}
export interface PlaywrightExecutionMetadata {
    playwrightVersion: string;
    nodeVersion: string;
    os: string;
    browsers: BrowserInfo[];
    devices: DeviceInfo[];
    ci?: boolean;
    ciProvider?: string;
    parallelWorkers: number;
}
export interface BrowserInfo {
    name: string;
    version: string;
    channel?: string;
}
export interface DeviceInfo {
    name: string;
    userAgent: string;
    viewport: {
        width: number;
        height: number;
    };
}
export interface UploadOptions {
    developer?: string;
    branch?: string;
    environment?: string;
    failuresOnly?: boolean;
    path?: string;
    dryRun?: boolean;
    intent?: string;
    expectFailures?: boolean;
    reasoning?: string;
    goals?: string[];
    targetTests?: string[];
    context?: string;
    confidence?: number;
}
//# sourceMappingURL=types.d.ts.map