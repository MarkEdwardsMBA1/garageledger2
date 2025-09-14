// Base Schema Components - Reusable validation building blocks
// Single source of truth for common field validation across the app

import { z } from 'zod';

/**
 * Common field validation schemas that can be composed into larger forms
 */

// Date validation - used in service dates, reminders, etc.
export const DateSchema = z.date({
  message: "Date is required"
}).refine(
  (date) => date <= new Date(),
  { message: "Date cannot be in the future" }
);

// Optional past date (for historical entries)
export const PastDateSchema = z.date({
  message: "Date is required"
}).refine(
  (date) => date <= new Date(),
  { message: "Date cannot be in the future" }
);

// Future date (for reminders, scheduled maintenance)
export const FutureDateSchema = z.date({
  message: "Date is required"
}).refine(
  (date) => date >= new Date(),
  { message: "Date must be in the future" }
);

// Mileage validation - whole numbers only, no decimals
// Simplified for better UX - most users don't need decimal precision for odometer readings
export const MileageSchema = z.string({
  message: "Enter the odometer reading at the time of service before continuing"
}).min(1, "Enter the odometer reading at the time of service before continuing")
  .refine(
    (val) => {
      const cleaned = val.replace(/,/g, '');
      // Check if it's a valid whole number (no decimals)
      return /^\d+$/.test(cleaned);
    },
    { message: "Odometer reading must be a whole number (no decimals)" }
  )
  .refine(
    (val) => {
      const cleaned = val.replace(/,/g, '');
      const num = parseInt(cleaned);
      return num >= 0;
    },
    { message: "Odometer reading cannot be negative" }
  )
  .refine(
    (val) => {
      const cleaned = val.replace(/,/g, '');
      const num = parseInt(cleaned);
      return num <= 2000000;
    },
    { message: "Maximum odometer value is 2,000,000 miles" }
  );

// Numeric mileage (converted from string)
export const NumericMileageSchema = z.number({
  message: "Odometer reading is required"
}).min(0, "Odometer reading cannot be negative")
  .max(2000000, "Maximum odometer value is 2,000,000 miles");

// Cost validation - allows decimals for currency (unlike mileage)  
// Most users need decimal precision for costs ($24.99, $150.50, etc.)
export const CostSchema = z.string({
  message: "Cost is required"
}).min(1, "Cost is required")
  .refine(
    (val) => {
      // Allow decimal numbers for costs, but validate format
      return /^\d+(\.\d{1,2})?$/.test(val);
    },
    { message: "Cost must be a valid amount (e.g., 25.99)" }
  )
  .refine(
    (val) => parseFloat(val) >= 0,
    { message: "Cost cannot be negative" }
  )
  .refine(
    (val) => parseFloat(val) <= 50000,
    { message: "Cost seems unusually high" }
  );

// Optional cost (for DIY where cost might be calculated)
export const OptionalCostSchema = CostSchema.optional();

// Numeric cost (converted from string)  
export const NumericCostSchema = z.number({
  message: "Cost is required"
}).min(0, "Cost cannot be negative")
  .max(50000, "Cost seems unusually high");

// Text fields with length validation
export const ShortTextSchema = z.string()
  .max(100, "Text is too long (maximum 100 characters)");

export const RequiredShortTextSchema = z.string({
  message: "This field is required"
}).min(1, "This field is required")
  .max(100, "Text is too long (maximum 100 characters)");

export const LongTextSchema = z.string()
  .max(1000, "Text is too long (maximum 1000 characters)");

export const RequiredLongTextSchema = z.string({
  message: "This field is required"
}).min(1, "This field is required")
  .max(1000, "Text is too long (maximum 1000 characters)");

// Notes - commonly used optional long text
export const NotesSchema = z.string()
  .max(1000, "Notes are too long (maximum 1000 characters)")
  .optional();

