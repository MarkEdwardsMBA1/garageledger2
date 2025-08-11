# Navigation System

## Empty State Design 

-   Help new users see tangible value in using the app over time.
-   Visually appealing.
-   Concrete in value.
-   Action-oriented.

**Suggestions/Examples**

-   No vehicles yet?
    -   “Add your first vehicle to begin tracking your maintenance history.”
    -   Illustrate the value: resale value boost, safety, tracking cost.
-   No services logged yet?
    -   “Here’s what your timeline will look like once you log your first oil change.”
    -   Show example history items as grayed out ghost content.
-   No reminders yet?
    -   "Setup reminders to never forget a service again."

## Bottom Nav Bar

**MVP**

-   Dashboard
-   Vehicles
-   Maintenance
-   Settings

**Post-MVP**

-   Dashboard
-   Vehicles
-   Maintenance
-   Fuel
-   Settings

## Dashboard

-   Purpose:
    -   At-a-glance overview of every vehicle.
-   What it shows:
    -   High-level status of all vehicles including any upcoming & overdue items.
    -   Recent activity across all vehicles.
    -   Aggregate stats and notifications.
    -   Quick links to each vehicle's specific "home page".

## Vehicles

-   Purpose:
    -   List all vehicles being tracked.
-   What it shows:
    -   Cards for each vehicle.
    -   Ability to add/edit/delete vehicles.
    -   Access to each vehicle's Vehicle-Specific "Home Page"

### Vehicle-Specific "Home Page"

-   Purpose:
    -   Deep-dive into the specific vehicle.
-   What it shows:
    -   Title: 
    -   The vehicle's maintenance timeline (perhaps the latest 5, 10 or so entries).
    -   Odometer.
    -   Custom reminders.
    -   Cost stats specific to that vehicle.
    -   Document/photo storage.    

## Maintenance

**Pro Tier**

-   Purpose:
    -   Operational command center for fleet maintenance.
-   What it contains:
    -   Status summary at-a-glance.
        -   Total # miles tracked across the fleet.
        -   Total # vehicles with:
            -   Maintenance overdue.
            -   Maintenance due soon (upcoming).
            -   Color-coded indicators.
    -   Planning.
        -   List view of upcoming maintenance service grouped by due date, vehicle, or vehicle group.
        -   Types of reminders:
            -   Mileage-based.
            -   Time-based.
            -   Custom reminder.
    -   Accountability.
        -   Who performed the service.
        -   Option to assign tasks/reminders to drivers or team members.
        -   Notes for who is assigned the service or for administrator.
    -   Cost.
        -   Total aggregate spend (per month, quarter, year, or lfietime?)
        -   Total spend per vehicle (per month, quarter, year, or lifetime?)
        -   Identify high-maintenance vehicles.
        -   Compare cost of maintenance vs vehicle age/odometer.
        -   Compare cost per vendor (if using vendors/shops).
    -   Documents.
        -   Vehicle-specific or global document library.
        -   Searchable by tag/date/service.
    -   Notifications & Alerts.
        -   Email or push notifications to admins or drivers:
            -   Upcoming maintenance.
            -   Missed service deadlines.
            -   Services completed confirmation.
        -   Configurable per vehicle/vehicle group/user.

**Non-Pro Tiers**

-   Purpose:
    -   Help DIYers up-level how they approach car ownership & maintenance, by thinking more strategically and analytically "like a pro."
-   What it contains:
    -   Status summary at-a-glance.
        -   Total # miles tracked across the fleet.
        -   Total # vehicles with:
            -   Maintenance overdue.
            -   Maintenance due soon (upcoming).
            -   Color-coded indicators.
    -   Planning.
        -   List view of upcoming maintenance service grouped by due date, vehicle.
        -   Types of reminders:
            -   Mileage-based.
            -   Time-based.
    -   Cost.
        -   Total aggregate spend (per month, quarter, year, or lfietime?)
    -   Documents.
        -   Vehicle-specific or global document library.
        -   Searchable by tag/date/service.

## Settings

-   Purpose:
    -   Configure everything else, read docs, log out.