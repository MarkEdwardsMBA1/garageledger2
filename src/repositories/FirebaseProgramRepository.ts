// Firebase implementation of Program Repository
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
  Timestamp 
} from 'firebase/firestore';
import { firestore } from '../services/firebase/config';
import { IProgramRepository, IProgramAssignmentRepository } from './ProgramRepository';
import { MaintenanceProgram, ProgramAssignment, ConflictDetectionResult } from '../types';

export class FirebaseProgramRepository implements IProgramRepository {
  private collectionName = 'programs';
  private assignmentsCollectionName = 'program_assignments';

  private convertFirestoreToProgram(doc: any): MaintenanceProgram {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      name: data.name,
      description: data.description || '',
      tasks: data.tasks || [],
      assignedVehicleIds: data.assignedVehicleIds || [],
      isActive: data.isActive ?? true,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }

  private convertFirestoreToAssignment(doc: any): ProgramAssignment {
    const data = doc.data();
    return {
      id: doc.id,
      programId: data.programId,
      vehicleId: data.vehicleId,
      assignedAt: data.assignedAt?.toDate() || new Date(),
      isActive: data.isActive ?? true,
      lastCompletedAt: data.lastCompletedAt?.toDate() || undefined,
      nextDueDate: data.nextDueDate?.toDate() || undefined,
      nextDueMileage: data.nextDueMileage || undefined,
    };
  }

