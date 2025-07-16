import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../constants';
import { SafeScreen, EnhancedCard, StatusBadge, ActionButton, StatCard, SkeletonLoader } from '../components';

export default function QuotationsScreen() {
  const [activeTab, setActiveTab] = useState('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const quotationsData = [
    {
      id: 1,
      quoteNo: 'Q-001234',
      vehicleReg: 'KCD 123A',
      vehicleMake: 'Toyota Corolla',
      insuranceType: 'Comprehensive',
      premium: 'KES 25,000',
      status: 'Active',
      validUntil: '2025-08-15',
      createdDate: '2025-07-01'
    },
    {
      id: 2,
      quoteNo: 'Q-005678',
      vehicleReg: 'KBZ 456B',
      vehicleMake: 'Honda Civic',
      insuranceType: 'Third Party',
      premium: 'KES 12,500',
      status: 'Draft',
      validUntil: '2025-07-28',
      createdDate: '2025-07-05'
    },
    {
      id: 3,
      quoteNo: 'Q-009876',
      vehicleReg: 'KCA 789C',
      vehicleMake: 'Nissan X-Trail',
      insuranceType: 'Comprehensive',
      premium: 'KES 32,750',
      status: 'Expired',
      validUntil: '2025-07-10',
      createdDate: '2025-06-20'
    },
    {
      id: 4,
      quoteNo: 'Q-011223',
      vehicleReg: 'KAA 987D',
      vehicleMake: 'Mazda Demio',
      insuranceType: 'Third Party',
      premium: 'KES 15,200',
      status: 'Active',
      validUntil: '2025-08-20',
      createdDate: '2025-07-08'
    }
  ];

  const activeQuotes = quotationsData.filter(quote => quote.status === 'Active');
  const draftQuotes = quotationsData.filter(quote => quote.status === 'Draft');
  const expiredQuotes = quotationsData.filter(quote => quote.status === 'Expired');

  const tabs = [
    { key: 'Active', label: `Active (${activeQuotes.length})` },
    { key: 'Draft', label: `Draft (${draftQuotes.length})` },
    { key: 'Expired', label: `Expired (${expiredQuotes.length})` }
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'Active': return activeQuotes;
      case 'Draft': return draftQuotes;
      case 'Expired': return expiredQuotes;
      default: return activeQuotes;
    }
  };

  const currentData = getCurrentData();
  const filteredData = currentData.filter(item => 
    searchQuery === '' || 
    item.vehicleReg?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.quoteNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.vehicleMake?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate loading delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return Colors.success;
      case 'Draft': return Colors.warning;
      case 'Expired': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getInsuranceTypeIcon = (type) => {
    return type === 'Comprehensive' ? '🛡️' : '🚗';
  };

  const handleQuoteAction = (quote, action) => {
    switch (action) {
      case 'edit':
        navigation.navigate('MotorQuotation', { quoteId: quote.id });
        break;
      case 'convert':
        // Handle conversion to policy
        break;
      case 'duplicate':
        // Handle quote duplication
        break;
      case 'share':
        // Handle quote sharing
        break;
      default:
        break;
    }
  };

  const renderQuotationCard = ({ item }) => (
    <EnhancedCard style={styles.quotationCard}>
      <View style={styles.cardHeader}>
        <View style={styles.quoteInfo}>
          <View style={styles.quoteIconContainer}>
            <Text style={styles.quoteIcon}>{getInsuranceTypeIcon(item.insuranceType)}</Text>
          </View>
          <View style={styles.quoteDetails}>
            <Text style={styles.quoteNumber}>{item.quoteNo}</Text>
            <Text style={styles.vehicleReg}>{item.vehicleReg}</Text>
          </View>
        </View>
        <StatusBadge status={item.status} />
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.vehicleMake}>{item.vehicleMake}</Text>
        <Text style={styles.insuranceType}>{item.insuranceType} Insurance</Text>
        
        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Premium</Text>
              <Text style={[styles.detailValue, { color: Colors.success }]}>{item.premium}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Valid Until</Text>
              <Text style={[styles.detailValue, { 
                color: item.status === 'Expired' ? Colors.error : Colors.textPrimary 
              }]}>
                {new Date(item.validUntil).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>{new Date(item.createdDate).toLocaleDateString()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Days Left</Text>
              <Text style={styles.detailValue}>
                {item.status === 'Expired' ? '0' : Math.max(0, Math.ceil((new Date(item.validUntil) - new Date()) / (1000 * 60 * 60 * 24)))} days
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        {item.status === 'Draft' && (
          <ActionButton
            title="Edit"
            icon="✏️"
            variant="secondary"
            size="small"
            onPress={() => handleQuoteAction(item, 'edit')}
            style={styles.actionButton}
          />
        )}
        {item.status === 'Active' && (
          <ActionButton
            title="Convert to Policy"
            icon="📋"
            variant="primary"
            size="small"
            onPress={() => handleQuoteAction(item, 'convert')}
            style={styles.actionButton}
          />
        )}
        <ActionButton
          title="Duplicate"
          icon="📄"
          variant="secondary"
          size="small"
          onPress={() => handleQuoteAction(item, 'duplicate')}
          style={styles.actionButton}
        />
      </View>
    </EnhancedCard>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No Results Found' : `No ${activeTab} Quotations`}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? `No quotations match your search "${searchQuery}"`
          : `There are currently no ${activeTab.toLowerCase()} quotations.`
        }
      </Text>
      {!searchQuery && activeTab === 'Active' && (
        <ActionButton
          title="Create New Quote"
          icon="➕"
          onPress={() => navigation.navigate('MotorQuotation')}
          style={styles.createButton}
        />
      )}
    </View>
  );

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((item) => (
        <SkeletonLoader key={item} style={styles.skeletonCard} />
      ))}
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
          <Text style={styles.title}>Quotations</Text>
          <Text style={styles.subtitle}>Manage your insurance quotes</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <StatCard
              title="Total Quotes"
              value={quotationsData.length.toString()}
              icon="📋"
              color={Colors.primary}
              style={styles.summaryCard}
            />
            <StatCard
              title="Active"
              value={activeQuotes.length.toString()}
              icon="✅"
              color={Colors.success}
              style={styles.summaryCard}
            />
            <StatCard
              title="Draft"
              value={draftQuotes.length.toString()}
              icon="📝"
              color={Colors.warning}
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
              placeholder="Search by quote number, vehicle, or make..."
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
        {loading ? (
          renderSkeletonLoader()
        ) : filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            renderItem={renderQuotationCard}
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
  quotationCard: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  quoteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quoteIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  quoteIcon: {
    fontSize: 20,
  },
  quoteDetails: {
    flex: 1,
  },
  quoteNumber: {
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
  cardContent: {
    marginBottom: Spacing.md,
  },
  vehicleMake: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.md,
  },
  insuranceType: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
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
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionButton: {
    minWidth: 110,
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
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeight.md,
  },
  createButton: {
    paddingHorizontal: Spacing.xl,
  },
  skeletonContainer: {
    gap: Spacing.md,
  },
  skeletonCard: {
    height: 200,
    borderRadius: 16,
  },
});
