# CalculationService Domain Layer Implementation Plan

## Context & Problem Statement

**Date**: September 15, 2025  
**Status**: 🏗️ **PLANNED** - Ready for implementation  
**Priority**: Medium (Architecture Enhancement)

### Current Issue
Total cost calculations are scattered across multiple UI components, violating the established domain layer architecture pattern. We have:

- **4+ locations** with duplicate calculation logic (FluidEntryForm, MotorOilForm, GeneralPartsScreen, PartsAndFluidsWizard)
- **Business logic in UI components** instead of the domain layer
- **Inconsistent formatting** and error handling across forms
- **Testing complexity** due to calculations embedded in React components

### Architectural Alignment
This enhancement follows our established **schema-driven domain architecture**:
- ✅ **ValidationService**: Proven pattern for business rules in domain layer
- ✅ **Offline-first**: Calculations work without network dependency
- ✅ **UI stays "dumb"**: Components consume domain services
- ✅ **Consistent pattern**: Follows existing ValidationService approach

## Proposed Solution Architecture

### 1. CalculationService Domain Layer

**Location**: `src/domain/CalculationService.ts`  
**Pattern**: Pure functions following ValidationService architecture  
**Technology**: TypeScript with comprehensive unit tests

```typescript
// Domain layer handles all financial calculations
export class CalculationService {
  // Core calculation methods
  static calculateFluidTotal(quantity: string, unitCost: string): number
  static calculatePartsTotal(parts: PartEntryData[]): number
  static calculateServiceTotal(parts: PartData[], fluids: FluidData[]): number
  
  // Formatting utilities
  static formatCurrency(amount: number): string
  static parseCurrencyString(value: string): number
  
  // Future analytics foundation
  static calculateCostTrends(logs: MaintenanceLog[]): CostTrend[]
  static calculateBudgetStatus(spent: number, budget: number): BudgetStatus
}
```

### 2. UI Layer Simplification

**Goal**: Remove calculation logic from React components

```typescript
// ✅ AFTER: Clean UI separation
const FluidEntryForm = ({ data, onDataChange }) => {
  const totalCost = CalculationService.calculateFluidTotal(data.quantity, data.unitCost);
  const formattedTotal = CalculationService.formatCurrency(totalCost);
  
  return (
    <Input 
      label="Total Cost"
      value={formattedTotal}
      editable={false}
    />
  );
};
```

### 3. Testing Strategy

**Unit Tests**: `src/domain/__tests__/CalculationService.test.ts`
- Edge cases: empty values, invalid numbers, large amounts
- Currency formatting: different locales, decimal handling
- Multiple parts: complex scenarios with mixed costs
- Performance: large datasets for future analytics

## Implementation Plan

### Phase 1: Core CalculationService (Day 1) ✅ READY
- [x] **Create service structure** - Follow ValidationService pattern
- [ ] **Implement basic calculations** - Fluid total, parts total, formatting
- [ ] **Add comprehensive tests** - Cover all edge cases and validation scenarios
- [ ] **Documentation** - JSDoc comments and usage examples

### Phase 2: UI Migration (Day 1-2)
- [ ] **Update FluidEntryForm** - Replace useEffect calculation with service call
- [ ] **Update MotorOilForm** - Remove embedded calculation logic
- [ ] **Update GeneralPartsScreen** - Use service for multi-part totals
- [ ] **Update PartsAndFluidsWizard** - Consolidate calculation logic

### Phase 3: Testing & Validation (Day 2)
- [ ] **Unit test verification** - Ensure 100% test coverage for calculations
- [ ] **Integration testing** - Test forms with CalculationService integration
- [ ] **Regression testing** - Verify calculations match previous behavior
- [ ] **Performance testing** - Ensure no performance impact

### Phase 4: Future Extensions (Future Enhancement)
- [ ] **Analytics foundation** - Cost trends, budget tracking
- [ ] **Tax calculations** - Regional tax handling
- [ ] **Currency conversion** - Multi-currency support
- [ ] **Budget tracking** - Integration with vehicle budgets

## Technical Specifications

### Core Calculation Methods

```typescript
interface CalculationService {
  // Basic calculations
  calculateFluidTotal(quantity: string, unitCost: string): number;
  calculatePartsTotal(parts: PartEntryData[]): number;
  
  // Complex calculations  
  calculateServiceTotal(data: ServiceFormData): number;
  calculateMaintenanceLogTotal(log: MaintenanceLog): number;
  
  // Utilities
  formatCurrency(amount: number, locale?: string): string;
  parseCurrencyString(value: string): number;
  
  // Validation helpers
  isValidCurrency(value: string): boolean;
  sanitizeCurrencyInput(input: string): string;
}
```

