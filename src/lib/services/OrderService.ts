import { OrderRepository } from '../repositories/OrderRepository';
import { AccessoryService } from './AccessoryService';
import { MatService } from './MatService';
import { PricingService } from './PricingService';
import { Order, CreateOrderDTO, OrderItem, OrderStatus } from '../types/order-new';
import { getBitrix24Config } from '../integrations/bitrix24/config';
import { contactService } from '../integrations/bitrix24/services/ContactService';
import { dealService } from '../integrations/bitrix24/services/DealService';
import { mapOrderToContact } from '../integrations/bitrix24/mappers/orderToContact';
import { mapOrderToDeal, createDealProducts } from '../integrations/bitrix24/mappers/orderToDeal';
import { stageMappingService } from '../integrations/bitrix24/services/StageMappingService';

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
      const bitrix24Config = getBitrix24Config();
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
      // Dla mat używaj bezpośrednio unitPrice (już zawiera rabat i wysyłkę)
      if (item.productType === 'mat') {
        subtotal += item.unitPrice * item.quantity;
      } else {
        subtotal += item.subtotal;
      }
    }
    
    const shippingCost = 0; // Wysyłka już wliczona w unitPrice dla mat
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
      
      // Pobierz aktualne dane zamówienia PRZED aktualizacją
      const orderBeforeUpdate = await this.getOrderById(orderId);
      console.log('🔍 OrderService: Order before update:', {
        id: orderBeforeUpdate?.id,
        orderNumber: orderBeforeUpdate?.orderNumber,
        status: orderBeforeUpdate?.status,
        paymentStatus: orderBeforeUpdate?.paymentStatus
      });
      
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
      
      // Sprawdź czy aktualizacja się powiodła - pobierz zamówienie po aktualizacji
      const orderAfterUpdate = await this.getOrderById(orderId);
      console.log('🔍 OrderService: Order after update:', {
        id: orderAfterUpdate?.id,
        orderNumber: orderAfterUpdate?.orderNumber,
        status: orderAfterUpdate?.status,
        paymentStatus: orderAfterUpdate?.paymentStatus
      });
      
      if (orderAfterUpdate?.paymentStatus !== status) {
        console.error('❌ OrderService: BŁĄD - payment_status nie został zaktualizowany!', {
          expected: status,
          actual: orderAfterUpdate?.paymentStatus,
          updateData
        });
        throw new Error(`Failed to update payment_status: expected ${status}, got ${orderAfterUpdate?.paymentStatus}`);
      }
      
      if (status === 'paid' && orderAfterUpdate?.status !== 'confirmed') {
        console.error('❌ OrderService: BŁĄD - status nie został zaktualizowany na confirmed!', {
          expected: 'confirmed',
          actual: orderAfterUpdate?.status,
          updateData
        });
        throw new Error(`Failed to update status: expected confirmed, got ${orderAfterUpdate?.status}`);
      }

      // Synchronizuj zmiany z Bitrix24
      const bitrix24Config = getBitrix24Config();
      if (bitrix24Config.enabled && bitrix24Config.autoSyncOrders) {
        try {
          // Pobierz ŚWIEŻE dane zamówienia PO aktualizacji
          const order = await this.getOrderById(orderId);
          console.log('🔍 OrderService: Order after update (before sync):', {
            id: order?.id,
            orderNumber: order?.orderNumber,
            status: order?.status,
            paymentStatus: order?.paymentStatus,
            itemsCount: order?.items?.length || 0,
            hasItems: !!order?.items,
            itemsDetails: order?.items?.map(item => ({
              productType: item.productType,
              productName: item.productName,
              hasConfiguration: !!item.configuration,
              configurationKeys: item.configuration ? Object.keys(item.configuration) : []
            })) || []
          });
          
          if (order) {
            console.log('🔄 OrderService: Starting Bitrix24 sync for updated order...');
            await this.syncOrderToBitrix24(order);
            console.log('✅ OrderService: Payment status synced to Bitrix24');
          } else {
            console.error('❌ OrderService: Order not found after update, cannot sync');
          }
        } catch (error) {
          console.error('❌ OrderService: Failed to sync payment status to Bitrix24:', error);
        }
      } else {
        console.log('⚠️ OrderService: Bitrix24 sync disabled or autoSyncOrders is false');
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
      console.log('🔄 OrderService: Starting Bitrix24 sync for order:', {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total
      });

      console.log('✅ OrderService: Proceeding with sync for order:', {
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        status: order.status
      });

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
        console.log('📋 OrderService: Deal already exists, updating:', {
          dealId: existingDeal.id,
          currentStageId: existingDeal.stageId,
          orderNumber: order.orderNumber
        });
        
        // Zaktualizuj status deala na podstawie statusu zamówienia
        const { stageId: dealStage } = await stageMappingService.resolveStage({ type: 'order', orderStatus: order.status, paymentStatus: order.paymentStatus });
        
        console.log('🔄 OrderService: Updating existing deal stage:', {
          dealId: existingDeal.id,
          fromStage: existingDeal.stageId,
          toStage: dealStage,
          orderStatus: order.status,
          paymentStatus: order.paymentStatus
        });
        
        // Zaktualizuj istniejący deal (pola poza stage)
        const dealData = mapOrderToDeal(order, contactId, { stageId: dealStage });
        const updateDealResult = await dealService.updateDeal(existingDeal.id, dealData);
        if (!updateDealResult.success) {
          console.error('❌ OrderService: Failed to update deal fields:', updateDealResult.error);
        }
        
        // Aktualizuj stage deala (wymaga osobnego wywołania)
        const updateStageResult = await dealService.updateDealStage(existingDeal.id, {
          stageId: dealStage,
          comment: `Zamówienie zaktualizowane: ${order.status} (płatność: ${order.paymentStatus})`
        });

        if (!updateStageResult.success) {
          console.error('❌ OrderService: Failed to update deal stage:', {
            dealId: existingDeal.id,
            stageId: dealStage,
            error: updateStageResult.error,
            orderStatus: order.status,
            paymentStatus: order.paymentStatus
          });
          throw new Error(`Failed to update deal stage: ${updateStageResult.error}`);
        }

        console.log('✅ OrderService: Deal updated successfully:', {
          dealId: existingDeal.id,
          stageId: dealStage,
          orderStatus: order.status,
          paymentStatus: order.paymentStatus
        });
        return;
      }

      // 3. Utwórz nowy deal
      const { stageId: dealStage } = await stageMappingService.resolveStage({ type: 'order', orderStatus: order.status, paymentStatus: order.paymentStatus });
      const dealData = mapOrderToDeal(order, contactId, { stageId: dealStage });
      console.log('🎯 OrderService: Creating new deal with stage:', { 
        orderStatus: order.status, 
        paymentStatus: order.paymentStatus, 
        dealStage,
        orderNumber: order.orderNumber,
        total: order.total
      });
      
      // ✅ ZMIANA: Uproszczone wywołanie - STAGE_ID jest już w dealData
      const dealResult = await dealService.createDeal(dealData, {
        // Usuń stageId z options - jest już w dealData
        currencyId: 'PLN',
        contactId: contactId,
      });

      if (!dealResult.success) {
        throw new Error(`Failed to create deal: ${dealResult.error}`);
      }

      console.log('✅ OrderService: Deal created successfully with stage:', {
        dealId: dealResult.id,
        stageId: dealStage
      });

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
    console.log('🎯 OrderService: getDealStageFromOrderStatus called:', {
      orderStatus,
      paymentStatus
    });

    // Priorytet: status płatności > status zamówienia
    if (paymentStatus === 'paid') {
      console.log('✅ OrderService: Payment is paid, checking order status');
      // Dla opłaconych zamówień sprawdź status zamówienia
      switch (orderStatus) {
        case 'delivered':
          console.log('🎯 OrderService: Order delivered -> WON');
          return 'WON'; // Dostarczone - wygrana
        case 'cancelled':
          console.log('🎯 OrderService: Order cancelled -> LOSE');
          return 'LOSE'; // Anulowane - przegrana
        case 'pending':
        case 'confirmed':
        case 'processing':
        case 'shipped':
        default:
          console.log('🎯 OrderService: Order paid with status', orderStatus, '-> UC_DMBNNJ');
          return 'UC_DMBNNJ'; // Zamówienia ze strony opłacone (Przelewy24)
      }
    }
    
    if (paymentStatus === 'failed') {
      console.log('🎯 OrderService: Payment failed -> LOSE');
      return 'LOSE'; // Płatność nieudana - przegrana
    }

    if (paymentStatus === 'refunded') {
      console.log('🎯 OrderService: Payment refunded -> LOSE');
      return 'LOSE'; // Zwrot - przegrana
    }

    console.log('⚠️ OrderService: Payment not paid, checking order status only');
    // Na podstawie statusu zamówienia (dla nieopłaconych)
    switch (orderStatus) {
      case 'pending':
        console.log('🎯 OrderService: Order pending -> NEW');
        return 'NEW'; // Czeka na opłatę
      case 'confirmed':
        console.log('🎯 OrderService: Order confirmed (not paid) -> UC_DMBNNJ');
        return 'UC_DMBNNJ'; // Zamówienia ze strony opłacone
      case 'processing':
        console.log('🎯 OrderService: Order processing (not paid) -> UC_DMBNNJ');
        return 'UC_DMBNNJ'; // Zamówienia ze strony opłacone
      case 'shipped':
        console.log('🎯 OrderService: Order shipped (not paid) -> UC_DMBNNJ');
        return 'UC_DMBNNJ'; // Zamówienia ze strony opłacone
      case 'delivered':
        console.log('🎯 OrderService: Order delivered (not paid) -> WON');
        return 'WON'; // Dostarczone - wygrana
      case 'cancelled':
        console.log('🎯 OrderService: Order cancelled (not paid) -> LOSE');
        return 'LOSE'; // Anulowane - przegrana
      default:
        console.log('🎯 OrderService: Unknown order status', orderStatus, '-> NEW');
        return 'NEW';
    }
  }
}