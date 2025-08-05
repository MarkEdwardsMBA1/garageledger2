# Deploy Firestore Indexes

## Automatic Index Creation

The Firestore index error can be resolved by either:

### Option 1: Click the Index Creation Link
Click on the link provided in the error message:
```
https://console.firebase.google.com/v1/r/project/garageledger/firestore/indexes?create_composite=ClVwcm9qZWN0cy9nYXJhZ2VsZWRnZXIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2xlZ2FsQWNjZXB0YW5jZXMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaEgoOYWNjZXB0YW5jZURhdGUQAhoMCghfX25hbWVfXxAC
```

### Option 2: Manual Index Creation
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your `garageledger` project
3. Navigate to Firestore Database → Indexes
4. Create a composite index with:
   - Collection: `legalAcceptances`
   - Fields:
     - `userId` (Ascending)
     - `acceptanceDate` (Descending)

### Option 3: Firebase CLI (if available)
```bash
# If you have Firebase CLI installed
firebase deploy --only firestore:indexes
```

## Expected Result
Once the index is created (takes 1-2 minutes), the legal compliance checking will work without errors.

## Temporary Workaround
The app now gracefully handles missing indexes by:
- Returning `null` for missing legal acceptances instead of crashing
- Defaulting to NOT requiring compliance for existing users
- Preventing infinite loops during compliance checking

This ensures existing users can continue using the app while the index builds.