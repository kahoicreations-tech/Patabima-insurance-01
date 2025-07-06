import React, { useState, useEffect } from 'react';
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
  SafeAreaView,
  Platform,
  Linking,
  Dimensions 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Typography } from '../constants';

export default function MotorQuotationScreen({ navigation }) {
  // Safe area and responsive dimensions
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [coverStartDate, setCoverStartDate] = useState(new Date());
  
  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVehicleCategory, setSelectedVehicleCategory] = useState(null);
  const [selectedInsuranceProduct, setSelectedInsuranceProduct] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [policyNumber, setPolicyNumber] = useState(null);

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
    policyPeriod: '12', // months - will be set by insurer selection
    startDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    insurer: '',
    
    // Additional Information
    previousInsurer: '',
    claimsHistory: 'No',
    modifications: 'No'
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [vehicleVerified, setVehicleVerified] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [calculatedPremium, setCalculatedPremium] = useState(null);

  // Vehicle Categories (Step 1)
  const vehicleCategories = [
    { 
      id: 'private', 
      name: 'Private', 
      icon: '🚗',
      description: 'Personal vehicles for private use'
    },
    { 
      id: 'commercial', 
      name: 'Commercial', 
      icon: '🚚',
      description: 'Commercial vehicles for business use'
    },
    { 
      id: 'psv', 
      name: 'PSV', 
      icon: '🚌',
      description: 'Public Service Vehicles'
    },
    { 
      id: 'motorcycle', 
      name: 'Motorcycle', 
      icon: '🏍️',
      description: 'Motorcycles and scooters'
    },
    { 
      id: 'tuktuk', 
      name: 'TukTuk', 
      icon: '🛺',
      description: 'Three-wheelers and auto-rickshaws'
    },
    { 
      id: 'special', 
      name: 'Special Classes', 
      icon: '🚛',
      description: 'Special and heavy vehicles'
    }
  ];

  // Insurance Products by Category (Step 2)
  const insuranceProducts = {
    private: {
      thirdParty: [
        { id: 'tor_private', name: 'TOR For Private', icon: '⚡', baseRate: 3.5 },
        { id: 'private_third_party', name: 'Private Third-Party', icon: '🚗', baseRate: 3.0 },
        { id: 'private_third_party_ext', name: 'Private Third-Party Extendible', icon: '🚗', baseRate: 3.2 },
        { id: 'private_motorcycle_third', name: 'Private Motorcycle Third-Party', icon: '🏍️', baseRate: 2.8 }
      ],
      comprehensive: [
        { id: 'private_comprehensive', name: 'Private Comprehensive', icon: '🛡️', baseRate: 5.0 }
      ]
    },
    commercial: {
      thirdParty: [
        { id: 'commercial_third_party', name: 'Commercial Third-Party', icon: '🚚', baseRate: 4.5 },
        { id: 'commercial_ext', name: 'Commercial Extendible', icon: '🚚', baseRate: 4.8 }
      ],
      comprehensive: [
        { id: 'commercial_comprehensive', name: 'Commercial Comprehensive', icon: '🛡️', baseRate: 6.0 }
      ]
    },
    psv: {
      thirdParty: [
        { id: 'psv_third_party', name: 'PSV Third-Party', icon: '🚌', baseRate: 6.0 },
        { id: 'matatu_cover', name: 'Matatu Cover', icon: '🚐', baseRate: 6.5 }
      ],
      comprehensive: [
        { id: 'psv_comprehensive', name: 'PSV Comprehensive', icon: '🛡️', baseRate: 8.0 }
      ]
    },
    motorcycle: {
      thirdParty: [
        { id: 'motorcycle_third_party', name: 'Motorcycle Third-Party', icon: '🏍️', baseRate: 2.8 },
        { id: 'boda_boda_cover', name: 'Boda Boda Cover', icon: '🏍️', baseRate: 4.5 }
      ],
      comprehensive: [
        { id: 'motorcycle_comprehensive', name: 'Motorcycle Comprehensive', icon: '🛡️', baseRate: 4.0 }
      ]
    },
    tuktuk: {
      thirdParty: [
        { id: 'tuktuk_third_party', name: 'TukTuk Third-Party', icon: '🛺', baseRate: 3.5 }
      ],
      comprehensive: [
        { id: 'tuktuk_comprehensive', name: 'TukTuk Comprehensive', icon: '🛡️', baseRate: 5.0 }
      ]
    },
    special: {
      thirdParty: [
        { id: 'tractor_third_party', name: 'Tractor Third-Party', icon: '🚜', baseRate: 3.0 },
        { id: 'heavy_machinery', name: 'Heavy Machinery', icon: '🏗️', baseRate: 5.5 }
      ],
      comprehensive: [
        { id: 'special_comprehensive', name: 'Special Comprehensive', icon: '🛡️', baseRate: 6.5 }
      ]
    }
  };

  // Available Insurers with policy durations
  const insurers = [
    { id: 'cic', name: 'CIC Insurance', logo: '🏢', rating: 4.5, policyDuration: 12, baseRate: 3.5 },
    { id: 'madison', name: 'Madison Insurance', logo: '🏛️', rating: 4.3, policyDuration: 12, baseRate: 3.8 },
    { id: 'jubilee', name: 'Jubilee Insurance', logo: '🏦', rating: 4.4, policyDuration: 12, baseRate: 3.6 },
    { id: 'heritage', name: 'Heritage Insurance', logo: '🏢', rating: 4.2, policyDuration: 6, baseRate: 4.0 },
    { id: 'apollo', name: 'Apollo Insurance', logo: '🏛️', rating: 4.1, policyDuration: 12, baseRate: 3.9 }
  ];
  // Step Navigation Functions
  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    // Allow navigation to previous steps or next if current step is valid
    if (step <= currentStep || isStepValid(currentStep)) {
      setCurrentStep(step);
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return selectedVehicleCategory !== null;
      case 2:
        return selectedInsuranceProduct !== null;
      case 3:
        return isStep3Valid();
      case 4:
        return isStep4Valid();
      case 5:
        return true; // Documents optional for now
      case 6:
        return isStep6Valid();
      default:
        return false;
    }
  };

  const selectVehicleCategory = (category) => {
    setSelectedVehicleCategory(category);
    setCurrentStep(2);
  };

  const selectInsuranceProduct = (product) => {
    setSelectedInsuranceProduct(product);
    setFormData(prev => ({
      ...prev,
      coverType: product.id
    }));
    setCurrentStep(3);
  };

  const checkExistingCover = () => {
    Alert.alert(
      'Check Existing Cover',
      'This feature will check if your vehicle has existing insurance coverage.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => {
          // Navigate to existing cover check
          Alert.alert('Info', 'Existing cover check functionality will be implemented here.');
        }}
      ]
    );
  };

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
        hasExistingCover: false,
        lastInsurer: null
      },
      'KBZ456B': {
        make: 'Nissan',
        model: 'X-Trail',
        yearOfManufacture: '2019',
        engineCapacity: '2000',
        vehicleValue: '3200000',
        ownerName: 'Mary Wanjiku Njoroge',
        hasExistingCover: true,
        lastInsurer: 'CIC Insurance',
        expiryDate: '2025-03-15'
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
      
      if (vehicleData.hasExistingCover) {
        Alert.alert(
          'Existing Cover Found', 
          `Vehicle has existing insurance with ${vehicleData.lastInsurer} expiring on ${vehicleData.expiryDate}. You can still proceed with a new policy.`,
          [
            { text: 'Continue Anyway', style: 'default' },
            { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() }
          ]
        );
      } else {
        Alert.alert('Vehicle Found', `Vehicle details retrieved for ${vehicleData.make} ${vehicleData.model}`);
      }
    } else {
      setIsVerifying(false);
      Alert.alert('Not Found', 'Vehicle not found in AKI database. Please enter details manually.');
    }
  };

  // Document Upload Functions
  const uploadDocument = async (documentType) => {
    try {
      // Request permissions
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please grant camera roll permissions to upload documents.');
          return;
        }
      }

      Alert.alert(
        'Upload Document',
        'Choose upload method',
        [
          { text: 'Camera', onPress: () => captureDocument(documentType) },
          { text: 'Gallery', onPress: () => pickDocument(documentType) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    }
  };

  const captureDocument = async (documentType) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadedDocuments(prev => ({
          ...prev,
          [documentType]: {
            uri: result.assets[0].uri,
            type: 'image',
            name: `${documentType}_${Date.now()}.jpg`
          }
        }));
        Alert.alert('Success', 'Document uploaded successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture document. Please try again.');
    }
  };

  const pickDocument = async (documentType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadedDocuments(prev => ({
          ...prev,
          [documentType]: {
            uri: result.assets[0].uri,
            type: result.assets[0].mimeType?.includes('pdf') ? 'pdf' : 'image',
            name: result.assets[0].name || `${documentType}_${Date.now()}.pdf`
          }
        }));
        Alert.alert('Success', 'Document uploaded successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  // M-PESA Payment Simulation
  const processMPesaPayment = async () => {
    if (!calculatedPremium || !formData.ownerPhone) {
      Alert.alert('Error', 'Please calculate premium and provide phone number first.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Simulate M-PESA STK push
      Alert.alert(
        'M-PESA Payment',
        `An STK push has been sent to ${formData.ownerPhone} for KES ${calculatedPremium.totalPremium.toLocaleString()}. Please enter your M-PESA PIN on your phone.`,
        [{ text: 'OK' }]
      );

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate successful payment (90% success rate)
      const paymentSuccess = Math.random() > 0.1;

      if (paymentSuccess) {
        const newPolicyNumber = `POL${Date.now().toString().slice(-8)}`;
        setPolicyNumber(newPolicyNumber);
        setPaymentCompleted(true);
        setCurrentStep(7); // Move to confirmation step
        
        Alert.alert(
          'Payment Successful!',
          `Your policy has been purchased successfully. Policy Number: ${newPolicyNumber}`,
          [{ text: 'View Receipt', onPress: () => {} }]
        );
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      Alert.alert(
        'Payment Failed',
        'Your M-PESA payment was not successful. Please try again or contact support.',
        [
          { text: 'Retry', onPress: () => processMPesaPayment() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Generate and share receipt
  const shareReceipt = async () => {
    if (!policyNumber || !calculatedPremium) return;

    const receiptText = `
PATABIMA INSURANCE RECEIPT
========================
Policy Number: ${policyNumber}
Vehicle: ${formData.make} ${formData.model}
Registration: ${formData.registrationNumber}
Owner: ${formData.ownerName}
Premium: KES ${calculatedPremium.totalPremium.toLocaleString()}
Date: ${new Date().toLocaleDateString()}
========================
Thank you for choosing PataBima!
    `;

    try {
      // In a real app, you would generate a PDF here
      Alert.alert(
        'Receipt',
        receiptText,
        [
          { text: 'Close' },
          { text: 'Share', onPress: () => {
            // Simulate sharing functionality
            Alert.alert('Share', 'Receipt sharing functionality would be implemented here.');
          }}
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate receipt.');
    }
  };

  // Update form data
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-calculate premium when key fields change and other required fields are filled
    if (field === 'insurer' || field === 'vehicleValue' || field === 'yearOfManufacture' || field === 'engineCapacity') {
      const updatedFormData = { ...formData, [field]: value };
      if (updatedFormData.insurer && updatedFormData.vehicleValue && selectedInsuranceProduct) {
        setTimeout(() => autoCalculatePremium(updatedFormData), 100);
      }
    }
  };

  // Auto Premium Calculation (triggers when insurer is selected)
  const autoCalculatePremium = (dataToUse = formData) => {
    if (!selectedInsuranceProduct || !dataToUse.vehicleValue || !dataToUse.insurer) {
      return;
    }

    const selectedInsurer = insurers.find(ins => ins.id === dataToUse.insurer);
    if (!selectedInsurer) return;

    // Set policy duration based on insurer
    setFormData(prev => ({
      ...prev,
      policyPeriod: selectedInsurer.policyDuration.toString()
    }));

    const vehicleValue = parseFloat(dataToUse.vehicleValue) || 0;
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - parseInt(dataToUse.yearOfManufacture || currentYear);
    
    // Use insurer's base rate instead of product base rate
    let premium = vehicleValue * (selectedInsurer.baseRate / 100);
    
    // Age factor
    if (vehicleAge > 10) premium *= 1.3;
    else if (vehicleAge > 5) premium *= 1.1;
    
    // Engine capacity factor
    const engineCC = parseInt(dataToUse.engineCapacity || 0);
    if (engineCC > 3000) premium *= 1.2;
    else if (engineCC > 2000) premium *= 1.1;
    
    // Claims history factor
    if (dataToUse.claimsHistory === 'Yes') premium *= 1.4;
    
    // Modifications factor
    if (dataToUse.modifications === 'Yes') premium *= 1.15;
    
    // Policy period factor (discount for longer periods)
    const periodMonths = selectedInsurer.policyDuration;
    if (periodMonths >= 12) premium *= 0.9; // 10% discount for annual
    else if (periodMonths >= 6) premium *= 0.95; // 5% discount for 6+ months
    
    // Minimum premiums by category
    const minimumPremiums = {
      'private': 15000,
      'commercial': 25000,
      'psv': 35000,
      'motorcycle': 8000,
      'tuktuk': 12000,
      'special': 20000
    };
    
    const minPremium = minimumPremiums[selectedVehicleCategory?.id] || 15000;
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
      vehicleType: selectedVehicleCategory?.name || 'Unknown',
      coverType: selectedInsuranceProduct?.name || 'Unknown',
      vehicleAge: vehicleAge,
      insurer: selectedInsurer.name,
      policyDuration: `${selectedInsurer.policyDuration} months`
    });
    
    setShowQuote(true);
  };

  // Enhanced Premium Calculation with more realistic factors
  const calculatePremium = () => {
    autoCalculatePremium();
  };

  // Quick test function to populate form with sample data
  const fillSampleData = () => {
    setSelectedVehicleCategory(vehicleCategories[0]); // Private
    setSelectedInsuranceProduct(insuranceProducts.private.comprehensive[0]); // Private Comprehensive
    setCurrentStep(6); // Go to payment step
    setFormData({
      registrationNumber: 'KCA123A',
      vehicleType: 'private_comprehensive',
      make: 'Toyota',
      model: 'Corolla',
      yearOfManufacture: '2020',
      engineCapacity: '1500',
      vehicleValue: '2500000',
      ownerName: 'John Kamau Mwangi',
      ownerIdNumber: '12345678',
      ownerPhone: '0712345678',
      ownerEmail: 'john.kamau@email.com',
      coverType: 'private_comprehensive',
      policyPeriod: '12',
      startDate: '01/01/2025',
      insurer: 'cic',
      previousInsurer: 'None',
      claimsHistory: 'No',
      modifications: 'No'
    });
    setVehicleVerified(true);
    setUploadedDocuments({
      id: { uri: 'mock_id.jpg', type: 'image', name: 'id_document.jpg' },
      logbook: { uri: 'mock_logbook.jpg', type: 'image', name: 'logbook.jpg' }
    });
  };

  // Date picker handlers
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || coverStartDate;
    setShowDatePicker(Platform.OS === 'ios');
    setCoverStartDate(currentDate);
    updateFormData('startDate', currentDate.toISOString().split('T')[0]);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };



  // Stepper Header Component - Now Clickable
  const renderStepper = () => (
    <View style={styles.stepperContainer}>
      {[1, 2, 3, 4, 5, 6, 7].map((step) => (
        <View key={step} style={styles.stepperItem}>
          <TouchableOpacity
            style={[
              styles.stepperCircle,
              currentStep >= step && styles.stepperCircleActive,
              currentStep === step && styles.stepperCircleCurrent,
              paymentCompleted && step === 7 && styles.stepperCircleComplete
            ]}
            onPress={() => goToStep(step)}
            disabled={step > currentStep && !isStepValid(currentStep)}
          >
            <Text style={[
              styles.stepperNumber,
              currentStep >= step && styles.stepperNumberActive,
              paymentCompleted && step === 7 && styles.stepperNumberComplete
            ]}>
              {paymentCompleted && step === 7 ? '✓' : step}
            </Text>
          </TouchableOpacity>
          {step < 7 && (
            <View style={[
              styles.stepperLine,
              currentStep > step && styles.stepperLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  // Step 1: Vehicle Category Selection
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Vehicle type</Text>
      
      <View style={styles.categoryGrid}>
        {vehicleCategories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => selectVehicleCategory(category)}
          >
            <View style={styles.categoryIconContainer}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Check Existing Cover Button */}
      <TouchableOpacity style={styles.existingCoverButton} onPress={checkExistingCover}>
        <View style={styles.existingCoverContent}>
          <View style={styles.existingCoverIcon}>
            <Text style={styles.existingCoverIconText}>🚗</Text>
          </View>
          <View style={styles.existingCoverTextContainer}>
            <Text style={styles.existingCoverTitle}>Check Vehicle For</Text>
            <Text style={styles.existingCoverSubtitle}>Existing Cover</Text>
          </View>
          <Text style={styles.existingCoverArrow}>→</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Step 2: Insurance Product Selection
  const renderStep2 = () => {
    if (!selectedVehicleCategory) return null;
    
    const products = insuranceProducts[selectedVehicleCategory.id];
    if (!products) return null;

    return (
      <View style={styles.stepContainer}>
        {/* Selected Vehicle Type */}
        <View style={styles.selectedVehicleContainer}>
          <View style={styles.selectedVehicleCard}>
            <View style={styles.selectedVehicleIcon}>
              <Text style={styles.selectedVehicleIconText}>{selectedVehicleCategory.icon}</Text>
            </View>
            <Text style={styles.selectedVehicleName}>{selectedVehicleCategory.name}</Text>
            <TouchableOpacity onPress={() => setCurrentStep(1)}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.stepTitle}>Select Insurance Product</Text>
        
        {/* Third Party Products */}
        {products.thirdParty && products.thirdParty.length > 0 && (
          <View style={styles.productSection}>
            <TouchableOpacity style={styles.productSectionHeader}>
              <Text style={styles.productSectionTitle}>
                Third Party ({products.thirdParty.length})
              </Text>
              <Text style={styles.productSectionArrow}>▲</Text>
            </TouchableOpacity>
            
            {products.thirdParty.map(product => (
              <TouchableOpacity
                key={product.id}
                style={styles.productItem}
                onPress={() => selectInsuranceProduct(product)}
              >
                <View style={styles.productIcon}>
                  <Text style={styles.productIconText}>{product.icon}</Text>
                </View>
                <Text style={styles.productName}>{product.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Comprehensive Products */}
        {products.comprehensive && products.comprehensive.length > 0 && (
          <View style={styles.productSection}>
            <TouchableOpacity style={styles.productSectionHeader}>
              <Text style={styles.productSectionTitle}>
                Comprehensive ({products.comprehensive.length})
              </Text>
              <Text style={styles.productSectionArrow}>▲</Text>
            </TouchableOpacity>
            
            {products.comprehensive.map(product => (
              <TouchableOpacity
                key={product.id}
                style={styles.productItem}
                onPress={() => selectInsuranceProduct(product)}
              >
                <View style={styles.productIcon}>
                  <Text style={styles.productIconText}>{product.icon}</Text>
                </View>
                <Text style={styles.productName}>{product.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Step 3: Policy Details Form
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Policy Details</Text>
      
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📋 Personal Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ID Number</Text>
          <TextInput
            style={styles.input}
            value={formData.ownerIdNumber}
            onChangeText={(value) => updateFormData('ownerIdNumber', value)}
            placeholder="Enter your ID number"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={formData.ownerName}
            onChangeText={(value) => updateFormData('ownerName', value)}
            placeholder="Enter full name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number (M-PESA)</Text>
          <TextInput
            style={styles.input}
            value={formData.ownerPhone}
            onChangeText={(value) => updateFormData('ownerPhone', value)}
            placeholder="0712345678"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.ownerEmail}
            onChangeText={(value) => updateFormData('ownerEmail', value)}
            placeholder="john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Cover Start Date</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerText}>
              {formatDate(coverStartDate)}
            </Text>
            <Text style={styles.datePickerIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={coverStartDate}
            mode="date"
            is24Hour={true}
            minimumDate={new Date()}
            onChange={onDateChange}
          />
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Select Insurer</Text>
          <View style={styles.insurerContainer}>
            {insurers.map(insurer => (
              <TouchableOpacity
                key={insurer.id}
                style={[
                  styles.insurerOption,
                  formData.insurer === insurer.id && styles.insurerOptionSelected
                ]}
                onPress={() => updateFormData('insurer', insurer.id)}
              >
                <View style={styles.insurerHeader}>
                  <Text style={styles.insurerLogo}>{insurer.logo}</Text>
                  <View style={styles.insurerInfo}>
                    <Text style={styles.insurerName}>{insurer.name}</Text>
                    <Text style={styles.insurerRating}>⭐ {insurer.rating}</Text>
                  </View>
                </View>
                <View style={styles.insurerDetails}>
                  <Text style={styles.insurerDetail}>Duration: {insurer.policyDuration} months</Text>
                  <Text style={styles.insurerDetail}>Rate: {insurer.baseRate}%</Text>
                  {formData.insurer === insurer.id && calculatedPremium && (
                    <Text style={styles.insurerPremium}>
                      Premium: KES {calculatedPremium.totalPremium.toLocaleString()}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={prevStep}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.continueButton, !isStep3Valid() && styles.disabledButton]}
          onPress={() => isStep3Valid() && nextStep()}
          disabled={!isStep3Valid()}
        >
          <Text style={styles.continueButtonText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const isStep3Valid = () => {
    return formData.ownerIdNumber && formData.ownerName && formData.ownerPhone && formData.insurer;
  };

  // Step 4: Vehicle Details Validation
  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Vehicle Details</Text>
      
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
            <Text style={styles.inputLabel}>Year of Manufacture</Text>
            <TextInput
              style={styles.input}
              value={formData.yearOfManufacture}
              onChangeText={(value) => updateFormData('yearOfManufacture', value)}
              placeholder="2020"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Engine Capacity (CC)</Text>
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

      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={prevStep}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.continueButton, !isStep4Valid() && styles.disabledButton]}
          onPress={() => isStep4Valid() && nextStep()}
          disabled={!isStep4Valid()}
        >
          <Text style={styles.continueButtonText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step 5: KYC Documents Upload
  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Upload Documents</Text>
      
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📄 Required Documents</Text>
        <Text style={styles.sectionSubtitle}>
          Upload clear, readable copies of the following documents
        </Text>
        
        <View style={styles.documentItem}>
          <Text style={styles.documentIcon}>🆔</Text>
          <View style={styles.documentInfo}>
            <Text style={styles.documentName}>National ID Copy</Text>
            <Text style={styles.documentStatus}>
              {uploadedDocuments.id ? '✓ Uploaded' : 'Required'}
            </Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.uploadButton,
              uploadedDocuments.id && styles.uploadButtonUploaded
            ]}
            onPress={() => uploadDocument('id')}
          >
            <Text style={[
              styles.uploadButtonText,
              uploadedDocuments.id && styles.uploadButtonTextUploaded
            ]}>
              {uploadedDocuments.id ? 'Replace' : 'Upload'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.documentItem}>
          <Text style={styles.documentIcon}>📋</Text>
          <View style={styles.documentInfo}>
            <Text style={styles.documentName}>Vehicle Logbook</Text>
            <Text style={styles.documentStatus}>
              {uploadedDocuments.logbook ? '✓ Uploaded' : 'Required'}
            </Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.uploadButton,
              uploadedDocuments.logbook && styles.uploadButtonUploaded
            ]}
            onPress={() => uploadDocument('logbook')}
          >
            <Text style={[
              styles.uploadButtonText,
              uploadedDocuments.logbook && styles.uploadButtonTextUploaded
            ]}>
              {uploadedDocuments.logbook ? 'Replace' : 'Upload'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.documentItem}>
          <Text style={styles.documentIcon}>🧾</Text>
          <View style={styles.documentInfo}>
            <Text style={styles.documentName}>KRA PIN Certificate</Text>
            <Text style={styles.documentStatus}>
              {uploadedDocuments.kraPin ? '✓ Uploaded' : 'Optional'}
            </Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.uploadButton,
              uploadedDocuments.kraPin && styles.uploadButtonUploaded
            ]}
            onPress={() => uploadDocument('kraPin')}
          >
            <Text style={[
              styles.uploadButtonText,
              uploadedDocuments.kraPin && styles.uploadButtonTextUploaded
            ]}>
              {uploadedDocuments.kraPin ? 'Replace' : 'Upload'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={prevStep}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={nextStep}
        >
          <Text style={styles.continueButtonText}>Continue to Payment →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step 6: Payment
  const renderStep6 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Premium & Payment</Text>
      
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📊 Policy Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Vehicle:</Text>
          <Text style={styles.summaryValue}>{formData.make} {formData.model}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Registration:</Text>
          <Text style={styles.summaryValue}>{formData.registrationNumber}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Coverage:</Text>
          <Text style={styles.summaryValue}>{selectedInsuranceProduct?.name}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Insurer:</Text>
          <Text style={styles.summaryValue}>{insurers.find(ins => ins.id === formData.insurer)?.name}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration:</Text>
          <Text style={styles.summaryValue}>{formData.policyPeriod} months</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Owner:</Text>
          <Text style={styles.summaryValue}>{formData.ownerName}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment Phone:</Text>
          <Text style={styles.summaryValue}>{formData.ownerPhone}</Text>
        </View>
      </View>

      {calculatedPremium ? (
        <View>
          <View style={styles.premiumCard}>
            <Text style={styles.premiumTitle}>💰 Premium Breakdown</Text>
            <View style={styles.premiumRow}>
              <Text style={styles.premiumLabel}>Basic Premium:</Text>
              <Text style={styles.premiumValue}>KES {calculatedPremium.basicPremium.toLocaleString()}</Text>
            </View>
            <View style={styles.premiumRow}>
              <Text style={styles.premiumLabel}>Levies & Fees:</Text>
              <Text style={styles.premiumValue}>KES {calculatedPremium.levies.toLocaleString()}</Text>
            </View>
            <View style={styles.divider} />
            <View style={[styles.premiumRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Premium:</Text>
              <Text style={styles.totalValue}>KES {calculatedPremium.totalPremium.toLocaleString()}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.payButton, isProcessingPayment && styles.disabledButton]}
            onPress={processMPesaPayment}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              <View style={styles.payButtonContent}>
                <ActivityIndicator size="small" color={Colors.background} />
                <Text style={styles.payButtonText}>Processing Payment...</Text>
              </View>
            ) : (
              <Text style={styles.payButtonText}>Pay with M-PESA</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.premiumPlaceholder}>
          <Text style={styles.premiumPlaceholderText}>
            Premium will be calculated automatically when you select an insurer and fill in vehicle details.
          </Text>
        </View>
      )}

      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={prevStep}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step 7: Confirmation & Receipt
  const renderStep7 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>🎉</Text>
        <Text style={styles.successTitle}>Policy Purchased Successfully!</Text>
        <Text style={styles.successSubtitle}>
          Your motor vehicle insurance policy is now active
        </Text>

        <View style={styles.policyCard}>
          <Text style={styles.policyCardTitle}>📋 Policy Details</Text>
          
          <View style={styles.policyRow}>
            <Text style={styles.policyLabel}>Policy Number:</Text>
            <Text style={styles.policyValue}>{policyNumber}</Text>
          </View>
          
          <View style={styles.policyRow}>
            <Text style={styles.policyLabel}>Vehicle:</Text>
            <Text style={styles.policyValue}>{formData.make} {formData.model}</Text>
          </View>
          
          <View style={styles.policyRow}>
            <Text style={styles.policyLabel}>Registration:</Text>
            <Text style={styles.policyValue}>{formData.registrationNumber}</Text>
          </View>
          
          <View style={styles.policyRow}>
            <Text style={styles.policyLabel}>Coverage:</Text>
            <Text style={styles.policyValue}>{selectedInsuranceProduct?.name}</Text>
          </View>
          
          <View style={styles.policyRow}>
            <Text style={styles.policyLabel}>Insurer:</Text>
            <Text style={styles.policyValue}>{insurers.find(ins => ins.id === formData.insurer)?.name}</Text>
          </View>
          
          <View style={styles.policyRow}>
            <Text style={styles.policyLabel}>Premium Paid:</Text>
            <Text style={styles.policyValue}>KES {calculatedPremium?.totalPremium.toLocaleString()}</Text>
          </View>
          
          <View style={styles.policyRow}>
            <Text style={styles.policyLabel}>Start Date:</Text>
            <Text style={styles.policyValue}>{formData.startDate || new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.receiptButton}
            onPress={shareReceipt}
          >
            <Text style={styles.receiptButtonText}>📄 View Receipt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.homeButtonText}>🏠 Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const isStep4Valid = () => {
    return formData.registrationNumber && formData.make && formData.model && formData.vehicleValue;
  };

  const isStep6Valid = () => {
    return formData.registrationNumber && formData.make && formData.model && 
           formData.vehicleValue && formData.ownerName && formData.ownerPhone && formData.insurer;
  };

  const renderFormContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      case 7:
        return renderStep7();
      default:
        return renderStep1();
    }
  };
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
          <Text style={styles.headerBackIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Vehicle Insurance</Text>
          {currentStep > 1 && selectedVehicleCategory && (
            <Text style={styles.headerSubtitle}>{selectedVehicleCategory.name}</Text>
          )}
        </View>
        <TouchableOpacity onPress={fillSampleData} style={styles.testButton}>
          <Text style={styles.testButtonText}>Test</Text>
        </TouchableOpacity>
      </View>

      {/* Stepper */}
      {renderStepper()}

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
      >
        {renderFormContent()}
      </ScrollView>

      {renderQuoteModal()}
    </View>
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
  headerBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackIcon: {
    fontSize: 24,
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
    borderRadius: 16,
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
  
  // Date Picker Styles
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FAFBFC',
  },
  datePickerText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  datePickerIcon: {
    fontSize: 18,
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

  // Stepper Styles
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  stepperItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F3F4',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCircleActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  stepperCircleCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepperNumber: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: '#9E9E9E',
  },
  stepperNumberActive: {
    color: Colors.background,
  },
  stepperLine: {
    width: 24,
    height: 2,
    backgroundColor: '#E9ECEF',
    marginHorizontal: 4,
  },
  stepperLineActive: {
    backgroundColor: Colors.primary,
  },
  
  // Step Container
  stepContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  stepTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  
  // Category Grid (Step 1)
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FAFBFC',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  
  // Existing Cover Button
  existingCoverButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  existingCoverContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  existingCoverIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  existingCoverIconText: {
    fontSize: 20,
  },
  existingCoverTextContainer: {
    flex: 1,
  },
  existingCoverTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.background,
  },
  existingCoverSubtitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.background,
    opacity: 0.9,
  },
  existingCoverArrow: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.background,
  },
  
  // Selected Vehicle (Step 2)
  selectedVehicleContainer: {
    marginBottom: Spacing.lg,
  },
  selectedVehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.md,
  },
  selectedVehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  selectedVehicleIconText: {
    fontSize: 20,
  },
  selectedVehicleName: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  changeText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  
  // Product Section (Step 2)
  productSection: {
    marginBottom: Spacing.lg,
  },
  productSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    marginBottom: Spacing.md,
  },
  productSectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  productSectionArrow: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  productIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  productIconText: {
    fontSize: 20,
  },
  productName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  
  // Policy Duration (Step 3)
  durationContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  durationOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
  },
  durationOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  durationText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  durationTextSelected: {
    color: Colors.primary,
  },
  
  // Insurer Selection (Step 3)
  insurerContainer: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  insurerOption: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    backgroundColor: '#FAFBFC',
  },
  insurerOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  insurerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  insurerLogo: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  insurerInfo: {
    flex: 1,
  },
  insurerName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  insurerRating: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  insurerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  insurerDetail: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  insurerPremium: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  
  // Continue Button
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  continueButtonText: {
    color: Colors.background,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
  },
  
  // Document Upload (Step 5)
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  documentIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  documentStatus: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  uploadButton: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  uploadButtonText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  
  // Summary (Step 6)
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },

  // Navigation Buttons
  navigationButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  backButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  backButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
  },

  // Premium Card (Step 6)
  premiumCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: Spacing.lg,
    marginVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  premiumTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },

  // Pay Button
  payButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  payButtonText: {
    color: Colors.background,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.5,
  },

  // Document Upload Enhanced Styles
  uploadButtonUploaded: {
    backgroundColor: '#D4F6D4',
  },
  uploadButtonTextUploaded: {
    color: '#2D7D32',
  },

  // Stepper Enhanced Styles
  stepperCircleComplete: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stepperNumberComplete: {
    color: Colors.background,
    fontSize: Typography.fontSize.sm,
  },

  // Step 7: Success Styles
  successContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  successIcon: {
    fontSize: 60,
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  policyCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: Spacing.lg,
    width: '100%',
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  policyCardTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  policyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  policyLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    flex: 1,
  },
  policyValue: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  actionButtons: {
    width: '100%',
    gap: Spacing.md,
  },
  receiptButton: {
    backgroundColor: Colors.backgroundGray,
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  receiptButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },
  homeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  homeButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.background,
  },

  // Premium Placeholder Styles
  premiumPlaceholder: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
    alignItems: 'center',
  },
  premiumPlaceholderText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
