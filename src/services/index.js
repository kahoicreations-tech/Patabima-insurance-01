// ==========================================
// PATABIMA SERVICES - ORGANIZED EXPORTS
// ==========================================

// AWS Services - Amazon Web Services integration
export * from './aws';

// Pricing Services - Insurance pricing and quotes
export * from './pricing';

// Core Services - Essential application services
export * from './core';

// External Services - Third-party integrations
export * from './external';

// ==========================================
// INDIVIDUAL EXPORTS FOR BACKWARD COMPATIBILITY
// ==========================================

// AWS Services
export { AWSAuthService, AWSDataService } from './aws';

// Pricing Services
export { 
  PricingService, 
  AdminPricingService, 
  DynamicPricingService, 
  QuoteStorageService 
} from './pricing';

// Core Services
export { 
  apiService, 
  authAPI, 
  userAPI, 
  quotationsAPI, 
  policiesAPI, 
  claimsAPI, 
  categoriesAPI, 
  campaignsAPI,
  NotificationService 
} from './core';

// External Services
export { PaymentService, PDFService } from './external';
