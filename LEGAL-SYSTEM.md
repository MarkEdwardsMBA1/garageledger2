# Simplified Legal System Architecture

## Overview
GarageLedger uses a **notification-based legal system** instead of complex re-acceptance flows. This provides better UX while maintaining legal compliance.

## How It Works

### For New App Launch (Current State)
- **All users are new** → Everyone goes through legal agreements during signup
- **Zero existing users** → No need for complex "returning user" logic
- **Simple compliance check**: User has acceptance record = compliant

### Legal Acceptance Flow
1. **New User Signs Up** → Legal Agreements Screen (required)
2. **Accepts All Agreements** → Recorded in Firestore with full audit trail
3. **Future App Usage** → User is permanently compliant (no re-acceptance needed)

### When Legal Documents Change (Future)
Instead of forcing re-acceptance, we use **notification approach**:

#### 📄 **Minor Changes** (Most Common)
- Typo fixes, clarifications, contact info updates
- **Action**: Silent update, documents in Settings reflect changes
- **User Impact**: None

#### 📢 **Significant Changes** (Rare)
- New features, changed liability terms, new data collection
- **Action**: In-app notification banner + updated Settings documents
- **User Impact**: One-time notification, continued app access

#### 🚫 **Major Changes** (Very Rare)
- New legal obligations, regulatory compliance requirements
- **Action**: Block app access until acknowledged (like current signup flow)
- **User Impact**: Must acknowledge to continue using app

## Technical Implementation

### Simplified Services
- **LegalComplianceService**: Only checks if user has ANY acceptance record
- **LegalComplianceRepository**: No version comparison logic
- **Navigation**: Simple boolean check for new users

### Future Notifications
When legal documents are updated:
```typescript
// Future implementation for notifications
await legalComplianceService.handleLegalDocumentUpdate('privacy', '2.0.0');
// Logs update, could trigger push notification
// Users see updated docs in Settings automatically
```

### Settings Integration
- Users can always view current legal documents in Settings
- Documents are versioned for audit purposes
- Simple "View Legal Documents" instead of "Re-accept Agreements"

## Benefits of This Approach

### ✅ **User Experience**
- No interruption for document updates
- No forced re-acceptance for minor changes
- Smooth onboarding for new users

### ✅ **Legal Compliance**
- Full audit trail maintained
- All users accept agreements during signup
- Version tracking for regulatory purposes
- Easy to upgrade to stricter compliance if needed

### ✅ **Development**
- Simpler architecture
- Fewer edge cases to handle
- Less prone to user lockouts
- Industry standard approach

## Architecture Files
- `LegalComplianceService.ts` - Simplified compliance checking
- `LegalComplianceRepository.ts` - Basic acceptance recording
- `LegalAgreementsScreen.tsx` - Signup-time acceptance
- `SettingsScreen.tsx` - Document viewing
- `AppNavigator.tsx` - New user routing

This approach matches how most consumer apps handle legal document updates - notification rather than forced re-acceptance.