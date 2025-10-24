import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../constants';
import { SafeScreen, EnhancedCard, StatusBadge, StatCard } from '../components';

export default function UpcomingScreen() {
  const [activeTab, setActiveTab] = useState('Renewals');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const renewalData = [
    {
      id: 1,
      policyNo: 'POL-001234',
      vehicleReg: 'KCD 123A',
      insuranceType: 'Comprehensive',
      status: 'Due Soon',
      dueDate: '2025-07-15',
      premium: 'KES 25,000'
    },
    {
      id: 2,
      policyNo: 'POL-005678',
      vehicleReg: 'KBZ 456B',
      insuranceType: 'Third Party',
      status: 'Overdue',
      dueDate: '2025-06-30',
      premium: 'KES 12,500'
    },
    {
      id: 3,
      policyNo: 'POL-009876',
      vehicleReg: 'KCA 789C',
      insuranceType: 'Comprehensive',
      status: 'Due Soon',
      dueDate: '2025-07-20',
      premium: 'KES 32,750'
    },
    {
      id: 4,
      policyNo: 'POL-011223',
      vehicleReg: 'KAA 987D',
      insuranceType: 'Third Party',
      status: 'Due Today',
      dueDate: '2025-07-14',
      premium: 'KES 15,200'
    }
  ];

  const extensionData = [
    {
      id: 1,
      policyNo: 'POL-002468',
      vehicleReg: 'KBB 111E',
      currentExpiry: '2025-07-16',
      requestedExtension: '3 months',
      status: 'Pending Approval',
      fee: 'KES 2,500'
    },
    {
      id: 2,
      policyNo: 'POL-013579',
      vehicleReg: 'KCC 222F',
      currentExpiry: '2025-07-18',
      requestedExtension: '6 months',
      status: 'Approved',
      fee: 'KES 4,800'
    }
  ];

  const tabs = [
    { key: 'Renewals', label: `Renewals (${renewalData.length})` },
    { key: 'Extensions', label: `Extensions (${extensionData.length})` }
  ];

  const currentData = activeTab === 'Renewals' ? renewalData : extensionData;
  const filteredData = currentData.filter(item => 
    searchQuery === '' || 
    item.vehicleReg?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.policyNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const overdueCounts = {
    renewals: renewalData.filter(item => item.status === 'Overdue').length,
    dueSoon: renewalData.filter(item => item.status === 'Due Soon').length,
    dueToday: renewalData.filter(item => item.status === 'Due Today').length,
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate loading delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Overdue': return Colors.error;
      case 'Due Today': return Colors.warning;
      case 'Due Soon': return Colors.info;
      case 'Pending Approval': return Colors.warning;
      case 'Approved': return Colors.success;
      default: return Colors.textSecondary;
    }
  };

  const renderRenewalCard = ({ item }) => (
    <EnhancedCard style={styles.itemCard}>
      <View style={styles.cardHeader}>
        <View style={styles.vehicleInfo}>
          <View style={styles.vehicleIconContainer}>
            <Text style={styles.vehicleIcon}>🚗</Text>
          </View>
          <View style={styles.vehicleDetails}>
            <Text style={styles.vehicleReg}>{item.vehicleReg}</Text>
            <Text style={styles.policyNumber}>Policy: {item.policyNo}</Text>
          </View>
        </View>
        <StatusBadge status={item.status} />
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Insurance Type</Text>
            <Text style={styles.detailValue}>{item.insuranceType}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Premium</Text>
            <Text style={[styles.detailValue, { color: Colors.success }]}>{item.premium}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={[styles.detailValue, { color: getStatusColor(item.status) }]}>
              {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Days Left</Text>
            <Text style={styles.detailValue}>
              {Math.ceil((new Date(item.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days
            </Text>
          </View>
        </View>
      </View>
    </EnhancedCard>
  );

  const renderExtensionCard = ({ item }) => (
    <EnhancedCard style={styles.itemCard}>
      <View style={styles.cardHeader}>
        <View style={styles.vehicleInfo}>
          <View style={styles.vehicleIconContainer}>
            <Text style={styles.vehicleIcon}>📅</Text>
          </View>
          <View style={styles.vehicleDetails}>
            <Text style={styles.vehicleReg}>{item.vehicleReg}</Text>
            <Text style={styles.policyNumber}>Policy: {item.policyNo}</Text>
          </View>
        </View>
        <StatusBadge status={item.status} />
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Current Expiry</Text>
            <Text style={styles.detailValue}>{new Date(item.currentExpiry).toLocaleDateString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Extension Period</Text>
            <Text style={styles.detailValue}>{item.requestedExtension}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Extension Fee</Text>
            <Text style={[styles.detailValue, { color: Colors.success }]}>{item.fee}</Text>
          </View>
        </View>
      </View>
    </EnhancedCard>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>
        {activeTab === 'Renewals' ? '🔄' : '📅'}
      </Text>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No Results Found' : `No ${activeTab}`}
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
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Upcoming</Text>
          <Text style={styles.subtitle}>Manage renewals and extensions</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <StatCard
              title="Overdue"
              value={overdueCounts.renewals.toString()}
              icon="⚠️"
              color={Colors.error}
              style={styles.summaryCard}
            />
            <StatCard
              title="Due Today"
              value={overdueCounts.dueToday.toString()}
              icon="📅"
              color={Colors.warning}
              style={styles.summaryCard}
            />
            <StatCard
              title="Due Soon"
              value={overdueCounts.dueSoon.toString()}
              icon="⏰"
              color={Colors.info}
              style={styles.summaryCard}
            />
          </View>
        </View>

        {/* Search Bar */}
        <EnhancedCard style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by vehicle registration or policy..."
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
            renderItem={activeTab === 'Renewals' ? renderRenewalCard : renderExtensionCard}
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
    paddingHorizontal: Spacing.lg,
  },
  header: {
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.xxl,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.md,
  },
  summarySection: {
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  summaryCard: {
    flex: 1,
    marginBottom: 0,
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
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  vehicleIcon: {
    fontSize: 20,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleReg: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.md,
  },
  policyNumber: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.sm,
  },
  cardDetails: {
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  detailItem: {
    flex: 1,
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
