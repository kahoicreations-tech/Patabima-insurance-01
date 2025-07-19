/**
 * Check Insurance Status Screen
 * 
 * Allows users to check if their vehicle is currently insured
 * by entering their registration number
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeScreen, CompactCurvedHeader, Button, Input } from '../../../components';
import { Colors, Layout, Typography } from '../../../constants';

export default function CheckInsuranceStatusScreen({ navigation }) {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCheckStatus = async () => {
    if (!registrationNumber.trim()) {
      Alert.alert('Required Field', 'Please enter your vehicle registration number.');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      // Mock response - you can integrate with actual API
      const mockInsuranceData = {
        isInsured: Math.random() > 0.5, // Random for demo
        company: 'ABC Insurance',
        policyNumber: 'POL-2024-001',
        expiryDate: '2024-12-31',
      };

      if (mockInsuranceData.isInsured) {
        Alert.alert(
          'Vehicle is Insured ✅',
          `Your vehicle is currently insured with ${mockInsuranceData.company}.\n\nPolicy: ${mockInsuranceData.policyNumber}\nExpiry: ${mockInsuranceData.expiryDate}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Vehicle Not Insured ❌',
          'Your vehicle does not appear to be insured. Would you like to get a quote?',
          [
            { text: 'Not Now', style: 'cancel' },
            { 
              text: 'Get Quote', 
              onPress: () => {
                navigation.goBack();
                // Navigate to quotation after a short delay
                setTimeout(() => {
                  navigation.navigate('MotorQuotation');
                }, 100);
              }
            }
          ]
        );
      }
    }, 2000);
  };

  return (
    <SafeScreen>
      <StatusBar style="light" />
      
      <CompactCurvedHeader 
        title="Check Insurance Status"
        subtitle="Enter your vehicle details to check coverage"
        showBackButton={true}
        onBackPress={handleBack}
        height={80}
      />
      
      <View style={styles.container}>
        <View style={styles.headerSpacing} />
        
        <View style={styles.formSection}>
          <Text style={styles.instructionText}>
            Enter your vehicle registration number to check if it's currently insured.
          </Text>
          
          <Input
            label="Vehicle Registration Number"
            placeholder="e.g., KCA 123A"
            value={registrationNumber}
            onChangeText={setRegistrationNumber}
            style={styles.input}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          
          <Button
            title="Check Insurance Status"
            onPress={handleCheckStatus}
            loading={loading}
            disabled={!registrationNumber.trim()}
            style={styles.checkButton}
          />
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why Check Insurance Status?</Text>
          <Text style={styles.infoText}>
            • Verify current coverage before renewal{'\n'}
            • Check policy details and expiry dates{'\n'}
            • Avoid duplicate insurance purchases{'\n'}
            • Ensure compliance with legal requirements
          </Text>
        </View>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Layout.padding,
  },
  headerSpacing: {
    height: 24,
  },
  formSection: {
    marginBottom: Layout.padding * 2,
  },
  instructionText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Layout.padding * 1.5,
    lineHeight: 22,
  },
  input: {
    marginBottom: Layout.padding * 1.5,
  },
  checkButton: {
    marginTop: Layout.padding,
  },
  infoSection: {
    backgroundColor: Colors.backgroundLight,
    padding: Layout.padding,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoTitle: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Layout.padding / 2,
  },
  infoText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
