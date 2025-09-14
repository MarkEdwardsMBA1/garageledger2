// Schema-Driven Validation Service
// Zod-powered validation with single source of truth schemas

import { ZodError, ZodSchema } from 'zod';
import {
  DIYBasicInfoSchema,
  ShopBasicInfoSchema,
  DIYServicesSchema,
  ShopServicesSchema,
  DIYPhotosSchema,
  ShopPhotosSchema,
  DIYReviewSchema,
  ShopNotesSchema,
  CompleteDIYServiceSchema,
  CompleteShopServiceSchema,
  MaintenanceLogSchema,
  PhotosSchema,
  type DIYBasicInfoData,
  type ShopBasicInfoData,
  type DIYServicesData,
  type ShopServicesData,
  type MaintenanceLogData
} from '../schemas';

/**
 * Structured validation result format
 * Enhanced to work seamlessly with Zod validation results
 */
export interface ValidationResult {
  /** Whether the data passes all validation rules */
  isValid: boolean;
  /** Field-specific error messages (null if field is valid) */
  errors: Record<string, string | null>;
  /** Optional warnings that don't prevent submission */
  warnings?: Record<string, string | null>;
  /** Raw Zod result for advanced use cases */
  zodResult?: any;
}

/**
 * Schema-Driven Validation Service
 * 
 * Benefits:
 * - Single source of truth: Same schemas used frontend & backend
 * - Type safety: Zod generates TypeScript types automatically
 * - No validation drift: Schema changes update both sides
 * - Composable: Reuse schema components across forms
 * - Runtime + compile-time validation
 * 
 * Architecture:
 * - Schemas define validation rules once
 * - Service interprets schemas and formats results for UI
 * - UI components consume structured ValidationResult
 * - Backend uses same schemas for data integrity
 */
export class ValidationService {
  
  /**
   * Core schema validation method - handles any Zod schema
   * This is the foundation that all other validation methods use
   */
  private static validateWithSchema<T>(
    schema: ZodSchema<T>, 
    data: unknown
  ): ValidationResult {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return {
        isValid: true,
        errors: {},
        zodResult: result
      };
    }
    
    // Format Zod errors for UI consumption
    const errors = this.formatZodErrors(result.error);
    
