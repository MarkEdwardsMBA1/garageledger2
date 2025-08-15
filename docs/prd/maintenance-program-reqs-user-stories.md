# Maintenance Program Enhancement Requirements & User Stories

## Overview
This document outlines the atomic requirements and user stories for enhancing the Create Program flow based on user feedback. The implementation is broken down into phases to minimize risk and maximize incremental value.

**Date**: 2025-08-14  
**Status**: In Progress  
**Implementation Strategy**: Atomic increments with immediate testing

---

## Phase A: Safe UI Updates (15-20 mins total)
*Low risk, immediate user value, isolated changes*

### A.1 - UI Terminology Update ✅ COMPLETE
**User Story**: As a user, I want the interface to use "Service Reminders" instead of "Tasks" so the terminology is clearer and more intuitive for maintenance scheduling.

**Acceptance Criteria**:
- [x] All UI labels show "Service Reminders" instead of "Tasks"
- [x] Button text updated: "Add Task" → "Add Service Reminder"
- [x] Form titles updated: "Add New Task" → "Add New Service Reminder"
- [x] Field labels updated: "Task Name" → "Service Reminder Name"
- [x] Validation messages use new terminology
- [x] Variable names updated for consistency
- [x] Clean TypeScript compilation
- [x] Zero functional changes (pure terminology update)

**Risk**: None  
**Time**: 3 minutes  
**Value**: Immediate clarity improvement

### A.2 - Time Unit Enhancement ✅ COMPLETE
**User Story**: As a user, I want to set maintenance intervals in months or years instead of days, so I can create realistic maintenance schedules (e.g., "6 months" instead of "180 days").

**Acceptance Criteria**:
- [x] Replace "Days" button with "Months" and "Years" options
- [x] Update interval type selector to show: Miles | Months | Years  
- [x] Add translations for months/years in both languages
- [x] Display logic converts between units appropriately (smart placeholders)
- [x] Form validation accepts months/years values
- [x] Existing functionality unchanged for mileage intervals
- [x] Clean TypeScript compilation
- [x] Professional 3-button layout with equal spacing

**Risk**: Low  
**Time**: 4 minutes  
**Value**: More intuitive time intervals

### A.3 - Form Field Reordering ✅ COMPLETE
**User Story**: As a user, I want to select the maintenance category first when creating a service reminder, so I can follow a logical flow (what service → when → how much).

**Acceptance Criteria**:
- [x] Move Category field to top of "Add Service Reminder" form
- [x] Category appears before Service Reminder Name
- [x] Auto-suggestion of name based on category still works
- [x] Form layout remains visually balanced
- [x] Logical flow: Category → Name → Description → Interval → Cost
- [x] Clean TypeScript compilation

**Risk**: Very Low  
**Time**: 1 minute (faster than estimated!)  
**Value**: Better UX flow

### A.4 - Validation Message Updates ✅ COMPLETE
**User Story**: As a user, I want validation messages to use the new "Service Reminder" terminology consistently, so the interface feels polished and professional.

**Acceptance Criteria**:
- [x] All validation alerts use "Service Reminder" terminology
- [x] Error messages are clear and specific
- [x] Bilingual validation messages updated (translations already consistent)
- [x] No functional validation logic changes
- [x] Messages remain user-friendly and actionable
- [x] Professional consistency maintained

**Risk**: None  
**Time**: 1 minute  
**Value**: Professional consistency

### A.5 - Polish Add Service Reminders Box Layout ✅ COMPLETE
**User Story**: As a user, I want the "Add Service Reminders" box to have a clean, professional layout with proper text flow and button placement, so the interface feels polished and easy to use.

**Acceptance Criteria**:
- [x] Title sits alone at the top with full-width text wrapping
- [x] Subtitle stretches full width with elegant text wrapping
- [x] Button centered at bottom of box with proper spacing
- [x] Changed button from outline to primary (Engine Blue) variant
- [x] Professional vertical layout with proper spacing hierarchy
- [x] No layout conflicts or text overlapping
- [x] Clean TypeScript compilation

**Risk**: None  
**Time**: 2 minutes  
**Value**: Professional UI polish

### A.6 - Button Design Policy ✅ COMPLETE
**User Story**: As a developer, I want a consistent button design policy across all forms, so users have a predictable and professional interface experience.

**Acceptance Criteria**:
- [x] **PRIMARY BUTTONS**: Engine Blue (`primary` variant) for main actions
  - Form submissions: "Add Vehicle", "Create Program", "Log Maintenance"
  - Navigation progression: "Get Started", "Continue", onboarding flows
  - Positive actions: "Add Service Reminder" within forms
- [x] **SECONDARY BUTTONS**: White with border (`outline` variant) for alternative actions
  - Cancel actions: "Cancel" in forms and modals
  - Secondary navigation: "Skip for now", alternative paths
  - Less emphasized actions within forms
