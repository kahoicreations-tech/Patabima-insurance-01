import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Modal,
  ActivityIndicator,
  SafeAreaView 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Typography } from '../constants';

export default function MotorQuotationScreen({ navigation }) {
  const [formData, setFormData] = useState({
    // Vehicle Information
    registrationNumber: '',
    vehicleType: '',
    make: '',
    model: '',
    yearOfManufacture: '',
    engineCapacity: '',
    vehicleValue: '',
    
    // Owner Information
    ownerName: '',
    ownerIdNumber: '',
    ownerPhone: '',
    ownerEmail: '',
    
    // Insurance Details
    coverType: '',
    policyPeriod: '12', // months
    startDate: '',
    
    // Additional Information
    previousInsurer: '',
    claimsHistory: 'No',
    modifications: 'No'
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [vehicleVerified, setVehicleVerified] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [calculatedPremium, setCalculatedPremium] = useState(null);

  // Motor Vehicle Insurance Subcategories - Expanded based on Kenyan market
  const vehicleTypes = [
    // Private Vehicles
    { id: 'private_car', name: 'Private Car', category: 'Private', baseRate: 3.5, description: 'Personal use vehicles' },
    { id: 'private_suv', name: 'Private SUV', category: 'Private', baseRate: 4.0, description: 'Private SUVs and 4WD vehicles' },
    { id: 'private_pickup', name: 'Private Pickup', category: 'Private', baseRate: 3.8, description: 'Private pickup trucks' },
    
    // Commercial Vehicles
    { id: 'commercial_car', name: 'Commercial Car', category: 'Commercial', baseRate: 4.5, description: 'Commercial use cars' },
    { id: 'commercial_van', name: 'Commercial Van', category: 'Commercial', baseRate: 5.0, description: 'Delivery vans and commercial vehicles' },
    { id: 'commercial_truck', name: 'Commercial Truck', category: 'Commercial', baseRate: 5.5, description: 'Commercial trucks and lorries' },
    
    // Public Service Vehicles (PSV)
    { id: 'matatu', name: 'Matatu (14-25)', category: 'PSV', baseRate: 6.0, description: '14-25 seater matatus' },
    { id: 'matatu_large', name: 'Matatu (26+)', category: 'PSV', baseRate: 6.5, description: '26+ seater matatus' },
    { id: 'bus_small', name: 'Small Bus', category: 'PSV', baseRate: 7.0, description: 'Small buses' },
    
    // Motorcycles
    { id: 'motorcycle_private', name: 'Private Motorcycle', category: 'Motorcycle', baseRate: 2.8, description: 'Private motorcycles' },
    { id: 'motorcycle_commercial', name: 'Boda Boda', category: 'Motorcycle', baseRate: 4.5, description: 'Commercial motorcycles' },
    { id: 'tractor', name: 'Tractor', category: 'Agricultural', baseRate: 3.0, description: 'Agricultural tractors' },
  ];

  const coverTypes = [
    { 
      id: 'comprehensive', 
      name: 'Comprehensive Cover',
      description: 'Full coverage including theft, fire, accident damage',
      multiplier: 1.0
    },
    { 
      id: 'third_party', 
      name: 'Third Party Only',
      description: 'Legal minimum coverage for third party liability',
      multiplier: 0.3
    },
    { 
      id: 'third_party_fire_theft', 
      name: 'Third Party Fire & Theft',
      description: 'Third party plus fire and theft coverage',
      multiplier: 0.6
    }
  ];

  // Enhanced AKI API Vehicle Registration Lookup Simulation
  const simulateAKILookup = async (regNumber) => {
    setIsVerifying(true);
    
    // Validate registration number format
    const regPattern = /^K[A-Z]{2}\d{3}[A-Z]$/;
    if (!regPattern.test(regNumber.toUpperCase())) {
      setIsVerifying(false);
      Alert.alert('Invalid Format', 'Please enter a valid Kenyan registration number (e.g., KCA123A)');
      return;
    }
    
    // Simulate realistic API call delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Expanded mock vehicle database
    const mockVehicleDatabase = {
      'KCA123A': {
        make: 'Toyota',
        model: 'Corolla',
        yearOfManufacture: '2020',
        engineCapacity: '1500',
        vehicleValue: '2500000',
        ownerName: 'John Kamau Mwangi',
      },
      'KBZ456B': {
        make: 'Nissan',
        model: 'X-Trail',
        yearOfManufacture: '2019',
        engineCapacity: '2000',
        vehicleValue: '3200000',
        ownerName: 'Mary Wanjiku Njoroge',
      },
    };

    const vehicleData = mockVehicleDatabase[regNumber.toUpperCase()];
    
    if (vehicleData) {
      setFormData(prev => ({
        ...prev,
        ...vehicleData,
        registrationNumber: regNumber.toUpperCase()
      }));
      setVehicleVerified(true);
      setIsVerifying(false);
      Alert.alert('Vehicle Found', `Vehicle details retrieved for ${vehicleData.make} ${vehicleData.model}`);
    } else {
      setIsVerifying(false);
      Alert.alert('Not Found', 'Vehicle not found in AKI database. Please enter details manually.');
    }
  };

  // Update form data
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Enhanced Premium Calculation with more realistic factors
  const calculatePremium = () => {
    if (!formData.vehicleType || !formData.coverType || !formData.vehicleValue) {
      Alert.alert('Missing Information', 'Please fill in all required fields to calculate premium');
      return;
    }

    const vehicleType = vehicleTypes.find(type => type.id === formData.vehicleType);
    const coverType = coverTypes.find(cover => cover.id === formData.coverType);
    
    if (!vehicleType || !coverType) {
      Alert.alert('Error', 'Please select valid vehicle type and coverage');
      return;
    }

    const vehicleValue = parseFloat(formData.vehicleValue) || 0;
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - parseInt(formData.yearOfManufacture || currentYear);
    
    // Base premium calculation
    let premium = vehicleValue * (vehicleType.baseRate / 100) * coverType.multiplier;
    
    // Age factor
    if (vehicleAge > 10) premium *= 1.3;
    else if (vehicleAge > 5) premium *= 1.1;
    
    // Engine capacity factor
    const engineCC = parseInt(formData.engineCapacity || 0);
    if (engineCC > 3000) premium *= 1.2;
    else if (engineCC > 2000) premium *= 1.1;
    
    // Claims history factor
    if (formData.claimsHistory === 'Yes') premium *= 1.4;
    
    // Modifications factor
    if (formData.modifications === 'Yes') premium *= 1.15;
    
    // Minimum premiums by category
    const minimumPremiums = {
      'Private': 15000,
      'Commercial': 25000,
      'PSV': 35000,
      'Taxi': 30000,
      'Motorcycle': 8000,
      'Agricultural': 20000,
      'Emergency': 30000
    };
    
    const minPremium = minimumPremiums[vehicleType.category] || 15000;
    premium = Math.max(premium, minPremium);
    
    // Add statutory fees and levies
    const levies = {
      policyFee: 500,
      stampDuty: 40,
      trainingLevy: premium * 0.002, // 0.2% training levy
      pcf: premium * 0.0025 // 0.25% PCF levy
    };
    
    const totalLevies = Object.values(levies).reduce((sum, levy) => sum + levy, 0);
    const totalPremium = premium + totalLevies;
    
    setCalculatedPremium({
      basicPremium: Math.round(premium),
      levies: Math.round(totalLevies),
      totalPremium: Math.round(totalPremium),
      breakdown: {
        ...levies,
        policyFee: levies.policyFee,
        stampDuty: levies.stampDuty,
        trainingLevy: Math.round(levies.trainingLevy),
        pcf: Math.round(levies.pcf)
      },
      vehicleType: vehicleType.name,
      coverType: coverType.name,
      vehicleAge: vehicleAge
    });
    
    setShowQuote(true);
  };

  // Quick test function to populate form with sample data
  const fillSampleData = () => {
    setFormData({
      registrationNumber: 'KCA123A',
      vehicleType: 'private_car',
      make: 'Toyota',
      model: 'Corolla',
      yearOfManufacture: '2020',
      engineCapacity: '1500',
      vehicleValue: '2500000',
      ownerName: 'John Kamau Mwangi',
      ownerIdNumber: '12345678',
      ownerPhone: '0712345678',
      ownerEmail: 'john.kamau@email.com',
      coverType: 'comprehensive',
      policyPeriod: '12',
      startDate: '2024-01-01',
      previousInsurer: 'None',
      claimsHistory: 'No',
      modifications: 'No'
    });
    setVehicleVerified(true);
  };

  const isFormValid = () => {
    return formData.registrationNumber && 
           formData.vehicleType && 
           formData.make && 
           formData.model && 
           formData.vehicleValue && 
           formData.coverType && 
           formData.ownerName;
  };

  const renderFormContent = () => (
    <View style={styles.formContainer}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.formTitle}>Vehicle Insurance</Text>
        <Text style={styles.formSubtitle}>Get comprehensive motor insurance coverage</Text>
      </View>

      {/* Vehicle Registration with AKI Lookup */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🚗 Vehicle Registration</Text>
        <View style={styles.regInputContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={formData.registrationNumber}
            onChangeText={(value) => updateFormData('registrationNumber', value)}
            placeholder="Enter registration number (e.g. KCA123A)"
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.akiButton, isVerifying && styles.akiButtonDisabled]}
            onPress={() => simulateAKILookup(formData.registrationNumber)}
            disabled={isVerifying || !formData.registrationNumber}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color={Colors.background} />
            ) : (
              <Text style={styles.akiButtonText}>AKI Verify</Text>
            )}
          </TouchableOpacity>
        </View>
        {vehicleVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified with AKI database</Text>
          </View>
        )}
      </View>

      {/* Vehicle Type Selection */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🚙 Vehicle Type</Text>
        <Text style={styles.sectionSubtitle}>Select your vehicle category</Text>
        <View style={styles.vehicleTypeGrid}>
          {vehicleTypes.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.vehicleTypeCard,
                formData.vehicleType === type.id && styles.selectedVehicleType
              ]}
              onPress={() => updateFormData('vehicleType', type.id)}
            >
              <Text style={[
                styles.vehicleTypeName,
                formData.vehicleType === type.id && styles.selectedVehicleTypeName
              ]}>
                {type.name}
              </Text>
              <Text style={styles.vehicleTypeRate}>{type.baseRate}%</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Vehicle Details */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📋 Vehicle Details</Text>
        
        <View style={styles.inputRow}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Make</Text>
            <TextInput
              style={styles.input}
              value={formData.make}
              onChangeText={(value) => updateFormData('make', value)}
              placeholder="e.g. Toyota"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Model</Text>
            <TextInput
              style={styles.input}
              value={formData.model}
              onChangeText={(value) => updateFormData('model', value)}
              placeholder="e.g. Corolla"
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Year</Text>
            <TextInput
              style={styles.input}
              value={formData.yearOfManufacture}
              onChangeText={(value) => updateFormData('yearOfManufacture', value)}
              placeholder="2020"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Engine (CC)</Text>
            <TextInput
              style={styles.input}
              value={formData.engineCapacity}
              onChangeText={(value) => updateFormData('engineCapacity', value)}
              placeholder="1500"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Vehicle Value (KES)</Text>
          <TextInput
            style={styles.input}
            value={formData.vehicleValue}
            onChangeText={(value) => updateFormData('vehicleValue', value)}
            placeholder="2,500,000"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Coverage Type */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🛡️ Coverage Type</Text>
        <Text style={styles.sectionSubtitle}>Choose your insurance coverage</Text>
        
        {coverTypes.map(cover => (
          <TouchableOpacity
            key={cover.id}
            style={[
              styles.coverageOption,
              formData.coverType === cover.id && styles.selectedCoverage
            ]}
            onPress={() => updateFormData('coverType', cover.id)}
          >
            <View style={styles.coverageHeader}>
              <View style={styles.coverageContent}>
                <Text style={[
                  styles.coverageName,
                  formData.coverType === cover.id && styles.selectedCoverageName
                ]}>
                  {cover.name}
                </Text>
                <Text style={styles.coverageDescription}>{cover.description}</Text>
              </View>
              <View style={[
                styles.radioButton,
                formData.coverType === cover.id && styles.radioButtonSelected
              ]}>
                {formData.coverType === cover.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Owner Information */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>👤 Owner Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={formData.ownerName}
            onChangeText={(value) => updateFormData('ownerName', value)}
            placeholder="Enter full name"
          />
        </View>

        <View style={styles.inputRow}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>ID Number</Text>
            <TextInput
              style={styles.input}
              value={formData.ownerIdNumber}
              onChangeText={(value) => updateFormData('ownerIdNumber', value)}
              placeholder="12345678"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.ownerPhone}
              onChangeText={(value) => updateFormData('ownerPhone', value)}
              placeholder="0712345678"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={formData.ownerEmail}
            onChangeText={(value) => updateFormData('ownerEmail', value)}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Additional Information */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📝 Additional Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Previous Claims History</Text>
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                formData.claimsHistory === 'No' && styles.toggleOptionSelected
              ]}
              onPress={() => updateFormData('claimsHistory', 'No')}
            >
              <Text style={[
                styles.toggleText,
                formData.claimsHistory === 'No' && styles.toggleTextSelected
              ]}>
                No Claims
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                formData.claimsHistory === 'Yes' && styles.toggleOptionSelected
              ]}
              onPress={() => updateFormData('claimsHistory', 'Yes')}
            >
              <Text style={[
                styles.toggleText,
                formData.claimsHistory === 'Yes' && styles.toggleTextSelected
              ]}>
                Has Claims
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Vehicle Modifications</Text>
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                formData.modifications === 'No' && styles.toggleOptionSelected
              ]}
              onPress={() => updateFormData('modifications', 'No')}
            >
              <Text style={[
                styles.toggleText,
                formData.modifications === 'No' && styles.toggleTextSelected
              ]}>
                Standard
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                formData.modifications === 'Yes' && styles.toggleOptionSelected
              ]}
              onPress={() => updateFormData('modifications', 'Yes')}
            >
              <Text style={[
                styles.toggleText,
                formData.modifications === 'Yes' && styles.toggleTextSelected
              ]}>
                Modified
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Calculate Premium Button */}
      <TouchableOpacity
        style={[
          styles.calculatePremiumButton,
          !isFormValid() && styles.disabledButton
        ]}
        onPress={calculatePremium}
        disabled={!isFormValid()}
      >
        <Text style={styles.calculateButtonText}>
          Calculate Premium
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuoteModal = () => (
    <Modal
      visible={showQuote}
      animationType="slide"
      presentationStyle="overFullScreen"
    >
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <View style={styles.quoteModal}>
            <Text style={styles.quoteTitle}>📋 Insurance Quote</Text>

            {calculatedPremium && (
              <>
                {/* Vehicle Summary */}
                <View style={styles.quoteSection}>
                  <Text style={styles.quoteSectionTitle}>Vehicle Details</Text>
                  <Text style={styles.quoteText}>Registration: {formData.registrationNumber}</Text>
                  <Text style={styles.quoteText}>Vehicle: {formData.make} {formData.model} ({formData.yearOfManufacture})</Text>
                  <Text style={styles.quoteText}>Type: {calculatedPremium.vehicleType}</Text>
                  <Text style={styles.quoteText}>Coverage: {calculatedPremium.coverType}</Text>
                  <Text style={styles.quoteText}>Value: KES {parseInt(formData.vehicleValue).toLocaleString()}</Text>
                </View>

                {/* Premium Breakdown */}
                <View style={styles.premiumBreakdown}>
                  <Text style={styles.subSectionTitle}>Premium Breakdown</Text>
                  
                  <View style={styles.premiumRow}>
                    <Text style={styles.premiumLabel}>Basic Premium:</Text>
                    <Text style={styles.premiumValue}>KES {calculatedPremium.basicPremium.toLocaleString()}</Text>
                  </View>
                  
                  <Text style={styles.subSectionTitle}>Statutory Fees & Levies</Text>
                  <View style={styles.premiumRow}>
                    <Text style={styles.premiumLabel}>• Policy Fee:</Text>
                    <Text style={styles.premiumValue}>KES {calculatedPremium.breakdown.policyFee.toLocaleString()}</Text>
                  </View>
                  <View style={styles.premiumRow}>
                    <Text style={styles.premiumLabel}>• Stamp Duty:</Text>
                    <Text style={styles.premiumValue}>KES {calculatedPremium.breakdown.stampDuty.toLocaleString()}</Text>
                  </View>
                  <View style={styles.premiumRow}>
                    <Text style={styles.premiumLabel}>• Training Levy (0.2%):</Text>
                    <Text style={styles.premiumValue}>KES {calculatedPremium.breakdown.trainingLevy.toLocaleString()}</Text>
                  </View>
                  <View style={styles.premiumRow}>
                    <Text style={styles.premiumLabel}>• PCF Levy (0.25%):</Text>
                    <Text style={styles.premiumValue}>KES {calculatedPremium.breakdown.pcf.toLocaleString()}</Text>
                  </View>
                  
                  <View style={styles.divider} />
                  
                  <View style={[styles.premiumRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total Premium:</Text>
                    <Text style={styles.totalValue}>KES {calculatedPremium.totalPremium.toLocaleString()}</Text>
                  </View>
                </View>
              </>
            )}

            {/* Quote Actions */}
            <View style={styles.quoteActions}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowQuote(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  Alert.alert('Success', 'Quote saved successfully! You can view it in the Quotations section.', [
                    { 
                      text: 'OK', 
                      onPress: () => {
                        setShowQuote(false);
                        navigation.goBack();
                      }
                    }
                  ]);
                }}
              >
                <Text style={styles.saveButtonText}>Save Quote</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Motor Vehicle</Text>
          <Text style={styles.headerSubtitle}>Insurance Quote</Text>
        </View>
        <TouchableOpacity onPress={fillSampleData} style={styles.testButton}>
          <Text style={styles.testButtonText}>Test</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderFormContent()}
      </ScrollView>

      {renderQuoteModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  testButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  testButtonText: {
    color: Colors.background,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl * 2,
  },
  formContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  headerSection: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  formTitle: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  sectionCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  regInputContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-end',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    backgroundColor: '#FAFBFC',
  },
  akiButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  akiButtonDisabled: {
    backgroundColor: Colors.backgroundGray,
  },
  akiButtonText: {
    color: Colors.background,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
  },
  verifiedBadge: {
    backgroundColor: '#D4F6D4',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    color: '#2D7D32',
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  vehicleTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  vehicleTypeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FAFBFC',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  selectedVehicleType: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  vehicleTypeName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  selectedVehicleTypeName: {
    color: Colors.primary,
  },
  vehicleTypeRate: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  halfInput: {
    flex: 1,
  },
  coverageOption: {
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: '#FAFBFC',
  },
  selectedCoverage: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  coverageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  coverageContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  coverageName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  selectedCoverageName: {
    color: Colors.primary,
  },
  coverageDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.background,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F3F4',
    borderRadius: 12,
    padding: 4,
    marginTop: Spacing.sm,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleOptionSelected: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
  },
  toggleTextSelected: {
    color: Colors.background,
  },
  calculatePremiumButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#E9ECEF',
    shadowOpacity: 0,
    elevation: 0,
  },
  calculateButtonText: {
    color: Colors.background,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  quoteModal: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: Spacing.xl,
    margin: Spacing.lg,
    maxHeight: '90%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  quoteTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  quoteSection: {
    marginBottom: Spacing.lg,
  },
  quoteSectionTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  quoteText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  premiumBreakdown: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  premiumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  premiumLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  premiumValue: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  subSectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginVertical: Spacing.md,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  totalLabel: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  quoteActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  closeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  closeButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
  },
});
