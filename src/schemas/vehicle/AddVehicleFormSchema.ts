// Add Vehicle Form Validation Schema
// Comprehensive Zod validation for vehicle form inputs with dirty state detection

import { z } from 'zod';
import {
  RequiredShortTextSchema,
  ShortTextSchema,
  VehicleYearSchema,
  VINSchema,
  MileageSchema,
  NotesSchema
} from '../base/index';

/**
 * Vehicle Form Schema - matches VehicleFormData interface
 * Provides comprehensive validation and dirty state detection
 */
export const AddVehicleFormSchema = z.object({
  // Required fields
  make: RequiredShortTextSchema
    .refine(
      (val) => val.trim().length >= 2,
      { message: "Vehicle make must be at least 2 characters" }
    )
    .refine(
      (val) => /^[A-Za-z0-9\s\-&.,'/()]+$/.test(val.trim()),
      { message: "Vehicle make contains invalid characters" }
    ),

  model: RequiredShortTextSchema
    .refine(
      (val) => val.trim().length >= 1,
      { message: "Vehicle model is required" }
    )
    .refine(
      (val) => /^[A-Za-z0-9\s\-&.,'/()]+$/.test(val.trim()),
      { message: "Vehicle model contains invalid characters" }
    ),

  year: z.string({
    message: "Vehicle year is required"
  }).min(1, "Vehicle year is required")
    .refine(
      (val) => /^\d{4}$/.test(val),
      { message: "Year must be a 4-digit number" }
    )
    .refine(
      (val) => {
        const yearNum = parseInt(val);
        const currentYear = new Date().getFullYear();
        return yearNum >= 1900 && yearNum <= currentYear + 2;
      },
      { message: `Year must be between 1900 and ${new Date().getFullYear() + 2}` }
    ),

  // Optional fields - using empty string defaults to match form behavior
  nickname: z.string()
    .default('')
    .refine(
      (val) => !val || val.trim().length >= 2,
      { message: "Nickname must be at least 2 characters if provided" }
    ),

  vin: z.string()
    .default('')
    .refine(
      (val) => !val || val.length === 17,
      { message: "VIN must be exactly 17 characters if provided" }
    )
    .refine(
      (val) => !val || /^[A-HJ-NPR-Z0-9]{17}$/.test(val),
      { message: "VIN contains invalid characters (I, O, Q not allowed)" }
    ),

  mileage: z.string()
    .default('')
    .refine(
      (val) => !val || /^\d{1,7}$/.test(val.replace(/,/g, '')),
      { message: "Mileage must be a whole number (no decimals)" }
    )
    .refine(
      (val) => {
        if (!val) return true;
        const cleaned = val.replace(/,/g, '');
        const num = parseInt(cleaned);
        return num >= 0 && num <= 2000000;
      },
      { message: "Mileage must be between 0 and 2,000,000 miles" }
    ),

  notes: z.string().default(''),

  photoUri: z.string().default('')
});

/**
 * Type inference for the validated form data
 */
export type ValidatedVehicleFormData = z.infer<typeof AddVehicleFormSchema>;

/**
 * Initial/empty form state for comparison
 */
export const EMPTY_VEHICLE_FORM: ValidatedVehicleFormData = {
  make: '',
  model: '',
  year: '',
  nickname: '',
  vin: '',
  mileage: '',
  notes: '',
  photoUri: ''
};

/**
 * Check if form has meaningful user input (dirty state detection)
 * Uses Zod schema validation to determine if user has entered meaningful data
 */
export const isVehicleFormDirty = (formData: ValidatedVehicleFormData): boolean => {
  // Check each field for meaningful content (not just empty strings or whitespace)
  const hasContent = (value: string | undefined): boolean => {
    return Boolean(value && value.trim().length > 0);
  };

  return (
    hasContent(formData.make) ||
    hasContent(formData.model) ||
    hasContent(formData.year) ||
    hasContent(formData.nickname) ||
    hasContent(formData.vin) ||
    hasContent(formData.mileage) ||
    hasContent(formData.notes) ||
    hasContent(formData.photoUri)
  );
};

/**
 * Validate individual field for real-time feedback
 */
export const validateVehicleField = (field: keyof ValidatedVehicleFormData, value: string) => {
  try {
    // Don't validate empty values for optional fields to avoid premature errors
    if (!value || value.trim() === '') {
      // Only validate required fields when empty
      if (field === 'make' || field === 'model' || field === 'year') {
        return `${field} is required`;
      }
      return null; // Allow empty optional fields
    }

    const fieldSchema = AddVehicleFormSchema.shape[field];
    if (!fieldSchema) {
      console.warn(`No schema found for field: ${field}`);
      return null;
    }

    fieldSchema.parse(value);
    return null; // No error
  } catch (error) {
    console.log(`Validation error for field ${field}:`, error);
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Invalid input';
    }
    return 'Invalid input';
  }
};

/**
 * Validate entire form and return all errors
 */
export const validateVehicleForm = (formData: ValidatedVehicleFormData) => {
  try {
    AddVehicleFormSchema.parse(formData);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      return { isValid: false, errors: fieldErrors };
    }
    return { isValid: false, errors: { form: 'Validation failed' } };
  }
};

export default AddVehicleFormSchema;