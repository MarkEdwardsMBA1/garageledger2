// Firebase implementation of Vehicle repository
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

export interface IVehicleRepository extends BaseRepository<Vehicle> {
  getByUserId(userId: string): Promise<Vehicle[]>;
}

/**
 * Firebase implementation of Vehicle repository
 * Handles all CRUD operations for vehicles in Firestore
 */
export class FirebaseVehicleRepository extends BaseRepository<Vehicle> implements IVehicleRepository {
  private readonly collectionName = 'vehicles';
  private get collection() {
    return collection(firestore, this.collectionName);
  }

  async create(vehicleData: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    try {
      console.log('Creating vehicle:', vehicleData);
      
      const docRef = await addDoc(this.collection, {
        ...vehicleData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

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
      this.validateId(id);
      
      const docRef = doc(this.collection, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data();
      return this.mapFirestoreDocument(docSnap.id, data);
    } catch (error) {
      console.error('Error getting vehicle by ID:', error);
      this.handleError(error, 'get vehicle by ID');
    }
  }

  async getAll(filters?: { userId?: string }): Promise<Vehicle[]> {
    try {
      let q = query(this.collection, orderBy('createdAt', 'desc'));
      
      // Apply user filter if provided
      if (filters?.userId) {
        q = query(this.collection, where('userId', '==', filters.userId), orderBy('createdAt', 'desc'));
      }
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => 
        this.mapFirestoreDocument(doc.id, doc.data())
      );
    } catch (error) {
      console.error('Error getting all vehicles:', error);
      this.handleError(error, 'get all vehicles');
    }
  }

  async getByUserId(userId: string): Promise<Vehicle[]> {
    try {
      this.validateId(userId);
      return this.getAll({ userId });
    } catch (error) {
      console.error('Error getting vehicles by user ID:', error);
      this.handleError(error, 'get vehicles by user ID');
    }
  }

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    try {
      this.validateId(id);
      
      const docRef = doc(this.collection, id);
      
      // Remove fields that shouldn't be updated
      const { id: _, createdAt, ...updateData } = data as any;
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
      
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
      this.validateId(id);
      
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
      mileage: data.mileage,
      notes: data.notes || undefined,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    };
  }
}

export default FirebaseVehicleRepository;