# Programs Feature Implementation Roadmap

## Overview
This roadmap implements the Programs feature as a separate project from the Navigation Restructure. Programs allows users to create maintenance schedules and assign them to vehicles for proactive maintenance management.

## Progress Summary
**Phase 2 Status**: 5 of 8 increments completed ✅ (63% complete)
- ✅ **Increment 1**: Programs data model & repository - COMPLETED
- ✅ **Increment 2**: Programs navigation integration - COMPLETED
- ✅ **Increment 3**: Programs list screen - COMPLETED
- ✅ **Increment 4**: Create program flow (Steps 1-2) - COMPLETED *(January 15, 2025)*
- ✅ **Increment 4.5**: Create program Step 3 service selection - **PRODUCTION READY** *(January 18, 2025)*
- 📋 **Increments 5-8**: Ready for implementation

**🎯 Latest Achievement**: Step 3 service selection with progressive UX, bottom sheet configuration, and curated service library

## Phase 2: Programs Feature Development
**Goal**: Add comprehensive maintenance program management to GarageLedger
**Timeline**: 4-6 weeks  
**Risk Level**: Medium (new feature with complex business logic)

---

## Increment 1: Programs Data Model & Repository ⏱️ 2-3 hours ✅ COMPLETED
**Objective**: Create foundational data structures for Programs
**Risk**: Low (data layer setup)
**Status**: ✅ Completed - Foundational Programs data layer successfully implemented

### Tasks:
- [x] Design Program interface with TypeScript types
- [x] Create ProgramRepository interface following existing patterns
- [x] Implement FirebaseProgramRepository with basic CRUD
- [x] Create SecureProgramRepository with authentication checks
- [x] Add Program-to-Vehicle relationship modeling
- [x] Write unit tests for repository layer

### Success Criteria:
- [x] Program data model defined and documented
- [x] Repository pattern implemented consistently
- [x] Authentication and data isolation working
- [x] Clean TypeScript compilation
- [x] Repository tests passing (12/12 tests pass)

### Implementation Details:
- **Data Models**: Created `MaintenanceProgram`, `ProgramTask`, and `ProgramAssignment` interfaces
- **Repository Pattern**: Implemented consistent with existing vehicle/maintenance patterns
- **Firebase Integration**: Full CRUD operations with Firestore collections (`programs`, `program_assignments`)
- **Security Layer**: `SecureProgramRepository` enforces user authentication and data ownership
- **Business Logic**: Program-vehicle assignment, activation/deactivation, user filtering
- **Testing**: Comprehensive unit tests validating data models, interfaces, and business logic
- **Files Created**:
  - `src/types/index.ts` - Program data models
  - `src/repositories/ProgramRepository.ts` - Repository interfaces
  - `src/repositories/FirebaseProgramRepository.ts` - Firebase implementation
  - `src/repositories/SecureProgramRepository.ts` - Security wrapper
  - `__tests__/repositories/ProgramRepository.test.ts` - Unit tests

### Program Data Model:
```typescript
interface MaintenanceProgram {
  id: string;
  userId: string;
  name: string;
  description?: string;
  tasks: ProgramTask[];
  assignedVehicleIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProgramTask {
  id: string;
  name: string;
  description?: string;
  category: string;
  intervalType: 'mileage' | 'time';
  intervalValue: number;
  estimatedCost?: number;
  reminderOffset?: number;
}
```

---

## Increment 2: Programs Navigation Integration ⏱️ 1-2 hours ✅ COMPLETED
**Objective**: Add Programs to bottom tab navigation
**Risk**: Low (navigation addition)
**Status**: ✅ Completed - Programs tab successfully integrated into navigation

### Tasks:
- [x] Add Programs tab to AppNavigator.tsx
- [x] Design Programs tab icon (clipboard/checklist theme)
- [x] Update navigation order: Vehicles → Insights → Programs → Settings
- [x] Add Programs translations (English/Spanish)
- [x] Create placeholder Programs screen
- [x] Test navigation flow

### Success Criteria:
- [x] Programs tab visible in bottom navigation
- [x] Icon consistent with automotive design system (ClipboardIcon with lines)
- [x] Navigation works smoothly (clean TypeScript compilation and app startup)
- [x] Translations complete for both languages
- [x] No navigation errors or crashes

