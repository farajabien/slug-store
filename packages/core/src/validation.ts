import { SlugStoreError } from './types.js'

/**
 * Validation result interface
 */
export interface ValidationResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Schema validation interface
 */
export interface SchemaValidator<T = any> {
  parse: (data: unknown) => T
  safeParse: (data: unknown) => ValidationResult<T>
}

/**
 * Create a state validator that works with Zod or similar schema libraries
 */
export function createStateValidator<T>(schema: SchemaValidator<T>) {
  return {
    /**
     * Validate state before encoding
     */
    validateState: (state: unknown): T => {
      try {
        return schema.parse(state)
      } catch (error) {
        throw new SlugStoreError(
          `State validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'VALIDATION_ERROR'
        )
      }
    },

    /**
     * Safely validate state with detailed error reporting
     */
    safeValidateState: (state: unknown): ValidationResult<T> => {
      try {
        const result = schema.safeParse(state)
        if (result.success) {
          return { success: true, data: result.data }
        } else {
          const errorMessage = 'error' in result && result.error 
            ? (typeof result.error === 'string' ? result.error : 'Validation failed')
            : 'Validation failed'
          return { 
            success: false, 
            error: errorMessage
          }
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown validation error'
        }
      }
    }
  }
}

/**
 * Built-in validators for common patterns
 */
export const validators = {
  /**
   * Basic object validator (no schema required)
   */
  object: createStateValidator({
    parse: (data: unknown) => {
      if (!data || typeof data !== 'object') {
        throw new Error('Expected object')
      }
      return data
    },
    safeParse: (data: unknown) => {
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Expected object' }
      }
      return { success: true, data }
    }
  }),

  /**
   * Array validator
   */
  array: createStateValidator({
    parse: (data: unknown) => {
      if (!Array.isArray(data)) {
        throw new Error('Expected array')
      }
      return data
    },
    safeParse: (data: unknown) => {
      if (!Array.isArray(data)) {
        return { success: false, error: 'Expected array' }
      }
      return { success: true, data }
    }
  })
}

/**
 * Utility type for extracting state type from validator
 */
export type InferState<T extends SchemaValidator> = T extends SchemaValidator<infer U> ? U : never 