import { useState, useCallback } from 'react';
import { CartItem } from '../lib/types/cart';
import { Order, CustomerData, ShippingData, PaymentData, CompanyData } from '../lib/types/order';
import { CreateOrderDTO } from '../lib/types';
import { OrderService } from '../lib/services/OrderService';

export interface UseOrderReturn {
  isLoading: boolean;
  error: string | null;
  order: Order | null;
  createOrder: (
    cartProducts: CartItem[],
    customerData: CustomerData,
    shippingData: ShippingData,
    paymentData: PaymentData
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
    cartProducts: CartItem[],
    customerData: CustomerData,
    shippingData: ShippingData,
    paymentData: PaymentData,
    options: any = {}
  ): Promise<Order> => {
    setIsLoading(true);
    setError(null);

    try {
      const orderService = new OrderService();
      
      // Konwertuj cartProducts na CreateOrderItemDTO[]
      const orderItems = cartProducts.map(product => ({
        quantity: product.quantity || 1,
        unitPrice: product.pricing?.totalPrice || 0,
        subtotal: (product.pricing?.totalPrice || 0) * (product.quantity || 1),
        productType: 'mat' as const, // Domyślnie mat, można rozszerzyć logikę
        productId: product.id,
        productName: product.name,
        productSku: product.id, // Używamy ID jako SKU
        productImage: product.image,
        configuration: product.configuration || {}
      }));

      const orderData: CreateOrderDTO = {
        customer: {
          name: `${customerData.firstName} ${customerData.lastName}`,
          email: customerData.email,
          phone: customerData.phone,
          company: undefined
        },
        shippingAddress: {
          street: customerData.address,
          city: customerData.city,
          postalCode: customerData.postalCode,
          country: customerData.country
        },
        billingAddress: {
          street: customerData.address,
          city: customerData.city,
          postalCode: customerData.postalCode,
          country: customerData.country
        },
        paymentMethod: paymentData.methodName,
        notes: options.notes || '',
        items: orderItems
      };

      const newOrder = await orderService.createOrder(orderData);

      // Mapuj nowy Order na stary typ dla kompatybilności
      const mappedOrder: Order = {
        id: newOrder.id,
        sessionId: '', // Stary typ wymaga sessionId
        products: cartProducts.map(item => ({
          id: item.id,
          sessionId: '',
          name: item.name,
          image: item.image,
          configuration: item.configuration,
          pricing: item.pricing,
          carDetails: item.carDetails,
          status: 'cached' as const,
          createdAt: new Date()
        })),
        customer: {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          city: customerData.city,
          postalCode: customerData.postalCode,
          country: customerData.country
        },
        shipping: {
          method: paymentData.method,
          methodName: paymentData.methodName,
          cost: newOrder.shippingCost,
          estimatedDelivery: '3-5 dni roboczych'
        },
        payment: {
          method: paymentData.method,
          methodName: paymentData.methodName
        },
        pricing: {
          subtotal: newOrder.subtotal,
          shippingCost: newOrder.shippingCost,
          discountAmount: newOrder.discount,
          totalAmount: newOrder.total
        },
        status: newOrder.status as any,
        createdAt: newOrder.createdAt,
        updatedAt: newOrder.updatedAt
      };

      setOrder(mappedOrder);
      console.log('✅ Order created:', newOrder.id);
      return mappedOrder;
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
      const orderService = new OrderService();
      // Zamówienie jest już zapisane w createOrder, więc zwracamy je
      console.log('✅ Order already saved to Supabase:', order.id);
      return order;
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
      const orderService = new OrderService();
      const retrievedOrder = await orderService.getOrderByNumber(orderId);
      if (retrievedOrder) {
        // Mapuj nowy Order na stary typ
        const mappedOrder: Order = {
          id: retrievedOrder.id,
          sessionId: '',
          products: [], // TODO: Mapuj produkty z order_items
          customer: {
            firstName: retrievedOrder.customer.name.split(' ')[0] || '',
            lastName: retrievedOrder.customer.name.split(' ').slice(1).join(' ') || '',
            email: retrievedOrder.customer.email,
            phone: retrievedOrder.customer.phone,
            address: retrievedOrder.shippingAddress.street,
            city: retrievedOrder.shippingAddress.city,
            postalCode: retrievedOrder.shippingAddress.postalCode,
            country: retrievedOrder.shippingAddress.country
          },
          shipping: {
            method: retrievedOrder.paymentMethod || 'unknown',
            methodName: retrievedOrder.paymentMethod || 'Unknown',
            cost: retrievedOrder.shippingCost,
            estimatedDelivery: '3-5 dni roboczych'
          },
          payment: {
            method: retrievedOrder.paymentMethod || 'unknown',
            methodName: retrievedOrder.paymentMethod || 'Unknown'
          },
          pricing: {
            subtotal: retrievedOrder.subtotal,
            shippingCost: retrievedOrder.shippingCost,
            discountAmount: retrievedOrder.discount,
            totalAmount: retrievedOrder.total
          },
          status: retrievedOrder.status as any,
          createdAt: retrievedOrder.createdAt,
          updatedAt: retrievedOrder.updatedAt
        };
        setOrder(mappedOrder);
        return mappedOrder;
      }
      return null;
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
      const orderService = new OrderService();
      const updatedOrder = await orderService.updateOrderStatus(orderId, status);
      
      // Mapuj nowy Order na stary typ
      const mappedOrder: Order = {
        id: updatedOrder.id,
        sessionId: '',
        products: [], // TODO: Mapuj produkty z order_items
        customer: {
          firstName: updatedOrder.customer.name.split(' ')[0] || '',
          lastName: updatedOrder.customer.name.split(' ').slice(1).join(' ') || '',
          email: updatedOrder.customer.email,
          phone: updatedOrder.customer.phone,
          address: updatedOrder.shippingAddress.street,
          city: updatedOrder.shippingAddress.city,
          postalCode: updatedOrder.shippingAddress.postalCode,
          country: updatedOrder.shippingAddress.country
        },
        shipping: {
          method: updatedOrder.paymentMethod || 'unknown',
          methodName: updatedOrder.paymentMethod || 'Unknown',
          cost: updatedOrder.shippingCost,
          estimatedDelivery: '3-5 dni roboczych'
        },
        payment: {
          method: updatedOrder.paymentMethod || 'unknown',
          methodName: updatedOrder.paymentMethod || 'Unknown'
        },
        pricing: {
          subtotal: updatedOrder.subtotal,
          shippingCost: updatedOrder.shippingCost,
          discountAmount: updatedOrder.discount,
          totalAmount: updatedOrder.total
        },
        status: updatedOrder.status as any,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt
      };
      
      setOrder(mappedOrder);
      console.log('✅ Order status updated:', orderId, status);
      return mappedOrder;
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
