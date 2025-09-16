# DIY Maintenance Wizard System Documentation

## Overview

The DIY Maintenance Wizard System provides a comprehensive, multi-step interface for users to log DIY (Do-It-Yourself) vehicle maintenance services. The system automatically routes services to appropriate specialized screens based on their requirements for parts, fluids, or both.

## System Architecture

### Core Components

```typescript
// Main wizard entry point
DIYServiceWizardScreen.tsx          // 4-step unified wizard container
├── DIYBasicInfoStep.tsx           // Step 1: Date, mileage, basic info
├── DIYServicesStep.tsx            // Step 2: Service selection & forms
├── DIYPhotosStep.tsx              // Step 3: Photo capture (optional)
└── DIYReviewStep.tsx              // Step 4: Review & save

// Service form routing system
ServiceFormRouter.tsx               // Routes services to appropriate forms
└── ServiceFormMapping.ts          // Maps services to screen types

// Specialized form screens
├── OilChangeWizard.tsx            // 2-step: Oil Filter → Motor Oil
├── TailoredPartsScreen.tsx        // Single part entry
├── GeneralPartsScreen.tsx         // Multi-part with "Add Another"
├── FluidsScreen.tsx               // Single fluid with capacity/units
└── PartsAndFluidsWizard.tsx       // 2-step: Parts → Fluids
```

### Wizard Flow

```
Log Maintenance → "DIY" →
DIY Wizard Step 1 (Basic Info) →
DIY Wizard Step 2 (Services & Forms) →
DIY Wizard Step 3 (Photos - Optional) →
DIY Wizard Step 4 (Review) →
Auto-save & Return to Vehicle Details
```

## Service Form Mapping Matrix

Based on the service requirements spreadsheet, services are automatically routed to appropriate specialized screens:

### Screen Types & Usage

| **Screen Type** | **Usage** | **Requirements** | **Wireframe** |
|-----------------|-----------|------------------|---------------|
| `oil_and_oil_filter` | Oil & Oil Filter Changes | Special 2-step flow with viscosity | `diy_service_oil_oil_filter_change_wireframe.jpg` |
| `tailored_parts` | Single part services | One part, no fluids | `diy_tailored_part_wireframe.jpg` |
| `parts` | Multi-part services | Multiple parts, no fluids | `diy_service_general_parts_wireframe.jpg` |
| `fluids` | Fluid-only services | No parts, fluids with capacity | `diy_service_fluid_wireframe.jpg` |
| `parts_and_fluids` | Complex services | Both parts and fluids | `diy_service_parts_fluids_wireframe.jpg` |
| `none` | Simple services | No additional data needed | N/A |

### Service Mapping Examples

```typescript
// Examples from SERVICE_FORM_MAPPING
'engine-powertrain.oil-filter-change': 'oil_and_oil_filter',
'engine-powertrain.engine-air-filter': 'tailored_parts',
'brake-system.brake-pads-rotors': 'parts',
'brake-system.brake-fluid': 'fluids',
'transmission-drivetrain.transmission-pdk': 'parts_and_fluids',
'tires-wheels.tire-rotation': 'none',
```

## Specialized Screen Implementations

### 1. Oil & Oil Filter Change Screen (`oil_and_oil_filter`)

**Wireframe:** `diy_service_oil_oil_filter_change_wireframe.jpg`
**Purpose:** Handle the unique requirements of oil changes with separate oil filter and motor oil entries.

#### 2-Step UX Flow
- **Reusable status bar indicator** at top of screen
- **Step 1 - Oil Filter:**
  - Header Title: "Oil Filter"
  - Input Labels: Brand (Optional), Part Number (Optional), **Cost (Required)**
  - CTA: Cancel (white) | Next (blue)
- **Step 2 - Motor Oil:**
  - Header Title: "Motor Oil"
  - Input Labels: Brand (Optional), Part Number (Optional), Viscosity (Optional)
    - Cold weather viscosity input
    - Hot weather viscosity input
  - **Quantity (Required)**, Unit Capacity, Unit Cost, **Total Cost (Calculated)**
  - Quick Picks: Ounces, Quart, Gallon
  - CTA: Cancel (white) | Save (blue) - side-by-side

