// Service Requirements Engine (Corrected)
// Data-driven approach based on corrected spreadsheet data
// General = Multiple parts with "Add More", Tailored = Single part entry

export type PartsFormType = 'general' | 'tailored' | 'brakes' | 'none';
export type FluidsFormType = 'general' | 'motor-oil' | 'none';

export interface ServiceRequirement {
  category: string;
  service: string;
  requiresParts: boolean;
  requiresFluids: boolean;
  partsFormType: PartsFormType;
  fluidsFormType: FluidsFormType;
  diyAvailable: boolean;
  notes?: string;
}

/**
 * Complete service requirements database (Corrected)
 * Based on updated spreadsheet with proper form types
 */
export const SERVICE_REQUIREMENTS: ServiceRequirement[] = [
  // Engine & Power Services (All use Tailored parts - single part entry)
  {
    category: 'Engine & Power',
    service: 'Oil & Oil Filter Change',
    requiresParts: true,
    requiresFluids: true,
    partsFormType: 'tailored',
    fluidsFormType: 'motor-oil',
    diyAvailable: true,
  },
  {
    category: 'Engine & Power',
    service: 'Engine Air Filter',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Engine & Power',
    service: 'Spark Plugs',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Engine & Power',
    service: 'Drive Belts & Pulleys',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Engine & Power',
    service: 'Valve Cover Gasket',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Engine & Power',
    service: 'PCV',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Engine & Power',
    service: 'Throttle Body & MAF Sensor Clean',
    requiresParts: false,
    requiresFluids: true,
    partsFormType: 'none',
    fluidsFormType: 'general',
    diyAvailable: true,
  },

  // Cooling System Services (Mix of Tailored and General)
  {
    category: 'Cooling System',
    service: 'Thermostat',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Cooling System',
    service: 'Water Pump',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Cooling System',
    service: 'Radiator',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Cooling System',
    service: 'Antifreeze & Coolant',
    requiresParts: false,
    requiresFluids: true,
    partsFormType: 'none',
    fluidsFormType: 'general',
    diyAvailable: true,
  },

  // Transmission Services (All use General - multiple parts with Add More)
  {
    category: 'Transmission & Transmission & PDK',
    service: 'Transmission & Transmission & PDK',
    requiresParts: true,
    requiresFluids: true,
    partsFormType: 'general',
    fluidsFormType: 'general',
    diyAvailable: true,
  },
  {
    category: 'Transmission & Transmission & PDK',
    service: 'Front Differential',
    requiresParts: true,
    requiresFluids: true,
    partsFormType: 'general',
    fluidsFormType: 'general',
    diyAvailable: true,
  },
  {
    category: 'Transmission & Transmission & PDK',
    service: 'Rear Differential',
    requiresParts: true,
    requiresFluids: true,
    partsFormType: 'general',
    fluidsFormType: 'general',
    diyAvailable: true,
  },
  {
    category: 'Transmission & Transmission & PDK',
    service: 'Center Differential',
    requiresParts: true,
    requiresFluids: true,
    partsFormType: 'general',
    fluidsFormType: 'general',
    diyAvailable: true,
  },
  {
    category: 'Transmission & Transmission & PDK',
    service: 'Transfer Case',
    requiresParts: true,
    requiresFluids: true,
    partsFormType: 'general',
    fluidsFormType: 'general',
    diyAvailable: true,
  },
  {
    category: 'Transmission & Transmission & PDK',
    service: 'Driveshaft',
    requiresParts: false,
    requiresFluids: true,
    partsFormType: 'none',
    fluidsFormType: 'general',
    diyAvailable: true,
  },
  {
    category: 'Transmission & Transmission & PDK',
    service: 'CV Joints & Axles',
    requiresParts: true,
    requiresFluids: true,
    partsFormType: 'general',
    fluidsFormType: 'general',
    diyAvailable: true,
  },

  // Brake System Services (Use specialized "Brakes" form type)
  {
    category: 'Brake System',
    service: 'Brake Pads & Rotors',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'brakes',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Brake System',
    service: 'Calipers',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Brake System',
    service: 'Master Cylinder',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Brake System',
    service: 'Brake Lines',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Brake System',
    service: 'Brake Fluid',
    requiresParts: false,
    requiresFluids: true,
    partsFormType: 'none',
    fluidsFormType: 'general',
    diyAvailable: true,
  },

  // Tires & Wheels Services (Special Cases)
  {
    category: 'Tires & Wheels',
    service: 'Tire Rotation',
    requiresParts: false,
    requiresFluids: false,
    partsFormType: 'none',
    fluidsFormType: 'none',
    diyAvailable: true,
    notes: 'Selection only - no parts/fluids needed'
  },
  {
    category: 'Tires & Wheels',
    service: 'Tire Balancing',
    requiresParts: false,
    requiresFluids: false,
    partsFormType: 'none',
    fluidsFormType: 'none',
    diyAvailable: false, // Hidden in DIY mode
    notes: 'Not available for DIY'
  },

  // Steering & Suspension Services
  {
    category: 'Steering & Suspension',
    service: 'Struts/Shocks, Springs, Coilover',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'general',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Steering & Suspension',
    service: 'Control Arms, Ball Joints, Tie Rod',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'general',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Steering & Suspension',
    service: 'Sway Bars, Links & Bushings',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'general',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Steering & Suspension',
    service: 'Steering Rack',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Steering & Suspension',
    service: 'Power Steering Fluid',
    requiresParts: false,
    requiresFluids: true,
    partsFormType: 'none',
    fluidsFormType: 'general',
    diyAvailable: true,
  },

  // Interior Comfort Services
  {
    category: 'Interior Comfort',
    service: 'Cabin Air Filter',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },

  // HVAC & Climate Services
  {
    category: 'HVAC & Climate',
    service: 'A/C Refrigerant Recharge',
    requiresParts: false,
    requiresFluids: true,
    partsFormType: 'none',
    fluidsFormType: 'general',
    diyAvailable: true,
  },
  {
    category: 'HVAC & Climate',
    service: 'A/C Compressor',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'HVAC & Climate',
    service: 'Heater Core',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },

  // Lighting Services (All use Tailored - single specialized bulb)
  {
    category: 'Lighting',
    service: 'Headlight Bulbs',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Lighting',
    service: 'Taillight Bulbs',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Lighting',
    service: 'Interior Lighting',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },

  // Electrical Services (All use Tailored)
  {
    category: 'Electrical',
    service: 'Battery',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Electrical',
    service: 'Alternator',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Electrical',
    service: 'Starter',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },

  // Body & Exterior Services (All use Tailored)
  {
    category: 'Body & Exterior',
    service: 'Paint Protection/Touch-Up',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Body & Exterior',
    service: 'Weatherstripping',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },
  {
    category: 'Body & Exterior',
    service: 'Windshield Wipers',
    requiresParts: true,
    requiresFluids: false,
    partsFormType: 'tailored',
    fluidsFormType: 'none',
    diyAvailable: true,
  },

  // Fluids & Consumables Services
  {
    category: 'Fluids & Consumables',
    service: 'Windshield/Headlight Washer Fluid',
    requiresParts: false,
    requiresFluids: true,
    partsFormType: 'none',
    fluidsFormType: 'general',
    diyAvailable: true,
  },
  {
    category: 'Fluids & Consumables',
    service: 'Cleaning & Chemicals',
    requiresParts: false,
    requiresFluids: true,
    partsFormType: 'none',
    fluidsFormType: 'general',
    diyAvailable: true,
  },
];

