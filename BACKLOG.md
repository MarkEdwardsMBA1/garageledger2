# GarageLedger2 - Development Backlog

## Custom SVG Icons Implementation

### Story 1: Set up SVG Icon Infrastructure
**As a** developer  
**I want** to properly configure React Native SVG handling  
**So that** custom SVG icons can be imported and used reliably  

**Acceptance Criteria:**
- [ ] Install and configure `react-native-svg-transformer`
- [ ] Update Metro config to handle SVG files
- [ ] Create TypeScript declarations for SVG imports
- [ ] Test SVG import functionality with one icon
- [ ] Ensure hot reload works with SVG changes

**Story Points:** 5  
**Priority:** Medium  
**Labels:** enhancement, infrastructure  

---

### Story 2: Implement Custom Navigation Icons
**As a** user  
**I want** to see the custom-designed navigation icons  
**So that** the app has a unique, professional visual identity  

**Acceptance Criteria:**
- [ ] Replace Dashboard icon with `speedometer.svg`
- [ ] Replace Vehicles icon with `car.svg`
- [ ] Replace Maintenance icon with `spanner.svg`
- [ ] Replace Settings icon with `gear.svg`
- [ ] Ensure icons scale properly at different sizes
- [ ] Maintain active/inactive color states
- [ ] Add fallback to Ionicons if SVG fails to load
- [ ] Test on both iOS and Android (when available)

**Story Points:** 3  
**Priority:** Medium  
**Labels:** enhancement, UI/UX  

**Notes:**
- Current Ionicons work well as fallback
- SVG files are already available in `assets/icons/`
- Should maintain current sizing and color behavior

---

## Spanish Localization Implementation

### Story 3: Set up i18n Infrastructure  
**As a** developer  
**I want** to properly configure react-i18next  
**So that** Spanish translations can be loaded and switched dynamically  

**Acceptance Criteria:**
- [ ] Fix i18n configuration in `src/i18n/index.ts` (currently mocked)
- [ ] Configure AsyncStorage persistence for language preference
- [ ] Set up proper language detection
- [ ] Test language switching functionality
- [ ] Ensure translations load correctly on app startup

**Story Points:** 5  
**Priority:** High  
**Labels:** feature, internationalization  

---

### Story 4: Complete Spanish Translations
**As a** Spanish-speaking user  
**I want** to use the app in Spanish  
**So that** I can easily understand and navigate the interface  

**Acceptance Criteria:**
- [ ] Review and complete all translations in `src/i18n/locales/es.json`
- [ ] Translate all screen titles and navigation labels
- [ ] Translate all form labels, buttons, and error messages
- [ ] Translate automotive terminology accurately
- [ ] Add region-specific currency and date formats
- [ ] Test all translated screens for text overflow/layout issues

**Story Points:** 8  
**Priority:** High  
**Labels:** feature, internationalization, content  

**Notes:**
- Spanish translations file exists but needs review
- Consider regional variations (Mexico, Colombia, Argentina)
- Automotive terms require domain expertise

---

### Story 5: Dynamic Language Switching
**As a** user  
**I want** to change the app language from Settings  
**So that** I can use my preferred language  

**Acceptance Criteria:**
- [ ] Fix Settings screen language toggle functionality
- [ ] Show correct current language in Settings
- [ ] Persist language choice across app restarts
- [ ] Update all text immediately when language changes (no restart required)
- [ ] Handle right-to-left layout if needed (future consideration)

**Story Points:** 3  
**Priority:** High  
**Labels:** feature, internationalization, UI/UX  

---

## Dashboard UX Enhancements

### Story 6: Make Vehicle Count Clickable
**As a** user  
**I want** to tap on the total vehicle count on Dashboard  
**So that** I can quickly navigate to the Vehicles screen  

**Acceptance Criteria:**
- [ ] Make the vehicle count number/section tappable
- [ ] Add subtle visual feedback (opacity change) on tap
- [ ] Navigate to Vehicles screen when tapped
- [ ] Ensure accessibility (screen reader support)
- [ ] Add haptic feedback on iOS
- [ ] Consider adding a subtle visual hint (like an arrow or different styling)

**Story Points:** 2  
**Priority:** Medium  
**Labels:** enhancement, UI/UX, navigation  

**Notes:**
- Common pattern in dashboard apps (Instagram followers, etc.)
- Low effort, high user satisfaction
- Should feel natural and discoverable

---

### Story 7: Fix Add Vehicle Button Navigation
**As a** user  
**I want** the "Add Vehicle" button on Dashboard to take me to the Add Vehicle form  
**So that** I can quickly add a new vehicle from the main screen  

**Acceptance Criteria:**
- [ ] Investigate current Add Vehicle button navigation
- [ ] Fix navigation to go to Add Vehicle screen (not Vehicles list)
- [ ] Ensure proper navigation stack behavior (back button works correctly)
- [ ] Test navigation with existing vehicles and empty state
- [ ] Maintain any existing analytics tracking

**Story Points:** 3  
**Priority:** High  
**Labels:** bug fix, navigation, user flow  

**Notes:**
- Currently may be navigating to wrong screen
- Critical user flow - should be frictionless
- May have been disabled during previous troubleshooting

---

## Summary

**Total Story Points:** 29  
**High Priority:** 19 points (Spanish localization + Add Vehicle fix)  
**Medium Priority:** 10 points (Custom SVG icons + Vehicle count tap)  

**Recommended Sprint Planning:**
- **Sprint 1:** Stories 7, 3 & 5 (Fix Add Vehicle navigation + i18n infrastructure) - 11 points
- **Sprint 2:** Story 4 (Spanish translations) - 8 points  
- **Sprint 3:** Stories 1, 2 & 6 (SVG icons + Vehicle count tap) - 10 points

**Dependencies:**
- Story 2 depends on Story 1 (SVG infrastructure before implementation)
- Story 5 depends on Story 3 (i18n working before UI can switch)
- Story 4 can be worked on in parallel with Story 3

**Technical Notes:**
- SVG icons may require Expo SDK configuration updates
- Spanish translations should be reviewed by native speaker
- Consider A/B testing icon preferences with users
- Monitor bundle size impact of SVG vs icon fonts