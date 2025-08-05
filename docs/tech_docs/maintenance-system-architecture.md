# Maintenance System Technical Architecture
*Version 1.0 - Created: 2025-01-05*

## 🏗️ System Overview

The maintenance logging system extends the existing GarageLedger architecture with three core maintenance types: **Preventive Maintenance**, **Modifications**, and **Repairs**. The system follows the established patterns of security-first Firebase integration, repository abstraction, and progressive UX enhancement.

## 📊 Data Model Architecture

### Core Entities

#### MaintenanceLog (Enhanced from MVP)
```typescript
interface MaintenanceLog {
  id: string;
  userId: string;                    // Security: user data isolation
  vehicleId: string;                 // Links to existing Vehicle entity
  
  // Basic Information (MVP)
  type: MaintenanceType;             // PREVENTIVE | MODIFICATION | REPAIR
  category: MaintenanceCategory;     // Oil Change, Brake Service, etc.
  title: string;                     // User-friendly description
  date: Date;                        // When maintenance was performed
  mileage?: number;                  // Vehicle mileage at time of service
  cost: number;                      // Total cost in user's currency
  currency: string;                  // USD, EUR, MXN, etc.
  notes?: string;                    // Basic text notes
  photoUrls: string[];               // Firebase Storage URLs
  
  // Service Provider (Progressive Enhancement)
  serviceProvider?: ServiceProvider; // Who performed the work
  warrantyInfo?: WarrantyInfo;       // Warranty tracking
  
  // Detailed Tracking (Power User Features)
  parts: MaintenancePart[];          // Detailed parts used
  fluids: MaintenanceFluid[];        // Fluids and specifications
  procedures: MaintenanceProcedure[]; // Step-by-step procedures
  
  // Reminder Integration
  nextDueDate?: Date;                // Next service due date
  nextDueMileage?: number;           // Next service due mileage
  reminderSettings?: ReminderSettings;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  tags: string[];                    // User-defined tags for filtering
}

enum MaintenanceType {
  PREVENTIVE = 'preventive',    // Scheduled maintenance
  MODIFICATION = 'modification', // Aftermarket upgrades
  REPAIR = 'repair'             // Fixes and corrections
}

enum MaintenanceCategory {
  // Preventive
  OIL_CHANGE = 'oil_change',
  AIR_FILTER = 'air_filter', 
  BRAKE_SERVICE = 'brake_service',
  TIRE_ROTATION = 'tire_rotation',
  TRANSMISSION_SERVICE = 'transmission_service',
  
  // Modifications
  PERFORMANCE = 'performance',
  SUSPENSION = 'suspension',
  EXTERIOR = 'exterior',
  INTERIOR = 'interior',
  ELECTRONICS = 'electronics',
  
  // Repairs
  ENGINE_REPAIR = 'engine_repair',
  ELECTRICAL_REPAIR = 'electrical_repair',
  BODY_REPAIR = 'body_repair',
  EMERGENCY_REPAIR = 'emergency_repair',
  
  OTHER = 'other'
}
```

#### MaintenancePart (Power User Feature)
```typescript
interface MaintenancePart {
  id: string;
  name: string;                      // "Mobil 1 Extended Performance Oil Filter"
  partNumber?: string;               // "M1-110A"
  brand?: string;                    // "Mobil 1"
  quantity: number;                  // 1
  unitCost: number;                  // 12.99
  totalCost: number;                 // 12.99
  supplier?: string;                 // "AutoZone", "Amazon"
  warrantyPeriod?: number;           // Months or miles
  specifications?: PartSpecification[]; // Technical specs
}

interface PartSpecification {
  name: string;                      // "Thread Size", "Torque Spec"
  value: string;                     // "M14 x 1.5", "25 ft-lbs"
  unit?: string;                     // "ft-lbs", "mm", "oz"
}
```

