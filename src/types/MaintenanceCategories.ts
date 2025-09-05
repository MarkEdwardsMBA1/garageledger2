// Hierarchical Maintenance Category System
// Based on comprehensive automotive maintenance categories

export interface MaintenanceCategorySystem {
  [key: string]: MaintenanceCategory;
}

export interface MaintenanceCategory {
  name: string;
  subcategories: { [key: string]: MaintenanceSubcategory };
}

export interface MaintenanceSubcategory {
  name: string;
  components?: MaintenanceComponents;
  description?: string;
}

export interface MaintenanceComponents {
  parts?: string[];
  fluids?: string[];
  labor?: string[];
}

// Complete maintenance category system based on Mark's comprehensive document
export const MAINTENANCE_CATEGORIES: MaintenanceCategorySystem = {
  'brake-system': {
    name: 'Brake System',
    subcategories: {
      'brake-pads-rotors': {
        name: 'Brake Pads & Rotors',
        components: {
          parts: ['Brake Pads', 'Brake Rotors', 'Anti-Rattle Clips']
        }
      },
      'caliper': {
        name: 'Caliper',
        components: {
          parts: ['Brake Caliper']
        }
      },
      'master-cylinder': {
        name: 'Master Cylinder',
        components: {
          parts: ['Master Cylinder']
        }
      },
      'brake-lines': {
        name: 'Brake Lines',
        components: {
          parts: ['Brake Lines']
        }
      },
      'brake-fluid': {
        name: 'Brake Fluid',
        components: {
          fluids: ['Brake Fluid']
        }
      }
    }
  },

  'cooling-system': {
    name: 'Cooling System',
    subcategories: {
      'thermostat': {
        name: 'Thermostat',
        components: {
          parts: ['Thermostat']
        }
      },
      'water-pump': {
        name: 'Water Pump',
        components: {
          parts: ['Water Pump']
        }
      },
      'radiator': {
        name: 'Radiator',
        components: {
          parts: ['Radiator']
        }
      },
      'antifreeze-coolant': {
        name: 'Antifreeze & Coolant',
        components: {
          fluids: ['Antifreeze & Coolant']
        }
      }
    }
  },

  'tires-wheels': {
    name: 'Tires & Wheels',
    subcategories: {
      'tire-rotation': {
        name: 'Tire Rotation',
        description: 'Rotating tires to ensure even wear and extend tire life',
        components: {
          labor: ['Tire Rotation Service']
        }
      },
      'balancing': {
        name: 'Balancing',
        description: 'Wheel balancing to eliminate vibration and improve ride quality',
        components: {
          labor: ['Wheel Balancing Service']
        }
      }
    }
  },

  'steering-suspension': {
    name: 'Steering & Suspension',
    subcategories: {
      'struts-shocks': {
        name: 'Struts/Shocks, Springs, Coilovers & Top Mounts',
        components: {
          parts: ['Struts', 'Shocks', 'Springs', 'Coilovers', 'Top Mounts']
        }
      },
      'control-arms': {
        name: 'Control Arms, Trailing Arms, Ball Joints & Tie Rods',
        components: {
          parts: [
            'Upper Control Arms & Bushings',
            'Lower Control Arms & Bushings',
            'Trailing Arms',
            'Ball Joints',
            'Tie Rods'
          ]
        }
      },
      'sway-bars': {
        name: 'Sway Bars, Links & Bushings',
        components: {
          parts: [
            'Front Sway Bar',
            'Rear Sway Bar',
            'Front Sway Bar End Links',
            'Rear Sway Bar End Links',
            'Front Sway Bar Bushings',
            'Rear Sway Bar Bushings'
          ]
        }
      },
      'steering-rack': {
        name: 'Steering Rack',
        components: {
          parts: ['Steering Rack']
        }
      },
      'power-steering-fluid': {
        name: 'Power Steering Fluid',
        components: {
          fluids: ['Power Steering Fluid']
        }
      }
    }
  },


  'electrical': {
    name: 'Electrical',
    subcategories: {
      'battery': {
        name: 'Battery',
        components: {
          parts: ['Battery']
        }
      },
      'alternator': {
        name: 'Alternator',
        components: {
          parts: ['Alternator']
        }
      },
      'starter': {
        name: 'Starter',
        components: {
          parts: ['Starter']
        }
      }
    }
  },

  'engine-powertrain': {
    name: 'Engine & Powertrain',
    subcategories: {
      'oil-filter-change': {
        name: 'Oil & Oil Filter Change',
        components: {
          fluids: ['Motor Oil'],
          parts: ['Oil Filter']
        }
      },
      'engine-air-filter': {
        name: 'Engine Air Filter',
        components: {
          parts: ['Engine Air Filter']
        }
      },
      'spark-plugs': {
        name: 'Spark Plugs',
        components: {
          parts: ['Spark Plugs']
        }
      },
      'drive-belts-pulleys': {
        name: 'Drive Belts & Pulleys',
        components: {
          parts: ['Drive Belts', 'Pulleys']
        }
      },
      'valve-cover-gasket': {
        name: 'Valve Cover Gasket',
        components: {
          parts: ['Valve Cover Gasket']
        }
      },
      'pcv': {
        name: 'PCV',
        components: {
          parts: ['PCV Valve']
        }
      },
      'throttle-body-maf': {
        name: 'Throttle Body & MAF Sensor Cleaning',
        components: {
          labor: ['Throttle Body Cleaning', 'MAF Sensor Cleaning']
        }
      }
    }
  },

  'transmission-drivetrain': {
    name: 'Transmission & Drivetrain',
    subcategories: {
      'transmission-pdk': {
        name: 'Transmission & PDK',
        components: {
          fluids: ['Transmission Fluid', 'PDK Fluid'],
          parts: [
            'Internal Transmission Filter',
            'External Transmission Filter',
            'Transmission Strainer',
            'Transmission Drain Plug',
            'Transmission Washer',
            'Oil Pan Gasket'
          ]
        }
      },
      'front-differential': {
        name: 'Front Differential',
        components: {
          fluids: ['Front Differential Fluid'],
          parts: ['Front Differential Drain Plug', 'Front Differential Washer', 'Front Differential Gaskets']
        }
      },
      'rear-differential': {
        name: 'Rear Differential',
        components: {
          fluids: ['Rear Differential Fluid'],
          parts: ['Rear Differential Drain Plug', 'Rear Differential Fill Plug', 'Rear Differential Washers', 'Rear Differential Gaskets']
        }
      },
      'center-differential': {
        name: 'Center Differential',
        components: {
          fluids: ['Center Differential Fluid'],
          parts: ['Center Differential Drain Plug', 'Center Differential Fill Plug', 'Center Differential Washers', 'Center Differential Gaskets']
        }
      },
      'transfer-case': {
        name: 'Transfer Case',
        components: {
          fluids: ['Transfer Case Fluid'],
          parts: ['Transfer Case Drain Plug', 'Transfer Case Fill Plug', 'Transfer Case Washers', 'Transfer Case Gaskets']
        }
      },
      'driveshaft': {
        name: 'Driveshaft',
        components: {
          fluids: ['Grease'],
          labor: ['Slip Yoke Service', 'Spider Joint Service', 'U-Joint Service', 'Re-Torque']
        }
      },
      'cv-joints-axles': {
        name: 'CV Joints & Axles',
        components: {
          parts: ['CV Joints', 'CV Axles', 'CV Boots']
        }
      }
    }
  },

  'interior-comfort': {
    name: 'Interior Comfort & Convenience',
    subcategories: {
      'cabin-air-filter': {
        name: 'Cabin Air Filter',
        components: {
          parts: ['Cabin Air Filter']
        }
      }
    }
  },

  'hvac-climate': {
    name: 'HVAC & Climate Control',
    subcategories: {
      'ac-refrigerant': {
        name: 'A/C Refrigerant Recharge',
        components: {
          fluids: ['A/C Refrigerant']
        }
      },
      'ac-compressor': {
        name: 'A/C Compressor',
        components: {
          parts: ['A/C Compressor']
        }
      },
      'heater-core': {
        name: 'Heater Core',
        components: {
          parts: ['Heater Core']
        }
      }
    }
  },

  'body-exterior': {
    name: 'Body & Exterior',
    subcategories: {
      'paint-protection': {
        name: 'Paint Protection/Touch-up',
        components: {
          parts: ['Touch-up Paint', 'Paint Protection Film', 'Wax', 'Sealant']
        }
      },
      'weatherstripping': {
        name: 'Weatherstripping',
        components: {
          parts: ['Door Seals', 'Window Seals', 'Trunk Seals']
        }
      },
      'windshield-wipers': {
        name: 'Windshield Wipers',
        components: {
          parts: ['Wiper Blades', 'Wiper Arms']
        }
      }
    }
  },

  'lighting': {
    name: 'Lighting',
    subcategories: {
      'headlight-bulbs': {
        name: 'Headlight Bulbs',
        components: {
          parts: ['Headlight Bulbs', 'HID Bulbs', 'LED Headlights']
        }
      },
      'taillight-bulbs': {
        name: 'Taillight Bulbs',
        components: {
          parts: ['Taillight Bulbs', 'LED Taillights']
        }
      },
      'interior-lighting': {
        name: 'Interior Lighting',
        components: {
          parts: ['Interior LED Bulbs', 'Dome Light Bulbs']
        }
      }
    }
  },


  'fluids-consumables': {
    name: 'Fluids & Consumables',
    subcategories: {
      'windshield-washer-fluid': {
        name: 'Windshield Washer Fluid',
        components: {
          fluids: ['Windshield Washer Fluid']
        }
      },
      'cleaning-chemicals': {
        name: 'Cleaning & Chemicals',
        components: {
          fluids: ['Brake Cleaner', 'Penetrating Oil', 'Degreaser']
        }
      },
    }
  },

  'custom-service': {
    name: 'Custom Service Reminder',
    subcategories: {
      'custom': {
        name: 'Custom Service',
        description: 'Add your own maintenance reminder (e.g., State Inspection, Smog Check)'
      }
    }
  }
};

