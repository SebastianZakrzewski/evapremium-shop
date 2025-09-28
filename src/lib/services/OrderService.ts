import { Product } from '../types/product';
import { Order, CustomerData, ShippingData, PaymentData, CompanyData, OrderStatus } from '../types/order';
import { supabaseAdmin, TABLES } from '../database/supabase';

export interface OrderCreationOptions {
  discountAmount?: number;
  company?: CompanyData;
}

export class OrderService {
  /**
   * Tworzy zamówienie z produktów w koszyku
   */
  static createOrder(
    cartProducts: Product[],
    customerData: CustomerData,
    shippingData: ShippingData,
    paymentData: PaymentData,
    options: OrderCreationOptions = {}
  ): Order {
    if (cartProducts.length === 0) {
      throw new Error('Cannot create order with empty cart');
    }

    // Dla uproszczenia, bierzemy pierwszy produkt z koszyka
    // W przyszłości można rozszerzyć o obsługę wielu produktów
    const product = cartProducts[0];
    
    const orderId = this.generateOrderId();
    const sessionId = this.getCurrentSessionId();
    
    // Oblicz ceny
    const subtotal = cartProducts.reduce((sum, p) => sum + p.pricing.totalPrice, 0);
    const shippingCost = shippingData.cost;
    const discountAmount = options.discountAmount || 0;
    const totalAmount = subtotal + shippingCost - discountAmount;

    const order: Order = {
      id: orderId,
      sessionId,
      product,
      customer: customerData,
      shipping: shippingData,
      payment: paymentData,
      company: options.company,
      pricing: {
        subtotal,
        shippingCost,
        discountAmount,
        totalAmount
      },
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return order;
  }

  /**
   * Zapisuje zamówienie do Supabase
   */
  static async saveOrderToSupabase(order: Order): Promise<Order> {
    try {
      const orderData = {
        id: order.id,
        session_id: order.sessionId,
        product: order.product,
        customer: order.customer,
        shipping: order.shipping,
        payment: order.payment,
        company: order.company,
        pricing: order.pricing,
        status: order.status,
        created_at: order.createdAt,
        updated_at: order.updatedAt
      };

      const { data, error } = await supabaseAdmin
        .from(TABLES.ORDERS)
        .insert([orderData])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save order to Supabase: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from Supabase');
      }

      // Konwertuj z powrotem na format Order
      const savedOrder: Order = {
        id: data.id,
        sessionId: data.session_id,
        product: data.product,
        customer: data.customer,
        shipping: data.shipping,
        payment: data.payment,
        company: data.company,
        pricing: data.pricing,
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      console.log('✅ Order saved to Supabase:', order.id);
      return savedOrder;
    } catch (error) {
      console.error('❌ Error saving order to Supabase:', error);
      throw error;
    }
  }

  /**
   * Pobiera zamówienie z Supabase
   */
  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.ORDERS)
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Order not found
          return null;
        }
        throw new Error(`Failed to retrieve order from Supabase: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      // Konwertuj na format Order
      const order: Order = {
        id: data.id,
        sessionId: data.session_id,
        product: data.product,
        customer: data.customer,
        shipping: data.shipping,
        payment: data.payment,
        company: data.company,
        pricing: data.pricing,
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      return order;
    } catch (error) {
      console.error('❌ Error retrieving order from Supabase:', error);
      throw error;
    }
  }

  /**
   * Aktualizuje status zamówienia
   */
  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.ORDERS)
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update order status: ${error.message}`);
      }

      if (!data) {
        throw new Error('Order not found');
      }

      // Konwertuj na format Order
      const order: Order = {
        id: data.id,
        sessionId: data.session_id,
        product: data.product,
        customer: data.customer,
        shipping: data.shipping,
        payment: data.payment,
        company: data.company,
        pricing: data.pricing,
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      console.log('✅ Order status updated:', orderId, status);
      return order;
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Pobiera zamówienia dla sesji
   */
  static async getOrdersBySession(sessionId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.ORDERS)
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to retrieve orders for session: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      // Konwertuj na format Order[]
      const orders: Order[] = data.map(item => ({
        id: item.id,
        sessionId: item.session_id,
        product: item.product,
        customer: item.customer,
        shipping: item.shipping,
        payment: item.payment,
        company: item.company,
        pricing: item.pricing,
        status: item.status,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      return orders;
    } catch (error) {
      console.error('❌ Error retrieving orders for session:', error);
      throw error;
    }
  }

  /**
   * Generuje unikalny ID zamówienia
   */
  private static generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `order-${timestamp}-${random}`;
  }

  /**
   * Pobiera aktualny session ID
   */
  private static getCurrentSessionId(): string {
    if (typeof window !== 'undefined') {
      // W przeglądarce - użyj HybridSessionManager
      const { HybridSessionManager } = require('../utils/hybrid-session-manager');
      return HybridSessionManager.getSessionId();
    }
    
    // Na serwerze - wygeneruj tymczasowy ID
    return `temp-session-${Date.now()}`;
  }
}
