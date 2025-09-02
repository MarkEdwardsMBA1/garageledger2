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

  'steering-suspension': {
    name: 'Steering & Suspension',
    subcategories: {
      'alignment': {
        name: 'Alignment',
        components: {
          labor: ['Wheel Alignment']
        }
      },
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

  'tires-wheels': {
    name: 'Tires & Wheels',
    subcategories: {
      'tire-rotation-balancing': {
        name: 'Tire Rotation & Balancing',
        components: {
          labor: ['Tire Rotation', 'Wheel Balancing']
        }
      },
      'tire-replacement': {
        name: 'Tire Replacement',
        components: {
          parts: ['Tires']
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
      'cooling-system': {
        name: 'Cooling System',
        components: {
          fluids: ['Antifreeze & Coolant'],
          parts: ['Water Pump', 'Thermostat', 'Radiator']
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
      'shop-materials': {
        name: 'Shop Materials',
        components: {
          parts: ['Shop Rags', 'Gloves', 'Filters', 'Gaskets']
        }
      }
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