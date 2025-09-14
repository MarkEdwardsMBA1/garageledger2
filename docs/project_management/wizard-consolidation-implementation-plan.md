# Wizard Component Consolidation Implementation Plan
*Priority: P0 - Critical Technical Debt*
*Estimated Effort: 1 week*
*Expected ROI: $24,000 saved maintenance costs*

## Problem Statement

**Current State**: 8 duplicate step screens with ~80% identical code
- `ShopServiceStep1-4Screen.tsx` (4 files, ~1,200 LOC)
- `DIYServiceStep1-4Screen.tsx` (4 files, ~1,000 LOC)  
- `OnboardingStep1-3Screen.tsx` (3 files, ~800 LOC)

**Impact**: 
- New wizard requires 4 separate screen implementations
- UI changes need updates across multiple files
- Testing complexity scales linearly with screens
- Pattern violations against DRY principle

## Solution Architecture

### **Core Components**
Following the successful DatePicker consolidation pattern:

```typescript
// src/components/common/WizardContainer.tsx
interface WizardStep {
  id: string;
  title: string;
  component: React.ComponentType<WizardStepProps>;
  validation?: (data: any) => string[] | null; // Return errors or null
  canSkip?: boolean;
}

interface WizardContainerProps {
  steps: WizardStep[];
  onComplete: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  title: string;
}
```

```typescript
// src/components/common/StepIndicator.tsx
interface StepIndicatorProps {
  steps: Array<{ title: string; id: string }>;
  currentStepId: string;
  completedStepIds: string[];
}
```

```typescript
// src/hooks/useWizardState.ts
interface UseWizardStateReturn {
  currentStep: WizardStep;
  stepIndex: number;
  data: any;
  errors: string[];
  canGoNext: boolean;
  canGoBack: boolean;
  goNext: () => void;
  goBack: () => void;
  updateData: (stepData: any) => void;
  reset: () => void;
}
```

## Implementation Plan

### **Day 1-2: Core Infrastructure**

#### **Step 1: Create Base Components**
```bash
# Create wizard component files
src/components/common/WizardContainer.tsx
src/components/common/StepIndicator.tsx
src/hooks/useWizardState.ts
src/types/wizard.ts
```

#### **Step 2: Implement WizardContainer**
- Step navigation logic
- Data management across steps
- Validation handling
- Progress persistence
- Automotive theme integration

#### **Step 3: Implement StepIndicator**
- Visual step progress
- Clickable step navigation (where appropriate)
- Completion states
- Mobile-optimized design

### **Day 3-4: Service Wizard Migration**

#### **Step 4: Extract Shop Service Steps**
```bash
# Create step components (not screens)
src/components/wizards/shop/ShopBasicInfoStep.tsx
src/components/wizards/shop/ShopServicesStep.tsx  
src/components/wizards/shop/ShopPhotosStep.tsx
src/components/wizards/shop/ShopNotesStep.tsx
```

#### **Step 5: Create Unified Shop Service Wizard**
```typescript
// src/screens/ShopServiceWizardScreen.tsx
const shopServiceSteps: WizardStep[] = [
  {
    id: 'basic-info',
    title: 'Service Details',
    component: ShopBasicInfoStep,
    validation: validateBasicInfo,
  },
  {
    id: 'services',
    title: 'Services Performed', 
    component: ShopServicesStep,
    validation: validateServices,
  },
  {
    id: 'photos',
    title: 'Photos & Receipts',
    component: ShopPhotosStep,
    canSkip: true,
  },
  {
    id: 'notes',
    title: 'Notes & Summary',
    component: ShopNotesStep,
    canSkip: true,
  },
];
```

#### **Step 6: Update Navigation**
Replace 4 screen references with 1 in `AppNavigator.tsx`

### **Day 5: DIY Service Migration**

#### **Step 7: Extract DIY Service Steps** 
Following identical pattern as Shop Service

#### **Step 8: Create Unified DIY Service Wizard**
Reuse same `WizardContainer` with different step configuration

### **Day 6: Onboarding Migration**

#### **Step 9: Extract Onboarding Steps**
```bash
src/components/wizards/onboarding/WelcomeStep.tsx
src/components/wizards/onboarding/PreferencesStep.tsx
src/components/wizards/onboarding/CompletionStep.tsx
```

#### **Step 10: Unified Onboarding Wizard**
Consolidate 3 screens → 1 screen with wizard container

### **Day 7: Testing & Cleanup**

