import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import PaymentSummary from './PaymentSummary';
import PaymentOptions from './PaymentOptions';

export default function EnhancedPayment({
  selectedProduct,
  vehicleData,
  premium,
  underwriter,
  clientDetails,
  additionalCoverages,
  selectedAddons,
  addonsPremium,
  addonsBreakdown,
  paymentMethod,
  onPaymentMethodChange,
  onCoverageChange,
  values,
  onValuesChange,
}) {
  const [showDetails, setShowDetails] = useState(true);
  const allowedMethods = ['MPESA', 'DPO'];
  const effectivePaymentMethod = allowedMethods.includes(paymentMethod) ? paymentMethod : 'MPESA';
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Payment Options Section - moved up so it's visible without scrolling */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <Text style={styles.sectionSubtitle}>
          Choose your preferred payment method to complete the purchase
        </Text>
  <PaymentOptions value={effectivePaymentMethod} onChange={onPaymentMethodChange} />
      </View>

      {/* Compact Policy Summary with toggle */}
      <View style={styles.section}>
        <PaymentSummary
          selectedProduct={selectedProduct}
          vehicleData={vehicleData}
          premium={premium}
          additionalCoverages={additionalCoverages}
          underwriter={underwriter}
          clientDetails={clientDetails}
          selectedAddons={selectedAddons}
          addonsPremium={addonsPremium}
          addonsBreakdown={addonsBreakdown}
          compact={!showDetails}
        />
        <Text
          onPress={() => setShowDetails((s) => !s)}
          style={{ color: '#1864ab', fontWeight: '600', marginTop: 4 }}
        >
          {showDetails ? 'Hide details' : 'View full details'}
        </Text>
      </View>

      {/* Underwriter-Specific Add-ons Section */}
      {underwriter?.available_addons && underwriter.available_addons.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Coverage</Text>
          <Text style={styles.sectionSubtitle}>
            Optional coverage from {underwriter.name || underwriter.underwriter_name || 'selected underwriter'}
          </Text>
          <View style={styles.addonsContainer}>
            {underwriter.available_addons.map((addon, index) => (
              <TouchableOpacity
                key={addon.id || index}
                style={[
                  styles.addonOption,
                  additionalCoverages?.some(c => c.id === addon.id || c.name === addon.name) && styles.selectedAddon
                ]}
                onPress={() => {
                  const isSelected = additionalCoverages?.some(c => c.id === addon.id || c.name === addon.name);
                  const newSelection = isSelected
                    ? additionalCoverages.filter(c => c.id !== addon.id && c.name !== addon.name)
                    : [...(additionalCoverages || []), addon];
                  onCoverageChange?.(newSelection);
                }}
              >
                <View style={styles.addonHeader}>
                  <Text style={[
                    styles.addonName,
                    additionalCoverages?.some(c => c.id === addon.id || c.name === addon.name) && styles.selectedAddonText
                  ]}>
                    {addon.name || addon.title}
                  </Text>
                  <Text style={[
                    styles.addonPrice,
                    additionalCoverages?.some(c => c.id === addon.id || c.name === addon.name) && styles.selectedAddonText
                  ]}>
                    KSh {(addon.premium || addon.price || 0).toLocaleString()}
                  </Text>
                </View>
                {addon.description && (
                  <Text style={styles.addonDescription}>
                    {addon.description}
                  </Text>
                )}
                {additionalCoverages?.some(c => c.id === addon.id || c.name === addon.name) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Payment Instructions */}
      <View style={[styles.section, styles.instructionsCard]}>
        <Text style={styles.instructionsTitle}>Next Steps</Text>
        <Text style={styles.instructionsText}>
          1. Review your policy summary above{'\n'}
          2. Add any additional coverage if needed{'\n'}
          3. Select your payment method{'\n'}
          4. Click 'Next' to proceed to payment
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  section: { 
    paddingHorizontal: 16, 
    marginBottom: 12 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#2c3e50', 
    marginBottom: 6 
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 10,
    lineHeight: 18
  },
  instructionsCard: {
    backgroundColor: '#e7f3ff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#b3d9ff',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1864ab',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  
  // Underwriter Add-ons Styles
  addonsContainer: {
    gap: 12,
  },
  addonOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    position: 'relative',
  },
  selectedAddon: {
    borderColor: '#D5222B',
    backgroundColor: '#fff5f5',
  },
  addonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  addonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  addonPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#28a745',
  },
  selectedAddonText: {
    color: '#D5222B',
  },
  addonDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginTop: 4,
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 18,
    color: '#D5222B',
    fontWeight: 'bold',
  },
});
