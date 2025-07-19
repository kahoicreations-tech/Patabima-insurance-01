/**
 * Travel Insurance Quotation Screen
 * 
 * Multi-step form for collecting travel insurance information
 * Based on the claims submission step pattern and XML form structure
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import travel data
import {
  TRAVEL_PURPOSES,
  TRAVEL_COVER_TYPES,
  NATIONALITIES,
  POPULAR_DESTINATIONS,
  TRAVEL_INSURERS,
  PAYMENT_METHODS,
  MEDICAL_COVER_OPTIONS,
  calculateTravelPremium,
  validateTravelDates,
  getRequiredDocuments
} from './data';

const { width } = Dimensions.get('window');

// Step definitions matching the XML form structure
const STEPS = [
  {
    id: 1,
    title: 'Personal Information',
    subtitle: 'Basic details about the traveler',
    icon: 'account',
    fields: ['firstName', 'lastName', 'dateOfBirth', 'nationality', 'idNumber', 'phoneNumber', 'email']
  },
  {
    id: 2,
    title: 'Travel Details',
    subtitle: 'Trip information and destination',
    icon: 'airplane',
    fields: ['travelPurpose', 'destinationCountry', 'departureDate', 'returnDate', 'numberOfTravelers']
  },
  {
    id: 3,
    title: 'Coverage Options',
    subtitle: 'Select your insurance coverage',
    icon: 'shield-check',
    fields: ['travelCoverType', 'addMedicalCover', 'medicalCoverType', 'preferredInsurer']
  },
  {
    id: 4,
    title: 'Premium Calculation',
    subtitle: 'Review costs and payment method',
    icon: 'calculator',
    fields: ['paymentMethod']
  },
  {
    id: 5,
    title: 'Documents Upload',
    subtitle: 'Required documents for processing',
    icon: 'file-document',
    fields: ['documents']
  },
  {
    id: 6,
    title: 'Review & Submit',
    subtitle: 'Confirm all details before submission',
    icon: 'check-circle',
    fields: ['confirmation']
  }
];

const TravelQuotationScreen = ({ navigation, route }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    idNumber: '',
    phoneNumber: '',
    email: '',
    
    // Travel Details
    travelPurpose: '',
    destinationCountry: '',
    departureDate: '',
    returnDate: '',
    numberOfTravelers: '1',
    
    // Coverage Options
    travelCoverType: '',
    addMedicalCover: false,
    medicalCoverType: '',
    preferredInsurer: '',
    
    // Payment
    paymentMethod: '',
    
    // Documents
    documents: [],
    
    // Premium
    calculatedPremium: 0,
    premiumBreakdown: null
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate premium when relevant fields change
      if (['departureDate', 'returnDate', 'travelCoverType', 'numberOfTravelers', 'preferredInsurer', 'addMedicalCover', 'medicalCoverType'].includes(field)) {
        const premiumResult = calculateTravelPremium(updated);
        updated.calculatedPremium = premiumResult.premium;
        updated.premiumBreakdown = premiumResult.breakdown;
      }
      
      return updated;
    });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  }, [validationErrors]);

  // Validate current step
  const validateCurrentStep = () => {
    const currentStepData = STEPS.find(step => step.id === currentStep);
    const errors = {};

    currentStepData.fields.forEach(field => {
      const value = formData[field];
      
      switch (field) {
        case 'firstName':
        case 'lastName':
          if (!value?.trim()) {
            errors[field] = 'This field is required';
          }
          break;
          
        case 'email':
          if (!value?.trim()) {
            errors[field] = 'Email is required';
          } else if (!/\S+@\S+\.\S+/.test(value)) {
            errors[field] = 'Please enter a valid email address';
          }
          break;
          
        case 'phoneNumber':
          if (!value?.trim()) {
            errors[field] = 'Phone number is required';
          } else if (!/^[\+]?[\d\s\-\(\)]{10,}$/.test(value)) {
            errors[field] = 'Please enter a valid phone number';
          }
          break;
          
        case 'idNumber':
          if (!value?.trim()) {
            errors[field] = 'ID number is required';
          }
          break;
          
        case 'nationality':
        case 'travelPurpose':
        case 'destinationCountry':
        case 'travelCoverType':
        case 'preferredInsurer':
        case 'paymentMethod':
          if (!value) {
            errors[field] = 'Please make a selection';
          }
          break;
          
        case 'departureDate':
        case 'returnDate':
          if (!value) {
            errors[field] = 'Date is required';
          } else if (field === 'returnDate' && formData.departureDate) {
            const dateValidation = validateTravelDates(formData.departureDate, formData.returnDate);
            if (!dateValidation.isValid && dateValidation.errors[field]) {
              errors[field] = dateValidation.errors[field];
            }
          }
          break;
          
        case 'numberOfTravelers':
          const travelers = parseInt(value);
          if (!travelers || travelers < 1 || travelers > 20) {
            errors[field] = 'Number of travelers must be between 1 and 20';
          }
          break;
          
        case 'medicalCoverType':
          if (formData.addMedicalCover && !value) {
            errors[field] = 'Please select medical cover type';
          }
          break;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < STEPS.length) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Quotation Submitted',
        'Your travel insurance quotation has been submitted successfully. You will receive a confirmation email shortly.',
        [
          {
            text: 'View Quotations',
            onPress: () => navigation.navigate('Quotations')
          },
          {
            text: 'Go Home',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit quotation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((step, index) => (
        <View key={step.id} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep >= step.id && styles.stepCircleActive,
            currentStep === step.id && styles.stepCircleCurrent
          ]}>
            <Icon 
              name={currentStep > step.id ? 'check' : step.icon} 
              size={16} 
              color={currentStep >= step.id ? '#fff' : '#999'} 
            />
          </View>
          {index < STEPS.length - 1 && (
            <View style={[
              styles.stepLine,
              currentStep > step.id && styles.stepLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  // Render form fields based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep formData={formData} updateFormData={updateFormData} validationErrors={validationErrors} />;
      case 2:
        return <TravelDetailsStep formData={formData} updateFormData={updateFormData} validationErrors={validationErrors} />;
      case 3:
        return <CoverageOptionsStep formData={formData} updateFormData={updateFormData} validationErrors={validationErrors} />;
      case 4:
        return <PremiumCalculationStep formData={formData} updateFormData={updateFormData} validationErrors={validationErrors} />;
      case 5:
        return <DocumentsUploadStep formData={formData} updateFormData={updateFormData} validationErrors={validationErrors} />;
      case 6:
        return <ReviewSubmitStep formData={formData} />;
      default:
        return null;
    }
  };

  const currentStepData = STEPS.find(step => step.id === currentStep);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Travel Insurance</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Title */}
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{currentStepData?.title}</Text>
        <Text style={styles.stepSubtitle}>{currentStepData?.subtitle}</Text>
      </View>

      {/* Form Content */}
      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
              <Text style={styles.secondaryButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < STEPS.length ? (
            <TouchableOpacity 
              style={[styles.primaryButton, currentStep === 1 && styles.fullWidthButton]} 
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.primaryButton, styles.submitButton, isSubmitting && styles.disabledButton]} 
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Quotation'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Individual step components will be created in separate files
// For now, creating placeholder components

