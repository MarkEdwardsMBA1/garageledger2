// Enhanced Vehicle Analytics Service
// Phase 4: Advanced analytics calculations for cost trends, service frequency, and predictive insights
import { MaintenanceLog, Vehicle, MaintenanceProgram } from '../types';

export interface CostTrendAnalysis {
  totalCost: number;
  averagePerService: number;
  costPerMile: number | null;
  costPerMonth: number;
  recent30DaysSpending: number;
  recent90DaysSpending: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
  monthlyBreakdown: MonthlySpending[];
  categoryBreakdown: CategorySpending[];
}

export interface ServiceFrequencyAnalysis {
  totalServices: number;
  averageServiceInterval: number; // days
  servicesPerMonth: number;
  mostCommonServices: ServiceFrequencyItem[];
  servicesByCategory: CategoryFrequency[];
  longestServiceGap: number; // days
  shortestServiceGap: number; // days
}

export interface PredictiveInsights {
  nextServiceDue: PredictiveService | null;
  upcomingServices: PredictiveService[];
  recommendedBudget: BudgetRecommendation;
  maintenanceScore: number; // 0-100
  insights: InsightMessage[];
}

export interface MonthlySpending {
  month: string; // "2025-01", "2025-02", etc.
  monthName: string; // "Jan 2025"
  amount: number;
  serviceCount: number;
}

export interface CategorySpending {
  categoryKey: string;
  categoryName: string;
  totalAmount: number;
  serviceCount: number;
  percentage: number;
  averagePerService: number;
}

export interface ServiceFrequencyItem {
  serviceName: string;
  count: number;
  lastPerformed: Date;
  averageInterval: number; // days
}

export interface CategoryFrequency {
  categoryKey: string;
  categoryName: string;
  count: number;
  averageInterval: number;
}

export interface PredictiveService {
  serviceName: string;
  dueDate: Date;
  dueMileage: number | null;
  confidence: number; // 0-1
  basedOn: 'program' | 'history' | 'both';
  estimatedCost: number | null;
}

