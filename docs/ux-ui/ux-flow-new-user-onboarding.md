# GarageLedger – New User Onboarding UX Flows & Global Guidance

## 0. North Star & Success Metrics

-	Primary activation (“First Win”): Account created + first vehicle added (A1).
-	Secondary activation (“Second Win”): First maintenance item logged or reminder scheduled (A2).
-	Targets (tune after baseline):
    -   Time-to-A1 < 3 minutes (p75).
    -	Onboarding completion rate (A1) > 75%.
    - 	Drop-off between email entry and verification < 10%.
    - 	% of users who reach A2 within first session > 40%.
-	Instrumentation: Emit analytics events for every screen view, CTA tap, error, and success milestone (see §10).
 
## 1. Global UX Principles

1.	Stream to first win: ruthlessly cut fields and choices pre–A1; defer everything else.
2.	One decision per screen: clear primary CTA, minimal secondary options.
3.	Positive, automotive tone: “You’re in the driver’s seat”, “Nice tune up!”
4.	Progressive disclosure: advanced fields (e.g., tire size, trim) hidden behind “Show advanced”.
5.	Short, congratulatory success nudges after each milestone; keep them skippable.
6.  Short, tactful error nudges after each error, encouraging corrective user action.
7.	Permission prompts just in time (e.g., ask for notifications only after user schedules a reminder).
8.	Handle edge cases gracefully (VIN not found, duplicate account, offline, expired code).
9.	Accessibility first: sufficient contrast, large tap targets, VoiceOver/TalkBack labels, dynamic type, just-in-time permission logic and fallback paths.
 
## 2. Bilingual Support & Localization

### 2.1 Language Selection Strategy
-	**Auto-detection**: Use device language (iOS/Android locale) as default
-	**Override option**: Manual language picker in Welcome screen
-	**Supported languages**: English (en), Spanish (es)
-	**Persistence**: Save language preference to AsyncStorage for immediate app startup

### 2.2 Cultural Adaptation for Hispanic Users
-	**Family-oriented messaging**: "Track your family's vehicles" vs "Track your vehicle"
-	**Trust building**: Emphasize data ownership and privacy ("Your data stays yours")
-	**Automotive terminology**: Use proper Spanish terms (see Appendix B in PRD)
-	**Visual cues**: Flag icons or language indicators where helpful

### 2.3 Language-Specific Flow Modifications

**English Flow:**
- Direct, efficiency-focused: "Add your first car"
- Individual ownership language: "Your garage"

**Spanish Flow:**  
- Family-inclusive: "Agrega el primer vehículo de la familia"
- Community-oriented: "Tu taller familiar" 
- Extended family considerations: Option to add "Owner name" field for shared vehicles

### 2.4 Onboarding Copy Examples

| Screen | English | Spanish |
|--------|---------|---------|
| Welcome | "Track maintenance, mods & costs — stay in the driver's seat." | "Rastrea mantenimiento, modificaciones y costos — mantente al volante." |
| First Win | "Nice! Your {Year Make Model} is parked in GarageLedger." | "¡Excelente! Tu {Year Make Model} está registrado en GarageLedger." |
| Empty State | "Your garage is empty. Add your first car to get started." | "Tu taller está vacío. Agrega tu primer vehículo para comenzar." |

## 3. High-Level Onboarding Flow Map

```bash
[Splash] → [Language Detection/Selection] → [Welcome/Value Prop] → [Sign up]
  → [Email entry] → [Password entry] → [Account created] → [Congrats #1]
  → [Simplified Vehicle Wizard]
      → [Enter Make, Model, Year only (required)] 
      → [Optional: Nickname, Mileage]
      → [Confirm and save]
  → [Congrats #2 + Prompt next win]
  → [Home Dashboard w/ First Task Suggested]
```

## 4. Screen-by-Screen Detail

### 4.1 Splash Screen

-	Goal: Quick brand recognition, language detection, fast handoff to Welcome.
-	Content: App logo, optional spinner.
-	Background: Auto-detect device language (iOS/Android locale)
-	Auto-advance after 1–1.5s (no forced wait).

### 4.2 Language Selection (if needed)

