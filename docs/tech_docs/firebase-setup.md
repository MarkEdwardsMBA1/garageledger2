# Firebase Setup Guide

## Overview
This guide covers setting up Firebase Authentication and Firestore for the GarageLedger application with comprehensive security rules.

## Prerequisites
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created in the Firebase Console
- Environment variables configured (see .env.example)

## Authentication Setup

### 1. Enable Authentication Methods
In the Firebase Console:
1. Go to Authentication → Sign-in method
2. Enable **Email/Password** provider
3. Optionally enable **Email link (passwordless sign-in)**

### 2. Configure Environment Variables
Create a `.env` file based on `.env.example`:

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

## Firestore Security Rules Deployment

### 1. Login to Firebase CLI
```bash
firebase login
```

### 2. Initialize Firebase Project
```bash
firebase use --add
# Select your project and give it an alias (e.g., "default")
```

### 3. Deploy Security Rules
```bash
# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Or deploy all Firebase services
firebase deploy
```

### 4. Verify Deployment
Check the Firebase Console → Firestore Database → Rules tab to confirm the rules are active.

## Security Rules Overview

The deployed rules enforce the following security model:

### 🔐 Authentication Requirements
- All database operations require valid authentication
- Email verification status is tracked for future requirements
- Unauthenticated requests are automatically denied

### 👤 User Data Isolation
- Users can only access data they own (userId field matches auth.uid)
- Cross-user data access is completely blocked
- No user can see existence of other users' data

### 📊 Data Validation
- Comprehensive input validation for all document types
- Type checking and constraint enforcement
- Length limits to prevent abuse and ensure performance

### 🚗 Vehicle Collection Rules
```javascript
// Users can only read/write vehicles where userId matches their auth.uid
match /vehicles/{vehicleId} {
  allow read, write: if request.auth != null 
    && request.auth.uid == resource.data.userId;
}
```

### 🔧 Maintenance Logs Rules
```javascript
// Users can only access maintenance logs for vehicles they own
match /maintenanceLogs/{logId} {
  allow read, write: if request.auth != null 
    && request.auth.uid == getVehicleOwner(resource.data.vehicleId);
}
```

## Testing Security Rules

### 1. Firebase Emulator Testing
```bash
# Start Firestore emulator
firebase emulators:start --only firestore

# Run in separate terminal
npm run test:firestore-rules
```

### 2. Manual Testing Checklist
- [ ] Authenticated user can create vehicles
- [ ] Authenticated user can read only their vehicles
- [ ] Authenticated user cannot read other users' vehicles
- [ ] Unauthenticated requests are denied
- [ ] Cross-user data access attempts fail
- [ ] Data validation rules reject invalid data

### 3. Test Scenarios
1. **Positive Tests**: Verify legitimate operations succeed
2. **Negative Tests**: Verify unauthorized operations fail
3. **Edge Cases**: Test boundary conditions and invalid data
4. **Cross-User Tests**: Ensure complete data isolation

## Development vs Production

### Development Environment
```bash
firebase use development
firebase deploy --only firestore:rules
```

### Production Environment
```bash
firebase use production
firebase deploy --only firestore:rules
```

## Monitoring and Maintenance

### 1. Security Monitoring
- Monitor Firebase Console for rule evaluation errors
- Track authentication patterns and failed attempts
- Review access logs for anomalies

### 2. Performance Monitoring
- Monitor rule evaluation performance
- Optimize indexes for user-scoped queries
- Review query patterns for efficiency

### 3. Regular Audits
- Review security rules quarterly
- Test rules with multiple user scenarios
- Update documentation when rules change
- Performance testing under load

## Troubleshooting

### Common Issues

#### "Permission Denied" Errors
- Verify user is authenticated: `authService.getCurrentUser()`
- Check userId field matches authenticated user
- Ensure security rules are deployed

#### "API Key Not Valid" Errors
- Verify environment variables are correctly set
- Check Firebase project configuration
- Ensure API key is enabled for your project

#### Rules Not Taking Effect
- Confirm deployment succeeded: `firebase deploy --only firestore:rules`
- Check Firebase Console rules tab for syntax errors
- Clear app cache and restart

### Debug Commands
```bash
# Check current project
firebase use

# List available projects
firebase projects:list

# Validate rules syntax
firebase firestore:rules validate

# Deploy with debug output
firebase deploy --only firestore:rules --debug
```

## Security Best Practices

### 1. Rule Design Principles
- **Fail-safe defaults**: Deny-all rule at bottom catches missed cases
- **Principle of least privilege**: Users get minimum necessary permissions
- **Defense in depth**: Multiple validation layers (auth + ownership + data)

### 2. Development Practices
- Test rules thoroughly before production deployment
- Use emulators for development to avoid production data exposure
- Version control all rule changes with descriptive commit messages
- Document any exceptions or special cases in rules

### 3. Monitoring and Alerting
- Set up alerts for unusual authentication patterns
- Monitor for repeated permission denied errors
- Track rule evaluation performance metrics
- Regular security audits and penetration testing

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Production Ready