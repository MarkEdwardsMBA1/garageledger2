// Clean Base Validation Schemas
// Simple, focused validation components for wizard forms

import { z } from 'zod';

/**
 * Date validation - service date must be today or earlier
 */
export const ServiceDateSchema = z.date({
  message: "Service date is required"
}).refine(
  (date) => date <= new Date(),
  { message: "Service date cannot be in the future" }
);

/**
 * Odometer validation - whole numbers only, reasonable limits
 */
export const OdometerSchema = z.string({
  message: "Enter the odometer reading at the time of service before continuing"
}).min(1, "Enter the odometer reading at the time of service before continuing")
  .refine(
    (val) => {
      const cleaned = val.replace(/,/g, '');
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

/**
 * Cost validation - allows decimals, reasonable limits
 */
export const CostSchema = z.string({
  message: "Cost is required"
}).min(1, "Cost is required")
  .refine(
    (val) => {
      return /^\d+(\.\d{1,2})?$/.test(val);
    },
    { message: "Cost must be a valid amount (e.g., 25.99)" }
  )
  .refine(
    (val) => parseFloat(val) >= 0,
    { message: "Cost cannot be negative" }
  )
  .refine(
    (val) => parseFloat(val) <= 99999.99,
    { message: "Cost cannot exceed $99,999.99" }
  );

/**
 * Shop name validation - required, reasonable length, clean format
 * Allows: Letters, digits, & . , ' ( ) - / and single spaces
 * Rejects: Emojis, control characters, forbidden symbols, multiple consecutive spaces
 */
export const ShopNameSchema = z.string({
  message: "Shop name is required"
}).min(1, "Shop name is required")
  .transform((val) => {
    // Trim whitespace and normalize multiple spaces to single spaces
    return val.trim().replace(/\s+/g, ' ');
  })
  .refine(
    (val) => val.length >= 2,
    { message: "Shop name must be at least 2 characters" }
  )
  .refine(
    (val) => val.length <= 100,
    { message: "Shop name cannot exceed 100 characters" }
  )
  .refine(
    (val) => /^[A-Za-z0-9&.,'()\-/ ]{2,100}$/.test(val),
    { message: "Shop name contains invalid characters. Use only letters, numbers, and common punctuation (&.,'-()/ )" }
  )
  .refine(
    (val) => val.trim().length >= 2,
    { message: "Shop name cannot be just whitespace" }
  );

/**
 * Vehicle ID validation - required non-empty string (flexible format)
 */
export const VehicleIdSchema = z.string({
  message: "Vehicle ID is required"
}).min(1, "Vehicle ID is required");