// DIY Service Step 4: Review & Summary Component
// Aligned with Shop Service pattern for consistency

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Typography } from '../../common/Typography';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { theme } from '../../../utils/theme';
import { WizardStepProps, DIYReviewData } from '../../../types/wizard';
import { SelectedService, Vehicle } from '../../../types';
import { vehicleRepository } from '../../../repositories/VehicleRepository';

export interface DIYNotesData {
  // This step is now read-only review, no data collection needed
}

export const DIYReviewStep: React.FC<WizardStepProps<DIYReviewData>> = ({
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

  // Ensure review step data is initialized
  useEffect(() => {
    if (!data.totalCost && data.totalCost !== 0) {
      onDataChange({ totalCost: 0 });
    }
  }, [data.totalCost, onDataChange]);

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
      {/* DIY Service Summary Card - Comprehensive Review */}
      <Card variant="elevated" style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <Typography variant="body" style={styles.serviceName}>
            DIY Service Summary
          </Typography>
        </View>
        
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
export const validateDIYReview = (data: DIYReviewData): string[] | null => {
  // This is a read-only review step, always allow progression
  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // DIY Service Card - matches Shop pattern
  serviceCard: {
    marginBottom: theme.spacing.lg,
  },
  serviceHeader: {
    marginBottom: theme.spacing.sm, // Reduced from md (16px) to sm (12px)
  },
  serviceName: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.lg, // 18px, match InfoCard titles
    fontWeight: theme.typography.fontWeight.semibold,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6, // Further reduced for very tight spacing (xs = 8px, this is 6px)
    minHeight: 18, // Further reduced min height
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
    marginBottom: 4, // Reduced from xs (8px) to 4px for very tight service list
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