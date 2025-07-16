import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Colors, Typography } from '../../../../constants';

/**
 * Vehicle Registration Verification component
 * @param {string} registrationNumber - Current registration number
 * @param {function} onChangeRegistration - Callback when registration changes
 * @param {function} onVerify - Callback to verify registration
 * @param {boolean} isVerifying - Whether verification is in progress
 * @param {boolean} isVerified - Whether vehicle is verified
 */
const VehicleRegistrationVerification = ({
  registrationNumber,
  onChangeRegistration,
  onVerify,
  isVerifying,
  isVerified
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Vehicle Registration</Text>
      <Text style={styles.subtitle}>
        Enter your vehicle registration number to verify with AKI database
      </Text>
      
      <View style={styles.verificationContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Registration Number *</Text>
          <View style={styles.registrationInputRow}>
            <TextInput
              style={styles.registrationInput}
              value={registrationNumber}
              onChangeText={onChangeRegistration}
              placeholder="e.g. KCA123A"
              maxLength={8}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.akiButton, isVerifying && styles.akiButtonDisabled]}
              onPress={() => onVerify(registrationNumber)}
              disabled={isVerifying || !registrationNumber}
            >
              {isVerifying ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.akiButtonText}>AKI Verify</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified with AKI database</Text>
            </View>
          )}

          {registrationNumber && !isVerified && (
            <Text style={styles.verificationHint}>
              Click "AKI Verify" to automatically fetch vehicle details
            </Text>
          )}
        </View>
      </View>
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
  verificationContainer: {
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  registrationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registrationInput: {
    flex: 1,
    ...Typography.bodyMedium,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  akiButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  akiButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  akiButtonText: {
    ...Typography.bodyMedium,
    color: Colors.white,
    fontWeight: '500',
  },
  verifiedBadge: {
    backgroundColor: Colors.success + '20', // 20% opacity
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    ...Typography.bodySmall,
    color: Colors.success,
    fontWeight: '500',
  },
  verificationHint: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});

export default VehicleRegistrationVerification;
