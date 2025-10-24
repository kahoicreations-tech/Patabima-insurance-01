import React, { useEffect } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
// import { Amplify } from 'aws-amplify';
import AppNavigator from './frontend/navigation';
import { AWSProviderDev } from './frontend/contexts/AWSContextDev';
import { AuthProvider } from './frontend/contexts/AuthContext';
// import awsConfig from './backend/config/awsConfigDev';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
        }}>
          <ActivityIndicator size="large" color="#D5222B" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#D5222B' }}>
        <StatusBar 
          barStyle="light-content" 
          translucent={false}
        />
        <AuthProvider>
          <AWSProviderDev>
            <AppNavigator />
          </AWSProviderDev>
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}