-	Goal: Confirm or override detected language before onboarding.
-	Trigger: Show only if device language is ambiguous or user previously changed language
-	Options: "English" | "Español" with flag icons
-	Default: Pre-select detected language
-	CTA: Continue / Continuar

### 4.3 Welcome / Value Prop (optional carousel, max 2–3 slides)

-	Goal: Set tone, communicate value quickly.
-	Copy examples (bilingual):
    -	EN: "Track maintenance, mods & costs — stay in the driver's seat."
    -	ES: "Rastrea mantenimiento, modificaciones y costos — mantente al volante."
-	Primary CTA: Get Started / Comenzar
-	Secondary: I already have an account (Login) / Ya tengo una cuenta (Iniciar sesión)
-	Language toggle: Small language picker in corner (EN/ES)
-	Skip option if using multi-slide carousel.

### 3.3 Authentication (Firebase email/password)

-	Goal: Make account creation effortless.
-	Fields:
    -	Email
    -	Password
-	CTA: Create Account
-	Edge cases:
    -	Email already exists → offer Login.
    -	Weak password → show inline guidance.

### 3.4 Email Verification (if configured)

-	Optional: Firebase can send email verification.
-	If used: Require verification link click before proceeding.

### 3.5 Congrats #1 (Account Created)

-	Microcopy: “Welcome to the Garage! Let’s add your first car.”
-	CTA: Add my first vehicle
-	Secondary: Maybe later (takes to Home with prominent “Add vehicle” empty state).

### 4.6 Simplified Vehicle Wizard (1 screen - streamlined for A1 conversion)

#### Single Step: Essential vehicle details only

**Required Fields (for A1 activation):**
-	Make (dropdown or autocomplete)
-	Model (filtered by selected make)
-	Year (dropdown 1990-2025)

**Optional Fields (progressive disclosure):**
-	Nickname (e.g., "Dad's truck") 
-	Current mileage (with units: mi/km based on locale)
-	"Show more options" link → reveals advanced fields post-A1

**Deferred to Post-A1 (reduces friction):**
-	Trim/Package details
-	VIN (can be added later for service lookups)
-	Photo (encouraged but not required for activation)
-	License plate
-	Color

**Validation:** 
-	Required: Make, Model, Year only
-	Smart defaults: Current year pre-selected
-	Error prevention: Model dropdown disabled until Make selected

