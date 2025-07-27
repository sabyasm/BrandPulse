/**
 * Logo Service - Dynamic Logo Fetch and Brand Recognition
 * Provides utilities to fetch company/brand logos and recognize brands
 */

export interface BrandLogo {
  name: string;
  logoUrl: string;
  domain?: string;
  fallbackIcon?: string;
}

export interface BrandInfo {
  name: string;
  cleanName: string;
  domain?: string;
  logoUrl?: string;
  fallbackIcon?: string;
}

/**
 * Comprehensive brand domain mapping for major companies
 */
const BRAND_DOMAIN_MAP: Record<string, string> = {
  // Tech companies
  'google': 'google.com',
  'microsoft': 'microsoft.com',
  'apple': 'apple.com',
  'amazon': 'amazon.com',
  'meta': 'meta.com',
  'facebook': 'facebook.com',
  'tesla': 'tesla.com',
  'netflix': 'netflix.com',
  'spotify': 'spotify.com',
  'adobe': 'adobe.com',
  'salesforce': 'salesforce.com',
  'slack': 'slack.com',
  'zoom': 'zoom.us',
  'dropbox': 'dropbox.com',
  'shopify': 'shopify.com',
  'stripe': 'stripe.com',
  'paypal': 'paypal.com',
  
  // CRM & Marketing
  'hubspot': 'hubspot.com',
  'mailchimp': 'mailchimp.com',
  'constant contact': 'constantcontact.com',
  'activecampaign': 'activecampaign.com',
  'sendinblue': 'sendinblue.com',
  'convertkit': 'convertkit.com',
  'aweber': 'aweber.com',
  'getresponse': 'getresponse.com',
  
  // Project Management
  'asana': 'asana.com',
  'trello': 'trello.com',
  'notion': 'notion.so',
  'monday.com': 'monday.com',
  'clickup': 'clickup.com',
  'basecamp': 'basecamp.com',
  'jira': 'atlassian.com',
  'confluence': 'atlassian.com',
  
  // Financial Services
  'chase': 'chase.com',
  'bank of america': 'bankofamerica.com',
  'wells fargo': 'wellsfargo.com',
  'citibank': 'citibank.com',
  'american express': 'americanexpress.com',
  'discover': 'discover.com',
  'capital one': 'capitalone.com',
  'mastercard': 'mastercard.com',
  'visa': 'visa.com',
  
  // E-commerce & Retail
  'walmart': 'walmart.com',
  'target': 'target.com',
  'costco': 'costco.com',
  'best buy': 'bestbuy.com',
  'home depot': 'homedepot.com',
  'lowes': 'lowes.com',
  'ebay': 'ebay.com',
  'etsy': 'etsy.com',
  
  // Hotels & Travel
  'marriott': 'marriott.com',
  'hilton': 'hilton.com',
  'hyatt': 'hyatt.com',
  'intercontinental': 'ihg.com',
  'expedia': 'expedia.com',
  'booking.com': 'booking.com',
  'airbnb': 'airbnb.com',
  
  // Fitness & Health
  'fitbit': 'fitbit.com',
  'garmin': 'garmin.com',
  'apple watch': 'apple.com',
  'samsung': 'samsung.com',
  'polar': 'polar.com',
  'suunto': 'suunto.com',
  
  // Automotive
  'bmw': 'bmw.com',
  'mercedes': 'mercedes-benz.com',
  'audi': 'audi.com',
  'volkswagen': 'vw.com',
  'toyota': 'toyota.com',
  'honda': 'honda.com',
  'ford': 'ford.com',
  'chevrolet': 'chevrolet.com',
  'nissan': 'nissan.com',
  'porsche': 'porsche.com',
  
  // Canadian Banks
  'rbc': 'rbc.com',
  'td bank': 'td.com',
  'bmo': 'bmo.com',
  'scotiabank': 'scotiabank.com',
  'cibc': 'cibc.com',
  'royal bank of canada': 'rbc.com',
  'td canada trust': 'td.com',
  'bank of montreal': 'bmo.com',
};

