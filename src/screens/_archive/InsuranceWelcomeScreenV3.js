import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, PanGestureHandler, State } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 60;
const CARD_HEIGHT = height * 0.55;

export default function InsuranceWelcomeScreenV3() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const insuranceCards = [
    {
      id: 1,
      title: 'Motor Vehicle',
      subtitle: 'Drive with Confidence',
      icon: '🚗',
      gradient: ['#667eea', '#764ba2'],
      benefits: ['Comprehensive Coverage', 'Third Party Protection', 'Theft & Fire Cover'],
      price: 'From KES 15,000/year'
    },
    {
      id: 2,
      title: 'Medical Insurance',
      subtitle: 'Health is Wealth',
      icon: '🏥',
      gradient: ['#f093fb', '#f5576c'],
      benefits: ['Inpatient Treatment', 'Outpatient Services', 'Maternity Cover'],
      price: 'From KES 25,000/year'
    },
    {
      id: 3,
      title: 'Travel Insurance',
      subtitle: 'Journey Safely',
      icon: '✈️',
      gradient: ['#4facfe', '#00f2fe'],
      benefits: ['Trip Cancellation', 'Medical Emergency', 'Baggage Protection'],
      price: 'From KES 5,000/trip'
    },
    {
      id: 4,
      title: 'Home Insurance',
      subtitle: 'Protect Your Castle',
      icon: '🏠',
      gradient: ['#43e97b', '#38f9d7'],
      benefits: ['Property Damage', 'Content Cover', 'Liability Protection'],
      price: 'From KES 20,000/year'
    },
    {
      id: 5,
      title: 'WIBA Insurance',
      subtitle: 'Workplace Safety',
      icon: '👷',
      gradient: ['#fa709a', '#fee140'],
      benefits: ['Work Injury Cover', 'Disability Benefits', 'Death Benefits'],
      price: 'From KES 10,000/year'
    }
  ];

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const nextCard = () => {
    if (currentIndex < insuranceCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const renderCard = (card, index) => {
    const isActive = index === currentIndex;
    const isNext = index === currentIndex + 1;
    const isPrev = index === currentIndex - 1;
    
    if (index < currentIndex - 1 || index > currentIndex + 1) return null;

    let translateX = 0;
    let scale = 0.8;
    let opacity = 0.3;
    let zIndex = 0;

    if (isActive) {
      translateX = 0;
      scale = 1;
      opacity = 1;
      zIndex = 3;
    } else if (isNext) {
      translateX = CARD_WIDTH * 0.8;
      scale = 0.9;
      opacity = 0.7;
      zIndex = 2;
    } else if (isPrev) {
      translateX = -CARD_WIDTH * 0.8;
      scale = 0.9;
      opacity = 0.7;
      zIndex = 2;
    }

    return (
      <Animated.View
        key={card.id}
        style={[
          styles.card,
          {
            transform: [
              { translateX },
              { scale },
            ],
            opacity,
            zIndex,
          }
        ]}
      >
        <View style={[styles.cardGradient, { backgroundColor: card.gradient[0] }]}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.cardIcon}>{card.icon}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </View>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>What's Covered:</Text>
            {card.benefits.map((benefit, idx) => (
              <View key={idx} style={styles.benefitItem}>
                <View style={styles.benefitDot} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{card.price}</Text>
          </View>

          {/* Card Actions */}
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.learnMoreButton}>
              <Text style={styles.learnMoreText}>Learn More</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.getQuoteButton}>
              <Text style={styles.getQuoteText}>Get Quote</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      
      {/* Background */}
      <View style={styles.background} />
      
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
        <Text style={styles.mainTitle}>PataBima</Text>
        <Text style={styles.subtitle}>Insurance Made Simple</Text>
      </Animated.View>

      {/* Card Stack */}
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {insuranceCards.map((card, index) => renderCard(card, index))}
      </Animated.View>

      {/* Navigation */}
      <Animated.View
        style={[
          styles.navigation,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.navButton, { opacity: currentIndex === 0 ? 0.3 : 1 }]}
          onPress={prevCard}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.indicators}>
          {insuranceCards.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === currentIndex ? Colors.primary : 'rgba(255,255,255,0.3)',
                  width: index === currentIndex ? 24 : 8,
                }
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.navButton, { opacity: currentIndex === insuranceCards.length - 1 ? 0.3 : 1 }]}
          onPress={nextCard}
          disabled={currentIndex === insuranceCards.length - 1}
        >
          <Text style={styles.navButtonText}>→</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Action Button */}
      <Animated.View
        style={[
          styles.actionContainer,
          {
            paddingBottom: insets.bottom + 20,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.continueButtonText}>Get Started</Text>
          <View style={styles.buttonArrowContainer}>
            <Text style={styles.buttonArrow}>→</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0a0a',
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  mainTitle: {
    fontSize: Typography.fontSize.xxxl + 4,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    letterSpacing: 2,
    textShadowColor: 'rgba(213, 34, 43, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
    marginTop: Spacing.sm,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 24,
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  cardIcon: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.fontSize.xl + 2,
    fontFamily: Typography.fontFamily.bold,
    color: '#ffffff',
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  benefitsContainer: {
    flex: 1,
    marginVertical: Spacing.lg,
  },
  benefitsTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: '#ffffff',
    marginBottom: Spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  benefitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    marginRight: Spacing.md,
  },
  benefitText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  priceContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  priceText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  learnMoreButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    marginRight: Spacing.sm,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
    color: '#ffffff',
  },
  getQuoteButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    marginLeft: Spacing.sm,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  getQuoteText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: '#ffffff',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 20,
    fontFamily: Typography.fontFamily.bold,
    color: '#ffffff',
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionContainer: {
    paddingHorizontal: Spacing.xl,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: 28,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  continueButtonText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: '#ffffff',
    marginRight: Spacing.sm,
    letterSpacing: 0.5,
  },
  buttonArrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonArrow: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    color: '#ffffff',
  },
});
