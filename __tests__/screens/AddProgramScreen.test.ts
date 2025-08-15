// Tests for Add Program Screen functionality
import { MaintenanceProgram, ProgramTask } from '../../src/types';
import { MAINTENANCE_CATEGORIES, getCategoryName, getSubcategoryName } from '../../src/types/MaintenanceCategories';

// Mock program data for testing form logic
const mockProgramFormData = {
  name: 'Basic Maintenance Program',
  description: 'Standard maintenance for daily drivers',
  tasks: [
    {
      id: 'task_1',
      name: 'Oil Change',
      description: 'Regular engine oil change',
      category: 'engine-powertrain:oil-filter-change',
      intervalType: 'mileage' as const,
      intervalValue: 5000,
      estimatedCost: 75,
      reminderOffset: 7,
      isActive: true,
    },
    {
      id: 'task_2',
      name: 'Brake Inspection',
      description: 'Check brake pads and rotors',
      category: 'brake-system:brake-pads-rotors',
      intervalType: 'mileage' as const,
      intervalValue: 10000,
      estimatedCost: 150,
      reminderOffset: 14,
      isActive: true,
    },
  ] as ProgramTask[],
};

describe('Add Program Screen Business Logic', () => {
  describe('Form Validation', () => {
    it('should validate program name is required', () => {
      const isValidName = (name: string) => Boolean(name && name.trim().length > 0);
      
      expect(isValidName('')).toBe(false);
      expect(isValidName('   ')).toBe(false);
      expect(isValidName('Basic Maintenance')).toBe(true);
    });

    it('should validate at least one task is required', () => {
      const hasValidTasks = (tasks: ProgramTask[]) => tasks && tasks.length > 0;
      
      expect(hasValidTasks([])).toBe(false);
      expect(hasValidTasks(mockProgramFormData.tasks)).toBe(true);
    });

    it('should validate task fields', () => {
      const validateTask = (task: Partial<ProgramTask>) => {
        return Boolean(
          task.name && task.name.trim().length > 0 &&
          task.category && task.category.length > 0 &&
          task.intervalValue && task.intervalValue > 0 &&
          ['mileage', 'time'].includes(task.intervalType || '')
        );
      };

      const validTask = mockProgramFormData.tasks[0];
      const invalidTask = {
        name: '',
        category: '',
        intervalValue: 0,
        intervalType: 'invalid' as any,
      };

      expect(validateTask(validTask)).toBe(true);
      expect(validateTask(invalidTask)).toBe(false);
      expect(validateTask({ ...validTask, name: '' })).toBe(false);
      expect(validateTask({ ...validTask, category: '' })).toBe(false);
      expect(validateTask({ ...validTask, intervalValue: 0 })).toBe(false);
    });
  });

  describe('Task Management', () => {
    it('should generate unique task IDs', () => {
      const generateTaskId = () => `task_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const id1 = generateTaskId();
      const id2 = generateTaskId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^task_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^task_\d+_[a-z0-9]+$/);
    });

    it('should add new tasks to task list', () => {
      const tasks: ProgramTask[] = [];
      const newTask: ProgramTask = {
        id: 'task_new',
        name: 'Air Filter Change',
        description: 'Replace engine air filter',
        category: 'engine-powertrain:engine-air-filter',
        intervalType: 'mileage',
        intervalValue: 12000,
        estimatedCost: 25,
        reminderOffset: 7,
        isActive: true,
      };

      const updatedTasks = [...tasks, newTask];
      
      expect(updatedTasks).toHaveLength(1);
      expect(updatedTasks[0]).toEqual(newTask);
    });

    it('should remove tasks by ID', () => {
      const tasks = [...mockProgramFormData.tasks];
      const taskIdToRemove = 'task_1';
      const filteredTasks = tasks.filter(task => task.id !== taskIdToRemove);
      
      expect(filteredTasks).toHaveLength(1);
      expect(filteredTasks[0].id).toBe('task_2');
    });
  });

  describe('Category Selection', () => {
    it('should format category keys correctly', () => {
      const formatCategory = (categoryKey: string, subcategoryKey: string) => 
        `${categoryKey}:${subcategoryKey}`;
      
      expect(formatCategory('engine-powertrain', 'oil-filter-change')).toBe('engine-powertrain:oil-filter-change');
      expect(formatCategory('brake-system', 'brake-pads-rotors')).toBe('brake-system:brake-pads-rotors');
    });

    it('should get category display names', () => {
      expect(getCategoryName('engine-powertrain')).toBe('Engine & Powertrain');
      expect(getCategoryName('brake-system')).toBe('Brake System');
      expect(getSubcategoryName('engine-powertrain', 'oil-filter-change')).toBe('Oil & Oil Filter Change');
    });

    it('should validate category exists', () => {
      const isValidCategory = (categoryKey: string, subcategoryKey: string) => {
        return MAINTENANCE_CATEGORIES[categoryKey]?.subcategories[subcategoryKey] !== undefined;
      };

      expect(isValidCategory('engine-powertrain', 'oil-filter-change')).toBe(true);
      expect(isValidCategory('brake-system', 'brake-pads-rotors')).toBe(true);
      expect(isValidCategory('invalid-category', 'invalid-subcategory')).toBe(false);
    });
  });

  describe('Program Creation Data', () => {
    it('should create valid program object', () => {
      const userId = 'test-user-123';
      const programId = 'program_test_123';
      const currentDate = new Date();

      const program: MaintenanceProgram = {
        id: programId,
        userId: userId,
        name: mockProgramFormData.name,
        description: mockProgramFormData.description,
        tasks: mockProgramFormData.tasks,
        assignedVehicleIds: [],
        isActive: true,
        createdAt: currentDate,
        updatedAt: currentDate,
      };

      // Validate required fields
      expect(program.id).toBe(programId);
      expect(program.userId).toBe(userId);
      expect(program.name).toBe('Basic Maintenance Program');
      expect(program.description).toBe('Standard maintenance for daily drivers');
      expect(program.tasks).toHaveLength(2);
      expect(program.assignedVehicleIds).toEqual([]);
      expect(program.isActive).toBe(true);
      expect(program.createdAt).toBeInstanceOf(Date);
      expect(program.updatedAt).toBeInstanceOf(Date);

      // Validate tasks structure
      program.tasks.forEach(task => {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('name');
        expect(task).toHaveProperty('category');
        expect(task).toHaveProperty('intervalType');
        expect(task).toHaveProperty('intervalValue');
        expect(task).toHaveProperty('isActive');
        expect(['mileage', 'time']).toContain(task.intervalType);
        expect(task.intervalValue).toBeGreaterThan(0);
      });
    });

    it('should handle optional fields correctly', () => {
      const minimalProgram: Partial<MaintenanceProgram> = {
        id: 'program_minimal',
        userId: 'test-user',
        name: 'Minimal Program',
        tasks: [{
          id: 'task_minimal',
          name: 'Basic Service',
          category: 'engine-powertrain:oil-filter-change',
          intervalType: 'mileage',
          intervalValue: 5000,
          isActive: true,
        }] as ProgramTask[],
        assignedVehicleIds: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(minimalProgram.description).toBeUndefined();
      expect(minimalProgram.tasks?.[0].description).toBeUndefined();
      expect(minimalProgram.tasks?.[0].estimatedCost).toBeUndefined();
      expect(minimalProgram.tasks?.[0].reminderOffset).toBeUndefined();
    });
  });

  describe('Interval Calculations', () => {
    it('should handle different interval types', () => {
      const mileageTask = mockProgramFormData.tasks[0];
      const timeTask = { ...mockProgramFormData.tasks[1], intervalType: 'time' as const, intervalValue: 90 };

      expect(mileageTask.intervalType).toBe('mileage');
      expect(mileageTask.intervalValue).toBe(5000);
      
      expect(timeTask.intervalType).toBe('time');
      expect(timeTask.intervalValue).toBe(90);
    });

    it('should validate positive interval values', () => {
      const isValidInterval = (value: number | undefined) => 
        value !== undefined && value > 0;

      expect(isValidInterval(5000)).toBe(true);
      expect(isValidInterval(0)).toBe(false);
      expect(isValidInterval(-1000)).toBe(false);
      expect(isValidInterval(undefined)).toBe(false);
    });
  });

  describe('Cost Calculations', () => {
    it('should calculate total estimated cost for program', () => {
      const calculateProgramCost = (tasks: ProgramTask[]) => {
        return tasks
          .filter(task => task.estimatedCost !== undefined)
          .reduce((total, task) => total + (task.estimatedCost || 0), 0);
      };

      const totalCost = calculateProgramCost(mockProgramFormData.tasks);
      expect(totalCost).toBe(225); // $75 + $150
    });

    it('should handle tasks without estimated costs', () => {
      const tasksWithoutCosts: ProgramTask[] = [
        {
          id: 'task_no_cost',
          name: 'Free Service',
          category: 'labor-services:diagnostic',
          intervalType: 'time',
          intervalValue: 365,
          isActive: true,
        }
      ];

      const calculateProgramCost = (tasks: ProgramTask[]) => {
        return tasks
          .filter(task => task.estimatedCost !== undefined)
          .reduce((total, task) => total + (task.estimatedCost || 0), 0);
      };

      expect(calculateProgramCost(tasksWithoutCosts)).toBe(0);
    });
  });
});