import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  Modal,
  Animated,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Typography, Spacing } from '../../constants';
import { PricingService } from '../../services';

export default function MedicalQuotationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    idNumber: '',
    phoneNumber: '',
    email: '',
    
    // Step 2: Medical Plan Selection
    planType: '',
    
    // Step 3: Dependents
    dependents: [],
    
    // Step 4: Health Information
    preExistingConditions: '',
    currentMedications: '',
    smoking: false,
    
    // Step 5: Coverage Preferences
    coverageLevel: '',
    preferredHospitals: [],
    
    // Step 6: Premium & Payment
    paymentMethod: 'mpesa'
  });

  const [calculatedPremium, setCalculatedPremium] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Medical Plans Available (PataBima Underwriter Rates)
  const medicalPlans = [
    {
      id: 'basic',
      name: 'Basic Medical Cover',
      description: 'Essential healthcare coverage',
      features: [
        'Outpatient Cover: KES 200,000',
        'Inpatient Cover: KES 500,000',
        'Emergency Cover: KES 100,000',
        'Prescription: KES 50,000'
      ],
      baseRate: PricingService.medical.basePremiums.basic.individual,
      familyRate: PricingService.medical.basePremiums.basic.family,
      coverage: PricingService.medical.basePremiums.basic.coverage,
      icon: '🏥'
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Medical',
      description: 'Complete healthcare protection',
      features: [
        'Outpatient Cover: KES 400,000',
        'Inpatient Cover: KES 1,000,000',
        'Emergency Cover: KES 200,000',
        'Prescription: KES 100,000',
        'Dental & Optical: KES 100,000'
      ],
      baseRate: PricingService.medical.basePremiums.standard.individual,
      familyRate: PricingService.medical.basePremiums.standard.family,
      coverage: PricingService.medical.basePremiums.standard.coverage,
      icon: '🛡️'
    },
    {
      id: 'family',
      name: 'Family Medical Package',
      description: 'Premium family healthcare coverage',
      features: [
        'Family Outpatient: KES 800,000',
        'Family Inpatient: KES 2,000,000',
        'Maternity Cover: KES 600,000',
        'Child Wellness: KES 150,000',
        'Vaccination Cover: Included',
        'Dental & Optical: KES 150,000',
        'International Cover: KES 2,000,000'
      ],
      baseRate: PricingService.medical.basePremiums.premium.individual,
      familyRate: PricingService.medical.basePremiums.premium.family,
      coverage: PricingService.medical.basePremiums.premium.coverage,
      icon: '👨‍👩‍👧‍👦'
    }
  ];

  // Gender Options
  const genderOptions = [
    { id: 'male', name: 'Male', icon: '👨' },
    { id: 'female', name: 'Female', icon: '👩' }
  ];

  // Coverage Levels
  const coverageLevels = [
    { 
      id: 'standard', 
      name: 'Standard Coverage', 
      multiplier: 1.0,
      description: 'Basic coverage with selected hospitals'
    },
    { 
      id: 'premium', 
      name: 'Premium Coverage', 
      multiplier: 1.5,
      description: 'Extended coverage with premium hospitals'
    },
    { 
      id: 'platinum', 
      name: 'Platinum Coverage', 
      multiplier: 2.0,
      description: 'Full coverage with all network hospitals'
    }
  ];

  // Hospital Networks
  const hospitalNetworks = [
    { id: 'nairobi_hospital', name: 'Nairobi Hospital', category: 'Premium' },
    { id: 'aga_khan', name: 'Aga Khan Hospital', category: 'Premium' },
    { id: 'mp_shah', name: 'MP Shah Hospital', category: 'Premium' },
    { id: 'kenyatta', name: 'Kenyatta National Hospital', category: 'Standard' },
    { id: 'mater', name: 'Mater Hospital', category: 'Premium' },
    { id: 'gertrudes', name: "Gertrude's Children Hospital", category: 'Premium' }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate Premium
  const calculatePremium = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const selectedPlan = medicalPlans.find(plan => plan.id === formData.planType);
      if (!selectedPlan) return;

      // Start with base premium (individual or family)
      let premium = formData.dependents.length > 0 ? selectedPlan.familyRate : selectedPlan.baseRate;
      
      // Age factor using PataBima pricing structure
      const age = PricingService.calculateAge(formData.dateOfBirth);
      const ageFactor = PricingService.getAgeGroup(age, PricingService.medical.ageFactors);
      premium *= ageFactor;
      
      // Gender factor (PataBima rates include maternity for females)
      const genderFactor = PricingService.medical.genderFactors[formData.gender] || 1.0;
      premium *= genderFactor;
      
      // Coverage level factor
      const coverageLevel = coverageLevels.find(level => level.id === formData.coverageLevel);
      if (coverageLevel) {
        premium *= coverageLevel.multiplier;
      }
      
      // Lifestyle factors (PataBima underwriter rates)
      if (formData.smoking) {
        premium *= PricingService.medical.lifestyleFactors.smoking;
      }
      
      // Pre-existing conditions factor
      if (formData.preExistingConditions && formData.preExistingConditions.length > 10) {
        premium *= PricingService.medical.lifestyleFactors.pre_existing;
      }

      // Additional dependents beyond spouse and first child
      if (formData.dependents.length > 2) {
        const additionalDependents = formData.dependents.length - 2;
        premium += (premium * PricingService.medical.dependentRates.additional_child * additionalDependents);
      }

      const calculations = {
        basePremium: selectedPlan.baseRate,
        ageFactor: age > 35 ? (age > 50 ? 1.5 : 1.2) : 1.0,
        genderFactor: formData.gender === 'female' ? 1.1 : 1.0,
        coverageFactor: coverageLevel ? coverageLevel.multiplier : 1.0,
        dependentsCost: formData.dependents.length * (selectedPlan.baseRate * 0.3),
        smokingFactor: formData.smoking ? 1.3 : 1.0,
        conditionsFactor: (formData.preExistingConditions && formData.preExistingConditions.length > 10) ? 1.4 : 1.0,
        totalPremium: Math.round(premium),
        monthlyPremium: Math.round(premium / 12)
      };

      setCalculatedPremium(calculations);
      setIsCalculating(false);
      setCurrentStep(6);
    }, 2000);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 25; // Default age
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Validation functions
  const isStep1Valid = () => {
    return formData.firstName && formData.lastName && formData.dateOfBirth && 
           formData.gender && formData.idNumber && formData.phoneNumber;
  };

  const isStep2Valid = () => formData.planType !== '';
  const isStep4Valid = () => true; // Health info is optional
  const isStep5Valid = () => formData.coverageLevel !== '';

  // Navigation functions
  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    if (step <= currentStep || isStepValid(currentStep)) {
      setCurrentStep(step);
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1: return isStep1Valid();
      case 2: return isStep2Valid();
      case 3: return true; // Dependents optional
      case 4: return isStep4Valid();
      case 5: return isStep5Valid();
      default: return false;
    }
  };

  // Add Dependent
  const addDependent = () => {
    const newDependent = {
      id: Date.now(),
      name: '',
      relationship: '',
      dateOfBirth: ''
    };
    setFormData(prev => ({
      ...prev,
      dependents: [...prev.dependents, newDependent]
    }));
  };

  const removeDependent = (id) => {
    setFormData(prev => ({
      ...prev,
      dependents: prev.dependents.filter(dep => dep.id !== id)
    }));
  };

  const updateDependent = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      dependents: prev.dependents.map(dep => 
        dep.id === id ? { ...dep, [field]: value } : dep
      )
    }));
  };

  // Render Steps
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5, 6].map((step) => (
        <TouchableOpacity
          key={step}
          style={[
            styles.stepButton,
            step === currentStep && styles.activeStep,
            step < currentStep && styles.completedStep
          ]}
          onPress={() => goToStep(step)}
        >
          <Text style={[
            styles.stepText,
            (step === currentStep || step < currentStep) && styles.activeStepText
          ]}>
            {step}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Step 1: Personal Details
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Details</Text>
      <Text style={styles.stepSubtitle}>Enter your personal information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>First Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.firstName}
          onChangeText={(value) => updateFormData('firstName', value)}
          placeholder="Enter first name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Last Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.lastName}
          onChangeText={(value) => updateFormData('lastName', value)}
          placeholder="Enter last name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Date of Birth *</Text>
        <TextInput
          style={styles.input}
          value={formData.dateOfBirth}
          onChangeText={(value) => updateFormData('dateOfBirth', value)}
          placeholder="DD/MM/YYYY"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Gender *</Text>
        <View style={styles.genderContainer}>
          {genderOptions.map(gender => (
            <TouchableOpacity
              key={gender.id}
              style={[
                styles.genderOption,
                formData.gender === gender.id && styles.selectedGender
              ]}
              onPress={() => updateFormData('gender', gender.id)}
            >
              <Text style={styles.genderIcon}>{gender.icon}</Text>
              <Text style={styles.genderText}>{gender.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>ID Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.idNumber}
          onChangeText={(value) => updateFormData('idNumber', value)}
          placeholder="Enter ID number"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.phoneNumber}
          onChangeText={(value) => updateFormData('phoneNumber', value)}
          placeholder="0700000000"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email (Optional)</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => updateFormData('email', value)}
          placeholder="Enter email address"
          keyboardType="email-address"
        />
      </View>
    </View>
  );

  // Step 2: Medical Plan Selection
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose Medical Plan</Text>
      <Text style={styles.stepSubtitle}>Select the plan that suits your needs</Text>
      
      {medicalPlans.map(plan => (
        <TouchableOpacity
          key={plan.id}
          style={[
            styles.planCard,
            formData.planType === plan.id && styles.selectedPlan
          ]}
          onPress={() => updateFormData('planType', plan.id)}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planIcon}>{plan.icon}</Text>
            <View style={styles.planInfo}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planDescription}>{plan.description}</Text>
              <Text style={styles.planPrice}>From KES {plan.baseRate.toLocaleString()}/year</Text>
            </View>
          </View>
          
          <View style={styles.planFeatures}>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureBullet}>✓</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Step 3: Dependents
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Add Dependents</Text>
      <Text style={styles.stepSubtitle}>Add family members to cover (optional)</Text>
      
      {formData.dependents.map((dependent, index) => (
        <View key={dependent.id} style={styles.dependentCard}>
          <View style={styles.dependentHeader}>
            <Text style={styles.dependentTitle}>Dependent {index + 1}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeDependent(dependent.id)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={dependent.name}
              onChangeText={(value) => updateDependent(dependent.id, 'name', value)}
              placeholder="Enter full name"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Relationship</Text>
            <TextInput
              style={styles.input}
              value={dependent.relationship}
              onChangeText={(value) => updateDependent(dependent.id, 'relationship', value)}
              placeholder="e.g., Spouse, Child"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              value={dependent.dateOfBirth}
              onChangeText={(value) => updateDependent(dependent.id, 'dateOfBirth', value)}
              placeholder="DD/MM/YYYY"
            />
          </View>
        </View>
      ))}
      
      <TouchableOpacity style={styles.addDependentButton} onPress={addDependent}>
        <Text style={styles.addDependentText}>+ Add Dependent</Text>
      </TouchableOpacity>
    </View>
  );

  // Step 4: Health Information
  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Health Information</Text>
      <Text style={styles.stepSubtitle}>Help us assess your coverage needs</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Pre-existing Medical Conditions</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.preExistingConditions}
          onChangeText={(value) => updateFormData('preExistingConditions', value)}
          placeholder="List any existing medical conditions (optional)"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Current Medications</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.currentMedications}
          onChangeText={(value) => updateFormData('currentMedications', value)}
          placeholder="List current medications (optional)"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Smoking Status</Text>
        <View style={styles.smokingContainer}>
          <TouchableOpacity
            style={[
              styles.smokingOption,
              !formData.smoking && styles.selectedSmoking
            ]}
            onPress={() => updateFormData('smoking', false)}
          >
            <Text style={styles.smokingText}>Non-Smoker</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.smokingOption,
              formData.smoking && styles.selectedSmoking
            ]}
            onPress={() => updateFormData('smoking', true)}
          >
            <Text style={styles.smokingText}>Smoker</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Step 5: Coverage Preferences
  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Coverage Preferences</Text>
      <Text style={styles.stepSubtitle}>Customize your coverage level</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Coverage Level *</Text>
        {coverageLevels.map(level => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.coverageOption,
              formData.coverageLevel === level.id && styles.selectedCoverage
            ]}
            onPress={() => updateFormData('coverageLevel', level.id)}
          >
            <View style={styles.coverageHeader}>
              <Text style={styles.coverageName}>{level.name}</Text>
              <Text style={styles.coverageMultiplier}>+{((level.multiplier - 1) * 100)}%</Text>
            </View>
            <Text style={styles.coverageDescription}>{level.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Preferred Hospital Network</Text>
        <Text style={styles.inputSubLabel}>Select hospitals you prefer (optional)</Text>
        {hospitalNetworks.map(hospital => (
          <TouchableOpacity
            key={hospital.id}
            style={[
              styles.hospitalOption,
              formData.preferredHospitals.includes(hospital.id) && styles.selectedHospital
            ]}
            onPress={() => {
              const isSelected = formData.preferredHospitals.includes(hospital.id);
              const newHospitals = isSelected
                ? formData.preferredHospitals.filter(id => id !== hospital.id)
                : [...formData.preferredHospitals, hospital.id];
              updateFormData('preferredHospitals', newHospitals);
            }}
          >
            <Text style={styles.hospitalName}>{hospital.name}</Text>
            <Text style={styles.hospitalCategory}>{hospital.category}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Step 6: Premium & Payment
  const renderStep6 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Premium Calculation</Text>
      <Text style={styles.stepSubtitle}>Your medical insurance quote</Text>
      
      {calculatedPremium && (
        <View style={styles.premiumCard}>
          <View style={styles.premiumHeader}>
            <Text style={styles.premiumTitle}>Your Medical Insurance Quote</Text>
            <View style={styles.premiumAmount}>
              <Text style={styles.annualPremium}>KES {calculatedPremium.totalPremium.toLocaleString()}</Text>
              <Text style={styles.premiumPeriod}>per year</Text>
            </View>
            <Text style={styles.monthlyPremium}>
              or KES {calculatedPremium.monthlyPremium.toLocaleString()}/month
            </Text>
          </View>

          <View style={styles.breakdownSection}>
            <Text style={styles.breakdownTitle}>Premium Breakdown:</Text>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Base Premium:</Text>
              <Text style={styles.breakdownValue}>KES {calculatedPremium.basePremium.toLocaleString()}</Text>
            </View>
            {calculatedPremium.dependentsCost > 0 && (
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Dependents ({formData.dependents.length}):</Text>
                <Text style={styles.breakdownValue}>KES {calculatedPremium.dependentsCost.toLocaleString()}</Text>
              </View>
            )}
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Age Factor:</Text>
              <Text style={styles.breakdownValue}>×{calculatedPremium.ageFactor}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Coverage Level:</Text>
              <Text style={styles.breakdownValue}>×{calculatedPremium.coverageFactor}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.proceedButton}
            onPress={() => {
              Alert.alert(
                'Quote Generated!',
                `Your medical insurance quote of KES ${calculatedPremium.totalPremium.toLocaleString()} has been generated. This would normally proceed to payment.`,
                [
                  {
                    text: 'Back to Home',
                    onPress: () => navigation.navigate('Home')
                  }
                ]
              );
            }}
          >
            <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderNavigationButtons = () => (
    <View style={styles.navigationContainer}>
      {currentStep > 1 && (
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}
      
      {currentStep < 5 && (
        <TouchableOpacity
          style={[
            styles.nextButton,
            !isStepValid(currentStep) && styles.disabledButton
          ]}
          onPress={nextStep}
          disabled={!isStepValid(currentStep)}
        >
          <Text style={styles.nextButtonText}>Continue →</Text>
        </TouchableOpacity>
      )}
      
      {currentStep === 5 && (
        <TouchableOpacity
          style={[
            styles.calculateButton,
            !isStepValid(currentStep) && styles.disabledButton
          ]}
          onPress={calculatePremium}
          disabled={!isStepValid(currentStep) || isCalculating}
        >
          <Text style={styles.calculateButtonText}>
            {isCalculating ? 'Calculating...' : 'Calculate Premium'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
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
        <Text style={styles.headerTitle}>Medical Insurance</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {getCurrentStepContent()}
        </ScrollView>

        {/* Navigation Buttons */}
        {renderNavigationButtons()}
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBackButton: {
    padding: Spacing.sm,
  },
  headerBackText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
  },
  activeStep: {
    backgroundColor: Colors.primary,
  },
  completedStep: {
    backgroundColor: Colors.success,
  },
  stepText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  activeStepText: {
    color: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  stepContainer: {
    padding: Spacing.lg,
  },
  stepTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  inputSubLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    backgroundColor: Colors.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  selectedGender: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  genderIcon: {
    fontSize: Typography.fontSize.lg,
  },
  genderText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  planCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  selectedPlan: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  planIcon: {
    fontSize: Typography.fontSize.xl,
    marginRight: Spacing.md,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  planDescription: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  planPrice: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  planFeatures: {
    paddingLeft: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  featureBullet: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.success,
    marginRight: Spacing.sm,
    width: 16,
  },
  featureText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    flex: 1,
  },
  dependentCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.backgroundGray,
  },
  dependentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dependentTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  removeButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.error,
    borderRadius: 4,
  },
  removeButtonText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.background,
  },
  addDependentButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  addDependentText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  smokingContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  smokingOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  selectedSmoking: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  smokingText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  coverageOption: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  selectedCoverage: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  coverageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  coverageName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  coverageMultiplier: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  coverageDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  hospitalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  selectedHospital: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  hospitalName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    flex: 1,
  },
  hospitalCategory: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  premiumCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  premiumTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  premiumAmount: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  annualPremium: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  premiumPeriod: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  monthlyPremium: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  breakdownSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  breakdownTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  breakdownLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  proceedButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  proceedButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.background,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.background,
  },
  calculateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  calculateButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.background,
  },
  disabledButton: {
    backgroundColor: Colors.backgroundGray,
    opacity: 0.6,
  },
});
