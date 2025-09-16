// CalculationService Unit Tests
// Comprehensive test coverage following ValidationService test patterns

import { CalculationService } from '../CalculationService';
import { PartEntryData } from '../../components/forms/parts/PartEntryForm';
import { FluidEntryData } from '../../components/forms/parts/FluidEntryForm';

describe('CalculationService', () => {
  
  describe('calculateFluidTotal', () => {
    it('should calculate correct total for valid inputs', () => {
      expect(CalculationService.calculateFluidTotal('2', '15.50')).toBe(31);
      expect(CalculationService.calculateFluidTotal('1.5', '10')).toBe(15);
      expect(CalculationService.calculateFluidTotal('0.5', '20.99')).toBeCloseTo(10.495, 2);
    });

    it('should handle currency formatted inputs', () => {
      expect(CalculationService.calculateFluidTotal('2', '$15.50')).toBe(31);
      expect(CalculationService.calculateFluidTotal('1', '$9.99')).toBeCloseTo(9.99, 2);
    });

    it('should handle edge cases gracefully', () => {
      expect(CalculationService.calculateFluidTotal('0', '15.50')).toBe(0);
      expect(CalculationService.calculateFluidTotal('2', '0')).toBe(0);
      expect(CalculationService.calculateFluidTotal('', '')).toBe(0);
      expect(CalculationService.calculateFluidTotal('invalid', '15.50')).toBe(0);
      expect(CalculationService.calculateFluidTotal('2', 'invalid')).toBe(0);
    });

    it('should handle negative values by returning 0', () => {
      expect(CalculationService.calculateFluidTotal('-1', '15.50')).toBe(0);
      expect(CalculationService.calculateFluidTotal('2', '-15.50')).toBe(0);
    });

    it('should handle very large numbers', () => {
      expect(CalculationService.calculateFluidTotal('1000', '999.99')).toBeCloseTo(999990, 2);
    });
  });

  describe('calculatePartsTotal', () => {
    const mockParts: PartEntryData[] = [
      { brand: 'Brand A', partNumber: '123', cost: '25.99', quantity: '2' },
      { brand: 'Brand B', partNumber: '456', cost: '10.50', quantity: '1' },
      { brand: 'Brand C', partNumber: '789', cost: '15.00', quantity: '3' },
    ];

    it('should calculate correct total for multiple parts', () => {
      const expected = (25.99 * 2) + (10.50 * 1) + (15.00 * 3); // 51.98 + 10.50 + 45.00 = 107.48
      expect(CalculationService.calculatePartsTotal(mockParts)).toBeCloseTo(107.48, 2);
    });

    it('should handle empty parts array', () => {
      expect(CalculationService.calculatePartsTotal([])).toBe(0);
    });

    it('should handle missing quantity (defaults to 1)', () => {
      const partsWithoutQuantity: PartEntryData[] = [
        { brand: 'Brand A', partNumber: '123', cost: '25.99', quantity: '' },
      ];
      expect(CalculationService.calculatePartsTotal(partsWithoutQuantity)).toBeCloseTo(25.99, 2);
    });

    it('should handle missing cost (defaults to 0)', () => {
      const partsWithoutCost: PartEntryData[] = [
        { brand: 'Brand A', partNumber: '123', cost: '', quantity: '2' },
      ];
      expect(CalculationService.calculatePartsTotal(partsWithoutCost)).toBe(0);
    });

    it('should skip invalid parts without failing', () => {
      const mixedParts: PartEntryData[] = [
        { brand: 'Valid', partNumber: '123', cost: '25.99', quantity: '2' },
        { brand: 'Invalid', partNumber: '456', cost: 'invalid', quantity: '1' },
        { brand: 'Valid', partNumber: '789', cost: '10.00', quantity: '1' },
      ];
      const expected = (25.99 * 2) + (10.00 * 1); // Skip invalid part
      expect(CalculationService.calculatePartsTotal(mixedParts)).toBeCloseTo(61.98, 2);
    });

    it('should handle invalid input gracefully', () => {
      expect(CalculationService.calculatePartsTotal(null as any)).toBe(0);
      expect(CalculationService.calculatePartsTotal(undefined as any)).toBe(0);
    });
  });

  describe('calculateServiceTotal', () => {
    const mockParts: PartEntryData[] = [
      { brand: 'Brand A', partNumber: '123', cost: '25.99', quantity: '1' },
    ];
    
    const mockFluids: FluidEntryData[] = [
      { 
        brand: 'Fluid Brand', 
        quantity: '2', 
        unitCapacity: '1',
        unitCapacityType: 'Quart',
        unitCost: '15.50', 
        totalCost: '31.00'
      },
    ];

    it('should calculate combined parts and fluids total', () => {
      const expected = 25.99 + 31.00;
      expect(CalculationService.calculateServiceTotal(mockParts, mockFluids)).toBeCloseTo(expected, 2);
    });

    it('should handle parts only', () => {
      expect(CalculationService.calculateServiceTotal(mockParts, [])).toBeCloseTo(25.99, 2);
    });

    it('should handle fluids only', () => {
      expect(CalculationService.calculateServiceTotal([], mockFluids)).toBeCloseTo(31.00, 2);
    });

    it('should handle empty inputs', () => {
      expect(CalculationService.calculateServiceTotal([], [])).toBe(0);
      expect(CalculationService.calculateServiceTotal()).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('should format standard amounts correctly', () => {
      expect(CalculationService.formatCurrency(25.99)).toBe('$25.99');
      expect(CalculationService.formatCurrency(100)).toBe('$100.00');
      expect(CalculationService.formatCurrency(0)).toBe('$0.00');
    });

    it('should handle decimal precision', () => {
      expect(CalculationService.formatCurrency(25.996)).toBe('$26.00'); // Rounds up
      expect(CalculationService.formatCurrency(25.994)).toBe('$25.99'); // Rounds down
    });

    it('should handle edge cases', () => {
      expect(CalculationService.formatCurrency(-10)).toBe('$0.00'); // Negative becomes 0
      expect(CalculationService.formatCurrency(Infinity)).toBe('$0.00');
      expect(CalculationService.formatCurrency(NaN)).toBe('$0.00');
    });

    it('should handle large amounts', () => {
      expect(CalculationService.formatCurrency(999999.99)).toBe('$999,999.99');
    });
  });

  describe('parseCurrencyString', () => {
    it('should parse standard currency formats', () => {
      expect(CalculationService.parseCurrencyString('25.99')).toBe(25.99);
      expect(CalculationService.parseCurrencyString('$25.99')).toBe(25.99);
      expect(CalculationService.parseCurrencyString('$1,234.56')).toBe(1234.56);
    });

    it('should handle various input formats', () => {
      expect(CalculationService.parseCurrencyString(' $25.99 ')).toBe(25.99);
      expect(CalculationService.parseCurrencyString('25')).toBe(25);
      expect(CalculationService.parseCurrencyString('25.5')).toBe(25.5);
    });

    it('should handle invalid inputs gracefully', () => {
      expect(CalculationService.parseCurrencyString('')).toBe(0);
      expect(CalculationService.parseCurrencyString('invalid')).toBe(0);
      expect(CalculationService.parseCurrencyString('$')).toBe(0);
    });

    it('should convert negative values to 0', () => {
      expect(CalculationService.parseCurrencyString('-25.99')).toBe(0);
    });

    it('should handle non-string inputs', () => {
      expect(CalculationService.parseCurrencyString(25.99 as any)).toBe(25.99);
      expect(CalculationService.parseCurrencyString(null as any)).toBe(0);
      expect(CalculationService.parseCurrencyString(undefined as any)).toBe(0);
    });
  });

  describe('isValidCurrency', () => {
    it('should validate correct currency strings', () => {
      expect(CalculationService.isValidCurrency('25.99')).toBe(true);
      expect(CalculationService.isValidCurrency('$25.99')).toBe(true);
      expect(CalculationService.isValidCurrency('0')).toBe(true);
      expect(CalculationService.isValidCurrency('1234.56')).toBe(true);
    });

    it('should reject invalid currency strings', () => {
      expect(CalculationService.isValidCurrency('')).toBe(false);
      expect(CalculationService.isValidCurrency('invalid')).toBe(false);
      expect(CalculationService.isValidCurrency('-25.99')).toBe(false);
      expect(CalculationService.isValidCurrency(null as any)).toBe(false);
      expect(CalculationService.isValidCurrency(undefined as any)).toBe(false);
    });
  });

  describe('sanitizeCurrencyInput', () => {
    it('should preserve valid currency characters', () => {
      expect(CalculationService.sanitizeCurrencyInput('25.99')).toBe('25.99');
      expect(CalculationService.sanitizeCurrencyInput('$25.99')).toBe('$25.99');
    });

    it('should remove invalid characters', () => {
      expect(CalculationService.sanitizeCurrencyInput('25abc.99')).toBe('25.99');
      expect(CalculationService.sanitizeCurrencyInput('$25.99!')).toBe('$25.99');
    });

    it('should handle edge cases', () => {
      expect(CalculationService.sanitizeCurrencyInput('')).toBe('0.00');
      expect(CalculationService.sanitizeCurrencyInput(null as any)).toBe('0.00');
      expect(CalculationService.sanitizeCurrencyInput(undefined as any)).toBe('0.00');
    });
  });

  describe('calculateCostBreakdown', () => {
    const mockParts: PartEntryData[] = [
      { brand: 'Brand A', partNumber: '123', cost: '30.00', quantity: '1' },
    ];
    
    const mockFluids: FluidEntryData[] = [
      { 
        brand: 'Fluid Brand', 
        quantity: '2', 
        unitCapacity: '1',
        unitCapacityType: 'Quart',
        unitCost: '10.00', 
        totalCost: '20.00'
      },
    ];

    it('should calculate correct breakdown', () => {
      const breakdown = CalculationService.calculateCostBreakdown(mockParts, mockFluids);
      
      expect(breakdown.partsTotal).toBe(30.00);
      expect(breakdown.fluidsTotal).toBe(20.00);
      expect(breakdown.grandTotal).toBe(50.00);
      expect(breakdown.partsPercentage).toBe(60);
      expect(breakdown.fluidsPercentage).toBe(40);
    });

    it('should handle zero totals', () => {
      const breakdown = CalculationService.calculateCostBreakdown([], []);
      
      expect(breakdown.partsTotal).toBe(0);
      expect(breakdown.fluidsTotal).toBe(0);
      expect(breakdown.grandTotal).toBe(0);
      expect(breakdown.partsPercentage).toBe(0);
      expect(breakdown.fluidsPercentage).toBe(0);
    });

    it('should handle parts only', () => {
      const breakdown = CalculationService.calculateCostBreakdown(mockParts, []);
      
      expect(breakdown.partsTotal).toBe(30.00);
      expect(breakdown.fluidsTotal).toBe(0);
      expect(breakdown.grandTotal).toBe(30.00);
      expect(breakdown.partsPercentage).toBe(100);
      expect(breakdown.fluidsPercentage).toBe(0);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      // Spy on console.warn to test error logging
      jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle errors gracefully', () => {
      // Test that the service handles edge cases without throwing
      expect(() => {
        CalculationService.calculateFluidTotal('invalid', 'invalid');
        CalculationService.calculatePartsTotal(null as any);
        CalculationService.formatCurrency(NaN);
      }).not.toThrow();
    });

    it('should continue operating after errors', () => {
      // First call with invalid input should not break subsequent calls
      expect(CalculationService.calculateFluidTotal('invalid', 'invalid')).toBe(0);
      expect(CalculationService.calculateFluidTotal('2', '15.50')).toBe(31);
    });
  });
});