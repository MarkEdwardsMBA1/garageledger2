// Main app navigation setup with bottom tabs
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import '../i18n'; // Initialize i18n
import { theme } from '../utils/theme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { Loading } from '../components/common/Loading';
import { SpeedometerIcon, CarIcon, SpannerIcon, GearIcon, ClipboardIcon } from '../components/icons';
import { Typography } from '../components/common/Typography';

// Import screens  
import VehiclesScreen from '../screens/VehiclesScreen';
import VehicleHomeScreen from '../screens/VehicleHomeScreen';
import TabbedInsightsScreen from '../screens/TabbedInsightsScreen';
import AddMaintenanceLogScreen from '../screens/AddMaintenanceLogScreen';
import ProgramsScreen from '../screens/ProgramsScreen';
import CreateProgramVehicleSelectionScreen from '../screens/CreateProgramVehicleSelectionScreen';
import CreateProgramDetailsScreen from '../screens/CreateProgramDetailsScreen';
import CreateProgramServicesScreen from '../screens/CreateProgramServicesScreen';
import AssignProgramsScreen from '../screens/AssignProgramsScreen';
import AssignProgramToVehiclesScreen from '../screens/AssignProgramToVehiclesScreen';
import ProgramDetailScreen from '../screens/ProgramDetailScreen';
import EditProgramScreen from '../screens/EditProgramScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddVehicleScreen from '../screens/AddVehicleScreen';
import EditVehicleScreen from '../screens/EditVehicleScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { WelcomeChoiceScreen } from '../screens/WelcomeChoiceScreen';
import { SignUpSuccessScreen } from '../screens/SignUpSuccessScreen';
import { LegalAgreementsScreen } from '../screens/LegalAgreementsScreen';
import { OnboardingFlowScreen } from '../screens/OnboardingFlowScreen';
import { GoalsSetupScreen } from '../screens/GoalsSetupScreen';
import { GoalsSuccessScreen } from '../screens/GoalsSuccessScreen';
import { FirstVehicleWizardScreen } from '../screens/FirstVehicleWizardScreen';
import { FirstVehicleSuccessScreen } from '../screens/FirstVehicleSuccessScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/**
 * Vehicles stack navigator
 */
