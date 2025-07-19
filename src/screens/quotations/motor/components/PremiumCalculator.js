/**
 * Premium Calculator Component
 * 
 * Calculates motor insurance premiums based on vehicle details
 * Shows premium breakdown and factors affecting the cost
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Colors, Spacing, Typography } from '../../../../constants';

const PremiumCalculator = ({ 
  formData, 
  insuranceDuration, 
  preferredInsurer 
}) => {
  const calculatePremiumBreakdown = () => {
    if (!formData.vehicleEngineCapacity || !formData.yearOfManufacture || 
        !formData.usageType || !insuranceDuration) {
      return null;
    }

    const engineCapacity = parseInt(formData.vehicleEngineCapacity);
    const year = parseInt(formData.yearOfManufacture);
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - year;
    
    // Base premium calculation
    let basePremium = 15000; // Base amount for Kenya motor insurance
    
    // Engine capacity factor
    let engineFactor = 1.0;
    let engineDescription = 'Standard';
    if (engineCapacity <= 1000) {
      engineFactor = 1.0;
      engineDescription = 'Small Engine (≤1000cc)';
    } else if (engineCapacity <= 1500) {
      engineFactor = 1.2;
      engineDescription = 'Medium Engine (1001-1500cc)';
    } else if (engineCapacity <= 2000) {
      engineFactor = 1.5;
      engineDescription = 'Large Engine (1501-2000cc)';
    } else {
      engineFactor = 1.8;
      engineDescription = 'Very Large Engine (>2000cc)';
    }
    
    // Vehicle age factor
    let ageFactor = 1.0;
    let ageDescription = 'Standard';
    if (vehicleAge <= 3) {
      ageFactor = 1.3;
      ageDescription = 'New Vehicle (≤3 years)';
    } else if (vehicleAge <= 7) {
      ageFactor = 1.1;
      ageDescription = 'Recent Vehicle (4-7 years)';
    } else if (vehicleAge <= 15) {
      ageFactor = 1.0;
      ageDescription = 'Mature Vehicle (8-15 years)';
    } else {
      ageFactor = 0.8;
      ageDescription = 'Older Vehicle (>15 years)';
    }
    
    // Usage type multiplier
    const usageMultiplier = formData.usageMultiplier || 1.0;
    
    // Duration multiplier
    const durationOptions = {
      '90 Days': 0.3,
      '180 Days': 0.6,
      '365 Days (1 Year)': 1.0
    };
    const durationMultiplier = durationOptions[insuranceDuration] || 1.0;
    
    // Calculate base premium with factors
    const adjustedPremium = basePremium * engineFactor * ageFactor * usageMultiplier * durationMultiplier;
    
    // Government levies and taxes
    const trainingLevy = adjustedPremium * 0.002; // 0.2% training levy
    const stampDuty = 50; // Fixed stamp duty
    const policyFee = 150; // Policy processing fee
    
    // Total premium
    const totalPremium = adjustedPremium + trainingLevy + stampDuty + policyFee;
    
    return {
      basePremium,
      engineFactor,
      engineDescription,
      ageFactor,
      ageDescription,
      usageMultiplier,
      durationMultiplier,
      adjustedPremium,
      trainingLevy,
      stampDuty,
      policyFee,
      totalPremium,
      breakdown: [
        {
          label: 'Base Premium',
          amount: basePremium,
          description: 'Standard motor insurance base rate'
        },
        {
          label: 'Engine Capacity Adjustment',
          amount: basePremium * (engineFactor - 1),
          description: engineDescription,
          factor: `×${engineFactor}`
        },
        {
          label: 'Vehicle Age Adjustment',
          amount: basePremium * engineFactor * (ageFactor - 1),
          description: ageDescription,
          factor: `×${ageFactor}`
        },
        {
          label: 'Usage Type Adjustment',
          amount: basePremium * engineFactor * ageFactor * (usageMultiplier - 1),
          description: `${formData.usageType} usage`,
          factor: `×${usageMultiplier}`
        },
        {
          label: 'Duration Adjustment',
          amount: adjustedPremium * (durationMultiplier - 1),
          description: insuranceDuration,
          factor: `×${durationMultiplier}`
        },
        {
          label: 'Training Levy (0.2%)',
          amount: trainingLevy,
          description: 'Government training levy'
        },
        {
          label: 'Stamp Duty',
          amount: stampDuty,
          description: 'Government stamp duty'
        },
        {
          label: 'Policy Processing Fee',
          amount: policyFee,
          description: 'Administrative fee'
        }
      ]
    };
  };

  const premiumData = calculatePremiumBreakdown();

  const getRiskLevel = () => {
    if (!formData.usageType || !formData.vehicleEngineCapacity) return 'Unknown';
    
    const engineCapacity = parseInt(formData.vehicleEngineCapacity);
    const usageRisk = formData.riskLevel || 'Medium';
    const engineRisk = engineCapacity > 2000 ? 'High' : engineCapacity > 1500 ? 'Medium' : 'Low';
    
    if (usageRisk === 'Very High' || (usageRisk === 'High' && engineRisk === 'High')) {
      return 'Very High';
    } else if (usageRisk === 'High' || engineRisk === 'High') {
      return 'High';
    } else if (usageRisk === 'Medium' || engineRisk === 'Medium') {
      return 'Medium';
    } else {
      return 'Low';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low': return Colors.success;
      case 'Medium': return Colors.warning;
      case 'High': return Colors.error;
      case 'Very High': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getInsurerPremiumAdjustment = (insurer) => {
    const adjustments = {
      'Jubilee Insurance': 1.0,
      'CIC Insurance': 0.95,
      'APA Insurance': 1.05,
      'ICEA Lion': 0.98,
      'Heritage Insurance': 1.02,
      'GA Insurance': 1.08,
      'Takaful Insurance': 0.93,
      'Kenindia Insurance': 1.12
    };
    return adjustments[insurer] || 1.0;
  };

  if (!premiumData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Premium Calculator</Text>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            Complete vehicle details to see premium calculation
          </Text>
          <Text style={styles.placeholderSubtext}>
            Please fill in all required vehicle information and insurance duration to calculate your premium.
          </Text>
        </View>
      </View>
    );
  }

  const insurerAdjustment = preferredInsurer ? getInsurerPremiumAdjustment(preferredInsurer) : 1.0;
  const finalPremium = Math.round(premiumData.totalPremium * insurerAdjustment);
  const riskLevel = getRiskLevel();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Premium Calculation</Text>
      <Text style={styles.subtitle}>
        Detailed breakdown of your motor insurance premium
      </Text>

      {/* Premium Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Total Premium</Text>
          <Text style={styles.summaryAmount}>KES {finalPremium.toLocaleString()}</Text>
        </View>
        
        <View style={styles.summaryDetails}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration:</Text>
            <Text style={styles.summaryValue}>{insuranceDuration}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Risk Level:</Text>
            <Text style={[styles.summaryValue, { color: getRiskColor(riskLevel) }]}>
              {riskLevel}
            </Text>
          </View>
          {preferredInsurer && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Insurer:</Text>
              <Text style={styles.summaryValue}>{preferredInsurer}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Vehicle Information Card */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Vehicle Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Vehicle</Text>
            <Text style={styles.infoValue}>{formData.makeModel}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Year</Text>
            <Text style={styles.infoValue}>{formData.yearOfManufacture}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Engine</Text>
            <Text style={styles.infoValue}>{formData.vehicleEngineCapacity}cc</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Usage</Text>
            <Text style={styles.infoValue}>{formData.usageType}</Text>
          </View>
        </View>
      </View>

      {/* Premium Breakdown */}
      <View style={styles.breakdownCard}>
        <Text style={styles.cardTitle}>Premium Breakdown</Text>
        
        {premiumData.breakdown.map((item, index) => (
          <View key={index} style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <Text style={styles.breakdownLabel}>{item.label}</Text>
              <Text style={styles.breakdownDescription}>{item.description}</Text>
            </View>
            <View style={styles.breakdownRight}>
              {item.factor && (
                <Text style={styles.breakdownFactor}>{item.factor}</Text>
              )}
              <Text style={[
                styles.breakdownAmount,
                item.amount > 0 ? styles.breakdownAmountPositive : styles.breakdownAmountNeutral
              ]}>
                {item.amount > 0 ? '+' : ''}KES {Math.round(item.amount).toLocaleString()}
              </Text>
            </View>
          </View>
        ))}
        
        {/* Insurer Adjustment */}
        {preferredInsurer && insurerAdjustment !== 1.0 && (
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <Text style={styles.breakdownLabel}>Insurer Adjustment</Text>
              <Text style={styles.breakdownDescription}>{preferredInsurer} rate</Text>
            </View>
            <View style={styles.breakdownRight}>
              <Text style={styles.breakdownFactor}>×{insurerAdjustment}</Text>
              <Text style={[
                styles.breakdownAmount,
                insurerAdjustment > 1.0 ? styles.breakdownAmountPositive : styles.breakdownAmountNegative
              ]}>
                {insurerAdjustment > 1.0 ? '+' : ''}KES {Math.round(premiumData.totalPremium * (insurerAdjustment - 1.0)).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
        
        <View style={styles.breakdownTotal}>
          <Text style={styles.breakdownTotalLabel}>Total Premium</Text>
          <Text style={styles.breakdownTotalAmount}>KES {finalPremium.toLocaleString()}</Text>
        </View>
      </View>

      {/* Risk Factors */}
      <View style={styles.riskCard}>
        <Text style={styles.cardTitle}>Risk Assessment</Text>
        <View style={styles.riskLevel}>
          <Text style={styles.riskLevelLabel}>Overall Risk Level:</Text>
          <Text style={[styles.riskLevelValue, { color: getRiskColor(riskLevel) }]}>
            {riskLevel}
          </Text>
        </View>
        
        <View style={styles.riskFactors}>
          <View style={styles.riskFactor}>
            <Text style={styles.riskFactorLabel}>Engine Size</Text>
            <Text style={styles.riskFactorValue}>
              {parseInt(formData.vehicleEngineCapacity) > 2000 ? 'High Risk' : 
               parseInt(formData.vehicleEngineCapacity) > 1500 ? 'Medium Risk' : 'Low Risk'}
            </Text>
          </View>
          <View style={styles.riskFactor}>
            <Text style={styles.riskFactorLabel}>Vehicle Age</Text>
            <Text style={styles.riskFactorValue}>
              {new Date().getFullYear() - parseInt(formData.yearOfManufacture) <= 3 ? 'High Value' :
               new Date().getFullYear() - parseInt(formData.yearOfManufacture) <= 7 ? 'Medium Value' : 'Lower Value'}
            </Text>
          </View>
          <View style={styles.riskFactor}>
            <Text style={styles.riskFactorLabel}>Usage Type</Text>
            <Text style={[styles.riskFactorValue, { color: getRiskColor(formData.riskLevel) }]}>
              {formData.riskLevel} Risk
            </Text>
          </View>
        </View>
      </View>

      {/* Coverage Information */}
      <View style={styles.coverageCard}>
        <Text style={styles.cardTitle}>Coverage Information</Text>
        <Text style={styles.coverageDescription}>
          This motor insurance policy covers third-party liability as required by Kenyan law. 
          Additional coverage options may be available.
        </Text>
        
        <View style={styles.coverageItems}>
          <View style={styles.coverageItem}>
            <Text style={styles.coverageItemIcon}>✓</Text>
            <Text style={styles.coverageItemText}>Third-party liability coverage</Text>
          </View>
          <View style={styles.coverageItem}>
            <Text style={styles.coverageItemIcon}>✓</Text>
            <Text style={styles.coverageItemText}>Legal compliance certificate</Text>
          </View>
          <View style={styles.coverageItem}>
            <Text style={styles.coverageItemIcon}>✓</Text>
            <Text style={styles.coverageItemText}>24/7 claims support</Text>
          </View>
          <View style={styles.coverageItem}>
            <Text style={styles.coverageItemIcon}>✓</Text>
            <Text style={styles.coverageItemText}>Nationwide coverage</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  placeholderContainer: {
    backgroundColor: Colors.lightGray,
    padding: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  placeholderSubtext: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  summaryCard: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  summaryAmount: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
  },
  summaryDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.8)',
  },
  summaryValue: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.white,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: Spacing.md,
  },
  infoLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  breakdownCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  breakdownLeft: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  breakdownDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  breakdownRight: {
    alignItems: 'flex-end',
  },
  breakdownFactor: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  breakdownAmount: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
  },
  breakdownAmountPositive: {
    color: Colors.error,
  },
  breakdownAmountNegative: {
    color: Colors.success,
  },
  breakdownAmountNeutral: {
    color: Colors.textSecondary,
  },
  breakdownTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
  },
  breakdownTotalLabel: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  breakdownTotalAmount: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  riskCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  riskLevel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  riskLevelLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  riskLevelValue: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
  },
  riskFactors: {
    gap: Spacing.sm,
  },
  riskFactor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  riskFactorLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  riskFactorValue: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  coverageCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  coverageDescription: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  coverageItems: {
    gap: Spacing.sm,
  },
  coverageItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverageItemIcon: {
    fontSize: Typography.fontSize.md,
    color: Colors.success,
    marginRight: Spacing.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  coverageItemText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    flex: 1,
  },
});

export default PremiumCalculator;
