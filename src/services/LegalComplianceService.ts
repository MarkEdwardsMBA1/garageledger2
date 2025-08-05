import { legalComplianceRepository } from '../repositories/LegalComplianceRepository';
import { 
  LegalAcceptanceData,
  LegalComplianceStatus,
  LegalAcceptanceHistory
} from '../types';

/**
 * Legal Compliance Service
 * 
 * CRITICAL SERVICE: Manages all legal document acceptance and compliance
 * tracking to ensure regulatory compliance and legal protection.
 * 
 * This service is required before any maintenance features can be launched.
 */
export class LegalComplianceService {
  private repository = legalComplianceRepository;

  /**
   * Record user's legal acceptance during onboarding
   * CRITICAL: Must complete successfully before account creation
   */
  async recordAcceptance(userId: string, acceptanceData: LegalAcceptanceData): Promise<void> {
    try {
      // Validate that all required acceptances are present
      this.validateAcceptanceData(acceptanceData);

      // Record the acceptance with full audit trail
      await this.repository.recordAcceptance(userId, acceptanceData);
      
      console.log(`Legal acceptance recorded for user ${userId}`);
    } catch (error) {
      console.error('Failed to record legal acceptance:', error);
      throw new Error(`Legal compliance recording failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if user is legally compliant to use the app
   * CRITICAL: Must return true before allowing access to maintenance features
   */
  async checkUserCompliance(userId: string): Promise<LegalComplianceStatus> {
    try {
      return await this.repository.checkComplianceStatus(userId);
    } catch (error) {
      console.error('Failed to check legal compliance:', error);
      // Default to non-compliant for safety
      return {
        isCompliant: false,
        requiresTermsAcceptance: true,
        requiresPrivacyAcceptance: true,
        requiresMaintenanceDisclaimer: true,
        currentVersions: this.repository.getCurrentLegalVersions(),
      };
    }
  }

  /**
   * Check if user needs to accept updated legal documents
   */
  async requiresNewAcceptance(userId: string): Promise<boolean> {
    try {
      return await this.repository.requiresNewAcceptance(userId);
    } catch (error) {
      console.error('Failed to check acceptance requirements:', error);
      // Default to requiring acceptance for safety
      return true;
    }
  }

  /**
   * Get user's legal acceptance history for audit purposes
   */
  async getLegalAcceptanceHistory(userId: string): Promise<LegalAcceptanceHistory[]> {
    try {
      return await this.repository.getLegalAcceptanceHistory(userId);
    } catch (error) {
      console.error('Failed to get legal acceptance history:', error);
      return [];
    }
  }

  /**
   * Get current legal document versions
   */
  getCurrentLegalVersions() {
    return this.repository.getCurrentLegalVersions();
  }

  /**
   * Validate that user can access maintenance features
   * CRITICAL: Must pass before any maintenance functionality is available
   */
  async validateMaintenanceAccess(userId: string): Promise<void> {
    const compliance = await this.checkUserCompliance(userId);
    
    if (!compliance.isCompliant) {
      const missing = [];
      if (compliance.requiresTermsAcceptance) missing.push('Terms of Service');
      if (compliance.requiresPrivacyAcceptance) missing.push('Privacy Policy');
      if (compliance.requiresMaintenanceDisclaimer) missing.push('Maintenance Disclaimer');
      
      throw new Error(
        `Legal compliance required before accessing maintenance features. ` +
        `Please accept: ${missing.join(', ')}`
      );
    }

    // Additional check for maintenance-specific disclaimer
    if (compliance.requiresMaintenanceDisclaimer) {
      throw new Error(
        'Maintenance disclaimer acceptance required. This app provides tracking tools, ' +
        'not professional automotive advice. You are responsible for all maintenance decisions.'
      );
    }
  }

  /**
   * Handle legal document updates (admin function)
   * When legal documents are updated, this triggers user re-acceptance flows
   */
  async handleLegalDocumentUpdate(documentType: 'terms' | 'privacy' | 'maintenance', newVersion: string): Promise<void> {
    try {
      // Update the version in the repository
      const versionUpdate = { [documentType]: newVersion };
      this.repository.updateLegalVersions(versionUpdate);
      
      // Log the update for audit purposes
      console.log(`Legal document updated: ${documentType} to version ${newVersion}`);
      
      // In a production app, this would trigger notifications to users
      // about the legal document update and requirement for re-acceptance
      
    } catch (error) {
      console.error('Failed to handle legal document update:', error);
      throw new Error(`Legal document update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate legal compliance report for audit purposes
   */
  async generateComplianceReport(userId: string): Promise<{
    userId: string;
    currentCompliance: LegalComplianceStatus;
    acceptanceHistory: LegalAcceptanceHistory[];
    lastAcceptanceDate: Date | null;
    totalAcceptances: number;
  }> {
    try {
      const compliance = await this.checkUserCompliance(userId);
      const history = await this.getLegalAcceptanceHistory(userId);
      
      return {
        userId,
        currentCompliance: compliance,
        acceptanceHistory: history,
        lastAcceptanceDate: history.length > 0 ? history[0].acceptanceDate : null,
        totalAcceptances: history.length,
      };
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      throw new Error(`Compliance report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===== PRIVATE VALIDATION METHODS =====

  /**
   * Validate acceptance data completeness
   */
  private validateAcceptanceData(data: LegalAcceptanceData): void {
    const errors: string[] = [];

    // Check required acceptances
    if (!data.termsAccepted) {
      errors.push('Terms of Service acceptance is required');
    }
    if (!data.privacyAccepted) {
      errors.push('Privacy Policy acceptance is required');
    }
    if (!data.maintenanceDisclaimerAccepted) {
      errors.push('Maintenance Disclaimer acceptance is required');
    }

    // Check required metadata
    if (!data.acceptanceTimestamp) {
      errors.push('Acceptance timestamp is required');
    }
    if (!data.locale) {
      errors.push('User locale is required');
    }
    if (!data.appVersion) {
      errors.push('App version is required');
    }

    if (errors.length > 0) {
      throw new Error(`Legal acceptance validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Get client IP address (implementation depends on environment)
   * This is a placeholder - actual implementation would depend on React Native capabilities
   */
  private async getClientIP(): Promise<string> {
    try {
      // In a real implementation, this might call a service to get the IP
      // For React Native, this might require a native module or API call
      return 'unknown'; // Placeholder
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Get user agent string (implementation depends on environment)
   */
  private getUserAgent(): string {
    try {
      // In React Native, this might be constructed from device info
      return 'GarageLedger/1.0.0 (React Native)'; // Placeholder
    } catch (error) {
      return 'unknown';
    }
  }
}

// Singleton service instance
export const legalComplianceService = new LegalComplianceService();