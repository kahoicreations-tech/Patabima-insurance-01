import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { QuoteStorageService } from '../services/QuoteStorageService';
import { PricingService } from '../services';

export default function MyAccountScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalQuotes: 0,
    paidQuotes: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    conversionRate: 0
  });
  
  const agentData = {
    name: user?.name || 'John Doe',
    agentCode: user?.agentCode || 'Hd1232',
    build: '55',
    upcomingCommission: 0,
    nextPayout: '16th July, 2025',
    joinDate: '2024-01-15',
    todayStats: {
      sales: 0,
      production: 0,
      commission: 0
    }
  };

  // Load agent statistics
  useEffect(() => {
    loadAgentStats();
  }, []);

  const loadAgentStats = async () => {
    try {
      const quotes = await QuoteStorageService.getAllQuotes();
      const paidQuotes = quotes.filter(q => q.status === 'paid' || q.status === 'active');
      
      const totalEarnings = paidQuotes.reduce((sum, quote) => {
        const premium = quote.calculatedPremium?.totalPremium || 0;
        const commission = premium * 0.15; // Assuming 15% commission
        return sum + commission;
      }, 0);

      const currentMonth = new Date().getMonth();
      const monthlyQuotes = paidQuotes.filter(q => 
        new Date(q.createdAt).getMonth() === currentMonth
      );
      
      const monthlyEarnings = monthlyQuotes.reduce((sum, quote) => {
        const premium = quote.calculatedPremium?.totalPremium || 0;
        const commission = premium * 0.15;
        return sum + commission;
      }, 0);

      const conversionRate = quotes.length > 0 ? (paidQuotes.length / quotes.length) * 100 : 0;

      setStats({
        totalQuotes: quotes.length,
        paidQuotes: paidQuotes.length,
        totalEarnings,
        monthlyEarnings,
        conversionRate
      });
    } catch (error) {
      console.error('Error loading agent stats:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      const message = `🏆 PataBima Agent Performance\n\n👨‍💼 Agent: ${agentData.name}\n🆔 Code: ${agentData.agentCode}\n\n📊 Statistics:\n• Total Quotes: ${stats.totalQuotes}\n• Conversion Rate: ${stats.conversionRate.toFixed(1)}%\n• Total Earnings: ${PricingService.formatCurrency(stats.totalEarnings)}\n\n💪 Growing with PataBima Insurance!`;
      
      await Share.share({
        message: message,
        title: 'PataBima Agent Performance'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = await QuoteStorageService.exportQuotes();
      Alert.alert(
        'Export Data',
        `Successfully exported ${exportData.quotes.length} quotes and ${Object.keys(exportData.drafts).length} drafts.`,
        [
          { text: 'OK' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const ActivityTab = ({ title, isActive, onPress }) => (
    <TouchableOpacity 
      style={[styles.activityTab, isActive && styles.activeActivityTab]}
      onPress={onPress}
    >
      <Text style={[styles.activityTabText, isActive && styles.activeActivityTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderOverviewTab = () => (
    <View>
      {/* Performance Cards */}
      <View style={styles.performanceSection}>
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        
        <View style={styles.performanceGrid}>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceValue}>{stats.totalQuotes}</Text>
            <Text style={styles.performanceLabel}>Total Quotes</Text>
          </View>
          
          <View style={styles.performanceCard}>
            <Text style={styles.performanceValue}>{stats.paidQuotes}</Text>
            <Text style={styles.performanceLabel}>Paid Policies</Text>
          </View>
          
          <View style={styles.performanceCard}>
            <Text style={[styles.performanceValue, { color: Colors.success }]}>
              {stats.conversionRate.toFixed(1)}%
            </Text>
            <Text style={styles.performanceLabel}>Conversion Rate</Text>
          </View>
          
          <View style={styles.performanceCard}>
            <Text style={[styles.performanceValue, { color: Colors.primary }]}>
              {PricingService.formatCurrency(stats.totalEarnings).replace('KES ', '')}
            </Text>
            <Text style={styles.performanceLabel}>Total Earnings</Text>
          </View>
        </View>
      </View>

      {/* Monthly Performance */}
      <View style={styles.monthlySection}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.monthlyCard}>
          <View style={styles.monthlyItem}>
            <Text style={styles.monthlyLabel}>Earnings</Text>
            <Text style={styles.monthlyValue}>
              {PricingService.formatCurrency(stats.monthlyEarnings)}
            </Text>
          </View>
          <View style={styles.monthlyItem}>
            <Text style={styles.monthlyLabel}>Next Payout</Text>
            <Text style={styles.monthlyValue}>{agentData.nextPayout}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionItem} onPress={handleShare}>
          <Text style={styles.actionIcon}>📤</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Share Performance</Text>
            <Text style={styles.actionSubtitle}>Share your agent statistics</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem} onPress={handleExportData}>
          <Text style={styles.actionIcon}>💾</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Export Data</Text>
            <Text style={styles.actionSubtitle}>Backup quotes and drafts</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem} onPress={() => setActiveTab('settings')}>
          <Text style={styles.actionIcon}>⚙️</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Account Settings</Text>
            <Text style={styles.actionSubtitle}>Manage your profile</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSettingsTab = () => (
    <View>
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Full Name</Text>
          <Text style={styles.settingValue}>{agentData.name}</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Agent Code</Text>
          <Text style={styles.settingValue}>{agentData.agentCode}</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Build Version</Text>
          <Text style={styles.settingValue}>{agentData.build}</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Join Date</Text>
          <Text style={styles.settingValue}>{new Date(agentData.joinDate).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <TouchableOpacity style={styles.settingActionItem}>
          <Text style={styles.settingActionText}>🔔 Notification Settings</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingActionItem}>
          <Text style={styles.settingActionText}>🔒 Privacy & Security</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingActionItem}>
          <Text style={styles.settingActionText}>❓ Help & Support</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingActionItem}>
          <Text style={styles.settingActionText}>📋 Terms & Conditions</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        
        {/* Header with Logout */}
        <View style={styles.header}>
          <Text style={styles.title}>My Account</Text>
          <TouchableOpacity 
            style={styles.headerLogoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.headerLogoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.profileIconContainer}>
              <Text style={styles.profileIcon}>👤</Text>
            </View>
            <Text style={styles.agentName}>{agentData.name}</Text>
            
            <View style={styles.agentCodeContainer}>
              <Text style={styles.agentCodeLabel}>Sales Agent Code</Text>
              <View style={styles.agentCodeBadge}>
                <Text style={styles.agentCode}>{agentData.agentCode}</Text>
                <TouchableOpacity style={styles.copyButton}>
                  <Text style={styles.copyIcon}>📋</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buildContainer}>
              <Text style={styles.buildText}>Build ({agentData.build})</Text>
              <TouchableOpacity style={styles.updateButton}>
                <Text style={styles.updateText}>Update</Text>
                <Text style={styles.refreshIcon}>🔄</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Earnings Section */}
        <View style={styles.earningsSection}>
          <Text style={styles.sectionTitle}>My Earnings</Text>
          
          <View style={styles.commissionCard}>
            <View style={styles.commissionHeader}>
              <Text style={styles.commissionLabel}>Upcoming Commission</Text>
              <View style={styles.commissionIconContainer}>
                <Text style={styles.commissionIcon}>💰</Text>
              </View>
            </View>
            <Text style={styles.commissionAmount}>KES {agentData.upcomingCommission.toLocaleString()}</Text>
            <Text style={styles.payoutText}>
              Your payout is scheduled for {agentData.nextPayout}
            </Text>
            
            <TouchableOpacity style={styles.viewEarningsButton}>
              <Text style={styles.viewEarningsText}>View Earnings</Text>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activity Section */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>My Activity</Text>
          
          <View style={styles.activityTabs}>
            <ActivityTab title="Today" isActive={true} />
            <ActivityTab title="Last Commission" isActive={false} />
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📊</Text>
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Sales</Text>
                <Text style={styles.statValue}>{agentData.todayStats.sales} Policies</Text>
              </View>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statRow}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>💼</Text>
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Production</Text>
                <Text style={styles.statValue}>KES {agentData.todayStats.production.toLocaleString()}</Text>
              </View>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statRow}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>💵</Text>
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Commission</Text>
                <Text style={styles.statValue}>KES {agentData.todayStats.commission.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Commission History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Commission History</Text>
          <View style={styles.historyCard}>
            <View style={styles.emptyHistory}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>📈</Text>
              </View>
              <Text style={styles.emptyHistoryText}>No commission history available</Text>
              <Text style={styles.emptyHistorySubtext}>Your commission history will appear here once you start earning</Text>
            </View>
          </View>
        </View>

        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'settings' && renderSettingsTab()}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.xxl,
  },
  headerLogoutButton: {
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 8,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  headerLogoutText: {
    color: Colors.error,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: Typography.lineHeight.md,
  },
  profileSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  profileCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  profileIcon: {
    fontSize: 36,
  },
  agentName: {
    fontSize: Typography.fontSize.xxxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeight.xxxl,
  },
  agentCodeContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  agentCodeLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: Typography.lineHeight.md,
  },
  agentCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
  },
  agentCode: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginRight: Spacing.sm,
    lineHeight: Typography.lineHeight.lg,
  },
  copyButton: {
    padding: Spacing.xs,
  },
  copyIcon: {
    fontSize: Typography.fontSize.md,
  },
  buildContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buildText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginRight: Spacing.md,
    lineHeight: Typography.lineHeight.md,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    marginRight: Spacing.xs,
    lineHeight: Typography.lineHeight.md,
  },
  refreshIcon: {
    fontSize: Typography.fontSize.sm,
  },
  earningsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  commissionCard: {
    backgroundColor: Colors.background,
    padding: Spacing.xl,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  commissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  commissionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commissionIcon: {
    fontSize: 20,
  },
  commissionLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: Typography.lineHeight.md,
  },
  commissionAmount: {
    fontSize: Typography.fontSize.xxxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: Typography.lineHeight.xxxl,
  },
  payoutText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeight.sm,
  },
  viewEarningsButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  viewEarningsText: {
    color: Colors.background,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: Typography.lineHeight.md,
    marginRight: Spacing.sm,
  },
  arrowIcon: {
    color: Colors.background,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  activitySection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  activityTabs: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  activityTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
    marginRight: Spacing.sm,
    backgroundColor: Colors.backgroundGray,
  },
  activeActivityTab: {
    backgroundColor: Colors.primary,
  },
  activityTabText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.md,
  },
  activeActivityTabText: {
    color: Colors.background,
  },
  statsCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  statIcon: {
    fontSize: 20,
  },
  statInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statDivider: {
    height: 1,
    backgroundColor: Colors.backgroundGray,
    marginHorizontal: Spacing.md,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.sm,
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.lg,
  },
  historySection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  historyCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyHistoryText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.md,
    marginBottom: Spacing.xs,
  },
  emptyHistorySubtext: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.sm,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.xs,
  },
  performanceSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  performanceCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceValue: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  performanceLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  monthlySection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  monthlyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthlyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  monthlyLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  monthlyValue: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  actionsSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs / 2,
  },
  actionSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  actionArrow: {
    fontSize: 20,
    color: Colors.textLight,
  },
  settingsSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  settingValue: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  settingActionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingActionText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  logoutButton: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.error + '15',
    borderRadius: 12,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoutText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.error,
  },
});
