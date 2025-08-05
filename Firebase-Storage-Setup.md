# Firebase Storage Setup Instructions

## Current Issue
The app is getting `storage/unknown` errors when trying to upload vehicle photos. This indicates that Firebase Storage security rules need to be deployed.

## Solution: Deploy Storage Rules

### Option 1: Using Firebase CLI (Recommended)
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init storage

# Deploy the storage rules
firebase deploy --only storage
```

### Option 2: Manual Deployment via Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your `garageledger` project
3. Navigate to **Storage** → **Rules**
4. Replace the existing rules with the content from `storage.rules` file:

```javascript
rules_version = '2';

// Firebase Storage Security Rules for GarageLedger2
service firebase.storage {
  match /b/{bucket}/o {
    // Vehicle photos - organized by user ID and vehicle ID
    match /vehicle-photos/{userId}/{vehicleId}/{fileName} {
      // Allow read/write only if the user is authenticated and accessing their own photos
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId;
      
      // Additional validation for uploads
      allow create: if request.auth != null 
                    && request.auth.uid == userId
                    && request.resource.contentType.matches('image/.*')
                    && request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
    
    // Fallback rule - deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

5. Click **Publish**

## What These Rules Do
- **Security**: Only authenticated users can access their own photos
- **Organization**: Photos are stored in `vehicle-photos/{userId}/{vehicleId}/` structure
- **Validation**: Only image files under 10MB are allowed
- **Privacy**: Users cannot access other users' photos

## After Deployment
Once the rules are deployed:
1. New photo uploads will work correctly
2. Existing broken photo URIs will be migrated automatically
3. Photos will be permanently stored in Firebase Storage instead of temporary device locations

## Testing
After deployment, test by:
1. Adding a new vehicle with a photo
2. Editing an existing vehicle and updating its photo
3. Checking that photos persist across app restarts