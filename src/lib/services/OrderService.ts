import { OrderRepository } from '../repositories/OrderRepository';
import { AccessoryService } from './AccessoryService';
import { MatService } from './MatService';
import { PricingService } from './PricingService';
import { Order, CreateOrderDTO, OrderItem, OrderStatus } from '../types/order-new';
import { bitrix24Config } from '../integrations/bitrix24/config';
import { contactService } from '../integrations/bitrix24/services/ContactService';
import { dealService } from '../integrations/bitrix24/services/DealService';
import { mapOrderToContact } from '../integrations/bitrix24/mappers/orderToContact';
import { mapOrderToDeal, createDealProducts } from '../integrations/bitrix24/mappers/orderToDeal';

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

      // 8. Synchronizuj z Bitrix24 (jeśli włączone)
      if (bitrix24Config.enabled && bitrix24Config.autoSyncOrders) {
        console.log('🛒 OrderService: Syncing order to Bitrix24...');
        try {
          await this.syncOrderToBitrix24(order);
          console.log('✅ OrderService: Order synced to Bitrix24 successfully');
        } catch (error) {
          console.error('❌ OrderService: Failed to sync order to Bitrix24:', error);
          // Nie blokujemy procesu zamówienia w przypadku błędu integracji
        }
      }

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
    const result = await this.repository.updateStatus(orderId, status, trackingNumber);
    if (!result) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    return result;
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

  /**
   * Pobierz zamówienie po sessionId (orderNumber)
   */
  async getOrderBySessionId(sessionId: string): Promise<Order | null> {
    try {
      console.log('🛒 OrderService: getOrderBySessionId', sessionId);
      return await this.repository.findBySessionId(sessionId);
    } catch (error) {
      console.error('❌ OrderService: Błąd pobierania zamówienia po sessionId', error);
      return null;
    }
  }

  /**
   * Zaktualizuj dane P24 w zamówieniu
   */
  async updateOrderP24Data(orderId: string, p24Data: {
    p24SessionId?: string;
    p24Token?: string;
  }): Promise<void> {
    try {
      console.log('🛒 OrderService: updateOrderP24Data', { orderId, p24Data });
      await this.repository.updateP24Data(orderId, p24Data);
    } catch (error) {
      console.error('❌ OrderService: Błąd aktualizacji danych P24', error);
      throw error;
    }
  }

  /**
   * Zaktualizuj status płatności
   */
  async updatePaymentStatus(orderId: string, status: 'pending' | 'paid' | 'failed' | 'refunded', p24Data?: {
    p24OrderId?: string; // Zmienione z number na string - P24 zwraca bardzo długie ID
    p24MethodId?: number;
    error?: string;
  }): Promise<void> {
    try {
      console.log('🛒 OrderService: updatePaymentStatus', { orderId, status, p24Data });
      
      const updateData: any = {
        payment_status: status,
        updated_at: new Date().toISOString()
      };

      if (p24Data) {
        if (p24Data.p24OrderId) updateData.p24_order_id = p24Data.p24OrderId;
        if (p24Data.p24MethodId) updateData.p24_method_id = p24Data.p24MethodId;
        if (p24Data.error) updateData.notes = p24Data.error;
      }

      // Jeśli płatność została opłacona, zaktualizuj status zamówienia w tym samym wywołaniu
      if (status === 'paid') {
        updateData.status = 'confirmed';
        console.log('🛒 OrderService: Setting order status to confirmed');
      }

      await this.repository.update(orderId, updateData);
      console.log('🛒 OrderService: Order updated successfully', updateData);

      // Synchronizuj zmiany z Bitrix24
      if (bitrix24Config.enabled && bitrix24Config.autoSyncOrders) {
        try {
          const order = await this.getOrderById(orderId);
          if (order) {
            await this.syncOrderToBitrix24(order);
            console.log('✅ OrderService: Payment status synced to Bitrix24');
          }
        } catch (error) {
          console.error('❌ OrderService: Failed to sync payment status to Bitrix24:', error);
        }
      }
    } catch (error) {
      console.error('❌ OrderService: Błąd aktualizacji statusu płatności', error);
      throw error;
    }
  }

  /**
   * Synchronizuj zamówienie z Bitrix24
   */
  private async syncOrderToBitrix24(order: Order): Promise<void> {
    try {
      console.log('🔄 OrderService: Starting Bitrix24 sync for order:', order.orderNumber);

      // Sprawdź czy zamówienie jest opłacone - synchronizuj tylko opłacone zamówienia
      if (order.paymentStatus !== 'paid') {
        console.log('⏭️ OrderService: Skipping sync - order not paid:', {
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus
        });
        return;
      }

      console.log('✅ OrderService: Order is paid, proceeding with sync');

      // 1. Próbuj utworzyć kontakt (opcjonalnie)
      let contactId: string | undefined;
      try {
        const contactData = mapOrderToContact(order, {
          sourceId: 'WEB',
          sourceDescription: 'EVA Website',
          utmSource: (order as any).utmSource,
          utmMedium: (order as any).utmMedium,
          utmCampaign: (order as any).utmCampaign,
        });

        const contactResult = await contactService.findOrCreateContact(contactData, {
          sourceId: 'WEB',
          sourceDescription: 'EVA Website',
          utmSource: (order as any).utmSource,
          utmMedium: (order as any).utmMedium,
          utmCampaign: (order as any).utmCampaign,
        });

        if (contactResult.id) {
          contactId = contactResult.id;
          console.log('✅ OrderService: Contact processed:', { 
            id: contactResult.id, 
            created: contactResult.created 
          });
        } else {
          console.log('⚠️ OrderService: Contact creation failed, proceeding without contact:', contactResult.error);
        }
      } catch (contactError) {
        console.log('⚠️ OrderService: Contact creation failed, proceeding without contact:', contactError);
      }

      // 2. Sprawdź czy deal już istnieje
      const existingDeal = await dealService.findByOrderNumber(order.orderNumber);
      if (existingDeal) {
        console.log('📋 OrderService: Deal already exists, updating:', existingDeal.id);
        
        // Zaktualizuj istniejący deal
        const dealData = mapOrderToDeal(order, contactId);
        await dealService.updateDeal(existingDeal.id, dealData);
        
        // Zaktualizuj status deala na podstawie statusu zamówienia
        const dealStage = this.getDealStageFromOrderStatus(order.status, order.paymentStatus);
        await dealService.updateDealStage(existingDeal.id, {
          stageId: dealStage,
          comment: `Zamówienie zaktualizowane: ${order.status} (płatność: ${order.paymentStatus})`
        });

        console.log('✅ OrderService: Deal updated successfully');
        return;
      }

      // 3. Utwórz nowy deal
      const dealData = mapOrderToDeal(order, contactId);
      const dealResult = await dealService.createDeal(dealData, {
        stageId: this.getDealStageFromOrderStatus(order.status, order.paymentStatus),
        currencyId: 'PLN',
        contactId: contactId,
      });

      if (!dealResult.success) {
        throw new Error(`Failed to create deal: ${dealResult.error}`);
      }

      console.log('✅ OrderService: Deal created successfully:', dealResult.id);

      // 5. Dodaj produkty do deala
      const products = createDealProducts(order);
      if (products.length > 0) {
        // Convert products to Bitrix24DealProduct format
        const dealProducts = products.map(product => ({
          PRODUCT_ID: product.PRODUCT_NAME, // Use product name as ID for now
          QUANTITY: product.QUANTITY,
          PRICE: product.PRICE,
        }));
        
        const productResult = await dealService.addProductsToDeal(dealResult.id, dealProducts);
        if (!productResult.success) {
          console.warn('⚠️ OrderService: Failed to add products to deal:', productResult.error);
        } else {
          console.log('✅ OrderService: Products added to deal successfully');
        }
      }

      console.log('✅ OrderService: Order synced to Bitrix24 successfully:', {
        orderNumber: order.orderNumber,
        contactId: contactId || 'none',
        dealId: dealResult.id,
        productsCount: products.length
      });

    } catch (error) {
      console.error('❌ OrderService: Failed to sync order to Bitrix24:', error);
      throw error;
    }
  }

  /**
   * Pobierz etap deala na podstawie statusu zamówienia i płatności
   */
  private getDealStageFromOrderStatus(orderStatus: string, paymentStatus: string): string {
    // Priorytet: status płatności > status zamówienia
    if (paymentStatus === 'paid') {
      return 'UC_DMBNNJ'; // Zamówienia ze strony opłacone (Przelewy24)
    }
    
    if (paymentStatus === 'failed') {
      return 'LOSE'; // Płatność nieudana - przegrana
    }

    if (paymentStatus === 'refunded') {
      return 'LOSE'; // Zwrot - przegrana
    }

    // Na podstawie statusu zamówienia
    switch (orderStatus) {
      case 'pending':
        return 'NEW'; // Czeka na opłatę
      case 'confirmed':
        return 'UC_DMBNNJ'; // Zamówienia ze strony opłacone
      case 'processing':
        return 'UC_DMBNNJ'; // Zamówienia ze strony opłacone
      case 'shipped':
        return 'UC_DMBNNJ'; // Zamówienia ze strony opłacone
      case 'delivered':
        return 'WON'; // Dostarczone - wygrana
      case 'cancelled':
        return 'LOSE'; // Anulowane - przegrana
      default:
        return 'NEW';
    }
  }
}