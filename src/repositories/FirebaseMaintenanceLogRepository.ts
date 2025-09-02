// Secure Firebase implementation of MaintenanceLog repository with authentication enforcement
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
  serverTimestamp,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { firestore } from '../services/firebase/config';
import { BaseRepository } from './BaseRepository';
import { MaintenanceLog } from '../types';
import { authService } from '../services/AuthService';
import { imageUploadService } from '../services/ImageUploadService';

export interface IMaintenanceLogRepository extends BaseRepository<MaintenanceLog> {
  getByVehicleId(vehicleId: string): Promise<MaintenanceLog[]>;
  getByUserId(userId: string): Promise<MaintenanceLog[]>;
  getUserMaintenanceLogs(): Promise<MaintenanceLog[]>;
  getRecentLogs(count?: number): Promise<MaintenanceLog[]>;
  getLogsByCategory(category: string): Promise<MaintenanceLog[]>;
  searchLogs(searchTerm: string): Promise<MaintenanceLog[]>;
}

/**
 * Secure Firebase implementation of MaintenanceLog repository
 * Enforces authentication and user ownership on all operations
 */
export class FirebaseMaintenanceLogRepository extends BaseRepository<MaintenanceLog> implements IMaintenanceLogRepository {
  private readonly collectionName = 'maintenanceLogs';
  
  constructor() {
    super();
  }

  private get collection() {
    return collection(firestore, this.collectionName);
  }

