# Error Handling Standards for GarageLedger

## 🎯 Overview

This document establishes comprehensive, systematic error handling standards for GarageLedger that align with our automotive design system and provide professional, user-friendly error experiences.

## 🚗 Automotive Error Philosophy

### **Professional Language**
- Use automotive/garage terminology when appropriate
- Avoid technical jargon - speak in user-friendly terms
- Frame errors as "system issues" not "failures"
- Emphasize data ownership and vehicle focus

### **No Emojis Policy**
- **❌ Never use emojis** in error states, messages, or professional UI elements
- **✅ Use automotive icons** from our custom icon system
- Professional appearance suitable for commercial/business use

### **Helpful & Actionable**
- Always provide clear next steps
- Offer appropriate recovery actions
- Guide users to resolution, don't just report problems

## 🔧 Error Component Standards

### **Primary Component: AutomotiveErrorState**
Use `AutomotiveErrorState` for all error displays instead of the deprecated `ErrorState` component.

```typescript
import { AutomotiveErrorState } from '../components/common/AutomotiveErrorState';

// Basic error
<AutomotiveErrorState 
  type="error"
  title="System Error" 
  message="Unable to load your vehicle data"
  showRetry={true}
  onRetry={handleRetry}
/>

// Authentication error with sign-in action
<AutomotiveErrorState 
  type="unauthorized"
  primaryAction={{
    title: "Sign In",
    onPress: () => navigation.navigate('Login'),
    variant: 'primary'
  }}
  useCard={true}
/>
```

### **Error Types & Use Cases**

| Type | Use For | Icon | Color |
|------|---------|------|-------|
| `error` | General system errors | AlertTriangle | Error Red |
| `unauthorized` | Authentication required | Lock | Info Blue |
| `network` | Connection issues | Activity | Warning Orange |
| `empty` | No data/empty states | Car91 | Text Secondary |
| `not-found` | Missing resources | Search | Text Secondary |
| `maintenance` | Planned downtime | AlertTriangle | Warning Orange |

## 📝 Error Message Standards

### **Message Structure**
1. **Title**: Brief, descriptive (2-4 words)
2. **Message**: Helpful explanation with context (1-2 sentences)
3. **Action**: Clear next step for resolution

### **Automotive Language Patterns**

#### **✅ Professional Automotive Terms**
- "Your garage" instead of "your account"
- "Vehicle data" instead of "user data" 
- "Digital maintenance record" instead of "database"
- "Sync your vehicle data" instead of "network error"
- "System maintenance" instead of "server error"

#### **✅ Good Error Messages**
```
Title: "Connection Issue"
Message: "Unable to sync your vehicle data. Check your connection and try again."

Title: "Account Access Required" 
Message: "Please sign in to access your vehicle data and maintenance records."

Title: "No Vehicles Added"
Message: "Your garage is ready for its first vehicle. Start building your digital maintenance record."
```

#### **❌ Avoid These Patterns**
```
❌ "Oops! Something went wrong!"
❌ "Error 404: Not found" 
❌ "Authentication failed"
❌ "Network timeout occurred"
```

## 🛠️ Implementation Guidelines

### **Screen-Level Error Handling**

```typescript
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

const handleError = (err: Error) => {
  console.error('Error context:', err);
  
  // Classify error type
  if (err.message.includes('Authentication') || err.message.includes('auth')) {
    setError(t('auth.required'));
    // Don't retry auth errors automatically
    return;
  }
  
  if (err.message.includes('network') || err.message.includes('connection')) {
    setError(t('errors.network.message'));
    return;
  }
  
  // Generic error
  setError(err.message || t('errors.generic.message'));
};

// In render method
if (error) {
  const isAuthError = error.includes('sign in') || error.includes('auth');
  return (
    <AutomotiveErrorState
      type={isAuthError ? 'unauthorized' : 'error'}
      message={error}
      showRetry={!isAuthError}
      onRetry={!isAuthError ? refetch : undefined}
      primaryAction={isAuthError ? {
        title: t('auth.signIn'),
        onPress: () => navigation.navigate('Login')
      } : undefined}
      useCard={true}
    />
  );
}
```

