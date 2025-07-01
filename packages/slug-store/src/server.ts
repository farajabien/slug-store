import 'server-only';
import { URLPersistence, URLPersistenceOptions } from './persistence/url.js';
import { OfflinePersistence, OfflinePersistenceOptions } from './persistence/offline.js';
import { analyzeDataPatterns, explainAutoConfig } from './auto-config.js';

export interface PersistenceOptions {
  url?: URLPersistenceOptions;
  offline?: OfflinePersistenceOptions;
}

// Define the core options for creating a state
export interface CreateNextStateOptions<T, I> {
  loader: (id: I) => Promise<T>;
  updater: (id: I, data: T) => Promise<any>;
  persistence?: PersistenceOptions;
  autoConfig?: boolean; // Enable auto-configuration based on data patterns
}

// The return type of our factory
export interface NextState<T, I> {
  Provider: any; // Simplified for testing
  use: () => [T, (newState: T) => void, { isLoading: boolean }];
}

export function createNextState<T, I>(options: CreateNextStateOptions<T, I>): NextState<T, I> {
  // Auto Config: Auto-configure persistence based on data patterns
  let persistenceOptions = options.persistence;
  
  if (options.autoConfig !== false) {
    // We'll analyze data patterns when the loader is called
    const originalLoader = options.loader;
    options.loader = async (id: I) => {
      const data = await originalLoader(id);
      
      // Apply auto config if no explicit configuration
      if (!persistenceOptions) {
        const analysis = analyzeDataPatterns(data);
        
        // Auto-generate persistence configuration
        persistenceOptions = {};
        
        if (analysis.shouldPersistInURL) {
          persistenceOptions.url = {
            enabled: true,
            compress: analysis.shouldCompress ? analysis.compressionAlgorithm : false,
            encrypt: analysis.shouldEncrypt
          };
        }
        
        if (analysis.shouldPersistOffline) {
          persistenceOptions.offline = {
            enabled: true,
            storage: 'indexeddb',
            encrypt: analysis.shouldEncrypt,
            ttl: 86400 * 7 // 1 week default
          };
        }
        
        // Show explanation in development
        explainAutoConfig(data);
      }
      
      return data;
    };
  }

  // Create persistence instances
  const urlPersistence = new URLPersistence(persistenceOptions?.url);
  const offlinePersistence = new OfflinePersistence(persistenceOptions?.offline);

  // Simplified Provider for testing
  const Provider = {
    type: 'Provider',
    options,
    urlPersistence,
    offlinePersistence
  };

  // The client-side hook is implemented in client.ts
  const use = () => {
    throw new Error("The 'use' hook can only be used in Client Components.");
  };

  return {
    Provider,
    use,
  };
} 