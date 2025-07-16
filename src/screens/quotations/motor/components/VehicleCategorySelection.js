import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SelectionCard, GridSelectionLayout } from '../../components';
import { Colors, Typography, Spacing } from '../../../../constants';

/**
 * Vehicle Category Selection component
 * @param {Array} categories - Available vehicle categories
 * @param {Object} selectedCategory - Currently selected category
 * @param {function} onSelectCategory - Callback when a category is selected
 * @param {boolean} useGridLayout - Whether to use grid layout (default: true)
 */
const VehicleCategorySelection = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  useGridLayout = true
}) => {
  // Use the grid layout as shown in the screenshot
  if (useGridLayout) {
    return (
      <GridSelectionLayout
        items={categories}
        selectedItem={selectedCategory}
        onSelectItem={onSelectCategory}
        title="Select Vehicle Category"
        subtitle="Choose the category that best describes your vehicle"
        itemsPerRow={2}
      />
    );
  }
  
  // Original list layout as fallback
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Select Vehicle Category</Text>
        <Text style={styles.subtitle}>
          Choose the category that best describes your vehicle
        </Text>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              selectedCategory?.id === category.id && styles.selectedCard
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
            </View>
            <View style={styles.categoryDetails}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
            <View style={styles.radioContainer}>
              <View style={[
                styles.radioOuter,
                selectedCategory?.id === category.id && styles.radioOuterSelected
              ]}>
                {selectedCategory?.id === category.id && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.headingMedium,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  iconContainer: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  categoryDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  radioContainer: {
    marginLeft: 16,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  }
});

export default VehicleCategorySelection;
