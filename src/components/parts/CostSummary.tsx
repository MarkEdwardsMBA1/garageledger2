// Cost Summary Component
// Receipt-style cost breakdown with parts and fluids subtotals

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Typography } from '../common/Typography';
import { ServiceEntryData, DIYStep2Data } from '../../domain/PartsAndFluids';
import { theme } from '../../utils/theme';

export interface CostSummaryProps {
  /** Complete DIY Step 2 data with all services */
  data: DIYStep2Data;
  
  /** Show detailed breakdown per service */
  showServiceBreakdown?: boolean;
  
  /** Compact mode for smaller displays */
  compact?: boolean;
}

export const CostSummary: React.FC<CostSummaryProps> = ({
  data,
  showServiceBreakdown = true,
  compact = false,
}) => {
  
  const formatCurrency = (value: number): string => {
    return value.toFixed(2);
  };

  const renderServiceBreakdown = () => {
    if (!showServiceBreakdown || data.services.length === 0) {
      return null;
    }

    return (
      <View style={styles.serviceBreakdownContainer}>
        <Typography variant="subheading" style={styles.breakdownTitle}>
          Service Breakdown
        </Typography>
        
        {data.services.map((service, index) => (
          <View key={service.serviceId || index} style={styles.serviceRow}>
            <View style={styles.serviceInfo}>
              <Typography variant="body" style={styles.serviceName}>
                {service.serviceName}
              </Typography>
              {service.partsSubtotal > 0 && (
                <Typography variant="caption" style={styles.serviceDetail}>
                  Parts: ${formatCurrency(service.partsSubtotal)}
                </Typography>
              )}
              {service.fluidsSubtotal > 0 && (
                <Typography variant="caption" style={styles.serviceDetail}>
                  Fluids: ${formatCurrency(service.fluidsSubtotal)}
                </Typography>
              )}
            </View>
            <Typography variant="body" style={styles.serviceTotal}>
              ${formatCurrency(service.serviceTotalCost)}
            </Typography>
          </View>
        ))}
        
        <View style={styles.divider} />
      </View>
    );
  };

  const renderTotalsSection = () => {
    return (
      <View style={styles.totalsContainer}>
        {/* Parts Subtotal */}
        <View style={styles.subtotalRow}>
          <Typography variant="subheading" style={styles.subtotalLabel}>
            Parts Sub-Total
          </Typography>
          <Typography variant="subheading" style={styles.subtotalValue}>
            ${formatCurrency(data.totalPartsCart)}
          </Typography>
        </View>

        {/* Fluids Subtotal */}
        <View style={styles.subtotalRow}>
          <Typography variant="subheading" style={styles.subtotalLabel}>
            Fluids Sub-Total
          </Typography>
          <Typography variant="subheading" style={styles.subtotalValue}>
            ${formatCurrency(data.totalFluidsCart)}
          </Typography>
        </View>

        {/* Grand Total */}
        <View style={styles.grandTotalContainer}>
          <Typography variant="title" style={styles.grandTotalLabel}>
            Total Cost
          </Typography>
          <Typography variant="title" style={styles.grandTotalValue}>
            ${formatCurrency(data.grandTotal)}
          </Typography>
        </View>
      </View>
    );
  };

  // Compact version for smaller screens
  if (compact) {
    return (
      <Card variant="outlined" size="sm">
        <View style={styles.compactContainer}>
          <Typography variant="body" style={styles.compactLabel}>
            Total DIY Cost:
          </Typography>
          <Typography variant="heading" style={styles.compactTotal}>
            ${formatCurrency(data.grandTotal)}
          </Typography>
        </View>
      </Card>
    );
  }

  // Full receipt-style summary
  return (
    <Card variant="elevated" title="Cost Summary">
      <View style={styles.container}>
        {/* Service-by-service breakdown */}
        {renderServiceBreakdown()}

        {/* Totals section */}
        {renderTotalsSection()}

        {/* Receipt-style footer */}
        <View style={styles.footerContainer}>
          <Typography variant="caption" style={styles.footerText}>
            💡 All costs calculated automatically
          </Typography>
          <Typography variant="caption" style={styles.footerText}>
            💾 Saved locally, syncs when online
          </Typography>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    // Card handles padding
  },
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactLabel: {
    color: theme.colors.text.secondary,
  },
  compactTotal: {
    color: theme.colors.primary.main,
    fontWeight: 'bold',
  },
  serviceBreakdownContainer: {
    marginBottom: theme.spacing.lg,
  },
  breakdownTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  serviceInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  serviceName: {
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  serviceDetail: {
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  serviceTotal: {
    color: theme.colors.text.primary,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.medium,
    marginVertical: theme.spacing.sm,
  },
  totalsContainer: {
    paddingTop: theme.spacing.sm,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  subtotalLabel: {
    color: theme.colors.text.secondary,
  },
  subtotalValue: {
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  grandTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 2,
    borderTopColor: theme.colors.primary.main,
    marginTop: theme.spacing.sm,
  },
  grandTotalLabel: {
    color: theme.colors.primary.main,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    color: theme.colors.primary.main,
    fontWeight: 'bold',
    fontSize: 24,
  },
  footerContainer: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.accent,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  footerText: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginVertical: 2,
  },
});