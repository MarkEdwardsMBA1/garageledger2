// Photo picker component with camera/gallery options
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { theme } from '../../utils/theme';
import { Button } from './Button';
import { Loading } from './Loading';

export interface PhotoPickerProps {
  /** Current photo URI */
  photoUri?: string;
  
  /** Called when photo is selected */
  onPhotoSelected: (uri: string) => void;
  
  /** Called when photo is removed */
  onPhotoRemoved?: () => void;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Whether picker is disabled */
  disabled?: boolean;
  
  /** Image quality (0-1) */
  quality?: number;
  
  /** Maximum image dimensions */
  maxDimensions?: {
    width: number;
    height: number;
  };
  
  /** Test ID for testing */
  testID?: string;
}

/**
 * Reusable photo picker component
 * Supports camera capture and gallery selection with permissions handling
 */
export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  photoUri,
  onPhotoSelected,
  onPhotoRemoved,
  placeholder,
  disabled = false,
  quality = 0.7,
  maxDimensions = { width: 1024, height: 1024 },
  testID,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      // Request camera permissions
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== 'granted') {
        Alert.alert(
          t('permissions.camera.title', 'Camera Permission'),
          t('permissions.camera.message', 'We need camera access to take photos of your vehicles.'),
          [{ text: t('common.ok', 'OK') }]
        );
        return false;
      }

      // Request media library permissions
      const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libraryStatus.status !== 'granted') {
        Alert.alert(
          t('permissions.gallery.title', 'Photo Library Permission'),
          t('permissions.gallery.message', 'We need photo library access to select vehicle photos.'),
          [{ text: t('common.ok', 'OK') }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const showImagePicker = async () => {
    if (disabled || loading) return;

    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) return;

      if (Platform.OS === 'ios') {
        // Use ActionSheet on iOS
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: [
              t('common.cancel', 'Cancel'),
              t('photo.takePhoto', 'Take Photo'),
              t('photo.chooseFromLibrary', 'Choose from Library'),
              ...(photoUri ? [t('photo.removePhoto', 'Remove Photo')] : []),
            ],
            cancelButtonIndex: 0,
            destructiveButtonIndex: photoUri ? 3 : undefined,
          },
          (buttonIndex) => {
            try {
              switch (buttonIndex) {
                case 1:
                  takePhoto();
                  break;
                case 2:
                  pickFromLibrary();
                  break;
                case 3:
                  if (photoUri) {
                    removePhoto();
                  }
                  break;
              }
            } catch (error) {
              console.error('Error handling action sheet selection:', error);
            }
          }
        );
      } else {
      // Use Alert on Android
      const options = [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel' as const,
        },
        {
          text: t('photo.takePhoto', 'Take Photo'),
          onPress: takePhoto,
        },
        {
          text: t('photo.chooseFromLibrary', 'Choose from Library'),
          onPress: pickFromLibrary,
        },
      ];

      if (photoUri) {
        options.push({
          text: t('photo.removePhoto', 'Remove Photo'),
          style: 'cancel' as const,
          onPress: removePhoto,
        });
      }

      Alert.alert(
        t('photo.selectPhoto', 'Select Photo'),
        t('photo.selectPhotoMessage', 'Choose how you want to add a photo'),
        options
      );
      }
    } catch (error) {
      console.error('Error showing image picker:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('photo.pickerError', 'Failed to open photo picker. Please try again.')
      );
    }
  };

  const takePhoto = async () => {
    try {
      setLoading(true);
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality,
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('photo.cameraError', 'Failed to take photo. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  const pickFromLibrary = async () => {
    try {
      setLoading(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality,
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking from library:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('photo.libraryError', 'Failed to select photo. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = async () => {
    if (onPhotoRemoved) {
      onPhotoRemoved();
    }
  };

  if (loading) {
    return (
      <View style={styles.container} testID={testID}>
        <View style={styles.loadingContainer}>
          <Loading message={t('photo.processing', 'Processing photo...')} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <TouchableOpacity
        style={[
          styles.photoContainer,
          !photoUri && styles.emptyPhotoContainer,
          disabled && styles.disabledContainer,
        ]}
        onPress={showImagePicker}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>📸</Text>
            <Text style={styles.placeholderText}>
              {placeholder || t('photo.addPhoto', 'Add Photo')}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {!disabled && (
        <View style={styles.buttonContainer}>
          <Button
            title={photoUri ? t('photo.changePhoto', 'Change Photo') : t('photo.addPhoto', 'Add Photo')}
            variant="outline"
            size="sm"
            onPress={showImagePicker}
            style={styles.button}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  photoContainer: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  emptyPhotoContainer: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledContainer: {
    opacity: 0.6,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  placeholderText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    minWidth: 120,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.lg,
  },
});

export default PhotoPicker;