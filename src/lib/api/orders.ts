/**
 * Orders API Service
 * 
 * Centralized API calls for order-related endpoints
 */

import { apiGet, apiPost, apiPut, ApiError } from './client';
import { Order, CreateOrderDTO, OrderStatus } from '@/lib/types/order-new';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a new order
 */
export async function createOrder(orderData: CreateOrderDTO): Promise<Order> {
  try {
    const response = await apiPost<ApiResponse<Order>>('/api/orders', orderData);
    
    if (!response.success || !response.data) {
      throw new ApiError(
        response.error || 'Nie udało się utworzyć zamówienia',
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
 * Get order by order number
 */
export async function getOrder(orderNumber: string): Promise<Order | null> {
  try {
    const response = await apiGet<ApiResponse<Order>>(`/api/orders/${orderNumber}`);
    
    if (!response.success) {
      if (response.error?.includes('not found') || response.error?.includes('404')) {
        return null;
      }
      throw new ApiError(
        response.error || 'Nie udało się pobrać zamówienia',
        404,
        response
      );
    }
    
    return response.data || null;
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle 404 as null, not an error
      if (error.status === 404) {
        return null;
      }
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
 * Get customer orders by email
 */
export async function getCustomerOrders(email: string): Promise<Order[]> {
  try {
    const response = await apiGet<ApiResponse<Order[]>>(
      `/api/orders?email=${encodeURIComponent(email)}`
    );
    
    if (!response.success) {
      throw new ApiError(
        response.error || 'Nie udało się pobrać zamówień',
        400,
        response
      );
    }
    
    return response.data || [];
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
 * Update order status (Admin)
 */
export async function updateOrderStatus(
  orderNumber: string,
  status: OrderStatus
): Promise<Order> {
  try {
    const response = await apiPut<ApiResponse<Order>>(
      `/api/orders/${orderNumber}`,
      { status }
    );
    
    if (!response.success || !response.data) {
      throw new ApiError(
        response.error || 'Nie udało się zaktualizować statusu zamówienia',
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
 * Orders API object with all methods
 */
export const ordersApi = {
  createOrder,
  getOrder,
  getCustomerOrders,
  updateOrderStatus,
};

