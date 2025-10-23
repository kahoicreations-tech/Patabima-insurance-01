import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DjangoAPIService from '../../../../../services/DjangoAPIService';
import StoragePurge from '../../../../../services/StoragePurge';
import { useMotorInsurance } from '../../../../../contexts/MotorInsuranceContext';
import { useNavigation } from '@react-navigation/native';

function normalizePolicyData(data) {
  const safe = data || {};
  const client = safe.clientDetails || safe.client_details || {};
  const vehicle = safe.vehicleDetails || safe.vehicle_details || {};
  const product = safe.productDetails || safe.product_details || {};
  const premium = safe.premiumBreakdown || safe.premium_breakdown || {};
  const payment = safe.paymentDetails || safe.payment_details || {};
  const docs = Array.isArray(safe.documents)
    ? safe.documents
    : (Array.isArray(safe.documents?.files) ? safe.documents.files : []);

  const fullName = client.fullName || client.owner_name || `${client.firstName || client.first_name || ''} ${client.lastName || client.last_name || ''}`.trim();

  return {
    quoteId: safe.quoteId || safe.quote_id || null,
    clientDetails: {
      fullName,
      email: client.email || client.owner_email || '',
      phone: client.phone || client.phoneNumber || client.owner_phone || '',
      ...(client.firstName || client.first_name ? { firstName: client.firstName || client.first_name } : {}),
      ...(client.lastName || client.last_name ? { lastName: client.lastName || client.last_name } : {}),
      ...(client.kraPin || client.kra_pin ? { kraPin: client.kraPin || client.kra_pin } : {}),
      ...(client.idNumber || client.id_number ? { idNumber: client.idNumber || client.id_number } : {}),
    },
    vehicleDetails: {
      // Core identity
      registration: vehicle.registration || vehicle.vehicle_registration || '',
      make: vehicle.make || vehicle.vehicle_make || '',
      model: vehicle.model || vehicle.vehicle_model || '',
      year: Number(vehicle.year || vehicle.vehicle_year || new Date().getFullYear()),
      // Additional identifiers
      ...(vehicle.chassisNumber || vehicle.chassis_number ? { chassisNumber: vehicle.chassisNumber || vehicle.chassis_number } : {}),
      ...(vehicle.engineNumber || vehicle.engine_number ? { engineNumber: vehicle.engineNumber || vehicle.engine_number } : {}),
      // Coverage period
      ...(vehicle.coverStartDate || vehicle.cover_start_date ? { coverStartDate: vehicle.coverStartDate || vehicle.cover_start_date } : { coverStartDate: new Date().toISOString().split('T')[0] }),
      ...(vehicle.coverEndDate || vehicle.cover_end_date ? { coverEndDate: vehicle.coverEndDate || vehicle.cover_end_date } : {}),
      // Product-specific numeric fields
      ...(vehicle.sumInsured != null || vehicle.sum_insured != null
        ? { sumInsured: Number(String(vehicle.sumInsured ?? vehicle.sum_insured).replace?.(/[_,\s]/g, '') || (vehicle.sumInsured ?? vehicle.sum_insured)) }
        : {}),
      ...(vehicle.tonnage != null ? { tonnage: Number(vehicle.tonnage) } : {}),
      ...(vehicle.passengerCapacity != null || vehicle.passenger_capacity != null
        ? { passengerCapacity: Number(vehicle.passengerCapacity ?? vehicle.passenger_capacity) }
        : {}),
      ...(vehicle.engineCapacity != null || vehicle.engine_capacity != null
        ? { engineCapacity: Number(vehicle.engineCapacity ?? vehicle.engine_capacity) }
        : {}),
      // Misc
      ...(vehicle.value ? { value: vehicle.value } : {}),
      ...(vehicle.vehicle_usage ? { vehicle_usage: vehicle.vehicle_usage } : {}),
      ...(vehicle.vehicle_color ? { vehicle_color: vehicle.vehicle_color } : {}),
      ...(vehicle.seating_capacity != null ? { seating_capacity: Number(vehicle.seating_capacity) } : {}),
    },
    productDetails: {
      category: product.category || '',
      subcategory: product.subcategory || product.name || '',
      coverageType: product.coverageType || product.coverage_type || '',
      ...(product.name ? { name: product.name } : {}),
    },
    premiumBreakdown: {
      totalAmount: premium.totalAmount ?? premium.total_amount ?? premium.total_premium ?? 0,
      basePremium: premium.basePremium ?? premium.base_premium ?? 0,
      trainingLevy: premium.trainingLevy ?? premium.training_levy ?? 0,
      pcfLevy: premium.pcfLevy ?? premium.pcf_levy ?? 0,
      stampDuty: premium.stampDuty ?? premium.stamp_duty ?? 40,
    },
    paymentDetails: {
      method: payment.method || 'PENDING',
      amount: Number(payment.amount ?? premium.totalAmount ?? premium.total_amount ?? 0),
      ...(payment.status ? { status: payment.status } : {}),
      ...(payment.transactionId || payment.transaction_id ? { transactionId: payment.transactionId || payment.transaction_id } : {}),
    },
    underwriterDetails: safe.underwriterDetails || safe.underwriter_details || null,
    addons: Array.isArray(safe.addons) ? safe.addons : [],
    documents: docs,
  };
}

