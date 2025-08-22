// Unit tests for CategoryIconMapping utilities
// Tests category-to-icon mapping system for Advanced Programs feature

import {
  categoryIconMap,
  getCategoryIcon,
  getCategoryDisplayData,
  getCategoryStats,
  getCategoryDisplayDataByKey,
  searchCategories,
  getOrderedCategoryData,
  CategoryIconConfig,
  CategoryDisplayData,
} from '../../src/utils/CategoryIconMapping';

// Mock the MaintenanceCategories module
jest.mock('../../src/types/MaintenanceCategories', () => ({
  MAINTENANCE_CATEGORIES: {
    'brake-system': {
      name: 'Brake System',
      subcategories: {
        'brake-pads': { name: 'Brake Pads' },
        'brake-fluid': { name: 'Brake Fluid' },
        'brake-rotors': { name: 'Brake Rotors' },
      },
    },
    'engine-powertrain': {
      name: 'Engine & Powertrain',
      subcategories: {
        'oil-change': { name: 'Oil Change' },
        'spark-plugs': { name: 'Spark Plugs' },
        'coolant': { name: 'Coolant' },
      },
    },
    'tires-wheels': {
      name: 'Tires & Wheels',
      subcategories: {
        'tire-rotation': { name: 'Tire Rotation' },
        'wheel-alignment': { name: 'Wheel Alignment' },
      },
    },
  },
  getCategoryKeys: () => ['brake-system', 'engine-powertrain', 'tires-wheels'],
  getSubcategoryKeys: (categoryKey: string) => {
    const categories: any = {
      'brake-system': ['brake-pads', 'brake-fluid', 'brake-rotors'],
      'engine-powertrain': ['oil-change', 'spark-plugs', 'coolant'],
      'tires-wheels': ['tire-rotation', 'wheel-alignment'],
    };
    return categories[categoryKey] || [];
  },
  getCategoryName: (categoryKey: string) => {
    const names: any = {
      'brake-system': 'Brake System',
      'engine-powertrain': 'Engine & Powertrain',
      'tires-wheels': 'Tires & Wheels',
    };
    return names[categoryKey] || categoryKey;
  },
}));

// Mock the theme
jest.mock('../../src/utils/theme', () => ({
  theme: {
    colors: {
      error: '#dc2626',
      warning: '#ea580c',
      primary: '#1e40af',
      secondary: '#166534',
      accent: '#0284c7',
      info: '#0284c7',
      success: '#166534',
      textSecondary: '#6b7280',
    },
  },
}));

// Mock the icon components
jest.mock('../../src/components/icons', () => ({
  MaintenanceIcon: 'MaintenanceIcon',
  SettingsIcon: 'SettingsIcon',
  ModificationsIcon: 'ModificationsIcon',
  VehicleIcon: 'VehicleIcon',
  ActivityIcon: 'ActivityIcon',
}));

