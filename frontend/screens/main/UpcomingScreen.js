import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, RefreshControl, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, Typography } from '../../constants';
import { SafeScreen, EnhancedCard, StatusBadge, ActionButton, StatCard, CompactCurvedHeader, SkeletonCard } from '../../components';
import djangoAPI from '../../services/DjangoAPIService';
import { useAppData } from '../../contexts/AppDataContext';

export default function UpcomingScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Renewals');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { renewals, extensions, claims, fetchRenewals, fetchExtensions, fetchClaims } = useAppData();
  const insets = useSafeAreaInsets();

  // Normalize claim records from backend to UI shape
  const mapClaim = useCallback((c) => ({
    id: c.id,
    claimNo: c.id,
    category: c.product || 'MOTOR',
    policyNo: c.policy_number,
    vehicleReg: c.vehicle_reg || '',
    status: c.status || 'SUBMITTED',
    amount: c.estimated_amount ? `KES ${Number(c.estimated_amount).toLocaleString()}` : undefined,
    claimDate: c.loss_date,
    submissionDate: c.date_created,
    description: c.loss_description,
    documents: Array.isArray(c.documents) ? c.documents.map(d => d.file_name) : [],
  }), []);

  // Map claims for UI shape
  const mapAndSetClaims = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await fetchClaims();
      // Claims in context are raw; map locally for UI
      return (list || []).map(mapClaim);
    } catch (e) {
      console.error('Failed to load claims:', e);
      Alert.alert('Error', 'Failed to load claims. Please try again.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [fetchClaims, mapClaim]);

  // Fetch all data only when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('[UpcomingScreen] Screen focused, fetching data...');
      const fetchData = async () => {
        try {
          setIsLoading(true);
          await Promise.all([
            fetchRenewals(),
            fetchExtensions(),
            fetchClaims(),
          ]);
        } catch (error) {
          console.error('[UpcomingScreen] Failed to load data:', error);
          Alert.alert('Error', 'Failed to load some data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }, [])
  );

  const tabs = useMemo(() => ([
    { key: 'Renewals', label: `Renewals (${renewals.length})` },
    { key: 'Extensions', label: `Extensions (${extensions.length})` },
    { key: 'Claims', label: `Claims (${claims.length})` }
  ]), [renewals.length, extensions.length, claims.length]);

  const getCurrentData = () => {
    switch (activeTab) {
      case 'Renewals': return renewals;
      case 'Extensions': return extensions;
      case 'Claims': return claims;
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
    try {
      await Promise.all([
        fetchRenewals(),
        fetchExtensions(),
        fetchClaims(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const renderRenewalCard = ({ item }) => (
    <EnhancedCard style={styles.itemCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.policyNo}>Policy: {item.policyNo}</Text>
          <Text style={styles.vehicleReg}>Vehicle: {item.vehicleReg}</Text>
        </View>
        <StatusBadge 
          status={item.status} 
          color={item.badgeColor || (item.urgency === 'OVERDUE' ? '#DC2626' : item.urgency === 'URGENT' ? '#F59E0B' : '#3B82F6')} 
        />
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>{new Date(item.dueDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Days Left</Text>
            <Text style={[
              styles.detailValue,
              { color: item.daysLeft <= 7 ? '#DC2626' : item.daysLeft <= 30 ? '#F59E0B' : '#10B981' }
            ]}>
              {item.daysLeft || 0} days
            </Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Premium</Text>
            <Text style={styles.detailValue}>KES {Number(item.currentPremium || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Underwriter</Text>
            <Text style={styles.detailValue}>{item.underwriter || 'N/A'}</Text>
          </View>
        </View>
        
        <ActionButton
          title="Renew Now"
          icon="🔄"
          size="small"
          variant={item.urgency === 'OVERDUE' || item.urgency === 'URGENT' ? 'primary' : 'secondary'}
          onPress={() => {
            // Navigate to Motor 2 flow with renewal data
            Alert.alert(
              'Renew Policy',
              `Start renewal process for policy ${item.policyNo}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Renew',
                  onPress: () => {
                    // TODO: Navigate to Motor2Flow with prefilled renewal data
                    navigation.navigate('Motor2', {
                      mode: 'renewal',
                      policyNumber: item.policyNo,
                      policyData: item
                    });
                  }
                }
              ]
            );
          }}
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
        <StatusBadge 
          status={item.status} 
          color={item.badgeColor || '#F59E0B'} 
        />
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Expired Date</Text>
            <Text style={styles.detailValue}>{new Date(item.expiredDate || item.dueDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Grace Remaining</Text>
            <Text style={[
              styles.detailValue,
              { color: (item.graceRemainingDays || 0) <= 7 ? '#DC2626' : '#F59E0B' }
            ]}>
              {item.graceRemainingDays || 0} days
            </Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Balance Amount</Text>
            <Text style={styles.detailValue}>KES {Number(item.balanceAmount || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Late Fee</Text>
            <Text style={styles.detailValue}>{item.lateFeePercentage || 0}%</Text>
          </View>
        </View>
        
        <View style={styles.extensionReason}>
          <Text style={styles.detailLabel}>Grace Period</Text>
          <Text style={styles.reasonText}>{item.reason || 'Extension available'}</Text>
        </View>
        
        <ActionButton
          title="Extend Now"
          icon="⏱️"
          size="small"
          variant={(item.graceRemainingDays || 0) <= 7 ? 'primary' : 'secondary'}
          onPress={() => {
            Alert.alert(
              'Extend Policy',
              `Generate extension quote for policy ${item.policyNo}?\n\nBalance Amount: KES ${Number(item.balanceAmount || 0).toLocaleString()}\nLate Fee: ${item.lateFeePercentage || 0}%`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Get Quote',
                  onPress: async () => {
                    try {
                      setIsLoading(true);
                      const extensionQuote = await djangoAPI.extendMotorPolicy(item.policyNo, { months: 11 });
                      
                      // Show extension quote and navigate to payment
                      Alert.alert(
                        'Extension Quote',
                        `Total Amount: KES ${Number(extensionQuote.extensionQuote?.total_amount || 0).toLocaleString()}\n` +
                        `Late Fee: KES ${Number(extensionQuote.extensionQuote?.late_fee || 0).toLocaleString()}\n` +
                        `New Expiry: ${new Date(extensionQuote.newExpiryDate).toLocaleDateString()}`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Proceed to Payment',
                            onPress: () => {
                              // TODO: Navigate to payment with extension quote
                              navigation.navigate('Payment', {
                                type: 'extension',
                                policyNumber: item.policyNo,
                                quote: extensionQuote
                              });
                            }
                          }
                        ]
                      );
                    } catch (error) {
                      Alert.alert('Error', error.message || 'Failed to generate extension quote');
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }
              ]
            );
          }}
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
        
        <ActionButton
          title={item.status === 'Pending' ? 'View & Track' : 'View Details'}
          icon="👁️"
          variant={item.status === 'Pending' ? 'primary' : 'secondary'}
          size="small"
          onPress={() => {
            console.log('Viewing details for claim:', item.claimNo);
            navigation.navigate('ClaimDetails', { claim: item });
          }}
          style={styles.actionButton}
        />
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
    <SafeScreen disableTopPadding>
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
                <Text style={styles.statNumber}>{renewals.length}</Text>
                <Text style={styles.statLabel}>Renewals</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{extensions.length}</Text>
                <Text style={styles.statLabel}>Extensions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{claims.length}</Text>
                <Text style={styles.statLabel}>Claims</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: Colors.warning }]}>
                  {claims.filter(c => (c.status || '').toUpperCase() === 'PENDING').length}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          </EnhancedCard>
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

        {/* Submit New Claim Button - Only show when Claims tab is active */}
        {activeTab === 'Claims' && (
          <View style={styles.submitClaimSection}>
            <ActionButton
              title="Submit New Claim"
              icon="📝"
              onPress={() => navigation.navigate('ClaimsSubmission')}
              style={styles.submitClaimButton}
            />
          </View>
        )}

        {/* Content */}
        {isLoading ? (
          <View>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : filteredData.length > 0 ? (
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
    paddingHorizontal: Spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    height: 40,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 14,
    color: Colors.textSecondary,
    opacity: 0.5,
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
  submitClaimSection: {
    marginBottom: Spacing.md,
  },
  submitClaimButton: {
    marginHorizontal: 0,
  },
});