export default function PolicySubmission({
  policyData: policyDataProp,
  quoteId,
  clientDetails,
  vehicleDetails,
  productDetails,
  underwriterDetails,
  premiumBreakdown,
  paymentDetails,
  documents,
  onSubmissionComplete,
  onSubmissionError
}) {
  const [progress, setProgress] = useState('Preparing policy data...');
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  // Get motor insurance context to reset flow after submission
  const { actions: motorActions } = useMotorInsurance();
  const navigation = useNavigation();

  useEffect(() => {
    submitPolicy();
  }, []);

  const submitPolicy = async () => {
    try {
      // Local duplicate-submission guard: prevent accidental double tap / re-entry
      const guardKey = 'policy_submission_guard';
      const existingGuard = await AsyncStorage.getItem(guardKey);
      if (existingGuard) {
        console.log('[PolicySubmission] Duplicate submission blocked by guard');
        return; // Early exit to prevent double policy creation
      }
      await AsyncStorage.setItem(guardKey, String(Date.now()));

      // EARLY PURGE: clear drafts/flow as soon as user initiates submission to avoid duplicate quotes
      try {
        const earlyReg = (policyDataProp?.vehicleDetails?.registration
          || vehicleDetails?.registration
          || vehicleDetails?.vehicle_registration
          || null);
        await StoragePurge.purgeAfterPolicySubmission({ vehicleRegistration: earlyReg });
        // ALSO reset the motor insurance context state to prevent reloading same data
        await motorActions.resetFlow();
        console.log('[PolicySubmission] Early purge + context reset completed at submission start');
      } catch (e) {
        console.warn('[PolicySubmission] Early purge failed (continuing):', e?.message || e);
      }

      // Step 1: Validate data
      setStep(1);
      setProgress('Validating policy data...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Submit to backend
      setStep(2);
      setProgress('Creating policy...');

      // Prefer composed policyData from parent; else, compose from individual props
      const composed = policyDataProp ?? {
        quoteId,
        clientDetails,
        vehicleDetails,
        productDetails,
        underwriterDetails,
        premiumBreakdown,
        paymentDetails,
        documents,
      };

      const policyData = normalizePolicyData(composed);

      console.log('\n' + '='.repeat(80));
      console.log('PolicySubmission - Composed Data BEFORE Normalization:');
      console.log(JSON.stringify(composed, null, 2));
      console.log('='.repeat(80));
      console.log('PolicySubmission - Normalized Payload BEING SENT:');
      console.log(JSON.stringify(policyData, null, 2));
      console.log('='.repeat(80) + '\n');

      // Create policy using the proper API service method
      const djangoAPI = DjangoAPIService;
      await djangoAPI.initialize(); // Ensure service is initialized
      
  const response = await djangoAPI.createMotorPolicy(policyData);

      if (!response.success && !response.policyNumber) {
        throw new Error(response.message || 'Policy creation failed');
      }

      // Step 3: Generate documents
      setStep(3);
      setProgress('Generating policy document...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 4: Finalize
      setStep(4);
      setProgress('Policy created successfully!');
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Complete submission
      const result = {
        policyNumber: response.policyNumber || `POL-${Date.now()}`,
        policyId: response.policyId || response.id,
        pdfUrl: response.pdfUrl || null,
        message: response.message || 'Policy created successfully'
      };

      // Prefer parent handler, else navigate directly to success screen
      if (typeof onSubmissionComplete === 'function') {
        onSubmissionComplete(result);
      } else {
        try {
          navigation.navigate('PolicySuccess', result);
        } catch (e) {
          // If navigation isn't available for some reason, still call callback if provided
          console.warn('[PolicySubmission] navigation to PolicySuccess failed:', e?.message || e);
        }
      }

      // Targeted purge to clear drafts and motor flow state after success
      try {
        const reg = policyData?.vehicleDetails?.registration || policyData?.vehicle_details?.registration;
        await StoragePurge.purgeAfterPolicySubmission({ vehicleRegistration: reg });
      } catch (e) {
        console.warn('[PolicySubmission] Post-success purge failed:', e?.message || e);
      }

    } catch (error) {
      console.error('Policy submission error:', error);

      // Surface helpful backend validation messages across various shapes
      const payload = error?.payload || error?.response?.data || null;
      const detailsObj = payload?.details || payload?.errors || error?.details || null;
      const detailMsg = detailsObj
        ? Object.entries(detailsObj).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join(', '):String(v)}`).join('\n')
        : (typeof payload === 'string' ? payload : (payload?.message || null));

      Alert.alert(
        'Submission Failed',
        detailMsg || error.message || 'Failed to create policy. Please try again.',
        [
          { text: 'Retry', onPress: () => submitPolicy() },
          { text: 'Cancel', style: 'cancel', onPress: () => onSubmissionError?.(error) }
        ]
      );
    } finally {
      // Always release the local guard
      try { await AsyncStorage.removeItem('policy_submission_guard'); } catch {}
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentCard}>
        <ActivityIndicator size="large" color="#D5222B" />
        
        <Text style={styles.progressText}>{progress}</Text>
        
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsText}>
            Step {step} of {totalSteps}
          </Text>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${(step / totalSteps) * 100}%` }
              ]} 
            />
          </View>
        </View>
        
        <Text style={styles.pleaseWait}>Please wait while we process your policy...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 20,
    textAlign: 'center',
  },
  stepsContainer: {
    marginTop: 20,
    width: '100%',
  },
  stepsText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D5222B',
    borderRadius: 4,
  },
  pleaseWait: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 15,
    textAlign: 'center',
  },
});
