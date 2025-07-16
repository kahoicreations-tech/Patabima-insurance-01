import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Typography } from '../../../../constants';

/**
 * Policy Details View component
 * Shows comprehensive information about the policy and vehicle
 * @param {Object} formData - Form data
 * @param {Object} insuranceProduct - Selected insurance product
 * @param {Object} vehicleCategory - Selected vehicle category
 * @param {function} onContinue - Continue callback
 */
const PolicyDetailsView = ({ 
  formData, 
  insuranceProduct, 
  vehicleCategory,
  onContinue
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>TOR For Private</Text>
        <Text style={styles.subtitle}>
          Policy Details
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <View style={styles.policyDetailRow}>
            <Text style={styles.detailLabel}>Cover Type:</Text>
            <Text style={styles.detailValue}>{insuranceProduct?.name || 'Comprehensive'}</Text>
          </View>
          <View style={styles.policyDetailRow}>
            <Text style={styles.detailLabel}>Vehicle Make:</Text>
            <Text style={styles.detailValue}>{formData?.make || 'Not specified'}</Text>
          </View>
          <View style={styles.policyDetailRow}>
            <Text style={styles.detailLabel}>Vehicle Model:</Text>
            <Text style={styles.detailValue}>{formData?.model || 'Not specified'}</Text>
          </View>
          <View style={styles.policyDetailRow}>
            <Text style={styles.detailLabel}>Reg No:</Text>
            <Text style={styles.detailValue}>{formData?.registrationNumber || 'Not specified'}</Text>
          </View>
          <View style={styles.policyDetailRow}>
            <Text style={styles.detailLabel}>Year:</Text>
            <Text style={styles.detailValue}>{formData?.yearOfManufacture || 'Not specified'}</Text>
          </View>
          <View style={styles.policyDetailRow}>
            <Text style={styles.detailLabel}>Color:</Text>
            <Text style={styles.detailValue}>{formData?.color || 'Not specified'}</Text>
          </View>
          <View style={styles.policyDetailRow}>
            <Text style={styles.detailLabel}>Chassis Number:</Text>
            <Text style={styles.detailValue}>{formData?.chassisNumber || 'Not specified'}</Text>
          </View>
          <View style={styles.policyDetailRow}>
            <Text style={styles.detailLabel}>Engine Number:</Text>
            <Text style={styles.detailValue}>{formData?.engineNumber || 'Not specified'}</Text>
          </View>
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
  sectionCard: {
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
  policyDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
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

export default PolicyDetailsView;
