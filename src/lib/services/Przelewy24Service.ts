import crypto from 'crypto';
import { P24_CONFIG } from '@/lib/config/przelewy24';
import {
  P24TransactionRequest,
  P24TransactionResponse,
  P24VerifyRequest,
  P24VerifyResponse,
  P24StatusResponse,
  PaymentStatus
} from '@/lib/types/przelewy24';

export class Przelewy24Service {
  private baseUrl: string;
  private merchantId: number;
  private posId: number;
  private apiKey: string;
  private crcKey: string;

  constructor() {
    this.baseUrl = P24_CONFIG.baseUrl;
    this.merchantId = P24_CONFIG.merchantId;
    this.posId = P24_CONFIG.posId;
    this.apiKey = P24_CONFIG.apiKey;
    this.crcKey = P24_CONFIG.crcKey;
    
    console.log('🔧 P24 Service initialized:', {
      baseUrl: this.baseUrl,
      merchantId: this.merchantId,
      posId: this.posId,
      apiKey: this.apiKey ? '***' : 'MISSING',
      crcKey: this.crcKey ? '***' : 'MISSING'
    });
  }

  /**
   * Generuje podpis CRC dla danych
   */
  private generateSign(data: Record<string, any>): string {
    const sortedKeys = Object.keys(data).sort();
    const dataString = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('&');
    
    return crypto
      .createHash('sha384')
      .update(dataString + this.crcKey)
      .digest('hex');
  }

  /**
   * Rejestruje transakcję w Przelewy24
   */
  async registerTransaction(params: {
    sessionId: string;
    amount: number; // w groszach
    currency: string;
    description: string;
    email: string;
    urlReturn: string;
    urlStatus: string;
  }): Promise<{ token: string; sessionId: string }> {
    const requestData: P24TransactionRequest = {
      merchantId: this.merchantId,
      posId: this.posId,
      sessionId: params.sessionId,
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      email: params.email,
      country: 'PL',
      language: 'pl',
      urlReturn: params.urlReturn,
      urlStatus: params.urlStatus,
      timeLimit: 15, // 15 minut
      channel: 16, // wszystkie kanały
      waitForResult: true,
      regulationAccept: true,
      mobileLib: false,
      sig: '' // będzie ustawiony po wygenerowaniu
    };

    // Generuj podpis
    const { sig, ...dataForSign } = requestData;
    requestData.sig = this.generateSign(dataForSign);

    console.log('🔄 P24: Registering transaction:', {
      sessionId: params.sessionId,
      amount: params.amount,
      merchantId: this.merchantId,
      posId: this.posId,
      apiKey: this.apiKey ? '***' : 'MISSING',
      crcKey: this.crcKey ? '***' : 'MISSING'
    });

    console.log('🔧 P24: Auth header:', {
      merchantId: this.merchantId,
      apiKey: this.apiKey ? '***' : 'MISSING',
      authString: `${this.merchantId}:${this.apiKey}`,
      base64Auth: Buffer.from(`${this.merchantId}:${this.apiKey}`).toString('base64')
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/transaction/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.merchantId}:${this.apiKey}`).toString('base64')}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ P24: Register transaction failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`P24 register failed: ${response.status} ${errorText}`);
      }

      const result: P24TransactionResponse = await response.json();
      
      if (result.responseCode !== '0') {
        throw new Error(`P24 register error: ${result.responseCode}`);
      }

      console.log('✅ P24: Transaction registered successfully:', result.data.token);
      
      return {
        token: result.data.token,
        sessionId: params.sessionId
      };
    } catch (error) {
      console.error('❌ P24: Register transaction error:', error);
      throw error;
    }
  }

  /**
   * Weryfikuje transakcję po callback
   */
  async verifyTransaction(params: {
    sessionId: string;
    orderId: number;
    amount: number;
    currency: string;
  }): Promise<{ status: string; error?: string }> {
    const requestData: P24VerifyRequest = {
      merchantId: this.merchantId,
      posId: this.posId,
      sessionId: params.sessionId,
      amount: params.amount,
      currency: params.currency,
      orderId: params.orderId,
      sig: '' // będzie ustawiony po wygenerowaniu
    };

    // Generuj podpis
    const { sig, ...dataForSign } = requestData;
    requestData.sig = this.generateSign(dataForSign);

    console.log('🔄 P24: Verifying transaction:', {
      sessionId: params.sessionId,
      orderId: params.orderId,
      amount: params.amount
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/transaction/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.merchantId}:${this.apiKey}`).toString('base64')}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ P24: Verify transaction failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`P24 verify failed: ${response.status} ${errorText}`);
      }

      const result: P24VerifyResponse = await response.json();
      
      console.log('✅ P24: Transaction verified:', result.data);
      
      return {
        status: result.data.status,
        error: result.data.error
      };
    } catch (error) {
      console.error('❌ P24: Verify transaction error:', error);
      throw error;
    }
  }

  /**
   * Sprawdza status transakcji
   */
  async getTransactionStatus(sessionId: string): Promise<PaymentStatus> {
    console.log('🔄 P24: Getting transaction status:', sessionId);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/transaction/by/sessionId/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.merchantId}:${this.apiKey}`).toString('base64')}`
        }
      });

      if (!response.ok) {
        console.error('❌ P24: Get status failed:', response.status);
        return 'failed';
      }

      const result: P24StatusResponse = await response.json();
      
      if (result.responseCode !== '0') {
        console.error('❌ P24: Status check error:', result.responseCode);
        return 'failed';
      }

      console.log('✅ P24: Transaction status:', result.data.status);
      
      // Mapuj statusy P24 na nasze statusy
      switch (result.data.status) {
        case 'PENDING':
          return 'pending';
        case 'SUCCESS':
          return 'paid';
        case 'ERROR':
        case 'CANCELLED':
          return 'failed';
        default:
          return 'pending';
      }
    } catch (error) {
      console.error('❌ P24: Get status error:', error);
      return 'failed';
    }
  }

  /**
   * Buduje URL do płatności
   */
  buildPaymentUrl(token: string): string {
    return `${this.baseUrl}/trnRequest/${token}`;
  }

  /**
   * Waliduje podpis CRC z callback
   */
  validateCallbackSignature(data: Record<string, any>): boolean {
    const receivedSig = data.sig;
    const { sig, ...dataForSign } = data;
    const expectedSig = this.generateSign(dataForSign);
    
    return receivedSig === expectedSig;
  }
}
