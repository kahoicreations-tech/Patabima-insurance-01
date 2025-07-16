import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants';

const CompactCurvedHeader = ({ 
  title, 
  subtitle, 
  rightComponent,
  backgroundColor = Colors.primary,
  height = 90
}) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* Status bar area background */}
      <View style={[
        styles.statusBarBg,
        { 
          backgroundColor,
          height: insets.top 
        }
      ]} />
      
      {/* Main curved header */}
      <View style={[
        styles.curvedHeader, 
        { 
          backgroundColor,
          height: height
        }
      ]}>
        {/* Header Content */}
        <View style={styles.headerContent}>
          {title && (
            <Text style={styles.headerTitle}>{title}</Text>
          )}
          {subtitle && (
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          )}
        </View>

        {/* Right Component (e.g., logout button) */}
        {rightComponent && (
          <View style={styles.rightComponent}>
            {rightComponent}
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  statusBarBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  curvedHeader: {
    backgroundColor: Colors.primary,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.background,
    marginBottom: Spacing.xs / 3,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.md,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.background + 'CC', // 80% opacity
    textAlign: 'center',
    lineHeight: Typography.lineHeight.xs,
  },
  rightComponent: {
    position: 'absolute',
    right: Spacing.md,
    top: Spacing.md,
  },
});

export default CompactCurvedHeader;
