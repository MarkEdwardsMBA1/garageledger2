// Maintenance Category Selector - Button that opens hierarchical picker
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../utils/theme';
import { Typography } from './Typography';
import { MaintenanceCategoryPicker } from './MaintenanceCategoryPicker';
import { getCategoryName, getSubcategoryName } from '../../types/MaintenanceCategories';

interface MaintenanceCategorySelectorProps {
  /** Selected category key */
  categoryKey?: string;
  /** Selected subcategory key */
  subcategoryKey?: string;
  /** Called when selection changes */
  onSelectionChange: (categoryKey: string, subcategoryKey: string) => void;
  /** Label for the selector */
  label?: string;
  /** Whether selector is disabled */
  disabled?: boolean;
  /** Whether selection is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
}

/**
 * Maintenance Category Selector
 * Shows selected category/subcategory and opens hierarchical picker
 */
export const MaintenanceCategorySelector: React.FC<MaintenanceCategorySelectorProps> = ({
  categoryKey,
  subcategoryKey,
  onSelectionChange,
  label,
  disabled = false,
  required = false,
  error,
}) => {
  const { t } = useTranslation();
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleSelectionComplete = (selectedCategoryKey: string, selectedSubcategoryKey: string) => {
    onSelectionChange(selectedCategoryKey, selectedSubcategoryKey);
    setPickerVisible(false);
  };

  const getDisplayText = () => {
    if (!categoryKey || !subcategoryKey) {
      return t('maintenance.selectMaintenanceType', 'Select Maintenance Type');
    }
    
    const categoryName = getCategoryName(categoryKey);
    const subcategoryName = getSubcategoryName(categoryKey, subcategoryKey);
    
    return `${categoryName} → ${subcategoryName}`;
  };

  const hasSelection = categoryKey && subcategoryKey;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Typography variant="label" style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Typography>
        </View>
      )}
      
      <TouchableOpacity
        style={[
          styles.selector,
          hasSelection && styles.selectorWithSelection,
          disabled && styles.selectorDisabled,
          error && styles.selectorError,
        ]}
        onPress={() => setPickerVisible(true)}
        disabled={disabled}
      >
        <View style={styles.selectorContent}>
          <Typography
            variant="bodyLarge"
            style={[
              styles.selectorText,
              !hasSelection && styles.placeholderText,
            ]}
            numberOfLines={2}
          >
            {getDisplayText()}
          </Typography>
          
          <View style={styles.chevron}>
            <Typography variant="bodyLarge" style={styles.chevronText}>
              ▼
            </Typography>
          </View>
        </View>
        
        {hasSelection && (
          <View style={styles.selectionPreview}>
            <Typography variant="caption" style={styles.categoryPath}>
              {getCategoryName(categoryKey)}
            </Typography>
          </View>
        )}
      </TouchableOpacity>
      
      {error && (
        <Typography variant="caption" style={styles.errorText}>
          {error}
        </Typography>
      )}

      <MaintenanceCategoryPicker
        visible={pickerVisible}
        selectedCategory={categoryKey}
        selectedSubcategory={subcategoryKey}
        onSelectionComplete={handleSelectionComplete}
        onCancel={() => setPickerVisible(false)}
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  labelContainer: {
    marginBottom: theme.spacing.xs,
  },
  label: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  required: {
    color: theme.colors.error,
  },
  selector: {
    minHeight: 60,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  selectorWithSelection: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight + '05',
  },
  selectorDisabled: {
    opacity: 0.6,
    backgroundColor: theme.colors.borderLight,
  },
  selectorError: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.error + '05',
  },
  selectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  selectorText: {
    flex: 1,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
    lineHeight: theme.typography.lineHeight.snug * theme.typography.fontSize.base,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  chevron: {
    width: 20,
    alignItems: 'center',
  },
  chevronText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  selectionPreview: {
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  categoryPath: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  errorText: {
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default MaintenanceCategorySelector;