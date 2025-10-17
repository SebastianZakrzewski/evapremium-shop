import { OrderRepository } from '../repositories/OrderRepository';
import { AccessoryService } from './AccessoryService';
import { MatService } from './MatService';
import { PricingService } from './PricingService';
import { Order, CreateOrderDTO, OrderItem, OrderStatus } from '../types/order-new';

export class OrderService {
  private repository: OrderRepository;
  private accessoryService: AccessoryService;
  private matService: MatService;
  private pricingService: PricingService;

  constructor() {
    this.repository = new OrderRepository();
    this.accessoryService = new AccessoryService();
    this.matService = new MatService();
    this.pricingService = new PricingService();
  }

  /**
   * Utwórz nowe zamówienie
   */
  async createOrder(data: CreateOrderDTO): Promise<Order> {
    console.log('🛒 OrderService: createOrder called with data:', data);
    
    try {
      // 1. Walidacja pozycji
      console.log('🛒 OrderService: Validating order items...');
      await this.validateOrderItems(data.items);
      
      // 2. Oblicz ceny
      console.log('🛒 OrderService: Calculating pricing...');
      const pricing = await this.calculateOrderPricing(data.items);
      console.log('🛒 OrderService: Pricing calculated:', pricing);
      
      // 3. Generuj numer zamówienia
      console.log('🛒 OrderService: Generating order number...');
      const orderNumber = await this.generateOrderNumber();
      console.log('🛒 OrderService: Order number generated:', orderNumber);
      
      // 4. Przygotuj dane do zapisu
      const orderData = {
        orderNumber,
        status: 'pending' as OrderStatus,
        paymentStatus: 'pending' as const,
        customer: data.customer,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        subtotal: pricing.subtotal,
        shippingCost: pricing.shippingCost,
        tax: pricing.tax,
        discount: pricing.discount,
        total: pricing.total,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        items: data.items
      };
      console.log('🛒 OrderService: Order data prepared:', orderData);
      
      // 5. Zapisz zamówienie (bez items)
      const { items: orderItems, ...orderDataWithoutItems } = orderData;
      
      // Mapuj camelCase na snake_case dla bazy danych
      const orderDataForDB = {
        order_number: orderDataWithoutItems.orderNumber,
        status: orderDataWithoutItems.status,
        payment_status: orderDataWithoutItems.paymentStatus,
        customer: orderDataWithoutItems.customer,
        shipping_address: orderDataWithoutItems.shippingAddress,
        billing_address: orderDataWithoutItems.billingAddress,
        subtotal: orderDataWithoutItems.subtotal,
        shipping_cost: orderDataWithoutItems.shippingCost,
        tax: orderDataWithoutItems.tax,
        discount: orderDataWithoutItems.discount,
        total: orderDataWithoutItems.total,
        payment_method: orderDataWithoutItems.paymentMethod,
        notes: orderDataWithoutItems.notes
      };
      
      console.log('🛒 OrderService: Saving order to database...');
      console.log('🛒 OrderService: Order data for DB:', orderDataForDB);
      const order = await this.repository.create(orderDataForDB);
      console.log('🛒 OrderService: Order saved successfully:', order);
      console.log('🛒 OrderService: Order ID type:', typeof order.id, 'value:', order.id);
      
      // 6. Zapisz pozycje zamówienia
      console.log('🛒 OrderService: Saving order items...');
      await this.saveOrderItems(order.id, orderItems);
      console.log('🛒 OrderService: Order items saved successfully');
      
      // 7. Zaktualizuj stan magazynowy (dla akcesoriów)
      console.log('🛒 OrderService: Updating inventory...');
      await this.updateInventory(data.items);
      console.log('🛒 OrderService: Inventory updated');

      return order;
    } catch (error) {
      console.error('❌ OrderService: Error in createOrder:', error);
      throw error;
    }
  }

