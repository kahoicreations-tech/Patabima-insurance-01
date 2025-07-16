import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../constants';
import { ModernCard, IconBadge, StatsCard } from '../components';

export default function ClaimsScreen() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  const claimsData = [
    {
      id: 1,
      category: 'Vehicle',
      policyNo: 'POL-001234',
      status: 'Processed',
      amount: 'KES 45,000',
      claimDate: '2025-06-28'
    },
    {
      id: 2,
      category: 'Medical',
      policyNo: 'POL-002345',
      status: 'Pending',
      amount: 'KES 12,500',
      claimDate: '2025-07-01'
    },
    {
      id: 3,
      category: 'WIBA',
      policyNo: 'POL-003456',
      status: 'Processed',
      amount: 'KES 28,750',
      claimDate: '2025-06-25'
    },
    {
      id: 4,
      category: 'Vehicle',
      policyNo: 'POL-004567',
      status: 'Pending',
      amount: 'KES 67,200',
      claimDate: '2025-07-03'
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

  const renderClaimCard = ({ item }) => {
    const getIconForCategory = (category) => {
      switch (category.toLowerCase()) {
        case 'vehicle': return 'motor';
        case 'medical': return 'medical';
        case 'wiba': return 'wiba';
        default: return 'info';
      }
    };

    const getStatusColor = (status) => {
      return status === 'Processed' ? Colors.success : Colors.warning;
    };

    return (
      <ModernCard style={styles.claimCard} elevation="medium">
        <View style={styles.claimHeader}>
          <View style={styles.claimCategoryContainer}>
            <IconBadge 
              icon={getIconForCategory(item.category)}
              size="small"
              variant="light"
              style={styles.categoryIcon}
            />
            <Text style={styles.claimCategory}>{item.category}</Text>
          </View>
          
          <View style={[styles.claimStatusBadge, {
            backgroundColor: getStatusColor(item.status) + '20'
          }]}>
            <Text style={[styles.claimStatus, {
              color: getStatusColor(item.status)
            }]}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.claimDetails}>
          <View style={styles.claimRow}>
            <Text style={styles.claimLabel}>Policy Number:</Text>
            <Text style={styles.claimValue}>{item.policyNo}</Text>
          </View>
          
          <View style={styles.claimRow}>
            <Text style={styles.claimLabel}>Claim Date:</Text>
            <Text style={styles.claimValue}>
              {new Date(item.claimDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <View style={styles.claimFooter}>
          <Text style={styles.claimAmount}>{item.amount}</Text>
          
          {item.status === 'Pending' && (
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View Details</Text>
              <Text style={styles.viewButtonIcon}>→</Text>
            </TouchableOpacity>
          )}
        </View>
      </ModernCard>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Claims Management</Text>
        <Text style={styles.subtitle}>Track and manage your claims</Text>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <StatsCard
          title="Total Claims"
          value={claimsData.length.toString()}
          icon="📋"
          variant="default"
          style={styles.summaryCard}
        />
        
        <StatsCard
          title="Pending"
          value={pendingClaims.length.toString()}
          icon="⏳"
          variant="warning"
          style={styles.summaryCard}
        />
        
        <StatsCard
          title="Processed"
          value={processedClaims.length.toString()}
          icon="✅"
          variant="success"
          style={styles.summaryCard}
        />
      </View>

      {/* Search Bar */}
      <ModernCard style={styles.searchContainer} elevation="low">
        <View style={styles.searchInputContainer}>
          <IconBadge icon="search" size="small" variant="light" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search claims by category or policy..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textLight}
          />
        </View>
      </ModernCard>

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
    paddingHorizontal: Spacing.md,
  },
  header: {
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.headingLarge,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textLight,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
  },
  searchContainer: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.text,
    paddingVertical: Spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    ...Typography.bodyMedium,
    fontWeight: '500',
    color: Colors.textLight,
  },
  activeTabText: {
    color: Colors.white,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: Spacing.xl,
  },
  claimCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  claimCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryIcon: {
    marginRight: 0,
  },
  claimCategory: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: Colors.text,
  },
  claimStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  claimStatus: {
    ...Typography.bodySmall,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  claimDetails: {
    marginBottom: Spacing.md,
  },
  claimRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  claimLabel: {
    ...Typography.bodyMedium,
    color: Colors.textLight,
  },
  claimValue: {
    ...Typography.bodyMedium,
    fontWeight: '500',
    color: Colors.text,
  },
  claimFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.backgroundLight,
  },
  claimAmount: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: Colors.primary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    gap: Spacing.xs,
  },
  viewButtonText: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    fontWeight: '600',
  },
  viewButtonIcon: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyStateIcon: {
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconX: {
    fontSize: 32,
    color: Colors.textLight,
  },
  emptyStateTitle: {
    ...Typography.headingMedium,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyStateMessage: {
    ...Typography.bodyMedium,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});
