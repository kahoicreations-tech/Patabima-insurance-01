/**
 * Medical Insurance Quotation Screen
 * 
 * Multi-step form for collecting medical insurance information
 * Based on the claims submission step pattern and XML form structure
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Dimensions,
  Modal,
  FlatList
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../../constants';
import { SafeScreen, EnhancedCard } from '../../../components';

const { width } = Dimensions.get('window');

export default function MedicalQuotationScreen({ navigation, route }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal Information (Based on XML fields)
    fullName: '',
    idNumber: '', // ID Number / Passport No.
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    phoneNumber: '',
    email: '',
    
    // Step 2: Medical Details
    preferredCoverLimit: '',
    preExistingConditions: [], // Checkboxes array
    nhifNumber: '',
    
    // Step 3: Insurance Selection
    preferredInsurer: '',
    premiumEstimate: 0,
    
    // Step 4: Document Upload
    documents: [],
    
    // Step 5: Declaration & Review
    declaration: false,
    contactPreference: 'phone',
    additionalComments: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCoverLimitModal, setShowCoverLimitModal] = useState(false);
  const [showInsurerModal, setShowInsurerModal] = useState(false);
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);

  const totalSteps = 5;

  // Sample data - in real app, this would come from API
  const coverLimitOptions = [
    { id: 1, label: 'KES 500,000', value: '500000' },
    { id: 2, label: 'KES 1,000,000', value: '1000000' },
    { id: 3, label: 'KES 2,000,000', value: '2000000' },
    { id: 4, label: 'KES 3,000,000', value: '3000000' },
    { id: 5, label: 'KES 5,000,000', value: '5000000' }
  ];

  const insurerOptions = [
    { id: 1, name: 'UAP Insurance', code: 'UAP', rating: '4.5' },
    { id: 2, name: 'CIC Insurance', code: 'CIC', rating: '4.3' },
    { id: 3, name: 'Jubilee Insurance', code: 'JUB', rating: '4.4' },
    { id: 4, name: 'APA Insurance', code: 'APA', rating: '4.2' },
    { id: 5, name: 'ICEA LION', code: 'ICEA', rating: '4.1' }
  ];

  const preExistingConditionsOptions = [
    'Diabetes',
    'Hypertension',
    'Heart Disease',
    'Asthma',
    'Cancer',
    'Kidney Disease',
    'Mental Health Conditions',
    'None'
  ];

  const documentTypes = [
    'ID Copy',
    'NHIF Card',
    'Medical Reports',
    'Passport Photo',
    'Birth Certificate',
    'Other Documents'
  ];

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.fullName?.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.idNumber?.trim()) newErrors.idNumber = 'ID Number / Passport No. is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.phoneNumber?.trim()) newErrors.phoneNumber = 'Phone number is required';
        if (formData.email?.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        break;
      
      case 2:
        if (!formData.preferredCoverLimit) newErrors.preferredCoverLimit = 'Preferred cover limit is required';
        break;
      
      case 3:
        if (!formData.preferredInsurer) newErrors.preferredInsurer = 'Preferred insurer is required';
        break;
      
      case 4:
        if (formData.documents.length === 0) newErrors.documents = 'At least one document is required';
        break;
      
      case 5:
        if (!formData.declaration) newErrors.declaration = 'Declaration must be accepted';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate quotation number
      const quotationNumber = `QUO-MED-${Date.now().toString().slice(-6)}`;
      
      Alert.alert(
        'Quotation Submitted Successfully',
        `Your medical insurance quotation has been submitted with reference number: ${quotationNumber}\n\nYou will receive a confirmation email shortly.`,
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

  const updateFormData = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({
        ...prev,
        [key]: null
      }));
    }
  };

  const selectCoverLimit = (option) => {
    updateFormData('preferredCoverLimit', option.value);
    setShowCoverLimitModal(false);
  };

  const selectInsurer = (insurer) => {
    updateFormData('preferredInsurer', insurer.name);
    setShowInsurerModal(false);
  };

  const addDocument = (docType) => {
    const newDoc = {
      id: Date.now(),
      type: docType,
      name: `${docType}_${Date.now()}`,
      uploaded: true,
      size: '2.5 MB'
    };
    
    updateFormData('documents', [...formData.documents, newDoc]);
  };

  const removeDocument = (docId) => {
    updateFormData('documents', formData.documents.filter(doc => doc.id !== docId));
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>Step {currentStep} of {totalSteps}</Text>
    </View>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            step <= currentStep && styles.stepCircleActive,
            step < currentStep && styles.stepCircleCompleted
          ]}>
            <Text style={[
              styles.stepNumber,
              step <= currentStep && styles.stepNumberActive
            ]}>
              {step < currentStep ? '✓' : step}
            </Text>
          </View>
          <Text style={[
            styles.stepLabel,
            step <= currentStep && styles.stepLabelActive
          ]}>
            {step === 1 && 'Personal'}
            {step === 2 && 'Medical'}
            {step === 3 && 'Insurer'}
            {step === 4 && 'Documents'}
            {step === 5 && 'Review'}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepDescription}>Please provide your basic details</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput
          style={[styles.input, errors.fullName && styles.inputError]}
          value={formData.fullName}
          onChangeText={(text) => updateFormData('fullName', text)}
          placeholder="Enter your full name"
          placeholderTextColor={Colors.textSecondary}
        />
        {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>ID Number / Passport No. *</Text>
        <TextInput
          style={[styles.input, errors.idNumber && styles.inputError]}
          value={formData.idNumber}
          onChangeText={(text) => updateFormData('idNumber', text)}
          placeholder="Enter ID or Passport number"
          placeholderTextColor={Colors.textSecondary}
        />
        {errors.idNumber && <Text style={styles.errorText}>{errors.idNumber}</Text>}
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Date of Birth *</Text>
        <TextInput
          style={[styles.input, errors.dateOfBirth && styles.inputError]}
          value={formData.dateOfBirth}
          onChangeText={(text) => updateFormData('dateOfBirth', text)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.textSecondary}
        />
        {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
        {formData.dateOfBirth && (
          <Text style={styles.infoText}>Age: {calculateAge(formData.dateOfBirth)} years</Text>
        )}
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Gender *</Text>
        <View style={styles.contactOptions}>
          <TouchableOpacity
            style={[
              styles.contactOption,
              formData.gender === 'male' && styles.contactOptionActive
            ]}
            onPress={() => updateFormData('gender', 'male')}
          >
            <Text style={[
              styles.contactOptionText,
              formData.gender === 'male' && styles.contactOptionTextActive
            ]}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.contactOption,
              formData.gender === 'female' && styles.contactOptionActive
            ]}
            onPress={() => updateFormData('gender', 'female')}
          >
            <Text style={[
              styles.contactOptionText,
              formData.gender === 'female' && styles.contactOptionTextActive
            ]}>Female</Text>
          </TouchableOpacity>
        </View>
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone Number *</Text>
        <TextInput
          style={[styles.input, errors.phoneNumber && styles.inputError]}
          value={formData.phoneNumber}
          onChangeText={(text) => updateFormData('phoneNumber', text)}
          placeholder="+254 700 000 000"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="phone-pad"
        />
        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={formData.email}
          onChangeText={(text) => updateFormData('email', text)}
          placeholder="your.email@example.com"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Medical Details</Text>
      <Text style={styles.stepDescription}>Health information and cover preferences</Text>
      
      <TouchableOpacity 
        style={styles.policySelector}
        onPress={() => setShowCoverLimitModal(true)}
      >
        <Text style={styles.policySelectorLabel}>Preferred Cover Limit</Text>
        <Text style={styles.policySelectorValue}>
          {formData.preferredCoverLimit ? `KES ${parseInt(formData.preferredCoverLimit).toLocaleString()}` : 'Select cover limit'}
        </Text>
        <Text style={styles.policySelectorIcon}>▼</Text>
      </TouchableOpacity>
      {errors.preferredCoverLimit && <Text style={styles.errorText}>{errors.preferredCoverLimit}</Text>}
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Pre-existing Conditions (Optional)</Text>
        <Text style={styles.stepDescription}>Select any conditions that apply to you</Text>
        <View style={styles.documentTypeGrid}>
          {preExistingConditionsOptions.map((condition) => (
            <TouchableOpacity
              key={condition}
              style={[
                styles.documentTypeButton,
                (formData.preExistingConditions || []).includes(condition) && styles.documentTypeButtonActive
              ]}
              onPress={() => {
                const currentConditions = formData.preExistingConditions || [];
                const isSelected = currentConditions.includes(condition);
                let newConditions;
                
                if (condition === 'None') {
                  newConditions = isSelected ? [] : ['None'];
                } else {
                  if (isSelected) {
                    newConditions = currentConditions.filter(c => c !== condition && c !== 'None');
                  } else {
                    newConditions = [...currentConditions.filter(c => c !== 'None'), condition];
                  }
                }
                
                updateFormData('preExistingConditions', newConditions);
              }}
            >
              <Text style={[
                styles.documentTypeText,
                (formData.preExistingConditions || []).includes(condition) && styles.documentTypeTextActive
              ]}>{condition}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>NHIF Number (Optional)</Text>
        <TextInput
          style={styles.input}
          value={formData.nhifNumber}
          onChangeText={(text) => updateFormData('nhifNumber', text)}
          placeholder="Enter your NHIF number"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Insurance Selection</Text>
      <Text style={styles.stepDescription}>Choose your preferred insurer</Text>
      
      <TouchableOpacity 
        style={styles.claimTypeSelector}
        onPress={() => setShowInsurerModal(true)}
      >
        <Text style={styles.claimTypeSelectorLabel}>Preferred Insurer</Text>
        <Text style={styles.claimTypeSelectorValue}>
          {formData.preferredInsurer || 'Select insurer'}
        </Text>
        <Text style={styles.claimTypeSelectorIcon}>▼</Text>
      </TouchableOpacity>
      {errors.preferredInsurer && <Text style={styles.errorText}>{errors.preferredInsurer}</Text>}
      
      {formData.preferredInsurer && (
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Premium Estimate</Text>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Cover Limit:</Text>
            <Text style={styles.reviewValue}>KES {parseInt(formData.preferredCoverLimit || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Estimated Premium:</Text>
            <Text style={styles.reviewValue}>KES 45,000 - 65,000 / year</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Supporting Documents</Text>
      <Text style={styles.stepDescription}>Upload documents to support your application</Text>
      
      <View style={styles.documentsContainer}>
        <Text style={styles.documentsLabel}>Add Documents</Text>
        
        <View style={styles.documentTypeGrid}>
          {documentTypes.map((docType) => (
            <TouchableOpacity
              key={docType}
              style={styles.documentTypeButton}
              onPress={() => addDocument(docType)}
            >
              <Text style={styles.documentTypeText}>{docType}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {formData.documents.length > 0 && (
          <View style={styles.uploadedDocuments}>
            <Text style={styles.uploadedDocumentsTitle}>Uploaded Documents</Text>
            {formData.documents.map((doc) => (
              <View key={doc.id} style={styles.documentItem}>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>{doc.name}</Text>
                  <Text style={styles.documentSize}>{doc.size}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeDocumentButton}
                  onPress={() => removeDocument(doc.id)}
                >
                  <Text style={styles.removeDocumentText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        
        {errors.documents && <Text style={styles.errorText}>{errors.documents}</Text>}
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review & Declaration</Text>
      <Text style={styles.stepDescription}>Please review your information and declare</Text>
      
      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Personal Information</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Full Name:</Text>
          <Text style={styles.reviewValue}>{formData.fullName}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>ID Number:</Text>
          <Text style={styles.reviewValue}>{formData.idNumber}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Date of Birth:</Text>
          <Text style={styles.reviewValue}>{formData.dateOfBirth}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Gender:</Text>
          <Text style={styles.reviewValue}>{formData.gender}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Phone:</Text>
          <Text style={styles.reviewValue}>{formData.phoneNumber}</Text>
        </View>
        {formData.email && (
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Email:</Text>
            <Text style={styles.reviewValue}>{formData.email}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Medical Information</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Cover Limit:</Text>
          <Text style={styles.reviewValue}>KES {parseInt(formData.preferredCoverLimit || 0).toLocaleString()}</Text>
        </View>
        {formData.preExistingConditions?.length > 0 && (
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Pre-existing Conditions:</Text>
            <Text style={styles.reviewValue}>{formData.preExistingConditions.join(', ')}</Text>
          </View>
        )}
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Preferred Insurer:</Text>
          <Text style={styles.reviewValue}>{formData.preferredInsurer}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Documents:</Text>
          <Text style={styles.reviewValue}>{formData.documents.length} uploaded</Text>
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Preferred Contact Method</Text>
        <View style={styles.contactOptions}>
          <TouchableOpacity
            style={[
              styles.contactOption,
              formData.contactPreference === 'phone' && styles.contactOptionActive
            ]}
            onPress={() => updateFormData('contactPreference', 'phone')}
          >
            <Text style={[
              styles.contactOptionText,
              formData.contactPreference === 'phone' && styles.contactOptionTextActive
            ]}>Phone</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.contactOption,
              formData.contactPreference === 'email' && styles.contactOptionActive
            ]}
            onPress={() => updateFormData('contactPreference', 'email')}
          >
            <Text style={[
              styles.contactOptionText,
              formData.contactPreference === 'email' && styles.contactOptionTextActive
            ]}>Email</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Additional Comments (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.additionalComments}
          onChangeText={(text) => updateFormData('additionalComments', text)}
          placeholder="Any additional information or special requests..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>
      
      <TouchableOpacity
        style={styles.declarationContainer}
        onPress={() => updateFormData('declaration', !formData.declaration)}
      >
        <View style={[styles.checkbox, formData.declaration && styles.checkboxChecked]}>
          {formData.declaration && <Text style={styles.checkboxTick}>✓</Text>}
        </View>
        <Text style={styles.declarationText}>
          I declare that the information provided is true and accurate to the best of my knowledge
        </Text>
      </TouchableOpacity>
      {errors.declaration && <Text style={styles.errorText}>{errors.declaration}</Text>}
    </View>
  );

  const renderModalSelector = (visible, onClose, options, onSelect, title) => (
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
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => onSelect(item)}
              >
                <Text style={styles.modalOptionText}>
                  {item.label || item.name}
                </Text>
                {item.rating && (
                  <Text style={styles.modalOptionRating}>★ {item.rating}</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeScreen>
      <StatusBar style="dark" />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medical Insurance</Text>
          <View style={styles.headerSpacer} />
        </View>

        {renderProgressBar()}
        {renderStepIndicator()}

        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <EnhancedCard style={styles.formCard}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </EnhancedCard>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            {currentStep > 1 && (
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handlePrevious}
              >
                <Text style={styles.secondaryButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.primaryButton,
                currentStep === 1 && styles.primaryButtonFullWidth,
                isSubmitting && styles.primaryButtonDisabled
              ]}
              onPress={handleNext}
              disabled={isSubmitting}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Submitting...' : currentStep === totalSteps ? 'Submit Quotation' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {renderModalSelector(
        showCoverLimitModal,
        () => setShowCoverLimitModal(false),
        coverLimitOptions,
        selectCoverLimit,
        'Select Cover Limit'
      )}

      {renderModalSelector(
        showInsurerModal,
        () => setShowInsurerModal(false),
        insurerOptions,
        selectInsurer,
        'Select Insurer'
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.md,
  },
  backButtonText: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.lightGray,
    borderRadius: 3,
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    borderWidth: 2,
    borderColor: Colors.lightGray,
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepNumber: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  stepNumberActive: {
    color: Colors.white,
  },
  stepLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.medium,
  },
  scrollView: {
    flex: 1,
  },
  formCard: {
    margin: Spacing.lg,
  },
  stepContent: {
    padding: Spacing.lg,
  },
  stepTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  stepDescription: {
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
    color: Colors.text,
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
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.error,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  policySelector: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    marginBottom: Spacing.md,
  },
  policySelectorLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  policySelectorValue: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text,
  },
  policySelectorIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
  },
  claimTypeSelector: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    marginBottom: Spacing.md,
  },
  claimTypeSelectorLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  claimTypeSelectorValue: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text,
  },
  claimTypeSelectorIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
  },
  documentTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  documentTypeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    minWidth: '45%',
    alignItems: 'center',
  },
  documentTypeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  documentTypeText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
    textAlign: 'center',
  },
  documentTypeTextActive: {
    color: Colors.white,
  },
  documentsContainer: {
    marginBottom: Spacing.lg,
  },
  documentsLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  uploadedDocuments: {
    marginTop: Spacing.lg,
  },
  uploadedDocumentsTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
  documentSize: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  removeDocumentButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  removeDocumentText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.error,
  },
  reviewSection: {
    marginBottom: Spacing.lg,
  },
  reviewSectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  reviewLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    flex: 1,
  },
  reviewValue: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
  },
  contactOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  contactOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  contactOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  contactOptionText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
  contactOptionTextActive: {
    color: Colors.white,
  },
  declarationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 4,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxTick: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  declarationText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text,
    lineHeight: 22,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonFullWidth: {
    flex: 1,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.white,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
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
    color: Colors.text,
  },
  modalCloseButton: {
    padding: Spacing.sm,
  },
  modalCloseText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalOptionText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text,
    flex: 1,
  },
  modalOptionRating: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.warning,
  },
});