// Required notes
export const RequiredNotesSchema = z.string({
  message: "Notes are required"
}).min(1, "Notes are required")
  .max(1000, "Notes are too long (maximum 1000 characters)");

// Email validation (optional)
export const EmailSchema = z.string()
  .email("Must be a valid email address")
  .optional();

// Phone number validation (optional, flexible format)
export const PhoneSchema = z.string()
  .regex(/^[\+]?[1-9]?[\d\s\-\(\)]{7,15}$/, "Must be a valid phone number")
  .optional();

// Service selection - at least one service must be selected
export const ServiceSelectionSchema = z.array(
  z.object({
    serviceName: z.string(),
    category: z.string(),
    // Additional service properties can be added here
  })
).min(1, "Select at least one service that was performed");

// Photo array validation
export const PhotosSchema = z.array(z.string())
  .max(10, "Maximum 10 photos allowed")
  .optional()
  .default([]);

// Required photo array (for forms that mandate photos)
export const RequiredPhotosSchema = z.array(z.string())
  .min(1, "At least one photo is required")
  .max(10, "Maximum 10 photos allowed");

// VIN validation (optional but formatted when provided)
export const VINSchema = z.string()
  .length(17, "VIN must be exactly 17 characters")
  .regex(/^[A-HJ-NPR-Z0-9]{17}$/, "VIN contains invalid characters")
  .optional();

// Vehicle year validation
export const VehicleYearSchema = z.number({
  message: "Vehicle year is required"
}).min(1900, "Vehicle year seems too old")
  .max(new Date().getFullYear() + 2, "Vehicle year cannot be more than 1 year in the future");

// UUID validation (for internal IDs)
export const UUIDSchema = z.string().uuid("Invalid ID format");

/**
 * Schema transformation utilities
 */

// Convert string to number (for form inputs that come as strings)
export const stringToNumber = (schema: z.ZodNumber) =>
  z.string().pipe(z.coerce.number()).pipe(schema);

// Convert string to date (for form inputs)
export const stringToDate = (schema: z.ZodDate) =>
  z.string().pipe(z.coerce.date()).pipe(schema);

// Transform comma-separated mileage string to number
export const mileageStringToNumber = z.string()
  .transform((val) => parseInt(val.replace(/,/g, '')))
  .pipe(NumericMileageSchema);

// Transform cost string to number
export const costStringToNumber = z.string()
  .transform((val) => parseFloat(val))
  .pipe(NumericCostSchema);

/**
 * Common validation combinations
 */

// Basic vehicle info (make, model, year)
export const VehicleBasicsSchema = z.object({
  make: RequiredShortTextSchema,
  model: RequiredShortTextSchema,
  year: VehicleYearSchema,
  vin: VINSchema
});

// Contact information (shop details, etc.)
export const ContactInfoSchema = z.object({
  name: RequiredShortTextSchema,
  address: ShortTextSchema.optional(),
  phone: PhoneSchema,
  email: EmailSchema
});

export default {
  // Date schemas
  DateSchema,
  PastDateSchema,
  FutureDateSchema,
  
  // Mileage schemas  
  MileageSchema,
  NumericMileageSchema,
  mileageStringToNumber,
  
  // Cost schemas
  CostSchema,
  OptionalCostSchema,
  NumericCostSchema,
  costStringToNumber,
  
  // Text schemas
  ShortTextSchema,
  RequiredShortTextSchema,
  LongTextSchema,
  RequiredLongTextSchema,
  NotesSchema,
  RequiredNotesSchema,
  
  // Contact schemas
  EmailSchema,
  PhoneSchema,
  
  // Service schemas
  ServiceSelectionSchema,
  PhotosSchema,
  RequiredPhotosSchema,
  
  // Vehicle schemas
  VINSchema,
  VehicleYearSchema,
  VehicleBasicsSchema,
  
  // Utility schemas
  UUIDSchema,
  ContactInfoSchema,
  
  // Transformation utilities
  stringToNumber,
  stringToDate
};