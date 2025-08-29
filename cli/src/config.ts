import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { homedir } from 'os';
import { CLIConfig } from './types';

export class ConfigManager {
  private globalConfigPath: string;
  private localConfigPath: string;

  constructor() {
    this.globalConfigPath = join(homedir(), '.playwright-reports', 'config.json');
    this.localConfigPath = join(process.cwd(), '.playwright-reports.json');
  }

  async loadConfig(): Promise<CLIConfig | null> {
    // Try local config first, then global
    const configPath = existsSync(this.localConfigPath) ? this.localConfigPath : this.globalConfigPath;
    
    if (!existsSync(configPath)) {
      return null;
    }

    try {
      const content = readFileSync(configPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(`Failed to load config from ${configPath}:`, error);
      return null;
    }
  }

  async saveConfig(config: CLIConfig, global: boolean = false): Promise<void> {
    const configPath = global ? this.globalConfigPath : this.localConfigPath;
    
    // Ensure directory exists
    const configDir = dirname(configPath);
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }

    try {
      writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`Configuration saved to ${configPath}`);
    } catch (error) {
      throw new Error(`Failed to save config: ${error}`);
    }
  }

  async getDeveloperName(): Promise<string> {
    try {
      // Try to get from git config
      const gitName = execSync('git config user.name', { encoding: 'utf8' }).trim();
      if (gitName) {
        return gitName;
      }
    } catch (error) {
      // Git not available or not configured
    }

    // Try to get from environment
    return process.env.USER || process.env.USERNAME || 'Developer';
  }

  async getGitBranch(): Promise<string | undefined> {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      return undefined;
    }
  }

  async getGitRepository(): Promise<string | undefined> {
    try {
      const remote = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
      
      // Extract owner/repo from various URL formats
      const match = remote.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
      if (match) {
        return `${match[1]}/${match[2]}`;
      }
    } catch (error) {
      // Git not available or not configured
    }
    
    return undefined;
  }

  getDefaultConfig(): Partial<CLIConfig> {
    return {
      name: 'Playwright Project',
      localConfig: {
        developer: 'Developer',
        uploadPath: './test-results',
        includeSuccessful: false,
        includeFailures: true,
        autoUpload: false,
      },
      playwright: {
        testDir: './tests',
        traceDir: './test-results',
        tracePaths: [
          'test-results/**/trace.zip',
          'test-results/**/*.png',
          'test-results/**/*.webm',
        ],
        browsers: ['chromium', 'firefox', 'webkit'],
        devices: ['Desktop Chrome', 'iPhone 13', 'iPad'],
        collectTraces: 'retain-on-failure',
        collectScreenshots: 'only-on-failure',
        collectVideos: 'retain-on-failure',
      },
      github: {
        pages: {
          url: '',
          source: 'gh-pages',
        },
      },
    };
  }

  async createDefaultConfig(repository: string, token?: string): Promise<CLIConfig> {
    const defaultConfig = this.getDefaultConfig();
    const [owner, repo] = repository.split('/');
    
    const config: CLIConfig = {
      ...defaultConfig,
      repository,
      github: {
        token,
        pages: {
          url: `https://${owner}.github.io/${repo}`,
          source: 'gh-pages',
        },
      },
      localConfig: {
        ...defaultConfig.localConfig!,
        developer: await this.getDeveloperName(),
      },
    } as CLIConfig;

    return config;
  }

  async validateConfig(config: CLIConfig): Promise<string[]> {
    const errors: string[] = [];

    if (!config.repository) {
      errors.push('Repository is required');
    } else if (!config.repository.includes('/')) {
      errors.push('Repository must be in format "owner/repo"');
    }

    if (!config.localConfig?.developer) {
      errors.push('Developer name is required');
    }

    if (!config.localConfig?.uploadPath) {
      errors.push('Upload path is required');
    }

    return errors;
  }
}

export const configManager = new ConfigManager(); 