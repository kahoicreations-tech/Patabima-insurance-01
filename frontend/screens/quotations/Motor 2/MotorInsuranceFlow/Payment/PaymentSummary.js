import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const formatCurrency = (amount) => `KSh ${(Number(amount) || 0).toLocaleString()}`;

export default function PaymentSummary({ selectedProduct, vehicleData, premium, additionalCoverages, underwriter, clientDetails, selectedAddons, addonsPremium, addonsBreakdown, compact = false }) {

  // Debug: Check what data we're receiving
  console.log('PaymentSummary Props:', {
    selectedProduct,
    vehicleData,
    premium,
    underwriter,
    clientDetails,
    additionalCoverages
  });
  console.log('Client Details Keys:', Object.keys(clientDetails || {}));
  console.log('Vehicle Data Keys:', Object.keys(vehicleData || {}));

  // Build a normalized view of vehicle data for uniform display
  const normalizedVehicle = useMemo(() => {
    const toUpper = (s) => (s ?? '').toString().toUpperCase().replace(/\s+/g, ' ').trim();
    const pick = (...keys) => {
      for (let k of keys) {
        // Prefer values from vehicleData, but allow fallback to clientDetails
        const v = (vehicleData && vehicleData[k] !== undefined ? vehicleData[k] : clientDetails?.[k]);
        if (v !== undefined && v !== null && String(v).trim() !== '') return v;
      }
      return undefined;
    };
    const rawReg = pick('registration', 'registrationNumber', 'vehicle_registration', 'reg_number', 'Vehicle_Registration');
    const rawMake = pick('vehicle_make', 'make');
    const rawModel = pick('vehicle_model', 'model');
    const rawYear = pick('year', 'vehicle_year');
    const rawCoverStart = pick('cover_start_date', 'coverStartDate');

    const formatISO = (d) => {
      if (!d) return undefined;
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return undefined;
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    return {
      registration: toUpper(rawReg || ''),
      make: toUpper(rawMake || ''),
      model: toUpper(rawModel || ''),
      year: rawYear ? Number(rawYear) : undefined,
      coverStart: formatISO(rawCoverStart),
      // Preserve raw for any additional category-specific rows below
      raw: { ...(vehicleData || {}), ...(clientDetails || {}) },
    };
  }, [vehicleData, clientDetails]);

  // If underwriter is selected, use their exact calculated values
  if (underwriter) {
    const base = underwriter.premium || underwriter.breakdown?.base || 0;
    const itl = ((base * 0.0025)).toFixed(2); // Training Levy as shown in underwriter
    const pcf = ((base * 0.0025)).toFixed(2); // PCF Levy as shown in underwriter  
    const stamp = 40; // Stamp Duty
    const total = underwriter.total_premium || (Number(base) + Number(itl) + Number(pcf) + Number(stamp));
    
    // Calculate add-ons from both selected add-ons and underwriter-specific add-ons
    const contextAddons = Number(addonsPremium) || 0;
    const underwriterAddons = Array.isArray(additionalCoverages) ? 
      additionalCoverages.reduce((s, c) => s + (c.premium || c.price || 0), 0) : 0;
    const addOns = contextAddons + underwriterAddons;
    const grand = Number(total) + Number(addOns);

    var breakdown = { base, training_levy: itl, pcf_levy: pcf, stamp_duty: stamp };
    var finalValues = { base, itl, pcf, stamp, total, addOns, grand };
  } else {
    // Fallback to premium prop calculations if no underwriter selected
    const breakdown = premium?.breakdown || {};
    const base = premium?.base_premium || breakdown.base || premium?.basicPremium || 0;
    const itl = breakdown.training_levy ?? premium?.training_levy ?? Math.round(Number(base) * 0.0025);
    const pcf = breakdown.pcf_levy ?? premium?.pcf_levy ?? Math.round(Number(base) * 0.0025);
    const stamp = breakdown.stamp_duty ?? premium?.stamp_duty ?? 40;
    const total = premium?.totalPremium ?? premium?.premium ?? (Number(base) + Number(itl) + Number(pcf) + Number(stamp));
    
    // Calculate add-ons from both context and fallback scenarios
    const contextAddons = Number(addonsPremium) || 0;
    const underwriterAddons = Array.isArray(additionalCoverages) ? 
      additionalCoverages.reduce((s, c) => s + (c.premium || c.price || 0), 0) : 0;
    const addOns = contextAddons + underwriterAddons;
    const grand = Number(total) + Number(addOns);

    var finalValues = { base, itl, pcf, stamp, total, addOns, grand };
  }

  if (compact) {
    return (
      <View style={styles.section}>
        <View style={styles.card}>
          <Text style={styles.policyTitle}>Policy Summary</Text>
          <View style={styles.totalSection}>
            <Text style={styles.totalLine}>
              <Text style={styles.totalLabel}>Total Amount Payable:</Text>
              <Text style={styles.totalValue}>{formatCurrency(finalValues.grand)}</Text>
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      {/* Vehicle Details */}
      <View style={styles.card}>
        <Text style={styles.title}>Vehicle Details</Text>
        <Text style={styles.row}>Registration: {normalizedVehicle.registration || 'NOT PROVIDED'}</Text>
        <Text style={styles.row}>Make & Model: {normalizedVehicle.make || 'N/A'}{normalizedVehicle.model ? ` ${normalizedVehicle.model}` : ''}</Text>
        {normalizedVehicle.year ? (<Text style={styles.row}>Year: {normalizedVehicle.year}</Text>) : null}
        <Text style={styles.row}>Coverage Start: {normalizedVehicle.coverStart || 'Not set'}</Text>
        
        {/* Category-specific details */}
        {normalizedVehicle.raw?.tonnage && (
          <Text style={styles.row}>Tonnage: {normalizedVehicle.raw.tonnage}</Text>
        )}
        {normalizedVehicle.raw?.passengerCapacity && (
          <Text style={styles.row}>Passenger Capacity: {normalizedVehicle.raw.passengerCapacity}</Text>
        )}
        {normalizedVehicle.raw?.engineCapacity && (
          <Text style={styles.row}>Engine Capacity: {normalizedVehicle.raw.engineCapacity} CC</Text>
        )}
        
        {!!normalizedVehicle.raw?.sum_insured && (
          <Text style={styles.row}>Sum Insured: {formatCurrency(normalizedVehicle.raw.sum_insured)}</Text>
        )}
        
        {/* Comprehensive coverage add-on values */}
        {!!normalizedVehicle.raw?.windscreen_value && (
          <Text style={styles.row}>Windscreen Value: {formatCurrency(normalizedVehicle.raw.windscreen_value)}</Text>
        )}
        {!!normalizedVehicle.raw?.radio_cassette_value && (
          <Text style={styles.row}>Radio/Cassette Value: {formatCurrency(normalizedVehicle.raw.radio_cassette_value)}</Text>
        )}
        {!!normalizedVehicle.raw?.vehicle_accessories_value && (
          <Text style={styles.row}>Accessories Value: {formatCurrency(normalizedVehicle.raw.vehicle_accessories_value)}</Text>
        )}
      </View>

      {/* Policy Summary - Brief Format */}
      <View style={styles.card}>
        <Text style={styles.policyTitle}>Policy Summary</Text>
        
        <Text style={styles.policyLine}>
          <Text style={styles.label}>Insurance type:</Text>
          <Text style={styles.value}>
            {selectedProduct?.category} {selectedProduct?.name || selectedProduct?.coverage_type}
          </Text>
        </Text>

        <Text style={styles.policyLine}>
          <Text style={styles.label}>Insurer:</Text>
          <Text style={styles.value}>
            {underwriter?.name || 
             underwriter?.underwriter_name || 
             underwriter?.company_name ||
             underwriter?.company ||
             vehicleData?.selectedUnderwriter ||
             'Not selected'}
          </Text>
        </Text>

        <Text style={styles.policyLine}>
          <Text style={styles.label}>Cover period:</Text>
          <Text style={styles.value}>
            {vehicleData?.cover_start_date 
              ? `${new Date(vehicleData.cover_start_date).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })} - ${new Date(new Date(vehicleData.cover_start_date).getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}`
              : 'Not set'}
          </Text>
        </Text>

        <Text style={styles.policyLine}>
          <Text style={styles.label}>Premium:</Text>
          <Text style={styles.value}>{formatCurrency(finalValues.base)}</Text>
        </Text>

        <Text style={styles.policyLine}>
          <Text style={styles.label}>IRA Levy:</Text>
          <Text style={styles.value}>
            0.25% × {formatCurrency(finalValues.base)} = {formatCurrency(finalValues.pcf)}
          </Text>
        </Text>

        <Text style={styles.policyLine}>
          <Text style={styles.label}>Training Levy:</Text>
          <Text style={styles.value}>
            0.25% × {formatCurrency(finalValues.base)} = {formatCurrency(finalValues.itl)}
          </Text>
        </Text>

        <Text style={styles.policyLine}>
          <Text style={styles.label}>Policy Stamp Duty:</Text>
          <Text style={styles.value}>{formatCurrency(finalValues.stamp)}</Text>
        </Text>

        {/* Selected Add-ons from Add-on Selection Step */}
        {addonsBreakdown && addonsBreakdown.length > 0 && (
          <>
            {addonsBreakdown
              .filter(addon => addon.is_applicable)
              .map((addon, index) => (
                <Text key={addon.addon_id || index} style={styles.policyLine}>
                  <Text style={styles.label}>{addon.addon_name}:</Text>
                  <Text style={styles.value}>{formatCurrency(addon.calculated_premium)}</Text>
                </Text>
              ))
            }
          </>
        )}

        {/* Underwriter-Specific Add-ons */}
        {additionalCoverages && additionalCoverages.length > 0 && (
          additionalCoverages.map((coverage, index) => (
            <Text key={coverage.id || index} style={styles.policyLine}>
              <Text style={styles.label}>{coverage.name || coverage.title}:</Text>
              <Text style={styles.value}>{formatCurrency(coverage.premium || coverage.price || 0)}</Text>
            </Text>
          ))
        )}

        <View style={styles.totalSection}>
          <Text style={styles.totalLine}>
            <Text style={styles.totalLabel}>Total Amount Payable:</Text>
            <Text style={styles.totalValue}>{formatCurrency(finalValues.grand)}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 12 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 14, 
    borderWidth: 1, 
    borderColor: '#e9ecef',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  
  // Main title and section styles
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 10,
  },
  row: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
    marginTop: 4,
  },
  
  // Policy Summary Styles (Brief Format)
  policyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 10,
  },
  policyLine: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 6,
    lineHeight: 20,
  },
  label: {
    fontWeight: '600',
    color: '#495057',
  },
  value: {
    fontWeight: '400',
    color: '#2c3e50',
  },
  
  // Total Section
  totalSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#D5222B',
  },
  totalLine: {
    fontSize: 16,
    lineHeight: 24,
  },
  totalLabel: {
    fontWeight: '700',
    color: '#2c3e50',
  },
  totalValue: {
    fontWeight: '700',
    color: '#D5222B',
    fontSize: 16,
  },
});
