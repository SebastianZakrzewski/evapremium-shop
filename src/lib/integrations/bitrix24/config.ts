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

export const bitrix24Config: Bitrix24Config = {
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

/**
 * Validate Bitrix24 configuration
 */
export function validateBitrix24Config(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!bitrix24Config.webhookUrl) {
    errors.push('BITRIX24_WEBHOOK_URL is required');
  }

  if (bitrix24Config.webhookUrl && !bitrix24Config.webhookUrl.includes('bitrix24.com') && !bitrix24Config.webhookUrl.includes('bitrix24.pl')) {
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
  if (!bitrix24Config.webhookUrl) {
    throw new Error('Bitrix24 webhook URL not configured');
  }
  
  return `${bitrix24Config.webhookUrl}${method}`;
}
