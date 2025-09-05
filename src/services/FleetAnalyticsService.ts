// Fleet Analytics Service - Phase 5A: Cross-Vehicle Intelligence
// Aggregates data and insights across all user vehicles for fleet-wide analytics
import { Vehicle, MaintenanceLog, MaintenanceProgram } from '../types';
import { VehicleAnalyticsService, CostTrendAnalysis } from './VehicleAnalyticsService';

export interface FleetOverview {
  totalVehicles: number;
  totalMaintenanceRecords: number;
  totalCostAllTime: number;
  totalCostLast30Days: number;
  averageHealthScore: number;
  mostActiveVehicle: Vehicle | null;
  leastActiveVehicle: Vehicle | null;
  recentActivity: FleetActivity[];
  upcomingReminders: FleetReminder[];
  fleetCostTrends: FleetCostComparison[];
  fleetHealthTrend: 'improving' | 'declining' | 'stable';
  fleetStatus: FleetStatusSummary;
}

export interface FleetActivity {
  vehicleId: string;
  vehicleName: string;
  maintenanceLog: MaintenanceLog;
  daysAgo: number;
}

export interface FleetReminder {
  vehicleId: string;
  vehicleName: string;
  serviceName: string;
  dueDate: Date;
  dueMileage: number | null;
  daysUntilDue: number;
  priority: 'overdue' | 'due' | 'upcoming';
}

export interface FleetCostComparison {
  vehicleId: string;
  vehicleName: string;
  totalCost: number;
  costPerMile: number | null;
  monthlyAverage: number;
  costEfficiencyRank: number; // 1 = most efficient
  lastServiceCost: number;
}

export interface FleetHealthMetrics {
  averageScore: number;
  bestPerformer: { vehicleId: string; vehicleName: string; score: number };
  needsAttention: { vehicleId: string; vehicleName: string; score: number };
  trendDirection: 'improving' | 'declining' | 'stable';
  monthlyProgression: FleetHealthPoint[];
}

export interface FleetHealthPoint {
  month: string;
  averageScore: number;
  vehicleCount: number;
}

export interface FleetStatusSummary {
  totalServicesOverdue: number;
  totalServicesDue: number;
  totalServicesUpcoming: number;
  vehiclesWithOverdueServices: number;
  vehiclesUpToDate: number;
}

/**
 * Fleet Analytics Service
 * Provides cross-vehicle intelligence and fleet management insights
 */
export class FleetAnalyticsService {
  
  /**
   * Calculate comprehensive fleet overview
   */
  static async calculateFleetOverview(
    vehicles: Vehicle[],
    allMaintenanceLogs: MaintenanceLog[],
    allPrograms: MaintenanceProgram[]
  ): Promise<FleetOverview> {
    
    if (vehicles.length === 0) {
      return this.getEmptyFleetOverview();
    }

    // Basic fleet metrics
    const totalVehicles = vehicles.length;
    const totalMaintenanceRecords = allMaintenanceLogs.length;
    
    // Cost calculations
    const totalCostAllTime = allMaintenanceLogs
      .reduce((sum, log) => sum + (log.totalCost || 0), 0);
    
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
    const totalCostLast30Days = allMaintenanceLogs
      .filter(log => log.date >= thirtyDaysAgo)
      .reduce((sum, log) => sum + (log.totalCost || 0), 0);

    // Calculate health scores for all vehicles
    const vehicleHealthScores = vehicles.map(vehicle => {
      const vehicleLogs = allMaintenanceLogs.filter(log => log.vehicleId === vehicle.id);
      const vehiclePrograms = allPrograms.filter(program => 
        program.assignedVehicleIds.includes(vehicle.id)
      );
      
      const healthScore = VehicleAnalyticsService.generatePredictiveInsights(
        vehicleLogs, vehicle, vehiclePrograms
      ).maintenanceScore;
      
      return { vehicle, healthScore, activityCount: vehicleLogs.length };
    });

    const averageHealthScore = vehicleHealthScores.length > 0
      ? vehicleHealthScores.reduce((sum, item) => sum + item.healthScore, 0) / vehicleHealthScores.length
      : 0;

    // Find most and least active vehicles
    const sortedByActivity = vehicleHealthScores.sort((a, b) => b.activityCount - a.activityCount);
    const mostActiveVehicle = sortedByActivity[0]?.vehicle || null;
    const leastActiveVehicle = sortedByActivity[sortedByActivity.length - 1]?.vehicle || null;

    // Recent activity across fleet
    const recentActivity = this.calculateRecentActivity(vehicles, allMaintenanceLogs);
    
    // Upcoming reminders (simplified for MVP)
    const upcomingReminders = this.calculateUpcomingReminders(vehicles, allPrograms, allMaintenanceLogs);
    
    // Fleet cost comparisons
    const fleetCostTrends = this.calculateFleetCostComparisons(vehicles, allMaintenanceLogs);
    
    // Fleet health trend
    const fleetHealthTrend = this.calculateFleetHealthTrend(vehicleHealthScores);
    
    // Fleet status summary
    const fleetStatus = this.calculateFleetStatus(vehicles, allMaintenanceLogs, allPrograms);

    return {
      totalVehicles,
      totalMaintenanceRecords,
      totalCostAllTime,
      totalCostLast30Days,
      averageHealthScore,
      mostActiveVehicle,
      leastActiveVehicle,
      recentActivity,
      upcomingReminders,
      fleetCostTrends,
      fleetHealthTrend,
      fleetStatus
    };
  }

