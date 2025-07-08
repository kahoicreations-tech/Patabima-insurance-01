import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../constants';

export default function QuotationsScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  const filters = ['All', 'Applied', 'Unapplied'];

  const mockQuotations = [
    {
      id: 1,
      policyNumber: 'KDN432A',
      policyType: 'PvC',
      amount: 37709,
      status: 'Unapplied',
      date: '2025-07-06'
    },
    {
      id: 2,
      policyNumber: 'KDN432A',
      policyType: 'PvC',
      amount: 32686,
      status: 'Unapplied',
      date: '2025-07-05'
    },
    {
      id: 3,
      policyNumber: 'KDN432A',
      policyType: 'PvC',
      amount: 32686,
      status: 'Unapplied',
      date: '2025-07-04'
    },
    {
      id: 4,
      policyNumber: 'KDN432A',
      policyType: 'PvC',
      amount: 32686,
      status: 'Applied',
      date: '2025-07-03'
    },
    {
      id: 5,
      policyNumber: 'KDN432A',
      policyType: 'PvC',
      amount: 32686,
      status: 'Applied',
      date: '2025-07-02'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return Colors.success;
      case 'Unapplied':
        return Colors.warning;
      default:
        return Colors.textSecondary;
    }
  };

  const filteredQuotations = mockQuotations.filter(quotation => {
    const matchesFilter = activeFilter === 'All' || quotation.status === activeFilter;
    const matchesSearch = quotation.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quotation.policyType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderQuotationItem = ({ item }) => (
    <TouchableOpacity style={styles.quotationCard}>
      <View style={styles.cardHeader}>
        <View style={styles.policyInfo}>
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconText}>📋</Text>
          </View>
          <View style={styles.policyDetails}>
            <Text style={styles.policyNumber}>{item.policyNumber}</Text>
            <Text style={styles.policyType}>Policy Type: {item.policyType}</Text>
            <Text style={styles.amount}>Ksh. {item.amount.toLocaleString()}</Text>
            <Text style={styles.grossLabel}>(gross)</Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
          <TouchableOpacity style={styles.expandButton}>
            <Text style={styles.expandIcon}>⌄</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quotations</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textLight}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && styles.activeFilterTab
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter && styles.activeFilterText
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quotations List */}
      <FlatList
        data={filteredQuotations}
        renderItem={renderQuotationItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.xxl,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchIcon: {
    fontSize: Typography.fontSize.md,
    marginRight: Spacing.sm,
    color: Colors.textLight,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.md,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
    marginRight: Spacing.sm,
    backgroundColor: Colors.backgroundGray,
  },
  activeFilterTab: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.md,
  },
  activeFilterText: {
    color: Colors.background,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  quotationCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  policyInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  iconPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  iconText: {
    fontSize: Typography.fontSize.lg,
  },
  policyDetails: {
    flex: 1,
  },
  policyNumber: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.md,
  },
  policyType: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.sm,
  },
  amount: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    lineHeight: Typography.lineHeight.lg,
  },
  grossLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.sm,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: Typography.lineHeight.xs,
  },
  expandButton: {
    padding: Spacing.xs,
  },
  expandIcon: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
  },
});
