import axios, { AxiosInstance } from 'axios';
import { ProcessedTestReport, ReportSummary, GitHubConfig } from '../types';

export class GitHubService {
  private client: AxiosInstance;
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(config.token && { 'Authorization': `token ${config.token}` }),
      },
    });
  }

  async getReportsIndex(): Promise<ReportSummary[]> {
    try {
      const response = await this.client.get(`/repos/${this.config.owner}/${this.config.repo}/contents/reports/index.json`);
      const content = atob(response.data.content);
      const index = JSON.parse(content);
      
      return index.reports.map((report: any) => ({
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
      const response = await this.client.get(
        `/repos/${this.config.owner}/${this.config.repo}/contents/reports/${reportId}/report.json`
      );
      const content = atob(response.data.content);
      const report = JSON.parse(content);
      
      return {
        ...report,
        execution: {
          ...report.execution,
          timestamp: new Date(report.execution.timestamp),
        },
      };
    } catch (error) {
      console.warn(`Failed to fetch report ${reportId}:`, error);
      return null;
    }
  }

  async getAssetUrl(reportId: string, assetPath: string): Promise<string | null> {
    try {
      const response = await this.client.get(
        `/repos/${this.config.owner}/${this.config.repo}/contents/reports/${reportId}/assets/${assetPath}`
      );
      return response.data.download_url;
    } catch (error) {
      console.warn(`Failed to get asset URL for ${assetPath}:`, error);
      return null;
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await this.client.get(`/repos/${this.config.owner}/${this.config.repo}`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  getConfig(): GitHubConfig {
    return this.config;
  }
}

// Singleton service instance
let githubService: GitHubService | null = null;

export function initializeGitHubService(): GitHubService {
  const repoUrl = process.env.REACT_APP_GITHUB_REPO || '';
  const [owner, repo] = repoUrl.split('/');
  
  if (!owner || !repo) {
    throw new Error('GitHub repository not configured. Set REACT_APP_GITHUB_REPO environment variable.');
  }

  const config: GitHubConfig = {
    owner,
    repo,
    token: process.env.REACT_APP_GITHUB_TOKEN,
    apiUrl: 'https://api.github.com',
  };

  githubService = new GitHubService(config);
  return githubService;
}

export function getGitHubService(): GitHubService {
  if (!githubService) {
    return initializeGitHubService();
  }
  return githubService;
} 