// Vehicle Home Screen - Streamlined dashboard with simplified InfoCard architecture
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/ErrorState';
import InfoCard from '../components/common/InfoCard';
import VehicleCard from '../components/common/VehicleCard';
import { Typography } from '../components/common/Typography';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { programRepository } from '../repositories/SecureProgramRepository';
import { Vehicle, MaintenanceProgram } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface VehicleHomeParams {
  vehicleId: string;
}

/**
 * Vehicle Home Screen - Simplified springboard dashboard
 * 3-card layout: Vehicle Summary, Quick Actions, and Maintenance Program
 * Focuses on actionable navigation rather than detailed display
 */
const VehicleHomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { isAuthenticated } = useAuth();
  const params = route.params as VehicleHomeParams;

  // State management (simplified)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [programs, setPrograms] = useState<MaintenanceProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load vehicle data (simplified)
  const loadVehicleData = async () => {
    if (!isAuthenticated || !params?.vehicleId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [vehicleData, vehiclePrograms] = await Promise.all([
        vehicleRepository.getById(params.vehicleId),
        programRepository.getProgramsByVehicle(params.vehicleId)
      ]);
      
      if (!vehicleData) {
        setError('Vehicle not found');
        return;
      }
      
      setVehicle(vehicleData);
      setPrograms(vehiclePrograms);
    } catch (err: any) {
      console.error('Error loading vehicle data:', err);
      setError(err.message || 'Failed to load vehicle data');
    } finally {
      setLoading(false);
    }
  };

  // Load data effects (preserved from original)
  useEffect(() => {
    loadVehicleData();
  }, [isAuthenticated, params?.vehicleId]);

  useFocusEffect(
    React.useCallback(() => {
      loadVehicleData();
    }, [isAuthenticated, params?.vehicleId])
  );

  // Card 1: Vehicle Header (no change - using VehicleCard)
  const renderVehicleHeader = () => {
    if (!vehicle) return null;

    const additionalInfo = (
      <View style={styles.vehicleDetails}>
        {vehicle.vin && (
          <Typography variant="bodySmall" style={styles.detailText}>
            VIN: {vehicle.vin}
          </Typography>
        )}
        {vehicle.notes && (
          <Typography variant="bodySmall" style={styles.detailText}>
            {vehicle.notes}
          </Typography>
        )}
      </View>
    );

    return (
      <VehicleCard
        vehicle={vehicle}
        showImage={true}
        onPress={() => navigation.navigate('EditVehicle', { vehicleId: vehicle.id })}
        additionalInfo={additionalInfo}
        style={styles.vehicleCard}
      />
    );
  };

  // Card 2: Quick Actions - Enhanced with View Maintenance History
  const renderQuickActions = () => (
    <InfoCard
      title="Quick Actions"
      style={styles.sectionCard}
    >
      <View style={styles.actionButtons}>
        <Button
          title="Log Maintenance"
          variant="primary"
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddMaintenanceLog', { vehicleId: params.vehicleId })}
        />
        <Button
          title="View Maintenance History"
          variant="outline"
          style={styles.actionButton}
          onPress={() => navigation.navigate('MaintenanceHistory', { vehicleId: params.vehicleId })}
        />
        <Button
          title="Manage Programs"
          variant="outline"
          style={styles.actionButton}
          onPress={() => {
            if (programs.length > 0) {
              navigation.navigate('Programs', {
                screen: 'EditProgram',
                params: { programId: programs[0].id }
              });
            } else {
              navigation.navigate('Programs', {
                screen: 'CreateProgramVehicleSelection',
                params: { preSelectedVehicleId: params.vehicleId }
              });
            }
          }}
        />
      </View>
    </InfoCard>
  );

  // Card 3: Maintenance Program (simplified)
  const renderMaintenanceProgram = () => (
    <InfoCard
      title="Maintenance Program"
      subtitle={programs.length > 0 ? 
        programs[0].name : 
        "Setup a maintenance program to track your vehicle's service schedule"
      }
      style={styles.sectionCard}
      onPress={() => {
        if (programs.length > 0) {
          navigation.navigate('Programs', {
            screen: 'EditProgram',
            params: { programId: programs[0].id }
          });
        } else {
          navigation.navigate('Programs', {
            screen: 'CreateProgramVehicleSelection',
            params: { preSelectedVehicleId: params.vehicleId }
          });
        }
      }}
    />
  );


  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message="Loading vehicle details..." />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <EmptyState
            title="Error"
            message={error}
            icon="⚠️"
            showRetry
            onRetry={loadVehicleData}
          />
        </View>
      </View>
    );
  }

  // Vehicle not found
  if (!vehicle) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <EmptyState
            title="Vehicle Not Found"
            message="This vehicle could not be found"
            icon="🚗"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderVehicleHeader()}
        {renderQuickActions()}
        {renderMaintenanceProgram()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },

  // Vehicle Card (preserved from original)
  vehicleCard: {
    marginBottom: theme.spacing.lg,
  },
  vehicleDetails: {
    gap: theme.spacing.xs,
  },
  detailText: {
    color: theme.colors.textSecondary,
  },

  // Section Cards (following ProgramsScreen pattern)
  sectionCard: {
    marginBottom: theme.spacing.lg,
  },

  // Quick Actions (preserved)
  actionButtons: {
    gap: theme.spacing.sm,
  },
  actionButton: {
    minHeight: 48,
  },
});

export default VehicleHomeScreen;