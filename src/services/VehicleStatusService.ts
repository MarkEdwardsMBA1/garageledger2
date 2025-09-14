// Vehicle Status Service - Phase 2A: Service Due Calculations
// Calculates specific service intervals based on assigned programs vs maintenance history
import { Vehicle, MaintenanceProgram, MaintenanceLog, ProgramTask } from '../types';

export interface NextServiceDue {
  service: string;           // "Oil Change"
  dueIn: string;            // "2,000 miles" or "2 months" 
  status: 'upcoming' | 'due' | 'overdue' | 'up_to_date';
  type: 'mileage' | 'time' | 'both';
  dueDate?: Date;
  dueMileage?: number;
  overdueBy?: string;       // "200 miles overdue" or "1 month overdue"
  taskId: string;           // Reference to ProgramTask
  programName: string;      // Which program this service comes from
}

export interface VehicleStatusSummary {
  nextServiceDue: NextServiceDue | null;
  overdueServices: NextServiceDue[];
  upcomingServices: NextServiceDue[];
  totalOverdueCount: number;
  overallStatus: 'up_to_date' | 'upcoming' | 'due' | 'overdue';
}

export class VehicleStatusService {
  /**
   * Calculate comprehensive vehicle status based on assigned programs and maintenance history
   */
  static calculateVehicleStatus(
    vehicle: Vehicle,
    assignedPrograms: MaintenanceProgram[],
    maintenanceLogs: MaintenanceLog[]
  ): VehicleStatusSummary {
    if (!assignedPrograms || assignedPrograms.length === 0) {
      return {
        nextServiceDue: null,
        overdueServices: [],
        upcomingServices: [],
        totalOverdueCount: 0,
        overallStatus: 'up_to_date'
      };
    }

    // Collect all active tasks from assigned programs
    const allTasks: Array<{ task: ProgramTask; programName: string }> = [];
    assignedPrograms.forEach(program => {
      if (program.isActive && program.tasks) {
        program.tasks
          .filter(task => task.isActive)
          .forEach(task => {
            allTasks.push({ task, programName: program.name });
          });
      }
    });

    if (allTasks.length === 0) {
      return {
        nextServiceDue: null,
        overdueServices: [],
        upcomingServices: [],
        totalOverdueCount: 0,
        overallStatus: 'up_to_date'
      };
    }

    // Calculate due dates for each task
    const serviceDueItems: NextServiceDue[] = allTasks
      .map(({ task, programName }) => 
        this.calculateTaskDueStatus(vehicle, task, programName, maintenanceLogs)
      )
      .filter(item => item !== null) as NextServiceDue[];

    // Categorize services by status
    const overdueServices = serviceDueItems.filter(item => item.status === 'overdue');
    const dueServices = serviceDueItems.filter(item => item.status === 'due');
    const upcomingServices = serviceDueItems.filter(item => item.status === 'upcoming');

    // Find the most urgent service (overdue > due > upcoming)
    let nextServiceDue: NextServiceDue | null = null;
    if (overdueServices.length > 0) {
      nextServiceDue = overdueServices[0]; // Most overdue
    } else if (dueServices.length > 0) {
      nextServiceDue = dueServices[0]; // Most due
    } else if (upcomingServices.length > 0) {
      nextServiceDue = upcomingServices[0]; // Next upcoming
    }

    // Determine overall status
    let overallStatus: 'up_to_date' | 'upcoming' | 'due' | 'overdue' = 'up_to_date';
    if (overdueServices.length > 0) {
      overallStatus = 'overdue';
    } else if (dueServices.length > 0) {
      overallStatus = 'due';
    } else if (upcomingServices.length > 0) {
      overallStatus = 'upcoming';
    }

    return {
      nextServiceDue,
      overdueServices,
      upcomingServices,
      totalOverdueCount: overdueServices.length,
      overallStatus
    };
  }

