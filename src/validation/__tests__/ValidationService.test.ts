// ValidationService Tests
// Quick tests to verify clean validation implementation

import { ValidationService } from '../ValidationService';

describe('ValidationService', () => {
  describe('Shop Step 1 Validation', () => {
    
    it('should pass with valid Shop data', () => {
      const validData = {
        vehicleId: 'IfWwLiSHf2C5acnBBs1e', // Use actual vehicle ID format
        date: new Date(),
        mileage: '500',
        totalCost: '500',
        shopName: 'Test Name'
      };
      
      const result = ValidationService.validateShopStep1(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should fail with missing required fields', () => {
      const invalidData = {
        vehicleId: 'IfWwLiSHf2C5acnBBs1e',
        date: new Date(),
        // missing mileage, totalCost, shopName
      };
      
      const result = ValidationService.validateShopStep1(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('odometer'))).toBe(true);
      expect(result.errors.some(error => error.includes('Cost'))).toBe(true);
      expect(result.errors.some(error => error.includes('Shop name'))).toBe(true);
    });
    
    it('should fail with invalid odometer (decimals)', () => {
      const invalidData = {
        vehicleId: 'IfWwLiSHf2C5acnBBs1e',
        date: new Date(),
        mileage: '500.5', // decimal not allowed
        totalCost: '500',
        shopName: 'Test Name'
      };
      
      const result = ValidationService.validateShopStep1(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('whole number'))).toBe(true);
    });
    
    it('should fail with invalid cost format', () => {
      const invalidData = {
        vehicleId: 'IfWwLiSHf2C5acnBBs1e',
        date: new Date(),
        mileage: '500',
        totalCost: '500.999', // too many decimal places
        shopName: 'Test Name'
      };
      
      const result = ValidationService.validateShopStep1(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('valid amount'))).toBe(true);
    });
  });
  
  describe('DIY Step 1 Validation', () => {
    
    it('should pass with valid DIY data', () => {
      const validData = {
        vehicleId: 'IfWwLiSHf2C5acnBBs1e',
        date: new Date(),
        mileage: '500'
      };
      
      const result = ValidationService.validateDIYStep1(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should fail with missing odometer', () => {
      const invalidData = {
        vehicleId: 'IfWwLiSHf2C5acnBBs1e',
        date: new Date()
        // missing mileage
      };
      
      const result = ValidationService.validateDIYStep1(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('odometer'))).toBe(true);
    });
  });
});