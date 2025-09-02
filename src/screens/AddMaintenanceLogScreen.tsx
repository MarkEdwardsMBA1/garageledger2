// Add Maintenance Log screen - Create new maintenance record
import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { PhotoPicker } from '../components/common/PhotoPicker';
import { Loading } from '../components/common/Loading';
import { Typography } from '../components/common/Typography';
import { MaintenanceCategorySelector } from '../components/common/MaintenanceCategorySelector';
import { MaintenanceCategoryPicker } from '../components/common/MaintenanceCategoryPicker';
import { getSubcategoryName } from '../types/MaintenanceCategories';
import { Vehicle, MaintenanceLog, SelectedService, AdvancedServiceConfiguration } from '../types';
import { maintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { useAuth } from '../contexts/AuthContext';

interface AddMaintenanceLogParams {
  vehicleId?: string;
}

interface MaintenanceLogFormData {
  title: string;
  date: Date;
  mileage: string;
  services: SelectedService[]; // Multiple services per log entry
  totalCost: string;
  notes: string;
  tags: string;
  photos: string[];
  // Service type for detailed tracking
  serviceType: 'shop' | 'diy' | null;
  // Shop service specific fields
  shopName: string;
  serviceDescription: string;
  // Detailed parts tracking (for DIY services)
  parts: MaintenancePartFormData[];
  fluids: MaintenanceFluidFormData[];
}

interface MaintenancePartFormData {
  name: string;
  partNumber: string;
  brand: string;
  quantity: string;
  unitCost: string;
  supplier: string;
}

interface MaintenanceFluidFormData {
  name: string;
  type: string;
  brand: string;
  viscosity: string;
  capacity: string;
  unit: string;
  cost: string;
}

interface MaintenancePartFormData {
  name: string;
  partNumber: string;
  brand: string;
  quantity: string;
  unitCost: string;
  supplier: string;
}

// Categories now handled by MaintenanceCategorySelector component

/**
 * Add Maintenance Log screen
 * Allows users to create detailed maintenance records with photos
 */
const AddMaintenanceLogScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { isAuthenticated } = useAuth();
  const params = route.params as AddMaintenanceLogParams;

  const [loading, setLoading] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAdvancedParts, setShowAdvancedParts] = useState(false);
  const [serviceConfigurations, setServiceConfigurations] = useState<Map<string, AdvancedServiceConfiguration>>(new Map());
  const [showDIYPicker, setShowDIYPicker] = useState(false);
  const [showShopPicker, setShowShopPicker] = useState(false);
  const vehicleId = params?.vehicleId;
  const [formData, setFormData] = useState<MaintenanceLogFormData>({
    title: '',
    date: new Date(),
    mileage: '',
    services: [],
    totalCost: '',
    notes: '',
    tags: '',
    photos: [],
    serviceType: null as 'shop' | 'diy' | null,
    shopName: '',
    serviceDescription: '',
    parts: [],
    fluids: [],
  });

  // Configure navigation header with back button
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Log Maintenance',
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.surface} />
          <Text style={{ color: theme.colors.surface, fontSize: 17, marginLeft: 5 }}>Back</Text>
        </TouchableOpacity>
      ),
      headerBackTitle: 'Back',
    });
  }, [navigation, vehicleId]);

  // Load the specific vehicle for this maintenance log
  useEffect(() => {
    loadVehicle();
  }, [vehicleId, isAuthenticated]);

  const loadVehicle = async () => {
    if (!isAuthenticated || !vehicleId) {
      // No vehicle specified - redirect to vehicle selection
      Alert.alert(
        t('maintenance.noVehicle', 'No Vehicle Selected'),
        t('maintenance.selectVehicleFirst', 'Please select a vehicle first to log maintenance.'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
      return;
    }
    
    try {
      const vehicle = await vehicleRepository.getById(vehicleId);
      if (vehicle) {
        setCurrentVehicle(vehicle);
      } else {
        throw new Error('Vehicle not found');
      }
    } catch (error) {
      console.error('Error loading vehicle:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('vehicles.loadError', 'Failed to load vehicle information.'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Calculate total cost
      let totalCost: number | undefined;
      if (formData.serviceType === 'shop') {
        totalCost = formData.totalCost && parseFloat(formData.totalCost) > 0 ? parseFloat(formData.totalCost) : undefined;
      } else if (formData.serviceType === 'diy') {
        // For now, use the totalCost field directly for DIY
        // TODO: Re-implement detailed parts/fluids cost calculation for multiple services
        totalCost = formData.totalCost && parseFloat(formData.totalCost) > 0 ? parseFloat(formData.totalCost) : undefined;
      }

      // Prepare title and notes based on service type
      let title: string;
      let notes: string | undefined;
      
      if (formData.serviceType === 'shop') {
        title = formData.serviceDescription.trim() || (
          formData.services.length === 1 
            ? formData.services[0].serviceName 
            : `${formData.services.length} Services`
        );
        // Combine shop name and additional notes
        const shopInfo = formData.shopName.trim() ? `Shop: ${formData.shopName.trim()}` : '';
        const additionalNotes = formData.notes.trim();
        notes = [shopInfo, additionalNotes].filter(n => n).join('\n') || undefined;
      } else {
        title = formData.title.trim() || (
          formData.services.length === 1 
            ? formData.services[0].serviceName 
            : formData.services.length > 1 
              ? `${formData.services.length} Services`
              : 'Maintenance'
        );
        notes = formData.notes.trim() || undefined;
      }

      // Parse form data - handle optional fields properly for Firestore
      const maintenanceData: Omit<MaintenanceLog, 'id'> = {
        vehicleId: vehicleId!,
        title,
        date: formData.date,
        mileage: parseInt(formData.mileage) || 0,
        services: formData.services, // Store services array
        totalCost,
        notes,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        photos: formData.photos,
        createdAt: new Date(),
        serviceType: formData.serviceType,
        shopName: formData.shopName.trim() || undefined,
        serviceDescription: formData.serviceDescription.trim() || undefined,
      };

      // Remove undefined fields to prevent Firestore errors
      Object.keys(maintenanceData).forEach(key => {
        if (maintenanceData[key as keyof typeof maintenanceData] === undefined) {
          delete maintenanceData[key as keyof typeof maintenanceData];
        }
      });

      const savedLog = await maintenanceLogRepository.create(maintenanceData);
      
      // Quick Multi-Entry Flow: Offer to log another service
      Alert.alert(
        t('common.success', 'Success'),
        t('maintenance.logMaintenance', 'Maintenance logged successfully'),
        [
          {
            text: t('maintenance.logAnother', 'Log Another Service'),
            onPress: () => {
              // Reset form but keep date and mileage for quick entry
              setFormData(prev => ({
                title: '',
                date: prev.date, // Keep same date
                mileage: prev.mileage, // Keep same mileage
                services: [],
                totalCost: '',
                notes: '',
                tags: '',
                photos: [],
                serviceType: 'diy',
                shopName: '',
                serviceDescription: '',
                parts: [],
                fluids: [],
              }));
            },
          },
          {
            text: t('common.done', 'Done'),
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error saving maintenance log:', error);
      Alert.alert(
        t('common.error', 'Error'),
        error.message || t('maintenance.saveError', 'Failed to save maintenance log')
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!vehicleId || !currentVehicle) {
      Alert.alert(
        t('maintenance.logMaintenance', 'Log Maintenance'),
        t('maintenance.noVehicle', 'No vehicle selected for maintenance logging.')
      );
      return false;
    }

    // Collect missing required fields for friendly batch validation
    const missingFields = [];
    const invalidFields = [];

    // Check required fields
    if (!formData.mileage || !formData.mileage.trim()) {
      missingFields.push('• Current mileage');
    } else if (isNaN(parseInt(formData.mileage))) {
      invalidFields.push('• Mileage must be a valid number (e.g., 75000)');
    }

    if (!formData.date) {
      missingFields.push('• Service date');
    }

    if (!formData.services || formData.services.length === 0) {
      missingFields.push('• At least one maintenance service');
    }

    // Check shop service requirements
    if (formData.serviceType === 'shop') {
      if (!formData.serviceDescription || !formData.serviceDescription.trim()) {
        missingFields.push('• Service description (what was performed)');
      }
      if (formData.totalCost && isNaN(parseFloat(formData.totalCost))) {
        invalidFields.push('• Total cost must be a valid amount (e.g., 45.99) or leave blank');
      }
    }

    // Validate DIY parts and fluids if detailed tracking is enabled (disabled for now)
    if (false && formData.serviceType === 'diy') {
      // Validate parts
      formData.parts.forEach((part, index) => {
        if (part.quantity && isNaN(parseFloat(part.quantity))) {
          invalidFields.push(`• Part ${index + 1}: Quantity must be a valid number`);
        }
        if (part.unitCost && isNaN(parseFloat(part.unitCost))) {
          invalidFields.push(`• Part ${index + 1}: Unit cost must be a valid amount`);
        }
      });

      // Validate fluids
      formData.fluids.forEach((fluid, index) => {
        if (fluid.capacity && isNaN(parseFloat(fluid.capacity))) {
          invalidFields.push(`• Fluid ${index + 1}: Capacity must be a valid number`);
        }
        if (fluid.cost && isNaN(parseFloat(fluid.cost))) {
          invalidFields.push(`• Fluid ${index + 1}: Cost must be a valid amount`);
        }
      });
    }

    // Show friendly combined error message
    if (missingFields.length > 0 || invalidFields.length > 0) {
      let message = '';
      
      if (missingFields.length > 0) {
        message += `Please fill in these required fields:\n${missingFields.join('\n')}`;
      }
      
      if (invalidFields.length > 0) {
        if (message) message += '\n\nAlso fix these issues:\n';
        else message += 'Please fix these issues:\n';
        message += invalidFields.join('\n');
      }

      Alert.alert('🔧 Complete Your Maintenance Log', message);
      return false;
    }

    return true;
  };

  const handlePhotoSelected = (photoUri: string) => {
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, photoUri],
    }));
  };

  const handlePhotoRemoved = (photoIndex: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, index) => index !== photoIndex),
    }));
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Always hide the date picker after selection
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  };


  const renderVehicleContext = () => {
    if (!currentVehicle) {
      return (
        <Card variant="outlined" style={styles.sectionCard}>
          <Typography variant="bodyLarge" style={styles.loadingText}>
            {t('maintenance.loadingVehicle', 'Loading vehicle information...')}
          </Typography>
        </Card>
      );
    }

    return (
      <Card variant="filled" style={styles.vehicleContextCard}>
        <Typography variant="title" style={styles.vehicleContextName}>
          {currentVehicle.year} {currentVehicle.make} {currentVehicle.model}
        </Typography>
        {currentVehicle.vin && (
          <Typography variant="body" style={styles.vehicleContextVin}>
            VIN: {currentVehicle.vin}
          </Typography>
        )}
      </Card>
    );
  };

  const handleServicesSelection = (services: SelectedService[], configs?: Map<string, AdvancedServiceConfiguration>) => {
    setFormData(prev => ({
      ...prev,
      services,
      // Auto-populate title based on services selection if title is empty
      title: prev.title || (
        services.length === 1 
          ? services[0].serviceName 
          : services.length > 1 
            ? `${services.length} Services`
            : ''
      ),
      // For now, disable detailed parts/fluids tracking with multiple services
      // We can add this back later as an advanced feature
      parts: [],
      fluids: []
    }));
    
    // Store service configurations for detailed tracking
    if (configs) {
      setServiceConfigurations(configs);
    }
  };

  // Check if category supports detailed part tracking
  const supportsDetailedTracking = (categoryKey: string, subcategoryKey: string): boolean => {
    // Oil & Filter Change
    if (categoryKey === 'engine-powertrain' && subcategoryKey === 'oil-filter-change') {
      return true;
    }
    
    // Brake System
    if (categoryKey === 'brake-system') {
      return ['brake-pads-rotors', 'brake-fluid'].includes(subcategoryKey);
    }
    
    // Engine & Powertrain (additional categories)
    if (categoryKey === 'engine-powertrain') {
      return ['oil-filter-change', 'engine-air-filter', 'spark-plugs'].includes(subcategoryKey);
    }
    
    // Electrical
    if (categoryKey === 'electrical') {
      return ['battery'].includes(subcategoryKey);
    }
    
    return false;
  };

  // Get default parts for specific maintenance types
  const getDefaultParts = (categoryKey: string, subcategoryKey: string): MaintenancePartFormData[] => {
    // Oil & Filter Change
    if (categoryKey === 'engine-powertrain' && subcategoryKey === 'oil-filter-change') {
      return [{
        name: 'Oil Filter',
        partNumber: '',
        brand: '',
        quantity: '1',
        unitCost: '',
        supplier: ''
      }];
    }
    
    // Brake Pads & Rotors - Simple mode (most common: front only)
    if (categoryKey === 'brake-system' && subcategoryKey === 'brake-pads-rotors') {
      return [
        {
          name: 'Brake Pads',
          partNumber: '',
          brand: '',
          quantity: '1',
          unitCost: '',
          supplier: ''
        },
        {
          name: 'Brake Rotors',
          partNumber: '',
          brand: '',
          quantity: '2',
          unitCost: '',
          supplier: ''
        }
      ];
    }
    
    // Engine Air Filter
    if (categoryKey === 'engine-powertrain' && subcategoryKey === 'engine-air-filter') {
      return [{
        name: 'Engine Air Filter',
        partNumber: '',
        brand: '',
        quantity: '1',
        unitCost: '',
        supplier: ''
      }];
    }
    
    // Spark Plugs
    if (categoryKey === 'engine-powertrain' && subcategoryKey === 'spark-plugs') {
      return [{
        name: 'Spark Plugs',
        partNumber: '',
        brand: '',
        quantity: '4', // Common 4-cylinder default
        unitCost: '',
        supplier: ''
      }];
    }
    
    // Battery
    if (categoryKey === 'electrical' && subcategoryKey === 'battery') {
      return [{
        name: 'Car Battery',
        partNumber: '',
        brand: '',
        quantity: '1',
        unitCost: '',
        supplier: ''
      }];
    }
    
    return [];
  };

  // Get default fluids for specific maintenance types
  const getDefaultFluids = (categoryKey: string, subcategoryKey: string): MaintenanceFluidFormData[] => {
    // Oil & Filter Change
    if (categoryKey === 'engine-powertrain' && subcategoryKey === 'oil-filter-change') {
      return [{
        name: 'Motor Oil',
        type: 'engine_oil',
        brand: '',
        viscosity: '',
        capacity: '',
        unit: 'quarts',
        cost: ''
      }];
    }
    
    // Brake Fluid Service
    if (categoryKey === 'brake-system' && subcategoryKey === 'brake-fluid') {
      return [{
        name: 'Brake Fluid',
        type: 'brake_fluid',
        brand: '',
        viscosity: 'DOT 3/4', // Common brake fluid specification
        capacity: '',
        unit: 'ounces',
        cost: ''
      }];
    }
    
    return [];
  };


  // Add new part
  const addPart = () => {
    setFormData(prev => ({
      ...prev,
      parts: [...prev.parts, {
        name: '',
        partNumber: '',
        brand: '',
        quantity: '1',
        unitCost: '',
        supplier: ''
      }]
    }));
  };

  // Remove part
  const removePart = (index: number) => {
    setFormData(prev => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index)
    }));
  };

  // Update part
  const updatePart = (index: number, field: keyof MaintenancePartFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      parts: prev.parts.map((part, i) => 
        i === index ? { ...part, [field]: value } : part
      )
    }));
  };

  // Add new fluid
  const addFluid = () => {
    setFormData(prev => ({
      ...prev,
      fluids: [...prev.fluids, {
        name: '',
        type: '',
        brand: '',
        viscosity: '',
        capacity: '',
        unit: 'quarts',
        cost: ''
      }]
    }));
  };

  // Remove fluid
  const removeFluid = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fluids: prev.fluids.filter((_, i) => i !== index)
    }));
  };

  // Update fluid
  const updateFluid = (index: number, field: keyof MaintenanceFluidFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      fluids: prev.fluids.map((fluid, i) => 
        i === index ? { ...fluid, [field]: value } : fluid
      )
    }));
  };

  // Toggle advanced parts for brake system (front/rear split)
  const toggleAdvancedParts = () => {
    if (!showAdvancedParts && formData.categoryKey === 'brake-system' && formData.subcategoryKey === 'brake-pads-rotors') {
      // Expand to front/rear parts
      setFormData(prev => ({
        ...prev,
        parts: [
          {
            name: 'Front Brake Pads',
            partNumber: '',
            brand: '',
            quantity: '1',
            unitCost: '',
            supplier: ''
          },
          {
            name: 'Rear Brake Pads',
            partNumber: '',
            brand: '',
            quantity: '1',
            unitCost: '',
            supplier: ''
          },
          {
            name: 'Front Brake Rotors',
            partNumber: '',
            brand: '',
            quantity: '2',
            unitCost: '',
            supplier: ''
          },
          {
            name: 'Rear Brake Rotors',
            partNumber: '',
            brand: '',
            quantity: '2',
            unitCost: '',
            supplier: ''
          }
        ]
      }));
    } else if (showAdvancedParts && formData.categoryKey === 'brake-system' && formData.subcategoryKey === 'brake-pads-rotors') {
      // Collapse back to simple parts
      setFormData(prev => ({
        ...prev,
        parts: [
          {
            name: 'Brake Pads',
            partNumber: '',
            brand: '',
            quantity: '1',
            unitCost: '',
            supplier: ''
          },
          {
            name: 'Brake Rotors',
            partNumber: '',
            brand: '',
            quantity: '2',
            unitCost: '',
            supplier: ''
          }
        ]
      }));
    }
    setShowAdvancedParts(!showAdvancedParts);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message={t('maintenance.saving', 'Saving maintenance log...')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Service Selection */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Typography variant="heading" style={styles.sectionTitle}>
            Who Performed the Maintenance?
          </Typography>
          
          <View style={styles.serviceTypeContainer}>
            <TouchableOpacity
              style={[
                styles.serviceTypeOption,
                formData.serviceType === 'diy' && styles.serviceTypeOptionSelected
              ]}
              onPress={() => {
                setFormData(prev => ({ ...prev, serviceType: 'diy' }));
                setShowDIYPicker(true);
              }}
            >
              <Typography variant="bodyLarge" style={[
                styles.serviceTypeText,
                formData.serviceType === 'diy' && styles.serviceTypeTextSelected
              ]}>
                DIY
              </Typography>
              <Typography variant="body" style={[
                styles.serviceTypeDescription,
                formData.serviceType === 'diy' && styles.serviceTypeDescriptionSelected
              ]}>
                Self-service (track parts and materials)
              </Typography>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.serviceTypeOption,
                formData.serviceType === 'shop' && styles.serviceTypeOptionSelected
              ]}
              onPress={() => {
                navigation.navigate('ShopServiceStep1', { vehicleId: vehicleId });
              }}
            >
              <Typography variant="bodyLarge" style={[
                styles.serviceTypeText,
                formData.serviceType === 'shop' && styles.serviceTypeTextSelected
              ]}>
                Shop
              </Typography>
              <Typography variant="body" style={[
                styles.serviceTypeDescription,
                formData.serviceType === 'shop' && styles.serviceTypeDescriptionSelected
              ]}>
                Service performed at a shop (enter total cost)
              </Typography>
            </TouchableOpacity>
          </View>
        </Card>


        {/* Shop Service Details */}
        {formData.serviceType === 'shop' && formData.services.length > 0 && (
          <Card variant="elevated" style={styles.sectionCard}>
            <Typography variant="heading" style={styles.sectionTitle}>
              Shop Service Details
            </Typography>
            
            <Input
              label="Service Description"
              value={formData.serviceDescription}
              onChangeText={(serviceDescription) => setFormData(prev => ({ ...prev, serviceDescription }))}
              placeholder="Oil change with synthetic oil"
              multiline
              numberOfLines={2}
            />
            
            <Input
              label="Shop Name (Optional)"
              value={formData.shopName}
              onChangeText={(shopName) => setFormData(prev => ({ ...prev, shopName }))}
              placeholder="Jiffy Lube, Local Auto Shop, etc."
            />
            
            <Input
              label="Total Cost"
              value={formData.totalCost}
              onChangeText={(totalCost) => setFormData(prev => ({ ...prev, totalCost }))}
              placeholder="89.99"
              keyboardType="numeric"
            />
          </Card>
        )}

        {/* Detailed Parts & Fluids (DIY service for supported categories) */}
        {false && formData.serviceType === 'diy' && (
          <>
            {/* Parts Section */}
            <Card variant="elevated" style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Typography variant="heading" style={styles.sectionTitle}>
                  Parts Used
                </Typography>
                <View style={styles.headerActions}>
                  {formData.categoryKey === 'brake-system' && formData.subcategoryKey === 'brake-pads-rotors' && (
                    <Button
                      title={showAdvancedParts ? "Simple" : "Front/Rear"}
                      variant="text"
                      size="sm"
                      onPress={toggleAdvancedParts}
                      style={styles.advancedToggle}
                    />
                  )}
                  <Button
                    title="Add Part"
                    variant="text"
                    size="sm"
                    onPress={addPart}
                  />
                </View>
              </View>
              
              {formData.parts.map((part, index) => (
                <View key={index} style={styles.partFluidItem}>
                  <View style={styles.partFluidHeader}>
                    <Typography variant="bodyLarge" style={styles.partFluidTitle}>
                      {part.name || `Part ${index + 1}`}
                    </Typography>
                    {formData.parts.length > 1 && (
                      <TouchableOpacity onPress={() => removePart(index)}>
                        <Typography variant="body" style={styles.removeButton}>✕</Typography>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <Input
                    label="Part Name"
                    value={part.name}
                    onChangeText={(value) => updatePart(index, 'name', value)}
                    placeholder="Oil Filter"
                  />
                  
                  <View style={styles.partFluidRow}>
                    <Input
                      label="Brand"
                      value={part.brand}
                      onChangeText={(value) => updatePart(index, 'brand', value)}
                      placeholder="Mobil 1"
                      style={styles.partFluidInput}
                    />
                    <Input
                      label="Part Number"
                      value={part.partNumber}
                      onChangeText={(value) => updatePart(index, 'partNumber', value)}
                      placeholder="M1-110A"
                      style={styles.partFluidInput}
                    />
                  </View>
                  
                  <View style={styles.partFluidRow}>
                    <Input
                      label="Quantity"
                      value={part.quantity}
                      onChangeText={(value) => updatePart(index, 'quantity', value)}
                      placeholder="1"
                      keyboardType="numeric"
                      style={styles.partFluidInput}
                    />
                    <Input
                      label="Unit Cost"
                      value={part.unitCost}
                      onChangeText={(value) => updatePart(index, 'unitCost', value)}
                      placeholder="12.99"
                      keyboardType="numeric"
                      style={styles.partFluidInput}
                    />
                  </View>
                  
                  <Input
                    label="Supplier (Optional)"
                    value={part.supplier}
                    onChangeText={(value) => updatePart(index, 'supplier', value)}
                    placeholder="AutoZone, Amazon, etc."
                  />
                </View>
              ))}
            </Card>

            {/* Fluids Section */}
            <Card variant="elevated" style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Typography variant="heading" style={styles.sectionTitle}>
                  Fluids Used
                </Typography>
                <Button
                  title="Add Fluid"
                  variant="text"
                  size="sm"
                  onPress={addFluid}
                />
              </View>
              
              {formData.fluids.map((fluid, index) => (
                <View key={index} style={styles.partFluidItem}>
                  <View style={styles.partFluidHeader}>
                    <Typography variant="bodyLarge" style={styles.partFluidTitle}>
                      {fluid.name || `Fluid ${index + 1}`}
                    </Typography>
                    {formData.fluids.length > 1 && (
                      <TouchableOpacity onPress={() => removeFluid(index)}>
                        <Typography variant="body" style={styles.removeButton}>✕</Typography>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <Input
                    label="Fluid Name"
                    value={fluid.name}
                    onChangeText={(value) => updateFluid(index, 'name', value)}
                    placeholder="Motor Oil"
                  />
                  
                  <View style={styles.partFluidRow}>
                    <Input
                      label="Brand"
                      value={fluid.brand}
                      onChangeText={(value) => updateFluid(index, 'brand', value)}
                      placeholder="Mobil 1"
                      style={styles.partFluidInput}
                    />
                    <Input
                      label="Viscosity"
                      value={fluid.viscosity}
                      onChangeText={(value) => updateFluid(index, 'viscosity', value)}
                      placeholder="5W-30"
                      style={styles.partFluidInput}
                    />
                  </View>
                  
                  <View style={styles.partFluidRow}>
                    <Input
                      label="Capacity"
                      value={fluid.capacity}
                      onChangeText={(value) => updateFluid(index, 'capacity', value)}
                      placeholder="5"
                      keyboardType="numeric"
                      style={styles.partFluidInput}
                    />
                    <Input
                      label="Unit"
                      value={fluid.unit}
                      onChangeText={(value) => updateFluid(index, 'unit', value)}
                      placeholder="quarts"
                      style={styles.partFluidInput}
                    />
                  </View>
                  
                  <Input
                    label="Cost"
                    value={fluid.cost}
                    onChangeText={(value) => updateFluid(index, 'cost', value)}
                    placeholder="24.99"
                    keyboardType="numeric"
                  />
                </View>
              ))}
            </Card>
          </>
        )}

      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title={t('common.cancel', 'Cancel')}
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.button}
          disabled={loading}
        />
        <Button
          title={t('common.save', 'Save')}
          variant="primary"
          onPress={handleSave}
          disabled={loading}
          style={styles.button}
        />
      </View>

      {/* DIY Service Picker Modal */}
      <MaintenanceCategoryPicker
        visible={showDIYPicker}
        selectedServices={formData.serviceType === 'diy' ? formData.services : []}
        onSelectionComplete={(services, configs) => {
          setFormData(prev => ({ ...prev, serviceType: 'diy', services }));
          if (configs) {
            setServiceConfigurations(configs);
          }
          setShowDIYPicker(false);
        }}
        onCancel={() => setShowDIYPicker(false)}
        allowMultiple={true}
        enableConfiguration={true}
        serviceType="diy"
      />

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
    padding: theme.spacing.lg,
  },
  sectionCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  loadingText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  vehicleContextCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  vehicleContextName: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  vehicleContextVin: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: 'monospace',
  },
  dateSelector: {
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  dateLabel: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  dateValue: {
    color: theme.colors.text,
  },
  // Category styles removed - now handled by MaintenanceCategorySelector
  photoList: {
    marginTop: theme.spacing.md,
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
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  button: {
    flex: 1,
    minHeight: 48,
  },
  // Service Type Selection
  serviceTypeContainer: {
    gap: theme.spacing.md,
  },
  serviceTypeOption: {
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  serviceTypeOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}08`, // 8% opacity
  },
  serviceTypeText: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  serviceTypeTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  serviceTypeDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
  },
  serviceTypeDescriptionSelected: {
    color: theme.colors.primary,
  },
  // Parts and Fluids
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  advancedToggle: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  partFluidItem: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  partFluidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  partFluidTitle: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  removeButton: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    padding: theme.spacing.sm,
  },
  partFluidRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  partFluidInput: {
    flex: 1,
  },
});

export default AddMaintenanceLogScreen;