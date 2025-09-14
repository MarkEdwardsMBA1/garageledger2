// Service Detail Screen - Phase 3: Advanced Service Detail Views
// Individual service drill-down with comprehensive information display
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { Typography } from '../components/common/Typography';
import InfoCard from '../components/common/InfoCard';
import { Loading } from '../components/common/Loading';
import { Button } from '../components/common/Button';
import { theme } from '../utils/theme';
import { MaintenanceLog, SelectedService, Vehicle } from '../types';
import { maintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';
import { vehicleRepository } from '../repositories/VehicleRepository';

// Navigation types
type ServiceDetailScreenNavigationProp = StackNavigationProp<any, 'ServiceDetail'>;
type ServiceDetailScreenRouteProp = RouteProp<any, 'ServiceDetail'>;

interface ServiceDetailScreenProps {
  navigation: ServiceDetailScreenNavigationProp;
  route: ServiceDetailScreenRouteProp;
}

const ServiceDetailScreen: React.FC<ServiceDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  
  // Get serviceLogId from route params
  const { serviceLogId, vehicleId } = route.params as { serviceLogId: string; vehicleId: string };
  
  // State
  const [loading, setLoading] = useState(true);
  const [serviceLog, setServiceLog] = useState<MaintenanceLog | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  // Load data on mount and when screen comes back into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [serviceLogId, vehicleId])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      // Load service log and vehicle data in parallel
      const [logData, vehicleData] = await Promise.all([
        maintenanceLogRepository.getById(serviceLogId),
        vehicleRepository.getById(vehicleId),
      ]);

      setServiceLog(logData);
      setVehicle(vehicleData);
    } catch (error) {
      console.error('Error loading service detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfo = () => {
    if (!serviceLog || !vehicle) return null;

    return (
      <InfoCard
        title="Service Information"
        variant="elevated"
        onPress={() => navigation.navigate('EditBasicServiceInfo', { 
          serviceLogId: serviceLog.id,
          vehicleId: vehicle.id
        })}
      >
        <View style={styles.basicInfoContent}>
          <View style={styles.infoRow}>
            <Typography variant="body" style={styles.infoLabel}>
              Date:
            </Typography>
            <Typography variant="body" style={styles.infoValue}>
              {serviceLog.date.toLocaleDateString()}
            </Typography>
          </View>

          <View style={styles.infoRow}>
            <Typography variant="body" style={styles.infoLabel}>
              Mileage:
            </Typography>
            <Typography variant="body" style={styles.infoValue}>
              {serviceLog.mileage > 0 
                ? `${serviceLog.mileage.toLocaleString()} miles` 
                : 'Not recorded'}
            </Typography>
          </View>

          <View style={styles.infoRow}>
            <Typography variant="body" style={styles.infoLabel}>
              Service Type:
            </Typography>
            <Typography variant="body" style={styles.infoValue}>
              {serviceLog.serviceType === 'shop' ? 'Shop Service' : 'DIY Service'}
            </Typography>
          </View>

          {serviceLog.totalCost && serviceLog.totalCost > 0 && (
            <View style={styles.infoRow}>
              <Typography variant="body" style={styles.infoLabel}>
                Total Cost:
              </Typography>
              <Typography variant="body" style={[styles.infoValue, styles.costValue]}>
                ${serviceLog.totalCost.toFixed(2)}
              </Typography>
            </View>
          )}
        </View>
      </InfoCard>
    );
  };

  const renderServicesPerformed = () => {
    if (!serviceLog || !serviceLog.services || serviceLog.services.length === 0) return null;

    return (
      <InfoCard
        title="Services Performed"
        variant="elevated"
        onPress={() => navigation.navigate('EditServicesPerformed', { 
          serviceLogId: serviceLog.id,
          vehicleId: vehicle.id
        })}
      >
        <View style={styles.servicesContent}>
          {serviceLog.services.map((service: SelectedService, index: number) => (
            <View key={`${service.serviceId}-${index}`} style={styles.serviceItem}>
              <View style={styles.serviceHeader}>
                <Typography variant="body" style={styles.serviceName}>
                  {service.serviceName || 'Unknown Service'}
                </Typography>
                {service.cost && service.cost > 0 && (
                  <Typography variant="body" style={styles.serviceCost}>
                    ${Number(service.cost).toFixed(2)}
                  </Typography>
                )}
              </View>
              <Typography variant="bodySmall" style={styles.serviceCategory}>
                {service.categoryKey?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General'}
              </Typography>
            </View>
          ))}
        </View>
      </InfoCard>
    );
  };

  const renderShopDetails = () => {
    if (!serviceLog || serviceLog.serviceType !== 'shop') return null;

    // Only show if we have shop-specific information
    if (!serviceLog.shopName && !serviceLog.serviceDescription) return null;

    return (
      <InfoCard
        title="Shop Information"
        variant="elevated"
      >
        <View style={styles.shopDetailsContent}>
          {serviceLog.shopName && (
            <View style={styles.infoRow}>
              <Typography variant="body" style={styles.infoLabel}>
                Shop Name:
              </Typography>
              <Typography variant="body" style={styles.infoValue}>
                {serviceLog.shopName}
              </Typography>
            </View>
          )}

          {serviceLog.serviceDescription && (
            <View style={styles.descriptionContainer}>
              <Typography variant="body" style={styles.infoLabel}>
                Service Description:
              </Typography>
              <Typography variant="body" style={styles.descriptionText}>
                {serviceLog.serviceDescription}
              </Typography>
            </View>
          )}
        </View>
      </InfoCard>
    );
  };

  const renderPhotos = () => {
    if (!serviceLog || !serviceLog.photos || serviceLog.photos.length === 0) return null;

    return (
      <InfoCard
        title="Photos"
        variant="elevated"
      >
        <View style={styles.photosContent}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
            {serviceLog.photos.map((photoUri: string, index: number) => (
              <TouchableOpacity 
                key={`photo-${index}`} 
                style={styles.photoContainer}
                onPress={() => {
                  // Future: Open photo viewer/lightbox
                  console.log('Open photo viewer:', photoUri);
                }}
              >
                <Image source={{ uri: photoUri }} style={styles.photo} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Typography variant="caption" style={styles.photosHint}>
            Tap photos to view full size
          </Typography>
        </View>
      </InfoCard>
    );
  };

  const renderNotes = () => {
    if (!serviceLog || !serviceLog.notes || serviceLog.notes.trim() === '') return null;

    return (
      <InfoCard
        title="Notes"
        variant="elevated"
      >
        <Typography variant="body" style={styles.notesText}>
          {serviceLog.notes}
        </Typography>
      </InfoCard>
    );
  };

  const renderTags = () => {
    if (!serviceLog || !serviceLog.tags || serviceLog.tags.length === 0) return null;

    return (
      <InfoCard
        title="Tags"
        variant="elevated"
      >
        <View style={styles.tagsContainer}>
          {serviceLog.tags.map((tag: string, index: number) => (
            <View key={`tag-${index}`} style={styles.tag}>
              <Typography variant="caption" style={styles.tagText}>
                {tag}
              </Typography>
            </View>
          ))}
        </View>
      </InfoCard>
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (!serviceLog) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Typography variant="body" style={styles.errorText}>
            Service record not found
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with service title */}
      <View style={styles.header}>
        <Typography variant="heading" style={styles.headerTitle}>
          {serviceLog.title}
        </Typography>
        {vehicle && (
          <Typography variant="body" style={styles.headerSubtitle}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </Typography>
        )}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {renderBasicInfo()}
        {renderServicesPerformed()}
        {renderShopDetails()}
        {renderPhotos()}
        {renderNotes()}
        {renderTags()}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          title="Back to History"
          variant="outline"
          fullWidth
          onPress={() => navigation.navigate('MaintenanceHistory', { vehicleId })}
        />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },

  // Basic Info
  basicInfoContent: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: theme.colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
    flex: 2,
    textAlign: 'right',
  },
  costValue: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  // Services
  servicesContent: {
    gap: theme.spacing.sm,
  },
  serviceItem: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  serviceName: {
    flex: 1,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  serviceCost: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  serviceCategory: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },

  // Shop Details
  shopDetailsContent: {
    gap: theme.spacing.sm,
  },
  descriptionContainer: {
    gap: theme.spacing.xs,
  },
  descriptionText: {
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.relaxed,
  },

  // Photos
  photosContent: {
    gap: theme.spacing.sm,
  },
  photosScroll: {
    flexDirection: 'row',
  },
  photoContainer: {
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    shadowColor: theme.shadows.sm.shadowColor,
    shadowOffset: theme.shadows.sm.shadowOffset,
    shadowOpacity: theme.shadows.sm.shadowOpacity,
    shadowRadius: theme.shadows.sm.shadowRadius,
    elevation: theme.shadows.sm.elevation,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.md,
  },
  photosHint: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Notes
  notesText: {
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.relaxed,
  },

  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tag: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  tagText: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.medium,
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
  },

  // Bottom Actions
  bottomActions: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

export default ServiceDetailScreen;