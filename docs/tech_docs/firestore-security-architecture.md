# Firestore Security Architecture

## Overview

This document outlines the comprehensive security architecture implemented for the GarageLedger application's Firestore database. The security model ensures that users can only access their own data while maintaining proper data validation and integrity.

## Security Principles

### 1. **User Data Isolation**
- Every user can only access data they own
- Strict `userId` ownership checks on all collections
- No cross-user data leakage possible

### 2. **Authentication Requirements**
- All database operations require valid authentication
- Email verification status tracked (extensible for future requirements)
- Proper error handling for unauthenticated requests

### 3. **Data Validation**
- Comprehensive input validation for all document types
- Type checking and constraint enforcement
- Length limits to prevent abuse and ensure performance

### 4. **Principle of Least Privilege**
- Users only get the minimum permissions needed
- Read/write access granted only for owned resources
- Explicit deny-all rule at the bottom catches any missed cases

## Collection Security Rules

### 🚗 Vehicles Collection (`/vehicles/{vehicleId}`)

**Access Control:**
- ✅ **Read**: User can read vehicles where `resource.data.userId == request.auth.uid`
- ✅ **Create**: User can create vehicles with their own `userId`
- ✅ **Update/Delete**: User can modify vehicles they own

**Data Validation:**
```javascript
// Required fields
- userId (string, must match authenticated user)
- make (string, non-empty)
- model (string, non-empty)  
- year (number, 1900-2030)

// Optional fields with validation
- vin (string, max 17 chars)
- licensePlate (string, max 20 chars)
- color (string, max 50 chars)
- mileage (number, >= 0)
- notes (string, max 1000 chars)
```

**Security Features:**
- Prevents users from creating vehicles for other users
- Validates year ranges to prevent invalid data
- Enforces reasonable string length limits

### 🔧 Maintenance Logs Collection (`/maintenanceLogs/{logId}`)

**Access Control:**
- ✅ **Read/Write**: User can access logs for vehicles they own
- Uses `get()` function to verify vehicle ownership dynamically
- Inherits security from vehicle ownership

**Data Validation:**
```javascript
// Required fields
- vehicleId (string, must reference user's vehicle)
- type (string, non-empty)
- date (timestamp)
- mileage (number, >= 0)

// Optional fields with validation
- description (string, max 2000 chars)
- cost (number, >= 0)
- location (string, max 200 chars)
- notes (string, max 1000 chars)
- photos (array, max 10 items)
```

**Security Features:**
- Cross-references vehicle ownership for every operation
- Prevents maintenance logs for vehicles user doesn't own
- Validates financial data (cost must be positive)

### ⚙️ User Preferences Collection (`/userPreferences/{userId}`)

**Access Control:**
- ✅ **Read/Write**: User can only access document with their own `userId` as document ID
- Direct `userId` matching for maximum security

**Data Validation:**
```javascript
// All fields optional, with restricted values
- language: 'en' | 'es'
- units: 'imperial' | 'metric'
- notifications: boolean
- theme: 'light' | 'dark' | 'auto'
```

**Security Features:**
- Document ID must match authenticated user's ID
- Enum validation for all preference values
- No sensitive data stored in preferences

### 👤 User Profiles Collection (`/userProfiles/{userId}`)

**Access Control:**
- ✅ **Read/Write**: User can only access their own profile
- `userId` field in document must match authenticated user

**Data Validation:**
```javascript
// Required fields
- userId (string, must match request.auth.uid)

// Optional fields with validation
- displayName (string, max 100 chars)
- phoneNumber (string, max 20 chars)
- emergencyContact (string, max 200 chars)
- address (string, max 300 chars)
```

**Security Features:**
- Prevents profile spoofing
- Reasonable limits on personal information fields
- No storage of sensitive authentication data

### 🔔 Maintenance Reminders Collection (`/maintenanceReminders/{reminderId}`)

**Access Control:**
- ✅ **Read/Write**: User can access reminders for vehicles they own
- Uses same vehicle ownership verification as maintenance logs

**Data Validation:**
```javascript
// Required fields
- vehicleId (string, must reference user's vehicle)
- type (string, non-empty)
- dueDate (timestamp)

// Optional fields with validation
- dueMileage (number, >= 0)
- description (string, max 500 chars)
- isCompleted (boolean)
- completedDate (timestamp)
```

## Helper Functions

### `isAuthenticated()`
- Checks if `request.auth != null`
- Used as base requirement for all operations

### `isOwner(userId)`
- Validates that `request.auth.uid == userId`
- Core function for ownership verification

### `isValidUser()`
- Checks authentication and email verification
- Extensible for future requirements

### `getVehicleOwner(vehicleId)`
- Performs cross-collection lookup to verify vehicle ownership
- Used by maintenance logs and reminders
- Ensures consistent ownership checks

## Database Indexes

Optimized indexes for secure, performant queries:

```json
{
  "vehicles": {
    "userId": "ASC",
    "createdAt": "DESC"
  },
  "maintenanceLogs": {
    "vehicleId": "ASC", 
    "date": "DESC"
  },
  "maintenanceReminders": {
    "vehicleId": "ASC",
    "dueDate": "ASC"
  }
}
```

## Security Testing

### Automated Test Coverage
- ✅ User can access only their own data
- ✅ Cross-user access attempts are blocked
- ✅ Unauthenticated access is denied
- ✅ Data validation rules are enforced
- ✅ Invalid data is rejected

### Test Scenarios
1. **Positive Tests**: Verify legitimate operations succeed
2. **Negative Tests**: Verify unauthorized operations fail
3. **Edge Cases**: Test boundary conditions and invalid data
4. **Cross-User Tests**: Ensure complete data isolation

## Deployment Process

### Development Environment
```bash
firebase deploy --only firestore:rules --project default
```

### Production Environment
```bash
firebase deploy --only firestore:rules --project production
```

### Testing
```bash
# Start emulators
firebase emulators:start --only firestore

# Run security tests
node scripts/test-firestore-rules.js
```

## Security Monitoring

### Firebase Console
- Monitor rule performance and errors
- Track authentication patterns
- Review access logs for anomalies

### Metrics to Watch
- Failed authentication attempts
- Rule evaluation errors
- Unusual access patterns
- Performance degradation

## Best Practices Implemented

### 1. **Defense in Depth**
- Multiple layers of validation
- Authentication + authorization + data validation
- Fail-safe defaults (deny-all at bottom)

### 2. **Explicit Security Model**
- Every rule explicitly states what it allows
- No implicit permissions or wildcards
- Clear ownership verification for all operations

### 3. **Data Integrity**
- Type checking for all fields
- Range validation for numeric data
- Length limits for string data
- Enum validation for restricted values

### 4. **Performance Optimization**
- Efficient indexes for user-scoped queries
- Minimal use of expensive `get()` operations
- Optimized rule evaluation order

## Future Enhancements

### Potential Improvements
1. **Role-Based Access**: Add support for shared vehicles or family accounts
2. **Rate Limiting**: Implement per-user operation limits
3. **Audit Logging**: Enhanced tracking of data access patterns
4. **Geographic Restrictions**: Location-based access controls if needed

### Maintenance Requirements
- Regular security rule audits
- Performance monitoring and optimization
- Test suite updates for new features
- Documentation updates for rule changes

## Compliance Considerations

### Data Privacy
- User data completely isolated
- No cross-user data exposure possible
- Supports data portability requirements
- Enables user data deletion

### Security Standards
- Follows Firebase security best practices
- Implements proper authentication checks
- Uses validated input sanitization
- Maintains audit trail capability

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Production Ready