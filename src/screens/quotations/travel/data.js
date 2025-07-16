/**
 * Data for travel insurance quotation
 */

// Travel Insurance Types (Step 1)
export const travelInsuranceTypes = [
  { 
    id: 'single_trip', 
    name: 'Single Trip', 
    icon: '✈️',
    description: 'Coverage for a single journey abroad'
  },
  { 
    id: 'multi_trip', 
    name: 'Multi Trip / Annual', 
    icon: '🌎',
    description: 'Coverage for multiple trips within a year'
  },
  { 
    id: 'schengen', 
    name: 'Schengen Visa', 
    icon: '🇪🇺',
    description: 'Special coverage for Schengen visa requirements'
  },
  { 
    id: 'student', 
    name: 'Student Travel', 
    icon: '🎓',
    description: 'Extended coverage for students studying abroad'
  },
  { 
    id: 'senior', 
    name: 'Senior Travel', 
    icon: '👵',
    description: 'Coverage for travelers over 65 years'
  }
];

// Travel Insurance Products by Type (Step 2)
export const travelInsuranceProducts = {
  single_trip: [
    { 
      id: 'bronze_single', 
      name: 'Bronze', 
      icon: '🥉',
      medicalCover: 50000,
      personalAccident: 10000,
      lostBaggage: 1000,
      tripCancellation: true,
      baseRate: 2000
    },
    { 
      id: 'silver_single', 
      name: 'Silver', 
      icon: '🥈',
      medicalCover: 200000,
      personalAccident: 20000,
      lostBaggage: 2000,
      tripCancellation: true,
      baseRate: 4000
    },
    { 
      id: 'gold_single', 
      name: 'Gold', 
      icon: '🥇',
      medicalCover: 500000,
      personalAccident: 50000,
      lostBaggage: 5000,
      tripCancellation: true,
      baseRate: 6000
    }
  ],
  multi_trip: [
    { 
      id: 'bronze_multi', 
      name: 'Bronze Annual', 
      icon: '🥉',
      medicalCover: 100000,
      personalAccident: 20000,
      lostBaggage: 1500,
      tripCancellation: true,
      baseRate: 8000
    },
    { 
      id: 'silver_multi', 
      name: 'Silver Annual', 
      icon: '🥈',
      medicalCover: 300000,
      personalAccident: 40000,
      lostBaggage: 3000,
      tripCancellation: true,
      baseRate: 12000
    },
    { 
      id: 'gold_multi', 
      name: 'Gold Annual', 
      icon: '🥇',
      medicalCover: 1000000,
      personalAccident: 100000,
      lostBaggage: 10000,
      tripCancellation: true,
      baseRate: 20000
    }
  ],
  schengen: [
    { 
      id: 'schengen_basic', 
      name: 'Schengen Basic', 
      icon: '🇪🇺',
      medicalCover: 30000,
      personalAccident: 10000,
      lostBaggage: 1000,
      tripCancellation: true,
      baseRate: 3000
    },
    { 
      id: 'schengen_plus', 
      name: 'Schengen Plus', 
      icon: '🇪🇺',
      medicalCover: 50000,
      personalAccident: 15000,
      lostBaggage: 1500,
      tripCancellation: true,
      baseRate: 4500
    }
  ],
  student: [
    { 
      id: 'student_basic', 
      name: 'Student Basic', 
      icon: '🎓',
      medicalCover: 100000,
      personalAccident: 15000,
      lostBaggage: 1000,
      tripCancellation: true,
      baseRate: 15000
    },
    { 
      id: 'student_comprehensive', 
      name: 'Student Comprehensive', 
      icon: '🎓',
      medicalCover: 300000,
      personalAccident: 30000,
      lostBaggage: 2000,
      tripCancellation: true,
      baseRate: 25000
    }
  ],
  senior: [
    { 
      id: 'senior_standard', 
      name: 'Senior Standard', 
      icon: '👵',
      medicalCover: 100000,
      personalAccident: 10000,
      lostBaggage: 1000,
      tripCancellation: true,
      baseRate: 5000
    },
    { 
      id: 'senior_premium', 
      name: 'Senior Premium', 
      icon: '👵',
      medicalCover: 300000,
      personalAccident: 20000,
      lostBaggage: 2000,
      tripCancellation: true,
      baseRate: 8000
    }
  ]
};

// Travel destinations for premium calculation
export const travelDestinations = [
  { id: 'africa', name: 'Africa', factor: 1.0 },
  { id: 'europe', name: 'Europe', factor: 1.2 },
  { id: 'asia', name: 'Asia', factor: 1.1 },
  { id: 'north_america', name: 'North America', factor: 1.5 },
  { id: 'south_america', name: 'South America', factor: 1.3 },
  { id: 'australia', name: 'Australia & Oceania', factor: 1.4 },
  { id: 'worldwide', name: 'Worldwide', factor: 1.6 }
];

// Age brackets for premium calculation
export const ageBrackets = [
  { min: 0, max: 18, factor: 0.8 },
  { min: 19, max: 35, factor: 1.0 },
  { min: 36, max: 50, factor: 1.2 },
  { min: 51, max: 65, factor: 1.5 },
  { min: 66, max: 75, factor: 2.0 },
  { min: 76, max: 85, factor: 2.5 },
  { min: 86, max: 999, factor: 3.0 }
];

// Trip duration options (for single trip)
export const tripDurations = [
  { id: '1_7', name: '1-7 days', factor: 1.0 },
  { id: '8_14', name: '8-14 days', factor: 1.3 },
  { id: '15_30', name: '15-30 days', factor: 1.6 },
  { id: '31_60', name: '31-60 days', factor: 2.0 },
  { id: '61_90', name: '61-90 days', factor: 2.5 },
  { id: '91_180', name: '91-180 days', factor: 3.5 }
];

// Travel insurance providers
export const travelInsurers = [
  { id: 'aar', name: 'AAR Insurance', logo: 'aar.png' },
  { id: 'jubilee', name: 'Jubilee Insurance', logo: 'jubilee.png' },
  { id: 'britam', name: 'Britam Insurance', logo: 'britam.png' },
  { id: 'aig', name: 'AIG Insurance', logo: 'aig.png' },
  { id: 'madison', name: 'Madison Insurance', logo: 'madison.png' },
  { id: 'heritage', name: 'Heritage Insurance', logo: 'heritage.png' }
];
