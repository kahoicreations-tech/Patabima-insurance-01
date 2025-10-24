import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants';

const { width, height } = Dimensions.get('window');

export default function InsuranceWelcomeScreenV2() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollRef = useRef();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const insuranceCategories = [
    { 
      id: 1, 
      name: 'Motor', 
      icon: '🚗', 
      color: '#FF6B6B',
      tagline: 'Drive Safe',
      features: ['Comprehensive Cover', 'Third Party', 'Theft Protection']
    },
    { 
      id: 2, 
      name: 'Medical', 
      icon: '🏥', 
      color: '#4ECDC4',
      tagline: 'Stay Healthy',
      features: ['Inpatient Cover', 'Outpatient', 'Maternity']
    },
    { 
      id: 3, 
      name: 'WIBA', 
      icon: '👷', 
      color: '#45B7D1',
      tagline: 'Work Safe',
      features: ['Injury Cover', 'Disability', 'Death Benefits']
    },
    { 
      id: 4, 
      name: 'Travel', 
      icon: '✈️', 
      color: '#667eea',
      tagline: 'Journey Safe',
      features: ['Trip Cover', 'Medical Emergency', 'Baggage']
    },
    { 
      id: 5, 
      name: 'Personal', 
      icon: '🛡️', 
      color: '#f093fb',
      tagline: 'Stay Protected',
      features: ['Accident Cover', 'Disability', 'Death Benefits']
    },
    { 
      id: 6, 
      name: 'Home', 
      icon: '🏠', 
      color: '#43e97b',
      tagline: 'Secure Home',
      features: ['Property Cover', 'Contents', 'Liability']
    }
  ];

  useEffect(() => {
    // Initial animation
    Animated.stagger(200, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation for the selected card icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderCategoryCard = (category, index) => {
    const isSelected = selectedIndex === index;
    const cardScale = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      setSelectedIndex(index);
      
      // Bounce animation
      Animated.sequence([
        Animated.timing(cardScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        })
      ]).start();
    };

    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryCard,
          { backgroundColor: isSelected ? category.color : 'transparent' }
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.cardContent,
            {
              transform: [
                { scale: cardScale },
                { rotate: isSelected ? rotateInterpolate : '0deg' }
              ]
            }
          ]}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
          </View>
          <Text style={[
            styles.categoryName,
            { color: isSelected ? '#fff' : Colors.textPrimary }
          ]}>
            {category.name}
          </Text>
          <Text style={[
            styles.categoryTagline,
            { color: isSelected ? 'rgba(255,255,255,0.9)' : Colors.textSecondary }
          ]}>
            {category.tagline}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const selectedCategory = insuranceCategories[selectedIndex];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      
      {/* Floating Shapes Background */}
      <View style={styles.backgroundShapes}>
        <Animated.View style={[
          styles.shape1,
          { transform: [{ rotate: rotateInterpolate }] }
        ]} />
        <Animated.View style={[
          styles.shape2,
          { transform: [{ rotate: rotateInterpolate }] }
        ]} />
        <Animated.View style={[
          styles.shape3,
          { transform: [{ rotate: rotateInterpolate }] }
        ]} />
      </View>

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.headerTitle}>Choose Your</Text>
        <Text style={styles.headerSubtitle}>Protection Plan</Text>
        <View style={styles.headerLine} />
      </Animated.View>

      {/* Category Grid */}
      <Animated.View
        style={[
          styles.gridSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.categoryGrid}>
            {insuranceCategories.map((category, index) => 
              renderCategoryCard(category, index)
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Selected Category Details */}
      <Animated.View
        style={[
          styles.detailsSection,
          {
            backgroundColor: selectedCategory.color,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.detailsContent}>
          <Text style={styles.selectedTitle}>{selectedCategory.name} Insurance</Text>
          <Text style={styles.selectedTagline}>{selectedCategory.tagline}</Text>
          
          <View style={styles.featuresContainer}>
            {selectedCategory.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureBullet}>✓</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View
        style={[
          styles.actionSection,
          {
            paddingBottom: insets.bottom + 20,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: selectedCategory.color }]}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryButtonText}>Get Quote Now</Text>
          <View style={styles.buttonIcon}>
            <Text style={styles.buttonArrow}>→</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Explore All Plans</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  backgroundShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shape1: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  shape2: {
    position: 'absolute',
    top: 300,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
  },
  shape3: {
    position: 'absolute',
    bottom: 200,
    right: 50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxxl,
    fontFamily: Typography.fontFamily.bold,
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  headerLine: {
    width: 80,
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  gridSection: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - (Spacing.lg * 2) - Spacing.md) / 3,
    height: 120,
    marginBottom: Spacing.lg,
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: Typography.fontSize.xs + 1,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
    marginBottom: 2,
  },
  categoryTagline: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
  detailsSection: {
    margin: Spacing.lg,
    borderRadius: 24,
    padding: Spacing.xl,
    minHeight: 160,
  },
  detailsContent: {
    alignItems: 'center',
  },
  selectedTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  selectedTagline: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  featuresContainer: {
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureBullet: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: '#ffffff',
    marginRight: Spacing.sm,
  },
  featureText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  actionSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: 28,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    marginRight: Spacing.sm,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonArrow: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    letterSpacing: 0.3,
  },
});
