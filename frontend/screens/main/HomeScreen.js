import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, Image, Linking, Animated, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants';
import { SafeScreen, EnhancedCard, StatCard, StatusBadge, CompactCurvedHeader, LoadingSpinner, SkeletonLoader } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../services/users';
import { campaignsAPI } from '../../services/campaigns';
// Legacy shared/data removed. Define local fallbacks and helpers.
const CATEGORY_STATUS = {
  ACTIVE: 'ACTIVE',
  COMING_SOON: 'COMING_SOON',
  MAINTENANCE: 'MAINTENANCE',
  DISABLED: 'DISABLED',
};

const getCategoryStatusMessage = (item) => {
  switch (item?.status) {
    case CATEGORY_STATUS.MAINTENANCE:
      return `${item?.name || 'This category'} is temporarily unavailable due to maintenance. Please try again later.`;
    case CATEGORY_STATUS.COMING_SOON:
      return `${item?.name || 'This category'} is coming soon. Stay tuned for updates!`;
    case CATEGORY_STATUS.DISABLED:
      return `${item?.name || 'This category'} is currently unavailable.`;
    default:
      return 'This feature is currently unavailable.';
  }
};

const getActiveCategories = (categories) =>
  (categories || []).filter((c) => c.status === CATEGORY_STATUS.ACTIVE);

// Minimal, app-ready fallback list. Dynamically merged with backend lines when available.
const STATIC_INSURANCE_CATEGORIES = [
  {
    id: 1,
    name: 'Motor Insurance',
    icon: 'car-sport',
    color: '#D5222B',
    screen: 'Motor2Flow', // Updated to use Motor 2 (Phase 2)
    status: CATEGORY_STATUS.ACTIVE,
  },
  {
    id: 2,
    name: 'Medical Insurance',
    icon: 'medical',
    screen: 'MedicalCategory',
    status: CATEGORY_STATUS.ACTIVE,
  },
  {
    id: 3,
    name: 'WIBA',
    icon: 'construct',
    color: '#D5222B',
    screen: 'WIBAQuote',
    status: CATEGORY_STATUS.ACTIVE,
  },
  {
    id: 4,
    name: 'Last Expense',
    icon: 'heart-circle',
    color: '#D5222B',
    screen: 'LastExpenseQuotation',
    status: CATEGORY_STATUS.ACTIVE,
  },
  {
    id: 5,
    name: 'Travel Insurance',
    icon: 'airplane',
    color: '#D5222B',
    screen: 'TravelQuotation',
    status: CATEGORY_STATUS.ACTIVE,
  },
  {
    id: 6,
    name: 'Personal Accident',
    icon: 'person',
    color: '#D5222B',
    screen: 'PersonalAccidentQuotation',
    status: CATEGORY_STATUS.ACTIVE,
  },
  {
    id: 7,
    name: 'Professional Indemnity',
    icon: 'briefcase',
    color: '#D5222B',
    screen: 'ProfessionalIndemnityQuotation',
    status: CATEGORY_STATUS.ACTIVE,
  },
  {
    id: 8,
    name: 'Domestic Package',
    icon: 'home',
    color: '#D5222B',
    screen: 'DomesticPackageQuotation',
    status: CATEGORY_STATUS.ACTIVE,
  },
];
const FEATURED_INSURANCE_CATEGORIES = [];
const CAMPAIGNS = [];
// import { fetchProductLines, mapLineToHomeCategory } from '../../services/catalogService';

