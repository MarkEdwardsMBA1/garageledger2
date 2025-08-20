// Tabbed Insights Screen - Consolidates Reminders, Stats, and Costs in one place
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../utils/theme';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { RemindersTab } from '../components/tabs/RemindersTab';
import { StatsTabTeaser } from '../components/tabs/StatsTabTeaser';
import { CostsTabTeaser } from '../components/tabs/CostsTabTeaser';

type InsightsTab = 'reminders' | 'stats' | 'costs';

/**
 * Tabbed Insights Screen
 * Phase 1: Consolidates Reminders into tabbed interface
 * Future: Will add Stats and Costs tabs with premium teasers
 */
const TabbedInsightsScreen: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<InsightsTab>('reminders');

  // Tab options - Phase 1: Only Reminders active
  const tabOptions = [
    { key: 'reminders', label: t('navigation.reminders', 'Reminders') },
    { key: 'stats', label: 'Stats' }, // Will be implemented in Phase 2
    { key: 'costs', label: 'Costs' }, // Will be implemented in Phase 2
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'reminders':
        return <RemindersTab isActive={activeTab === 'reminders'} />;
      case 'stats':
        return <StatsTabTeaser />;
      case 'costs':
        return <CostsTabTeaser />;
      default:
        return <RemindersTab isActive={activeTab === 'reminders'} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <SegmentedControl
          options={tabOptions}
          selectedKey={activeTab}
          onSelect={(key) => {
            // Phase 2: Allow all tabs (Stats and Costs show upgrade teasers)
            setActiveTab(key as InsightsTab);
          }}
          style={styles.segmentedControl}
        />
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  segmentedControl: {
    // Tab styling handled by SegmentedControl component
  },
  content: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    // Placeholder for Phase 2 implementation
  },
});

export default TabbedInsightsScreen;