```typescript
interface OilChangeData {
  oilFilter: PartEntryData;
  motorOil: MotorOilData;
  totalCost: number; // Calculated: oilFilter.cost + motorOil.totalCost
}
```

### 2. Tailored Parts Screen (`tailored_parts`)

**Wireframe:** `diy_tailored_part_wireframe.jpg`
**Purpose:** Single part services like Engine Air Filter, Spark Plugs, Battery.

#### Single-Step UX Flow
- **Header Title:** Selected Service Name
- **Input Labels:** Brand (Optional), Part Number (Optional), **Cost (Required)**
- **CTA:** Cancel (white) | Save (blue) - side-by-side

```typescript
interface PartEntryData {
  brand: string;
  partNumber: string;
  cost: string; // Required for tailored parts
}
```

### 3. General Parts Screen (`parts`)

**Wireframe:** `diy_service_general_parts_wireframe.jpg`
**Purpose:** Multi-part services like Brake Pads & Rotors, Drive Belts.

#### Single-Step UX Flow
- **Header Title:** Selected Service Name
- **Input Labels:** Brand (Optional), Part Number (Optional), **Quantity (Required)**, **Unit Cost (Required)**, **Total Cost (Calculated)**
- **CTA:** Add Another Part (blue, full width), Cancel (white) | Save (blue) - side-by-side

```typescript
interface GeneralPartsData {
  parts: PartEntryData[];
  totalCost: number; // Sum of all part costs
}
```

### 4. Fluids Screen (`fluids`)

**Wireframe:** `diy_service_fluid_wireframe.jpg`
**Purpose:** Fluid-only services like Brake Fluid, Power Steering Fluid.

#### Single-Step UX Flow
- **Header Title:** Selected Service Name
- **Input Labels:** Brand (Optional), Part Number (Optional), **Quantity (Required)**, Unit Capacity, **Unit Cost (Required)**, **Total Cost (Calculated)**
- **Quick Picks:** Ounces, Quart, Gallon
- **CTA:** Cancel (white) | Save (blue) - side-by-side

```typescript
interface FluidEntryData {
  brand: string;
  partNumber: string;
  quantity: string;
  unitCapacity: string;
  unitCapacityType: 'Ounces' | 'Quart' | 'Gallon';
  unitCost: string;
  totalCost: string; // Calculated
}
```

### 5. Parts & Fluids Screen (`parts_and_fluids`)

**Wireframe:** `diy_service_parts_fluids_wireframe.jpg`
**Purpose:** Complex services requiring both parts and fluids like Transmission service.

#### 2-Step UX Flow
- **Reusable status bar indicator** at top of screen
- **Step 1 - Parts:**
  - Header Title: Selected Service, Screen Title: "Parts"
  - Input Labels: **Description (Required)**, Brand (Optional), Part Number (Optional), **Quantity (Required)**, **Unit Cost (Required)**, **Total Cost (Calculated)**
  - CTA: Add Another Part (blue, full width), Cancel (white) | Next (blue) - side-by-side
- **Step 2 - Fluids:**
  - Header Title: Selected Service, Screen Title: "Fluids"
  - Input Labels: **Description (Required)**, Brand (Optional), Part Number (Optional), **Quantity (Required)**, Unit Capacity, **Unit Cost (Required)**, **Total Cost (Calculated)**
  - Quick Picks: Ounces, Quart, Gallon
  - CTA: Add Another Fluid (blue, full width), Cancel (white) | Save (blue) - side-by-side

```typescript
interface PartsAndFluidsData {
  parts: PartEntryData[];
  fluids: FluidEntryData[];
  totalCost: number; // Sum of parts + fluids
}
```

## Technical Implementation

### Service Form Router

The `ServiceFormRouter` component automatically routes services to the correct specialized screen:

```typescript
const formType = getServiceFormType(service.serviceId);
// Routes to: OilChangeWizard | TailoredPartsScreen | GeneralPartsScreen | etc.
```

### Validation Requirements

Input validation follows these rules:

#### Required Fields (marked in wireframes)
- **All screens:** Cost-related fields are required and must be valid numbers
- **Multi-item screens:** Quantity is required for parts/fluids
- **Parts & Fluids screen:** Description is required for both parts and fluids

