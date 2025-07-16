import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors, Typography } from '../../../../constants';

/**
 * Receipt component
 * Displays payment receipt and policy information
 * @param {Object} formData - Form data
 * @param {Object} premium - Premium calculation
 * @param {string} policyNumber - Policy number
 * @param {function} onClose - Close callback
 * @param {function} onDownload - Download callback
 */
const ReceiptView = ({ 
  formData, 
  premium, 
  policyNumber,
  onClose,
  onDownload
}) => {
  const currentDate = new Date();
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  return (
    <View style={styles.container}>
      <View style={styles.receiptCard}>
        <View style={styles.receiptHeader}>
          <Text style={styles.receiptTitle}>RECEIPT</Text>
          <Image 
            style={styles.logo}
            source={require('../../../../../assets/PataLogo.png')}
            resizeMode="contain"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.policyDetails}>
          <View style={styles.policyDetailRow}>
            <Text style={styles.detailLabel}>Policy Number</Text>
            <Text style={styles.detailValue}>{policyNumber}</Text>
          </View>
          
          <View style={styles.policyDetailRow}>
            <Text style={styles.detailLabel}>Insured</Text>
            <Text style={styles.detailValue}>{formData.ownerName}</Text>
          </View>
          
          <View style={styles.policyDetailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValueHighlight}>KES {premium?.totalPremium?.toLocaleString()}</Text>
          </View>
          
          <View style={styles.policyDetailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{currentDate.toLocaleDateString()}</Text>
          </View>
          
          <View style={styles.policyDetailRow}>
            <Text style={styles.detailLabel}>Expiry</Text>
            <Text style={styles.detailValue}>{expiryDate.toLocaleDateString()}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.paymentConfirmation}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <Text style={styles.confirmationText}>Payment Confirmed!</Text>
          <Text style={styles.confirmationTime}>
            Processed at {currentDate.toLocaleTimeString()}
          </Text>
        </View>
        
        <View style={styles.vehicleDetails}>
          <Text style={styles.vehicleText}>
            {formData.yearOfManufacture} {formData.make} {formData.model}
          </Text>
          <Text style={styles.vehicleText}>{formData.registrationNumber}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={onDownload}
        >
          <Text style={styles.downloadButtonText}>Download Receipt</Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Image 
            style={styles.qrCode}
            source={require('../../../../../assets/PataLogo.png')} // Replace with QR code
            resizeMode="contain"
          />
          <Text style={styles.footerText}>
            For any queries, please call our helpline
          </Text>
          <Text style={styles.helpline}>+254 700 123 456</Text>
          <Text style={styles.footerText}>support@patabima.com</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  receiptCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  receiptTitle: {
    ...Typography.headingLarge,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  logo: {
    width: 50,
    height: 50,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  policyDetails: {
    marginBottom: 16,
  },
  policyDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  detailValueHighlight: {
    ...Typography.bodyLarge,
    color: Colors.success,
    fontWeight: 'bold',
  },
  paymentConfirmation: {
    alignItems: 'center',
    marginVertical: 16,
  },
  checkCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  confirmationText: {
    ...Typography.headingMedium,
    color: Colors.success,
    marginBottom: 8,
  },
  confirmationTime: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  vehicleDetails: {
    alignItems: 'center',
    marginVertical: 16,
    padding: 16,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
  },
  vehicleText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  downloadButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 16,
  },
  downloadButtonText: {
    ...Typography.buttonText,
    color: Colors.white,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  qrCode: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  footerText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  helpline: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default ReceiptView;
