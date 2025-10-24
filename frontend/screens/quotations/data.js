/**
 * Index file for all insurance quotation data
 * Makes importing data easier across different components
 */

// Motor Insurance Data
export { vehicleCategories, insuranceProducts } from './motor/data';

// Medical Insurance Data
export { 
  medicalInsuranceTypes, 
  medicalInsuranceProducts,
  ageBrackets as medicalAgeBrackets,
  medicalInsurers,
  coverDurations as medicalCoverDurations
} from './medical/data';

// WIBA Insurance Data
export {
  wibaInsuranceTypes,
  wibaInsuranceProducts,
  industryRiskCategories,
  companySizeCategories,
  wibaInsurers,
  coverDurations as wibaCoverDurations
} from './wiba/data';

// Travel Insurance Data
export {
  travelInsuranceTypes,
  travelInsuranceProducts,
  travelDestinations,
  ageBrackets as travelAgeBrackets,
  tripDurations,
  travelInsurers
} from './travel/data';

// Personal Accident Insurance Data
export {
  personalAccidentTypes,
  personalAccidentProducts,
  occupationRiskCategories,
  ageBrackets as personalAccidentAgeBrackets,
  coverDurations as personalAccidentCoverDurations,
  personalAccidentInsurers
} from './personal-accident/data';

// Last Expense Insurance Data
export {
  lastExpenseTypes,
  lastExpenseProducts,
  ageBrackets as lastExpenseAgeBrackets,
  coverDurations as lastExpenseCoverDurations,
  familySizeCategories,
  lastExpenseInsurers
} from './last-expense/data';
