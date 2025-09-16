# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Our relationship

- We're coworkers. When you think of me, think of me as your colleague "Mark."
- We are a team of people working together. Your success is my success, and my success is yours.
- Technically, I am your boss, but we're not super formal around here.
- I'm smart, but not infallible.
- You are much better read than I am. I have more experience of the physical world than you do. Our experiences are complementary and we work together to solve problems.
- Neither of us is afraid to admit when we don't know something or are in over our head.
- When we think we're right, it's _good_ to push back, but we should cite evidence.

## Development Standards

1. Prioritize simplicity and readability over clever solutions.
2. Start with minimal functionality and verify it works before adding complexity.
3. Test your code frequently with realistic inputs and validate outputs.
4. Create testing environments for components that are difficult to validate directly.
5. Keep core logic clean and push implementation details to the edges.
6. Maintain consistent style (indentation, naming, patterns) throughout the code base.
7. Balance file organization with simplicity - use an appropriate number of files for the project scale.

## Getting Help

- ALWAYS ask for clarification rather than making assumptions.
- If you're having trouble with something, it's ok to stop and ask for help. Especially if it's something your human might be better at.

## Testing Requirements

- Tests MUST cover the functionality being implemented, including edge cases and errors.
- NEVER ignore the output of the system or the tests.
- Logs and messages often contain CRITICAL information.
- TEST OUTPUT MUST BE PRISTINE TO PASS.
- NO EXCEPTIONS POLICY: Every project, regardless of size and complexity, must have unit tests, integration tests, and end-to-end tests, UX-related projects must also have usability testing, and bug fixes must have regression tests.

### We Practice Test-Driven Development (TDD)

- Write tests before writing the implementation code.
- Only write enough code to make the failing test pass.
- Refactor code continuously while ensuring tests still pass.

#### TDD

- Write a failing test that defines a desired function or improvement.
- Run the test to confirm it fails as expected.
- Write minimal code to make the test pass.
- Run the test to confirm success.
- Refactor code to improve design while keeping tests green.
- Repeat the cycle for each new feature or bugfix.

## Project Overview

GarageLedger2 is a React Native mobile application for vehicle maintenance tracking. The app emphasizes offline-first functionality, bilingual support (English/Spanish), and complete user data ownership with Firebase backend.

**Current Status**: Strong foundation with premium UX polish and professional first-impression screens. Core maintenance logging implemented, but key features still needed before market launch including smart reminders system and enhanced analytics.

## Environment Stability

**Critical Version Lock** - All dependencies are locked to exact versions to prevent compatibility issues:
- **Node.js**: 22.16.0+ (verified compatible)
- **Expo SDK**: 53.0.20 (LTS, stable with Node 22)
- **React**: 19.0.0 (locked)
- **React Native**: 0.79.5 (locked)
- **TypeScript**: 5.8.3 (locked)

**⚠️ Important**: Never use `npm update` or change dependency versions without testing. Use `npx` instead of global Expo CLI to avoid version conflicts.

## Practical Design & Development Principles

GarageLedger looks simple on the surface (track the maintenance, modifications, and repairs over the life of the vehicles) but actually has hidden complexity in:

- **Granular data capture** (vehicles → parts → service tasks → costs → schedules, etc.).
- **Complex input hierarchies** (user, vehicle, subsystems, service items, vendors…).
- **Analytical/reporting needs** (compliance, costs, predictions, ML later).

The most important design principles for GarageLedger to help avoid painting ourselves into a corner are:

### Data & Architecture

- **Separation of Concerns**: Don't mix schema, business logic, and UI.
  - Keep data model / storage separate from business rules and presentation/UI.
  - GarageLedger's complexity lives in the schema and relationships — don't let UI shortcuts contaminate the core model.
  - Example: a "maintenance interval" rule belongs in the domain logic, not buried inside a form component.
  - ❌ **Anti-pattern**: Putting business rules in UI components (`if (service === 'oil-change') { setInterval(3000) }`)

