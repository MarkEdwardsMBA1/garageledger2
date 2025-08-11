// Test data generator for maintenance logs
// Helps populate realistic sample data for testing fleet status views

import { MaintenanceLog, Vehicle } from '../types';
import { maintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';

interface TestMaintenanceEntry {
  title: string;
  category: string;
  daysAgo: number;
  mileageOffset: number;
  cost?: number;
  notes?: string;
}

// Realistic maintenance patterns for different vehicle types
const COMMON_MAINTENANCE_PATTERNS: { [vehicleType: string]: TestMaintenanceEntry[] } = {
  'honda-civic': [
    { title: 'Oil Change', category: 'engine-powertrain:oil-change', daysAgo: 15, mileageOffset: 500, cost: 45.99 },
    { title: 'Tire Rotation', category: 'tires-wheels:tire-rotation-balancing', daysAgo: 45, mileageOffset: 2000, cost: 35.00 },
    { title: 'Brake Pads Replacement', category: 'brake-system:brake-pads-rotors', daysAgo: 120, mileageOffset: 8000, cost: 285.50, notes: 'Front brake pads only' },
    { title: 'Air Filter Replacement', category: 'engine-powertrain:air-filter', daysAgo: 180, mileageOffset: 12000, cost: 28.99 },
  ],
  'ford-f150': [
    { title: 'Oil Change', category: 'engine-powertrain:oil-change', daysAgo: 22, mileageOffset: 800, cost: 65.99 },
    { title: 'Transmission Fluid Change', category: 'transmission-drivetrain:transmission-fluid', daysAgo: 90, mileageOffset: 6000, cost: 180.00 },
    { title: 'Brake Inspection', category: 'brake-system:brake-pads-rotors', daysAgo: 160, mileageOffset: 10000, cost: 89.99, notes: 'Annual brake inspection - all good' },
    { title: 'Coolant Flush', category: 'engine-powertrain:coolant', daysAgo: 200, mileageOffset: 15000, cost: 125.00 },
  ],
  'tesla-model3': [
    { title: 'Tire Rotation', category: 'tires-wheels:tire-rotation-balancing', daysAgo: 30, mileageOffset: 1500, cost: 45.00 },
    { title: 'Cabin Air Filter', category: 'hvac-climate:heater-core', daysAgo: 120, mileageOffset: 8000, cost: 35.99 },
    { title: 'Brake Fluid Check', category: 'brake-system:brake-fluid', daysAgo: 180, mileageOffset: 12000, cost: 25.00, notes: 'Tesla service center inspection' },
    { title: 'Windshield Wipers', category: 'body-exterior:windshield-wipers', daysAgo: 240, mileageOffset: 18000, cost: 42.50 },
  ],
};

// Generate test maintenance logs for a specific vehicle
export const generateTestMaintenanceForVehicle = async (vehicle: Vehicle): Promise<void> => {
  console.log(`🧪 Generating test maintenance data for ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
  
  // Determine vehicle pattern based on make/model
  const vehicleKey = `${vehicle.make.toLowerCase()}-${vehicle.model.toLowerCase().replace(/\s+/g, '')}`;
  let pattern = COMMON_MAINTENANCE_PATTERNS[vehicleKey];
  
  // Fallback to generic pattern if specific vehicle not found
  if (!pattern) {
    console.log(`No specific pattern for ${vehicleKey}, using generic pattern`);
    pattern = [
      { title: 'Oil Change', category: 'engine-powertrain:oil-change', daysAgo: 30, mileageOffset: 1000, cost: 55.99 },
      { title: 'Tire Rotation', category: 'tires-wheels:tire-rotation-balancing', daysAgo: 90, mileageOffset: 4000, cost: 40.00 },
      { title: 'Air Filter', category: 'engine-powertrain:air-filter', daysAgo: 150, mileageOffset: 8000, cost: 32.99 },
    ];
  }

  try {
    // Generate maintenance logs based on pattern
    for (const entry of pattern) {
      const logDate = new Date();
      logDate.setDate(logDate.getDate() - entry.daysAgo);
      
      const maintenanceData: Omit<MaintenanceLog, 'id'> = {
        vehicleId: vehicle.id,
        title: entry.title,
        date: logDate,
        mileage: Math.max(0, (vehicle.mileage || 50000) - entry.mileageOffset),
        category: entry.category,
        cost: entry.cost,
        notes: entry.notes,
        tags: ['test-data'],
        photos: [],
        createdAt: logDate,
      };

      await maintenanceLogRepository.create(maintenanceData);
      console.log(`✅ Created: ${entry.title} for ${vehicle.make} ${vehicle.model}`);
    }
    
    console.log(`🎉 Successfully generated ${pattern.length} maintenance logs for ${vehicle.make} ${vehicle.model}`);
  } catch (error) {
    console.error(`❌ Error generating test data for ${vehicle.make} ${vehicle.model}:`, error);
  }
};

// Generate test data for all user's vehicles
export const generateTestMaintenanceForAllVehicles = async (vehicles: Vehicle[]): Promise<void> => {
  console.log(`🚀 Starting test data generation for ${vehicles.length} vehicles`);
  
  for (const vehicle of vehicles) {
    await generateTestMaintenanceForVehicle(vehicle);
    // Small delay to avoid overwhelming Firestore
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`✨ Test data generation complete!`);
};

// Clean up test data (removes all logs tagged with 'test-data')
export const cleanupTestData = async (): Promise<void> => {
  console.log('🧹 Cleaning up test maintenance data...');
  
  try {
    // Get all maintenance logs
    const allLogs = await maintenanceLogRepository.getAll();
    
    // Filter for test data logs
    const testLogs = allLogs.filter(log => 
      log.tags && log.tags.includes('test-data')
    );
    
    console.log(`Found ${testLogs.length} test data entries to remove`);
    
    // Delete test logs
    for (const log of testLogs) {
      await maintenanceLogRepository.delete(log.id);
      console.log(`🗑️ Deleted: ${log.title}`);
    }
    
    console.log('✅ Test data cleanup complete!');
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
  }
};

// Development helper - call from console to generate test data
if (__DEV__) {
  (global as any).generateTestData = generateTestMaintenanceForAllVehicles;
  (global as any).cleanupTestData = cleanupTestData;
  console.log('🛠️ Dev helpers available: generateTestData(vehicles), cleanupTestData()');
}