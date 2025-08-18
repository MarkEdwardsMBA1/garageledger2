// Create Program - Step 2: Program Details (Name & Description Only)
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ProgressBar } from '../components/common/ProgressBar';
import { Vehicle } from '../types';

interface RouteParams {
  selectedVehicleIds: string[];
  selectedVehicles: Vehicle[];
}

/**
 * Create Program - Step 2: Program Details Screen
 * Simple step for program name and description only
 * Step 3 will handle service selection
 */
const CreateProgramDetailsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { selectedVehicleIds, selectedVehicles } = route.params as RouteParams;
  
  // Program form state (Step 2: basic info only)
  const [programName, setProgramName] = useState('');
  const [programDescription, setProgramDescription] = useState('');

  // Auto-suggest program name based on selected vehicles
  useEffect(() => {
    updateProgramNameSuggestion();
  }, [selectedVehicles]);

  const updateProgramNameSuggestion = () => {
    if (selectedVehicles.length === 1) {
      const vehicle = selectedVehicles[0];
      const vehicleName = getVehicleDisplayName(vehicle);
      setProgramName(`${vehicleName} Maintenance`);
    } else if (selectedVehicles.length > 1) {
      setProgramName(t('programs.multiVehicleProgram', 'Multi-Vehicle Maintenance Program'));
    }
  };

  // Get display name for vehicle
  const getVehicleDisplayName = (vehicle: Vehicle): string => {
    return vehicle.notes?.trim() || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  // Form validation (Step 2 - basic info only)
  const validateBasicInfo = (): boolean => {
    if (!programName.trim()) {
      Alert.alert(t('validation.required', 'Required'), t('programs.nameRequired', 'Program name is required'));
      return false;
    }

    return true;
  };

  // Handle continue to Step 3 (Services)
  const handleContinue = () => {
    if (!validateBasicInfo()) return;
    
    // Navigate to Step 3 with program details
    navigation.navigate('CreateProgramServices', {
      selectedVehicleIds,
      selectedVehicles,
      programName: programName.trim(),
      programDescription: programDescription.trim(),
    });
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <ProgressBar currentStep={2} totalSteps={3} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Main form card */}
        <Card variant="elevated" style={styles.formCard}>
          {/* Program Name */}
          <View style={styles.section}>
            <Typography variant="heading" style={styles.sectionTitle}>
              {t('programs.programName', 'Program Name')}
            </Typography>
            
            <Input
              label={t('programs.programNameLabel', 'Give your maintenance program a name')}
              value={programName}
              onChangeText={setProgramName}
              placeholder={t('programs.programNamePlaceholder', 'e.g., 2020 Honda Civic Maintenance')}
              maxLength={100}
              style={styles.input}
            />
          </View>

          {/* Program Description (Optional) */}
          <View style={styles.section}>
            <Typography variant="heading" style={styles.sectionTitle}>
              {t('programs.programDescription', 'Description')} 
              <Typography variant="caption" style={styles.optionalLabel}>
                {' '}({t('common.optional', 'optional')})
              </Typography>
            </Typography>
            
            <Input
              label={t('programs.programDescriptionLabel', 'Describe what this program covers')}
              value={programDescription}
              onChangeText={setProgramDescription}
              placeholder={t('programs.programDescriptionPlaceholder', 'e.g., Comprehensive maintenance for daily commuter vehicle')}
              multiline={true}
              maxLength={500}
              style={styles.textArea}
              numberOfLines={3}
            />
          </View>
        </Card>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          title={t('common.continue', 'Continue')}
          onPress={handleContinue}
          disabled={!programName.trim()}
          style={styles.continueButton}
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
    padding: theme.spacing.lg,
    paddingBottom: 100, // Space for footer
  },
  
  formCard: {
    padding: theme.spacing.lg,
  },
  
  section: {
    marginBottom: theme.spacing.xl,
  },
  
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  
  optionalLabel: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  
  input: {
    marginTop: theme.spacing.sm,
  },
  
  textArea: {
    marginTop: theme.spacing.sm,
    minHeight: 80,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  
  continueButton: {
    width: '100%',
  },
});

export default CreateProgramDetailsScreen;