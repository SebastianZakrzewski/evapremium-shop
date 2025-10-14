import { useState, useCallback } from 'react';
import { OrderV2 as Order, CreateOrderDTO, OrderStatusV2 as OrderStatus } from '@/lib/types';
import { debugLog } from '@/lib/config/features';

export interface UseOrderReturn {
  order: Order | null;
  isLoading: boolean;
  error: string | null;
  createOrder: (orderData: CreateOrderDTO) => Promise<Order>;
  saveOrder: (order: Order) => Promise<Order>;
  getOrder: (orderNumber: string) => Promise<Order | null>;
  getCustomerOrders: (email: string) => Promise<Order[]>;
  clearError: () => void;
}

/**
 * Nowy hook do zarządzania zamówieniami (V2)
 * 
 * Używa nowego API /api/orders i nowego formatu danych.
 * 
 * @example
 * ```tsx
 * const { createOrder, isLoading, error } = useOrder();
 * 
 * const handleCheckout = async (formData) => {
 *   const orderData = {
 *     customer: { name, email, phone },
 *     shippingAddress: { street, city, postalCode, country },
 *     paymentMethod: 'card',
 *     items: cart.items
 *   };
 *   
 *   const order = await createOrder(orderData);
 *   router.push(`/order-success?orderNumber=${order.orderNumber}`);
 * };
 * ```
 */
export function useOrder(): UseOrderReturn {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Wyczyść błąd
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Utwórz nowe zamówienie
   */
  const createOrder = useCallback(async (orderData: CreateOrderDTO): Promise<Order> => {
    setIsLoading(true);
    setError(null);
    debugLog('useOrder: Creating order', orderData);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Nie udało się utworzyć zamówienia');
      }

      if (!result.success || !result.data) {
        throw new Error('Nieprawidłowa odpowiedź serwera');
      }

      const newOrder = result.data;
      setOrder(newOrder);
      debugLog('useOrder: Order created successfully', newOrder);

      return newOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
      console.error('useOrder: Error creating order:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Pobierz zamówienie po numerze
   */
  const getOrder = useCallback(async (orderNumber: string): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);
    debugLog('useOrder: Getting order', orderNumber);

    try {
      const response = await fetch(`/api/orders/${orderNumber}`);
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          debugLog('useOrder: Order not found', orderNumber);
          return null;
        }
        throw new Error(result.error || 'Nie udało się pobrać zamówienia');
      }

      if (!result.success || !result.data) {
        throw new Error('Nieprawidłowa odpowiedź serwera');
      }

      const foundOrder = result.data;
      setOrder(foundOrder);
      debugLog('useOrder: Order retrieved successfully', foundOrder);

      return foundOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
      console.error('useOrder: Error getting order:', err);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Pobierz zamówienia klienta po emailu
   */
  const getCustomerOrders = useCallback(async (email: string): Promise<Order[]> => {
    setIsLoading(true);
    setError(null);
    debugLog('useOrder: Getting customer orders', email);

    try {
      const response = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Nie udało się pobrać zamówień');
      }

      if (!result.success) {
        throw new Error('Nieprawidłowa odpowiedź serwera');
      }

      const orders = result.data || [];
      debugLog('useOrder: Customer orders retrieved', orders);

      return orders;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
      console.error('useOrder: Error getting customer orders:', err);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Zapisz zamówienie (alias dla createOrder)
  const saveOrder = useCallback(async (order: Order): Promise<Order> => {
    // W nowym systemie zamówienie jest już zapisane przez createOrder
    // Ta funkcja jest tylko dla kompatybilności ze starym kodem
    console.log('✅ Order already saved in createOrder:', order.id);
    return order;
  }, []);

  return {
    order,
    isLoading,
    error,
    createOrder,
    saveOrder,
    getOrder,
    getCustomerOrders,
    clearError,
  };
}

/**
 * Hook do aktualizacji statusu zamówienia (Admin)
 */
export function useOrderStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(async (
    orderNumber: string,
    status: OrderStatus,
    trackingNumber?: string
  ): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, trackingNumber }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Nie udało się zaktualizować statusu');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
      console.error('useOrderStatus: Error updating status:', err);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateStatus, isLoading, error };
}

