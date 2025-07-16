import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { QuoteCard } from '../../components';
import { Colors, Typography } from '../../../../constants';
import { insuranceProducts } from '../data';

/**
 * Payment and Confirmation component
 * @param {Object} formData - Form data
 * @param {Object} calculatedPremium - Premium calculation results
 * @param {Array} insurers - Available insurers
 * @param {Array} insuranceDurations - Available durations
 * @param {function} onUpdateFormData - Callback when form data changes
 * @param {function} onCalculatePremium - Callback to calculate premium
 * @param {boolean} showQuote - Whether to show the quote card
 * @param {function} onProceedToPayment - Callback to proceed to payment
 * @param {boolean} isProcessingPayment - Whether payment is processing
 * @param {boolean} isPaymentStep - Whether this is the payment step
 * @param {boolean} paymentCompleted - Whether payment is completed
 * @param {string} policyNumber - Policy number after payment
 */
const PaymentAndConfirmation = ({
  formData,
  calculatedPremium,
  insurers,
  insuranceDurations,
  onUpdateFormData,
  onCalculatePremium,
  showQuote,
  onProceedToPayment,
  isProcessingPayment,
  isPaymentStep = false,
  paymentCompleted = false,
  policyNumber = null
}) => {
  // Show different content based on payment step and completion status
  if (isPaymentStep && paymentCompleted && policyNumber) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Payment Successful</Text>
        <Text style={styles.subtitle}>
          Your insurance policy has been issued
        </Text>
        
        <View style={styles.policyCard}>
          <View style={styles.successIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          
          <Text style={styles.policyTitle}>Policy Details</Text>
          
          <View style={styles.policyDetail}>
            <Text style={styles.policyLabel}>Policy Number:</Text>
            <Text style={styles.policyValue}>{policyNumber}</Text>
          </View>
          
          <View style={styles.policyDetail}>
            <Text style={styles.policyLabel}>Insured Vehicle:</Text>
            <Text style={styles.policyValue}>{formData.make} {formData.model}</Text>
          </View>
          
          <View style={styles.policyDetail}>
            <Text style={styles.policyLabel}>Registration:</Text>
            <Text style={styles.policyValue}>{formData.registrationNumber}</Text>
          </View>
          
          <View style={styles.policyDetail}>
            <Text style={styles.policyLabel}>Cover Type:</Text>
            <Text style={styles.policyValue}>
              {insuranceProducts?.find(p => p.id === formData.coverType)?.name || 'Standard Cover'}
            </Text>
          </View>
          
          <View style={styles.policyDetail}>
            <Text style={styles.policyLabel}>Premium Amount:</Text>
            <Text style={styles.premiumValue}>KES {calculatedPremium?.totalPremium.toLocaleString()}</Text>
          </View>
        </View>
      </View>
    );
  } 
  
  // Payment step but payment not completed
  if (isPaymentStep && !paymentCompleted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Complete Your Payment</Text>
        <Text style={styles.subtitle}>
          Please complete the payment process to activate your policy
        </Text>
        
        <QuoteCard premium={calculatedPremium} />
        
        <View style={styles.paymentMethodCard}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          
          <TouchableOpacity 
            style={[
              styles.paymentMethod,
              styles.paymentMethodSelected
            ]}
          >
            <Text style={styles.paymentMethodText}>M-PESA</Text>
            <Text style={styles.paymentMethodIcon}>📱</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.paymentButton,
              isProcessingPayment && styles.paymentButtonDisabled
            ]}
            onPress={onProceedToPayment}
            disabled={isProcessingPayment}
          >
            <Text style={styles.paymentButtonText}>
              {isProcessingPayment ? 'Processing...' : 'Pay with M-PESA'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  // Normal quote calculation step
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insurance Details & Quote</Text>
      <Text style={styles.subtitle}>
        Select your insurer and duration to calculate your premium
      </Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Insurance Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Insurance Company *</Text>
            <View style={styles.insurerOptionsContainer}>
              {insurers.map((insurer) => (
                <TouchableOpacity
                  key={insurer.id}
                  style={[
                    styles.insurerOption,
                    formData.insurer === insurer.id && styles.insurerOptionSelected
                  ]}
                  onPress={() => onUpdateFormData('insurer', insurer.id)}
                >
                  <Text style={styles.insurerLogo}>{insurer.logo}</Text>
                  <View style={styles.insurerDetails}>
                    <Text 
                      style={[
                        styles.insurerName,
                        formData.insurer === insurer.id && styles.insurerNameSelected
                      ]}
                    >
                      {insurer.name}
                    </Text>
                    <Text style={styles.insurerRating}>Rating: {insurer.rating}/5</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Insurance Duration</Text>
            <View style={styles.durationOptionsRow}>
              {insuranceDurations.map((duration) => (
                <TouchableOpacity
                  key={duration.id}
                  style={[
                    styles.durationOption,
                    formData.insuranceDuration === duration.id && styles.durationOptionSelected
                  ]}
                  onPress={() => onUpdateFormData('insuranceDuration', duration.id)}
                >
                  <Text 
                    style={[
                      styles.durationText,
                      formData.insuranceDuration === duration.id && styles.durationTextSelected
                    ]}
                  >
                    {duration.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {formData.insurer && (
            <TouchableOpacity 
              style={styles.calculateButton}
              onPress={onCalculatePremium}
            >
              <Text style={styles.calculateButtonText}>
                Calculate Premium
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {showQuote && calculatedPremium && (
          <>
            <QuoteCard premium={calculatedPremium} />
            
            <TouchableOpacity
              style={styles.paymentButton}
              onPress={onProceedToPayment}
            >
              <Text style={styles.paymentButtonText}>
                Proceed to Payment
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: Colors.shadow,
  },
  // New styles for policy confirmation
  policyCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 24,
    marginTop: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: Colors.shadow,
    alignItems: 'center',
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: 'bold',
  },
  policyTitle: {
    ...Typography.headingMedium,
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  policyDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  policyLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  policyValue: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  premiumValue: {
    ...Typography.bodyLarge,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  // Payment method card
  paymentMethodCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    elevation: 1,
    shadowColor: Colors.shadow,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginVertical: 8,
  },
  paymentMethodSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  paymentMethodText: {
    ...Typography.bodyMedium,
    fontWeight: '500',
  },
  paymentMethodIcon: {
    fontSize: 20,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  insurerOptionsContainer: {
    marginBottom: 16,
  },
  insurerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginBottom: 10,
  },
  insurerOptionSelected: {
    backgroundColor: Colors.primary + '10', // 10% opacity
    borderColor: Colors.primary,
  },
  insurerLogo: {
    fontSize: 24,
    marginRight: 12,
  },
  insurerDetails: {
    flex: 1,
  },
  insurerName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  insurerNameSelected: {
    color: Colors.primary,
  },
  insurerRating: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  durationOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  durationOption: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    marginBottom: 10,
    minWidth: '20%',
  },
  durationOptionSelected: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  durationText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  durationTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  calculateButton: {
    backgroundColor: Colors.secondary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  calculateButtonText: {
    ...Typography.bodyMedium,
    color: Colors.white,
    fontWeight: '500',
  },
  paymentButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  paymentButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  paymentButtonText: {
    ...Typography.bodyLarge,
    color: Colors.white,
    fontWeight: '600',
  },
});

export default PaymentAndConfirmation;