// Helper functions for working with categories
export const getCategoryKeys = (): string[] => {
  return Object.keys(MAINTENANCE_CATEGORIES);
};

export const getSubcategoryKeys = (categoryKey: string): string[] => {
  const category = MAINTENANCE_CATEGORIES[categoryKey];
  return category ? Object.keys(category.subcategories) : [];
};

export const getCategoryName = (categoryKey: string): string => {
  return MAINTENANCE_CATEGORIES[categoryKey]?.name || categoryKey;
};

export const getSubcategoryName = (categoryKey: string, subcategoryKey: string): string => {
  return MAINTENANCE_CATEGORIES[categoryKey]?.subcategories[subcategoryKey]?.name || subcategoryKey;
};

export const getComponents = (categoryKey: string, subcategoryKey: string): MaintenanceComponents | undefined => {
  return MAINTENANCE_CATEGORIES[categoryKey]?.subcategories[subcategoryKey]?.components;
};

// Service configuration type for DIY bottom sheet variants
export type ServiceConfigType = 'parts-fluids' | 'parts-only' | 'fluids-only' | 'labor-only';

// Helper function to check if a service should be available in DIY mode
export const isDIYService = (categoryKey: string, subcategoryKey: string): boolean => {
  // Excluded from DIY mode: alignment, wheel balancing, shop materials
  if (categoryKey === 'steering-suspension' && subcategoryKey === 'alignment') {
    return false;
  }
  if (categoryKey === 'tires-wheels' && subcategoryKey === 'balancing') {
    return false; // Balancing requires shop equipment
  }
  if (categoryKey === 'fluids-consumables' && subcategoryKey === 'shop-materials') {
    return false;
  }
  
  return true; // All other services are available in DIY mode
};

