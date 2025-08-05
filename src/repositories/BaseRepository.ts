// Base repository interface for MVP functionality
// Enables future extension without breaking changes

import { IBaseRepository } from '../types';
import { authService, User } from '../services/AuthService';

/**
 * Abstract base repository class providing common functionality
 * All concrete repositories extend this for consistent behavior
 */
export abstract class BaseRepository<T extends { id: string }> implements IBaseRepository<T> {
  protected authService = authService;

  constructor() {
    // AuthService is now a singleton, no need to pass it in
  }

  abstract create(data: Omit<T, 'id'>): Promise<T>;
  abstract getById(id: string): Promise<T | null>;
  abstract getAll(filters?: any): Promise<T[]>;
  abstract update(id: string, data: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<void>;

  /**
   * Common validation logic that all repositories can use
   */
  protected validateId(id: string): void {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid ID provided');
    }
  }

  /**
   * Ensure user is authenticated and return current user
   */
  protected requireAuth(): User {
    try {
      return this.authService.requireAuth();
    } catch (error) {
      throw new Error('Authentication required: Please sign in to access your data');
    }
  }

  /**
   * Validate that the userId matches the current authenticated user
   */
  protected validateUserOwnership(userId: string): void {
    const currentUser = this.requireAuth();
    if (currentUser.uid !== userId) {
      throw new Error('Unauthorized: You can only access your own data');
    }
  }

  /**
   * Get current authenticated user's ID
   */
  protected getCurrentUserId(): string {
    return this.requireAuth().uid;
  }

  /**
   * Common error handling
   */
  protected handleError(error: any, operation: string): never {
    console.error(`Repository error during ${operation}:`, error);
    
    // Provide user-friendly error messages for common scenarios
    if (error.message?.includes('Authentication required')) {
      throw new Error('Please sign in to access your data');
    }
    if (error.message?.includes('Unauthorized')) {
      throw new Error('You can only access your own data');
    }
    if (error.message?.includes('permission-denied')) {
      throw new Error('Access denied: Please check your permissions');
    }
    if (error.message?.includes('network')) {
      throw new Error('Network error: Please check your connection and try again');
    }
    
    throw new Error(`Failed to ${operation}: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Repository factory interface for dependency injection
 * Allows easy testing and future backend switching
 */
export interface IRepositoryFactory {
  getVehicleRepository(): IBaseRepository<any>;
  getMaintenanceLogRepository(): IBaseRepository<any>;
  getReminderRepository(): IBaseRepository<any>;
  getUserMaintenanceProgramRepository(): IBaseRepository<any>;
  getLegalComplianceRepository(): IBaseRepository<any>;
}