"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configManager = exports.ConfigManager = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const child_process_1 = require("child_process");
const os_1 = require("os");
class ConfigManager {
    constructor() {
        this.globalConfigPath = (0, path_1.join)((0, os_1.homedir)(), '.playwright-reports', 'config.json');
        this.localConfigPath = (0, path_1.join)(process.cwd(), '.playwright-reports.json');
    }
    async loadConfig() {
        // Try local config first, then global
        const configPath = (0, fs_1.existsSync)(this.localConfigPath) ? this.localConfigPath : this.globalConfigPath;
        if (!(0, fs_1.existsSync)(configPath)) {
            return null;
        }
        try {
            const content = (0, fs_1.readFileSync)(configPath, 'utf8');
            return JSON.parse(content);
        }
        catch (error) {
            console.warn(`Failed to load config from ${configPath}:`, error);
            return null;
        }
    }
    async saveConfig(config, global = false) {
        const configPath = global ? this.globalConfigPath : this.localConfigPath;
        // Ensure directory exists
        const configDir = (0, path_1.dirname)(configPath);
        if (!(0, fs_1.existsSync)(configDir)) {
            (0, fs_1.mkdirSync)(configDir, { recursive: true });
        }
        try {
            (0, fs_1.writeFileSync)(configPath, JSON.stringify(config, null, 2));
            console.log(`Configuration saved to ${configPath}`);
        }
        catch (error) {
            throw new Error(`Failed to save config: ${error}`);
        }
    }
    async getDeveloperName() {
        try {
            // Try to get from git config
            const gitName = (0, child_process_1.execSync)('git config user.name', { encoding: 'utf8' }).trim();
            if (gitName) {
                return gitName;
            }
        }
        catch (error) {
            // Git not available or not configured
        }
        // Try to get from environment
        return process.env.USER || process.env.USERNAME || 'Developer';
    }
    async getGitBranch() {
        try {
            return (0, child_process_1.execSync)('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
        }
        catch (error) {
            return undefined;
        }
    }
    async getGitRepository() {
        try {
            const remote = (0, child_process_1.execSync)('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
            // Extract owner/repo from various URL formats
            const match = remote.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
            if (match) {
                return `${match[1]}/${match[2]}`;
            }
        }
        catch (error) {
            // Git not available or not configured
        }
        return undefined;
    }
    getDefaultConfig() {
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
    async createDefaultConfig(repository, token) {
        const defaultConfig = this.getDefaultConfig();
        const [owner, repo] = repository.split('/');
        const config = {
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
                ...defaultConfig.localConfig,
                developer: await this.getDeveloperName(),
            },
        };
        return config;
    }
    async validateConfig(config) {
        const errors = [];
        if (!config.repository) {
            errors.push('Repository is required');
        }
        else if (!config.repository.includes('/')) {
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
exports.ConfigManager = ConfigManager;
exports.configManager = new ConfigManager();
//# sourceMappingURL=config.js.map