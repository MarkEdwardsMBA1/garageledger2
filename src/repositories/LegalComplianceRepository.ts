import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';

import { db } from '../services/firebase/config';
import { BaseRepository } from './BaseRepository';
import { 
  LegalAcceptance, 
  LegalAcceptanceData,
  LegalComplianceStatus,
  LegalAcceptanceHistory
} from '../types';

/**
 * Repository for Legal Compliance Tracking
 * 
 * CRITICAL FUNCTION: This repository maintains complete audit trails 
 * of all legal document acceptances for regulatory compliance and 
 * legal protection.
 */
export class LegalComplianceRepository extends BaseRepository<LegalAcceptance> {
  private readonly COLLECTION_NAME = 'legalAcceptances';

  // Current legal document versions (should be managed via config)
  private readonly CURRENT_VERSIONS = {
    terms: '1.0.0',
    privacy: '1.0.0',
    maintenance: '1.0.0',
  };

  /**
   * Record legal acceptance during user onboarding
   * CRITICAL: Creates legally defensible acceptance record
   */
  async create(data: Omit<LegalAcceptance, 'id'>): Promise<LegalAcceptance> {
    try {
      const currentUser = this.requireAuth();
      
      // Ensure acceptance is for the current user
      const safeData: Omit<LegalAcceptance, 'id'> = {
        ...data,
        userId: currentUser.uid,
        acceptanceDate: new Date(),
        updatedAt: new Date(),
      };

      // Validate user ownership
      this.validateUserOwnership(safeData.userId);

      // Convert dates for Firestore
      const firestoreData = this.convertDatesForFirestore(safeData);

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), firestoreData);
      
