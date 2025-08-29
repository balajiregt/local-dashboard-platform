"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceProcessor = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const crypto_1 = require("crypto");
const adm_zip_1 = __importDefault(require("adm-zip"));
const globby_1 = __importDefault(require("globby"));
const report_manager_1 = require("./report-manager");
class TraceProcessor {
    constructor(testResultsPath, options = {}) {
        this.testResultsPath = testResultsPath;
        this.options = options;
        this.reportManager = report_manager_1.ReportManager.getInstance();
    }
    async processTestResults() {
        const startTime = new Date();
        const testRun = await this.collectTestRun();
        const results = await this.processTestFiles();
        const endTime = new Date();
        // Generate unique identifiers
        const uniqueId = this.reportManager.generateUniqueReportId();
        const reportNumber = await this.reportManager.getNextReportNumber();
        // Capture execution intent and insights
        const intent = await this.reportManager.captureExecutionIntent({
            purpose: this.options.intent,
            expectFailures: this.options.expectFailures,
            reasoning: this.options.reasoning,
            goals: this.options.goals,
            targetTests: this.options.targetTests,
            context: this.options.context,
        });
        const metadata = await this.reportManager.captureExecutionMetadata();
        // Process results with enhanced information
        const enhancedResults = results.map(result => {
            const actualOutcome = this.mapStatusToOutcome(result.status);
            const expectedOutcome = this.determineExpectedOutcome(result, intent);
            return {
                testName: result.testTitle,
                status: result.status === 'timedOut' || result.status === 'interrupted' ? 'failed' : result.status,
                duration: result.duration,
                error: result.errors.length > 0 ? result.errors[0].message : undefined,
                screenshots: result.screenshots.map(s => s.filePath),
                traceFile: result.traceFile,
                actualOutcome,
                expectedOutcome,
                outcomeMatch: actualOutcome === expectedOutcome,
            };
        });
        // Calculate enhanced summary
        const summary = this.calculateEnhancedSummary(enhancedResults, intent);
        // Generate insights
        const insights = await this.reportManager.captureExecutionInsights(intent, enhancedResults, { confidence: this.options.confidence });
        return {
            execution: {
                id: testRun.id,
                reportNumber,
                uniqueId,
                developer: testRun.developer || 'unknown',
                timestamp: testRun.startedAt,
                startTime,
                endTime,
                branch: testRun.branch,
                environment: testRun.environment || 'local',
                duration: endTime.getTime() - startTime.getTime(),
                intent,
                insights,
                metadata,
            },
            results: enhancedResults,
            summary,
        };
    }
    mapStatusToOutcome(status) {
        switch (status) {
            case 'passed':
                return 'pass';
            case 'failed':
            case 'timedOut':
            case 'interrupted':
                return 'fail';
            case 'skipped':
                return 'skip';
            default:
                return 'fail';
        }
    }
    determineExpectedOutcome(result, intent) {
        // If we're expecting failures globally, check if this test should fail
        if (intent.expectFailures) {
            // Check if this test is in the target list for expected failures
            if (intent.targetTests?.some(target => result.testTitle.includes(target))) {
                return 'fail';
            }
        }
        // Default expectation is that tests should pass
        return 'pass';
    }
    calculateEnhancedSummary(results, intent) {
        const total = results.length;
        const passed = results.filter(r => r.status === 'passed').length;
        const failed = results.filter(r => r.status === 'failed').length;
        const skipped = results.filter(r => r.status === 'skipped').length;
        const expectedFails = results.filter(r => r.expectedOutcome === 'fail' && r.actualOutcome === 'fail').length;
        const unexpectedFails = results.filter(r => r.expectedOutcome === 'pass' && r.actualOutcome === 'fail').length;
        const expectedPasses = results.filter(r => r.expectedOutcome === 'pass' && r.actualOutcome === 'pass').length;
        const unexpectedPasses = results.filter(r => r.expectedOutcome === 'fail' && r.actualOutcome === 'pass').length;
        return {
            total,
            passed,
            failed,
            skipped,
            expectedFails,
            unexpectedFails,
            expectedPasses,
            unexpectedPasses,
        };
    }
    async collectTestRun() {
        const startTime = new Date();
        const metadata = await this.extractExecutionMetadata();
        // Look for Playwright test results JSON file
        const jsonReportPath = (0, path_1.join)(this.testResultsPath, 'results.json');
        let testResults = null;
        if ((0, fs_1.existsSync)(jsonReportPath)) {
            try {
                testResults = JSON.parse((0, fs_1.readFileSync)(jsonReportPath, 'utf8'));
            }
            catch (error) {
                console.warn('Failed to parse test results JSON:', error);
            }
        }
        const testRun = {
            id: (0, crypto_1.randomUUID)(),
            projectId: 'local',
            startedAt: startTime,
            completedAt: new Date(),
            duration: 0,
            totalTests: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            browsers: [],
            traces: [],
            metadata,
        };
        if (testResults) {
            testRun.duration = testResults.config?.reportSlowTests?.threshold || 0;
            testRun.totalTests = testResults.stats?.total || 0;
            testRun.passed = testResults.stats?.passed || 0;
            testRun.failed = testResults.stats?.failed || 0;
            testRun.skipped = testResults.stats?.skipped || 0;
        }
        return testRun;
    }
    async processTestFiles() {
        const results = [];
        // Find all test result directories
        const testDirs = await this.findTestDirectories();
        for (const testDir of testDirs) {
            try {
                const result = await this.processTestDirectory(testDir);
                if (result) {
                    results.push(result);
                }
            }
            catch (error) {
                console.warn(`Failed to process test directory ${testDir}:`, error);
            }
        }
        return results;
    }
    async findTestDirectories() {
        if (!(0, fs_1.existsSync)(this.testResultsPath)) {
            return [];
        }
        const directories = [];
        const items = (0, fs_1.readdirSync)(this.testResultsPath);
        for (const item of items) {
            const itemPath = (0, path_1.join)(this.testResultsPath, item);
            const stat = (0, fs_1.statSync)(itemPath);
            if (stat.isDirectory()) {
                directories.push(itemPath);
            }
        }
        return directories;
    }
    async processTestDirectory(testDir) {
        const dirName = (0, path_1.basename)(testDir);
        // Extract test info from directory name
        // Format is usually: test-name-browser-retry-timestamp
        const testInfo = this.parseTestDirectoryName(dirName);
        const result = {
            id: (0, crypto_1.randomUUID)(),
            testRunId: (0, crypto_1.randomUUID)(),
            testTitle: testInfo.testName,
            testFile: testInfo.testFile || 'unknown.spec.ts',
            browser: testInfo.browser || 'chromium',
            device: testInfo.device,
            status: await this.determineTestStatus(testDir),
            duration: 0,
            retries: testInfo.retry || 0,
            screenshots: await this.collectScreenshots(testDir),
            videos: await this.collectVideos(testDir),
            errors: await this.collectErrors(testDir),
            steps: await this.collectTestSteps(testDir),
        };
        // Find trace file
        const traceFile = await this.findTraceFile(testDir);
        if (traceFile) {
            result.traceFile = traceFile;
        }
        return result;
    }
    parseTestDirectoryName(dirName) {
        // Parse directory names like: auth-login-chromium-retry0-20231120-123456
        const parts = dirName.split('-');
        return {
            testName: parts.slice(0, -4).join('-') || dirName,
            browser: parts.find(p => ['chromium', 'firefox', 'webkit'].includes(p)) || 'chromium',
            retry: parseInt(parts.find(p => p.startsWith('retry'))?.replace('retry', '') || '0'),
            testFile: dirName + '.spec.ts', // Default assumption
        };
    }
    async determineTestStatus(testDir) {
        // Look for failure indicators
        const traceFile = await this.findTraceFile(testDir);
        if (traceFile) {
            return 'failed'; // Traces are usually only generated on failure
        }
        // Check for error screenshots
        const screenshots = await this.collectScreenshots(testDir);
        if (screenshots.some(s => s.filePath.includes('error') || s.filePath.includes('failure'))) {
            return 'failed';
        }
        // Default to passed if no failure indicators
        return 'passed';
    }
    async findTraceFile(testDir) {
        const tracePatterns = ['trace.zip', '*.trace', '*.zip'];
        for (const pattern of tracePatterns) {
            const files = await (0, globby_1.default)(pattern, { cwd: testDir });
            if (files.length > 0) {
                return (0, path_1.join)(testDir, files[0]);
            }
        }
        return undefined;
    }
    async collectScreenshots(testDir) {
        const screenshotPatterns = ['*.png', '*.jpg', '*.jpeg'];
        const screenshots = [];
        for (const pattern of screenshotPatterns) {
            const files = await (0, globby_1.default)(pattern, { cwd: testDir });
            for (const file of files) {
                const filePath = (0, path_1.join)(testDir, file);
                const stat = (0, fs_1.statSync)(filePath);
                screenshots.push({
                    id: (0, crypto_1.randomUUID)(),
                    timestamp: stat.mtimeMs,
                    filePath,
                    width: 0, // Would need image processing to get actual dimensions
                    height: 0,
                    actionBefore: this.inferActionFromFilename(file),
                });
            }
        }
        return screenshots;
    }
    async collectVideos(testDir) {
        const videoPatterns = ['*.webm', '*.mp4'];
        const videos = [];
        for (const pattern of videoPatterns) {
            const files = await (0, globby_1.default)(pattern, { cwd: testDir });
            for (const file of files) {
                const filePath = (0, path_1.join)(testDir, file);
                const stat = (0, fs_1.statSync)(filePath);
                videos.push({
                    id: (0, crypto_1.randomUUID)(),
                    filePath,
                    duration: 0, // Would need video processing to get actual duration
                    size: stat.size,
                });
            }
        }
        return videos;
    }
    async collectErrors(testDir) {
        const errors = [];
        // Look for error files or extract from trace
        const traceFile = await this.findTraceFile(testDir);
        if (traceFile) {
            try {
                const traceErrors = await this.extractErrorsFromTrace(traceFile);
                errors.push(...traceErrors);
            }
            catch (error) {
                console.warn('Failed to extract errors from trace:', error);
            }
        }
        return errors;
    }
    async collectTestSteps(testDir) {
        const steps = [];
        // Extract steps from trace file if available
        const traceFile = await this.findTraceFile(testDir);
        if (traceFile) {
            try {
                const traceSteps = await this.extractStepsFromTrace(traceFile);
                steps.push(...traceSteps);
            }
            catch (error) {
                console.warn('Failed to extract steps from trace:', error);
            }
        }
        return steps;
    }
    async extractErrorsFromTrace(traceFilePath) {
        const errors = [];
        try {
            if (traceFilePath.endsWith('.zip')) {
                const zip = new adm_zip_1.default(traceFilePath);
                const entries = zip.getEntries();
                for (const entry of entries) {
                    if (entry.entryName === 'trace.trace' || entry.entryName.endsWith('.json')) {
                        const content = entry.getData().toString('utf8');
                        const traceData = JSON.parse(content);
                        // Extract errors from trace data
                        if (traceData.errors) {
                            for (const error of traceData.errors) {
                                errors.push({
                                    message: error.message || 'Unknown error',
                                    stack: error.stack || '',
                                    location: {
                                        file: error.location?.file || 'unknown',
                                        line: error.location?.line || 0,
                                        column: error.location?.column || 0,
                                    },
                                });
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            console.warn('Failed to extract errors from trace file:', error);
        }
        return errors;
    }
    async extractStepsFromTrace(traceFilePath) {
        const steps = [];
        try {
            if (traceFilePath.endsWith('.zip')) {
                const zip = new adm_zip_1.default(traceFilePath);
                const entries = zip.getEntries();
                for (const entry of entries) {
                    if (entry.entryName === 'trace.trace' || entry.entryName.endsWith('.json')) {
                        const content = entry.getData().toString('utf8');
                        const traceData = JSON.parse(content);
                        // Extract steps from trace data
                        if (traceData.actions) {
                            for (const action of traceData.actions) {
                                steps.push({
                                    id: (0, crypto_1.randomUUID)(),
                                    title: action.apiName || action.method || 'Unknown step',
                                    duration: action.endTime - action.startTime || 0,
                                });
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            console.warn('Failed to extract steps from trace file:', error);
        }
        return steps;
    }
    inferActionFromFilename(filename) {
        const name = (0, path_1.basename)(filename, (0, path_1.extname)(filename)).toLowerCase();
        if (name.includes('click'))
            return 'click';
        if (name.includes('fill') || name.includes('type'))
            return 'fill';
        if (name.includes('goto') || name.includes('navigate'))
            return 'goto';
        if (name.includes('wait'))
            return 'wait';
        if (name.includes('error') || name.includes('failure'))
            return 'error';
        return undefined;
    }
    async extractExecutionMetadata() {
        const metadata = {
            playwrightVersion: 'unknown',
            nodeVersion: process.version,
            os: process.platform,
            browsers: [],
            devices: [],
            parallelWorkers: 1,
        };
        // Try to detect CI environment
        if (process.env.CI) {
            metadata.ci = true;
            metadata.ciProvider = this.detectCIProvider();
        }
        return metadata;
    }
    detectCIProvider() {
        if (process.env.GITHUB_ACTIONS)
            return 'github-actions';
        if (process.env.JENKINS_URL)
            return 'jenkins';
        if (process.env.BUILDKITE)
            return 'buildkite';
        if (process.env.CIRCLECI)
            return 'circleci';
        if (process.env.TRAVIS)
            return 'travis';
        return 'unknown';
    }
    generateReportId() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const hash = (0, crypto_1.createHash)('md5').update(this.testResultsPath + timestamp).digest('hex').substring(0, 8);
        return `report-${timestamp}-${hash}`;
    }
}
exports.TraceProcessor = TraceProcessor;
//# sourceMappingURL=trace-processor.js.map