#### MaintenanceFluid (Power User Feature)
```typescript
interface MaintenanceFluid {
  id: string;
  name: string;                      // "Mobil 1 Extended Performance 5W-30"
  type: FluidType;                   // OIL, COOLANT, BRAKE_FLUID, etc.
  brand?: string;                    // "Mobil 1"
  viscosity?: string;                // "5W-30"
  capacity: number;                  // 5.0
  unit: string;                      // "quarts", "liters"
  cost: number;                      // 24.99
  specifications?: FluidSpecification[];
}

enum FluidType {
  ENGINE_OIL = 'engine_oil',
  TRANSMISSION_FLUID = 'transmission_fluid',
  BRAKE_FLUID = 'brake_fluid',
  COOLANT = 'coolant',
  POWER_STEERING = 'power_steering',
  DIFFERENTIAL_OIL = 'differential_oil',
  WINDSHIELD_WASHER = 'windshield_washer'
}
```

#### MaintenanceProgram (Smart Templates)
```typescript
interface MaintenanceProgram {
  id: string;
  userId: string;                    // User-specific customizations
  vehicleId: string;                 // Associated vehicle
  name: string;                      // "Conservative Maintenance Program"
  
  // Legal-Safe Source Attribution
  source: ProgramSource;             // HELPER_TEMPLATE | USER_CUSTOM | MANUAL_ENTRY
  disclaimer: string;                // Always present legal disclaimer
  
  // Program Definition
  intervals: MaintenanceInterval[];  // List of scheduled maintenance
  isActive: boolean;                 // Currently in use
  createdAt: Date;
  updatedAt: Date;
}

interface MaintenanceInterval {
  id: string;
  category: MaintenanceCategory;     // What type of maintenance
  title: string;                     // "Engine Oil & Filter Change"
  
  // Interval Triggers (flexible system)
  mileageInterval?: number;          // Every 5000 miles
  timeInterval?: number;             // Every 6 months (in months)
  conditionBased?: boolean;          // Check condition, no fixed interval
  
  // Cost Forecasting
  estimatedCost?: number;            // Based on historical data
  lastPerformed?: Date;              // Most recent completion
  nextDue?: Date;                    // Calculated next due date
  nextDueMileage?: number;           // Calculated next due mileage
  
  // Legal Protection
  source: string;                    // "Common industry practice"
  userModified: boolean;             // User has customized this interval
}

enum ProgramSource {
  HELPER_TEMPLATE = 'helper_template',    // Curated suggestions
  USER_CUSTOM = 'user_custom',            // User-created program
  MANUAL_ENTRY = 'manual_entry'           // Manually entered intervals
}
```

#### ServiceProvider (Progressive Enhancement)
```typescript  
interface ServiceProvider {
  id: string;
  name: string;                      // "Johnson's Auto Repair"
  type: ServiceType;                 // DEALERSHIP | INDEPENDENT | DIY
  contactInfo?: ContactInfo;
  specialties: MaintenanceCategory[];
  userRating?: number;               // 1-5 stars
  notes?: string;                    // User notes about provider
}

enum ServiceType {
  DEALERSHIP = 'dealership',         // Official dealer service
  INDEPENDENT = 'independent',       // Independent repair shop  
  DIY = 'diy',                      // Do-it-yourself
  MOBILE = 'mobile',                // Mobile service provider
  QUICK_LUBE = 'quick_lube'         // Quick lube service
}
```

## 🔄 Repository Pattern Implementation

