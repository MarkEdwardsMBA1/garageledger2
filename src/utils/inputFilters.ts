// Input Filter Utilities
// Clean user input to prevent unwanted characters and improve validation

/**
 * Filter input to allow only whole numbers and commas
 * Used for odometer readings, quantities, etc.
 */
export const filterWholeNumbers = (input: string): string => {
  // Remove everything except digits and commas
  let cleaned = input.replace(/[^0-9,]/g, '');
  
  // Prevent multiple consecutive commas
  cleaned = cleaned.replace(/,+/g, ',');
  
  // Remove leading comma
  cleaned = cleaned.replace(/^,/, '');
  
  // Remove trailing comma for better UX (allow temporary trailing comma while typing)
  // Don't auto-remove as user might be in middle of typing "1,000"
  
  return cleaned;
};

/**
 * Filter input to allow currency format (digits, one decimal point, up to 2 decimal places)
 * Used for costs, prices, etc.
 */
export const filterCurrency = (input: string): string => {
  // Remove everything except digits and decimal point
  let cleaned = input.replace(/[^0-9.]/g, '');
  
  // Prevent multiple decimal points - keep only the first one
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit to 2 decimal places
  if (parts.length === 2) {
    cleaned = parts[0] + '.' + parts[1].substring(0, 2);
  }
  
  return cleaned;
};

/**
 * Format mileage for display (add commas for readability)
 * Example: "75000" -> "75,000"
 */
export const formatMileage = (input: string): string => {
  // Remove existing commas
  const cleaned = input.replace(/,/g, '');
  
  // Add commas for thousands separator
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format currency for display 
 * Example: "24.5" -> "24.50"
 */
export const formatCurrency = (input: string): string => {
  const num = parseFloat(input);
  if (isNaN(num)) return input;
  
  return num.toFixed(2);
};

/**
 * Clean mileage input for validation/storage (remove commas)
 * Example: "75,000" -> "75000" 
 */
export const cleanMileage = (input: string): string => {
  return input.replace(/,/g, '');
};

/**
 * Phone number filter - allow digits, spaces, dashes, parentheses
 */
export const filterPhoneNumber = (input: string): string => {
  return input.replace(/[^0-9\s\-\(\)\+]/g, '');
};

/**
 * Email filter - basic cleanup (remove spaces)
 */
export const filterEmail = (input: string): string => {
  return input.replace(/\s/g, '').toLowerCase();
};

/**
 * VIN filter - uppercase alphanumeric, exclude confusing characters
 */
export const filterVIN = (input: string): string => {
  // VIN excludes I, O, Q to avoid confusion with 1, 0
  return input.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
};