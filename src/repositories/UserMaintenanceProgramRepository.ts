import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';

import { firestore as db } from '../services/firebase/config';
import { BaseRepository } from './BaseRepository';
import { 
  UserMaintenanceProgram, 
  UserDefinedInterval,
  MaintenanceType 
} from '../types';

/**
 * Repository for User-Only Maintenance Programs
 * 
 * LEGAL SAFETY: This repository ensures:
 * - 100% user-created maintenance programs
 * - No app suggestions or templates
 * - Complete user ownership and responsibility
 * - Legal disclaimer tracking
 */
export class UserMaintenanceProgramRepository extends BaseRepository<UserMaintenanceProgram> {
  private readonly COLLECTION_NAME = 'maintenancePrograms';

  /**
   * Create a new user-defined maintenance program
   * LEGAL SAFETY: Enforces user-only creation with legal disclaimers
   */
  async create(data: Omit<UserMaintenanceProgram, 'id'>): Promise<UserMaintenanceProgram> {
    try {
      const currentUser = this.requireAuth();
      
      // LEGAL SAFETY: Enforce user-only architecture
      const safeData: Omit<UserMaintenanceProgram, 'id'> = {
        ...data,
        userId: currentUser.uid,
        createdBy: 'user' as const,
        source: 'user_manual_entry' as const,
        disclaimer: 'User-created maintenance schedule. User responsible for all intervals.',
        lastModifiedBy: 'user' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        userAcknowledgment: true, // User must acknowledge ownership
      };

      // Validate user ownership
      this.validateUserOwnership(safeData.userId);

      // Convert dates for Firestore
      const firestoreData = this.convertDatesForFirestore(safeData);

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), firestoreData);
      
