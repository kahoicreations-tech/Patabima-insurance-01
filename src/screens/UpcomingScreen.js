import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../constants';

export default function UpcomingScreen() {
  const [activeTab, setActiveTab] = useState('Renewals');
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  // Same data as in HomeScreen
  const renewalData = [
    {
      id: 1,
      policyNo: 'POL-001234',
      vehicleReg: 'KCD 123A',
      status: 'Due Soon',
      dueDate: '2025-07-15'
    },
    {
      id: 2,
      policyNo: 'POL-005678',
      vehicleReg: 'KBZ 456B',
      status: 'Overdue',
      dueDate: '2025-06-30'
    },
    {
      id: 3,
      policyNo: 'POL-009876',
      vehicleReg: 'KCA 789C',
      status: 'Due Soon',
      dueDate: '2025-07-20'
    }
  ];

  const extensionData = []; // No extensions currently

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

  const tabs = [
    { key: 'Renewals', label: `Renewals (${renewalData.length})` },
    { key: 'Extensions', label: `Extensions (${extensionData.length})` },
    { key: 'Claims', label: `Claims (${claimsData.length})` }
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'Renewals': return renewalData;
      case 'Extensions': return extensionData;
      case 'Claims': return claimsData;
      default: return [];
    }
  };

  const currentData = getCurrentData();
  const filteredData = currentData.filter(item => {
    if (searchQuery === '') return true;
    
    const searchLower = searchQuery.toLowerCase();
    if (activeTab === 'Claims') {
      return item.category?.toLowerCase().includes(searchLower) ||
             item.policyNo?.toLowerCase().includes(searchLower);
    } else {
      return item.policyNo?.toLowerCase().includes(searchLower) ||
             item.vehicleReg?.toLowerCase().includes(searchLower);
    }
  });

  const renderRenewalCard = ({ item }) => (
    <View style={styles.renewalCard}>
      <View style={styles.renewalCardHeader}>
        <Text style={styles.policyNo}>Policy: {item.policyNo}</Text>
        <View style={[styles.statusBadge, {
          backgroundColor: item.status === 'Overdue' ? Colors.error + '20' : Colors.warning + '20'
        }]}>
          <Text style={[styles.status, { 
            color: item.status === 'Overdue' ? Colors.error : Colors.warning 
          }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.vehicleReg}>Vehicle: {item.vehicleReg}</Text>
      <Text style={styles.dueDate}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
      <TouchableOpacity style={styles.renewButton}>
        <Text style={styles.renewButtonText}>Renew Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderClaimCard = ({ item }) => (
    <View style={styles.claimCard}>
      <View style={styles.renewalCardHeader}>
        <Text style={styles.policyNo}>{item.category}</Text>
        <View style={[styles.statusBadge, {
          backgroundColor: item.status === 'Processed' ? Colors.success + '20' : Colors.warning + '20'
        }]}>
          <Text style={[styles.status, {
            color: item.status === 'Processed' ? Colors.success : Colors.warning
          }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.vehicleReg}>Policy: {item.policyNo}</Text>
      <Text style={styles.dueDate}>Claim Date: {new Date(item.claimDate).toLocaleDateString()}</Text>
      <View style={styles.claimFooter}>
        <Text style={styles.claimAmount}>{item.amount}</Text>
        {item.status === 'Pending' && (
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderCard = ({ item }) => {
    if (activeTab === 'Claims') {
      return renderClaimCard({ item });
    }
    return renderRenewalCard({ item });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming & Claims</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab.toLowerCase()}...`}
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
          renderItem={renderCard}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 100 }]}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIcon}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconX}>✕</Text>
            </View>
          </View>
          
          <Text style={styles.emptyStateTitle}>
            {searchQuery ? 'No Results Found' : `No Upcoming ${activeTab}`}
          </Text>
          
          <Text style={styles.emptyStateMessage}>
            {searchQuery 
              ? `No ${activeTab.toLowerCase()} match your search "${searchQuery}"`
              : `There are currently no upcoming ${activeTab.toLowerCase()}.`
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
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 16,
    marginHorizontal: 2,
    backgroundColor: Colors.backgroundGray,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
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
    position: 'relative',
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
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  renewalCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  renewalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  policyNo: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.md,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: 12,
  },
  status: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: Typography.lineHeight.xs,
  },
  vehicleReg: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.sm,
  },
  dueDate: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeight.sm,
  },
  renewButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  renewButtonText: {
    color: Colors.background,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: Typography.lineHeight.sm,
  },
  claimCard: {
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
  claimFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
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
});