- [x] **CONTEXT-APPROPRIATE**: Buttons follow consistent hierarchy patterns
  - One primary button per screen/section for main action
  - Supporting actions use outline variant
  - Destructive actions use `danger` variant (red)
- [x] **VISUAL CONSISTENCY**: All forms follow same button patterns
  - AddVehicleScreen, AddProgramScreen, AddMaintenanceLogScreen aligned
  - Modal dialogs follow same primary/outline pattern
  - Professional automotive design system maintained

**Risk**: None  
**Time**: Documentation only (0 minutes)  
**Value**: Design system consistency and developer guidance

---

## Phase B: Progressive UX Enhancement (Based on Low-Fi Mockup) (45-60 mins total)
*New functionality implementing progressive disclosure UX design, higher value, incremental complexity*

### B.1 - Vehicle Data Loading & Selection UI
**User Story**: As a user, I want to select vehicles at the top of the form before anything else, so I can easily choose which vehicles my maintenance program applies to and follow a logical creation flow.

**Acceptance Criteria**:
- [ ] Load user vehicles on screen mount with loading states
- [ ] Replace "Program Information" section with "Select Vehicle" at top of form
- [ ] Multi-select dropdown component for vehicles
- [ ] Show vehicle display name, with make/model/year as fallback
- [ ] Support selecting multiple vehicles with clear visual indication
- [ ] Handle empty vehicle list gracefully with "Add a vehicle first" message
- [ ] Professional styling consistent with design system
- [ ] Vehicle selection appears above Program Name field

**Risk**: Low-Medium  
**Time**: 10-12 minutes  
**Value**: Core progressive UX foundation + vehicle assignment

### B.2 - Smart Program Naming Below Vehicle Selection
**User Story**: As a user, I want the program name to be automatically suggested based on my selected vehicle(s), so I don't have to think of names and the programs are more meaningful.

**Acceptance Criteria**:
- [ ] Program Name field appears below Vehicle Selection
- [ ] Single vehicle: suggest "Vehicle Name Maintenance" or "Make Model Year Maintenance"
- [ ] Multiple vehicles: suggest "Multi-Vehicle Maintenance Program"
- [ ] User can override suggested names (input remains editable)
- [ ] Name updates dynamically when vehicle selection changes
- [ ] Fallback to generic name if no vehicles selected
- [ ] Logic is isolated and testable
- [ ] Smooth placeholder text transitions

**Risk**: Low  
**Time**: 6-8 minutes  
**Value**: Better UX, personalized experience

### B.3 - Progressive Service Interval Selector (Core UX Innovation)
**User Story**: As a user, I want to define service intervals through a progressive interface that only shows relevant options based on my interval type choice, so the form is never overwhelming and matches how I think about maintenance.

**Acceptance Criteria**:
- [ ] "Define Service Intervals" section with clear title
- [ ] **Interval Selector** with 3 primary options:
  - "Mileage" - for distance-based intervals
  - "Time" - for time-based intervals  
  - "Mileage and Time" - for whichever occurs first logic
- [ ] Clean button-group selector (similar to current Miles/Months/Years)
- [ ] Only one option selectable at a time
- [ ] Selection triggers progressive disclosure of relevant inputs
- [ ] Professional visual design consistent with form patterns

**Risk**: Medium  
**Time**: 8-10 minutes  
**Value**: Revolutionary UX improvement, progressive disclosure

### B.4 - Dynamic Mileage Input Section
**User Story**: As a user, when I select "Mileage" interval type, I want to see a simple input for miles, so I can specify distance-based maintenance (e.g., "every 5,000 miles").

**Acceptance Criteria**:
- [ ] Shows only when "Mileage" is selected in Interval Selector
- [ ] Clean input field: "Every ___ miles"
- [ ] Numeric validation with reasonable limits (100-100,000 miles)
- [ ] Placeholder shows common examples: "5000", "10000"
- [ ] Input appears smoothly below Interval Selector
- [ ] Hides other interval inputs (time-related)
- [ ] Maintains existing mileage logic and data model

**Risk**: Low  
**Time**: 4-5 minutes  
**Value**: Clean, focused mileage intervals

### B.5 - Enhanced Dynamic Time Input Section
**User Story**: As a user, when I select "Time" interval type, I want comprehensive time unit options (Days, Weeks, Months, Years) with numeric input, so I can create any time-based maintenance schedule that matches real-world needs.

**Acceptance Criteria**:
- [ ] Shows only when "Time" is selected in Interval Selector
- [ ] Two-part input system:
  - Numeric input: "Every ___"
  - Time unit selector: Days | Weeks | Months | Years
- [ ] 4-button time unit selector (extends current Months/Years to include Days/Weeks)
- [ ] Smart placeholders based on selected unit:
  - Days: "3", "7", "14" 
  - Weeks: "2", "4", "8"
  - Months: "3", "6", "12"
  - Years: "1", "2", "3"