  /**
   * Zapisz pozycje zamówienia
   */
  private async saveOrderItems(orderId: string, items: any[]): Promise<void> {
    console.log('🛒 OrderService: saveOrderItems called with items:', items);
    
    const orderItems = items.map(item => {
      console.log('🛒 OrderService: Processing item:', {
        productType: item.productType,
        productId: item.productId,
        productName: item.productName,
        configuration: item.configuration
      });
      
      return {
        order_id: orderId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.subtotal,
        product_type: item.productType,
        product_id: item.productId, // Używamy productId dla wszystkich typów produktów
        product_name: item.productName,
        product_sku: item.productSku,
        product_image: item.productImage,
        configuration: item.configuration
      };
    });
    
    console.log('🛒 OrderService: Order items to save:', orderItems);

    const { error } = await this.repository.supabase
      .from('order_items')
      .insert(orderItems);

    if (error) {
      throw new Error(`Error saving order items: ${error.message}`);
    }
  }

  /**
   * Pobierz zamówienie po numerze
   */
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return await this.repository.findByOrderNumber(orderNumber);
  }

  /**
   * Pobierz zamówienie po ID
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    return await this.repository.findById(orderId);
  }

  /**
   * Pobierz zamówienia klienta (po email)
   */
  async getCustomerOrders(email: string): Promise<Order[]> {
    return await this.repository.findByCustomerEmail(email);
  }

  /**
   * Pobierz zamówienia według statusu
   */
  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return await this.repository.findByStatus(status);
  }

  /**
   * Zaktualizuj status zamówienia
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string
  ): Promise<Order> {
    return await this.repository.updateStatus(orderId, status, trackingNumber);
  }

  /**
   * Zaktualizuj status płatności
   */
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  ): Promise<Order> {
    return await this.repository.updatePaymentStatus(orderId, paymentStatus);
  }

  /**
   * Zaktualizuj dane Przelewy24
   */
  async updateP24Data(
    orderId: string,
    p24Data: {
      p24SessionId?: string;
      p24OrderId?: number | null;
      p24TransactionId?: number | null;
    }
  ): Promise<Order> {
    return await this.repository.updateP24Data(orderId, p24Data);
  }

  /**
   * Znajdź zamówienie po sessionId P24
   */
  async getOrderBySessionId(sessionId: string): Promise<Order | null> {
    return await this.repository.findBySessionId(sessionId);
  }

  /**
   * Pobierz statystyki zamówień
   */
  async getOrderStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  }> {
    return await this.repository.getOrderStats();
  }

  /**
   * Waliduj pozycje zamówienia
   */
  private async validateOrderItems(items: any[]): Promise<void> {
    for (const item of items) {
      if (item.productType === 'accessory') {
        // Sprawdź dostępność akcesoriów
        const available = await this.accessoryService.checkAvailability(
          item.productId,
          item.quantity
        );
        
        if (!available) {
          throw new Error(`Product ${item.productName} is not available`);
        }
      } else if (item.productType === 'mat') {
        // Dla dywaników: pomiń walidację (wyłączone dla testów)
        console.log('🛒 OrderService: Skipping mat validation for item:', item);
        console.log('🛒 OrderService: Car details:', item.configuration.carDetails);
        console.log('✅ OrderService: Mat validation skipped - proceeding with order');
      }
    }
  }

  /**
   * Oblicz ceny zamówienia
   */
  private async calculateOrderPricing(items: any[]) {
    let subtotal = 0;
    
    for (const item of items) {
      subtotal += item.subtotal;
    }
    
    const shippingCost = PricingService.calculateShippingCost(subtotal);
    const tax = 0; // VAT wyłączony
    const discount = 0; // TODO: Kody rabatowe
    const total = subtotal + shippingCost - discount; // Bez VAT
    
    return { subtotal, shippingCost, tax, discount, total };
  }

  /**
   * Generuj unikalny numer zamówienia
   */
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.repository.countOrdersThisYear();
    const number = String(count + 1).padStart(6, '0');
    return `ORD-${year}-${number}`;
  }

  /**
   * Zaktualizuj stan magazynowy
   */
  private async updateInventory(items: any[]): Promise<void> {
    for (const item of items) {
      if (item.productType === 'accessory') {
        // Zmniejsz stockQuantity
        await this.accessoryService.decrementStock(item.productId, item.quantity);
      }
      // Dywaniki są produkowane na zamówienie - brak inventory
    }
  }
}