  /**
   * Calculate due status for a specific program task
   */
  private static calculateTaskDueStatus(
    vehicle: Vehicle,
    task: ProgramTask,
    programName: string,
    maintenanceLogs: MaintenanceLog[]
  ): NextServiceDue | null {
    // Find the most recent maintenance log that matches this task
    const lastServiceLog = this.findLastServiceForTask(task, maintenanceLogs);
    
    const currentMileage = vehicle.mileage;
    const currentDate = new Date();

    // Calculate next due based on interval type
    let dueMileage: number | undefined;
    let dueDate: Date | undefined;
    let baseMileage: number;
    let baseDate: Date;

    if (lastServiceLog) {
      baseMileage = lastServiceLog.mileage;
      baseDate = lastServiceLog.date;
    } else {
      // No previous service - use vehicle creation date as baseline
      baseMileage = Math.max(0, currentMileage - 5000); // Assume some baseline mileage
      baseDate = vehicle.createdAt;
    }

    // Calculate due dates based on interval type
    switch (task.intervalType) {
      case 'mileage':
        dueMileage = baseMileage + task.intervalValue;
        break;
      
      case 'time':
        if (task.timeIntervalUnit && task.intervalValue) {
          dueDate = this.addTimeInterval(baseDate, task.intervalValue, task.timeIntervalUnit);
        }
        break;
      
      case 'dual':
        dueMileage = baseMileage + task.intervalValue;
        if (task.timeIntervalUnit && task.timeIntervalValue) {
          dueDate = this.addTimeInterval(baseDate, task.timeIntervalValue, task.timeIntervalUnit);
        }
        break;
    }

    // Determine status and format due information
    return this.determineServiceStatus(
      task,
      programName,
      currentMileage,
      currentDate,
      dueMileage,
      dueDate
    );
  }

  /**
   * Find the most recent maintenance log that corresponds to this task
   */
  private static findLastServiceForTask(
    task: ProgramTask,
    maintenanceLogs: MaintenanceLog[]
  ): MaintenanceLog | null {
    // Sort logs by date (most recent first)
    const sortedLogs = maintenanceLogs
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // For now, use simple name matching - in the future this could be more sophisticated
    // matching based on service categories or task IDs
    return sortedLogs.find(log => {
      const taskNameLower = task.name.toLowerCase();
      const logTitleLower = log.title.toLowerCase();
      
      // Simple keyword matching
      if (taskNameLower.includes('oil') && logTitleLower.includes('oil')) return true;
      if (taskNameLower.includes('brake') && logTitleLower.includes('brake')) return true;
      if (taskNameLower.includes('tire') && (logTitleLower.includes('tire') || logTitleLower.includes('wheel'))) return true;
      if (taskNameLower.includes('filter') && logTitleLower.includes('filter')) return true;
      
      return false;
    }) || null;
  }

  /**
   * Add time interval to a base date
   */
  private static addTimeInterval(
    baseDate: Date,
    value: number,
    unit: 'days' | 'weeks' | 'months' | 'years'
  ): Date {
    const result = new Date(baseDate);
    
    switch (unit) {
      case 'days':
        result.setDate(result.getDate() + value);
        break;
      case 'weeks':
        result.setDate(result.getDate() + (value * 7));
        break;
      case 'months':
        result.setMonth(result.getMonth() + value);
        break;
      case 'years':
        result.setFullYear(result.getFullYear() + value);
        break;
    }
    
    return result;
  }

