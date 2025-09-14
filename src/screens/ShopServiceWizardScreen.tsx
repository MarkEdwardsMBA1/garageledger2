// Unified Shop Service Wizard Screen
// Replaces ShopServiceStep1-4Screens with consolidated wizard approach

import React from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WizardContainer } from '../components/common/WizardContainer';
import { WizardConfig, WizardStep } from '../types/wizard';
import { SelectedService, MaintenanceLog } from '../types';

// Step Components
import { 
  ShopBasicInfoStep, 
  ShopBasicInfoData 
} from '../components/wizards/shop/ShopBasicInfoStep';

import { 
  ShopServicesStep, 
  ShopServicesData 
} from '../components/wizards/shop/ShopServicesStep';

import { 
  ShopPhotosStep, 
  ShopPhotosData 
} from '../components/wizards/shop/ShopPhotosStep';

import { 
  ShopNotesStep, 
  ShopNotesData 
} from '../components/wizards/shop/ShopNotesStep';

// Repository imports
import { SecureFirebaseVehicleRepository } from '../repositories/SecureFirebaseVehicleRepository';
import { FirebaseMaintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';
import { ValidationService } from '../validation/ValidationService';

interface ShopServiceWizardParams {
  vehicleId: string;
  // Optional: pre-filled data for editing existing entries
  editingLogId?: string;
  initialData?: Partial<ShopServiceWizardData>;
}

// Combined wizard data interface
interface ShopServiceWizardData {
  basicInfo: ShopBasicInfoData;
  services: ShopServicesData;
  photos: ShopPhotosData;
  notes: ShopNotesData;
}

export const ShopServiceWizardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as ShopServiceWizardParams;

  // Initialize repositories
  const vehicleRepository = new SecureFirebaseVehicleRepository();
  const maintenanceLogRepository = new FirebaseMaintenanceLogRepository();

  // Configure wizard steps - validation now handled by ValidationService
  const wizardSteps: WizardStep[] = [
    {
      id: 'basic-info',
      title: '',
      subtitle: '',
      component: ShopBasicInfoStep,
      validation: (data: any) => {
        console.log('[DEBUG] Shop Step 1 validation data:', data);
        const result = ValidationService.validateShopStep1(data);
        console.log('[DEBUG] Shop Step 1 validation result:', result);
        return result.isValid ? null : result.errors;
      },
    },
    {
      id: 'services',
      title: '',
      subtitle: '',
      component: ShopServicesStep,
      // TEMP: Validation disabled during refactor
      validation: undefined,
    },
    {
      id: 'photos',
      title: '',
      subtitle: '',
      component: ShopPhotosStep,
      // TEMP: Validation disabled during refactor
      validation: undefined,
      canSkip: true,
    },
    {
      id: 'notes',
      title: '',
      subtitle: '',
      component: ShopNotesStep,
      // TEMP: Validation disabled during refactor
      validation: undefined,
    },
  ];

  // Configure wizard
  const wizardConfig: WizardConfig = {
    steps: wizardSteps,
    allowCancel: true,
    initialData: params.initialData || {
      'basic-info': {
        vehicleId: params.vehicleId,
        date: new Date(),
        mileage: '',
        totalCost: '',
        shopName: '',
        shopAddress: '',
        shopPhone: '',
        shopEmail: '',
      },
      'services': {
        selectedServices: [],
        notes: '',
      },
      'photos': {
        photos: [],
      },
      'notes': {},
    },
  };

  // Handle wizard completion
  const handleComplete = async (wizardData: Record<string, any>) => {
    try {
      const basicInfo = wizardData['basic-info'] as ShopBasicInfoData;
      const services = wizardData['services'] as ShopServicesData;
      const photos = wizardData['photos'] as ShopPhotosData;

      // Create maintenance log entry
      const maintenanceLog: Omit<MaintenanceLog, 'id' | 'createdAt'> = {
        vehicleId: params.vehicleId,
        date: basicInfo.date,
        mileage: parseInt(basicInfo.mileage.replace(/,/g, '')),
        title: `Shop Service - ${services.selectedServices.map(s => s.serviceName).join(', ')}`,
        services: services.selectedServices,
        totalCost: parseFloat(basicInfo.totalCost),
        notes: services.notes || '',
        tags: ['shop-service'],
        photos: photos.photos,
        serviceType: 'shop',
        shopName: basicInfo.shopName,
        serviceDescription: `Services performed at ${basicInfo.shopName}`,
      };

      // Save to database
      let savedLog;
      if (params.editingLogId) {
        // Update existing log
        savedLog = await maintenanceLogRepository.update(params.editingLogId, {
          ...maintenanceLog,
          createdAt: new Date(), // Add required field
        });
      } else {
        // Create new log
        savedLog = await maintenanceLogRepository.create({
          ...maintenanceLog,
          createdAt: new Date(), // Add required field
        });
      }

      // Show success message
      Alert.alert(
        'Service Saved!',
        'Your shop service has been saved to your maintenance history.',
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
              // Always navigate to Vehicle Details screen (consistent with DIY Service)
              navigation.navigate('VehicleHome', { vehicleId: params.vehicleId });
            },
            style: 'default',
          }
        ]
      );

    } catch (error) {
      console.error('Error saving shop service:', error);
      Alert.alert(
        'Save Error',
        'There was a problem saving your service record. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle wizard cancellation
  const handleCancel = () => {
    // Navigate back to vehicle home or maintenance screen
    navigation.navigate('VehicleHome', { vehicleId: params.vehicleId });
  };

  return (
    <WizardContainer
      config={wizardConfig}
      onComplete={handleComplete}
      onCancel={handleCancel}
      isLoading={false}
    />
  );
};

export default ShopServiceWizardScreen;