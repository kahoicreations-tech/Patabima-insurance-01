import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants';
import { SafeScreen, EnhancedCard, StatusBadge, CompactCurvedHeader } from '../../components';

export default function ExtensionScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1);
  const [policyDetails, setPolicyDetails] = useState(route.params?.policy || null);
  const [extensionData, setExtensionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('3 months');
  const [selectedReason, setSelectedReason] = useState('');
  
  // Extension period options
  const extensionPeriods = [
    { value: '1 month', label: '1 Month', days: 30 },
    { value: '3 months', label: '3 Months', days: 90 },
    { value: '6 months', label: '6 Months', days: 180 }
  ];
  
  // Extension reason options
  const extensionReasons = [
    'Awaiting vehicle inspection',
    'Pending documentation',
    'Temporary financial constraints',
    'Waiting for claim settlement',
    'Other'
  ];
  
  // If no policy was passed, go back to previous screen
  useEffect(() => {
    if (!policyDetails) {
      Alert.alert('Error', 'No policy information provided');
      navigation.goBack();
    } else {
      // Simulate loading extension details
      setLoading(true);
      setTimeout(() => {
        // Calculate pro-rated premium for extension
        const daysInYear = 365;
        const selectedPeriodDays = extensionPeriods.find(p => p.value === selectedPeriod)?.days || 90;
        const annualPremium = Math.floor(Math.random() * 8000) + 4000; // Base annual premium
        
        const mockExtensionData = {
          currentExpiryDate: policyDetails.dueDate,
          extensionPeriod: selectedPeriod,
          newExpiryDate: new Date(new Date(policyDetails.dueDate).getTime() + (selectedPeriodDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          proRatedPremium: Math.floor((annualPremium / daysInYear) * selectedPeriodDays),
          levies: Math.floor(Math.random() * 200) + 100,
          stampDuty: 40,
          totalPremium: 0
        };
        
        mockExtensionData.totalPremium = 
          mockExtensionData.proRatedPremium + 
          mockExtensionData.levies + 
          mockExtensionData.stampDuty;
          
        setExtensionData(mockExtensionData);
        setLoading(false);
      }, 1500);
    }
  }, [policyDetails, selectedPeriod]);
  
  const handleNextStep = () => {
    if (currentStep === 1 && !selectedReason) {
      Alert.alert('Required', 'Please select a reason for extension');
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - complete extension
      handleCompleteExtension();
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };
  
  const handleCompleteExtension = () => {
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Extension Successful',
        `Your policy ${policyDetails.policyNo} has been extended until ${new Date(extensionData.newExpiryDate).toLocaleDateString()}.`,
        [
          {
            text: 'View Policy',
            onPress: () => {
              navigation.navigate('Home');
            }
          },
          {
            text: 'Back to Home',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    }, 2000);
  };
  
  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicatorContainer}>
        {[1, 2, 3].map(step => (
          <View key={step} style={styles.stepRow}>
            <View style={[
              styles.stepCircle,
              currentStep === step && styles.activeStepCircle,
              currentStep > step && styles.completedStepCircle
            ]}>
              {currentStep > step ? (
                <Text style={styles.stepCheckmark}>✓</Text>
              ) : (
                <Text style={[
                  styles.stepNumber,
                  currentStep === step && styles.activeStepNumber
                ]}>{step}</Text>
              )}
            </View>
            <Text style={[
              styles.stepLabel,
              currentStep === step && styles.activeStepLabel
            ]}>
              {step === 1 ? 'Extension Details' : 
               step === 2 ? 'Premium & Period' :
               'Payment'}
            </Text>
          </View>
        ))}
      </View>
    );
  };
  
  const renderExtensionDetails = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Extension Details</Text>
        <Text style={styles.stepDescription}>
          Configure your policy extension before proceeding
        </Text>
        
        <EnhancedCard style={styles.policyCard}>
          <View style={styles.policyHeader}>
            <Text style={styles.policyHeaderText}>Current Policy</Text>
            <StatusBadge status={policyDetails.status} size="small" />
          </View>
          
          <View style={styles.policyDetail}>
            <Text style={styles.policyDetailLabel}>Policy Number</Text>
            <Text style={styles.policyDetailValue}>{policyDetails.policyNo}</Text>
          </View>
          
          <View style={styles.policyDetail}>
            <Text style={styles.policyDetailLabel}>Vehicle</Text>
            <Text style={styles.policyDetailValue}>{policyDetails.vehicleReg}</Text>
          </View>
          
          <View style={styles.policyDetail}>
            <Text style={styles.policyDetailLabel}>Current Expiry</Text>
            <Text style={styles.policyDetailValue}>
              {new Date(policyDetails.dueDate).toLocaleDateString()}
            </Text>
          </View>
        </EnhancedCard>
        
        {/* Extension Period Selection */}
        <Text style={styles.sectionTitle}>Extension Period</Text>
        <View style={styles.periodContainer}>
          {extensionPeriods.map((period) => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.periodOption,
                selectedPeriod === period.value && styles.selectedPeriodOption
              ]}
              onPress={() => setSelectedPeriod(period.value)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period.value && styles.selectedPeriodText
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Extension Reason Selection */}
        <Text style={styles.sectionTitle}>Reason for Extension</Text>
        <View style={styles.reasonContainer}>
          {extensionReasons.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[
                styles.reasonOption,
                selectedReason === reason && styles.selectedReasonOption
              ]}
              onPress={() => setSelectedReason(reason)}
            >
              <Text style={[
                styles.reasonText,
                selectedReason === reason && styles.selectedReasonText
              ]}>
                {reason}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const renderPremiumDetails = () => {
    if (!extensionData) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating extension premium...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Premium & Period</Text>
        <Text style={styles.stepDescription}>
          Review your extension premium and new coverage period
        </Text>
        
        <EnhancedCard style={styles.extensionSummaryCard}>
          <View style={styles.extensionSummaryHeader}>
            <View style={styles.extensionIcon}>
              <Text style={styles.extensionIconText}>⏱️</Text>
            </View>
            <View style={styles.extensionHeaderInfo}>
              <Text style={styles.extensionSummaryTitle}>Extension Summary</Text>
              <Text style={styles.extensionSummarySubtitle}>Policy extension details</Text>
            </View>
          </View>
          
          <View style={styles.dateContainer}>
            <View style={styles.dateItemContainer}>
              <View style={styles.dateItem}>
                <View style={styles.dateIconContainer}>
                  <Text style={styles.dateIconText}>📅</Text>
                </View>
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>Current Expiry</Text>
                  <Text style={styles.dateValue}>
                    {new Date(extensionData.currentExpiryDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.dateArrow}>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </View>
            
            <View style={styles.dateItemContainer}>
              <View style={styles.dateItem}>
                <View style={styles.dateIconContainer}>
                  <Text style={styles.dateIconText}>📅</Text>
                </View>
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>New Expiry</Text>
                  <Text style={styles.dateValue}>
                    {new Date(extensionData.newExpiryDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.periodInfoContainer}>
            <View style={styles.periodInfoItem}>
              <View style={styles.periodInfoIcon}>
                <Text style={styles.periodInfoIconText}>🗓️</Text>
              </View>
              <View style={styles.periodInfoDetails}>
                <Text style={styles.periodInfoLabel}>Extension Period</Text>
                <Text style={styles.periodInfoValue}>{selectedPeriod}</Text>
              </View>
            </View>
            
            <View style={styles.periodInfoItem}>
              <View style={styles.periodInfoIcon}>
                <Text style={styles.periodInfoIconText}>📝</Text>
              </View>
              <View style={styles.periodInfoDetails}>
                <Text style={styles.periodInfoLabel}>Reason</Text>
                <Text style={styles.reasonInfoValue}>{selectedReason}</Text>
              </View>
            </View>
          </View>
        </EnhancedCard>
        
        <EnhancedCard style={styles.premiumCard}>
          <Text style={styles.premiumHeaderText}>Premium Breakdown</Text>
          
          <View style={styles.premiumDetail}>
            <Text style={styles.premiumDetailLabel}>Pro-rated Premium</Text>
            <Text style={styles.premiumDetailValue}>KES {extensionData.proRatedPremium.toLocaleString()}</Text>
          </View>
          
          <View style={styles.premiumDetail}>
            <Text style={styles.premiumDetailLabel}>Levies</Text>
            <Text style={styles.premiumDetailValue}>KES {extensionData.levies.toLocaleString()}</Text>
          </View>
          
          <View style={styles.premiumDetail}>
            <Text style={styles.premiumDetailLabel}>Stamp Duty</Text>
            <Text style={styles.premiumDetailValue}>KES {extensionData.stampDuty.toLocaleString()}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalPremiumContainer}>
            <Text style={styles.totalPremiumLabel}>Total Extension Premium</Text>
            <Text style={styles.totalPremiumValue}>KES {extensionData.totalPremium.toLocaleString()}</Text>
          </View>
        </EnhancedCard>
        
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            ⚠️ This is a temporary extension. You will still need to complete full renewal before the new expiry date.
          </Text>
        </View>
      </View>
    );
  };
  
  const renderPayment = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Payment</Text>
        <Text style={styles.stepDescription}>
          Choose your payment method to complete extension
        </Text>
        
        <EnhancedCard style={styles.paymentSummaryCard}>
          <Text style={styles.paymentHeaderText}>Payment Summary</Text>
          
          <View style={styles.paymentDetail}>
            <Text style={styles.paymentDetailLabel}>Policy Number</Text>
            <Text style={styles.paymentDetailValue}>{policyDetails.policyNo}</Text>
          </View>
          
          <View style={styles.paymentDetail}>
            <Text style={styles.paymentDetailLabel}>Vehicle</Text>
            <Text style={styles.paymentDetailValue}>{policyDetails.vehicleReg}</Text>
          </View>
          
          <View style={styles.paymentDetail}>
            <Text style={styles.paymentDetailLabel}>Extension Period</Text>
            <Text style={styles.paymentDetailValue}>{selectedPeriod}</Text>
          </View>
          
          <View style={styles.paymentDetail}>
            <Text style={styles.paymentDetailLabel}>New Expiry Date</Text>
            <Text style={styles.paymentDetailValue}>
              {new Date(extensionData.newExpiryDate).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalPaymentContainer}>
            <Text style={styles.totalPaymentLabel}>Total Amount</Text>
            <Text style={styles.totalPaymentValue}>KES {extensionData.totalPremium.toLocaleString()}</Text>
          </View>
        </EnhancedCard>
        
        <Text style={styles.paymentMethodsTitle}>Payment Method</Text>
        
        <TouchableOpacity 
          style={styles.paymentMethodCard}
          onPress={handleCompleteExtension}
        >
          <View style={styles.paymentMethodIcon}>
            <Text style={styles.paymentMethodIconText}>💰</Text>
          </View>
          <View style={styles.paymentMethodDetails}>
            <Text style={styles.paymentMethodName}>M-PESA</Text>
            <Text style={styles.paymentMethodDescription}>Pay via M-PESA mobile money</Text>
          </View>
          <Text style={styles.paymentMethodArrow}>→</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderCurrentStep = () => {
    switch(currentStep) {
      case 1:
        return renderExtensionDetails();
      case 2:
        return renderPremiumDetails();
      case 3:
        return renderPayment();
      default:
        return renderExtensionDetails();
    }
  };
  
  if (!policyDetails) {
    return null; // Will redirect via useEffect
  }
  
  return (
    <SafeScreen>
      <StatusBar style="light" />
      
      <CompactCurvedHeader 
        title="Policy Extension"
        subtitle={policyDetails.policyNo}
        showBackButton
        onBackPress={handlePreviousStep}
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: insets.bottom + 100 }
        ]}
      >
        <View style={styles.headerSpacing} />
        
        {renderStepIndicator()}
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {currentStep === 3 ? 'Processing extension...' : 'Loading...'}
            </Text>
          </View>
        ) : (
          renderCurrentStep()
        )}
      </ScrollView>
      
      {!loading && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handlePreviousStep}
          >
            <Text style={styles.backButtonText}>
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={handleNextStep}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === 3 ? 'Complete Extension' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
  },
  headerSpacing: {
    height: Spacing.lg,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  stepRow: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  activeStepCircle: {
    backgroundColor: Colors.warning, // Use warning color (amber/orange) for extensions
    borderColor: Colors.warning,
  },
  completedStepCircle: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepNumber: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  activeStepNumber: {
    color: Colors.white,
  },
  stepCheckmark: {
    fontSize: Typography.fontSize.md,
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
  },
  stepLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  activeStepLabel: {
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.medium,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  stepDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  policyCard: {
    marginBottom: Spacing.md,
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  policyHeaderText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  policyDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  policyDetailLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  policyDetailValue: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  periodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  periodOption: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 8,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedPeriodOption: {
    backgroundColor: Colors.warning + '20',
    borderColor: Colors.warning,
  },
  periodText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  selectedPeriodText: {
    color: Colors.warning,
    fontFamily: Typography.fontFamily.semiBold,
  },
  reasonContainer: {
    marginBottom: Spacing.md,
  },
  reasonOption: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedReasonOption: {
    backgroundColor: Colors.warning + '20',
    borderColor: Colors.warning,
  },
  reasonText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  selectedReasonText: {
    color: Colors.warning,
    fontFamily: Typography.fontFamily.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  extensionSummaryCard: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.warning + '08',
    borderColor: Colors.warning + '40',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: Colors.warning,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  extensionSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  extensionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  extensionIconText: {
    fontSize: 24,
  },
  extensionHeaderInfo: {
    flex: 1,
  },
  extensionSummaryTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs / 2,
  },
  extensionSummarySubtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateItemContainer: {
    flex: 1,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  dateIconText: {
    fontSize: 16,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs / 2,
  },
  dateValue: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  dateArrow: {
    paddingHorizontal: Spacing.md,
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.warning,
    fontFamily: Typography.fontFamily.bold,
  },
  periodInfoContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  periodInfoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  periodInfoIconText: {
    fontSize: 16,
  },
  periodInfoDetails: {
    flex: 1,
  },
  periodInfoLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs / 2,
  },
  periodInfoValue: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.warning,
  },
  reasonInfoValue: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  premiumCard: {
    marginBottom: Spacing.md,
  },
  premiumHeaderText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  premiumDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  premiumDetailLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  premiumDetailValue: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  totalPremiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPremiumLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  totalPremiumValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.warning,
  },
  warningCard: {
    backgroundColor: Colors.warning + '10',
    borderColor: Colors.warning + '30',
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  warningText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  paymentSummaryCard: {
    marginBottom: Spacing.md,
  },
  paymentHeaderText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  paymentDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  paymentDetailLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  paymentDetailValue: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  totalPaymentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPaymentLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  totalPaymentValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.warning,
  },
  paymentMethodsTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  paymentMethodCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  paymentMethodIconText: {
    fontSize: 20,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs / 2,
  },
  paymentMethodDescription: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  paymentMethodArrow: {
    fontSize: Typography.fontSize.md,
    color: Colors.warning,
    fontFamily: Typography.fontFamily.semiBold,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    padding: Spacing.md,
  },
  backButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  backButtonText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  nextButton: {
    flex: 2,
    backgroundColor: Colors.warning,
    borderRadius: 8,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  nextButtonText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.white,
  },
});
