import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Animated, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../../constants';

export default function InsuranceWelcomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');
  const CARD_WIDTH = 320;
  const CARD_MARGIN = Spacing.md;

  // Insurance slides using only images
  const insuranceSlides = [
    { 
      title: 'Motor Vehicle Insurance',
      image: require('../../../assets/images/motor.png'),
    },
    { 
      title: 'WIBA Insurance',
      image: require('../../../assets/images/wiba.png'),
    },
    { 
      title: 'Last Expense Insurance', 
      image: require('../../../assets/images/funeral.png'),
    },
    { 
      title: 'Health Insurance',
      image: require('../../../assets/images/health.png'),
    },
    {
      title: 'Travel Insurance',
      image: require('../../../assets/images/travel-insurance.jpg'),
  
    },
    {
      title: 'Personal Accident',
      image: require('../../../assets/images/personal-safety.jpg'),
     
      
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Animated value for button pulsation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  // Header animation
  const headerAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true
    }).start();
  }, []);
  
  // Auto-scrolling effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollViewRef.current) {
        const nextSlide = (currentSlide + 1) % insuranceSlides.length;
        scrollViewRef.current.scrollTo({ 
          x: nextSlide * CARD_WIDTH + (nextSlide * CARD_MARGIN), 
          animated: true 
        });
      }
    }, 3000);
    
    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Curved red header */}
      <Animated.View 
        style={[
          styles.curvedHeader,
          {
            opacity: headerAnimation,
            transform: [
              { 
                translateY: headerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0]
                })
              }
            ]
          }
        ]}
      >
        {/* Circular logo container */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              transform: [
                { 
                  scale: headerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1]
                  })
                },
                {
                  rotate: headerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }
              ]
            }
          ]}
        >
          <Image 
            source={require('../../../assets/PataLogo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        
        <Animated.Text 
          style={[
            styles.agencyText,
            {
              opacity: headerAnimation,
              transform: [{
                translateX: headerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 0]
                })
              }]
            }
          ]}
        >
          PATA BIMA AGENCY
        </Animated.Text>
        
        <Animated.Text 
          style={[
            styles.taglineText,
            {
              opacity: headerAnimation,
              transform: [{
                translateX: headerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0]
                })
              }]
            }
          ]}
        >
          Insurance for Protection
        </Animated.Text>
      </Animated.View>

      {/* Insurance Slides */}
      <View style={styles.sliderContainer}>
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true, listener: (event) => {
              const slideWidth = CARD_WIDTH + CARD_MARGIN;
              const offset = event.nativeEvent.contentOffset.x;
              const slide = Math.min(
                Math.max(0, Math.round(offset / slideWidth)),
                insuranceSlides.length - 1
              );
              setCurrentSlide(slide);
            }}
          )}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + CARD_MARGIN}
          contentContainerStyle={{ alignItems: 'center', paddingHorizontal: Spacing.lg }}
        >
          {insuranceSlides.map((slide, idx) => {
            // Calculate input range for animations
            const inputRange = [
              (idx - 1) * (CARD_WIDTH + CARD_MARGIN),
              idx * (CARD_WIDTH + CARD_MARGIN),
              (idx + 1) * (CARD_WIDTH + CARD_MARGIN)
            ];
            
            // Calculate animation values for scaling and opacity
            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.85, 1, 0.85],
              extrapolate: 'clamp'
            });
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.6, 1, 0.6],
              extrapolate: 'clamp'
            });
            
            // Add rotation for a more dynamic effect
            const rotate = scrollX.interpolate({
              inputRange,
              outputRange: ['-2deg', '0deg', '2deg'],
              extrapolate: 'clamp'
            });
            
            // Remove elevation animation since we don't want shadows
            
            return (
              <Animated.View 
                key={idx} 
                style={[
                  styles.slideCard,
                  { 
                    transform: [
                      { scale },
                      { rotate },
                      { translateY: scrollX.interpolate({
                          inputRange,
                          outputRange: [5, -10, 5],
                          extrapolate: 'clamp'
                        })
                      }
                    ],
                    opacity
                  }
                ]}
              >
                <Animated.View style={{
                  width: 220,
                  height: 220,
                  marginBottom: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform: [{
                    translateX: scrollX.interpolate({
                      inputRange,
                      outputRange: [width * 0.05, 0, -width * 0.05],
                      extrapolate: 'clamp'
                    })
                  }]
                }}>
                  <Image 
                    source={slide.image}
                    style={{
                      width: 220, 
                      height: 220,
                      tintColor: slide.tintColor || undefined,
                      opacity: slide.tintColor ? 0.9 : 1,
                    }}
                    resizeMode="contain"
                  />
                </Animated.View>
                <Animated.Text 
                  style={[
                    styles.slideTitle,
                    {
                      opacity: scrollX.interpolate({
                        inputRange,
                        outputRange: [0.5, 1, 0.5],
                        extrapolate: 'clamp'
                      }),
                      transform: [{
                        translateY: scrollX.interpolate({
                          inputRange,
                          outputRange: [10, 0, 10],
                          extrapolate: 'clamp'
                        })
                      }]
                    }
                  ]}
                >
                  {slide.title}
                </Animated.Text>
              </Animated.View>
            );
          })}
        </Animated.ScrollView>
        {/* Slide Indicators */}
        <View style={styles.slideIndicators}>
          {insuranceSlides.map((_, idx) => {
            const inputRange = [
              (idx - 1) * (CARD_WIDTH + CARD_MARGIN),
              idx * (CARD_WIDTH + CARD_MARGIN),
              (idx + 1) * (CARD_WIDTH + CARD_MARGIN)
            ];
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.5, 1, 0.5],
              extrapolate: 'clamp'
            });
            
            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [1, 1.2, 1],
              extrapolate: 'clamp'
            });
            
            return (
              <Animated.View
                key={idx}
                style={[
                  styles.indicator, 
                  { 
                    opacity,
                    transform: [
                      { scale },
                      { translateY: scrollX.interpolate({
                          inputRange,
                          outputRange: [0, -3, 0],
                          extrapolate: 'clamp'
                        })
                      }
                    ],
                  },
                  currentSlide === idx ? styles.activeIndicator : null
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* Get Started Section */}
      <View style={styles.actionContainer}>
        <Animated.View
          style={[
            {
              transform: [{ scale: pulseAnim }],
            }
          ]}
        >
          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, '#F52A2A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.getStartedButton}
            >
              <Text style={styles.getStartedButtonText}>
                Get started
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  curvedHeader: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: Colors.background,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: {
    width: 70,
    height: 70,
  },
  agencyText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.background,
    marginTop: Spacing.sm,
    letterSpacing: 2,
    textAlign: 'center',
  },
  taglineText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.background,
    marginTop: Spacing.xs,
    textAlign: 'center',
    opacity: 0.8,
  },
  sliderContainer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideCard: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    padding: Spacing.md,
  },
  slideImage: {
    width: '100%',
    height: 800,
    
    marginBottom: Spacing.md,
  },
  slideTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 0,
    paddingHorizontal: 10,
  },

  slideIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
    marginHorizontal: 4,
    marginTop: -30,
    marginBottom: 2,
  },
  activeIndicator: {
    width: 10,
    backgroundColor: Colors.secondary,  
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  getStartedButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 180,
  },
  getStartedButtonText: {
    color: Colors.background,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
  },

});
