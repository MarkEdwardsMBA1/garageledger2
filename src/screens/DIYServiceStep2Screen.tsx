// DIY Service Step 2: Service Selection with Details
import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { MaintenanceCategoryPicker } from '../components/common/MaintenanceCategoryPicker';
import { SelectedServicesCard } from '../components/common/SelectedServicesCard';
import { SelectedService, AdvancedServiceConfiguration } from '../types';
import { ServiceFormData } from '../components/forms/ServiceFormRouter';

interface DIYServiceStep1SerializableData {
  date: string; // ISO string from navigation
  mileage: string;
}

interface DIYServiceStep2Params {
  vehicleId: string;
  step1Data: DIYServiceStep1SerializableData;
  selectedServices?: SelectedService[];
  serviceConfigs?: { [key: string]: AdvancedServiceConfiguration }; // Plain object for navigation
  serviceFormData?: Record<string, ServiceFormData>; // Parts/fluids form data
  notes?: string;
}

export const DIYServiceStep2Screen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as DIYServiceStep2Params;
  
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    params?.selectedServices || []
  );
  const [serviceConfigs, setServiceConfigs] = useState<Map<string, AdvancedServiceConfiguration>>(
    params?.serviceConfigs ? new Map(Object.entries(params.serviceConfigs)) : new Map()
  );
  const [serviceFormData, setServiceFormData] = useState<Record<string, ServiceFormData>>(
    params?.serviceFormData || {}
  );
  const [notes, setNotes] = useState(params?.notes || '');
  const [showCategoryPicker, setShowCategoryPicker] = useState(
    !params?.selectedServices || params.selectedServices.length === 0
  );

  // Configure navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Services Performed',
      headerRight: () => (
        <Typography variant="label" style={styles.stepIndicator}>
          2 of 4
        </Typography>
      ),
    });
  }, [navigation]);

  const handleServiceSelection = (
    services: SelectedService[], 
    configs?: { [key: string]: AdvancedServiceConfiguration },
    formData?: Record<string, ServiceFormData>
  ) => {
    setSelectedServices(services);
    if (configs) {
      setServiceConfigs(new Map(Object.entries(configs)));
    }
    if (formData) {
      setServiceFormData(formData);
    }
    setShowCategoryPicker(false);
  };

  const handleEditServices = () => {
    setShowCategoryPicker(true);
  };

  const validateForm = (): boolean => {
    if (selectedServices.length === 0) {
      Alert.alert(
        'Select Services',
        'Please select at least one service that was performed.'
      );
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateForm()) return;

    navigation.navigate('DIYServiceStep3', {
      vehicleId: params.vehicleId,
      step1Data: params.step1Data,
      selectedServices: selectedServices,
      serviceConfigs: Object.fromEntries(serviceConfigs),
      serviceFormData: serviceFormData, // Pass along parts/fluids data
      notes: notes,
    });
  };

  const handleBack = () => {
    navigation.navigate('DIYServiceStep1', {
      vehicleId: params.vehicleId,
      data: params.step1Data, // Already serializable
      selectedServices: selectedServices, // Pass along selected services
      serviceConfigs: Object.fromEntries(serviceConfigs), // Pass along service configs
      serviceFormData: serviceFormData, // Pass along parts/fluids data
      notes: notes, // Pass along notes
    });
  };

  return (
    <View style={styles.container}>
      {showCategoryPicker ? (
        // Full-screen category picker (no modal!)
        <MaintenanceCategoryPicker
          visible={true}
          selectedServices={selectedServices}
          onSelectionComplete={handleServiceSelection}
          onCancel={() => navigation.goBack()}
          serviceType="diy"
          enableConfiguration={true} // Enable detailed parts/fluids configuration for DIY
          initialServiceFormData={serviceFormData} // Persist parts/fluids data
        />
      ) : (
        // Show selected services summary
        <View style={styles.content}>
          <ScrollView style={styles.scrollContent}>
            <SelectedServicesCard
              services={selectedServices}
              mode="diy"
              serviceConfigs={serviceConfigs}
              serviceFormData={serviceFormData}
              style={styles.selectedServicesCard}
            />

            <View style={styles.notesSection}>
              <Input
                label="Additional Notes (Optional)"
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional details about the work performed, tools used, or observations..."
                multiline
                numberOfLines={4}
              />
            </View>

            <Button
              title="Edit Services"
              variant="outline"
              onPress={handleEditServices}
              style={styles.editButton}
            />

          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button
              title="Next"
              variant="primary"
              onPress={handleNext}
              style={styles.fullWidthButton}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  stepIndicator: {
    color: theme.colors.primary,
    marginRight: theme.spacing.md,
  },
  selectedServicesCard: {
    marginBottom: theme.spacing.md,
  },
  notesSection: {
    marginBottom: theme.spacing.md,
  },
  editButton: {
    marginBottom: theme.spacing.lg,
  },
  buttonContainer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  fullWidthButton: {
    minHeight: 48,
  },
});

export default DIYServiceStep2Screen;