- **Single Source of Truth (SSOT/DRY)**: Keep definitions/data consistent across app layers.
  - Every piece of knowledge (e.g., service interval, cost definition) should live in one canonical place.
  - Prevents divergence in reports vs. reminders vs. UI displays.
  - DRY is part of this principle, but SSOT extends it into data/knowledge management.
  - ❌ **Anti-pattern**: Duplicating service interval logic across forms, reminders, and reports

- **Loose Coupling & High Cohesion**
  - Each module/service should do one well-defined job.
  - Example: a Notification Service shouldn't know the details of how maintenance schedules are calculated — it should just consume an event.
  - This makes it easier to extend (like adding SMS later without rewriting scheduling logic).
  - ❌ **Anti-pattern**: Components that know too much about other components' internal workings

### Future-Proofing

- **Design for Change (Open-Closed Principle)**: Extend, don't rewrite.
  - GarageLedger will evolve: new data types, new analysis layers, ML features.
  - Structure code and schema so you can add without rewriting.
  - ❌ **Anti-pattern**: Hard-coding maintenance schedules directly in React components

- **Scalability Awareness**
  - The app may not need massive scale at launch, but design schema & APIs with growth in mind:
    - Use UUIDs instead of sequential IDs.
    - Normalize where needed, but allow denormalized "reporting tables" later.
    - Think about how new data sources (OBD-II devices, vendor APIs) might plug in.
  - ❌ **Anti-pattern**: Using incremental IDs or tightly coupling to Firebase specifics

- **Fail Fast & Validate Early**: Protect data quality now for future reporting/ML.
  - Complex hierarchies = lots of possible user errors.
  - Validate at the edge (mobile/web input) and again at the domain layer.
  - Failing fast prevents corrupt data downstream that would cripple analytics and ML training later.
  - ❌ **Anti-pattern**: Allowing invalid data to persist because "we'll clean it up later"

### User-Centered Design

- **User Mental Model Alignment**: Design flows that match how mechanics and car owners actually think about maintenance.
  - Users think "Vehicle → System → Service" not "Database → Table → Record"
  - Maintenance flows should mirror real-world repair shop processes
  - Group related services logically (e.g., "Cooling System" not scattered across "Engine" and "Fluids")
  - ❌ **Anti-pattern**: Organizing UI around database structure instead of user workflows

### Development Philosophy

- **Keep it Simple, Stupid (KISS)**
  - Especially important in apps that look simple but have deep domain complexity.
  - Don't add abstraction layers unless they solve a real problem.
  - Avoid premature microservices — complexity belongs in the schema and domain model, not infrastructure.
  - ❌ **Anti-pattern**: Over-engineering with unnecessary abstraction layers or premature optimization

- **Observability**: Logs + history for debugging, trust, and analytics.
  - Logs, traces, and event history are crucial for:
    - Debugging user-reported issues ("Why didn't I get a reminder?")
    - Compliance and trust ("Show me when this service was logged.")
    - ML training ("Track how recommendations were made").
  - ❌ **Anti-pattern**: "Silent failures" where operations fail without logging or user feedback

## Design Patterns

Key patterns apply to an enterprise-style system (mobile app + web + microservices + integrations). **Priority system prevents premature optimization** - implement patterns when they solve actual problems, not theoretical ones.

### **🟢 Phase 1: MVP Patterns (Implement Now)**
These solve current problems and provide immediate value without adding complexity.

| **Pattern**            | **Current Relevance**                                                                  | **Immediate Benefit**                                    |
| ---------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **State**              | Vehicle status tracking: *In Compliance* → *Out of Compliance* → *Overdue*            | Clean status logic, consistent UI state management       |
| **Observer (Simple)**  | Service logging triggers reminder updates, status recalculation                       | Real-time updates without complex event systems          |

### **🟡 Phase 2: Growth Patterns (6-12 months)**
Implement when user base grows and feature complexity increases.

| **Pattern**                 | **Growth-Phase Relevance**                                                     | **Scaling Benefit**                                      |
| --------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Decorator**               | Optional features per vehicle: warranty tracking, emissions compliance, fleet  | Add features without rewriting core vehicle logic        |
| **Chain of Responsibility** | Notification escalation: in-app → email → SMS for overdue maintenance         | Flexible notification flows, easier to extend later      |
| **Saga**                    | Complex onboarding: account → payment → first vehicle → program setup         | Handles partial failures gracefully in multi-step flows |

