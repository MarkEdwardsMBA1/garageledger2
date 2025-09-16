// CalculationService - Domain Layer for Financial Calculations
// Follows ValidationService architecture pattern for consistency

import { PartEntryData } from '../components/forms/parts/PartEntryForm';
import { FluidEntryData } from '../components/forms/parts/FluidEntryForm';

/**
 * Centralized calculation service for all financial operations
 * Following established domain layer patterns from ValidationService
 */
export class CalculationService {
  
  /**
   * Calculate total cost for fluid entry (quantity × unit cost)
   * Handles edge cases gracefully with defensive programming
   */
  static calculateFluidTotal(quantity: string, unitCost: string): number {
    try {
      const qty = this.parseCurrencyString(quantity);
      const cost = this.parseCurrencyString(unitCost);
      
      // Defensive validation
      if (qty < 0 || cost < 0) return 0;
      if (!isFinite(qty) || !isFinite(cost)) return 0;
      
      return qty * cost;
    } catch (error) {
      console.warn('[CalculationService] Invalid fluid calculation input:', { quantity, unitCost });
      return 0;
    }
  }

  /**
   * Calculate total cost for multiple parts
   * Aggregates individual part costs with quantities
   */
  static calculatePartsTotal(parts: PartEntryData[]): number {
    try {
      if (!Array.isArray(parts)) return 0;
      
      return parts.reduce((sum, part) => {
        const quantity = this.parseCurrencyString(part.quantity || '1');
        const cost = this.parseCurrencyString(part.cost || '0');
        
        // Skip invalid parts instead of failing entire calculation
        if (!isFinite(quantity) || !isFinite(cost) || quantity < 0 || cost < 0) {
          return sum;
        }
        
        return sum + (quantity * cost);
      }, 0);
    } catch (error) {
      console.warn('[CalculationService] Invalid parts calculation input:', { parts });
      return 0;
    }
  }

  /**
   * Calculate combined total for parts and fluids
   * Used in complex service forms that include both
   */
  static calculateServiceTotal(
    parts: PartEntryData[] = [], 
    fluids: FluidEntryData[] = []
  ): number {
    try {
      const partsTotal = this.calculatePartsTotal(parts);
      const fluidsTotal = fluids.reduce((sum, fluid) => {
        return sum + this.calculateFluidTotal(fluid.quantity || '0', fluid.unitCost || '0');
      }, 0);
      
      return partsTotal + fluidsTotal;
    } catch (error) {
      console.warn('[CalculationService] Invalid service total calculation:', { parts, fluids });
      return 0;
    }
  }

  /**
   * Format currency amount for display
   * Consistent formatting across all financial displays
   */
  static formatCurrency(amount: number, locale: string = 'en-US'): string {
    try {
      if (!isFinite(amount) || amount < 0) return '$0.00';
      
      // Handle very large numbers gracefully
      if (amount > 999999.99) {
        console.warn('[CalculationService] Unusually large amount:', amount);
      }
      
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      console.warn('[CalculationService] Currency formatting error:', { amount, locale });
      return `$${amount.toFixed(2)}`;
    }
  }

  /**
   * Parse currency string to number
   * Handles various input formats: "$12.34", "12.34", "12,34", etc.
   */
  static parseCurrencyString(value: string): number {
    try {
      if (typeof value !== 'string') {
        return parseFloat(String(value)) || 0;
      }
      
      // Remove currency symbols, spaces, and handle commas
      const cleaned = value
        .replace(/[$€£¥₹,\s]/g, '')  // Remove currency symbols and commas
        .replace(/[^\d.-]/g, '');    // Keep only digits, decimal point, minus
      
      const parsed = parseFloat(cleaned);
      return isFinite(parsed) ? Math.max(0, parsed) : 0; // Ensure non-negative
    } catch (error) {
      console.warn('[CalculationService] Currency parsing error:', value);
      return 0;
    }
  }

  /**
   * Validate if string represents valid currency
   * Used for input validation in forms
   */
  static isValidCurrency(value: string): boolean {
    try {
      if (!value || typeof value !== 'string') return false;
      
      // Check if the string contains only valid currency characters
      const cleaned = value.replace(/[$€£¥₹,\s]/g, '');
      if (!/^\d*\.?\d*$/.test(cleaned)) return false;
      
      const parsed = this.parseCurrencyString(value);
      return isFinite(parsed) && parsed >= 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sanitize currency input for forms
   * Removes invalid characters while preserving valid input
   */
  static sanitizeCurrencyInput(input: string): string {
    try {
      if (typeof input !== 'string' || input === '') return '0.00';
      
      // Allow digits, decimal point, and common currency symbols during input
      const sanitized = input.replace(/[^\d.$]/g, '');
      return sanitized || '0.00';
    } catch (error) {
      console.warn('[CalculationService] Currency sanitization error:', input);
      return '0.00';
    }
  }

  /**
   * Calculate percentage breakdown of costs
   * Useful for cost analysis and reporting
   */
  static calculateCostBreakdown(
    parts: PartEntryData[] = [], 
    fluids: FluidEntryData[] = []
  ): { partsTotal: number; fluidsTotal: number; grandTotal: number; partsPercentage: number; fluidsPercentage: number } {
    try {
      const partsTotal = this.calculatePartsTotal(parts);
      const fluidsTotal = fluids.reduce((sum, fluid) => {
        return sum + this.calculateFluidTotal(fluid.quantity || '0', fluid.unitCost || '0');
      }, 0);
      
      const grandTotal = partsTotal + fluidsTotal;
      
      return {
        partsTotal,
        fluidsTotal,
        grandTotal,
        partsPercentage: grandTotal > 0 ? (partsTotal / grandTotal) * 100 : 0,
        fluidsPercentage: grandTotal > 0 ? (fluidsTotal / grandTotal) * 100 : 0,
      };
    } catch (error) {
      console.warn('[CalculationService] Cost breakdown calculation error:', { parts, fluids });
      return {
        partsTotal: 0,
        fluidsTotal: 0,
        grandTotal: 0,
        partsPercentage: 0,
        fluidsPercentage: 0,
      };
    }
  }

  // Future expansion methods for analytics and reporting
  
  /**
   * Calculate cost trends over time (future enhancement)
   * Foundation for analytics dashboard
   */
  static calculateCostTrends(maintenanceLogs: any[]): any[] {
    // TODO: Implement when MaintenanceLog analytics are needed
    console.info('[CalculationService] Cost trends calculation - future enhancement');
    return [];
  }

  /**
   * Calculate budget status and variance (future enhancement)
   * Foundation for budget tracking features
   */
  static calculateBudgetStatus(spent: number, budget: number): any {
    // TODO: Implement when budget tracking is added
    console.info('[CalculationService] Budget status calculation - future enhancement');
    return { spent, budget, variance: budget - spent };
  }
}