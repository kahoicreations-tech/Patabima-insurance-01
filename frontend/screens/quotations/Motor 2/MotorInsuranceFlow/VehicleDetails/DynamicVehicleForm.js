import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, ScrollView, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import motorPricingService from '../../../../../services/MotorInsurancePricingService';

const DynamicPolicyForm = ({ selectedProduct, onDataChange, initialData = {}, values, onChange, errors = {}, productType, onUnderwriterComparison, onUnderwriterSelection }) => {
  const [formData, setFormData] = useState(initialData || values || {});
  const [validationErrors, setValidationErrors] = useState(errors);
  const [underwriterComparisons, setUnderwriterComparisons] = useState([]);
  const [comparingUnderwriters, setComparingUnderwriters] = useState(false);
  const [comparisonError, setComparisonError] = useState(null);
  const [lastComparisonData, setLastComparisonData] = useState(null);
  const [selectedUnderwriter, setSelectedUnderwriter] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Ref to track comparison trigger and prevent duplicates
  const comparisonTriggerRef = useRef(null);
  const comparisonTimeoutRef = useRef(null);

  // Check if a field should be locked (TOR/Third Party with auto-filled data)
  const isFieldLocked = useCallback((fieldKey) => {
    // Check if form data has global lock flag
    const globalLock = formData.isLocked === true;
    
    // Check if specific field has lock metadata
    const fieldHasAutoFill = formData[`${fieldKey}_isAutoFilled`] === true;
    const fieldFromLogbook = formData[`${fieldKey}_autoFillSource`] === 'logbook';
    
    // Fields that can be locked: make, model, year, registrationNumber, chassisNumber
    const lockableFields = ['make', 'model', 'year', 'registrationNumber', 'chassisNumber'];
    
    // Lock if: global lock flag is set AND field is lockable AND has auto-fill data
    return globalLock && lockableFields.includes(fieldKey) && fieldHasAutoFill && fieldFromLogbook;
  }, [formData]);

  // Render a locked field with visual indicator and unlock option
  const renderLockedField = useCallback((field) => {
    const value = formData[field.key] || '';
    const canUnlock = true; // Allow manual override in case extraction was incorrect
    
    const handleUnlock = () => {
      // Remove lock flags to allow editing
      const updatedData = { ...formData };
      delete updatedData.isLocked;
      delete updatedData[`${field.key}_isAutoFilled`];
      delete updatedData[`${field.key}_autoFillSource`];
      setFormData(updatedData);
      
      // Notify parent
      if (onChange) {
        onChange(updatedData);
      }
      if (onDataChange) {
        onDataChange(updatedData);
      }
    };
    
    return (
      <View key={field.key} style={styles.fieldContainer}>
        <View style={styles.lockedFieldHeader}>
          <Text style={styles.label}>
            {field.label} {field.required && <Text style={styles.required}>*</Text>}
          </Text>
          <Text style={styles.lockedBadge}>🔒 Auto-filled from Logbook</Text>
        </View>
        <View style={styles.lockedInputContainer}>
          <TextInput
            style={[styles.input, styles.lockedInput]}
            value={value}
            editable={false}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          />
          {canUnlock && (
            <TouchableOpacity 
              style={styles.unlockButton}
              onPress={handleUnlock}
            >
              <Text style={styles.unlockButtonText}>🔓 Unlock</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.lockedHelpText}>
          This field was auto-filled from your logbook. Tap unlock to edit manually.
        </Text>
      </View>
    );
  }, [formData, onChange, onDataChange]);

  // Define form fields based on product requirements
  const getFormFields = () => {
    if (!selectedProduct && !productType) return getBaseFields();

    const category = selectedProduct?.category?.toLowerCase() || productType?.toLowerCase();
    const coverage = selectedProduct?.coverage_type || (productType === 'COMPREHENSIVE' ? 'comprehensive' : 'third_party');

    const baseFields = getBaseFields(coverage);

    // Add category-specific fields
    switch (category) {
      case 'commercial':
        baseFields.push(
          { 
            key: 'tonnage', 
            label: 'Vehicle Tonnage', 
            type: 'select', 
            required: true, 
            options: ['Upto 3 Tons', '3.1 - 5 Tons', '5.1 - 7 Tons', '7.1 - 10 Tons', '10.1 - 15 Tons', '15.1 - 20 Tons', 'Over 20 Tons'] 
          },
          { key: 'usage', label: 'Commercial Usage', type: 'text', required: true }
        );
        break;
      case 'psv':
        baseFields.push(
          { key: 'passengerCapacity', label: 'Passenger Capacity', type: 'number', required: true },
          { key: 'route', label: 'Operating Route', type: 'text', required: false }
        );
        break;
      case 'motorcycle':
        baseFields.push(
          { key: 'engineCapacity', label: 'Engine Capacity (CC)', type: 'number', required: true }
        );
        break;
      case 'tuktuk':
        baseFields.push(
          { key: 'capacity', label: 'Carrying Capacity', type: 'text', required: true }
        );
        break;
    }

    // Add comprehensive coverage fields
    if (coverage === 'comprehensive' || productType === 'COMPREHENSIVE') {
      baseFields.push(
        { key: 'sum_insured', label: 'Sum Insured (KSh)', type: 'currency', required: true },
        // Add comprehensive add-on fields
        { 
          key: 'windscreen_value', 
          label: 'Windscreen Value (KSh)', 
          type: 'currency', 
          required: false,
          help: 'Enter the replacement value of your vehicle windscreen',
          placeholder: '30000',
          visible: () => true
        },
        { 
          key: 'radio_cassette_value', 
          label: 'Radio/Cassette Value (KSh)', 
          type: 'currency', 
          required: false,
          help: 'Enter the replacement value of your vehicle audio system',
          placeholder: '25000',
          visible: () => true
        },
        { 
          key: 'vehicle_accessories_value', 
          label: 'Other Accessories Value (KSh)', 
          type: 'currency', 
          required: false,
          help: 'Total value of other vehicle accessories (rims, spoilers, etc.)',
          placeholder: '20000',
          visible: () => true
        },
        // Do NOT show underwriters in Vehicle Details for Comprehensive.
        // Underwriter selection and comparison will happen on the dedicated Underwriter screen (Step 4).
      );
    } else {
      // For non-comprehensive (TOR, Third Party), add underwriter right after cover start date
      baseFields.push(
        { key: 'selectedUnderwriter', label: 'Available Underwriters', type: 'underwriter', required: true, dependsOn: 'cover_start_date' }
      );
    }

    return baseFields;
  };

  // Helper functions for dynamic field labels and placeholders
  const getIdentificationLabel = () => {
    const identificationType = formData.identificationType;
    if (identificationType === 'Chassis Number') {
      return 'Chassis Number';
    }
    return 'Registration Number';
  };

  const getIdentificationPlaceholder = () => {
    const identificationType = formData.identificationType;
    if (identificationType === 'Chassis Number') {
      return 'Enter chassis number';
    }
    return 'KAA 123A';
  };

  const getBaseFields = (coverage = null) => {
    const fields = [
      { key: 'financialInterest', label: 'Financial Interest', type: 'radio', required: true, options: ['Yes', 'No'] },
      { key: 'identificationType', label: 'Vehicle Identification Type', type: 'radio', required: true, options: ['Vehicle Registration', 'Chassis Number'] },
      { key: 'registrationNumber', label: getIdentificationLabel(), type: 'text', required: true, placeholder: getIdentificationPlaceholder() },
      
      // Cover Start Date - moved from pricing step
      { key: 'cover_start_date', label: 'Cover Start Date', type: 'date', required: true, defaultValue: new Date().toISOString().split('T')[0] },
      

    ];

    // Only add vehicle details (make, model, year) for non-third party coverage
    // Check if this is a third-party type product (including TOR)
    // TOR (Time On Risk) should have the same form fields as Third-Party
    const subcategoryCode = selectedProduct?.subcategory_code?.toLowerCase() || '';
    const coverageType = (selectedProduct?.coverage_type || coverage || '').toLowerCase();
    
    const isThirdParty = (
      coverageType.includes('third_party') || 
      coverageType.includes('third-party') || 
      coverageType === 'tor' ||
      coverageType.includes('tpo') ||
      subcategoryCode.includes('tor') ||
      subcategoryCode.includes('third_party') ||
      subcategoryCode.includes('third-party')
    );

    // Only add Make/Model/Year for Comprehensive and other non-third-party products
    if (!isThirdParty) {
      fields.push(
        { key: 'make', label: 'Vehicle Make', type: 'text', required: true, placeholder: 'Toyota' },
        { key: 'model', label: 'Vehicle Model', type: 'text', required: true, placeholder: 'Axio' },
        { key: 'year', label: 'Year of Manufacture', type: 'number', required: true, placeholder: '2016' }
      );
    }

    return fields;
  };

  // Check if we can trigger underwriter comparison
  const canCompareUnderwriters = useCallback(() => {
    if (!selectedProduct || !selectedProduct.category || !selectedProduct.coverage_type) {
      return false;
    }

    const requiredFields = ['registrationNumber', 'cover_start_date'];
    
    // Check basic required fields including cover start date
    const hasRequired = requiredFields.every(field => formData[field] && formData[field].toString().trim());
    if (!hasRequired) return false;

    // For comprehensive insurance, need sum_insured
    const isComprehensive = selectedProduct.coverage_type?.toLowerCase().includes('comprehensive');
    // Disable underwriter comparison on Vehicle Details for Comprehensive to avoid duplication
    if (isComprehensive) return false;

    // For commercial, need tonnage
    const isCommercial = selectedProduct.category?.toLowerCase() === 'commercial';
    if (isCommercial && !formData.tonnage) {
      return false;
    }

    // For PSV, need passenger capacity
    const isPSV = selectedProduct.category?.toLowerCase() === 'psv';
    if (isPSV && (!formData.passengerCapacity || Number(formData.passengerCapacity) <= 0)) {
      return false;
    }

    return true;
  }, [selectedProduct, formData]);

  // Memoize comparison trigger data to prevent unnecessary calls
  // This creates a stable signature of the data that triggers comparison
  const comparisonKey = useMemo(() => {
    if (!selectedProduct) return null;
    // Do not trigger comparisons from the Vehicle Details step for Comprehensive
    if (selectedProduct.coverage_type?.toLowerCase().includes('comprehensive')) return null;

    const subcategory_code = selectedProduct?.subcategory_code || selectedProduct?.code;
    const category = selectedProduct?.category?.toUpperCase();
    const coverType = selectedProduct?.coverage_type?.toUpperCase();
    
    // Create signature with only the fields that affect pricing
    return JSON.stringify({
      subcategory: subcategory_code,
      category: category,
      coverType: coverType,
      registration: formData.registrationNumber,
      sumInsured: formData.sum_insured,
      tonnage: formData.tonnage,
      capacity: formData.passengerCapacity,
      engineCapacity: formData.engineCapacity,
      coverDate: formData.cover_start_date
    });
  }, [
    selectedProduct?.subcategory_code,
    selectedProduct?.code,
    selectedProduct?.category,
    selectedProduct?.coverage_type,
    formData.registrationNumber,
    formData.sum_insured,
    formData.tonnage,
    formData.passengerCapacity,
    formData.engineCapacity,
    formData.cover_start_date
  ]);

  // Trigger underwriter comparison when form is ready
  const triggerUnderwriterComparison = useCallback(async () => {
    if (!canCompareUnderwriters() || comparingUnderwriters) {
      return;
    }

    // Use subcategory_code directly if available, otherwise fall back to category + coverType
    const subcategory_code = selectedProduct?.subcategory_code || selectedProduct?.code;
    const category = selectedProduct?.category?.toUpperCase();
    const coverType = selectedProduct?.coverage_type?.toUpperCase();
    
    // Create a signature of the current data to avoid repeated calls
    const currentDataSignature = JSON.stringify({
      subcategory_code,
      category,
      coverType,
      registrationNumber: formData.registrationNumber,
      sum_insured: formData.sum_insured,
      tonnage: formData.tonnage,
      passengerCapacity: formData.passengerCapacity,
    });

    // Don't repeat the same comparison
    if (lastComparisonData === currentDataSignature) {
      return;
    }
    
    setComparingUnderwriters(true);
    setComparisonError(null);
    setLastComparisonData(currentDataSignature);

    try {
      console.log('Triggering underwriter comparison for:', { subcategory_code, category, coverType, formData });
      
      let comparisons;
      
      // If we have a specific subcategory_code, use it directly
      if (subcategory_code) {
        // Use the subcategory directly for comparison
        const enhancedFormData = {
          ...formData,
          subcategory_code: subcategory_code,
          category: category
        };
        
        comparisons = await motorPricingService.compareUnderwritersBySubcategory(
          subcategory_code,
          enhancedFormData
        );
      } else {
        // Fall back to the old method if no subcategory_code
        comparisons = await motorPricingService.compareUnderwritersByCoverType(
          category,
          coverType,
          formData
        );
      }

      console.log('Underwriter comparisons received:', comparisons);
      setUnderwriterComparisons(comparisons);
      
      // Notify parent if callback provided
      if (onUnderwriterComparison) {
        onUnderwriterComparison(comparisons);
      }

    } catch (error) {
      console.error('Failed to compare underwriters:', error);
      setComparisonError(error.message);
      setUnderwriterComparisons([]);
      // Reset the signature on error so it can be retried
      setLastComparisonData(null);
    } finally {
      setComparingUnderwriters(false);
    }
  }, [selectedProduct, formData, canCompareUnderwriters, comparingUnderwriters, onUnderwriterComparison, lastComparisonData]);

  // Auto-trigger underwriter comparison with debouncing when comparisonKey changes
  useEffect(() => {
    // Skip auto comparisons for Comprehensive on Vehicle Details screen
    if (selectedProduct?.coverage_type?.toLowerCase().includes('comprehensive')) {
      return;
    }
    // Clear any existing timeout
    if (comparisonTimeoutRef.current) {
      clearTimeout(comparisonTimeoutRef.current);
    }

    // Check if we can and should trigger comparison
    if (!comparisonKey || !canCompareUnderwriters()) {
      return;
    }

    // Prevent duplicate calls - check if this key was already processed
    if (comparisonTriggerRef.current === comparisonKey) {
      console.log('⏭️ Skipping duplicate underwriter comparison (already fetched)');
      return;
    }

    // Mark this key as being processed
    comparisonTriggerRef.current = comparisonKey;

    // Longer debounce (3 seconds) to reduce unnecessary API calls while user is still typing
    comparisonTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Auto-triggering underwriter comparison (debounced 3s)');
      triggerUnderwriterComparison();
    }, 3000);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (comparisonTimeoutRef.current) {
        clearTimeout(comparisonTimeoutRef.current);
      }
    };
  }, [comparisonKey, canCompareUnderwriters, triggerUnderwriterComparison, selectedProduct?.coverage_type]);



  const handleInputChange = (key, value) => {
    // Format currency inputs
    if (getFormFields().find(f => f.key === key)?.type === 'currency') {
      value = value.replace(/[^0-9]/g, '');
    }

    const newFormData = { ...formData, [key]: value };
    setFormData(newFormData);

    // Real-time validation
    const error = validateField(key, value);
    setValidationErrors(prev => ({
      ...prev,
      [key]: error
    }));

    // Notify parent component
    if (onDataChange) {
      onDataChange(newFormData);
    }
    if (onChange) {
      onChange(newFormData);
    }


  };

  const validateField = (key, value) => {
    const field = getFormFields().find(f => f.key === key);
    if (!field) return null;

    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} is required`;
    }

    switch (field.type) {
      case 'number':
        if (value && isNaN(Number(value))) {
          return `${field.label} must be a valid number`;
        }
        break;
      case 'currency':
        if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
          return `${field.label} must be a valid positive amount`;
        }
        break;
      case 'date':
        if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return `${field.label} must be in YYYY-MM-DD format`;
        }
        if (value) {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return `${field.label} must be a valid date`;
          }
          // Don't allow dates too far in the past
          const minDate = new Date();
          minDate.setFullYear(minDate.getFullYear() - 1);
          if (date < minDate) {
            return `${field.label} cannot be more than 1 year in the past`;
          }
        }
        break;
      case 'text':
        if (key === 'registrationNumber' && value) {
          const identificationType = formData.identificationType;
          if (identificationType === 'Vehicle Registration') {
            if (!/^[A-Z0-9\s]+$/i.test(value)) {
              return 'Registration number contains invalid characters';
            }
          } else if (identificationType === 'Chassis Number') {
            if (!/^[A-Z0-9]+$/i.test(value)) {
              return 'Chassis number should contain only letters and numbers without spaces';
            }
          }
        }
        break;
    }

    return null;
  };

  const renderField = (field) => {
    // Check if this field should be locked
    if (isFieldLocked(field.key)) {
      return renderLockedField(field);
    }
    
    switch (field.type) {
      case 'select':
        return (
          <View key={field.key} style={styles.fieldContainer}>
            <Text style={styles.label}>
              {field.label} {field.required && <Text style={styles.required}>*</Text>}
            </Text>
            <View style={styles.selectContainer}>
              {field.options.map((option, index) => {
                // Ensure option is treated as string
                const optionText = typeof option === 'string' ? option : (option.label || option.toString());
                const optionValue = typeof option === 'string' ? option : (option.value || option.label || option.toString());
                
                return (
                  <TouchableOpacity
                    key={`${field.key}-${index}`}
                    style={[
                      styles.selectOption,
                      formData[field.key] === optionValue && styles.selectedOption
                    ]}
                    onPress={() => handleInputChange(field.key, optionValue)}
                  >
                    <Text style={[
                      styles.selectText,
                      formData[field.key] === optionValue && styles.selectedText
                    ]}>
                      {optionText}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {field.help && (
              <Text style={styles.helpText}>{field.help}</Text>
            )}
            {validationErrors[field.key] && (
              <Text style={styles.errorText}>{validationErrors[field.key]}</Text>
            )}
          </View>
        );

      case 'date':
        const dateValue = formData[field.key] || field.defaultValue;
        const displayDate = dateValue ? new Date(dateValue) : new Date();
        
        return (
          <View key={field.key} style={styles.fieldContainer}>
            <Text style={styles.label}>
              {field.label} {field.required && <Text style={styles.required}>*</Text>}
            </Text>
            <TouchableOpacity
              style={[
                styles.dateInput,
                validationErrors[field.key] && styles.inputError
              ]}
              onPress={() => setShowDatePicker(field.key)}
            >
              <Text style={[
                styles.dateInputText,
                !dateValue && styles.placeholderText
              ]}>
                {dateValue ? displayDate.toLocaleDateString() : 'Select date'}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker === field.key && (
              <DateTimePicker
                value={displayDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') {
                    setShowDatePicker(false);
                  }
                  if (event?.type === 'dismissed') return;
                  if (selectedDate) {
                    const formattedDate = selectedDate.toISOString().split('T')[0];
                    handleInputChange(field.key, formattedDate);
                  }
                }}
                minimumDate={new Date()}
              />
            )}
            
            {validationErrors[field.key] && (
              <Text style={styles.errorText}>{validationErrors[field.key]}</Text>
            )}
          </View>
        );

      case 'radio':
        return (
          <View key={field.key} style={styles.fieldContainer}>
            <Text style={styles.label}>
              {field.label} {field.required && <Text style={styles.required}>*</Text>}
            </Text>
            <View style={styles.radioContainer}>
              {field.options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.radioOption}
                  onPress={() => handleInputChange(field.key, option)}
                >
                  <View style={[
                    styles.radioCircle,
                    formData[field.key] === option && styles.radioSelected
                  ]}>
                    {formData[field.key] === option && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                  <Text style={[
                    styles.radioText,
                    formData[field.key] === option && styles.radioTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {validationErrors[field.key] && (
              <Text style={styles.errorText}>{validationErrors[field.key]}</Text>
            )}
          </View>
        );

      case 'underwriter':
        // Hide underwriters in Vehicle Details for Comprehensive; handled in dedicated Underwriter screen
        if (selectedProduct?.coverage_type?.toLowerCase().includes('comprehensive')) {
          return null;
        }
        
        // Show loading state
        if (comparingUnderwriters) {
          return (
            <View key={field.key} style={styles.fieldContainer}>
              <Text style={styles.label}>
                {field.label} {field.required && <Text style={styles.required}>*</Text>}
              </Text>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#D5222B" />
                <Text style={styles.loadingText}>Comparing underwriter prices...</Text>
              </View>
            </View>
          );
        }
        
        // Only show underwriters if comparisons are available
        if (underwriterComparisons.length === 0) {
          return null;
        }
        
        return (
          <View key={field.key} style={styles.fieldContainer}>
            <Text style={styles.label}>
              {field.label} {field.required && <Text style={styles.required}>*</Text>}
            </Text>
            <View style={styles.underwriterFieldContainer}>
              {underwriterComparisons.map((comparison, index) => (
                <TouchableOpacity 
                  key={comparison.id || index} 
                  style={[
                    styles.underwriterOption,
                    formData[field.key] === comparison.name && styles.selectedUnderwriterOption
                  ]}
                  onPress={() => {
                    setSelectedUnderwriter(comparison);
                    handleInputChange(field.key, comparison.name);
                    // Notify parent component about underwriter selection
                    if (onUnderwriterSelection) {
                      onUnderwriterSelection(comparison);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.underwriterOptionContent}>
                    <View style={styles.underwriterHeader}>
                      <View style={styles.underwriterInfo}>
                        <Text style={[
                          styles.underwriterOptionName,
                          formData[field.key] === comparison.name && styles.selectedUnderwriterText
                        ]}>
                          {comparison.name}
                        </Text>
                        <Text style={styles.marketPositionBadge}>
                          {comparison.market_position || 'Standard'}
                        </Text>
                      </View>
                      <Text style={[
                        styles.underwriterOptionPrice,
                        formData[field.key] === comparison.name && styles.selectedUnderwriterText
                      ]}>
                        KSh {comparison.total_premium?.toLocaleString() || 'N/A'}
                      </Text>
                    </View>
                    
                    {/* Calculation Summary (uses backend breakdown when available) */}
                    <View style={styles.calculationSummary}>
                      {(() => {
                        const base = Number(
                          comparison.breakdown?.base ??
                          comparison.breakdown?.base_premium ??
                          comparison.base_premium ??
                          comparison.premium ??
                          0
                        );
                        const itl = Number(
                          comparison.breakdown?.training_levy ??
                          comparison.training_levy ??
                          (base * 0.0025)
                        );
                        const pcf = Number(
                          comparison.breakdown?.pcf_levy ??
                          comparison.pcf_levy ??
                          (base * 0.0025)
                        );
                        const stamp = Number(
                          comparison.breakdown?.stamp_duty ??
                          comparison.stamp_duty ??
                          40
                        );
                        const total = Number(
                          comparison.total_premium ??
                          comparison.totalPremium ??
                          (base + itl + pcf + stamp)
                        );
                        return (
                          <>
                            <Text style={styles.calculationLabel}>Calculation Breakdown:</Text>
                            <View style={styles.calculationRow}>
                              <Text style={styles.calculationItem}>
                                Base Premium: KSh {base.toLocaleString()}
                              </Text>
                              <Text style={styles.calculationItem}>
                                Training Levy (0.25%): KSh {itl.toFixed(2)}
                              </Text>
                            </View>
                            <View style={styles.calculationRow}>
                              <Text style={styles.calculationItem}>
                                PCF Levy (0.25%): KSh {pcf.toFixed(2)}
                              </Text>
                              <Text style={styles.calculationItem}>
                                Stamp Duty: KSh {stamp.toFixed(2)}
                              </Text>
                            </View>
                            <View style={styles.calculationTotal}>
                              <Text style={styles.calculationTotalText}>
                                Total Premium: KSh {total.toLocaleString()}
                              </Text>
                            </View>
                          </>
                        );
                      })()}
                    </View>
                  </View>
                  {formData[field.key] === comparison.name && (
                    <Text style={styles.underwriterSelectedIcon}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {validationErrors[field.key] && (
              <Text style={styles.errorText}>{validationErrors[field.key]}</Text>
            )}
          </View>
        );

      default:
        // Handle dynamic labels and placeholders for registration field
        const dynamicLabel = field.key === 'registrationNumber' ? getIdentificationLabel() : field.label;
        const dynamicPlaceholder = field.key === 'registrationNumber' ? getIdentificationPlaceholder() : (field.placeholder || `Enter ${field.label.toLowerCase()}`);
        
        return (
          <View key={field.key} style={styles.fieldContainer}>
            <Text style={styles.label}>
              {dynamicLabel} {field.required && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
              style={[
                styles.input,
                validationErrors[field.key] && styles.inputError
              ]}
              value={formData[field.key] || ''}
              onChangeText={(value) => handleInputChange(field.key, value)}
              placeholder={dynamicPlaceholder}
              keyboardType={field.type === 'number' || field.type === 'currency' ? 'numeric' : 'default'}
              autoCapitalize={field.key === 'registrationNumber' ? 'characters' : 'words'}
            />
            {validationErrors[field.key] && (
              <Text style={styles.errorText}>{validationErrors[field.key]}</Text>
            )}
          </View>
        );
    }
  };

  // Initialize once when product changes; avoid depending on object props to prevent loops
  useEffect(() => {
    const initialFormData = initialData || values || {};
    // Only update if content actually changed to avoid re-render loops
    const sameKeys = Object.keys(initialFormData).length === Object.keys(formData || {}).length;
    const isSame = sameKeys && Object.keys(initialFormData).every(k => initialFormData[k] === formData[k]);
    if (!isSame) {
      setFormData(initialFormData);
    }
    if (errors && errors !== validationErrors) {
      setValidationErrors(errors);
    }
    
    // Clear comparisons when product/subcategory changes to prevent showing stale data
    setUnderwriterComparisons([]);
    setSelectedUnderwriter(null);
    setComparisonError(null);
    setLastComparisonData(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct?.id, selectedProduct?.subcategory_code, selectedProduct?.code, productType]);

  // Trigger underwriter comparison when form data is ready
  useEffect(() => {
    if (canCompareUnderwriters() && !comparingUnderwriters && underwriterComparisons.length === 0) {
      // Only trigger if we don't already have comparisons
      // Debounce the comparison to avoid too many API calls
      const timeoutId = setTimeout(triggerUnderwriterComparison, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [
    // Only depend on essential form data changes, not the functions themselves
    selectedProduct?.coverage_type,
    selectedProduct?.category,
    selectedProduct?.subcategory_code, // Add subcategory_code to trigger on subcategory change
    selectedProduct?.code, // Also check for 'code' field as backup
    formData.registrationNumber,
    formData.sum_insured,
    formData.tonnage,
    formData.passengerCapacity,
    formData.cover_start_date, // Add cover_start_date to trigger underwriter comparison
    canCompareUnderwriters,
    comparingUnderwriters,
    underwriterComparisons.length
  ]);
  // Legacy support for simple form rendering
  if (!selectedProduct && productType) {
    return (
      <View style={styles.legacyContainer}>
        {getFormFields().map(renderField)}
        {errors.form && <Text style={styles.errorText}>{errors.form}</Text>}
      </View>
    );
  }

  if (!selectedProduct && !productType) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Please select a product to continue</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.formContainer}>
        {getFormFields().map(renderField)}
      </View>





    </ScrollView>
  );
};

// Helper functions for underwriter comparison functionality
const canCompareUnderwriters = () => {
  if (!formData) return false;
  
  // Check if we have the minimum required fields for pricing comparison
  const hasCategory = formData.category;
  const hasCoverType = formData.cover_type;
  const hasVehicleValue = formData.sum_insured || formData.vehicle_value;
  
  // For TOR and Third Party, we don't need vehicle value
  if (hasCoverType && (formData.cover_type === 'TOR' || formData.cover_type === 'Third Party')) {
    return hasCategory && hasCoverType;
  }
  
  // For Comprehensive, we need vehicle value/sum insured
  return hasCategory && hasCoverType && hasVehicleValue;
};

const triggerUnderwriterComparison = async () => {
  if (!canCompareUnderwriters() || comparingUnderwriters) return;
  
  try {
    setComparingUnderwriters(true);
    setComparisonError(null);
    
    const pricingData = {
      category: formData.category,
      cover_type: formData.cover_type,
      sum_insured: formData.sum_insured || formData.vehicle_value || 0,
      // Add any other relevant pricing fields
      vehicle_year: formData.vehicle_year,
      engine_size: formData.engine_size,
      tonnage: formData.tonnage,
      passenger_capacity: formData.passenger_capacity,
    };
    
    console.log('Triggering underwriter comparison with data:', pricingData);
    
    const comparisonResult = await motorPricingService.comparePricingByCoverType(pricingData);
    
    if (comparisonResult && comparisonResult.underwriters && Array.isArray(comparisonResult.underwriters)) {
      setUnderwriterComparisons(comparisonResult.underwriters);
      console.log('Underwriter comparison successful:', comparisonResult.underwriters.length, 'underwriters found');
    } else {
      setComparisonError('No underwriter pricing data available');
      setUnderwriterComparisons([]);
    }
  } catch (error) {
    console.error('Error comparing underwriters:', error);
    setComparisonError(error.message || 'Failed to compare underwriter prices');
    setUnderwriterComparisons([]);
  } finally {
    setComparingUnderwriters(false);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  legacyContainer: {
    gap: 12,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#646767',
    fontWeight: '500',
  },
  formContainer: {
    padding: 12,
    gap: 10,
  },
  fieldContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 6,
  },
  required: {
    color: '#D5222B',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    fontSize: 15,
    color: '#2c3e50',
  },
  inputError: {
    borderColor: '#D5222B',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    minHeight: 44,
  },
  dateInputText: {
    fontSize: 15,
    color: '#2c3e50',
  },
  placeholderText: {
    color: '#6c757d',
  },
  selectContainer: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ced4da',
    minHeight: 44,
  },
  selectOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    minHeight: 44,
    justifyContent: 'center',
  },
  selectText: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 18,
  },
  selectedOption: {
    backgroundColor: '#e7f5ff',
  },
  selectedText: {
    color: '#1864ab',
    fontWeight: '600',
  },
  errorText: {
    color: '#d90429',
    fontSize: 11,
    marginTop: 3,
  },
  helpText: {
    color: '#646767',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 3,
  },
  radioContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ced4da',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#D5222B',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D5222B',
  },
  radioText: {
    fontSize: 16,
    color: '#495057',
  },
  radioTextSelected: {
    color: '#D5222B',
    fontWeight: '600',
  },
  summaryContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#646767',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#646767',
    textAlign: 'center',
  },
  // Underwriter comparison styles
  comparisonContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    color: '#646767',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  errorIcon: {
    fontSize: 24,
  },
  retryButton: {
    backgroundColor: '#D5222B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  underwriterList: {
    marginTop: 16,
    gap: 0,
  },
  selectedUnderwriterCard: {
    borderColor: '#D5222B',
    borderWidth: 2,
    backgroundColor: '#fef7f7',
  },
  selectedUnderwriterName: {
    color: '#D5222B',
  },
  selectedUnderwriterPrice: {
    color: '#D5222B',
  },
  selectedIndicator: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D5222B',
  },
  underwriterCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 8,
  },
  underwriterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  underwriterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    flex: 1,
    marginBottom: 4,
  },
  positionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  budgetBadge: {
    backgroundColor: '#e8f5e8',
  },
  competitiveBadge: {
    backgroundColor: '#e3f2fd',
  },
  premiumBadge: {
    backgroundColor: '#fff3e0',
  },
  positionText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    lineHeight: 16,
  },
  budgetText: {
    color: '#2e7d32',
  },
  competitiveText: {
    color: '#1565c0',
  },
  premiumText: {
    color: '#ef6c00',
  },
  underwriterPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D5222B',
    marginBottom: 4,
    lineHeight: 20,
  },
  underwriterRating: {
    fontSize: 14,
    color: '#646767',
    lineHeight: 18,
  },
  summaryHighlight: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
    marginTop: 4,
  },
  underwriterFieldContainer: {
    gap: 8,
  },
  underwriterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  selectedUnderwriterOption: {
    borderColor: '#D5222B',
    backgroundColor: '#fef7f7',
  },
  underwriterOptionContent: {
    flex: 1,
  },
  underwriterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  underwriterInfo: {
    flex: 1,
  },
  underwriterOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  marketPositionBadge: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6c757d',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  underwriterOptionPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D5222B',
  },
  calculationSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
  calculationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  calculationItem: {
    fontSize: 11,
    color: '#6c757d',
    flex: 1,
  },
  calculationTotal: {
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    paddingTop: 4,
    marginTop: 4,
  },
  calculationTotalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D5222B',
    textAlign: 'right',
  },
  selectedUnderwriterText: {
    color: '#D5222B',
  },
  underwriterSelectedIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D5222B',
    marginLeft: 8,
  },
  // Locked field styles for Day 10
  lockedFieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lockedBadge: {
    fontSize: 11,
    color: '#646767',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontWeight: '500',
  },
  lockedInputContainer: {
    position: 'relative',
  },
  lockedInput: {
    backgroundColor: '#f8f9fa',
    color: '#495057',
    borderColor: '#dee2e6',
  },
  unlockButton: {
    position: 'absolute',
    right: 8,
    top: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  unlockButtonText: {
    fontSize: 12,
    color: '#646767',
    fontWeight: '500',
  },
  lockedHelpText: {
    fontSize: 11,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 8,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6c757d',
  },

});

export default DynamicPolicyForm;