export interface BudgetRecommendation {
  monthlyBudget: number;
  quarterlyBudget: number;
  yearlyBudget: number;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface InsightMessage {
  type: 'tip' | 'warning' | 'opportunity' | 'achievement';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Enhanced Vehicle Analytics Service
 * Provides comprehensive cost trends, service frequency analysis, and predictive insights
 */
export class VehicleAnalyticsService {
  
  /**
   * Calculate comprehensive cost trend analysis
   */
  static calculateCostTrends(
    logs: MaintenanceLog[], 
    vehicle: Vehicle | null
  ): CostTrendAnalysis {
    const logsWithCost = logs.filter(log => (log.totalCost || 0) > 0);
    
    if (logsWithCost.length === 0) {
      return this.getEmptyCostTrends();
    }

    // Sort by date for trend analysis
    const sortedLogs = logsWithCost.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Basic calculations
    const totalCost = sortedLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0);
    const averagePerService = totalCost / sortedLogs.length;
    
    // Time-based calculations
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
    
    const recent30DaysSpending = sortedLogs
      .filter(log => log.date >= thirtyDaysAgo)
      .reduce((sum, log) => sum + (log.totalCost || 0), 0);
      
    const recent90DaysSpending = sortedLogs
      .filter(log => log.date >= ninetyDaysAgo)
      .reduce((sum, log) => sum + (log.totalCost || 0), 0);

    // Cost per mile calculation
    const costPerMile = this.calculateCostPerMile(sortedLogs, vehicle);
    
    // Cost per month calculation
    const oldestDate = sortedLogs[0].date;
    const monthsSpan = Math.max(1, (now.getTime() - oldestDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
    const costPerMonth = totalCost / monthsSpan;
    
    // Trend analysis
    const { trendDirection, trendPercentage } = this.calculateTrend(sortedLogs);
    
    // Monthly breakdown
    const monthlyBreakdown = this.calculateMonthlyBreakdown(sortedLogs);
    
    // Category breakdown
    const categoryBreakdown = this.calculateCategoryBreakdown(sortedLogs);
    
    return {
      totalCost,
      averagePerService,
      costPerMile,
      costPerMonth,
      recent30DaysSpending,
      recent90DaysSpending,
      trendDirection,
      trendPercentage,
      monthlyBreakdown,
      categoryBreakdown
    };
  }

  /**
   * Calculate service frequency analysis
   */
  static calculateServiceFrequency(logs: MaintenanceLog[]): ServiceFrequencyAnalysis {
    if (logs.length === 0) {
      return this.getEmptyServiceFrequency();
    }

    const sortedLogs = logs.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Calculate service intervals
    const intervals = [];
    for (let i = 1; i < sortedLogs.length; i++) {
      const daysDiff = (sortedLogs[i].date.getTime() - sortedLogs[i-1].date.getTime()) / (24 * 60 * 60 * 1000);
      intervals.push(daysDiff);
    }
    
    const averageServiceInterval = intervals.length > 0 
      ? intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
      : 0;
    
    // Services per month
    const oldestDate = sortedLogs[0].date;
    const now = new Date();
    const monthsSpan = Math.max(1, (now.getTime() - oldestDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
    const servicesPerMonth = logs.length / monthsSpan;
    
    // Most common services
    const mostCommonServices = this.calculateMostCommonServices(logs);
    
    // Services by category
    const servicesByCategory = this.calculateServicesByCategory(logs);
    
    const longestServiceGap = intervals.length > 0 ? Math.max(...intervals) : 0;
    const shortestServiceGap = intervals.length > 0 ? Math.min(...intervals) : 0;
    
    return {
      totalServices: logs.length,
      averageServiceInterval,
      servicesPerMonth,
      mostCommonServices,
      servicesByCategory,
      longestServiceGap,
      shortestServiceGap
    };
  }

  /**
   * Generate predictive insights
   */
  static generatePredictiveInsights(
    logs: MaintenanceLog[], 
    vehicle: Vehicle | null, 
    programs: MaintenanceProgram[]
  ): PredictiveInsights {
    const costTrends = this.calculateCostTrends(logs, vehicle);
    const serviceFreq = this.calculateServiceFrequency(logs);
    
    // Next service due (simplified for now)
    const nextServiceDue = this.predictNextService(logs, programs, vehicle);
    
    // Upcoming services (next 3 months)
    const upcomingServices = this.predictUpcomingServices(logs, programs, vehicle);
    
    // Budget recommendations
    const recommendedBudget = this.calculateBudgetRecommendation(costTrends, serviceFreq);
    
    // Maintenance score
    const maintenanceScore = this.calculateMaintenanceScore(logs, vehicle, programs);
    
    // Generate insights
    const insights = this.generateInsights(costTrends, serviceFreq, logs, vehicle);
    
    return {
      nextServiceDue,
      upcomingServices,
      recommendedBudget,
      maintenanceScore,
      insights
    };
  }

  // Private helper methods
  private static getEmptyCostTrends(): CostTrendAnalysis {
    return {
      totalCost: 0,
      averagePerService: 0,
      costPerMile: null,
      costPerMonth: 0,
      recent30DaysSpending: 0,
      recent90DaysSpending: 0,
      trendDirection: 'stable',
      trendPercentage: 0,
      monthlyBreakdown: [],
      categoryBreakdown: []
    };
  }

  private static getEmptyServiceFrequency(): ServiceFrequencyAnalysis {
    return {
      totalServices: 0,
      averageServiceInterval: 0,
      servicesPerMonth: 0,
      mostCommonServices: [],
      servicesByCategory: [],
      longestServiceGap: 0,
      shortestServiceGap: 0
    };
  }

  private static calculateCostPerMile(logs: MaintenanceLog[], vehicle: Vehicle | null): number | null {
    if (!vehicle) return null;
    
    const logsWithMileage = logs.filter(log => log.mileage > 0);
    if (logsWithMileage.length < 2) return null;
    
    const sortedLogs = logsWithMileage.sort((a, b) => a.mileage - b.mileage);
    const totalMiles = sortedLogs[sortedLogs.length - 1].mileage - sortedLogs[0].mileage;
    const totalCost = logs.reduce((sum, log) => sum + (log.totalCost || 0), 0);
    
    return totalMiles > 0 ? totalCost / totalMiles : null;
  }

  private static calculateTrend(logs: MaintenanceLog[]): { trendDirection: 'increasing' | 'decreasing' | 'stable', trendPercentage: number } {
    if (logs.length < 4) {
      return { trendDirection: 'stable', trendPercentage: 0 };
    }

    const midPoint = Math.floor(logs.length / 2);
    const firstHalf = logs.slice(0, midPoint);
    const secondHalf = logs.slice(midPoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, log) => sum + (log.totalCost || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, log) => sum + (log.totalCost || 0), 0) / secondHalf.length;
    
    const percentageChange = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
    
    let trendDirection: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (Math.abs(percentageChange) > 15) {
      trendDirection = percentageChange > 0 ? 'increasing' : 'decreasing';
    }
    
    return { trendDirection, trendPercentage: Math.abs(percentageChange) };
  }

  private static calculateMonthlyBreakdown(logs: MaintenanceLog[]): MonthlySpending[] {
    const monthlyData = new Map<string, { amount: number, count: number }>();
    
    logs.forEach(log => {
      const monthKey = `${log.date.getFullYear()}-${String(log.date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthlyData.get(monthKey) || { amount: 0, count: 0 };
      monthlyData.set(monthKey, {
        amount: existing.amount + (log.totalCost || 0),
        count: existing.count + 1
      });
    });
    
    return Array.from(monthlyData.entries())
      .map(([monthKey, data]) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: monthKey,
          monthName: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          amount: data.amount,
          serviceCount: data.count
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private static calculateCategoryBreakdown(logs: MaintenanceLog[]): CategorySpending[] {
    const categoryData = new Map<string, { amount: number, count: number }>();
    const totalCost = logs.reduce((sum, log) => sum + (log.totalCost || 0), 0);
    
    logs.forEach(log => {
      if (log.services && log.services.length > 0) {
        log.services.forEach(service => {
          const existing = categoryData.get(service.categoryKey) || { amount: 0, count: 0 };
          const serviceCost = service.cost || (log.totalCost || 0) / log.services.length;
          categoryData.set(service.categoryKey, {
            amount: existing.amount + serviceCost,
            count: existing.count + 1
          });
        });
      }
    });
    
    return Array.from(categoryData.entries())
      .map(([categoryKey, data]) => ({
        categoryKey,
        categoryName: categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        totalAmount: data.amount,
        serviceCount: data.count,
        percentage: totalCost > 0 ? (data.amount / totalCost) * 100 : 0,
        averagePerService: data.amount / data.count
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }

  private static calculateMostCommonServices(logs: MaintenanceLog[]): ServiceFrequencyItem[] {
    const serviceData = new Map<string, { count: number, lastPerformed: Date, dates: Date[] }>();
    
    logs.forEach(log => {
      if (log.services && log.services.length > 0) {
        log.services.forEach(service => {
          const existing = serviceData.get(service.serviceName) || { 
            count: 0, 
            lastPerformed: log.date, 
            dates: [] 
          };
          serviceData.set(service.serviceName, {
            count: existing.count + 1,
            lastPerformed: log.date > existing.lastPerformed ? log.date : existing.lastPerformed,
            dates: [...existing.dates, log.date]
          });
        });
      }
    });
    
    return Array.from(serviceData.entries())
      .map(([serviceName, data]) => {
        // Calculate average interval between services
        const sortedDates = data.dates.sort((a, b) => a.getTime() - b.getTime());
        let averageInterval = 0;
        if (sortedDates.length > 1) {
          const intervals = [];
          for (let i = 1; i < sortedDates.length; i++) {
            intervals.push((sortedDates[i].getTime() - sortedDates[i-1].getTime()) / (24 * 60 * 60 * 1000));
          }
          averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        }
        
        return {
          serviceName,
          count: data.count,
          lastPerformed: data.lastPerformed,
          averageInterval
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 most common services
  }

  private static calculateServicesByCategory(logs: MaintenanceLog[]): CategoryFrequency[] {
    const categoryData = new Map<string, { count: number, dates: Date[] }>();
    
    logs.forEach(log => {
      if (log.services && log.services.length > 0) {
        const uniqueCategories = new Set(log.services.map(s => s.categoryKey));
        uniqueCategories.forEach(categoryKey => {
          const existing = categoryData.get(categoryKey) || { count: 0, dates: [] };
          categoryData.set(categoryKey, {
            count: existing.count + 1,
            dates: [...existing.dates, log.date]
          });
        });
      }
    });
    
    return Array.from(categoryData.entries())
      .map(([categoryKey, data]) => {
        const sortedDates = data.dates.sort((a, b) => a.getTime() - b.getTime());
        let averageInterval = 0;
        if (sortedDates.length > 1) {
          const intervals = [];
          for (let i = 1; i < sortedDates.length; i++) {
            intervals.push((sortedDates[i].getTime() - sortedDates[i-1].getTime()) / (24 * 60 * 60 * 1000));
          }
          averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        }
        
        return {
          categoryKey,
          categoryName: categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          count: data.count,
          averageInterval
        };
      })
      .sort((a, b) => b.count - a.count);
  }

  private static predictNextService(logs: MaintenanceLog[], programs: MaintenanceProgram[], vehicle: Vehicle | null): PredictiveService | null {
    // Simplified prediction based on most common service intervals
    if (logs.length === 0) return null;
    
    const serviceFreq = this.calculateMostCommonServices(logs);
    if (serviceFreq.length === 0) return null;
    
    const mostCommonService = serviceFreq[0];
    const nextDueDate = new Date(mostCommonService.lastPerformed.getTime() + (mostCommonService.averageInterval * 24 * 60 * 60 * 1000));
    
    return {
      serviceName: mostCommonService.serviceName,
      dueDate: nextDueDate,
      dueMileage: null, // TODO: Implement mileage-based prediction
      confidence: mostCommonService.count >= 3 ? 0.8 : 0.5,
      basedOn: 'history',
      estimatedCost: null // TODO: Implement cost estimation
    };
  }

  private static predictUpcomingServices(logs: MaintenanceLog[], programs: MaintenanceProgram[], vehicle: Vehicle | null): PredictiveService[] {
    // TODO: Implement comprehensive upcoming service prediction
    return [];
  }

  private static calculateBudgetRecommendation(costTrends: CostTrendAnalysis, serviceFreq: ServiceFrequencyAnalysis): BudgetRecommendation {
    const monthlyBudget = Math.max(costTrends.costPerMonth * 1.2, costTrends.averagePerService * 0.5);
    
    return {
      monthlyBudget,
      quarterlyBudget: monthlyBudget * 3,
      yearlyBudget: monthlyBudget * 12,
      confidence: costTrends.monthlyBreakdown.length >= 6 ? 'high' : 'medium',
      reasoning: `Based on ${costTrends.monthlyBreakdown.length} months of spending data`
    };
  }

  private static calculateMaintenanceScore(logs: MaintenanceLog[], vehicle: Vehicle | null, programs: MaintenanceProgram[]): number {
    // Simplified maintenance score calculation
    let score = 50; // Base score
    
    // Recent maintenance activity (last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - (90 * 24 * 60 * 60 * 1000));
    const recentServices = logs.filter(log => log.date >= ninetyDaysAgo);
    score += Math.min(recentServices.length * 10, 30);
    
    // Program compliance
    if (programs.length > 0) {
      score += 20; // Has maintenance program
    }
    
    return Math.min(score, 100);
  }

  private static generateInsights(
    costTrends: CostTrendAnalysis, 
    serviceFreq: ServiceFrequencyAnalysis, 
    logs: MaintenanceLog[], 
    vehicle: Vehicle | null
  ): InsightMessage[] {
    const insights: InsightMessage[] = [];
    
    // Cost trend insights
    if (costTrends.trendDirection === 'increasing' && costTrends.trendPercentage > 20) {
      insights.push({
        type: 'warning',
        title: 'Rising Maintenance Costs',
        message: `Your maintenance costs have increased by ${costTrends.trendPercentage.toFixed(0)}% recently. Consider reviewing your maintenance strategy.`,
        priority: 'medium'
      });
    }
    
    // Service frequency insights
    if (serviceFreq.averageServiceInterval > 180) {
      insights.push({
        type: 'tip',
        title: 'Regular Maintenance',
        message: 'Consider more frequent maintenance to prevent costly repairs. Your average service interval is quite long.',
        priority: 'low'
      });
    }
    
    // Achievement insights
    if (logs.length >= 10) {
      insights.push({
        type: 'achievement',
        title: 'Great Record Keeping!',
        message: `You've logged ${logs.length} maintenance records. This helps track your vehicle's health and costs.`,
        priority: 'low'
      });
    }
    
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
}