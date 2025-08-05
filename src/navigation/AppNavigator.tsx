// Main app navigation setup with bottom tabs
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import '../i18n'; // Initialize i18n
import { theme } from '../utils/theme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { Loading } from '../components/common/Loading';
import { SpeedometerIcon, CarIcon, SpannerIcon, GearIcon } from '../components/icons';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import VehiclesScreen from '../screens/VehiclesScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddVehicleScreen from '../screens/AddVehicleScreen';
import EditVehicleScreen from '../screens/EditVehicleScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { SignUpSuccessScreen } from '../screens/SignUpSuccessScreen';
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
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.borderLight,
        },
        headerTitleStyle: {
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text,
        },
        headerTintColor: theme.colors.primary,
      }}
    >
      <Stack.Screen
        name="VehiclesList"
        component={VehiclesScreen}
        options={({ navigation }) => ({
          title: t('vehicles.title', 'My Vehicles'),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('AddVehicle')}
              style={{
                marginRight: theme.spacing.md,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
              }}
            >
              <Text style={{
                color: theme.colors.primary,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.semibold,
              }}>
                {t('vehicles.add', 'Add')}
              </Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="AddVehicle"
        component={AddVehicleScreen}
        options={{
          title: t('vehicles.addNew', 'Add Vehicle'),
        }}
      />
      <Stack.Screen
        name="EditVehicle"
        component={EditVehicleScreen}
        options={{
          title: t('vehicles.editVehicle', 'Edit Vehicle'),
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
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="SignUpSuccess" component={SignUpSuccessScreen} />
      <Stack.Screen name="FirstVehicleWizard" component={FirstVehicleWizardScreen} />
      <Stack.Screen name="FirstVehicleSuccess" component={FirstVehicleSuccessScreen} />
      <Stack.Screen name="MainApp" component={MainAppNavigator} />
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
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderLight,
          },
          headerTitleStyle: {
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text,
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
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: t('navigation.dashboard', 'Dashboard'),
            tabBarIcon: ({ color, size }) => (
              <TabIcon name="dashboard" color={color} size={size} />
            ),
          }}
        />
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
          name="Maintenance"
          component={MaintenanceScreen}
          options={{
            title: t('navigation.maintenance', 'Maintenance'),
            tabBarIcon: ({ color, size }) => (
              <TabIcon name="maintenance" color={color} size={size} />
            ),
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
 * App navigation router that handles splash screen and auth state
 */
const AppNavigationRouter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Show branded splash screen first (for branding & future i18n)
  if (showSplash) {
    return (
      <SplashScreen 
        onComplete={() => setShowSplash(false)} 
      />
    );
  }

  // Show loading spinner while checking auth state
  if (isLoading) {
    return <Loading />;
  }

  // Route based on authentication state
  
  if (isAuthenticated) {
    return <MainAppNavigator />;
  } else {
    return <OnboardingStack />;
  }
};

/**
 * Main app navigator with authentication
 */
export const AppNavigator: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigationRouter />
      </NavigationContainer>
    </AuthProvider>
  );
};

// Custom SVG icon component for unique GarageLedger branding
interface TabIconProps {
  name: 'dashboard' | 'vehicles' | 'maintenance' | 'settings';
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