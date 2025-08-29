#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const inquirer_1 = __importDefault(require("inquirer"));
const config_1 = require("./config");
const trace_processor_1 = require("./trace-processor");
const github_uploader_1 = require("./github-uploader");
const fs_1 = require("fs");
const path_1 = require("path");
const program = new commander_1.Command();
program
    .name('playwright-reports')
    .description('CLI tool for uploading Playwright test results to GitHub-based dashboard')
    .version('1.0.0');
program
    .command('init')
    .description('Initialize Playwright Reports configuration')
    .option('--repo <repository>', 'GitHub repository (owner/repo)')
    .option('--token <token>', 'GitHub access token')
    .option('--global', 'Save configuration globally')
    .action(async (options) => {
    await initCommand(options);
});
program
    .command('upload')
    .description('Upload test results to GitHub')
    .option('--developer <name>', 'Developer name (overrides config)')
    .option('--branch <branch>', 'Git branch (overrides auto-detection)')
    .option('--environment <env>', 'Environment name (default: local)')
    .option('--failures-only', 'Upload only failed tests')
    .option('--path <path>', 'Path to test results directory (default: ./test-results)')
    .option('--dry-run', 'Show what would be uploaded without actually uploading')
    .action(async (options) => {
    await uploadCommand(options);
});
program
    .command('status')
    .description('Show current configuration and connection status')
    .action(async () => {
    await statusCommand();
});
program
    .command('list')
    .description('List recent test reports')
    .option('--limit <number>', 'Number of reports to show (default: 10)', '10')
    .action(async (options) => {
    await listCommand(options);
});
async function initCommand(options) {
    console.log(chalk_1.default.blue.bold('🚀 Initializing Playwright Reports CLI\n'));
    try {
        // Load existing config if available
        const existingConfig = await config_1.configManager.loadConfig();
        // Prompt for configuration
        const answers = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Project name:',
                default: existingConfig?.name || 'My Playwright Project',
            },
            {
                type: 'input',
                name: 'repository',
                message: 'GitHub repository (owner/repo):',
                default: options.repo || existingConfig?.repository,
                validate: (input) => {
                    const pattern = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
                    return pattern.test(input) || 'Repository must be in format "owner/repo"';
                },
            },
            {
                type: 'password',
                name: 'token',
                message: 'GitHub access token (optional, can use GITHUB_TOKEN env var):',
                default: options.token || existingConfig?.github?.token,
            },
            {
                type: 'input',
                name: 'developer',
                message: 'Your name (for attribution):',
                default: await config_1.configManager.getDeveloperName(),
            },
            {
                type: 'input',
                name: 'uploadPath',
                message: 'Test results directory:',
                default: existingConfig?.localConfig?.uploadPath || './test-results',
            },
            {
                type: 'confirm',
                name: 'includeSuccessful',
                message: 'Include successful test results?',
                default: existingConfig?.localConfig?.includeSuccessful || false,
            },
        ]);
        // Build configuration
        const config = {
            name: answers.name,
            repository: answers.repository,
            github: {
                token: answers.token,
                pages: {
                    url: `https://${answers.repository.split('/')[0]}.github.io/${answers.repository.split('/')[1]}`,
                    source: 'gh-pages',
                },
            },
            localConfig: {
                developer: answers.developer,
                uploadPath: answers.uploadPath,
                includeSuccessful: answers.includeSuccessful,
                includeFailures: true,
                autoUpload: false,
            },
            playwright: {
                testDir: './tests',
                traceDir: answers.uploadPath,
                tracePaths: [
                    `${answers.uploadPath}/**/trace.zip`,
                    `${answers.uploadPath}/**/*.png`,
                    `${answers.uploadPath}/**/*.webm`,
                ],
                browsers: ['chromium', 'firefox', 'webkit'],
                devices: ['Desktop Chrome', 'iPhone 13', 'iPad'],
                collectTraces: 'retain-on-failure',
                collectScreenshots: 'only-on-failure',
                collectVideos: 'retain-on-failure',
            },
        };
        // Validate configuration
        config_1.configManager.validateConfig(config);
        // Save configuration
        if (options.global) {
            await config_1.configManager.saveConfig(config);
            console.log(chalk_1.default.green('✅ Configuration saved globally'));
        }
        else {
            await config_1.configManager.saveConfig(config);
            console.log(chalk_1.default.green('✅ Configuration saved for this project'));
        }
        // Test GitHub connection
        const spinner = (0, ora_1.default)('Testing GitHub connection...').start();
        try {
            const uploader = new github_uploader_1.GitHubUploader(config);
            const isValid = await uploader.validateConnection();
            if (isValid) {
                spinner.succeed('GitHub connection successful');
                // Setup repository if needed
                spinner.start('Setting up repository...');
                await uploader.ensureRepositorySetup();
                spinner.succeed('Repository setup complete');
                console.log(chalk_1.default.green('\n🎉 Playwright Reports is ready to use!'));
                console.log(chalk_1.default.blue(`📊 Dashboard will be available at: ${config.github.pages.url}`));
                console.log(chalk_1.default.yellow('\n📝 Next steps:'));
                console.log('   1. Run your Playwright tests with --trace=on');
                console.log('   2. Use "playwright-reports upload" to upload results');
            }
            else {
                spinner.fail('GitHub connection failed - check your token and repository access');
            }
        }
        catch (error) {
            spinner.fail(`GitHub setup failed: ${error}`);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Initialization failed:'), error);
        process.exit(1);
    }
}
async function uploadCommand(options) {
    console.log(chalk_1.default.blue.bold('📤 Uploading test results\n'));
    try {
        // Load configuration
        const config = await config_1.configManager.loadConfig();
        if (!config) {
            console.error(chalk_1.default.red('❌ No configuration found. Run "playwright-reports init" first.'));
            process.exit(1);
        }
        // Determine upload path
        const uploadPath = options.path || config.localConfig.uploadPath;
        const fullPath = (0, path_1.resolve)(uploadPath);
        if (!(0, fs_1.existsSync)(fullPath)) {
            console.error(chalk_1.default.red(`❌ Test results directory not found: ${fullPath}`));
            console.log(chalk_1.default.yellow('💡 Make sure to run Playwright tests first with tracing enabled:'));
            console.log('   npx playwright test --trace=on');
            process.exit(1);
        }
        console.log(chalk_1.default.gray(`🔍 Processing test results from: ${fullPath}`));
        // Process trace files
        const spinner = (0, ora_1.default)('Processing test results...').start();
        const processor = new trace_processor_1.TraceProcessor(fullPath);
        const report = await processor.processTestResults();
        // Override developer/branch from options
        if (options.developer) {
            report.execution.developer = options.developer;
        }
        if (options.branch) {
            report.execution.branch = options.branch;
        }
        else {
            // Auto-detect current branch
            const currentBranch = await config_1.configManager.getCurrentBranch();
            if (currentBranch) {
                report.execution.branch = currentBranch;
            }
        }
        if (options.environment) {
            report.execution.environment = options.environment;
        }
        spinner.succeed(`Processed ${report.results.length} test results`);
        // Filter results if needed
        let filteredResults = report.results;
        if (options.failuresOnly) {
            filteredResults = report.results.filter(r => r.status === 'failed');
            console.log(chalk_1.default.gray(`🔍 Filtered to ${filteredResults.length} failed tests`));
        }
        if (filteredResults.length === 0) {
            console.log(chalk_1.default.yellow('⚠️  No test results to upload'));
            return;
        }
        // Collect asset files
        const assetFiles = [];
        for (const result of filteredResults) {
            assetFiles.push(...result.screenshots);
            if (result.traceFile) {
                assetFiles.push(result.traceFile);
            }
        }
        console.log(chalk_1.default.gray(`📁 Found ${assetFiles.length} asset files`));
        if (options.dryRun) {
            console.log(chalk_1.default.blue('\n🔍 Dry run - would upload:'));
            console.log(chalk_1.default.gray(`   Report: ${JSON.stringify(report.summary, null, 2)}`));
            console.log(chalk_1.default.gray(`   Assets: ${assetFiles.length} files`));
            return;
        }
        // Upload to GitHub
        spinner.start('Uploading to GitHub...');
        const uploader = new github_uploader_1.GitHubUploader(config);
        const result = await uploader.uploadReport(report, assetFiles);
        if (result.success) {
            spinner.succeed(`Uploaded ${result.filesUploaded} files successfully`);
            console.log(chalk_1.default.green('\n🎉 Upload complete!'));
            if (result.reportUrl) {
                console.log(chalk_1.default.blue(`📊 View report: ${result.reportUrl}`));
            }
        }
        else {
            spinner.fail(`Upload failed: ${result.error}`);
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Upload failed:'), error);
        process.exit(1);
    }
}
async function statusCommand() {
    console.log(chalk_1.default.blue.bold('📊 Playwright Reports Status\n'));
    try {
        const config = await config_1.configManager.loadConfig();
        if (!config) {
            console.log(chalk_1.default.red('❌ No configuration found'));
            console.log(chalk_1.default.yellow('💡 Run "playwright-reports init" to get started'));
            return;
        }
        console.log(chalk_1.default.green('✅ Configuration found'));
        console.log(chalk_1.default.gray(`   Project: ${config.name}`));
        console.log(chalk_1.default.gray(`   Repository: ${config.repository}`));
        console.log(chalk_1.default.gray(`   Developer: ${config.localConfig.developer}`));
        console.log(chalk_1.default.gray(`   Upload path: ${config.localConfig.uploadPath}`));
        // Test GitHub connection
        const spinner = (0, ora_1.default)('Testing GitHub connection...').start();
        try {
            const uploader = new github_uploader_1.GitHubUploader(config);
            const isValid = await uploader.validateConnection();
            if (isValid) {
                spinner.succeed('GitHub connection successful');
                console.log(chalk_1.default.blue(`📊 Dashboard: ${config.github.pages.url}`));
            }
            else {
                spinner.fail('GitHub connection failed');
            }
        }
        catch (error) {
            spinner.fail(`Connection test failed: ${error}`);
        }
        // Check for test results
        const uploadPath = (0, path_1.resolve)(config.localConfig.uploadPath);
        if ((0, fs_1.existsSync)(uploadPath)) {
            console.log(chalk_1.default.green(`✅ Test results directory found: ${uploadPath}`));
        }
        else {
            console.log(chalk_1.default.yellow(`⚠️  Test results directory not found: ${uploadPath}`));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Status check failed:'), error);
    }
}
async function listCommand(options) {
    console.log(chalk_1.default.blue.bold('📋 Recent Test Reports\n'));
    try {
        const config = await config_1.configManager.loadConfig();
        if (!config) {
            console.error(chalk_1.default.red('❌ No configuration found. Run "playwright-reports init" first.'));
            return;
        }
        const spinner = (0, ora_1.default)('Fetching reports...').start();
        const uploader = new github_uploader_1.GitHubUploader(config);
        const reports = await uploader.listReports(parseInt(options.limit));
        if (reports.length === 0) {
            spinner.warn('No reports found');
            return;
        }
        spinner.succeed(`Found ${reports.length} reports`);
        for (const report of reports) {
            const timestamp = new Date(report.timestamp).toLocaleString();
            const status = report.summary.failed > 0 ? chalk_1.default.red('FAILED') : chalk_1.default.green('PASSED');
            console.log(`${status} ${chalk_1.default.blue(report.developer)} - ${chalk_1.default.gray(timestamp)}`);
            console.log(`   ${report.summary.passed}/${report.summary.total} passed`);
            if (report.branch) {
                console.log(chalk_1.default.gray(`   Branch: ${report.branch}`));
            }
            if (report.url) {
                console.log(chalk_1.default.blue(`   ${report.url}`));
            }
            console.log();
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Failed to list reports:'), error);
    }
}
program.parse();
//# sourceMappingURL=cli.js.map