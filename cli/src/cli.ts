#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { configManager } from './config';
import { TraceProcessor } from './trace-processor';
import { GitHubUploader } from './github-uploader';
import { CLIConfig, UploadOptions } from './types';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import globby from 'globby';

const program = new Command();

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

async function initCommand(options: any): Promise<void> {
  console.log(chalk.blue.bold('🚀 Initializing Playwright Reports CLI\n'));

  try {
    // Load existing config if available
    const existingConfig = await configManager.loadConfig();
    
    // Prompt for configuration
    const answers = await inquirer.prompt([
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
        validate: (input: string) => {
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
        default: await configManager.getDeveloperName(),
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
    const config: CLIConfig = {
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
    configManager.validateConfig(config);

    // Save configuration
    if (options.global) {
      await configManager.saveConfig(config);
      console.log(chalk.green('✅ Configuration saved globally'));
    } else {
      await configManager.saveConfig(config);
      console.log(chalk.green('✅ Configuration saved for this project'));
    }

    // Test GitHub connection
    const spinner = ora('Testing GitHub connection...').start();
    try {
      const uploader = new GitHubUploader(config);
      const isValid = await uploader.validateConnection();
      
      if (isValid) {
        spinner.succeed('GitHub connection successful');
        
        // Setup repository if needed
        spinner.start('Setting up repository...');
        await uploader.ensureRepositorySetup();
        spinner.succeed('Repository setup complete');
        
        console.log(chalk.green('\n🎉 Playwright Reports is ready to use!'));
        console.log(chalk.blue(`📊 Dashboard will be available at: ${config.github.pages.url}`));
        console.log(chalk.yellow('\n📝 Next steps:'));
        console.log('   1. Run your Playwright tests with --trace=on');
        console.log('   2. Use "playwright-reports upload" to upload results');
      } else {
        spinner.fail('GitHub connection failed - check your token and repository access');
      }
    } catch (error) {
      spinner.fail(`GitHub setup failed: ${error}`);
    }

  } catch (error) {
    console.error(chalk.red('❌ Initialization failed:'), error);
    process.exit(1);
  }
}

async function uploadCommand(options: UploadOptions): Promise<void> {
  console.log(chalk.blue.bold('📤 Uploading test results\n'));

  try {
    // Load configuration
    const config = await configManager.loadConfig();
    if (!config) {
      console.error(chalk.red('❌ No configuration found. Run "playwright-reports init" first.'));
      process.exit(1);
    }

    // Determine upload path
    const uploadPath = options.path || config.localConfig.uploadPath;
    const fullPath = resolve(uploadPath);

    if (!existsSync(fullPath)) {
      console.error(chalk.red(`❌ Test results directory not found: ${fullPath}`));
      console.log(chalk.yellow('💡 Make sure to run Playwright tests first with tracing enabled:'));
      console.log('   npx playwright test --trace=on');
      process.exit(1);
    }

    console.log(chalk.gray(`🔍 Processing test results from: ${fullPath}`));

    // Process trace files
    const spinner = ora('Processing test results...').start();
    const processor = new TraceProcessor(fullPath);
    const report = await processor.processTestResults();

    // Override developer/branch from options
    if (options.developer) {
      report.execution.developer = options.developer;
    }
    if (options.branch) {
      report.execution.branch = options.branch;
    } else {
      // Auto-detect current branch
      const currentBranch = await configManager.getCurrentBranch();
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
      console.log(chalk.gray(`🔍 Filtered to ${filteredResults.length} failed tests`));
    }

    if (filteredResults.length === 0) {
      console.log(chalk.yellow('⚠️  No test results to upload'));
      return;
    }

    // Collect asset files
    const assetFiles: string[] = [];
    for (const result of filteredResults) {
      assetFiles.push(...result.screenshots);
      if (result.traceFile) {
        assetFiles.push(result.traceFile);
      }
    }

    console.log(chalk.gray(`📁 Found ${assetFiles.length} asset files`));

    if (options.dryRun) {
      console.log(chalk.blue('\n🔍 Dry run - would upload:'));
      console.log(chalk.gray(`   Report: ${JSON.stringify(report.summary, null, 2)}`));
      console.log(chalk.gray(`   Assets: ${assetFiles.length} files`));
      return;
    }

    // Upload to GitHub
    spinner.start('Uploading to GitHub...');
    const uploader = new GitHubUploader(config);
    const result = await uploader.uploadReport(report, assetFiles);

    if (result.success) {
      spinner.succeed(`Uploaded ${result.filesUploaded} files successfully`);
      console.log(chalk.green('\n🎉 Upload complete!'));
      if (result.reportUrl) {
        console.log(chalk.blue(`📊 View report: ${result.reportUrl}`));
      }
    } else {
      spinner.fail(`Upload failed: ${result.error}`);
      process.exit(1);
    }

  } catch (error) {
    console.error(chalk.red('❌ Upload failed:'), error);
    process.exit(1);
  }
}

async function statusCommand(): Promise<void> {
  console.log(chalk.blue.bold('📊 Playwright Reports Status\n'));

  try {
    const config = await configManager.loadConfig();
    
    if (!config) {
      console.log(chalk.red('❌ No configuration found'));
      console.log(chalk.yellow('💡 Run "playwright-reports init" to get started'));
      return;
    }

    console.log(chalk.green('✅ Configuration found'));
    console.log(chalk.gray(`   Project: ${config.name}`));
    console.log(chalk.gray(`   Repository: ${config.repository}`));
    console.log(chalk.gray(`   Developer: ${config.localConfig.developer}`));
    console.log(chalk.gray(`   Upload path: ${config.localConfig.uploadPath}`));

    // Test GitHub connection
    const spinner = ora('Testing GitHub connection...').start();
    try {
      const uploader = new GitHubUploader(config);
      const isValid = await uploader.validateConnection();
      
      if (isValid) {
        spinner.succeed('GitHub connection successful');
        console.log(chalk.blue(`📊 Dashboard: ${config.github.pages.url}`));
      } else {
        spinner.fail('GitHub connection failed');
      }
    } catch (error) {
      spinner.fail(`Connection test failed: ${error}`);
    }

    // Check for test results
    const uploadPath = resolve(config.localConfig.uploadPath);
    if (existsSync(uploadPath)) {
      console.log(chalk.green(`✅ Test results directory found: ${uploadPath}`));
    } else {
      console.log(chalk.yellow(`⚠️  Test results directory not found: ${uploadPath}`));
    }

  } catch (error) {
    console.error(chalk.red('❌ Status check failed:'), error);
  }
}

async function listCommand(options: any): Promise<void> {
  console.log(chalk.blue.bold('📋 Recent Test Reports\n'));

  try {
    const config = await configManager.loadConfig();
    if (!config) {
      console.error(chalk.red('❌ No configuration found. Run "playwright-reports init" first.'));
      return;
    }

    const spinner = ora('Fetching reports...').start();
    const uploader = new GitHubUploader(config);
    const reports = await uploader.listReports(parseInt(options.limit));

    if (reports.length === 0) {
      spinner.warn('No reports found');
      return;
    }

    spinner.succeed(`Found ${reports.length} reports`);

    for (const report of reports) {
      const timestamp = new Date(report.timestamp).toLocaleString();
      const status = report.summary.failed > 0 ? chalk.red('FAILED') : chalk.green('PASSED');
      
      console.log(`${status} ${chalk.blue(report.developer)} - ${chalk.gray(timestamp)}`);
      console.log(`   ${report.summary.passed}/${report.summary.total} passed`);
      if (report.branch) {
        console.log(chalk.gray(`   Branch: ${report.branch}`));
      }
      if (report.url) {
        console.log(chalk.blue(`   ${report.url}`));
      }
      console.log();
    }

  } catch (error) {
    console.error(chalk.red('❌ Failed to list reports:'), error);
  }
}

program.parse(); 