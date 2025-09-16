// Service-to-Form Routing Matrix
// Maps services to appropriate wireframe screens based on requirements

export type ServiceFormType = 
  | 'oil_and_oil_filter'    // 2-step: Oil Filter → Motor Oil (with viscosity)
  | 'tailored_parts'        // Single part entry
  | 'parts'                 // Multi-part entry with "Add Another"
  | 'fluids'                // Single fluid entry with capacity/units
  | 'parts_and_fluids'      // 2-step: Parts → Fluids
  | 'none';                 // No additional form needed

// Service Form Mapping Matrix based on spreadsheet
export const SERVICE_FORM_MAPPING: Record<string, ServiceFormType> = {
  // Engine & Powertrain
  'engine-powertrain.oil-filter-change': 'oil_and_oil_filter',
  'engine-powertrain.engine-air-filter': 'tailored_parts',
  'engine-powertrain.spark-plugs': 'tailored_parts',
  'engine-powertrain.drive-belts-pulleys': 'parts',
  'engine-powertrain.valve-cover-gasket': 'parts',
  'engine-powertrain.pcv': 'parts',
  'engine-powertrain.throttle-body-maf': 'fluids',
  
  // Cooling System
  'cooling-system.thermostat': 'tailored_parts',
  'cooling-system.water-pump': 'tailored_parts',
  'cooling-system.radiator': 'tailored_parts',
  'cooling-system.antifreeze-coolant': 'fluids',
  
  // Transmission & Drivetrain  
  'transmission-drivetrain.transmission-pdk': 'parts_and_fluids',
  'transmission-drivetrain.front-differential': 'parts_and_fluids',
  'transmission-drivetrain.rear-differential': 'parts_and_fluids',
  'transmission-drivetrain.center-differential': 'parts_and_fluids',
  'transmission-drivetrain.transfer-case': 'parts_and_fluids',
  'transmission-drivetrain.driveshaft': 'fluids',
  'transmission-drivetrain.cv-joints-axles': 'parts_and_fluids',
  
  // Brake System
  'brake-system.brake-pads-rotors': 'parts',
  'brake-system.caliper': 'parts',
  'brake-system.master-cylinder': 'tailored_parts',
  'brake-system.brake-lines': 'parts',
  'brake-system.brake-fluid': 'fluids',
  
  // Tires & Wheels
  'tires-wheels.tire-rotation': 'none',
  'tires-wheels.balancing': 'none',
  
  // Steering & Suspension
  'steering-suspension.struts-shocks': 'parts',
  'steering-suspension.control-arms': 'parts',
  'steering-suspension.sway-bars': 'parts',
  'steering-suspension.steering-rack': 'tailored_parts',
  'steering-suspension.power-steering-fluid': 'fluids',
  
  // Interior & Comfort
  'interior-comfort.cabin-air-filter': 'tailored_parts',
  
  // HVAC & Climate
  'hvac-climate.ac-refrigerant': 'fluids',
  'hvac-climate.ac-compressor': 'tailored_parts',
  'hvac-climate.heater-core': 'tailored_parts',
  
  // Lighting
  'lighting.headlight-bulbs': 'parts',
  'lighting.taillight-bulbs': 'parts',
  'lighting.interior-lighting': 'parts',
  
  // Electrical
  'electrical.battery': 'tailored_parts',
  'electrical.alternator': 'tailored_parts',
  'electrical.starter': 'tailored_parts',
  
  // Body & Exterior
  'body-exterior.paint-protection': 'parts_and_fluids',
  'body-exterior.weatherstripping': 'parts',
  'body-exterior.windshield-wipers': 'parts',
  
  // Fluids & Consumables
  'fluids-consumables.windshield-washer-fluid': 'fluids',
  'fluids-consumables.cleaning-chemicals': 'parts_and_fluids',
  
  // Custom Services
  'custom-service.custom': 'parts_and_fluids', // Most flexible option
};

// Helper function to get form type for a service
export const getServiceFormType = (serviceId: string): ServiceFormType => {
  return SERVICE_FORM_MAPPING[serviceId] || 'none';
};

// Helper function to check if service needs additional form
export const serviceNeedsForm = (serviceId: string): boolean => {
  return getServiceFormType(serviceId) !== 'none';
};

// Helper function to get form title based on service
export const getFormTitle = (serviceId: string, serviceName: string): string => {
  const formType = getServiceFormType(serviceId);
  
  switch (formType) {
    case 'oil_and_oil_filter':
      return 'Oil & Oil Filter Change';
    case 'tailored_parts':
    case 'parts':
    case 'fluids':
    case 'parts_and_fluids':
      return serviceName;
    default:
      return serviceName;
  }
};

// Get step configuration for multi-step forms
export const getFormSteps = (formType: ServiceFormType): string[] => {
  switch (formType) {
    case 'oil_and_oil_filter':
      return ['Oil Filter', 'Motor Oil'];
    case 'parts_and_fluids':
      return ['Parts', 'Fluids'];
    default:
      return [];
  }
};