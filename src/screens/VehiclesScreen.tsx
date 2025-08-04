// Vehicles screen for managing user's vehicles
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../utils/theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/ErrorState';
import { Loading } from '../components/common/Loading';
import { Vehicle } from '../types';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { useAuth } from '../contexts/AuthContext';

interface VehiclesScreenProps {
  navigation: any;
}

/**
 * Vehicles screen - manage and view all vehicles
 * Currently shows empty state, will be populated with vehicle data later
 */
const VehiclesScreen: React.FC<VehiclesScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAddVehicle = () => {
    navigation.navigate('AddVehicle');
  };

  const loadVehicles = async () => {
    if (!user) {
      setError(t('auth.required', 'Authentication required'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Use secure repository that automatically filters by current user
      const vehiclesData = await vehicleRepository.getUserVehicles();
      console.log('Loaded vehicles for user:', user.uid, vehiclesData);
      setVehicles(vehiclesData);
    } catch (err: any) {
      console.error('Error loading vehicles:', err);
      
      // Handle authentication errors specifically
      if (err.message?.includes('Authentication required') || 
          err.message?.includes('auth') ||
          err.message?.includes('Unauthorized')) {
        setError(t('auth.required', 'Please sign in to view your vehicles'));
      } else if (err.message?.includes('network') || err.message?.includes('connection')) {
        setError(t('common.networkError', 'Network error. Please check your connection.'));
      } else {
        setError(err.message || t('vehicles.loadError', 'Failed to load vehicles'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load vehicles when screen mounts
    loadVehicles();
    
    // Refresh vehicles when navigating back from Add Vehicle
    const unsubscribe = navigation.addListener('focus', () => {
      loadVehicles();
    });

    return unsubscribe;
  }, [navigation]);

  const renderEmptyState = () => (
    <EmptyState
      title={t('vehicles.empty.title', 'No Vehicles Yet')}
      message={t('vehicles.empty.message', 'Add your first vehicle to get started with tracking maintenance.')}
      icon="🚗"
      primaryAction={{
        title: t('vehicles.addVehicle', 'Add Vehicle'),
        onPress: handleAddVehicle,
      }}
    />
  );

  const renderVehiclesList = () => (
    <ScrollView contentContainerStyle={styles.listContainer}>
      {vehicles.map((vehicle) => (
        <Card
          key={vehicle.id}
          title={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          subtitle={vehicle.mileage ? `${vehicle.mileage.toLocaleString()} ${t('vehicles.miles', 'miles')}` : t('vehicles.mileageNotSet', 'Mileage not set')}
          pressable
          onPress={() => {
            navigation.navigate('EditVehicle', { vehicleId: vehicle.id });
          }}
          rightContent={
            <Text style={styles.vehicleStatusReady}>
              📋 Ready to track
            </Text>
          }
        >
          {vehicle.photoUri ? (
            <Image 
              source={{ uri: vehicle.photoUri }} 
              style={styles.vehicleImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.vehicleImagePlaceholder}>
              <Text style={styles.vehicleImagePlaceholderText}>📸</Text>
              <Text style={styles.vehicleImagePlaceholderSubtext}>
                {t('vehicles.photo', 'Photo')}
              </Text>
            </View>
          )}
        </Card>
      ))}
    </ScrollView>
  );

  const renderError = () => (
    <EmptyState
      title={t('common.error', 'Error')}
      message={error || t('vehicles.loadError', 'Failed to load vehicles')}
      icon="⚠️"
      showRetry
      onRetry={loadVehicles}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message={t('vehicles.loading', 'Loading vehicles...')} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          {renderError()}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        {vehicles.length === 0 ? renderEmptyState() : renderVehiclesList()}
      </View>
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
  content: {
    flex: 1,
  },
  listContainer: {
    padding: theme.spacing.lg,
  },
  vehicleStatusReady: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  vehicleImage: {
    width: '100%',
    height: 120,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  vehicleImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleImagePlaceholderText: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  vehicleImagePlaceholderSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});

export default VehiclesScreen;