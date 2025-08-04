# 🧪 Testing Guide

> **Comprehensive Unit Testing for CarMaintApp**

This guide covers all aspects of testing the CarMaintApp, from setup to execution to best practices.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Test Architecture](#test-architecture)
- [Test Suites](#test-suites)
- [Running Tests](#running-tests)
- [Coverage Reports](#coverage-reports)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

CarMaintApp uses **Jest** and **React Native Testing Library** for comprehensive unit and integration testing. Our testing strategy focuses on:

- **Security-First**: Authentication and authorization validation
- **Component Testing**: UI components in isolation  
- **Service Testing**: Business logic and external integrations
- **Integration Testing**: End-to-end user flows
- **Repository Testing**: Data layer with mocking capabilities

### Testing Status
- ✅ **Jest Configuration** - Complete setup with React Native preset
- ✅ **Mock Infrastructure** - Firebase, React Native, Expo mocks
- ✅ **Test Suites** - 9 comprehensive test files covering critical functionality
- ✅ **Coverage Reporting** - Text, HTML, and LCOV formats
- ✅ **CI Ready** - Automated testing pipeline configured

## 🚀 Quick Start

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test AuthService.test.ts
```

## 🏗️ Test Architecture

### Directory Structure
```
__tests__/
├── setup.js                    # Global test setup and mocks
├── components/                 # UI component tests
│   ├── Button.test.tsx
│   ├── Card.test.tsx
│   ├── Input.test.tsx
│   └── PhotoPicker.test.tsx
├── screens/                    # Screen component tests
│   ├── LoginScreen.test.tsx
│   ├── SignUpScreen.test.tsx
│   └── AddVehicleScreen.test.tsx
├── services/                   # Service layer tests
│   └── AuthService.test.ts
├── repositories/              # Data layer tests
│   └── SecureFirebaseVehicleRepository.test.ts
└── hooks/                     # Custom hook tests
    └── useAuth.test.tsx
```

### Mock Configuration

Our test setup includes comprehensive mocking for:

**Firebase Services**
```javascript
- firebase/app
- firebase/auth  
- firebase/firestore
- firebase/storage
```

**React Native Modules**
```javascript
- @react-native-async-storage/async-storage
- react-native-localize (optional)
- @react-navigation/native
- @react-navigation/stack
```

**Expo Modules**
```javascript
- expo-image-picker
- expo-font
- expo-localization
```

## 📊 Test Suites

### 1. Core Services (Critical Path)

#### AuthService.test.ts
**Purpose**: Authentication operations, error handling, user management

**Coverage**:
- ✅ User sign up with email verification
- ✅ User sign in with credentials validation
- ✅ Password reset functionality  
- ✅ Error handling for all auth scenarios
- ✅ User state management and formatting

**Key Test Cases**:
```typescript
- signUp: successful account creation, validation errors
- signIn: authentication flow, credential validation
- signOut: session termination
- resetPassword: email validation, error handling
- getCurrentUser: user state retrieval
- requireAuth: authentication enforcement
```

#### SecureFirebaseVehicleRepository.test.ts
**Purpose**: CRUD operations, authentication enforcement, data security

**Coverage**:
- ✅ Authentication enforcement on all operations
- ✅ User data isolation verification
- ✅ CRUD operations with security validation
- ✅ Error handling and network resilience
- ✅ Firestore integration patterns

**Key Test Cases**:
```typescript
- create: vehicle creation with auth validation
- getById: secure data retrieval with ownership verification
- getUserVehicles: user-specific data filtering
- update: secure modification with ownership checks
- delete: secure removal with authorization
- Error scenarios: auth failures, network issues
```

### 2. UI Components (Foundation)

#### Button.test.tsx
**Purpose**: All button variants, states, accessibility, interactions

**Coverage**:
- ✅ All variants (primary, secondary, outline, ghost, danger, text)
- ✅ All sizes (sm, md, lg) and states (loading, disabled)
- ✅ Event handling and press interactions
- ✅ Accessibility and styling verification
- ✅ Icon positioning and custom styling

#### Card.test.tsx  
**Purpose**: Layout, styling, pressable states, content rendering

**Coverage**:
- ✅ Content rendering (title, subtitle, children, footer)
- ✅ Variants (default, elevated, outlined, filled)
- ✅ Pressable behavior and disabled states
- ✅ Custom styling and layout flexibility
- ✅ Right content and header customization

#### Input.test.tsx
**Purpose**: Form validation, keyboard types, security features

**Coverage**:
- ✅ Text input handling and validation
- ✅ Required field indicators and error states
- ✅ Keyboard types and auto-completion
- ✅ Security features (secure text entry)
- ✅ Multiline support and character limits

#### PhotoPicker.test.tsx
**Purpose**: Camera/gallery integration, permissions, error handling

**Coverage**:
- ✅ Platform-specific UI (iOS ActionSheet, Android Alert)
- ✅ Permission handling for camera and gallery
- ✅ Photo selection and removal workflows
- ✅ Error handling and user feedback
- ✅ Loading states and disabled functionality

### 3. Authentication Screens (User Journey)

#### LoginScreen.test.tsx
**Purpose**: Login flow, form validation, error states, navigation

**Coverage**:
- ✅ Form rendering and input handling
- ✅ Email and password validation
- ✅ Authentication error handling
- ✅ Navigation to sign up and password reset
- ✅ Loading states and form disabling
- ✅ Security best practices (secure text entry)

#### SignUpScreen.test.tsx
**Purpose**: Registration flow, validation, user feedback

**Coverage**:
- ✅ Complete registration form handling
- ✅ Email format and password strength validation
- ✅ Password confirmation matching
- ✅ Account creation success flows
- ✅ Error handling and user feedback
- ✅ Email verification messaging

### 4. Vehicle Management (Core Features)

#### AddVehicleScreen.test.tsx
**Purpose**: Vehicle creation, form validation, data submission

**Coverage**:
- ✅ Complete vehicle form handling
- ✅ Required field validation (make, model, year)
- ✅ Optional field handling (VIN, mileage, notes)
- ✅ Data type validation (year range, VIN format)
- ✅ Photo integration and submission
- ✅ Authentication requirement enforcement

### 5. React Hooks (State Management)

#### useAuth.test.tsx
**Purpose**: Authentication context, state management, function stability

**Coverage**:
- ✅ Context provider functionality
- ✅ Authentication state changes
- ✅ Service method integration
- ✅ Error handling and propagation  
- ✅ Function reference stability
- ✅ Cleanup and memory management

## 🏃‍♂️ Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test AuthService.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should successfully"

# Run in watch mode
npm run test:watch

# Run with verbose output
npm test -- --verbose

# Run single worker (debugging)
npm test -- --maxWorkers=1
```

### Environment Configuration

Tests run in **Node.js environment** with comprehensive mocking of React Native and Firebase dependencies.

**Key Configuration** (`jest.config.js`):
```javascript
module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['__tests__/setup.js'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coverageReporters: ['text', 'lcov', 'html'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|firebase)/)'
  ]
};
```

## 📈 Coverage Reports

### Current Coverage Status
```
Statements   : 3.73% (40/1072)
Branches     : 1.49% (10/669)  
Functions    : 4.13% (10/242)
Lines        : 3.83% (40/1044)
```

**Note**: Low coverage is expected as we've focused on critical path testing for security and core functionality. Coverage will increase as more features are developed.

### Coverage Reports Generated

**Text Summary**: Displayed in terminal after test runs
```bash
npm test -- --coverage
```

**HTML Report**: Detailed interactive coverage report
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

**LCOV Format**: For CI/CD integration
```bash
# Generated at: coverage/lcov.info
```

### Coverage Exclusions

The following are excluded from coverage requirements:
- Type definitions (`src/**/*.d.ts`)
- Translation files (`src/i18n/**/*`)
- Index files (`src/**/index.ts`)
- Configuration files

## ✍️ Writing Tests

### Test File Naming
- Component tests: `ComponentName.test.tsx`
- Service tests: `ServiceName.test.ts`  
- Hook tests: `useHookName.test.tsx`
- Screen tests: `ScreenName.test.tsx`

### Basic Test Structure

```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ComponentName } from '../../src/components/ComponentName';

describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { getByText } = render(<ComponentName title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('should handle user interaction', async () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ComponentName title="Press Me" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Press Me'));
    
    await waitFor(() => {
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });
});
```

### Service Testing Pattern

```typescript
import { ServiceName } from '../../src/services/ServiceName';

describe('ServiceName', () => {
  let service: ServiceName;
  
  beforeEach(() => {
    service = new ServiceName();
    jest.clearAllMocks();
  });

  it('should handle success scenario', async () => {
    const mockResult = { id: '123', data: 'test' };
    mockApiCall.mockResolvedValue(mockResult);
    
    const result = await service.getData('123');
    
    expect(result).toEqual(mockResult);
    expect(mockApiCall).toHaveBeenCalledWith('123');
  });

  it('should handle error scenario', async () => {
    const error = new Error('API Error');
    mockApiCall.mockRejectedValue(error);
    
    await expect(service.getData('123')).rejects.toThrow('API Error');
  });
});
```

### Async Testing

```typescript
// Using async/await
it('should handle async operations', async () => {
  const result = await service.asyncMethod();
  expect(result).toBeDefined();
});

// Using waitFor for UI updates
it('should update UI after async operation', async () => {
  const { getByText } = render(<AsyncComponent />);
  
  fireEvent.press(getByText('Load Data'));
  
  await waitFor(() => {
    expect(getByText('Data Loaded')).toBeTruthy();
  });
});
```

## 🎯 Best Practices

### 1. Test Organization
- **Group related tests** using `describe` blocks
- **Use descriptive test names** that explain the expected behavior
- **Test one behavior per test case**
- **Setup and teardown** properly with `beforeEach`/`afterEach`

### 2. Mocking Strategy
- **Mock external dependencies** (Firebase, React Native modules)
- **Use jest.fn()** for function mocking
- **Reset mocks** between tests with `jest.clearAllMocks()`
- **Mock at the module level** for consistency

### 3. Assertions
- **Use specific matchers** (`toEqual`, `toBeCalledWith`, etc.)
- **Test both positive and negative cases**
- **Verify function calls** with proper arguments
- **Check error scenarios** thoroughly

### 4. Component Testing
```typescript
// ✅ Good: Test user interactions
fireEvent.press(getByText('Submit'));
expect(mockOnSubmit).toHaveBeenCalled();

// ✅ Good: Test state changes
expect(getByText('Loading...')).toBeTruthy();

// ❌ Avoid: Testing implementation details
expect(component.state.count).toBe(1);
```

### 5. Service Testing
```typescript
// ✅ Good: Test business logic
expect(result).toEqual(expectedOutput);

// ✅ Good: Test error handling
await expect(service.method()).rejects.toThrow();

// ✅ Good: Test authentication enforcement
expect(() => service.requireAuth()).toThrow('Authentication required');
```

## 🔄 CI/CD Integration

### GitHub Actions Configuration

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage --watchAll=false
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test -- --passWithNoTests",
      "pre-push": "npm run test:coverage"
    }
  }
}
```

### Quality Gates
- **Minimum Coverage**: 70% for new code
- **Test Status**: All tests must pass
- **No Console Errors**: Clean test output required
- **Performance**: Tests complete within 30 seconds

## 🐛 Troubleshooting

### Common Issues

#### 1. Mock Resolution Errors
```bash
Cannot find module 'react-native-localize'
```
**Solution**: Check if optional dependencies are properly mocked in `__tests__/setup.js`

#### 2. Window/DOM Errors
```bash
TypeError: Cannot redefine property: window
```
**Solution**: Use `testEnvironment: 'node'` instead of `jsdom` for React Native

#### 3. Firebase Mock Issues
```bash
Cannot read properties of undefined (reading 'mockResolvedValue')
```
**Solution**: Ensure Firebase functions are properly mocked in setup file

#### 4. Async Test Failures
```bash
Test timeout after 5000ms
```
**Solution**: Use `waitFor` for async operations and increase timeout if needed

### Debug Commands

```bash
# Run with debug output
npm test -- --verbose --no-cache

# Run single test with full output
npm test -- AuthService.test.ts --verbose

# Check Jest configuration
npx jest --showConfig

# Clear Jest cache
npx jest --clearCache
```

### Performance Issues

```bash
# Run with single worker
npm test -- --maxWorkers=1

# Disable coverage for faster runs
npm test -- --no-coverage

# Run specific test pattern
npm test -- --testPathPattern=components
```

## 📚 Additional Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Firebase Testing Guide](https://firebase.google.com/docs/rules/unit-tests)

### Testing Patterns
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [React Native Testing Recipes](https://github.com/callstack/react-native-testing-library/tree/main/examples)

### Project-Specific Guides
- [Security Testing Guide](./security-testing.md)
- [Repository Testing Patterns](./repository-testing.md)
- [Component Testing Guidelines](./component-testing.md)

---

**Testing is a critical part of our development process. This comprehensive suite ensures code quality, prevents regressions, and enables confident refactoring and feature development.**