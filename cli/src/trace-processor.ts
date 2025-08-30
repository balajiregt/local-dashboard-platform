import { readdirSync, readFileSync, statSync } from 'fs';
import { join, basename } from 'path';
import { ProcessedTestReport, TestExecution, TestSummary, TestResult } from './types';
import { createHash } from 'crypto';

export class TraceProcessor {
  private testResultsPath: string;

  constructor(testResultsPath: string) {
    this.testResultsPath = testResultsPath;
  }

  async processTestResults(): Promise<ProcessedTestReport> {
    const startTime = Date.now();

    // Find test result files
    const testResults = this.findTestResults();

    // Process each test result
    const processedResults = testResults.map(result => this.processTestResult(result));

    // Generate summary
    const summary = this.generateSummary(processedResults);

    // Create execution info
    const execution: TestExecution = {
      uniqueId: this.generateUniqueId(),
      reportNumber: this.getNextReportNumber(),
      timestamp: new Date(),
      developer: process.env.USER || 'Unknown',
      branch: this.getCurrentBranch() || 'main',
      environment: 'local',
      duration: Date.now() - startTime,
    };

    return {
      execution,
      summary,
      results: processedResults,
    };
  }

  private findTestResults(): string[] {
    const results: string[] = [];

    try {
      const files = readdirSync(this.testResultsPath, { recursive: true });

      for (const file of files) {
        if (typeof file === 'string') {
          const fullPath = join(this.testResultsPath, file);

          // Look for test result files
          if (file.endsWith('.json') && file.includes('results')) {
            results.push(fullPath);
          }

          // Look for trace files
          if (file.endsWith('.zip') && file.includes('trace')) {
            results.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn('Could not read test results directory:', error);
    }

    return results;
  }

  private processTestResult(filePath: string): TestResult {
    const fileName = basename(filePath);

    // Try to parse as JSON result file
    try {
      const content = readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      if (data.status) {
        return {
          testName: data.name || fileName,
          status: data.status === 'passed' ? 'passed' :
            data.status === 'failed' ? 'failed' : 'skipped',
          duration: data.duration || 0,
          error: data.error,
          screenshots: data.screenshots || [],
          traceFile: data.traceFile,
        };
      }
    } catch (error) {
      // Not a JSON file, treat as asset
    }

    // Default result for asset files
    return {
      testName: fileName,
      status: 'passed',
      duration: 0,
      screenshots: [],
    };
  }

  private generateSummary(results: TestResult[]): TestSummary {
    const total = results.length;
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const duration = results.reduce((sum, r) => sum + r.duration, 0);

    return {
      total,
      passed,
      failed,
      skipped,
      duration,
    };
  }

  private generateUniqueId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
  }

  private getNextReportNumber(): number {
    // Simple counter - in a real implementation, this would be stored
    return Math.floor(Math.random() * 1000) + 1;
  }

  private getCurrentBranch(): string | null {
    try {
      const { execSync } = require('child_process');
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch (error) {
      return null;
    }
  }
} 