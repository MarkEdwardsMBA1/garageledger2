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
import InfoCard from '../components/common/InfoCard';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/ErrorState';
import { ClipboardIcon, MaintenanceIcon, ChevronRightIcon, CalendarIcon, AlertIcon } from '../components/icons';
import { programRepository } from '../repositories/SecureProgramRepository';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { MaintenanceProgram, Vehicle, getProgramTypeInfo } from '../types';
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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
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

  // Load vehicles data
  const loadVehicles = async () => {
    if (!isAuthenticated) return;
    
    setVehiclesLoading(true);
    try {
      const userVehicles = await vehicleRepository.getUserVehicles();
      setVehicles(userVehicles);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setVehicles([]);
    } finally {
      setVehiclesLoading(false);
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

  // Load data on mount and when screen is focused
  useEffect(() => {
    loadPrograms();
    loadVehicles();
  }, [isAuthenticated]);

  useFocusEffect(
    React.useCallback(() => {
      loadPrograms();
      loadVehicles();
    }, [isAuthenticated])
  );

  // Handle create new program
  const handleCreateProgram = () => {
    navigation.navigate('CreateProgramVehicleSelection');
  };

  // Handle program selection - navigate to Edit Program screen
  const handleProgramPress = (program: MaintenanceProgram) => {
    navigation.navigate('EditProgram', { programId: program.id });
  };

  // Calculate overview statistics
  const getOverviewStats = () => {
    const totalPrograms = programs.length;
    const assignedVehicleIds = new Set();
    programs.forEach(program => {
      program.assignedVehicleIds.forEach(vehicleId => assignedVehicleIds.add(vehicleId));
    });
    const vehiclesWithPrograms = assignedVehicleIds.size;
    const vehiclesWithoutPrograms = vehicles.length - vehiclesWithPrograms;
    
    return {
      totalPrograms,
      vehiclesWithPrograms,
      vehiclesWithoutPrograms
    };
  };

  // Get vehicle display name (nickname or year make model)
  const getVehicleDisplayName = (vehicleId: string): string => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return 'Unknown Vehicle';
    
    if (vehicle.nickname && vehicle.nickname.trim()) {
      return `${vehicle.nickname} (${vehicle.year} ${vehicle.make} ${vehicle.model})`;
    }
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  // Render program card
  const renderProgramCard = (program: MaintenanceProgram) => {
    const taskCount = program.tasks.length;
    const activeTaskCount = program.tasks.filter(task => task.isActive).length;
    const serviceRemindersCount = program.tasks.filter(task => task.isActive).length;
    const assignedVehicleCount = program.assignedVehicleIds.length;
    
    // Get program type information
    const programTypeInfo = getProgramTypeInfo(program);
    
    // Get assigned vehicles details with proper formatting
    const assignedVehicles = program.assignedVehicleIds.map(vehicleId => {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) return 'Unknown Vehicle';
      
      if (vehicle.nickname && vehicle.nickname.trim()) {
        return `${vehicle.nickname}, ${vehicle.year} ${vehicle.make} ${vehicle.model}`;
      }
      return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    });

    // Format last updated date
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    };

    return (
      <TouchableOpacity
        key={program.id}
        onPress={() => handleProgramPress(program)}
        activeOpacity={0.7}
      >
        <InfoCard
          title={program.name}
          subtitle={program.description}
          style={styles.programCard}
        >
          {/* Program Type */}
          <View style={styles.statRow}>
            <Typography variant="caption" style={styles.statLabel}>
              Program Type:{' '}
            </Typography>
            <View style={[
              styles.programTypeBadge,
              programTypeInfo.isAdvanced && styles.programTypeBadgeAdvanced
            ]}>
              <Typography variant="caption" style={[
                styles.programTypeText,
                programTypeInfo.isAdvanced && styles.programTypeTextAdvanced
              ]}>
                {programTypeInfo.displayName}
              </Typography>
            </View>
          </View>

          {/* Vehicles in Program */}
          {assignedVehicles.length > 0 && (
            <View style={[styles.statRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
              <View style={styles.vehiclesRow}>
                <Typography variant="caption" style={styles.statLabel}>
                  Vehicles:{' '}
                </Typography>
                <View style={styles.vehiclesList}>
                  {assignedVehicles.map((vehicleName, index) => (
                    <Typography key={index} variant="caption" style={styles.vehicleListItem}>
                      {vehicleName}
                    </Typography>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Service Reminders Count */}
          <View style={[styles.statRow, { flexDirection: 'row', alignItems: 'center' }]}>
            <Typography variant="caption" style={styles.statLabel}>
              Service reminders: {serviceRemindersCount}
            </Typography>
          </View>
          
          {/* Last Updated Date */}
          <View style={[styles.statRow, { flexDirection: 'row', alignItems: 'center' }]}>
            <Typography variant="caption" style={styles.statLabel}>
              Date last updated: {formatDate(program.updatedAt)}
            </Typography>
          </View>
        </InfoCard>
      </TouchableOpacity>
    );
  };

  // Render overview card with statistics
  const renderOverviewCard = () => {
    const stats = getOverviewStats();
    
    return (
      <InfoCard
        title="Overview"
        style={styles.overviewCard}
      >
        <View style={styles.overviewStats}>
          <View style={styles.overviewStatItem}>
            <Typography variant="title" style={styles.overviewStatNumber}>
              {stats.totalPrograms}
            </Typography>
            <Typography variant="caption" style={styles.overviewStatLabel}>
              {stats.totalPrograms === 1 ? 'Program' : 'Programs'}
            </Typography>
          </View>
          
          <View style={styles.overviewStatItem}>
            <Typography variant="title" style={[styles.overviewStatNumber, { color: theme.colors.success }]}>
              {stats.vehiclesWithPrograms}
            </Typography>
            <Typography variant="caption" style={styles.overviewStatLabel}>
              {stats.vehiclesWithPrograms === 1 ? 'Vehicle' : 'Vehicles'} with Programs
            </Typography>
          </View>
          
          <View style={styles.overviewStatItem}>
            <Typography 
              variant="title" 
              style={[
                styles.overviewStatNumber, 
                { color: stats.vehiclesWithoutPrograms === 0 ? theme.colors.success : '#f59e0b' } // Racing Green if 0, yellow if > 0
              ]}
            >
              {stats.vehiclesWithoutPrograms}
            </Typography>
            <Typography variant="caption" style={styles.overviewStatLabel}>
              {stats.vehiclesWithoutPrograms === 1 ? 'Vehicle' : 'Vehicles'} without Programs
            </Typography>
          </View>
        </View>
      </InfoCard>
    );
  };

  // Render empty state (card-based design matching Vehicles screen)
  const renderEmptyState = () => {
    console.log('📅 ProgramsScreen: Rendering custom empty state with card layout');
    return (
      <View style={styles.emptyStateContainer}>
        <InfoCard
          title=""
          style={styles.emptyStateCard}
        >
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
        </InfoCard>
        
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
      illustration={<AlertIcon size={80} color="#f59e0b" />}
    />
  );

  return (
    <View style={styles.container}>
      {/* Programs List */}
      {loading || vehiclesLoading ? (
        <View style={styles.loadingContainer}>
          <Loading message={t('programs.loading', 'Loading programs...')} />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Overview Card - Always show when we have data */}
          {(programs.length > 0 || vehicles.length > 0) && renderOverviewCard()}
          
          {/* Search Bar - Below Overview card */}
          <View style={styles.searchContainer}>
            <Input
              placeholder={t('programs.searchPlaceholder', 'Search programs...')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>

          {filteredPrograms.length === 0 ? (
            searchQuery ? renderNoResults() : (programs.length === 0 ? renderEmptyState() : null)
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
  
  // Overview Section
  overviewCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  overviewTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'left',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  overviewStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewStatNumber: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontSize: 28,
    fontWeight: theme.typography.fontWeight.bold,
  },
  overviewStatLabel: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm,
  },

  // Search Section
  searchContainer: {
    paddingHorizontal: 0,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'transparent',
    marginBottom: theme.spacing.sm,
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
    marginBottom: theme.spacing.md,
  },
  programName: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  programDescription: {
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },

  // Vehicles Section in Program Cards
  vehiclesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  vehiclesList: {
    flex: 1,
  },
  vehicleListItem: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs / 2,
    fontSize: theme.typography.fontSize.sm, // Match caption variant size
  },
  
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
  },
  
  // Program Type Badge Styles
  programTypeBadge: {
    backgroundColor: theme.colors.success + '20', // Basic programs - light green
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.success,
    marginLeft: theme.spacing.xs,
  },
  programTypeBadgeAdvanced: {
    backgroundColor: theme.colors.primary + '20', // Advanced programs - light blue
    borderColor: theme.colors.primary,
  },
  programTypeText: {
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  programTypeTextAdvanced: {
    color: theme.colors.primary,
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