// Hierarchical Maintenance Category Picker Component
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../utils/theme';
import { Button } from './Button';
import { Typography } from './Typography';
import { Card } from './Card';
import { 
  MAINTENANCE_CATEGORIES,
  getCategoryKeys,
  getSubcategoryKeys,
  getCategoryName,
  getSubcategoryName,
  getComponents,
  MaintenanceComponents
} from '../../types/MaintenanceCategories';

interface MaintenanceCategoryPickerProps {
  /** Selected category key */
  selectedCategory?: string;
  /** Selected subcategory key */
  selectedSubcategory?: string;
  /** Called when category and subcategory are selected */
  onSelectionComplete: (categoryKey: string, subcategoryKey: string) => void;
  /** Called when selection is cancelled */
  onCancel?: () => void;
  /** Whether picker is visible */
  visible: boolean;
  /** Disable interaction */
  disabled?: boolean;
}

type PickerStep = 'category' | 'subcategory';

/**
 * Hierarchical maintenance category picker
 * Guides users through category → subcategory selection
 */
export const MaintenanceCategoryPicker: React.FC<MaintenanceCategoryPickerProps> = ({
  selectedCategory,
  selectedSubcategory,
  onSelectionComplete,
  onCancel,
  visible,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<PickerStep>('category');
  const [tempCategoryKey, setTempCategoryKey] = useState<string>(selectedCategory || '');

  const handleCategorySelect = (categoryKey: string) => {
    setTempCategoryKey(categoryKey);
    setCurrentStep('subcategory');
  };

  const handleSubcategorySelect = (subcategoryKey: string) => {
    onSelectionComplete(tempCategoryKey, subcategoryKey);
    // Reset state
    setCurrentStep('category');
    setTempCategoryKey('');
  };

  const handleBack = () => {
    if (currentStep === 'subcategory') {
      setCurrentStep('category');
    } else if (onCancel) {
      onCancel();
    }
  };

  const handleCancel = () => {
    setCurrentStep('category');
    setTempCategoryKey('');
    if (onCancel) {
      onCancel();
    }
  };

  const renderCategoryStep = () => {
    const categoryKeys = getCategoryKeys();

    return (
      <View style={styles.stepContainer}>
        <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
          {categoryKeys.map((categoryKey) => (
            <TouchableOpacity
              key={categoryKey}
              style={[
                styles.categoryOption,
                selectedCategory === categoryKey && styles.selectedOption,
              ]}
              onPress={() => handleCategorySelect(categoryKey)}
              disabled={disabled}
            >
              <Typography
                variant="bodyLarge"
                style={[
                  styles.optionText,
                  selectedCategory === categoryKey && styles.selectedOptionText,
                ]}
              >
                {getCategoryName(categoryKey)}
              </Typography>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderSubcategoryStep = () => {
    const subcategoryKeys = getSubcategoryKeys(tempCategoryKey);
    const categoryName = getCategoryName(tempCategoryKey);

    return (
      <View style={styles.stepContainer}>
        <View style={styles.breadcrumbContainer}>
          <TouchableOpacity onPress={() => setCurrentStep('category')}>
            <Typography variant="bodySmall" style={styles.breadcrumbLink}>
              {t('maintenance.categories', 'Categories')}
            </Typography>
          </TouchableOpacity>
          <Typography variant="bodySmall" style={styles.breadcrumbSeparator}> → </Typography>
          <Typography variant="bodySmall" style={styles.breadcrumbCurrent}>
            {categoryName}
          </Typography>
        </View>

        
        <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
          {subcategoryKeys.map((subcategoryKey) => {
            const subcategoryName = getSubcategoryName(tempCategoryKey, subcategoryKey);
            const components = getComponents(tempCategoryKey, subcategoryKey);
            
            return (
              <TouchableOpacity
                key={subcategoryKey}
                style={[
                  styles.subcategoryOption,
                  selectedCategory === tempCategoryKey && 
                  selectedSubcategory === subcategoryKey && 
                  styles.selectedOption,
                ]}
                onPress={() => handleSubcategorySelect(subcategoryKey)}
                disabled={disabled}
              >
                <View style={styles.subcategoryContent}>
                  <Typography
                    variant="bodyLarge"
                    style={[
                      styles.optionText,
                      selectedCategory === tempCategoryKey && 
                      selectedSubcategory === subcategoryKey && 
                      styles.selectedOptionText,
                    ]}
                  >
                    {subcategoryName}
                  </Typography>
                  
                  {components && (
                    <View style={styles.componentsPreview}>
                      {components.parts && components.parts.length > 0 && (
                        <Typography variant="caption" style={styles.componentType}>
                          Parts: {components.parts.slice(0, 2).join(', ')}
                          {components.parts.length > 2 && ` (+${components.parts.length - 2} more)`}
                        </Typography>
                      )}
                      {components.fluids && components.fluids.length > 0 && (
                        <Typography variant="caption" style={styles.componentType}>
                          Fluids: {components.fluids.slice(0, 2).join(', ')}
                          {components.fluids.length > 2 && ` (+${components.fluids.length - 2} more)`}
                        </Typography>
                      )}
                      {components.labor && components.labor.length > 0 && (
                        <Typography variant="caption" style={styles.componentType}>
                          Labor: {components.labor.slice(0, 2).join(', ')}
                          {components.labor.length > 2 && ` (+${components.labor.length - 2} more)`}
                        </Typography>
                      )}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Button
            title={currentStep === 'subcategory' ? t('common.back', 'Back') : t('common.cancel', 'Cancel')}
            variant="text"
            onPress={handleBack}
            style={styles.headerButton}
          />
          <Typography variant="title" style={styles.modalTitle}>
            {currentStep === 'category' 
              ? t('maintenance.selectCategory', 'Select Maintenance Category')
              : t('maintenance.selectSubcategory', 'Select Specific Maintenance')
            }
          </Typography>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.content}>
          {currentStep === 'category' ? renderCategoryStep() : renderSubcategoryStep()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerButton: {
    width: 80,
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  stepContainer: {
    flex: 1,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  breadcrumbLink: {
    color: theme.colors.primary,
  },
  breadcrumbSeparator: {
    color: theme.colors.textSecondary,
  },
  breadcrumbCurrent: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  stepTitle: {
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
  },
  optionsContainer: {
    flex: 1,
  },
  categoryOption: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  subcategoryOption: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  selectedOption: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight + '10',
  },
  optionText: {
    textAlign: 'center',
    color: theme.colors.text,
  },
  selectedOptionText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  subcategoryContent: {
    alignItems: 'center',
  },
  componentsPreview: {
    marginTop: theme.spacing.xs,
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  componentType: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.snug * theme.typography.fontSize.xs,
  },
});

export default MaintenanceCategoryPicker;