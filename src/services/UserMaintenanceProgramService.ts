import { userMaintenanceProgramRepository } from '../repositories/UserMaintenanceProgramRepository';
import { legalComplianceService } from './LegalComplianceService';
import { 
  UserMaintenanceProgram, 
  UserDefinedInterval,
  MaintenanceType 
} from '../types';

/**
 * User Maintenance Program Service
 * 
 * LEGAL SAFETY: This service implements the user-only maintenance program
 * architecture that eliminates all app suggestions and ensures 100% user
 * ownership and responsibility for maintenance schedules.
 * 
 * All methods include legal compliance checks to ensure users have accepted
 * maintenance disclaimers before accessing features.
 */
export class UserMaintenanceProgramService {
  private repository = userMaintenanceProgramRepository;
  private legalService = legalComplianceService;

  /**
   * Create a new user-defined maintenance program
   * LEGAL SAFETY: Requires legal compliance and enforces user-only creation
   */
  async createMaintenanceProgram(
    vehicleId: string, 
    programName: string,
    userId: string
  ): Promise<UserMaintenanceProgram> {
    try {
      // CRITICAL: Validate legal compliance before any maintenance operations
      await this.legalService.validateMaintenanceAccess(userId);

      // Create empty program that user must populate themselves
      const program = await this.repository.createEmptyProgram(vehicleId, programName);
      
      console.log(`User-created maintenance program: ${programName} for vehicle ${vehicleId}`);
      
      return program;
    } catch (error) {
      console.error('Failed to create maintenance program:', error);
      throw new Error(`Maintenance program creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get maintenance program by ID
   * Includes legal compliance validation
   */
  async getMaintenanceProgram(programId: string, userId: string): Promise<UserMaintenanceProgram | null> {
    try {
      // Validate legal compliance
      await this.legalService.validateMaintenanceAccess(userId);

      return await this.repository.getById(programId);
    } catch (error) {
      console.error('Failed to get maintenance program:', error);
      throw new Error(`Failed to retrieve maintenance program: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all maintenance programs for a vehicle
   */
  async getMaintenanceProgramsForVehicle(vehicleId: string, userId: string): Promise<UserMaintenanceProgram[]> {
    try {
      // Validate legal compliance
      await this.legalService.validateMaintenanceAccess(userId);

      return await this.repository.getByVehicleId(vehicleId);
    } catch (error) {
      console.error('Failed to get maintenance programs for vehicle:', error);
      throw new Error(`Failed to retrieve maintenance programs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all maintenance programs for current user
   */
  async getAllMaintenancePrograms(userId: string): Promise<UserMaintenanceProgram[]> {
    try {
      // Validate legal compliance
      await this.legalService.validateMaintenanceAccess(userId);

      return await this.repository.getAll();
    } catch (error) {
      console.error('Failed to get all maintenance programs:', error);
      throw new Error(`Failed to retrieve maintenance programs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update maintenance program
   * LEGAL SAFETY: Preserves user-only constraints
   */
  async updateMaintenanceProgram(
    programId: string, 
    updates: Partial<UserMaintenanceProgram>,
    userId: string
  ): Promise<UserMaintenanceProgram> {
    try {
      // Validate legal compliance
      await this.legalService.validateMaintenanceAccess(userId);

      // Remove any potentially unsafe fields from updates
      const safeUpdates = this.sanitizeUpdates(updates);

      return await this.repository.update(programId, safeUpdates);
    } catch (error) {
      console.error('Failed to update maintenance program:', error);
      throw new Error(`Maintenance program update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete maintenance program
   */
  async deleteMaintenanceProgram(programId: string, userId: string): Promise<void> {
    try {
      // Validate legal compliance
      await this.legalService.validateMaintenanceAccess(userId);

      await this.repository.delete(programId);
      
      console.log(`User deleted maintenance program: ${programId}`);
    } catch (error) {
      console.error('Failed to delete maintenance program:', error);
      throw new Error(`Maintenance program deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add user-defined interval to maintenance program
   * LEGAL SAFETY: Ensures interval is 100% user-created
   */
  async addMaintenanceInterval(
    programId: string,
    intervalData: {
      title: string;
      description?: string;
      type: MaintenanceType;
      mileageInterval?: number;
      timeInterval?: number;
      estimatedCost?: number;
      notes?: string;
    },
    userId: string
  ): Promise<UserMaintenanceProgram> {
    try {
      // Validate legal compliance
      await this.legalService.validateMaintenanceAccess(userId);

      // Validate interval data
      this.validateIntervalData(intervalData);

      const program = await this.repository.addInterval(programId, intervalData);
      
      console.log(`User added maintenance interval: ${intervalData.title} to program ${programId}`);
      
      return program;
    } catch (error) {
      console.error('Failed to add maintenance interval:', error);
      throw new Error(`Maintenance interval addition failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update maintenance interval
   */
  async updateMaintenanceInterval(
    programId: string,
    intervalId: string,
    updates: Partial<UserDefinedInterval>,
    userId: string
  ): Promise<UserMaintenanceProgram> {
    try {
      // Validate legal compliance
      await this.legalService.validateMaintenanceAccess(userId);

      // Remove any potentially unsafe fields from updates
      const safeUpdates = this.sanitizeIntervalUpdates(updates);

      return await this.repository.updateInterval(programId, intervalId, safeUpdates);
    } catch (error) {
      console.error('Failed to update maintenance interval:', error);
      throw new Error(`Maintenance interval update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove maintenance interval
   */
  async removeMaintenanceInterval(
    programId: string,
    intervalId: string,
    userId: string
  ): Promise<UserMaintenanceProgram> {
    try {
      // Validate legal compliance
      await this.legalService.validateMaintenanceAccess(userId);

      const program = await this.repository.removeInterval(programId, intervalId);
      
      console.log(`User removed maintenance interval ${intervalId} from program ${programId}`);
      
      return program;
    } catch (error) {
      console.error('Failed to remove maintenance interval:', error);
      throw new Error(`Maintenance interval removal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get suggested maintenance categories (user education only)
   * LEGAL SAFETY: These are educational categories, not recommendations
   */
  getMaintenanceCategories(): { type: MaintenanceType; examples: string[] }[] {
    return [
      {
        type: 'PREVENTIVE',
        examples: [
          'Oil Change',
          'Air Filter Replacement', 
          'Brake Inspection',
          'Tire Rotation',
          'Coolant Flush',
          'Transmission Service'
        ]
      },
      {
        type: 'MODIFICATION',
        examples: [
          'Aftermarket Parts Installation',
          'Performance Upgrade',
          'Accessory Installation',
          'Aesthetic Modification',
          'Technology Upgrade'
        ]
      },
      {
        type: 'REPAIR',
        examples: [
          'Engine Repair',
          'Brake Repair',
          'Electrical Issue Fix',
          'Body Damage Repair',
          'Suspension Repair',
          'Transmission Repair'
        ]
      }
    ];
  }

  /**
   * Generate maintenance program summary for user
   */
  async getMaintenanceProgramSummary(programId: string, userId: string): Promise<{
    program: UserMaintenanceProgram;
    totalIntervals: number;
    intervalsByType: Record<MaintenanceType, number>;
    estimatedAnnualCost: number;
    upcomingIntervals: UserDefinedInterval[];
  }> {
    try {
      // Validate legal compliance
      await this.legalService.validateMaintenanceAccess(userId);

      const program = await this.repository.getById(programId);
      if (!program) {
        throw new Error('Maintenance program not found');
      }

      const intervalsByType: Record<MaintenanceType, number> = {
        PREVENTIVE: 0,
        MODIFICATION: 0,
        REPAIR: 0,
      };

      let estimatedAnnualCost = 0;

      program.intervals.forEach(interval => {
        intervalsByType[interval.type]++;
        
        if (interval.estimatedCost && interval.timeInterval) {
          // Calculate annual cost based on time interval
          const annualOccurrences = 12 / interval.timeInterval;
          estimatedAnnualCost += interval.estimatedCost * annualOccurrences;
        }
      });

      // For demo purposes, "upcoming" intervals are those with time-based triggers
      const upcomingIntervals = program.intervals.filter(interval => interval.timeInterval);

      return {
        program,
        totalIntervals: program.intervals.length,
        intervalsByType,
        estimatedAnnualCost: Math.round(estimatedAnnualCost),
        upcomingIntervals,
      };
    } catch (error) {
      console.error('Failed to generate maintenance program summary:', error);
      throw new Error(`Summary generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===== PRIVATE VALIDATION METHODS =====

  /**
   * Sanitize program updates to preserve legal constraints
   */
  private sanitizeUpdates(updates: Partial<UserMaintenanceProgram>): Partial<UserMaintenanceProgram> {
    const safeUpdates: Partial<UserMaintenanceProgram> = {};

    // Allow only safe fields to be updated
    if (updates.name !== undefined) {
      safeUpdates.name = updates.name;
    }
    if (updates.intervals !== undefined) {
      safeUpdates.intervals = updates.intervals;
    }

    return safeUpdates;
  }

  /**
   * Sanitize interval updates to preserve legal constraints
   */
  private sanitizeIntervalUpdates(updates: Partial<UserDefinedInterval>): Partial<UserDefinedInterval> {
    const safeUpdates: Partial<UserDefinedInterval> = {};

    // Allow only safe fields to be updated
    if (updates.title !== undefined) {
      safeUpdates.title = updates.title;
    }
    if (updates.description !== undefined) {
      safeUpdates.description = updates.description;
    }
    if (updates.type !== undefined) {
      safeUpdates.type = updates.type;
    }
    if (updates.mileageInterval !== undefined) {
      safeUpdates.mileageInterval = updates.mileageInterval;
    }
    if (updates.timeInterval !== undefined) {
      safeUpdates.timeInterval = updates.timeInterval;
    }
    if (updates.estimatedCost !== undefined) {
      safeUpdates.estimatedCost = updates.estimatedCost;
    }
    if (updates.notes !== undefined) {
      safeUpdates.notes = updates.notes;
    }

    return safeUpdates;
  }

  /**
   * Validate interval data before creation
   */
  private validateIntervalData(data: any): void {
    const errors: string[] = [];

    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      errors.push('Interval title is required');
    }

    if (!data.type || !['PREVENTIVE', 'MODIFICATION', 'REPAIR'].includes(data.type)) {
      errors.push('Valid maintenance type is required (PREVENTIVE, MODIFICATION, or REPAIR)');
    }

    if (!data.mileageInterval && !data.timeInterval) {
      errors.push('Either mileage interval or time interval is required');
    }

    if (data.mileageInterval && (typeof data.mileageInterval !== 'number' || data.mileageInterval <= 0)) {
      errors.push('Mileage interval must be a positive number');
    }

    if (data.timeInterval && (typeof data.timeInterval !== 'number' || data.timeInterval <= 0)) {
      errors.push('Time interval must be a positive number (in months)');
    }

    if (data.estimatedCost && (typeof data.estimatedCost !== 'number' || data.estimatedCost < 0)) {
      errors.push('Estimated cost must be a non-negative number');
    }

    if (errors.length > 0) {
      throw new Error(`Interval validation failed: ${errors.join(', ')}`);
    }
  }
}

// Singleton service instance
export const userMaintenanceProgramService = new UserMaintenanceProgramService();