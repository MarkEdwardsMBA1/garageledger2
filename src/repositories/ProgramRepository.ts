// Program Repository Interface and Base Implementation
import { MaintenanceProgram, ProgramAssignment, IBaseRepository, ConflictDetectionResult } from '../types';

export interface IProgramRepository extends IBaseRepository<MaintenanceProgram> {
  // Program-specific methods
  getUserPrograms(): Promise<MaintenanceProgram[]>;
  getActivePrograms(): Promise<MaintenanceProgram[]>;
  getProgramsByVehicle(vehicleId: string): Promise<MaintenanceProgram[]>;
  
  // Program assignment methods
  assignToVehicle(programId: string, vehicleId: string): Promise<ProgramAssignment>;
  unassignFromVehicle(programId: string, vehicleId: string): Promise<void>;
  getVehicleAssignments(vehicleId: string): Promise<ProgramAssignment[]>;
  getProgramAssignments(programId: string): Promise<ProgramAssignment[]>;
  
  // Program status methods
  activateProgram(programId: string): Promise<void>;
  deactivateProgram(programId: string): Promise<void>;
  
  // Conflict management methods (Phase 1)
  checkVehicleConflicts(vehicleIds: string[]): Promise<ConflictDetectionResult>;
  removeVehicleFromProgram(programId: string, vehicleId: string): Promise<void>;
  deleteProgram(programId: string): Promise<void>;
}

export interface IProgramAssignmentRepository extends IBaseRepository<ProgramAssignment> {
  getByProgram(programId: string): Promise<ProgramAssignment[]>;
  getByVehicle(vehicleId: string): Promise<ProgramAssignment[]>;
  getActiveAssignments(): Promise<ProgramAssignment[]>;
  findAssignment(programId: string, vehicleId: string): Promise<ProgramAssignment | null>;
}