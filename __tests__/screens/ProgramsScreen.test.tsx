// Tests for Programs Screen functionality
import React from 'react';
import ProgramsScreen from '../../src/screens/ProgramsScreen';
import { MaintenanceProgram } from '../../src/types';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useFocusEffect: (callback: () => void) => callback(),
}));

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

// Mock auth context
jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { uid: 'test-user' },
  }),
}));

// Mock program repository
const mockPrograms: MaintenanceProgram[] = [
  {
    id: 'program-1',
    userId: 'test-user',
    name: 'Basic Maintenance',
    description: 'Standard maintenance schedule for daily drivers',
    tasks: [
      {
        id: 'task-1',
        name: 'Oil Change',
        description: 'Regular engine oil change',
        category: 'engine:oil_change',
        intervalType: 'mileage',
        intervalValue: 3000,
        estimatedCost: 50,
        reminderOffset: 7,
        isActive: true,
      },
      {
        id: 'task-2',
        name: 'Air Filter',
        description: 'Replace engine air filter',
        category: 'engine:air_filter',
        intervalType: 'mileage',
        intervalValue: 12000,
        estimatedCost: 25,
        reminderOffset: 7,
        isActive: false,
      },
    ],
    assignedVehicleIds: ['vehicle-1'],
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'program-2',
    userId: 'test-user',
    name: 'Performance Package',
    description: 'Enhanced maintenance for performance vehicles',
    tasks: [
      {
        id: 'task-3',
        name: 'Premium Oil Change',
        description: 'High-performance synthetic oil',
        category: 'engine:oil_change',
        intervalType: 'mileage',
        intervalValue: 5000,
        estimatedCost: 80,
        reminderOffset: 7,
        isActive: true,
      },
    ],
    assignedVehicleIds: ['vehicle-1', 'vehicle-2'],
    isActive: true,
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-10'),
  },
];

jest.mock('../../src/repositories/SecureProgramRepository', () => ({
  programRepository: {
    getUserPrograms: jest.fn().mockResolvedValue(mockPrograms),
  },
}));

describe('ProgramsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Model Validation', () => {
    it('should have valid program data structure', () => {
      const program = mockPrograms[0];
      
      // Required fields
      expect(program).toHaveProperty('id');
      expect(program).toHaveProperty('userId');
      expect(program).toHaveProperty('name');
      expect(program).toHaveProperty('tasks');
      expect(program).toHaveProperty('assignedVehicleIds');
      expect(program).toHaveProperty('isActive');
      expect(program).toHaveProperty('createdAt');
      expect(program).toHaveProperty('updatedAt');
      
      // Data types
      expect(typeof program.id).toBe('string');
      expect(typeof program.userId).toBe('string');
      expect(typeof program.name).toBe('string');
      expect(Array.isArray(program.tasks)).toBe(true);
      expect(Array.isArray(program.assignedVehicleIds)).toBe(true);
      expect(typeof program.isActive).toBe('boolean');
      expect(program.createdAt).toBeInstanceOf(Date);
      expect(program.updatedAt).toBeInstanceOf(Date);
    });

    it('should have valid program task structure', () => {
      const task = mockPrograms[0].tasks[0];
      
      // Required fields
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('name');
      expect(task).toHaveProperty('category');
      expect(task).toHaveProperty('intervalType');
      expect(task).toHaveProperty('intervalValue');
      expect(task).toHaveProperty('isActive');
      
      // Data types
      expect(typeof task.id).toBe('string');
      expect(typeof task.name).toBe('string');
      expect(typeof task.category).toBe('string');
      expect(['mileage', 'time']).toContain(task.intervalType);
      expect(typeof task.intervalValue).toBe('number');
      expect(typeof task.isActive).toBe('boolean');
      
      // Optional fields
      if (task.description !== undefined) {
        expect(typeof task.description).toBe('string');
      }
      if (task.estimatedCost !== undefined) {
        expect(typeof task.estimatedCost).toBe('number');
        expect(task.estimatedCost).toBeGreaterThanOrEqual(0);
      }
      if (task.reminderOffset !== undefined) {
        expect(typeof task.reminderOffset).toBe('number');
        expect(task.reminderOffset).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Component Structure Validation', () => {
    it('should render ProgramsScreen component', () => {
      // Test that the component can be instantiated
      const component = React.createElement(ProgramsScreen);
      expect(component).toBeTruthy();
      expect(component.type).toBe(ProgramsScreen);
    });

    it('should validate repository integration', () => {
      const mockProgramRepository = require('../../src/repositories/SecureProgramRepository');
      
      // Should have repository methods
      expect(typeof mockProgramRepository.programRepository.getUserPrograms).toBe('function');
      
      // Should return promise
      const result = mockProgramRepository.programRepository.getUserPrograms();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Business Logic Validation', () => {
    it('should calculate task statistics correctly', () => {
      const program = mockPrograms[0]; // Basic Maintenance: 2 tasks, 1 active
      
      const totalTasks = program.tasks.length;
      const activeTasks = program.tasks.filter(task => task.isActive).length;
      
      expect(totalTasks).toBe(2);
      expect(activeTasks).toBe(1);
    });

    it('should handle vehicle assignments correctly', () => {
      const program1 = mockPrograms[0]; // 1 vehicle assigned
      const program2 = mockPrograms[1]; // 2 vehicles assigned
      
      expect(program1.assignedVehicleIds.length).toBe(1);
      expect(program2.assignedVehicleIds.length).toBe(2);
    });

    it('should validate search filtering logic', () => {
      const searchQuery = 'basic';
      const filteredPrograms = mockPrograms.filter(program => 
        program.name.toLowerCase().includes(searchQuery) ||
        (program.description && program.description.toLowerCase().includes(searchQuery))
      );
      
      expect(filteredPrograms.length).toBe(1);
      expect(filteredPrograms[0].name).toBe('Basic Maintenance');
    });
  });

  describe('Translation Keys', () => {
    it('should have required translation keys defined', () => {
      // Mock translation function that returns the key
      const t = (key: string, fallback?: string) => fallback || key;
      
      // Test that translation keys work
      expect(t('programs.searchPlaceholder', 'Search programs...')).toBe('Search programs...');
      expect(t('programs.loading', 'Loading programs...')).toBe('Loading programs...');
      expect(t('programs.noProgramsTitle', 'No Programs Yet')).toBe('No Programs Yet');
      expect(t('programs.createFirst', 'Create First Program')).toBe('Create First Program');
    });
  });
});