// Edit Services Performed Screen - Card-based navigation approach
// Focused editing for service selection/deselection and DIY details
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { useTranslation } from 'react-i18next';
import { theme } from '../utils/theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import MaintenanceCategoryPicker from '../components/common/MaintenanceCategoryPicker';
import { MaintenanceLog, SelectedService } from '../types';
import { maintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';

// Navigation types
type EditServicesPerformedScreenNavigationProp = StackNavigationProp<any, 'EditServicesPerformed'>;
type EditServicesPerformedScreenRouteProp = RouteProp<any, 'EditServicesPerformed'>;

interface EditServicesPerformedScreenProps {
  navigation: EditServicesPerformedScreenNavigationProp;
  route: EditServicesPerformedScreenRouteProp;
}

const EditServicesPerformedScreen: React.FC<EditServicesPerformedScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  
  // Get route params
  const { serviceLogId, vehicleId } = route.params as { 
    serviceLogId: string; 
    vehicleId: string; 
  };
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serviceLog, setServiceLog] = useState<MaintenanceLog | null>(null);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  // Load service data on mount
  useEffect(() => {
    loadServiceData();
  }, [serviceLogId]);

  const loadServiceData = async () => {
    try {
      setLoading(true);
      const service = await maintenanceLogRepository.getById(serviceLogId);
      
      if (!service) {
        Alert.alert('Error', 'Service not found');
        navigation.goBack();
        return;
      }

      setServiceLog(service);
      setSelectedServices(service.services || []);
    } catch (error) {
      console.error('Error loading service:', error);
      Alert.alert('Error', 'Failed to load service information');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleServicesChange = (services: SelectedService[]) => {
    setSelectedServices(services);
    setShowServicePicker(false);
  };

  const handleSave = async () => {
    if (!serviceLog) return;

    if (selectedServices.length === 0) {
      Alert.alert(
        'Validation Error', 
        'At least one service must be selected.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSaving(true);
    try {
      const updatedService: MaintenanceLog = {
        ...serviceLog,
        services: selectedServices,
      };

      await maintenanceLogRepository.update(serviceLog.id, updatedService);
      
      Alert.alert(
        'Success',
        'Services have been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error saving service:', error);
      Alert.alert(
        'Error',
        'Failed to save service changes. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  const renderServiceTypeInfo = () => (
    <Card variant="outlined" style={styles.infoCard}>
      <View style={styles.serviceTypeInfo}>
        <Typography variant="body" style={styles.serviceTypeLabel}>
          Service Type: 
        </Typography>
        <Typography variant="body" style={styles.serviceTypeValue}>
          {serviceLog?.serviceType === 'shop' ? 'Shop Service' : 'DIY Service'}
        </Typography>
      </View>
      <Typography variant="caption" style={styles.serviceTypeNote}>
        Service type cannot be changed when editing.
      </Typography>
    </Card>
  );

  const renderSelectedServices = () => (
    <Card variant="elevated" style={styles.section}>
      <Typography variant="subheading" style={styles.sectionTitle}>
        Services Performed
      </Typography>
      
      {/* Selected Services Display */}
      {selectedServices.length > 0 ? (
        <View style={styles.selectedServicesContainer}>
          {selectedServices.map((service, index) => (
            <View key={`${service.categoryKey}-${service.subcategoryKey}-${index}`} style={styles.selectedService}>
              <Typography variant="body" style={styles.selectedServiceText}>
                {service.serviceName}
              </Typography>
              {service.cost && service.cost > 0 && (
                <Typography variant="caption" style={styles.selectedServiceCost}>
                  ${service.cost.toFixed(2)}
                </Typography>
              )}
            </View>
          ))}
        </View>
      ) : (
        <Typography variant="body" style={styles.noServicesText}>
          No services selected
        </Typography>
      )}

      {/* Edit Services Button */}
      <Button
        title={serviceLog?.serviceType === 'shop' ? 'Select Shop Services' : 'Configure DIY Services'}
        variant="outline"
        onPress={() => setShowServicePicker(true)}
        style={styles.editServicesButton}
      />
    </Card>
  );

  const renderActions = () => (
    <View style={styles.actions}>
      <Button
        title="Cancel"
        variant="outline"
        onPress={() => navigation.goBack()}
        style={styles.actionButton}
      />
      <Button
        title="Save Changes"
        variant="primary"
        onPress={handleSave}
        loading={saving}
        style={styles.actionButton}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message="Loading service information..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderServiceTypeInfo()}
        {renderSelectedServices()}
      </ScrollView>

      {renderActions()}

      {/* Service Picker */}
      <MaintenanceCategoryPicker
        visible={showServicePicker}
        selectedServices={selectedServices}
        onSelectionComplete={handleServicesChange}
        onCancel={() => setShowServicePicker(false)}
        allowMultiple={true}
        serviceType={serviceLog?.serviceType || 'shop'}
        enableConfiguration={serviceLog?.serviceType === 'diy'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },

  // Info card
  infoCard: {
    marginBottom: theme.spacing.lg,
  },
  serviceTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  serviceTypeLabel: {
    color: theme.colors.textSecondary,
  },
  serviceTypeValue: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.xs,
  },
  serviceTypeNote: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },

  // Sections
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },

  // Selected Services Display
  selectedServicesContainer: {
    marginBottom: theme.spacing.md,
  },
  selectedService: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedServiceText: {
    color: theme.colors.text,
    flex: 1,
  },
  selectedServiceCost: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  noServicesText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
  editServicesButton: {
    marginTop: theme.spacing.sm,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});

export default EditServicesPerformedScreen;