const VehiclesStack: React.FC = () => {
  const t = (key: string, fallback?: string) => fallback || key.split('.').pop() || key;
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary, // Engine Blue header
          borderBottomWidth: 0, // Remove border for cleaner look
        },
        headerTitleStyle: {
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.surface, // White text on Engine Blue
        },
        headerTintColor: theme.colors.surface, // White back button and icons
      }}
    >
      <Stack.Screen
        name="VehiclesList"
        component={VehiclesScreen}
        options={{
          title: t('vehicles.title', 'My Vehicles'),
          headerLeft: () => null, // Remove back button for root tab screen
        }}
      />
      <Stack.Screen
        name="AddVehicle"
        component={AddVehicleScreen}
        options={{
          title: t('vehicles.addNew', 'Add Vehicle'),
          headerBackTitle: 'Vehicles', // Shows arrow + parent name
          headerLeft: undefined, // Use default back button (ensures arrow shows)
        }}
      />
      <Stack.Screen
        name="VehicleHome"
        component={VehicleHomeScreen}
        options={({ route, navigation }) => {
          // Extract vehicle info from params if available for dynamic title
          const params = route.params as any;
          return {
            title: 'Vehicle Details', // Will be updated with actual vehicle name when loaded
            headerBackTitle: 'Vehicles', // Shows arrow + parent name
            headerLeft: undefined, // Use default back button (ensures arrow shows)
            headerRight: undefined,
          };
        }}
      />
      <Stack.Screen
        name="EditVehicle"
        component={EditVehicleScreen}
        options={{
          title: t('vehicles.editVehicle', 'Edit Vehicle'),
          headerBackTitle: 'Vehicles', // Shows arrow + parent name
          headerLeft: undefined, // Use default back button (ensures arrow shows)
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Maintenance stack navigator
 * Handles maintenance logging and viewing
 */
const MaintenanceStackNavigator: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary, // Engine Blue header
          borderBottomWidth: 0, // Remove border for cleaner look
        },
        headerTitleStyle: {
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.surface, // White text on Engine Blue
        },
        headerTintColor: theme.colors.surface, // White back button and icons
      }}
    >
      <Stack.Screen
        name="MaintenanceList"
        component={TabbedInsightsScreen}
        options={{
          title: t('navigation.insights', 'Insights'),
          headerLeft: () => null, // Remove back button for root tab screen
        }}
      />
      <Stack.Screen
        name="AddMaintenanceLog"
        component={AddMaintenanceLogScreen}
        options={{
          title: t('maintenance.logMaintenance', 'Log Maintenance'),
          headerBackTitle: 'Insights', // Shows arrow + parent name
          headerLeft: undefined, // Use default back button (ensures arrow shows)
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Onboarding and Authentication stack navigator
 * Handles the complete user journey from welcome to first vehicle
 */
const OnboardingStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Login" // Skip onboarding for returning users, go directly to Login
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="OnboardingFlow" component={OnboardingFlowScreen} />
      <Stack.Screen name="GoalsSetup" component={GoalsSetupScreen} />
      <Stack.Screen name="GoalsSuccess" component={GoalsSuccessScreen} />
      <Stack.Screen name="WelcomeChoice" component={WelcomeChoiceScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="LegalAgreements" component={LegalAgreementsScreen} />
      <Stack.Screen name="SignUpSuccess" component={SignUpSuccessScreen} />
      <Stack.Screen name="FirstVehicleWizard" component={FirstVehicleWizardScreen} />
      <Stack.Screen name="FirstVehicleSuccess" component={FirstVehicleSuccessScreen} />
      <Stack.Screen name="MainApp" component={MainAppNavigator} />
    </Stack.Navigator>
  );
};

/**
 * Legal Compliance stack navigator
 * For authenticated users who need to complete legal agreements
 */
const LegalComplianceStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="LegalAgreements"
    >
      <Stack.Screen name="OnboardingFlow" component={OnboardingFlowScreen} />
      <Stack.Screen name="WelcomeChoice" component={WelcomeChoiceScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="LegalAgreements" component={LegalAgreementsScreen} />
      <Stack.Screen name="SignUpSuccess" component={SignUpSuccessScreen} />
      <Stack.Screen name="FirstVehicleWizard" component={FirstVehicleWizardScreen} />
      <Stack.Screen name="FirstVehicleSuccess" component={FirstVehicleSuccessScreen} />
      <Stack.Screen name="MainApp" component={MainAppNavigator} />
    </Stack.Navigator>
  );
};

/**
 * Programs stack navigator for Program management functionality
 */
