# GitHub Issues Content

Copy and paste these issue contents when creating GitHub issues. Create epics first, then stories.

## 🎯 Epic Issues to Create

### Epic 1: MVP Foundation

**Title**: `[EPIC] MVP Foundation`  
**Labels**: `epic`, `phase: mvp`, `priority: critical`

```markdown
## Epic Description
Establish the core technical foundation for GarageLedger, including project setup, Firebase integration, design system, and navigation structure. This epic enables all future development.

## User Value
Developers can build features efficiently on a solid technical foundation with proper architecture, internationalization, and design consistency.

## Epic Acceptance Criteria
- [ ] React Native Expo project fully configured
- [ ] Firebase (Auth, Firestore, Storage) integrated and tested
- [ ] Repository pattern implemented with base interfaces
- [ ] i18n infrastructure setup with English/Spanish support
- [ ] Design system components created and documented
- [ ] Navigation structure implemented with bilingual support
- [ ] All core architecture decisions documented

## Related User Stories
- [ ] #XX GL-001: ✅ React Native Expo project setup (5 pts) - COMPLETE
- [ ] #XX GL-002: Firebase configuration (5 pts)
- [ ] #XX GL-003: ✅ Repository pattern implementation (8 pts) - COMPLETE
- [ ] #XX GL-004: Design system components (8 pts)
- [ ] #XX GL-005: Bottom tab navigation (5 pts)
- [ ] #XX GL-006: Complete Spanish localization (5 pts)

**Total Points**: 36 pts  
**Target Timeline**: Sprint 1-2 (Weeks 1-4)
```

---

### Epic 2: Vehicle Management

**Title**: `[EPIC] Vehicle Management`  
**Labels**: `epic`, `phase: mvp`, `priority: critical`

```markdown
## Epic Description
Complete vehicle CRUD functionality allowing users to add, view, edit, and delete their vehicles with photos, notes, and offline support. Foundation for all maintenance tracking.

## User Value
Users can manage their vehicle inventory with photos and details, providing the foundation for maintenance tracking and reminders.

## Epic Acceptance Criteria
- [ ] Users can add vehicles with make, model, year, VIN, mileage
- [ ] Vehicle list displays all user vehicles with search capability
- [ ] Users can edit and delete vehicles
- [ ] Photo upload and display functionality working
- [ ] Full offline functionality with sync when online
- [ ] All features work in English and Spanish

## Related User Stories
- [ ] #XX GL-007: Add vehicle form (8 pts)
- [ ] #XX GL-008: Vehicle list screen (5 pts)
- [ ] #XX GL-009: Edit vehicle form (5 pts)
- [ ] #XX GL-010: Delete vehicle functionality (3 pts)
- [ ] #XX GL-011: Vehicle photo upload (8 pts)
- [ ] #XX GL-012: Vehicle notes field (3 pts)
- [ ] #XX GL-013: Offline data persistence (8 pts)

**Total Points**: 40 pts  
**Target Timeline**: Sprint 2-3 (Weeks 3-6)

## Dependencies
- Depends on Epic 1 (MVP Foundation) being completed
```

---

### Epic 3: Maintenance Logging

**Title**: `[EPIC] Maintenance Logging`  
**Labels**: `epic`, `phase: mvp`, `priority: critical`

```markdown
## Epic Description
Enable users to log maintenance activities with photos, categories, costs, and tags. Includes viewing maintenance history with search/filter capabilities and data export functionality.

## User Value
Users can maintain detailed maintenance records with photos and costs, helping them track vehicle health and expenses over time.

## Epic Acceptance Criteria
- [ ] Users can create maintenance logs with all required fields
- [ ] Predefined categories available in English and Spanish
- [ ] Photo attachments working for maintenance logs
- [ ] Custom tagging system implemented
- [ ] Maintenance history view with search and filters
- [ ] Edit and delete maintenance logs functionality
- [ ] CSV export functionality for data ownership

## Related User Stories
- [ ] #XX GL-014: Create maintenance log form (8 pts)
- [ ] #XX GL-015: Maintenance categories setup (5 pts)
- [ ] #XX GL-016: Maintenance log photos (8 pts)
- [ ] #XX GL-017: Custom tags functionality (5 pts)
- [ ] #XX GL-018: Maintenance history view (8 pts)
- [ ] #XX GL-019: Edit maintenance logs (5 pts)
- [ ] #XX GL-020: Delete maintenance logs (3 pts)
- [ ] #XX GL-021: CSV export functionality (8 pts)

**Total Points**: 50 pts  
**Target Timeline**: Sprint 4-5 (Weeks 7-10)

## Dependencies
- Depends on Epic 2 (Vehicle Management) being completed
```

---

### Epic 4: Reminders & Notifications

**Title**: `[EPIC] Reminders & Notifications`  
**Labels**: `epic`, `phase: mvp`, `priority: high`

```markdown
## Epic Description
Implement maintenance reminder system with date and mileage-based alerts, push notifications, and reminder management functionality.

## User Value
Users receive timely reminders for maintenance tasks, helping prevent vehicle problems and maintaining vehicle health proactively.

## Epic Acceptance Criteria
- [ ] Users can create reminders based on date or mileage
- [ ] Reminder list shows urgency (overdue, due soon, upcoming)
- [ ] Push notifications working for reminders
- [ ] Users can mark reminders as complete
- [ ] Reminder editing and deletion functionality
- [ ] Notifications properly localized in user's language

## Related User Stories
- [ ] #XX GL-022: Create maintenance reminders (8 pts)
- [ ] #XX GL-023: Reminder list view (5 pts)
- [ ] #XX GL-024: Push notifications (8 pts)
- [ ] #XX GL-025: Mark reminders complete (5 pts)
- [ ] #XX GL-026: Edit reminders (5 pts)
- [ ] #XX GL-027: Disable reminders (3 pts)

**Total Points**: 34 pts  
**Target Timeline**: Sprint 5-6 (Weeks 9-12)

## Dependencies
- Depends on Epic 2 (Vehicle Management) for vehicle selection
- Depends on Epic 3 (Maintenance Logging) for linking completed maintenance
```