  /**
   * Determine service status and format display information
   */
  private static determineServiceStatus(
    task: ProgramTask,
    programName: string,
    currentMileage: number,
    currentDate: Date,
    dueMileage?: number,
    dueDate?: Date
  ): NextServiceDue | null {
    let status: 'upcoming' | 'due' | 'overdue' = 'upcoming';
    let dueIn = '';
    let overdueBy: string | undefined;
    let type: 'mileage' | 'time' | 'both' = 'mileage';

    // Mileage-based calculation
    if (dueMileage !== undefined) {
      const mileageDifference = dueMileage - currentMileage;
      
      if (mileageDifference <= 0) {
        status = 'overdue';
        overdueBy = `${Math.abs(mileageDifference).toLocaleString()} miles overdue`;
        dueIn = overdueBy;
      } else if (mileageDifference <= 500) {
        status = 'due';
        dueIn = `${mileageDifference.toLocaleString()} miles`;
      } else {
        status = 'upcoming';
        dueIn = `${mileageDifference.toLocaleString()} miles`;
      }
      
      type = 'mileage';
    }

    // Time-based calculation
    if (dueDate !== undefined) {
      const timeDifference = dueDate.getTime() - currentDate.getTime();
      const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
      
      let timeStatus: 'upcoming' | 'due' | 'overdue' = 'upcoming';
      let timeDueIn = '';
      let timeOverdueBy: string | undefined;
      
      if (daysDifference <= 0) {
        timeStatus = 'overdue';
        const overdueDays = Math.abs(daysDifference);
        if (overdueDays < 30) {
          timeOverdueBy = `${overdueDays} days overdue`;
        } else if (overdueDays < 365) {
          timeOverdueBy = `${Math.floor(overdueDays / 30)} months overdue`;
        } else {
          timeOverdueBy = `${Math.floor(overdueDays / 365)} years overdue`;
        }
        timeDueIn = timeOverdueBy;
      } else if (daysDifference <= 30) {
        timeStatus = 'due';
        timeDueIn = daysDifference === 1 ? '1 day' : `${daysDifference} days`;
      } else if (daysDifference <= 365) {
        timeStatus = 'upcoming';
        const months = Math.floor(daysDifference / 30);
        timeDueIn = months === 1 ? '1 month' : `${months} months`;
      } else {
        timeStatus = 'upcoming';
        const years = Math.floor(daysDifference / 365);
        timeDueIn = years === 1 ? '1 year' : `${years} years`;
      }

      // For dual intervals, use the more urgent status
      if (task.intervalType === 'dual' && dueMileage !== undefined) {
        if (timeStatus === 'overdue' || status === 'overdue') {
          status = 'overdue';
          // Use whichever is more overdue
          overdueBy = timeStatus === 'overdue' && status !== 'overdue' ? timeOverdueBy : overdueBy;
          dueIn = overdueBy || dueIn;
        } else if (timeStatus === 'due' || status === 'due') {
          status = 'due';
          // Use whichever is due sooner
          dueIn = timeStatus === 'due' && status !== 'due' ? timeDueIn : dueIn;
        }
        type = 'both';
      } else if (task.intervalType === 'time') {
        status = timeStatus;
        dueIn = timeDueIn;
        overdueBy = timeOverdueBy;
        type = 'time';
      }
    }

    // Ensure dueIn is never empty
    if (!dueIn || dueIn.trim() === '') {
      if (dueMileage !== undefined) {
        const mileageDifference = dueMileage - currentMileage;
        dueIn = `${Math.abs(mileageDifference).toLocaleString()} miles`;
      } else if (dueDate !== undefined) {
        const timeDifference = dueDate.getTime() - currentDate.getTime();
        const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
        if (Math.abs(daysDifference) < 30) {
          dueIn = `${Math.abs(daysDifference)} days`;
        } else if (Math.abs(daysDifference) < 365) {
          dueIn = `${Math.floor(Math.abs(daysDifference) / 30)} months`;
        } else {
          dueIn = `${Math.floor(Math.abs(daysDifference) / 365)} years`;
        }
      } else {
        dueIn = 'pending calculation';
      }
    }

    return {
      service: this.normalizeServiceName(task.name),
      dueIn,
      status,
      type,
      dueDate,
      dueMileage,
      overdueBy,
      taskId: task.id,
      programName
    };
  }

  /**
   * Normalize service names to handle legacy data with incorrect names
   */
  private static normalizeServiceName(serviceName: string): string {
    // Handle brake service names that might include full parts list
    if (serviceName.includes('Brake Pads') && serviceName.includes('Rotors') && serviceName.includes('Anti-Rattle')) {
      return 'Brake Pads & Rotors';
    }
    
    // Handle other common naming variations
    if (serviceName.includes('Oil') && serviceName.includes('Filter')) {
      return 'Oil & Filter Change';
    }
    
    // Return original name if no normalization needed
    return serviceName;
  }

  /**
   * Get display-friendly status message for the status card
   */
  static getStatusMessage(vehicleStatus: VehicleStatusSummary): string {
    if (vehicleStatus.totalOverdueCount > 0) {
      if (vehicleStatus.nextServiceDue) {
        return `${vehicleStatus.nextServiceDue.service} ${vehicleStatus.nextServiceDue.dueIn}`;
      }
      return `${vehicleStatus.totalOverdueCount} services overdue`;
    }
    
    if (vehicleStatus.nextServiceDue) {
      const service = vehicleStatus.nextServiceDue;
      if (service.status === 'due') {
        return `${service.service} due in ${service.dueIn}`;
      } else if (service.status === 'upcoming') {
        return `${service.service} in ${service.dueIn}`;
      }
    }
    
    return 'All maintenance up to date';
  }

  /**
   * Get status color for UI display
   */
  static getStatusColor(status: 'up_to_date' | 'upcoming' | 'due' | 'overdue'): string {
    switch (status) {
      case 'overdue': return '#b91c1c'; // Critical Red
      case 'due': return '#ea580c';     // Signal Orange
      case 'upcoming': return '#0284c7'; // Electric Blue
      case 'up_to_date': return '#166534'; // Racing Green
      default: return '#9ca3af'; // Chrome Silver
    }
  }
}