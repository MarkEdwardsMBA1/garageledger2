// Shop Service Step 4: Review & Summary Component
// Implements DIY Service review pattern for comprehensive data review

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Typography } from '../../common/Typography';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { theme } from '../../../utils/theme';
import { WizardStepProps } from '../../../types/wizard';
import { SelectedService, Vehicle } from '../../../types';
import { vehicleRepository } from '../../../repositories/VehicleRepository';

export interface ShopNotesData {
  // This step is now read-only review, no data collection needed
}

export const ShopNotesStep: React.FC<WizardStepProps<ShopNotesData>> = ({
  data = {},
  onDataChange,
  allWizardData = {},
}) => {
  const { t } = useTranslation();
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);

  // Extract data from all wizard steps  
  const basicInfo = allWizardData['basic-info'] || {};
  const services = allWizardData['services'] || {};
  const photos = allWizardData['photos'] || {};

  // Load vehicle data for display
  useEffect(() => {
    const loadVehicle = async () => {
      // Get vehicleId from wizard (we need to pass this somehow)
      // For now, we'll work with what we have in the wizard
      console.log('All wizard data:', allWizardData);
    };
    loadVehicle();
  }, [allWizardData]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Shop Service Summary Card - Comprehensive Review */}
      <Card variant="elevated" style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <Typography variant="body" style={styles.serviceName}>
            Shop Service Summary
          </Typography>
        </View>
        
        {/* Shop Information */}
        {basicInfo.shopName && (
          <View style={styles.serviceRow}>
            <Typography variant="bodySmall" style={styles.serviceLabel}>Shop:</Typography>
            <Typography variant="body" style={styles.serviceValue}>
              {basicInfo.shopName}
            </Typography>
          </View>
        )}

        {/* Date */}
        {basicInfo.date && (
          <View style={styles.serviceRow}>
            <Typography variant="bodySmall" style={styles.serviceLabel}>Date:</Typography>
            <Typography variant="body" style={styles.serviceValue}>
              {formatDate(new Date(basicInfo.date))}
            </Typography>
          </View>
        )}

        {/* Mileage */}
        {basicInfo.mileage && (
          <View style={styles.serviceRow}>
            <Typography variant="bodySmall" style={styles.serviceLabel}>Mileage:</Typography>
            <Typography variant="body" style={styles.serviceValue}>
              {parseInt(basicInfo.mileage.replace(/,/g, '')).toLocaleString()} miles
            </Typography>
          </View>
        )}

        {/* Total Cost */}
        {basicInfo.totalCost && (
          <View style={styles.serviceRow}>
            <Typography variant="bodySmall" style={styles.serviceLabel}>Total Cost:</Typography>
            <Typography variant="body" style={styles.serviceValue}>
              ${parseFloat(basicInfo.totalCost).toFixed(2)}
            </Typography>
          </View>
        )}

        {/* Services */}
        {services.selectedServices && services.selectedServices.length > 0 && (
          <View style={styles.serviceRow}>
            <Typography variant="bodySmall" style={styles.serviceLabel}>Services:</Typography>
            <View style={styles.servicesList}>
              {services.selectedServices.map((service: SelectedService, index: number) => (
                <View key={index} style={styles.serviceItem}>
                  <Typography variant="body" style={styles.serviceValue}>
                    • {service.serviceName}
                    {service.cost && (
                      <Typography variant="bodySmall" style={styles.serviceCost}>
                        {' '}(${parseFloat(service.cost).toFixed(2)})
                      </Typography>
                    )}
                  </Typography>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Photos */}
        {photos.photos && photos.photos.length > 0 && (
          <View style={styles.serviceRow}>
            <Typography variant="bodySmall" style={styles.serviceLabel}>Photos:</Typography>
            <Typography variant="body" style={styles.serviceValue}>
              {photos.photos.length} photo{photos.photos.length > 1 ? 's' : ''} attached
            </Typography>
          </View>
        )}

      </Card>

      {/* Service Notes Card */}
      <Card variant="elevated" style={styles.notesCard}>
        <View style={styles.notesHeader}>
          <Typography variant="body" style={styles.notesTitle}>
            Service Notes
          </Typography>
        </View>
        
        <Typography variant="body" style={services.notes && services.notes.trim() ? styles.notesContent : styles.notesEmpty}>
          {services.notes && services.notes.trim() ? services.notes.trim() : 'None'}
        </Typography>
      </Card>
    </View>
  );
};

// Validation function for this step (read-only review step)
export const validateShopNotes = (data: ShopNotesData): string[] | null => {
  // This is a read-only review step, always allow progression
  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Shop Service Card - matches DIY pattern
  serviceCard: {
    marginBottom: theme.spacing.lg,
  },
  serviceHeader: {
    marginBottom: theme.spacing.md,
  },
  serviceName: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.lg, // 18px, match InfoCard titles
    fontWeight: theme.typography.fontWeight.semibold,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs, // Reduced from sm to xs for tighter spacing
    minHeight: 20, // Reduced min height
  },
  serviceLabel: {
    color: theme.colors.textSecondary,
    width: 100,
    marginRight: theme.spacing.sm,
  },
  serviceValue: {
    color: theme.colors.text,
    flex: 1,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm, // Match the label font size
  },
  serviceCost: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.normal,
  },
  servicesList: {
    flex: 1,
  },
  serviceItem: {
    marginBottom: theme.spacing.xs,
  },
  // Service Notes Card
  notesCard: {
    marginBottom: theme.spacing.lg,
  },
  notesHeader: {
    marginBottom: theme.spacing.md,
  },
  notesTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.lg, // 18px, match InfoCard titles
    fontWeight: theme.typography.fontWeight.semibold,
  },
  notesContent: {
    color: theme.colors.text,
    lineHeight: 22,
  },
  notesEmpty: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
});

export default ShopNotesStep;