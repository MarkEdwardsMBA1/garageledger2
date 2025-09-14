// Parts and Fluids Data Models
// TypeScript interfaces for different form types based on spreadsheet analysis

/**
 * Base part entry - used by all parts forms
 */
export interface PartEntry {
  id: string; // Unique identifier for each part entry
  brand: string;
  description: string;
  partNumber: string;
  quantity: number;
  unitCost: number;
  retailer: string;
  subtotal: number; // Calculated: quantity * unitCost
}

/**
 * Base fluid entry - used by general fluids
 */
export interface FluidEntry {
  id: string; // Unique identifier for each fluid entry
  brand: string;
  description: string;
  quantity: number;
  unitCapacity: string; // "Quarts" or "Gallons" - from dropdown
  unitCost: number;
  retailer: string;
  subtotal: number; // Calculated: quantity * unitCost
}

/**
 * Motor Oil specific fluid entry - includes viscosity
 */
export interface MotorOilEntry extends Omit<FluidEntry, 'description'> {
  description: string; // e.g., "Restore & Protect"
  viscosity: string; // e.g., "0W20", "5W30", etc.
}

/**
 * General Parts Form Data - supports multiple parts with "Add More"
 */
export interface GeneralPartsFormData {
  parts: PartEntry[]; // Array of multiple parts
  totalCost: number; // Sum of all part subtotals
}

/**
 * Tailored Parts Form Data - single specialized part
 */
export interface TailoredPartsFormData {
  part: PartEntry; // Single part only
  totalCost: number; // Same as part.subtotal
}

/**
 * Brakes Parts Form Data - specialized for brake components
 * (Could be extended later with brake-specific fields)
 */
export interface BrakesPartsFormData {
  parts: PartEntry[]; // Multiple brake parts (pads, rotors, etc.)
  totalCost: number; // Sum of all brake part subtotals
}

/**
 * General Fluids Form Data - standard fluid entry
 */
export interface GeneralFluidsFormData {
  fluid: FluidEntry; // Single fluid entry
  totalCost: number; // Same as fluid.subtotal
}

/**
 * Motor Oil Fluids Form Data - includes viscosity
 */
export interface MotorOilFluidsFormData {
  fluid: MotorOilEntry; // Motor oil with viscosity
  totalCost: number; // Same as fluid.subtotal
}

/**
 * Complete service entry data - combines parts and fluids
 */
export interface ServiceEntryData {
  serviceId: string; // Reference to selected service
  category: string;
  serviceName: string;
  
  // Parts data (optional)
  partsData?: GeneralPartsFormData | TailoredPartsFormData | BrakesPartsFormData;
  
  // Fluids data (optional)  
  fluidsData?: GeneralFluidsFormData | MotorOilFluidsFormData;
  
  // Calculated totals
  partsSubtotal: number;
  fluidsSubtotal: number;
  serviceTotalCost: number; // partsSubtotal + fluidsSubtotal
}

/**
 * DIY Step 2 Complete Data - all services with parts/fluids
 */
export interface DIYStep2Data {
  services: ServiceEntryData[]; // Array of all selected services
  
  // Receipt-style totals
  totalPartsCost: number;
  totalFluidsCart: number;
  grandTotal: number; // totalPartsCart + totalFluidsCart
}

/**
 * Utility functions for cost calculations
 */
export class CostCalculator {
  
  /**
   * Calculate subtotal for a single part
   */
  static calculatePartSubtotal(quantity: number, unitCost: number): number {
    return Math.round((quantity * unitCost) * 100) / 100; // Round to 2 decimal places
  }
  
  /**
   * Calculate total for multiple parts
   */
  static calculatePartsTotal(parts: PartEntry[]): number {
    return parts.reduce((total, part) => total + part.subtotal, 0);
  }
  
  /**
   * Calculate subtotal for a single fluid
   */
  static calculateFluidSubtotal(quantity: number, unitCost: number): number {
    return Math.round((quantity * unitCost) * 100) / 100; // Round to 2 decimal places
  }
  
  /**
   * Calculate service total (parts + fluids)
   */
  static calculateServiceTotal(
    partsData?: GeneralPartsFormData | TailoredPartsFormData | BrakesPartsFormData,
    fluidsData?: GeneralFluidsFormData | MotorOilFluidsFormData
  ): {
    partsSubtotal: number;
    fluidsSubtotal: number;
    serviceTotalCost: number;
  } {
    const partsSubtotal = partsData?.totalCost || 0;
    const fluidsSubtotal = fluidsData?.totalCost || 0;
    
    return {
      partsSubtotal,
      fluidsSubtotal,
      serviceTotalCost: partsSubtotal + fluidsSubtotal
    };
  }
  
  /**
   * Calculate grand total for all services
   */
  static calculateGrandTotal(services: ServiceEntryData[]): {
    totalPartsCart: number;
    totalFluidsCart: number;
    grandTotal: number;
  } {
    const totalPartsCart = services.reduce((total, service) => total + service.partsSubtotal, 0);
    const totalFluidsCart = services.reduce((total, service) => total + service.fluidsSubtotal, 0);
    
    return {
      totalPartsCart,
      totalFluidsCart,
      grandTotal: totalPartsCart + totalFluidsCart
    };
  }
}

/**
 * Factory functions for creating new entries
 */
export class EntryFactory {
  
  /**
   * Create new part entry with default values
   */
  static createPartEntry(): PartEntry {
    return {
      id: `part-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      brand: '',
      description: '',
      partNumber: '',
      quantity: 1,
      unitCost: 0,
      retailer: '',
      subtotal: 0
    };
  }
  
  /**
   * Create new fluid entry with default values
   */
  static createFluidEntry(): FluidEntry {
    return {
      id: `fluid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      brand: '',
      description: '',
      quantity: 1,
      unitCapacity: 'Quarts', // Default to quarts
      unitCost: 0,
      retailer: '',
      subtotal: 0
    };
  }
  
  /**
   * Create new motor oil entry with default values
   */
  static createMotorOilEntry(): MotorOilEntry {
    return {
      id: `motor-oil-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      brand: '',
      description: '',
      viscosity: '5W30', // Common default
      quantity: 1,
      unitCapacity: 'Quarts', // Default to quarts
      unitCost: 0,
      retailer: '',
      subtotal: 0
    };
  }
}