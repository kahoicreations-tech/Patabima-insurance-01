import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants';

const CurvedHeader = ({ 
  title, 
  subtitle, 
  showLogo = true, 
  rightComponent,
  onLogoPress,
  backgroundColor = Colors.primary,
  height = 180
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.curvedHeader, 
      { 
        backgroundColor,
        paddingTop: insets.top + 20,
        height: height + insets.top
      }
    ]}>
      {/* Logo Container */}
      {showLogo && (
        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={onLogoPress}
          activeOpacity={0.8}
        >
          <Image 
            source={require('../../assets/PataLogo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      
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
  );
};

const styles = StyleSheet.create({
  curvedHeader: {
    backgroundColor: Colors.primary,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    position: 'relative',
  },
  logoContainer: {
    width: 70,
    height: 70,
    backgroundColor: Colors.background,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    width: 45,
    height: 45,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.background,
    marginBottom: Spacing.xs,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.xl,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.background + 'CC', // 80% opacity
    textAlign: 'center',
    lineHeight: Typography.lineHeight.md,
  },
  rightComponent: {
    position: 'absolute',
    top: 60, // Adjust based on safe area
    right: Spacing.lg,
  },
});

export default CurvedHeader;
