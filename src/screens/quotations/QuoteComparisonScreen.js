// Quote Comparison Feature for PataBima App
// Allows users to compare multiple insurance quotes side by side

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants';
import { QuoteStorageService, PricingService } from '../../services';

export default function QuoteComparisonScreen({ route, navigation }) {
  const { selectedQuotes = [] } = route.params || {};
  const [quotes, setQuotes] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);

  useEffect(() => {
    loadQuotesForComparison();
  }, [selectedQuotes]);

  const loadQuotesForComparison = async () => {
    try {
      if (selectedQuotes.length > 0) {
        setQuotes(selectedQuotes);
        generateComparisonData(selectedQuotes);
      } else {
        // Load all quotes of same type for comparison
        const allQuotes = await QuoteStorageService.getAllQuotes();
        const groupedByType = groupQuotesByType(allQuotes);
        setComparisonData(groupedByType);
      }
    } catch (error) {
      console.error('Error loading quotes for comparison:', error);
      Alert.alert('Error', 'Failed to load quotes for comparison');
    }
  };

  const groupQuotesByType = (allQuotes) => {
    const grouped = {};
    allQuotes.forEach(quote => {
      if (!grouped[quote.insuranceType]) {
        grouped[quote.insuranceType] = [];
      }
      grouped[quote.insuranceType].push(quote);
    });
    return grouped;
  };

  const generateComparisonData = (quotesToCompare) => {
    if (quotesToCompare.length < 2) return;

    const comparisonFields = getComparisonFields(quotesToCompare[0].insuranceType);
    const comparison = comparisonFields.map(field => ({
      label: field.label,
      key: field.key,
      values: quotesToCompare.map(quote => formatFieldValue(quote, field))
    }));

    setComparisonData(comparison);
  };

  const getComparisonFields = (insuranceType) => {
    const commonFields = [
      { label: 'Quote ID', key: 'id' },
      { label: 'Customer Name', key: 'customerName' },
      { label: 'Total Premium', key: 'calculatedPremium.totalPremium' },
      { label: 'Monthly Premium', key: 'calculatedPremium.monthlyPremium' },
      { label: 'Status', key: 'status' },
      { label: 'Created Date', key: 'createdAt' }
    ];

    const typeSpecificFields = {
      motor: [
        { label: 'Vehicle Make', key: 'vehicleMake' },
        { label: 'Vehicle Model', key: 'vehicleModel' },
        { label: 'Year', key: 'yearOfManufacture' },
        { label: 'Vehicle Value', key: 'vehicleValue' },
        { label: 'Coverage Type', key: 'coverageType' }
      ],
      medical: [
        { label: 'Plan Type', key: 'coverageType' },
        { label: 'Policy Type', key: 'policyType' },
        { label: 'Dependents', key: 'dependents' },
        { label: 'Age', key: 'age' }
      ],
      wiba: [
        { label: 'Company Name', key: 'companyName' },
        { label: 'Total Employees', key: 'calculatedPremium.totalEmployees' },
        { label: 'Industry Type', key: 'industryType' },
        { label: 'Coverage Type', key: 'coverageType' }
      ],
      lastExpense: [
        { label: 'Coverage Amount', key: 'coverageAmount' },
        { label: 'Payment Frequency', key: 'paymentFrequency' },
        { label: 'Age', key: 'age' }
      ],
      travel: [
        { label: 'Destination', key: 'destination' },
        { label: 'Duration (days)', key: 'duration' },
        { label: 'Travel Purpose', key: 'travelPurpose' },
        { label: 'Coverage Type', key: 'coverageType' }
      ],
      personalAccident: [
        { label: 'Coverage Amount', key: 'coverageAmount' },
        { label: 'Occupation', key: 'occupation' },
        { label: 'Risk Level', key: 'riskLevel' },
        { label: 'Age', key: 'age' }
      ]
    };

    return [...commonFields, ...(typeSpecificFields[insuranceType] || [])];
  };

  const formatFieldValue = (quote, field) => {
    const value = getNestedValue(quote, field.key);
    
    if (value === null || value === undefined) return 'N/A';

    switch (field.key) {
      case 'calculatedPremium.totalPremium':
      case 'calculatedPremium.monthlyPremium':
      case 'vehicleValue':
      case 'coverageAmount':
        return PricingService.formatCurrency(value);
      
      case 'createdAt':
        return new Date(value).toLocaleDateString();
      
      case 'status':
        return value.charAt(0).toUpperCase() + value.slice(1);
      
      default:
        return value.toString();
    }
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const getBestValue = (comparisonItem) => {
    if (comparisonItem.key.includes('Premium') || comparisonItem.key.includes('Value')) {
      // For monetary values, lowest is best
      const numericValues = comparisonItem.values
        .map(v => parseFloat(v.replace(/[^0-9.-]+/g, "")))
        .filter(v => !isNaN(v));
      
      if (numericValues.length === 0) return null;
      return Math.min(...numericValues);
    }
    
    return null; // No best value logic for other fields
  };

  const renderComparisonTable = () => {
    if (quotes.length < 2) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>Select Quotes to Compare</Text>
          <Text style={styles.emptyMessage}>
            You need at least 2 quotes of the same type to compare them.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.comparisonTable}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.labelColumn}>
              <Text style={styles.headerText}>Feature</Text>
            </View>
            {quotes.map((quote, index) => (
              <View key={quote.id} style={styles.quoteColumn}>
                <Text style={styles.headerText}>Quote {index + 1}</Text>
                <Text style={styles.quoteId}>{quote.id}</Text>
              </View>
            ))}
          </View>

          {/* Comparison Rows */}
          {comparisonData.map((item, index) => {
            const bestValue = getBestValue(item);
            
            return (
              <View key={index} style={styles.comparisonRow}>
                <View style={styles.labelColumn}>
                  <Text style={styles.labelText}>{item.label}</Text>
                </View>
                {item.values.map((value, valueIndex) => {
                  const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
                  const isBest = bestValue !== null && !isNaN(numericValue) && numericValue === bestValue;
                  
                  return (
                    <View key={valueIndex} style={styles.quoteColumn}>
                      <Text style={[
                        styles.valueText,
                        isBest && styles.bestValueText
                      ]}>
                        {value}
                      </Text>
                      {isBest && <Text style={styles.bestBadge}>BEST</Text>}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderQuoteTypeGroups = () => {
    return Object.entries(comparisonData).map(([type, typeQuotes]) => (
      <View key={type} style={styles.typeGroup}>
        <Text style={styles.typeTitle}>
          {type.charAt(0).toUpperCase() + type.slice(1)} Insurance
        </Text>
        
        {typeQuotes.map(quote => (
          <TouchableOpacity
            key={quote.id}
            style={styles.quoteCard}
            onPress={() => navigation.navigate('QuoteComparison', { 
              selectedQuotes: typeQuotes.slice(0, 3) // Compare up to 3 quotes
            })}
          >
            <View style={styles.quoteHeader}>
              <Text style={styles.quoteIdText}>{quote.id}</Text>
              <Text style={styles.quotePremium}>
                {PricingService.formatCurrency(quote.calculatedPremium?.totalPremium || 0)}
              </Text>
            </View>
            
            <Text style={styles.quoteCustomer}>
              {quote.customerName || quote.companyName || 'N/A'}
            </Text>
            
            <View style={styles.quoteFooter}>
              <Text style={styles.quoteDate}>
                {new Date(quote.createdAt).toLocaleDateString()}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(quote.status) }]}>
                  {quote.status?.charAt(0).toUpperCase() + quote.status?.slice(1)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        {typeQuotes.length >= 2 && (
          <TouchableOpacity
            style={styles.compareButton}
            onPress={() => navigation.navigate('QuoteComparison', { 
              selectedQuotes: typeQuotes.slice(0, 3)
            })}
          >
            <Text style={styles.compareButtonText}>
              📊 Compare {Math.min(typeQuotes.length, 3)} Quotes
            </Text>
          </TouchableOpacity>
        )}
      </View>
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return Colors.success;
      case 'paid': return Colors.primary;
      case 'applied': return Colors.warning;
      case 'draft': return Colors.textSecondary;
      default: return Colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Quote Comparison</Text>
        </View>

        {quotes.length >= 2 ? renderComparisonTable() : renderQuoteTypeGroups()}
      </ScrollView>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.sm,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  comparisonTable: {
    margin: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: 'white',
  },
  labelColumn: {
    width: 120,
    padding: Spacing.md,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  quoteColumn: {
    width: 120,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  headerText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: 'white',
    textAlign: 'center',
  },
  quoteId: {
    fontSize: Typography.fontSize.xs,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: Spacing.xs / 2,
  },
  labelText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  valueText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bestValueText: {
    color: Colors.success,
    fontFamily: Typography.fontFamily.bold,
  },
  bestBadge: {
    fontSize: Typography.fontSize.xs,
    color: Colors.success,
    fontFamily: Typography.fontFamily.bold,
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: Spacing.xs / 2,
  },
  typeGroup: {
    margin: Spacing.lg,
  },
  typeTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  quoteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quoteIdText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  quotePremium: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  quoteCustomer: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  compareButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  compareButtonText: {
    color: 'white',
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
  },
});
