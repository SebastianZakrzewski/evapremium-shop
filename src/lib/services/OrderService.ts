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
    // 1. Walidacja pozycji
    await this.validateOrderItems(data.items);
    
    // 2. Oblicz ceny
    const pricing = await this.calculateOrderPricing(data.items);
    
    // 3. Generuj numer zamówienia
    const orderNumber = await this.generateOrderNumber();
    
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
    
    // 5. Zapisz zamówienie
    const order = await this.repository.create(orderData);
    
    // 6. Zaktualizuj stan magazynowy (dla akcesoriów)
    await this.updateInventory(data.items);

    return order;
  }

  /**
   * Pobierz zamówienie po numerze
   */
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return await this.repository.findByOrderNumber(orderNumber);
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
        // Dla dywaników: waliduj konfigurację
        const mat = await this.matService.findMatForCar(item.configuration.carDetails);
        
        if (!mat) {
          throw new Error('Mat not found for this car');
        }
        
        this.matService.validateConfiguration(mat, item.configuration);
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
    const tax = PricingService.calculateTax(subtotal + shippingCost);
    const discount = 0; // TODO: Kody rabatowe
    const total = subtotal + shippingCost + tax - discount;
    
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