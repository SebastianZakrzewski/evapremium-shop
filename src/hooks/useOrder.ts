import { useState, useCallback } from 'react';
import { Product } from '../types/product';
import { Order, CustomerData, ShippingData, PaymentData, CompanyData } from '../types/order';
import { OrderService, OrderCreationOptions } from '../lib/services/OrderService';

export interface UseOrderReturn {
  isLoading: boolean;
  error: string | null;
  order: Order | null;
  createOrder: (
    cartProducts: Product[],
    customerData: CustomerData,
    shippingData: ShippingData,
    paymentData: PaymentData,
    options?: OrderCreationOptions
  ) => Promise<Order>;
  saveOrder: (order: Order) => Promise<Order>;
  getOrder: (orderId: string) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<Order>;
  clearError: () => void;
}

export function useOrder(): UseOrderReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  // Wyczyść błąd
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Utwórz zamówienie
  const createOrder = useCallback(async (
    cartProducts: Product[],
    customerData: CustomerData,
    shippingData: ShippingData,
    paymentData: PaymentData,
    options: OrderCreationOptions = {}
  ): Promise<Order> => {
    setIsLoading(true);
    setError(null);

    try {
      const newOrder = OrderService.createOrder(
        cartProducts,
        customerData,
        shippingData,
        paymentData,
        options
      );

      setOrder(newOrder);
      console.log('✅ Order created:', newOrder.id);
      return newOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Zapisz zamówienie do Supabase
  const saveOrder = useCallback(async (order: Order): Promise<Order> => {
    setIsLoading(true);
    setError(null);

    try {
      const savedOrder = await OrderService.saveOrderToSupabase(order);
      setOrder(savedOrder);
      console.log('✅ Order saved to Supabase:', savedOrder.id);
      return savedOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Pobierz zamówienie
  const getOrder = useCallback(async (orderId: string): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const retrievedOrder = await OrderService.getOrder(orderId);
      if (retrievedOrder) {
        setOrder(retrievedOrder);
      }
      return retrievedOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retrieve order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Aktualizuj status zamówienia
  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']): Promise<Order> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedOrder = await OrderService.updateOrderStatus(orderId, status);
      setOrder(updatedOrder);
      console.log('✅ Order status updated:', orderId, status);
      return updatedOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    order,
    createOrder,
    saveOrder,
    getOrder,
    updateOrderStatus,
    clearError
  };
}
