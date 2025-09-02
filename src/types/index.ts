// Core TypeScript type definitions for GarageLedger
// Based on phased architecture - starting with MVP models

// ===== PHASE 1: MVP MODELS =====

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  licensePlate?: string;
  color?: string;
  nickname?: string;
  mileage: number;
  notes?: string;
  photoUri?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Selected service for maintenance logging
export interface SelectedService {
  categoryKey: string;
  subcategoryKey: string;
  serviceName: string; // Display name for the service
  cost?: number; // Optional cost per service
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  date: Date;
  mileage: number;
  title: string;
  services: SelectedService[]; // Support multiple services per log entry
  totalCost?: number; // Total cost across all services
  notes?: string;
  tags: string[];
  photos: string[];
  createdAt: Date;
  // Service type for detailed tracking
  serviceType?: 'shop' | 'diy';
  // Shop service specific fields
  shopName?: string;
  serviceDescription?: string;
}

export interface Reminder {
  id: string;
  vehicleId: string;
  type: 'date' | 'mileage';
  dueValue: number;
  description: string;
  isActive: boolean;
  lastNotified?: Date;
}

export interface UserPreferences {
  userId: string;
  language: 'en' | 'es';
  currency: 'USD' | 'MXN' | 'COP' | 'ARS';
  measurements: 'imperial' | 'metric';
  notifications: { 
    language: 'en' | 'es';
    enabled: boolean;
  };
}

// ===== REPOSITORY INTERFACES =====

export interface IBaseRepository<T> {
  create(data: Omit<T, 'id'>): Promise<T>;
  getById(id: string): Promise<T | null>;
  getAll(filters?: any): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// ===== FORM DATA TYPES =====

export interface VehicleFormData {
  make: string;
  model: string;
  year: string;
  vin: string;
  nickname: string;
  mileage: string;
  notes: string;
  photoUri: string;
}

// ===== UTILITY TYPES =====

export type LocalizationConfig = {
  currency: 'USD' | 'MXN' | 'COP' | 'ARS';
  measurements: 'imperial' | 'metric';
  dateFormat: string;
  language: 'en' | 'es';
  region: 'US' | 'MX' | 'CO' | 'AR';
};

export type MaintenanceCategory = {
  key: string;
  nameTranslations: Record<string, string>;
};

// ===== PHASE 2: PROGRAMS FEATURE TYPES =====

export interface MaintenanceProgram {
  id: string;
  userId: string;
  name: string;
  description?: string;
  tasks: ProgramTask[];
  assignedVehicleIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramTask {
  id: string;
  name: string;
  description?: string;
  category: string; // Maintenance category key
  intervalType: 'mileage' | 'time' | 'dual'; // Whichever occurs first
  intervalValue: number; // Miles or time value
  timeIntervalUnit?: 'days' | 'weeks' | 'months' | 'years'; // For when intervalType is 'time' or 'dual'
  timeIntervalValue?: number; // For 'dual' type to store time component
  estimatedCost?: number;
  reminderOffset?: number; // Days before due to remind
  isActive: boolean;
  
  // ===== ADVANCED MODE FIELDS (A2+ Implementation) =====
  // Optional fields for backward compatibility with Basic mode
  categoryKey?: string;      // Full category hierarchy key (e.g., 'brake-system')
  subcategoryKey?: string;   // Specific subcategory key (e.g., 'brake-pads-rotors')
  criticalityLevel?: 'low' | 'medium' | 'high' | 'critical'; // Advanced priority system
  components?: {             // Component breakdown for advanced services
    parts?: string[];
    fluids?: string[];
    labor?: string[];
  };
}

export interface ProgramAssignment {
  id: string;
  programId: string;
  vehicleId: string;
  assignedAt: Date;
  isActive: boolean;
  lastCompletedAt?: Date;
  nextDueDate?: Date;
  nextDueMileage?: number;
}

// ===== PROGRAM CONFLICT MANAGEMENT TYPES =====

export interface VehicleConflict {
  vehicleId: string;
  conflictType: 'none' | 'single-vehicle-program' | 'multi-vehicle-program';
  existingPrograms: MaintenanceProgram[];
  affectedVehicleCount: number; // For multi-vehicle programs
}

// ===== ADVANCED SERVICES CONFIGURATION TYPES =====

export interface BasicServiceConfiguration {
  serviceId: string;
  intervalType: 'mileage' | 'time' | 'dual';
  mileageValue?: number;
  timeValue?: number;
  timeUnit?: 'days' | 'weeks' | 'months' | 'years';
  dualCondition?: 'first' | 'last';
}

export interface AdvancedServiceConfiguration extends BasicServiceConfiguration {
  // Enhanced Advanced Mode fields
  categoryKey: string;
  subcategoryKey: string;
  displayName: string;
  description?: string;
  components?: {
    parts?: string[];
    fluids?: string[];
    labor?: string[];
  };
  criticalityLevel?: 'low' | 'medium' | 'high' | 'critical';
  costEstimate?: number;
  reminderOffset?: number; // Days before due
  isCustomService?: boolean; // User-created vs curated
}

// Union type for service configurations
export type ServiceConfiguration = BasicServiceConfiguration | AdvancedServiceConfiguration;

// Type guard to check if configuration is advanced
export const isAdvancedConfiguration = (config: ServiceConfiguration): config is AdvancedServiceConfiguration => {
  return 'categoryKey' in config && 'subcategoryKey' in config;
};

export interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: VehicleConflict[];
  canProceedDirectly: boolean;
}

export type ConflictResolutionAction = 
  | { type: 'edit-existing'; programId: string }
  | { type: 'replace-program'; programId: string }
  | { type: 'remove-vehicles'; programIds: string[]; vehicleIds: string[] }
  | { type: 'proceed'; };

// ===== LEGACY MAINTENANCE PROGRAM TYPES (User-Only Architecture) =====

export type MaintenanceType = 'PREVENTIVE' | 'MODIFICATION' | 'REPAIR';

export interface UserMaintenanceProgram {
  id: string;
  userId: string;
  vehicleId: string;
  name: string;
  
