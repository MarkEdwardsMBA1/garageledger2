# Navigation Restructure Implementation Roadmap

## Overview
This roadmap implements the navigation restructure outlined in `nav-screens-update-reqs-user-stories.md` using minimal increments to reduce risk and enable thorough testing at each step.

## Progress Summary
**Phase 1 Status**: 2 of 7 increments completed ✅ (28% complete)
- ✅ **Increment 1**: Dashboard removal - COMPLETED
- ✅ **Increment 2**: Maintenance → Insights rename - COMPLETED  
- 📋 **Increment 3**: Content migration analysis - PENDING
- 📋 **Increments 4-7**: Content migration & Programs feature - PENDING

## Phase 1: Navigation Restructure
**Goal**: Remove Dashboard, make Vehicles the home screen, rename Maintenance to Insights
**Timeline**: 2-3 weeks  
**Risk Level**: Medium (navigation changes affect core user flows)
**Current Status**: Phase 1 foundation complete - ready for content migration phase

---

## Increment 1: Remove Dashboard from Navigation ⏱️ 2-3 hours ✅ COMPLETED
**Objective**: Remove Dashboard tab without touching screen content
**Risk**: Low (minimal code changes)
**Status**: ✅ Completed - Dashboard successfully removed, Vehicles is now home screen

### Tasks:
- [x] Remove Dashboard tab from `AppNavigator.tsx` bottom tabs
- [x] Update navigation order: Vehicles → Maintenance → Settings  
- [x] Keep Dashboard screen file intact (safety net)
- [x] Update default tab to Vehicles

### Success Criteria:
- [x] App launches without Dashboard tab
- [x] Vehicles screen appears as first/home screen
- [x] No crashes or navigation errors
- [x] All other navigation works normally

### Testing Checklist:
- [x] App startup → lands on Vehicles
- [x] Tab navigation works (Vehicles, Maintenance, Settings)
- [x] Deep links to other screens still work
- [x] Back navigation from sub-screens works
- [x] Settings logout/login flow works

---

## Increment 2: Rename Maintenance to Insights ⏱️ 1-2 hours ✅ COMPLETED
**Objective**: Update navigation label and icon
**Risk**: Low (cosmetic changes)
**Status**: ✅ Completed - Successfully renamed with proper icon and translations

### Tasks:
- [x] Update tab label: "Maintenance" → "Insights"
- [x] Change icon: wrench/spanner → speedometer
- [x] Update screen titles and headers
- [x] Verify translations (English/Spanish)

### Success Criteria:
- [x] Tab shows "Insights" with speedometer icon
- [x] Screen headers updated consistently
- [x] Spanish translations updated
- [x] No broken icon references

### Testing Checklist:
- [x] Visual verification of new tab label/icon
- [x] Screen navigation to Insights works
- [x] Language toggle shows correct translations
- [x] Icons render correctly on iOS/Android

### Known Issues:
- [ ] BACKLOG-I18N001: Spanish content not updating on Insights screen (documented in backlog)

---

## Increment 3: Content Migration Analysis ⏱️ 1 hour
**Objective**: Audit what Dashboard content should migrate vs delete
**Risk**: Very Low (analysis only, no code changes)

### Tasks:
- [ ] Document Dashboard sections:
  - [ ] Welcome section (DELETE - move to onboarding)
  - [ ] Maintenance Insights (ALREADY EXISTS in Insights)
  - [ ] Quick Stats (MIGRATE - vehicle count, upcoming maintenance)
  - [ ] Quick Actions (MIGRATE - Add Vehicle, Log Maintenance)  
  - [ ] Recent Activity (MIGRATE - recent maintenance logs)
- [ ] Identify Insights screen gaps
- [ ] Plan content integration approach

### Deliverable:
- [ ] Migration plan document with detailed content mapping

---

## Increment 4: Migrate Quick Stats to Insights ⏱️ 2-3 hours
**Objective**: Move valuable stats from Dashboard to Insights
**Risk**: Medium (content integration)

