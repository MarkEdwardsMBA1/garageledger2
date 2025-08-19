// Smart Reminder Calculation Service
import { MaintenanceProgram, ProgramTask, Vehicle } from '../types';

export interface ReminderItem {
  id: string;
  programId: string;
  programName: string;
  taskId: string;
  taskName: string;
  taskDescription: string;
  taskCategory: string;
  vehicleId: string;
  vehicleName: string;
  status: 'upcoming' | 'due' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueType: 'mileage' | 'time' | 'both';
  
  // Mileage-based reminders
  currentMileage?: number;
  dueMileage?: number;
  mileageOverdue?: number;
  
  // Time-based reminders
  lastServiceDate?: Date;
  dueDate?: Date;
  daysOverdue?: number;
  
  // Combined reminders
  intervalMileage?: number;
  intervalTimeValue?: number;
  intervalTimeUnit?: 'days' | 'weeks' | 'months' | 'years';
  
  // Estimated dates
  estimatedDueDate?: Date;
  estimatedMileageDueDate?: Date;
  
  // Actions
  actionRequired: boolean;
  reminderOffset: number; // Days before due to start reminding
}

export interface VehicleUsagePattern {
  vehicleId: string;
  averageMilesPerDay: number;
  averageMilesPerWeek: number;
  averageMilesPerMonth: number;
  averageMilesPerYear: number;
  lastUpdated: Date;
  confidence: 'low' | 'medium' | 'high'; // Based on data quality
}

export interface ReminderCalculationResult {
  reminders: ReminderItem[];
  vehiclePatterns: VehicleUsagePattern[];
  summary: {
    total: number;
    overdue: number;
    due: number;
    upcoming: number;
    critical: number;
  };
}

/**
 * Smart Reminder Calculation Service
 * Calculates maintenance due dates, overdue items, and upcoming reminders
 */
export class ReminderCalculationService {
  
  /**
   * Calculate all reminders for user's vehicles and programs
   */
  async calculateReminders(
    vehicles: Vehicle[],
    programs: MaintenanceProgram[],
    maintenanceHistory?: any[] // TODO: Add maintenance history when available
  ): Promise<ReminderCalculationResult> {
    
    const reminders: ReminderItem[] = [];
    const vehiclePatterns = this.calculateVehicleUsagePatterns(vehicles, maintenanceHistory);
    
    // Calculate reminders for each vehicle-program combination
    for (const vehicle of vehicles) {
      const vehiclePrograms = programs.filter(program => 
        program.assignedVehicleIds.includes(vehicle.id) && program.isActive
      );
      
      for (const program of vehiclePrograms) {
        for (const task of program.tasks) {
          if (task.isActive) {
            const reminder = this.calculateTaskReminder(
              vehicle,
              program,
              task,
              vehiclePatterns.find(p => p.vehicleId === vehicle.id),
              maintenanceHistory
            );
            
            if (reminder) {
              reminders.push(reminder);
            }
          }
        }
      }
    }
    
    // Sort reminders by priority and due date
    reminders.sort(this.compareReminderPriority);
    
    const summary = this.calculateReminderSummary(reminders);
    
    return {
      reminders,
      vehiclePatterns,
      summary
    };
  }
  
  /**
   * Calculate reminder for a specific task
   */
  private calculateTaskReminder(
    vehicle: Vehicle,
    program: MaintenanceProgram,
    task: ProgramTask,
    usagePattern?: VehicleUsagePattern,
    maintenanceHistory?: any[]
  ): ReminderItem | null {
    
    const vehicleName = vehicle.notes?.trim() || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    const currentMileage = vehicle.mileage || 0;
    
    // Find last service date for this task (TODO: implement when maintenance history is available)
    const lastServiceDate = this.findLastServiceDate(vehicle.id, task, maintenanceHistory);
    
    let status: 'upcoming' | 'due' | 'overdue' = 'upcoming';
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let actionRequired = false;
    let dueType: 'mileage' | 'time' | 'both' = 'mileage';
    
    // Mileage calculations
    let dueMileage: number | undefined;
    let mileageOverdue: number | undefined;
    let estimatedMileageDueDate: Date | undefined;
    
    // Time calculations  
    let dueDate: Date | undefined;
    let daysOverdue: number | undefined;
    let estimatedDueDate: Date | undefined;
    
    const today = new Date();
    const reminderOffset = task.reminderOffset || 7; // Default 7 days
    
    // Calculate based on interval type
    switch (task.intervalType) {
      case 'mileage':
        dueType = 'mileage';
        if (task.intervalValue > 0) {
          dueMileage = this.calculateDueMileage(currentMileage, task.intervalValue, lastServiceDate);
          mileageOverdue = Math.max(0, currentMileage - dueMileage);
          
          // Estimate when mileage will be reached
          if (usagePattern && usagePattern.averageMilesPerDay > 0) {
            const milesToGo = Math.max(0, dueMileage - currentMileage);
            const daysToGo = milesToGo / usagePattern.averageMilesPerDay;
            estimatedMileageDueDate = new Date(today.getTime() + (daysToGo * 24 * 60 * 60 * 1000));
          }
          
          // Determine status based on mileage
          if (mileageOverdue > 0) {
            status = 'overdue';
            priority = mileageOverdue > (task.intervalValue * 0.1) ? 'critical' : 'high';
            actionRequired = true;
          } else if (currentMileage >= (dueMileage - (task.intervalValue * 0.1))) {
            status = 'due';
            priority = 'high';
            actionRequired = true;
          } else if (estimatedMileageDueDate && estimatedMileageDueDate <= new Date(today.getTime() + (reminderOffset * 24 * 60 * 60 * 1000))) {
            status = 'upcoming';
            priority = 'medium';
          }
        }
        break;
        
      case 'time':
        dueType = 'time';
        if (task.timeIntervalValue && task.timeIntervalValue > 0 && task.timeIntervalUnit) {
          dueDate = this.calculateDueDate(lastServiceDate, task.timeIntervalValue, task.timeIntervalUnit);
          daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000)));
          