const PersonalInfoStep = ({ formData, updateFormData, validationErrors }) => (
  <View style={styles.stepContent}>
    <Text style={styles.sectionTitle}>Personal Information</Text>
    {/* This will be implemented with proper form fields */}
    <Text style={styles.placeholder}>Personal info form fields will be implemented here</Text>
  </View>
);

const TravelDetailsStep = ({ formData, updateFormData, validationErrors }) => (
  <View style={styles.stepContent}>
    <Text style={styles.sectionTitle}>Travel Details</Text>
    {/* This will be implemented with proper form fields */}
    <Text style={styles.placeholder}>Travel details form fields will be implemented here</Text>
  </View>
);

const CoverageOptionsStep = ({ formData, updateFormData, validationErrors }) => (
  <View style={styles.stepContent}>
    <Text style={styles.sectionTitle}>Coverage Options</Text>
    {/* This will be implemented with proper form fields */}
    <Text style={styles.placeholder}>Coverage options form fields will be implemented here</Text>
  </View>
);

const PremiumCalculationStep = ({ formData, updateFormData, validationErrors }) => (
  <View style={styles.stepContent}>
    <Text style={styles.sectionTitle}>Premium Calculation</Text>
    {/* This will be implemented with premium display */}
    <Text style={styles.placeholder}>Premium calculation display will be implemented here</Text>
  </View>
);

const DocumentsUploadStep = ({ formData, updateFormData, validationErrors }) => (
  <View style={styles.stepContent}>
    <Text style={styles.sectionTitle}>Documents Upload</Text>
    {/* This will be implemented with document upload */}
    <Text style={styles.placeholder}>Document upload functionality will be implemented here</Text>
  </View>
);

const ReviewSubmitStep = ({ formData }) => (
  <View style={styles.stepContent}>
    <Text style={styles.sectionTitle}>Review & Submit</Text>
    {/* This will be implemented with review summary */}
    <Text style={styles.placeholder}>Review summary will be implemented here</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  headerRight: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#D5222B',
  },
  stepCircleCurrent: {
    backgroundColor: '#D5222B',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#D5222B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  stepLine: {
    width: (width - 120) / 5, // Responsive line width
    height: 2,
    backgroundColor: '#e9ecef',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#D5222B',
  },
  stepHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Poppins-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#D5222B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D5222B',
  },
  submitButton: {
    backgroundColor: '#28a745',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  secondaryButtonText: {
    color: '#D5222B',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default TravelQuotationScreen;
