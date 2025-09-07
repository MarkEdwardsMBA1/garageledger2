// Edit Basic Service Info Screen - Card-based navigation approach
// Focused editing for date, mileage, cost, and shop information
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { useTranslation } from 'react-i18next';
import { theme } from '../utils/theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { MaintenanceLog } from '../types';
import { maintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';

// Navigation types
type EditBasicServiceInfoScreenNavigationProp = StackNavigationProp<any, 'EditBasicServiceInfo'>;
type EditBasicServiceInfoScreenRouteProp = RouteProp<any, 'EditBasicServiceInfo'>;

interface EditBasicServiceInfoScreenProps {
  navigation: EditBasicServiceInfoScreenNavigationProp;
  route: EditBasicServiceInfoScreenRouteProp;
}

interface BasicServiceFormData {
  date: Date;
  mileage: string;
  totalCost: string;
  shopName: string;
}

const EditBasicServiceInfoScreen: React.FC<EditBasicServiceInfoScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  
  // Get route params
  const { serviceLogId, vehicleId } = route.params as { 
    serviceLogId: string; 
    vehicleId: string; 
  };
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serviceLog, setServiceLog] = useState<MaintenanceLog | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<BasicServiceFormData>({
    date: new Date(),
    mileage: '',
    totalCost: '',
    shopName: '',
  });

  // Load service data on mount
  useEffect(() => {
    loadServiceData();
  }, [serviceLogId]);

  const loadServiceData = async () => {
    try {
      setLoading(true);
      const service = await maintenanceLogRepository.getById(serviceLogId);
      
      if (!service) {
        Alert.alert('Error', 'Service not found');
        navigation.goBack();
        return;
      }

      setServiceLog(service);
      setFormData({
        date: service.date,
        mileage: service.mileage.toString(),
        totalCost: service.totalCost?.toString() || '',
        shopName: service.shopName || '',
      });
    } catch (error) {
      console.error('Error loading service:', error);
      Alert.alert('Error', 'Failed to load service information');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.date) {
      errors.push('Date is required');
    }

    if (!formData.mileage.trim()) {
      errors.push('Mileage is required');
    } else {
      const mileage = parseInt(formData.mileage);
      if (isNaN(mileage) || mileage < 0) {
        errors.push('Mileage must be a valid positive number');
      }
    }

    if (formData.totalCost.trim()) {
      const cost = parseFloat(formData.totalCost);
      if (isNaN(cost) || cost < 0) {
        errors.push('Total cost must be a valid positive number');
      }
    }

    if (errors.length > 0) {
      Alert.alert(
        'Validation Error',
        errors.join('\n'),
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !serviceLog) return;

    setSaving(true);
    try {
      const updatedService: MaintenanceLog = {
        ...serviceLog,
        date: formData.date,
        mileage: parseInt(formData.mileage),
        totalCost: formData.totalCost.trim() ? parseFloat(formData.totalCost) : undefined,
        shopName: formData.shopName.trim() || undefined,
      };

      await maintenanceLogRepository.update(serviceLog.id, updatedService);
      
      Alert.alert(
        'Success',
        'Service information has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error saving service:', error);
      Alert.alert(
        'Error',
        'Failed to save service information. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const renderBasicInfoForm = () => (
    <Card variant="elevated" style={styles.section}>
      <Typography variant="subheading" style={styles.sectionTitle}>
        Basic Information
      </Typography>

      {/* Date Input */}
      <View style={styles.inputGroup}>
        <Typography variant="label" style={styles.inputLabel}>
          Service Date *
        </Typography>
        <Button
          title={formData.date.toLocaleDateString()}
          variant="outline"
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}
        />
      </View>

      {/* Mileage Input */}
      <View style={styles.inputGroup}>
        <Typography variant="label" style={styles.inputLabel}>
          Mileage *
        </Typography>
        <Input
          value={formData.mileage}
          onChangeText={(text) => setFormData(prev => ({ ...prev, mileage: text }))}
          placeholder="Current mileage"
          keyboardType="numeric"
          style={styles.input}
        />
      </View>

      {/* Total Cost Input */}
      <View style={styles.inputGroup}>
        <Typography variant="label" style={styles.inputLabel}>
          Total Cost
        </Typography>
        <Input
          value={formData.totalCost}
          onChangeText={(text) => setFormData(prev => ({ ...prev, totalCost: text }))}
          placeholder="0.00"
          keyboardType="decimal-pad"
          style={styles.input}
        />
      </View>

      {/* Shop Name (for shop services) */}
      {serviceLog?.serviceType === 'shop' && (
        <View style={styles.inputGroup}>
          <Typography variant="label" style={styles.inputLabel}>
            Shop Name
          </Typography>
          <Input
            value={formData.shopName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, shopName: text }))}
            placeholder="Service shop name"
            style={styles.input}
          />
        </View>
      )}
    </Card>
  );

  const renderActions = () => (
    <View style={styles.actions}>
      <Button
        title="Cancel"
        variant="outline"
        onPress={() => navigation.goBack()}
        style={styles.actionButton}
      />
      <Button
        title="Save Changes"
        variant="primary"
        onPress={handleSave}
        loading={saving}
        style={styles.actionButton}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message="Loading service information..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderBasicInfoForm()}
      </ScrollView>

      {renderActions()}

      {/* Date Picker - Navigation-based, no modal issues */}
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

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },

  // Sections
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },

  // Form inputs
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  input: {
    marginBottom: 0,
  },

  // Date button
  dateButton: {
    justifyContent: 'flex-start',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});

export default EditBasicServiceInfoScreen;