/**
 * Vehicle Details Form Component
 * 
 * Handles vehicle-specific information for motor insurance
 * Includes registration number, make/model, year, engine capacity, and usage type
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions
} from 'react-native';
import { Colors, Spacing, Typography } from '../../../../constants';

const { width } = Dimensions.get('window');

const VehicleDetailsForm = ({ 
  formData, 
  updateFormData, 
  errors, 
  clearError 
}) => {
  const [showMakeModelModal, setShowMakeModelModal] = useState(false);
  const [showUsageTypeModal, setShowUsageTypeModal] = useState(false);

  // Vehicle makes and models data
  const vehicleMakeModels = [
    { id: 1, name: 'Toyota Corolla', make: 'Toyota', category: 'Sedan', engineCapacity: '1500-1800' },
    { id: 2, name: 'Toyota Vitz', make: 'Toyota', category: 'Hatchback', engineCapacity: '1000-1500' },
    { id: 3, name: 'Toyota Fielder', make: 'Toyota', category: 'Station Wagon', engineCapacity: '1500-1800' },
    { id: 4, name: 'Toyota Prado', make: 'Toyota', category: 'SUV', engineCapacity: '2700-4000' },
    { id: 5, name: 'Toyota Hilux', make: 'Toyota', category: 'Pickup', engineCapacity: '2400-3000' },
    { id: 6, name: 'Nissan Note', make: 'Nissan', category: 'Hatchback', engineCapacity: '1200-1600' },
    { id: 7, name: 'Nissan Tiida', make: 'Nissan', category: 'Sedan', engineCapacity: '1500-1800' },
    { id: 8, name: 'Nissan X-Trail', make: 'Nissan', category: 'SUV', engineCapacity: '2000-2500' },
    { id: 9, name: 'Honda Fit', make: 'Honda', category: 'Hatchback', engineCapacity: '1200-1500' },
    { id: 10, name: 'Honda Vezel', make: 'Honda', category: 'SUV', engineCapacity: '1500-1800' },
    { id: 11, name: 'Subaru Forester', make: 'Subaru', category: 'SUV', engineCapacity: '2000-2500' },
    { id: 12, name: 'Subaru Impreza', make: 'Subaru', category: 'Sedan', engineCapacity: '1500-2000' },
    { id: 13, name: 'Mazda Axela', make: 'Mazda', category: 'Sedan', engineCapacity: '1500-2000' },
    { id: 14, name: 'Mazda Demio', make: 'Mazda', category: 'Hatchback', engineCapacity: '1200-1500' },
    { id: 15, name: 'Mitsubishi Outlander', make: 'Mitsubishi', category: 'SUV', engineCapacity: '2000-2400' },
    { id: 16, name: 'BMW 320i', make: 'BMW', category: 'Sedan', engineCapacity: '2000-3000' },
    { id: 17, name: 'Mercedes C-Class', make: 'Mercedes', category: 'Sedan', engineCapacity: '1800-3500' },
    { id: 18, name: 'Audi A4', make: 'Audi', category: 'Sedan', engineCapacity: '1800-3000' },
    { id: 19, name: 'Volkswagen Golf', make: 'Volkswagen', category: 'Hatchback', engineCapacity: '1200-2000' },
    { id: 20, name: 'Ford Focus', make: 'Ford', category: 'Hatchback', engineCapacity: '1400-2000' }
  ];

  const usageTypeOptions = [
    { 
      id: 1, 
      name: 'Private', 
      description: 'Personal and family use only', 
      multiplier: 1.0,
      riskLevel: 'Low'
    },
    { 
      id: 2, 
      name: 'Commercial', 
      description: 'Business and commercial activities', 
      multiplier: 1.8,
      riskLevel: 'High'
    },
    { 
      id: 3, 
      name: 'Taxi/Cab', 
      description: 'Licensed taxi operations', 
      multiplier: 2.2,
      riskLevel: 'Very High'
    },
    { 
      id: 4, 
      name: 'Uber/Bolt', 
      description: 'App-based ride-sharing services', 
      multiplier: 2.0,
      riskLevel: 'High'
    },
    { 
      id: 5, 
      name: 'Delivery', 
      description: 'Package and food delivery services', 
      multiplier: 1.9,
      riskLevel: 'High'
    },
    { 
      id: 6, 
      name: 'Government', 
      description: 'Government and official use', 
      multiplier: 1.1,
      riskLevel: 'Low'
    },
    { 
      id: 7, 
      name: 'School Transport', 
      description: 'School bus and student transport', 
      multiplier: 1.6,
      riskLevel: 'Medium'
    },
    { 
      id: 8, 
      name: 'Emergency Services', 
      description: 'Ambulance, fire, police vehicles', 
      multiplier: 1.4,
      riskLevel: 'Medium'
    }
  ];

  const handleInputChange = (field, value) => {
    updateFormData(field, value);
    if (errors[field]) {
      clearError(field);
    }
  };

  const selectMakeModel = (vehicle) => {
    updateFormData('makeModel', vehicle.name);
    updateFormData('vehicleCategory', vehicle.category);
    updateFormData('vehicleMake', vehicle.make);
    
    // Auto-suggest engine capacity based on vehicle
    if (!formData.vehicleEngineCapacity && vehicle.engineCapacity) {
      const suggestedCapacity = vehicle.engineCapacity.split('-')[0]; // Take lower range
      updateFormData('vehicleEngineCapacity', suggestedCapacity);
    }
    
    setShowMakeModelModal(false);
    if (errors.makeModel) {
      clearError('makeModel');
    }
  };

  const selectUsageType = (usage) => {
    updateFormData('usageType', usage.name);
    updateFormData('usageMultiplier', usage.multiplier);
    updateFormData('riskLevel', usage.riskLevel);
    setShowUsageTypeModal(false);
    if (errors.usageType) {
      clearError('usageType');
    }
  };

  const validateRegistrationNumber = (regNumber) => {
    // Kenya vehicle registration format: ABC 123D or KAB 123A
    const kenyanRegex = /^[A-Z]{3}\s?[0-9]{3}[A-Z]?$/i;
    return kenyanRegex.test(regNumber.replace(/\s/g, ''));
  };

  const formatRegistrationNumber = (text) => {
    // Remove spaces and convert to uppercase
    const cleaned = text.replace(/\s/g, '').toUpperCase();
    
    // Format as ABC 123D
    if (cleaned.length >= 3) {
      const letters = cleaned.substring(0, 3);
      const numbers = cleaned.substring(3, 6);
      const finalLetter = cleaned.substring(6, 7);
      
      let formatted = letters;
      if (numbers) formatted += ' ' + numbers;
      if (finalLetter) formatted += finalLetter;
      
      return formatted;
    }
    
    return cleaned;
  };

  const getCurrentYear = () => new Date().getFullYear();

  const renderModalSelector = (visible, onClose, options, onSelect, title, renderItem) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={options}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem || (({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => onSelect(item)}
              >
                <View style={styles.modalOptionContent}>
                  <Text style={styles.modalOptionText}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.modalOptionDescription}>{item.description}</Text>
                  )}
                  {item.category && (
                    <Text style={styles.modalOptionCategory}>Category: {item.category}</Text>
                  )}
                  {item.riskLevel && (
                    <Text style={[
                      styles.modalOptionRisk,
                      item.riskLevel === 'Low' && { color: Colors.success },
                      item.riskLevel === 'Medium' && { color: Colors.warning },
                      item.riskLevel === 'High' && { color: Colors.error },
                      item.riskLevel === 'Very High' && { color: Colors.error }
                    ]}>
                      Risk Level: {item.riskLevel}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Vehicle Information</Text>
      <Text style={styles.sectionDescription}>
        Please provide details about the vehicle you want to insure
      </Text>

      {/* Vehicle Registration Number */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Vehicle Registration Number *</Text>
        <TextInput
          style={[styles.input, errors.vehicleRegistrationNumber && styles.inputError]}
          value={formData.vehicleRegistrationNumber}
          onChangeText={(text) => {
            const formatted = formatRegistrationNumber(text);
            handleInputChange('vehicleRegistrationNumber', formatted);
          }}
          placeholder="e.g., KCB 123A"
          placeholderTextColor={Colors.textSecondary}
          autoCapitalize="characters"
          maxLength={8}
        />
        {errors.vehicleRegistrationNumber && (
          <Text style={styles.errorText}>{errors.vehicleRegistrationNumber}</Text>
        )}
        {formData.vehicleRegistrationNumber && !validateRegistrationNumber(formData.vehicleRegistrationNumber) && (
          <Text style={styles.warningText}>
            Please use Kenya vehicle registration format (e.g., KCB 123A)
          </Text>
        )}
      </View>

      {/* Make & Model Selector */}
      <TouchableOpacity 
        style={[styles.selectorButton, errors.makeModel && styles.selectorButtonError]}
        onPress={() => setShowMakeModelModal(true)}
      >
        <Text style={styles.selectorLabel}>Vehicle Make & Model *</Text>
        <Text style={[
          styles.selectorValue,
          !formData.makeModel && styles.selectorPlaceholder
        ]}>
          {formData.makeModel || 'Select vehicle make & model'}
        </Text>
        <Text style={styles.selectorIcon}>▼</Text>
      </TouchableOpacity>
      {errors.makeModel && <Text style={styles.errorText}>{errors.makeModel}</Text>}

      {/* Year of Manufacture */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Year of Manufacture *</Text>
        <TextInput
          style={[styles.input, errors.yearOfManufacture && styles.inputError]}
          value={formData.yearOfManufacture}
          onChangeText={(text) => handleInputChange('yearOfManufacture', text)}
          placeholder={`e.g., ${getCurrentYear() - 2}`}
          placeholderTextColor={Colors.textSecondary}
          keyboardType="numeric"
          maxLength={4}
        />
        {errors.yearOfManufacture && (
          <Text style={styles.errorText}>{errors.yearOfManufacture}</Text>
        )}
        {formData.yearOfManufacture && (
          <Text style={styles.helperText}>
            Vehicle Age: {getCurrentYear() - parseInt(formData.yearOfManufacture || 0)} years
          </Text>
        )}
      </View>

      {/* Engine Capacity */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Vehicle Engine Capacity (cc) *</Text>
        <TextInput
          style={[styles.input, errors.vehicleEngineCapacity && styles.inputError]}
          value={formData.vehicleEngineCapacity}
          onChangeText={(text) => handleInputChange('vehicleEngineCapacity', text)}
          placeholder="e.g., 1500"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="numeric"
        />
        {errors.vehicleEngineCapacity && (
          <Text style={styles.errorText}>{errors.vehicleEngineCapacity}</Text>
        )}
        {formData.vehicleEngineCapacity && (
          <Text style={styles.helperText}>
            Engine Size: {parseInt(formData.vehicleEngineCapacity) >= 2000 ? 'Large' : 
                         parseInt(formData.vehicleEngineCapacity) >= 1500 ? 'Medium' : 'Small'}
          </Text>
        )}
      </View>

      {/* Usage Type Selector */}
      <TouchableOpacity 
        style={[styles.selectorButton, errors.usageType && styles.selectorButtonError]}
        onPress={() => setShowUsageTypeModal(true)}
      >
        <Text style={styles.selectorLabel}>Vehicle Usage Type *</Text>
        <Text style={[
          styles.selectorValue,
          !formData.usageType && styles.selectorPlaceholder
        ]}>
          {formData.usageType || 'Select how you use this vehicle'}
        </Text>
        <Text style={styles.selectorIcon}>▼</Text>
      </TouchableOpacity>
      {errors.usageType && <Text style={styles.errorText}>{errors.usageType}</Text>}

      {/* Vehicle Summary */}
      {formData.makeModel && formData.yearOfManufacture && formData.usageType && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Vehicle Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Vehicle:</Text>
            <Text style={styles.summaryValue}>{formData.makeModel}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Year:</Text>
            <Text style={styles.summaryValue}>{formData.yearOfManufacture}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Engine:</Text>
            <Text style={styles.summaryValue}>{formData.vehicleEngineCapacity || 'Not specified'}cc</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Usage:</Text>
            <Text style={styles.summaryValue}>{formData.usageType}</Text>
          </View>
          {formData.riskLevel && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Risk Level:</Text>
              <Text style={[
                styles.summaryValue,
                formData.riskLevel === 'Low' && { color: Colors.success },
                formData.riskLevel === 'Medium' && { color: Colors.warning },
                formData.riskLevel === 'High' && { color: Colors.error },
                formData.riskLevel === 'Very High' && { color: Colors.error }
              ]}>
                {formData.riskLevel}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Make & Model Modal */}
      {renderModalSelector(
        showMakeModelModal,
        () => setShowMakeModelModal(false),
        vehicleMakeModels,
        selectMakeModel,
        'Select Vehicle Make & Model',
        ({ item }) => (
          <TouchableOpacity
            key={item.id}
            style={styles.modalOption}
            onPress={() => selectMakeModel(item)}
          >
            <View style={styles.modalOptionContent}>
              <Text style={styles.modalOptionText}>{item.name}</Text>
              <Text style={styles.modalOptionDescription}>
                {item.make} • {item.category} • {item.engineCapacity}cc
              </Text>
            </View>
          </TouchableOpacity>
        )
      )}

      {/* Usage Type Modal */}
      {renderModalSelector(
        showUsageTypeModal,
        () => setShowUsageTypeModal(false),
        usageTypeOptions,
        selectUsageType,
        'Select Vehicle Usage Type'
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.error,
  },
  selectorButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  selectorButtonError: {
    borderColor: Colors.error,
  },
  selectorLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  selectorValue: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  selectorPlaceholder: {
    color: Colors.textSecondary,
  },
  selectorIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  warningText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.warning,
    marginTop: Spacing.xs,
  },
  helperText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  summaryContainer: {
    backgroundColor: Colors.lightGray,
    padding: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    flex: 1,
  },
  summaryValue: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    padding: Spacing.sm,
  },
  modalCloseText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
  },
  modalOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  modalOptionDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  modalOptionCategory: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  modalOptionRisk: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    marginTop: Spacing.xs,
  },
});

export default VehicleDetailsForm;
