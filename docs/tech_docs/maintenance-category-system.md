# Maintenance Category System

## Overview

The GarageLedger maintenance category system provides a comprehensive, hierarchical structure for organizing automotive maintenance services. This system supports both DIY and professional shop maintenance tracking across 13 major categories with 60+ specific services.

## Maintenance Definition

Preventive replacement of parts and/or fluids with OEM or equivalent aftermarket parts & fluids. Typically, users setup and follow their defined maintenance program schedule with configurable intervals based on mileage, time, or both.

## Service Configuration Types

The system supports four service configuration types:
- **Parts + Fluids**: Services requiring both parts and fluid tracking
- **Parts Only**: Services requiring only parts tracking (most common)
- **Fluids Only**: Services requiring only fluid tracking
- **Labor Only**: Services requiring only labor (no parts/fluids needed)

## Category Display Order

Categories are displayed in the following priority order across all interfaces:

1. **Engine & Powertrain**
2. **Cooling System**
3. **Transmission & Drivetrain**
4. **Brake System**
5. **Tires & Wheels**
6. **Steering & Suspension**
7. **Interior Comfort & Convenience**
8. **HVAC & Climate Control**
9. **Lighting**
10. **Electrical**
11. **Body & Exterior**
12. **Fluids & Consumables**
13. **Custom Service**

## Complete Category Structure

### Engine & Powertrain
- **Oil & Oil Filter Change** (Parts + Fluids)
  - Motor Oil (Fluids)
  - Oil Filter (Parts)
- **Engine Air Filter** (Parts Only)
- **Spark Plugs** (Parts Only)
- **Drive Belts & Pulleys** (Parts Only)
  - Drive Belts (Parts)
  - Pulleys (Parts)
- **Valve Cover Gasket** (Parts Only)
- **PCV** (Parts Only)
- **Throttle Body & MAF Sensor Cleaning** (Parts Only)

### Cooling System
- **Thermostat** (Parts Only)
- **Water Pump** (Parts Only)
- **Radiator** (Parts Only)
- **Antifreeze & Coolant** (Fluids Only)

### Transmission & Drivetrain
- **Transmission & PDK** (Parts + Fluids)
  - Transmission Fluid, PDK Fluid (Fluids)
  - Internal/External Transmission Filters, Strainers, Drain Plug, Washer, Oil Pan Gasket (Parts)
- **Front Differential** (Parts + Fluids)
  - Front Differential Fluid (Fluids)
  - Front Differential Drain Plug, Washer, Gaskets (Parts)
- **Rear Differential** (Parts + Fluids)
  - Rear Differential Fluid (Fluids)
  - Rear Differential Drain/Fill Plugs, Washers, Gaskets (Parts)
- **Center Differential** (Parts + Fluids)
  - Center Differential Fluid (Fluids)
  - Center Differential Drain/Fill Plugs, Washers, Gaskets (Parts)
- **Transfer Case** (Parts + Fluids)
  - Transfer Case Fluid (Fluids)
  - Transfer Case Drain/Fill Plugs, Washers, Gaskets (Parts)
- **Driveshaft** (Parts + Fluids)
  - Grease (Fluids)
  - Slip Yoke Service, Spider Joint Service, U-Joint Service, Re-Torque (Labor)
- **CV Joints & Axles** (Parts + Fluids)
  - CV Joints, CV Axles, CV Boots (Parts)

### Brake System
- **Brake Pads & Rotors** (Parts Only)
  - Brake Pads, Brake Rotors, Anti-Rattle Clips (Parts)
- **Caliper** (Parts Only)
- **Master Cylinder** (Parts Only)
- **Brake Lines** (Parts Only)
- **Brake Fluid** (Fluids Only)

### Tires & Wheels *(Updated Implementation)*
- **Tire Rotation** (Labor Only)
  - Available in: DIY Mode, Shop Mode, Create Program
  - Configuration: Labor-only service (no parts/fluids required)
  - Description: Rotating tires to ensure even wear and extend tire life
- **Balancing** (Labor Only)
  - Available in: Shop Mode only, Create Program
  - Configuration: Labor-only service (no parts/fluids required)
  - Description: Wheel balancing to eliminate vibration and improve ride quality
  - *Note: Excluded from DIY mode (requires professional equipment)*

### Steering & Suspension
- **Struts/Shocks, Springs, Coilovers & Top Mounts** (Parts Only)
- **Control Arms, Trailing Arms, Ball Joints & Tie Rods** (Parts Only)
  - Upper/Lower Control Arms & Bushings, Trailing Arms, Ball Joints, Tie Rods (Parts)
- **Sway Bars, Links & Bushings** (Parts Only)
  - Front/Rear Sway Bars, End Links, Bushings (Parts)
- **Steering Rack** (Parts Only)
- **Power Steering Fluid** (Fluids Only)

### Interior Comfort & Convenience
- **Cabin Air Filter** (Parts Only)

### HVAC & Climate Control
- **A/C Refrigerant Recharge** (Fluids Only)
- **A/C Compressor** (Parts Only)
- **Heater Core** (Parts Only)

### Lighting
- **Headlight Bulbs** (Parts Only)
  - Headlight Bulbs, HID Bulbs, LED Headlights (Parts)
- **Taillight Bulbs** (Parts Only)
  - Taillight Bulbs, LED Taillights (Parts)
- **Interior Lighting** (Parts Only)
  - Interior LED Bulbs, Dome Light Bulbs (Parts)

### Electrical
- **Battery** (Parts Only)
- **Alternator** (Parts Only)
- **Starter** (Parts Only)

### Body & Exterior
- **Paint Protection/Touch-up** (Fluids Only)
  - Touch-up Paint, Paint Protection Film, Wax, Sealant (Parts)
- **Weatherstripping** (Parts Only)
  - Door Seals, Window Seals, Trunk Seals (Parts)
- **Windshield Wipers** (Parts Only)
  - Wiper Blades, Wiper Arms (Parts)

### Fluids & Consumables
- **Windshield Washer Fluid** (Fluids Only)
- **Cleaning & Chemicals** (Fluids Only)
  - Brake Cleaner, Penetrating Oil, Degreaser (Fluids)

### Custom Service
- **Custom Service** (Parts + Fluids)
  - User-defined maintenance reminders
  - Configurable for any combination of parts, fluids, and labor
  - Examples: State Inspection, Smog Check, Custom Modifications

## DIY vs Shop Availability

### DIY Mode Exclusions
Services excluded from DIY mode (require professional equipment):
- **Steering & Suspension**: Alignment
- **Tires & Wheels**: Balancing *(requires professional balancing equipment)*
- **Fluids & Consumables**: Shop Materials

### Shop Mode
All services available, including professional-only services like wheel balancing and alignment.

## Implementation Notes

- **Database Storage**: Services stored with `categoryKey` and `subcategoryKey` for unified reporting
- **Reporting**: All maintenance logs aggregate properly regardless of DIY vs Shop performance
- **Icon Integration**: Each category has dedicated automotive-themed SVG icons
- **Internationalization**: Full English/Spanish support for all category and service names
- **Program Support**: All services available in Advanced Program creation with configurable intervals
