import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Image,
  Platform,
  Dimensions,
  FlatList,
  Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants';
import { SafeScreen, EnhancedCard, StatusBadge, CompactCurvedHeader } from '../../components';
import * as DocumentPicker from 'expo-document-picker';
import DjangoAPIService from '../../services/DjangoAPIService';

const { width } = Dimensions.get('window');

export default function ClaimsSubmissionScreen({ navigation, route }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Policy Information
    policyNumber: '',
    policyType: '',
    policyHolderName: '',
    
    // Step 2: Incident Details
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    incidentDescription: '',
    
    // Step 3: Claim Details
    claimType: '',
    claimAmount: '',
    claimDescription: '',
    
    // Step 4: Supporting Documents
    documents: [],
    
    // Step 5: Declaration
    declarationAccepted: false,
    contactPreference: 'phone',
    additionalComments: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showClaimTypeModal, setShowClaimTypeModal] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);

  const totalSteps = 5;

  // Load user policies from backend (Motor policies for now)
  const fetchPolicies = useCallback(async () => {
    try {
      setIsLoadingPolicies(true);
      const api = new DjangoAPIService();
      await api.initialize();
      // Fetch motor policies if endpoint is available
      const list = await api.getMotorPolicies().catch(() => []);
      // Map to UI shape used by the modal
      const mapped = (Array.isArray(list) ? list : []).map((p, idx) => ({
        id: p.id || idx,
        policyNumber: p.policy_number || p.policyNumber || p.number || '—',
        type: p.product || p.type || 'Motor Vehicle',
        holderName: p.holder_name || p.holderName || p.insured_name || '—',
        vehicleReg: p.vehicle_reg || p.vehicleReg,
        status: (p.status || 'Active'),
        expiryDate: p.expires_on || p.expiryDate || p.expiry_date,
      }));
      setPolicies(mapped);
    } catch (e) {
      console.log('Failed to load policies:', e?.message || e);
      setPolicies([]);
    } finally {
      setIsLoadingPolicies(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const claimTypes = [
    {
      id: 1,
      type: 'Motor Vehicle',
      categories: [
        'Accident/Collision',
        'Theft',
        'Vandalism',
        'Fire/Explosion',
        'Natural Disaster',
        'Windscreen Damage',
        'Third Party Claims'
      ]
    },
    {
      id: 2,
      type: 'Medical',
      categories: [
        'Hospitalization',
        'Outpatient Treatment',
        'Emergency Care',
        'Prescription Medication',
        'Specialist Consultation',
        'Diagnostic Tests',
        'Maternity Care'
      ]
    },
    {
      id: 3,
      type: 'WIBA',
      categories: [
        'Work-related Injury',
        'Occupational Disease',
        'Permanent Disability',
        'Temporary Disability',
        'Death Benefit',
        'Medical Expenses',
        'Loss of Earnings'
      ]
    }
  ];

  const documentTypes = [
    'Police Report',
    'Medical Report',
    'Repair Estimate',
    'Photos of Damage',
    'Witness Statement',
    'Insurance Certificate',
    'Driving License',
    'Vehicle Registration',
    'Other Documents'
  ];

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.policyNumber) newErrors.policyNumber = 'Policy number is required';
        if (!formData.policyType) newErrors.policyType = 'Policy type is required';
        if (!formData.policyHolderName) newErrors.policyHolderName = 'Policy holder name is required';
        break;
      
      case 2:
        if (!formData.incidentDate) newErrors.incidentDate = 'Incident date is required';
        if (!formData.incidentTime) newErrors.incidentTime = 'Incident time is required';
        if (!formData.incidentLocation) newErrors.incidentLocation = 'Incident location is required';
        if (!formData.incidentDescription) newErrors.incidentDescription = 'Incident description is required';
        break;
      
      case 3:
        if (!formData.claimType) newErrors.claimType = 'Claim type is required';
        if (!formData.claimAmount) newErrors.claimAmount = 'Claim amount is required';
        if (!formData.claimDescription) newErrors.claimDescription = 'Claim description is required';
        break;
      
      case 4:
        if (formData.documents.length === 0) newErrors.documents = 'At least one document is required';
        break;
      
      case 5:
        if (!formData.declarationAccepted) newErrors.declarationAccepted = 'Declaration must be accepted';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return '';
    const d = new Date(dateObj);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatTime = (dateObj) => {
    if (!dateObj) return '';
    const d = new Date(dateObj);
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${min}`;
  };

  const openDatePicker = () => {
    const existing = formData.incidentDate;
    const base = existing && existing.includes('/')
      ? (() => {
          const [dd, mm, yyyy] = existing.split('/');
          const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
          return isNaN(parsed.getTime()) ? new Date() : parsed;
        })()
      : new Date();
    setPickerDate(base);
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    const existing = formData.incidentTime;
    const now = new Date();
    if (existing && existing.includes(':')) {
      const [hh, mm] = existing.split(':');
      now.setHours(Number(hh) || 0);
      now.setMinutes(Number(mm) || 0);
    }
    setPickerDate(now);
    setShowTimePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event?.type === 'dismissed') return;
    const d = selectedDate || pickerDate;
    updateFormData('incidentDate', formatDate(d));
  };

  const onTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (event?.type === 'dismissed') return;
    const t = selectedTime || pickerDate;
    updateFormData('incidentTime', formatTime(t));
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
      // Build ISO datetime from separate inputs
      const [dd, mm, yyyy] = (formData.incidentDate || '').split('/');
      const [hh, min] = (formData.incidentTime || '00:00').split(':');
      const dt = new Date(Number(yyyy)||new Date().getFullYear(), (Number(mm)||1)-1, Number(dd)||1, Number(hh)||0, Number(min)||0, 0, 0);

      const payload = {
        policy_number: formData.policyNumber,
        product: 'MOTOR',
        loss_date: dt.toISOString(),
        loss_location: formData.incidentLocation,
        loss_description: formData.incidentDescription,
        documents: formData.documents.map(d => ({
          doc_type: d.doc_type || d.type,
          s3_key: d.s3_key || d.key,
          file_name: d.file_name || d.name,
          file_size: d.file_size || 0,
          content_type: d.content_type || 'application/octet-stream',
        })),
      };

      const api = new DjangoAPIService();
      await api.initialize?.();
      const resp = await api.submitClaim(payload);
      if (resp?.success || resp?.claim) {
        Alert.alert('Claim Submitted Successfully', 'Your claim has been submitted and will be reviewed shortly.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        throw new Error('Unexpected response');
      }
    } catch (error) {
      console.log('Submit claim error:', error?.message || error);
      Alert.alert('Error', 'Failed to submit claim. Please try again.');
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

  const selectPolicy = (policy) => {
    updateFormData('policyNumber', policy.policyNumber);
    updateFormData('policyType', policy.type);
    updateFormData('policyHolderName', policy.holderName);
    setShowPolicyModal(false);
  };

  const selectClaimType = (claimType) => {
    updateFormData('claimType', claimType);
    setShowClaimTypeModal(false);
  };

  const addDocument = async (docType) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false, type: '*/*' });
      if (res.canceled) return;
      const file = res.assets?.[0] || res;
      const fileName = file.name || `document_${Date.now()}`;
      const contentType = file.mimeType || 'application/octet-stream';
      const fileSize = file.size || 0;
      const uri = file.uri;

      const api = new DjangoAPIService();
      await api.initialize?.();
      const presign = await api.presignClaimDocument({ fileName, contentType, docType });
      if (!presign?.url || !presign?.fields) {
        Alert.alert('Upload Error', 'Failed to get upload URL.');
        return;
      }

      const form = new FormData();
      Object.entries(presign.fields).forEach(([k, v]) => form.append(k, String(v)));
      form.append('file', { uri, name: fileName, type: contentType });

      const uploadResp = await fetch(presign.url, { method: 'POST', body: form });
      if (!(uploadResp.status === 204 || uploadResp.status === 201)) {
        const txt = await uploadResp.text();
        throw new Error(`S3 upload failed (${uploadResp.status}): ${txt?.slice(0,200)}`);
      }

      const newDoc = {
        id: Date.now(),
        doc_type: docType,
        s3_key: presign.key || presign.fields?.key,
        file_name: fileName,
        file_size: fileSize,
        content_type: contentType,
      };
      updateFormData('documents', [...formData.documents, newDoc]);
    } catch (e) {
      console.log('Document upload error:', e?.message || e);
      Alert.alert('Upload Error', 'Could not upload document. Please try again.');
    }
  };

  const removeDocument = (docId) => {
    updateFormData('documents', formData.documents.filter(doc => doc.id !== docId));
  };

  const renderPolicyModal = () => (
    <Modal
      visible={showPolicyModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowPolicyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Policy</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowPolicyModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {isLoadingPolicies ? (
              <Text style={{ padding: 12, color: Colors.textSecondary }}>Loading policies...</Text>
            ) : policies.length === 0 ? (
              <Text style={{ padding: 12, color: Colors.textSecondary }}>No policies found.</Text>
            ) : (
              policies.map((policy) => (
                <TouchableOpacity 
                  key={policy.id}
                  style={styles.policyOption}
                  onPress={() => selectPolicy(policy)}
                >
                  <View style={styles.policyOptionHeader}>
                    <Text style={styles.policyOptionNumber}>{policy.policyNumber}</Text>
                    <StatusBadge status={policy.status} size="small" />
                  </View>
                  <Text style={styles.policyOptionType}>{policy.type}</Text>
                  {policy.holderName ? (
                    <Text style={styles.policyOptionHolder}>{policy.holderName}</Text>
                  ) : null}
                  {policy.vehicleReg ? (
                    <Text style={styles.policyOptionVehicle}>{policy.vehicleReg}</Text>
                  ) : null}
                  {policy.expiryDate ? (
                    <Text style={styles.policyOptionExpiry}>Expires: {policy.expiryDate}</Text>
                  ) : null}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

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
            step <= currentStep && styles.stepCircleActive
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
            {step === 1 && 'Policy'}
            {step === 2 && 'Incident'}
            {step === 3 && 'Claim'}
            {step === 4 && 'Documents'}
            {step === 5 && 'Review'}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Policy Information</Text>
      <Text style={styles.stepDescription}>Select your policy and verify details</Text>
      
      <TouchableOpacity 
        style={styles.policySelector}
        onPress={() => setShowPolicyModal(true)}
      >
        <Text style={styles.policySelectorLabel}>Select Policy</Text>
        <Text style={styles.policySelectorValue}>
          {formData.policyNumber || 'Tap to select policy'}
        </Text>
        <Text style={styles.policySelectorIcon}>▼</Text>
      </TouchableOpacity>
      {errors.policyNumber && <Text style={styles.errorText}>{errors.policyNumber}</Text>}
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Policy Type</Text>
        <TextInput
          style={[styles.input, errors.policyType && styles.inputError]}
          value={formData.policyType}
          editable={false}
          placeholder="Will be filled automatically"
          placeholderTextColor={Colors.textSecondary}
        />
        {errors.policyType && <Text style={styles.errorText}>{errors.policyType}</Text>}
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Policy Holder Name</Text>
        <TextInput
          style={[styles.input, errors.policyHolderName && styles.inputError]}
          value={formData.policyHolderName}
          editable={false}
          placeholder="Will be filled automatically"
          placeholderTextColor={Colors.textSecondary}
        />
        {errors.policyHolderName && <Text style={styles.errorText}>{errors.policyHolderName}</Text>}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Incident Details</Text>
      <Text style={styles.stepDescription}>When and where did the incident occur?</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Date of Incident *</Text>
        <TouchableOpacity onPress={openDatePicker} activeOpacity={0.8}>
          <View style={[styles.input, styles.inputWithIcon, errors.incidentDate && styles.inputError]}> 
            <Text style={formData.incidentDate ? styles.inputValue : styles.placeholderText}>
              {formData.incidentDate || 'DD/MM/YYYY'}
            </Text>
            <Text style={styles.suffixIcon}>📅</Text>
          </View>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}
        {errors.incidentDate && <Text style={styles.errorText}>{errors.incidentDate}</Text>}
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Time of Incident *</Text>
        <TouchableOpacity onPress={openTimePicker} activeOpacity={0.8}>
          <View style={[styles.input, styles.inputWithIcon, errors.incidentTime && styles.inputError]}>
            <Text style={formData.incidentTime ? styles.inputValue : styles.placeholderText}>
              {formData.incidentTime || 'HH:MM'}
            </Text>
            <Text style={styles.suffixIcon}>⏰</Text>
          </View>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={pickerDate}
            mode="time"
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}
        {errors.incidentTime && <Text style={styles.errorText}>{errors.incidentTime}</Text>}
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Location of Incident *</Text>
        <TextInput
          style={[styles.input, errors.incidentLocation && styles.inputError]}
          value={formData.incidentLocation}
          onChangeText={(text) => updateFormData('incidentLocation', text)}
          placeholder="Address or location details"
          placeholderTextColor={Colors.textSecondary}
        />
        {errors.incidentLocation && <Text style={styles.errorText}>{errors.incidentLocation}</Text>}
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description of Incident *</Text>
        <TextInput
          style={[styles.textArea, errors.incidentDescription && styles.inputError]}
          value={formData.incidentDescription}
          onChangeText={(text) => updateFormData('incidentDescription', text)}
          placeholder="Describe what happened in detail..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          numberOfLines={4}
        />
        {errors.incidentDescription && <Text style={styles.errorText}>{errors.incidentDescription}</Text>}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Claim Details</Text>
      <Text style={styles.stepDescription}>What type of claim are you making?</Text>
      
      <TouchableOpacity 
        style={styles.claimTypeSelector}
        onPress={() => setShowClaimTypeModal(true)}
      >
        <Text style={styles.claimTypeSelectorLabel}>Claim Type</Text>
        <Text style={styles.claimTypeSelectorValue}>
          {formData.claimType || 'Select claim type'}
        </Text>
        <Text style={styles.claimTypeSelectorIcon}>▼</Text>
      </TouchableOpacity>
      {errors.claimType && <Text style={styles.errorText}>{errors.claimType}</Text>}
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Estimated Claim Amount (KES) *</Text>
        <TextInput
          style={[styles.input, errors.claimAmount && styles.inputError]}
          value={formData.claimAmount}
          onChangeText={(text) => {
            // Allow only digits
            const cleaned = text.replace(/[^0-9]/g, '');
            updateFormData('claimAmount', cleaned);
          }}
          placeholder="0.00"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="number-pad"
        />
        {errors.claimAmount && <Text style={styles.errorText}>{errors.claimAmount}</Text>}
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Detailed Description *</Text>
        <TextInput
          style={[styles.textArea, errors.claimDescription && styles.inputError]}
          value={formData.claimDescription}
          onChangeText={(text) => updateFormData('claimDescription', text)}
          placeholder="Provide detailed description of the claim..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          numberOfLines={4}
        />
        {errors.claimDescription && <Text style={styles.errorText}>{errors.claimDescription}</Text>}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Supporting Documents</Text>
      <Text style={styles.stepDescription}>Upload documents to support your claim</Text>
      
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
                  <Text style={styles.documentName}>{doc.file_name || doc.name || doc.doc_type}</Text>
                  <Text style={styles.documentSize}>{doc.file_size ? `${(doc.file_size/1024/1024).toFixed(2)} MB` : ''}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeDocumentButton}
                  onPress={() => removeDocument(doc.id)}
                >
                  <Text style={styles.removeDocumentText}>✕</Text>
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
      <Text style={styles.stepTitle}>Review & Submit</Text>
      <Text style={styles.stepDescription}>Please review your claim details before submitting</Text>
      
      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Policy Information</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Policy Number:</Text>
          <Text style={styles.reviewValue}>{formData.policyNumber}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Policy Type:</Text>
          <Text style={styles.reviewValue}>{formData.policyType}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Policy Holder:</Text>
          <Text style={styles.reviewValue}>{formData.policyHolderName}</Text>
        </View>
      </View>
      
      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Incident Details</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Date:</Text>
          <Text style={styles.reviewValue}>{formData.incidentDate}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Time:</Text>
          <Text style={styles.reviewValue}>{formData.incidentTime}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Location:</Text>
          <Text style={styles.reviewValue}>{formData.incidentLocation}</Text>
        </View>
      </View>
      
      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Claim Information</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Claim Type:</Text>
          <Text style={styles.reviewValue}>{formData.claimType}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Amount:</Text>
          <Text style={styles.reviewValue}>KES {formData.claimAmount}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Documents:</Text>
          <Text style={styles.reviewValue}>{formData.documents.length} files</Text>
        </View>
      </View>
      
      <View style={styles.contactPreference}>
        <Text style={styles.contactLabel}>Preferred Contact Method</Text>
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
          style={styles.textArea}
          value={formData.additionalComments}
          onChangeText={(text) => updateFormData('additionalComments', text)}
          placeholder="Any additional information..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>
      
      <TouchableOpacity
        style={styles.declarationContainer}
        onPress={() => updateFormData('declarationAccepted', !formData.declarationAccepted)}
      >
        <View style={[
          styles.checkbox,
          formData.declarationAccepted && styles.checkboxChecked
        ]}>
          {formData.declarationAccepted && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.declarationText}>
          I declare that the information provided is true and correct to the best of my knowledge.
        </Text>
      </TouchableOpacity>
      {errors.declarationAccepted && <Text style={styles.errorText}>{errors.declarationAccepted}</Text>}
    </View>
  );

  

  const renderClaimTypeModal = () => (
    <Modal
      visible={showClaimTypeModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowClaimTypeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Claim Type</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowClaimTypeModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {claimTypes
              .filter(type => type.type === formData.policyType)
              .map(type => 
                type.categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.claimTypeOption}
                    onPress={() => selectClaimType(category)}
                  >
                    <Text style={styles.claimTypeOptionText}>{category}</Text>
                  </TouchableOpacity>
                ))
              )}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
    <SafeScreen>
      <StatusBar style="light" />
      
      <CompactCurvedHeader 
        title="Submit Claim"
        subtitle="File a new insurance claim"
        onBackPress={() => navigation.goBack()}
        showBackButton={true}
      />
      
      <View style={styles.container}>
        {renderProgressBar()}
        {renderStepIndicator()}
        
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        >
          <EnhancedCard style={styles.stepCard}>
            {renderCurrentStep()}
          </EnhancedCard>
        </ScrollView>
        
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[styles.footerButton, styles.backButton]}
            onPress={() => currentStep === 1 ? navigation.goBack() : handlePrevious()}
          >
            <Text style={styles.backButtonText}>
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.footerButton, styles.nextButton]}
            onPress={handleNext}
            disabled={isSubmitting}
          >
            <Text style={styles.nextButtonText}>
              {isSubmitting ? 'Submitting...' : 
               currentStep === totalSteps ? 'Submit Claim' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {renderPolicyModal()}
      {renderClaimTypeModal()}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
  },
  
  // Progress Bar
  progressContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundCard,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.success,
  },
  stepNumber: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  stepNumberActive: {
    color: Colors.backgroundCard,
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
  
  // Step Content
  stepCard: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  stepContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  stepTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  stepDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  
  // Form Elements
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.sm,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundCard,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  inputValue: {
    color: Colors.textPrimary,
  },
  suffixIcon: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.sm,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundCard,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  
  // Policy Selector
  policySelector: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
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
    color: Colors.textPrimary,
  },
  policySelectorIcon: {
    position: 'absolute',
    right: Spacing.sm,
    top: Spacing.sm + 20,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  
  // Claim Type Selector
  claimTypeSelector: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
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
    color: Colors.textPrimary,
  },
  claimTypeSelectorIcon: {
    position: 'absolute',
    right: Spacing.sm,
    top: Spacing.sm + 20,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  
  // Documents
  documentsContainer: {
    marginBottom: Spacing.md,
  },
  documentsLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  documentTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  documentTypeButton: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
    margin: Spacing.xs / 2,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  documentTypeText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  uploadedDocuments: {
    marginTop: Spacing.md,
  },
  uploadedDocumentsTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.xs,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  documentSize: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  removeDocumentButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeDocumentText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.backgroundCard,
  },
  
  // Review Section
  reviewSection: {
    marginBottom: Spacing.lg,
  },
  reviewSectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  reviewLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    flex: 1,
  },
  reviewValue: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  
  // Contact Preference
  contactPreference: {
    marginBottom: Spacing.md,
  },
  contactLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
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
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
  },
  contactOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  contactOptionText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  contactOptionTextActive: {
    color: Colors.primary,
  },
  
  // Declaration
  declarationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
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
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.backgroundCard,
  },
  declarationText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    flex: 1,
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: Colors.backgroundSecondary,
    marginRight: Spacing.sm,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    marginLeft: Spacing.sm,
  },
  backButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  nextButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.backgroundCard,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.backgroundCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  modalBody: {
    padding: Spacing.md,
  },
  
  // Policy Options
  policyOption: {
    padding: Spacing.md,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    marginBottom: Spacing.sm,
  },
  policyOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  policyOptionNumber: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  policyOptionType: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  policyOptionHolder: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  policyOptionVehicle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  policyOptionExpiry: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  
  // Claim Type Options
  claimTypeOption: {
    padding: Spacing.md,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    marginBottom: Spacing.sm,
  },
  claimTypeOptionText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
});
