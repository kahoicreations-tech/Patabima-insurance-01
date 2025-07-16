import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, Image, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants';
import { SafeScreen, EnhancedCard, StatCard, StatusBadge, CompactCurvedHeader } from '../../components';

export default function HomeScreen() {
  const [currentCampaign, setCurrentCampaign] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(0);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const categoriesRef = useRef(null);

  const mockData = {
    sales: 125000,
    production: 85000,
    commission: 15750,
    agentCode: 'IA16332',
    nextPayout: '16th July, 2025'
  };

  const insuranceCategories = [
    { id: 1, name: 'Motor Vehicle', icon: '🚗', color: Colors.primary, screen: 'MotorQuotation' },
    { id: 2, name: 'Medical', icon: '🏥', color: Colors.success, screen: 'MedicalQuotation' },
    { id: 3, name: 'WIBA', icon: '👷', color: Colors.warning, screen: 'WIBAQuotation' },
    { id: 4, name: 'Last Expense', icon: '⚰️', color: Colors.secondary, screen: 'LastExpenseQuotation' },
    { id: 5, name: 'Travel', icon: '✈️', color: Colors.info, screen: 'TravelQuotation' },
    { id: 6, name: 'Personal Accident', icon: '🛡️', color: Colors.primary, screen: 'PersonalAccidentQuotation' },
    { id: 7, name: 'Professional Indemnity', icon: '💼', color: Colors.success, screen: null },
    { id: 8, name: 'Domestic Package', icon: '🏠', color: Colors.warning, screen: null }
  ];

  // Auto-slide effect for insurance categories
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCategory((prevCategory) => {
        const nextCategory = (prevCategory + 1) % insuranceCategories.length;
        
        // Scroll to the next category with error handling
        if (categoriesRef.current) {
          try {
            categoriesRef.current.scrollToIndex({
              index: nextCategory,
              animated: true,
              viewPosition: 0.5, // Center the item
            });
          } catch (error) {
            // Fallback to scrollToOffset if scrollToIndex fails
            const offset = nextCategory * 160;
            categoriesRef.current.scrollToOffset({
              offset,
              animated: true,
            });
          }
        }
        
        return nextCategory;
      });
    }, 3000); // Change category every 3 seconds

    return () => clearInterval(interval);
  }, [insuranceCategories.length]);

  const campaigns = [
    {
      id: 1,
      title: "Contractor's Risk Insurance",
      description: 'Comprehensive coverage for construction and contractor risks',
      category: 'Construction',
      image: 'https://patabima.com/assets/images/CAR.jpeg',
      url: 'https://patabima.com/commercial-insurance',
    },
    {
      id: 2,
      title: 'Business Protection',
      description: 'Comprehensive business interruption coverage',
      category: 'Business',
      image: 'https://patabima.com/assets/images/stress.avif',
      url: 'https://patabima.com/commercial-insurance',
    },
    {
      id: 3,
      title: 'Theft & Burglary Insurance',
      description: 'Protect your assets against theft and burglary',
      category: 'Security',
      image: 'https://patabima.com/assets/images/theft.avif',
      url: 'https://patabima.com/commercial-insurance',
    },
    {
      id: 4,
      title: 'Pressure Vessels Insurance',
      description: 'Specialized coverage for boilers and pressure vessels',
      category: 'Industrial',
      image: 'https://patabima.com/assets/images/pressure.avif',
      url: 'https://patabima.com/commercial-insurance',
    },
    {
      id: 5,
      title: 'Book Debts Protection',
      description: 'Safeguard your business against debt defaults',
      category: 'Financial',
      image: 'https://patabima.com/assets/images/book.avif',
      url: 'https://patabima.com/commercial-insurance',
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

  const extensionData = [
    {
      id: 1,
      policyNo: 'POL-001234',
      vehicleReg: 'KCD 123A',
      status: 'Extension Due',
      dueDate: '2025-07-18',
      extensionPeriod: '3 months',
      reason: 'Awaiting vehicle inspection'
    },
    {
      id: 2,
      policyNo: 'POL-005678',
      vehicleReg: 'KBZ 456B',
      status: 'Extension Due',
      dueDate: '2025-07-20',
      extensionPeriod: '1 month',
      reason: 'Pending documentation'
    }
  ];

  const claimsData = [
    {
      id: 1,
      category: 'Vehicle',
      policyNo: 'POL-001234',
      status: 'Processed',
      amount: 'KES 45,000',
      claimNo: 'CLM-001234',
      vehicleReg: 'KCD 123A',
      claimDate: '2025-06-28',
      submissionDate: '2025-06-28',
      description: 'Vehicle accident claim - Front bumper damage due to collision at parking lot. Minor scratches and dents observed.',
      documents: ['Police Report', 'Vehicle Registration', 'Photos of Damage', 'Repair Estimate']
    },
    {
      id: 2,
      category: 'Medical',
      policyNo: 'POL-002345',
      status: 'Pending',
      amount: 'KES 12,500',
      claimNo: 'CLM-002345',
      claimDate: '2025-07-01',
      submissionDate: '2025-07-01',
      description: 'Medical claim for outpatient treatment - Consultation and medication for respiratory infection.',
      documents: ['Medical Report', 'Prescription', 'Hospital Receipt']
    },
    {
      id: 3,
      category: 'WIBA',
      policyNo: 'POL-003456',
      status: 'Processed',
      amount: 'KES 28,750',
      claimNo: 'CLM-003456',
      claimDate: '2025-06-25',
      submissionDate: '2025-06-25',
      description: 'Work injury claim - Slip and fall incident at workplace resulting in minor injury requiring physiotherapy.',
      documents: ['Incident Report', 'Medical Certificate', 'Physiotherapy Report', 'Employer Statement']
    },
    {
      id: 4,
      category: 'Vehicle',
      policyNo: 'POL-004567',
      status: 'Pending',
      amount: 'KES 67,200',
      claimNo: 'CLM-004567',
      vehicleReg: 'KBZ 456B',
      claimDate: '2025-07-03',
      submissionDate: '2025-07-03',
      description: 'Vehicle theft claim - Complete vehicle theft from secured parking area. Police report filed and case under investigation.',
      documents: ['Police Report', 'Vehicle Registration', 'Insurance Certificate', 'Key Replacement Report']
    }
  ];

  // Helper function to get the most urgent item (renewal or extension)
  const getMostUrgentItem = () => {
    const allItems = [
      ...renewalData.map(item => ({ ...item, type: 'renewal' })),
      ...extensionData.map(item => ({ ...item, type: 'extension' }))
    ];
    
    // Sort by due date (earliest first)
    allItems.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    return allItems.length > 0 ? allItems[0] : null;
  };

  const handleCampaignPress = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open this link');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while opening the link');
    }
  };

  const renderCampaignCard = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.campaignCard}
      onPress={() => handleCampaignPress(item.url)}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: item.image }}
        style={styles.campaignImage}
        resizeMode="cover"
      />
      <View style={styles.campaignOverlay}>
        <Text style={styles.campaignTitle}>{item.title}</Text>
        <Text style={styles.campaignDescription}>{item.description}</Text>
        <Text style={styles.campaignCta}>Learn More →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeScreen>
      <StatusBar style="light" />
      
      {/* Compact Curved Header */}
      <CompactCurvedHeader 
        title="PataBima Agency"
        subtitle="Insurance for Protection"
      />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        
        {/* Spacing after curved header */}
        <View style={styles.headerSpacing} />

        {/* Agent Summary Card */}
        <EnhancedCard
          onPress={() => navigation.navigate('MyAccount')}
          style={styles.agentSummaryCard}
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
          
          <View style={styles.performanceSummary}>
            <View style={styles.performanceHeader}>
              <Text style={styles.performanceTitle}>Performance Summary</Text>
              <Text style={styles.performanceSubtitle}>Your earnings overview</Text>
            </View>
            
            <View style={styles.performanceStats}>
              <View style={styles.performanceItem}>
                <View style={styles.performanceIconContainer}>
                  <Text style={styles.performanceIcon}>💰</Text>
                </View>
                <Text style={styles.performanceValue}>KES {(mockData.commission / 1000).toFixed(0)}K</Text>
                <Text style={styles.performanceLabel}>Commission</Text>
                <Text style={styles.performanceTrend}>+12%</Text>
              </View>
              
              <View style={styles.performanceDivider} />
              
              <View style={styles.performanceItem}>
                <View style={styles.performanceIconContainer}>
                  <Text style={styles.performanceIcon}>📊</Text>
                </View>
                <Text style={styles.performanceValue}>KES {(mockData.sales / 1000).toFixed(0)}K</Text>
                <Text style={styles.performanceLabel}>Sales</Text>
                <Text style={styles.performanceTrend}>+8%</Text>
              </View>
              
              <View style={styles.performanceDivider} />
              
              <View style={styles.performanceItem}>
                <View style={styles.performanceIconContainer}>
                  <Text style={styles.performanceIcon}>🎯</Text>
                </View>
                <Text style={styles.performanceValue}>KES {(mockData.production / 1000).toFixed(0)}K</Text>
                <Text style={styles.performanceLabel}>Production</Text>
                <Text style={styles.performanceTrend}>+15%</Text>
              </View>
            </View>
          </View>
        </EnhancedCard>

        {/* Insurance Categories - Horizontal Slider */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Insurance Categories</Text>
          <FlatList
            ref={categoriesRef}
            data={insuranceCategories}
            renderItem={({ item, index }) => (
              <EnhancedCard 
                style={[
                  styles.categoryCard,
                  currentCategory === index && styles.activeCategoryCard
                ]}
                onPress={() => {
                  if (item.screen) {
                    navigation.navigate(item.screen);
                  } else {
                    Alert.alert(
                      'Coming Soon',
                      `${item.name} insurance will be available soon!`,
                      [{ text: 'OK' }]
                    );
                  }
                }}
                elevated={true}
                padding={Spacing.md}
                borderRadius={12}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: item.color + '15' }]}>
                  <Text style={styles.categoryIcon}>{item.icon}</Text>
                </View>
                <Text style={[
                  styles.categoryName,
                  currentCategory === index && styles.activeCategoryName
                ]}>{item.name}</Text>
              </EnhancedCard>
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesSlider}
            snapToInterval={160}
            snapToAlignment="start"
            decelerationRate="fast"
            pagingEnabled={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / 160);
              setCurrentCategory(Math.max(0, Math.min(index, insuranceCategories.length - 1)));
            }}
            onScrollToIndexFailed={(error) => {
              // Handle scroll failure gracefully
              console.warn('Scroll to index failed:', error);
              if (categoriesRef.current) {
                const offset = error.index * 160;
                categoriesRef.current.scrollToOffset({
                  offset,
                  animated: true,
                });
              }
            }}
            getItemLayout={(data, index) => ({
              length: 160,
              offset: 160 * index,
              index,
            })}
            initialScrollIndex={0}
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
                  currentCampaign === index && styles.activeIndicator
                ]}
              />
            ))}
          </View>
        </View>

        {/* Upcoming Summary */}
        <View style={styles.sectionContainer}>
          <View style={styles.upcomingSectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Upcoming')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.upcomingSummary}>
            <View style={styles.upcomingItem}>
              <Text style={styles.upcomingCount}>{renewalData.length}</Text>
              <Text style={styles.upcomingLabel}>Renewals</Text>
            </View>
            <View style={styles.upcomingDivider} />
            <View style={styles.upcomingItem}>
              <Text style={[styles.upcomingCount, { color: Colors.warning }]}>{extensionData.length}</Text>
              <Text style={styles.upcomingLabel}>Extensions</Text>
            </View>
            <View style={styles.upcomingDivider} />
            <TouchableOpacity 
              style={styles.upcomingItem}
              onPress={() => navigation.navigate('Upcoming')}
            >
              <Text style={styles.upcomingCount}>{claimsData.filter(c => c.status === 'Pending').length}</Text>
              <Text style={styles.upcomingLabel}>Claims</Text>
            </TouchableOpacity>
          </View>

          {/* Preview Card */}
          {(() => {
            const mostUrgentItem = getMostUrgentItem();
            if (!mostUrgentItem) return null;
            
            return (
              <EnhancedCard 
                style={[
                  styles.previewCard,
                  mostUrgentItem.type === 'extension' && styles.extensionPreviewCard
                ]}
                onPress={() => {
                  // Navigate to the Upcoming tab first
                  navigation.navigate('Upcoming');
                }}
                elevated={true}
              >
                <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle}>
                    {mostUrgentItem.type === 'extension' ? 'Next Extension' : 'Next Renewal'}
                  </Text>
                  <StatusBadge status={mostUrgentItem.status} size="small" />
                </View>
                <Text style={styles.previewPolicy}>{mostUrgentItem.policyNo}</Text>
                <Text style={styles.previewVehicle}>{mostUrgentItem.vehicleReg}</Text>
                <Text style={styles.previewDate}>Due: {new Date(mostUrgentItem.dueDate).toLocaleDateString()}</Text>
                {mostUrgentItem.type === 'extension' && (
                  <Text style={styles.previewExtensionInfo}>
                    {mostUrgentItem.extensionPeriod} • {mostUrgentItem.reason}
                  </Text>
                )}
                <Text style={[
                  styles.renewButtonText,
                  mostUrgentItem.type === 'extension' && styles.extensionButtonText
                ]}>
                  {mostUrgentItem.type === 'extension' ? 'Tap to Extend →' : 'Tap to Renew →'}
                </Text>
              </EnhancedCard>
            );
          })()}
        </View>
      </ScrollView>
    </SafeScreen>
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
    paddingHorizontal: Spacing.md,
  },
  headerSpacing: {
    height: Spacing.lg,
  },
  agentSummaryCard: {
    marginBottom: Spacing.lg,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  agentInfo: {
    flex: 1,
  },
  agentCode: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs / 2,
    lineHeight: Typography.lineHeight.md,
  },
  nextPayout: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.sm,
  },
  agentActions: {
    alignItems: 'center',
  },
  agentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs / 2,
  },
  agentIcon: {
    fontSize: 20,
  },
  viewAccountText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    lineHeight: Typography.lineHeight.xs,
  },
  performanceSummary: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  performanceHeader: {
    marginBottom: Spacing.sm,
  },
  performanceTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs / 2,
    lineHeight: Typography.lineHeight.md,
  },
  performanceSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.sm,
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  performanceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  performanceIcon: {
    fontSize: 18,
  },
  performanceValue: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs / 2,
    lineHeight: Typography.lineHeight.md,
  },
  performanceLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs / 2,
    lineHeight: Typography.lineHeight.xs,
  },
  performanceTrend: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.success,
    lineHeight: Typography.lineHeight.xs,
  },
  performanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.xs,
  },
  sectionContainer: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeight.lg,
  },
  categoriesSlider: {
    paddingHorizontal: Spacing.xs,
  },
  categoryCard: {
    width: 140,
    height: 120,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  activeCategoryCard: {
    transform: [{ scale: 1 }],
    opacity: 1,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.sm,
    opacity: 0.8,
  },
  activeCategoryName: {
    opacity: 1,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },
  campaignsSlider: {
    paddingHorizontal: Spacing.xs,
  },
  campaignCard: {
    width: 280,
    height: 180,
    borderRadius: 16,
    marginHorizontal: Spacing.xs,
    overflow: 'hidden',
    position: 'relative',
  },
  campaignImage: {
    width: '100%',
    height: '100%',
  },
  campaignOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: Spacing.md,
  },
  campaignTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.md,
  },
  campaignDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: '#FFFFFF',
    lineHeight: Typography.lineHeight.sm,
  },
  campaignCta: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: '#FFFFFF',
    marginTop: Spacing.sm,
    textAlign: 'right',
    lineHeight: Typography.lineHeight.sm,
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
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.xs,
  },
  activeIndicator: {
    backgroundColor: Colors.primary,
  },
  upcomingSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  viewAllButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  viewAllText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
    lineHeight: Typography.lineHeight.sm,
  },
  upcomingSummary: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  upcomingItem: {
    flex: 1,
    alignItems: 'center',
  },
  upcomingCount: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.xl,
  },
  upcomingLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.xs,
  },
  upcomingDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  previewCard: {
    marginBottom: 0,
  },
  extensionPreviewCard: {
    borderColor: Colors.warning + '30',
    borderWidth: 1,
    backgroundColor: Colors.warning + '05',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  previewTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.md,
  },
  previewPolicy: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.sm,
  },
  previewVehicle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.sm,
  },
  previewDate: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.xs,
    marginBottom: Spacing.sm,
  },
  previewExtensionInfo: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.warning,
    lineHeight: Typography.lineHeight.xs,
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
  },
  renewButtonText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    textAlign: 'right',
  },
  extensionButtonText: {
    color: Colors.warning,
  },
});
