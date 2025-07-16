import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Colors, Typography } from '../../../../constants';

/**
 * Payment Method Selection component
 * Allows users to choose their preferred payment method
 * @param {Object} premium - Premium calculation details
 * @param {function} onSelectPaymentMethod - Callback when payment method is selected
 * @param {function} onBack - Back button callback
 */
const PaymentMethodSelection = ({
  premium,
  onSelectPaymentMethod,
  onBack
}) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-PESA',
      icon: require('../../../../../assets/PataLogo.png'), // Replace with M-PESA icon
      description: 'Pay via M-PESA mobile money service'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: require('../../../../../assets/PataLogo.png'), // Replace with card icon
      description: 'Pay using Visa, Mastercard, or other cards'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: require('../../../../../assets/PataLogo.png'), // Replace with bank icon
      description: 'Pay via direct bank transfer'
    }
  ];

  const handleMethodSelection = (methodId) => {
    setSelectedMethod(methodId);
  };

  const handleProceed = () => {
    if (selectedMethod) {
      onSelectPaymentMethod(selectedMethod);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Payment Method</Text>
        <Text style={styles.subtitle}>
          Choose your preferred payment method
        </Text>
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.premiumSummary}>
          <Text style={styles.premiumLabel}>Amount to Pay:</Text>
          <Text style={styles.premiumAmount}>
            KES {premium?.totalPremium?.toLocaleString()}
          </Text>
        </View>

        <View style={styles.methodsContainer}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.selectedMethodCard
              ]}
              onPress={() => handleMethodSelection(method.id)}
            >
              <Image
                source={method.icon}
                style={styles.methodIcon}
                resizeMode="contain"
              />
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
              <View style={[
                styles.radioButton,
                selectedMethod === method.id && styles.radioButtonSelected
              ]}>
                {selectedMethod === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.proceedButton,
            !selectedMethod && styles.disabledButton
          ]}
          onPress={handleProceed}
          disabled={!selectedMethod}
        >
          <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </View>
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
  contentContainer: {
    flex: 1,
  },
  premiumSummary: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  premiumLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  premiumAmount: {
    ...Typography.headingSmall,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  methodsContainer: {
    marginHorizontal: 16,
  },
  methodCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedMethodCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  methodIcon: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  methodDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    alignItems: 'center',
  },
  backButtonText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  proceedButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: Colors.disabledBackground,
  },
  proceedButtonText: {
    ...Typography.bodyMedium,
    color: Colors.white,
    fontWeight: 'bold',
  },
});

export default PaymentMethodSelection;
