import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Colors, Typography } from '../../../../constants';

/**
 * Owner Information Form component
 * @param {Object} formData - Owner form data
 * @param {function} onUpdateFormData - Callback when form data changes
 */
const OwnerInformationForm = ({ formData, onUpdateFormData }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Owner Information</Text>
      <Text style={styles.subtitle}>
        Enter the vehicle owner's details
      </Text>
      
      <View style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.ownerName}
            onChangeText={(value) => onUpdateFormData('ownerName', value)}
            placeholder="e.g. John Kamau Mwangi"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ID Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.ownerIdNumber}
            onChangeText={(value) => onUpdateFormData('ownerIdNumber', value)}
            placeholder="e.g. 12345678"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputRow}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.ownerPhone}
              onChangeText={(value) => onUpdateFormData('ownerPhone', value)}
              placeholder="e.g. 0712345678"
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.ownerEmail}
              onChangeText={(value) => onUpdateFormData('ownerEmail', value)}
              placeholder="e.g. john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Previous Insurer (if any)</Text>
          <TextInput
            style={styles.input}
            value={formData.previousInsurer}
            onChangeText={(value) => onUpdateFormData('previousInsurer', value)}
            placeholder="e.g. Jubilee Insurance"
          />
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
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  inputLabel: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    ...Typography.bodyMedium,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});

export default OwnerInformationForm;