describe('CategoryIconMapping', () => {
  describe('categoryIconMap', () => {
    it('should contain icon configurations for all main categories', () => {
      expect(categoryIconMap['brake-system']).toBeDefined();
      expect(categoryIconMap['engine-powertrain']).toBeDefined();
      expect(categoryIconMap['steering-suspension']).toBeDefined();
      expect(categoryIconMap['tires-wheels']).toBeDefined();
      expect(categoryIconMap['electrical']).toBeDefined();
      expect(categoryIconMap['hvac']).toBeDefined();
      expect(categoryIconMap['exterior']).toBeDefined();
      expect(categoryIconMap['interior']).toBeDefined();
    });

    it('should have proper structure for icon configurations', () => {
      const brakeConfig = categoryIconMap['brake-system'];
      
      expect(brakeConfig).toHaveProperty('icon');
      expect(brakeConfig).toHaveProperty('color');
      expect(brakeConfig).toHaveProperty('bgColor');
      expect(brakeConfig).toHaveProperty('name');
      expect(typeof brakeConfig.name).toBe('string');
      expect(brakeConfig.color).toMatch(/^#[0-9a-fA-F]{6}$/); // Hex color
      expect(brakeConfig.bgColor).toContain('15'); // Alpha transparency suffix
    });

    it('should use safety-critical red for brake system', () => {
      const brakeConfig = categoryIconMap['brake-system'];
      expect(brakeConfig.color).toBe('#dc2626'); // theme.colors.error
      expect(brakeConfig.name).toBe('Brake System');
    });

    it('should use brand blue for engine powertrain', () => {
      const engineConfig = categoryIconMap['engine-powertrain'];
      expect(engineConfig.color).toBe('#1e40af'); // theme.colors.primary
      expect(engineConfig.name).toBe('Engine & Powertrain');
    });
  });

  describe('getCategoryIcon', () => {
    it('should return correct icon configuration for existing category', () => {
      const result = getCategoryIcon('brake-system');
      
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Brake System');
      expect(result?.color).toBe('#dc2626');
    });

    it('should return null for non-existent category', () => {
      const result = getCategoryIcon('non-existent-category');
      expect(result).toBeNull();
    });

    it('should return different configurations for different categories', () => {
      const brakeConfig = getCategoryIcon('brake-system');
      const engineConfig = getCategoryIcon('engine-powertrain');
      
      expect(brakeConfig?.color).not.toBe(engineConfig?.color);
      expect(brakeConfig?.name).not.toBe(engineConfig?.name);
    });
  });

  describe('getCategoryDisplayData', () => {
    it('should return display data for all categories', () => {
      const result = getCategoryDisplayData();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3); // Based on our mock
      
      result.forEach(data => {
        expect(data).toHaveProperty('key');
        expect(data).toHaveProperty('config');
        expect(data).toHaveProperty('totalServices');
        expect(data).toHaveProperty('subcategories');
        expect(Array.isArray(data.subcategories)).toBe(true);
        expect(typeof data.totalServices).toBe('number');
      });
    });

    it('should calculate correct service counts', () => {
      const result = getCategoryDisplayData();
      const brakeData = result.find(d => d.key === 'brake-system');
      
      expect(brakeData?.totalServices).toBe(3); // brake-pads, brake-fluid, brake-rotors
    });

    it('should use fallback icon for categories without explicit mapping', () => {
      const result = getCategoryDisplayData();
      const unmappedCategory = result.find(d => !categoryIconMap[d.key]);
      
      if (unmappedCategory) {
        expect(unmappedCategory.config.icon).toBe('MaintenanceIcon');
      }
    });
  });

  describe('getCategoryStats', () => {
    it('should return correct statistics', () => {
      const result = getCategoryStats();
      
      expect(result).toHaveProperty('totalCategories');
      expect(result).toHaveProperty('totalServices');
      expect(result).toHaveProperty('categoryBreakdown');
      
      expect(result.totalCategories).toBe(3);
      expect(result.totalServices).toBe(8); // 3 + 3 + 2 from our mock
      expect(typeof result.categoryBreakdown).toBe('object');
    });

    it('should have breakdown matching individual category counts', () => {
      const result = getCategoryStats();
      const displayData = getCategoryDisplayData();
      
      displayData.forEach(data => {
        expect(result.categoryBreakdown[data.key]).toBe(data.totalServices);
      });
    });

    it('should sum breakdown to total services', () => {
      const result = getCategoryStats();
      const breakdownSum = Object.values(result.categoryBreakdown)
        .reduce((sum, count) => sum + count, 0);
      
      expect(breakdownSum).toBe(result.totalServices);
    });
  });

  describe('getCategoryDisplayDataByKey', () => {
    it('should return correct data for existing category', () => {
      const result = getCategoryDisplayDataByKey('brake-system');
      
      expect(result).not.toBeNull();
      expect(result?.key).toBe('brake-system');
      expect(result?.totalServices).toBe(3);
    });

    it('should return null for non-existent category', () => {
      const result = getCategoryDisplayDataByKey('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('searchCategories', () => {
    it('should return all categories for empty search', () => {
      const result = searchCategories('');
      const allData = getCategoryDisplayData();
      
      expect(result.length).toBe(allData.length);
    });

    it('should return all categories for whitespace search', () => {
      const result = searchCategories('   ');
      const allData = getCategoryDisplayData();
      
      expect(result.length).toBe(allData.length);
    });

    it('should filter by category name', () => {
      const result = searchCategories('brake');
      
      expect(result.length).toBe(1);
      expect(result[0].key).toBe('brake-system');
    });

    it('should filter by subcategory name', () => {
      const result = searchCategories('oil');
      
      expect(result.length).toBe(1);
      expect(result[0].key).toBe('engine-powertrain');
    });

    it('should be case insensitive', () => {
      const lowerResult = searchCategories('brake');
      const upperResult = searchCategories('BRAKE');
      const mixedResult = searchCategories('BrAkE');
      
      expect(lowerResult.length).toBe(upperResult.length);
      expect(upperResult.length).toBe(mixedResult.length);
    });

    it('should return empty array for no matches', () => {
      const result = searchCategories('nonexistent');
      expect(result.length).toBe(0);
    });
  });

  describe('getOrderedCategoryData', () => {
    it('should return categories in priority order', () => {
      const result = getOrderedCategoryData();
      const allData = getCategoryDisplayData();
      
      expect(result.length).toBe(allData.length);
      
      // Check that safety-critical categories come first
      const brakeIndex = result.findIndex(d => d.key === 'brake-system');
      const engineIndex = result.findIndex(d => d.key === 'engine-powertrain');
      const tiresIndex = result.findIndex(d => d.key === 'tires-wheels');
      
      // Based on our priority order: brake-system, engine-powertrain, tires-wheels
      expect(brakeIndex).toBeLessThan(engineIndex);
      expect(engineIndex).toBeLessThan(tiresIndex);
    });

    it('should include all categories from display data', () => {
      const ordered = getOrderedCategoryData();
      const all = getCategoryDisplayData();
      
      expect(ordered.length).toBe(all.length);
      
      all.forEach(data => {
        const found = ordered.find(d => d.key === data.key);
        expect(found).toBeDefined();
      });
    });

    it('should preserve category data integrity', () => {
      const result = getOrderedCategoryData();
      
      result.forEach(data => {
        expect(data).toHaveProperty('key');
        expect(data).toHaveProperty('config');
        expect(data).toHaveProperty('totalServices');
        expect(data).toHaveProperty('subcategories');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should maintain consistency across all utility functions', () => {
      const displayData = getCategoryDisplayData();
      const stats = getCategoryStats();
      const ordered = getOrderedCategoryData();
      
      // All functions should return same number of categories
      expect(displayData.length).toBe(stats.totalCategories);
      expect(ordered.length).toBe(stats.totalCategories);
      
      // Service counts should be consistent
      const displayTotal = displayData.reduce((sum, d) => sum + d.totalServices, 0);
      expect(displayTotal).toBe(stats.totalServices);
    });

    it('should handle categories with and without icon mappings', () => {
      const displayData = getCategoryDisplayData();
      
      displayData.forEach(data => {
        // Every category should have a valid config
        expect(data.config).toBeDefined();
        expect(data.config.icon).toBeDefined();
        expect(data.config.color).toBeDefined();
        expect(data.config.name).toBeDefined();
        
        // Check if it has explicit mapping or uses fallback
        const explicitMapping = getCategoryIcon(data.key);
        if (explicitMapping) {
          expect(data.config).toEqual(explicitMapping);
        } else {
          // Should use fallback values
          expect(data.config.icon).toBe('MaintenanceIcon');
        }
      });
    });
  });
});