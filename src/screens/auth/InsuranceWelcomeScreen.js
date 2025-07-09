import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, FlatList, ImageBackground, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants';

const { width, height } = Dimensions.get('window');

export default function InsuranceWelcomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const insuranceProducts = [
    { 
      id: 1, 
      name: 'Motor Insurance', 
      icon: '🚗', 
      gradient: ['#FF6B6B', '#FF8E53'],
      description: 'Vehicle protection',
      imageUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      bgOverlay: 'rgba(255, 107, 107, 0.65)'
    },
    { 
      id: 2, 
      name: 'Medical Cover', 
      icon: '🏥', 
      gradient: ['#4ECDC4', '#44A08D'],
      description: 'Health insurance',
      imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      bgOverlay: 'rgba(78, 205, 196, 0.65)'
    },
    { 
      id: 3, 
      name: 'Work Safety', 
      icon: '👷', 
      gradient: ['#45B7D1', '#96C93D'],
      description: 'Workplace protection',
      imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      bgOverlay: 'rgba(69, 183, 209, 0.65)'
    },
    { 
      id: 4, 
      name: 'Travel Cover', 
      icon: '✈️', 
      gradient: ['#667eea', '#764ba2'],
      description: 'Journey protection',
      imageUrl: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      bgOverlay: 'rgba(102, 126, 234, 0.65)'
    },
    { 
      id: 5, 
      name: 'Personal Safety', 
      icon: '🛡️', 
      gradient: ['#f093fb', '#f5576c'],
      description: 'Accident cover',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      bgOverlay: 'rgba(240, 147, 251, 0.65)'
    },
    { 
      id: 6, 
      name: 'Home Protection', 
      icon: '🏠', 
      gradient: ['#43e97b', '#38f9d7'],
      description: 'Property cover',
      imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      bgOverlay: 'rgba(67, 233, 123, 0.65)'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Create animation refs for each slide
  const slideAnimations = useRef(
    insuranceProducts.map(() => ({
      scale: new Animated.Value(0.8),
      rotate: new Animated.Value(0),
    }))
  ).current;

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

    // Auto-scroll through insurance products
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % insuranceProducts.length;
        flatListRef.current?.scrollToIndex({ 
          index: nextIndex, 
          animated: true 
        });
        return nextIndex;
      });
    }, 3000); // Change slide every 3 seconds for more dynamic feel

    return () => clearInterval(interval);
  }, []);

  // Handle slide animations when currentIndex changes
  useEffect(() => {
    slideAnimations.forEach((anim, index) => {
      if (index === currentIndex) {
        // Animate active slide
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Reset inactive slides
        anim.scale.setValue(0.8);
        anim.rotate.setValue(0);
      }
    });
  }, [currentIndex]);

  const renderInsuranceSlide = ({ item, index }) => {
    const isActive = index === currentIndex;
    const scaleAnim = slideAnimations[index].scale;
    const rotateAnim = slideAnimations[index].rotate;

    const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    
    return (
      <View style={styles.slideContainer}>
        {/* Background Image with Overlay */}
        <Animated.View 
          style={[
            styles.imageBackground,
            { 
              opacity: isActive ? 1 : 0.4,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <ImageBackground
            source={{ uri: item.imageUrl }}
            style={styles.backgroundImage}
            imageStyle={styles.backgroundImageStyle}
          >
            <View 
              style={[
                styles.overlay,
                { backgroundColor: item.bgOverlay }
              ]}
            />
          </ImageBackground>
        </Animated.View>

        {/* Floating Content */}
        <Animated.View 
          style={[
            styles.contentFloat,
            { 
              transform: [{ scale: scaleAnim }, { translateY: isActive ? -10 : 0 }]
            }
          ]}
        >
          {/* Modern Icon Section */}
          <View style={styles.iconSection}>
            <Animated.View 
              style={[
                styles.modernIconWrapper,
                { 
                  transform: [
                    { scale: isActive ? 1.1 : 0.9 },
                    { rotate: rotation }
                  ]
                }
              ]}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.largeIcon}>{item.icon}</Text>
              </View>
              
              {/* Animated Ring */}
              <Animated.View 
                style={[
                  styles.animatedRing,
                  {
                    opacity: isActive ? 1 : 0,
                    transform: [{ scale: isActive ? 1.3 : 1 }, { rotate: rotation }]
                  }
                ]}
              />
            </Animated.View>
            
            {/* Premium Floating Elements */}
            <View style={styles.floatingElements}>
              {[...Array(6)].map((_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.floatingElement,
                    {
                      backgroundColor: '#FFFFFF',
                      opacity: isActive ? 0.9 : 0,
                      transform: [
                        { 
                          translateY: isActive ? -25 - (i * 12) : 0,
                        },
                        { 
                          translateX: Math.cos(i * 60 * Math.PI / 180) * (30 + i * 8),
                        },
                        {
                          rotate: `${i * 60}deg`
                        }
                      ]
                    }
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Enhanced Content Section */}
          <View style={styles.contentSection}>
            <Animated.Text 
              style={[
                styles.slideTitle,
                { 
                  transform: [{ scale: isActive ? 1.05 : 0.95 }],
                  opacity: isActive ? 1 : 0.7
                }
              ]}
            >
              {item.name}
            </Animated.Text>
            <Animated.Text 
              style={[
                styles.slideDescription,
                {
                  opacity: isActive ? 1 : 0.5,
                  transform: [{ translateY: isActive ? 0 : 10 }]
                }
              ]}
            >
              {item.description}
            </Animated.Text>
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderProgressIndicator = () => {
    return (
      <View style={styles.progressContainer}>
        {insuranceProducts.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              { 
                backgroundColor: index === currentIndex ? Colors.primary : 'rgba(44, 62, 80, 0.2)',
                width: index === currentIndex ? 24 : 8,
              }
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <StatusBar style="dark" />
      
      {/* Header Section */}
      <Animated.View 
        style={[
          styles.headerSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerContent}>
          <Image source={require('../../../assets/PataLogo.png')} style={{ width: 150, height: 100 }} />
          
        </View>
      </Animated.View>

      {/* Auto-Sliding Showcase */}
      <Animated.View
        style={[
          styles.showcaseContainer,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <FlatList
          ref={flatListRef}
          data={insuranceProducts}
          renderItem={renderInsuranceSlide}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false} // Disable manual scrolling for auto-only experience
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(newIndex);
          }}
        />
        
        {/* Progress Indicator */}
        {renderProgressIndicator()}
      </Animated.View>

      {/* Enhanced Action Button */}
      <Animated.View 
        style={[
          styles.actionContainer,
          { 
            paddingBottom: insets.bottom + 30,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.premiumButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.9}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <View style={styles.arrowContainer}>
              <Text style={styles.buttonArrow}>→</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerSection: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: Typography.fontSize.xxxl + 8,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    letterSpacing: 1,
    textShadowColor: 'rgba(213, 34, 43, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
    color: '#7F8C8D',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  showcaseContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  slideContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    position: 'relative',
  },
  imageBackground: {
    position: 'absolute',
    width: width - (Spacing.xl * 2),
    height: height * 0.58,
    borderRadius: 30,
    overflow: 'hidden',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  backgroundImageStyle: {
    borderRadius: 30,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30,
  },
  contentFloat: {
    width: width - (Spacing.xl * 2),
    height: height * 0.58,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl * 1.5,
    zIndex: 2,
  },
  iconSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  modernIconWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  animatedRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderStyle: 'dashed',
  },
  largeIcon: {
    fontSize: 50,
    textAlign: 'center',
  },
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingElement: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  contentSection: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  slideTitle: {
    fontSize: Typography.fontSize.xxl + 4,
    fontFamily: Typography.fontFamily.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  slideDescription: {
    fontSize: Typography.fontSize.lg + 1,
    fontFamily: Typography.fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: Spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  actionContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  premiumButton: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    width: '100%',
    height: 56,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  getStartedText: {
    color: Colors.background,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonArrow: {
    color: Colors.background,
    fontSize: 18,
    fontFamily: Typography.fontFamily.bold,
  },
});