/**
 * Clean and normalize brand names for better matching
 */
export function cleanBrandName(brandName: string): string {
  return brandName
    .toLowerCase()
    .replace(/\b(inc|corp|llc|ltd|limited|corporation|company|co\.)\b/gi, '')
    .replace(/[^\w\s&.-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract domain from brand name using mapping or intelligent guessing
 */
export function extractDomainFromBrand(brandName: string): string | null {
  const cleanName = cleanBrandName(brandName);
  
  // Check exact match in mapping
  if (BRAND_DOMAIN_MAP[cleanName]) {
    return BRAND_DOMAIN_MAP[cleanName];
  }
  
  // Check partial matches
  for (const [key, domain] of Object.entries(BRAND_DOMAIN_MAP)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return domain;
    }
  }
  
  // Generate domain from brand name (basic heuristic)
  const domainName = cleanName
    .replace(/\s+/g, '')
    .replace(/[&.-]/g, '')
    .toLowerCase();
  
  if (domainName.length > 2 && domainName.length < 30) {
    return `${domainName}.com`;
  }
  
  return null;
}

/**
 * Get logo URL using Google's favicon service and other fallbacks
 */
export function getLogoUrl(domain: string, size: number = 64): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

/**
 * Get fallback icon based on brand category/type
 */
export function getFallbackIcon(brandName: string): string {
  const cleanName = cleanBrandName(brandName);
  
  // Financial services
  if (cleanName.includes('bank') || cleanName.includes('credit') || cleanName.includes('card') || 
      cleanName.includes('financial') || cleanName.includes('capital')) {
    return '🏦';
  }
  
  // Tech companies
  if (cleanName.includes('tech') || cleanName.includes('software') || cleanName.includes('app') ||
      cleanName.includes('digital') || cleanName.includes('cloud')) {
    return '💻';
  }
  
  // E-commerce/Retail
  if (cleanName.includes('shop') || cleanName.includes('store') || cleanName.includes('retail') ||
      cleanName.includes('market') || cleanName.includes('commerce')) {
    return '🛒';
  }
  
  // Hotels/Travel
  if (cleanName.includes('hotel') || cleanName.includes('travel') || cleanName.includes('airline') ||
      cleanName.includes('resort') || cleanName.includes('vacation')) {
    return '🏨';
  }
  
  // Automotive
  if (cleanName.includes('auto') || cleanName.includes('car') || cleanName.includes('motor') ||
      cleanName.includes('vehicle') || cleanName.includes('bmw') || cleanName.includes('tesla')) {
    return '🚗';
  }
  
  // Fitness/Health
  if (cleanName.includes('fit') || cleanName.includes('health') || cleanName.includes('gym') ||
      cleanName.includes('track') || cleanName.includes('wellness')) {
    return '⌚';
  }
  
  // Default business icon
  return '🏢';
}

/**
 * Process brand info and extract logo details
 */
export function processBrandInfo(brandName: string): BrandInfo {
  const cleanName = cleanBrandName(brandName);
  const domain = extractDomainFromBrand(brandName);
  const logoUrl = domain ? getLogoUrl(domain) : undefined;
  const fallbackIcon = getFallbackIcon(brandName);
  
  return {
    name: brandName,
    cleanName,
    domain: domain || undefined,
    logoUrl,
    fallbackIcon,
  };
}

/**
 * Batch process multiple brands and return with logo information
 */
export function processBrandLogos(brandNames: string[]): BrandInfo[] {
  return brandNames.map(processBrandInfo);
}

/**
 * Enhanced brand recognition - attempts to identify and standardize brand names
 */
export function recognizeBrand(brandName: string): BrandInfo {
  const cleanName = cleanBrandName(brandName);
  
  // Try to find standard brand name from mapping
  let recognizedName = brandName;
  for (const [key, domain] of Object.entries(BRAND_DOMAIN_MAP)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      // Use the key as a more standardized name
      recognizedName = key.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      break;
    }
  }
  
  return processBrandInfo(recognizedName);
}