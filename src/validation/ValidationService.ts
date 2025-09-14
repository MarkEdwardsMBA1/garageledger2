// Clean Validation Service
// Simple schema-driven validation with clear error formatting

import { ZodError, ZodSchema } from 'zod';
import { ShopStep1Schema, DIYStep1Schema } from './stepSchemas';

/**
 * Simple validation result format
 */
export interface ValidationResult {
  /** Whether the data passes validation */
  isValid: boolean;
  /** Array of error messages (empty if valid) */
  errors: string[];
}

/**
 * Clean ValidationService - converts Zod validation to wizard format
 */
export class ValidationService {
  
  /**
   * Core validation method - handles any Zod schema
   */
  private static validateWithSchema<T>(
    schema: ZodSchema<T>, 
    data: unknown
  ): ValidationResult {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return {
        isValid: true,
        errors: []
      };
    }
    
    // Convert Zod errors to simple string array
    const errors = result.error.issues.map(issue => issue.message);
    
    return {
      isValid: false,
      errors
    };
  }
  
  /**
   * Validate Shop Service Step 1 (Basic Information)
   */
  static validateShopStep1(data: unknown): ValidationResult {
    return this.validateWithSchema(ShopStep1Schema, data);
  }
  
  /**
   * Validate DIY Service Step 1 (Basic Information)
   */
  static validateDIYStep1(data: unknown): ValidationResult {
    return this.validateWithSchema(DIYStep1Schema, data);
  }
}