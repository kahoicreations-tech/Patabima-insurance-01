import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, TextInput, Alert, Share, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography } from '../../constants';
import { QuoteStorageService, PricingService } from '../../../shared/services';
import { PDFService, PaymentService } from '../../../shared/services';
import { SafeScreen, EnhancedCard, StatusBadge, ActionButton, SkeletonCard, CompactCurvedHeader } from '../../components';

// Sample quotation data
const sampleQuotations = [
  {
    id: 1001,
    status: 'active',
    createdAt: '2024-07-10T10:30:00Z',
    vehicleDetails: {
      make: 'Toyota',
      model: 'Camry',
      year: '2022',
      registrationNumber: 'KCA 456B',
      engineNumber: 'ENG123456',
      chassisNumber: 'CHS789012'
    },
    coverageDetails: {
      type: 'Comprehensive',
      period: '12 months',
      startDate: '2024-07-15',
      endDate: '2025-07-15'
    },
    calculatedPremium: {
      basicPremium: 85000,
      totalPremium: 95000,
      taxes: 8000,
      discount: 0
    },
    clientInfo: {
      name: 'John Kamau',
      phone: '+254712345678',
      email: 'john.kamau@email.com'
    }
  },
  {
    id: 1002,
    status: 'draft',
    createdAt: '2024-07-12T14:15:00Z',
    vehicleDetails: {
      make: 'Nissan',
      model: 'X-Trail',
      year: '2021',
      registrationNumber: 'KDB 789C',
      engineNumber: 'ENG234567',
      chassisNumber: 'CHS890123'
    },
    coverageDetails: {
      type: 'Third Party',
      period: '12 months',
      startDate: '2024-07-20',
      endDate: '2025-07-20'
    },
    calculatedPremium: {
      basicPremium: 25000,
      totalPremium: 28000,
      taxes: 2500,
      discount: 0
    },
    clientInfo: {
      name: 'Mary Wanjiku',
      phone: '+254723456789',
      email: 'mary.wanjiku@email.com'
    }
  },
  {
    id: 1003,
    status: 'paid',
    createdAt: '2024-07-08T09:45:00Z',
    vehicleDetails: {
      make: 'Honda',
      model: 'Civic',
      year: '2020',
      registrationNumber: 'KBZ 321A',
      engineNumber: 'ENG345678',
      chassisNumber: 'CHS901234'
    },
    coverageDetails: {
      type: 'Comprehensive',
      period: '12 months',
      startDate: '2024-07-10',
      endDate: '2025-07-10'
    },
    calculatedPremium: {
      basicPremium: 75000,
      totalPremium: 82000,
      taxes: 6500,
      discount: 500
    },
    clientInfo: {
      name: 'Peter Mwangi',
      phone: '+254734567890',
      email: 'peter.mwangi@email.com'
    }
  },
  {
    id: 1004,
    status: 'applied',
    createdAt: '2024-07-14T16:20:00Z',
    vehicleDetails: {
      make: 'Mazda',
      model: 'CX-5',
      year: '2023',
      registrationNumber: 'KCB 654D',
      engineNumber: 'ENG456789',
      chassisNumber: 'CHS012345'
    },
    coverageDetails: {
      type: 'Comprehensive',
      period: '12 months',
      startDate: '2024-07-25',
      endDate: '2025-07-25'
    },
    calculatedPremium: {
      basicPremium: 120000,
      totalPremium: 135000,
      taxes: 12000,
      discount: 3000
    },
    clientInfo: {
      name: 'Grace Njeri',
      phone: '+254745678901',
      email: 'grace.njeri@email.com'
    }
  },
  {
    id: 1005,
    status: 'draft',
    createdAt: '2024-07-16T11:00:00Z',
    vehicleDetails: {
      make: 'Subaru',
      model: 'Forester',
      year: '2019',
      registrationNumber: 'KDD 987E',
      engineNumber: 'ENG567890',
      chassisNumber: 'CHS123456'
    },
    coverageDetails: {
      type: 'Third Party',
      period: '12 months',
      startDate: '2024-07-30',
      endDate: '2025-07-30'
    },
    calculatedPremium: {
      basicPremium: 30000,
      totalPremium: 33500,
      taxes: 3000,
      discount: 0
    },
    clientInfo: {
      name: 'Samuel Kiprotich',
      phone: '+254756789012',
      email: 'samuel.kiprotich@email.com'
    }
  },
  {
    id: 1006,
    status: 'active',
    createdAt: '2024-07-06T13:30:00Z',
    vehicleDetails: {
      make: 'Mitsubishi',
      model: 'Outlander',
      year: '2021',
      registrationNumber: 'KAA 123F',
      engineNumber: 'ENG678901',
      chassisNumber: 'CHS234567'
    },
    coverageDetails: {
      type: 'Comprehensive',
      period: '12 months',
      startDate: '2024-07-08',
      endDate: '2025-07-08'
    },
    calculatedPremium: {
      basicPremium: 95000,
      totalPremium: 105000,
      taxes: 9000,
      discount: 1000
    },
    clientInfo: {
      name: 'Linda Akinyi',
      phone: '+254767890123',
      email: 'linda.akinyi@email.com'
    }
  },
  {
    id: 1007,
    status: 'paid',
    createdAt: '2024-07-11T15:45:00Z',
    vehicleDetails: {
      make: 'Volkswagen',
      model: 'Tiguan',
      year: '2022',
      registrationNumber: 'KBA 456G',
      engineNumber: 'ENG789012',
      chassisNumber: 'CHS345678'
    },
    coverageDetails: {
      type: 'Comprehensive',
      period: '12 months',
      startDate: '2024-07-12',
      endDate: '2025-07-12'
    },
    calculatedPremium: {
      basicPremium: 110000,
      totalPremium: 125000,
      taxes: 11000,
      discount: 4000
    },
    clientInfo: {
      name: 'David Ochieng',
      phone: '+254778901234',
      email: 'david.ochieng@email.com'
    }
  },
  {
    id: 1008,
    status: 'applied',
    createdAt: '2024-07-13T12:15:00Z',
    vehicleDetails: {
      make: 'Ford',
      model: 'Explorer',
      year: '2020',
      registrationNumber: 'KCZ 789H',
      engineNumber: 'ENG890123',
      chassisNumber: 'CHS456789'
    },
    coverageDetails: {
      type: 'Third Party',
      period: '12 months',
      startDate: '2024-07-18',
      endDate: '2025-07-18'
    },
    calculatedPremium: {
      basicPremium: 35000,
      totalPremium: 38500,
      taxes: 3200,
      discount: 0
    },
    clientInfo: {
      name: 'Catherine Wambui',
      phone: '+254789012345',
      email: 'catherine.wambui@email.com'
    }
  }
];

