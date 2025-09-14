// Schema Registry - Central access point for all validation schemas
// Single source of truth for form validation across frontend and backend

export * from './base';
export * from './maintenance';

// Re-export commonly used schemas for easy access
export {
  // Base validation components
  DateSchema,
  MileageSchema,
  CostSchema,
  NotesSchema,
  ServiceSelectionSchema,
  PhotosSchema
} from './base';

export {
  // DIY Service schemas
  DIYBasicInfoSchema,
  DIYServicesSchema, 
  DIYPhotosSchema,
  DIYReviewSchema,
  CompleteDIYServiceSchema,
  
  // Shop Service schemas
  ShopBasicInfoSchema,
  ShopServicesSchema,
  ShopPhotosSchema,
  ShopNotesSchema,
  CompleteShopServiceSchema,
  
  // Final maintenance log schema
  MaintenanceLogSchema,
  VersionedMaintenanceLogSchema,
  
  // Type exports
  type DIYBasicInfoData,
  type DIYServicesData,
  type DIYPhotosData,
  type DIYReviewData,
  type ShopBasicInfoData,
  type ShopServicesData,
  type ShopPhotosData,
  type ShopNotesData,
  type MaintenanceLogData,
  
  // Schema registry
  MaintenanceSchemas,
  SCHEMA_VERSION
} from './maintenance';

// Import base schemas for re-export
import BaseSchemas from './base';
import MaintenanceSchemas from './maintenance';

/**
 * Complete schema registry for the entire application
 * Organized by feature area for easy discovery and maintenance
 */
export const AppSchemas = {
  Base: BaseSchemas,
  Maintenance: MaintenanceSchemas,
  
  // Future schema categories can be added here:
  // Vehicle: VehicleSchemas,
  // User: UserSchemas,
  // Reminder: ReminderSchemas,
  // Report: ReportSchemas
};

/**
 * Schema version tracking for future migrations
 */
export const APP_SCHEMA_VERSION = "1.0.0";

export default AppSchemas;