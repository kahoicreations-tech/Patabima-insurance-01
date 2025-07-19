/**
 * Categories Demo Screen
 * 
 * This component demonstrates the new centralized insurance categories system
 * and all its features. Use this as a reference for implementation patterns.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  FlatList
} from 'react-native';
import { Colors, Spacing, Typography } from '../../constants';
import {
  INSURANCE_CATEGORIES,
  CATEGORY_STATUS,
  CATEGORY_TYPES,
  getActiveCategories,
  getPopularCategories,
  getCategoriesByType,
  getCategoriesByStatus,
  searchCategories,
  getCategoryStatusMessage
} from '../../data';

export default function CategoriesDemoScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Get filtered categories based on current selection
  const getFilteredCategories = () => {
    let categories = INSURANCE_CATEGORIES;
    
    // Apply search filter
    if (searchQuery.trim()) {
      categories = searchCategories(searchQuery);
    }
    
    // Apply status/type filter
    switch (selectedFilter) {
      case 'active':
        return getActiveCategories().filter(cat => 
          searchQuery ? categories.includes(cat) : true
        );
      case 'popular':
        return getPopularCategories().filter(cat => 
          searchQuery ? categories.includes(cat) : true
        );
      case 'motor':
        return getCategoriesByType(CATEGORY_TYPES.MOTOR).filter(cat => 
          searchQuery ? categories.includes(cat) : true
        );
      case 'health':
        return getCategoriesByType(CATEGORY_TYPES.HEALTH).filter(cat => 
          searchQuery ? categories.includes(cat) : true
        );
      case 'maintenance':
        return getCategoriesByStatus(CATEGORY_STATUS.MAINTENANCE).filter(cat => 
          searchQuery ? categories.includes(cat) : true
        );
      default:
        return categories;
    }
  };

  const handleCategoryPress = (category) => {
    const statusMessage = getCategoryStatusMessage(category);
    const title = `${category.name} (${category.status})`;
    
    Alert.alert(title, statusMessage, [
      { text: 'OK' },
      { 
        text: 'View Details', 
        onPress: () => showCategoryDetails(category) 
      }
    ]);
  };

  const showCategoryDetails = (category) => {
    const details = `
ID: ${category.id}
Type: ${category.type}
Status: ${category.status}
Commission: ${(category.commissionRate * 100).toFixed(1)}%
Min Premium: KES ${category.minimumPremium.toLocaleString()}
Popular: ${category.isPopular ? 'Yes' : 'No'}

Features:
${category.features.map(f => `• ${f}`).join('\n')}

Tags: ${category.tags.join(', ')}
    `.trim();
    
    Alert.alert(`${category.name} Details`, details);
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        { borderLeftColor: item.color }
      ]}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryIcon}>{item.icon}</Text>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryShortName}>{item.shortName}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.categoryDescription}>{item.description}</Text>
      <View style={styles.categoryMeta}>
        <Text style={styles.metaText}>
          Commission: {(item.commissionRate * 100).toFixed(1)}%
        </Text>
        <Text style={styles.metaText}>
          Min: KES {item.minimumPremium.toLocaleString()}
        </Text>
        {item.isPopular && (
          <Text style={styles.popularBadge}>★ Popular</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case CATEGORY_STATUS.ACTIVE:
        return Colors.success + '20';
      case CATEGORY_STATUS.MAINTENANCE:
        return Colors.warning + '20';
      case CATEGORY_STATUS.COMING_SOON:
        return Colors.info + '20';
      default:
        return Colors.error + '20';
    }
  };

  const filteredCategories = getFilteredCategories();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Insurance Categories Demo</Text>
        <Text style={styles.subtitle}>
          {filteredCategories.length} of {INSURANCE_CATEGORIES.length} categories
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories, features, or tags..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        style={styles.filtersContainer}
        showsHorizontalScrollIndicator={false}
      >
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'popular', label: 'Popular' },
          { key: 'motor', label: 'Motor' },
          { key: 'health', label: 'Health' },
          { key: 'maintenance', label: 'Maintenance' }
        ].map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.activeFilterButton
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter.key && styles.activeFilterText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Categories List */}
      <FlatList
        data={filteredCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.white + '80',
  },
  searchContainer: {
    padding: Spacing.md,
  },
  searchInput: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: Typography.fontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filtersContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.medium,
  },
  activeFilterText: {
    color: Colors.white,
  },
  categoriesList: {
    flex: 1,
  },
  categoriesContent: {
    padding: Spacing.md,
  },
  categoryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  categoryShortName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    textTransform: 'uppercase',
  },
  categoryDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: Typography.lineHeight.sm,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginRight: Spacing.md,
  },
  popularBadge: {
    fontSize: Typography.fontSize.xs,
    color: Colors.warning,
    fontFamily: Typography.fontFamily.bold,
  },
});
