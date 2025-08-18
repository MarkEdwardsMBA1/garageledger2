# Program Conflict Management Roadmap

## Overview
Advanced program creation logic that handles vehicle-program conflicts intelligently, ensuring users can manage overlapping maintenance programs without confusion or data loss.

## Current State Analysis

### ✅ What We Have
- **Basic Program Creation**: 2-screen flow (vehicle selection → program details)
- **Data Foundation**: `MaintenanceProgram` with `assignedVehicleIds[]` 
- **Repository Method**: `getProgramsByVehicle(vehicleId)` for conflict detection
- **Multi-Vehicle Support**: Programs can manage multiple vehicles

### ❌ What's Missing
- **Conflict Detection**: No checking for existing programs on selected vehicles
- **Edit Existing Programs**: Cannot modify existing programs
- **Program Removal**: No way to remove vehicles from programs
- **User Choice Dialogs**: No conflict resolution flow

## Detailed User Flow Requirements

### Scenario 1: No Conflicts (Current Behavior)
**When**: Selected vehicles have no existing programs
**Behavior**: ✅ Already working - proceed directly to program creation

### Scenario 2: Single-Vehicle Program Conflict
**When**: Selected vehicle is in exactly 1 existing program that manages only this vehicle
**Flow**:
1. **Detect Conflict**: "Your [Vehicle] is already managed by '[Program Name]'"
2. **Present Options**:
   - "Edit Existing Program" → Navigate to EditProgramScreen (Phase 2)
   - "Replace with New Program" → Confirmation dialog (Phase 1)
3. **If Replace Chosen**:
   - **Safety Check**: "Delete '[Program Name]' and create new program?"
   - **If Confirmed**: Delete existing program → Continue creation
   - **If Cancelled**: Return to vehicle selection

### Scenario 3: Multi-Vehicle Program Conflict  
**When**: Selected vehicle(s) are part of programs that manage multiple vehicles
**Flow**:
1. **Detect Conflict**: "Your [Vehicle] is part of '[Multi-Vehicle Program Name]' with [N] other vehicles"
2. **Present Options**:
   - "Edit Existing Program" → Navigate to EditProgramScreen (Phase 2)
   - "Remove Vehicle & Create New" → Removal confirmation (Phase 1)
3. **If Remove Chosen**:
   - **Safety Check**: "Remove [Vehicle] from '[Program Name]' and create new program?"
   - **If Confirmed**: Remove vehicle from existing → Continue creation
   - **If Cancelled**: Return to vehicle selection

### Scenario 4: Mixed Conflicts (Advanced)
**When**: Multiple selected vehicles have different conflict scenarios
**Flow**: Handle each conflict type separately with batch operations

## Implementation Roadmap

### 🎯 Phase 1: Core Conflict Detection & Resolution (Priority: High)
**Goal**: Handle basic conflicts without losing data

#### Phase 1A: Detection Infrastructure (1-2 sessions)
- ✅ **Conflict Detection Service**: Check selected vehicles against existing programs
- ✅ **Program Analysis Logic**: Determine single vs multi-vehicle conflicts  
- ✅ **Enhanced Repository Methods**: Batch conflict checking

#### Phase 1B: User Flow Implementation (2-3 sessions)
- ✅ **Conflict Dialog Components**: Reusable modals for different scenarios
- ✅ **Vehicle Selection Enhancement**: Integrate conflict checking
- ✅ **Program Deletion Logic**: Safe removal of conflicting programs
- ✅ **Vehicle Removal Logic**: Remove vehicles from multi-vehicle programs

#### Phase 1C: Safety & UX Polish (1 session)
- ✅ **Confirmation Dialogs**: Double-check destructive operations
- ✅ **Loading States**: Handle async conflict detection
- ✅ **Error Handling**: Network/permission error scenarios

### 🔄 Phase 2: Program Editing Capabilities (Priority: Medium)
**Goal**: Allow users to edit existing programs instead of replacing