### **🔴 Phase 3: Scale Patterns (Enterprise/High-Volume)**
Only implement when specific technical constraints emerge.

| **Pattern**               | **Enterprise Relevance**                                                             | **Scale Benefit**                                        | **⚠️ When NOT to Use**                                |
| ------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| **CQRS**                  | Separate write (logging) from read (dashboards) when read queries become expensive   | Faster dashboards, optimized analytics                  | Until read/write performance becomes actual bottleneck |
| **Event Sourcing**        | Full audit trail for enterprise customers, regulatory compliance                     | Complete history, audit trail, rollback capability      | Unless audit trails are legally required             |
| **Circuit Breaker**       | Protect from external API failures (manufacturer data, payment processing)          | Reliability when dependent services fail                 | Until you have actual external dependencies failing   |
| **Message Broker**        | Connect microservices for notifications, billing, analytics across team boundaries  | Decoupled services, easier team scaling                 | Until you have multiple teams/services to coordinate |

### **Pattern Progression Examples**
Start simple, evolve when needed:

```typescript
// Observer: Simple → Event-driven → Full pub/sub
// Phase 1: Direct React state updates
setVehicleStatus('overdue');
setReminders(calculateReminders(vehicle));

// Phase 2: Simple event emitter
vehicleEvents.emit('statusChanged', { vehicleId, status: 'overdue' });

// Phase 3: Message broker (only if needed)
messageBroker.publish('vehicle.status.changed', payload);
```

```typescript
// State: Enum → State machine → Complex orchestration  
// Phase 1: Simple status enum
type VehicleStatus = 'compliant' | 'due_soon' | 'overdue';

// Phase 2: State machine with transitions
const statusMachine = createMachine({
  states: { compliant: { on: { SERVICE_DUE: 'due_soon' } } }
});
```

### **Anti-Pattern Prevention**
- **Don't implement patterns until you feel the pain** - complexity without benefit hurts maintainability
- **Start with the simplest solution** that works, then evolve
- **Measure before optimizing** - use patterns to solve actual performance/complexity issues
- **One pattern at a time** - don't introduce multiple patterns simultaneously


## Architecture

### Tech Stack
- **Frontend**: React Native with Expo managed workflow
- **Language**: TypeScript (strict mode)  
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **State Management**: Redux Toolkit + RTK Query (planned)
- **Navigation**: React Navigation v6
- **Internationalization**: react-i18next (currently mocked)

### Key Patterns
- **Repository Pattern**: Data access abstraction in `src/repositories/` enables backend flexibility
- **Security-First Design**: All operations require authentication via `ProtectedRoute.tsx`
- **Component-Based Architecture**: Reusable components in `src/components/common/`

## Design System

### Premium Automotive Visual Identity
GarageLedger features a sophisticated automotive-inspired design system that creates a professional, cohesive user experience with emotional connection to car culture.

#### Color Palette
- **Engine Blue** `#1e40af` - Primary brand color (trust, reliability, precision)
- **Racing Green** `#166534` - Secondary color (efficiency, eco-friendly) 
- **Performance Red** `#dc2626` - Accent color (action, power, excitement)
- **Oil Black** `#111827` - Premium text color (deep, sophisticated)
- **Titanium Gray** `#374151` - Secondary text (modern automotive)
- **Chrome Silver** `#9ca3af` - Subtle accents and hints

#### Strategic Alert System
- **Performance Red** `#dc2626` → Positive actions, CTAs, brand elements
- **Signal Orange** `#ea580c` → Warnings, maintenance alerts (like dashboard warning lights)
- **Critical Red** `#b91c1c` → Errors, critical failures
- **Racing Green** `#166534` → Success states, achievements
- **Electric Blue** `#0284c7` → Modern info states, technology features