          // Determine status based on time
          if (daysOverdue > 0) {
            status = 'overdue';
            priority = daysOverdue > 30 ? 'critical' : 'high';
            actionRequired = true;
          } else if (dueDate <= new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000))) {
            status = 'due';
            priority = 'high';
            actionRequired = true;
          } else if (dueDate <= new Date(today.getTime() + (reminderOffset * 24 * 60 * 60 * 1000))) {
            status = 'upcoming';
            priority = 'medium';
          }
        }
        break;
        
      case 'dual':
        dueType = 'both';
        let mileageStatus: 'upcoming' | 'due' | 'overdue' = 'upcoming';
        let timeStatus: 'upcoming' | 'due' | 'overdue' = 'upcoming';
        
        // Calculate mileage component
        if (task.intervalValue > 0) {
          dueMileage = this.calculateDueMileage(currentMileage, task.intervalValue, lastServiceDate);
          mileageOverdue = Math.max(0, currentMileage - dueMileage);
          
          if (mileageOverdue > 0) {
            mileageStatus = 'overdue';
          } else if (currentMileage >= (dueMileage - (task.intervalValue * 0.1))) {
            mileageStatus = 'due';
          }
          
          if (usagePattern && usagePattern.averageMilesPerDay > 0) {
            const milesToGo = Math.max(0, dueMileage - currentMileage);
            const daysToGo = milesToGo / usagePattern.averageMilesPerDay;
            estimatedMileageDueDate = new Date(today.getTime() + (daysToGo * 24 * 60 * 60 * 1000));
          }
        }
        
        // Calculate time component
        if (task.timeIntervalValue && task.timeIntervalValue > 0 && task.timeIntervalUnit) {
          dueDate = this.calculateDueDate(lastServiceDate, task.timeIntervalValue, task.timeIntervalUnit);
          daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000)));
          
          if (daysOverdue > 0) {
            timeStatus = 'overdue';
          } else if (dueDate <= new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000))) {
            timeStatus = 'due';
          }
        }
        
        // Use whichever comes first (most urgent)
        if (mileageStatus === 'overdue' || timeStatus === 'overdue') {
          status = 'overdue';
          priority = 'critical';
          actionRequired = true;
        } else if (mileageStatus === 'due' || timeStatus === 'due') {
          status = 'due';
          priority = 'high';
          actionRequired = true;
        } else {
          status = 'upcoming';
          priority = 'medium';
        }
        
        // Estimate combined due date (earliest of the two)
        if (estimatedMileageDueDate && dueDate) {
          estimatedDueDate = estimatedMileageDueDate < dueDate ? estimatedMileageDueDate : dueDate;
        } else if (estimatedMileageDueDate) {
          estimatedDueDate = estimatedMileageDueDate;
        } else if (dueDate) {
          estimatedDueDate = dueDate;
        }
        break;
    }
    
    // Only return reminders that need attention (not far future)
    if (status === 'upcoming' && priority === 'low') {
      return null;
    }
    
    return {
      id: `reminder_${program.id}_${task.id}_${vehicle.id}`,
      programId: program.id,
      programName: program.name,
      taskId: task.id,
      taskName: task.name,
      taskDescription: task.description || '',
      taskCategory: task.category,
      vehicleId: vehicle.id,
      vehicleName,
      status,
      priority,
      dueType,
      currentMileage,
      dueMileage,
      mileageOverdue,
      lastServiceDate,
      dueDate,
      daysOverdue,
      intervalMileage: task.intervalValue,
      intervalTimeValue: task.timeIntervalValue,
      intervalTimeUnit: task.timeIntervalUnit,
      estimatedDueDate,
      estimatedMileageDueDate,
      actionRequired,
      reminderOffset
    };
  }
  
  /**
   * Calculate due mileage based on current mileage and interval
   */
  private calculateDueMileage(currentMileage: number, intervalMileage: number, lastServiceDate?: Date): number {
    // For now, use simple calculation: next service at current + interval
    // TODO: Improve with actual last service mileage when maintenance history is available
    return Math.ceil((currentMileage + intervalMileage) / 1000) * 1000; // Round to nearest 1000
  }
  
  /**
   * Calculate due date based on last service and time interval
   */
  private calculateDueDate(lastServiceDate: Date | undefined, intervalValue: number, intervalUnit: string): Date {
    const baseDate = lastServiceDate || new Date(); // Use today if no last service
    const dueDate = new Date(baseDate);
    
    switch (intervalUnit) {
      case 'days':
        dueDate.setDate(dueDate.getDate() + intervalValue);
        break;
      case 'weeks':
        dueDate.setDate(dueDate.getDate() + (intervalValue * 7));
        break;
      case 'months':
        dueDate.setMonth(dueDate.getMonth() + intervalValue);
        break;
      case 'years':
        dueDate.setFullYear(dueDate.getFullYear() + intervalValue);
        break;
    }
    
    return dueDate;
  }
  
  /**
   * Find last service date for a task
   * TODO: Implement when maintenance history is available
   */
  private findLastServiceDate(vehicleId: string, task: ProgramTask, maintenanceHistory?: any[]): Date | undefined {
    // For now, return undefined - will implement when maintenance history is available
    // This will search maintenance logs for the most recent service matching this task
    return undefined;
  }
  
  /**
   * Calculate vehicle usage patterns
   */
  private calculateVehicleUsagePatterns(vehicles: Vehicle[], maintenanceHistory?: any[]): VehicleUsagePattern[] {
    // TODO: Implement sophisticated usage pattern calculation
    // For now, return default patterns
    return vehicles.map(vehicle => ({
      vehicleId: vehicle.id,
      averageMilesPerDay: 35, // Default US average
      averageMilesPerWeek: 245,
      averageMilesPerMonth: 1000,
      averageMilesPerYear: 12000,
      lastUpdated: new Date(),
      confidence: 'low' as const
    }));
  }
  
  /**
   * Compare reminders for priority sorting
   */
  private compareReminderPriority(a: ReminderItem, b: ReminderItem): number {
    // Priority order: critical > high > medium > low
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher priority first
    }
    
    // Status order: overdue > due > upcoming
    const statusOrder = { overdue: 3, due: 2, upcoming: 1 };
    const aStatus = statusOrder[a.status];
    const bStatus = statusOrder[b.status];
    
    if (aStatus !== bStatus) {
      return bStatus - aStatus; // More urgent status first
    }
    
    // Sort by days overdue or days until due
    if (a.daysOverdue && b.daysOverdue) {
      return b.daysOverdue - a.daysOverdue; // More overdue first
    }
    
    // Sort by estimated due date
    if (a.estimatedDueDate && b.estimatedDueDate) {
      return a.estimatedDueDate.getTime() - b.estimatedDueDate.getTime(); // Sooner first
    }
    
    return 0;
  }
  
  /**
   * Calculate summary statistics
   */
  private calculateReminderSummary(reminders: ReminderItem[]) {
    return {
      total: reminders.length,
      overdue: reminders.filter(r => r.status === 'overdue').length,
      due: reminders.filter(r => r.status === 'due').length,
      upcoming: reminders.filter(r => r.status === 'upcoming').length,
      critical: reminders.filter(r => r.priority === 'critical').length,
    };
  }
  
  /**
   * Get reminders for a specific vehicle
   */
  async getVehicleReminders(
    vehicleId: string,
    vehicles: Vehicle[],
    programs: MaintenanceProgram[]
  ): Promise<ReminderItem[]> {
    const result = await this.calculateReminders(vehicles, programs);
    return result.reminders.filter(reminder => reminder.vehicleId === vehicleId);
  }
  
  /**
   * Get upcoming reminders (due in next X days)
   */
  getUpcomingReminders(reminders: ReminderItem[], daysAhead: number = 14): ReminderItem[] {
    const cutoffDate = new Date(Date.now() + (daysAhead * 24 * 60 * 60 * 1000));
    
    return reminders.filter(reminder => {
      if (reminder.status === 'overdue' || reminder.status === 'due') {
        return true;
      }
      
      if (reminder.estimatedDueDate && reminder.estimatedDueDate <= cutoffDate) {
        return true;
      }
      
      return false;
    });
  }
}

// Export singleton instance
export const reminderCalculationService = new ReminderCalculationService();