export default function QuotationsScreenNew() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [quotes, setQuotes] = useState(sampleQuotations);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedQuote, setExpandedQuote] = useState(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const filters = ['All', 'Draft', 'Applied', 'Paid', 'Active'];

  // Load quotes on component mount
  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to load from storage service, fallback to sample data
      try {
        const storedQuotes = await QuoteStorageService.getAllQuotes();
        if (storedQuotes && storedQuotes.length > 0) {
          setQuotes(storedQuotes);
        } else {
          setQuotes(sampleQuotations);
        }
      } catch (error) {
        console.log('Using sample data');
        setQuotes(sampleQuotations);
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
      Alert.alert('Error', 'Failed to load quotes');
      setQuotes(sampleQuotations); // Fallback to sample data
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQuotes();
    setRefreshing(false);
  };

  const handleDeleteQuote = async (quoteId) => {
    Alert.alert(
      'Delete Quote',
      'Are you sure you want to delete this quote?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedQuotes = quotes.filter(q => q.id !== quoteId);
              setQuotes(updatedQuotes);
              Alert.alert('Success', 'Quote deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete quote');
            }
          }
        }
      ]
    );
  };

  const handleQuoteSupport = (quote) => {
    Alert.alert(
      'Quote Support',
      `Need help with your quote for ${quote.vehicleDetails?.make} ${quote.vehicleDetails?.model}?\n\nOur support team is ready to assist you with:\n• Quote modifications\n• Coverage questions\n• Payment assistance\n• Policy details\n\nWould you like to contact support?`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Contact Support', onPress: () => {
          Alert.alert('Contact Support', 'Our support team will contact you within 2 hours during business hours.');
        }}
      ]
    );
  };

  const handleEditQuote = (quote) => {
    Alert.alert(
      'Edit Quote',
      `Edit quote for ${quote.vehicleDetails?.registrationNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => {
          // Navigate to edit quote screen
          console.log('Navigate to edit quote:', quote.id);
        }}
      ]
    );
  };

  const handleCreateNewQuote = () => {
    Alert.alert(
      'Under Maintenance',
      'Our quotation system is currently under maintenance. We are working to improve your experience and will be back soon!',
      [
        { text: 'OK', style: 'default' },
        { text: 'Get Notified', onPress: () => {
          Alert.alert(
            'Notification Set',
            'You will be notified when the quotation system is available.',
            [{ text: 'OK' }]
          );
        }}
      ]
    );
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesFilter = activeFilter === 'All' || quote.status === activeFilter.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      quote.vehicleDetails?.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.id.toString().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return Colors.success;
      case 'paid': return Colors.primary;
      case 'applied': return Colors.warning;
      case 'draft': return Colors.textSecondary;
      default: return Colors.textSecondary;
    }
  };

  const renderQuoteCard = ({ item: quote }) => (
    <EnhancedCard 
      style={styles.quoteCard}
      onPress={() => setExpandedQuote(expandedQuote === quote.id ? null : quote.id)}
    >
      <View style={styles.quoteHeader}>
        <View style={styles.quoteInfo}>
          <Text style={styles.quoteId}>Quote #{quote.id.toString().slice(-6)}</Text>
          <Text style={styles.vehicleInfo}>
            {quote.vehicleDetails?.make} {quote.vehicleDetails?.model}
          </Text>
          <Text style={styles.registrationNumber}>
            {quote.vehicleDetails?.registrationNumber}
          </Text>
        </View>
        <View style={styles.quoteActions}>
          <StatusBadge status={quote.status} />
          <Text style={styles.premiumAmount}>
            {PricingService.formatCurrency(quote.calculatedPremium?.totalPremium || 0)}
          </Text>
        </View>
      </View>

      {expandedQuote === quote.id && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>
                {new Date(quote.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Year</Text>
              <Text style={styles.detailValue}>
                {quote.vehicleDetails?.year || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Coverage</Text>
              <Text style={styles.detailValue}>
                {quote.coverageDetails?.type || 'Standard'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Period</Text>
              <Text style={styles.detailValue}>
                {quote.coverageDetails?.period || '12 months'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Client</Text>
              <Text style={styles.detailValue}>
                {quote.clientInfo?.name || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>
                {quote.clientInfo?.phone || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Basic Premium</Text>
              <Text style={styles.detailValue}>
                {PricingService.formatCurrency(quote.calculatedPremium?.basicPremium || 0)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Taxes</Text>
              <Text style={styles.detailValue}>
                {PricingService.formatCurrency(quote.calculatedPremium?.taxes || 0)}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <ActionButton
              title="Support"
              icon="?"
              variant="primary"
              size="small"
              onPress={() => handleQuoteSupport(quote)}
              style={styles.actionButtonSmall}
            />
            <ActionButton
              title="Edit"
              icon="E"
              variant="secondary"
              size="small"
              onPress={() => handleEditQuote(quote)}
              style={styles.actionButtonSmall}
            />
            <ActionButton
              title="Delete"
              icon="×"
              variant="outline"
              size="small"
              onPress={() => handleDeleteQuote(quote.id)}
              style={styles.actionButtonSmall}
            />
          </View>
        </View>
      )}
    </EnhancedCard>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>□</Text>
      <Text style={styles.emptyTitle}>No quotes found</Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'All' 
          ? 'Quotation system is under maintenance'
          : `No ${activeFilter.toLowerCase()} quotes available`
        }
      </Text>
    </View>
  );

  const renderFilterTab = (filter) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterTab,
        activeFilter === filter && styles.activeFilterTab
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text style={[
        styles.filterTabText,
        activeFilter === filter && styles.activeFilterTabText
      ]}>
        {filter}
      </Text>
      {filter !== 'All' && (
        <View style={[
          styles.filterBadge,
          activeFilter === filter && styles.activeFilterBadge
        ]}>
          <Text style={[
            styles.filterBadgeText,
            activeFilter === filter && styles.activeFilterBadgeText
          ]}>
            {quotes.filter(q => q.status === filter.toLowerCase()).length}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeScreen>
      <StatusBar style="light" />
      
      {/* Compact Curved Header */}
      <CompactCurvedHeader 
        title="Quotations"
        subtitle="Manage your insurance quotes"
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

        {/* Search Bar */}
        <EnhancedCard style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by registration or quote ID..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
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

        {/* Filter Tabs */}
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {filters.map(renderFilterTab)}
          </ScrollView>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{quotes.length}</Text>
              <Text style={styles.statLabel}>Total Quotes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: Colors.success }]}>
                {quotes.filter(q => q.status === 'active').length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>
                {quotes.filter(q => q.status === 'paid').length}
              </Text>
              <Text style={styles.statLabel}>Paid</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: Colors.warning }]}>
                {quotes.filter(q => q.status === 'draft').length}
              </Text>
              <Text style={styles.statLabel}>Draft</Text>
            </View>
          </View>
        </View>

        {/* Quotes List */}
        {loading ? (
          <View>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <FlatList
            data={filteredQuotes}
            renderItem={renderQuoteCard}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={renderEmptyState}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={() => handleCreateNewQuote()}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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
  filtersContainer: {
    marginBottom: Spacing.lg,
  },
  filtersScroll: {
    paddingHorizontal: Spacing.xs,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.xs,
  },
  activeFilterTab: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.sm,
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    marginLeft: Spacing.xs,
    minWidth: 20,
    alignItems: 'center',
  },
  activeFilterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.xs,
  },
  activeFilterBadgeText: {
    color: '#FFFFFF',
  },
  statsContainer: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.xl,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.xs,
  },
  quoteCard: {
    marginBottom: Spacing.md,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quoteInfo: {
    flex: 1,
  },
  quoteId: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.sm,
  },
  vehicleInfo: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.md,
  },
  registrationNumber: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.sm,
  },
  quoteActions: {
    alignItems: 'flex-end',
  },
  premiumAmount: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    lineHeight: Typography.lineHeight.lg,
  },
  expandedContent: {
    marginTop: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  detailItem: {
    width: '48%',
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
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  actionButtonSmall: {
    flex: 1,
    minWidth: '30%',
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
  fab: {
    position: 'absolute',
    right: Spacing.md,
    backgroundColor: Colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
});
