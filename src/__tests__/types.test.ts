/**
 * TypeScript types test
 */
import type { Vehicle, UserPreferences, VehicleFormData } from '../types';

describe('TypeScript Types', () => {
  test('should define Vehicle type correctly', () => {
    const vehicle: Vehicle = {
      id: 'test-123',
      userId: 'user-456',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      mileage: 50000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(vehicle.id).toBe('test-123');
    expect(vehicle.make).toBe('Toyota');
    expect(vehicle.year).toBe(2020);
  });

  test('should define UserPreferences type correctly', () => {
    const prefs: UserPreferences = {
      userId: 'user-789',
      language: 'en',
      currency: 'USD',
      measurements: 'imperial',
      notifications: {
        language: 'en',
        enabled: true,
      },
    };

    expect(prefs.userId).toBe('user-789');
    expect(prefs.language).toBe('en');
    expect(prefs.currency).toBe('USD');
  });

  test('should define VehicleFormData type correctly', () => {
    const formData: VehicleFormData = {
      make: 'Honda',
      model: 'Civic',
      year: '2021',
      vin: '1HGBH41JXMN109186',
      nickname: 'My Civic',
      mileage: '25000',
      notes: 'Great condition',
      photoUri: '/path/to/photo.jpg',
    };

    expect(formData.make).toBe('Honda');
    expect(formData.year).toBe('2021');
  });
});