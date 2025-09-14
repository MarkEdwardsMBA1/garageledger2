// Unified DIY Service Wizard Screen
// Replaces DIYServiceStep1-4Screen.tsx with single wizard flow
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { WizardContainer } from '../components/common/WizardContainer';
import { DIYBasicInfoStep } from '../components/wizards/diy/DIYBasicInfoStep';
import { DIYServicesStep } from '../components/wizards/diy/DIYServicesStep';
import { DIYPhotosStep } from '../components/wizards/diy/DIYPhotosStep';
import { DIYReviewStep } from '../components/wizards/diy/DIYReviewStep';
import { WizardConfig, WizardStep, DIYServiceWizardData } from '../types/wizard';
import { MaintenanceLog, Vehicle, SelectedService, AdvancedServiceConfiguration } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseMaintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { ValidationService } from '../validation/ValidationService';

interface DIYServiceWizardParams {
  vehicleId: string;
  // Support continuing from existing data
  initialData?: {
    date?: string;
    mileage?: string;
    selectedServices?: SelectedService[];
    serviceConfigs?: { [key: string]: AdvancedServiceConfiguration };
    photos?: string[];
    notes?: string;
  };
}

const maintenanceLogRepository = new FirebaseMaintenanceLogRepository();

export const DIYServiceWizardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as DIYServiceWizardParams;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Convert initial data to wizard format (using step IDs as keys)
  const getInitialWizardData = () => {
    if (!params.initialData) {
      return {
        'basic-info': {
          vehicleId: params.vehicleId,
          date: new Date(),
          mileage: '',
        },
        'services': {
          selectedServices: [],
          serviceConfigs: {},
          notes: '',
          servicesWithPartsAndFluids: {},
          totalPartsCart: 0,
          totalFluidsCart: 0,
          grandTotal: 0,
        },
        'photos': {
          photos: [],
        },
        'review': {
          totalCost: 0,
        },
      };
    }

    return {
      'basic-info': {
        vehicleId: params.vehicleId,
        date: params.initialData.date ? new Date(params.initialData.date) : new Date(),
        mileage: params.initialData.mileage || '',
      },
      'services': {
        selectedServices: params.initialData.selectedServices || [],
        serviceConfigs: params.initialData.serviceConfigs || {},
        notes: params.initialData.notes || '',
        servicesWithPartsAndFluids: {},
        totalPartsCart: 0,
        totalFluidsCart: 0,
        grandTotal: 0,
      },
      'photos': {
        photos: params.initialData.photos || [],
      },
      'review': {
        totalCost: 0, // Will be calculated
      },
    };
  };

  // Define wizard steps - validation now handled by ValidationService
  const wizardSteps: WizardStep[] = [
    {
      id: 'basic-info',
      title: 'Step 1 of 4',
      component: DIYBasicInfoStep,
      validation: (data: any) => {
        console.log('[DEBUG] DIY Step 1 validation data:', data);
        const result = ValidationService.validateDIYStep1(data);
        console.log('[DEBUG] DIY Step 1 validation result:', result);
        return result.isValid ? null : result.errors;
      },
    },
    {
      id: 'services',
      title: 'Step 2 of 4',
      component: DIYServicesStep,
      // TEMP: Validation disabled during refactor
      validation: undefined,
    },
    {
      id: 'photos',
      title: 'Step 3 of 4',
      component: DIYPhotosStep,
      canSkip: true,
    },
    {
      id: 'review',
      title: 'Step 4 of 4',
      component: DIYReviewStep,
    },
  ];

  // Wizard configuration
  const wizardConfig: WizardConfig = {
    steps: wizardSteps,
    initialData: getInitialWizardData(),
    allowCancel: true,
    persistData: true,
    persistKey: `diy-service-${params.vehicleId}`,
  };

  // Handle wizard completion
  const handleWizardComplete = async (wizardData: Record<string, any>) => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in to save maintenance logs');
      return;
    }

    const data = wizardData as DIYServiceWizardData;

    try {
      setIsLoading(true);

      // Get vehicle for context
      const vehicle = await vehicleRepository.getById(params.vehicleId);
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      // Create maintenance log from wizard data (using correct step IDs)
      const basicInfo = (data as any)['basic-info'] || {};
      const services = (data as any)['services'] || {};
      const photos = (data as any)['photos'] || {};
      const review = (data as any)['review'] || {};
      
      const maintenanceLog: Omit<MaintenanceLog, 'id' | 'createdAt' | 'updatedAt'> = {
        vehicleId: params.vehicleId,
        date: basicInfo.date,
        mileage: parseInt(basicInfo.mileage?.replace(/,/g, '') || '0') || 0,
        title: `DIY Service - ${services.selectedServices?.map((s: any) => s.serviceName).join(', ') || 'Unknown Services'}`,
        services: services.selectedServices || [],
        totalCost: review.totalCost || 0,
        notes: services.notes || '',
        tags: [],
        photos: photos.photos || [],
        serviceType: 'diy',
      };

      // Save to repository
      const savedLog = await maintenanceLogRepository.create(maintenanceLog as MaintenanceLog);

      // Success - navigate back to vehicle or maintenance history
      Alert.alert(
        'Service Saved!',
        'Your DIY maintenance has been logged successfully.',
        [
          {
            text: 'View Details',
            onPress: () => {
              navigation.navigate('ServiceDetail', { 
                serviceLogId: savedLog.id,
                vehicleId: params.vehicleId,
              });
            }
          },
          {
            text: 'Done',
            onPress: () => {
              // Always navigate to Vehicle Details screen (consistent with Shop Service)
              navigation.navigate('VehicleHome', { vehicleId: params.vehicleId });
            },
            style: 'default',
          }
        ]
      );

    } catch (error) {
      console.error('Error saving DIY service:', error);
      Alert.alert(
        'Save Failed',
        'There was an error saving your DIY service. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle wizard cancellation - simple navigation (WizardContainer handles confirmation)
  const handleWizardCancel = () => {
    // Simple navigation - no additional popup needed
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('VehicleHome', { vehicleId: params.vehicleId });
    }
  };

  return (
    <WizardContainer
      config={wizardConfig}
      onComplete={handleWizardComplete}
      onCancel={handleWizardCancel}
      isLoading={isLoading}
    />
  );
};