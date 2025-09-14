// Shop Service Step 1: Basic Information Component
// Extracted from ShopServiceStep1Screen for wizard consolidation

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Typography } from '../../common/Typography';
import { Input } from '../../common/Input';
import { DatePickerInput } from '../../common/DatePickerInput';
import { filterWholeNumbers, filterCurrency, filterPhoneNumber, filterEmail } from '../../../utils/inputFilters';
import { theme } from '../../../utils/theme';
import { WizardStepProps } from '../../../types/wizard';

export interface ShopBasicInfoData {
  date: Date;
  mileage: string;
  totalCost: string;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
}

export const ShopBasicInfoStep: React.FC<WizardStepProps<ShopBasicInfoData>> = ({
  data = {
    date: new Date(),
    mileage: '',
    totalCost: '',
    shopName: '',
    shopAddress: '',
    shopPhone: '',
    shopEmail: '',
  },
  onDataChange,
}) => {
  const { t } = useTranslation();

  const updateField = (field: keyof ShopBasicInfoData, value: any) => {
    onDataChange({ [field]: value });
  };

  // Filtered input handlers
  const handleMileageChange = (input: string) => {
    const filtered = filterWholeNumbers(input);
    updateField('mileage', filtered);
  };

  const handleCostChange = (input: string) => {
    const filtered = filterCurrency(input);
    updateField('totalCost', filtered);
  };

  const handlePhoneChange = (input: string) => {
    const filtered = filterPhoneNumber(input);
    updateField('shopPhone', filtered);
  };

  const handleEmailChange = (input: string) => {
    const filtered = filterEmail(input);
    updateField('shopEmail', filtered);
  };

  return (
    <View style={styles.container}>
      <View style={styles.formSection}>
        <DatePickerInput
          label="Service Date"
          value={data.date}
          onDateChange={(date) => updateField('date', date)}
          maximumDate={new Date()}
        />
      </View>

      <View style={styles.formSection}>
        <Input
          label="Odometer"
          value={data.mileage}
          onChangeText={handleMileageChange}
          placeholder="75000"
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.formSection}>
        <Input
          label="Total Cost"
          value={data.totalCost}
          onChangeText={handleCostChange}
          placeholder="245.50"
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.formSection}>
        <Input
          label="Shop Name"
          value={data.shopName}
          onChangeText={(value) => updateField('shopName', value)}
          placeholder="Jiffy Lube, Local Auto Shop, etc."
        />
      </View>

      <View style={styles.formSection}>
        <Input
          label="Address (Optional)"
          value={data.shopAddress}
          onChangeText={(value) => updateField('shopAddress', value)}
          placeholder="123 Main Street, City, State"
        />
      </View>

      <View style={styles.formSection}>
        <Input
          label="Phone Number (Optional)"
          value={data.shopPhone}
          onChangeText={handlePhoneChange}
          placeholder="(555) 123-4567"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formSection}>
        <Input
          label="Email (Optional)"
          value={data.shopEmail}
          onChangeText={handleEmailChange}
          placeholder="service@shop.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
    </View>
  );
};

// Validation function for this step
export const validateShopBasicInfo = (data: ShopBasicInfoData): string[] | null => {
  const errors = [];

  if (!data.mileage || !data.mileage.trim()) {
    errors.push('Enter the odometer reading at the time of service before continuing.');
  } else if (isNaN(parseInt(data.mileage.replace(/,/g, '')))) {
    errors.push('Odometer reading must be a valid number.');
  }

  if (!data.totalCost || !data.totalCost.trim()) {
    errors.push('Total cost is required');
  } else if (isNaN(parseFloat(data.totalCost))) {
    errors.push('Total cost must be a valid amount');
  }

  if (!data.shopName || !data.shopName.trim()) {
    errors.push('Shop name is required');
  }

  return errors.length > 0 ? errors : null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formSection: {
    marginBottom: theme.spacing.lg,
  },
});

export default ShopBasicInfoStep;