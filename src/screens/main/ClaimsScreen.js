import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Typography } from '../../constants';

export default function ClaimsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Same data as in HomeScreen
  const claimsData = [
    {
      id: 1,
      claimNo: 'CLM-001234',
      category: 'Vehicle',
      policyNo: 'POL-001234',
      vehicleReg: 'KCD 123A',
      status: 'Processed',
      amount: 'KES 45,000',
      claimDate: '2025-06-28',
      submissionDate: '2025-06-28'
    },
    {
      id: 2,
      claimNo: 'CLM-002345',
      category: 'Medical',
      policyNo: 'POL-002345',
      status: 'Pending',
      amount: 'KES 12,500',
      claimDate: '2025-07-01',
      submissionDate: '2025-07-01'
    },
    {
      id: 3,
      claimNo: 'CLM-003456',
      category: 'WIBA',
      policyNo: 'POL-003456',
      status: 'Processed',
      amount: 'KES 28,750',
      claimDate: '2025-06-25',
      submissionDate: '2025-06-25'
    },
    {
      id: 4,
      claimNo: 'CLM-004567',
      category: 'Vehicle',
      policyNo: 'POL-004567',
      vehicleReg: 'KBZ 456B',
      status: 'Pending',
      amount: 'KES 67,200',
      claimDate: '2025-07-03',
      submissionDate: '2025-07-03'
    }
  ];

  const pendingClaims = claimsData.filter(claim => claim.status === 'Pending');
  const processedClaims = claimsData.filter(claim => claim.status === 'Processed');

  const tabs = [
    { key: 'Pending', label: `Pending (${pendingClaims.length})` },
    { key: 'Processed', label: `Processed (${processedClaims.length})` }
  ];

  const currentData = activeTab === 'Pending' ? pendingClaims : processedClaims;
  const filteredData = currentData.filter(item => 
    searchQuery === '' || 
    item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.policyNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderClaimCard = ({ item }) => (
    <View style={styles.claimCard}>
      <View style={styles.claimHeader}>
        <Text style={styles.claimCategory}>{item.category}</Text>
        <View style={[styles.claimStatusBadge, {
          backgroundColor: item.status === 'Processed' ? Colors.success + '20' : Colors.warning + '20'
        }]}>
          <Text style={[styles.claimStatus, {
            color: item.status === 'Processed' ? Colors.success : Colors.warning
          }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.claimPolicy}>Policy: {item.policyNo}</Text>
      <Text style={styles.claimDate}>Claim Date: {new Date(item.claimDate).toLocaleDateString()}</Text>
      <View style={styles.claimFooter}>
        <Text style={styles.claimAmount}>{item.amount}</Text>
        {item.status === 'Pending' && (
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => navigation.navigate('ClaimDetails', { claim: item })}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Claims</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search claims..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textLight}
          />
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {filteredData.length > 0 ? (
        <FlatList
          data={filteredData}
          renderItem={renderClaimCard}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIcon}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconX}>✕</Text>
            </View>
          </View>
          
          <Text style={styles.emptyStateTitle}>
            {searchQuery ? 'No Results Found' : `No ${activeTab} Claims`}
          </Text>
          
          <Text style={styles.emptyStateMessage}>
            {searchQuery 
              ? `No claims match your search "${searchQuery}"`
              : `There are currently no ${activeTab.toLowerCase()} claims.`
            }
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
    paddingBottom: 85,
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
    marginRight: Spacing.xs,
    backgroundColor: Colors.backgroundGray,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
    marginRight: 0,
    marginLeft: Spacing.xs,
  },
  tabText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.md,
  },
  activeTabText: {
    color: Colors.background,
    fontFamily: Typography.fontFamily.semiBold,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  claimCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  claimCategory: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.lg,
  },
  claimStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: 12,
  },
  claimStatus: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: Typography.lineHeight.xs,
  },
  claimPolicy: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.sm,
  },
  claimDate: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeight.sm,
  },
  claimFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  claimAmount: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    lineHeight: Typography.lineHeight.lg,
  },
  viewButton: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: 6,
  },
  viewButtonText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: Typography.lineHeight.sm,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyStateIcon: {
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconX: {
    fontSize: 40,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  emptyStateTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.xl,
  },
  emptyStateMessage: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.md,
  },
});
