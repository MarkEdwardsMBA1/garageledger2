// Shop Service Step 3: Photos & Receipts Component
// Extracted and simplified from ShopServiceStep3Screen for wizard consolidation

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Typography } from '../../common/Typography';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { PhotoPicker } from '../../common/PhotoPicker';
import InfoCard from '../../common/InfoCard';
import { LockIcon } from '../../icons';
import { theme } from '../../../utils/theme';
import { WizardStepProps } from '../../../types/wizard';

export interface ShopPhotosData {
  photos: string[];
}

export const ShopPhotosStep: React.FC<WizardStepProps<ShopPhotosData>> = ({
  data = {
    photos: [],
  },
  onDataChange,
}) => {
  const { t } = useTranslation();
  const userTier = 'free'; // TODO: Get from user context
  const [localPhotos, setLocalPhotos] = useState<string[]>(data.photos || []);

  const updateField = (field: keyof ShopPhotosData, value: any) => {
    onDataChange({ [field]: value });
  };

  const handlePhotoSelected = (photoUri: string) => {
    const updatedPhotos = [...localPhotos, photoUri];
    setLocalPhotos(updatedPhotos);
    updateField('photos', updatedPhotos);
  };

  const handlePhotoRemoved = (photoIndex: number) => {
    const updatedPhotos = localPhotos.filter((_, index) => index !== photoIndex);
    setLocalPhotos(updatedPhotos);
    updateField('photos', updatedPhotos);
  };

  return (
    <View style={styles.container}>
      {userTier === 'free' ? (
        // Upgrade prompts for free users
        <>
          <View style={styles.upgradeSection}>
            <Card variant="outlined" style={styles.upgradeCard}>
              <View style={styles.upgradeTitleRow}>
                <Typography variant="bodyLarge" style={styles.upgradeTitle}>
                  Receipt & Photos
                </Typography>
                <LockIcon size={18} color={theme.colors.textSecondary} />
              </View>
              <Typography variant="body" style={styles.upgradeDescription}>
                Add receipts, before/after photos, and documentation to keep better maintenance records.
              </Typography>
            </Card>
          </View>
          
          <Button
            title="Upgrade to Pro"
            variant="primary"
            onPress={() => console.log('Show upgrade modal')}
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
          
          {localPhotos.length > 0 && (
            <Card variant="outlined" style={styles.photoListCard}>
              <Typography variant="bodyLarge" style={styles.photoListTitle}>
                Added Photos ({localPhotos.length})
              </Typography>
              <View style={styles.photoList}>
                {localPhotos.map((photoUri, index) => (
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
    </View>
  );
};

// Validation function for this step (optional step)
export const validateShopPhotos = (data: ShopPhotosData): string[] | null => {
  // This step is optional, so no validation errors
  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default ShopPhotosStep;