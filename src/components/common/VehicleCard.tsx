// Reusable Vehicle Card component - standardized card template
// Based on VehiclesScreen design, supports image/no-image variants
import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Card } from './Card';
import { CarSilhouetteIcon, CameraIcon } from '../icons';
import { theme } from '../../utils/theme';
import { Vehicle } from '../../types';
import { Typography } from './Typography';

interface VehicleDisplayInfo {
  title: string;
  vehicleInfo: string | null;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress?: () => void;
  showImage?: boolean; // true = with image, false = text-only card
  additionalInfo?: React.ReactNode; // For VIN, notes, etc.
  style?: any;
}

/**
 * Standardized Vehicle Card Component
 * 
 * Usage:
 * - VehiclesScreen: <VehicleCard vehicle={vehicle} showImage={true} onPress={navigate} />
 * - VehicleHomeScreen: <VehicleCard vehicle={vehicle} showImage={true} additionalInfo={<VIN/Notes>} />
 * - Other screens: <VehicleCard vehicle={vehicle} showImage={false} />
 */
const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onPress,
  showImage = true,
  additionalInfo,
  style
}) => {
  
  // Vehicle display info logic (extracted from VehiclesScreen)
  const getVehicleDisplayInfo = (vehicle: Vehicle): VehicleDisplayInfo => {
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

  const displayInfo = getVehicleDisplayInfo(vehicle);

  // Subtitle content with mileage + additional info
  const renderSubtitle = () => (
    <View style={styles.subtitleContainer}>
      {displayInfo.vehicleInfo && (
        <Typography variant="bodySmall" style={styles.vehicleInfoText}>
          {displayInfo.vehicleInfo}
        </Typography>
      )}
      <Typography variant="bodySmall" style={styles.mileageText}>
        {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : 'Mileage not set'}
      </Typography>
      {additionalInfo}
    </View>
  );

  // Image content (when showImage = true)
  const renderImageContent = () => {
    if (!showImage) return null;

    return vehicle.photoUri ? (
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
    );
  };

  return (
    <Card
      variant="elevated"
      title={displayInfo.title}
      subtitle={renderSubtitle()}
      pressable={!!onPress}
      onPress={onPress}
      style={style}
    >
      {renderImageContent()}
    </Card>
  );
};

const styles = StyleSheet.create({
  vehicleCard: {
    // Additional styling if needed
  },
  
  // Subtitle styles (from VehiclesScreen)
  subtitleContainer: {
    gap: theme.spacing.xs,
  },
  vehicleInfoText: {
    color: theme.colors.textSecondary,
  },
  mileageText: {
    color: theme.colors.textSecondary,
  },

  // Image styles (from VehiclesScreen)
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
});

export default VehicleCard;