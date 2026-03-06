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
 * API zwraca: { success, paymentUrl, token } – nie { success, data: {...} }
 */
export async function registerP24Payment(orderId: string): Promise<P24PaymentResponse> {
  try {
    const response = await apiPost<
      ApiResponse<P24PaymentResponse> & { paymentUrl?: string; token?: string }
    >('/api/payments/p24/register', { orderId });

    if (!response.success) {
      throw new ApiError(
        response.error || 'Błąd rejestracji płatności',
        400,
        response
      );
    }

    // API zwraca paymentUrl i token na top-level (nie w data)
    const paymentUrl = response.data?.paymentUrl ?? response.paymentUrl ?? '';
    const token = response.data?.token ?? response.token ?? '';
    if (!paymentUrl || !token) {
      throw new ApiError('Brak URL płatności w odpowiedzi', 500, response);
    }
    return { paymentUrl, token };
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