### MaintenanceLogRepository
```typescript
interface MaintenanceLogRepository extends BaseRepository<MaintenanceLog> {
  // Core CRUD Operations
  create(log: Omit<MaintenanceLog, 'id'>): Promise<MaintenanceLog>;
  update(id: string, updates: Partial<MaintenanceLog>): Promise<MaintenanceLog>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<MaintenanceLog | null>;
  
  // User-Specific Queries
  getUserMaintenanceLogs(userId: string): Promise<MaintenanceLog[]>;
  getLogsByVehicle(vehicleId: string): Promise<MaintenanceLog[]>;
  getLogsByDateRange(userId: string, start: Date, end: Date): Promise<MaintenanceLog[]>;
  
  // Category and Type Filtering
  getLogsByCategory(userId: string, category: MaintenanceCategory): Promise<MaintenanceLog[]>;
  getLogsByType(userId: string, type: MaintenanceType): Promise<MaintenanceLog[]>;
  
  // Cost Analysis
  calculateCostTotals(userId: string, timeframe?: DateRange): Promise<CostSummary>;
  getCostsByCategory(userId: string, timeframe?: DateRange): Promise<CategoryCostBreakdown>;
  getCostsByVehicle(userId: string): Promise<VehicleCostBreakdown>;
  
  // Reminder Integration
  getUpcomingMaintenance(userId: string): Promise<UpcomingMaintenance[]>;
  getOverdueMaintenance(userId: string): Promise<OverdueMaintenance[]>;
  
  // Search and Filtering
  searchLogs(userId: string, query: SearchQuery): Promise<MaintenanceLog[]>;
  
  // Data Export
  exportUserData(userId: string, format: 'csv' | 'json'): Promise<ExportData>;
}

interface SearchQuery {
  text?: string;                     // Text search in title/notes
  categories?: MaintenanceCategory[];
  types?: MaintenanceType[];
  dateRange?: DateRange;
  costRange?: CostRange;
  vehicleIds?: string[];
  tags?: string[];
}

interface CostSummary {
  totalCost: number;
  currency: string;
  periodStart: Date;
  periodEnd: Date;
  entryCount: number;
  averageCostPerEntry: number;
  costPerMile?: number;              // If mileage data available
}
```

### MaintenanceProgramRepository
```typescript
interface MaintenanceProgramRepository extends BaseRepository<MaintenanceProgram> {
  // Program Management
  getUserPrograms(userId: string): Promise<MaintenanceProgram[]>;
  getProgramsByVehicle(vehicleId: string): Promise<MaintenanceProgram[]>;
  getActiveProgram(vehicleId: string): Promise<MaintenanceProgram | null>;
  
  // Template System
  getHelperTemplates(make?: string, year?: number): Promise<MaintenanceTemplate[]>;
  createFromTemplate(templateId: string, vehicleId: string, customizations?: Partial<MaintenanceProgram>): Promise<MaintenanceProgram>;
  
  // Interval Management
  updateInterval(programId: string, intervalId: string, updates: Partial<MaintenanceInterval>): Promise<MaintenanceProgram>;
  addCustomInterval(programId: string, interval: Omit<MaintenanceInterval, 'id'>): Promise<MaintenanceProgram>;
  removeInterval(programId: string, intervalId: string): Promise<MaintenanceProgram>;
  
  // Reminder Calculation
  calculateUpcomingMaintenance(programId: string, currentMileage: number): Promise<UpcomingMaintenance[]>;
}

interface MaintenanceTemplate {
  id: string;
  makeDisplayName: string;           // "Toyota"
  applicableYears?: number[];        // [2010, 2011, 2012, ...] or null for all
  disclaimer: string;                // Legal disclaimer text
  intervals: MaintenanceInterval[];
  source: string;                    // "Industry common practice"
  lastUpdated: Date;
}
```

## 🔐 Security Architecture

### Firebase Security Rules
```javascript
// Maintenance logs collection
match /maintenanceLogs/{logId} {
  allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
}

// Maintenance programs collection  
match /maintenancePrograms/{programId} {
  allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
}

// Helper templates (read-only for all authenticated users)
match /maintenanceTemplates/{templateId} {
  allow read: if request.auth != null;
  allow write: if false; // Only server-side updates
}
```

### Data Isolation Strategy
- **User-specific data:** All maintenance logs scoped to `userId`
- **Vehicle association:** Maintenance logs linked to user's vehicles only
- **Template sharing:** Helper templates are global, read-only resources
- **Photo storage:** Firebase Storage with user-specific paths

