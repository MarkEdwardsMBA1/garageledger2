// DIY Service Step 1: Basic Information
import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Text,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { SelectedService, AdvancedServiceConfiguration } from '../types';
import { ServiceFormData } from '../components/forms/ServiceFormRouter';

interface DIYServiceStep1Data {
  date: Date;
  mileage: string;
}

interface DIYServiceStep1SerializableData {
  date: string; // ISO string for navigation
  mileage: string;
}

interface DIYServiceStep1Params {
  vehicleId: string;
  data?: DIYServiceStep1SerializableData;
  selectedServices?: SelectedService[];
  serviceConfigs?: { [key: string]: AdvancedServiceConfiguration };
  serviceFormData?: Record<string, ServiceFormData>;
  notes?: string;
}

export const DIYServiceStep1Screen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as DIYServiceStep1Params;
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState<DIYServiceStep1Data>({
    date: params?.data?.date ? new Date(params.data.date) : new Date(),
    mileage: params?.data?.mileage || '',
  });

  // Configure navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Basic Information',
      headerRight: () => (
        <Typography variant="label" style={styles.stepIndicator}>
          1 of 4
        </Typography>
      ),
    });
  }, [navigation]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }

    // Handle picker dismissal properly - don't close on scroll events
    if (Platform.OS === 'android') {
      // Android: picker closes automatically after selection/cancel
      setShowDatePicker(false);
    } else if (Platform.OS === 'ios' && event.type === 'set') {
      // iOS: only close when user taps "Done"
      setShowDatePicker(false);
    } else if (Platform.OS === 'ios' && event.type === 'dismissed') {
      // iOS: user tapped "Cancel"
      setShowDatePicker(false);
    }
    // On iOS, if event.type is undefined (scroll/interaction), keep picker open
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const validateForm = (): boolean => {
    const missingFields = [];

    if (!formData.mileage || !formData.mileage.trim()) {
      missingFields.push('• Odometer reading');
    } else if (isNaN(parseInt(formData.mileage))) {
      missingFields.push('• Odometer must be a valid number');
    }

    if (missingFields.length > 0) {
      Alert.alert(
        'Complete Required Fields',
        `Please fill in:\\n${missingFields.join('\\n')}`
      );
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateForm()) return;

    // Convert Date to ISO string for navigation serialization
    const serializableData = {
      ...formData,
      date: formData.date.toISOString(),
    };

    navigation.navigate('DIYServiceStep2', {
      vehicleId: params.vehicleId,
      step1Data: serializableData,
      selectedServices: params.selectedServices, // Pass along any existing selected services
      serviceConfigs: params.serviceConfigs, // Pass along service configs
      serviceFormData: params.serviceFormData, // Pass along parts/fluids data
      notes: params.notes, // Pass along notes
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Typography variant="label" style={{ marginBottom: theme.spacing.xs }}>
            Service Date
          </Typography>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Typography variant="bodyLarge" style={styles.dateValue}>
              {formatDate(formData.date)}
            </Typography>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={formData.date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.formSection}>
          <Input
            label="Odometer"
            value={formData.mileage}
            onChangeText={(mileage) => setFormData(prev => ({ ...prev, mileage }))}
            placeholder="75000"
            keyboardType="numeric"
          />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={() => navigation.navigate('VehicleHome', { vehicleId: params.vehicleId })}
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
  formSection: {
    marginBottom: theme.spacing.lg,
  },
  dateSelector: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    minHeight: 48,
    justifyContent: 'center',
  },
  dateValue: {
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

export default DIYServiceStep1Screen;