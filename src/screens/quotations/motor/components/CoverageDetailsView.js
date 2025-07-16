import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Typography } from '../../../../constants';

/**
 * Coverage Details component
 * Shows coverage details, limits, and benefits
 * @param {Object} insuranceProduct - Selected insurance product
 * @param {function} onContinue - Continue callback
 */
const CoverageDetailsView = ({ 
  insuranceProduct,
  onContinue 
}) => {
  const coverageItems = [
    { 
      id: 'liability', 
      name: 'Third Party Liability', 
      checked: true 
    },
    { 
      id: 'damage', 
      name: 'Own Damage', 
      checked: insuranceProduct?.id?.includes('comprehensive') || false 
    },
    { 
      id: 'theft', 
      name: 'Theft and Fire', 
      checked: insuranceProduct?.id?.includes('comprehensive') || false
    },
    { 
      id: 'windscreen', 
      name: 'Windscreen damage', 
      checked: insuranceProduct?.id?.includes('comprehensive') || false
    },
    { 
      id: 'excess', 
      name: 'Excess protector', 
      checked: false
    },
    { 
      id: 'riots', 
      name: 'Riots and Strikes', 
      checked: false
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>TOR For Private</Text>
        <Text style={styles.subtitle}>
          Coverage Details
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coverageCard}>
          <Text style={styles.sectionTitle}>Policy Coverage</Text>
          
          {coverageItems.map(item => (
            <View key={item.id} style={styles.coverageItem}>
              <View style={styles.checkboxRow}>
                <View style={[
                  styles.checkbox,
                  item.checked && styles.checkboxChecked
                ]}>
                  {item.checked && <Text style={styles.checkIcon}>✓</Text>}
                </View>
                <Text style={styles.coverageText}>{item.name}</Text>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.coverageCard}>
          <Text style={styles.sectionTitle}>Limits and Exclusions</Text>
          <Text style={styles.disclaimerText}>
            • Maximum liability for third party property damage is KES 5 million
          </Text>
          <Text style={styles.disclaimerText}>
            • Excludes driving under influence of alcohol or drugs
          </Text>
          <Text style={styles.disclaimerText}>
            • Does not cover wear and tear, mechanical or electrical breakdown
          </Text>
          <Text style={styles.disclaimerText}>
            • Excludes depreciation and consequential loss
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.continueButton}
          onPress={onContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    padding: 16,
  },
  title: {
    ...Typography.headingMedium,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  coverageCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    ...Typography.headingSmall,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  coverageItem: {
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  checkIcon: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  coverageText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  disclaimerText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 16,
  },
  continueButtonText: {
    ...Typography.buttonText,
    color: Colors.white,
  },
});

export default CoverageDetailsView;
