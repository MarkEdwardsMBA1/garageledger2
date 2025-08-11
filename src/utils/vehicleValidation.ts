// Shared validation logic for vehicle forms

export interface VehicleValidationErrors {
  make?: string;
  model?: string;
  year?: string;
  mileage?: string;
  vin?: string;
  nickname?: string;
  notes?: string;
}

export interface VehicleFormData {
  make: string;
  model: string;
  year: string;
  mileage: string;
  vin?: string;
  nickname?: string;
  notes?: string;
}

/**
 * Validate required vehicle fields (make, model, year)
 */
export const validateRequiredFields = (
  data: VehicleFormData,
  t: (key: string, fallback?: string) => string
): VehicleValidationErrors => {
  const errors: VehicleValidationErrors = {};

  // Required fields
  if (!data.make.trim()) {
    errors.make = t('validation.required', 'This field is required');
  }
  if (!data.model.trim()) {
    errors.model = t('validation.required', 'This field is required');
  }
  if (!data.year.trim()) {
    errors.year = t('validation.required', 'This field is required');
  }

  return errors;
};

/**
 * Validate year field
 */
export const validateYear = (
  year: string,
  t: (key: string, fallback?: string) => string
): string | undefined => {
  if (!year.trim()) return undefined;

  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  
  if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
    return t('validation.invalidYear', 'Please enter a valid year');
  }
  
  return undefined;
};

/**
 * Validate mileage field
 */
export const validateMileage = (
  mileage: string,
  t: (key: string, fallback?: string) => string
): string | undefined => {
  if (!mileage.trim()) return undefined;

  const mileageNum = parseInt(mileage.replace(/,/g, ''));
  if (isNaN(mileageNum) || mileageNum < 0) {
    return t('validation.invalidMileage', 'Please enter a valid mileage');
  }
  
  return undefined;
};

/**
 * Validate VIN field
 */
export const validateVIN = (
  vin: string,
  t: (key: string, fallback?: string) => string
): string | undefined => {
  if (!vin.trim()) return undefined;

  // Basic VIN validation - should be exactly 17 characters
  if (vin.trim().length !== 17) {
    return t('validation.invalidVin', 'VIN should be 17 characters');
  }
  
  return undefined;
};

/**
 * Comprehensive validation for all vehicle fields
 */
export const validateVehicleForm = (
  data: VehicleFormData,
  t: (key: string, fallback?: string) => string,
  options: {
    requireVIN?: boolean;
    requireMileage?: boolean;
  } = {}
): VehicleValidationErrors => {
  const errors: VehicleValidationErrors = {};

  // Required fields
  Object.assign(errors, validateRequiredFields(data, t));

  // Year validation
  const yearError = validateYear(data.year, t);
  if (yearError) errors.year = yearError;

  // Optional field validations
  const mileageError = validateMileage(data.mileage, t);
  if (mileageError) errors.mileage = mileageError;

  if (data.vin) {
    const vinError = validateVIN(data.vin, t);
    if (vinError) errors.vin = vinError;
  }

  // Required optional fields (if specified)
  if (options.requireVIN && !data.vin?.trim()) {
    errors.vin = t('validation.required', 'This field is required');
  }
  
  if (options.requireMileage && !data.mileage?.trim()) {
    errors.mileage = t('validation.required', 'This field is required');
  }

  return errors;
};

/**
 * Convert form data to Vehicle object
 */
export const formDataToVehicle = (
  data: VehicleFormData,
  userId: string
): any => {
  return {
    userId,
    make: data.make.trim(),
    model: data.model.trim(),
    year: parseInt(data.year),
    mileage: data.mileage.trim() ? parseInt(data.mileage.replace(/,/g, '')) : 0,
    ...(data.vin?.trim() && { vin: data.vin.trim() }),
    ...(data.nickname?.trim() && { nickname: data.nickname.trim() }),
    ...(data.notes?.trim() && { notes: data.notes.trim() }),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};