  async create(logData: Omit<MaintenanceLog, 'id'>): Promise<MaintenanceLog> {
    try {
      // Ensure user is authenticated
      const currentUser = this.requireAuth();
      
      // Verify user owns the vehicle this log is for
      await this.verifyVehicleOwnership(logData.vehicleId, currentUser.uid);

      const docData = {
        ...logData,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(this.collection, docData);
      const createdDoc = await getDoc(docRef);
      
      if (!createdDoc.exists()) {
        throw new Error('Failed to create maintenance log');
      }

      return this.convertFirebaseDoc(createdDoc);
    } catch (error) {
      console.error('Error creating maintenance log:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<MaintenanceLog | null> {
    try {
      // Ensure user is authenticated
      const currentUser = this.requireAuth();
      
      const docRef = doc(firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const log = this.convertFirebaseDoc(docSnap);
      
      // Verify user owns the vehicle this log belongs to
      await this.verifyVehicleOwnership(log.vehicleId, currentUser.uid);
      
      return log;
    } catch (error) {
      console.error('Error getting maintenance log:', error);
      throw error;
    }
  }

  async getAll(): Promise<MaintenanceLog[]> {
    // For security, redirect to getUserMaintenanceLogs
    return this.getUserMaintenanceLogs();
  }

  async getUserMaintenanceLogs(): Promise<MaintenanceLog[]> {
    try {
      // Ensure user is authenticated
      const currentUser = this.requireAuth();
      
      // Get all user's vehicles first to filter logs
      const userVehicles = await this.getUserVehicleIds(currentUser.uid);
      
      if (userVehicles.length === 0) {
        return [];
      }

      const q = query(
        this.collection,
        where('vehicleId', 'in', userVehicles),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFirebaseDoc(doc));
    } catch (error) {
      console.error('Error getting user maintenance logs:', error);
      throw error;
    }
  }

  async getByVehicleId(vehicleId: string): Promise<MaintenanceLog[]> {
    try {
      // Ensure user is authenticated
      const currentUser = this.requireAuth();
      
      // Verify user owns this vehicle
      await this.verifyVehicleOwnership(vehicleId, currentUser.uid);

      const q = query(
        this.collection,
        where('vehicleId', '==', vehicleId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFirebaseDoc(doc));
    } catch (error) {
      console.error('Error getting maintenance logs by vehicle:', error);
      throw error;
    }
  }

  async getByUserId(userId: string): Promise<MaintenanceLog[]> {
    try {
      // Ensure user is authenticated and can only access their own logs
      const currentUser = this.requireAuth();
      
      if (userId !== currentUser.uid) {
        throw new Error('Unauthorized: Cannot access another user\'s maintenance logs');
      }

      return this.getUserMaintenanceLogs();
    } catch (error) {
      console.error('Error getting maintenance logs by user:', error);
      throw error;
    }
  }

  async getRecentLogs(count: number = 10): Promise<MaintenanceLog[]> {
    try {
      // Ensure user is authenticated
      const currentUser = this.requireAuth();
      
      // Get all user's vehicles first to filter logs
      const userVehicles = await this.getUserVehicleIds(currentUser.uid);
      
      if (userVehicles.length === 0) {
        return [];
      }

      const q = query(
        this.collection,
        where('vehicleId', 'in', userVehicles),
        orderBy('createdAt', 'desc'),
        limit(count)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFirebaseDoc(doc));
    } catch (error) {
      console.error('Error getting recent maintenance logs:', error);
      throw error;
    }
  }

  async getLogsByCategory(category: string): Promise<MaintenanceLog[]> {
    try {
      // Ensure user is authenticated
      const currentUser = this.requireAuth();
      
      // Get all user's vehicles first to filter logs
      const userVehicles = await this.getUserVehicleIds(currentUser.uid);
      
      if (userVehicles.length === 0) {
        return [];
      }

      const q = query(
        this.collection,
        where('vehicleId', 'in', userVehicles),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFirebaseDoc(doc));
    } catch (error) {
      console.error('Error getting maintenance logs by category:', error);
      throw error;
    }
  }

  async searchLogs(searchTerm: string): Promise<MaintenanceLog[]> {
    try {
      // Ensure user is authenticated
      const currentUser = this.requireAuth();
      
      // Get all user logs first, then filter client-side
      // Note: Firestore doesn't support full-text search, so we do client-side filtering
      const allLogs = await this.getUserMaintenanceLogs();
      
      const searchLower = searchTerm.toLowerCase();
      return allLogs.filter(log => 
        log.title.toLowerCase().includes(searchLower) ||
        log.services.some(service => service.serviceName.toLowerCase().includes(searchLower)) ||
        log.notes?.toLowerCase().includes(searchLower) ||
        log.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error('Error searching maintenance logs:', error);
      throw error;
    }
  }

  async update(id: string, updateData: Partial<MaintenanceLog>): Promise<MaintenanceLog> {
    try {
      // Ensure user is authenticated
      const currentUser = this.requireAuth();
      
      // Get existing log to verify ownership
      const existingLog = await this.getById(id);
      if (!existingLog) {
        throw new Error('Maintenance log not found');
      }

      // Verify user owns the vehicle this log belongs to
      await this.verifyVehicleOwnership(existingLog.vehicleId, currentUser.uid);

      const docRef = doc(firestore, this.collectionName, id);
      
      // Remove fields that shouldn't be updated
      const { id: _, createdAt, ...allowedUpdates } = updateData;
      
      await updateDoc(docRef, allowedUpdates);
      
      // Return updated document
      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new Error('Failed to get updated maintenance log');
      }

      return this.convertFirebaseDoc(updatedDoc);
    } catch (error) {
      console.error('Error updating maintenance log:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Ensure user is authenticated
      const currentUser = this.requireAuth();
      
      // Get existing log to verify ownership and get photo URLs
      const existingLog = await this.getById(id);
      if (!existingLog) {
        throw new Error('Maintenance log not found');
      }

      // Verify user owns the vehicle this log belongs to
      await this.verifyVehicleOwnership(existingLog.vehicleId, currentUser.uid);

      // Delete associated photos from Firebase Storage
      if (existingLog.photos && existingLog.photos.length > 0) {
        try {
          await Promise.all(
            existingLog.photos
              .filter(photoUrl => imageUploadService.isFirebaseStorageUrl(photoUrl))
              .map(photoUrl => imageUploadService.deleteMaintenancePhoto(photoUrl))
          );
        } catch (photoError) {
          console.warn('Some photos could not be deleted:', photoError);
          // Continue with log deletion even if photo deletion fails
        }
      }

      const docRef = doc(firestore, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting maintenance log:', error);
      throw error;
    }
  }

  // Helper method to verify vehicle ownership
  private async verifyVehicleOwnership(vehicleId: string, userId: string): Promise<void> {
    try {
      const vehicleDoc = await getDoc(doc(firestore, 'vehicles', vehicleId));
      if (!vehicleDoc.exists()) {
        throw new Error('Vehicle not found');
      }
      
      const vehicleData = vehicleDoc.data();
      if (vehicleData.userId !== userId) {
        throw new Error('Unauthorized: Vehicle does not belong to current user');
      }
    } catch (error) {
      console.error('Error verifying vehicle ownership:', error);
      throw error;
    }
  }

  // Helper method to get user's vehicle IDs
  private async getUserVehicleIds(userId: string): Promise<string[]> {
    try {
      const vehiclesQuery = query(
        collection(firestore, 'vehicles'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(vehiclesQuery);
      return querySnapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error getting user vehicle IDs:', error);
      throw error;
    }
  }

  // Convert Firebase document to MaintenanceLog
  private convertFirebaseDoc(doc: any): MaintenanceLog {
    const data = doc.data();
    return {
      id: doc.id,
      vehicleId: data.vehicleId,
      date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
      mileage: data.mileage,
      title: data.title,
      services: data.services || [],
      totalCost: data.totalCost,
      notes: data.notes,
      tags: data.tags || [],
      photos: data.photos || [],
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      serviceType: data.serviceType,
      shopName: data.shopName,
      serviceDescription: data.serviceDescription,
    };
  }
}

// Create and export singleton instance
export const maintenanceLogRepository = new FirebaseMaintenanceLogRepository();