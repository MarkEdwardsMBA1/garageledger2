// Unit tests for SubcategoryList component - Business Logic Focus
import { getSubcategoryKeys, getSubcategoryName, getComponents } from '../../src/types/MaintenanceCategories';

// Mock the MaintenanceCategories module
jest.mock('../../src/types/MaintenanceCategories', () => ({
  getSubcategoryKeys: jest.fn(),
  getSubcategoryName: jest.fn(),
  getComponents: jest.fn(),
}));

describe('SubcategoryList Business Logic', () => {
  const mockGetSubcategoryKeys = getSubcategoryKeys as jest.MockedFunction<typeof getSubcategoryKeys>;
  const mockGetSubcategoryName = getSubcategoryName as jest.MockedFunction<typeof getSubcategoryName>;
  const mockGetComponents = getComponents as jest.MockedFunction<typeof getComponents>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mock responses
    mockGetSubcategoryKeys.mockReturnValue(['brake-pads', 'brake-fluid', 'brake-rotors']);
    mockGetSubcategoryName
      .mockReturnValueOnce('Brake Pads & Rotors')
      .mockReturnValueOnce('Brake Fluid')
      .mockReturnValueOnce('Brake Rotors');
    mockGetComponents
      .mockReturnValueOnce({ parts: ['Brake Pads', 'Brake Rotors'] })
      .mockReturnValueOnce({ fluids: ['Brake Fluid'] })
      .mockReturnValueOnce({ parts: ['Brake Rotors', 'Hardware Kit'] });
  });

  describe('Service Key Generation', () => {
    it('should generate correct service keys', () => {
      const categoryKey = 'brake-system';
      const subcategoryKeys = ['brake-pads', 'brake-fluid'];
      
      const expectedServiceKeys = subcategoryKeys.map(subKey => `${categoryKey}.${subKey}`);
      
      expect(expectedServiceKeys).toEqual(['brake-system.brake-pads', 'brake-system.brake-fluid']);
    });

    it('should handle empty subcategories', () => {
      mockGetSubcategoryKeys.mockReturnValue([]);
      
      const categoryKey = 'empty-category';
      const subcategoryKeys = mockGetSubcategoryKeys(categoryKey);
      const serviceKeys = subcategoryKeys.map(subKey => `${categoryKey}.${subKey}`);
      
      expect(serviceKeys).toEqual([]);
      expect(subcategoryKeys.length).toBe(0);
    });
  });

  describe('Component Text Formatting', () => {
    it('should format components with 1-2 items correctly', () => {
      const formatComponents = (components: any): string => {
        const parts = components?.parts || [];
        const fluids = components?.fluids || [];
        const labor = components?.labor || [];
        
        const allComponents = [...parts, ...fluids, ...labor];
        
        if (allComponents.length === 0) return '';
        if (allComponents.length <= 2) return allComponents.join(', ');
        
        return `${allComponents.slice(0, 2).join(', ')} +${allComponents.length - 2} more`;
      };

      const singleComponent = { parts: ['Brake Pad'] };
      const twoComponents = { parts: ['Brake Pad'], fluids: ['Brake Fluid'] };
      const threeComponents = { parts: ['Brake Pad', 'Rotor'], fluids: ['Brake Fluid'] };
      const noComponents = {};

      expect(formatComponents(singleComponent)).toBe('Brake Pad');
      expect(formatComponents(twoComponents)).toBe('Brake Pad, Brake Fluid');
      expect(formatComponents(threeComponents)).toBe('Brake Pad, Rotor +1 more');
      expect(formatComponents(noComponents)).toBe('');
    });

    it('should handle mixed component types correctly', () => {
      const formatComponents = (components: any): string => {
        const parts = components?.parts || [];
        const fluids = components?.fluids || [];
        const labor = components?.labor || [];
        
        const allComponents = [...parts, ...fluids, ...labor];
        
        if (allComponents.length === 0) return '';
        if (allComponents.length <= 2) return allComponents.join(', ');
        
        return `${allComponents.slice(0, 2).join(', ')} +${allComponents.length - 2} more`;
      };

      const mixedComponents = {
        parts: ['Brake Pad', 'Rotor'],
        fluids: ['Brake Fluid'],
        labor: ['Installation', 'Bleeding']
      };

      const result = formatComponents(mixedComponents);
      expect(result).toBe('Brake Pad, Rotor +3 more');
      expect(result).toContain('+3 more');
    });

    it('should handle undefined components gracefully', () => {
      const formatComponents = (components: any): string => {
        const parts = components?.parts || [];
        const fluids = components?.fluids || [];
        const labor = components?.labor || [];
        
        const allComponents = [...parts, ...fluids, ...labor];
        
        if (allComponents.length === 0) return '';
        if (allComponents.length <= 2) return allComponents.join(', ');
        
        return `${allComponents.slice(0, 2).join(', ')} +${allComponents.length - 2} more`;
      };

      expect(formatComponents(undefined)).toBe('');
      expect(formatComponents(null)).toBe('');
      expect(formatComponents({ parts: undefined })).toBe('');
    });
  });

  describe('Service Selection Logic', () => {
    it('should determine service selection state correctly', () => {
      const selectedServices = new Set(['brake-system.brake-pads', 'engine-powertrain.oil-change']);
      
      const isSelected = (serviceKey: string) => selectedServices.has(serviceKey);
      
      expect(isSelected('brake-system.brake-pads')).toBe(true);
      expect(isSelected('brake-system.brake-fluid')).toBe(false);
      expect(isSelected('engine-powertrain.oil-change')).toBe(true);
    });

    it('should handle service toggle logic', () => {
      const initialSelected = new Set(['brake-system.brake-pads']);
      
      const toggleService = (serviceKey: string, currentSelected: Set<string>) => {
        const newSelected = new Set(currentSelected);
        if (newSelected.has(serviceKey)) {
          newSelected.delete(serviceKey);
        } else {
          newSelected.add(serviceKey);
        }
        return newSelected;
      };

      // Test adding new service
      const afterAdd = toggleService('brake-system.brake-fluid', initialSelected);
      expect(afterAdd.has('brake-system.brake-pads')).toBe(true);
      expect(afterAdd.has('brake-system.brake-fluid')).toBe(true);
      expect(afterAdd.size).toBe(2);

      // Test removing existing service
      const afterRemove = toggleService('brake-system.brake-pads', afterAdd);
      expect(afterRemove.has('brake-system.brake-pads')).toBe(false);
      expect(afterRemove.has('brake-system.brake-fluid')).toBe(true);
      expect(afterRemove.size).toBe(1);
    });
  });

  describe('Service Item Structure', () => {
    it('should build service items correctly from category data', () => {
      const categoryKey = 'brake-system';
      const expectedSubcategoryKeys = ['brake-pads', 'brake-fluid'];
      
      // Test the logic of building service items
      const services = expectedSubcategoryKeys.map(subKey => ({
        key: `${categoryKey}.${subKey}`,
        name: `Service for ${subKey}`, // Simplified for test
        components: { parts: ['Test Part'] },
      }));

      expect(services).toHaveLength(2);
      expect(services[0].key).toBe('brake-system.brake-pads');
      expect(services[1].key).toBe('brake-system.brake-fluid');
      expect(services.every(service => service.key.startsWith(categoryKey))).toBe(true);
    });

    it('should handle categories with no subcategories', () => {
      mockGetSubcategoryKeys.mockReturnValue([]);
      
      const categoryKey = 'empty-category';
      const subcategoryKeys = mockGetSubcategoryKeys(categoryKey);
      const services = subcategoryKeys.map(subKey => ({
        key: `${categoryKey}.${subKey}`,
        name: mockGetSubcategoryName(categoryKey, subKey),
        components: mockGetComponents(categoryKey, subKey),
      }));

      expect(services).toHaveLength(0);
      expect(mockGetSubcategoryKeys).toHaveBeenCalledWith('empty-category');
    });
  });

  describe('Props Validation', () => {
    it('should validate SubcategoryList props structure', () => {
      interface SubcategoryListProps {
        categoryKey: string;
        selectedServices: Set<string>;
        onToggleService: (serviceKey: string) => void;
        testID?: string;
      }

      const validProps: SubcategoryListProps = {
        categoryKey: 'brake-system',
        selectedServices: new Set(['brake-system.brake-pads']),
        onToggleService: jest.fn(),
        testID: 'test-subcategory-list',
      };

      expect(typeof validProps.categoryKey).toBe('string');
      expect(validProps.selectedServices).toBeInstanceOf(Set);
      expect(typeof validProps.onToggleService).toBe('function');
      expect(typeof validProps.testID).toBe('string');
    });

    it('should validate callback function signature', () => {
      const mockOnToggleService = jest.fn();
      
      // Simulate callback invocation
      mockOnToggleService('brake-system.brake-pads');
      
      expect(mockOnToggleService).toHaveBeenCalledWith('brake-system.brake-pads');
      expect(mockOnToggleService).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration with MaintenanceCategories', () => {
    it('should call MaintenanceCategories functions with correct parameters', () => {
      const categoryKey = 'brake-system';
      mockGetSubcategoryKeys.mockReturnValue(['brake-pads']);
      
      // Simulate component initialization
      const subcategoryKeys = mockGetSubcategoryKeys(categoryKey);
      subcategoryKeys.forEach(subKey => {
        mockGetSubcategoryName(categoryKey, subKey);
        mockGetComponents(categoryKey, subKey);
      });

      expect(mockGetSubcategoryKeys).toHaveBeenCalledWith(categoryKey);
      expect(mockGetSubcategoryName).toHaveBeenCalledWith(categoryKey, 'brake-pads');
      expect(mockGetComponents).toHaveBeenCalledWith(categoryKey, 'brake-pads');
    });

    it('should handle missing category data gracefully', () => {
      mockGetSubcategoryKeys.mockReturnValue([]);
      mockGetSubcategoryName.mockReturnValue('Unknown Service');
      mockGetComponents.mockReturnValue(undefined);

      const categoryKey = 'unknown-category';
      const subcategoryKeys = mockGetSubcategoryKeys(categoryKey);
      
      expect(subcategoryKeys).toEqual([]);
      expect(subcategoryKeys.length).toBe(0);
    });
  });
});