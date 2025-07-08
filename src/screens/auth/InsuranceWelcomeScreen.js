import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
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
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % insuranceProducts.length;
        flatListRef.current?.scrollToIndex({ 
          index: nextIndex, 
          animated: true 
        });
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const renderInsuranceCard = ({ item }) => (
    <View style={styles.insuranceCard}>
      <Text style={styles.insuranceIcon}>{item.icon}</Text>
      <Text style={styles.insuranceName}>{item.name}</Text>
      <Text style={styles.insuranceDescription}>{item.description}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Insurance product sliders</Text>
      </View>

      <View style={styles.sliderContainer}>
        <FlatList
          ref={flatListRef}
          data={insuranceProducts}
          renderItem={renderInsuranceCard}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToInterval={width - 40}
          decelerationRate="fast"
          contentContainerStyle={styles.sliderContent}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / (width - 40));
            setCurrentIndex(index);
          }}
        />
      </View>

      <View style={styles.indicatorContainer}>
        {insuranceProducts.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              { backgroundColor: index === currentIndex ? Colors.primary : Colors.border }
            ]}
          />
        ))}
      </View>

      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={styles.getStartedButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.getStartedText}>Get started</Text>
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
  headerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  headerText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.lg,
  },
  sliderContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  sliderContent: {
    paddingHorizontal: 20,
  },
  insuranceCard: {
    width: width - 80,
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: Spacing.xl,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.backgroundGray,
  },
  insuranceIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
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
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.md,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  getStartedButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  getStartedText: {
    color: Colors.background,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: Typography.lineHeight.lg,
  },
});