## 📱 Progressive UX Architecture

### Component Hierarchy
```
MaintenanceScreen (existing)
├── MaintenanceTabNavigator
│   ├── UpcomingTab
│   │   ├── ReminderList
│   │   ├── OverdueAlerts
│   │   └── QuickActions
│   └── HistoryTab
│       ├── MaintenanceLogList
│       ├── FilterControls
│       └── CostSummary
│
├── AddMaintenanceLogScreen (new)
│   ├── QuickEntryForm
│   │   ├── MaintenanceTypeSelector
│   │   ├── CategoryPicker
│   │   ├── BasicInfoForm (cost, date, notes)
│   │   └── PhotoPicker
│   └── DetailedEntryForm (expandable)
│       ├── PartsSection
│       ├── FluidsSection
│       ├── ProceduresSection
│       └── ReminderSettings
│
├── MaintenanceProgramScreen (new)
│   ├── ProgramSetupWizard
│   │   ├── SourceSelector (Helper/Manual/Custom)
│   │   ├── TemplateSelector
│   │   ├── IntervalCustomization
│   │   └── LegalDisclaimers
│   └── ProgramManagement
│       ├── IntervalList
│       ├── CostForecasting  
│       └── ReminderScheduling
```

### State Management Pattern
```typescript
// Context for maintenance data
interface MaintenanceContextType {
  // Data State
  maintenanceLogs: MaintenanceLog[];
  maintenancePrograms: MaintenanceProgram[];
  upcomingMaintenance: UpcomingMaintenance[];
  
  // Loading States
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  
  // Actions
  createLog: (log: CreateMaintenanceLogData) => Promise<MaintenanceLog>;
  updateLog: (id: string, updates: Partial<MaintenanceLog>) => Promise<MaintenanceLog>;
  deleteLog: (id: string) => Promise<void>;
  
  // Filtering and Search
  filterLogs: (query: SearchQuery) => MaintenanceLog[];
  searchLogs: (text: string) => MaintenanceLog[];
  
  // Program Management
  createProgram: (program: CreateMaintenanceProgramData) => Promise<MaintenanceProgram>;
  updateProgram: (id: string, updates: Partial<MaintenanceProgram>) => Promise<MaintenanceProgram>;
  
  // Cost Analysis
  getCostSummary: (timeframe?: DateRange) => Promise<CostSummary>;
}
```

## 🔔 Reminder System Architecture

### Reminder Calculation Engine
```typescript
interface ReminderEngine {
  // Calculate due dates based on intervals and history
  calculateNextDue(interval: MaintenanceInterval, lastPerformed?: Date, currentMileage?: number): ReminderCalculation;
  
  // Get all upcoming reminders for user
  getUpcomingReminders(userId: string): Promise<UpcomingReminder[]>;
  
  // Get overdue maintenance
  getOverdueReminders(userId: string): Promise<OverdueReminder[]>;
  
  // Update reminders when maintenance is logged
  updateRemindersAfterMaintenance(log: MaintenanceLog): Promise<void>;
}

interface ReminderCalculation {
  nextDueDate?: Date;                // Based on time interval
  nextDueMileage?: number;           // Based on mileage interval
  priority: ReminderPriority;        // HIGH | MEDIUM | LOW
  daysUntilDue?: number;            // Calculated days remaining
  milesUntilDue?: number;           // Calculated miles remaining
}

enum ReminderPriority {
  HIGH = 'high',      // Overdue or due within 7 days/500 miles
  MEDIUM = 'medium',  // Due within 30 days/2000 miles
  LOW = 'low'         // Due in future
}
```

### Notification Integration
```typescript
interface NotificationService {
  // Schedule local notifications
  scheduleMaintenanceReminder(reminder: UpcomingReminder): Promise<string>;
  
  // Cancel existing notifications
  cancelReminder(reminderId: string): Promise<void>;
  
  // Update notification when intervals change
  updateReminderNotification(reminderId: string, reminder: UpcomingReminder): Promise<void>;
  
  // Batch operations for program changes
  rescheduleAllReminders(userId: string): Promise<void>;
}
```