#### Phase 2A: Edit Program Foundation (2-3 sessions)
- ✅ **EditProgramScreen**: Modify existing program details and tasks
- ✅ **Update Repository Methods**: Program modification with validation
- ✅ **Navigation Integration**: Route from conflict dialogs to edit screens

#### Phase 2B: Advanced Program Management (2 sessions)
- ✅ **Add/Remove Vehicles**: Modify program vehicle assignments
- ✅ **Task Management**: Add/edit/remove individual maintenance tasks
- ✅ **Program History**: Track program modifications

### 🚀 Phase 3: Advanced Scenarios (Priority: Low)
**Goal**: Handle complex multi-program conflicts

#### Phase 3A: Batch Operations (1-2 sessions)
- ✅ **Multi-Vehicle Conflicts**: Handle selection of vehicles with different conflicts
- ✅ **Bulk Program Actions**: Batch create/edit/delete operations
- ✅ **Smart Suggestions**: Recommend optimal program configurations

#### Phase 3B: Program Analytics (1 session)
- ✅ **Conflict Reports**: Show users program overlap insights
- ✅ **Optimization Suggestions**: Recommend program consolidation
- ✅ **Usage Analytics**: Track program effectiveness

## Technical Architecture

### Data Structures

#### ConflictDetectionResult
```typescript
interface VehicleConflict {
  vehicleId: string;
  conflictType: 'none' | 'single-vehicle-program' | 'multi-vehicle-program';
  existingPrograms: MaintenanceProgram[];
  affectedVehicleCount: number; // For multi-vehicle programs
}

interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: VehicleConflict[];
  canProceedDirectly: boolean;
}
```

#### Enhanced Repository Methods
```typescript
interface IProgramRepository {
  // Existing methods...
  
  // New methods for conflict management
  checkVehicleConflicts(vehicleIds: string[]): Promise<ConflictDetectionResult>;
  removeVehicleFromProgram(programId: string, vehicleId: string): Promise<void>;
  deleteProgram(programId: string): Promise<void>;
  
  // Phase 2 methods
  updateProgramVehicles(programId: string, vehicleIds: string[]): Promise<MaintenanceProgram>;
  updateProgramTasks(programId: string, tasks: ProgramTask[]): Promise<MaintenanceProgram>;
}
```

### Component Architecture

#### ConflictResolutionModal
```typescript
interface ConflictResolutionProps {
  conflicts: VehicleConflict[];
  onResolve: (resolution: ConflictResolution) => void;
  onCancel: () => void;
}

type ConflictResolution = 
  | { action: 'edit-existing'; programId: string }
  | { action: 'replace-program'; programId: string }
  | { action: 'remove-vehicles'; programIds: string[]; vehicleIds: string[] };
```

## User Experience Considerations

### 🎨 Design Principles
1. **Transparency**: Always show users what programs will be affected
2. **Safety**: Require confirmation for destructive operations
3. **Flexibility**: Provide multiple resolution paths
4. **Performance**: Conflict detection should be fast and non-blocking

### 📱 UX Flow Enhancements
1. **Visual Indicators**: Show existing program badges on vehicle selection
2. **Smart Defaults**: Pre-select the most likely user choice
3. **Undo Capability**: Allow reverting program changes (Phase 3)
4. **Progressive Disclosure**: Start simple, reveal complexity as needed

## Success Metrics
- **User Satisfaction**: No data loss complaints in program management
- **Adoption**: Increased program creation completion rate
- **Efficiency**: Reduced support tickets about program conflicts
- **Power Users**: Advanced users successfully manage complex program hierarchies

## Migration Strategy
- **Backward Compatibility**: Existing programs continue working unchanged
- **Graceful Degradation**: New features enhance but don't break existing flows
- **User Education**: In-app guidance for new conflict resolution features

---

This roadmap transforms GarageLedger from basic program creation to sophisticated maintenance program management, positioning it as a professional-grade vehicle maintenance platform.