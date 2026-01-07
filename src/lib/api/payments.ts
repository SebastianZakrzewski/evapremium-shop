/**
 * Payments API Service
 * 
 * Centralized API calls for payment-related endpoints
 */

import { apiPost, ApiError } from './client';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface P24PaymentResponse {
  paymentUrl: string;
  token: string;
}

/**
 * Register P24 payment
 */
export async function registerP24Payment(orderId: string): Promise<P24PaymentResponse> {
  try {
    const response = await apiPost<ApiResponse<P24PaymentResponse>>(
      '/api/payments/p24/register',
      { orderId }
    );
    
    if (!response.success || !response.data) {
      throw new ApiError(
        response.error || 'Błąd rejestracji płatności',
        400,
        response
      );
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Nieznany błąd',
      500,
      error
    );
  }
}

/**
 * Payments API object with all methods
 */
export const paymentsApi = {
  registerP24Payment,
};

