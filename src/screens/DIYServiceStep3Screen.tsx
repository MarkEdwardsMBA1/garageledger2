// DIY Service Step 3: Photos & Receipts
import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PhotoPicker } from '../components/common/PhotoPicker';
import { LockIcon } from '../components/icons';
import { SelectedService, AdvancedServiceConfiguration } from '../types';

interface DIYServiceStep1SerializableData {
  date: string; // ISO string from navigation
  mileage: string;
}

interface DIYServiceStep3Params {
  vehicleId: string;
  step1Data: DIYServiceStep1SerializableData;
  selectedServices: SelectedService[];
  serviceConfigs?: { [key: string]: AdvancedServiceConfiguration };
  photos?: string[];
  notes?: string;
}

export const DIYServiceStep3Screen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as DIYServiceStep3Params;
  const userTier = 'free'; // TODO: Get from user context
  
  const [photos, setPhotos] = useState<string[]>(params?.photos || []);

  // Configure navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Receipt and Photos',
      headerRight: () => (
        <Typography variant="label" style={styles.stepIndicator}>
          3 of 4
        </Typography>
      ),
    });
  }, [navigation]);

  const handlePhotoSelected = (photoUri: string) => {
    setPhotos(prev => [...prev, photoUri]);
  };

  const handlePhotoRemoved = (photoIndex: number) => {
    setPhotos(prev => prev.filter((_, index) => index !== photoIndex));
  };

  const handleNext = () => {
    navigation.navigate('DIYServiceStep4', {
      vehicleId: params.vehicleId,
      step1Data: params.step1Data,
      selectedServices: params.selectedServices,
      serviceConfigs: params.serviceConfigs,
      photos: photos,
      notes: params.notes,
    });
  };

  const handleBack = () => {
    navigation.navigate('DIYServiceStep2', {
      vehicleId: params.vehicleId,
      step1Data: params.step1Data,
      selectedServices: params.selectedServices,
      serviceConfigs: params.serviceConfigs,
      notes: params.notes,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {userTier === 'free' ? (
          // Upgrade prompts for free users
          <>
            <View style={styles.upgradeSection}>
              <Card variant="outlined" style={styles.upgradeCard}>
                <View style={styles.upgradeTitleRow}>
                  <Typography variant="bodyLarge" style={styles.upgradeTitle}>
                    Upload Receipt
                  </Typography>
                  <LockIcon size={18} color={theme.colors.textSecondary} />
                </View>
                <Typography variant="body" style={styles.upgradeDescription}>
                  Add your receipt or work order to keep better maintenance records.
                </Typography>
              </Card>

              <Card variant="outlined" style={styles.upgradeCard}>
                <View style={styles.upgradeTitleRow}>
                  <Typography variant="bodyLarge" style={styles.upgradeTitle}>
                    Photos
                  </Typography>
                  <LockIcon size={18} color={theme.colors.textSecondary} />
                </View>
                <Typography variant="body" style={styles.upgradeDescription}>
                  Add before/after shots and keep better maintenance records.
                </Typography>
              </Card>

            </View>
            
            <Button
              title="Upgrade"
              variant="primary"
              onPress={() => {/* TODO: Navigate to upgrade screen */}}
              style={styles.bottomUpgradeButton}
            />
          </>
        ) : (
          // Full photo functionality for Pro users
          <View style={styles.photoSection}>
            <Card variant="outlined" style={styles.photoCard}>
              <Typography variant="bodyLarge" style={styles.photoTitle}>
                Add Photos
              </Typography>
              <Typography variant="body" style={styles.photoDescription}>
                Upload receipts, before/after photos, or documentation
              </Typography>
              
              <PhotoPicker
                onPhotoSelected={handlePhotoSelected}
                placeholder="Tap to add photo"
              />
            </Card>
            
            {photos.length > 0 && (
              <Card variant="outlined" style={styles.photoListCard}>
                <Typography variant="bodyLarge" style={styles.photoListTitle}>
                  Added Photos ({photos.length})
                </Typography>
                <View style={styles.photoList}>
                  {photos.map((photoUri, index) => (
                    <View key={index} style={styles.photoItem}>
                      <Typography variant="bodySmall" style={styles.photoName}>
                        Photo {index + 1}
                      </Typography>
                      <Button
                        title="Remove"
                        variant="text"
                        size="sm"
                        onPress={() => handlePhotoRemoved(index)}
                      />
                    </View>
                  ))}
                </View>
              </Card>
            )}
          </View>
        )}

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  stepIndicator: {
    color: theme.colors.primary,
    marginRight: theme.spacing.md,
  },
  // Upgrade prompts
  upgradeSection: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  upgradeCard: {
    padding: theme.spacing.lg,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  upgradeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  upgradeTitle: {
    color: theme.colors.text,
  },
  upgradeDescription: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  bottomUpgradeButton: {
    marginTop: theme.spacing.md,
    marginHorizontal: 0, // Full width like cards
  },
  
  // Photo section (Pro users)
  photoSection: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  photoCard: {
    padding: theme.spacing.lg,
  },
  photoTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  photoDescription: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  photoListCard: {
    padding: theme.spacing.md,
  },
  photoListTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  photoList: {
    gap: theme.spacing.sm,
  },
  photoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.sm,
  },
  photoName: {
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

export default DIYServiceStep3Screen;