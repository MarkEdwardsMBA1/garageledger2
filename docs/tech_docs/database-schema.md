// Optimized Database Schema for GarageLedger

// ===== CORE ENTITIES =====

interface User {
  id: string;
  email: string;
  displayName: string;
  preferences: {
    units: 'metric' | 'imperial';
    currency: string;
    language: 'en' | 'es';
    timezone: string;
  };
  subscription: {
    tier: 'free' | 'pro' | 'expert';
    expiresAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Vehicle {
  id: string;
  userId: string;
  
  // Basic Info
  name?: string; // "The Red Wagon"
  make: string;
  model: string;
  year: number;
  vin?: string;
  
  // Current State
  currentMileage: number;
  photo?: string;
  
  // Organization
  group: VehicleGroup;
  tags: string[]; // User-defined tags for flexible categorization
  
  // Metadata
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum VehicleGroup {
  DAILY_DRIVER = 'daily_driver',
  OFF_ROAD = 'off_road',
  TOWING = 'towing',
  TRACK = 'track',
  RESTORATION = 'restoration',
  CUSTOM = 'custom'
}

// ===== MAINTENANCE SYSTEM =====

interface MaintenanceLog {
  id: string;
  vehicleId: string;
  userId: string;
  
  // When & Where
  date: Date;
  mileage: number;
  
  // What
  title: string; // "Oil Change", "Brake Pad Replacement"
  category: string; // Reference to MaintenanceCategory
  subcategory?: string;
  type: MaintenanceType;
  
  // Who & Cost
  performedBy: ServiceProvider;
  totalCost: number;
  
  // Details (optional for quick entry)
  breakdown?: {
    parts: MaintenancePart[];
    fluids: MaintenanceFluid[];
    labor: LaborDetail[];
  };
  
  // Documentation
  photos: string[];
  receipts: string[];
  notes?: string;
  
  // System fields
  tags: string[];
  isScheduled: boolean; // Was this from a maintenance program?
  sourceReminderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

enum MaintenanceType {
  PREVENTIVE = 'preventive',
  CONDITIONAL = 'conditional',
  MODIFICATION = 'modification',
  REPAIR = 'repair'
}

interface ServiceProvider {
  type: 'user' | 'shop';
  shopName?: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
  };
}

// ===== FLEXIBLE CATEGORIZATION =====

interface MaintenanceCategory {
  id: string;
  name: string;
  parentId?: string;
  type: MaintenanceType[];
  
  // Smart suggestions
  commonParts: string[];
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  
  // Scheduling
  recommendedInterval?: {
    miles?: number;
    months?: number;
    priority: 'critical' | 'important' | 'recommended';
  };
  
  // Localization
  nameTranslations: Record<string, string>; // { en: "Oil Change", es: "Cambio de Aceite" }
  
  isCustom: boolean;
  createdBy?: string; // User ID if custom
}

// ===== DETAILED PARTS & FLUIDS =====

interface MaintenancePart {
  id: string;
  category: string; // "brake-pads", "oil-filter"
  
  // Product Info
  brand?: string;
  partNumber?: string;
  name?: string;
  
  // Purchase Info
  retailer?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  
  // Installation Notes
  notes?: string;
  torqueSpecs?: string;
}

interface MaintenanceFluid {
  id: string;
  fluidType: string; // "motor-oil", "brake-fluid"
  
  // Product Info
  brand?: string;
  productName?: string;
  viscosity?: string; // For oils
  
  // Quantities
  quantityUsed: number;
  totalCapacity?: number;
  unit: 'quarts' | 'liters' | 'gallons';
  
  // Purchase Info
  retailer?: string;
  totalCost: number;
  
  notes?: string;
}

interface LaborDetail {
  id: string;
  description: string;
  hours: number;
  hourlyRate?: number;
  totalCost: number;
}

// ===== MAINTENANCE PROGRAMS & REMINDERS =====

interface MaintenanceProgram {
  id: string;
  userId: string;
  name: string; // "Factory Schedule", "Severe Service"
  type: 'factory' | 'custom';
  
  // Application
  vehicleIds: string[]; // Can apply to multiple vehicles
  vehicleGroups: VehicleGroup[]; // Or entire groups
  
  // Schedule Rules
  scheduleItems: MaintenanceScheduleItem[];
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MaintenanceScheduleItem {
  id: string;
  categoryId: string; // Reference to MaintenanceCategory
  
  // Intervals (whichever comes first)
  intervalMiles?: number;
  intervalMonths?: number;
  
  // Conditions
  conditions?: string[]; // ["severe_service", "towing", "dusty_conditions"]
  
  priority: 'critical' | 'important' | 'recommended';
  estimatedCost?: number;
  estimatedDuration?: number; // minutes
}

interface Reminder {
  id: string;
  userId: string;
  vehicleId: string;
  
  // What
  title: string;
  description: string;
  categoryId: string;
  
  // When
  dueType: 'date' | 'mileage' | 'both';
  dueMileage?: number;
  dueDate?: Date;
  
  // Urgency calculation
  priority: 'overdue' | 'due_soon' | 'upcoming';
  urgencyScore: number; // Calculated field for sorting
  
  // State
  isCompleted: boolean;
  completedLogId?: string;
  isActive: boolean;
  
  // Notifications
  lastNotifiedAt?: Date;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    daysInAdvance: number[];
    milesInAdvance: number[];
  };
  
  // Source
  programId?: string; // If from maintenance program
  createdAt: Date;
  updatedAt: Date;
}

// ===== ANALYTICS & REPORTING =====

interface VehicleAnalytics {
  vehicleId: string;
  period: 'month' | 'quarter' | 'year' | 'lifetime';
  
  // Cost Analysis
  totalSpent: number;
  costByCategory: Record<string, number>;
  costByType: Record<MaintenanceType, number>;
  costTrend: TimeSeriesData[];
  
  // Maintenance Patterns
  maintenanceFrequency: Record<string, number>;
  averageMilesBetweenService: number;
  
  // Efficiency Metrics
  diyVsShopRatio: number;
  onTimeMaintenanceRate: number; // % of scheduled maintenance done on time
  
  // Predictions
  upcomingCosts: {
    next30Days: number;
    next90Days: number;
    next12Months: number;
  };
  
  generatedAt: Date;
}

interface TimeSeriesData {
  date: Date;
  value: number;
  category?: string;
}

// ===== SMART FEATURES =====

interface MaintenanceSuggestion {
  id: string;
  vehicleId: string;
  type: 'overdue' | 'upcoming' | 'pattern_based' | 'seasonal';
  
  categoryId: string;
  title: string;
  description: string;
  reasoning: string; // Why this suggestion was made
  
  estimatedCost: number;
  priority: number; // 1-10 scale
  confidence: number; // ML confidence score
  
  // Timing
  suggestedDate?: Date;
  suggestedMileage?: number;
  
  // User interaction
  isDismissed: boolean;
  isScheduled: boolean;
  userFeedback?: 'helpful' | 'not_helpful' | 'wrong';
  
  createdAt: Date;
  expiresAt: Date;
}

// ===== EXPORT & SHARING =====

interface MaintenanceReport {
  id: string;
  userId: string;
  vehicleIds: string[];
  
  type: 'summary' | 'detailed' | 'cost_analysis' | 'tax_report';
  format: 'pdf' | 'csv' | 'json';
  
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  
  filters: {
    categories?: string[];
    types?: MaintenanceType[];
    minCost?: number;
    maxCost?: number;
  };
  
  // Generated content (cached)
  fileUrl?: string;
  generatedAt?: Date;
  expiresAt?: Date;
  
  isShared: boolean;
  shareToken?: string;
  
  createdAt: Date;
}

// ===== SMART DATA ENTRY HELPERS =====

interface AutocompleteEntry {
  id: string;
  userId: string;
  
  field: 'title' | 'brand' | 'partNumber' | 'shopName';
  value: string;
  category?: string;
  
  frequency: number; // How often user has used this
  lastUsed: Date;
  
  // ML enhancement
  embedding?: number[]; // Vector representation for similarity matching
}

interface SmartTemplate {
  id: string;
  userId: string;
  
  name: string; // "My Typical Oil Change"
  categoryId: string;
  
  // Pre-filled data
  defaultParts: MaintenancePart[];
  defaultFluids: MaintenanceFluid[];
  defaultNotes: string;
  estimatedCost: number;
  
  // Usage tracking
  timesUsed: number;
  lastUsed: Date;
  
  isShared: boolean; // Community templates
  rating?: number;
}

// ===== OPTIMIZED QUERIES =====

// Index strategies for common queries:
// 1. Vehicle maintenance history: vehicleId + date (desc)
// 2. User's reminders: userId + isActive + urgencyScore (desc)
// 3. Cost analysis: userId + vehicleId + date range
// 4. Category analysis: userId + category + date range
// 5. Upcoming maintenance: userId + dueDate/dueMileage

// Compound indexes needed:
// - MaintenanceLog: [userId, vehicleId, date]
// - MaintenanceLog: [userId, category, date]
// - Reminder: [userId, isActive, urgencyScore]
// - Reminder: [vehicleId, isActive, dueDate]
// - MaintenanceLog: [userId, date, totalCost] (for analytics)

export {
  User,
  Vehicle,
  VehicleGroup,
  MaintenanceLog,
  MaintenanceType,
  ServiceProvider,
  MaintenanceCategory,
  MaintenancePart,
  MaintenanceFluid,
  LaborDetail,
  MaintenanceProgram,
  MaintenanceScheduleItem,
  Reminder,
  VehicleAnalytics,
  TimeSeriesData,
  MaintenanceSuggestion,
  MaintenanceReport,
  AutocompleteEntry,
  SmartTemplate
};