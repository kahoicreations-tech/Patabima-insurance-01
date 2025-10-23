// Pricing calculation utilities for levies and totals
import { LEVY_RATES } from '../constants/motorInsuranceConfig';

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
export const toMoney = (n) => round2(n || 0);

export function computeLevies(premium) {
  const itl = toMoney(premium * LEVY_RATES.ITL);
  const pcf = toMoney(premium * LEVY_RATES.PCF);
  const stampDuty = LEVY_RATES.STAMP_DUTY;
  return { itl, pcf, stampDuty, totalLevies: toMoney(itl + pcf + stampDuty) };
}

export function computeTotalPayable(premium) {
  const levies = computeLevies(premium);
  return { ...levies, totalPayable: toMoney(premium + levies.totalLevies) };
}

export function transformPricingRequest(productType, inputs) {
  // ESSENTIAL FIELDS FOR UNDERWRITER PRICE FETCHING
  // Backend needs these core fields to fetch underwriter prices: category, subcategory_code
  const base = {
    category: inputs.category || inputs.category_code,
    subcategory: inputs.subcategory_code || inputs.subcategory,
    underwriter: inputs.underwriter_code || inputs.underwriter,
  };

  // Vehicle registration - essential for TOR and Third Party
  if (inputs.registrationNumber) base.vehicle_registration = inputs.registrationNumber;
  if (inputs.vehicle_registration) base.vehicle_registration = inputs.vehicle_registration;

  // Cover start date and policy term mapping - essential for all products
  if (inputs.cover_start_date) base.cover_start_date = inputs.cover_start_date;

  // PRICING CALCULATION FIELDS - mainly for Comprehensive products
  // Only include these if the product type requires pricing calculations
  const pt = (productType || '').toString();
  const requiresPricingCalculation = (pt && (
    pt.toUpperCase().includes('COMPREHENSIVE') || 
    pt.toUpperCase().includes('COMP')
  )) || inputs.sum_insured != null || inputs.sumInsured != null || inputs.vehicle_value != null || inputs.vehicle_valuation != null;

  if (requiresPricingCalculation) {
    // Comprehensive-specific fields for pricing calculations
    if (inputs.vehicle_year) base.vehicle_age = Math.max(0, (new Date()).getFullYear() - parseInt(inputs.vehicle_year));
  // Robust sum_insured fallbacks and numeric coercion
  const siRaw = inputs.sum_insured ?? inputs.sumInsured ?? inputs.vehicle_value ?? inputs.vehicle_valuation;
  if (siRaw != null && siRaw !== '') base.sum_insured = Number(String(siRaw).replace(/[,\s]/g, ''));
    if (inputs.tonnage != null) base.tonnage = Number(inputs.tonnage);
    if (inputs.passengers != null) base.passenger_count = Number(inputs.passengers);

    // Additional add-ons can be grouped
    const add_ons = {};
    if (inputs.excess_protector != null) add_ons.excess_protector = !!inputs.excess_protector;
    if (inputs.pvt != null) add_ons.pvt = !!inputs.pvt;
    if (inputs.cover_days != null) add_ons.cover_days = Number(inputs.cover_days);
    if (Object.keys(add_ons).length) base.add_ons = add_ons;

    // Preserve some legacy fields for compatibility with older endpoints if they are used elsewhere
    if (inputs.vehicle_make) base.vehicle_make = inputs.vehicle_make;
    if (inputs.vehicle_model) base.vehicle_model = inputs.vehicle_model;
    if (inputs.vehicle_year) base.vehicle_year = parseInt(inputs.vehicle_year);
  } else {
    // For TOR and Third Party - minimal fields needed
    // Still include vehicle_year if available as it might be used for age restrictions
    if (inputs.vehicle_year) base.vehicle_year = parseInt(inputs.vehicle_year);
  }
  
  // Map form field names to backend expected field names
  
  // Vehicle registration mapping
  if (inputs.registrationNumber) base.vehicle_registration = inputs.registrationNumber;
  
  // Customer information mapping - extract from various possible field formats
  // Handle full name or split first/last name
  if (inputs.fullName) {
    const nameParts = inputs.fullName.trim().split(/\s+/);
    base.customer_first_name = nameParts[0] || 'John';
    base.customer_last_name = nameParts.slice(1).join(' ') || 'Doe';
  } else if (inputs.ownerName) {
    const nameParts = inputs.ownerName.trim().split(/\s+/);
    base.customer_first_name = nameParts[0] || 'John';
    base.customer_last_name = nameParts.slice(1).join(' ') || 'Doe';
  } else {
    // Provide default customer details if not available (for testing)
    base.customer_first_name = 'John';
    base.customer_last_name = 'Doe';
  }
  
  // Phone number mapping
  if (inputs.phoneNumber) {
    base.customer_phone = inputs.phoneNumber;
  } else if (inputs.ownerPhone) {
    base.customer_phone = inputs.ownerPhone;
  } else {
    base.customer_phone = '254712345678'; // Default for testing
  }
  
  // Email mapping  
  if (inputs.email) {
    base.customer_email = inputs.email;
  } else if (inputs.emailAddress) {
    base.customer_email = inputs.emailAddress;
  } else if (inputs.ownerEmail) {
    base.customer_email = inputs.ownerEmail;
  } else {
    base.customer_email = 'john.doe@email.com'; // Default for testing
  }

  // Duration mapping - critical for pricing calculations
  if (typeof inputs.duration_days === 'number') {
    base.duration_days = inputs.duration_days;
  } else if (inputs.policy_term_months) {
    // Convert months to days (approximate)
    base.duration_days = Number(inputs.policy_term_months) * 30;
  } else {
    // Default duration: 365 for comprehensive-like requests, else 30
    base.duration_days = requiresPricingCalculation ? 365 : 30;
  }
  
  // Accept either months numeric or human-readable '12 months'
  const cp = inputs.coveragePeriod || inputs.policy_term_label;
  if (typeof inputs.policy_term_months === 'number') {
    base.policy_term_months = inputs.policy_term_months;
  } else if (cp && typeof cp === 'string') {
    const m = cp.match(/(\d+)\s*month/i);
    if (m) base.policy_term_months = parseInt(m[1]);
  }
  if (inputs.category || inputs.category_code) base.category = inputs.category || inputs.category_code;

  return base;
}

