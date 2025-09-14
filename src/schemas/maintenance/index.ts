// Maintenance Log Schemas - Form validation for service logging
// Composed from base schema components for consistency

import { z } from 'zod';
import {
  DateSchema,
  MileageSchema,
  CostSchema,
  OptionalCostSchema,
  RequiredShortTextSchema,
  ShortTextSchema,
  NotesSchema,
  ServiceSelectionSchema,
  PhotosSchema,
  EmailSchema,
  PhoneSchema,
  ContactInfoSchema,
  UUIDSchema
} from '../base';

/**
 * DIY Service Wizard Schemas
 */

// Step 1: DIY Basic Information
export const DIYBasicInfoSchema = z.object({
  vehicleId: UUIDSchema,
  date: DateSchema,
  mileage: MileageSchema
});

// Step 2: DIY Services Selection  
export const DIYServicesSchema = z.object({
  selectedServices: ServiceSelectionSchema,
  serviceConfigs: z.record(z.string(), z.any()).optional(), // Advanced service configurations
  notes: NotesSchema
});

// Step 3: DIY Photos (optional step)
export const DIYPhotosSchema = z.object({
  photos: PhotosSchema
});

// Step 4: DIY Review/Summary (always valid - it's a read-only review step)
export const DIYReviewSchema = z.object({
  totalCost: z.number().min(0).optional().default(0) // Optional, calculated from parts/fluids, defaults to 0
});

// Complete DIY Service (all steps combined)
export const CompleteDIYServiceSchema = z.object({
  basicInfo: DIYBasicInfoSchema,
  services: DIYServicesSchema, 
  photos: DIYPhotosSchema,
  review: DIYReviewSchema
});

/**
 * Shop Service Wizard Schemas
 */

// Step 1: Shop Basic Information
export const ShopBasicInfoSchema = z.object({
  vehicleId: UUIDSchema,
  date: DateSchema,
  mileage: MileageSchema,
  totalCost: CostSchema,
  shopName: RequiredShortTextSchema,
  shopAddress: ShortTextSchema.optional(),
  shopPhone: PhoneSchema,
  shopEmail: EmailSchema
});

// Step 2: Shop Services Selection
export const ShopServicesSchema = z.object({
  selectedServices: ServiceSelectionSchema,
  notes: NotesSchema
});

// Step 3: Shop Photos & Receipts (optional step)
export const ShopPhotosSchema = z.object({
  photos: PhotosSchema,
  receiptPhotos: PhotosSchema // Separate array for receipt images
});

// Step 4: Shop Notes & Summary
export const ShopNotesSchema = z.object({
  additionalNotes: NotesSchema,
  warranty: ShortTextSchema.optional(),
  nextServiceDate: DateSchema.optional()
});

// Complete Shop Service (all steps combined)
export const CompleteShopServiceSchema = z.object({
  basicInfo: ShopBasicInfoSchema,
  services: ShopServicesSchema,
  photos: ShopPhotosSchema,
  notes: ShopNotesSchema
});

/**
 * Advanced Service Configuration Schemas
 * Used in DIY services for detailed part/fluid tracking
 */

// Part item configuration
export const PartItemSchema = z.object({
  partName: RequiredShortTextSchema,
  partNumber: ShortTextSchema.optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  cost: z.number().min(0, "Cost cannot be negative").optional(),
  notes: ShortTextSchema.optional()
});

// Fluid item configuration
export const FluidItemSchema = z.object({
  fluidType: RequiredShortTextSchema,
  brand: ShortTextSchema.optional(),
  quantity: RequiredShortTextSchema, // e.g., "5 quarts", "1 gallon"
  cost: z.number().min(0, "Cost cannot be negative").optional(),
  notes: ShortTextSchema.optional()
});

// Service configuration (parts + fluids + labor)
export const ServiceConfigurationSchema = z.object({
  parts: z.array(PartItemSchema).default([]),
  fluids: z.array(FluidItemSchema).default([]),
  laborHours: z.number().min(0).optional(),
  laborRate: z.number().min(0).optional(),
  totalServiceCost: z.number().min(0).optional() // Calculated or manual
});

