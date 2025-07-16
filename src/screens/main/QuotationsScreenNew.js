import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, TextInput, Alert, Share, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants';
import { QuoteStorageService, PricingService } from '../../services';
import { PDFService, PaymentService } from '../../services';
import { SafeScreen, EnhancedCard, StatusBadge, ActionButton, SkeletonCard, CompactCurvedHeader } from '../../components';

export default function QuotationsScreenNew() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedQuote, setExpandedQuote] = useState(null);
  const insets = useSafeAreaInsets();

  const filters = ['All', 'Draft', 'Applied', 'Paid', 'Active'];

  // Load quotes on component mount
  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const allQuotes = await QuoteStorageService.getAllQuotes();
      setQuotes(allQuotes);
    } catch (error) {
      console.error('Error loading quotes:', error);
      Alert.alert('Error', 'Failed to load quotes');
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

  const handleShareQuote = async (quote) => {
    try {
      const message = `🏆 PataBima Insurance Quote\n\n📋 Quote Details:\n• Vehicle: ${quote.vehicleDetails?.make} ${quote.vehicleDetails?.model}\n• Registration: ${quote.vehicleDetails?.registrationNumber}\n• Premium: ${PricingService.formatCurrency(quote.calculatedPremium?.totalPremium || 0)}\n• Status: ${quote.status}\n\n💪 Get insured with PataBima!`;
      
      await Share.share({
        message: message,
        title: 'PataBima Insurance Quote'
      });
    } catch (error) {
      console.error('Error sharing quote:', error);
    }
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
              <Text style={styles.detailValue}>12 months</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <ActionButton
              title="Share"
              icon="📤"
              variant="secondary"
              size="small"
              onPress={() => handleShareQuote(quote)}
              style={styles.actionButtonSmall}
            />
            <ActionButton
              title="Edit"
              icon="✏️"
              variant="secondary"
              size="small"
              onPress={() => {}}
              style={styles.actionButtonSmall}
            />
            <ActionButton
              title="Delete"
              icon="🗑️"
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
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No quotes found</Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'All' 
          ? 'Create your first quote to get started'
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
            <Text style={styles.searchIcon}>🔍</Text>
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
              <Text style={[styles.statValue, { color: Colors.warning }]}>
                {quotes.filter(q => q.status === 'pending').length}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
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
    gap: Spacing.sm,
  },
  actionButtonSmall: {
    flex: 1,
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
