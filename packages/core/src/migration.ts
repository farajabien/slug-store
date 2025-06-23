import { SlugStoreError } from './types.js'

/**
 * Migration function interface
 */
export interface Migration<TFrom = any, TTo = any> {
  version: string
  up: (state: TFrom) => TTo
  down?: (state: TTo) => TFrom
}

/**
 * Migration manager for handling state schema changes
 */
export class StateMigrationManager {
  private migrations: Map<string, Migration> = new Map()
  private currentVersion: string

  constructor(currentVersion: string) {
    this.currentVersion = currentVersion
  }

  /**
   * Add a migration
   */
  addMigration(migration: Migration): void {
    this.migrations.set(migration.version, migration)
  }

  /**
   * Get all migration versions in order
   */
  private getVersions(): string[] {
    return Array.from(this.migrations.keys()).sort((a, b) => {
      // Simple semantic version sorting
      const aParts = a.split('.').map(Number)
      const bParts = b.split('.').map(Number)
      
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] || 0
        const bPart = bParts[i] || 0
        
        if (aPart !== bPart) {
          return aPart - bPart
        }
      }
      
      return 0
    })
  }

  /**
   * Migrate state from one version to another
   */
  migrate(state: any, fromVersion: string, toVersion?: string): any {
    const targetVersion = toVersion || this.currentVersion
    
    if (fromVersion === targetVersion) {
      return state
    }

    const versions = this.getVersions()
    const fromIndex = versions.indexOf(fromVersion)
    const toIndex = versions.indexOf(targetVersion)

    if (fromIndex === -1) {
      throw new SlugStoreError(
        `Unknown source version: ${fromVersion}`,
        'UNKNOWN_VERSION'
      )
    }

    if (toIndex === -1) {
      throw new SlugStoreError(
        `Unknown target version: ${targetVersion}`,
        'UNKNOWN_VERSION'
      )
    }

    let currentState = state
    
    if (fromIndex < toIndex) {
      // Migrate up
      for (let i = fromIndex; i < toIndex; i++) {
        const version = versions[i + 1]
        if (!version) continue
        
        const migration = this.migrations.get(version)
        
        if (!migration) {
          throw new SlugStoreError(
            `Missing migration for version: ${version}`,
            'MISSING_MIGRATION'
          )
        }
        
        try {
          currentState = migration.up(currentState)
        } catch (error) {
          throw new SlugStoreError(
            `Migration to ${version} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'MIGRATION_FAILED',
            error instanceof Error ? error : undefined
          )
        }
      }
    } else {
      // Migrate down
      for (let i = fromIndex; i > toIndex; i--) {
        const version = versions[i]
        if (!version) continue
        
        const migration = this.migrations.get(version)
        
        if (!migration?.down) {
          throw new SlugStoreError(
            `Missing down migration for version: ${version}`,
            'MISSING_DOWN_MIGRATION'
          )
        }
        
        try {
          currentState = migration.down(currentState)
        } catch (error) {
          throw new SlugStoreError(
            `Migration down from ${version} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'DOWN_MIGRATION_FAILED',
            error instanceof Error ? error : undefined
          )
        }
      }
    }

    return currentState
  }

  /**
   * Check if migration is needed
   */
  needsMigration(fromVersion: string, toVersion?: string): boolean {
    const targetVersion = toVersion || this.currentVersion
    return fromVersion !== targetVersion
  }

  /**
   * Get migration path
   */
  getMigrationPath(fromVersion: string, toVersion?: string): string[] {
    const targetVersion = toVersion || this.currentVersion
    
    if (fromVersion === targetVersion) {
      return []
    }

    const versions = this.getVersions()
    const fromIndex = versions.indexOf(fromVersion)
    const toIndex = versions.indexOf(targetVersion)

    if (fromIndex === -1 || toIndex === -1) {
      return []
    }

    if (fromIndex < toIndex) {
      return versions.slice(fromIndex + 1, toIndex + 1)
    } else {
      return versions.slice(toIndex, fromIndex).reverse()
    }
  }
}

/**
 * Create a migration manager with common patterns
 */
export function createMigrationManager(currentVersion: string) {
  return new StateMigrationManager(currentVersion)
}

/**
 * Common migration helpers
 */
export const migrationHelpers = {
  /**
   * Add new field with default value
   */
  addField: <T extends Record<string, any>>(fieldName: string, defaultValue: any) => 
    (state: T): T => ({
      ...state,
      [fieldName]: defaultValue
    }),

  /**
   * Remove field
   */
  removeField: <T extends Record<string, any>>(fieldName: string) => 
    (state: T): Omit<T, typeof fieldName> => {
      const { [fieldName]: removed, ...rest } = state
      return rest
    },

  /**
   * Rename field
   */
  renameField: <T extends Record<string, any>>(oldName: string, newName: string) => 
    (state: T): T => {
      const { [oldName]: value, ...rest } = state
      return {
        ...rest,
        [newName]: value
      } as T
    },

  /**
   * Transform field value
   */
  transformField: <T extends Record<string, any>, K extends keyof T>(
    fieldName: K, 
    transform: (value: T[K]) => any
  ) => 
    (state: T): T => ({
      ...state,
      [fieldName]: transform(state[fieldName])
    })
} 