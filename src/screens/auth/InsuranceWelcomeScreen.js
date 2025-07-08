import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants';

const { width } = Dimensions.get('window');

export default function InsuranceWelcomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const insuranceProducts = [
    { id: 1, name: 'Motor Vehicle Insurance', icon: '🚗', description: 'Comprehensive vehicle protection' },
    { id: 2, name: 'Medical Insurance', icon: '🏥', description: 'Healthcare coverage for you and family' },
    { id: 3, name: 'WIBA Insurance', icon: '👷', description: 'Work injury benefits assurance' },
    { id: 4, name: 'Last Expense Insurance', icon: '⚰️', description: 'Final expense coverage' },
    { id: 5, name: 'Travel Insurance', icon: '✈️', description: 'Safe travels protection' },
    { id: 6, name: 'Personal Accident Insurance', icon: '🛡️', description: 'Personal injury protection' },
    { id: 7, name: 'Professional Indemnity Insurance', icon: '💼', description: 'Professional liability coverage' },
    { id: 8, name: 'Domestic Package Insurance', icon: '🏠', description: 'Home and property protection' }
  ];

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % insuranceProducts.length;
        flatListRef.current?.scrollToIndex({ 
          index: nextIndex, 
          animated: true 
        });
        return nextIndex;
      });
    }, 4000); // Slightly longer interval for better readability

    return () => clearInterval(interval);
  }, []);

  const renderInsuranceCard = ({ item }) => (
    <View style={styles.insuranceItem}>
      <View style={styles.iconContainer}>
        <Text style={styles.insuranceIcon}>{item.icon}</Text>
      </View>
      <Text style={styles.insuranceName}>{item.name}</Text>
      <Text style={styles.insuranceDescription}>{item.description}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Background decoration */}
      <View style={styles.backgroundDecoration} />
      
      <Animated.View 
        style={[
          styles.welcomeContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.welcomeTitle}>Welcome to PataBima</Text>
        <Text style={styles.welcomeSubtitle}>Your Trusted Insurance Partner</Text>
        <View style={styles.descriptionContainer}>
          <Text style={styles.welcomeDescription}>
            In a world shrouded with doubt, we offer stability and protection. 
            As professionals, we spend time with our customers to understand their needs 
            and facilitate customized, cost-effective insurance solutions.
          </Text>
        </View>
      </Animated.View>

      <View style={styles.sliderContainer}>
        <View style={styles.productsHeader}>
          <Text style={styles.productsTitle}>Our Insurance Products</Text>
          <View style={styles.titleUnderline} />
        </View>
        <FlatList
          ref={flatListRef}
          data={insuranceProducts}
          renderItem={renderInsuranceCard}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToInterval={width}
          decelerationRate="fast"
          contentContainerStyle={styles.sliderContent}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
        />
      </View>

      <View style={styles.indicatorContainer}>
        {insuranceProducts.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.indicator,
              { 
                backgroundColor: index === currentIndex ? Colors.primary : Colors.border,
                transform: [{ scale: index === currentIndex ? 1.2 : 1 }]
              }
            ]}
          />
        ))}
      </View>

      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={styles.getStartedButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: Colors.primaryLight,
    opacity: 0.3,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  welcomeContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    zIndex: 1,
  },
  welcomeTitle: {
    fontSize: Typography.fontSize.xxl + 4,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: Typography.lineHeight.xxl,
    textShadowColor: 'rgba(213, 34, 43, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeight.lg,
  },
  descriptionContainer: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  welcomeDescription: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.md + 2,
  },
  sliderContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  productsHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  productsTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.lg,
    marginBottom: Spacing.sm,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  sliderContent: {
    alignItems: 'center',
  },
  insuranceItem: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  insuranceIcon: {
    fontSize: 64,
    textAlign: 'center',
  },
  insuranceName: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeight.xl,
  },
  insuranceDescription: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.lg,
    paddingHorizontal: Spacing.lg,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 20,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  getStartedButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  getStartedText: {
    color: Colors.background,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    lineHeight: Typography.lineHeight.lg,
    marginRight: Spacing.sm,
  },
  buttonArrow: {
    color: Colors.background,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    transform: [{ translateX: 2 }],
  },
});
