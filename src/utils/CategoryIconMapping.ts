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
    color: theme.colors.text,            // Standardized text color
    bgColor: theme.colors.backgroundSecondary, // Premium titanium-like tint
    name: 'Brake System',
  },
  'steering-suspension': {
    icon: SuspensionIcon,
    color: theme.colors.text,            // Standardized text color
    bgColor: theme.colors.backgroundSecondary, // Premium titanium-like tint
    name: 'Steering & Suspension',
  },
  'engine-powertrain': {
    icon: EngineIcon,
    color: theme.colors.text,            // Standardized text color
    bgColor: theme.colors.backgroundSecondary, // Premium titanium-like tint
    name: 'Engine & Powertrain',
  },
  'tires-wheels': {
    icon: TireIcon,
    color: theme.colors.text,            // Standardized text color
    bgColor: theme.colors.backgroundSecondary, // Premium titanium-like tint
    name: 'Tires & Wheels',
  },
  'electrical': {
    icon: LightningBoltIcon,
    color: theme.colors.text,            // Standardized text color
    bgColor: theme.colors.backgroundSecondary, // Premium titanium-like tint
    name: 'Electrical',
  },
  'transmission-drivetrain': {
    icon: TransmissionCircleIcon,
    color: theme.colors.text,            // Standardized text color
    bgColor: theme.colors.backgroundSecondary, // Premium titanium-like tint
    name: 'Transmission & Drivetrain',
  },
  'interior-comfort': {
    icon: AirFilterIcon,
    color: theme.colors.text,            // Standardized text color
    bgColor: theme.colors.backgroundSecondary, // Premium titanium-like tint
    name: 'Interior Comfort & Convenience',
  },
  'hvac-climate': {
    icon: ThermometerIcon,
    color: theme.colors.text,            // Standardized text color
    bgColor: theme.colors.backgroundSecondary, // Premium titanium-like tint
    name: 'HVAC & Climate Control',
  },
  'body-exterior': {
    icon: CarDoorIcon,
    color: theme.colors.text,            // Standardized text color
    bgColor: theme.colors.backgroundSecondary, // Premium titanium-like tint
    name: 'Body & Exterior',
  },
  'lighting': {
    icon: LowBeamIcon,
    color: theme.colors.text,            // Standardized text color
    bgColor: theme.colors.backgroundSecondary, // Premium titanium-like tint
    name: 'Lighting',
  },
  'fluids-consumables': {
    icon: OilCanIcon,
    color: theme.colors.text,            // Standardized text color
    bgColor: theme.colors.backgroundSecondary, // Premium titanium-like tint
    name: 'Fluids & Consumables',
  },
  'user-defined': {
    icon: SettingsIcon,              // Use the better gear icon from steering-suspension
    color: theme.colors.text,            // Standardized text color
    bgColor: theme.colors.backgroundSecondary, // Premium titanium-like tint
    name: 'User-Defined (Custom)',
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
        color: theme.colors.text,
        bgColor: theme.colors.backgroundSecondary, // Premium titanium-like tint
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
    'hvac',                  // Comfort
    'exterior',              // Appearance
    'interior',              // Convenience
  ];
  
  return priorityOrder
    .map(key => allData.find(data => data.key === key))
    .filter((data): data is CategoryDisplayData => data !== undefined)
    .concat(allData.filter(data => !priorityOrder.includes(data.key)));
};