      return {
        id: docRef.id,
        ...safeData,
      };
    } catch (error) {
      return this.handleError(error, 'record legal acceptance');
    }
  }

  /**
   * Record legal acceptance from onboarding data
   */
  async recordAcceptance(userId: string, acceptanceData: LegalAcceptanceData): Promise<void> {
    try {
      this.validateUserOwnership(userId);

      const acceptance: Omit<LegalAcceptance, 'id'> = {
        userId,
        acceptanceDate: acceptanceData.acceptanceTimestamp,
        ipAddress: acceptanceData.ipAddress || 'unknown',
        userAgent: acceptanceData.userAgent || 'unknown',
        appVersion: acceptanceData.appVersion || '1.0.0',
        
        // Document versions (use current versions)
        termsVersion: this.CURRENT_VERSIONS.terms,
        privacyPolicyVersion: this.CURRENT_VERSIONS.privacy,
        maintenanceDisclaimerVersion: this.CURRENT_VERSIONS.maintenance,
        
        // Acceptance flags
        acceptedTerms: acceptanceData.termsAccepted,
        acceptedPrivacyPolicy: acceptanceData.privacyAccepted,
        acceptedMaintenanceDisclaimer: acceptanceData.maintenanceDisclaimerAccepted,
        
        // Legal evidence
        acceptanceMethod: 'checkbox',
        locale: acceptanceData.locale || 'en-US',
        
        updatedAt: new Date(),
      };

      await this.create(acceptance);
    } catch (error) {
      return this.handleError(error, 'record legal acceptance');
    }
  }

  /**
   * Get legal acceptance by ID
   */
  async getById(id: string): Promise<LegalAcceptance | null> {
    try {
      this.validateId(id);
      const currentUser = this.requireAuth();

      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      
      // Ensure user can only access their own data
      this.validateUserOwnership(data.userId);

      return {
        id: docSnap.id,
        ...this.convertDatesFromFirestore(data),
      } as LegalAcceptance;
    } catch (error) {
      return this.handleError(error, 'get legal acceptance');
    }
  }

  /**
   * Get all legal acceptances for current user
   */
  async getAll(): Promise<LegalAcceptance[]> {
    try {
      const currentUser = this.requireAuth();

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', currentUser.uid),
        orderBy('acceptanceDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertDatesFromFirestore(doc.data()),
      })) as LegalAcceptance[];
    } catch (error) {
      return this.handleError(error, 'get legal acceptances');
    }
  }

  /**
   * Get current legal acceptance for user
   */
  async getCurrentAcceptance(userId?: string): Promise<LegalAcceptance | null> {
    try {
      const targetUserId = userId || this.getCurrentUserId();
      this.validateUserOwnership(targetUserId);

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', targetUserId),
        orderBy('acceptanceDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const mostRecent = querySnapshot.docs[0];
      
      return {
        id: mostRecent.id,
        ...this.convertDatesFromFirestore(mostRecent.data()),
      } as LegalAcceptance;
    } catch (error) {
      return this.handleError(error, 'get current legal acceptance');
    }
  }

  /**
   * Check compliance status for user
   * CRITICAL: Determines if user needs to accept updated legal documents
   */
  async checkComplianceStatus(userId?: string): Promise<LegalComplianceStatus> {
    try {
      const targetUserId = userId || this.getCurrentUserId();
      const currentAcceptance = await this.getCurrentAcceptance(targetUserId);

      if (!currentAcceptance) {
        return {
          isCompliant: false,
          requiresTermsAcceptance: true,
          requiresPrivacyAcceptance: true,
          requiresMaintenanceDisclaimer: true,
          currentVersions: this.CURRENT_VERSIONS,
        };
      }

      const requiresTermsAcceptance = currentAcceptance.termsVersion !== this.CURRENT_VERSIONS.terms;
      const requiresPrivacyAcceptance = currentAcceptance.privacyPolicyVersion !== this.CURRENT_VERSIONS.privacy;
      const requiresMaintenanceDisclaimer = currentAcceptance.maintenanceDisclaimerVersion !== this.CURRENT_VERSIONS.maintenance;

      return {
        isCompliant: !requiresTermsAcceptance && !requiresPrivacyAcceptance && !requiresMaintenanceDisclaimer,
        requiresTermsAcceptance,
        requiresPrivacyAcceptance,
        requiresMaintenanceDisclaimer,
        currentVersions: this.CURRENT_VERSIONS,
      };
    } catch (error) {
      return this.handleError(error, 'check compliance status');
    }
  }

  /**
   * Check if user has accepted current legal versions
   */
  async requiresNewAcceptance(userId?: string): Promise<boolean> {
    try {
      const status = await this.checkComplianceStatus(userId);
      return !status.isCompliant;
    } catch (error) {
      return this.handleError(error, 'check if new acceptance required');
    }
  }

  /**
   * Update legal acceptance (for version updates)
   */
  async update(id: string, data: Partial<LegalAcceptance>): Promise<LegalAcceptance> {
    try {
      this.validateId(id);
      
      // Get existing acceptance to validate ownership
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error('Legal acceptance not found');
      }

      // Preserve critical audit trail data
      const safeUpdateData = {
        ...data,
        updatedAt: new Date(),
        // Prevent modification of audit trail fields
        userId: existing.userId,
        acceptanceDate: existing.acceptanceDate,
        ipAddress: existing.ipAddress,
        userAgent: existing.userAgent,
      };

      // Archive previous version if updating versions
      if (data.termsVersion || data.privacyPolicyVersion || data.maintenanceDisclaimerVersion) {
        const previousVersion: LegalAcceptanceHistory = {
          version: `${existing.termsVersion}_${existing.privacyPolicyVersion}_${existing.maintenanceDisclaimerVersion}`,
          acceptanceDate: existing.acceptanceDate,
          method: existing.acceptanceMethod,
        };

        safeUpdateData.previousVersions = [
          ...(existing.previousVersions || []),
          previousVersion,
        ];
      }

      // Remove undefined fields and convert dates
      const cleanedData = this.removeUndefinedFields(safeUpdateData);
      const firestoreData = this.convertDatesForFirestore(cleanedData);

      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, firestoreData);

      return {
        ...existing,
        ...safeUpdateData,
      };
    } catch (error) {
      return this.handleError(error, 'update legal acceptance');
    }
  }

  /**
   * Get legal acceptance history for user
   */
  async getLegalAcceptanceHistory(userId?: string): Promise<LegalAcceptanceHistory[]> {
    try {
      const targetUserId = userId || this.getCurrentUserId();
      const allAcceptances = await this.getAll();
      
      // Flatten all acceptance history
      const history: LegalAcceptanceHistory[] = [];
      
      allAcceptances.forEach(acceptance => {
        // Add current acceptance
        history.push({
          version: `${acceptance.termsVersion}_${acceptance.privacyPolicyVersion}_${acceptance.maintenanceDisclaimerVersion}`,
          acceptanceDate: acceptance.acceptanceDate,
          method: acceptance.acceptanceMethod,
        });

        // Add previous versions
        if (acceptance.previousVersions) {
          history.push(...acceptance.previousVersions);
        }
      });

      // Sort by date (newest first)
      return history.sort((a, b) => b.acceptanceDate.getTime() - a.acceptanceDate.getTime());
    } catch (error) {
      return this.handleError(error, 'get legal acceptance history');
    }
  }

  /**
   * Delete legal acceptance (for account deletion only)
   */
  async delete(id: string): Promise<void> {
    try {
      this.validateId(id);
      
      // Verify ownership before deletion
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error('Legal acceptance not found');
      }

      // WARNING: Deleting legal acceptance records may have regulatory implications
      // This should only be done for complete account deletion
      
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      return this.handleError(error, 'delete legal acceptance');
    }
  }

  /**
   * Get current legal document versions
   */
  getCurrentLegalVersions() {
    return { ...this.CURRENT_VERSIONS };
  }

  /**
   * Update legal document versions (admin function)
   * This would typically be called when legal documents are updated
   */
  updateLegalVersions(versions: { terms?: string; privacy?: string; maintenance?: string }) {
    // In production, this should be managed via secure admin interface
    // or environment configuration
    if (versions.terms) this.CURRENT_VERSIONS.terms = versions.terms;
    if (versions.privacy) this.CURRENT_VERSIONS.privacy = versions.privacy;
    if (versions.maintenance) this.CURRENT_VERSIONS.maintenance = versions.maintenance;
  }

  // ===== UTILITY METHODS =====

  private convertDatesForFirestore(data: any): any {
    const converted = { ...data };
    
    // Convert Date objects to Firestore Timestamps
    if (converted.acceptanceDate instanceof Date) {
      converted.acceptanceDate = Timestamp.fromDate(converted.acceptanceDate);
    }
    if (converted.updatedAt instanceof Date) {
      converted.updatedAt = Timestamp.fromDate(converted.updatedAt);
    }

    // Convert dates in previous versions array
    if (converted.previousVersions && Array.isArray(converted.previousVersions)) {
      converted.previousVersions = converted.previousVersions.map((version: any) => ({
        ...version,
        acceptanceDate: version.acceptanceDate instanceof Date 
          ? Timestamp.fromDate(version.acceptanceDate) 
          : version.acceptanceDate,
      }));
    }

    return converted;
  }

  private convertDatesFromFirestore(data: any): any {
    const converted = { ...data };
    
    // Convert Firestore Timestamps to Date objects
    if (converted.acceptanceDate?.toDate) {
      converted.acceptanceDate = converted.acceptanceDate.toDate();
    }
    if (converted.updatedAt?.toDate) {
      converted.updatedAt = converted.updatedAt.toDate();
    }

    // Convert dates in previous versions array
    if (converted.previousVersions && Array.isArray(converted.previousVersions)) {
      converted.previousVersions = converted.previousVersions.map((version: any) => ({
        ...version,
        acceptanceDate: version.acceptanceDate?.toDate 
          ? version.acceptanceDate.toDate() 
          : version.acceptanceDate,
      }));
    }

    return converted;
  }

  private removeUndefinedFields(obj: any): any {
    const cleaned: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    
    return cleaned;
  }
}

export const legalComplianceRepository = new LegalComplianceRepository();