// Vehicle repository interface and exports
// This file exports the interface and provides the concrete implementation

import { BaseRepository } from './BaseRepository';
import { Vehicle } from '../types';
import { authService } from '../services/AuthService';

export interface IVehicleRepository extends BaseRepository<Vehicle> {
  getByUserId(userId: string): Promise<Vehicle[]>;
  getUserVehicles(): Promise<Vehicle[]>;
}

// Export the secure Firebase implementation as the default repository
export { SecureFirebaseVehicleRepository } from './SecureFirebaseVehicleRepository';

// Create a singleton instance for easy usage throughout the app
import { SecureFirebaseVehicleRepository } from './SecureFirebaseVehicleRepository';
export const vehicleRepository = new SecureFirebaseVehicleRepository();

// Legacy export for backward compatibility (will be deprecated)
export { FirebaseVehicleRepository } from './FirebaseVehicleRepository';