    return {
      isValid: false,
      errors,
      zodResult: result
    };
  }
  
  /**
   * Convert Zod validation errors to UI-friendly format
   */
  private static formatZodErrors(zodError: ZodError): Record<string, string | null> {
    const errors: Record<string, string | null> = {};
    
    zodError.issues.forEach(issue => {
      const fieldPath = issue.path.join('.');
      const fieldName = fieldPath || 'general';
      
      // Use the custom error message if provided, otherwise use default
      errors[fieldName] = issue.message;
    });
    
    return errors;
  }
  
  /**
   * Validate DIY Service Basic Information (Step 1)
   * Uses DIYBasicInfoSchema for validation
   */
  static validateDIYBasicInfo(data: unknown): ValidationResult {
    return this.validateWithSchema(DIYBasicInfoSchema, data);
  }
  
  /**
   * Validate Shop Service Basic Information (Step 1)  
   * Uses ShopBasicInfoSchema for validation
   */
  static validateShopBasicInfo(data: unknown): ValidationResult {
    return this.validateWithSchema(ShopBasicInfoSchema, data);
  }
  
  /**
   * Validate DIY Service Services Selection (Step 2)
   * Uses DIYServicesSchema for validation
   */
  static validateDIYServices(data: unknown): ValidationResult {
    return this.validateWithSchema(DIYServicesSchema, data);
  }
  
  /**
   * Validate Shop Service Services Selection (Step 2)
   * Uses ShopServicesSchema for validation
   */
  static validateShopServices(data: unknown): ValidationResult {
    return this.validateWithSchema(ShopServicesSchema, data);
  }
  
  /**
   * Validate DIY Photos Step (Step 3)
   * Uses DIYPhotosSchema for validation
   */
  static validateDIYPhotos(data: unknown): ValidationResult {
    return this.validateWithSchema(DIYPhotosSchema, data);
  }
  
  /**
   * Validate Shop Photos Step (Step 3)
   * Uses ShopPhotosSchema for validation
   */
  static validateShopPhotos(data: unknown): ValidationResult {
    return this.validateWithSchema(ShopPhotosSchema, data);
  }
  
  /**
   * Validate DIY Review Step (Step 4)
   * Uses DIYReviewSchema for validation
   */
  static validateDIYReview(data: unknown): ValidationResult {
    return this.validateWithSchema(DIYReviewSchema, data);
  }
  
  /**
   * Validate Shop Notes Step (Step 4)
   * Uses ShopNotesSchema for validation
   */
  static validateShopNotes(data: unknown): ValidationResult {
    return this.validateWithSchema(ShopNotesSchema, data);
  }
  
  /**
   * Validate photo uploads (shared utility)
   * Uses PhotosSchema for validation
   */
  static validatePhotos(photos: unknown): ValidationResult {
    return this.validateWithSchema(PhotosSchema, photos);
  }
  
  /**
   * Validate complete DIY service (all steps combined)
   * Uses CompleteDIYServiceSchema for validation
   */
  static validateCompleteDIYService(data: unknown): ValidationResult {
    return this.validateWithSchema(CompleteDIYServiceSchema, data);
  }
  
  /**
   * Validate complete Shop service (all steps combined)
   * Uses CompleteShopServiceSchema for validation
   */
  static validateCompleteShopService(data: unknown): ValidationResult {
    return this.validateWithSchema(CompleteShopServiceSchema, data);
  }
  
  /**
   * Validate final maintenance log before database submission
   * Uses MaintenanceLogSchema for validation - this is the ultimate data integrity check
   */
  static validateMaintenanceLog(data: unknown): ValidationResult {
    return this.validateWithSchema(MaintenanceLogSchema, data);
  }
  
  /**
   * Validate complete maintenance log (legacy method for backward compatibility)
   * Combines validation based on service type
   */
  static validateCompleteMaintenanceLog(
    basicInfo: unknown,
    services: unknown,
    photos: unknown = [],
    serviceType: 'diy' | 'shop'
  ): ValidationResult {
    // Construct wizard data object for validation
    const wizardData = serviceType === 'diy' ? {
      basicInfo,
      services,
      photos: { photos },
      review: { totalCost: 0 } // Default for DIY
    } : {
      basicInfo,
      services,
      photos: { photos, receiptPhotos: [] },
      notes: { additionalNotes: '' } // Default for Shop
    };
    
    // Use appropriate complete service validation
    return serviceType === 'diy'
      ? this.validateCompleteDIYService(wizardData)
      : this.validateCompleteShopService(wizardData);
  }
  
  /**
   * Utility: Get user-friendly error message for display
   * Can be extended for custom error message formatting
   */
  static getErrorMessage(fieldName: string, error: string | null): string | null {
    if (!error) return null;
    
    // Custom error message formatting can be added here
    // For example, field-specific formatting or internationalization
    return error;
  }
  
  /**
   * Utility: Check if field has validation error
   */
  static hasError(validationResult: ValidationResult, fieldName: string): boolean {
    return !!validationResult.errors[fieldName];
  }
  
  /**
   * Utility: Get first error message from validation result
   */
  static getFirstError(validationResult: ValidationResult): string | null {
    const errorMessages = Object.values(validationResult.errors);
    const firstError = errorMessages.find(error => error !== null && error !== undefined);
    return firstError || null;
  }
  
  /**
   * Utility: Get all error messages as array
   */
  static getAllErrors(validationResult: ValidationResult): string[] {
    return Object.values(validationResult.errors)
      .filter((error): error is string => error !== null && error !== undefined);
  }
  
  /**
   * Utility: Merge multiple validation results
   * Useful for combining step validations
   */
  static mergeValidationResults(...results: ValidationResult[]): ValidationResult {
    const combinedErrors: Record<string, string | null> = {};
    let isValid = true;
    
    results.forEach(result => {
      Object.assign(combinedErrors, result.errors);
      if (!result.isValid) {
        isValid = false;
      }
    });
    
    return {
      isValid,
      errors: combinedErrors
    };
  }
  
  /**
   * Advanced: Validate with custom schema (for dynamic validation)
   * Allows UI components to validate with any schema
   */
  static validateWithCustomSchema<T>(schema: ZodSchema<T>, data: unknown): ValidationResult {
    return this.validateWithSchema(schema, data);
  }
}

export default ValidationService;