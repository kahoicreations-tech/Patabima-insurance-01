/**
 * Data Layer Index
 * 
 * Centralized exports for all data-related modules
 * This provides a clean import interface for components
 */

// Insurance Categories
export {
  INSURANCE_CATEGORIES,
  CATEGORY_STATUS,
  CATEGORY_TYPES,
  getActiveCategories,
  getPopularCategories,
  getCategoriesByType,
  getCategoryById,
  getCategoriesByStatus,
  searchCategories,
  getNavigableCategories,
  getCategoryStatusMessage,
  getLegacyCategories
} from './insuranceCategories';

// Category Management Examples
export { default as categoryManagementExamples } from './categoryManagementExamples';

// Mock Data
export {
  MOCK_AGENT,
  MOCK_POLICIES,
  MOCK_QUOTATIONS,
  MOCK_CLAIMS,
  MOCK_UPCOMING,
  MOCK_CAMPAIGNS
} from './mockData';
