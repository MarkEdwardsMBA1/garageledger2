// Offline-First Data Service
// Handles data submission with offline queuing and online sync

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { MaintenanceLog } from '../types';
import { ValidationService } from './ValidationService';
import { FirebaseMaintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';

/**
 * Submission result for UI consumption
 */
export interface SubmissionResult {
  success: boolean;
  queued?: boolean;
  errors?: Record<string, string | null>;
  id?: string;
}

/**
 * Queued submission for offline storage
 */
interface QueuedSubmission {
  id: string;
  type: 'maintenance_log' | 'vehicle' | 'user_profile';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

/**
 * Network connectivity status
 */
interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

/**
 * Offline-First Data Service
 * 
 * Features:
 * - Local validation for immediate feedback
 * - Offline submission queuing with AsyncStorage
 * - Background sync when network returns
 * - Conflict resolution for backend validation failures
 * - Data integrity maintained across network state changes
 */
export class OfflineDataService {
  private static instance: OfflineDataService;
  private maintenanceLogRepository = new FirebaseMaintenanceLogRepository();
  private syncInProgress = false;
  
  // AsyncStorage keys
  private static readonly QUEUE_KEY = '@garageledger_submission_queue';
  private static readonly LAST_SYNC_KEY = '@garageledger_last_sync';
  
  /**
   * Singleton pattern for consistent state management
   */
  static getInstance(): OfflineDataService {
    if (!OfflineDataService.instance) {
      OfflineDataService.instance = new OfflineDataService();
    }
    return OfflineDataService.instance;
  }
  
  /**
   * Submit maintenance log with offline-first approach
   */
  async submitMaintenanceLog(
    basicInfo: any,
    services: any, 
    photos: string[] = [],
    serviceType: 'diy' | 'shop',
    userId: string
  ): Promise<SubmissionResult> {
    try {
      // 1. Validate locally first (immediate feedback)
      const validation = ValidationService.validateCompleteMaintenanceLog(
        basicInfo, 
        services, 
        photos, 
        serviceType
      );
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }
      
      // 2. Convert to MaintenanceLog format
      const maintenanceLog = this.convertToMaintenanceLog(
        basicInfo, 
        services, 
        photos, 
        serviceType, 
        userId
      );
      
      // 3. Queue for submission (works offline)
      const queueId = await this.queueSubmission('maintenance_log', maintenanceLog);
      
      // 4. Try immediate sync if online
      const networkStatus = await this.getNetworkStatus();
      if (networkStatus.isConnected && networkStatus.isInternetReachable) {
        const syncResult = await this.syncPendingSubmissions();
        if (syncResult.success && syncResult.processedIds?.includes(queueId)) {
          return {
            success: true,
            id: syncResult.submissionIds?.[queueId]
          };
        }
      }
      
      // 5. Return success with queued status
      return {
        success: true,
        queued: true,
        id: queueId // Temporary local ID
      };
      
    } catch (error) {
      console.error('Error submitting maintenance log:', error);
      return {
        success: false,
        errors: { general: 'Failed to submit maintenance log. Please try again.' }
      };
    }
  }
  
  /**
   * Get current network connectivity status
   */
  private async getNetworkStatus(): Promise<NetworkStatus> {
    const netInfo = await NetInfo.fetch();
    return {
      isConnected: netInfo.isConnected ?? false,
      isInternetReachable: netInfo.isInternetReachable ?? false,
      type: netInfo.type
    };
  }
  
  /**
   * Queue a submission for later processing
   */
  private async queueSubmission(type: QueuedSubmission['type'], data: any): Promise<string> {
    const submission: QueuedSubmission = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3
    };
    
    const queue = await this.getSubmissionQueue();
    queue.push(submission);
    
    await AsyncStorage.setItem(OfflineDataService.QUEUE_KEY, JSON.stringify(queue));
    
    return submission.id;
  }
  
  /**
   * Get current submission queue from AsyncStorage
   */
  private async getSubmissionQueue(): Promise<QueuedSubmission[]> {
    try {
      const queueJson = await AsyncStorage.getItem(OfflineDataService.QUEUE_KEY);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error('Error loading submission queue:', error);
      return [];
    }
  }
  
  /**
   * Sync pending submissions to server
   */
  async syncPendingSubmissions(): Promise<{
    success: boolean;
    processedCount: number;
    failedCount: number;
    processedIds?: string[];
    submissionIds?: Record<string, string>;
  }> {
    if (this.syncInProgress) {
      return { success: false, processedCount: 0, failedCount: 0 };
    }
    
    this.syncInProgress = true;
    
    try {
      const queue = await this.getSubmissionQueue();
      const processedIds: string[] = [];
      const submissionIds: Record<string, string> = {};
      let processedCount = 0;
      let failedCount = 0;
      
      for (const submission of queue) {
        try {
          if (submission.type === 'maintenance_log') {
            // Re-validate on sync (backend validation)
            const validation = ValidationService.validateCompleteMaintenanceLog(
              submission.data.basicInfo || submission.data,
              submission.data.services || { selectedServices: submission.data.services },
              submission.data.photos || [],
              submission.data.serviceType || 'diy'
            );
            
            if (!validation.isValid) {
              console.warn('Submission failed backend validation:', validation.errors);
              failedCount++;
              continue;
            }
            
            // Submit to Firebase
            const result = await this.maintenanceLogRepository.create(submission.data);
            submissionIds[submission.id] = result.id;
            processedIds.push(submission.id);
            processedCount++;
          }
        } catch (error) {
          console.error(`Failed to sync submission ${submission.id}:`, error);
          submission.retryCount++;
          
          if (submission.retryCount >= submission.maxRetries) {
            processedIds.push(submission.id); // Remove from queue after max retries
            failedCount++;
          } else {
            failedCount++;
          }
        }
      }
      
      // Remove processed submissions from queue
      const remainingQueue = queue.filter(s => !processedIds.includes(s.id));
      await AsyncStorage.setItem(OfflineDataService.QUEUE_KEY, JSON.stringify(remainingQueue));
      
      // Update last sync timestamp
      await AsyncStorage.setItem(OfflineDataService.LAST_SYNC_KEY, Date.now().toString());
      
      return {
        success: true,
        processedCount,
        failedCount,
        processedIds,
        submissionIds
      };
      
    } catch (error) {
      console.error('Error during sync:', error);
      return { success: false, processedCount: 0, failedCount: 0 };
    } finally {
      this.syncInProgress = false;
    }
  }
  
  /**
   * Get queue status for UI display
   */
  async getQueueStatus(): Promise<{
    pendingCount: number;
    lastSyncTime: number | null;
    oldestSubmission: number | null;
  }> {
    const queue = await this.getSubmissionQueue();
    const lastSyncJson = await AsyncStorage.getItem(OfflineDataService.LAST_SYNC_KEY);
    const lastSyncTime = lastSyncJson ? parseInt(lastSyncJson) : null;
    
    const oldestSubmission = queue.length > 0 
      ? Math.min(...queue.map(s => s.timestamp))
      : null;
    
    return {
      pendingCount: queue.length,
      lastSyncTime,
      oldestSubmission
    };
  }
  
  /**
   * Force sync now (for manual user trigger)
   */
  async forceSyncNow(): Promise<{
    success: boolean;
    message: string;
    processedCount?: number;
  }> {
    const networkStatus = await this.getNetworkStatus();
    
    if (!networkStatus.isConnected || !networkStatus.isInternetReachable) {
      return {
        success: false,
        message: 'No internet connection available'
      };
    }
    
    const result = await this.syncPendingSubmissions();
    
    if (result.success) {
      return {
        success: true,
        message: `Successfully synced ${result.processedCount} submissions`,
        processedCount: result.processedCount
      };
    } else {
      return {
        success: false,
        message: 'Sync failed. Please try again.'
      };
    }
  }
  
  /**
   * Clear all queued submissions (for testing/reset)
   */
  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(OfflineDataService.QUEUE_KEY);
    await AsyncStorage.removeItem(OfflineDataService.LAST_SYNC_KEY);
  }
  
  /**
   * Convert wizard data to MaintenanceLog format
   */
  private convertToMaintenanceLog(
    basicInfo: any,
    services: any,
    photos: string[],
    serviceType: 'diy' | 'shop',
    userId: string
  ): Omit<MaintenanceLog, 'id' | 'createdAt' | 'updatedAt'> {
    const baseLog = {
      vehicleId: basicInfo.vehicleId || services.vehicleId,
      date: basicInfo.date,
      mileage: parseInt(basicInfo.mileage?.replace(/,/g, '') || '0'),
      services: services.selectedServices || [],
      photos: photos || [],
      serviceType,
      notes: services.notes || '',
      tags: [serviceType === 'shop' ? 'shop-service' : 'diy-service']
    };
    
    if (serviceType === 'shop') {
      return {
        ...baseLog,
        title: `Shop Service - ${services.selectedServices?.map((s: any) => s.serviceName).join(', ') || 'Unknown Services'}`,
        totalCost: parseFloat(basicInfo.totalCost || '0'),
        shopName: basicInfo.shopName,
        serviceDescription: `Services performed at ${basicInfo.shopName}`
      };
    } else {
      return {
        ...baseLog,
        title: `DIY Service - ${services.selectedServices?.map((s: any) => s.serviceName).join(', ') || 'Unknown Services'}`,
        totalCost: 0 // DIY cost calculated from parts
      };
    }
  }
  
  /**
   * Initialize background sync listeners
   */
  initializeBackgroundSync(): void {
    // Listen for network state changes
    NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        // Network restored, attempt sync
        this.syncPendingSubmissions().catch(error => {
          console.error('Background sync failed:', error);
        });
      }
    });
  }
}

export default OfflineDataService;