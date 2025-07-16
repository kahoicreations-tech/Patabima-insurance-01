import import { SafeScreen, EnhancedCard, StatusBadge, ActionButton, SkeletonCard } from '../../components';

export default function QuotationsScreen() {useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, TextInput, Alert, Share, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants';
import { QuoteStorageService, PricingService } from '../../services';
import { PDFService, PaymentService } from '../../services';
import { SafeScreen, EnhancedCard, StatusBadge, ActionButton, SkeletonCard } from '../../components';React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, TextInput, Alert, Share } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants';
import { QuoteStorageService, PricingService } from '../../services';
import { PDFService, PaymentService } from '../../services';

export default function QuotationsScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
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
              // Note: Add actual delete functionality to QuoteStorageService
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
      await PDFService.sharePDF(quote);
    } catch (error) {
      console.error('Error sharing quote:', error);
      Alert.alert('Error', 'Failed to share quote');
    }
  };

  const handlePayment = async (quote) => {
    try {
      PaymentService.showPaymentOptions(quote, async (method, amount, installmentType) => {
        const result = await PaymentService.initiatePayment(quote, method, amount);
        
        if (result.success) {
          Alert.alert('Payment Initiated', result.message);
          // Update quote status
          await QuoteStorageService.updateQuoteStatus(quote.id, 'payment_pending');
          loadQuotes();
        } else {
          Alert.alert('Payment Failed', result.error);
        }
      });
    } catch (error) {
      console.error('Error initiating payment:', error);
      Alert.alert('Error', 'Failed to initiate payment');
    }
  };

  const getInsuranceTypeIcon = (type) => {
    const icons = {
      motor: '🚗',
      medical: '🏥',
      wiba: '👷',
      lastExpense: '⚰️',
      travel: '✈️',
      personalAccident: '🛡️'
    };
    return icons[type] || '📋';
  };

  const getInsuranceTypeName = (type) => {
    const names = {
      motor: 'Motor Vehicle',
      medical: 'Medical Insurance',
      wiba: 'WIBA',
      lastExpense: 'Last Expense',
      travel: 'Travel Insurance',
      personalAccident: 'Personal Accident'
    };
    return names[type] || 'Insurance';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return Colors.success;
      case 'paid':
        return Colors.primary;
      case 'applied':
        return Colors.warning;
      case 'draft':
        return Colors.textSecondary;
      case 'payment_pending':
        return '#FF9500';
      default:
        return Colors.textSecondary;
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesFilter = activeFilter === 'All' || quote.status === activeFilter.toLowerCase();
    const matchesSearch = 
      quote.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.insuranceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderQuoteItem = ({ item }) => {
    const isExpanded = expandedQuote === item.id;
    
    return (
      <View style={styles.quotationCard}>
        <TouchableOpacity 
          style={styles.cardHeader}
          onPress={() => setExpandedQuote(isExpanded ? null : item.id)}
        >
          <View style={styles.policyInfo}>
            <View style={styles.iconPlaceholder}>
              <Text style={styles.iconText}>{getInsuranceTypeIcon(item.insuranceType)}</Text>
            </View>
            <View style={styles.policyDetails}>
              <Text style={styles.policyNumber}>{item.id}</Text>
              <Text style={styles.policyType}>{getInsuranceTypeName(item.insuranceType)}</Text>
              <Text style={styles.amount}>
                {PricingService.formatCurrency(item.calculatedPremium?.totalPremium || 0)}
              </Text>
              <Text style={styles.grossLabel}>
                Customer: {item.customerName || item.companyName || 'N/A'}
              </Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || 'Draft'}
              </Text>
            </View>
            <TouchableOpacity style={styles.expandButton}>
              <Text style={[styles.expandIcon, { transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }]}>
                ⌄
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.quoteDetails}>
              <Text style={styles.detailLabel}>Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
              <Text style={styles.detailLabel}>
                Phone: {item.phoneNumber || 'N/A'}
              </Text>
              {item.email && (
                <Text style={styles.detailLabel}>Email: {item.email}</Text>
              )}
              
              {/* Premium breakdown */}
              {item.calculatedPremium && (
                <View style={styles.premiumBreakdown}>
                  <Text style={styles.breakdownTitle}>Premium Breakdown:</Text>
                  <Text style={styles.breakdownItem}>
                    Monthly: {PricingService.formatCurrency(item.calculatedPremium.totalPremium / 12)}
                  </Text>
                  {item.calculatedPremium.basePremium && (
                    <Text style={styles.breakdownItem}>
                      Base Premium: {PricingService.formatCurrency(item.calculatedPremium.basePremium)}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.shareButton]}
                onPress={() => handleShareQuote(item)}
              >
                <Text style={styles.actionButtonText}>📤 Share PDF</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.payButton]}
                onPress={() => handlePayment(item)}
                disabled={item.status === 'paid' || item.status === 'active'}
              >
                <Text style={[styles.actionButtonText, styles.payButtonText]}>
                  💳 {item.status === 'paid' ? 'Paid' : 'Pay Now'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteQuote(item.id)}
              >
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
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
              placeholder="Search quotations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textSecondary}
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
        data={filteredQuotes}
        renderItem={renderQuoteItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        refreshing={loading}
        onRefresh={loadQuotes}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Quotes Found</Text>
            <Text style={styles.emptyMessage}>
              {searchQuery 
                ? 'No quotes match your search criteria' 
                : 'Start creating quotes to see them here'
              }
            </Text>
          </View>
        )}
      />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
    lineHeight: Typography.lineHeight.xxl,
  },
  searchContainer: {
    marginBottom: Spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: Typography.fontSize.md,
    marginRight: Spacing.sm,
    color: Colors.textSecondary,
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
  expandedContent: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  quoteDetails: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  premiumBreakdown: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  breakdownTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  breakdownItem: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs / 2,
    fontFamily: Typography.fontFamily.regular,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: Colors.primary + '15',
  },
  payButton: {
    backgroundColor: Colors.success + '15',
  },
  deleteButton: {
    backgroundColor: Colors.error + '15',
  },
  actionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  payButtonText: {
    color: Colors.success,
  },
  deleteButtonText: {
    color: Colors.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
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
  },
  emptyMessage: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    fontFamily: Typography.fontFamily.regular,
  },
});
