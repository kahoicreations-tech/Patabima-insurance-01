/**
 * Personal Accident Insurance Quotation Screen
 * Based on AllInsuranceForms.xml - PersonalAccidentInsurance_Individual
 * 3-Step Process: Personal Info → Coverage Details → Documents & Summary
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Typography, Spacing } from '../../../constants';
import { 
  EnhancedTextInput, 
  EnhancedEmailInput, 
  EnhancedPhoneInput, 
  EnhancedIDInput, 
  EnhancedDatePicker 
} from '../../../components/EnhancedFormComponents';
import { EnhancedDocumentUpload } from '../../../components/EnhancedDocumentUpload';

const PersonalAccidentQuotationScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form Data based on XML structure
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: '',
    idNumber: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    emailAddress: '',
    occupation: '',
    
    // Step 2: Coverage Details
    coverAmount: '',
    riskLevel: '',
    duration: '',
    accidentalDeath: false,
    permanentDisability: false,
    medicalExpenses: false,
    temporaryDisability: false,
    
    // Step 3: Documents & Summary
    preferredInsurer: '',
    estimatedPremium: 0,
    uploadIdCopy: null,
    uploadMedicalReport: null,
    uploadOccupationLetter: null,
    declaration: false
  });

  // Dropdown options
  const genders = [
    { id: 'male', name: 'Male' },
    { id: 'female', name: 'Female' }
  ];

  const coverAmounts = [
    { id: '500000', name: 'KES 500,000', premium: 5000 },
    { id: '1000000', name: 'KES 1,000,000', premium: 8500 },
    { id: '2000000', name: 'KES 2,000,000', premium: 15000 },
    { id: '5000000', name: 'KES 5,000,000', premium: 35000 }
  ];

  const riskLevels = [
    { id: 'low', name: 'Low Risk (Office Work)', multiplier: 1.0 },
    { id: 'medium', name: 'Medium Risk (Field Work)', multiplier: 1.5 },
    { id: 'high', name: 'High Risk (Hazardous Work)', multiplier: 2.5 }
  ];

  const durations = [
    { id: '1year', name: '1 Year', multiplier: 1.0 },
    { id: '2years', name: '2 Years', multiplier: 1.8 },
    { id: '3years', name: '3 Years', multiplier: 2.5 }
  ];

  const insurers = [
    { id: 'jubilee', name: 'Jubilee Insurance' },
    { id: 'aar', name: 'AAR Insurance' },
    { id: 'madison', name: 'Madison Insurance' },
    { id: 'britam', name: 'Britam Insurance' }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePremium = () => {
    const coverAmount = coverAmounts.find(c => c.id === formData.coverAmount);
    const riskLevel = riskLevels.find(r => r.id === formData.riskLevel);
    const duration = durations.find(d => d.id === formData.duration);
    
    if (!coverAmount || !riskLevel || !duration) return 0;
    
    let basePremium = coverAmount.premium;
    
    // Apply risk level multiplier
    basePremium *= riskLevel.multiplier;
    
    // Apply duration multiplier
    basePremium *= duration.multiplier;
    
    // Add benefit costs
    let benefitsCost = 0;
    if (formData.accidentalDeath) benefitsCost += 2000;
    if (formData.permanentDisability) benefitsCost += 1500;
    if (formData.medicalExpenses) benefitsCost += 3000;
    if (formData.temporaryDisability) benefitsCost += 1000;
    
    return Math.round(basePremium + benefitsCost);
  };

  const validateStep = (step) => {
    const errors = [];
    
    switch (step) {
      case 1: // Personal Information
        if (!formData.fullName.trim()) errors.push('Full Name is required');
        if (!formData.idNumber.trim()) errors.push('National ID Number is required');
        if (!formData.phoneNumber.trim()) errors.push('Phone Number is required');
        if (!formData.dateOfBirth.trim()) errors.push('Date of Birth is required');
        if (!formData.occupation.trim()) errors.push('Occupation is required');
        break;
        
      case 2: // Coverage Details
        if (!formData.riskLevel) errors.push('Risk Level is required');
        if (!formData.coverAmount) errors.push('Cover Amount is required');
        if (!formData.duration) errors.push('Duration is required');
        break;
        
      case 3: // Documents & Summary
        if (!formData.preferredInsurer) errors.push('Preferred Insurer is required');
        if (!formData.declaration) errors.push('Declaration must be accepted');
        break;
    }
    
    return errors;
  };

  const nextStep = () => {
    const errors = validateStep(currentStep);
    
    if (errors.length > 0) {
      Alert.alert(
        'Validation Error',
        `Please fix the following errors:\n\n${errors.join('\n')}`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (currentStep < totalSteps) {
      if (currentStep === 2) {
        const premium = calculatePremium();
        updateFormData('estimatedPremium', premium);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitQuotation = () => {
    const errors = validateStep(3); // Final validation
    
    if (errors.length > 0) {
      Alert.alert(
        'Validation Error',
        `Please fix the following errors before submitting:\n\n${errors.join('\n')}`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (!formData.declaration) {
      Alert.alert('Error', 'Please accept the declaration to proceed.');
      return;
    }

    Alert.alert(
      'Quotation Submitted',
      `Your personal accident insurance quotation has been submitted successfully.\n\nEstimated Premium: KES ${formData.estimatedPremium.toLocaleString()}\n\nPataBima will review your application and provide a detailed quote within 24 hours.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.progressItem}>
          <View style={[
            styles.progressCircle,
            currentStep >= step && styles.progressCircleActive
          ]}>
            <Text style={[
              styles.progressNumber,
              currentStep >= step && styles.progressNumberActive
            ]}>
              {step}
            </Text>
          </View>
          {step < 3 && (
            <View style={[
              styles.progressLine,
              currentStep > step && styles.progressLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Please provide your personal details for personal accident insurance</Text>
      
      <EnhancedTextInput
        label="Full Name"
        value={formData.fullName}
        onChangeText={(text) => updateFormData('fullName', text)}
        placeholder="Enter your full name"
        required
      />

      <EnhancedIDInput
        label="ID Number"
        value={formData.idNumber}
        onChangeText={(text) => updateFormData('idNumber', text)}
        placeholder="Enter your ID number"
        required
      />

      <EnhancedDatePicker
        label="Date of Birth"
        value={formData.dateOfBirth}
        onDateChange={(date) => updateFormData('dateOfBirth', date)}
        placeholder="Select date of birth"
        required
      />

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Gender *</Text>
        <View style={styles.optionsGrid}>
          {genders.map((gender) => (
            <TouchableOpacity
              key={gender.id}
              style={[
                styles.gridOption,
                formData.gender === gender.id && styles.gridOptionActive
              ]}
              onPress={() => updateFormData('gender', gender.id)}
            >
              <Text style={[
                styles.gridOptionText,
                formData.gender === gender.id && styles.gridOptionTextActive
              ]}>
                {gender.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <EnhancedPhoneInput
        label="Phone Number"
        value={formData.phoneNumber}
        onChangeText={(text) => updateFormData('phoneNumber', text)}
        placeholder="Enter phone number"
        required
      />

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <EnhancedEmailInput
          value={formData.emailAddress}
          onChangeText={(text) => updateFormData('emailAddress', text)}
          placeholder="Enter email address (optional)"
        />
      </View>

      <EnhancedTextInput
        label="Occupation"
        value={formData.occupation}
        onChangeText={(text) => updateFormData('occupation', text)}
        placeholder="Enter your occupation"
        required
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Coverage Details</Text>
      <Text style={styles.stepSubtitle}>Select your coverage preferences and benefits</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Cover Amount *</Text>
        {coverAmounts.map((cover) => (
          <TouchableOpacity
            key={cover.id}
            style={[
              styles.coverageCard,
              formData.coverAmount === cover.id && styles.coverageCardActive
            ]}
            onPress={() => updateFormData('coverAmount', cover.id)}
          >
            <Text style={styles.coverageName}>{cover.name}</Text>
            <Text style={styles.coveragePrice}>Base: KES {cover.premium.toLocaleString()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Risk Level *</Text>
        {riskLevels.map((risk) => (
          <TouchableOpacity
            key={risk.id}
            style={[
              styles.coverageCard,
              formData.riskLevel === risk.id && styles.coverageCardActive
            ]}
            onPress={() => updateFormData('riskLevel', risk.id)}
          >
            <Text style={styles.coverageName}>{risk.name}</Text>
            <Text style={styles.coveragePrice}>Multiplier: {risk.multiplier}x</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Policy Duration *</Text>
        {durations.map((duration) => (
          <TouchableOpacity
            key={duration.id}
            style={[
              styles.coverageCard,
              formData.duration === duration.id && styles.coverageCardActive
            ]}
            onPress={() => updateFormData('duration', duration.id)}
          >
            <Text style={styles.coverageName}>{duration.name}</Text>
            <Text style={styles.coveragePrice}>Rate: {duration.multiplier}x</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Additional Benefits</Text>
        
        <TouchableOpacity
          style={[
            styles.benefitCard,
            formData.accidentalDeath && styles.benefitCardActive
          ]}
          onPress={() => updateFormData('accidentalDeath', !formData.accidentalDeath)}
        >
          <View style={styles.benefitInfo}>
            <Text style={styles.benefitName}>Accidental Death Benefit</Text>
            <Text style={styles.benefitPrice}>+KES 2,000</Text>
          </View>
          <View style={[
            styles.checkbox,
            formData.accidentalDeath && styles.checkboxActive
          ]}>
            {formData.accidentalDeath && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.benefitCard,
            formData.permanentDisability && styles.benefitCardActive
          ]}
          onPress={() => updateFormData('permanentDisability', !formData.permanentDisability)}
        >
          <View style={styles.benefitInfo}>
            <Text style={styles.benefitName}>Permanent Disability Cover</Text>
            <Text style={styles.benefitPrice}>+KES 1,500</Text>
          </View>
          <View style={[
            styles.checkbox,
            formData.permanentDisability && styles.checkboxActive
          ]}>
            {formData.permanentDisability && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.benefitCard,
            formData.medicalExpenses && styles.benefitCardActive
          ]}
          onPress={() => updateFormData('medicalExpenses', !formData.medicalExpenses)}
        >
          <View style={styles.benefitInfo}>
            <Text style={styles.benefitName}>Medical Expenses Cover</Text>
            <Text style={styles.benefitPrice}>+KES 3,000</Text>
          </View>
          <View style={[
            styles.checkbox,
            formData.medicalExpenses && styles.checkboxActive
          ]}>
            {formData.medicalExpenses && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.benefitCard,
            formData.temporaryDisability && styles.benefitCardActive
          ]}
          onPress={() => updateFormData('temporaryDisability', !formData.temporaryDisability)}
        >
          <View style={styles.benefitInfo}>
            <Text style={styles.benefitName}>Temporary Disability Income</Text>
            <Text style={styles.benefitPrice}>+KES 1,000</Text>
          </View>
          <View style={[
            styles.checkbox,
            formData.temporaryDisability && styles.checkboxActive
          ]}>
            {formData.temporaryDisability && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Documents & Summary</Text>
      <Text style={styles.stepSubtitle}>Review your details and upload documents</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Personal Accident Insurance Quote Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Insured Person</Text>
          <Text style={styles.summaryValue}>{formData.fullName}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Occupation</Text>
          <Text style={styles.summaryValue}>{formData.occupation}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Cover Amount</Text>
          <Text style={styles.summaryValue}>
            {coverAmounts.find(c => c.id === formData.coverAmount)?.name || 'Not selected'}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Risk Level</Text>
          <Text style={styles.summaryValue}>
            {riskLevels.find(r => r.id === formData.riskLevel)?.name || 'Not selected'}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Policy Duration</Text>
          <Text style={styles.summaryValue}>
            {durations.find(d => d.id === formData.duration)?.name || 'Not selected'}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Additional Benefits</Text>
          <Text style={styles.summaryValue}>
            {[
              formData.accidentalDeath && 'Accidental Death',
              formData.permanentDisability && 'Permanent Disability',
              formData.medicalExpenses && 'Medical Expenses',
              formData.temporaryDisability && 'Temporary Disability'
            ].filter(Boolean).join(', ') || 'None selected'}
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Estimated Premium</Text>
          <Text style={styles.totalValue}>
            KES {formData.estimatedPremium.toLocaleString()}
          </Text>
        </View>
      </View>

      <EnhancedDocumentUpload
        label="ID Copy"
        documentType="national ID"
        onDocumentSelect={(doc) => updateFormData('uploadIdCopy', doc)}
        uploadedDocument={formData.uploadIdCopy}
        required
      />

      <EnhancedDocumentUpload
        label="Medical Report"
        documentType="medical report"
        onDocumentSelect={(doc) => updateFormData('uploadMedicalReport', doc)}
        uploadedDocument={formData.uploadMedicalReport}
      />

      <EnhancedDocumentUpload
        label="Occupation Letter"
        documentType="occupation letter"
        onDocumentSelect={(doc) => updateFormData('uploadOccupationLetter', doc)}
        uploadedDocument={formData.uploadOccupationLetter}
      />

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Preferred Insurer *</Text>
        <View style={styles.optionsGrid}>
          {insurers.map((insurer) => (
            <TouchableOpacity
              key={insurer.id}
              style={[
                styles.gridOption,
                formData.preferredInsurer === insurer.id && styles.gridOptionActive
              ]}
              onPress={() => updateFormData('preferredInsurer', insurer.id)}
            >
              <Text style={[
                styles.gridOptionText,
                formData.preferredInsurer === insurer.id && styles.gridOptionTextActive
              ]}>
                {insurer.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Declaration *</Text>
        <TouchableOpacity
          style={[
            styles.declarationCard,
            formData.declaration && styles.declarationCardActive
          ]}
          onPress={() => updateFormData('declaration', !formData.declaration)}
        >
          <View style={[
            styles.checkbox,
            formData.declaration && styles.checkboxActive
          ]}>
            {formData.declaration && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.declarationText}>
            I declare that the information provided is true and accurate. I understand that this is a quotation request and PataBima will provide the final quote and terms.
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          Payment Method: M-Pesa only. Premium payment will be required after quote approval. 
          PataBima will contact you within 24 hours with your personalized quote.
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return renderStep1();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Accident Insurance</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <Text style={styles.backButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        {currentStep < totalSteps ? (
          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={submitQuotation}>
            <Text style={styles.submitButtonText}>Submit Quotation</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBackButton: {
    paddingVertical: Spacing.xs,
  },
  headerBackText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  headerRight: {
    width: 60,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleActive: {
    backgroundColor: Colors.primary,
  },
  progressNumber: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: '#6B7280',
  },
  progressNumberActive: {
    color: '#FFFFFF',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: Spacing.xs,
  },
  progressLineActive: {
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: Spacing.md,
  },
  stepTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputHelper: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.md,
    backgroundColor: '#FFFFFF',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  gridOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#F9FAFB',
    borderRadius: Spacing.xs,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gridOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  gridOptionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
  },
  gridOptionTextActive: {
    color: '#FFFFFF',
  },
  coverageCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: Spacing.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  coverageCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FEF2F2',
  },
  coverageName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  coveragePrice: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: Spacing.xs,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  benefitCardActive: {
    backgroundColor: '#FEF2F2',
    borderColor: Colors.primary,
  },
  benefitInfo: {
    flex: 1,
  },
  benefitName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  benefitPrice: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: Spacing.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
    textAlign: 'right',
    flex: 1,
    marginLeft: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: Spacing.xs,
    padding: Spacing.md,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  uploadButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  declarationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: Spacing.xs,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  declarationCardActive: {
    backgroundColor: '#FEF2F2',
    borderColor: Colors.primary,
  },
  declarationText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
    lineHeight: 20,
  },
  disclaimerContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: Spacing.xs,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  disclaimerText: {
    fontSize: Typography.fontSize.sm,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 18,
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  backButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.xs,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  backButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
  },
  nextButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.xs,
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  nextButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: '#FFFFFF',
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.success,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.xs,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: '#FFFFFF',
  },
});

export default PersonalAccidentQuotationScreen;
