import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/common/Button';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { theme } from '../utils/theme';
import { Vehicle } from '../types';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { useAuth } from '../contexts/AuthContext';

interface FirstVehicleWizardProps {
  navigation: any;
}

interface FormData {
  make: string;
  model: string;
  year: string;
  nickname: string;
  mileage: string;
}

interface FormErrors {
  make?: string;
  model?: string;
  year?: string;
  nickname?: string;
  mileage?: string;
}

export const FirstVehicleWizardScreen: React.FC<FirstVehicleWizardProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    make: '',
    model: '',
    year: new Date().getFullYear().toString(), // Default to current year
    nickname: '',
    mileage: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields - only 3 for A1 activation
    if (!formData.make.trim()) {
      newErrors.make = t('validation.required', 'This field is required');
    }
    if (!formData.model.trim()) {
      newErrors.model = t('validation.required', 'This field is required');
    }
    if (!formData.year.trim()) {
      newErrors.year = t('validation.required', 'This field is required');
    }

    // Year validation
    if (formData.year.trim()) {
      const yearNum = parseInt(formData.year);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
        newErrors.year = t('validation.invalidYear', 'Please enter a valid year');
      }
    }

    // Optional mileage validation (if provided)
    if (formData.mileage.trim()) {
      const mileageNum = parseInt(formData.mileage.replace(/,/g, ''));
      if (isNaN(mileageNum) || mileageNum < 0) {
        newErrors.mileage = t('validation.invalidMileage', 'Please enter a valid mileage');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert(
        t('auth.required', 'Authentication Required'),
        t('auth.signInPrompt', 'Please sign in to add vehicles')
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Create vehicle data for A1 activation
      const vehicleData: Omit<Vehicle, 'id'> = {
        userId: user.uid,
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year),
        mileage: formData.mileage.trim() ? parseInt(formData.mileage.replace(/,/g, '')) : 0,
        ...(formData.nickname.trim() && { nickname: formData.nickname.trim() }),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('Creating first vehicle for A1 activation:', vehicleData);
      
      const savedVehicle = await vehicleRepository.create(vehicleData);
      console.log('First vehicle created successfully:', savedVehicle);
      
      // Navigate to success screen for A1 milestone
      navigation.navigate('FirstVehicleSuccess', { vehicle: savedVehicle });
      
    } catch (error: any) {
      console.error('Error creating first vehicle:', error);
      
      let errorMessage = t('vehicles.saveError', 'Failed to save vehicle');
      
      if (error.message?.includes('Authentication required') || 
          error.message?.includes('auth') ||
          error.message?.includes('Unauthorized')) {
        errorMessage = t('auth.required', 'Please sign in to add vehicles');
      } else if (error.message?.includes('network') || error.message?.includes('connection')) {
        errorMessage = t('common.networkError', 'Network error. Please check your connection.');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        t('common.error', 'Error'),
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Navigate to main app but show empty state with prominent "Add vehicle" CTA
    navigation.navigate('MainApp');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message={t('firstVehicle.saving', 'Creating your first vehicle...')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + theme.spacing.xl, theme.spacing['4xl']) }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="title" style={styles.title}>
            {t('firstVehicle.title', 'Add Your First Vehicle')}
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            {t('firstVehicle.subtitle', 'Let\'s get your garage started with the basics')}
          </Typography>
        </View>

        {/* Form Card */}
        <Card style={styles.formCard}>
          {/* Required Fields */}
          <View style={styles.section}>
            <Typography variant="heading" style={styles.sectionTitle}>
              {t('firstVehicle.basicInfo', 'Basic Information')}
            </Typography>
            
            <Input
              label={`${t('vehicles.make', 'Make')} *`}
              value={formData.make}
              onChangeText={(value) => handleInputChange('make', value)}
              placeholder={t('vehicles.makePlaceholder', 'e.g., Toyota, Honda, Ford')}
              error={errors.make}
              autoCapitalize="words"
            />

            <Input
              label={`${t('vehicles.model', 'Model')} *`}
              value={formData.model}
              onChangeText={(value) => handleInputChange('model', value)}
              placeholder={t('vehicles.modelPlaceholder', 'e.g., Camry, Civic, F-150')}
              error={errors.model}
              autoCapitalize="words"
            />

            <Input
              label={`${t('vehicles.year', 'Year')} *`}
              value={formData.year}
              onChangeText={(value) => handleInputChange('year', value)}
              placeholder={t('vehicles.yearPlaceholder', 'e.g., 2020')}
              keyboardType="numeric"
              maxLength={4}
              error={errors.year}
            />
          </View>

          {/* Optional Fields */}
          {showOptionalFields && (
            <View style={styles.section}>
              <Typography variant="heading" style={styles.sectionTitle}>
                {t('firstVehicle.optional', 'Optional Details')}
              </Typography>
              
              <Input
                label={t('vehicles.nickname', 'Nickname')}
                value={formData.nickname}
                onChangeText={(value) => handleInputChange('nickname', value)}
                placeholder={t('vehicles.nicknamePlaceholder', 'e.g., "Dad\'s truck", "The red one"')}
                helperText={t('firstVehicle.nicknameHelper', 'Give your vehicle a friendly name')}
              />

              <Input
                label={t('vehicles.currentMileage', 'Current Mileage')}
                value={formData.mileage}
                onChangeText={(value) => handleInputChange('mileage', value)}
                placeholder={t('vehicles.mileagePlaceholder', 'e.g., 50000')}
                keyboardType="numeric"
                error={errors.mileage}
                helperText={t('vehicles.mileageHelper', 'Optional - helps with maintenance scheduling')}
              />
            </View>
          )}

          {/* Show More Options */}
          {!showOptionalFields && (
            <Button
              title={t('firstVehicle.showMore', 'Show more options')}
              variant="text"
              onPress={() => setShowOptionalFields(true)}
              style={styles.showMoreButton}
            />
          )}
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title={t('firstVehicle.addVehicle', 'Add My Vehicle')}
            variant="primary"
            onPress={handleSave}
            disabled={loading}
            style={styles.primaryButton}
          />
          
          <Button
            title={t('firstVehicle.skip', 'Skip for now')}
            variant="text"
            onPress={handleSkip}
            style={styles.skipButton}
          />
        </View>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  formCard: {
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  showMoreButton: {
    alignSelf: 'center',
    marginTop: theme.spacing.md,
  },
  actions: {
    marginTop: theme.spacing.lg,
  },
  primaryButton: {
    marginBottom: theme.spacing.md,
  },
  skipButton: {
    alignSelf: 'center',
  },
});

export default FirstVehicleWizardScreen;