### Implementation Details:
- **ClipboardIcon**: Created professional SVG clipboard icon with maintenance program lines
- **Navigation Integration**: Added Programs between Insights and Settings tabs (4-tab navigation)
- **Programs Screen**: Created placeholder screen with "Coming Soon" message and feature preview
- **Translations**: Added complete English/Spanish translations for Programs section
- **Icon System**: Extended TabIcon component to support 'programs' option
- **User Experience**: Programs screen shows upcoming features and provides navigation to existing functionality
- **Files Modified**:
  - `src/components/icons/AutomotiveIcons.tsx` - Added ClipboardIcon
  - `src/components/icons/index.ts` - Exported ClipboardIcon
  - `src/navigation/AppNavigator.tsx` - Added Programs tab and icon
  - `src/screens/ProgramsScreen.tsx` - Created placeholder screen
  - `src/i18n/locales/en.json` - Added Programs translations
  - `src/i18n/locales/es.json` - Added Programs Spanish translations

---

## Increment 3: Programs List Screen ⏱️ 2-3 hours  
**Objective**: Create main Programs management screen
**Risk**: Medium (UI/UX design)

### Tasks:
- [ ] Create ProgramsScreen.tsx with list view
- [ ] Design program card component
- [ ] Add empty state for no programs
- [ ] Implement search/filter functionality
- [ ] Add floating action button for "Create Program"
- [ ] Style with automotive design system (cards, typography, colors)

### Success Criteria:
- [ ] Programs list displays correctly
- [ ] Empty state guides users to create first program
- [ ] Search functionality working
- [ ] Visual design consistent with app theme
- [ ] Performance acceptable with many programs

---

## Increment 4: Create Program Flow ⏱️ 3-4 hours ✅ COMPLETED + **ENHANCED** 🎯
**Objective**: Allow users to create maintenance programs  
**Risk**: Medium (complex form logic)
**Status**: ✅ Completed + **Major UX Enhancement** *(January 15, 2025)*

### Original Tasks:
- [x] Create AddProgramScreen.tsx
- [x] Build program creation form (name, description)
- [x] Implement task creation/editing within program
- [x] Add task interval configuration (mileage/time)
- [x] Include category selection for tasks
- [x] Add form validation and error handling

### **🎯 UX Enhancement Tasks (January 15, 2025):**
- [x] **Two-Screen Flow**: Split into logical vehicle selection → program details flow
- [x] **Modal Pattern**: Implemented focused modal for service reminder creation
- [x] **Progress Indicators**: Added progress bars consistent with onboarding design
- [x] **Category Integration**: Fixed category picker to match Log Maintenance exactly
- [x] **UI Polish**: Removed redundant labels, improved button text, enhanced guidance
- [x] **Firestore Fix**: Resolved undefined value save errors for production reliability

### Success Criteria:
- [x] Program creation flow works end-to-end
- [x] Tasks can be added/removed/edited
- [x] Form validation prevents invalid data
- [x] Created programs appear in list
- [x] Data persists correctly to Firebase
- [x] **UX Excellence**: No scrolling confusion, intuitive modal flow, clear progress

### Implementation Details:

#### **Original Implementation:**
- **AddProgramScreen.tsx**: Comprehensive program creation interface with multi-step form flow
- **Program Form**: Program name, description with proper validation and user feedback
- **Task Management**: Dynamic task creation with full CRUD operations within the program form
- **Category Integration**: Full maintenance category system integration with comprehensive picker interface
- **Interval Configuration**: Mileage/time interval selection with proper validation and UI feedback
- **Form Validation**: Complete validation covering all required fields with localized error messages

#### **🎯 UX Enhancement (January 15, 2025):**
- **Two-Screen Architecture**: 
  - `CreateProgramVehicleSelectionScreen.tsx` - Step 1: Vehicle selection with progress indicator
  - `CreateProgramDetailsScreen.tsx` - Step 2: Program details with modal integration
- **Modal Component**: `AddServiceReminderModal.tsx` - Focused service reminder creation
- **Progress Component**: `ProgressBar.tsx` - Reusable progress indicator
- **UX Flow**: Vehicle selection → Program details → Modal for service addition → Return to details
- **Problem Solved**: Eliminated scrolling confusion when adding multiple service reminders
- **Industry Pattern**: Standard modal UX following mobile app best practices

#### **Technical Files:**
- **Files Created**:
  - `src/screens/AddProgramScreen.tsx` - Original single-screen implementation
  - `src/screens/CreateProgramVehicleSelectionScreen.tsx` - **Enhanced Step 1**
  - `src/screens/CreateProgramDetailsScreen.tsx` - **Enhanced Step 2**
  - `src/components/common/AddServiceReminderModal.tsx` - **Modal component**
  - `src/components/common/ProgressBar.tsx` - **Progress indicator**
  - `__tests__/screens/AddProgramScreen.test.ts` - Comprehensive test suite (15 tests)
