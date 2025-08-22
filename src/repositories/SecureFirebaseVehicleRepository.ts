// Secure Firebase implementation of Vehicle repository with authentication enforcement
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
} from 'firebase/firestore';
import { firestore } from '../services/firebase/config';
import { BaseRepository } from './BaseRepository';
import { Vehicle } from '../types';
import { authService } from '../services/AuthService';
import { imageUploadService } from '../services/ImageUploadService';

export interface ISecureVehicleRepository extends BaseRepository<Vehicle> {
  getByUserId(userId: string): Promise<Vehicle[]>;
  getUserVehicles(): Promise<Vehicle[]>;
}

/**
 * Secure Firebase implementation of Vehicle repository
 * Enforces authentication and user ownership on all operations
 */
export class SecureFirebaseVehicleRepository extends BaseRepository<Vehicle> implements ISecureVehicleRepository {
  private readonly collectionName = 'vehicles';
  
  constructor() {
    super();
  }

  private get collection() {
    return collection(firestore, this.collectionName);
  }

  async create(vehicleData: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    try {
      // Ensure user is authenticated
      const currentUser = this.requireAuth();
      
      // Enforce userId matches current user
      if (vehicleData.userId && vehicleData.userId !== currentUser.uid) {
        throw new Error('Unauthorized: Cannot create vehicle for another user');
      }

      // Force userId to current user (security enforcement)
      const secureVehicleData = {
        ...vehicleData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log('Creating vehicle for user:', currentUser.uid);
      
      const docRef = await addDoc(this.collection, secureVehicleData);
      console.log('Vehicle created with ID:', docRef.id);
      
      // Fetch the created document to return with server timestamps
      const newVehicle = await this.getById(docRef.id);
      if (!newVehicle) {
        throw new Error('Failed to retrieve created vehicle');
      }
      
      return newVehicle;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      this.handleError(error, 'create vehicle');
    }
  }

  async getById(id: string): Promise<Vehicle | null> {
    try {
      // Ensure user is authenticated
      const currentUser = this.requireAuth();
      
      this.validateId(id);
      
      const docRef = doc(this.collection, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data();
      const vehicle = this.mapFirestoreDocument(docSnap.id, data);
      
      // Verify user owns this vehicle
      this.validateUserOwnership(vehicle.userId);
      
      return vehicle;
    } catch (error) {
      console.error('Error getting vehicle by ID:', error);
      this.handleError(error, 'get vehicle by ID');
    }
  }

  async getAll(filters?: { userId?: string }): Promise<Vehicle[]> {
    try {
      // Ensure user is authenticated
      const currentUser = this.requireAuth();
      
      // Force filter to current user only (security enforcement)
      const secureFilters = { userId: currentUser.uid };
      
      const q = query(
        this.collection, 
        where('userId', '==', currentUser.uid), 
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const vehicles = querySnapshot.docs.map(doc => 
        this.mapFirestoreDocument(doc.id, doc.data())
      );
      
      // Migrate any vehicles with local photo URIs to Firebase Storage (background)
      this.migrateLocalPhotos(vehicles);
      
      return vehicles;
    } catch (error) {
      console.error('Error getting all vehicles:', error);
      this.handleError(error, 'get all vehicles');
    }
  }

  async getByUserId(userId: string): Promise<Vehicle[]> {
    try {
      // Validate user can only access their own vehicles
      this.validateUserOwnership(userId);
      
      return this.getAll({ userId });
    } catch (error) {
      console.error('Error getting vehicles by user ID:', error);
      this.handleError(error, 'get vehicles by user ID');
    }
  }

  async getUserVehicles(): Promise<Vehicle[]> {
    try {
      // Get vehicles for current authenticated user
      const currentUserId = this.getCurrentUserId();
      return this.getAll({ userId: currentUserId });
    } catch (error) {
      console.error('Error getting user vehicles:', error);
      this.handleError(error, 'get user vehicles');
    }
  }

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    try {
      // Ensure user is authenticated
      const currentUser = this.requireAuth();
      
      this.validateId(id);
      
      // First, verify user owns this vehicle
      const existingVehicle = await this.getById(id);
      if (!existingVehicle) {
        throw new Error('Vehicle not found');
      }
      
      // Validate ownership (getById already does this, but being explicit)
      this.validateUserOwnership(existingVehicle.userId);
      
      // Prevent userId changes in updates
      const { id: _, createdAt, userId, ...updateData } = data as any;
      
      if (userId && userId !== currentUser.uid) {
        throw new Error('Unauthorized: Cannot change vehicle ownership');
      }
      
      const docRef = doc(this.collection, id);
      
      // Clean undefined values (Firestore doesn't allow them)
      const cleanedData = this.removeUndefinedFields({
        ...updateData,
        userId: currentUser.uid, // Force userId to current user
        updatedAt: serverTimestamp(),
      });
      
      await updateDoc(docRef, cleanedData);
      
      // Fetch and return updated document
      const updatedVehicle = await this.getById(id);
      if (!updatedVehicle) {
        throw new Error('Failed to retrieve updated vehicle');
      }
      
      return updatedVehicle;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      this.handleError(error, 'update vehicle');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Ensure user is authenticated
      this.requireAuth();
      
      this.validateId(id);
      
      // First, verify user owns this vehicle
      const existingVehicle = await this.getById(id);
      if (!existingVehicle) {
        throw new Error('Vehicle not found');
      }
      
      // Validate ownership (getById already does this, but being explicit)
      this.validateUserOwnership(existingVehicle.userId);
      
      const docRef = doc(this.collection, id);
      await deleteDoc(docRef);
      
      console.log('Vehicle deleted:', id);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      this.handleError(error, 'delete vehicle');
    }
  }

  /**
   * Map Firestore document data to Vehicle interface
   * Handles Firestore Timestamp conversion to JavaScript Date
   */
  private mapFirestoreDocument(id: string, data: any): Vehicle {
    return {
      id,
      userId: data.userId,
      make: data.make,
      model: data.model,
      year: data.year,
      vin: data.vin || undefined,
      licensePlate: data.licensePlate || undefined,
      color: data.color || undefined,
      nickname: data.nickname || undefined,
      mileage: data.mileage || 0,
      notes: data.notes || undefined,
      photoUri: data.photoUri || undefined,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    };
  }
  
  /**
   * Migrate vehicles with local photo URIs to Firebase Storage
   * This runs in the background and doesn't block the main operation
   * Smart migration that handles cleanup of invalid URIs
   */
  private migrateLocalPhotos(vehicles: Vehicle[]): void {
    // Skip migration if no vehicles
    if (!vehicles.length) return;
    
    // Only attempt migration for vehicles with local photo URIs
    const vehiclesToCheck = vehicles.filter(v => 
      v.photoUri && 
      !imageUploadService.isFirebaseStorageUrl(v.photoUri) &&
      (v.photoUri.startsWith('file://') || v.photoUri.startsWith('content://') || v.photoUri.startsWith('ph://'))
    );
    
    if (vehiclesToCheck.length === 0) return;
    
    console.log(`Checking ${vehiclesToCheck.length} vehicles for photo migration`);
    
    // Run migration in background with smart handling
    setTimeout(async () => {
      let migratedCount = 0;
      let cleanedCount = 0;
      
      for (const vehicle of vehiclesToCheck) {
        try {
          // Stop if we've already migrated 2 photos successfully to avoid overwhelming
          if (migratedCount >= 2) {
            console.log('Migration limit reached for this session');
            break;
          }
          
          console.log('Checking photo for vehicle:', vehicle.id);
          
          const firebaseUrl = await imageUploadService.migrateLocalPhotoToFirebase(vehicle.photoUri!, vehicle.id);
          
          if (firebaseUrl) {
            // Migration successful
            await this.update(vehicle.id, { photoUri: firebaseUrl });
            console.log('Successfully migrated photo for vehicle:', vehicle.id);
            migratedCount++;
            
            // Add delay after successful migration
            await new Promise(resolve => setTimeout(resolve, 2000));
            
          } else {
            // Migration failed, likely because file no longer exists
            console.log('Photo file no longer exists for vehicle:', vehicle.id, '- clearing URI');
            
            // Clear the invalid URI to prevent future migration attempts
            const cleanedData = this.removeUndefinedFields({ photoUri: '' });
            const docRef = doc(this.collection, vehicle.id);
            await updateDoc(docRef, cleanedData);
            
            cleanedCount++;
          }
          
        } catch (error: any) {
          console.warn('Error during photo migration check for vehicle:', vehicle.id, error.message);
          // Don't clear URIs on errors - they might be temporary
        }
      }
      
      if (migratedCount > 0 || cleanedCount > 0) {
        console.log(`Photo migration complete: ${migratedCount} migrated, ${cleanedCount} cleaned up`);
      }
      
    }, 3000); // 3 second delay before starting
  }
  
  /**
   * Remove undefined fields from an object (Firestore doesn't allow undefined)
   */
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

export default SecureFirebaseVehicleRepository;