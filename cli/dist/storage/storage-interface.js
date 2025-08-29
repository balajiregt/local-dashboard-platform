"use strict";
/**
 * Storage abstraction interface for Playwright Trace Intelligence Platform
 * Supports multiple backends: GitHub, SharePoint, Azure Files, Google Drive, etc.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageFactory = exports.StorageAdapter = void 0;
/**
 * Abstract storage interface that all backends must implement
 */
class StorageAdapter {
    constructor(config) {
        this.config = config;
    }
    /**
     * Health check for the storage backend
     */
    async healthCheck() {
        const start = Date.now();
        try {
            const connected = await this.testConnection();
            return {
                healthy: connected,
                latency: Date.now() - start,
            };
        }
        catch (error) {
            return {
                healthy: false,
                latency: Date.now() - start,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
exports.StorageAdapter = StorageAdapter;
/**
 * Storage factory to create appropriate storage adapters
 */
class StorageFactory {
    static create(config) {
        switch (config.type) {
            case 'github':
                return new github_storage_adapter_1.GitHubStorageAdapter(config);
            case 'sharepoint':
                return new sharepoint_storage_adapter_1.SharePointStorageAdapter(config);
            case 'azure-files':
                return new azure_files_storage_adapter_1.AzureFilesStorageAdapter(config);
            case 'google-drive':
                return new google_drive_storage_adapter_1.GoogleDriveStorageAdapter(config);
            case 'local-folder':
                return new local_folder_storage_adapter_1.LocalFolderStorageAdapter(config);
            default:
                throw new Error(`Unsupported storage type: ${config.type}`);
        }
    }
    static getSupportedTypes() {
        return ['github', 'sharepoint', 'azure-files', 'google-drive', 'local-folder'];
    }
}
exports.StorageFactory = StorageFactory;
// Import concrete implementations
const github_storage_adapter_1 = require("./github-storage-adapter");
const sharepoint_storage_adapter_1 = require("./sharepoint-storage-adapter");
const azure_files_storage_adapter_1 = require("./azure-files-storage-adapter");
const google_drive_storage_adapter_1 = require("./google-drive-storage-adapter");
const local_folder_storage_adapter_1 = require("./local-folder-storage-adapter");
//# sourceMappingURL=storage-interface.js.map