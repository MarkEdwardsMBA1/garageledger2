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