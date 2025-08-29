import { CLIConfig } from './types';
export declare class ConfigManager {
    private globalConfigPath;
    private localConfigPath;
    constructor();
    loadConfig(): Promise<CLIConfig | null>;
    saveConfig(config: CLIConfig, global?: boolean): Promise<void>;
    getDeveloperName(): Promise<string>;
    getGitBranch(): Promise<string | undefined>;
    getGitRepository(): Promise<string | undefined>;
    getDefaultConfig(): Partial<CLIConfig>;
    createDefaultConfig(repository: string, token?: string): Promise<CLIConfig>;
    validateConfig(config: CLIConfig): Promise<string[]>;
}
export declare const configManager: ConfigManager;
//# sourceMappingURL=config.d.ts.map