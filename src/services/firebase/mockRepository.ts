// Mock Firebase repository for development with authentication simulation
import { Vehicle } from '../../types';
import { authService, User } from '../AuthService';

let mockVehicles: Vehicle[] = [];
let vehicleIdCounter = 1;

export class MockSecureVehicleRepository {
  private authService = authService;

  constructor() {
    // AuthService is now a singleton
  }

  private requireAuth() {
    return this.authService.requireAuth();
  }

  private validateUserOwnership(userId: string) {
    const currentUser = this.requireAuth();
    if (currentUser.uid !== userId) {
      throw new Error('Unauthorized: You can only access your own data');
    }
  }
  async create(data: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    // Ensure user is authenticated
    const currentUser = this.requireAuth();
    
    // Enforce userId matches current user
    if (data.userId && data.userId !== currentUser.uid) {
      throw new Error('Unauthorized: Cannot create vehicle for another user');
    }

    const vehicle: Vehicle = {
      ...data,
      id: `vehicle_${vehicleIdCounter++}`,
      userId: currentUser.uid, // Force userId to current user
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    mockVehicles.push(vehicle);
    console.log('Mock: Created vehicle for user', currentUser.uid, vehicle);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return vehicle;
  }

  async getById(id: string): Promise<Vehicle | null> {
    // Ensure user is authenticated
    const currentUser = this.requireAuth();
    
    const vehicle = mockVehicles.find(v => v.id === id);
    
    if (vehicle) {
      // Verify user owns this vehicle
      this.validateUserOwnership(vehicle.userId);
    }
    
    console.log('Mock: Get vehicle by ID for user', currentUser.uid, id, vehicle);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return vehicle || null;
  }

  async getAll(filters?: { userId?: string }): Promise<Vehicle[]> {
    // Ensure user is authenticated
    const currentUser = this.requireAuth();
    
    // Force filter to current user only (security enforcement)
    const userVehicles = mockVehicles.filter(v => v.userId === currentUser.uid);
    
    console.log('Mock: Get all vehicles for user', currentUser.uid, userVehicles);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [...userVehicles];
  }

  async getUserVehicles(): Promise<Vehicle[]> {
    return this.getAll();
  }

  async getByUserId(userId: string): Promise<Vehicle[]> {
    // Validate user can only access their own vehicles
    this.validateUserOwnership(userId);
    
    return this.getAll({ userId });
  }

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    // Ensure user is authenticated
    const currentUser = this.requireAuth();
    
    const index = mockVehicles.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error('Vehicle not found');
    }
    
    const existingVehicle = mockVehicles[index];
    
    // Verify user owns this vehicle
    this.validateUserOwnership(existingVehicle.userId);
    
    // Prevent userId changes in updates
    const { userId, createdAt, ...updateData } = data as any;
    
    if (userId && userId !== currentUser.uid) {
      throw new Error('Unauthorized: Cannot change vehicle ownership');
    }
    
    mockVehicles[index] = { 
      ...existingVehicle, 
      ...updateData, 
      userId: currentUser.uid, // Force userId to current user
      updatedAt: new Date() 
    };
    
    console.log('Mock: Updated vehicle for user', currentUser.uid, mockVehicles[index]);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return mockVehicles[index];
  }

  async delete(id: string): Promise<void> {
    // Ensure user is authenticated
    const currentUser = this.requireAuth();
    
    const index = mockVehicles.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error('Vehicle not found');
    }
    
    const existingVehicle = mockVehicles[index];
    
    // Verify user owns this vehicle
    this.validateUserOwnership(existingVehicle.userId);
    
    mockVehicles.splice(index, 1);
    console.log('Mock: Deleted vehicle for user', currentUser.uid, id);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

// Legacy export for backward compatibility
export class MockVehicleRepository extends MockSecureVehicleRepository {
  constructor() {
    // AuthService is now a singleton, no need to pass it
    super();
  }
}