  /**
   * Calculate recent maintenance activity across all vehicles
   */
  private static calculateRecentActivity(
    vehicles: Vehicle[], 
    allMaintenanceLogs: MaintenanceLog[]
  ): FleetActivity[] {
    const now = new Date();
    const recentLogs = allMaintenanceLogs
      .filter(log => {
        const daysAgo = (now.getTime() - log.date.getTime()) / (24 * 60 * 60 * 1000);
        return daysAgo <= 30; // Last 30 days
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10); // Most recent 10 activities

    return recentLogs.map(log => {
      const vehicle = vehicles.find(v => v.id === log.vehicleId);
      const daysAgo = Math.floor((now.getTime() - log.date.getTime()) / (24 * 60 * 60 * 1000));
      
      return {
        vehicleId: log.vehicleId,
        vehicleName: vehicle && vehicle.year && vehicle.make && vehicle.model 
          ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` 
          : 'Unknown Vehicle',
        maintenanceLog: log,
        daysAgo
      };
    });
  }

  /**
   * Calculate upcoming reminders across fleet (simplified)
   */
  private static calculateUpcomingReminders(
    vehicles: Vehicle[],
    allPrograms: MaintenanceProgram[],
    allMaintenanceLogs: MaintenanceLog[]
  ): FleetReminder[] {
    const reminders: FleetReminder[] = [];
    const now = new Date();

    // Simplified reminder calculation - in real implementation, this would use VehicleStatusService
    vehicles.forEach(vehicle => {
      const vehiclePrograms = allPrograms.filter(program => 
        program.assignedVehicleIds.includes(vehicle.id)
      );
      const vehicleLogs = allMaintenanceLogs.filter(log => log.vehicleId === vehicle.id);
      
      // Simple heuristic: if no maintenance in last 90 days, suggest oil change
      if (vehicleLogs.length > 0) {
        const lastService = vehicleLogs.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
        const daysSinceLastService = (now.getTime() - lastService.date.getTime()) / (24 * 60 * 60 * 1000);
        
        if (daysSinceLastService > 90) {
          const dueDate = new Date(lastService.date.getTime() + (120 * 24 * 60 * 60 * 1000)); // 120 days after last service
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
          
          reminders.push({
            vehicleId: vehicle.id,
            vehicleName: vehicle && vehicle.year && vehicle.make && vehicle.model 
              ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` 
              : 'Unknown Vehicle',
            serviceName: 'Oil Change',
            dueDate,
            dueMileage: null,
            daysUntilDue,
            priority: daysUntilDue < 0 ? 'overdue' : daysUntilDue < 7 ? 'due' : 'upcoming'
          });
        }
      }
    });

    return reminders
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, 5); // Top 5 upcoming reminders
  }

  /**
   * Calculate fleet cost comparisons
   */
  private static calculateFleetCostComparisons(
    vehicles: Vehicle[],
    allMaintenanceLogs: MaintenanceLog[]
  ): FleetCostComparison[] {
    const comparisons = vehicles.map(vehicle => {
      const vehicleLogs = allMaintenanceLogs.filter(log => log.vehicleId === vehicle.id);
      const logsWithCost = vehicleLogs.filter(log => (log.totalCost || 0) > 0);
      
      const totalCost = logsWithCost.reduce((sum, log) => sum + (log.totalCost || 0), 0);
      
      // Calculate cost per mile if possible
      let costPerMile = null;
      const logsWithMileage = vehicleLogs.filter(log => log.mileage > 0);
      if (logsWithMileage.length >= 2) {
        const sortedByMileage = logsWithMileage.sort((a, b) => a.mileage - b.mileage);
        const totalMiles = sortedByMileage[sortedByMileage.length - 1].mileage - sortedByMileage[0].mileage;
        if (totalMiles > 0) {
          costPerMile = totalCost / totalMiles;
        }
      }
      
      // Calculate monthly average
      const oldestLog = vehicleLogs.sort((a, b) => a.date.getTime() - b.date.getTime())[0];
      const monthsSpan = oldestLog 
        ? Math.max(1, (Date.now() - oldestLog.date.getTime()) / (30 * 24 * 60 * 60 * 1000))
        : 1;
      const monthlyAverage = totalCost / monthsSpan;
      
      // Last service cost
      const lastServiceCost = vehicleLogs
        .sort((a, b) => b.date.getTime() - a.date.getTime())[0]?.totalCost || 0;

      return {
        vehicleId: vehicle.id,
        vehicleName: vehicle && vehicle.year && vehicle.make && vehicle.model 
          ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` 
          : 'Unknown Vehicle',
        totalCost,
        costPerMile,
        monthlyAverage,
        costEfficiencyRank: 0, // Will be calculated after sorting
        lastServiceCost
      };
    });

    // Rank by cost efficiency (lower cost per mile = better rank)
    const validCostPerMile = comparisons.filter(c => c.costPerMile !== null);
    validCostPerMile.sort((a, b) => (a.costPerMile || 0) - (b.costPerMile || 0));
    validCostPerMile.forEach((comparison, index) => {
      comparison.costEfficiencyRank = index + 1;
    });

    return comparisons.sort((a, b) => b.totalCost - a.totalCost);
  }

  /**
   * Calculate fleet health trend
   */
  private static calculateFleetHealthTrend(
    vehicleHealthScores: { vehicle: Vehicle; healthScore: number; activityCount: number }[]
  ): 'improving' | 'declining' | 'stable' {
    if (vehicleHealthScores.length === 0) return 'stable';
    
    const averageScore = vehicleHealthScores.reduce((sum, item) => sum + item.healthScore, 0) / vehicleHealthScores.length;
    
    // Simplified trend calculation - in real implementation, would compare historical data
    if (averageScore >= 75) return 'improving';
    if (averageScore < 50) return 'declining';
    return 'stable';
  }

  /**
   * Get detailed fleet health metrics
   */
  static calculateFleetHealthMetrics(
    vehicles: Vehicle[],
    allMaintenanceLogs: MaintenanceLog[],
    allPrograms: MaintenanceProgram[]
  ): FleetHealthMetrics {
    if (vehicles.length === 0) {
      return {
        averageScore: 0,
        bestPerformer: { vehicleId: '', vehicleName: 'No vehicles', score: 0 },
        needsAttention: { vehicleId: '', vehicleName: 'No vehicles', score: 0 },
        trendDirection: 'stable',
        monthlyProgression: []
      };
    }

    // Calculate health scores
    const vehicleHealthScores = vehicles.map(vehicle => {
      const vehicleLogs = allMaintenanceLogs.filter(log => log.vehicleId === vehicle.id);
      const vehiclePrograms = allPrograms.filter(program => 
        program.assignedVehicleIds.includes(vehicle.id)
      );
      
      const insights = VehicleAnalyticsService.generatePredictiveInsights(
        vehicleLogs, vehicle, vehiclePrograms
      );
      
      return {
        vehicleId: vehicle.id,
        vehicleName: vehicle && vehicle.year && vehicle.make && vehicle.model 
          ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` 
          : 'Unknown Vehicle',
        score: insights.maintenanceScore
      };
    });

    const averageScore = vehicleHealthScores.reduce((sum, item) => sum + item.score, 0) / vehicleHealthScores.length;
    
    const sortedByScore = vehicleHealthScores.sort((a, b) => b.score - a.score);
    const bestPerformer = sortedByScore[0];
    const needsAttention = sortedByScore[sortedByScore.length - 1];
    
    // Simplified trend calculation
    const trendDirection = averageScore >= 75 ? 'improving' : averageScore < 50 ? 'declining' : 'stable';
    
    // TODO: Calculate actual monthly progression from historical data
    const monthlyProgression: FleetHealthPoint[] = [];

    return {
      averageScore,
      bestPerformer,
      needsAttention,
      trendDirection,
      monthlyProgression
    };
  }

  /**
   * Calculate fleet cost insights
   */
  static calculateFleetCostInsights(
    vehicles: Vehicle[],
    allMaintenanceLogs: MaintenanceLog[]
  ): {
    totalFleetCost: number;
    averageCostPerVehicle: number;
    mostExpensiveVehicle: FleetCostComparison | null;
    mostEfficientVehicle: FleetCostComparison | null;
    fleetCostTrend: 'increasing' | 'decreasing' | 'stable';
    potentialSavings: number;
  } {
    const costComparisons = this.calculateFleetCostComparisons(vehicles, allMaintenanceLogs);
    
    const totalFleetCost = costComparisons.reduce((sum, comp) => sum + comp.totalCost, 0);
    const averageCostPerVehicle = vehicles.length > 0 ? totalFleetCost / vehicles.length : 0;
    
    const mostExpensiveVehicle = costComparisons.sort((a, b) => b.totalCost - a.totalCost)[0] || null;
    const mostEfficientVehicle = costComparisons
      .filter(comp => comp.costPerMile !== null)
      .sort((a, b) => (a.costPerMile || 0) - (b.costPerMile || 0))[0] || null;
    
    // Simplified cost trend calculation
    const recentCosts = allMaintenanceLogs
      .filter(log => {
        const daysAgo = (Date.now() - log.date.getTime()) / (24 * 60 * 60 * 1000);
        return daysAgo <= 90;
      })
      .reduce((sum, log) => sum + (log.totalCost || 0), 0);
    
    const fleetCostTrend: 'increasing' | 'decreasing' | 'stable' = 'stable'; // Simplified
    
    // Estimate potential savings from service synchronization
    const potentialSavings = vehicles.length > 1 ? averageCostPerVehicle * 0.1 : 0;
    
    return {
      totalFleetCost,
      averageCostPerVehicle,
      mostExpensiveVehicle,
      mostEfficientVehicle,
      fleetCostTrend,
      potentialSavings
    };
  }

  /**
   * Calculate fleet status summary (overdue/due/upcoming services)
   */
  private static calculateFleetStatus(
    vehicles: Vehicle[],
    allMaintenanceLogs: MaintenanceLog[],
    allPrograms: MaintenanceProgram[]
  ): FleetStatusSummary {
    // Simplified fleet status calculation
    // In a real implementation, this would integrate with proper program status tracking
    
    let totalServicesOverdue = 0;
    let totalServicesDue = 0;
    let totalServicesUpcoming = 0;
    let vehiclesWithOverdueServices = 0;
    let vehiclesUpToDate = 0;
    
    const now = new Date();
    
    vehicles.forEach(vehicle => {
      const vehicleLogs = allMaintenanceLogs.filter(log => log.vehicleId === vehicle.id);
      let vehicleHasOverdueServices = false;
      
      if (vehicleLogs.length > 0) {
        // Simple heuristic: if no maintenance in last 90 days, consider oil change overdue
        const lastService = vehicleLogs.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
        const daysSinceLastService = (now.getTime() - lastService.date.getTime()) / (24 * 60 * 60 * 1000);
        
        if (daysSinceLastService > 90) {
          totalServicesOverdue += 1;
          vehicleHasOverdueServices = true;
        } else if (daysSinceLastService > 75) {
          totalServicesDue += 1;
        } else if (daysSinceLastService > 60) {
          totalServicesUpcoming += 1;
        }
      } else {
        // Vehicle with no maintenance history - consider needing initial service
        totalServicesOverdue += 1;
        vehicleHasOverdueServices = true;
      }
      
      if (vehicleHasOverdueServices) {
        vehiclesWithOverdueServices += 1;
      } else {
        vehiclesUpToDate += 1;
      }
    });
    
    return {
      totalServicesOverdue,
      totalServicesDue,
      totalServicesUpcoming,
      vehiclesWithOverdueServices,
      vehiclesUpToDate
    };
  }

  /**
   * Empty fleet overview for users with no vehicles
   */
  private static getEmptyFleetOverview(): FleetOverview {
    return {
      totalVehicles: 0,
      totalMaintenanceRecords: 0,
      totalCostAllTime: 0,
      totalCostLast30Days: 0,
      averageHealthScore: 0,
      mostActiveVehicle: null,
      leastActiveVehicle: null,
      recentActivity: [],
      upcomingReminders: [],
      fleetCostTrends: [],
      fleetHealthTrend: 'stable',
      fleetStatus: {
        totalServicesOverdue: 0,
        totalServicesDue: 0,
        totalServicesUpcoming: 0,
        vehiclesWithOverdueServices: 0,
        vehiclesUpToDate: 0
      }
    };
  }
}