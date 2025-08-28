// Vehicles screen for managing user's vehicles
import React, { useState, useEffect, useRef } from 'react';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
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
import { AutomotiveErrorState } from '../components/common/AutomotiveErrorState';
import { Loading } from '../components/common/Loading';
import { CameraIcon, CarSilhouetteIcon, Car91Icon } from '../components/icons';
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
  const isFocused = useIsFocused();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs to prevent redundant API calls during Firebase Auth events
  const isLoadingRef = useRef(false);
  const lastLoadTimeRef = useRef<number>(0);

  const handleAddVehicle = () => {
    navigation.navigate('AddVehicle');
  };

  const forceRefresh = () => {
    // Allow refresh by resetting the deduplication timer
    lastLoadTimeRef.current = 0;
    isLoadingRef.current = false;
    loadVehicles();
  };

  const loadVehicles = async () => {
    // Double-check user is still authenticated before making any calls
    if (!user?.uid) {
      setVehicles([]);
      setError(t('auth.required', 'Please sign in to continue'));
      setLoading(false);
      return;
    }

    // Prevent redundant calls within 2 seconds (handles Firebase Auth persistence events)
    const now = Date.now();
    if (isLoadingRef.current || (now - lastLoadTimeRef.current < 2000)) {
      return;
    }

    isLoadingRef.current = true;
    lastLoadTimeRef.current = now;

    try {
      setLoading(true);
      setError(null);
      
      // Use secure repository that automatically filters by current user
      const vehiclesData = await vehicleRepository.getUserVehicles();
      console.log('Loaded vehicles for user:', user.uid, vehiclesData);
      setVehicles(vehiclesData);
    } catch (err: any) {
      // Silently handle auth errors during sign-out to avoid error flood
      if (err.message?.includes('Authentication required') || 
          err.message?.includes('auth') ||
          err.message?.includes('Unauthorized')) {
        // Don't log these during normal sign-out flow
        setVehicles([]);
        setError(t('auth.required', 'Please sign in to continue'));
        // Reset refs on auth errors
        lastLoadTimeRef.current = 0;
      } else if (err.message?.includes('network') || err.message?.includes('connection')) {
        console.error('Network error loading vehicles:', err);
        setError(t('common.networkError', 'Network error. Please check your connection.'));
      } else {
        console.error('Error loading vehicles:', err);
        setError(err.message || t('vehicles.loadError', 'Failed to load vehicles'));
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  // Load vehicles only when screen is focused and user is authenticated  
  useEffect(() => {
    if (isFocused) {
      if (user?.uid) {
        loadVehicles();
      } else {
        // Clear data and show auth error for unauthenticated users
        setVehicles([]);
        setError(t('auth.required', 'Please sign in to continue'));
        setLoading(false);
        // Reset refs when user signs out
        lastLoadTimeRef.current = 0;
        isLoadingRef.current = false;
      }
    }
  }, [isFocused, user?.uid]); // Run when screen focus or user ID changes

  const renderEmptyState = () => {
    console.log('🚗 VehiclesScreen: Rendering custom empty state with card layout');
    return (
      <View style={styles.emptyStateContainer}>
        <Card variant="elevated" style={styles.emptyStateCard}>
          <View style={styles.emptyStateContent}>
            {/* Vehicle image at the top */}
            <View style={styles.emptyStateImageContainer}>
              <Car91Icon 
                size={160} 
                color={theme.colors.text} // Tires - keep black
                bodyColor={theme.colors.secondary} // Car body - racing green
                windowColor={theme.colors.chrome} // Windows - chrome silver
                outlineColor={theme.colors.text} // Car outline - darker contrast
              />
            </View>
            
            {/* Text below the image */}
            <Text style={styles.emptyStateText}>
              This is where your list of vehicles will appear. Click Add Vehicle to get started.
            </Text>
          </View>
        </Card>
        
        {/* CTA button below the card */}
        <Button
          title="Add Vehicle"
          onPress={handleAddVehicle}
          variant="primary"
          style={styles.emptyStateCTAButton}
          testID="add-vehicle-empty-button"
        />
      </View>
    );
  };

  // Get vehicle title and subtitle for display
  const getVehicleDisplayInfo = (vehicle: Vehicle) => {
    const nickname = vehicle.nickname?.trim();
    const vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    
    if (nickname && nickname.length > 0) {
      return {
        title: nickname,
        vehicleInfo: vehicleInfo
      };
    } else {
      return {
        title: vehicleInfo,
        vehicleInfo: null
      };
    }
  };

  const renderVehiclesList = () => (
    <ScrollView contentContainerStyle={styles.listContainer}>
      {vehicles.map((vehicle) => {
        const displayInfo = getVehicleDisplayInfo(vehicle);
        return (
          <Card
            key={vehicle.id}
            variant="elevated"
            title={displayInfo.title}
            subtitle={
              <View style={styles.subtitleContainer}>
                {displayInfo.vehicleInfo && (
                  <Text style={styles.vehicleInfoText}>
                    {displayInfo.vehicleInfo}
                  </Text>
                )}
                <Text style={styles.mileageText}>
                  {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} ${t('vehicles.miles', 'miles')}` : t('vehicles.mileageNotSet', 'Mileage not set')}
                </Text>
              </View>
            }
            pressable
            onPress={() => {
              navigation.navigate('VehicleHome', { vehicleId: vehicle.id });
            }}
          >
          {vehicle.photoUri ? (
            <Image 
              source={{ uri: vehicle.photoUri }} 
              style={styles.vehicleImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.vehicleImagePlaceholder}>
              <View style={styles.carSilhouetteBackground}>
                <CarSilhouetteIcon size={80} color={theme.colors.textLight} />
              </View>
              <View style={styles.cameraOverlay}>
                <CameraIcon size={20} color={theme.colors.textSecondary} />
              </View>
            </View>
          )}
        </Card>
        );
      })}
      
      {/* Add Vehicle button at bottom of list */}
      <View style={styles.addVehicleButtonContainer}>
        <Button
          title={t('vehicles.addVehicle', 'Add Vehicle')}
          onPress={handleAddVehicle}
          variant="primary"
          style={styles.addVehicleButton}
          testID="add-vehicle-button"
        />
      </View>
    </ScrollView>
  );

  const renderError = () => {
    // Determine error type based on error message
    const isAuthError = error?.includes('Authentication') || 
                       error?.includes('sign in') || 
                       error?.includes('auth');
    const isNetworkError = error?.includes('network') || 
                          error?.includes('connection');
    
    const errorType = isAuthError ? 'unauthorized' : 
                     isNetworkError ? 'network' : 'error';
    
    return (
      <AutomotiveErrorState
        type={errorType}
        title={isAuthError ? undefined : t('common.error', 'System Error')}
        message={error || t('vehicles.loadError', 'Failed to load your vehicle data')}
        showRetry={!isAuthError} // Don't show retry for auth errors
        onRetry={isAuthError ? undefined : loadVehicles}
        primaryAction={isAuthError ? {
          title: t('auth.signIn', 'Sign In'),
          onPress: () => navigation.navigate('Login'),
          variant: 'primary'
        } : undefined}
        useCard={true}
      />
    );
  };

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
  addVehicleButtonContainer: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  addVehicleButton: {
    minHeight: 48,
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
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  carSilhouetteBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.25,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  subtitleContainer: {
    gap: theme.spacing.xs,
  },
  vehicleInfoText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.normal,
  },
  mileageText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
  },
  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xl * 2,
  },
  emptyStateCard: {
    width: '100%',
    maxWidth: 320,
    marginBottom: theme.spacing.xl,
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.lg,
    minHeight: 280,
  },
  emptyStateImageContainer: {
    marginBottom: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  emptyStateCTAButton: {
    width: '100%',
    maxWidth: 320,
    minHeight: 48,
    backgroundColor: theme.colors.primary, // Engine blue
  },
});

export default VehiclesScreen;