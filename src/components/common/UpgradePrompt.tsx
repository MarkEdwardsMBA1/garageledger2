// Reusable Upgrade Prompt Component
// Standardizes upgrade prompts across the app for consistency
import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { theme } from '../../utils/theme';
import { Typography } from './Typography';
import { Card } from './Card';
import { Button } from './Button';
import { LockIcon } from '../icons';

export interface UpgradePromptItem {
  title: string;
  description: string;
}

interface UpgradePromptProps {
  items: UpgradePromptItem[];
  buttonTitle: string;
  onUpgrade: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  items,
  buttonTitle,
  onUpgrade,
  loading = false,
  disabled = false,
  style,
}) => {
  return (
    <View style={[styles.upgradeSection, style]}>
      {items.map((item, index) => (
        <Card key={index} variant="outlined" style={styles.upgradeCard}>
          <View style={styles.upgradeTitleRow}>
            <Typography variant="bodyLarge" style={styles.upgradeTitle}>
              {item.title}
            </Typography>
            <LockIcon size={18} color={theme.colors.textSecondary} />
          </View>
          <Typography variant="body" style={styles.upgradeDescription}>
            {item.description}
          </Typography>
        </Card>
      ))}
      
      <Button
        title={buttonTitle}
        variant="primary"
        onPress={onUpgrade}
        loading={loading}
        disabled={disabled || loading}
        style={styles.bottomUpgradeButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  upgradeSection: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  upgradeCard: {
    padding: theme.spacing.lg,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  upgradeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  upgradeTitle: {
    color: theme.colors.text,
  },
  upgradeDescription: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  bottomUpgradeButton: {
    marginTop: theme.spacing.md,
    marginHorizontal: 0, // Full width like cards
  },
});