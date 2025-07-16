import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Typography, Spacing } from '../../constants';
import { PricingService } from '../../services';

export default function WIBAQuotationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Company Information
    companyName: '',
    businessType: '',
    companyAddress: '',
    contactPerson: '',
    phoneNumber: '',
    email: '',
    kraPin: '',
    
    // Step 2: Employee Information
    totalEmployees: '',
    employeeCategories: [],
    
    // Step 3: Risk Assessment
    industryType: '',
    riskLevel: '',
    previousClaims: false,
    safetyMeasures: [],
    
    // Step 4: Coverage Details
    coverageType: '',
    coverageAmount: '',
    
    // Step 5: Premium Calculation
    paymentMethod: 'mpesa'
  });

  const [calculatedPremium, setCalculatedPremium] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Business Types
  const businessTypes = [
    { id: 'manufacturing', name: 'Manufacturing', riskMultiplier: 1.5 },
    { id: 'construction', name: 'Construction', riskMultiplier: 2.0 },
    { id: 'agriculture', name: 'Agriculture', riskMultiplier: 1.3 },
    { id: 'transport', name: 'Transport & Logistics', riskMultiplier: 1.4 },
    { id: 'mining', name: 'Mining', riskMultiplier: 2.5 },
    { id: 'retail', name: 'Retail & Commerce', riskMultiplier: 0.8 },
    { id: 'services', name: 'Professional Services', riskMultiplier: 0.6 },
    { id: 'hospitality', name: 'Hospitality', riskMultiplier: 1.0 },
    { id: 'healthcare', name: 'Healthcare', riskMultiplier: 1.1 },
    { id: 'education', name: 'Education', riskMultiplier: 0.7 }
  ];

  // Employee Categories with PataBima WIBA Rates (per employee per month)
  const employeeCategories = [
    { 
      id: 'clerical', 
      name: 'Clerical & Administrative', 
      baseRate: PricingService.wiba.employeeCategories.clerical.baseRate,
      riskLevel: PricingService.wiba.employeeCategories.clerical.riskLevel,
      description: PricingService.wiba.employeeCategories.clerical.description
    },
    { 
      id: 'skilled', 
      name: 'Skilled Workers', 
      baseRate: PricingService.wiba.employeeCategories.skilled.baseRate,
      riskLevel: PricingService.wiba.employeeCategories.skilled.riskLevel,
      description: PricingService.wiba.employeeCategories.skilled.description
    },
    { 
      id: 'manual', 
      name: 'Manual Labor', 
      baseRate: PricingService.wiba.employeeCategories.manual.baseRate,
      riskLevel: PricingService.wiba.employeeCategories.manual.riskLevel,
      description: PricingService.wiba.employeeCategories.manual.description
    },
    { 
      id: 'hazardous', 
      name: 'Hazardous Work', 
      baseRate: PricingService.wiba.employeeCategories.hazardous.baseRate,
      riskLevel: PricingService.wiba.employeeCategories.hazardous.riskLevel,
      description: PricingService.wiba.employeeCategories.hazardous.description
    }
  ];

  // Risk Levels
  const riskLevels = [
    { 
      id: 'low', 
      name: 'Low Risk', 
      multiplier: 0.8,
      description: 'Office environments, minimal physical work'
    },
    { 
      id: 'medium', 
      name: 'Medium Risk', 
      multiplier: 1.0,
      description: 'Mixed office and field work'
    },
    { 
      id: 'high', 
      name: 'High Risk', 
      multiplier: 1.5,
      description: 'Heavy machinery, construction, hazardous materials'
    },
    { 
      id: 'very_high', 
      name: 'Very High Risk', 
      multiplier: 2.0,
      description: 'Mining, chemical processing, extreme conditions'
    }
  ];

  // Safety Measures
  const safetyMeasures = [
    { id: 'safety_training', name: 'Regular Safety Training', discount: 0.05 },
    { id: 'safety_equipment', name: 'Personal Protective Equipment', discount: 0.03 },
    { id: 'safety_officer', name: 'Dedicated Safety Officer', discount: 0.08 },
    { id: 'emergency_procedures', name: 'Emergency Response Procedures', discount: 0.03 },
    { id: 'health_programs', name: 'Occupational Health Programs', discount: 0.05 },
    { id: 'safety_audits', name: 'Regular Safety Audits', discount: 0.04 }
  ];

  // Coverage Types
  const coverageTypes = [
    {
      id: 'basic',
      name: 'Basic WIBA Coverage',
      description: 'Statutory minimum coverage',
      features: [
        'Work Injury Compensation',
        'Temporary Disability Benefits',
        'Permanent Disability Benefits',
        'Death Benefits',
        'Medical Expenses'
      ],
      baseMultiplier: 1.0
    },
    {
      id: 'enhanced',
      name: 'Enhanced WIBA Coverage',
      description: 'Extended coverage with additional benefits',
      features: [
        'All Basic Coverage Benefits',
        'Rehabilitation Costs',
        'Increased Compensation Limits',
        'Family Support Benefits',
        'Psychological Support',
        'Extended Medical Coverage'
      ],
      baseMultiplier: 1.3
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive WIBA Plus',
      description: 'Maximum protection with premium benefits',
      features: [
        'All Enhanced Coverage Benefits',
        'International Coverage',
        'Business Interruption Cover',
        'Legal Defense Costs',
        'Crisis Management Support',
        'Employer Liability Extension'
      ],
      baseMultiplier: 1.6
    }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate Premium
  // Calculate Premium using PataBima Underwriter Rates
  const calculatePremium = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      let totalPremium = 0;
      let basePremium = 0;
      
      // Calculate base premium from employee categories (PataBima rates)
      formData.employeeCategories.forEach(category => {
        const categoryData = employeeCategories.find(cat => cat.id === category.categoryId);
        if (categoryData) {
          const categoryPremium = categoryData.baseRate * category.count * 12; // Annual
          basePremium += categoryPremium;
        }
      });

      totalPremium = basePremium;

      // Apply industry risk multiplier (PataBima underwriter rates)
      const businessType = businessTypes.find(type => type.id === formData.businessType);
      if (businessType) {
        const industryMultiplier = PricingService.wiba.industryRiskMultipliers[businessType.industry] || 1.0;
        totalPremium *= industryMultiplier;
      }

      // Coverage type multiplier (PataBima standard)
      const coverageType = coverageTypes.find(type => type.id === formData.coverageType);
      if (coverageType) {
        const coverageMultiplier = PricingService.wiba.coverageTypes[formData.coverageType]?.baseMultiplier || coverageType.baseMultiplier;
        totalPremium *= coverageMultiplier;
      }

      // Experience rating (PataBima underwriter factor)
      if (formData.previousClaims) {
        const experienceRating = PricingService.wiba.experienceRating.poor;
        totalPremium *= experienceRating;
      } else {
        const experienceRating = PricingService.wiba.experienceRating.good;
        totalPremium *= experienceRating;
      }

      // Safety measures discounts
      let totalDiscount = 0;
      formData.safetyMeasures.forEach(measureId => {
        const measure = safetyMeasures.find(m => m.id === measureId);
        if (measure) {
          totalDiscount += measure.discount;
        }
      });
      
      // Cap discount at 20%
      totalDiscount = Math.min(totalDiscount, 0.20);
      totalPremium *= (1 - totalDiscount);

      // Apply volume discount (PataBima underwriter rates)
      const totalEmployees = formData.employeeCategories.reduce((sum, cat) => sum + cat.count, 0);
      totalPremium = PricingService.applyVolumeDiscount(totalPremium, totalEmployees, PricingService.wiba.volumeDiscounts);

      const calculations = {
        basePremium: Math.round(basePremium),
        totalEmployees: totalEmployees,
        industryMultiplier: PricingService.wiba.industryRiskMultipliers[businessType?.industry] || 1.0,
        coverageMultiplier: PricingService.wiba.coverageTypes[formData.coverageType]?.baseMultiplier || 1.0,
        experienceRating: formData.previousClaims ? PricingService.wiba.experienceRating.poor : PricingService.wiba.experienceRating.good,
        volumeDiscount: totalEmployees > 200 ? 0.15 : (totalEmployees > 50 ? 0.10 : (totalEmployees > 10 ? 0.05 : 0)),
        totalPremium: Math.round(totalPremium),
        monthlyPremium: Math.round(totalPremium / 12),
        costPerEmployee: totalEmployees > 0 ? Math.round(totalPremium / totalEmployees) : 0
      };

      setCalculatedPremium(calculations);
      setIsCalculating(false);
      setCurrentStep(5);
    }, 2000);
  };

  // Validation functions
  const isStep1Valid = () => {
    return formData.companyName && formData.businessType && formData.contactPerson && 
           formData.phoneNumber && formData.companyAddress;
  };

  const isStep2Valid = () => {
    return formData.totalEmployees && formData.employeeCategories.length > 0 &&
           formData.employeeCategories.every(cat => cat.count > 0);
  };

  const isStep3Valid = () => formData.industryType && formData.riskLevel;
  const isStep4Valid = () => formData.coverageType !== '';

  // Navigation functions
  const nextStep = () => {
    if (currentStep < 5) {
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
      case 3: return isStep3Valid();
      case 4: return isStep4Valid();
      default: return false;
    }
  };

  // Employee Category Management
  const addEmployeeCategory = () => {
    const newCategory = {
      id: Date.now(),
      categoryId: '',
      count: ''
    };
    setFormData(prev => ({
      ...prev,
      employeeCategories: [...prev.employeeCategories, newCategory]
    }));
  };

  const removeEmployeeCategory = (id) => {
    setFormData(prev => ({
      ...prev,
      employeeCategories: prev.employeeCategories.filter(cat => cat.id !== id)
    }));
  };

  const updateEmployeeCategory = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      employeeCategories: prev.employeeCategories.map(cat => 
        cat.id === id ? { ...cat, [field]: value } : cat
      )
    }));
  };

  // Render Steps
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5].map((step) => (
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

  // Step 1: Company Information
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Company Information</Text>
      <Text style={styles.stepSubtitle}>Enter your company details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Company Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.companyName}
          onChangeText={(value) => updateFormData('companyName', value)}
          placeholder="Enter company name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Business Type *</Text>
        <View style={styles.optionsGrid}>
          {businessTypes.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionCard,
                formData.businessType === type.id && styles.selectedOption
              ]}
              onPress={() => updateFormData('businessType', type.id)}
            >
              <Text style={styles.optionName}>{type.name}</Text>
              <Text style={styles.optionRisk}>Risk: {type.riskMultiplier}x</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Company Address *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.companyAddress}
          onChangeText={(value) => updateFormData('companyAddress', value)}
          placeholder="Enter full company address"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Contact Person *</Text>
        <TextInput
          style={styles.input}
          value={formData.contactPerson}
          onChangeText={(value) => updateFormData('contactPerson', value)}
          placeholder="Enter contact person name"
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
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => updateFormData('email', value)}
          placeholder="company@email.com"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>KRA PIN</Text>
        <TextInput
          style={styles.input}
          value={formData.kraPin}
          onChangeText={(value) => updateFormData('kraPin', value)}
          placeholder="P051234567X"
        />
      </View>
    </View>
  );

  // Step 2: Employee Information
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Employee Information</Text>
      <Text style={styles.stepSubtitle}>Provide details about your workforce</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Total Number of Employees *</Text>
        <TextInput
          style={styles.input}
          value={formData.totalEmployees}
          onChangeText={(value) => updateFormData('totalEmployees', value)}
          placeholder="Enter total number of employees"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Employee Categories *</Text>
        <Text style={styles.inputSubLabel}>Break down employees by category and risk level</Text>
        
        {formData.employeeCategories.map((category, index) => (
          <View key={category.id} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>Category {index + 1}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeEmployeeCategory(category.id)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category Type</Text>
              <View style={styles.categoryOptions}>
                {employeeCategories.map(catType => (
                  <TouchableOpacity
                    key={catType.id}
                    style={[
                      styles.categoryOption,
                      category.categoryId === catType.id && styles.selectedCategoryOption
                    ]}
                    onPress={() => updateEmployeeCategory(category.id, 'categoryId', catType.id)}
                  >
                    <Text style={styles.categoryOptionName}>{catType.name}</Text>
                    <Text style={styles.categoryOptionRate}>KES {catType.baseRate}/month</Text>
                    <Text style={styles.categoryOptionDesc}>{catType.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Number of Employees</Text>
              <TextInput
                style={styles.input}
                value={category.count}
                onChangeText={(value) => updateEmployeeCategory(category.id, 'count', value)}
                placeholder="Enter number of employees"
                keyboardType="numeric"
              />
            </View>
          </View>
        ))}
        
        <TouchableOpacity style={styles.addCategoryButton} onPress={addEmployeeCategory}>
          <Text style={styles.addCategoryText}>+ Add Employee Category</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step 3: Risk Assessment
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Risk Assessment</Text>
      <Text style={styles.stepSubtitle}>Help us assess your workplace risk level</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Industry Type *</Text>
        <TextInput
          style={styles.input}
          value={formData.industryType}
          onChangeText={(value) => updateFormData('industryType', value)}
          placeholder="e.g., Manufacturing, Construction, Services"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Risk Level *</Text>
        {riskLevels.map(level => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.riskOption,
              formData.riskLevel === level.id && styles.selectedRiskOption
            ]}
            onPress={() => updateFormData('riskLevel', level.id)}
          >
            <View style={styles.riskHeader}>
              <Text style={styles.riskName}>{level.name}</Text>
              <Text style={styles.riskMultiplier}>×{level.multiplier}</Text>
            </View>
            <Text style={styles.riskDescription}>{level.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Previous WIBA Claims</Text>
        <View style={styles.claimsContainer}>
          <TouchableOpacity
            style={[
              styles.claimsOption,
              !formData.previousClaims && styles.selectedClaimsOption
            ]}
            onPress={() => updateFormData('previousClaims', false)}
          >
            <Text style={styles.claimsText}>No Previous Claims</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.claimsOption,
              formData.previousClaims && styles.selectedClaimsOption
            ]}
            onPress={() => updateFormData('previousClaims', true)}
          >
            <Text style={styles.claimsText}>Previous Claims</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Safety Measures in Place</Text>
        <Text style={styles.inputSubLabel}>Select all applicable safety measures (discounts apply)</Text>
        {safetyMeasures.map(measure => (
          <TouchableOpacity
            key={measure.id}
            style={[
              styles.safetyOption,
              formData.safetyMeasures.includes(measure.id) && styles.selectedSafetyOption
            ]}
            onPress={() => {
              const isSelected = formData.safetyMeasures.includes(measure.id);
              const newMeasures = isSelected
                ? formData.safetyMeasures.filter(id => id !== measure.id)
                : [...formData.safetyMeasures, measure.id];
              updateFormData('safetyMeasures', newMeasures);
            }}
          >
            <Text style={styles.safetyName}>{measure.name}</Text>
            <Text style={styles.safetyDiscount}>-{(measure.discount * 100)}%</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Step 4: Coverage Details
  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Coverage Selection</Text>
      <Text style={styles.stepSubtitle}>Choose your WIBA coverage level</Text>
      
      {coverageTypes.map(coverage => (
        <TouchableOpacity
          key={coverage.id}
          style={[
            styles.coverageCard,
            formData.coverageType === coverage.id && styles.selectedCoverageCard
          ]}
          onPress={() => updateFormData('coverageType', coverage.id)}
        >
          <View style={styles.coverageHeader}>
            <Text style={styles.coverageName}>{coverage.name}</Text>
            <Text style={styles.coverageMultiplier}>×{coverage.baseMultiplier}</Text>
          </View>
          <Text style={styles.coverageDescription}>{coverage.description}</Text>
          
          <View style={styles.coverageFeatures}>
            {coverage.features.map((feature, index) => (
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

  // Step 5: Premium Calculation
  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>WIBA Premium Quote</Text>
      <Text style={styles.stepSubtitle}>Your work injury benefits insurance quote</Text>
      
      {calculatedPremium && (
        <View style={styles.premiumCard}>
          <View style={styles.premiumHeader}>
            <Text style={styles.premiumTitle}>Your WIBA Insurance Quote</Text>
            <View style={styles.premiumAmount}>
              <Text style={styles.annualPremium}>KES {calculatedPremium.totalPremium.toLocaleString()}</Text>
              <Text style={styles.premiumPeriod}>per year</Text>
            </View>
            <Text style={styles.monthlyPremium}>
              KES {calculatedPremium.monthlyPremium.toLocaleString()}/month
            </Text>
            <Text style={styles.costPerEmployee}>
              KES {calculatedPremium.costPerEmployee.toLocaleString()} per employee/year
            </Text>
          </View>

          <View style={styles.breakdownSection}>
            <Text style={styles.breakdownTitle}>Premium Breakdown:</Text>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Base Premium:</Text>
              <Text style={styles.breakdownValue}>KES {calculatedPremium.basePremium.toLocaleString()}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Business Risk Factor:</Text>
              <Text style={styles.breakdownValue}>×{calculatedPremium.businessTypeMultiplier}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Risk Level Factor:</Text>
              <Text style={styles.breakdownValue}>×{calculatedPremium.riskLevelMultiplier}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Coverage Level:</Text>
              <Text style={styles.breakdownValue}>×{calculatedPremium.coverageMultiplier}</Text>
            </View>
            {calculatedPremium.safetyDiscount > 0 && (
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Safety Discount:</Text>
                <Text style={styles.breakdownValue}>-{(calculatedPremium.safetyDiscount * 100).toFixed(1)}%</Text>
              </View>
            )}
            {calculatedPremium.employeeDiscount > 0 && (
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Volume Discount:</Text>
                <Text style={styles.breakdownValue}>-{(calculatedPremium.employeeDiscount * 100)}%</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.proceedButton}
            onPress={() => {
              Alert.alert(
                'WIBA Quote Generated!',
                `Your WIBA insurance quote of KES ${calculatedPremium.totalPremium.toLocaleString()} has been generated for ${formData.totalEmployees} employees.`,
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
      
      {currentStep < 4 && (
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
      
      {currentStep === 4 && (
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
        <Text style={styles.headerTitle}>WIBA Insurance</Text>
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    minWidth: '48%',
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  optionRisk: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  categoryCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.backgroundGray,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryTitle: {
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
  categoryOptions: {
    gap: Spacing.sm,
  },
  categoryOption: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
  },
  selectedCategoryOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  categoryOptionName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  categoryOptionRate: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  categoryOptionDesc: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  addCategoryButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  addCategoryText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  riskOption: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  selectedRiskOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  riskName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  riskMultiplier: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  riskDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  claimsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  claimsOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  selectedClaimsOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  claimsText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  safetyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  selectedSafetyOption: {
    borderColor: Colors.success,
    backgroundColor: Colors.successLight,
  },
  safetyName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    flex: 1,
  },
  safetyDiscount: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.success,
  },
  coverageCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  selectedCoverageCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  coverageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  coverageName: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  coverageMultiplier: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  coverageDescription: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  coverageFeatures: {
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
    marginBottom: Spacing.xs,
  },
  costPerEmployee: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
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
