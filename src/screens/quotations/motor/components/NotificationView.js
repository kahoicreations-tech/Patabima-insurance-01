import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Typography } from '../../../../constants';

/**
 * Notification View component
 * Displays payment notification and options
 * @param {Object} premium - Premium calculation
 * @param {string} paymentMethod - Payment method (M-PESA, Card, etc.)
 * @param {function} onProceed - Continue callback
 * @param {function} onCancel - Cancel callback
 */
const NotificationView = ({
  premium,
  paymentMethod = 'M-PESA',
  onProceed,
  onCancel
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>TOR For Private</Text>
        <Text style={styles.subtitle}>
          Payment
        </Text>
      </View>

      <View style={styles.notificationCard}>
        <Image
          source={require('../../../../../assets/PataLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.notificationTitle}>
          Transaction Pending
        </Text>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount:</Text>
          <Text style={styles.amount}>
            KES {premium?.totalPremium?.toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.paymentInfoContainer}>
          <Text style={styles.paymentInfoText}>
            Please confirm the {paymentMethod} payment on your phone
          </Text>
          <Text style={styles.paymentInfoText}>
            A prompt has been sent to your registered mobile number
          </Text>
        </View>
        
        <Image
          source={require('../../../../../assets/PataLogo.png')} // Replace with payment icon
          style={styles.paymentLogo}
          resizeMode="contain"
        />
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel Payment</Text>
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
  notificationCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    margin: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  notificationTitle: {
    ...Typography.headingMedium,
    color: Colors.warning,
    marginBottom: 24,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  amount: {
    ...Typography.headingMedium,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  paymentInfoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  paymentInfoText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  paymentLogo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  cancelButtonText: {
    ...Typography.bodyMedium,
    color: Colors.error,
  },
});

export default NotificationView;