- [ ] Validation appropriate to time unit (e.g., 1-365 days, 1-52 weeks)
- [ ] Hides other interval inputs (mileage-related)
- [ ] Updates ProgramTask timeIntervalUnit field

**Risk**: Medium  
**Time**: 10-12 minutes  
**Value**: Comprehensive time intervals matching real-world maintenance

### B.6 - Dual Interval Input (Mileage AND Time)
**User Story**: As a user, when I select "Mileage and Time", I want to see both mileage and time inputs so I can create "whichever occurs first" maintenance schedules (e.g., "5,000 miles OR 6 months, whichever comes first").

**Acceptance Criteria**:
- [ ] Shows only when "Mileage and Time" is selected
- [ ] Displays both input sections from B.4 and B.5:
  - Mileage input: "Every ___ miles"
  - Time input: "Every ___ Days|Weeks|Months|Years"
- [ ] Clear visual connection: "OR" between sections
- [ ] Both inputs required with validation
- [ ] Clear labeling: "Maintenance due every 5,000 miles OR 6 months, whichever comes first"
- [ ] Form layout accommodates dual inputs elegantly
- [ ] Validation ensures both mileage and time values provided
- [ ] Updates ProgramTask with intervalType: 'either' and both values

**Risk**: Medium-High  
**Time**: 12-15 minutes  
**Value**: Complete real-world maintenance scheduling capability

### B.7 - Data Model Enhancement & Save Logic
**User Story**: As a user, I want my progressive interval selections to be saved correctly with comprehensive time unit support, so the system can calculate due dates properly using my preferred scheduling method.

**Acceptance Criteria**:
- [ ] Enhance ProgramTask interface:
  - `intervalType: 'mileage' | 'time' | 'either'`
  - `timeIntervalUnit: 'days' | 'weeks' | 'months' | 'years'` (expanded)
  - `mileageIntervalValue?: number` (for either type)
  - `timeIntervalValue?: number` (for either type)
- [ ] Repository save logic handles all new time units
- [ ] Data validation at model level for all combinations
- [ ] Backward compatibility with existing months/years reminders
- [ ] Database persistence works correctly for all interval types
- [ ] No data corruption or loss during transitions

**Risk**: Medium-High  
**Time**: 8-10 minutes  
**Value**: Complete backend support for progressive UX

### B.8 - Integration Testing & Progressive UX Validation
**User Story**: As a developer, I want comprehensive tests for the progressive interval UX and expanded time units, so I can be confident the new scheduling system works correctly across all user paths.

**Acceptance Criteria**:
- [ ] Unit tests for all interval type combinations (mileage, time, either)
- [ ] Progressive disclosure tests (correct sections show/hide)
- [ ] Time unit conversion tests (days/weeks/months/years)
- [ ] Validation tests for all form states and combinations
- [ ] Data model tests for expanded fields and backward compatibility
- [ ] Integration tests for save/load operations across all interval types
- [ ] Edge case testing (empty values, invalid combinations, boundary conditions)
- [ ] User flow testing for progressive disclosure UX

**Risk**: Low  
**Time**: 10-12 minutes  
**Value**: Quality assurance for revolutionary UX enhancement

---

## Implementation Strategy

### Atomic Approach Benefits
1. **Risk Mitigation**: Each step can be tested independently
2. **Immediate Value**: Users see improvements every few minutes
3. **Rollback Safety**: Maximum 3-5 minutes of work to rollback
4. **Progress Visibility**: Clear progress tracking
5. **Stop Anytime**: Each phase/step leaves app in working state

### Testing Strategy
- **Per Increment**: TypeScript compilation + basic manual test
- **Per Phase**: Full feature test + user acceptance
- **Final**: Comprehensive automated test suite

### Success Metrics
- **Phase A**: Better terminology and UX flow (qualitative improvement)
- **Phase B**: Complete vehicle-assigned maintenance program creation (functional completion)

### Dependencies
- Phase A has no dependencies (can be done independently)
- Phase B.1 required before B.2-B.4
- Phase B.5 required before B.6-B.7
- Phase B.8 depends on completion of B.1-B.7

### Estimated Total Time
- **Phase A**: 15-20 minutes (4 increments)
- **Phase B**: 45-60 minutes (8 increments)
- **Total**: 60-80 minutes for complete enhancement

---

## User Value Proposition

### Before Enhancement
- Generic "Tasks" terminology
- Time intervals in confusing "days"
- No vehicle assignment
- Limited scheduling options

### After Enhancement
- Clear "Service Reminders" terminology
- Intuitive months/years time intervals
- Vehicle-specific maintenance programs
- Real-world "whichever occurs first" scheduling
- Auto-suggested program names
- Professional, logical user flow

This enhancement transforms the Create Program flow from a basic form into a sophisticated, user-friendly maintenance program builder that matches real-world maintenance scheduling needs.