// Category Icon Mapping for Advanced Program Services
// Maps maintenance categories to existing automotive icons with color theming

import { theme } from './theme';
import {
  MaintenanceIcon,
  SettingsIcon,
  ModificationsIcon,
  VehicleIcon,
  ActivityIcon,
  GearIcon,
  EngineIcon,
  DiscBrakeIcon,
  SuspensionIcon,
  TireIcon,
  ShiftIcon,
  AirFilterIcon,
  ThermometerIcon,
  CarDoorIcon,
  LowBeamIcon,
  OilCanIcon,
  LightningBoltIcon,
  MultiGearsIcon,
  TransmissionCircleIcon,
} from '../components/icons';
import { 
  MAINTENANCE_CATEGORIES,
  getCategoryKeys,
  getSubcategoryKeys,
  getCategoryName,
} from '../types/MaintenanceCategories';

export interface CategoryIconConfig {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  bgColor: string;
  name: string;
}

export interface CategoryDisplayData {
  key: string;
  config: CategoryIconConfig;
  totalServices: number;
  subcategories: string[];
}

export interface CategoryStats {
  totalCategories: number;
  totalServices: number;
  categoryBreakdown: { [key: string]: number };
}

/**
 * Category to Icon Mapping using Option 1 approach:
 * Existing professional icons + strategic color coding
 */
export const categoryIconMap: { [key: string]: CategoryIconConfig } = {
  'brake-system': {
    icon: DiscBrakeIcon,
    color: '#111827',                    // Oil Black - clean, professional automotive color
    bgColor: '#f1f5f915',               // Light gray background with alpha
    name: 'Brake System',
  },
  'steering-suspension': {
    icon: SuspensionIcon,
    color: '#111827',                    // Oil Black - clean, professional automotive color
    bgColor: '#f1f5f915',               // Light gray background with alpha
    name: 'Steering & Suspension',
  },
  'engine-powertrain': {
    icon: EngineIcon,
    color: '#111827',                    // Oil Black - clean, professional automotive color
    bgColor: '#f1f5f915',               // Light gray background with alpha
    name: 'Engine & Powertrain',
  },
  'tires-wheels': {
    icon: TireIcon,
    color: '#111827',                    // Oil Black - clean, professional automotive color
    bgColor: '#f1f5f915',               // Light gray background with alpha
    name: 'Tires & Wheels',
  },
  'electrical': {
    icon: LightningBoltIcon,
    color: '#111827',                    // Oil Black - clean, professional automotive color
    bgColor: '#f1f5f915',               // Light gray background with alpha
    name: 'Electrical',
  },
  'transmission-drivetrain': {
    icon: TransmissionCircleIcon,
    color: '#111827',                    // Oil Black - clean, professional automotive color
    bgColor: '#f1f5f915',               // Light gray background with alpha
    name: 'Transmission & Drivetrain',
  },
  'interior-comfort': {
    icon: AirFilterIcon,
    color: '#111827',                    // Oil Black - clean, professional automotive color
    bgColor: '#f1f5f915',               // Light gray background with alpha
    name: 'Interior Comfort & Convenience',
  },
  'hvac-climate': {
    icon: ThermometerIcon,
    color: '#111827',                    // Oil Black - clean, professional automotive color
    bgColor: '#f1f5f915',               // Light gray background with alpha
    name: 'HVAC & Climate Control',
  },
  'body-exterior': {
    icon: CarDoorIcon,
    color: '#111827',                    // Oil Black - clean, professional automotive color
    bgColor: '#f1f5f915',               // Light gray background with alpha
    name: 'Body & Exterior',
  },
  'lighting': {
    icon: LowBeamIcon,
    color: '#111827',                    // Oil Black - clean, professional automotive color
    bgColor: '#f1f5f915',               // Light gray background with alpha
    name: 'Lighting',
  },
  'fluids-consumables': {
    icon: OilCanIcon,
    color: '#111827',                    // Oil Black - clean, professional automotive color
    bgColor: '#f1f5f915',               // Light gray background with alpha
    name: 'Fluids & Consumables',
  },
  'user-defined': {
    icon: SettingsIcon,
    color: '#111827',                    // Oil Black - clean, professional automotive color
    bgColor: '#f1f5f915',               // Light gray background with alpha
    name: 'User-Defined (Custom)',
  },
  'custom-service': {
    icon: SettingsIcon,
    color: '#111827',                    // Oil Black - clean, professional automotive color
    bgColor: '#f1f5f915',               // Light gray background with alpha
    name: 'Custom Service',
  },
  // Legacy key aliases for backward compatibility with tests
  'hvac': {
    icon: ThermometerIcon,
    color: '#111827',                    // Oil Black - clean, professional automotive color
    bgColor: '#f1f5f915',               // Light gray background with alpha
    name: 'HVAC & Climate Control',
  },
  'exterior': {
    icon: CarDoorIcon,
    color: '#111827',                    // Oil Black - clean, professional automotive color
    bgColor: '#f1f5f915',               // Light gray background with alpha
    name: 'Body & Exterior',
  },
  'interior': {
    icon: AirFilterIcon,
    color: '#111827',                    // Oil Black - clean, professional automotive color
    bgColor: '#f1f5f915',               // Light gray background with alpha
    name: 'Interior Comfort & Convenience',
  },
};

