"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportManager = void 0;
const crypto_1 = require("crypto");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
const inquirer_1 = __importDefault(require("inquirer"));
class ReportManager {
    constructor() {
        this.reportsDir = (0, path_1.join)(process.cwd(), '.playwright-reports');
        this.reportNumberFile = (0, path_1.join)(this.reportsDir, 'report-counter.json');
    }
    static getInstance() {
        if (!ReportManager.instance) {
            ReportManager.instance = new ReportManager();
        }
        return ReportManager.instance;
    }
    generateUniqueReportId() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const uuid = (0, crypto_1.randomUUID)().substring(0, 8);
        return `${timestamp}-${uuid}`;
    }
    async getNextReportNumber() {
        try {
            if ((0, fs_1.existsSync)(this.reportNumberFile)) {
                const data = JSON.parse((0, fs_1.readFileSync)(this.reportNumberFile, 'utf8'));
                const nextNumber = (data.lastNumber || 0) + 1;
                // Update the counter
                data.lastNumber = nextNumber;
                (0, fs_1.writeFileSync)(this.reportNumberFile, JSON.stringify(data, null, 2));
                return nextNumber;
            }
            else {
                // First report
                const initialData = { lastNumber: 1 };
                (0, fs_1.writeFileSync)(this.reportNumberFile, JSON.stringify(initialData, null, 2));
                return 1;
            }
        }
        catch (error) {
            console.warn('Failed to get report number, using timestamp:', error);
            return Date.now();
        }
    }
    async captureExecutionIntent(options = {}) {
        // If intent is provided via options, use it
        if (options.intent || options.reasoning || options.goals) {
            return {
                purpose: this.mapIntentToPurpose(options.intent || 'development'),
                description: options.reasoning,
                expectFailures: options.expectFailures || false,
                targetTests: options.targetTests || [],
                goals: options.goals || [],
                context: options.context,
            };
        }
        // Interactive mode - prompt user for intent
        try {
            const answers = await inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'purpose',
                    message: 'What is the purpose of this test execution?',
                    choices: [
                        { name: 'Development - Testing new code changes', value: 'development' },
                        { name: 'Debugging - Investigating test failures', value: 'debugging' },
                        { name: 'Regression - Verifying existing functionality', value: 'regression' },
                        { name: 'Validation - Confirming fix or feature', value: 'validation' },
                        { name: 'Exploration - Understanding system behavior', value: 'exploration' },
                        { name: 'CI/CD - Automated pipeline execution', value: 'ci-cd' },
                        { name: 'Manual - Manual test execution', value: 'manual' },
                    ],
                    default: 'development',
                },
                {
                    type: 'input',
                    name: 'description',
                    message: 'Brief description of what you\'re testing (optional):',
                },
                {
                    type: 'confirm',
                    name: 'expectFailures',
                    message: 'Do you expect some tests to fail?',
                    default: false,
                },
                {
                    type: 'input',
                    name: 'goals',
                    message: 'What are your goals for this test run? (comma-separated):',
                    filter: (input) => input.split(',').map(g => g.trim()).filter(g => g.length > 0),
                },
            ]);
            return {
                purpose: answers.purpose,
                description: answers.description,
                expectFailures: answers.expectFailures,
                targetTests: [],
                goals: answers.goals || [],
            };
        }
        catch (error) {
            // Fall back to default intent if prompting fails
            return {
                purpose: 'development',
                expectFailures: false,
                targetTests: [],
                goals: [],
            };
        }
    }
    async captureExecutionMetadata() {
        const metadata = {
            testRunReason: 'local-execution',
            tags: [],
        };
        try {
            // Capture git information
            metadata.gitCommit = this.getGitCommit();
            metadata.gitDiff = this.getGitDiff();
            metadata.codeChanges = this.getCodeChanges();
        }
        catch (error) {
            console.warn('Failed to capture git metadata:', error);
        }
        return metadata;
    }
    async captureExecutionInsights(intent, results, options = {}) {
        const failed = results.filter(r => r.status === 'failed');
        const unexpected = results.filter(r => !r.outcomeMatch);
        try {
            const answers = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'reasoning',
                    message: 'What was your reasoning for running these tests?',
                    default: intent.description || 'Testing changes',
                },
                {
                    type: 'input',
                    name: 'expectedBehavior',
                    message: 'What behavior did you expect?',
                    default: failed.length === 0 ? 'All tests to pass' : 'Some tests to fail',
                },
                {
                    type: 'input',
                    name: 'actualBehavior',
                    message: 'What actually happened?',
                    default: this.summarizeResults(results),
                },
                {
                    type: 'input',
                    name: 'surprises',
                    message: 'Any surprising results? (comma-separated):',
                    filter: (input) => input.split(',').map(s => s.trim()).filter(s => s.length > 0),
                },
                {
                    type: 'input',
                    name: 'learnings',
                    message: 'What did you learn from this test run? (comma-separated):',
                    filter: (input) => input.split(',').map(l => l.trim()).filter(l => l.length > 0),
                },
                {
                    type: 'input',
                    name: 'nextSteps',
                    message: 'What are your next steps? (comma-separated):',
                    filter: (input) => input.split(',').map(s => s.trim()).filter(s => s.length > 0),
                },
                {
                    type: 'list',
                    name: 'confidence',
                    message: 'How confident are you in these results?',
                    choices: [
                        { name: '10 - Completely confident', value: 10 },
                        { name: '9 - Very confident', value: 9 },
                        { name: '8 - Confident', value: 8 },
                        { name: '7 - Mostly confident', value: 7 },
                        { name: '6 - Somewhat confident', value: 6 },
                        { name: '5 - Neutral', value: 5 },
                        { name: '4 - Slightly unsure', value: 4 },
                        { name: '3 - Unsure', value: 3 },
                        { name: '2 - Very unsure', value: 2 },
                        { name: '1 - Not confident at all', value: 1 },
                    ],
                    default: options.confidence || 7,
                },
            ]);
            return {
                reasoning: answers.reasoning,
                expectedBehavior: answers.expectedBehavior,
                actualBehavior: answers.actualBehavior,
                surprises: answers.surprises || [],
                learnings: answers.learnings || [],
                nextSteps: answers.nextSteps || [],
                confidence: answers.confidence,
            };
        }
        catch (error) {
            // Fall back to automatic insights if prompting fails
            return {
                reasoning: intent.description || 'Local test execution',
                expectedBehavior: 'Tests to pass',
                actualBehavior: this.summarizeResults(results),
                surprises: unexpected.length > 0 ? [`${unexpected.length} tests had unexpected outcomes`] : [],
                learnings: [],
                nextSteps: failed.length > 0 ? ['Investigate test failures'] : [],
                confidence: options.confidence || 5,
            };
        }
    }
    mapIntentToPurpose(intent) {
        const mapping = {
            dev: 'development',
            development: 'development',
            debug: 'debugging',
            debugging: 'debugging',
            regression: 'regression',
            validate: 'validation',
            validation: 'validation',
            explore: 'exploration',
            exploration: 'exploration',
            ci: 'ci-cd',
            'ci-cd': 'ci-cd',
            manual: 'manual',
        };
        return mapping[intent.toLowerCase()] || 'development';
    }
    getGitCommit() {
        try {
            return (0, child_process_1.execSync)('git rev-parse HEAD', { encoding: 'utf8' }).trim();
        }
        catch (error) {
            return undefined;
        }
    }
    getGitDiff() {
        try {
            const diff = (0, child_process_1.execSync)('git diff --name-only HEAD', { encoding: 'utf8' }).trim();
            return diff.length > 0 ? diff : undefined;
        }
        catch (error) {
            return undefined;
        }
    }
    getCodeChanges() {
        try {
            const changes = (0, child_process_1.execSync)('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' }).trim();
            return changes.split('\n').filter(line => line.length > 0);
        }
        catch (error) {
            return [];
        }
    }
    summarizeResults(results) {
        const total = results.length;
        const passed = results.filter(r => r.status === 'passed').length;
        const failed = results.filter(r => r.status === 'failed').length;
        const skipped = results.filter(r => r.status === 'skipped').length;
        if (failed === 0) {
            return `All ${total} tests passed`;
        }
        else {
            return `${passed} passed, ${failed} failed, ${skipped} skipped out of ${total} tests`;
        }
    }
}
exports.ReportManager = ReportManager;
//# sourceMappingURL=report-manager.js.map