#### Optional Fields (marked as "(Optional)" in wireframes)
- Brand, Part Number, Viscosity inputs
- These can be left empty without validation errors

### Cost Calculations

All cost calculations are handled by the domain layer `CalculationService`:

```typescript
// Automatic total cost calculation
totalCost = parts.reduce((sum, part) => sum + parseFloat(part.cost), 0) +
           fluids.reduce((sum, fluid) => sum + parseFloat(fluid.totalCost), 0);
```

### Data Flow Integration

1. **ServiceFormRouter** receives selected service from DIY wizard step 2
2. **Form completion** returns `ServiceFormData` with typed data structure
3. **DIY wizard step 4** aggregates all service form data for review
4. **Save operation** converts wizard data to `MaintenanceLog` format
5. **Navigation** returns to Vehicle Details screen (consistent with Shop Service)

## UX Design Patterns

### Consistent Button Layout
- **Cancel:** Always white/outline variant, left side
- **Primary Action:** Always blue/primary variant, right side
- **Add Another:** Always blue/primary variant, full width (above Cancel/Save)

### Step Indicators
- **Multi-step forms:** Use reusable status bar indicator at top
- **Step Labels:** Clear, descriptive titles (e.g., "Oil Filter", "Motor Oil")
- **Progress:** "Step X of Y: [Current Step Name]"

### Form Field Standards
- **Required fields:** No "(Optional)" label, validation enforced
- **Optional fields:** Clearly marked "(Optional)", no validation
- **Quick Picks:** Standardized capacity units (Ounces, Quart, Gallon)
- **Number inputs:** Support dollar signs, commas for cost formatting

### Visual Hierarchy
- **Engine Blue header** (`#1e40af`) with white text for titles/steps
- **Automotive shadow system** for card depth and button elevation
- **Typography variants** following design system (title, body, caption)

## Current Status & Integration

### ✅ Implemented
- **Core wizard flow:** 4-step DIY wizard with WizardContainer
- **Service form routing:** Automatic routing based on service requirements
- **Specialized screens:** All 5 screen types implemented with proper wireframes
- **Validation system:** Required/optional field validation with error handling
- **Cost calculations:** Domain-layer calculation service integration
- **Data persistence:** Proper MaintenanceLog creation and Firebase storage

### 🔄 In Progress
- **Professional icons:** Replacing emoji with SVG automotive icons
- **Advanced validation:** Enhanced error messaging and field validation
- **Testing coverage:** Unit tests for all specialized screens

### 📋 Future Enhancements
- **Service suggestions:** AI-powered service recommendations based on history
- **Parts lookup:** Integration with parts databases for auto-complete
- **Cost analytics:** Integration with vehicle cost tracking and analytics
- **Receipt scanning:** OCR integration for receipt data extraction

## File Structure

```
src/
├── screens/
│   └── DIYServiceWizardScreen.tsx           # Main wizard controller
├── components/
│   ├── wizards/diy/                         # DIY wizard steps
│   │   ├── DIYBasicInfoStep.tsx
│   │   ├── DIYServicesStep.tsx
│   │   ├── DIYPhotosStep.tsx
│   │   └── DIYReviewStep.tsx
│   └── forms/
│       ├── ServiceFormRouter.tsx            # Form routing logic
│       ├── screens/                         # Specialized form screens
│       │   ├── OilChangeWizard.tsx
│       │   ├── TailoredPartsScreen.tsx
│       │   ├── GeneralPartsScreen.tsx
│       │   ├── FluidsScreen.tsx
│       │   └── PartsAndFluidsWizard.tsx
│       └── parts/                           # Reusable form components
│           ├── PartEntryForm.tsx
│           ├── FluidEntryForm.tsx
│           └── MotorOilForm.tsx
├── domain/
│   ├── ServiceFormMapping.ts                # Service-to-screen mapping
│   └── CalculationService.ts                # Cost calculation logic
└── types/
    └── wizard.ts                           # TypeScript interfaces
```

This documentation reflects the complete implementation of the DIY maintenance wizard system as specified in the requirements and wireframes.