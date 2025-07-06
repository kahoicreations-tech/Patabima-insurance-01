import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../constants';

export default function MyAccountScreen() {
  const insets = useSafeAreaInsets();
  
  const agentData = {
    name: 'Kelvin Kahoi',
    agentCode: 'IA16332',
    build: '55',
    upcomingCommission: 0,
    nextPayout: '16th July, 2025',
    todayStats: {
      sales: 0,
      production: 0,
      commission: 0
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
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Text style={styles.agentName}>{agentData.name}</Text>
          
          <View style={styles.agentCodeContainer}>
            <Text style={styles.agentCodeLabel}>Sales Agent Code:</Text>
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

        {/* Earnings Section */}
        <View style={styles.earningsSection}>
          <Text style={styles.sectionTitle}>My Earnings</Text>
          
          <View style={styles.commissionCard}>
            <Text style={styles.commissionLabel}>Upcoming Commission</Text>
            <Text style={styles.commissionAmount}>KES {agentData.upcomingCommission}</Text>
            <Text style={styles.payoutText}>
              Your payout is scheduled for {agentData.nextPayout}
            </Text>
            
            <TouchableOpacity style={styles.viewEarningsButton}>
              <Text style={styles.viewEarningsText}>View Earnings</Text>
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

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Sales</Text>
              <Text style={styles.statValue}>{agentData.todayStats.sales} Policies</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Production</Text>
              <Text style={styles.statValue}>KES {agentData.todayStats.production}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Commission</Text>
              <Text style={styles.statValue}>KES {agentData.todayStats.commission}</Text>
            </View>
          </View>
        </View>

        {/* Commission History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Commission History</Text>
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyHistoryText}>No commission history available</Text>
          </View>
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
  logoutButton: {
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 8,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  logoutText: {
    color: Colors.error,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: Typography.lineHeight.md,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
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
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeight.xl,
  },
  commissionCard: {
    backgroundColor: Colors.backgroundGray,
    padding: Spacing.lg,
    borderRadius: 8,
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
    borderRadius: 8,
    alignItems: 'center',
  },
  viewEarningsText: {
    color: Colors.background,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: Typography.lineHeight.md,
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyHistoryText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.md,
  },
});