/**
 * Service Requirements Query Engine
 * Clean API for looking up service requirements and form types
 */
export class ServiceRequirementsEngine {
  
  /**
   * Get requirements for a specific service
   */
  static getRequirements(category: string, service: string): ServiceRequirement | null {
    return SERVICE_REQUIREMENTS.find(
      req => req.category === category && req.service === service
    ) || null;
  }

  /**
   * Check if service is available in DIY mode
   */
  static isDIYAvailable(category: string, service: string): boolean {
    const req = this.getRequirements(category, service);
    return req?.diyAvailable ?? false;
  }

  /**
   * Get all services for a category (filtered for DIY if needed)
   */
  static getServicesForCategory(category: string, diyOnly = false): ServiceRequirement[] {
    return SERVICE_REQUIREMENTS.filter(req => 
      req.category === category && (!diyOnly || req.diyAvailable)
    );
  }

  /**
   * Get form configuration for a service
   */
  static getFormConfig(category: string, service: string): {
    needsPartsForm: boolean;
    needsFluidsForm: boolean;
    partsFormType: PartsFormType;
    fluidsFormType: FluidsFormType;
    allowAddMoreParts: boolean; // Key feature - GENERAL forms allow "Add More"
  } {
    const req = this.getRequirements(category, service);
    
    if (!req) {
      return {
        needsPartsForm: false,
        needsFluidsForm: false,
        partsFormType: 'none',
        fluidsFormType: 'none',
        allowAddMoreParts: false
      };
    }

    return {
      needsPartsForm: req.requiresParts,
      needsFluids: req.requiresFluids,
      partsFormType: req.partsFormType,
      fluidsFormType: req.fluidsFormType,
      allowAddMoreParts: req.partsFormType === 'general' // GENERAL forms allow multiple parts
    };
  }

  /**
   * Check if service requires only selection (no forms)
   */
  static isSelectionOnly(category: string, service: string): boolean {
    const config = this.getFormConfig(category, service);
    return !config.needsPartsForm && !config.needsFluidsForm;
  }
}