## 📊 Analytics & Reporting Architecture

### Cost Analysis Engine
```typescript
interface CostAnalyticsEngine {
  // Summary calculations
  calculateTotalCosts(logs: MaintenanceLog[], timeframe?: DateRange): CostSummary;
  calculateCostPerMile(logs: MaintenanceLog[], totalMiles: number): number;
  calculateAverageCostByCategory(logs: MaintenanceLog[]): CategoryCostAverage[];
  
  // Trend analysis
  getCostTrends(logs: MaintenanceLog[], intervalType: 'monthly' | 'quarterly' | 'yearly'): CostTrend[];
  predictFutureCosts(logs: MaintenanceLog[], program: MaintenanceProgram): CostForecast;
  
  // Comparative analysis
  compareCostsByVehicle(userId: string): VehicleCostComparison[];
  compareCostsByTimeframe(logs: MaintenanceLog[], intervals: DateRange[]): TimeframeCostComparison[];
}

interface CostTrend {
  period: string;                    // "2024-01", "Q1 2024"
  totalCost: number;
  categoryBreakdown: CategoryCost[];
  maintenanceCount: number;
  averageCostPerMaintenance: number;
}

interface CostForecast {
  nextTwelveMonths: PeriodForecast[];
  totalProjectedCost: number;
  majorUpcomingExpenses: ExpenseProjection[];
}
```

### Export System
```typescript
interface ExportService {
  // CSV Export
  exportMaintenanceLogsCSV(userId: string, options?: ExportOptions): Promise<string>;
  exportCostAnalysisCSV(userId: string, timeframe?: DateRange): Promise<string>;
  
  // PDF Reports
  generateMaintenanceReport(userId: string, vehicleId?: string): Promise<Buffer>;
  generateCostAnalysisReport(userId: string, timeframe?: DateRange): Promise<Buffer>;
  
  // Data Backup
  exportAllUserData(userId: string): Promise<UserDataExport>;
}

interface ExportOptions {
  dateRange?: DateRange;
  categories?: MaintenanceCategory[];
  vehicleIds?: string[];
  includePhotos?: boolean;
  includeDetailedParts?: boolean;
}
```

## 🔌 Integration Points

### Vehicle Integration
- **Mileage tracking:** Automatic mileage updates from maintenance logs
- **Vehicle-specific programs:** Link maintenance programs to specific vehicles
- **Cost per vehicle:** Separate cost tracking for each vehicle

### User Profile Integration  
- **Currency preferences:** Use user's preferred currency for all cost calculations
- **Measurement system:** Imperial vs metric based on user location/preference
- **Notification preferences:** User-controlled reminder settings

### Firebase Integration
- **Authentication:** Leverage existing Firebase Auth integration
- **Storage:** Use Firebase Storage for maintenance photos
- **Firestore:** Extend existing Firestore collections pattern
- **Cloud Functions:** Backend processing for notifications and analytics

## 🚀 Performance Considerations

### Data Loading Strategy
- **Lazy loading:** Load maintenance logs on-demand by date range
- **Pagination:** Implement pagination for large maintenance history
- **Caching:** Cache frequently accessed data (recent logs, active programs)
- **Offline support:** Store critical data locally with Firestore offline persistence

### Image Optimization
- **Photo compression:** Compress maintenance photos before upload
- **Thumbnail generation:** Create thumbnails for list views
- **Progressive loading:** Load full-resolution images on demand

### Query Optimization
- **Firestore indexes:** Create composite indexes for common queries
- **Query batching:** Combine related queries where possible
- **Real-time updates:** Use Firestore real-time listeners efficiently

---

*This architecture document should be updated as implementation progresses and new requirements emerge. All security rules should be thoroughly tested before production deployment.*