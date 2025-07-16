import React, { useEffect } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
// import { Amplify } from 'aws-amplify';
import { AppNavigator } from './src/navigation';
import { AWSProviderDev } from './src/contexts/AWSContextDev';
// import awsConfig from './src/config/awsConfigDev';

export default function App() {
  // TODO: Re-enable AWS Amplify initialization after fixing circular dependencies
  // useEffect(() => {
  //   Amplify.configure(awsConfig);
  // }, []);

  let [fontsLoaded] = useFonts({
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
          backgroundColor: '#FFFFFF' 
        }}>
          <ActivityIndicator size="large" color="#D5222B" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AWSProviderDev>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#D5222B" 
          translucent={false}
        />
        <AppNavigator />
      </AWSProviderDev>
    </SafeAreaProvider>
  );
}