- **Files Enhanced**:
  - `src/navigation/AppNavigator.tsx` - Updated to support two-screen flow
  - `src/screens/ProgramsScreen.tsx` - Navigation to new flow
  - `src/i18n/locales/en.json` - Enhanced translations
  - `src/i18n/locales/es.json` - Enhanced Spanish translations
- **User Experience**: **Premium mobile UX** with focused tasks, clear progress, and no UX friction

---

## Increment 4.5: Create Program Step 3 - Service Selection ⏱️ 4+ hours ✅ **PRODUCTION READY**
**Objective**: Complete Step 3 with progressive UX service selection and bottom sheet configuration  
**Risk**: High (React Native Modal compatibility, UX complexity)
**Status**: ✅ **PRODUCTION READY** *(January 18, 2025)*

### **Progressive UX Implementation Tasks:**
- [x] **Card-Based Service Selection**: Convert flat list to engaging 2x4 service card grid
- [x] **Curated Service Library**: 8 professional automotive services with realistic intervals
- [x] **Bottom Sheet Configuration**: Mobile-first interval setup with radio buttons
- [x] **Visual State Management**: Clear configured vs unconfigured card indicators
- [x] **Professional Polish**: Number formatting (10,000), state management, validation
- [x] **Technical Architecture**: Map-based configuration storage, TypeScript safety

### **Technical Problem Resolution:**
- [x] **React Native Modal Issues**: Systematic debugging of 0.79.5 + React 19.0.0 compatibility
- [x] **KeyboardAvoidingView Conflicts**: Identified and resolved gray overlay blocking issue
- [x] **Incremental Development**: Established working foundation before adding complexity
- [x] **Version Compatibility**: Adapted approach for locked environment constraints

### Success Criteria:
- [x] **Progressive UX**: Basic mode fully functional with curated services
- [x] **Bottom Sheet UX**: Professional mobile-first configuration interface
- [x] **Service Configuration**: Flexible intervals (mileage, time, whichever-first)
- [x] **Visual Feedback**: Clear card states and configuration summaries
- [x] **Technical Excellence**: Clean TypeScript, efficient state management
- [x] **Mobile Optimization**: Touch-friendly interface with proper accessibility

### **Curated Service Library Implemented:**
1. **Oil & Filter Change** - Every 10,000 miles or 12 months (whichever first)
2. **Tire Rotation** - Every 5,000 miles  
3. **Engine Air Filter** - Every 20,000 miles
4. **Cabin Air Filter** - Every 15,000 miles or 12 months
5. **Brake Fluid** - Every 2 years (time-based)
6. **Coolant System** - Every 4 years (time-based)
7. **Spark Plugs** - Every 60,000 miles (mileage-based)
8. **Brake Pads & Rotors** - Every 25,000 miles (mileage-based)

### Implementation Details:
- **Progressive UX Pattern**: Basic mode (curated) → Advanced mode (planned full categories)
- **Bottom Sheet Architecture**: Modal with backdrop, handle, scrollable content, fixed actions
- **State Management**: Map-based service configurations for performance
- **Component Reusability**: ServiceConfigBottomSheet ready for Advanced mode
- **Number Formatting**: Locale-aware formatting for automotive values
- **Error Resolution**: Systematic revert-and-rebuild approach for complex issues

### **Files Created/Enhanced**:
- **Enhanced**: `src/screens/CreateProgramServicesScreen.tsx` - Complete Step 3 with progressive UX
- **Component**: `ServiceConfigBottomSheet` - Reusable interval configuration interface
- **Patterns**: Service card templates, radio button configurations, bottom sheet layouts
- **Utilities**: Number formatting, service configuration management
- **Documentation**: Session accomplishments, project status updates

### **Strategic Value:**
- **Competitive UX**: Professional mobile-first patterns matching industry leaders
- **User Experience**: Guides casual users while preparing power user features  
- **Technical Foundation**: Establishes patterns for Advanced mode and future features
- **Problem Solving**: Demonstrates systematic debugging and incremental development

### **Next Phase Options:**
- **Option A**: Complete basic Programs workflow (Increments 5-8)
- **Option B**: Advanced mode implementation (full category/subcategory system with tabs)
- **Option C**: Program execution and reminders (natural next business feature)

### **📋 Advanced Programs UX Strategy (Future Implementation):**
**Progressive Disclosure Pattern**: **Tabs-based** approach for Basic | Advanced modes

#### **Design Rationale:**
- **Commercial Strategy**: Perfect for freemium model (Advanced tab = paid feature)
- **User Intent-Based**: Casual users stay on Basic, power users jump to Advanced
- **Consistent Pattern**: Reusable across Create Program and Vehicle Details screens
- **Mobile UX**: Follows industry best practices (banking, fitness, business apps)
- **Discovery**: Power users immediately see advanced capabilities exist