#### **Step 11: Comprehensive Testing**
- All wizard flows work identically to before
- Step navigation functions correctly
- Data persistence across steps
- Validation triggers appropriately
- Visual regression testing

#### **Step 12: File Cleanup**
```bash
# Remove old files
rm src/screens/ShopServiceStep[1-4]Screen.tsx
rm src/screens/DIYServiceStep[1-4]Screen.tsx  
rm src/screens/OnboardingStep[1-3]Screen.tsx
```

## Technical Specifications

### **Data Flow Architecture**
```typescript
// Wizard maintains centralized state
interface WizardState {
  currentStepId: string;
  data: Record<string, any>; // All step data
  completedSteps: Set<string>;
  errors: Record<string, string[]>;
}

// Steps are pure components
interface WizardStepProps {
  data: any;
  onDataChange: (stepData: any) => void;
  errors: string[];
  onNext: () => void;
  onBack: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
}
```

### **Validation Strategy**
```typescript
// Each step can define validation
type StepValidator = (data: any, allWizardData: any) => string[] | null;

// Examples:
const validateBasicInfo: StepValidator = (data) => {
  const errors = [];
  if (!data.date) errors.push('Service date is required');
  if (!data.mileage) errors.push('Mileage is required');
  return errors.length > 0 ? errors : null;
};
```

### **Theme Integration**
- Use existing automotive color palette
- Maintain current typography system
- Preserve step indicator styling
- Ensure accessibility standards

## Success Criteria

### **Functional Requirements**
- [ ] All existing wizard functionality preserved exactly
- [ ] Step navigation works identically to current flows
- [ ] Data persistence across steps maintained
- [ ] Validation triggers at appropriate times
- [ ] Cancel/back navigation functions correctly

### **Technical Requirements**
- [ ] Code reduction: 8 files → 3 components + 1 hook
- [ ] No duplication in wizard logic
- [ ] Reusable for future wizards
- [ ] Type-safe step definitions
- [ ] Comprehensive test coverage

### **UX Requirements** 
- [ ] Visual appearance unchanged
- [ ] Step transitions smooth
- [ ] Progress indication clear
- [ ] Error states handled gracefully
- [ ] Mobile responsive maintained

## Risk Mitigation

### **Low Risk Factors** ✅
- **Proven Pattern**: DatePicker consolidation was successful
- **Clear Interfaces**: Well-defined component boundaries
- **Incremental Migration**: Can migrate one wizard at a time

### **Risk Mitigation Strategies**
- **Feature Branches**: Implement each wizard separately
- **A/B Testing**: Keep old screens until new ones validated
- **Rollback Plan**: Git branches allow instant reversion
- **User Testing**: Validate UX unchanged before cleanup

## Future Extensibility

### **Additional Wizards Enabled**
With this infrastructure, future wizards become trivial:

```typescript
// Adding vehicle setup wizard becomes:
const vehicleSetupSteps: WizardStep[] = [
  { id: 'basic', component: VehicleBasicStep },
  { id: 'details', component: VehicleDetailsStep },
  { id: 'photo', component: VehiclePhotoStep },
];

// 30-minute implementation vs 8+ hours currently
```

### **Advanced Features** (Future)
- Conditional step branching
- Dynamic step generation
- Progress persistence across app sessions
- Wizard analytics/tracking
- Step-level permissions

## Performance Impact

### **Expected Improvements**
- **Bundle Size**: Reduced by ~15% (duplicate code elimination)
- **Memory Usage**: Single wizard instance vs multiple screens
- **Development Time**: 40% reduction for new wizards
- **Testing Time**: Centralized logic easier to test

### **Monitoring**
- Track wizard completion rates
- Monitor step abandonment points  
- Measure development velocity improvements
- User experience feedback

## Implementation Checklist

### **Pre-Implementation**
- [ ] Review existing wizard screens for edge cases
- [ ] Identify shared validation patterns
- [ ] Plan navigation integration points
- [ ] Set up feature branch strategy

### **During Implementation**
- [ ] Create components incrementally
- [ ] Test each wizard type separately  
- [ ] Maintain existing functionality exactly
- [ ] Document new component APIs

### **Post-Implementation**
- [ ] Remove obsolete screen files
- [ ] Update documentation
- [ ] Train team on new wizard patterns
- [ ] Monitor for regressions

---

*Implementation Start Date: TBD*
*Expected Completion: 7 business days*
*Success Metrics: 3000+ lines code reduction, 40% faster wizard development*