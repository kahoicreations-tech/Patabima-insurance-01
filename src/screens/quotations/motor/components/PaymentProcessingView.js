import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography } from '../../../../constants';
import NotificationView from './NotificationView';
import ConfirmationView from './ConfirmationView';

/**
 * Payment Processing View component
 * Handles the payment flow including processing, notification and confirmation
 * @param {Object} premium - Premium calculation
 * @param {string} paymentMethod - Selected payment method
 * @param {Object} policyDetails - Policy details
 * @param {function} onPaymentComplete - Callback after payment completion
 * @param {function} onBack - Back button callback
 */
const PaymentProcessingView = ({
  premium,
  paymentMethod,
  policyDetails,
  onPaymentComplete,
  onBack,
  onDownloadReceipt,
  onGoHome
}) => {
  const [paymentStatus, setPaymentStatus] = useState('processing'); // processing, notification, confirmed, failed
  
  // Simulate payment flow
  useEffect(() => {
    // Start with processing screen
    const processingTimeout = setTimeout(() => {
      setPaymentStatus('notification');
      
      // Simulate payment confirmation after some time
      const notificationTimeout = setTimeout(() => {
        // Simulate a successful payment (could be failed in real scenario)
        setPaymentStatus('confirmed');
        if (onPaymentComplete) {
          onPaymentComplete({
            status: 'success',
            transactionId: 'TRX' + Math.floor(Math.random() * 10000000),
            policyNumber: 'PB-MOTOR-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000)
          });
        }
      }, 5000);
      
      return () => clearTimeout(notificationTimeout);
    }, 3000);
    
    return () => clearTimeout(processingTimeout);
  }, []);
  
  const handleCancelPayment = () => {
    setPaymentStatus('failed');
    if (onBack) onBack();
  };
  
  // Processing view with spinner
  if (paymentStatus === 'processing') {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Processing Payment</Text>
          <Text style={styles.subtitle}>
            Please wait while we process your payment
          </Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            Initializing payment...
          </Text>
        </View>
      </View>
    );
  }
  
  // Payment notification (waiting for user action on phone)
  if (paymentStatus === 'notification') {
    return (
      <NotificationView
        premium={premium}
        paymentMethod={paymentMethod}
        onCancel={handleCancelPayment}
      />
    );
  }
  
  // Payment confirmation (success)
  if (paymentStatus === 'confirmed') {
    return (
      <ConfirmationView
        premium={premium}
        policyDetails={policyDetails}
        onDownloadReceipt={onDownloadReceipt}
        onGoHome={onGoHome}
      />
    );
  }
  
  // Payment failed
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.subtitle}>
          We couldn't process your payment
        </Text>
      </View>

      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          There was an error processing your payment. Please try again or select a different payment method.
        </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    ...Typography.bodyMedium,
    color: Colors.error,
    textAlign: 'center',
  }
});

export default PaymentProcessingView;