/**
 * Get icon configuration for a category
 */
export const getCategoryIcon = (categoryKey: string): CategoryIconConfig | null => {
  return categoryIconMap[categoryKey] || null;
};

/**
 * Get display data for all categories with service counts
 */
export const getCategoryDisplayData = (): CategoryDisplayData[] => {
  const categoryKeys = getCategoryKeys();
  
  return categoryKeys.map(categoryKey => {
    const subcategoryKeys = getSubcategoryKeys(categoryKey);
    const iconConfig = getCategoryIcon(categoryKey);
    
    return {
      key: categoryKey,
      config: iconConfig || {
        icon: SettingsIcon,
        color: '#111827',                    // Oil Black - clean, professional automotive color
        bgColor: '#f1f5f915',               // Light gray background with alpha
        name: getCategoryName(categoryKey),
      },
      totalServices: subcategoryKeys.length,
      subcategories: subcategoryKeys,
    };
  });
};

/**
 * Get statistics about all categories
 */
export const getCategoryStats = (): CategoryStats => {
  const categoryKeys = getCategoryKeys();
  const categoryBreakdown: { [key: string]: number } = {};
  let totalServices = 0;
  
  categoryKeys.forEach(categoryKey => {
    const subcategoryCount = getSubcategoryKeys(categoryKey).length;
    categoryBreakdown[categoryKey] = subcategoryCount;
    totalServices += subcategoryCount;
  });
  
  return {
    totalCategories: categoryKeys.length,
    totalServices,
    categoryBreakdown,
  };
};

/**
 * Get category display data by key
 */
export const getCategoryDisplayDataByKey = (categoryKey: string): CategoryDisplayData | null => {
  const allData = getCategoryDisplayData();
  return allData.find(data => data.key === categoryKey) || null;
};

/**
 * Search categories by name or service
 */
export const searchCategories = (searchTerm: string): CategoryDisplayData[] => {
  if (!searchTerm.trim()) {
    return getCategoryDisplayData();
  }
  
  const allData = getCategoryDisplayData();
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return allData.filter(data => 
    data.config.name.toLowerCase().includes(lowerSearchTerm) ||
    data.subcategories.some(subKey => {
      const category = MAINTENANCE_CATEGORIES[data.key];
      const subcategory = category?.subcategories[subKey];
      return subcategory?.name.toLowerCase().includes(lowerSearchTerm);
    })
  );
};

/**
 * Default category order for display (by importance/frequency)
 */
export const getOrderedCategoryData = (): CategoryDisplayData[] => {
  const allData = getCategoryDisplayData();
  
  // Order by importance: safety-critical, powertrain, comfort, accessories
  const priorityOrder = [
    'brake-system',           // Safety first
    'engine-powertrain',      // Core functionality
    'steering-suspension',    // Handling & safety
    'tires-wheels',          // Contact patch
    'electrical',            // Modern vehicle systems
    'transmission-drivetrain', // Drivetrain
    'hvac-climate',          // Comfort
    'body-exterior',         // Appearance
    'interior-comfort',      // Convenience
    'lighting',              // Visibility
    'fluids-consumables',    // Maintenance supplies
    'custom-service',        // User-defined
  ];
  
  return priorityOrder
    .map(key => allData.find(data => data.key === key))
    .filter((data): data is CategoryDisplayData => data !== undefined)
    .concat(allData.filter(data => !priorityOrder.includes(data.key)));
};