/**
 * Complete Maintenance Log Schema (final database format)
 * This is what gets saved to Firebase after wizard completion
 */
export const MaintenanceLogSchema = z.object({
  // Required fields
  id: UUIDSchema,
  vehicleId: UUIDSchema,
  date: DateSchema,
  mileage: z.number().min(0),
  title: RequiredShortTextSchema,
  services: ServiceSelectionSchema,
  serviceType: z.enum(['diy', 'shop']),
  
  // Optional fields
  totalCost: z.number().min(0).optional(),
  notes: NotesSchema,
  tags: z.array(z.string()).default([]),
  photos: PhotosSchema,
  
  // Shop-specific fields
  shopName: ShortTextSchema.optional(),
  serviceDescription: ShortTextSchema.optional(),
  
  // DIY-specific fields (advanced configurations)
  serviceConfigurations: z.record(z.string(), ServiceConfigurationSchema).optional(),
  
  // Metadata
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  
  // Future fields (for reminders, scheduling)
  nextServiceMileage: z.number().min(0).optional(),
  nextServiceDate: DateSchema.optional(),
  warrantyInfo: ShortTextSchema.optional()
});

/**
 * Schema versioning for future compatibility
 */
export const SCHEMA_VERSION = "1.0.0";

export const VersionedMaintenanceLogSchema = z.object({
  version: z.string().default(SCHEMA_VERSION),
  data: MaintenanceLogSchema
});

/**
 * Type inference from schemas (automatically generated TypeScript types)
 */

// Wizard step types
export type DIYBasicInfoData = z.infer<typeof DIYBasicInfoSchema>;
export type DIYServicesData = z.infer<typeof DIYServicesSchema>;  
export type DIYPhotosData = z.infer<typeof DIYPhotosSchema>;
export type DIYReviewData = z.infer<typeof DIYReviewSchema>;

export type ShopBasicInfoData = z.infer<typeof ShopBasicInfoSchema>;
export type ShopServicesData = z.infer<typeof ShopServicesSchema>;
export type ShopPhotosData = z.infer<typeof ShopPhotosSchema>;
export type ShopNotesData = z.infer<typeof ShopNotesSchema>;

// Complete wizard types
export type CompleteDIYServiceData = z.infer<typeof CompleteDIYServiceSchema>;
export type CompleteShopServiceData = z.infer<typeof CompleteShopServiceSchema>;

// Service configuration types
export type PartItemData = z.infer<typeof PartItemSchema>;
export type FluidItemData = z.infer<typeof FluidItemSchema>;
export type ServiceConfigurationData = z.infer<typeof ServiceConfigurationSchema>;

// Final maintenance log type
export type MaintenanceLogData = z.infer<typeof MaintenanceLogSchema>;
export type VersionedMaintenanceLogData = z.infer<typeof VersionedMaintenanceLogSchema>;

/**
 * Schema registry for organized access
 * Makes it easy to find and import specific schemas
 */
export const MaintenanceSchemas = {
  // DIY Wizard Steps
  DIY: {
    BasicInfo: DIYBasicInfoSchema,
    Services: DIYServicesSchema,
    Photos: DIYPhotosSchema,
    Review: DIYReviewSchema,
    Complete: CompleteDIYServiceSchema
  },
  
  // Shop Wizard Steps
  Shop: {
    BasicInfo: ShopBasicInfoSchema,
    Services: ShopServicesSchema, 
    Photos: ShopPhotosSchema,
    Notes: ShopNotesSchema,
    Complete: CompleteShopServiceSchema
  },
  
  // Service Configurations
  Config: {
    Part: PartItemSchema,
    Fluid: FluidItemSchema,
    Service: ServiceConfigurationSchema
  },
  
  // Final schemas
  MaintenanceLog: MaintenanceLogSchema,
  VersionedMaintenanceLog: VersionedMaintenanceLogSchema
};

export default MaintenanceSchemas;