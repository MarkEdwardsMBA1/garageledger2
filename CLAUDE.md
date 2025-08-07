# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Our relationship

- We're coworkers. When you think of me, think of me as your colleague "Mark."
- We are a team of people working together. Your success is my success, and my success is yours.
- Technically, I am your boss, but we're not super formal around here.
- I'm smart, but not infallible.
- You are much better read than I am. I have more experience of the physical world than you do. Our experiences are complementary and we work together to solve problems.
- Neither of us is afraid to admit when we don't know something or are in over our head.
- When we think we're right, it's _good_ to push back, but we should cite evidence.

## Development Standards

1. Prioritize simplicity and readability over clever solutions.
2. Start with minimal functionality and verify it works before adding complexity.
3. Test your code frequently with realistic inputs and validate outputs.
4. Create testing environments for components that are difficult to validate directly.
5. Keep core logic clean and push implementation details to the edges.
6. Maintain consistent style (indentation, naming, patterns) throughout the code base.
7. Balance file organization with simplicity - use an appropriate number of files for the project scale.

## Getting Help

- ALWAYS ask for clarification rather than making assumptions.
- If you're having trouble with something, it's ok to stop and ask for help. Especially if it's something your human might be better at.

## Testing Requirements

- Tests MUST cover the functionality being implemented, including edge cases and errors.
- NEVER ignore the output of the system or the tests.
- Logs and messages often contain CRITICAL information.
- TEST OUTPUT MUST BE PRISTINE TO PASS.
- NO EXCEPTIONS POLICY: Every project, regardless of size and complexity, must have unit tests, integration tests, and end-to-end tests, UX-related projects must also have usability testing, and bug fixes must have regression tests.

### We Practice Test-Driven Development (TDD)

- Write tests before writing the implementation code.
- Only write enough code to make the failing test pass.
- Refactor code continuously while ensuring tests still pass.

#### TDD

- Write a failing test that defines a desired function or improvement.
- Run the test to confirm it fails as expected.
- Write minimal code to make the test pass.
- Run the test to confirm success.
- Refactor code to improve design while keeping tests green.
- Repeat the cycle for each new feature or bugfix.

## Project Overview

GarageLedger2 is a React Native mobile application for vehicle maintenance tracking. The app emphasizes offline-first functionality, bilingual support (English/Spanish), and complete user data ownership with Firebase backend.

**Current Status**: Phase 1 MVP complete with production-ready security architecture, hardened development environment, and premium automotive-inspired design system.

## Environment Stability

**Critical Version Lock** - All dependencies are locked to exact versions to prevent compatibility issues:
- **Node.js**: 22.16.0+ (verified compatible)
- **Expo SDK**: 53.0.20 (LTS, stable with Node 22)
- **React**: 19.0.0 (locked)
- **React Native**: 0.79.5 (locked)
- **TypeScript**: 5.8.3 (locked)

**⚠️ Important**: Never use `npm update` or change dependency versions without testing. Use `npx` instead of global Expo CLI to avoid version conflicts.

## Architecture

### Tech Stack
- **Frontend**: React Native with Expo managed workflow
- **Language**: TypeScript (strict mode)  
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **State Management**: Redux Toolkit + RTK Query (planned)
- **Navigation**: React Navigation v6
- **Internationalization**: react-i18next (currently mocked)

### Key Patterns
- **Repository Pattern**: Data access abstraction in `src/repositories/` enables backend flexibility
- **Security-First Design**: All operations require authentication via `ProtectedRoute.tsx`
- **Component-Based Architecture**: Reusable components in `src/components/common/`

## Design System

### Premium Automotive Visual Identity
GarageLedger features a sophisticated automotive-inspired design system that creates a professional, cohesive user experience with emotional connection to car culture.

#### Color Palette
- **Engine Blue** `#1e40af` - Primary brand color (trust, reliability, precision)
- **Racing Green** `#166534` - Secondary color (efficiency, eco-friendly) 
- **Performance Red** `#dc2626` - Accent color (action, power, excitement)
- **Oil Black** `#111827` - Premium text color (deep, sophisticated)
- **Titanium Gray** `#374151` - Secondary text (modern automotive)
- **Chrome Silver** `#9ca3af` - Subtle accents and hints

#### Strategic Alert System
- **Performance Red** `#dc2626` → Positive actions, CTAs, brand elements
- **Signal Orange** `#ea580c` → Warnings, maintenance alerts (like dashboard warning lights)
- **Critical Red** `#b91c1c` → Errors, critical failures
- **Racing Green** `#166534` → Success states, achievements
- **Electric Blue** `#0284c7` → Modern info states, technology features

