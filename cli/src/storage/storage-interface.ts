/**
 * Storage abstraction interface for Playwright Trace Intelligence Platform
 * Supports multiple backends: GitHub, SharePoint, Azure Files, Google Drive, etc.
 */

import { ProcessedTestReport } from '../types';

export interface StorageConfig {
  type: 'github' | 'sharepoint' | 'azure-files' | 'google-drive' | 'local-folder';
  [key: string]: any; // Backend-specific configuration
}

export interface GitHubStorageConfig extends StorageConfig {
  type: 'github';
  owner: string;
  repo: string;
  token: string;
  branch?: string;
}

export interface SharePointStorageConfig extends StorageConfig {
  type: 'sharepoint';
  siteUrl: string;
  clientId: string;
  clientSecret: string;
  tenantId: string;
  libraryName: string;
  folderPath?: string; // e.g., '/PlaywrightReports'
}

export interface AzureFilesStorageConfig extends StorageConfig {
  type: 'azure-files';
  storageAccount: string;
  shareKey: string;
  shareName: string;
  sasToken?: string;
  folderPath?: string;
}

export interface GoogleDriveStorageConfig extends StorageConfig {
  type: 'google-drive';
  serviceAccountKey: string;
  folderId: string;
  credentials?: any;
}

export interface LocalFolderStorageConfig extends StorageConfig {
  type: 'local-folder';
  basePath: string;
  syncCommand?: string; // Optional command to sync to network drive
}

export interface UploadResult {
  reportId: string;
  reportUrl: string;
  dashboardUrl: string;
  uploadedFiles: string[];
  success: boolean;
  error?: string;
  filesUploaded?: number;
}

export interface AssetInfo {
  originalPath: string;
  fileName: string;
  size: number;
  hash: string;
}

/**
 * Abstract storage interface that all backends must implement
 */
export abstract class StorageAdapter {
  protected config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  /**
   * Test connection to the storage backend
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Initialize storage structure (create folders, set permissions, etc.)
   */
  abstract ensureStorageStructure(): Promise<void>;

  /**
   * Upload a complete test report with assets
   */
  abstract uploadReport(
    report: ProcessedTestReport, 
    assetPaths: string[]
  ): Promise<UploadResult>;

  /**
   * Upload individual assets (screenshots, traces, videos)
   */
  abstract uploadAssets(
    reportId: string, 
    assetPaths: string[]
  ): Promise<string[]>;

  /**
   * Update the main reports index
   */
  abstract updateReportsIndex(report: ProcessedTestReport): Promise<void>;

  /**
   * Get URL for viewing a specific report
   */
  abstract getReportUrl(reportId: string): string;

  /**
   * Get URL for the main dashboard
   */
  abstract getDashboardUrl(): string;

  /**
   * List all available reports
   */
  abstract listReports(): Promise<ProcessedTestReport[]>;

  /**
   * Download a specific report
   */
  abstract downloadReport(reportId: string): Promise<ProcessedTestReport | null>;

  /**
   * Delete a report and its assets
   */
  abstract deleteReport(reportId: string): Promise<boolean>;

  /**
   * Get direct download URL for an asset
   */
  abstract getAssetUrl(reportId: string, assetPath: string): Promise<string>;

  /**
   * Health check for the storage backend
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latency?: number;
    error?: string;
  }> {
    const start = Date.now();
    try {
      const connected = await this.testConnection();
      return {
        healthy: connected,
        latency: Date.now() - start,
      };
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Storage factory to create appropriate storage adapters
 */
export class StorageFactory {
  static create(config: StorageConfig): StorageAdapter {
    switch (config.type) {
      case 'github':
        return new GitHubStorageAdapter(config as GitHubStorageConfig);
      case 'sharepoint':
        return new SharePointStorageAdapter(config as SharePointStorageConfig);
      case 'azure-files':
        return new AzureFilesStorageAdapter(config as AzureFilesStorageConfig);
      case 'google-drive':
        return new GoogleDriveStorageAdapter(config as GoogleDriveStorageConfig);
      case 'local-folder':
        return new LocalFolderStorageAdapter(config as LocalFolderStorageConfig);
      default:
        throw new Error(`Unsupported storage type: ${config.type}`);
    }
  }

  static getSupportedTypes(): string[] {
    return ['github', 'sharepoint', 'azure-files', 'google-drive', 'local-folder'];
  }
}

// Import concrete implementations
import { GitHubStorageAdapter } from './github-storage-adapter';
import { SharePointStorageAdapter } from './sharepoint-storage-adapter';
import { AzureFilesStorageAdapter } from './azure-files-storage-adapter';
import { GoogleDriveStorageAdapter } from './google-drive-storage-adapter';
import { LocalFolderStorageAdapter } from './local-folder-storage-adapter'; 