  // CRITICAL: 100% User-Created (Legal Safety)
  createdBy: 'user';
  source: 'user_manual_entry';
  disclaimer: 'User-created maintenance schedule. User responsible for all intervals.';
  
  // User-Defined Intervals
  intervals: UserDefinedInterval[];
  
  // Legal Protection
  userAcknowledgment: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: 'user';
}

export interface UserDefinedInterval {
  id: string;
  title: string;
  description?: string;
  type: MaintenanceType;
  
  // User-Defined Triggers
  mileageInterval?: number;
  timeInterval?: number; // in months
  
  // User-Defined Details
  estimatedCost?: number;
  notes?: string;
  
  // Legal Safety
  userCreated: true;
  source: 'user_input';
  createdAt: Date;
  updatedAt: Date;
}

// ===== LEGAL COMPLIANCE TYPES =====

export interface LegalAcceptance {
  id: string;
  userId: string;
  acceptanceDate: Date;
  ipAddress: string;
  userAgent: string;
  appVersion: string;
  
  // Document Versions Accepted
  termsVersion: string;
  privacyPolicyVersion: string;
  maintenanceDisclaimerVersion: string;
  
  // Granular Tracking
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
  acceptedMaintenanceDisclaimer: boolean;
  
  // Legal Evidence
  acceptanceMethod: 'checkbox' | 'button' | 'implicit';
  locale: string;
  
  // Updates
  updatedAt: Date;
  previousVersions?: LegalAcceptanceHistory[];
}

export interface LegalAcceptanceHistory {
  version: string;
  acceptanceDate: Date;
  method: string;
}

export interface LegalAcceptanceData {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  maintenanceDisclaimerAccepted: boolean;
  acceptanceTimestamp: Date;
  ipAddress: string;
  userAgent: string;
  appVersion: string;
  locale: string;
}

export interface LegalComplianceStatus {
  isCompliant: boolean;
  requiresTermsAcceptance: boolean;
  requiresPrivacyAcceptance: boolean;
  requiresMaintenanceDisclaimer: boolean;
  currentVersions: {
    terms: string;
    privacy: string;
    maintenance: string;
  };
}

// ===== FUTURE PHASE TYPES (commented for reference) =====

/*
// Phase 2-3: Enhanced models (optional fields for backward compatibility)
export interface EnhancedVehicle extends Vehicle {
  name?: string; // "The Red Wagon"
  photo?: string;
  group?: VehicleGroup;
  tags?: string[];
  isActive?: boolean;
}

export interface EnhancedMaintenanceLog extends MaintenanceLog {
  type?: MaintenanceType;
  performedBy?: ServiceProvider;
  breakdown?: {
    parts: MaintenancePart[];
    fluids: MaintenanceFluid[];
    labor: LaborDetail[];
  };
  receipts?: string[];
  language?: 'en' | 'es';
}
*/