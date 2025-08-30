import { cosmiconfig } from 'cosmiconfig';
import { CLIConfig, StorageConfig } from './types';
import { execSync } from 'child_process';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join, homedir } from 'path';

export interface ConfigManager {
  loadConfig(): Promise<CLIConfig | null>;
  saveConfig(config: CLIConfig): Promise<void>;
  getDeveloperName(): Promise<string>;
  getCurrentBranch(): Promise<string | null>;
}

class ConfigManagerImpl implements ConfigManager {
  private configPath: string;
  private globalConfigPath: string;

  constructor() {
    this.configPath = join(process.cwd(), '.playwright-reports.json');
    this.globalConfigPath = join(homedir(), '.playwright-reports.json');
  }

  async loadConfig(): Promise<CLIConfig | null> {
    try {
      // Try local config first
      if (existsSync(this.configPath)) {
        const config = JSON.parse(readFileSync(this.configPath, 'utf8'));
        return this.validateConfig(config);
      }

      // Try global config
      if (existsSync(this.globalConfigPath)) {
        const config = JSON.parse(readFileSync(this.globalConfigPath, 'utf8'));
        return this.validateConfig(config);
      }

      return null;
    } catch (error) {
      console.warn('Failed to load config:', error);
      return null;
    }
  }

  async saveConfig(config: CLIConfig): Promise<void> {
    try {
      const configData = JSON.stringify(config, null, 2);
      writeFileSync(this.configPath, configData);
    } catch (error) {
      throw new Error(`Failed to save config: ${error}`);
    }
  }

  async getDeveloperName(): Promise<string> {
    try {
      // Try to get from git config
      const name = execSync('git config user.name', { encoding: 'utf8' }).trim();
      if (name) return name;
    } catch (error) {
      // Git config not available
    }

    // Fallback to environment variable or prompt
    return process.env.USER || process.env.USERNAME || 'Unknown Developer';
  }

  async getCurrentBranch(): Promise<string | null> {
    try {
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      return branch || null;
    } catch (error) {
      return null;
    }
  }

  private validateConfig(config: any): CLIConfig | null {
    // Basic validation
    if (!config.name || !config.repository) {
      return null;
    }

    // Ensure storage config exists
    if (!config.storage) {
      config.storage = { type: 'github' };
    }

    return config as CLIConfig;
  }
}

export const configManager = new ConfigManagerImpl(); 