**Success Screen (Congrats #2) - Bilingual**

-	Message: 
    -	EN: "Nice! Your {Year Make Model} is parked in GarageLedger."
    -	ES: "¡Excelente! Tu {Year Make Model} está registrado en GarageLedger."
-	Next Win CTA: 
    -	EN: Log my last oil change / Add a maintenance reminder
    -	ES: Registrar último cambio de aceite / Agregar recordatorio de mantenimiento
-	Secondary: Take me to the dashboard / Ir al panel principal

### 3.7 Home Dashboard (Post-A1)

-	State: Show the added car with a Next Best Action card:
    -	“Set your first reminder”
    -	“Import past maintenance”
    -	“Add a mod”
-	Progress bar / checklist (optional, non-intrusive): “You’ve completed 1/3 setup steps.”
 
## 5. Global Copy & Tone Guidelines

### 5.1 Universal Principles
-	Warm, hobbyist-friendly, slightly playful but professional.
-	Short, verb-first CTAs: "Add vehicle", "Enter VIN", "Log oil change".
-	Success nudges keep the user moving: include a clear next action.
-	Avoid scare tactics; focus on confidence and control.

### 5.2 Bilingual Microcopy Examples

| Context | English | Spanish |
|---------|---------|---------|
| Success | "You're in the driver's seat — car added!" | "¡Estás al volante — vehículo agregado!" |
| Auth Error | "That password didn't pass inspection — try again." | "Esa contraseña no pasó la inspección — inténtalo de nuevo." |
| Empty State | "Your garage is empty. Add your first car to start tracking." | "Tu taller está vacío. Agrega tu primer auto para comenzar." |
| Loading | "Revving up your garage..." | "Encendiendo tu taller..." |
| CTA Primary | "Add Vehicle" | "Agregar Vehículo" |
| CTA Secondary | "Skip for now" | "Omitir por ahora" |

### 5.3 Cultural Tone Adaptations
**English:** Direct, efficiency-focused, individual ownership
**Spanish:** Family-inclusive, relationship-oriented, community-focused
 
## 6. Edge Cases & Recovery Paths

-	Email already registered: offer quick Login (bilingual error messages).
-	Weak or mismatched passwords: clear inline errors with language-appropriate guidance.
-	Simplified wizard reduces edge cases: no VIN decode, fewer validation points.
-	Network offline: queue actions, show local save w/ sync banner later (localized).
-	User skips car setup: prominent, friendly prompt on Home w/ benefits (culturally adapted).
 
## 7. Permissions Strategy (Just-in-Time)

-	Notifications: ask after user opts into reminders.
-	Camera (if VIN scan supported): request only when the user taps Scan VIN.
-	Photos/Files (vehicle photo or receipts): ask at first add-photo action.
 
## 7. Vehicle Photo Guidelines (UX Icon Style)

-	Purpose: Provide a visual tag or avatar to help users quickly recognize their vehicle.
-	Capture Options: Take a photo with camera or select from device gallery.
-	Required?: Optional field in onboarding, but encouraged.

**Technical Requirements**


**Property** /	**Recommendation**
```bash
Max File Size	500 KB (after compression)
Format	JPG or WebP (preferred for compression)
Target Display Size	200–400px square
Aspect Ratio	1:1 square crop (auto-crop or user crop tool)
Resolution Cap	Resize uploads to max 1024×1024px
Compression	Lossy (JPG/WebP at ~80% quality)
EXIF Data	Strip on upload (privacy + consistency)
File Naming	Use UUID or userID + timestamp
Multiple Uploads	❌ Single image per vehicle
Fallback	Default illustrated icon if no photo provided
```

## 8. Error, Empty, and Loading States Matrix

-   Why: These states quietly impact UX most.

| Screen                     | State Type | Scenario / Trigger                              | Message Copy                                               | UX Pattern                       | Recovery Option(s)                           |
|----------------------------|------------|--------------------------------------------------|-------------------------------------------------------------|----------------------------------|---------------------------------------------|
| Splash Screen              | Error      | App load fails (no connection)                  | “Couldn’t connect — check your internet.”                   | Toast or modal                   | Retry button or auto-retry loop             |
| Email Signup               | Error      | Weak password                                   | “That password didn’t pass inspection — try again.”         | Inline field error               | Password strength hint                      |
| Email Signup               | Error      | Email already registered                        | “Looks like you’ve already got an account.”                 | Inline + link to login           | Redirect to login                          |
| Email Verification         | Loading    | Waiting for link to be clicked                  | “Waiting for confirmation…”                                 | Spinner + dismissible info note | Poll backend or ‘resend email’ option      |
| Simplified Vehicle Wizard  | Error      | Make not selected                               | EN: "Please select your vehicle's make." / ES: "Por favor selecciona la marca de tu vehículo." | Inline under field | Block Model dropdown until resolved |
| Simplified Vehicle Wizard  | Error      | Model not selected                              | EN: "Please select your vehicle's model." / ES: "Por favor selecciona el modelo de tu vehículo." | Inline under field | Block CTA until resolved |
| Simplified Vehicle Wizard  | Error      | Year not selected                               | EN: "Please select your vehicle's year." / ES: "Por favor selecciona el año de tu vehículo." | Inline under field | Block CTA until resolved |
| Vehicle Photo              | Error      | Upload fails / permissions denied               | “Couldn’t access your camera — try again or choose a photo.”| Modal or toast                   | Retry or open gallery instead              |
| Dashboard (Post-A1)        | Empty      | No car added                                    | “Your garage is empty. Add your first car to get started.”  | Illustrated empty state          | Prominent `Add vehicle` CTA                |
| Dashboard (Post-A1)        | Loading    | Fetching car list                               | Skeleton loader or spinner                                 | Skeleton UI                      | Retry if fetch fails                       |
| Global                     | Error      | App offline / network lost                      | “You’re offline — some features may not work.”              | Persistent banner                | Auto-reconnect & sync on restore           |
