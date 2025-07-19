/**
 * Travel Insurance Data
 * Compatible with the existing data export structure
 */

export const travelInsuranceTypes = [
  {
    id: 'individual',
    name: 'Individual Travel',
    description: 'Coverage for single traveler',
    icon: 'account'
  },
  {
    id: 'family',
    name: 'Family Travel',
    description: 'Coverage for family members',
    icon: 'account-group'
  },
  {
    id: 'group',
    name: 'Group Travel',
    description: 'Coverage for organized groups',
    icon: 'account-multiple'
  }
];

export const travelInsuranceProducts = [
  {
    id: 'basic_travel',
    name: 'Basic Travel Insurance',
    description: 'Essential coverage for travel',
    coverage: 'Trip cancellation, baggage loss',
    premium: 'From KES 500'
  },
  {
    id: 'comprehensive_travel',
    name: 'Comprehensive Travel Insurance',
    description: 'Full coverage including medical',
    coverage: 'Medical emergencies, trip cancellation, baggage',
    premium: 'From KES 1,500'
  },
  {
    id: 'premium_travel',
    name: 'Premium Travel Insurance',
    description: 'Highest level of coverage',
    coverage: 'All risks, adventure sports, high-value items',
    premium: 'From KES 3,000'
  }
];

export const travelDestinations = [
  { id: 'domestic', name: 'Domestic (Kenya)', multiplier: 1.0 },
  { id: 'east_africa', name: 'East Africa', multiplier: 1.2 },
  { id: 'africa', name: 'Africa', multiplier: 1.5 },
  { id: 'europe', name: 'Europe', multiplier: 2.0 },
  { id: 'asia', name: 'Asia', multiplier: 1.8 },
  { id: 'americas', name: 'Americas', multiplier: 2.2 },
  { id: 'oceania', name: 'Oceania', multiplier: 2.5 }
];

export const ageBrackets = [
  { id: '0-17', name: '0-17 years', multiplier: 0.8 },
  { id: '18-35', name: '18-35 years', multiplier: 1.0 },
  { id: '36-50', name: '36-50 years', multiplier: 1.3 },
  { id: '51-65', name: '51-65 years', multiplier: 1.7 },
  { id: '66+', name: '66+ years', multiplier: 2.5 }
];

export const tripDurations = [
  { id: '1-7', name: '1-7 days', multiplier: 1.0 },
  { id: '8-14', name: '8-14 days', multiplier: 1.5 },
  { id: '15-30', name: '15-30 days', multiplier: 2.0 },
  { id: '31-60', name: '31-60 days', multiplier: 3.0 },
  { id: '61-90', name: '61-90 days', multiplier: 4.0 },
  { id: '91+', name: '91+ days', multiplier: 5.0 }
];

export const travelInsurers = [
  {
    id: 'aaa_travel',
    name: 'AAA Insurance',
    logo: null,
    rating: 4.2,
    processingTime: '24 hours'
  },
  {
    id: 'britam_travel',
    name: 'Britam Insurance',
    logo: null,
    rating: 4.5,
    processingTime: '12 hours'
  },
  {
    id: 'apa_travel',
    name: 'APA Insurance',
    logo: null,
    rating: 4.3,
    processingTime: '18 hours'
  }
];
