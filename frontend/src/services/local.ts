import { ProcessedTestReport, ReportSummary } from '../types';

export class LocalDataService {
  private baseUrl = '/mock-data';

  async getReportsIndex(): Promise<ReportSummary[]> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/index.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      return data.reports.map((report: any) => ({
        ...report,
        timestamp: new Date(report.timestamp),
      }));
    } catch (error) {
      console.warn('Failed to fetch reports index:', error);
      return [];
    }
  }

  async getReport(reportId: string): Promise<ProcessedTestReport | null> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/${reportId}/report.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const report = await response.json();
      
      return {
        ...report,
        execution: {
          ...report.execution,
          timestamp: new Date(report.execution.timestamp),
          startTime: new Date(report.execution.startTime),
          endTime: new Date(report.execution.endTime),
        },
      };
    } catch (error) {
      console.warn(`Failed to fetch report ${reportId}:`, error);
      return null;
    }
  }

  async getAssetUrl(reportId: string, assetPath: string): Promise<string | null> {
    // For local testing, return a placeholder or actual asset path
    return `${this.baseUrl}/reports/${reportId}/assets/${assetPath}`;
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/index.json`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Singleton service instance for local testing
let localDataService: LocalDataService | null = null;

export function getLocalDataService(): LocalDataService {
  if (!localDataService) {
    localDataService = new LocalDataService();
  }
  return localDataService;
} 