#### **Implementation Approach:**
- **Tab Design**: Segmented control style `[ Basic | Advanced ]`
- **Default State**: Basic tab active for new users
- **Content Strategy**: Basic feels complete, Advanced provides full power user experience
- **Progressive Unlock**: Advanced tab can be gated by vehicle count or paid tier

#### **Cross-Screen Consistency:**
- **Create Program**: Basic (curated services) | Advanced (full maintenance categories)
- **Vehicle Details**: Quick Wins (cards) | Control Center (analytics & management)
- **Future screens**: Overview | Pro features pattern

---

## Increment 5: Vehicle Assignment ⏱️ 2-3 hours
**Objective**: Allow assigning programs to vehicles
**Risk**: Medium (relationship management)

### Tasks:
- [ ] Create vehicle selection screen for programs
- [ ] Implement multi-select vehicle assignment
- [ ] Show assigned programs in vehicle detail pages
- [ ] Handle program assignment/unassignment
- [ ] Update vehicle screens to show active programs

### Success Criteria:
- [ ] Programs can be assigned to multiple vehicles
- [ ] Vehicle detail pages show assigned programs
- [ ] Assignment changes persist correctly
- [ ] UI clearly shows assignment status
- [ ] No data consistency issues

---

## Increment 6: Program Management ⏱️ 2-3 hours
**Objective**: Edit and manage existing programs
**Risk**: Low (standard CRUD operations)

### Tasks:
- [ ] Create EditProgramScreen.tsx
- [ ] Implement program editing functionality
- [ ] Add program deletion with confirmation
- [ ] Handle task modification within programs
- [ ] Update program activation/deactivation

### Success Criteria:
- [ ] Programs can be edited after creation
- [ ] Deletion works with proper confirmation
- [ ] Changes sync to assigned vehicles
- [ ] Active/inactive state management working
- [ ] No data loss during edits

---

## Increment 7: Program Status Tracking ⏱️ 3-4 hours
**Objective**: Track program compliance and show status
**Risk**: Medium (business logic complexity)

### Tasks:
- [ ] Calculate program task due dates based on vehicle mileage/time
- [ ] Create program status indicators (up to date, due soon, overdue)
- [ ] Add program status to Insights screen
- [ ] Implement program completion tracking
- [ ] Link program tasks to maintenance logs

### Success Criteria:
- [ ] Program status calculated accurately
- [ ] Status indicators visible in relevant screens
- [ ] Insights screen shows program compliance overview
- [ ] Task completion properly tracked
- [ ] Business logic handles edge cases

---

## Increment 8: Program Reminders Integration ⏱️ 2-3 hours
**Objective**: Generate reminders from program schedules
**Risk**: Medium (integration with existing reminders)

### Tasks:
- [ ] Generate automatic reminders from program tasks
- [ ] Integrate with existing reminder system
- [ ] Handle program-based vs manual reminders
- [ ] Add program context to reminder notifications
- [ ] Test reminder generation accuracy

### Success Criteria:
- [ ] Program tasks generate appropriate reminders
- [ ] Reminders system handles both manual and program reminders
- [ ] Notifications include program context
- [ ] Reminder timing accurate based on intervals
- [ ] No duplicate or missing reminders

---

## Testing Strategy

### After Each Increment:
1. **Functional Testing**: Programs functionality works as expected
2. **Integration Testing**: Programs integrate with existing features (vehicles, maintenance logs, reminders)
3. **Performance Testing**: No degradation with multiple programs/vehicles
4. **Cross-Platform Testing**: Works on iOS and Android
5. **Localization Testing**: All text properly translated

### Final Phase 2 Testing:
1. **End-to-End Programs Flow**: Create program → assign to vehicle → track status → complete tasks
2. **Business Logic Testing**: Complex scenarios with multiple programs and vehicles
3. **Data Integrity Testing**: Program assignments and completions persist correctly
4. **User Acceptance Testing**: Programs feature feels intuitive and valuable

---

## Rollback Strategy

### If Issues Arise:
1. **Increments 1-2**: Remove Programs navigation tab, revert to 3-tab structure
2. **Increments 3-6**: Hide Programs screens, functionality remains in database
3. **Increments 7-8**: Disable program status/reminder generation, manual reminders continue working

---

## Future Phase 3: Advanced Programs (6-8 weeks)
- Multi-vehicle program templates
- Cost forecasting based on program schedules
- Program sharing between users
- Integration with service provider APIs
- Advanced compliance reporting

---

**Created**: 2025-08-14
**Status**: Ready to begin when Navigation Restructure Phase 1 complete
**Dependencies**: Navigation Restructure Phase 1 completion