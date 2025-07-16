import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Typography } from '../../../../constants';
import { GridSelectionLayout } from '../../components';

/**
 * Insurance Product Selection component
 * @param {Object} products - Available insurance products by category
 * @param {Object} selectedCategory - Currently selected vehicle category
 * @param {Object} selectedProduct - Currently selected insurance product
 * @param {function} onSelectProduct - Callback when a product is selected
 * @param {boolean} useGridLayout - Whether to use grid layout (default: true)
 */
const InsuranceProductSelection = ({ 
  products, 
  selectedCategory, 
  selectedProduct, 
  onSelectProduct,
  useGridLayout = true
}) => {
  if (!selectedCategory || !products[selectedCategory.id]) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.errorText}>
            Please select a vehicle category first
          </Text>
        </View>
      </View>
    );
  }

  const categoryProducts = products[selectedCategory.id];

  // Grid version of products
  const convertProductsToGridItems = () => {
    const items = [];
    
    if (categoryProducts.comprehensive && categoryProducts.comprehensive.length > 0) {
      items.push({
        id: 'comprehensive',
        name: 'Comprehensive',
        icon: '🛡️',
        description: 'Full coverage including own damage',
        isCategory: true
      });
    }
    
    if (categoryProducts.thirdParty && categoryProducts.thirdParty.length > 0) {
      items.push({
        id: 'thirdParty',
        name: 'Third Party',
        icon: '⚠️',
        description: 'Basic legal liability coverage',
        isCategory: true
      });
    }
    
    return items;
  };
  
  // Grid layout implementation based on screenshot
  const renderGridLayout = () => {
    return (
      <GridSelectionLayout
        items={convertProductsToGridItems()}
        selectedItem={selectedProduct ? { id: selectedProduct.id.includes('comprehensive') ? 'comprehensive' : 'thirdParty' } : null}
        onSelectItem={(item) => {
          if (item.id === 'comprehensive' && categoryProducts.comprehensive && categoryProducts.comprehensive.length > 0) {
            onSelectProduct(categoryProducts.comprehensive[0]);
          } else if (item.id === 'thirdParty' && categoryProducts.thirdParty && categoryProducts.thirdParty.length > 0) {
            onSelectProduct(categoryProducts.thirdParty[0]);
          }
        }}
        title={`TOR For ${selectedCategory.name}`}
        subtitle="Select coverage type"
        itemsPerRow={2}
      />
    );
  };

  // Use grid layout based on screenshot
  if (useGridLayout) {
    return renderGridLayout();
  }

  // Original list layout
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>TOR For {selectedCategory.name}</Text>
        <Text style={styles.subtitle}>
          Policy Details
        </Text>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.policyTypeContainer}>
          <Text style={styles.sectionTitle}>Policy Type</Text>
          <View style={styles.radioGroupContainer}>
            <TouchableOpacity 
              style={[
                styles.radioOption,
                selectedProduct?.id.includes('comprehensive') && styles.radioOptionSelected
              ]}
              onPress={() => {
                if (categoryProducts.comprehensive && categoryProducts.comprehensive.length > 0) {
                  onSelectProduct(categoryProducts.comprehensive[0]);
                }
              }}
            >
              <View style={[
                styles.radioOuterCircle,
                selectedProduct?.id.includes('comprehensive') && styles.radioOuterCircleSelected
              ]}>
                {selectedProduct?.id.includes('comprehensive') && <View style={styles.radioInnerCircle} />}
              </View>
              <Text style={styles.radioLabel}>Comprehensive</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.radioOption,
                selectedProduct?.id.includes('third_party') && styles.radioOptionSelected
              ]}
              onPress={() => {
                if (categoryProducts.thirdParty && categoryProducts.thirdParty.length > 0) {
                  onSelectProduct(categoryProducts.thirdParty[0]);
                }
              }}
            >
              <View style={[
                styles.radioOuterCircle,
                selectedProduct?.id.includes('third_party') && styles.radioOuterCircleSelected
              ]}>
                {selectedProduct?.id.includes('third_party') && <View style={styles.radioInnerCircle} />}
              </View>
              <Text style={styles.radioLabel}>Third Party</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Display available products within the selected category */}
        <View style={styles.productsContainer}>
          <Text style={styles.sectionTitle}>Available Products</Text>
          
          {selectedProduct?.id.includes('comprehensive') ? (
            <>
              {categoryProducts.comprehensive.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={[
                    styles.productCard,
                    selectedProduct?.id === product.id && styles.selectedProductCard
                  ]}
                  onPress={() => onSelectProduct(product)}
                >
                  <View style={styles.productHeader}>
                    <Text style={styles.productIcon}>{product.icon}</Text>
                    <Text style={styles.productName}>{product.name}</Text>
                  </View>
                  
                  <View style={styles.productDetails}>
                    <Text style={styles.productRate}>Base Rate: {product.baseRate}%</Text>
                  </View>
                  
                  <View style={styles.radioContainer}>
                    <View style={[
                      styles.radioOuter,
                      selectedProduct?.id === product.id && styles.radioOuterSelected
                    ]}>
                      {selectedProduct?.id === product.id && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              {categoryProducts.thirdParty.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={[
                    styles.productCard,
                    selectedProduct?.id === product.id && styles.selectedProductCard
                  ]}
                  onPress={() => onSelectProduct(product)}
                >
                  <View style={styles.productHeader}>
                    <Text style={styles.productIcon}>{product.icon}</Text>
                    <Text style={styles.productName}>{product.name}</Text>
                  </View>
                  
                  <View style={styles.productDetails}>
                    <Text style={styles.productRate}>Base Rate: {product.baseRate}%</Text>
                  </View>
                  
                  <View style={styles.radioContainer}>
                    <View style={[
                      styles.radioOuter,
                      selectedProduct?.id === product.id && styles.radioOuterSelected
                    ]}>
                      {selectedProduct?.id === product.id && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        {/* Render grid layout as an alternative display option */}
        {renderGridLayout()}
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
  errorText: {
    ...Typography.bodyLarge,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 20,
  },
  policyTypeContainer: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 12,
  },
  radioGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    minWidth: '45%',
  },
  radioOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  radioOuterCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioOuterCircleSelected: {
    borderColor: Colors.primary,
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  radioLabel: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  productsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  selectedProductCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  productName: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  productDetails: {
    marginBottom: 8,
  },
  productRate: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  radioContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
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

export default InsuranceProductSelection;
