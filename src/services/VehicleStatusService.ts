// Vehicle Status Service - Calculate service due dates and status
import { Vehicle, MaintenanceLog, MaintenanceProgram } from '../types';

/**
 * Service name mapping for legacy service names
 * Maps old service names to current standardized names
 */
const SERVICE_NAME_MAPPING: { [oldName: string]: string } = {
  'Brake Pads, Rotors & Anti-Rattle Clips': 'Brake Pads & Rotors',
  // Add more mappings here as needed
};

/**
 * Normalize service name to current standard
 */
const normalizeServiceName = (serviceName: string): string => {
  return SERVICE_NAME_MAPPING[serviceName] || serviceName;
};

export interface NextServiceDue {
  service: string;           // "Oil Change"
  dueIn: string;            // "2,000 miles" or "2 months" 
  status: 'upcoming' | 'due' | 'overdue' | 'up_to_date';
  type: 'mileage' | 'time' | 'both';
  dueDate?: Date;
  dueMileage?: number;
  priority: number;         // For sorting (higher = more urgent)
}

export interface VehicleStatusSummary {
  nextService: NextServiceDue | null;
  overdueServices: NextServiceDue[];
  overdueCount: number;
  dueCount: number;
  upcomingCount: number;
  lastMaintenanceDate?: Date;
}

/**
 * Calculate the next service due for a vehicle based on its programs and maintenance history
 */
export const calculateNextServiceDue = (
  vehicle: Vehicle,
  programs: MaintenanceProgram[],
  maintenanceLogs: MaintenanceLog[]
): NextServiceDue | null => {
  if (!vehicle || programs.length === 0) {
    return null;
  }

  const allServiceDues: NextServiceDue[] = [];
  const currentDate = new Date();
  const currentMileage = vehicle.mileage;

  // Process each program's tasks
  programs.forEach(program => {
    if (!program.isActive) return;

    program.tasks.forEach(task => {
      const lastServiceLog = findLastServiceLog(task.name, maintenanceLogs);
      const nextDue = calculateTaskDueDate(task, lastServiceLog, currentDate, currentMileage);
      
      if (nextDue) {
        allServiceDues.push(nextDue);
      }
    });
  });

  // Sort by priority (most urgent first) and return the top priority service
  allServiceDues.sort((a, b) => b.priority - a.priority);
  
  return allServiceDues.length > 0 ? allServiceDues[0] : null;
};

/**
 * Calculate when a specific program task is due
 */
const calculateTaskDueDate = (
  task: any, // ProgramTask type
  lastServiceLog: MaintenanceLog | null,
  currentDate: Date,
  currentMileage: number
): NextServiceDue | null => {
  const baseDateForCalculation = lastServiceLog?.date || new Date(0); // Unix epoch if no service logged
  const baseMileageForCalculation = lastServiceLog?.mileage || 0;

  let dueDate: Date | undefined;
  let dueMileage: number | undefined;
  let status: NextServiceDue['status'] = 'upcoming';
  let priority = 0;

  // Calculate due dates based on interval type
  if (task.intervalType === 'time' || task.intervalType === 'dual') {
    dueDate = new Date(baseDateForCalculation);
    
    switch (task.timeIntervalUnit) {
      case 'days':
        dueDate.setDate(dueDate.getDate() + (task.timeIntervalValue || 0));
        break;
      case 'weeks':
        dueDate.setDate(dueDate.getDate() + ((task.timeIntervalValue || 0) * 7));
        break;
      case 'months':
        dueDate.setMonth(dueDate.getMonth() + (task.timeIntervalValue || 0));
        break;
      case 'years':
        dueDate.setFullYear(dueDate.getFullYear() + (task.timeIntervalValue || 0));
        break;
    }
  }

  if (task.intervalType === 'mileage' || task.intervalType === 'dual') {
    dueMileage = baseMileageForCalculation + (task.intervalValue || 0);
  }

  // Determine status based on current date/mileage vs due date/mileage
  const isOverdueByTime = dueDate && currentDate > dueDate;
  const isOverdueByMileage = dueMileage && currentMileage >= dueMileage;
  
  if (task.intervalType === 'dual') {
    // For dual intervals, overdue if either condition is met (whichever comes first)
    if (isOverdueByTime || isOverdueByMileage) {
      status = 'overdue';
      priority = 100;
    }
  } else if (task.intervalType === 'time' && isOverdueByTime) {
    status = 'overdue';
    priority = 100;
  } else if (task.intervalType === 'mileage' && isOverdueByMileage) {
    status = 'overdue';
    priority = 100;
  }

  // Check if due soon (within 30 days or 1000 miles)
  if (status === 'upcoming') {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const isDueSoonByTime = dueDate && dueDate <= thirtyDaysFromNow;
    const isDueSoonByMileage = dueMileage && (dueMileage - currentMileage) <= 1000;
    
    if (isDueSoonByTime || isDueSoonByMileage) {
      status = 'due';
      priority = 75;
    } else {
      priority = 50;
    }
  }

  // Calculate "due in" string
  const dueIn = calculateDueInString(task.intervalType, dueDate, dueMileage, currentDate, currentMileage);

  return {
    service: normalizeServiceName(task.name),
    dueIn,
    status,
    type: task.intervalType,
    dueDate,
    dueMileage,
    priority
  };
};

/**
 * Find the most recent maintenance log for a specific service
 */
