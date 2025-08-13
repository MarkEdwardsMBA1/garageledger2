# Updated Navigation & Main Screens Update

## 1. Requirements

### Updated Navigation & Screen Structure

-	Remove Dashboard nav element and screen
    -	Eliminate all Dashboard references from navigation.
    -	Migrate any useful, non-overlapping Dashboard elements into the Maintenance (to be renamed Insights) screen.
-	Update Vehicles screen as the new home
    -	Vehicles replaces Dashboard as the first nav item (leftmost/bottom-most).
    -	Vehicles retains its icon and functionality.
-	Rename Maintenance to Insights
    -	Replace wrench icon with the Dashboard’s speedometer icon.
    -	Integrate any migrated Dashboard data/cards here.
-	Add new nav element: Programs (name TBD)
    -	Positioned between Vehicles and Insights in the nav bar.
    -	New icon (calendar, clipboard with checklist, or custom “program” symbol).
    -	Tapping opens new Programs screen.
 
### Programs Feature (New)

-	Create a maintenance program
    -	Select whether program is for:
        -	A single vehicle.
        -	Multiple vehicles.
    -	Define tasks:
        -	Task name.
            - If individual vehicle selected, defaults to vehicle name
        -	Frequency (mileage, time, or both).
        -	Required parts or fluids (optional).
        -	Notes.
-	Program management
    -	Edit, duplicate, or delete programs.
    -	Apply/remove programs from vehicles.
-	Integration with reminders
    -	Generate reminders based on active program tasks.
    -	Show upcoming, overdue, and completed tasks per vehicle.
-	Compliance tracking
    -	Per-vehicle visual indicator of how up-to-date maintenance is.
    -	Historical completion rate and average lateness.
-	Forecasting
    -	Aggregate upcoming program tasks into a projected cost estimate for chosen timeframes (e.g., next month, next 12 months).
 
### Onboarding

-	Welcome messaging
    -	Remove “Welcome to GarageLedger” from all core screens, keep in onboarding experience.
    -	Ensure it appears once in early onboarding (but not Splash screen).
 
## 2. User Stories

### Navigation & Structure

-	As a user, I want the Vehicles screen to be my default home page so that I can quickly see all my cars and jump into the one I want.
-	As a user, I want Insights to show my vehicle status, maintenance history, and upcoming reminders in one place so that I can quickly assess my fleet’s health.
-	As a user, I want to have a Schedules feature so that I can define and manage maintenance programs without relying on factory defaults.
Schedules Feature
-	As a DIY car owner, I want to create a custom maintenance schedule for a single vehicle so that I can tailor upkeep to my unique driving conditions.
-	As a small business owner, I want to apply one maintenance schedule to multiple vehicles so that I can standardize my fleet’s upkeep.
-	As a power user, I want to add detailed part and fluid info for each task so that I have everything I need when ordering or performing maintenance.
-	As a user, I want to see reminders for upcoming maintenance based on my custom schedule so that I never miss important work.
-	As a user, I want to track compliance with my maintenance schedule so that I can see whether I’m keeping up with my plan.
-	As a user, I want to forecast future maintenance costs so that I can budget ahead.
 
## 3. UX Flows

### A. Navigation Restructure

#### 1.	User opens app → lands on Vehicles screen (new default).

#### 2.	Bottom nav order:

-	Vehicles (icon unchanged).
-	Prgrams (new).
-	Insights (renamed from Maintenance, speedometer icon).
-	Settings.
 
### B. Creating a New Maintenance Schedule

1.	Programs screen → “Create Program” button.
2.	Form Step 1: Name program.
3.	Form Step 2: Choose “Single vehicle” or “Multiple vehicles” and select vehicles.
4.	Form Step 3: Add tasks:
    -	Task name.
    -	Frequency:
    -	Time (every X months).
    -	Mileage (every X miles).
    -	Or both (whichever comes first).
        -	Notes.
        -	Add another task (repeat as needed).
5.	Form Step 4: Review summary and save.
 
### C. Viewing and Managing Programs

1.	On Programs screen, see a list of programs.
2.	Each schedule card shows:
-	Name.
-	Vehicles assigned.
-	Number of tasks.
-	Next due task(s).
3.	Tap a schedule to:
-	Edit tasks.
-	Add/remove vehicles.
-	Duplicate schedule.
-	Delete schedule.
 
### D. Insights Screen (formerly Maintenance)

-	Top section: Vehicle health overview (cards migrated from old Dashboard).
-	Middle section: Upcoming reminders (based on schedules).
-	Bottom section: Compliance and cost forecasting.
