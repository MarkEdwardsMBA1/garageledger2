# Phase 1A Implementation Guide: Conflict Detection Infrastructure

## Overview
This guide covers implementing the foundational conflict detection system that will power intelligent program creation. Phase 1A focuses on the backend infrastructure and detection logic.

## ✅ Files Created/Modified

### New Files Added:
1. **`src/services/ProgramConflictService.ts`** - Core conflict detection and resolution logic
2. **`docs/prd/program-conflict-management-roadmap.md`** - Complete feature roadmap
3. **`docs/prd/phase-1a-implementation-guide.md`** - This implementation guide

### Modified Files:
1. **`src/types/index.ts`** - Added conflict detection type definitions
2. **`src/repositories/ProgramRepository.ts`** - Enhanced interface with conflict methods

## 🎯 Phase 1A Implementation Steps

### Step 1: Implement Repository Methods (Next Session)
Update `SecureProgramRepository.ts` to implement the new interface methods:

```typescript
// Add to SecureProgramRepository.ts
async checkVehicleConflicts(vehicleIds: string[]): Promise<ConflictDetectionResult> {
  return programConflictService.checkVehicleConflicts(vehicleIds);
}

async removeVehicleFromProgram(programId: string, vehicleId: string): Promise<void> {
  const user = this.requireAuth();
  const program = await this.getById(programId);
  if (!program) throw new Error('Program not found');
  
  const updatedVehicleIds = program.assignedVehicleIds.filter(id => id !== vehicleId);
  
  if (updatedVehicleIds.length === 0) {
    await this.delete(programId);
  } else {
    await this.update(programId, { 
      assignedVehicleIds: updatedVehicleIds,
      updatedAt: new Date() 
    });
  }
}

async deleteProgram(programId: string): Promise<void> {
  await this.delete(programId);
}
```

### Step 2: Enhance Vehicle Selection Screen (Next Session)
Modify `CreateProgramVehicleSelectionScreen.tsx` to integrate conflict detection:

```typescript
// Add conflict checking to handleContinue()
const handleContinue = async () => {
  if (selectedVehicleIds.length === 0) {
    Alert.alert('Required', 'Please select at least one vehicle');
    return;
  }
  
  try {
    setLoading(true);
    
    // Check for conflicts
    const conflictResult = await programRepository.checkVehicleConflicts(selectedVehicleIds);
    
    if (conflictResult.canProceedDirectly) {
      // No conflicts - proceed normally
      navigation.navigate('CreateProgramDetails', {
        selectedVehicleIds,
        selectedVehicles: vehicles.filter(v => selectedVehicleIds.includes(v.id))
      });
    } else {
      // Show conflict resolution modal
      setConflictResult(conflictResult);
      setShowConflictModal(true);
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to check program conflicts');
  } finally {
    setLoading(false);
  }
};
```

### Step 3: Create Conflict Resolution Modal (Next Session)
Create `src/components/common/ConflictResolutionModal.tsx`:

```typescript
interface ConflictResolutionModalProps {
  visible: boolean;
  conflicts: VehicleConflict[];
  vehicles: Vehicle[];
  onResolve: (action: ConflictResolutionAction) => void;
  onCancel: () => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  visible,
  conflicts,
  vehicles,
  onResolve,
  onCancel,
}) => {
  // Modal implementation with conflict display and resolution options
};
```

## 🔧 Technical Implementation Details

### Conflict Detection Flow
1. **User selects vehicles** → Vehicle selection screen
2. **User taps Continue** → Trigger `checkVehicleConflicts(vehicleIds)`
3. **Service analyzes conflicts** → Return `ConflictDetectionResult`
4. **UI shows appropriate response**:
   - No conflicts → Proceed to program details
   - Conflicts found → Show conflict resolution modal

### Data Flow Architecture
```
CreateProgramVehicleSelectionScreen
  ↓ (selectedVehicleIds)
ProgramConflictService.checkVehicleConflicts()
  ↓ (calls for each vehicle)
SecureProgramRepository.getProgramsByVehicle()
  ↓ (analyzes programs)
ConflictDetectionResult
  ↓ (if conflicts)
ConflictResolutionModal
  ↓ (user choice)
ProgramConflictService.resolveConflict()
```

### Error Handling Strategy
- **Network errors**: Graceful fallback, allow user to proceed
- **Permission errors**: Clear messaging about authentication
- **Conflict resolution errors**: Rollback and retry options
- **Loading states**: Show progress during async operations

## 🎨 UX Considerations

### Visual Indicators
- **Conflict badge**: Show on vehicle cards if they have existing programs
- **Program count**: "2 programs" badge on conflicted vehicles
- **Loading states**: Spinner during conflict detection
- **Error states**: Clear error messages with retry options

### User Flow Optimization
- **Smart defaults**: Pre-select most likely resolution choice
- **Batch operations**: Handle multiple conflicts efficiently  
- **Progressive disclosure**: Start simple, show complexity only when needed
- **Undo capability**: Allow reverting accidental deletions (Phase 2)

## 🧪 Testing Strategy

### Unit Tests
- **ConflictDetectionService**: Test all conflict scenarios
- **Repository methods**: Test conflict detection accuracy
- **Edge cases**: Empty programs, single/multi-vehicle scenarios

### Integration Tests
- **Vehicle selection flow**: End-to-end conflict detection
- **Conflict resolution**: Verify proper program modifications
- **Error scenarios**: Network failures, permission issues

### User Acceptance Tests
- **No conflicts**: Smooth program creation
- **Single-vehicle conflicts**: Proper replacement workflow
- **Multi-vehicle conflicts**: Vehicle removal workflow
- **Mixed conflicts**: Complex scenario handling

## 📋 Definition of Done - Phase 1A

### Backend Infrastructure ✅
- [x] Conflict detection types defined
- [x] ProgramConflictService implemented
- [x] Repository interface enhanced
- [ ] Repository methods implemented
- [ ] Unit tests written
- [ ] Error handling complete

### Frontend Foundation
- [ ] Vehicle selection screen enhanced
- [ ] Conflict resolution modal created
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Integration tests passing

### User Experience
- [ ] Conflict detection is fast (<2 seconds)
- [ ] Clear messaging for all conflict types
- [ ] No data loss in any scenario
- [ ] Graceful error handling

## 🚀 Next Phase Preview

**Phase 1B** will focus on:
- Complete conflict resolution UI
- Safety confirmation dialogs
- Enhanced vehicle selection experience
- Polish and user testing

**Phase 2** will add:
- EditProgramScreen for modifying existing programs
- Advanced program management capabilities
- Program history and analytics

This foundation provides the robust infrastructure needed for sophisticated program conflict management, positioning GarageLedger as a professional-grade maintenance platform.