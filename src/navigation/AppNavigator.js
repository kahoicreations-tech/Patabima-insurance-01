import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen, QuotationsScreen, UpcomingScreen, MyAccountScreen, MotorQuotationScreen } from '../screens';
import SplashScreen from '../screens/auth/SplashScreen';
import InsuranceWelcomeScreen from '../screens/auth/InsuranceWelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import { Colors } from '../constants';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// Simple icon component using emoji
const TabIcon = ({ emoji, focused }) => (
  <Text style={{ 
    fontSize: 24, 
    opacity: focused ? 1 : 0.6 
  }}>
    {emoji}
  </Text>
);

// Authentication Stack Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: false 
      }}
      initialRouteName="Splash"
    >
      <AuthStack.Screen name="Splash" component={SplashScreen} />
      <AuthStack.Screen name="InsuranceWelcome" component={InsuranceWelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// Home Stack Navigator to include the MotorQuotation screen
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MotorQuotation" component={MotorQuotationScreen} />
    </Stack.Navigator>
  );
}

// Main App Tab Navigator
function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, 8), // Use safe area bottom or minimum 8
          paddingTop: 8,
          height: 65 + Math.max(insets.bottom, 8), // Dynamic height based on safe area
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Poppins_500Medium',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Quotations"
        component={QuotationsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📄" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Upcoming"
        component={UpcomingScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📅" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="My Account"
        component={MyAccountScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Navigation Component
function AppNavigatorContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // You could show a loading screen here
    return null;
  }
  
  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainTabNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

export default function AppNavigator() {
  return (
    <AuthProvider>
      <AppNavigatorContent />
    </AuthProvider>
  );
}