const ProgramsStackNavigator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary, // Engine Blue header
          borderBottomWidth: 0, // Remove border for cleaner look
        },
        headerTitleStyle: {
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.surface, // White text on Engine Blue
        },
        headerTintColor: theme.colors.surface, // White back button and icons
      }}
    >
      <Stack.Screen
        name="ProgramsList"
        component={ProgramsScreen}
        options={{
          title: t('navigation.programs', 'Programs'),
          headerLeft: () => null, // Remove back button for root tab screen
        }}
      />
      <Stack.Screen
        name="CreateProgramVehicleSelection"
        component={CreateProgramVehicleSelectionScreen}
        options={{
          title: t('programs.createProgram', 'Create Program'),
          headerBackTitle: 'Programs', // Shows arrow + parent name
          headerLeft: undefined, // Use default back button (ensures arrow shows)
        }}
      />
      <Stack.Screen
        name="CreateProgramDetails"
        component={CreateProgramDetailsScreen}
        options={{
          title: t('programs.createProgram', 'Create Program'), 
          headerBackTitle: 'Programs', // Shows arrow + parent name
          headerLeft: undefined, // Use default back button (ensures arrow shows)
        }}
      />
      <Stack.Screen
        name="CreateProgramServices"
        component={CreateProgramServicesScreen}
        options={{
          title: t('programs.createProgram', 'Create Program'), 
          headerBackTitle: 'Programs', // Shows arrow + parent name
          headerLeft: undefined, // Use default back button (ensures arrow shows)
        }}
      />
      <Stack.Screen
        name="AssignPrograms"
        component={AssignProgramsScreen}
        options={{
          title: t('programs.assignPrograms', 'Assign Programs'),
          headerBackTitle: 'Vehicle', // Shows arrow + parent name
          headerLeft: undefined, // Use default back button (ensures arrow shows)
        }}
      />
      <Stack.Screen
        name="AssignProgramToVehicles"
        component={AssignProgramToVehiclesScreen}
        options={{
          title: t('programs.assignToVehicles', 'Assign to Vehicles'),
          headerBackTitle: 'Programs', // Shows arrow + parent name
          headerLeft: undefined, // Use default back button (ensures arrow shows)
        }}
      />
      <Stack.Screen
        name="ProgramDetail"
        component={ProgramDetailScreen}
        options={{
          title: t('programs.programDetails', 'Program Details'),
          headerBackTitle: 'Programs', // Shows arrow + parent name
          headerLeft: undefined, // Use default back button (ensures arrow shows)
        }}
      />
      <Stack.Screen
        name="EditProgram"
        component={EditProgramScreen}
        options={{
          title: t('programs.editProgram', 'Edit Program'),
          headerBackTitle: 'Details', // Shows arrow + parent name
          headerLeft: undefined, // Use default back button (ensures arrow shows)
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Protected main app navigation with bottom tabs
 * Supports internationalization and consistent theming
 */
const MainAppNavigator: React.FC = () => {
  const t = (key: string, fallback?: string) => fallback || key.split('.').pop() || key;
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary, // Engine Blue header
            borderBottomWidth: 0, // Remove border for cleaner look
          },
          headerTitleStyle: {
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.surface, // White text on Engine Blue
          },
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.borderLight,
            paddingBottom: Math.max(insets.bottom, theme.spacing.sm),
            paddingTop: theme.spacing.xs,
            height: 60 + Math.max(insets.bottom, theme.spacing.sm),
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            marginTop: theme.spacing.xs,
          },
          tabBarIconStyle: {
            marginTop: theme.spacing.xs,
          },
        }}
      >
        <Tab.Screen
          name="Vehicles"
          component={VehiclesStack}
          options={{
            title: t('navigation.vehicles', 'Vehicles'),
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <TabIcon name="vehicles" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Insights"
          component={MaintenanceStackNavigator}
          options={{
            title: t('navigation.insights', 'Insights'),
            tabBarIcon: ({ color, size }) => (
              <TabIcon name="insights" color={color} size={size} />
            ),
            headerShown: false, // Let the stack handle the header
          }}
        />
        <Tab.Screen
          name="Programs"
          component={ProgramsStackNavigator}
          options={{
            title: t('navigation.programs', 'Programs'),
            tabBarIcon: ({ color, size }) => (
              <TabIcon name="programs" color={color} size={size} />
            ),
            headerShown: false, // Let the stack handle the header
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: t('navigation.settings', 'Settings'),
            tabBarIcon: ({ color, size }) => (
              <TabIcon name="settings" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
  );
};

/**
 * App navigation router that handles auth state, and legal compliance
 */
const AppNavigationRouter: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
  const [needsLegalCompliance, setNeedsLegalCompliance] = useState(false);

  // Effect to check if user has completed initial legal acceptance
  React.useEffect(() => {
    const checkLegalCompliance = async () => {
      // Double-check authentication state to avoid errors during sign-out
      if (isAuthenticated && user?.uid && !isCheckingCompliance) {
        setIsCheckingCompliance(true);
        try {
          // Import services
          const { legalComplianceService } = await import('../services/LegalComplianceService');
          const { vehicleRepository } = await import('../repositories/VehicleRepository');
          
          // TEMPORARY WORKAROUND: Check vehicle count to determine legal compliance
          // Until Firestore indexes are properly configured for legal compliance collection
          const vehicles = await vehicleRepository.getAll();
          const hasVehicles = vehicles.length > 0;
          
          if (hasVehicles) {
            // Users with vehicles have likely already accepted terms - skip check
            console.log('User has vehicles, assuming legal compliance completed');
            setNeedsLegalCompliance(false);
          } else {
            // New users without vehicles need to accept terms
            console.log('New user without vehicles, requiring legal acceptance');
            try {
              const requiresAcceptance = await legalComplianceService.requiresNewAcceptance(user.uid);
              setNeedsLegalCompliance(requiresAcceptance);
            } catch (error) {
              console.warn('Legal compliance check failed, defaulting to required for new users:', error);
              setNeedsLegalCompliance(true);
            }
          }
          
          // Vehicle data already loaded above for compliance check
        } catch (error: any) {
          // Silently handle auth errors during sign-out to avoid error flood
          if (error.message?.includes('Authentication required') || 
              error.message?.includes('auth') ||
              error.message?.includes('Unauthorized')) {
            // Don't log these during normal sign-out flow
          } else {
            console.error('Failed to check legal compliance:', error);
          }
          // Default to NOT requiring compliance to prevent lockouts
          setNeedsLegalCompliance(false);
        } finally {
          setIsCheckingCompliance(false);
        }
      } else if (!isAuthenticated) {
        // Reset state when user logs out
        setNeedsLegalCompliance(false);
        setIsCheckingCompliance(false);
      }
    };

    checkLegalCompliance();
  }, [isAuthenticated, user?.uid]); // Remove isCheckingCompliance from dependencies to prevent infinite loop

  // Show loading spinner while checking auth state or compliance
  if (isLoading || isCheckingCompliance) {
    return <Loading />;
  }

  // Route based on authentication state and initial legal acceptance
  if (isAuthenticated && user) {
    // For new users who haven't completed initial legal acceptance
    if (needsLegalCompliance) {
      // Show legal agreements during initial signup flow
      return <LegalComplianceStack />;
    }
    
    return <MainAppNavigator />;
  } else {
    return <OnboardingStack />;
  }
};

/**
 * Navigation container with splash screen and auth-based key for proper stack reset
 */
const AuthAwareNavigationContainer: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [hasShownSplash, setHasShownSplash] = useState(false);
  
  // Show splash screen until auth is fully resolved to prevent flashing
  if (showSplash && !hasShownSplash) {
    return (
      <SplashScreen 
        onComplete={() => {
          // Only complete splash when auth loading is done
          // This prevents the flash between splash and sign-in screens
          if (!isLoading) {
            setTimeout(() => {
              setShowSplash(false);
              setHasShownSplash(true);
            }, 200); // Small buffer for smooth transition
          } else {
            // Auth still loading, check again in a moment
            setTimeout(() => {
              if (!isLoading) {
                setShowSplash(false);
                setHasShownSplash(true);
              }
            }, 100);
          }
        }} 
      />
    );
  }
  
  return (
    <NavigationContainer key={isAuthenticated ? 'authenticated' : 'unauthenticated'}>
      <AppNavigationRouter />
    </NavigationContainer>
  );
};

/**
 * Main app navigator with authentication
 */
export const AppNavigator: React.FC = () => {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor={theme.colors.primary} />
      <AuthAwareNavigationContainer />
    </AuthProvider>
  );
};