---

### Epic 5: MVP Polish & Launch

**Title**: `[EPIC] MVP Polish & Launch`  
**Labels**: `epic`, `phase: mvp`, `priority: high`

```markdown
## Epic Description
Final polish, complete localization, performance optimization, onboarding, beta testing, and app store launch preparation for MVP release.

## User Value
Users receive a polished, performant app with complete Spanish support and smooth onboarding experience, available in app stores.

## Epic Acceptance Criteria
- [ ] 100% Spanish translation coverage with cultural adaptations
- [ ] App performance meets requirements (<3s load times)
- [ ] Smooth onboarding experience implemented
- [ ] Beta testing completed with 150 users (100 English + 50 Spanish)
- [ ] App store submissions approved for iOS and Google Play
- [ ] All launch criteria met for public availability

## Related User Stories
- [ ] #XX GL-028: Complete Spanish localization (8 pts)
- [ ] #XX GL-029: Regional number/date formats (5 pts)
- [ ] #XX GL-030: Performance optimization (8 pts)
- [ ] #XX GL-031: User onboarding flow (8 pts)
- [ ] #XX GL-032: Beta testing program (13 pts)
- [ ] #XX GL-033: App store submissions (13 pts)

**Total Points**: 55 pts  
**Target Timeline**: Sprint 6 (Weeks 11-12)

## Dependencies
- Depends on all previous epics being substantially complete
```

## 📝 Key User Story Examples

### Sample User Story: GL-007

**Title**: `[STORY] GL-007 - Add vehicle form`  
**Labels**: `user-story`, `phase: mvp`, `priority: high`

```markdown
## User Story
As a user, I want to add my vehicles to the app so that I can start tracking their maintenance history.

## Related Epic
#XX (Vehicle Management Epic)

## Story Points
8

## Acceptance Criteria
- [ ] User can access "Add Vehicle" form from main navigation
- [ ] Form includes fields: make, model, year, VIN (optional), current mileage, notes (optional)
- [ ] Form validation prevents invalid data (year range, mileage format)
- [ ] Successful submission saves vehicle to Firestore via VehicleRepository
- [ ] User sees confirmation message and returns to vehicle list
- [ ] Form works offline and syncs when connection restored
- [ ] All form labels and messages properly localized (English/Spanish)
- [ ] Form displays correctly on iOS and Android

## Technical Implementation Notes
**Components needed:**
- AddVehicleScreen.tsx
- VehicleForm component
- FormInput components from design system

**Repository methods:**
- VehicleRepository.create()

**i18n keys needed:**
- vehicles.form.title
- vehicles.form.make
- vehicles.form.model
- vehicles.form.year
- vehicles.form.vin
- vehicles.form.mileage
- vehicles.form.notes
- vehicles.form.save
- vehicles.form.cancel
- vehicles.form.success

## Test Scenarios
**Happy Path:**
1. User taps "Add Vehicle" button
2. Fills in required fields (make, model, year, mileage)
3. Taps "Save"
4. Sees success message
5. Returns to vehicle list with new vehicle displayed

**Error Cases:**
1. Invalid year (before 1900 or future year)
2. Invalid mileage (negative or non-numeric)
3. Network failure during save
4. Offline mode functionality

## Target Sprint
Sprint 2

## Dependencies
- Depends on GL-002 (Firebase Setup) being completed
- Depends on GL-004 (Design System) for form components
```

## 🏗️ Project Board Setup Instructions

### 1. Create Project
1. Go to your GitHub repository
2. Click **Projects** tab
3. Click **New Project**
4. Choose **Board** template
5. Name: "GarageLedger MVP Development"

### 2. Configure Columns
- **📋 Backlog**: Issues not yet started
- **🚀 Ready**: Defined and ready for development
- **👨‍💻 In Progress**: Currently being worked on
- **👀 Review**: Code review and testing
- **✅ Done**: Completed issues

### 3. Add Labels
Create these labels in **Issues > Labels**:

**Type Labels:**
- `epic` (purple #8B5A8C)
- `user-story` (blue #0366D6)
- `bug` (red #D73A49)
- `enhancement` (green #28A745)

**Priority Labels:**
- `priority: critical` (dark red #B60205)
- `priority: high` (orange #D93F0B)
- `priority: medium` (yellow #FBCA04)
- `priority: low` (light gray #E1E4E8)

**Phase Labels:**
- `phase: mvp` (dark blue #0052CC)
- `phase: growth` (blue #0366D6)
- `phase: intelligence` (purple #6F42C1)
- `phase: platform` (pink #E1358B)

### 4. Create Milestones
1. **Sprint 1** (Weeks 1-2): Foundation Setup
2. **Sprint 2** (Weeks 3-4): Navigation & Vehicle Foundation  
3. **Sprint 3** (Weeks 5-6): Vehicle Management & Photos
4. **Sprint 4** (Weeks 7-8): Maintenance Logging Foundation
5. **Sprint 5** (Weeks 9-10): Maintenance History & Reminders
6. **Sprint 6** (Weeks 11-12): Notifications & MVP Launch

---

**Next Steps**: 
1. Create the 5 epic issues using the content above
2. Set up project board and labels
3. Create initial user story issues for Sprint 1
4. Start development workflow with GitHub integration