// Secure Program Repository with authentication enforcement
import { FirebaseProgramRepository } from './FirebaseProgramRepository';
import { IProgramRepository } from './ProgramRepository';
import { MaintenanceProgram, ProgramAssignment, ConflictDetectionResult } from '../types';
import { auth } from '../services/firebase/config';

/**
 * Secure wrapper around FirebaseProgramRepository
 * Enforces authentication and user ownership on all operations
 */
export class SecureProgramRepository implements IProgramRepository {
  private firebaseRepo: FirebaseProgramRepository;

  constructor() {
    this.firebaseRepo = new FirebaseProgramRepository();
  }

  private requireAuth() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Authentication required');
    }
    return user;
  }

  private enforceUserOwnership(program: MaintenanceProgram, userId: string) {
    if (program.userId !== userId) {
      throw new Error('Unauthorized: Access denied');
    }
  }

  async create(data: Omit<MaintenanceProgram, 'id'>): Promise<MaintenanceProgram> {
    const user = this.requireAuth();
    
    // Enforce userId matches current user
    if (data.userId && data.userId !== user.uid) {
      throw new Error('Unauthorized: Cannot create program for another user');
    }

    const programData = {
      ...data,
      userId: user.uid, // Always set to current user
    };

    return this.firebaseRepo.create(programData);
  }

  async getById(id: string): Promise<MaintenanceProgram | null> {
    const user = this.requireAuth();
    const program = await this.firebaseRepo.getById(id);
    
    if (program) {
      this.enforceUserOwnership(program, user.uid);
    }
    
    return program;
  }

  async getAll(): Promise<MaintenanceProgram[]> {
    // Return only current user's programs
    return this.getUserPrograms();
  }

  async getUserPrograms(): Promise<MaintenanceProgram[]> {
    const user = this.requireAuth();
    
    // Use database-level filtering instead of in-memory filtering
    return this.firebaseRepo.getUserPrograms(user.uid);
  }

  async getActivePrograms(): Promise<MaintenanceProgram[]> {
    const user = this.requireAuth();
    
    // Use database-level filtering instead of in-memory filtering
    return this.firebaseRepo.getActivePrograms(user.uid);
  }

  async getProgramsByVehicle(vehicleId: string): Promise<MaintenanceProgram[]> {
    const user = this.requireAuth();
    
    // TODO: Verify user owns this vehicle first for security
    // For now, get programs by vehicle and filter by current user
    const programs = await this.firebaseRepo.getProgramsByVehicle(vehicleId);
    return programs.filter(program => program.userId === user.uid);
  }

  async update(id: string, data: Partial<MaintenanceProgram>): Promise<MaintenanceProgram> {
    const user = this.requireAuth();
    
    // First verify ownership
    const existingProgram = await this.getById(id);
    if (!existingProgram) {
      throw new Error('Program not found');
    }

    // Prevent userId modification
    const updateData = { ...data };
    delete updateData.userId;

    return this.firebaseRepo.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    const user = this.requireAuth();
    
    // First verify ownership
    const program = await this.getById(id);
    if (!program) {
      throw new Error('Program not found');
    }

    return this.firebaseRepo.delete(id);
  }

  async assignToVehicle(programId: string, vehicleId: string): Promise<ProgramAssignment> {
    const user = this.requireAuth();
    
    // Verify program ownership
    const program = await this.getById(programId);
    if (!program) {
      throw new Error('Program not found');
    }

    // TODO: Also verify vehicle ownership when we implement vehicle security check
    
    return this.firebaseRepo.assignToVehicle(programId, vehicleId);
  }

  async unassignFromVehicle(programId: string, vehicleId: string): Promise<void> {
    const user = this.requireAuth();
    
    // Verify program ownership
    const program = await this.getById(programId);
    if (!program) {
      throw new Error('Program not found');
    }

    return this.firebaseRepo.unassignFromVehicle(programId, vehicleId);
  }

  async getVehicleAssignments(vehicleId: string): Promise<ProgramAssignment[]> {
    const user = this.requireAuth();
    
    // Get all assignments for the vehicle
    const assignments = await this.firebaseRepo.getVehicleAssignments(vehicleId);
    
    // Filter to only include assignments for user's programs
    const userAssignments = [];
    for (const assignment of assignments) {
      const program = await this.firebaseRepo.getById(assignment.programId);
      if (program && program.userId === user.uid) {
        userAssignments.push(assignment);
      }
    }
    
    return userAssignments;
  }

  async getProgramAssignments(programId: string): Promise<ProgramAssignment[]> {
    const user = this.requireAuth();
    
    // Verify program ownership first
    const program = await this.getById(programId);
    if (!program) {
      throw new Error('Program not found');
    }

    return this.firebaseRepo.getProgramAssignments(programId);
  }

  async activateProgram(programId: string): Promise<void> {
    const user = this.requireAuth();
    
    // Verify ownership through update (which checks ownership)
    await this.update(programId, { isActive: true });
  }

  async deactivateProgram(programId: string): Promise<void> {
    const user = this.requireAuth();
    
    // Verify ownership through update (which checks ownership)
    await this.update(programId, { isActive: false });
  }

  // ===== CONFLICT MANAGEMENT METHODS (Phase 1A) =====

  async checkVehicleConflicts(vehicleIds: string[]): Promise<ConflictDetectionResult> {
    // Import at method level to avoid circular dependencies
    const { programConflictService } = await import('../services/ProgramConflictService');
    return programConflictService.checkVehicleConflicts(vehicleIds);
  }

  async removeVehicleFromProgram(programId: string, vehicleId: string): Promise<void> {
    const user = this.requireAuth();
    
    // Get program and verify ownership
    const program = await this.getById(programId);
    if (!program) {
      throw new Error('Program not found');
    }

    // Remove vehicle from assignedVehicleIds array
    const updatedVehicleIds = program.assignedVehicleIds.filter(id => id !== vehicleId);
    
    if (updatedVehicleIds.length === 0) {
      // If no vehicles left, delete the program
      await this.delete(programId);
      console.log(`Deleted empty program: ${programId}`);
    } else {
      // Update program with remaining vehicles
      await this.update(programId, { 
        assignedVehicleIds: updatedVehicleIds,
        updatedAt: new Date() 
      });
      console.log(`Removed vehicle ${vehicleId} from program: ${programId}`);
    }
  }

  async deleteProgram(programId: string): Promise<void> {
    // Use existing delete method which already has ownership verification
    await this.delete(programId);
  }
}

// Export singleton instance
export const programRepository = new SecureProgramRepository();