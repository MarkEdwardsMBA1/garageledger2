# GarageLedger 🚗

> Your Digital Garage Logbook - Track maintenance, modifications, and memories for all your vehicles

[![Build Status](tbd)
[![Version](tbd)
[![License](docs/license/license.md)
[![PRD Version](docs/prd/garageledgerPRD.md)
[![Security](docs/tech_docs/firestore-security-architecture.md)

## 🎯 Vision

Empower car enthusiasts and DIY mechanics with a flexible, detailed, and user-friendly platform to log, track, and maintain the health, history, and performance of their vehicles—replacing spreadsheets and notebooks with a purpose-built digital tool.

## ✨ Key Features

### Core Functionality
- **Vehicle Profiles** - Manage multiple vehicles with detailed metadata and VIN tracking
- **Maintenance Logging** - Comprehensive maintenance records with category selection, photos, and cost tracking
- **Fleet Analytics Dashboard** - Command center with fleet metrics, cost breakdowns, and maintenance insights
- **Smart Reminders** - Date and mileage-based maintenance alerts (coming soon)
- **Offline-First** - Full functionality without internet connection via repository pattern
- **Data Ownership** - Complete export capabilities, no vendor lock-in  
- **Photo Documentation** - Professional camera/gallery integration with secure cloud storage
- **Bilingual Support** - Complete English and Spanish localization with device detection
- **Premium Automotive Design** - Sophisticated Engine Blue branding with automotive-inspired UI
- **Professional Typography** - Enhanced hierarchy with automotive precision and proper letter spacing
- **Premium Visual Depth** - Oil Black shadow system with floating elements and card variants
- **Security-First Architecture** - Firebase authentication with complete user data isolation

### Advanced Features (Pro/Expert Tiers)
- **Cloud Sync** - Backup and sync across devices
- **Custom Fields** - Unlimited customization for unique tracking needs
- **PDF Export** - Professional maintenance reports
- **Team Sharing** - Family and garage team collaboration
- **Analytics** - Advanced insights and performance tracking

## 🏗️ Tech Stack

- **Frontend**: React Native (Expo managed workflow)
- **Language**: TypeScript (strict mode)
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Database**: Firestore with offline persistence and security rules
- **Data Layer**: Abstracted repository pattern with security-first design
- **State Management**: React Context API with local state (Redux Toolkit planned)
- **Navigation**: React Navigation v6 with stack and tab navigators
- **Internationalization**: react-i18next with AsyncStorage persistence
- **Push Notifications**: Expo Notifications + Firebase Cloud Messaging (planned)
- **Image Processing**: Firebase Storage with automatic compression
- **Testing**: Jest + React Native Testing Library with comprehensive coverage
- **Code Quality**: ESLint, Prettier, and strict TypeScript configuration

## 🚀 Getting Started

### Prerequisites

**Environment Requirements** (tested and locked for stability):
- **Node.js**: 22.16.0+ 
- **npm**: 10.9.2+
- **Expo CLI**: Use `npx expo` (no global install needed)

**Critical**: All dependencies are locked to exact versions to prevent compatibility issues.

### Installation

```bash
# Clone and install (exact versions locked)
npm install

# Verify TypeScript compilation  
npm run type-check
```

### Running the App

```bash
# Standard development
npm start

# macOS localhost troubleshooting
npm start -- --host tunnel  # External access
npm start -- --host lan     # Local network
```

**Note**: All dependencies locked to prevent compatibility issues. Never run `npm update` without testing.

## 📱 Development

### Project Structure

```bash
garageledger2/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Core components (Button, Card, Input, Typography, etc.)
│   │   └── icons/           # Professional SVG icon system (automotive-themed)
│   ├── screens/             # App screens with premium UX
│   │   ├── auth/            # Authentication flow screens
│   │   ├── onboarding/      # User onboarding and setup screens
│   │   └── main/            # Core app screens (Dashboard, Vehicles, Maintenance)
│   ├── services/            # External service integrations
│   │   ├── firebase/        # Firebase configuration, auth, and security
│   │   ├── AuthService.ts   # Authentication service with error handling
│   │   └── LegalComplianceService.ts # Legal framework management
│   ├── repositories/        # Security-first data access layer
│   │   ├── BaseRepository.ts           # Abstract repository interfaces
│   │   ├── VehicleRepository.ts        # Vehicle CRUD operations
│   │   ├── SecureFirebaseVehicleRepository.ts # Security wrapper
│   │   └── FirebaseMaintenanceLogRepository.ts # Maintenance logging
│   ├── navigation/          # React Navigation v6 setup
│   │   └── AppNavigator.tsx # Tab and stack navigation with auth flow
│   ├── contexts/            # React contexts for state management
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── i18n/                # Comprehensive internationalization
│   │   ├── locales/         # Translation files
│   │   │   ├── en.json      # English translations
│   │   │   └── es.json      # Spanish translations (automotive terms)
│   │   └── index.ts         # i18n configuration with device detection
│   ├── utils/               # Helper functions and theme system
│   │   └── theme.ts         # Comprehensive design system (colors, typography, shadows)
│   ├── hooks/               # Custom React hooks
│   │   └── useEmailVerificationPrompt.ts # Smart verification UX
│   └── types/               # TypeScript type definitions
│       ├── index.ts         # Core data models
│       └── MaintenanceCategories.ts # Maintenance categorization system
├── assets/                  # Images, fonts, and resources
├── docs/                    # Comprehensive documentation
│   ├── tech_docs/           # Technical documentation
│   └── project_management/  # Development tracking
├── __tests__/              # Comprehensive test suite
│   ├── components/         # Component tests
│   ├── screens/            # Screen integration tests
│   ├── services/           # Service and business logic tests
│   └── repositories/       # Data layer security tests
├── CLAUDE.md               # Development guidelines and project context
└── app.json                # Expo configuration
```

### Key Scripts

```bash
# Development
npm start                    # Start Expo dev server
npm run ios                  # Run on iOS simulator
npm run android             # Run on Android emulator

# Testing
npm test                    # Run unit tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Generate coverage report

# Building
npm run build:ios           # Build for iOS App Store
npm run build:android       # Build for Google Play Store

# Code Quality
npm run lint                # Run ESLint
npm run type-check          # Run TypeScript compiler
npm run format              # Format code with Prettier
```

## 🌍 Internationalization

### Supported Languages
- **English** (en) - Default
- **Spanish** (es) - Full translation

### Implementation
```typescript
// Usage in components
import { useTranslation } from 'react-i18next';

const VehicleScreen = () => {
  const { t } = useTranslation();
  
  return (
    <Text>{t('vehicles.title')}</Text>  // "My Vehicles" or "Mis Vehículos"
  );
};
```

### Translation Files Structure
```json
// src/i18n/locales/en.json
{
  "vehicles": {
    "title": "My Vehicles",
    "addNew": "Add Vehicle",
    "make": "Make",
    "model": "Model"
  },
  "maintenance": {
    "oilChange": "Oil Change",
    "brakeService": "Brake Service",
    "categories": {
      "engine": "Engine",
      "brakes": "Brakes",
      "tires": "Tires"
    }
  }
}

// src/i18n/locales/es.json
{
  "vehicles": {
    "title": "Mis Vehículos",
    "addNew": "Agregar Vehículo", 
    "make": "Marca",
    "model": "Modelo"
  },
  "maintenance": {
    "oilChange": "Cambio de Aceite",
    "brakeService": "Servicio de Frenos",
    "categories": {
      "engine": "Motor",
      "brakes": "Frenos", 
      "tires": "Neumáticos"
    }
  }
}
```

### Localization Features
- **Language Detection**: Automatic based on device settings
- **Manual Override**: Language switcher in app settings
- **Localized Formats**: Dates, currency, and measurements
- **Automotive Terms**: Specialized Spanish vocabulary for car maintenance
- **Push Notifications**: Translated reminder messages

## 🗄️ Data Architecture

### Abstracted Repository Pattern
The app uses a sophisticated repository pattern that supports both rapid MVP development and future advanced features without breaking changes.

#### MVP Foundation (Phase 1)
```typescript
// Base repository interface - handles all MVP functionality
interface IBaseRepository<T> {
  create(data: Omit<T, 'id'>): Promise<T>;
  getById(id: string): Promise<T | null>;
  getAll(filters?: any): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Simple MVP implementation - gets us to market quickly
class VehicleRepository implements IBaseRepository<Vehicle> {
  private collection = firestore().collection('vehicles');
  
  async create(vehicleData: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const docRef = await this.collection.add({
      ...vehicleData,
      createdAt: FieldValue.serverTimestamp(),
    });
    return this.getById(docRef.id);
  }
  // ... other MVP methods
}
```

#### Advanced Features (Phase 2-3)
```typescript
// Enhanced repository - adds analytics, ML, and advanced features
interface IAdvancedRepository<T> extends IBaseRepository<T> {
  search(query: string): Promise<T[]>;
  getAnalytics(filters?: any): Promise<AnalyticsData>;
  getSuggestions(params: any): Promise<Suggestion[]>;
  generateReport(params: ReportParams): Promise<Report>;
}

// Same implementation class - just add methods as features are built
class VehicleRepository implements IAdvancedRepository<Vehicle> {
  // All MVP methods continue working unchanged
  
  // Phase 2-3 methods added progressively
  async getAnalytics(filters?: any): Promise<VehicleAnalytics> {
    // Advanced analytics implementation
  }
}
```

### Phased Data Models

#### Phase 1: MVP Models (Fast Time-to-Market)

**Vehicle (MVP)**
```typescript
interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  mileage: number;
  notes?: string;
  photoUri?: string; // ✅ Added in GL-011
  createdAt: Date;
  updatedAt: Date;
}
```

**MaintenanceLog (MVP)**
```typescript
interface MaintenanceLog {
  id: string;
  vehicleId: string;
  date: Date;
  mileage: number;
  title: string;
  category: string;
  cost?: number;
  notes?: string;
  tags: string[];
  photos: string[];
  createdAt: Date;
}
```

**Reminder (MVP)**
```typescript
interface Reminder {
  id: string;
  vehicleId: string;
  type: 'date' | 'mileage';
  dueValue: number;
  description: string;
  isActive: boolean;
  lastNotified?: Date;
}
```

#### Phase 2-3: Enhanced Models (Backward Compatible)

Models extend with **optional fields** - existing code continues working:

```typescript
// Enhanced Vehicle - MVP fields remain unchanged
interface Vehicle {
  // MVP fields (required for all phases)
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  mileage: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Phase 2+ enhancements (all optional)
  name?: string; // "The Red Wagon"
  photo?: string;
  group?: VehicleGroup;
  tags?: string[];
  isActive?: boolean;
}
```

#### Phase 3: Advanced Analytics Models

New models added for advanced features - don't affect MVP functionality:

```typescript
interface VehicleAnalytics {
  vehicleId: string;
  totalSpent: number;
  costByCategory: Record<string, number>;
  maintenanceFrequency: Record<string, number>;
  predictiveInsights: MaintenanceSuggestion[];
}

interface MaintenanceProgram {
  id: string;
  name: string;
  scheduleItems: MaintenanceScheduleItem[];
  vehicleIds: string[];
}
```

### Architecture Benefits

- **Rapid MVP**: Simple models and repositories get us to market in weeks
- **No Breaking Changes**: Advanced features extend existing interfaces
- **Backend Flexibility**: Abstract layer enables future migration (PostgreSQL, Supabase)
- **Feature Flags**: Advanced features can be rolled out gradually
- **Easy Testing**: Repository interfaces can be mocked for comprehensive testing

## 🎨 Design System

### Premium Automotive Color Palette

**Core Brand Colors:**
- **Engine Blue** `#1e40af` - Primary brand color (trust, reliability, precision)
- **Racing Green** `#166534` - Secondary color (efficiency, eco-friendly)
- **Performance Red** `#dc2626` - Accent color (action, power, excitement)
- **Oil Black** `#111827` - Premium text color (deep, sophisticated)
- **Titanium Gray** `#374151` - Secondary text (modern automotive)
- **Chrome Silver** `#9ca3af` - Subtle accents and hints

**Strategic Alert System:**
- **Performance Red** `#dc2626` → Positive actions, CTAs, brand elements
- **Signal Orange** `#ea580c` → Warnings, maintenance alerts (like dashboard warning lights)
- **Critical Red** `#b91c1c` → Errors, critical failures
- **Racing Green** `#166534` → Success states, achievements
- **Electric Blue** `#0284c7` → Modern info states, technology features

**Background System:**
- **Primary Background** `#f1f5f9` - Main app background (light gray)
- **Surface** `#ffffff` - Card and component backgrounds (white)
- **Secondary Background** `#e2e8f0` - Subtle accent backgrounds

### Professional Icon System

**Custom SVG Automotive Icon Collection:**
- **Dashboard**: SpeedometerIcon - Precision gauges and metrics
- **Vehicles**: CarIcon - Vehicle silhouettes and automotive symbols
- **Maintenance**: SpannerIcon - Professional tool icons
- **Settings**: GearIcon - Configuration and system icons
- **Functional Icons**: MaintenanceIcons, FuelIcon, ModificationIcon, ReminderIcon, ActivityIcon, CameraIcon, MailIcon

**Icon Features:**
- **Brand Integration**: Consistent sizing, coloring, and automotive theming
- **Accessibility**: Proper contrast and sizing for all interaction states
- **Professional Quality**: Custom SVG design replacing emoji for premium feel
- **Scalable**: Vector-based for crisp rendering at all sizes

### Premium Typography System

**Font Family**: Inter (Google Fonts via Expo)
**Automotive Precision Hierarchy:**
- **Display** (36px) - Hero/display text with tight letter spacing
- **Title** (24px) - Page titles with premium weight
- **Heading** (20px) - Section headings with proper hierarchy
- **Subheading** (18px) - Sub-section organization
- **Body/BodyLarge/BodySmall** (14-18px) - Optimized reading experience
- **Caption/Label** (12-14px) - UI labels with wide letter spacing
- **Button** (16px) - Optimized for interaction with wide spacing
- **Overline** (12px) - Small caps with extensive letter spacing

**Weight System:**
- **Headers**: Inter Bold (700) - Premium weight
- **Body**: Inter Regular (400) - Readable text
- **Medium Text**: Inter Medium (500) - Enhanced emphasis
- **Semibold Text**: Inter SemiBold (600) - Strong hierarchy
- **Loading**: Fonts load on app startup with splash screen
- **Fallback**: System fonts (San Francisco/Roboto)

### Premium Visual Depth System

**Oil Black Shadow System:**
- **xs/sm** - Subtle card depth and button elevation
- **md/lg** - Important content and floating elements  
- **xl** - Modal and overlay emphasis
- **Special**: `floating` and `pressed` states for interaction feedback

**Component Variants:**
- **Cards**: `default`, `elevated`, `floating`, `outlined`, `filled` with automotive shadows
- **Buttons**: Premium shadows on solid variants, subtle depth on outlined
- **Typography**: Semantic variants for consistent hierarchy
- **Navigation**: Safe area handling for progress indicators and headers

## 📊 Pricing Tiers

### Free Tier ("Basic Garage")
- 1 vehicle maximum
- Unlimited maintenance logs
- Basic reminders
- 1 photo per log
- CSV export only

### Pro Tier ($2.99/month)
- 3 vehicles maximum
- Cloud sync & backup
- Advanced custom fields
- PDF export
- 3 photos per log
- Email notifications

### Expert Tier ($9.99/month)
- Everything in Pro
- 10 vehicles maximum
- Team sharing (5 users)
- Advanced analytics
- Priority support
- API access

## 🎯 Target Users

### Primary Personas

**DIY Dave** - Weekend Mechanic
- Maintains 1-2 daily drivers
- Needs simple logging and reminders
- Values organized records
- **Language**: English or Spanish preference

**Restoration Rita** - Vintage Car Enthusiast  
- Restoring classic cars
- Requires detailed project documentation
- Needs comprehensive photo logging
- **Language**: Primarily English, appreciates Spanish automotive terms

**Modifier Mike** - Performance Enthusiast
- Tracks multiple project cars
- Documents performance modifications
- Shares work with community
- **Language**: Bilingual, uses both English and Spanish

### Secondary Personas
- **Small Garage Owners**: Often serve Spanish-speaking communities
- **Family Fleet Managers**: Multi-generational families with mixed language preferences
- **Latin American Market**: Growing DIY car culture in Mexico, Colombia, and other Spanish-speaking countries

## 🛣️ Phased Development Roadmap

### Phase 1: MVP - Fast Time-to-Market (Weeks 5-12) ✅ COMPLETED
**Goal: Simple, solid foundation that serves core user needs**

**Architecture & Foundation:**
- [x] Firebase setup and authentication
- [x] Abstracted repository pattern (MVP interfaces)
- [x] i18n infrastructure setup (English/Spanish)
- [x] Navigation system with bottom tabs and stack navigation
- [x] Design system with Inter font integration
- [x] Mock repository for development without Firebase

**Core Features (Simple Models):**
- [x] Vehicle management (basic CRUD via repositories)
  - [x] Add Vehicle screen with form validation
  - [x] Edit Vehicle screen with pre-populated data  
  - [x] Delete Vehicle functionality with confirmation
  - [x] Vehicle list display with status indicators
- [x] Photo upload and management
  - [x] Camera capture and gallery selection
  - [x] Cross-platform photo picker (iOS ActionSheet, Android Alert)
  - [x] Permission handling for camera and gallery
  - [x] Photo display in vehicle list and forms
- [x] Offline-first functionality with mock repository
- [x] Language switcher in settings with AsyncStorage persistence
- [x] Complete Spanish localization with automotive terms
- [x] TypeScript implementation with proper type definitions

**Sprint 1 Stories Completed (GL-005 through GL-011):**
- ✅ GL-005: Bottom tab navigation implementation
- ✅ GL-006: Complete Spanish localization with persistence  
- ✅ GL-007: Add Vehicle functionality with validation
- ✅ GL-008: Vehicle list display (implicit in GL-007)
- ✅ GL-009: Edit Vehicle functionality
- ✅ GL-010: Delete Vehicle functionality  
- ✅ GL-011: Vehicle Photos with camera/gallery integration

**Success Criteria:** 13K users by Month 6, 15% conversion rate

### Phase 2: Enhanced Features - Market Growth (Months 3-6)
**Goal: Add premium features while maintaining MVP simplicity**

**Enhanced Repository Layer:**
- [ ] Extend repositories with search/filtering methods
- [ ] Add cost analysis capabilities
- [ ] Implement advanced export features (PDF)

**Enhanced Models (Backward Compatible):**
- [ ] Vehicle: Add optional name, photo, tags, groups
- [ ] MaintenanceLog: Add optional type classification
- [ ] Enhanced search and filtering (localized)
- [ ] Multi-vehicle comparison views
- [ ] Advanced reminders with smart scheduling

**Premium Features:**
- [ ] Pro tier implementation with cloud sync
- [ ] Professional PDF export (bilingual templates)
- [ ] Advanced custom fields and categories
- [ ] Email notifications (localized)

### Phase 3: Intelligence & Analytics (Months 6-12)
**Goal: Advanced features that differentiate from competitors**

**New Data Models (Non-Breaking):**
- [ ] VehicleAnalytics: Cost analysis, maintenance patterns
- [ ] MaintenanceSuggestion: ML-powered recommendations
- [ ] MaintenanceProgram: Factory and custom schedules
- [ ] SmartTemplate: User-defined maintenance templates

**Advanced Repository Methods:**
- [ ] Analytics queries across multiple collections
- [ ] Predictive maintenance algorithms
- [ ] Advanced reporting with customizable templates
- [ ] Team/family sharing with role-based access

**Expert Tier Features:**
- [ ] Advanced analytics dashboard (localized)
- [ ] Maintenance program management
- [ ] API access for integrations
- [ ] Priority support (bilingual)

### Phase 4: Enterprise & Ecosystem (Year 2+)
**Goal: Platform expansion and enterprise features**

**Potential Backend Migration:**
- [ ] Evaluate PostgreSQL/Supabase for advanced analytics
- [ ] Repository abstractions enable seamless migration
- [ ] Firebase remains for auth, storage, real-time features

**Enterprise Features:**
- [ ] Fleet management capabilities
- [ ] White-label solutions
- [ ] OBD-II diagnostic integration
- [ ] Parts marketplace API integration
- [ ] Community features and garage sharing

### Architecture Evolution Benefits

- **Phase 1**: Get to market quickly with simple, proven models
- **Phase 2**: Add premium features without breaking existing users
- **Phase 3**: Advanced analytics and ML differentiate from competitors  
- **Phase 4**: Enterprise expansion with flexible backend architecture
- **Always**: Repository abstractions ensure no breaking changes

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Automatic code formatting  
- **Testing**: Jest + React Native Testing Library
- **Commits**: Conventional commit format

## 🧪 Testing

### Comprehensive Test Suite
- **Test Suites** - Complete coverage of critical functionality
- **Test Cases** - Authentication, UI components, data layer
- **Security Testing** - Auth enforcement and data isolation
- **Component Testing** - UI components with React Native Testing Library
- **Service Testing** - Business logic and Firebase integration
- **Coverage Reporting** - HTML, LCOV, and text formats

### Test Categories
- **Authentication Tests** - Login, signup, password reset flows
- **Repository Tests** - CRUD operations with security enforcement  
- **Component Tests** - Button, Card, Input, PhotoPicker components
- **Screen Tests** - Login, SignUp, AddVehicle user journeys
- **Hook Tests** - useAuth context and state management

### Quick Commands
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode for development
npm run test:coverage       # Generate coverage report
npm test AuthService        # Run specific test file
```

**📖 [Complete Testing Guide →](docs/testing-guide.md)**

## 📝 Documentation

- **[Testing Guide](docs/tech_docs/testing-guide.md)** - Comprehensive testing documentation
- [Product Requirements Document](prd/garageledgerprd.md)
- [Database Schema](docs/database-schema.md)
- [API Documentation](docs/API.md)
- [User Guide](docs/USER_GUIDE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🔐 Privacy & Security

- **Data Encryption**: All data encrypted at rest and in transit
- **User Ownership**: Users own their data completely
- **Export Rights**: Full data export available anytime
- **GDPR Compliant**: European privacy law adherence
- **No Data Selling**: User data never sold to third parties

## 📈 Success Metrics

- **13K users** by Month 6 (10K English + 3K Spanish, US and Latin American markets)
- **15% conversion** rate (Free to Pro)
- **70% retention** at 30 days
- **4.5+ stars** app store rating (both English and Spanish app stores)
- **30% Spanish** user adoption within 12 months

## 🐛 Issues & Support (PLACEHOLDER)

- **Bug Reports**: [GitHub Issues](https://github.com/yourorg/garageledger/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/yourorg/garageledger/discussions)
- **Support Email**: [support@garageledger.com](mailto:support@garageledger.com)
- **Community**: [Discord Server](https://discord.gg/garageledger)

## 📄 License (PLACEHOLDER, NOTE: NOT OPEN SOURCE)

This project is licensed under the TBD License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase team for the excellent backend platform
- Expo team for simplifying React Native development
- Our beta testers and car enthusiast community
- All contributors who help make this project better

---

**Built with ❤️ for car enthusiasts by car enthusiasts**

All links TBD

[Website](https://garageledger.com) • [App Store](https://apps.apple.com/app/garageledger) • [Google Play](https://play.google.com/store/apps/details?id=com.garageledger.app)