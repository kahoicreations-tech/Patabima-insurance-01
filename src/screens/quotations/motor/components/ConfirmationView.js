import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Typography } from '../../../../constants';

/**
 * Confirmation View component
 * Displays transaction confirmation and next steps
 * @param {Object} premium - Premium calculation
 * @param {Object} policyDetails - Policy details
 * @param {function} onDownloadReceipt - Download receipt callback
 * @param {function} onGoHome - Go home callback
 */
const ConfirmationView = ({
  premium,
  policyDetails,
  onDownloadReceipt,
  onGoHome
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Payment Confirmation</Text>
        <Text style={styles.subtitle}>
          Your payment has been processed successfully
        </Text>
      </View>

      <View style={styles.confirmationCard}>
        <View style={styles.successIconContainer}>
          <Image
            source={require('../../../../../assets/PataLogo.png')} // Replace with success icon
            style={styles.successIcon}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.successTitle}>
          Transaction Successful
        </Text>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount Paid:</Text>
          <Text style={styles.amount}>
            KES {premium?.totalPremium?.toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.policyInfoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Policy Number:</Text>
            <Text style={styles.infoValue}>{policyDetails?.policyNumber || 'PB-MOTOR-2023-0001'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Transaction ID:</Text>
            <Text style={styles.infoValue}>{policyDetails?.transactionId || 'TRX12345678'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>
        
        <Text style={styles.emailInfo}>
          Policy documents have been sent to your registered email address
        </Text>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={onDownloadReceipt}
          >
            <Text style={styles.downloadButtonText}>Download Receipt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={onGoHome}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
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
  confirmationCard: {
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
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    width: 40,
    height: 40,
  },
  successTitle: {
    ...Typography.headingMedium,
    color: Colors.success,
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
  policyInfoContainer: {
    width: '100%',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  infoValue: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  emailInfo: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonsContainer: {
    width: '100%',
  },
  downloadButton: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  downloadButtonText: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  homeButtonText: {
    ...Typography.bodyMedium,
    color: Colors.white,
    fontWeight: 'bold',
  },
});

export default ConfirmationView;