#### Typography Hierarchy
Enhanced typography system with automotive precision - **[Complete Reference: TYPOGRAPHY_GUIDELINES.md](docs/TYPOGRAPHY_GUIDELINES.md)**:
- **Display** - Hero/display text for major branding elements
- **Title** - Page titles and screen headers
- **Heading** - Section headings with proper hierarchy
- **Subheading** - Sub-section organization and form groups
- **Body/BodyLarge/BodySmall** - Optimized reading experience for content
- **Caption/Label** - UI labels and form field labels
- **Button** - Interactive element text with proper emphasis
- **Overline** - Small caps text for category labels and metadata

#### Premium Shadows & Depth
Oil Black shadow system for sophisticated visual hierarchy:
- **xs/sm** - Subtle card depth and button elevation  
- **md/lg** - Important content and floating elements
- **xl** - Modal and overlay emphasis
- **Special**: `floating` and `pressed` states for interaction feedback

#### Professional Icon System
Custom SVG automotive icon collection replacing emoji:
- **Functional Icons**: Maintenance, Fuel, Modifications, Reminders, Activity, Camera, Mail
- **Brand Integration**: Consistent sizing, coloring, and automotive theming
- **Accessibility**: Proper contrast and sizing for all interaction states

#### Component Variants
- **Cards**: `default`, `elevated`, `floating`, `outlined`, `filled` with automotive shadows
- **Buttons**: Premium shadows on solid variants, subtle depth on outlined
- **Typography**: Semantic variants for consistent hierarchy
- **Navigation**: Safe area handling for progress indicators and headers

## Development Commands

```bash
# Development
npm start                    # Start Expo dev server
npm run ios                  # iOS simulator
npm run android             # Android emulator

# macOS Networking (for finicky localhost issues)
npm start -- --host tunnel  # External access via tunnel
npm start -- --host lan     # Local network access

# Testing  
npm test                    # Run unit tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report

# Code Quality
npm run lint                # ESLint
npm run type-check          # TypeScript check (always passes)
npm run format              # Prettier formatting
```

## Code Structure

### Core Directories
- `src/components/common/` - Reusable UI components (Button, Card, Input, PhotoPicker, Typography)
- `src/components/icons/` - Professional automotive SVG icon system
- `src/repositories/` - Data access layer with Firebase implementation
- `src/screens/` - App screens with navigation integration
- `src/services/` - External service integrations (Firebase auth)
- `src/contexts/` - React contexts (AuthContext)
- `src/utils/theme.ts` - Comprehensive design system (colors, typography, shadows)

### Security Architecture
- **Authentication**: Enforced via `AuthContext.tsx` and `ProtectedRoute.tsx`
- **Data Isolation**: All Firestore operations filtered by `userId`
- **Repository Security**: `SecureFirebaseVehicleRepository.ts` implements authentication checks

### Testing Strategy
- **Framework**: Jest + React Native Testing Library
- **Coverage**: Security tests, component tests, screen tests, service tests
- **Focus Areas**: Authentication flows, repository security, UI functionality

## Data Models

```typescript
interface Vehicle {
  id: string;
  userId: string;        // Required for data isolation
  make: string;
  model: string; 
  year: number;
  vin?: string;
  mileage: number;
  notes?: string;
  photoUri?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Shop Service Wizard Implementation

**Status**: ✅ Core functionality complete, minor UX refinements pending

### Architecture
The Shop Service wizard follows a progressive modal approach using React Navigation patterns:

```typescript
// Located: src/components/common/ShopServiceWizard.tsx
type WizardStep = 'basic' | 'services' | 'photos' | 'notes';