export function normalizePricingResponse(resp) {
  // Accepts various backend shapes and normalizes to { premium, breakdown, meta }
  if (!resp) return { premium: 0, breakdown: {}, meta: {} };
  
  // Handle different response structures from backend
  let totalPremium = Number(resp.total_premium || resp.premium || resp.base_premium || 0);
  let basePremium = Number(resp.base_premium || 0);
  
  // WORKAROUND: If backend premium_breakdown has incorrect base_premium,
  // try to extract correct base premium from features pricing section
  if (resp.features && resp.features.pricing && resp.category && resp.subcategory) {
    const pricingKey = `${resp.category}_${resp.subcategory}`;
    const underwriterPricing = resp.features.pricing[pricingKey];
    if (underwriterPricing && underwriterPricing.base_premium) {
      basePremium = Number(underwriterPricing.base_premium);
      console.log(`Using underwriter-specific base premium from features: ${basePremium} for ${resp.underwriter_name}`);
    }
  }
  
  // Recalculate total premium with correct base premium if needed
  if (resp.premium_breakdown && basePremium !== Number(resp.premium_breakdown.base_premium)) {
    const trainingLevy = Number(resp.premium_breakdown.training_levy || basePremium * 0.0025);
    const pcfLevy = Number(resp.premium_breakdown.pcf_levy || basePremium * 0.0025);
    const stampDuty = Number(resp.premium_breakdown.stamp_duty || 40);
    totalPremium = basePremium + trainingLevy + pcfLevy + stampDuty;
    console.log(`Recalculated total premium for ${resp.underwriter_name}: ${totalPremium} (base: ${basePremium})`);
  }
  
  // If the backend provides breakdown structure (like from test results)
  if (resp.base_premium && resp.training_levy && resp.pcf_levy && resp.stamp_duty) {
    totalPremium = Number(resp.base_premium) + Number(resp.training_levy) + Number(resp.pcf_levy) + Number(resp.stamp_duty);
  }
  
  const breakdown = resp.breakdown || resp.premium_breakdown || {
    base: basePremium,
    training_levy: Number(resp.training_levy || 0),
    pcf_levy: Number(resp.pcf_levy || 0),
    stamp_duty: Number(resp.stamp_duty || 0)
  };
  
  const meta = resp.meta || {};
  
  return { 
    premium: toMoney(totalPremium), 
    totalPremium: toMoney(totalPremium),
    breakdown, 
    meta,
    // Include individual components if available
    base_premium: basePremium,
    training_levy: Number(resp.training_levy || 0),
    pcf_levy: Number(resp.pcf_levy || 0),
    stamp_duty: Number(resp.stamp_duty || 0)
  };
}
