// Frontend mirror of backend insurance categories & products.
// Used for display labels and future dynamic form schemas.

export const INSURANCE_CATEGORIES = [
  { key: 'MOTOR', displayName: 'Motor Vehicle Insurance' },
  { key: 'MEDICAL', displayName: 'Medical Insurance' },
  { key: 'WIBA', displayName: 'WIBA Insurance' },
  { key: 'LAST_EXPENSE', displayName: 'Last Expense Insurance' },
  { key: 'TRAVEL', displayName: 'Travel Insurance' },
  { key: 'PERSONAL_ACCIDENT', displayName: 'Personal Accident Insurance' },
  { key: 'PROFESSIONAL_INDEMNITY', displayName: 'Professional Indemnity' },
  { key: 'DOMESTIC_PACKAGE', displayName: 'Domestic Package Insurance' },
];

export const CATEGORY_LABEL_MAP = INSURANCE_CATEGORIES.reduce((acc, c) => { acc[c.key] = c.displayName; return acc; }, {});

// Minimal product name mapping (extend when backend exposes product codes consistently)
export const PRODUCT_CODE_LABEL_MAP = {
  MOTOR_PRIVATE_THIRD_PARTY: 'Private Motor - Third Party',
  MOTOR_PRIVATE_COMPREHENSIVE: 'Private Motor - Comprehensive',
  MOTOR_COMMERCIAL_LIGHT: 'Commercial Vehicle - Light',
  MOTOR_PSV: 'PSV Vehicle',
  MEDICAL_INDIVIDUAL_STANDARD: 'Medical Individual Standard',
  MEDICAL_CORPORATE: 'Medical Corporate',
  WIBA_STANDARD: 'WIBA Standard',
  LAST_EXPENSE_FAMILY: 'Last Expense Family Cover',
  TRAVEL_INTERNATIONAL: 'Travel International',
  PA_INDIVIDUAL: 'Personal Accident Individual',
  PI_STANDARD: 'Professional Indemnity Standard',
  DOMESTIC_PACKAGE_STANDARD: 'Domestic Package Standard',
};

export function getCategoryLabel(categoryKey) {
  if (!categoryKey) return 'Other Insurance';
  const norm = categoryKey.toString().toUpperCase();
  return CATEGORY_LABEL_MAP[norm] || CATEGORY_LABEL_MAP[norm.replace('-', '_')] || 'Other Insurance';
}

export function getProductLabel(productCodeOrName) {
  if (!productCodeOrName) return null;
  const raw = productCodeOrName.toString();
  // If it's an obvious UUID/GUID, suppress it.
  if (/^[0-9a-fA-F-]{32,36}$/.test(raw)) return null;
  const upper = raw.toUpperCase();
  return PRODUCT_CODE_LABEL_MAP[upper] || raw.replace(/_/g, ' ');
}