export const getServiceConfigType = (categoryKey: string, subcategoryKey: string): ServiceConfigType => {
  // Labor-only services (no parts or fluids needed)
  if (categoryKey === 'tires-wheels' && subcategoryKey === 'tire-rotation') {
    return 'labor-only'; // Just labor for rotation
  }
  if (categoryKey === 'tires-wheels' && subcategoryKey === 'balancing') {
    return 'labor-only'; // Just labor for balancing
  }

  // Parts + Fluids services (need both parts and fluids input)
  if (categoryKey === 'engine-powertrain' && subcategoryKey === 'oil-filter-change') {
    return 'parts-fluids'; // Oil filter + motor oil
  }
  if (categoryKey === 'transmission-drivetrain' && subcategoryKey === 'transmission-pdk') {
    return 'parts-fluids'; // Filters + transmission fluid
  }
  if (categoryKey === 'transmission-drivetrain' && subcategoryKey === 'front-differential') {
    return 'parts-fluids'; // Gaskets + differential fluid
  }
  if (categoryKey === 'transmission-drivetrain' && subcategoryKey === 'rear-differential') {
    return 'parts-fluids'; // Gaskets + differential fluid
  }
  if (categoryKey === 'transmission-drivetrain' && subcategoryKey === 'center-differential') {
    return 'parts-fluids'; // Gaskets + differential fluid
  }
  if (categoryKey === 'transmission-drivetrain' && subcategoryKey === 'transfer-case') {
    return 'parts-fluids'; // Gaskets + transfer case fluid
  }
  if (categoryKey === 'transmission-drivetrain' && subcategoryKey === 'driveshaft') {
    return 'parts-fluids'; // Parts + grease
  }
  if (categoryKey === 'transmission-drivetrain' && subcategoryKey === 'cv-joints-axles') {
    return 'parts-fluids'; // CV joints/boots + grease
  }
  if (categoryKey === 'custom-service' && subcategoryKey === 'custom') {
    return 'parts-fluids'; // Custom services can have both
  }

  // Fluids-only services (only need fluid input)
  if (categoryKey === 'brake-system' && subcategoryKey === 'brake-fluid') {
    return 'fluids-only'; // Just brake fluid
  }
  if (categoryKey === 'steering-suspension' && subcategoryKey === 'power-steering-fluid') {
    return 'fluids-only'; // Just power steering fluid
  }
  if (categoryKey === 'hvac-climate' && subcategoryKey === 'ac-refrigerant') {
    return 'fluids-only'; // Just A/C refrigerant
  }
  if (categoryKey === 'body-exterior' && subcategoryKey === 'paint-protection') {
    return 'fluids-only'; // Paint/wax/sealant
  }
  if (categoryKey === 'fluids-consumables' && subcategoryKey === 'windshield-washer-fluid') {
    return 'fluids-only'; // Just washer fluid
  }
  if (categoryKey === 'fluids-consumables' && subcategoryKey === 'cleaning-chemicals') {
    return 'fluids-only'; // Brake cleaner, degreaser, etc.
  }
  if (categoryKey === 'cooling-system' && subcategoryKey === 'antifreeze-coolant') {
    return 'fluids-only'; // Just coolant
  }

  // Parts-only services (only need parts input) - this is the most common
  // Brake system
  if (categoryKey === 'brake-system' && (
    subcategoryKey === 'brake-pads-rotors' ||
    subcategoryKey === 'caliper' ||
    subcategoryKey === 'master-cylinder' ||
    subcategoryKey === 'brake-lines'
  )) {
    return 'parts-only';
  }
  
  // Engine & Powertrain
  if (categoryKey === 'engine-powertrain' && (
    subcategoryKey === 'engine-air-filter' ||
    subcategoryKey === 'spark-plugs' ||
    subcategoryKey === 'drive-belts-pulleys' ||
    subcategoryKey === 'valve-cover-gasket' ||
    subcategoryKey === 'pcv' ||
    subcategoryKey === 'throttle-body-maf'
  )) {
    return 'parts-only';
  }
  
  // Cooling System
  if (categoryKey === 'cooling-system' && (
    subcategoryKey === 'thermostat' ||
    subcategoryKey === 'water-pump' ||
    subcategoryKey === 'radiator'
  )) {
    return 'parts-only';
  }
  
  // Steering & Suspension
  if (categoryKey === 'steering-suspension' && (
    subcategoryKey === 'struts-shocks' ||
    subcategoryKey === 'control-arms' ||
    subcategoryKey === 'sway-bars' ||
    subcategoryKey === 'steering-rack'
  )) {
    return 'parts-only';
  }
  
  // Electrical
  if (categoryKey === 'electrical' && (
    subcategoryKey === 'battery' ||
    subcategoryKey === 'alternator' ||
    subcategoryKey === 'starter'
  )) {
    return 'parts-only';
  }
  
  // HVAC & Climate
  if (categoryKey === 'hvac-climate' && (
    subcategoryKey === 'ac-compressor' ||
    subcategoryKey === 'heater-core'
  )) {
    return 'parts-only';
  }
  
  // Body & Exterior
  if (categoryKey === 'body-exterior' && (
    subcategoryKey === 'weatherstripping' ||
    subcategoryKey === 'windshield-wipers'
  )) {
    return 'parts-only';
  }
  
  // Interior Comfort
  if (categoryKey === 'interior-comfort' && subcategoryKey === 'cabin-air-filter') {
    return 'parts-only';
  }
  
  // Lighting
  if (categoryKey === 'lighting' && (
    subcategoryKey === 'headlight-bulbs' ||
    subcategoryKey === 'taillight-bulbs' ||
    subcategoryKey === 'interior-lighting'
  )) {
    return 'parts-only';
  }

  // Default fallback for any service we haven't categorized yet
  // Most automotive services involve parts, so this is a safe default
  return 'parts-only';
};