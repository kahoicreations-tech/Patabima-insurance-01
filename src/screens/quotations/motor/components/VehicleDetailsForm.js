import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Colors, Typography } from '../../../../constants';

/**
 * Vehicle Details Form component
 * @param {Object} formData - Vehicle form data
 * @param {function} onUpdateFormData - Callback when form data changes
 * @param {Array} usageTypes - Available usage types
 */
const VehicleDetailsForm = ({ formData, onUpdateFormData, usageTypes }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vehicle Details</Text>
      <Text style={styles.subtitle}>
        Enter your vehicle information
      </Text>
      
      <View style={styles.formCard}>
        <View style={styles.inputRow}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Make *</Text>
            <TextInput
              style={styles.input}
              value={formData.make}
              onChangeText={(value) => onUpdateFormData('make', value)}
              placeholder="e.g. Toyota"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Model *</Text>
            <TextInput
              style={styles.input}
              value={formData.model}
              onChangeText={(value) => onUpdateFormData('model', value)}
              placeholder="e.g. Corolla"
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Year of Manufacture *</Text>
            <TextInput
              style={styles.input}
              value={formData.yearOfManufacture}
              onChangeText={(value) => onUpdateFormData('yearOfManufacture', value)}
              placeholder="2020"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Engine Capacity (CC) *</Text>
            <TextInput
              style={styles.input}
              value={formData.engineCapacity}
              onChangeText={(value) => onUpdateFormData('engineCapacity', value)}
              placeholder="1500"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Vehicle Value (KES) *</Text>
          <TextInput
            style={styles.input}
            value={formData.vehicleValue}
            onChangeText={(value) => onUpdateFormData('vehicleValue', value)}
            placeholder="2500000"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Usage Type *</Text>
          <View style={styles.optionsRow}>
            {usageTypes.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.optionButton,
                  formData.usageType === type.id && styles.optionButtonSelected
                ]}
                onPress={() => onUpdateFormData('usageType', type.id)}
              >
                <Text 
                  style={[
                    styles.optionText,
                    formData.usageType === type.id && styles.optionTextSelected
                  ]}
                >
                  {type.name}
                </Text>
                <Text style={styles.optionDescription}>
                  {type.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Claims History</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                formData.claimsHistory === 'No' && styles.toggleOptionSelected
              ]}
              onPress={() => onUpdateFormData('claimsHistory', 'No')}
            >
              <Text 
                style={[
                  styles.toggleText,
                  formData.claimsHistory === 'No' && styles.toggleTextSelected
                ]}
              >
                No Claims
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                formData.claimsHistory === 'Yes' && styles.toggleOptionSelected
              ]}
              onPress={() => onUpdateFormData('claimsHistory', 'Yes')}
            >
              <Text 
                style={[
                  styles.toggleText,
                  formData.claimsHistory === 'Yes' && styles.toggleTextSelected
                ]}
              >
                Has Claims
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Vehicle Modifications</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                formData.modifications === 'No' && styles.toggleOptionSelected
              ]}
              onPress={() => onUpdateFormData('modifications', 'No')}
            >
              <Text 
                style={[
                  styles.toggleText,
                  formData.modifications === 'No' && styles.toggleTextSelected
                ]}
              >
                No Modifications
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                formData.modifications === 'Yes' && styles.toggleOptionSelected
              ]}
              onPress={() => onUpdateFormData('modifications', 'Yes')}
            >
              <Text 
                style={[
                  styles.toggleText,
                  formData.modifications === 'Yes' && styles.toggleTextSelected
                ]}
              >
                Modified
              </Text>
            </TouchableOpacity>
          </View>
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
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  inputGroup: {
    marginBottom: 16,
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
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    marginBottom: 10,
    flex: 1,
    minWidth: '30%',
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  optionText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  optionDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
  },
  toggleOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  toggleOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
  },
  toggleTextSelected: {
    color: Colors.white,
    fontWeight: '500',
  },
});

export default VehicleDetailsForm;