### **Repository Error Standards**

```typescript
// In repository methods
try {
  const data = await firebaseMethod();
  return data;
} catch (error) {
  // Log technical details for debugging
  console.error('Repository error:', error);
  
  // Throw user-friendly message
  if (error.code === 'permission-denied') {
    throw new Error('Please sign in to access your vehicle data');
  }
  
  if (error.code === 'unavailable') {
    throw new Error('Unable to sync your vehicle data. Check your connection and try again.');
  }
  
  throw new Error('An unexpected error occurred while accessing your vehicle data. Please try again.');
}
```

### **Authentication Error Prevention**

```typescript
// Prevent auth loops
useEffect(() => {
  if (user) {
    loadData();
  } else {
    // Clear data and show appropriate state
    setData([]);
    setError(t('auth.required'));
    setLoading(false);
  }
}, [user]); // Depend on user, not navigation
```

## 🔍 Error Classification & Recovery

### **Recoverable Errors**
- Network/connection issues → Show retry button
- Temporary server issues → Show retry button  
- Rate limiting → Show retry with delay message

### **Non-Recoverable Errors**
- Authentication required → Show sign-in action
- Permission denied → Show contact support
- Resource not found → Show navigation options

### **Progressive Error Handling**
1. **First attempt**: Automatic retry (silent)
2. **Second attempt**: Show loading indicator
3. **Failure**: Display error with recovery options

## 📱 Screen-Specific Guidelines

### **List Screens (VehiclesScreen, MaintenanceScreen)**
- Empty states use automotive messaging
- Network errors offer retry functionality
- Auth errors redirect to sign-in

### **Detail Screens (VehicleDetail, MaintenanceLog)**
- "Not found" errors offer navigation back
- Use card layout for prominent errors
- Provide alternative actions

### **Form Screens (AddVehicle, CreateMaintenance)**
- Validation errors inline with fields
- Submission errors at form level
- Always preserve user input on error

## 🧪 Testing Error States

### **Manual Testing Checklist**
- [ ] All error states display appropriate automotive icons
- [ ] No emojis present in any error display
- [ ] Error messages use professional automotive language
- [ ] Recovery actions are clear and functional
- [ ] Authentication errors don't cause infinite loops
- [ ] Network errors provide retry functionality

### **Error Simulation**
```typescript
// For development testing
const ERROR_SIMULATION = {
  auth: () => { throw new Error('Please sign in to access your vehicle data'); },
  network: () => { throw new Error('Unable to sync your vehicle data. Check your connection and try again.'); },
  notFound: () => { throw new Error('The vehicle you\'re looking for is no longer in your garage.'); }
};
```

## 📊 Error Monitoring

### **What to Log**
- Error type and context
- User authentication state  
- Screen/component where error occurred
- Recovery actions taken

### **What NOT to Log**
- Personal user information
- Sensitive vehicle data
- Authentication tokens/keys

## 🔄 Migration Guide

### **Phase 1: Replace ErrorState Components**
1. Import `AutomotiveErrorState` instead of `ErrorState`
2. Update error type props
3. Remove emoji references
4. Add automotive language

### **Phase 2: Update Error Messages** 
1. Review all error strings in translation files
2. Apply automotive terminology patterns
3. Test all error scenarios

### **Phase 3: Implement Standards**
1. Add error classification logic
2. Implement recovery actions
3. Fix authentication loops

---

## 🚀 Quick Reference

### **Good Error State Example**
```tsx
<AutomotiveErrorState
  type="network" 
  title="Connection Issue"
  message="Unable to sync your vehicle data. Check your connection and try again."
  showRetry={true}
  onRetry={handleRetry}
  useCard={true}
/>
```

### **Authentication Error Example**
```tsx
<AutomotiveErrorState
  type="unauthorized"
  primaryAction={{
    title: "Sign In", 
    onPress: () => navigation.navigate('Login'),
    variant: 'primary'
  }}
  useCard={true}
/>
```

This systematic approach ensures all errors provide a professional, helpful, and automotive-themed user experience while maintaining our design system consistency.