const findLastServiceLog = (serviceName: string, logs: MaintenanceLog[]): MaintenanceLog | null => {
  // Sort logs by date (most recent first) and find matching service
  const sortedLogs = logs
    .filter(log => log.title?.toLowerCase().includes(serviceName.toLowerCase()))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  
  return sortedLogs.length > 0 ? sortedLogs[0] : null;
};

/**
 * Generate abbreviated overdue string for table display with "+" prefix
 */
const calculateAbbreviatedDueInString = (
  intervalType: string,
  dueDate?: Date,
  dueMileage?: number,
  currentDate?: Date,
  currentMileage?: number
): string => {
  if (intervalType === 'mileage' && dueMileage && currentMileage !== undefined) {
    const milesDifference = dueMileage - currentMileage;
    if (milesDifference <= 0) {
      return `+${Math.abs(milesDifference).toLocaleString()} mi`;
    }
    return `${milesDifference.toLocaleString()} mi`;
  }
  
  if (intervalType === 'time' && dueDate && currentDate) {
    const timeDifference = dueDate.getTime() - currentDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    
    if (daysDifference <= 0) {
      const absDays = Math.abs(daysDifference);
      if (absDays <= 30) {
        return `+${absDays} days`;
      } else if (absDays <= 365) {
        const months = Math.ceil(absDays / 30);
        return `+${months} mo`;
      } else {
        const years = Math.ceil(absDays / 365);
        return `+${years} yr`;
      }
    } else if (daysDifference <= 30) {
      return `${daysDifference} days`;
    } else if (daysDifference <= 365) {
      const months = Math.ceil(daysDifference / 30);
      return `${months} mo`;
    } else {
      const years = Math.ceil(daysDifference / 365);
      return `${years} yr`;
    }
  }
  
  if (intervalType === 'dual' && dueDate && dueMileage && currentDate && currentMileage !== undefined) {
    const milesDifference = dueMileage - currentMileage;
    const timeDifference = dueDate.getTime() - currentDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    
    // Return whichever comes first (most overdue)
    if (milesDifference <= 0 && daysDifference <= 0) {
      // Both overdue, return the more critical one
      if (Math.abs(milesDifference) > Math.abs(daysDifference) * 10) {
        return `+${Math.abs(milesDifference).toLocaleString()} mi`;
      } else {
        const absDays = Math.abs(daysDifference);
        return absDays <= 30 
          ? `+${absDays} days`
          : `+${Math.ceil(absDays / 30)} mo`;
      }
    } else if (milesDifference <= 0) {
      return `+${Math.abs(milesDifference).toLocaleString()} mi`;
    } else if (daysDifference <= 0) {
      const absDays = Math.abs(daysDifference);
      return absDays <= 30 
        ? `+${absDays} days`
        : `+${Math.ceil(absDays / 30)} mo`;
    } else {
      // Return whichever comes sooner
      if (milesDifference <= daysDifference * 10) {
        return `${milesDifference.toLocaleString()} mi`;
      } else {
        return daysDifference <= 30 
          ? `${daysDifference} days`
          : `${Math.ceil(daysDifference / 30)} mo`;
      }
    }
  }
  
  return 'Soon';
};

/**
 * Generate human-readable "due in" string (for backward compatibility)
 */
const calculateDueInString = (
  intervalType: string,
  dueDate?: Date,
  dueMileage?: number,
  currentDate?: Date,
  currentMileage?: number
): string => {
  return calculateAbbreviatedDueInString(intervalType, dueDate, dueMileage, currentDate, currentMileage);
};

/**
 * Calculate comprehensive vehicle status summary
 */
export const calculateVehicleStatusSummary = (
  vehicle: Vehicle,
  programs: MaintenanceProgram[],
  maintenanceLogs: MaintenanceLog[]
): VehicleStatusSummary => {
  if (!vehicle || programs.length === 0) {
    return {
      nextService: null,
      overdueServices: [],
      overdueCount: 0,
      dueCount: 0,
      upcomingCount: 0,
      lastMaintenanceDate: maintenanceLogs.length > 0 
        ? maintenanceLogs.sort((a, b) => b.date.getTime() - a.date.getTime())[0].date
        : undefined
    };
  }

  const allServiceDues: NextServiceDue[] = [];
  const currentDate = new Date();
  const currentMileage = vehicle.mileage;

  // Process each program's tasks
  programs.forEach(program => {
    if (!program.isActive) return;

    program.tasks.forEach(task => {
      const lastServiceLog = findLastServiceLog(task.name, maintenanceLogs);
      const nextDue = calculateTaskDueDate(task, lastServiceLog, currentDate, currentMileage);
      
      if (nextDue) {
        allServiceDues.push(nextDue);
      }
    });
  });

  // Sort by priority (most urgent first)
  allServiceDues.sort((a, b) => b.priority - a.priority);
  
  // Separate overdue services
  const overdueServices = allServiceDues.filter(service => service.status === 'overdue');
  const nextService = allServiceDues.length > 0 ? allServiceDues[0] : null;
  
  // Count services by status
  const overdueCount = allServiceDues.filter(s => s.status === 'overdue').length;
  const dueCount = allServiceDues.filter(s => s.status === 'due').length;
  const upcomingCount = allServiceDues.filter(s => s.status === 'upcoming').length;
  
  // Find last maintenance date
  const lastMaintenanceDate = maintenanceLogs.length > 0 
    ? maintenanceLogs.sort((a, b) => b.date.getTime() - a.date.getTime())[0].date
    : undefined;
  
  return {
    nextService,
    overdueServices,
    overdueCount,
    dueCount,
    upcomingCount,
    lastMaintenanceDate
  };
};