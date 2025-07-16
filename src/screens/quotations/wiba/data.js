/**
 * Data for WIBA (Work Injury Benefits Act) insurance quotation
 */

// WIBA Insurance Types (Step 1)
export const wibaInsuranceTypes = [
  { 
    id: 'basic', 
    name: 'Basic WIBA', 
    icon: '🛠️',
    description: 'Basic coverage for work-related injuries'
  },
  { 
    id: 'enhanced', 
    name: 'Enhanced WIBA', 
    icon: '🛡️',
    description: 'Enhanced coverage with additional benefits'
  },
  { 
    id: 'comprehensive', 
    name: 'Comprehensive WIBA', 
    icon: '🏥',
    description: 'Full coverage for all workplace risks'
  },
  { 
    id: 'group', 
    name: 'Group WIBA', 
    icon: '👥',
    description: 'Coverage for large workforce'
  }
];

// WIBA Insurance Products by Type (Step 2)
export const wibaInsuranceProducts = {
  basic: [
    { 
      id: 'basic_coverage', 
      name: 'Basic Coverage', 
      icon: '🛠️',
      coverage: 'Statutory minimum',
      medicalExpenses: 100000,
      deathBenefit: '8 years salary',
      baseRate: 1.5
    }
  ],
  enhanced: [
    { 
      id: 'enhanced_standard', 
      name: 'Enhanced Standard', 
      icon: '🛡️',
      coverage: 'Above statutory minimum',
      medicalExpenses: 250000,
      deathBenefit: '8 years salary',
      baseRate: 2.5
    },
    { 
      id: 'enhanced_plus', 
      name: 'Enhanced Plus', 
      icon: '🛡️',
      coverage: 'Premium coverage',
      medicalExpenses: 500000,
      deathBenefit: '10 years salary',
      baseRate: 3.2
    }
  ],
  comprehensive: [
    { 
      id: 'comp_standard', 
      name: 'Comprehensive Standard', 
      icon: '🏥',
      coverage: 'Full coverage',
      medicalExpenses: 1000000,
      deathBenefit: '10 years salary',
      baseRate: 3.8
    },
    { 
      id: 'comp_premium', 
      name: 'Comprehensive Premium', 
      icon: '🏥',
      coverage: 'Maximum coverage',
      medicalExpenses: 2000000,
      deathBenefit: '12 years salary',
      baseRate: 4.5
    }
  ],
  group: [
    { 
      id: 'group_standard', 
      name: 'Group Standard', 
      icon: '👥',
      coverage: 'Standard group coverage',
      medicalExpenses: 500000,
      deathBenefit: '8 years salary',
      baseRate: 2.2
    },
    { 
      id: 'group_premium', 
      name: 'Group Premium', 
      icon: '👥',
      coverage: 'Premium group coverage',
      medicalExpenses: 1000000,
      deathBenefit: '10 years salary',
      baseRate: 3.0
    }
  ]
};

// Industry risk categories for premium calculation
export const industryRiskCategories = [
  { id: 'low', name: 'Low Risk', description: 'Office work, retail, etc.', factor: 1.0 },
  { id: 'medium', name: 'Medium Risk', description: 'Light manufacturing, logistics, etc.', factor: 1.5 },
  { id: 'high', name: 'High Risk', description: 'Construction, heavy manufacturing, etc.', factor: 2.0 },
  { id: 'very_high', name: 'Very High Risk', description: 'Mining, oil rigs, etc.', factor: 3.0 }
];

// Company size categories
export const companySizeCategories = [
  { id: 'micro', name: 'Micro (1-10)', employeeRange: '1-10', factor: 1.2 },
  { id: 'small', name: 'Small (11-50)', employeeRange: '11-50', factor: 1.1 },
  { id: 'medium', name: 'Medium (51-250)', employeeRange: '51-250', factor: 1.0 },
  { id: 'large', name: 'Large (251+)', employeeRange: '251+', factor: 0.9 }
];

// WIBA insurers
export const wibaInsurers = [
  { id: 'jubilee', name: 'Jubilee Insurance', logo: 'jubilee.png' },
  { id: 'britam', name: 'Britam Insurance', logo: 'britam.png' },
  { id: 'cic', name: 'CIC Insurance', logo: 'cic.png' },
  { id: 'uap', name: 'UAP Old Mutual', logo: 'uap.png' },
  { id: 'aar', name: 'AAR Insurance', logo: 'aar.png' },
  { id: 'aig', name: 'AIG Insurance', logo: 'aig.png' }
];

// Cover durations
export const coverDurations = [
  { id: '12_months', name: '12 Months', factor: 1.0 },
  { id: '6_months', name: '6 Months', factor: 0.6 }
];