export default function HomeScreen() {
  // Dynamic lines disabled - using only static categories
  // const [dynamicLines, setDynamicLines] = useState([]);
  // useEffect(() => {
  //   let aborted = false;
  //   const controller = new AbortController();
  //   (async () => {
  //     try {
  //       const lines = await fetchProductLines(controller.signal);
  //       if (!aborted) setDynamicLines(lines || []);
  //     } catch (_) {}
  //   })();
  //   return () => { aborted = true; controller.abort(); };
  // }, []);
  // Use only static categories for now - dynamic backend integration disabled for non-motor
  const MERGED_CATEGORIES = useMemo(() => {
    return STATIC_INSURANCE_CATEGORIES;
  }, []);
  const [currentCampaign, setCurrentCampaign] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [agentData, setAgentData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [renewalData, setRenewalData] = useState([]);
  const [extensionData, setExtensionData] = useState([]);
  const [claimsData, setClaimsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const categoriesRef = useRef(null);
  const campaignsRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const autoScrollTimerRef = useRef(null);
  const autoScrollRestartRef = useRef(null);
  const isInteractingRef = useRef(false);
  const campaignAutoScrollRef = useRef(null);
  const isCampaignInteractingRef = useRef(false);
  const trackedImpressions = useRef(new Set()); // Track which campaigns had impressions logged
  const ITEM_WIDTH = 150; // Card width
  const ITEM_SPACING = 12; // Space between cards
  const ITEM_SIZE = ITEM_WIDTH + ITEM_SPACING; // Total size including spacing
  const CAMPAIGN_CARD_WIDTH = 280;
  const CAMPAIGN_SPACING = 12;
  const { user, isAuthenticated } = useAuth();

  // Load agent data and dashboard statistics (gate UI until profile ready)
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Fetch campaigns only after authentication is confirmed
  useEffect(() => {
    // Don't fetch campaigns until user is authenticated
    if (!isAuthenticated) {
      console.log('[HomeScreen] Waiting for authentication before fetching campaigns');
      return;
    }

    let cancelled = false;
    
    const fetchCampaigns = async () => {
      try {
        setCampaignsLoading(true);
        console.log('[HomeScreen] Fetching campaigns for authenticated user');
        const activeCampaigns = await campaignsAPI.getActiveCampaigns();
        if (!cancelled) {
          setCampaigns(activeCampaigns);
          console.log(`[HomeScreen] Successfully loaded ${activeCampaigns.length} campaigns`);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('[HomeScreen] Campaigns fetch error:', error?.message || error);
          // Silent fail - don't show alerts for campaigns
        }
      } finally {
        if (!cancelled) {
          setCampaignsLoading(false);
        }
      }
    };

    fetchCampaigns();

    // Auto-refresh campaigns every 5 minutes
    const interval = setInterval(fetchCampaigns, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated]); // Re-fetch when authentication state changes

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use Django API to get current user profile with better error handling
      console.log('[HomeScreen] Loading dashboard data...');
      const profile = await usersAPI.getCurrentUser();
      console.log('[HomeScreen] Profile data received:', profile?.agent_code);
      
      // Store agent data in AsyncStorage for DjangoAPIService
      await AsyncStorage.setItem('agent_data', JSON.stringify(profile));
      
      // Transform Django user data to expected format
      const transformedProfile = {
        agentCode: profile.agent_code || 'N/A',
        fullName: profile.full_names || 'User',
        commission: 0, // TODO: Get from CommissionModel when implemented
        sales: 0,      // TODO: Get from SalesModel when implemented
        production: 0, // TODO: Get from ProductionModel when implemented
        nextPayout: profile.next_commission_date || 'Not Available',
        phoneNumber: profile.phonenumber || '', 
        email: profile.email || '',
        role: profile.role || 'AGENT',
        lastLogin: profile.last_login || null
      };
      
      setAgentData(transformedProfile);

      // TODO: Implement these when Django endpoints are ready
      setRenewalData([]);
      setExtensionData([]);
      setClaimsData([]);
      
      console.log('[HomeScreen] Dashboard data loaded successfully');
    } catch (error) {
      console.error('[HomeScreen] Error loading dashboard data:', error.message);
      
      // Check if it's an authentication error
      const isAuthError = error?.message?.includes('Session expired') || 
                         error?.message?.includes('401') ||
                         error?.message?.includes('Unauthorized');
      
      const isNetworkError = error?.message?.includes('Network') ||
                            error?.message?.includes('timeout') ||
                            error?.message?.includes('connection');
      
      if (isAuthError) {
        console.log('[HomeScreen] Authentication required - user needs to log in');
        // Don't show alert for auth errors - let the auth system handle it
      } else if (isNetworkError) {
        // Show user-friendly network error with retry option
        Alert.alert(
          'Connection Issue', 
          'Unable to connect to the server. Please check your internet connection.',
          [
            { text: 'Retry', onPress: () => loadDashboardData() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else {
        // Generic error - provide retry option
        Alert.alert(
          'Error Loading Data', 
          'Something went wrong. Please try again.',
          [
            { text: 'Retry', onPress: () => loadDashboardData() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh all dashboard data
      const promises = [loadDashboardData()];
      
      // Only fetch campaigns if authenticated
      if (isAuthenticated) {
        promises.push((async () => {
          try {
            const activeCampaigns = await campaignsAPI.getActiveCampaigns();
            setCampaigns(activeCampaigns);
          } catch (error) {
            console.error('[HomeScreen] Campaign refresh error:', error?.message || error);
          }
        })());
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error('[HomeScreen] Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Format last login time
  const formatLastLogin = (lastLoginDate) => {
    if (!lastLoginDate) return 'Never';
    
    const now = new Date();
    const loginDate = new Date(lastLoginDate);
    const diffMs = now - loginDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    // Format as "Jan 15, 2025"
    return loginDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format commission date
  const formatCommissionDate = (dateString) => {
    if (!dateString || dateString === 'Not Available') return 'Not Available';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / 86400000);
    
    // Format as "Jan 15" or "15th Jan"
    const formatted = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0 && diffDays <= 7) return `in ${diffDays} days (${formatted})`;
    
    return formatted;
  };

  // Get first name from full name
  const getFirstName = (fullName) => {
    if (!fullName || fullName === 'User') return 'Agent';
    return fullName.split(' ')[0];
  };

  // Get insurance categories from centralized data (dynamic merge aware)
  const insuranceCategories = useMemo(() => 
    MERGED_CATEGORIES.map(category => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      screen: category.screen,
      lineCode: category.lineCode,
      status: category.status
    })), [MERGED_CATEGORIES]);

  // Debug: Log all categories (runs only once since MERGED_CATEGORIES is memoized)
  useEffect(() => {
    console.log('All insurance categories:', insuranceCategories.map(c => ({ name: c.name, screen: c.screen })));
  }, []);

  // Auto-slide effect for insurance categories with interaction pause
  useEffect(() => {
    const startAutoScroll = () => {
      if (autoScrollTimerRef.current) return;
      autoScrollTimerRef.current = setInterval(() => {
        if (isInteractingRef.current || insuranceCategories.length === 0) return;
        setCurrentCategory((prevCategory) => {
          const nextCategory = (prevCategory + 1) % insuranceCategories.length;
          if (categoriesRef.current) {
            try {
              categoriesRef.current.scrollToIndex({
                index: nextCategory,
                animated: true,
                viewPosition: 0.5,
              });
            } catch (error) {
              const offset = nextCategory * ITEM_SIZE;
              categoriesRef.current.scrollToOffset({ offset, animated: true });
            }
          }
          return nextCategory;
        });
      }, 3500);
    };

    const stopAutoScroll = () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
        autoScrollTimerRef.current = null;
      }
    };

    // Start initially
    startAutoScroll();

    return () => {
      stopAutoScroll();
      if (autoScrollRestartRef.current) {
        clearTimeout(autoScrollRestartRef.current);
        autoScrollRestartRef.current = null;
      }
    };
  }, [insuranceCategories.length]);

  // Auto-scroll for campaigns carousel
  useEffect(() => {
    if (!campaigns || campaigns.length <= 1) {
      return;
    }

    const startAutoScroll = () => {
      campaignAutoScrollRef.current = setInterval(() => {
        if (isCampaignInteractingRef.current) {
          return; // Don't auto-scroll while user is interacting
        }

        setCurrentCampaign((prevCampaign) => {
          const nextCampaign = (prevCampaign + 1) % campaigns.length;
          
          if (campaignsRef.current) {
            const offset = nextCampaign * (CAMPAIGN_CARD_WIDTH + CAMPAIGN_SPACING);
            campaignsRef.current.scrollToOffset({ offset, animated: true });
          }
          return nextCampaign;
        });
      }, 5000); // 5 seconds for campaigns (longer than categories)
    };

    const stopAutoScroll = () => {
      if (campaignAutoScrollRef.current) {
        clearInterval(campaignAutoScrollRef.current);
        campaignAutoScrollRef.current = null;
      }
    };

    // Start initially
    startAutoScroll();

    return () => {
      stopAutoScroll();
    };
  }, [campaigns.length]);

  // Track campaign impressions when visible
  const handleCampaignViewableChange = useCallback(({ viewableItems }) => {
    viewableItems.forEach(({ item, isViewable }) => {
      if (isViewable && item?.id && !trackedImpressions.current.has(item.id)) {
        trackedImpressions.current.add(item.id);
        campaignsAPI.trackImpression(item.id);
      }
    });
  }, []);

  // Campaign scroll handlers for smooth auto-scroll
  const handleCampaignScroll = useCallback((event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CAMPAIGN_CARD_WIDTH + CAMPAIGN_SPACING));
    setCurrentCampaign(index);
  }, []);

  const handleCampaignScrollBeginDrag = useCallback(() => {
    isCampaignInteractingRef.current = true;
  }, []);

  const handleCampaignMomentumScrollEnd = useCallback(() => {
    // Resume auto-scroll after user stops interacting
    setTimeout(() => {
      isCampaignInteractingRef.current = false;
    }, 500);
  }, []);

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

  const handleCampaignPress = useCallback(async (campaign) => {
    try {
      // Poster-only: just track impression/click, no external link opening
      await campaignsAPI.trackClick(campaign.id);
    } catch (error) {
      console.error('[HomeScreen] Campaign press error:', error);
    }
  }, []);

  const renderCampaignCard = useCallback(({ item, index }) => (
    <TouchableOpacity 
      style={styles.campaignCard}
      onPress={() => handleCampaignPress(item)}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: item.image_url }}
        style={styles.campaignImage}
        resizeMode="cover"
        onError={(e) => {
          try {
            console.warn('[HomeScreen] Failed to load campaign image:', item?.image_url, e?.nativeEvent?.error);
          } catch {}
        }}
      />
      {/* Poster-only: no overlay text or CTA */}
    </TouchableOpacity>
  ), [handleCampaignPress]);

  // WhatsApp chat handler
  const handleWhatsAppPress = () => {
    Alert.alert(
      'WhatsApp Support',
      'Coming Soon! We\'re working on integrating WhatsApp support for instant customer assistance.',
      [
        {
          text: 'OK',
          style: 'default'
        }
      ]
    );
  };

  // Gate: if we are still loading or have no agent profile, render a lightweight skeleton
  if (loading || !agentData) {
    return (
      <SafeScreen backgroundColor="transparent">
        <StatusBar style="light" />
        <LoadingSpinner text="Loading your dashboard…" />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen backgroundColor="transparent" disableTopPadding>
      <StatusBar style="light" />
      
      {/* Compact Curved Header */}
      <CompactCurvedHeader 
        title="Pata Bima Agency"
        subtitle="Insurance for protection"
        showLogo={true}
        logoSource={require('../../assets/PataLogo.png')}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
            title="Pull to refresh"
            titleColor={Colors.textSecondary}
          />
        }
      >
        {/* Spacing after curved header for breathing room */}
        <View style={{ height: 12 }} />

        {/* Welcome Card */}
        <EnhancedCard style={styles.welcomeCard}>
          <View style={styles.welcomeHeader}>
            <View style={styles.welcomeInfo}>
              <View style={styles.greetingRow}>
                <Text style={styles.welcomeGreeting}>
                  {getGreeting()}
                </Text>
                <View style={styles.onlineBadge}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Online</Text>
                </View>
              </View>
              <Text style={styles.welcomeName}>
                {agentData?.fullName || 'Agent'} 🎉
              </Text>
              <Text style={styles.welcomeDescription}>
                {agentData?.fullName ? 
                  `Welcome back! Ready to help customers secure their future today.` :
                  'Welcome to PataBima! Ready to start your insurance journey.'
                }
              </Text>
              <View style={styles.agentInfoRowSplit}>
                <View style={styles.agentCodeBadge}>
                  <Text style={styles.agentCodeLabel}>Agent Code:</Text>
                  <Text style={styles.agentCodeValue}>{agentData?.agentCode || 'Loading...'}</Text>
                </View>
                {agentData?.nextPayout && agentData.nextPayout !== 'Not Available' ? (
                  <View style={styles.commissionBadge}>
                    <Ionicons name="wallet-outline" size={12} color="#D5222B" />
                    <Text style={styles.commissionText}>
                      Next: {formatCommissionDate(agentData.nextPayout)}
                    </Text>
                  </View>
                ) : (
                  <View style={{ width: 1 }} />
                )}
              </View>
              {agentData?.lastLogin && (
                <View style={styles.activityRow}>
                  <Ionicons name="time-outline" size={12} color="#646767" />
                  <Text style={styles.activityText}>
                    Last login: {formatLastLogin(agentData.lastLogin)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.welcomeRightSection}>
              <View style={styles.welcomeIconContainer}>
                <Text style={styles.welcomeIcon}>👋</Text>
              </View>
              <TouchableOpacity 
                style={styles.profileLink}
                onPress={() => navigation.navigate('Account')}
              >
                <Text style={styles.profileLinkText}>View Profile →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </EnhancedCard>

        {/* Insurance Categories - Horizontal Slider */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Insurance Categories</Text>
          <FlatList
            ref={categoriesRef}
            data={insuranceCategories}
            renderItem={({ item, index }) => {
              return (
                <View style={{ 
                  marginHorizontal: ITEM_SPACING / 2,
                }}>
                  <TouchableOpacity 
                    style={styles.categoryCard}
                    activeOpacity={0.7}
                    onPress={() => {
                      console.log('Category pressed:', item.name, 'Screen:', item.screen, 'Status:', item.status);
                      if (item.status === CATEGORY_STATUS.ACTIVE && item.screen) {
                        if (item.screen === 'WIBAQuote') {
                          console.log('Navigating to WIBA');
                          navigation.navigate('WIBAQuote', { lineCode: item.lineCode });
                        } else if (item.screen === 'LastExpenseQuotation') {
                          console.log('Navigating to Last Expense');
                          navigation.navigate('LastExpenseQuotation', { lineCode: 'LAST_EXPENSE' });
                        } else {
                          console.log('Generic navigation to:', item.screen);
                          navigation.navigate(item.screen);
                        }
                      } else {
                        const statusMessage = getCategoryStatusMessage(item);
                        const alertTitle = item.status === CATEGORY_STATUS.MAINTENANCE
                          ? 'Under Maintenance'
                          : item.status === CATEGORY_STATUS.COMING_SOON
                            ? 'Coming Soon'
                            : 'Unavailable';
                        Alert.alert(
                          alertTitle,
                          statusMessage,
                          [
                            { text: 'OK', style: 'default' },
                            {
                              text: 'Get Notified',
                              onPress: () => {
                                Alert.alert(
                                  'Notification Set',
                                  `You will be notified when ${item.name} insurance is available.`,
                                  [{ text: 'OK' }]
                                );
                              }
                            }
                          ]
                        );
                      }
                    }}
                  >
                    <View style={[styles.categoryIconContainer, { backgroundColor: item.color + '15' }]}>
                      <Ionicons name={item.icon} size={34} color={item.color} />
                    </View>
                    <Text style={styles.categoryName}>{item.name}</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesSlider}
            snapToInterval={ITEM_SIZE}
            snapToAlignment="start"
            decelerationRate={0.92}
            pagingEnabled={false}
            bounces={true}
            bouncesZoom={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / ITEM_SIZE);
              setCurrentCategory(Math.max(0, Math.min(index, insuranceCategories.length - 1)));
              // Restart auto-scroll after a short delay
              isInteractingRef.current = false;
              if (autoScrollRestartRef.current) {
                clearTimeout(autoScrollRestartRef.current);
              }
              autoScrollRestartRef.current = setTimeout(() => {
                isInteractingRef.current = false;
              }, 800);
            }}
            onScrollBeginDrag={() => {
              // Pause auto-scroll during user interaction
              isInteractingRef.current = true;
            }}
            onMomentumScrollBegin={() => {
              isInteractingRef.current = true;
            }}
            onScrollToIndexFailed={(error) => {
              // Handle scroll failure gracefully
              console.warn('Scroll to index failed:', error);
              if (categoriesRef.current) {
                const offset = error.index * ITEM_SIZE;
                categoriesRef.current.scrollToOffset({
                  offset,
                  animated: true,
                });
              }
            }}
            getItemLayout={(data, index) => ({
              length: ITEM_SIZE,
              offset: ITEM_SIZE * index,
              index,
            })}
            initialScrollIndex={0}
          />
        </View>

        {/* Campaigns Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Active Campaigns</Text>
          {campaignsLoading ? (
            <View style={styles.campaignsLoader}>
              {/* Skeletons for smooth loading */}
              <SkeletonLoader height={180} style={{ width: CAMPAIGN_CARD_WIDTH, borderRadius: 16, marginHorizontal: Spacing.xs }} />
            </View>
          ) : campaigns.length > 0 ? (
            <>
              <FlatList
                ref={campaignsRef}
                data={campaigns}
                renderItem={renderCampaignCard}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.campaignsSlider}
                snapToInterval={CAMPAIGN_CARD_WIDTH + CAMPAIGN_SPACING}
                decelerationRate="fast"
                onScroll={handleCampaignScroll}
                onScrollBeginDrag={handleCampaignScrollBeginDrag}
                onMomentumScrollEnd={handleCampaignMomentumScrollEnd}
                scrollEventThrottle={16}
                onViewableItemsChanged={handleCampaignViewableChange}
                viewabilityConfig={{
                  itemVisiblePercentThreshold: 50,
                  minimumViewTime: 500
                }}
              />
              {/* Campaign Indicators */}
              {campaigns.length > 1 && (
                <View style={styles.campaignIndicators}>
                  {campaigns.map((_, index) => (
                    <View
                      key={`indicator-${index}`}
                      style={[
                        styles.indicator,
                        currentCampaign === index && styles.activeIndicator
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.noCampaignsContainer}>
              <Text style={styles.noCampaignsText}>No active campaigns</Text>
            </View>
          )}
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

      {/* Floating WhatsApp Chat Button */}
      <TouchableOpacity
        style={styles.whatsappButton}
        onPress={handleWhatsAppPress}
        activeOpacity={0.8}
      >
        <Ionicons name="logo-whatsapp" size={28} color="#ffffff" />
      </TouchableOpacity>

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
  welcomeCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.backgroundCard,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeInfo: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs / 2,
  },
  welcomeGreeting: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
    lineHeight: Typography.lineHeight.lg,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  onlineText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.medium,
    color: '#2E7D32',
  },
  welcomeName: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.xl,
    marginBottom: Spacing.sm,
  },
  welcomeDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.sm,
    marginBottom: Spacing.md,
  },
  agentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  agentCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
  },
  agentCodeLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    marginRight: Spacing.xs,
  },
  agentCodeValue: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  agentInfoRowSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  commissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
  },
  commissionText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: '#E65100',
    marginLeft: 4,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
  },
  activityText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: '#646767',
    marginLeft: 4,
  },
  welcomeRightSection: {
    alignItems: 'center',
  },
  profileLink: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  profileLinkText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    lineHeight: Typography.lineHeight.xs,
    textAlign: 'center',
  },
  welcomeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeIcon: {
    fontSize: 24,
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
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  categoryCard: {
    width: 150,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    borderWidth: 0,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  activeCategoryCard: {
    // Removed - animation handles visual state
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.sm,
    paddingHorizontal: Spacing.xs,
    marginTop: Spacing.xs / 2,
  },
  activeCategoryName: {
    // Removed - animation handles visual state
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
  campaignsLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  noCampaignsContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  noCampaignsText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
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
  whatsappButton: {
    position: 'absolute',
    bottom: 25, // Positioned right above the bottom navigation
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#25D366', // WhatsApp green color
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 1000,
  },
  djangoTestButton: {
    position: 'absolute',
    bottom: 25, // Same height as WhatsApp button
    right: 90, // To the left of WhatsApp button
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3', // Blue color for test
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 1000,
  },
});
