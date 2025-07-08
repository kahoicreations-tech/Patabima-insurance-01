import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../constants';

export default function HomeScreen() {
  const [currentCampaign, setCurrentCampaign] = useState(0);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const mockData = {
    sales: 125000,
    production: 85000,
    commission: 15750,
    agentCode: 'IA16332',
    nextPayout: '16th July, 2025'
  };

  const insuranceCategories = [
    { id: 1, name: 'Motor Vehicle', icon: '🚗', color: Colors.primary, screen: 'MotorQuotation' },
    { id: 2, name: 'Medical', icon: '🏥', color: Colors.success, screen: null },
    { id: 3, name: 'WIBA', icon: '👷', color: Colors.warning, screen: null },
    { id: 4, name: 'Last Expense', icon: '⚰️', color: Colors.secondary, screen: null },
    { id: 5, name: 'Travel', icon: '✈️', color: Colors.info, screen: null },
    { id: 6, name: 'Personal Accident', icon: '🛡️', color: Colors.primary, screen: null },
    { id: 7, name: 'Professional Indemnity', icon: '💼', color: Colors.success, screen: null },
    { id: 8, name: 'Domestic Package', icon: '🏠', color: Colors.warning, screen: null }
  ];

  const campaigns = [
    {
      id: 1,
      title: 'Special Drive',
      description: 'Special vehicle insurance campaign with up to 20% discount',
    },
    {
      id: 2,
      title: 'Health Protection',
      description: 'Comprehensive medical coverage for your family',
    },
    {
      id: 3,
      title: 'Workers Cover',
      description: 'WIBA insurance for workplace protection',
    }
  ];

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

  const claimsData = [
    {
      id: 1,
      category: 'Vehicle',
      policyNo: 'POL-001234',
      status: 'Processed',
      amount: 'KES 45,000'
    },
    {
      id: 2,
      category: 'Medical',
      policyNo: 'POL-002345',
      status: 'Pending',
      amount: 'KES 12,500'
    },
    {
      id: 3,
      category: 'WIBA',
      policyNo: 'POL-003456',
      status: 'Processed',
      amount: 'KES 28,750'
    },
    {
      id: 4,
      category: 'Vehicle',
      policyNo: 'POL-004567',
      status: 'Pending',
      amount: 'KES 67,200'
    }
  ];

  const renderCampaignCard = ({ item, index }) => (
    <View style={styles.campaignCard}>
      <Text style={styles.campaignTitle}>{item.title}</Text>
      <Text style={styles.campaignDescription}>{item.description}</Text>
      <TouchableOpacity style={styles.campaignButton}>
        <Text style={styles.campaignButtonText}>Learn More</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Hello, Agent!</Text>
          <Text style={styles.subtitle}>Welcome to PataBima</Text>
        </View>

        {/* Agent Summary Card */}
        <TouchableOpacity 
          style={styles.agentSummaryCard}
          onPress={() => navigation.navigate('MyAccount')}
          activeOpacity={0.8}
        >
          <View style={styles.agentHeader}>
            <View style={styles.agentInfo}>
              <Text style={styles.agentCode}>Agent Code: {mockData.agentCode}</Text>
              <Text style={styles.nextPayout}>Next Payout: {mockData.nextPayout}</Text>
            </View>
            <View style={styles.agentActions}>
              <View style={styles.agentIconContainer}>
                <Text style={styles.agentIcon}>👤</Text>
              </View>
              <Text style={styles.viewAccountText}>View Account →</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>KES {(mockData.commission / 1000).toFixed(0)}K</Text>
              <Text style={styles.summaryLabel}>Commission</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>KES {(mockData.sales / 1000).toFixed(0)}K</Text>
              <Text style={styles.summaryLabel}>Sales</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>KES {(mockData.production / 1000).toFixed(0)}K</Text>
              <Text style={styles.summaryLabel}>Production</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Insurance Categories - Horizontal Slider */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Insurance Categories</Text>
          <FlatList
            data={insuranceCategories}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.categoryCard}
                onPress={() => {
                  if (item.name === 'Motor Vehicle') {
                    navigation.navigate('MotorQuotation');
                  }
                  // Add navigation for other categories later
                }}
              >
                <Text style={styles.categoryIcon}>{item.icon}</Text>
                <Text style={styles.categoryName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesSlider}
            snapToInterval={160}
            decelerationRate="fast"
          />
        </View>

        {/* Campaigns Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Active Campaigns</Text>
          <FlatList
            data={campaigns}
            renderItem={renderCampaignCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.campaignsSlider}
            snapToInterval={280}
            decelerationRate="fast"
          />
          {/* Campaign Indicators */}
          <View style={styles.campaignIndicators}>
            {campaigns.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  { backgroundColor: index === currentCampaign ? Colors.primary : Colors.border }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Upcoming Summary */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Upcoming')}
            >
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.upcomingSummary}
            onPress={() => navigation.navigate('Upcoming')}
            activeOpacity={0.8}
          >
            <View style={styles.summaryItem}>
              <Text style={styles.summaryCount}>3</Text>
              <Text style={styles.summaryType}>Renewals</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryCount}>0</Text>
              <Text style={styles.summaryType}>Extensions</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryCount}>{claimsData.length}</Text>
              <Text style={styles.summaryType}>Claims</Text>
            </View>
          </TouchableOpacity>
          
          {/* Show latest renewal as preview */}
          {renewalData.length > 0 && (
            <TouchableOpacity 
              style={styles.previewCard}
              onPress={() => navigation.navigate('Upcoming')}
              activeOpacity={0.7}
            >
              <Text style={styles.previewLabel}>Next Due:</Text>
              <View style={styles.previewContent}>
                <Text style={styles.previewPolicy}>{renewalData[0].policyNo}</Text>
                <Text style={styles.previewVehicle}>{renewalData[0].vehicleReg}</Text>
                <View style={[styles.previewStatus, {
                  backgroundColor: renewalData[0].status === 'Overdue' ? Colors.error + '20' : Colors.warning + '20'
                }]}>
                  <Text style={[styles.previewStatusText, {
                    color: renewalData[0].status === 'Overdue' ? Colors.error : Colors.warning
                  }]}>{renewalData[0].status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

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
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  greeting: {
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.lg,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.sm,
  },
  sectionContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeight.lg,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoriesSlider: {
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.lg,
  },
  categoryCard: {
    width: 120,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderRadius: 8,
    padding: Spacing.md,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryIconText: {
    color: Colors.background,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    lineHeight: Typography.lineHeight.md,
  },
  categoryName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.md,
  },
  campaignCard: {
    backgroundColor: Colors.primaryLight,
    padding: Spacing.lg,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  campaignTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: Typography.lineHeight.lg,
  },
  campaignDescription: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeight.md,
  },
  campaignButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  campaignButtonText: {
    color: Colors.background,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: Typography.lineHeight.md,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  welcomeSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  agentSummaryCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  agentInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  agentCode: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.lg,
  },
  nextPayout: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.sm,
    flexWrap: 'wrap',
  },
  agentActions: {
    alignItems: 'center',
    flexShrink: 0,
  },
  agentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  agentIcon: {
    fontSize: 18,
  },
  viewAccountText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    lineHeight: Typography.lineHeight.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  summaryValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.lg,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.sm,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoriesSlider: {
    paddingRight: Spacing.lg,
  },
  categoryCard: {
    width: 140,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  categoryName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.md,
    textAlign: 'center',
  },
  campaignsSlider: {
    paddingRight: Spacing.lg,
  },
  campaignCard: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    borderRadius: 12,
    marginRight: Spacing.md,
    width: 260,
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
  campaignTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: Typography.lineHeight.lg,
  },
  campaignDescription: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeight.md,
  },
  campaignButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  campaignIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: Spacing.xs,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundGray,
    borderRadius: 8,
    padding: 4,
    marginBottom: Spacing.md,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.md,
  },
  activeToggleText: {
    color: Colors.background,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  viewAllButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  viewAllText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    lineHeight: Typography.lineHeight.sm,
  },
  upcomingSummary: {
    flexDirection: 'row',
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
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.xxl,
  },
  summaryType: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.md,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
  },
  previewCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  previewLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.sm,
  },
  previewContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewPolicy: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.md,
  },
  previewVehicle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.sm,
  },
  previewStatus: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: 12,
  },
  previewStatusText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: Typography.lineHeight.xs,
  },
  previewDate: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    lineHeight: Typography.lineHeight.sm,
  },
});
