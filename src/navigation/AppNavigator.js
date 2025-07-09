import React, { useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, Animated, StyleSheet, Platform } from 'react-native';
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
import { Colors, Typography, Spacing } from '../constants';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// Enhanced custom tab bar component with animations
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  
  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  // Animation references for each tab
  const animatedValues = useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;

  // Animate the active tab
  useEffect(() => {
    // Reset all animations
    animatedValues.forEach((value, index) => {
      Animated.timing(value, {
        toValue: index === state.index ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  }, [state.index]);

  return (
    <View style={[
      styles.tabBarContainer,
      { paddingBottom: Math.max(insets.bottom, 8) }
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || route.name;
        const emoji = options.tabBarEmoji || '📱';
        const isFocused = state.index === index;
        
        // Animation values
        const iconScale = animatedValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2]
        });
        
        const dotOpacity = animatedValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1]
        });

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                <View style={styles.iconContainer}>
                  <Text style={[
                    styles.tabIcon,
                    isFocused && styles.tabIconActive
                  ]}>
                    {emoji}
                  </Text>
                </View>
              </Animated.View>
              
              <Text style={[
                styles.tabLabel,
                isFocused && styles.tabLabelActive
              ]}>
                {label}
              </Text>
              
              {/* Indicator dot */}
              <Animated.View 
                style={[
                  styles.activeDot,
                  { opacity: dotOpacity }
                ]} 
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

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
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarEmoji: "🏠",
          tabBarLabel: "Home",
          tabBarAccessibilityLabel: "Home Screen"
        }}
      />
      <Tab.Screen
        name="Quotations"
        component={QuotationsScreen}
        options={{
          tabBarEmoji: "📄",
          tabBarLabel: "Quotations",
          tabBarAccessibilityLabel: "Quotations Screen"
        }}
      />
      <Tab.Screen
        name="Upcoming"
        component={UpcomingScreen}
        options={{
          tabBarEmoji: "📅",
          tabBarLabel: "Upcoming",
          tabBarAccessibilityLabel: "Upcoming Screen"
        }}
      />
      <Tab.Screen
        name="My Account"
        component={MyAccountScreen}
        options={{
          tabBarEmoji: "👤",
          tabBarLabel: "Account",
          tabBarAccessibilityLabel: "My Account Screen"
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

// Custom styles for tab bar
const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minHeight: 50,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabIcon: {
    fontSize: 24,
    color: Colors.tabInactive,
    opacity: 0.8,
  },
  tabIconActive: {
    color: Colors.tabActive,
    opacity: 1,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.tabInactive,
    marginTop: 2,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.tabActive,
  },
  activeDot: {
    position: 'absolute',
    top: -6,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  }
});
