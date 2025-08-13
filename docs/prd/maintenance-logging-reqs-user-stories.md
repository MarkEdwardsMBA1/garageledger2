# GarageLedger Maintenance Logging Requirements, Stories, and Flow

## 1. Core Goals

-   Low-friction for casual users:
    -	Quick entry for essential data (date, mileage, basic service type).
    -	Ability to log without navigating deep menus.

-	Highly detailed for power users:
    -	Full parts and fluids tracking with brand, model, quantity, unit cost, etc.
    -	Nested categories matching maintenance-system.md (high-level → sub-category → part/fluid).

-	Consistency across DIY and shop-performed services:
    -	DIY → prompts for parts/fluids.
    -	Shop → allows summary-only or detailed invoice-level entries.
 
## 2. Functional Requirements

### 2.1 Basic Entry Flow

1.	User selects:
    -	Vehicle (from their garage).
    -	Service Type (category/subcategory from maintenance-system.md).

2.	User enters:
    -	Service date (default = today).
    -	Mileage at service.
    -	Performed by:
        -	DIY
        -	Shop

### 2.2 DIY Service Flow

-	Parts Tracking:
    -	Add one or more parts.
    -	Fields:
        -	Brand name (text).
        -	Model/part number (text).
        -	Quantity (numeric).
        -	Unit of measure (each, set, pair).
        -	Unit cost & total cost.
-	Fluids Tracking:
    -	Add one or more fluids.
    -   Fields:
        -	Brand name.
        -	Specification (weight/viscosity or standard, e.g., 5W-30, DOT 3).
        -	Quantity.
        -	Unit of measure (quarts, liters, ounces).
        -	Unit cost & total cost.
-	Notes:
    -	Optional free text for procedure notes, tools used, etc.
-	Receipts / Attachments:
    -	Option to upload photos of receipts, part boxes, etc.

### 2.3 Shop Service Flow

-	High-level entry:
    -	Service description (e.g., “Oil change”).
    -	Total cost.
    -	Notes (optional).
    -	Shop name/contact (optional).
-   Optional detailed entry:
    -	Same parts/fluids fields as DIY, if user has info.

### 2.4 Category & Subcategory System

-	Categories and subcategories must align with maintenance-system.md.
-	User chooses category first → subcategory → parts/fluids list (if applicable).
-	Example:
    -	Category: Brakes
    -	  Subcategory: Front brake service
    -	    Parts: brake pads (set), rotors (each)

### 2.5 Special Case Handling

-	Unit of sale awareness:
    -	Some parts are sold in sets (e.g., brake pads front = set of 2).
    -	Some are sold individually (e.g., front rotors = each).
    -	This should be pre-set from maintenance-system.md so quantity defaults make sense.
-	Front vs. Rear:
    -	Subcategories differentiate front vs. rear, with distinct part numbers/specs.

### 2.6 Viewing & Editing Logs

-	List view:
    -	Chronological or mileage-based.
    -	High-level summary (date, mileage, service type, performed by).
-	Detail view:
    -	Full part/fluid info, costs, and notes.
-	Editing:
    -	Ability to modify any entry after creation.

### 2.7 Data Model Requirements

-	Each maintenance entry must store:
    -	Vehicle ID.
    -	Category & subcategory ID.
    -	Date performed.
    -	Mileage.
    -	Performed by (DIY/Shop).
    -	Parts list (array of objects).
    -	Fluids list (array of objects).
    -	Costs (per part/fluid & total).
    -	Notes.
    -	Attachments.
 
## 3. User Stories

### 3.1 Casual User Stories

1.	As a casual user, I want to quickly log an oil change with just the date, mileage, and a short description so I can keep my records up-to-date without extra steps.
2.	As a casual user, I want to mark a service as “performed by shop” so I don’t have to enter all part details.
3.	As a casual user, I want the app to remember the last shop I entered so I can quickly reuse it.

### 3.2 Power User Stories

4.	As a power user, I want to record the exact brand, part number, quantity, and cost of each part I used so I can track costs and ensure quality in future services.
5.	As a power user, I want to record fluid specifications (e.g., 5W-30 oil, DOT 3 brake fluid) so I can maintain performance and compatibility.
6.	As a power user, I want the system to pre-fill unit of measure defaults based on the selected category/subcategory so I don’t have to manually check each item.
7.	As a power user, I want to attach receipts or images of parts so I have proof of purchase and reference material.

### 3.3 Shared User Stories

8.	As any user, I want to view a timeline of all my past maintenance events sorted by date or mileage so I can track my vehicle’s history.
9.	As any user, I want to search or filter by service type (e.g., brakes, oil change) so I can find past entries quickly.
10.	As any user, I want to edit or delete maintenance entries in case I make a mistake or need to update info later.


## 4. Maintenance Logging UX FLow

START
 │
 ▼
Select Vehicle
 │
 ▼
Select Category (from maintenance-system.md)
 │
 ▼
Select Subcategory (from maintenance-system.md)
 │
 ▼
Enter Date (default = today) + Mileage
 │
 ▼
Performed by:
 ├── DIY ──────────────────────────────────────────────┐
 │    ▼                                                 │
 │  Add Parts? (Yes/No)                                 │
 │    ├─ Yes: Add parts list (brand, part#, qty, unit, cost)
 │    └─ No: Skip to fluids                             │
 │    ▼                                                 │
 │  Add Fluids? (Yes/No)                                │
 │    ├─ Yes: Add fluids list (brand, spec, qty, unit, cost)
 │    └─ No: Skip                                      │
 │    ▼                                                 │
 │  Add Notes (optional)                                │
 │  Add Attachments (optional)                          │
 │    ▼                                                 │
 │  Review & Save                                       │
 │                                                      │
 └── Shop ─────────────────────────────────────────────┘
      ▼
   Enter Service Description (free text)
   Enter Total Cost
   Shop Name / Contact (optional)
   Notes (optional)
   Upload Invoice / Attachments (optional)
      ▼
   Review & Save
