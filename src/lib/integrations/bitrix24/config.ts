/**
 * Bitrix24 Integration Configuration
 * 
 * Centralized configuration for Bitrix24 API integration
 */

export interface Bitrix24Config {
  webhookUrl: string;
  enabled: boolean;
  autoSyncOrders: boolean;
  autoSyncLeads: boolean;
  rateLimit: {
    maxRequests: number;
    timeWindow: number; // in milliseconds
  };
  retry: {
    maxAttempts: number;
    baseDelay: number; // in milliseconds
  };
}

export function getBitrix24Config(): Bitrix24Config {
  return {
    webhookUrl: process.env.BITRIX24_WEBHOOK_URL || '',
    enabled: process.env.BITRIX24_WEBHOOK_ENABLED === 'true',
    autoSyncOrders: process.env.BITRIX24_AUTO_SYNC_ORDERS === 'true',
    autoSyncLeads: process.env.BITRIX24_AUTO_SYNC_LEADS === 'true',
    rateLimit: {
      maxRequests: 2, // Max 2 requests per second for webhook
      timeWindow: 1000, // 1 second
    },
    retry: {
      maxAttempts: 3,
      baseDelay: 1000, // 1 second base delay
    },
  };
}

// Dla kompatybilności wstecznej
export const bitrix24Config = getBitrix24Config();

/**
 * Validate Bitrix24 configuration
 */
export function validateBitrix24Config(): { isValid: boolean; errors: string[] } {
  const config = getBitrix24Config();
  const errors: string[] = [];

  if (!config.webhookUrl) {
    errors.push('BITRIX24_WEBHOOK_URL is required');
  }

  if (config.webhookUrl && !config.webhookUrl.includes('bitrix24.com') && !config.webhookUrl.includes('bitrix24.pl')) {
    errors.push('BITRIX24_WEBHOOK_URL must be a valid Bitrix24 webhook URL');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get Bitrix24 API endpoint URL
 */
export function getBitrix24ApiUrl(method: string): string {
  const config = getBitrix24Config();
  if (!config.webhookUrl) {
    throw new Error('Bitrix24 webhook URL not configured');
  }
  
  return `${config.webhookUrl}${method}`;
}