interface ShopServiceData {
  date: Date;
  mileage: string;
  totalCost: string;
  services: SelectedService[];
  photos: string[];
  notes: string;
}
```

### Implementation Pattern
- **Step Management**: State-driven step progression with validation
- **Modal Architecture**: Full-screen modal with step indicators
- **Data Validation**: Each step validates before allowing progression
- **Integration**: Auto-saves to MaintenanceLog on completion

### User Flow
```
Log Maintenance → "Shop" → 
Step 1: Basic Info (date, mileage, cost) → 
Step 2: Service Categories → 
Step 3: Receipt & Photos (with Pro upgrade prompts) → 
Step 4: Notes & Summary → 
Auto-save & Return
```

### Key Features Implemented
- **Progressive Disclosure**: One focused task per step
- **Step Indicators**: Visual progress with text above circles
- **Upgrade Prompts**: Gentle Pro tier upselling for photos/receipts
- **Cost Analytics Integration**: Captures totalCost for vehicle analytics
- **Service Categories**: Reuses MaintenanceCategoryPicker system
- **Professional Polish**: Clean typography, proper spacing, automotive theme

### Known Issues & Future Improvements
- **iOS Datepicker UX**: Currently requires two taps (input field → date button → picker)
- **Professional Icons**: Temporary emoji usage due to runtime compatibility
- **Cost Analytics**: Data flows to wizard but Vehicle Details analytics needs debugging

### Development Notes
- **Modal Pattern**: Can be reused for future multi-step flows
- **Validation Strategy**: Per-step validation prevents incomplete data
- **Theme Integration**: Uses automotive color palette and typography system
- **Error Handling**: Graceful fallbacks for incomplete data

## Current Development Roadmap

### Completed ✅
- **Shop Service Wizard Core**: Full 4-step progressive flow implemented
- **Professional UX Polish**: Clean typography, proper spacing, step indicators
- **Service Integration**: MaintenanceCategoryPicker integration working
- **Data Flow**: Form data properly converts to MaintenanceLog format
- **Upgrade Prompts**: Pro tier upselling UI implemented
- **Log Maintenance Simplification**: Clean "Who Performed Maintenance" interface
- **Cost Analytics Foundation**: Basic analytics card with debug info

### In Progress 🔄
- **Cost Data Analytics**: Vehicle Details cost analytics needs debugging
- **iOS Datepicker UX**: Two-tap flow needs simplification

### Pending 📋
- **Professional Icons**: Replace emoji with custom SVG icons (after runtime fix)
- **DIY Service Flow**: Implement progressive wizard for DIY maintenance
- **Enhanced Cost Analytics**: Multi-metric dashboard with trends
- **Receipt Upload**: Pro tier photo/receipt functionality
- **Testing**: End-to-end wizard flow testing

### Next Priority
1. **Fix cost analytics data flow** from Shop Service to Vehicle Details
2. **Implement DIY service progressive flow** using Shop Service patterns
3. **Professional icon implementation** after resolving runtime compatibility

## Internationalization

- **Languages**: English (default), Spanish
- **Implementation**: react-i18next with AsyncStorage persistence  
- **Device Detection**: Automatic detection with graceful fallback to English
- **Files**: `src/i18n/locales/en.json`, `src/i18n/locales/es.json`
- **Language Toggle**: Intuitive bottom-placement with current language display
- **Persistence**: User language choice stored and maintained across sessions

## Firebase Configuration

- **Config**: `src/services/firebase/config.ts`
- **Auth**: `src/services/firebase/auth.ts`  
- **Security Rules**: Deployed with complete user data isolation
- **Mock Repository**: Available at `src/services/firebase/mockRepository.ts`

## Development Notes

### Repository Pattern Usage
When adding new data entities, create:
1. Interface in `src/repositories/BaseRepository.ts`
2. Firebase implementation following `FirebaseVehicleRepository.ts`
3. Secure wrapper following `SecureFirebaseVehicleRepository.ts`

### Component Development
- **Theme System**: Use comprehensive theme from `src/utils/theme.ts` (colors, typography, shadows)
- **Typography**: Use semantic variants (`display`, `title`, `heading`, `body`, etc.)
- **Icons**: Import from `src/components/icons/` automotive icon collection
- **Cards**: Choose appropriate variant (`elevated`, `floating`, `outlined`, `filled`)  
- **Colors**: Use automotive color palette (Engine Blue, Racing Green, Performance Red)
- **Shadows**: Apply Oil Black shadow system for premium depth
- **Patterns**: Follow existing component patterns in `src/components/common/`
- **Types**: Implement TypeScript interfaces from `src/types/index.ts`

### Authentication Requirements
- All screens except Login/SignUp must use `ProtectedRoute`
- All repository operations must include userId filtering
- Use `AuthContext` for authentication state management