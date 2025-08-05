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
  mileage: number;
  notes?: string;
  photoUri?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  date: Date;
  mileage: number;
  title: string;
  category: string; // Stored as key, translated at presentation layer
  cost?: number;
  notes?: string;
  tags: string[];
  photos: string[];
  createdAt: Date;
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

// ===== MAINTENANCE PROGRAM TYPES (User-Only Architecture) =====

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