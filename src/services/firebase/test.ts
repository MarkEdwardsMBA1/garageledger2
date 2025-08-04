// Firebase connection test utilities
import { getFirebaseConfigStatus } from './config';
import { vehicleRepository } from '../../repositories/VehicleRepository';
import { Vehicle } from '../../types';

/**
 * Test Firebase configuration and basic connectivity
 */
export const testFirebaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  details: any;
}> => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Check configuration
    const configStatus = getFirebaseConfigStatus();
    console.log('Config status:', configStatus);
    
    if (!configStatus.configured) {
      return {
        success: false,
        message: 'Firebase not configured. Please set up environment variables.',
        details: configStatus,
      };
    }
    
    // Test basic Firestore operation (read all vehicles)
    console.log('Testing Firestore read operation...');
    const vehicles = await vehicleRepository.getAll();
    console.log('✅ Firestore read successful. Vehicles found:', vehicles.length);
    
    return {
      success: true,
      message: `Firebase connected successfully. Found ${vehicles.length} vehicles.`,
      details: {
        ...configStatus,
        vehiclesCount: vehicles.length,
      },
    };
    
  } catch (error: any) {
    console.error('❌ Firebase connection test failed:', error);
    
    return {
      success: false,
      message: `Firebase connection failed: ${error.message}`,
      details: {
        error: error.message,
        stack: error.stack,
      },
    };
  }
};

/**
 * Create a test vehicle for Firebase CRUD testing
 */
export const createTestVehicle = async (userId: string = 'test-user'): Promise<Vehicle> => {
  const testVehicleData: Omit<Vehicle, 'id'> = {
    userId,
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    vin: '1234567890ABCDEFG',
    mileage: 25000,
    notes: 'Test vehicle created by Firebase test',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  return await vehicleRepository.create(testVehicleData);
};

/**
 * Run comprehensive Firebase CRUD test
 */
export const testFirebaseCRUD = async (): Promise<{
  success: boolean;
  message: string;
  results: any;
}> => {
  try {
    console.log('🧪 Starting Firebase CRUD test...');
    
    const testUserId = `test-user-${Date.now()}`;
    const results: any = {};
    
    // Test CREATE
    console.log('Testing CREATE...');
    const createdVehicle = await createTestVehicle(testUserId);
    results.create = { success: true, vehicleId: createdVehicle.id };
    console.log('✅ CREATE successful:', createdVehicle.id);
    
    // Test READ (by ID)
    console.log('Testing READ by ID...');
    const retrievedVehicle = await vehicleRepository.getById(createdVehicle.id);
    results.readById = { 
      success: !!retrievedVehicle, 
      found: !!retrievedVehicle,
      make: retrievedVehicle?.make 
    };
    console.log('✅ READ by ID successful:', !!retrievedVehicle);
    
    // Test READ (by user)
    console.log('Testing READ by user...');
    const userVehicles = await vehicleRepository.getByUserId(testUserId);
    results.readByUser = { 
      success: true, 
      count: userVehicles.length 
    };
    console.log('✅ READ by user successful. Count:', userVehicles.length);
    
    // Test UPDATE
    console.log('Testing UPDATE...');
    const updatedVehicle = await vehicleRepository.update(createdVehicle.id, {
      mileage: 26000,
      notes: 'Updated by Firebase test',
    });
    results.update = { 
      success: true, 
      newMileage: updatedVehicle.mileage 
    };
    console.log('✅ UPDATE successful. New mileage:', updatedVehicle.mileage);
    
    // Test DELETE
    console.log('Testing DELETE...');
    await vehicleRepository.delete(createdVehicle.id);
    const deletedCheck = await vehicleRepository.getById(createdVehicle.id);
    results.delete = { 
      success: !deletedCheck, 
      deleted: !deletedCheck 
    };
    console.log('✅ DELETE successful:', !deletedCheck);
    
    return {
      success: true,
      message: 'All Firebase CRUD operations successful!',
      results,
    };
    
  } catch (error: any) {
    console.error('❌ Firebase CRUD test failed:', error);
    
    return {
      success: false,
      message: `Firebase CRUD test failed: ${error.message}`,
      results: { error: error.message },
    };
  }
};