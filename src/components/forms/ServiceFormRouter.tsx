// Service Form Router - Routes services to appropriate wireframe screens
// Integrates with DIY wizard and follows the service-to-form mapping matrix
import React from 'react';
import { Modal, StyleSheet } from 'react-native';
import { SelectedService } from '../../types';
import { getServiceFormType, getFormTitle } from '../../domain/ServiceFormMapping';
import { 
  TailoredPartsScreen,
  GeneralPartsScreen, 
  GeneralPartsData,
  FluidsScreen,
  OilChangeWizard,
  OilChangeData,
  PartsAndFluidsWizard,
  PartsAndFluidsData
} from './screens';
import { PartEntryData } from './parts/PartEntryForm';
import { FluidEntryData } from './parts/FluidEntryForm';

export type ServiceFormData = 
  | { type: 'tailored_parts'; data: PartEntryData }
  | { type: 'parts'; data: GeneralPartsData }
  | { type: 'fluids'; data: FluidEntryData }
  | { type: 'oil_and_oil_filter'; data: OilChangeData }
  | { type: 'parts_and_fluids'; data: PartsAndFluidsData };

export interface ServiceFormRouterProps {
  /** Selected service to show form for */
  service: SelectedService;
  
  /** Whether modal is visible */
  visible: boolean;
  
  /** Initial form data */
  initialData?: Partial<any>;
  
  /** Called when form is saved with data */
  onSave: (serviceId: string, formData: ServiceFormData) => void;
  
  /** Called when form is cancelled */
  onCancel: () => void;
  
  /** Loading state */
  loading?: boolean;
}

export const ServiceFormRouter: React.FC<ServiceFormRouterProps> = ({
  service,
  visible,
  initialData,
  onSave,
  onCancel,
  loading = false,
}) => {
  const formType = getServiceFormType(service.serviceId);
  const formTitle = getFormTitle(service.serviceId, service.serviceName);

  // Handle form save for different types
  const handleSave = (data: any) => {
    let formData: ServiceFormData;

    switch (formType) {
      case 'tailored_parts':
        formData = { type: 'tailored_parts', data: data as PartEntryData };
        break;
      case 'parts':
        formData = { type: 'parts', data: data as GeneralPartsData };
        break;
      case 'fluids':
        formData = { type: 'fluids', data: data as FluidEntryData };
        break;
      case 'oil_and_oil_filter':
        formData = { type: 'oil_and_oil_filter', data: data as OilChangeData };
        break;
      case 'parts_and_fluids':
        formData = { type: 'parts_and_fluids', data: data as PartsAndFluidsData };
        break;
      default:
        return; // Should not happen with proper mapping
    }

    onSave(service.serviceId, formData);
  };

  const renderFormScreen = () => {
    switch (formType) {
      case 'tailored_parts':
        return (
          <TailoredPartsScreen
            serviceName={service.serviceName}
            initialData={initialData}
            onSave={handleSave}
            onCancel={onCancel}
            loading={loading}
          />
        );

      case 'parts':
        return (
          <GeneralPartsScreen
            serviceName={service.serviceName}
            initialData={initialData}
            onSave={handleSave}
            onCancel={onCancel}
            loading={loading}
          />
        );

      case 'fluids':
        return (
          <FluidsScreen
            serviceName={service.serviceName}
            initialData={initialData}
            onSave={handleSave}
            onCancel={onCancel}
            loading={loading}
          />
        );

      case 'oil_and_oil_filter':
        return (
          <OilChangeWizard
            initialData={initialData}
            onSave={handleSave}
            onCancel={onCancel}
            loading={loading}
          />
        );

      case 'parts_and_fluids':
        return (
          <PartsAndFluidsWizard
            serviceName={service.serviceName}
            initialData={initialData}
            onSave={handleSave}
            onCancel={onCancel}
            loading={loading}
          />
        );

      default:
        // For services that don't need forms (tire rotation, etc.)
        return null;
    }
  };

  // Don't show modal for services that don't need forms
  if (formType === 'none') {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onCancel}
    >
      {renderFormScreen()}
    </Modal>
  );
};