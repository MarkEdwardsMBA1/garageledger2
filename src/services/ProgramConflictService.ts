// Program Conflict Detection and Resolution Service
import { 
  VehicleConflict, 
  ConflictDetectionResult, 
  MaintenanceProgram, 
  ConflictResolutionAction 
} from '../types';
import { programRepository } from '../repositories/SecureProgramRepository';

/**
 * Service for detecting and resolving program-vehicle conflicts
 * Handles intelligent conflict resolution during program creation
 */
export class ProgramConflictService {
  
  /**
   * Check if selected vehicles have existing program assignments
   * Returns detailed conflict information for resolution
   */
  async checkVehicleConflicts(vehicleIds: string[]): Promise<ConflictDetectionResult> {
    try {
      const conflicts: VehicleConflict[] = [];
      
      // Check each vehicle for existing programs
      for (const vehicleId of vehicleIds) {
        const existingPrograms = await programRepository.getProgramsByVehicle(vehicleId);
        const activePrograms = existingPrograms.filter(program => program.isActive);
        
        if (activePrograms.length === 0) {
          // No conflict - vehicle is free
          conflicts.push({
            vehicleId,
            conflictType: 'none',
            existingPrograms: [],
            affectedVehicleCount: 0,
          });
        } else {
          // Determine conflict type based on program assignments
          const conflictType = this.determineConflictType(vehicleId, activePrograms);
          const affectedVehicleCount = this.calculateAffectedVehicleCount(activePrograms);
          
          conflicts.push({
            vehicleId,
            conflictType,
            existingPrograms: activePrograms,
            affectedVehicleCount,
          });
        }
      }
      
      const hasConflicts = conflicts.some(conflict => conflict.conflictType !== 'none');
      const canProceedDirectly = !hasConflicts;
      
      return {
        hasConflicts,
        conflicts,
        canProceedDirectly,
      };
      
    } catch (error) {
      console.error('Error checking vehicle conflicts:', error);
      throw new Error('Failed to check program conflicts');
    }
  }
  
  /**
   * Determine the type of conflict for a specific vehicle
   */
  private determineConflictType(
    vehicleId: string, 
    programs: MaintenanceProgram[]
  ): VehicleConflict['conflictType'] {
    if (programs.length === 0) {
      return 'none';
    }
    
    // Check if vehicle is in single-vehicle programs only
    const singleVehiclePrograms = programs.filter(
      program => program.assignedVehicleIds.length === 1
    );
    
    // If all programs are single-vehicle, it's a single-vehicle conflict
    if (singleVehiclePrograms.length === programs.length) {
      return 'single-vehicle-program';
    }
    
    // Otherwise, it's part of multi-vehicle programs
    return 'multi-vehicle-program';
  }
  
  /**
   * Calculate total number of vehicles affected by existing programs
   */
  private calculateAffectedVehicleCount(programs: MaintenanceProgram[]): number {
    const allVehicleIds = new Set<string>();
    
    programs.forEach(program => {
      program.assignedVehicleIds.forEach(vehicleId => {
        allVehicleIds.add(vehicleId);
      });
    });
    
    return allVehicleIds.size;
  }
  
  /**
   * Execute conflict resolution based on user choice
   */
  async resolveConflict(
    action: ConflictResolutionAction,
    conflicts: VehicleConflict[]
  ): Promise<void> {
    try {
      switch (action.type) {
        case 'replace-program':
          await this.replaceSingleVehicleProgram(action.programId);
          break;
          
        case 'remove-vehicles':
          await this.removeVehiclesFromPrograms(action.programIds, action.vehicleIds);
          break;
          
        case 'edit-existing':
          // Navigation handled by UI - no backend action needed
          break;
          
        case 'proceed':
          // No conflicts to resolve
          break;
          
        default:
          throw new Error('Unknown conflict resolution action');
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
      throw new Error('Failed to resolve program conflict');
    }
  }
  
  /**
   * Delete a single-vehicle program to replace with new one
   */
  private async replaceSingleVehicleProgram(programId: string): Promise<void> {
    try {
      // Verify it's actually a single-vehicle program for safety
      const program = await programRepository.getById(programId);
      if (!program) {
        throw new Error('Program not found');
      }
      
      if (program.assignedVehicleIds.length !== 1) {
        throw new Error('Cannot replace multi-vehicle program');
      }
      
      await programRepository.delete(programId);
      console.log(`Replaced single-vehicle program: ${programId}`);
    } catch (error) {
      console.error('Error replacing program:', error);
      throw error;
    }
  }
  
  /**
   * Remove specific vehicles from multi-vehicle programs
   */
  private async removeVehiclesFromPrograms(
    programIds: string[], 
    vehicleIds: string[]
  ): Promise<void> {
    try {
      for (const programId of programIds) {
        const program = await programRepository.getById(programId);
        if (!program) {
          console.warn(`Program ${programId} not found, skipping`);
          continue;
        }
        
        // Remove specified vehicles from program
        const updatedVehicleIds = program.assignedVehicleIds.filter(
          vehicleId => !vehicleIds.includes(vehicleId)
        );
        
        if (updatedVehicleIds.length === 0) {
          // If no vehicles left, delete the program
          await programRepository.delete(programId);
          console.log(`Deleted empty program: ${programId}`);
        } else {
          // Update program with remaining vehicles
          await programRepository.update(programId, {
            assignedVehicleIds: updatedVehicleIds,
            updatedAt: new Date(),
          });
          console.log(`Removed vehicles from program: ${programId}`);
        }
      }
    } catch (error) {
      console.error('Error removing vehicles from programs:', error);
      throw error;
    }
  }
  
  /**
   * Get user-friendly description of conflict for UI display
   */
  getConflictDescription(conflict: VehicleConflict, vehicleName: string): string {
    switch (conflict.conflictType) {
      case 'none':
        return '';
        
      case 'single-vehicle-program':
        const program = conflict.existingPrograms[0];
        return `${vehicleName} is managed by "${program.name}"`;
        
      case 'multi-vehicle-program':
        const multiProgram = conflict.existingPrograms[0];
        const otherVehicleCount = conflict.affectedVehicleCount - 1;
        return `${vehicleName} is part of "${multiProgram.name}" with ${otherVehicleCount} other vehicle${otherVehicleCount !== 1 ? 's' : ''}`;
        
      default:
        return 'Unknown conflict type';
    }
  }
  
  /**
   * Get recommended resolution options for a conflict
   */
  getResolutionOptions(conflict: VehicleConflict): string[] {
    switch (conflict.conflictType) {
      case 'single-vehicle-program':
        return [
          'Edit Existing',
          'Replace Program'
        ];
        
      case 'multi-vehicle-program':
        return [
          'Edit Existing', 
          'Remove & Create New'
        ];
        
      default:
        return [];
    }
  }
}

// Export singleton instance
export const programConflictService = new ProgramConflictService();