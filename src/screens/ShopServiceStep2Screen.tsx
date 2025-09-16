// Shop Service Step 2: Service Selection
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
import { SelectedService } from '../types';

interface ShopServiceStep1SerializableData {
  date: string; // ISO string from navigation
  mileage: string;
  totalCost: string;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
}

interface ShopServiceStep2Params {
  vehicleId: string;
  step1Data: ShopServiceStep1SerializableData;
  selectedServices?: SelectedService[];
  notes?: string;
}

export const ShopServiceStep2Screen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as ShopServiceStep2Params;
  
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    params?.selectedServices || []
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

  const handleServiceSelection = (services: SelectedService[]) => {
    setSelectedServices(services);
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

    navigation.navigate('ShopServiceStep3', {
      vehicleId: params.vehicleId,
      step1Data: params.step1Data,
      selectedServices: selectedServices,
      notes: notes,
    });
  };

  const handleBack = () => {
    navigation.navigate('ShopServiceStep1', {
      vehicleId: params.vehicleId,
      data: params.step1Data, // Already serializable
      selectedServices: selectedServices, // Pass along selected services
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
          serviceType="shop"
          enableConfiguration={false}
        />
      ) : (
        // Show selected services summary
        <View style={styles.content}>
          <ScrollView style={styles.scrollContent}>
            <Card variant="elevated" style={styles.summaryCard}>
              <Typography variant="heading" style={styles.summaryTitle}>
                Summary
              </Typography>
              <View style={styles.summaryRow}>
                <Typography variant="body" style={styles.summaryText}>
                  Services: {selectedServices.length}
                </Typography>
                <Typography variant="body" style={styles.summaryText}>
                  Total Cost: ${params.step1Data.totalCost}
                </Typography>
              </View>
            </Card>

            <Card variant="elevated" style={styles.selectedServicesCard}>
              <Typography variant="heading" style={styles.selectedServicesTitle}>
                Services
              </Typography>
              
              {selectedServices.map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <Typography variant="body" style={styles.serviceName}>
                    • {service.serviceName}
                  </Typography>
                </View>
              ))}
            </Card>

            <View style={styles.notesSection}>
              <Input
                label="Additional Notes (Optional)"
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional details about the service, parts replaced, or observations..."
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
              title="Back"
              variant="outline"
              onPress={handleBack}
              style={styles.button}
            />
            <Button
              title="Next"
              variant="primary"
              onPress={handleNext}
              style={styles.button}
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
  selectedServicesTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  serviceItem: {
    marginBottom: theme.spacing.sm,
  },
  serviceName: {
    color: theme.colors.text,
  },
  serviceCategory: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs / 2,
    marginLeft: theme.spacing.md,
  },
  notesSection: {
    marginBottom: theme.spacing.md,
  },
  editButton: {
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    marginBottom: theme.spacing.lg,
  },
  summaryTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    color: theme.colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  button: {
    flex: 1,
  },
});

export default ShopServiceStep2Screen;