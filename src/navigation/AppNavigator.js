import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen, QuotationsScreen, UpcomingScreen, MyAccountScreen, MotorQuotationScreen } from '../screens';
import { Colors } from '../constants';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Simple icon component using emoji
const TabIcon = ({ emoji, focused }) => (
  <Text style={{ 
    fontSize: 24, 
    opacity: focused ? 1 : 0.6 
  }}>
    {emoji}
  </Text>
);

// Home Stack Navigator to include the MotorQuotation screen
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MotorQuotation" component={MotorQuotationScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
}