      return {
        id: docRef.id,
        ...safeData,
      };
    } catch (error) {
      return this.handleError(error, 'create maintenance program');
    }
  }

  /**
   * Get maintenance program by ID
   * Ensures user can only access their own programs
   */
  async getById(id: string): Promise<UserMaintenanceProgram | null> {
    try {
      this.validateId(id);
      const currentUser = this.requireAuth();

      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      
      // Ensure user can only access their own data
      this.validateUserOwnership(data.userId);

      return {
        id: docSnap.id,
        ...this.convertDatesFromFirestore(data),
      } as UserMaintenanceProgram;
    } catch (error) {
      return this.handleError(error, 'get maintenance program');
    }
  }

  /**
   * Get all maintenance programs for the current user
   */
  async getAll(filters?: { vehicleId?: string }): Promise<UserMaintenanceProgram[]> {
    try {
      const currentUser = this.requireAuth();

      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      // Apply vehicle filter if provided
      if (filters?.vehicleId) {
        q = query(
          collection(db, this.COLLECTION_NAME),
          where('userId', '==', currentUser.uid),
          where('vehicleId', '==', filters.vehicleId),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertDatesFromFirestore(doc.data()),
      })) as UserMaintenanceProgram[];
    } catch (error) {
      return this.handleError(error, 'get maintenance programs');
    }
  }

  /**
   * Get maintenance programs by vehicle ID
   */
  async getByVehicleId(vehicleId: string): Promise<UserMaintenanceProgram[]> {
    return this.getAll({ vehicleId });
  }

  /**
   * Update maintenance program
   * LEGAL SAFETY: Maintains user-only modification tracking
   */
  async update(id: string, data: Partial<UserMaintenanceProgram>): Promise<UserMaintenanceProgram> {
    try {
      this.validateId(id);
      const currentUser = this.requireAuth();

      // Get existing program to validate ownership
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error('Maintenance program not found');
      }

      // LEGAL SAFETY: Preserve user-only constraints
      const safeUpdateData = {
        ...data,
        lastModifiedBy: 'user' as const,
        updatedAt: new Date(),
        // Prevent modification of critical legal fields
        createdBy: existing.createdBy,
        source: existing.source,
        disclaimer: existing.disclaimer,
        userId: existing.userId,
      };

      // Remove undefined fields and convert dates
      const cleanedData = this.removeUndefinedFields(safeUpdateData);
      const firestoreData = this.convertDatesForFirestore(cleanedData);

      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, firestoreData);

      return {
        ...existing,
        ...safeUpdateData,
      };
    } catch (error) {
      return this.handleError(error, 'update maintenance program');
    }
  }

  /**
   * Delete maintenance program
   */
  async delete(id: string): Promise<void> {
    try {
      this.validateId(id);
      
      // Verify ownership before deletion
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error('Maintenance program not found');
      }

      const docRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      return this.handleError(error, 'delete maintenance program');
    }
  }

  /**
   * Add interval to maintenance program
   * LEGAL SAFETY: Ensures all intervals are user-created
   */
  async addInterval(programId: string, interval: Omit<UserDefinedInterval, 'id' | 'userCreated' | 'source' | 'createdAt' | 'updatedAt'>): Promise<UserMaintenanceProgram> {
    try {
      const program = await this.getById(programId);
      if (!program) {
        throw new Error('Maintenance program not found');
      }

      // LEGAL SAFETY: Enforce user-created interval constraints
      const safeInterval: UserDefinedInterval = {
        ...interval,
        id: this.generateId(),
        userCreated: true as const,
        source: 'user_input' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedIntervals = [...program.intervals, safeInterval];
      
      return this.update(programId, { intervals: updatedIntervals });
    } catch (error) {
      return this.handleError(error, 'add maintenance interval');
    }
  }

  /**
   * Update interval in maintenance program
   */
  async updateInterval(programId: string, intervalId: string, updates: Partial<UserDefinedInterval>): Promise<UserMaintenanceProgram> {
    try {
      const program = await this.getById(programId);
      if (!program) {
        throw new Error('Maintenance program not found');
      }

      const intervalIndex = program.intervals.findIndex(interval => interval.id === intervalId);
      if (intervalIndex === -1) {
        throw new Error('Maintenance interval not found');
      }

      // LEGAL SAFETY: Preserve user-created constraints
      const updatedInterval = {
        ...program.intervals[intervalIndex],
        ...updates,
        userCreated: true as const, // Always preserve
        source: 'user_input' as const, // Always preserve
        updatedAt: new Date(),
      };

      const updatedIntervals = [...program.intervals];
      updatedIntervals[intervalIndex] = updatedInterval;

      return this.update(programId, { intervals: updatedIntervals });
    } catch (error) {
      return this.handleError(error, 'update maintenance interval');
    }
  }

  /**
   * Remove interval from maintenance program
   */
  async removeInterval(programId: string, intervalId: string): Promise<UserMaintenanceProgram> {
    try {
      const program = await this.getById(programId);
      if (!program) {
        throw new Error('Maintenance program not found');
      }

      const updatedIntervals = program.intervals.filter(interval => interval.id !== intervalId);
      
      return this.update(programId, { intervals: updatedIntervals });
    } catch (error) {
      return this.handleError(error, 'remove maintenance interval');
    }
  }

  /**
   * Create default user maintenance program template
   * LEGAL SAFETY: User must customize all intervals themselves
   */
  async createEmptyProgram(vehicleId: string, programName: string): Promise<UserMaintenanceProgram> {
    const currentUser = this.requireAuth();

    const emptyProgram: Omit<UserMaintenanceProgram, 'id'> = {
      userId: currentUser.uid,
      vehicleId,
      name: programName,
      createdBy: 'user',
      source: 'user_manual_entry',
      disclaimer: 'User-created maintenance schedule. User responsible for all intervals.',
      intervals: [], // Empty - user must add their own intervals
      userAcknowledgment: true,
      lastModifiedBy: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.create(emptyProgram);
  }

  // ===== UTILITY METHODS =====

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private convertDatesForFirestore(data: any): any {
    const converted = { ...data };
    
    // Convert Date objects to Firestore Timestamps
    if (converted.createdAt instanceof Date) {
      converted.createdAt = Timestamp.fromDate(converted.createdAt);
    }
    if (converted.updatedAt instanceof Date) {
      converted.updatedAt = Timestamp.fromDate(converted.updatedAt);
    }

    // Convert dates in intervals array
    if (converted.intervals && Array.isArray(converted.intervals)) {
      converted.intervals = converted.intervals.map((interval: any) => ({
        ...interval,
        createdAt: interval.createdAt instanceof Date ? Timestamp.fromDate(interval.createdAt) : interval.createdAt,
        updatedAt: interval.updatedAt instanceof Date ? Timestamp.fromDate(interval.updatedAt) : interval.updatedAt,
      }));
    }

    return converted;
  }

  private convertDatesFromFirestore(data: any): any {
    const converted = { ...data };
    
    // Convert Firestore Timestamps to Date objects
    if (converted.createdAt?.toDate) {
      converted.createdAt = converted.createdAt.toDate();
    }
    if (converted.updatedAt?.toDate) {
      converted.updatedAt = converted.updatedAt.toDate();
    }

    // Convert dates in intervals array
    if (converted.intervals && Array.isArray(converted.intervals)) {
      converted.intervals = converted.intervals.map((interval: any) => ({
        ...interval,
        createdAt: interval.createdAt?.toDate ? interval.createdAt.toDate() : interval.createdAt,
        updatedAt: interval.updatedAt?.toDate ? interval.updatedAt.toDate() : interval.updatedAt,
      }));
    }

    return converted;
  }

  private removeUndefinedFields(obj: any): any {
    const cleaned: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    
    return cleaned;
  }
}

export const userMaintenanceProgramRepository = new UserMaintenanceProgramRepository();