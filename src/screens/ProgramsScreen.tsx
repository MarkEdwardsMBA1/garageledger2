// Programs screen for managing maintenance programs and schedules
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/ErrorState';
import { ClipboardIcon, MaintenanceIcon, ChevronRightIcon, CalendarIcon } from '../components/icons';
import { programRepository } from '../repositories/SecureProgramRepository';
import { MaintenanceProgram } from '../types';
import { useAuth } from '../contexts/AuthContext';

/**
 * Programs screen - manage maintenance programs and schedules
 * Full implementation with program list, search, and management
 */
const ProgramsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuth();
  
  // State management
  const [programs, setPrograms] = useState<MaintenanceProgram[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<MaintenanceProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load programs data
  const loadPrograms = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const userPrograms = await programRepository.getUserPrograms();
      setPrograms(userPrograms);
      setFilteredPrograms(userPrograms);
    } catch (error) {
      console.error('Error loading programs:', error);
      setPrograms([]);
      setFilteredPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter programs based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPrograms(programs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = programs.filter(program => 
      program.name.toLowerCase().includes(query) ||
      (program.description && program.description.toLowerCase().includes(query)) ||
      program.tasks.some(task => 
        task.name.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      )
    );
    
    setFilteredPrograms(filtered);
  }, [searchQuery, programs]);

  // Load programs on mount and when screen is focused
  useEffect(() => {
    loadPrograms();
  }, [isAuthenticated]);

  useFocusEffect(
    React.useCallback(() => {
      loadPrograms();
    }, [isAuthenticated])
  );

  // Handle create new program
  const handleCreateProgram = () => {
    navigation.navigate('CreateProgramVehicleSelection');
  };

  // Handle program selection
  const handleProgramPress = (program: MaintenanceProgram) => {
    navigation.navigate('ProgramDetail', { programId: program.id });
  };

  // Render program card
  const renderProgramCard = (program: MaintenanceProgram) => {
    const taskCount = program.tasks.length;
    const activeTaskCount = program.tasks.filter(task => task.isActive).length;
    const assignedVehicleCount = program.assignedVehicleIds.length;

    return (
      <TouchableOpacity
        key={program.id}
        onPress={() => handleProgramPress(program)}
        activeOpacity={0.7}
      >
        <Card variant="elevated" style={styles.programCard}>
          <View style={styles.programHeader}>
            <View style={styles.programInfo}>
              <Typography variant="heading" style={styles.programName}>
                {program.name}
              </Typography>
              {program.description && (
                <Typography variant="body" style={styles.programDescription} numberOfLines={2}>
                  {program.description}
                </Typography>
              )}
            </View>
            <View style={styles.programStatus}>
              <View style={[styles.statusIndicator, { 
                backgroundColor: program.isActive ? theme.colors.success : theme.colors.textSecondary 
              }]} />
              <ChevronRightIcon size={20} color={theme.colors.textSecondary} />
            </View>
          </View>

          <View style={styles.programStats}>
            <View style={styles.statItem}>
              <MaintenanceIcon size={16} color={theme.colors.primary} />
              <Typography variant="caption" style={styles.statText}>
                {activeTaskCount}/{taskCount} {t('programs.tasks', 'tasks')}
              </Typography>
            </View>
            
            {assignedVehicleCount > 0 && (
              <View style={styles.statItem}>
                <View style={[styles.vehicleIndicator, { backgroundColor: theme.colors.secondary }]} />
                <Typography variant="caption" style={styles.statText}>
                  {assignedVehicleCount} {assignedVehicleCount === 1 
                    ? t('programs.vehicle', 'vehicle') 
                    : t('programs.vehicles', 'vehicles')
                  }
                </Typography>
              </View>
            )}

            <Typography variant="caption" style={styles.statDate}>
              {t('programs.updated', 'Updated')} {program.updatedAt.toLocaleDateString()}
            </Typography>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  // Render empty state (card-based design matching Vehicles screen)
  const renderEmptyState = () => {
    console.log('📅 ProgramsScreen: Rendering custom empty state with card layout');
    return (
      <View style={styles.emptyStateContainer}>
        <Card variant="elevated" style={styles.emptyStateCard}>
          <View style={styles.emptyStateContent}>
            {/* Calendar image at the top */}
            <View style={styles.emptyStateImageContainer}>
              <CalendarIcon size={160} color={theme.colors.text} />
            </View>
            
            {/* Text below the image */}
            <Typography variant="body" style={styles.emptyStateText}>
              This is where your list of maintenance programs will appear. Click Create Program to get started.
            </Typography>
          </View>
        </Card>
        
        {/* CTA button below the card */}
        <Button
          title="Create Program"
          onPress={handleCreateProgram}
          variant="primary"
          style={styles.emptyStateCTAButton}
          testID="create-program-empty-button"
        />
      </View>
    );
  };

  // Render no search results
  const renderNoResults = () => (
    <EmptyState
      title={t('common.empty.title', 'No Results Found')}
      message={`No programs found for "${searchQuery}"`}
      icon="🔍"
    />
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          placeholder={t('programs.searchPlaceholder', 'Search programs...')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Programs List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Loading message={t('programs.loading', 'Loading programs...')} />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {filteredPrograms.length === 0 ? (
            searchQuery ? renderNoResults() : renderEmptyState()
          ) : (
            <>
              {filteredPrograms.map(renderProgramCard)}
              
              {/* Add Program button at bottom of list */}
              <View style={styles.addProgramButtonContainer}>
                <Button
                  title={t('programs.createProgram', 'Create Program')}
                  onPress={handleCreateProgram}
                  variant="primary"
                  style={styles.addProgramButton}
                />
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Search Section
  searchContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  searchInput: {
    marginVertical: 0,
  },
  
  // Content
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Program Cards
  programCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  programInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  programName: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  programDescription: {
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  programStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  
  // Program Stats
  programStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statText: {
    color: theme.colors.textSecondary,
  },
  statDate: {
    color: theme.colors.textSecondary,
    marginLeft: 'auto',
  },
  vehicleIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Add Program Button
  addProgramButtonContainer: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  addProgramButton: {
    minHeight: 48,
  },

  // Empty state styles (matching Vehicles screen)
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xl * 2,
  },
  emptyStateCard: {
    width: '100%',
    maxWidth: 320,
    marginBottom: theme.spacing.xl,
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.lg,
    minHeight: 280,
  },
  emptyStateImageContainer: {
    marginBottom: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  emptyStateCTAButton: {
    width: '100%',
    maxWidth: 320,
    minHeight: 48,
    backgroundColor: theme.colors.primary, // Engine blue
  },
});

export default ProgramsScreen;