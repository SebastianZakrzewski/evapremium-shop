/**
 * Bitrix24 REST API Client
 * 
 * Handles HTTP requests to Bitrix24 with retry logic, rate limiting, and error handling
 */

import { getBitrix24Config, getBitrix24ApiUrl } from './config';
import { 
  Bitrix24ApiResponse, 
  Bitrix24BatchResponse,
  Bitrix24Contact,
  Bitrix24Deal,
  Bitrix24Lead,
  Bitrix24Product,
  Bitrix24DealProduct
} from '@/lib/types/bitrix';

export interface Bitrix24ClientOptions {
  timeout?: number;
  retryOnRateLimit?: boolean;
}

export class Bitrix24Client {
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  private options: Bitrix24ClientOptions;

  constructor(options: Bitrix24ClientOptions = {}) {
    this.options = {
      timeout: 30000, // 30 seconds
      retryOnRateLimit: true,
      ...options,
    };
  }

  /**
   * Call a Bitrix REST method.
   * Always POST JSON — GET with JSON-stringified `filter`/`select` returns
   * HTTP 400 "Parameter 'filter' must be array".
   */
  async get<T = any>(method: string, params: Record<string, any> = {}): Promise<Bitrix24ApiResponse<T>> {
    return this.makeRequest('POST', method, params);
  }

  /**
   * Make a POST request to Bitrix24 API
   */
  async post<T = any>(method: string, data: Record<string, any> = {}): Promise<Bitrix24ApiResponse<T>> {
    return this.makeRequest('POST', method, data);
  }

  /**
   * Make a batch request to Bitrix24 API
   */
  async batch(commands: Record<string, { method: string; data?: any }>): Promise<Bitrix24BatchResponse> {
    const batchData = Object.entries(commands).reduce((acc, [key, command]) => {
      acc[key] = command.method;
      if (command.data) {
        acc[`${key}_data`] = command.data;
      }
      return acc;
    }, {} as Record<string, any>);

    const response = await this.post<Bitrix24BatchResponse>('batch', batchData);
    return response.result || { result: {}, error: response.error };
  }

  /**
   * Make HTTP request with retry logic and rate limiting
   */
  private async makeRequest<T = any>(
    _method: 'GET' | 'POST',
    apiMethod: string,
    data: Record<string, any> = {}
  ): Promise<Bitrix24ApiResponse<T>> {
    const bitrix24Config = getBitrix24Config();
    if (!bitrix24Config.enabled) {
      throw new Error('Bitrix24 integration is disabled');
    }

    const url = getBitrix24ApiUrl(apiMethod);
    
    // Rate limiting
    await this.enforceRateLimit();

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'EVA-Website-Bitrix24-Integration/1.0',
      },
      signal: AbortSignal.timeout(this.options.timeout!),
      body: JSON.stringify(data ?? {}),
    };

    return this.executeRequest<T>(url, requestOptions);
  }

  /**
   * Execute HTTP request with retry logic
   */
  private async executeRequest<T = any>(
    url: string,
    options: RequestInit,
    attempt = 1
  ): Promise<Bitrix24ApiResponse<T>> {
    try {
      console.log(`🔄 Bitrix24 API Request (attempt ${attempt}):`, {
        apiPath: new URL(url).pathname.replace(/\/rest\/\d+\/[^/]+/, '/rest/***'),
        method: options.method,
      });
      
      const response = await fetch(url, options);
      const data = (await response.json().catch(() => ({}))) as {
        result?: unknown
        error?: string | { error?: string; error_description?: string }
        error_description?: string
      }
      const errorDescription =
        data.error_description ||
        (typeof data.error === 'object' && data.error ? data.error.error_description : undefined)
      const errorCode =
        typeof data.error === 'string'
          ? data.error
          : data.error && typeof data.error === 'object'
            ? data.error.error
            : undefined

      if (errorCode || errorDescription) {
        throw new Error(`Bitrix24 API Error: ${errorDescription || errorCode}`)
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ Bitrix24 API Response:`, { 
        method: options.method, 
        success: true,
        hasResult: !!data.result,
        resultType: typeof data.result,
        result: data.result  // Pełna odpowiedź
      });
      return data;

    } catch (error) {
      console.error(`❌ Bitrix24 API Error (attempt ${attempt}):`, error);

      // Check if we should retry
      if (this.shouldRetry(error, attempt)) {
        const delay = this.calculateRetryDelay(attempt);
        console.log(`⏳ Retrying in ${delay}ms...`);
        
        await this.sleep(delay);
        return this.executeRequest<T>(url, options, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Check if request should be retried
   */
  private shouldRetry(error: any, attempt: number): boolean {
    const bitrix24Config = getBitrix24Config();
    if (attempt >= bitrix24Config.retry.maxAttempts) {
      return false;
    }

    // Retry on network errors
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      return true;
    }

    const message = String(error.message || '');
    if (message.includes('insufficient_scope')) {
      return false;
    }

    const httpStatusMatch = message.match(/HTTP (\d{3})/);
    const httpStatus = httpStatusMatch ? Number(httpStatusMatch[1]) : null;

    // 403 is the production WAF/gateway block we saw on paid sync.
    // 401 without insufficient_scope is often the same class of gateway rejection.
    if (httpStatus === 429 || httpStatus === 403 || httpStatus === 401) {
      return true;
    }

    if (httpStatus !== null && httpStatus >= 500) {
      return true;
    }

    if (
      message.includes('QUERY_LIMIT_EXCEEDED') ||
      message.includes('INTERNAL_SERVER_ERROR')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    const bitrix24Config = getBitrix24Config();
    const baseDelay = bitrix24Config.retry.baseDelay;
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
    return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
  }

  /**
   * Enforce rate limiting
   */
  private async enforceRateLimit(): Promise<void> {
    const bitrix24Config = getBitrix24Config();
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = bitrix24Config.rateLimit.timeWindow / bitrix24Config.rateLimit.maxRequests;

    if (timeSinceLastRequest < minInterval) {
      const delay = minInterval - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${delay}ms`);
      await this.sleep(delay);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test connection to Bitrix24
   */
  async testConnection(): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // Incoming webhooks often lack `user` scope; CRM list is the real shop check.
      const response = await this.post('crm.deal.list', {
        select: ['ID'],
        start: 0,
      });
      return {
        success: true,
        data: { dealsReturned: Array.isArray(response.result) ? response.result.length : 0 },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<any> {
    const response = await this.get('user.current');
    return response.result;
  }

  /**
   * Get CRM fields for a specific entity
   */
  async getCrmFields(entity: 'contact' | 'deal' | 'lead'): Promise<any> {
    const response = await this.get(`crm.${entity}.fields`);
    return response.result;
  }

  /**
   * Get CRM stages for deals
   */
  async getDealStages(): Promise<any> {
    const response = await this.get('crm.dealcategory.stage.list');
    return response.result;
  }

  /**
   * Get CRM sources for leads
   */
  async getLeadSources(): Promise<any> {
    const response = await this.get('crm.status.list', { 
      filter: { ENTITY_ID: 'SOURCE' } 
    });
    return response.result;
  }
}

// Export singleton instance
export const bitrix24Client = new Bitrix24Client();
