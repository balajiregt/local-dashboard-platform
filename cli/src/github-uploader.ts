import axios, { AxiosInstance } from 'axios';
import { readFileSync, createReadStream, statSync } from 'fs';
import { basename, join, dirname } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import AdmZip from 'adm-zip';
import { createHash } from 'crypto';
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

export class GitHubUploader {
  private client: AxiosInstance;
  private config: GitHubConfig;
  private spinner: any;

  constructor(config: GitHubConfig) {
    this.config = {
      branch: 'main',
      ...config,
    };

    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${this.config.token}`,
        'User-Agent': 'playwright-reports-cli',
      },
    });

    this.spinner = ora();
  }

  async uploadReport(report: ProcessedTestReport, assetPaths: string[] = []): Promise<UploadResult> {
    this.spinner.start('Uploading test report to GitHub...');
    
    try {
      await this.ensureReportsStructure();
      
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
        reportUrl: `https://github.com/${this.config.owner}/${this.config.repo}/tree/${this.config.branch}/reports/${reportId}`,
        dashboardUrl: `https://${this.config.owner}.github.io/${this.config.repo}`,
        uploadedFiles: [
          `${reportPath}/report.json`,
          ...uploadedAssets,
        ],
      };

      this.spinner.succeed(`Report uploaded successfully! View at: ${chalk.blue(result.dashboardUrl)}`);
      return result;
      
    } catch (error) {
      this.spinner.fail('Failed to upload report');
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get(`/repos/${this.config.owner}/${this.config.repo}`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async ensureRepository(): Promise<void> {
    try {
      // Check if repository exists
      await this.client.get(`/repos/${this.config.owner}/${this.config.repo}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(
          `Repository ${this.config.owner}/${this.config.repo} not found. ` +
          'Please create the repository first or check your permissions.'
        );
      }
      throw error;
    }
  }

  private async ensureReportsStructure(): Promise<void> {
    // Ensure reports directory exists
    await this.ensureDirectory('reports');
    
    // Ensure assets directory exists
    await this.ensureDirectory('reports/assets');
    
    // Create index file if it doesn't exist
    try {
      await this.client.get(`/repos/${this.config.owner}/${this.config.repo}/contents/reports/index.json`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        const initialIndex = {
          version: '1.0.0',
          lastUpdated: new Date().toISOString(),
          reports: [],
        };
        
        await this.createOrUpdateFile(
          'reports/index.json',
          JSON.stringify(initialIndex, null, 2),
          'Initialize reports index'
        );
      }
    }
  }

  private async ensureDirectory(path: string): Promise<void> {
    try {
      await this.client.get(`/repos/${this.config.owner}/${this.config.repo}/contents/${path}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Create a placeholder file to create the directory
        await this.createOrUpdateFile(
          `${path}/.gitkeep`,
          '',
          `Create ${path} directory`
        );
      }
    }
  }

  private async uploadReportData(reportPath: string, report: ProcessedTestReport): Promise<void> {
    const reportJson = JSON.stringify(report, null, 2);
    
    await this.createOrUpdateFile(
      `${reportPath}/report.json`,
      reportJson,
      `Add test report ${report.execution.reportNumber}`
    );

    // Create a summary markdown file
    const summaryMd = this.generateReportSummary(report);
    await this.createOrUpdateFile(
      `${reportPath}/summary.md`,
      summaryMd,
      `Add report summary ${report.execution.reportNumber}`
    );
  }

  private async uploadAssets(reportPath: string, assetPaths: string[]): Promise<string[]> {
    const uploadedAssets: string[] = [];
    
    if (assetPaths.length === 0) {
      return uploadedAssets;
    }

    this.spinner.text = 'Uploading test assets...';
    
    for (const assetPath of assetPaths) {
      try {
        const fileName = basename(assetPath);
        const targetPath = `${reportPath}/assets/${fileName}`;
        
        const content = await this.prepareAssetForUpload(assetPath);
        
        await this.createOrUpdateFile(
          targetPath,
          content,
          `Add test asset ${fileName}`,
          true // binary content
        );
        
        uploadedAssets.push(targetPath);
      } catch (error) {
        console.warn(`Failed to upload asset ${assetPath}:`, error);
      }
    }
    
    return uploadedAssets;
  }

  private async prepareAssetForUpload(filePath: string): Promise<string> {
    const stats = statSync(filePath);
    
    // For large files, compress them
    if (stats.size > 1024 * 1024) { // 1MB
      if (filePath.endsWith('.zip')) {
        // Already compressed
        return readFileSync(filePath, 'base64');
      } else {
        // Compress the file
        const zip = new AdmZip();
        zip.addLocalFile(filePath);
        return zip.toBuffer().toString('base64');
      }
    }
    
    // For smaller files, read directly
    return readFileSync(filePath, 'base64');
  }

  private async updateReportsIndex(report: ProcessedTestReport): Promise<void> {
    try {
      // Get current index
      const response = await this.client.get(
        `/repos/${this.config.owner}/${this.config.repo}/contents/reports/index.json`
      );
      
      const currentContent = Buffer.from(response.data.content, 'base64').toString('utf8');
      const index = JSON.parse(currentContent);
      
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
        `Update reports index with report ${report.execution.reportNumber}`,
        false,
        response.data.sha
      );
      
    } catch (error) {
      console.warn('Failed to update reports index:', error);
    }
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
      branch: this.config.branch,
    };
    
    if (sha) {
      payload.sha = sha;
    }
    
    await this.client.put(
      `/repos/${this.config.owner}/${this.config.repo}/contents/${path}`,
      payload
    );
  }

  private generateReportSummary(report: ProcessedTestReport): string {
    const { execution, summary, results } = report;
    
    const failedTests = results.filter(r => r.status === 'failed');
    const passRate = summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(1) : '0';
    
    let markdown = `# Test Report #${execution.reportNumber}\n\n`;
    
    markdown += `## Summary\n\n`;
    markdown += `- **Report ID**: ${execution.uniqueId}\n`;
    markdown += `- **Developer**: ${execution.developer}\n`;
    markdown += `- **Timestamp**: ${execution.timestamp.toISOString()}\n`;
    markdown += `- **Duration**: ${execution.duration}ms\n`;
    markdown += `- **Branch**: ${execution.branch || 'unknown'}\n`;
    markdown += `- **Environment**: ${execution.environment}\n\n`;
    
    markdown += `## Test Results\n\n`;
    markdown += `- **Total Tests**: ${summary.total}\n`;
    markdown += `- **Passed**: ${summary.passed} ✅\n`;
    markdown += `- **Failed**: ${summary.failed} ❌\n`;
    markdown += `- **Skipped**: ${summary.skipped} ⏭️\n`;
    markdown += `- **Pass Rate**: ${passRate}%\n\n`;
    
    if (execution.intent) {
      markdown += `## Test Intent\n\n`;
      markdown += `- **Purpose**: ${execution.intent.purpose}\n`;
      markdown += `- **Expected Failures**: ${execution.intent.expectFailures ? 'Yes' : 'No'}\n`;
      if (execution.intent.description) {
        markdown += `- **Description**: ${execution.intent.description}\n`;
      }
      if (execution.intent.goals.length > 0) {
        markdown += `- **Goals**: ${execution.intent.goals.join(', ')}\n`;
      }
      markdown += '\n';
    }
    
    if (failedTests.length > 0) {
      markdown += `## Failed Tests\n\n`;
      failedTests.forEach(test => {
        markdown += `### ${test.testName}\n\n`;
        if (test.error) {
          markdown += `**Error**: ${test.error}\n\n`;
        }
        markdown += `**Duration**: ${test.duration}ms\n\n`;
        if (test.screenshots.length > 0) {
          markdown += `**Screenshots**: ${test.screenshots.length} available\n\n`;
        }
      });
    }
    
    if (execution.insights) {
      markdown += `## Execution Insights\n\n`;
      markdown += `**Reasoning**: ${execution.insights.reasoning}\n\n`;
      markdown += `**Expected**: ${execution.insights.expectedBehavior}\n\n`;
      markdown += `**Actual**: ${execution.insights.actualBehavior}\n\n`;
      
      if (execution.insights.surprises.length > 0) {
        markdown += `**Surprises**:\n`;
        execution.insights.surprises.forEach(surprise => {
          markdown += `- ${surprise}\n`;
        });
        markdown += '\n';
      }
      
      if (execution.insights.learnings.length > 0) {
        markdown += `**Learnings**:\n`;
        execution.insights.learnings.forEach(learning => {
          markdown += `- ${learning}\n`;
        });
        markdown += '\n';
      }
      
      if (execution.insights.nextSteps.length > 0) {
        markdown += `**Next Steps**:\n`;
        execution.insights.nextSteps.forEach(step => {
          markdown += `- ${step}\n`;
        });
        markdown += '\n';
      }
      
      markdown += `**Confidence**: ${execution.insights.confidence}/10\n\n`;
    }
    
    markdown += `---\n`;
    markdown += `*Generated by Playwright Reports CLI at ${new Date().toISOString()}*\n`;
    
    return markdown;
  }

  static fromConfig(config: CLIConfig): GitHubUploader {
    const [owner, repo] = config.repository.split('/');
    
    if (!owner || !repo) {
      throw new Error('Invalid repository format. Expected "owner/repo"');
    }
    
    const token = config.github?.token || process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GitHub token not found. Set GITHUB_TOKEN environment variable or configure token in CLI');
    }
    
    return new GitHubUploader({
      owner,
      repo,
      token,
    });
  }
} 