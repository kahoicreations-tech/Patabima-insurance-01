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
    { id: 'private_suv', name: 'Private SUV/4WD', category: 'Private', baseRate: 4.0, description: 'Private SUVs and 4WD vehicles' },
    { id: 'private_pickup', name: 'Private Pickup', category: 'Private', baseRate: 3.8, description: 'Private pickup trucks' },
    
    // Commercial Vehicles
    { id: 'commercial_car', name: 'Commercial Car', category: 'Commercial', baseRate: 4.5, description: 'Commercial use cars' },
    { id: 'commercial_van', name: 'Commercial Van', category: 'Commercial', baseRate: 5.0, description: 'Delivery vans and commercial vehicles' },
    { id: 'commercial_truck', name: 'Commercial Truck', category: 'Commercial', baseRate: 5.5, description: 'Commercial trucks and lorries' },
    { id: 'commercial_trailer', name: 'Commercial Trailer', category: 'Commercial', baseRate: 2.5, description: 'Commercial trailers' },
    
    // Public Service Vehicles (PSV)
    { id: 'matatu', name: 'Matatu (14-25 seats)', category: 'PSV', baseRate: 6.0, description: '14-25 seater matatus' },
    { id: 'matatu_large', name: 'Matatu (26+ seats)', category: 'PSV', baseRate: 6.5, description: '26+ seater matatus' },
    { id: 'bus_small', name: 'Small Bus (26-33 seats)', category: 'PSV', baseRate: 7.0, description: 'Small buses' },
    { id: 'bus_medium', name: 'Medium Bus (34-49 seats)', category: 'PSV', baseRate: 7.5, description: 'Medium buses' },
    { id: 'bus_large', name: 'Large Bus (50+ seats)', category: 'PSV', baseRate: 8.0, description: 'Large buses' },
    { id: 'school_bus', name: 'School Bus', category: 'PSV', baseRate: 6.8, description: 'School transportation buses' },
    
    // Taxis and Ride-sharing
    { id: 'taxi_regular', name: 'Regular Taxi', category: 'Taxi', baseRate: 5.0, description: 'Regular taxi services' },
    { id: 'taxi_uber', name: 'Uber/Bolt Vehicle', category: 'Taxi', baseRate: 4.8, description: 'Ride-sharing vehicles' },
    { id: 'taxi_cab', name: 'Taxi Cab', category: 'Taxi', baseRate: 5.2, description: 'Licensed taxi cabs' },
    
    // Motorcycles
    { id: 'motorcycle_private', name: 'Private Motorcycle', category: 'Motorcycle', baseRate: 2.8, description: 'Private motorcycles' },
    { id: 'motorcycle_commercial', name: 'Boda Boda', category: 'Motorcycle', baseRate: 4.5, description: 'Commercial motorcycles (boda boda)' },
    { id: 'motorcycle_delivery', name: 'Delivery Motorcycle', category: 'Motorcycle', baseRate: 4.2, description: 'Delivery service motorcycles' },
    
    // Special Vehicles
    { id: 'tractor', name: 'Tractor', category: 'Agricultural', baseRate: 3.0, description: 'Agricultural tractors' },
    { id: 'earth_mover', name: 'Earth Mover', category: 'Construction', baseRate: 5.8, description: 'Construction earth movers' },
    { id: 'crane', name: 'Crane/Heavy Machinery', category: 'Construction', baseRate: 6.2, description: 'Cranes and heavy machinery' },
    { id: 'ambulance', name: 'Ambulance', category: 'Emergency', baseRate: 4.5, description: 'Medical emergency vehicles' },
    { id: 'fire_truck', name: 'Fire Truck', category: 'Emergency', baseRate: 5.0, description: 'Fire service vehicles' }
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
        chassisNumber: 'JT2BF28K2Y0123456',
        bodyType: 'Sedan',
        fuelType: 'Petrol'
      },
      'KBZ456B': {
        make: 'Nissan',
        model: 'X-Trail',
        yearOfManufacture: '2019',
        engineCapacity: '2000',
        vehicleValue: '3200000',
        ownerName: 'Mary Wanjiku Njoroge',
        chassisNumber: 'JN1TBNT32Z0456789',
        bodyType: 'SUV',
        fuelType: 'Petrol'
      },
      'KCB789C': {
        make: 'Isuzu',
        model: 'D-Max',
        yearOfManufacture: '2021',
        engineCapacity: '2500',
        vehicleValue: '4200000',
        ownerName: 'Peter Kiprotich Ruto',
        chassisNumber: 'MPADD23B2J0789012',
        bodyType: 'Pickup',
        fuelType: 'Diesel'
      },
      'KBA111D': {
        make: 'Honda',
        model: 'Fit',
        yearOfManufacture: '2018',
        engineCapacity: '1300',
        vehicleValue: '1800000',
        ownerName: 'Grace Achieng Odhiambo',
        chassisNumber: 'JHMGD18658S111222',
        bodyType: 'Hatchback',
        fuelType: 'Petrol'
      },
      'KCC222E': {
        make: 'Mitsubishi',
        model: 'Canter',
        yearOfManufacture: '2020',
        engineCapacity: '3000',
        vehicleValue: '3800000',
        ownerName: 'Samuel Gitonga Mwangi',
        chassisNumber: 'MK629FD2A0M222333',
        bodyType: 'Truck',
        fuelType: 'Diesel'
      },
      'KBD333F': {
        make: 'Suzuki',
        model: 'Alto',
        yearOfManufacture: '2019',
        engineCapacity: '800',
        vehicleValue: '1200000',
        ownerName: 'Faith Nyambura Kariuki',
        chassisNumber: 'MR412F2A2K0333444',
        bodyType: 'Hatchback',
        fuelType: 'Petrol'
      }
    };

    const vehicleData = mockVehicleDatabase[regNumber.toUpperCase()];
    
    if (vehicleData) {
      setFormData(prev => ({
        ...prev,
        ...vehicleData,
        registrationNumber: regNumber.toUpperCase()
      }));
      setVehicleVerified(true);
      Alert.alert(
        'Vehicle Found', 
        `Successfully retrieved details for ${vehicleData.make} ${vehicleData.model} owned by ${vehicleData.ownerName}`,
        [{ text: 'OK', onPress: () => console.log('Vehicle verified') }]
      );
    } else {
      // Simulate random success/failure for unknown vehicles
      const shouldSucceed = Math.random() > 0.7; // 30% success rate for unknown vehicles
      
      if (shouldSucceed) {
        // Generate random vehicle data
        const randomMakes = ['Toyota', 'Nissan', 'Honda', 'Suzuki', 'Mitsubishi', 'Isuzu', 'Subaru'];
        const randomModels = ['Corolla', 'Vitz', 'Fielder', 'March', 'Note', 'Fit', 'Demio', 'Harrier'];
        const randomMake = randomMakes[Math.floor(Math.random() * randomMakes.length)];
        const randomModel = randomModels[Math.floor(Math.random() * randomModels.length)];
        const randomYear = 2015 + Math.floor(Math.random() * 8);
        const randomValue = 1000000 + Math.floor(Math.random() * 3000000);
        
        const generatedData = {
          make: randomMake,
          model: randomModel,
          yearOfManufacture: randomYear.toString(),
          engineCapacity: '1500',
          vehicleValue: randomValue.toString(),
          ownerName: 'Vehicle Owner',
          chassisNumber: `AUTO${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          bodyType: 'Sedan',
          fuelType: 'Petrol'
        };
        
        setFormData(prev => ({
          ...prev,
          ...generatedData,
          registrationNumber: regNumber.toUpperCase()
        }));
        setVehicleVerified(true);
        Alert.alert('Vehicle Found', `Retrieved details for ${randomMake} ${randomModel}. Please verify the information is correct.`);
      } else {
        Alert.alert(
          'Vehicle Not Found', 
          'Vehicle registration not found in AKI database. You can proceed to enter vehicle details manually.',
          [
            { text: 'OK', onPress: () => console.log('Manual entry') },
            { text: 'Try Again', onPress: () => setFormData(prev => ({ ...prev, registrationNumber: '' })) }
          ]
        );
      }
    }
    
    setIsVerifying(false);
  };

  // Enhanced Premium Calculation with multiple factors
  const calculatePremium = () => {
    const vehicleType = vehicleTypes.find(vt => vt.id === formData.vehicleType);
    const coverType = coverTypes.find(ct => ct.id === formData.coverType);
    
    if (!vehicleType || !coverType || !formData.vehicleValue) {
      Alert.alert('Error', 'Please fill all required fields to calculate premium');
      return;
    }

    const vehicleValue = parseFloat(formData.vehicleValue);
    if (vehicleValue < 100000) {
      Alert.alert('Error', 'Vehicle value must be at least KES 100,000');
      return;
    }

    const baseRate = vehicleType.baseRate / 100; // Convert percentage to decimal
    const coverMultiplier = coverType.multiplier;
    
    // Basic calculation: Vehicle Value * Base Rate * Cover Multiplier
    let premium = vehicleValue * baseRate * coverMultiplier;
    
    // Apply vehicle age factor
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - parseInt(formData.yearOfManufacture);
    
    if (vehicleAge > 15) {
      premium *= 0.85; // 15% discount for very old vehicles
    } else if (vehicleAge > 10) {
      premium *= 0.90; // 10% discount for old vehicles
    } else if (vehicleAge > 5) {
      premium *= 0.95; // 5% discount for moderately old vehicles
    } else if (vehicleAge < 1) {
      premium *= 1.05; // 5% loading for brand new vehicles
    }
    
    // Apply engine capacity factor
    const engineCC = parseInt(formData.engineCapacity);
    if (engineCC > 3000) {
      premium *= 1.15; // 15% loading for high-performance vehicles
    } else if (engineCC > 2000) {
      premium *= 1.10; // 10% loading for large engines
    } else if (engineCC < 1000) {
      premium *= 0.90; // 10% discount for small engines
    }
    
    // Apply vehicle category specific factors
    switch (vehicleType.category) {
      case 'PSV':
        premium *= 1.25; // 25% loading for public service vehicles
        break;
      case 'Commercial':
        premium *= 1.15; // 15% loading for commercial vehicles
        break;
      case 'Taxi':
        premium *= 1.20; // 20% loading for taxi services
        break;
      case 'Motorcycle':
        // Motorcycle specific calculations
        if (vehicleType.id === 'motorcycle_commercial') {
          premium *= 1.30; // 30% loading for boda boda
        }
        break;
      case 'Construction':
      case 'Agricultural':
        premium *= 1.10; // 10% loading for specialized vehicles
        break;
    }
    
    // Apply claims history factor
    if (formData.claimsHistory === 'Yes') {
      premium *= 1.25; // 25% loading for previous claims
    } else if (formData.claimsHistory === 'No') {
      premium *= 0.95; // 5% no-claims discount
    }
    
    // Apply modifications factor
    if (formData.modifications === 'Yes') {
      premium *= 1.15; // 15% loading for modifications
    }
    
    // Apply policy period factor
    const policyMonths = parseInt(formData.policyPeriod);
    if (policyMonths < 12) {
      premium *= (policyMonths / 12) * 1.1; // Short term loading
    }
    
    // Minimum premium thresholds
    const minimumPremiums = {
      'Private': 15000,
      'Commercial': 25000,
      'PSV': 40000,
      'Taxi': 30000,
      'Motorcycle': 8000,
      'Construction': 35000,
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
      startDate: new Date().toISOString().split('T')[0],
      previousInsurer: 'None',
      claimsHistory: 'No',
      modifications: 'No'
    });
    setVehicleVerified(true);
    Alert.alert('Sample Data Loaded', 'Form has been filled with sample data for testing.');
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderFormContent = () => (
    <View style={styles.formContainer}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.formTitle}>Motor Vehicle Insurance</Text>
        <Text style={styles.formSubtitle}>Get your vehicle insured with PataBima</Text>
      </View>

      {/* Vehicle Registration with AKI Lookup */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Vehicle Registration</Text>
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
        <Text style={styles.sectionTitle}>Vehicle Type</Text>
        <Text style={styles.sectionSubtitle}>Select your vehicle category</Text>
        <View style={styles.vehicleTypeGrid}>
          {vehicleTypes.slice(0, 6).map(type => (
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
        {vehicleTypes.length > 6 && (
          <TouchableOpacity style={styles.showMoreButton}>
            <Text style={styles.showMoreText}>Show More Options →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Vehicle Details */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Vehicle Details</Text>
        
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
        <Text style={styles.sectionTitle}>Coverage Type</Text>
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
              <View>
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
              ]} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Owner Information */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Owner Information</Text>
        
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
            <Text style={styles.inputLabel}>Phone</Text>
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
          <Text style={styles.inputLabel}>Email (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.ownerEmail}
            onChangeText={(value) => updateFormData('ownerEmail', value)}
            placeholder="john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Additional Information */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        
        <View style={styles.inputRow}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Claims History</Text>
            <View style={styles.toggleGroup}>
              {['Yes', 'No'].map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.toggleOption,
                    formData.claimsHistory === option && styles.toggleOptionSelected
                  ]}
                  onPress={() => updateFormData('claimsHistory', option)}
                >
                  <Text style={[
                    styles.toggleText,
                    formData.claimsHistory === option && styles.toggleTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Modifications</Text>
            <View style={styles.toggleGroup}>
              {['Yes', 'No'].map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.toggleOption,
                    formData.modifications === option && styles.toggleOptionSelected
                  ]}
                  onPress={() => updateFormData('modifications', option)}
                >
                  <Text style={[
                    styles.toggleText,
                    formData.modifications === option && styles.toggleTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Calculate Premium Button */}
      <TouchableOpacity
        style={[
          styles.calculatePremiumButton,
          (!formData.vehicleType || !formData.coverType || !formData.vehicleValue) && styles.disabledButton
        ]}
        onPress={calculatePremium}
        disabled={!formData.vehicleType || !formData.coverType || !formData.vehicleValue}
      >
        <Text style={styles.calculateButtonText}>Calculate Premium</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuoteModal = () => (
    <Modal
      visible={showQuote}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <View style={styles.quoteModal}>
            <Text style={styles.quoteTitle}>Motor Insurance Quote</Text>
            
            {/* Vehicle Summary */}
            <View style={styles.quoteSection}>
              <Text style={styles.quoteSectionTitle}>Vehicle Details</Text>
              <Text style={styles.quoteText}>{formData.make} {formData.model} ({formData.yearOfManufacture})</Text>
              <Text style={styles.quoteText}>Registration: {formData.registrationNumber}</Text>
              <Text style={styles.quoteText}>Value: KES {parseInt(formData.vehicleValue).toLocaleString()}</Text>
              {calculatedPremium && (
                <>
                  <Text style={styles.quoteText}>Vehicle Type: {calculatedPremium.vehicleType}</Text>
                  <Text style={styles.quoteText}>Vehicle Age: {calculatedPremium.vehicleAge} years</Text>
                </>
              )}
            </View>

            {/* Coverage Summary */}
            <View style={styles.quoteSection}>
              <Text style={styles.quoteSectionTitle}>Coverage Details</Text>
              <Text style={styles.quoteText}>
                {calculatedPremium?.coverType || 'Not selected'}
              </Text>
              <Text style={styles.quoteText}>Policy Period: {formData.policyPeriod} months</Text>
              <Text style={styles.quoteText}>Owner: {formData.ownerName}</Text>
            </View>

            {/* Enhanced Premium Breakdown */}
            {calculatedPremium && (
              <View style={styles.premiumBreakdown}>
                <Text style={styles.quoteSectionTitle}>Premium Breakdown</Text>
                
                <View style={styles.premiumRow}>
                  <Text style={styles.premiumLabel}>Basic Premium:</Text>
                  <Text style={styles.premiumValue}>KES {calculatedPremium.basicPremium.toLocaleString()}</Text>
                </View>
                
                <Text style={styles.subSectionTitle}>Statutory Fees & Levies:</Text>
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
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
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
  showMoreButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
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
    flex: 1,
    marginRight: Spacing.md,
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
    elevation: 3,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  regInputContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
    backgroundColor: Colors.backgroundLight,
  },
  akiButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
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
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    color: Colors.background,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  vehicleTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  vehicleTypeCard: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.sm,
    width: '48%',
    alignItems: 'center',
  },
  selectedVehicleType: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  vehicleTypeName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedVehicleTypeName: {
    color: Colors.primary,
  },
  vehicleTypeRate: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  showMoreButton: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  showMoreText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  coverageOption: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.backgroundLight,
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
  coverageName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  selectedCoverageName: {
    color: Colors.primary,
  },
  coverageDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: Spacing.md,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundGray,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
  },
  toggleOptionSelected: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  toggleTextSelected: {
    color: Colors.background,
  },
  calculatePremiumButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: Colors.backgroundGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  calculateButtonText: {
    color: Colors.background,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
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
    marginBottom: Spacing.md,
  },
  quoteSectionTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  quoteText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  premiumBreakdown: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
    padding: Spacing.md,
    marginVertical: Spacing.md,
  },
  premiumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  premiumLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  premiumValue: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  // Enhanced Premium Breakdown Styles
  subSectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
    marginTop: Spacing.xs,
  },
  totalLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  quoteActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  closeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
  },
});