  async create(data: Omit<MaintenanceProgram, 'id'>): Promise<MaintenanceProgram> {
    try {
      const programData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(firestore, this.collectionName), programData);
      const doc = await getDoc(docRef);
      
      if (!doc.exists()) {
        throw new Error('Failed to create program');
      }

      return this.convertFirestoreToProgram(doc);
    } catch (error) {
      console.error('Error creating program:', error);
      throw new Error('Failed to create program');
    }
  }

  async getById(id: string): Promise<MaintenanceProgram | null> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      return this.convertFirestoreToProgram(docSnap);
    } catch (error) {
      console.error('Error getting program:', error);
      throw new Error('Failed to get program');
    }
  }

  async getAll(): Promise<MaintenanceProgram[]> {
    // This method should not be used directly - it tries to get ALL programs
    // Use getUserPrograms(userId) instead for security
    throw new Error('getAll() not allowed for security - use getUserPrograms(userId) instead');
  }

  async getUserPrograms(userId: string): Promise<MaintenanceProgram[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('userId', '==', userId)
        // Temporarily removed orderBy to avoid composite index requirement
        // TODO: Re-add orderBy('createdAt', 'desc') after creating composite index
      );
      
      const querySnapshot = await getDocs(q);
      const programs = querySnapshot.docs.map(doc => this.convertFirestoreToProgram(doc));
      
      // Sort in memory temporarily
      return programs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting user programs:', error);
      throw new Error('Failed to get user programs');
    }
  }

  async getActivePrograms(userId: string): Promise<MaintenanceProgram[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('userId', '==', userId),
        where('isActive', '==', true)
        // Temporarily removed orderBy to avoid composite index requirement
        // TODO: Re-add orderBy('createdAt', 'desc') after creating composite index
      );
      
      const querySnapshot = await getDocs(q);
      const programs = querySnapshot.docs.map(doc => this.convertFirestoreToProgram(doc));
      
      // Sort in memory temporarily
      return programs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting active programs:', error);
      throw new Error('Failed to get active programs');
    }
  }

  async getProgramsByVehicle(vehicleId: string): Promise<MaintenanceProgram[]> {
    try {
      // Query without orderBy to avoid composite index requirement
      const q = query(
        collection(firestore, this.collectionName),
        where('assignedVehicleIds', 'array-contains', vehicleId)
      );
      
      const querySnapshot = await getDocs(q);
      const programs = querySnapshot.docs.map(doc => this.convertFirestoreToProgram(doc));
      
      // Sort in memory by createdAt descending
      return programs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting programs by vehicle:', error);
      throw new Error('Failed to get programs by vehicle');
    }
  }

  async update(id: string, data: Partial<MaintenanceProgram>): Promise<MaintenanceProgram> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(docRef, updateData);
      
      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new Error('Program not found after update');
      }

      return this.convertFirestoreToProgram(updatedDoc);
    } catch (error) {
      console.error('Error updating program:', error);
      throw new Error('Failed to update program');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      await deleteDoc(docRef);
      
      // Also delete all assignments for this program
      const assignmentsQuery = query(
        collection(firestore, this.assignmentsCollectionName),
        where('programId', '==', id)
      );
      
      const assignmentDocs = await getDocs(assignmentsQuery);
      const deletePromises = assignmentDocs.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting program:', error);
      throw new Error('Failed to delete program');
    }
  }

  async assignToVehicle(programId: string, vehicleId: string): Promise<ProgramAssignment> {
    try {
      // Check if assignment already exists
      const existingAssignment = await this.findAssignment(programId, vehicleId);
      if (existingAssignment) {
        if (existingAssignment.isActive) {
          return existingAssignment;
        } else {
          // Reactivate existing assignment
          return await this.updateAssignment(existingAssignment.id, { isActive: true });
        }
      }

      // Create new assignment
      const assignmentData = {
        programId,
        vehicleId,
        assignedAt: serverTimestamp(),
        isActive: true,
      };

      const docRef = await addDoc(collection(firestore, this.assignmentsCollectionName), assignmentData);
      const doc = await getDoc(docRef);
      
      if (!doc.exists()) {
        throw new Error('Failed to create assignment');
      }

      // Update program's assignedVehicleIds array
      const program = await this.getById(programId);
      if (program && !program.assignedVehicleIds.includes(vehicleId)) {
        await this.update(programId, {
          assignedVehicleIds: [...program.assignedVehicleIds, vehicleId]
        });
      }

      return this.convertFirestoreToAssignment(doc);
    } catch (error) {
      console.error('Error assigning program to vehicle:', error);
      throw new Error('Failed to assign program to vehicle');
    }
  }

  async unassignFromVehicle(programId: string, vehicleId: string): Promise<void> {
    try {
      const assignment = await this.findAssignment(programId, vehicleId);
      if (assignment) {
        await this.updateAssignment(assignment.id, { isActive: false });
      }

      // Update program's assignedVehicleIds array
      const program = await this.getById(programId);
      if (program) {
        const updatedVehicleIds = program.assignedVehicleIds.filter(id => id !== vehicleId);
        await this.update(programId, {
          assignedVehicleIds: updatedVehicleIds
        });
      }
    } catch (error) {
      console.error('Error unassigning program from vehicle:', error);
      throw new Error('Failed to unassign program from vehicle');
    }
  }

  async getVehicleAssignments(vehicleId: string): Promise<ProgramAssignment[]> {
    try {
      const q = query(
        collection(firestore, this.assignmentsCollectionName),
        where('vehicleId', '==', vehicleId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFirestoreToAssignment(doc));
    } catch (error) {
      console.error('Error getting vehicle assignments:', error);
      throw new Error('Failed to get vehicle assignments');
    }
  }

  async getProgramAssignments(programId: string): Promise<ProgramAssignment[]> {
    try {
      const q = query(
        collection(firestore, this.assignmentsCollectionName),
        where('programId', '==', programId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFirestoreToAssignment(doc));
    } catch (error) {
      console.error('Error getting program assignments:', error);
      throw new Error('Failed to get program assignments');
    }
  }

  async activateProgram(programId: string): Promise<void> {
    await this.update(programId, { isActive: true });
  }

  async deactivateProgram(programId: string): Promise<void> {
    await this.update(programId, { isActive: false });
  }

  // Helper methods for assignments
  private async findAssignment(programId: string, vehicleId: string): Promise<ProgramAssignment | null> {
    try {
      const q = query(
        collection(firestore, this.assignmentsCollectionName),
        where('programId', '==', programId),
        where('vehicleId', '==', vehicleId)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      return this.convertFirestoreToAssignment(querySnapshot.docs[0]);
    } catch (error) {
      console.error('Error finding assignment:', error);
      return null;
    }
  }

  private async updateAssignment(id: string, data: Partial<ProgramAssignment>): Promise<ProgramAssignment> {
    try {
      const docRef = doc(firestore, this.assignmentsCollectionName, id);
      await updateDoc(docRef, data);
      
      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new Error('Assignment not found after update');
      }

      return this.convertFirestoreToAssignment(updatedDoc);
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw new Error('Failed to update assignment');
    }
  }

  // ===== CONFLICT MANAGEMENT METHODS (Phase 1A) =====

  async checkVehicleConflicts(vehicleIds: string[]): Promise<ConflictDetectionResult> {
    // Import at method level to avoid circular dependencies
    const { programConflictService } = await import('../services/ProgramConflictService');
    return programConflictService.checkVehicleConflicts(vehicleIds);
  }

  async removeVehicleFromProgram(programId: string, vehicleId: string): Promise<void> {
    try {
      // Get the program
      const program = await this.getById(programId);
      if (!program) {
        throw new Error('Program not found');
      }

      // Remove vehicle from assignedVehicleIds array
      const updatedVehicleIds = program.assignedVehicleIds.filter((id: string) => id !== vehicleId);
      
      if (updatedVehicleIds.length === 0) {
        // If no vehicles left, delete the program
        await this.delete(programId);
        console.log(`Deleted empty program: ${programId}`);
      } else {
        // Update program with remaining vehicles
        await this.update(programId, { 
          assignedVehicleIds: updatedVehicleIds,
          updatedAt: new Date() 
        });
        console.log(`Removed vehicle ${vehicleId} from program: ${programId}`);
      }
    } catch (error) {
      console.error('Error removing vehicle from program:', error);
      throw error;
    }
  }

  async deleteProgram(programId: string): Promise<void> {
    // Use existing delete method
    await this.delete(programId);
  }
}

export class FirebaseProgramAssignmentRepository implements IProgramAssignmentRepository {
  private collectionName = 'program_assignments';

  private convertFirestoreToAssignment(doc: any): ProgramAssignment {
    const data = doc.data();
    return {
      id: doc.id,
      programId: data.programId,
      vehicleId: data.vehicleId,
      assignedAt: data.assignedAt?.toDate() || new Date(),
      isActive: data.isActive ?? true,
      lastCompletedAt: data.lastCompletedAt?.toDate() || undefined,
      nextDueDate: data.nextDueDate?.toDate() || undefined,
      nextDueMileage: data.nextDueMileage || undefined,
    };
  }

  async create(data: Omit<ProgramAssignment, 'id'>): Promise<ProgramAssignment> {
    try {
      const docRef = await addDoc(collection(firestore, this.collectionName), data);
      const doc = await getDoc(docRef);
      
      if (!doc.exists()) {
        throw new Error('Failed to create assignment');
      }

      return this.convertFirestoreToAssignment(doc);
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw new Error('Failed to create assignment');
    }
  }

  async getById(id: string): Promise<ProgramAssignment | null> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      return this.convertFirestoreToAssignment(docSnap);
    } catch (error) {
      console.error('Error getting assignment:', error);
      throw new Error('Failed to get assignment');
    }
  }

  async getAll(): Promise<ProgramAssignment[]> {
    try {
      const querySnapshot = await getDocs(collection(firestore, this.collectionName));
      return querySnapshot.docs.map(doc => this.convertFirestoreToAssignment(doc));
    } catch (error) {
      console.error('Error getting all assignments:', error);
      throw new Error('Failed to get assignments');
    }
  }

  async update(id: string, data: Partial<ProgramAssignment>): Promise<ProgramAssignment> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      await updateDoc(docRef, data);
      
      const updatedDoc = await getDoc(docRef);
      if (!updatedDoc.exists()) {
        throw new Error('Assignment not found after update');
      }

      return this.convertFirestoreToAssignment(updatedDoc);
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw new Error('Failed to update assignment');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw new Error('Failed to delete assignment');
    }
  }

  async getByProgram(programId: string): Promise<ProgramAssignment[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('programId', '==', programId)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFirestoreToAssignment(doc));
    } catch (error) {
      console.error('Error getting assignments by program:', error);
      throw new Error('Failed to get assignments by program');
    }
  }

  async getByVehicle(vehicleId: string): Promise<ProgramAssignment[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('vehicleId', '==', vehicleId)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFirestoreToAssignment(doc));
    } catch (error) {
      console.error('Error getting assignments by vehicle:', error);
      throw new Error('Failed to get assignments by vehicle');
    }
  }

  async getActiveAssignments(): Promise<ProgramAssignment[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFirestoreToAssignment(doc));
    } catch (error) {
      console.error('Error getting active assignments:', error);
      throw new Error('Failed to get active assignments');
    }
  }

  async findAssignment(programId: string, vehicleId: string): Promise<ProgramAssignment | null> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('programId', '==', programId),
        where('vehicleId', '==', vehicleId)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      return this.convertFirestoreToAssignment(querySnapshot.docs[0]);
    } catch (error) {
      console.error('Error finding assignment:', error);
      return null;
    }
  }

}
