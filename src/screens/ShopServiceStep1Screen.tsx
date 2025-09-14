// Shop Service Step 1: Basic Information
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
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { SelectedService } from '../types';

interface ShopServiceStep1Data {
  date: Date;
  mileage: string;
  totalCost: string;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
}

interface ShopServiceStep1SerializableData {
  date: string; // ISO string for navigation
  mileage: string;
  totalCost: string;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
}

interface ShopServiceStep1Params {
  vehicleId: string;
  data?: ShopServiceStep1SerializableData;
  selectedServices?: SelectedService[];
  notes?: string;
}

export const ShopServiceStep1Screen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as ShopServiceStep1Params;
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState<ShopServiceStep1Data>({
    date: params?.data?.date ? new Date(params.data.date) : new Date(),
    mileage: params?.data?.mileage || '',
    totalCost: params?.data?.totalCost || '',
    shopName: params?.data?.shopName || '',
    shopAddress: params?.data?.shopAddress || '',
    shopPhone: params?.data?.shopPhone || '',
    shopEmail: params?.data?.shopEmail || '',
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

    if (!formData.totalCost || !formData.totalCost.trim()) {
      missingFields.push('• Total cost');
    } else if (isNaN(parseFloat(formData.totalCost))) {
      missingFields.push('• Total cost must be a valid amount');
    }

    if (!formData.shopName || !formData.shopName.trim()) {
      missingFields.push('• Shop name');
    }

    if (missingFields.length > 0) {
      Alert.alert(
        'Complete Required Fields',
        `Please fill in:\n${missingFields.join('\n')}`
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

    navigation.navigate('ShopServiceStep2', {
      vehicleId: params.vehicleId,
      step1Data: serializableData,
      selectedServices: params.selectedServices, // Pass along any existing selected services
      notes: params.notes, // Pass along notes
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.fieldLabel}>
            Service Date
          </Text>
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

        <View style={styles.formSection}>
          <Input
            label="Total Cost"
            value={formData.totalCost}
            onChangeText={(totalCost) => setFormData(prev => ({ ...prev, totalCost }))}
            placeholder="245.50"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formSection}>
          <Input
            label="Shop Name"
            value={formData.shopName}
            onChangeText={(shopName) => setFormData(prev => ({ ...prev, shopName }))}
            placeholder="Jiffy Lube, Local Auto Shop, etc."
          />
        </View>

        <View style={styles.formSection}>
          <Input
            label="Address (Optional)"
            value={formData.shopAddress}
            onChangeText={(shopAddress) => setFormData(prev => ({ ...prev, shopAddress }))}
            placeholder="123 Main Street, City, State"
          />
        </View>

        <View style={styles.formSection}>
          <Input
            label="Phone Number (Optional)"
            value={formData.shopPhone}
            onChangeText={(shopPhone) => setFormData(prev => ({ ...prev, shopPhone }))}
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formSection}>
          <Input
            label="Email (Optional)"
            value={formData.shopEmail}
            onChangeText={(shopEmail) => setFormData(prev => ({ ...prev, shopEmail }))}
            placeholder="service@shop.com"
            keyboardType="email-address"
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
  fieldLabel: {
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing.wide,
    fontSize: theme.typography.fontSize.base, // Match Input component label size
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

export default ShopServiceStep1Screen;