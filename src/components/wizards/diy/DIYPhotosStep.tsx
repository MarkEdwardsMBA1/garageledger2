// DIY Service Step 3: Photos & Documentation
// Using the same pattern as Shop Service for consistency
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../../common/Typography';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { PhotoPicker } from '../../common/PhotoPicker';
import { LockIcon } from '../../icons';
import { WizardStepProps, DIYPhotosData } from '../../../types/wizard';
import { theme } from '../../../utils/theme';

export const DIYPhotosStep: React.FC<WizardStepProps<DIYPhotosData>> = ({
  data,
  onDataChange,
}) => {
  const userTier = 'free' as 'free' | 'pro'; // TODO: Get from user context

  const handlePhotoSelected = (photoUri: string) => {
    const updatedPhotos = [...(data.photos || []), photoUri];
    onDataChange({ photos: updatedPhotos });
  };

  const handlePhotoRemoved = (photoIndex: number) => {
    const updatedPhotos = (data.photos || []).filter((_, index) => index !== photoIndex);
    onDataChange({ photos: updatedPhotos });
  };

  return (
    <View style={styles.container}>
      {userTier === 'free' ? (
        // Upgrade prompts for free users (matching Shop Service pattern)
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
                Add photos of your DIY work, parts used, and before/after documentation.
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
        // Full photo functionality for Pro users (matching Shop Service pattern)
        <View style={styles.photoSection}>
          <Card variant="outlined" style={styles.photoCard}>
            <Typography variant="bodyLarge" style={styles.photoTitle}>
              Add Photos
            </Typography>
            <Typography variant="body" style={styles.photoDescription}>
              Document your DIY work with before/after photos and parts used
            </Typography>
            
            <PhotoPicker
              onPhotoSelected={handlePhotoSelected}
              placeholder="Tap to add photo"
            />
          </Card>
          
          {(data.photos?.length || 0) > 0 && (
            <Card variant="outlined" style={styles.photoListCard}>
              <Typography variant="bodyLarge" style={styles.photoListTitle}>
                Added Photos ({data.photos?.length || 0})
              </Typography>
              <View style={styles.photoList}>
                {data.photos?.map((photoUri, index) => (
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
                )) || []}
              </View>
            </Card>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Upgrade prompts (matching Shop Service)
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
  
  // Photo section (Pro users, matching Shop Service)
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