#### Typography Hierarchy
Enhanced typography system with automotive precision:
- **Display** (36px) - Hero/display text with tight letter spacing
- **Title** (24px) - Page titles with premium weight
- **Heading** (20px) - Section headings with proper hierarchy
- **Subheading** (18px) - Sub-section organization
- **Body/BodyLarge/BodySmall** (14-18px) - Optimized reading experience
- **Caption/Label** (12-14px) - UI labels with wide letter spacing
- **Button** (16px) - Optimized for interaction with wide spacing
- **Overline** (12px) - Small caps with extensive letter spacing

#### Premium Shadows & Depth
Oil Black shadow system for sophisticated visual hierarchy:
- **xs/sm** - Subtle card depth and button elevation  
- **md/lg** - Important content and floating elements
- **xl** - Modal and overlay emphasis
- **Special**: `floating` and `pressed` states for interaction feedback

#### Professional Icon System
Custom SVG automotive icon collection replacing emoji:
- **Functional Icons**: Maintenance, Fuel, Modifications, Reminders, Activity, Camera, Mail
- **Brand Integration**: Consistent sizing, coloring, and automotive theming
- **Accessibility**: Proper contrast and sizing for all interaction states

#### Component Variants
- **Cards**: `default`, `elevated`, `floating`, `outlined`, `filled` with automotive shadows
- **Buttons**: Premium shadows on solid variants, subtle depth on outlined
- **Typography**: Semantic variants for consistent hierarchy
- **Navigation**: Safe area handling for progress indicators and headers

## Development Commands

```bash
# Development
npm start                    # Start Expo dev server
npm run ios                  # iOS simulator
npm run android             # Android emulator

# macOS Networking (for finicky localhost issues)
npm start -- --host tunnel  # External access via tunnel
npm start -- --host lan     # Local network access

# Testing  
npm test                    # Run unit tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report

# Code Quality
npm run lint                # ESLint
npm run type-check          # TypeScript check (always passes)
npm run format              # Prettier formatting
```

## Code Structure

### Core Directories
- `src/components/common/` - Reusable UI components (Button, Card, Input, PhotoPicker, Typography)
- `src/components/icons/` - Professional automotive SVG icon system
- `src/repositories/` - Data access layer with Firebase implementation
- `src/screens/` - App screens with navigation integration
- `src/services/` - External service integrations (Firebase auth)
- `src/contexts/` - React contexts (AuthContext)
- `src/utils/theme.ts` - Comprehensive design system (colors, typography, shadows)

### Security Architecture
- **Authentication**: Enforced via `AuthContext.tsx` and `ProtectedRoute.tsx`
- **Data Isolation**: All Firestore operations filtered by `userId`
- **Repository Security**: `SecureFirebaseVehicleRepository.ts` implements authentication checks

### Testing Strategy
- **Framework**: Jest + React Native Testing Library
- **Coverage**: Security tests, component tests, screen tests, service tests
- **Focus Areas**: Authentication flows, repository security, UI functionality

## Data Models

```typescript
interface Vehicle {
  id: string;
  userId: string;        // Required for data isolation
  make: string;
  model: string; 
  year: number;
  vin?: string;
  mileage: number;
  notes?: string;
  photoUri?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Internationalization

- **Languages**: English (default), Spanish
- **Implementation**: react-i18next with AsyncStorage persistence  
- **Device Detection**: Automatic detection with graceful fallback to English
- **Files**: `src/i18n/locales/en.json`, `src/i18n/locales/es.json`
- **Language Toggle**: Intuitive bottom-placement with current language display
- **Persistence**: User language choice stored and maintained across sessions

## Firebase Configuration

- **Config**: `src/services/firebase/config.ts`
- **Auth**: `src/services/firebase/auth.ts`  
- **Security Rules**: Deployed with complete user data isolation
- **Mock Repository**: Available at `src/services/firebase/mockRepository.ts`

## Development Notes

### Repository Pattern Usage
When adding new data entities, create:
1. Interface in `src/repositories/BaseRepository.ts`
2. Firebase implementation following `FirebaseVehicleRepository.ts`
3. Secure wrapper following `SecureFirebaseVehicleRepository.ts`

### Component Development
- **Theme System**: Use comprehensive theme from `src/utils/theme.ts` (colors, typography, shadows)
- **Typography**: Use semantic variants (`display`, `title`, `heading`, `body`, etc.)
- **Icons**: Import from `src/components/icons/` automotive icon collection
- **Cards**: Choose appropriate variant (`elevated`, `floating`, `outlined`, `filled`)  
- **Colors**: Use automotive color palette (Engine Blue, Racing Green, Performance Red)
- **Shadows**: Apply Oil Black shadow system for premium depth
- **Patterns**: Follow existing component patterns in `src/components/common/`
- **Types**: Implement TypeScript interfaces from `src/types/index.ts`

### Authentication Requirements
- All screens except Login/SignUp must use `ProtectedRoute`
- All repository operations must include userId filtering
- Use `AuthContext` for authentication state management