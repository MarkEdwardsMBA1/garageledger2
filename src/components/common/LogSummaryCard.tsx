// LogSummaryCard - Reusable component for displaying maintenance log summaries
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Typography } from './Typography';
import InfoCard from './InfoCard';
import { EmptyState } from './ErrorState';
import { theme } from '../../utils/theme';
import { MaintenanceLog } from '../../types';

interface LogSummaryCardProps {
  title: string;
  logs: MaintenanceLog[];
  maxItems?: number;
  showViewAll?: boolean;
  showLoadMore?: boolean;
  totalCount?: number;
  onViewAll?: () => void;
  onLoadMore?: () => void;
  onLogPress?: (log: MaintenanceLog) => void;
  style?: any;
}

/**
 * LogSummaryCard - Clean, reusable component for maintenance log summaries
 * 
 * Displays maintenance logs in a consistent format with:
 * - Service type (Shop/DIY)
 * - Date and mileage
 * - Services performed
 * - Optional View All / Load More actions
 */
const LogSummaryCard: React.FC<LogSummaryCardProps> = ({
  title,
  logs,
  maxItems = 10,
  showViewAll = false,
  showLoadMore = false,
  totalCount,
  onViewAll,
  onLoadMore,
  onLogPress,
  style,
}) => {
  // Apply maxItems limit
  const displayLogs = logs.slice(0, maxItems);

  // Empty state - Using consistent EmptyState component pattern
  if (logs.length === 0) {
    return (
      <View style={style}>
        <EmptyState
          title={title}
          message="No maintenance records found. Log services to see your history."
          type="empty"
          icon="📝"
        />
      </View>
    );
  }

  return (
    <InfoCard
      title={title}
      style={style}
    >
      <View style={styles.logsList}>
        {displayLogs.map((log, index) => {
          const serviceType = log.serviceType === 'shop' ? 'Shop Service' : 'DIY Service';
          const dateStr = log.date.toLocaleDateString();
          const mileageStr = log.mileage > 0 ? `${log.mileage.toLocaleString()} miles` : 'No mileage';
          
          // Create services summary
          let servicesText = 'No services listed';
          if (log.services && log.services.length > 0) {
            const serviceNames = log.services.map(service => service.serviceName);
            if (serviceNames.length <= 3) {
              servicesText = serviceNames.join(', ');
            } else {
              servicesText = `${serviceNames.slice(0, 3).join(', ')} +${serviceNames.length - 3} more`;
            }
          }

          return (
            <TouchableOpacity
              key={log.id || `log-${index}`}
              style={[
                styles.logSummaryRow,
                index < displayLogs.length - 1 && styles.logSummaryRowBorder,
                log.serviceType === 'shop' ? styles.logRowShop : styles.logRowDIY
              ]}
              onPress={() => onLogPress && onLogPress(log)}
              activeOpacity={0.7}
            >
              {/* Service Type - Main title */}
              <Typography variant="body" style={styles.serviceTypeText}>
                {serviceType}
              </Typography>
              
              {/* Date and Mileage - Secondary info */}
              <View style={styles.logDetailsRow}>
                <Typography variant="bodySmall" style={styles.logDetailText}>
                  {dateStr}
                </Typography>
                <Typography variant="bodySmall" style={styles.logDetailSeparator}>
                  •
                </Typography>
                <Typography variant="bodySmall" style={styles.logDetailText}>
                  {mileageStr}
                </Typography>
                {log.totalCost && log.totalCost > 0 && (
                  <>
                    <Typography variant="bodySmall" style={styles.logDetailSeparator}>
                      •
                    </Typography>
                    <Typography variant="bodySmall" style={styles.costText}>
                      ${log.totalCost.toFixed(2)}
                    </Typography>
                  </>
                )}
              </View>
              
              {/* Services List - Tertiary info */}
              <Typography variant="bodySmall" style={styles.servicesText}>
                {servicesText}
              </Typography>
            </TouchableOpacity>
          );
        })}
        
        {/* Action Buttons */}
        {(showViewAll || showLoadMore) && (
          <View style={styles.actionsContainer}>
            {showViewAll && onViewAll && (
              <TouchableOpacity onPress={onViewAll} style={styles.actionButton}>
                <Typography variant="bodySmall" style={styles.actionText}>
                  View All{totalCount ? ` (${totalCount})` : ''}
                </Typography>
              </TouchableOpacity>
            )}
            
            {showLoadMore && onLoadMore && (
              <TouchableOpacity onPress={onLoadMore} style={styles.actionButton}>
                <Typography variant="bodySmall" style={styles.actionText}>
                  Load More
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </InfoCard>
  );
};

const styles = StyleSheet.create({
  // Logs List Container
  logsList: {
    gap: theme.spacing.sm,
  },
  
  // Individual Log Row
  logSummaryRow: {
    paddingLeft: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderLeftWidth: 4,
    gap: theme.spacing.xs,
  },
  logSummaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  
  // Service Type Colors (matching VehicleHomeScreen timeline)
  logRowShop: {
    borderLeftColor: theme.colors.primary, // Engine Blue for Shop
  },
  logRowDIY: {
    borderLeftColor: theme.colors.secondary, // Racing Green for DIY
  },
  
  // Text Styles
  serviceTypeText: {
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  // Details Row (Date • Mileage • Cost)
  logDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  logDetailText: {
    color: theme.colors.textSecondary,
  },
  logDetailSeparator: {
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.xs / 2,
  },
  costText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  // Services Text
  servicesText: {
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  
  // Actions Container
  actionsContainer: {
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  actionButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  actionText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default LogSummaryCard;