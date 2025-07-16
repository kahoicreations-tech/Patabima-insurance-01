import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants';
import { SafeScreen, EnhancedCard, StatusBadge, ActionButton, StatCard, CompactCurvedHeader } from '../../components';

export default function UpcomingScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Renewals');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
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

  const extensionData = [
    {
      id: 1,
      policyNo: 'POL-001234',
      vehicleReg: 'KCD 123A',
      status: 'Extension Due',
      dueDate: '2025-07-15',
      extensionPeriod: '3 months',
      reason: 'Awaiting vehicle inspection'
    },
    {
      id: 2,
      policyNo: 'POL-005678',
      vehicleReg: 'KBZ 456B',
      status: 'Extension Due',
      dueDate: '2025-06-30',
      extensionPeriod: '1 month',
      reason: 'Pending documentation'
    }
  ];

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

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate loading delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderRenewalCard = ({ item }) => (
    <EnhancedCard style={styles.itemCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.policyNo}>Policy: {item.policyNo}</Text>
          <Text style={styles.vehicleReg}>Vehicle: {item.vehicleReg}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>{new Date(item.dueDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Days Left</Text>
            <Text style={styles.detailValue}>
              {Math.max(0, Math.ceil((new Date(item.dueDate) - new Date()) / (1000 * 60 * 60 * 24)))} days
            </Text>
          </View>
        </View>
        
        <ActionButton
          title="Renew Now"
          icon="🔄"
          size="small"
          onPress={() => navigation.navigate('Renewal', { policy: item })}
          style={styles.actionButton}
        />
      </View>
    </EnhancedCard>
  );

  const renderExtensionCard = ({ item }) => (
    <EnhancedCard style={styles.itemCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.policyNo}>Policy: {item.policyNo}</Text>
          <Text style={styles.vehicleReg}>Vehicle: {item.vehicleReg}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>{new Date(item.dueDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Period</Text>
            <Text style={styles.detailValue}>{item.extensionPeriod}</Text>
          </View>
        </View>
        
        <View style={styles.extensionReason}>
          <Text style={styles.detailLabel}>Reason</Text>
          <Text style={styles.reasonText}>{item.reason}</Text>
        </View>
        
        <ActionButton
          title="Extend Now"
          icon="⏱️"
          size="small"
          onPress={() => navigation.navigate('Extension', { policy: item })}
          style={styles.actionButton}
        />
      </View>
    </EnhancedCard>
  );

  const renderClaimCard = ({ item }) => (
    <EnhancedCard style={styles.itemCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.policyNo}>{item.category}</Text>
          <Text style={styles.vehicleReg}>Policy: {item.policyNo}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Claim Date</Text>
            <Text style={styles.detailValue}>{new Date(item.claimDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={[styles.detailValue, { color: Colors.success }]}>{item.amount}</Text>
          </View>
        </View>
        
        {item.status === 'Pending' && (
          <ActionButton
            title="View Details"
            icon="👁️"
            variant="secondary"
            size="small"
            onPress={() => navigation.navigate('ClaimDetails', { claim: item })}
            style={styles.actionButton}
          />
        )}
      </View>
    </EnhancedCard>
  );

  const renderCard = ({ item }) => {
    if (activeTab === 'Claims') {
      return renderClaimCard({ item });
    }
    if (activeTab === 'Extensions') {
      return renderExtensionCard({ item });
    }
    return renderRenewalCard({ item });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>
        {activeTab === 'Renewals' ? '📅' : activeTab === 'Claims' ? '📋' : '📄'}
      </Text>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No Results Found' : `No Upcoming ${activeTab}`}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? `No ${activeTab.toLowerCase()} match your search "${searchQuery}"`
          : `There are currently no upcoming ${activeTab.toLowerCase()}.`
        }
      </Text>
    </View>
  );

  return (
    <SafeScreen>
      <StatusBar style="light" />
      
      {/* Compact Curved Header */}
      <CompactCurvedHeader 
        title="Upcoming & Claims"
        subtitle="Manage renewals and track claims"
      />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        
        {/* Spacing after curved header */}
        <View style={styles.headerSpacing} />

        {/* Summary Overview */}
        <View style={styles.summarySection}>
          <EnhancedCard style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View style={styles.overviewIcon}>
                <Text style={styles.overviewIconText}>📊</Text>
              </View>
              <View style={styles.overviewHeaderInfo}>
                <Text style={styles.overviewTitle}>Overview</Text>
                <Text style={styles.overviewSubtitle}>Total activities summary</Text>
              </View>
            </View>
            
            <View style={styles.overviewStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{renewalData.length}</Text>
                <Text style={styles.statLabel}>Renewals</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{extensionData.length}</Text>
                <Text style={styles.statLabel}>Extensions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{claimsData.length}</Text>
                <Text style={styles.statLabel}>Claims</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: Colors.warning }]}>
                  {claimsData.filter(c => c.status === 'Pending').length}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          </EnhancedCard>
        </View>

        {/* Search Bar */}
        <EnhancedCard style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textSecondary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </EnhancedCard>

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
            scrollEnabled={false}
          />
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
  },
  headerSpacing: {
    height: Spacing.lg,
  },
  summarySection: {
    marginBottom: Spacing.lg,
  },
  overviewCard: {
    padding: Spacing.md,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  overviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  overviewIconText: {
    fontSize: 24,
  },
  overviewHeaderInfo: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.lg,
  },
  overviewSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.sm,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.xl,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },
  searchContainer: {
    marginBottom: Spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.md,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  clearIcon: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: Spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.sm,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  itemCard: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  policyNo: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.md,
  },
  vehicleReg: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.sm,
  },
  cardDetails: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    marginBottom: Spacing.xs,
  },
  detailLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.xs,
  },
  detailValue: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.sm,
  },
  actionButton: {
    minWidth: 120,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  extensionReason: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  reasonText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: Typography.lineHeight.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: Typography.lineHeight.lg,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.md,
  },
});