### Tasks:
- [ ] Copy Quick Stats section from Dashboard to Insights
- [ ] Integrate with existing Insights content
- [ ] Update navigation targets (stats link to vehicle screens)
- [ ] Ensure responsive layout with additional content
- [ ] Test data loading and error states

### Success Criteria:
- [ ] Quick Stats appear in Insights screen
- [ ] Stats are accurate and clickable
- [ ] Layout looks cohesive with existing content
- [ ] Loading states work properly

### Testing Checklist:
- [ ] Stats display correct vehicle counts
- [ ] Clicking stats navigates correctly
- [ ] Layout works on different screen sizes
- [ ] Loading/empty states handled gracefully

---

## Increment 5: Migrate Quick Actions to Insights ⏱️ 1-2 hours
**Objective**: Add action buttons to Insights screen
**Risk**: Low (existing components)

### Tasks:
- [ ] Add Quick Actions section to Insights
- [ ] Style actions to match Insights design
- [ ] Test navigation to Add Vehicle/Log Maintenance
- [ ] Ensure proper spacing and layout

### Success Criteria:
- [ ] Action buttons visible and functional
- [ ] Navigation to forms works correctly
- [ ] Visual design consistent with Insights

---

## Increment 6: Migrate Recent Activity to Insights ⏱️ 2-3 hours  
**Objective**: Show recent maintenance activity in Insights
**Risk**: Medium (data integration)

### Tasks:
- [ ] Copy Recent Activity logic from Dashboard
- [ ] Integrate with existing maintenance log display
- [ ] Handle empty states appropriately
- [ ] Test performance with large maintenance history

### Success Criteria:
- [ ] Recent maintenance logs display correctly
- [ ] Links to maintenance detail views work
- [ ] Empty state shows appropriate message
- [ ] Performance acceptable with many logs

---

## Increment 7: Dashboard Cleanup ⏱️ 30 minutes
**Objective**: Remove Dashboard screen and references
**Risk**: Low (final cleanup)

### Tasks:
- [ ] Delete `DashboardScreen.tsx` file
- [ ] Remove Dashboard imports from navigation
- [ ] Search codebase for remaining Dashboard references
- [ ] Update any deep links or navigation calls

### Success Criteria:
- [ ] No Dashboard references in codebase
- [ ] App builds without errors
- [ ] No broken navigation links

---

## Testing Strategy

### After Each Increment:
1. **Functional Testing**: Core navigation and features work
2. **Regression Testing**: Existing features unaffected  
3. **Performance Testing**: No significant performance degradation
4. **Cross-Platform Testing**: Works on iOS and Android

### Final Phase 1 Testing:
1. **Full User Flow Testing**: Complete user journeys work end-to-end
2. **Edge Case Testing**: Error states, empty data, poor connectivity
3. **Accessibility Testing**: Screen readers, navigation work correctly
4. **User Acceptance Testing**: Navigation feels intuitive

---

## Rollback Strategy

### If Issues Arise:
1. **Increment 1-2**: Revert navigation changes, restore Dashboard tab
2. **Increment 3**: No rollback needed (analysis only)
3. **Increment 4-6**: Remove migrated content, functionality remains in original Dashboard
4. **Increment 7**: Restore Dashboard screen file from git history

### Success Metrics:
- [ ] Zero navigation-related crashes
- [ ] User engagement with Vehicles (new home) increases
- [ ] Insights screen usage increases with new content
- [ ] No significant user complaints about navigation changes

---

## Future Phases

### Phase 2: Basic Programs Feature (4-6 weeks)
- Programs screen creation
- Basic program CRUD operations  
- Single vehicle program assignment
- Simple task definition

### Phase 3: Advanced Programs (6-8 weeks)
- Multi-vehicle programs
- Compliance tracking
- Cost forecasting
- Reminder integration

---

**Created**: 2025-01-12
**Status**: Ready to begin Increment 1
**Next Review**: After each increment completion