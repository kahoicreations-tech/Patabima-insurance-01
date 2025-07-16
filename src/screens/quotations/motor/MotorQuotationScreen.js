import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../../../constants';
import { StepIndicator, FormNavigation } from '../components';
import {
  useMotorInsuranceForm,
  useStepperNavigation,
  useVehicleVerification,
  usePremiumCalculation,
  useDocumentUpload
} from '../../../hooks';

import {
  VehicleCategorySelection,
  InsuranceProductSelection,
  VehicleRegistrationVerification,
  VehicleDetailsForm,
  OwnerInformationForm,
  PaymentAndConfirmation,
  PolicyDetailsView,
  CoverageDetailsView,
  ReceiptView,
  PaymentMethodSelection,
  PaymentProcessingView
} from './components';

// Import vehicle categories and insurance products data
import { vehicleCategories, insuranceProducts } from './data';

export default function MotorQuotationScreen({ navigation }) {
  // Safe area insets for proper padding
  const insets = useSafeAreaInsets();
  
  // State for vehicle category and insurance product selection
  const [selectedVehicleCategory, setSelectedVehicleCategory] = useState(null);
  const [selectedInsuranceProduct, setSelectedInsuranceProduct] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [policyNumber, setPolicyNumber] = useState(null);
  
  // New state variables for the enhanced flow
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null); // null, 'processing', 'completed', 'failed'
  const [policyDetails, setPolicyDetails] = useState(null);
  
  // Use custom hooks for better organization and reusability
  const {
    formData,
    errors,
    touched,
    handleChange,
    validateForm,
    setFormData,
    hasErrors,
    validateStep,
  } = useMotorInsuranceForm();
  
  // Stepper navigation hook
  const {
    currentStep,
    totalSteps,
    goToNextStep,
    goToPrevStep,
    goToStep,
    resetSteps,
    progress,
    isFirstStep,
    isLastStep
  } = useStepperNavigation(8, validateStep); // Using 8 steps for the enhanced motor insurance flow
  
  // Vehicle verification hook
  const {
    isVerifying,
    vehicleVerified,
    verifyVehicle
  } = useVehicleVerification(setFormData);
  
  // Premium calculation hook
  const {
    calculatedPremium,
    showQuote,
    setShowQuote,
    updatePremium,
    usageTypes,
    insuranceDurations,
    insurers
  } = usePremiumCalculation(selectedVehicleCategory, selectedInsuranceProduct);
  
  // Document upload hook
  const {
    uploadedDocuments,
    uploadDocument
  } = useDocumentUpload();

  // Handle step press for navigation
  const handleStepPress = (step) => {
    // Only allow navigation to steps that have been reached or completed
    if (step <= currentStep) {
      goToStep(step);
    }
  };

  // Handle vehicle category selection
  const handleVehicleCategorySelect = (category) => {
    setSelectedVehicleCategory(category);
    setSelectedInsuranceProduct(null); // Reset product when category changes
    goToNextStep();
  };

  // Handle insurance product selection
  const handleProductSelect = (product) => {
    setSelectedInsuranceProduct(product);
    setFormData(prev => ({
      ...prev,
      coverType: product.id
    }));
    goToNextStep();
  };

  // Handle form updates
  const updateFormData = (field, value) => {
    handleChange(field, value, updatePremium);
  };

  // Calculate premium
  const calculatePremium = () => {
    updatePremium(formData);
    setShowQuote(true);
  };

  // Process payment
  const processPayment = () => {
    setIsProcessingPayment(true);
    setPaymentStatus('processing');
    
    // Navigate to payment processing step
    goToNextStep();
  };
  
  // Handle payment method selection
  const handlePaymentMethodSelection = (method) => {
    setSelectedPaymentMethod(method);
    goToNextStep();
  };
  
  // Handle payment completion
  const handlePaymentComplete = (result) => {
    const newPolicyNumber = result.policyNumber || `PB-${Math.floor(100000 + Math.random() * 900000)}-${new Date().getTime().toString().slice(-4)}`;
    setPolicyNumber(newPolicyNumber);
    setPaymentCompleted(true);
    setIsProcessingPayment(false);
    setPaymentStatus('completed');
    
    // Set policy details
    setPolicyDetails({
      policyNumber: newPolicyNumber,
      transactionId: result.transactionId || `TRX${Math.floor(100000 + Math.random() * 900000)}`,
      insurer: formData.insurer,
      startDate: formData.startDate || new Date().toISOString(),
      endDate: formData.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
    });
  };
  
  // Handle returning home
  const handleGoHome = () => {
    navigation.navigate('Home');
  };
  
  // Handle download receipt
  const handleDownloadReceipt = () => {
    // In a real app, this would trigger a PDF download
    alert('Receipt download functionality will be implemented.');
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <VehicleCategorySelection
            categories={vehicleCategories}
            selectedCategory={selectedVehicleCategory}
            onSelectCategory={handleVehicleCategorySelect}
          />
        );
      case 2:
        return (
          <InsuranceProductSelection
            products={insuranceProducts}
            selectedCategory={selectedVehicleCategory}
            selectedProduct={selectedInsuranceProduct}
            onSelectProduct={handleProductSelect}
          />
        );
      case 3:
        return (
          <>
            <VehicleRegistrationVerification
              registrationNumber={formData.registrationNumber}
              onChangeRegistration={(value) => updateFormData('registrationNumber', value)}
              onVerify={verifyVehicle}
              isVerifying={isVerifying}
              isVerified={vehicleVerified}
            />
            {vehicleVerified && (
              <VehicleDetailsForm
                formData={formData}
                onUpdateFormData={updateFormData}
                usageTypes={usageTypes}
              />
            )}
          </>
        );
      case 4:
        return (
          <OwnerInformationForm
            formData={formData}
            onUpdateFormData={updateFormData}
          />
        );
      case 5:
        return (
          <PolicyDetailsView
            formData={formData}
            calculatedPremium={calculatedPremium}
            insurers={insurers}
            insuranceDurations={insuranceDurations}
            onUpdateFormData={updateFormData}
            onCalculatePremium={calculatePremium}
            showQuote={showQuote}
          />
        );
      case 6:
        return (
          <CoverageDetailsView
            formData={formData}
            calculatedPremium={calculatedPremium}
            selectedVehicleCategory={selectedVehicleCategory}
            selectedProduct={selectedInsuranceProduct}
            onUpdateFormData={updateFormData}
            onProceedToPayment={() => goToNextStep()}
          />
        );
      case 7:
        return (
          <PaymentMethodSelection
            premium={calculatedPremium}
            onSelectPaymentMethod={handlePaymentMethodSelection}
            onBack={goToPrevStep}
          />
        );
      case 8:
        return (
          <PaymentProcessingView
            premium={calculatedPremium}
            paymentMethod={selectedPaymentMethod}
            policyDetails={policyDetails}
            onPaymentComplete={handlePaymentComplete}
            onBack={goToPrevStep}
            onDownloadReceipt={handleDownloadReceipt}
            onGoHome={handleGoHome}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom }
      ]}
    >
      <StatusBar style="auto" />
      
      {/* Step Indicator */}
      <StepIndicator 
        currentStep={currentStep} 
        totalSteps={totalSteps}
        onStepPress={handleStepPress}
        paymentCompleted={paymentCompleted}
      />
      
      {/* Main Content */}
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderStepContent()}
        </ScrollView>
      </View>
      
      {/* Navigation Buttons - Only show for steps 1-6 */}
      {currentStep < 7 && (
        <FormNavigation
          onBack={goToPrevStep}
          onContinue={
            currentStep === 5 && !showQuote ? calculatePremium :
            currentStep === 6 ? processPayment : 
            goToNextStep
          }
          isFirstStep={isFirstStep}
          isLastStep={false} // We're never on the last step with this navigation component
          continueDisabled={
            (currentStep === 1 && !selectedVehicleCategory) ||
            (currentStep === 2 && !selectedInsuranceProduct) ||
            (currentStep === 3 && (!formData.registrationNumber || !vehicleVerified)) ||
            (currentStep === 4 && (
              !formData.ownerName || 
              !formData.ownerIdNumber || 
              !formData.ownerPhone || 
              !formData.ownerEmail
            )) ||
            (currentStep === 5 && (!formData.insurer || (showQuote && !calculatedPremium)))
          }
          continueText={
            currentStep < 5 ? "Continue" : 
            currentStep === 5 && !showQuote ? "Calculate Premium" :
            currentStep === 5 && showQuote ? "Continue" :
            "Proceed to Payment"
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  }
});
