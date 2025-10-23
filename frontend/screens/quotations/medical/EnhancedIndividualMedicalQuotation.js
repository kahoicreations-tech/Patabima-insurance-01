/**
 * Individual Medical Insurance Quotation Screen
 * 2-Step Process: Policy Details → Client Details
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants';
import { BRAND, UI, SEMANTIC, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../../theme';
import { Heading4, Heading6, Body1, Body2, Caption, Text as PBText, ButtonText, Subtitle2 } from '../../../components/typography/Text';
// Removed Enhanced* form components for client details to ensure consistent sizing with policy inputs
// import { ... } from '../../../components/EnhancedFormComponents';
import api from '../../../services/DjangoAPIService';

const EnhancedIndividualMedicalQuotation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const editingQuoteNumber = route?.params?.quoteNumber || null;

  const [formData, setFormData] = useState({
    inpatientLimit: '',
    outpatientCover: false,
    maternityCover: false,
    age: '',
    spouseAge: '',
    numberOfChildren: '',
    preferredUnderwriters: [],
    fullName: '',
    idNumber: '',
    phoneNumber: '',
    emailAddress: '',
    declaration: false
  });

  const [quoteMeta, setQuoteMeta] = useState({ 
    quote_number: null, 
    product: null, 
    status: null
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // guard against duplicate final submission

  const coverLimitOptions = [
    { id: '500k', name: 'KES 500,000', value: 500000 },
    { id: '1m', name: 'KES 1,000,000', value: 1000000 },
    { id: '2m', name: 'KES 2,000,000', value: 2000000 },
    { id: '3m', name: 'KES 3,000,000', value: 3000000 },
    { id: '5m', name: 'KES 5,000,000', value: 5000000 },
    { id: '10m', name: 'KES 10,000,000', value: 10000000 }
  ];

  // Underwriters fetched dynamically
  const [underwriters, setUnderwriters] = useState([]);
  const [underwritersLoading, setUnderwritersLoading] = useState(false);
  const [underwritersError, setUnderwritersError] = useState(null);

  // Removed early quote creation - will defer until final submit

  // Fetch available underwriters (generic list) on mount & load existing quote if editing
  useEffect(() => {
    let cancelled = false;
    const fetchUnderwriters = async () => {
      setUnderwritersLoading(true);
      setUnderwritersError(null);
      try {
        const providers = await api.getUnderwriters();
        if (!cancelled) {
          const normalized = Array.isArray(providers) ? providers : (providers?.underwriters || []);
          // Normalize shape to { id, name }
          const mapped = normalized.map((p, idx) => ({
            id: p.code || p.underwriter_code || p.id || `uw_${idx}`,
            name: p.name || p.company || p.company_name || p.underwriter_name || `Underwriter ${idx + 1}`,
          }));
          setUnderwriters(mapped);
        }
      } catch (e) {
        if (!cancelled) setUnderwritersError(e.message || 'Failed to load underwriters');
      } finally {
        if (!cancelled) setUnderwritersLoading(false);
      }
    };
    fetchUnderwriters();

    // If editing, fetch quote detail & prefill form
    const loadExisting = async () => {
      if (!editingQuoteNumber) return;
      try {
        let detail;
        let isManualQuote = false;
        
        // Try to load as ManualQuote first (new system)
        try {
          detail = await api.getMedicalQuote(editingQuoteNumber);
          isManualQuote = true;
        } catch (err) {
          // If not found as ManualQuote, try generic quote system (legacy)
          detail = await api.getGenericQuote(editingQuoteNumber);
          isManualQuote = false;
        }
        
        if (isManualQuote) {
          // ManualQuote structure: { reference, line_key, payload, status, etc. }
          const formDataRaw = detail?.payload || {};
          setFormData(prev => ({
            ...prev,
            ...['inpatientLimit','outpatientCover','maternityCover','age','spouseAge','numberOfChildren','preferredUnderwriters','fullName','idNumber','phoneNumber','emailAddress','declaration']
              .reduce((acc,k)=>{ if (formDataRaw[k] !== undefined) acc[k]=formDataRaw[k]; return acc; }, {})
          }));
          setQuoteMeta({ quote_number: editingQuoteNumber, product: null, status: detail?.status || null });
        } else {
          // Legacy generic quote structure
          const formDataRaw = detail?.form_data || detail?.formData || detail?.inputs || {};
          setFormData(prev => ({
            ...prev,
            ...['inpatientLimit','outpatientCover','maternityCover','age','spouseAge','numberOfChildren','preferredUnderwriters','fullName','idNumber','phoneNumber','emailAddress','declaration']
              .reduce((acc,k)=>{ if (formDataRaw[k] !== undefined) acc[k]=formDataRaw[k]; return acc; }, {})
          }));
          setQuoteMeta({ quote_number: editingQuoteNumber, product: null, status: detail?.status || null });
        }
      } catch (e) {
        console.warn('[MedicalEdit] Failed to load existing quote', e?.message);
      }
    };
    loadExisting();
    return () => { cancelled = true; };
  }, [editingQuoteNumber]);

  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Validate policy details (step 1)
  const validateStepOne = useCallback(() => {
    const errors = {};
    if (!formData.inpatientLimit) errors.inpatientLimit = 'Select an inpatient limit';
    if (!formData.age) errors.age = 'Age is required';
    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) <= 0)) errors.age = 'Enter a valid age';
    if (formData.spouseAge && (isNaN(Number(formData.spouseAge)) || Number(formData.spouseAge) <= 0)) errors.spouseAge = 'Spouse age invalid';
    if (formData.numberOfChildren && (isNaN(Number(formData.numberOfChildren)) || Number(formData.numberOfChildren) < 0)) errors.numberOfChildren = 'Children count invalid';
    return { valid: Object.keys(errors).length === 0, errors };
  }, [formData]);

  const nextStep = async () => {
    if (currentStep < totalSteps) {
      if (currentStep === 1) {
        const { valid, errors } = validateStepOne();
        if (!valid) {
          // Simple summarised alert for now; can be enhanced to inline errors
          const msg = Object.values(errors).join('\n');
          Alert.alert('Missing / Invalid Fields', msg);
          return;
        }
      }
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleFinalSubmit = async () => {
    if (!formData.declaration) {
      Alert.alert('Declaration Required', 'Please accept the declaration');
      return;
    }
    if (submitting) return; // duplicate tap guard
    setSubmitting(true);
    setLoading(true);
    
    try {
      let result;
      if (editingQuoteNumber) {
        // For editing - check if it's already a ManualQuote by trying to fetch it
        try {
          result = await api.getMedicalQuote(editingQuoteNumber);
          // If successful, it's a manual quote - update would need different logic
          Alert.alert('Edit Not Supported', 'Manual quotes cannot be edited after submission. Please create a new quote.');
          return;
        } catch (err) {
          // If error, might be a legacy quote - fall back to old system
          let quoteNumberToUse = editingQuoteNumber;
          await api.updateGenericQuoteInputs(quoteNumberToUse, formData);
          const goToQuotations = () => {
            const params = { forceRefresh: true, focusId: quoteNumberToUse, justSubmitted: true, message: 'Medical quote updated' };
            // Prefer navigating to nested tab via root stack
            try {
              navigation.navigate('MainTabs', { screen: 'Quotations', params });
              return;
            } catch (e) {}
            // Fallback: try parent navigator (if already inside tabs)
            const parent = navigation.getParent ? navigation.getParent() : null;
            if (parent) {
              try {
                parent.navigate('Quotations', params);
                return;
              } catch (e) {}
            }
            // Last resort
            try { navigation.navigate('Quotations', params); return; } catch (e) {}
            navigation.goBack();
          };
          Alert.alert('Updated', 'Medical quote updated.', [
            { text: 'OK', onPress: goToQuotations }
          ]);
          return;
        }
      } else {
        // Create new ManualQuote
        result = await api.createMedicalQuote(formData);
      }
      
      const reference = result.reference;
      const goToQuotations = () => {
        const params = { 
          forceRefresh: true, 
          focusId: reference, 
          justSubmitted: true, 
          message: 'Medical quote submitted for admin review' 
        };
        // Prefer navigating to nested tab via root stack
        try {
          navigation.navigate('MainTabs', { screen: 'Quotations', params });
          return;
        } catch (e) {}
        // Fallback: try parent navigator (if already inside tabs)
        const parent = navigation.getParent ? navigation.getParent() : null;
        if (parent) {
          try {
            parent.navigate('Quotations', params);
            return;
          } catch (e) {}
        }
        // Last resort
        try { navigation.navigate('Quotations', params); return; } catch (e) {}
        navigation.goBack();
      };
      
      Alert.alert(
        'Quote Requested', 
        'Your Medical insurance quote request has been submitted. Our team will provide pricing shortly.',
        [{ text: 'OK', onPress: goToQuotations }]
      );
    } catch (error) {
      console.error('Final submit error:', error);
      Alert.alert('Error', error.message || 'Failed to submit quote');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const renderPolicyDetails = () => (
    <View style={styles.stepContainer}>
      <View style={styles.inputContainer}>
  <Subtitle2 style={styles.label}>Inpatient Limit</Subtitle2>
        <View style={styles.selectContainer}>
          {coverLimitOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.selectOption, formData.inpatientLimit === option.id && styles.selectedSelectOption]}
              onPress={() => updateFormData('inpatientLimit', option.id)}
            >
              <Body2 style={[styles.selectOptionText, formData.inpatientLimit === option.id && styles.selectedSelectOptionText]}>
                {option.name}
              </Body2>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.inputContainer}>
  <Subtitle2 style={styles.label}>Additional Benefits</Subtitle2>
        <TouchableOpacity style={styles.checkboxRow} onPress={() => updateFormData('outpatientCover', !formData.outpatientCover)}>
          <View style={[styles.checkbox, formData.outpatientCover && styles.checkboxSelected]}>
            {formData.outpatientCover && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Body2 style={styles.checkboxLabel}>Outpatient Cover</Body2>
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkboxRow} onPress={() => updateFormData('maternityCover', !formData.maternityCover)}>
          <View style={[styles.checkbox, formData.maternityCover && styles.checkboxSelected]}>
            {formData.maternityCover && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Body2 style={styles.checkboxLabel}>Maternity Cover</Body2>
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
  <Subtitle2 style={styles.label}>Age</Subtitle2>
        <TextInput
          value={formData.age}
          onChangeText={(text) => updateFormData('age', text.replace(/\D/g, ''))}
          placeholder="Enter age"
          keyboardType="number-pad"
          inputMode="numeric"
          returnKeyType="next"
          maxLength={3}
          style={styles.input}
        />
      </View>
      
      <View style={styles.inputContainer}>
  <Subtitle2 style={styles.label}>Spouse Age</Subtitle2>
        <TextInput
          value={formData.spouseAge}
          onChangeText={(text) => updateFormData('spouseAge', text.replace(/\D/g, ''))}
          placeholder="Enter spouse age"
          keyboardType="number-pad"
          inputMode="numeric"
          returnKeyType="next"
          maxLength={3}
          style={styles.input}
        />
      </View>
      
      <View style={styles.inputContainer}>
  <Subtitle2 style={styles.label}>Number of Children</Subtitle2>
        <TextInput
          value={formData.numberOfChildren}
          onChangeText={(text) => updateFormData('numberOfChildren', text.replace(/\D/g, ''))}
          placeholder="Enter number of children"
          keyboardType="number-pad"
          inputMode="numeric"
          returnKeyType="next"
          maxLength={2}
          style={styles.input}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Subtitle2 style={styles.label}>Preferred Underwriters</Subtitle2>
        {underwritersLoading && (
          <Body2 style={styles.loadingText}>Loading underwriters...</Body2>
        )}
        {underwritersError && !underwritersLoading && (
          <Caption style={styles.errorText}>{underwritersError}</Caption>
        )}
        {!underwritersLoading && !underwritersError && (
          <View style={styles.selectContainer}>
            {underwriters.map((uw) => (
              <TouchableOpacity
                key={uw.id}
                style={[styles.selectOption, formData.preferredUnderwriters?.includes(uw.id) && styles.selectedSelectOption]}
                onPress={() => {
                  const current = formData.preferredUnderwriters || [];
                  const updated = current.includes(uw.id) ? current.filter(id => id !== uw.id) : [...current, uw.id];
                  updateFormData('preferredUnderwriters', updated);
                }}
              >
                <Body2 style={[styles.selectOptionText, formData.preferredUnderwriters?.includes(uw.id) && styles.selectedSelectOptionText]}>
                  {uw.name}
                </Body2>
              </TouchableOpacity>
            ))}
            {underwriters.length === 0 && (
              <Caption style={styles.loadingText}>No underwriters available</Caption>
            )}
          </View>
        )}
      </View>
    </View>
  );

  const renderClientDetails = () => (
    <View style={styles.stepContainer}>
      {/* Full Name */}
      <View style={styles.inputContainer}>
        <Subtitle2 style={styles.label}>Full Name</Subtitle2>
        <TextInput
          value={formData.fullName}
          onChangeText={(text) => updateFormData('fullName', text)}
          placeholder="Enter your full name"
          style={styles.input}
          autoCapitalize="words"
        />
      </View>

      {/* ID Number */}
      <View style={styles.inputContainer}>
        <Subtitle2 style={styles.label}>ID Number</Subtitle2>
        <TextInput
          value={formData.idNumber}
          onChangeText={(text) => updateFormData('idNumber', text.replace(/\D/g, ''))}
          placeholder="Enter ID number"
          style={styles.input}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={12}
          returnKeyType="next"
          textContentType="none"
        />
      </View>

      {/* Phone Number */}
      <View style={styles.inputContainer}>
        <Subtitle2 style={styles.label}>Phone Number</Subtitle2>
        <TextInput
          value={formData.phoneNumber}
          onChangeText={(text) => updateFormData('phoneNumber', text.replace(/\D/g, ''))}
          placeholder="Enter phone number"
          style={styles.input}
          keyboardType="phone-pad"
          inputMode="tel"
          maxLength={12}
          returnKeyType="next"
          textContentType="telephoneNumber"
        />
      </View>

      {/* Email Address */}
      <View style={styles.inputContainer}>
        <Subtitle2 style={styles.label}>Email Address</Subtitle2>
        <TextInput
          value={formData.emailAddress}
          onChangeText={(text) => updateFormData('emailAddress', text)}
          placeholder="Enter email address"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="done"
          textContentType="emailAddress"
          autoCorrect={false}
        />
      </View>

      {/* Declaration */}
      <TouchableOpacity style={styles.declarationContainer} onPress={() => updateFormData('declaration', !formData.declaration)}>
        <View style={[styles.checkbox, formData.declaration && styles.checkboxSelected]}>
          {formData.declaration && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
        <Caption style={styles.declarationText}>I confirm that all information is accurate</Caption>
      </TouchableOpacity>
    </View>
  );

  const isValid = () => {
    const hasInpatient = !!formData.inpatientLimit;
    const hasAge = !!formData.age && !isNaN(Number(formData.age)) && Number(formData.age) > 0;
    const hasClient = !!formData.fullName && !!formData.idNumber && !!formData.phoneNumber && !!formData.emailAddress;
    return hasInpatient && hasAge && hasClient && !!formData.declaration;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      {/* Red Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.headerBackBtn}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Heading4 style={styles.headerTitle}>Individual Medical Insurance</Heading4>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {renderPolicyDetails()}
        {renderClientDetails()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          disabled={!isValid() || loading || submitting}
          onPress={handleFinalSubmit}
          style={[styles.submitBtn, (!isValid() || loading || submitting) && styles.submitBtnDisabled]}
        >
          <ButtonText style={styles.submitText}>{submitting ? 'Submitting...' : 'Request Quote'}</ButtonText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#D5222B',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerBackBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    color: '#fff', // use Heading4 default sizing/weight
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  stepContainer: { paddingTop: 20 },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16, // unified vertical spacing
  },
  label: {
    color: '#000',
    marginBottom: 8,
  },
  required: {
    color: '#D5222B',
  },
  input: {
    width: '100%',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: UI.backgroundGray,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.input,
    color: UI.textPrimary,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedSelectOption: {
    backgroundColor: '#D5222B',
    borderColor: '#D5222B',
  },
  selectOptionText: {
    color: '#333',
  },
  selectedSelectOptionText: {
    color: '#fff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: '#D5222B',
    borderColor: '#D5222B',
  },
  checkboxLabel: {
    color: '#333',
  },
  declarationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#D5222B',
  },
  declarationText: {
    flex: 1,
    color: '#856404',
    marginLeft: 10,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitBtn: {
    backgroundColor: '#D5222B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff' },
  pricingCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#D5222B',
  },
  pricingTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  pricingAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D5222B',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    margin: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#b00020',
  },
});

export default EnhancedIndividualMedicalQuotation;
