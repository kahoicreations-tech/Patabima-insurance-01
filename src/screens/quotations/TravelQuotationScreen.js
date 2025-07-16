import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../constants';
import { PricingService } from '../../services';

export default function TravelQuotationScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Form Data
  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: '',
    dateOfBirth: '',
    
    // Step 2: Travel Details
    destination: '',
    travelType: '',
    departureDate: '',
    returnDate: '',
    tripDuration: 0,
    tripPurpose: '',
    
    // Step 3: Coverage Selection
    coverageType: '',
    medicalCoverage: '',
    baggageCoverage: '',
    tripCancellationCoverage: '',
    
    // Step 4: Additional Information
    preExistingConditions: '',
    highRiskActivities: '',
    travelHistory: '',
    emergencyContact: '',
    
    // Step 5: Premium calculation
    basePremium: 0,
    totalPremium: 0
  });

  const destinations = [
    { id: 1, name: 'Europe', riskMultiplier: 1.2 },
    { id: 2, name: 'North America', riskMultiplier: 1.3 },
    { id: 3, name: 'Asia', riskMultiplier: 1.1 },
    { id: 4, name: 'Africa', riskMultiplier: 1.0 },
    { id: 5, name: 'South America', riskMultiplier: 1.4 },
    { id: 6, name: 'Australia/Oceania', riskMultiplier: 1.3 },
    { id: 7, name: 'Middle East', riskMultiplier: 1.5 }
  ];

  const travelTypes = [
    { id: 1, name: 'Single Trip', multiplier: 1.0 },
    { id: 2, name: 'Multi Trip (Annual)', multiplier: 2.5 },
    { id: 3, name: 'Business Travel', multiplier: 1.3 },
    { id: 4, name: 'Family Travel', multiplier: 1.8 }
  ];

  const coverageTypes = [
    {
      id: 1,
      name: 'Basic',
      price: 2500,
      medical: 'KES 500,000',
      baggage: 'KES 50,000',
      cancellation: 'KES 100,000'
    },
    {
      id: 2,
      name: 'Standard',
      price: 4500,
      medical: 'KES 1,000,000',
      baggage: 'KES 100,000',
      cancellation: 'KES 200,000'
    },
    {
      id: 3,
      name: 'Premium',
      price: 7500,
      medical: 'KES 2,000,000',
      baggage: 'KES 200,000',
      cancellation: 'KES 500,000'
    }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePremium = () => {
    const selectedDestination = destinations.find(d => d.name === formData.destination);
    const selectedTravelType = travelTypes.find(t => t.name === formData.travelType);
    const selectedCoverage = coverageTypes.find(c => c.name === formData.coverageType);
    
    if (!selectedDestination || !selectedTravelType || !selectedCoverage) return 0;

    let basePremium = selectedCoverage.price;
    
    // Apply destination risk multiplier
    basePremium *= selectedDestination.riskMultiplier;
    
    // Apply travel type multiplier
    basePremium *= selectedTravelType.multiplier;
    
    // Apply duration multiplier (per week)
    const weeks = Math.ceil(formData.tripDuration / 7);
    if (formData.travelType !== 'Multi Trip (Annual)') {
      basePremium *= Math.max(1, weeks * 0.3 + 0.7);
    }
    
    // Additional charges for high-risk activities
    if (formData.highRiskActivities === 'yes') {
      basePremium *= 1.5;
    }
    
    // Additional charges for pre-existing conditions
    if (formData.preExistingConditions === 'yes') {
      basePremium *= 1.3;
    }

    return Math.round(basePremium);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      if (currentStep === 4) {
        // Calculate premium before moving to final step
        const premium = calculatePremium();
        updateFormData('totalPremium', premium);
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
    Alert.alert(
      'Quotation Submitted',
      `Your travel insurance quotation has been submitted successfully. Premium: KES ${formData.totalPremium.toLocaleString()}`,
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
      {[1, 2, 3, 4, 5].map((step) => (
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
          {step < 5 && (
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
      <Text style={styles.stepSubtitle}>Please provide your personal details</Text>
      
      <View style={styles.inputRow}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>First Name</Text>
          <TextInput
            style={styles.input}
            value={formData.firstName}
            onChangeText={(text) => updateFormData('firstName', text)}
            placeholder="Enter first name"
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={formData.lastName}
            onChangeText={(text) => updateFormData('lastName', text)}
            placeholder="Enter last name"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => updateFormData('email', text)}
          placeholder="Enter email address"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => updateFormData('phone', text)}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>ID Number</Text>
        <TextInput
          style={styles.input}
          value={formData.idNumber}
          onChangeText={(text) => updateFormData('idNumber', text)}
          placeholder="Enter ID number"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Date of Birth</Text>
        <TextInput
          style={styles.input}
          value={formData.dateOfBirth}
          onChangeText={(text) => updateFormData('dateOfBirth', text)}
          placeholder="DD/MM/YYYY"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Travel Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about your travel plans</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Destination</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
          {destinations.map((destination) => (
            <TouchableOpacity
              key={destination.id}
              style={[
                styles.optionButton,
                formData.destination === destination.name && styles.optionButtonActive
              ]}
              onPress={() => updateFormData('destination', destination.name)}
            >
              <Text style={[
                styles.optionText,
                formData.destination === destination.name && styles.optionTextActive
              ]}>
                {destination.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Travel Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
          {travelTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionButton,
                formData.travelType === type.name && styles.optionButtonActive
              ]}
              onPress={() => updateFormData('travelType', type.name)}
            >
              <Text style={[
                styles.optionText,
                formData.travelType === type.name && styles.optionTextActive
              ]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Departure Date</Text>
          <TextInput
            style={styles.input}
            value={formData.departureDate}
            onChangeText={(text) => updateFormData('departureDate', text)}
            placeholder="DD/MM/YYYY"
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>Return Date</Text>
          <TextInput
            style={styles.input}
            value={formData.returnDate}
            onChangeText={(text) => updateFormData('returnDate', text)}
            placeholder="DD/MM/YYYY"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Trip Duration (days)</Text>
        <TextInput
          style={styles.input}
          value={formData.tripDuration.toString()}
          onChangeText={(text) => updateFormData('tripDuration', parseInt(text) || 0)}
          placeholder="Enter number of days"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Purpose of Travel</Text>
        <View style={styles.optionsGrid}>
          {['Tourism', 'Business', 'Education', 'Medical', 'Family Visit', 'Other'].map((purpose) => (
            <TouchableOpacity
              key={purpose}
              style={[
                styles.gridOption,
                formData.tripPurpose === purpose && styles.gridOptionActive
              ]}
              onPress={() => updateFormData('tripPurpose', purpose)}
            >
              <Text style={[
                styles.gridOptionText,
                formData.tripPurpose === purpose && styles.gridOptionTextActive
              ]}>
                {purpose}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Coverage Selection</Text>
      <Text style={styles.stepSubtitle}>Choose your coverage plan</Text>
      
      {coverageTypes.map((coverage) => (
        <TouchableOpacity
          key={coverage.id}
          style={[
            styles.coverageCard,
            formData.coverageType === coverage.name && styles.coverageCardActive
          ]}
          onPress={() => updateFormData('coverageType', coverage.name)}
        >
          <View style={styles.coverageHeader}>
            <Text style={[
              styles.coverageTitle,
              formData.coverageType === coverage.name && styles.coverageTitleActive
            ]}>
              {coverage.name}
            </Text>
            <Text style={[
              styles.coveragePrice,
              formData.coverageType === coverage.name && styles.coveragePriceActive
            ]}>
              KES {coverage.price.toLocaleString()}
            </Text>
          </View>
          <View style={styles.coverageDetails}>
            <Text style={styles.coverageDetail}>Medical: {coverage.medical}</Text>
            <Text style={styles.coverageDetail}>Baggage: {coverage.baggage}</Text>
            <Text style={styles.coverageDetail}>Trip Cancellation: {coverage.cancellation}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Additional Information</Text>
      <Text style={styles.stepSubtitle}>Please provide additional details</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Do you have any pre-existing medical conditions?</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[
              styles.radioOption,
              formData.preExistingConditions === 'yes' && styles.radioOptionActive
            ]}
            onPress={() => updateFormData('preExistingConditions', 'yes')}
          >
            <Text style={[
              styles.radioText,
              formData.preExistingConditions === 'yes' && styles.radioTextActive
            ]}>
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioOption,
              formData.preExistingConditions === 'no' && styles.radioOptionActive
            ]}
            onPress={() => updateFormData('preExistingConditions', 'no')}
          >
            <Text style={[
              styles.radioText,
              formData.preExistingConditions === 'no' && styles.radioTextActive
            ]}>
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Will you participate in high-risk activities?</Text>
        <Text style={styles.inputHelper}>e.g., skiing, mountaineering, water sports</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[
              styles.radioOption,
              formData.highRiskActivities === 'yes' && styles.radioOptionActive
            ]}
            onPress={() => updateFormData('highRiskActivities', 'yes')}
          >
            <Text style={[
              styles.radioText,
              formData.highRiskActivities === 'yes' && styles.radioTextActive
            ]}>
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioOption,
              formData.highRiskActivities === 'no' && styles.radioOptionActive
            ]}
            onPress={() => updateFormData('highRiskActivities', 'no')}
          >
            <Text style={[
              styles.radioText,
              formData.highRiskActivities === 'no' && styles.radioTextActive
            ]}>
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Travel History</Text>
        <View style={styles.optionsGrid}>
          {['First time traveler', 'Occasional traveler', 'Frequent traveler', 'Business traveler'].map((history) => (
            <TouchableOpacity
              key={history}
              style={[
                styles.gridOption,
                formData.travelHistory === history && styles.gridOptionActive
              ]}
              onPress={() => updateFormData('travelHistory', history)}
            >
              <Text style={[
                styles.gridOptionText,
                formData.travelHistory === history && styles.gridOptionTextActive
              ]}>
                {history}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Emergency Contact</Text>
        <TextInput
          style={styles.input}
          value={formData.emergencyContact}
          onChangeText={(text) => updateFormData('emergencyContact', text)}
          placeholder="Name and phone number"
        />
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Premium Calculation</Text>
      <Text style={styles.stepSubtitle}>Your travel insurance quotation</Text>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Policy Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Traveler:</Text>
          <Text style={styles.summaryValue}>{formData.firstName} {formData.lastName}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Destination:</Text>
          <Text style={styles.summaryValue}>{formData.destination}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Travel Type:</Text>
          <Text style={styles.summaryValue}>{formData.travelType}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration:</Text>
          <Text style={styles.summaryValue}>{formData.tripDuration} days</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Coverage:</Text>
          <Text style={styles.summaryValue}>{formData.coverageType}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Premium:</Text>
          <Text style={styles.totalValue}>KES {formData.totalPremium.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          This is a preliminary quotation. Final premium may vary based on additional underwriting requirements.
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
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
        <Text style={styles.headerTitle}>Travel Insurance</Text>
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
}

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
    padding: Spacing.xs,
  },
  headerBackText: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: Spacing.xs,
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
  optionsContainer: {
    marginTop: Spacing.xs,
  },
  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#F9FAFB',
    borderRadius: Spacing.xs,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
  },
  optionTextActive: {
    color: '#FFFFFF',
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
  coverageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  coverageTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  coverageTitleActive: {
    color: Colors.primary,
  },
  coveragePrice: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  coveragePriceActive: {
    color: Colors.primary,
  },
  coverageDetails: {
    marginTop: Spacing.sm,
  },
  coverageDetail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  radioOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: '#F9FAFB',
    borderRadius: Spacing.xs,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  radioOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  radioText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
  },
  radioTextActive: {
    color: '#FFFFFF',
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
  disclaimerContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: Spacing.xs,
    padding: Spacing.md,
  },
  disclaimerText: {
    fontSize: Typography.fontSize.sm,
    color: '#92400E',
    textAlign: 'center',
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