// Custom SVG icon component for unique GarageLedger branding
interface TabIconProps {
  name: 'dashboard' | 'vehicles' | 'maintenance' | 'insights' | 'programs' | 'settings';
  color: string;
  size: number;
}

const TabIcon: React.FC<TabIconProps> = ({ name, color, size }) => {
  const iconStyle = { 
    opacity: color === theme.colors.primary ? 1 : 0.6 
  };

  switch (name) {
    case 'dashboard':
      return (
        <View style={iconStyle}>
          <SpeedometerIcon size={size} color={color} />
        </View>
      );
    case 'vehicles':
      return (
        <View style={iconStyle}>
          <CarIcon size={size} color={color} />
        </View>
      );
    case 'maintenance':
      return (
        <View style={iconStyle}>
          <SpannerIcon size={size} color={color} />
        </View>
      );
    case 'insights':
      return (
        <View style={iconStyle}>
          <SpeedometerIcon size={size} color={color} />
        </View>
      );
    case 'programs':
      return (
        <View style={iconStyle}>
          <ClipboardIcon size={size} color={color} />
        </View>
      );
    case 'settings':
      return (
        <View style={iconStyle}>
          <GearIcon size={size} color={color} />
        </View>
      );
    default:
      return (
        <View style={iconStyle}>
          <GearIcon size={size} color={color} />
        </View>
      );
  }
};

export default AppNavigator;