### Error Handling Strategy

```typescript
// Graceful handling of invalid inputs
export class CalculationService {
  static calculateFluidTotal(quantity: string, unitCost: string): number {
    try {
      const qty = this.parseCurrencyString(quantity);
      const cost = this.parseCurrencyString(unitCost);
      
      if (qty < 0 || cost < 0) return 0;
      if (!isFinite(qty) || !isFinite(cost)) return 0;
      
      return qty * cost;
    } catch (error) {
      console.warn('[CalculationService] Invalid input:', { quantity, unitCost });
      return 0;
    }
  }
}
```

### Testing Requirements

**Test Coverage**: 100% for all calculation methods  
**Test Categories**:
- **Valid inputs**: Standard calculation scenarios
- **Edge cases**: Zero values, very large numbers, decimal precision
- **Invalid inputs**: Non-numeric strings, null/undefined values
- **Currency formatting**: Different amounts, locales, edge cases
- **Performance**: Large datasets, complex calculations

## Files to Modify

### New Files
- `src/domain/CalculationService.ts` - Core calculation service
- `src/domain/__tests__/CalculationService.test.ts` - Comprehensive unit tests

### Modified Files
- `src/components/forms/parts/FluidEntryForm.tsx` - Remove useEffect calculation
- `src/components/forms/parts/MotorOilForm.tsx` - Use CalculationService
- `src/components/forms/screens/GeneralPartsScreen.tsx` - Replace manual calculation
- `src/components/forms/screens/PartsAndFluidsWizard.tsx` - Consolidate calculations

## Success Metrics

### Technical Improvements ✅ MEASURABLE
- **Code Deduplication**: Remove 4+ duplicate calculation implementations
- **Test Coverage**: 100% unit test coverage for all calculations
- **Performance**: No degradation in form responsiveness
- **Consistency**: Identical calculation results across all forms

### Architecture Benefits ✅ STRATEGIC
- **Domain Layer Consistency**: Follows established ValidationService pattern
- **Maintainability**: Single place to modify calculation logic
- **Extensibility**: Foundation for future analytics and reporting
- **Testing**: Isolated business logic easy to test and validate

### User Experience ✅ MAINTAINED
- **No Breaking Changes**: Calculations work identically to current implementation
- **Real-time Updates**: Immediate calculation as users type
- **Error Handling**: Graceful handling of invalid inputs
- **Performance**: Smooth, responsive calculation updates

## Risk Mitigation

### Potential Risks
1. **Calculation Discrepancies**: New service produces different results
2. **Performance Impact**: Additional function calls affect responsiveness
3. **Integration Complexity**: Breaking existing form behavior

### Mitigation Strategies
1. **Comprehensive Testing**: Unit tests verify exact calculation matches
2. **Performance Monitoring**: Benchmark calculation response times
3. **Incremental Migration**: Update one form at a time with thorough testing

## Future Roadmap

### Phase 5: Analytics Integration (Month 2)
- Cost trend analysis across maintenance logs
- Budget tracking and variance reporting
- Predictive cost modeling for maintenance planning

### Phase 6: Advanced Features (Month 3+)
- Multi-currency support for international users
- Tax calculation integration for different regions
- Integration with parts suppliers for real-time pricing

### Phase 7: Reporting & Insights (Month 6+)
- Cost per mile/kilometer analytics
- Vehicle cost comparison and benchmarking
- Maintenance cost optimization recommendations

## Architecture Impact

### Domain Layer Enhancement
This implementation strengthens our domain-driven architecture:
- **Consistent Pattern**: All business logic centralized in domain services
- **Offline-First**: Calculations work without network dependency
- **Testing Strategy**: Clear separation enables comprehensive testing
- **Future Growth**: Foundation for advanced analytics and reporting

### Component Architecture Benefits
- **Simplified Components**: UI focuses purely on presentation
- **Reusable Logic**: Calculations available across all features
- **Easier Testing**: Business logic isolated from React lifecycle
- **Performance**: Optimized calculations independent of component renders

---

**Document Owner**: Development Team  
**Implementation Target**: September 16, 2025  
**Success Criteria**: All forms use CalculationService with 100% test coverage