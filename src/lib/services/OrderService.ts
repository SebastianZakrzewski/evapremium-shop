import { OrderRepository } from '../repositories/OrderRepository';
import { AccessoryService } from './AccessoryService';
import { MatService } from './MatService';
import { PricingService } from './PricingService';
import { Order, CreateOrderDTO, OrderItem, OrderStatus } from '../types/order-new';
import { resolveBitrixPaymentSyncDecision } from '../integrations/bitrix24/bitrixPaymentSyncPolicy';
import { getBitrix24Config } from '../integrations/bitrix24/config';
import { contactService } from '../integrations/bitrix24/services/ContactService';
import { dealService } from '../integrations/bitrix24/services/DealService';
import { mapOrderToContact } from '../integrations/bitrix24/mappers/orderToContact';
import { mapOrderToDeal, mapOrderToDealProductRows } from '../integrations/bitrix24/mappers/orderToDeal';
import { stageMappingService } from '../integrations/bitrix24/services/StageMappingService';
import { convertAbandonedCartsOnPaid } from './AbandonedCartConversionService';
import { randomUUID } from 'crypto';
import 'server-only';
import { revalidateMatItemPrice } from '@/features/vehicle-catalog/server/matCartValidation';
import { MatConfigurationSchema } from '@/features/vehicle-catalog/model/matConfiguration';

type BitrixOrderSyncOptions = {
  createIfMissing?: boolean
  preferredDealId?: string
}

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
  async createOrder(data: CreateOrderDTO, maxRetries: number = 3): Promise<Order> {
    console.log('🛒 OrderService: createOrder called with data:', data);
    
    let lastError: Error | null = null;
    
    // Retry logic dla race condition przy generowaniu numeru zamówienia
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // 1. Walidacja pozycji
        console.log('🛒 OrderService: Validating order items...');
        await this.validateOrderItems(data.items);
        
        // 2. Oblicz ceny
        console.log('🛒 OrderService: Calculating pricing...');
        const pricing = await this.calculateOrderPricing(data.items, data.discountCode, data.discountAmount);
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

        // Bitrix deal is created only after successful payment (see updatePaymentStatus)

        return order;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isDuplicateKeyError = errorMessage.includes('duplicate key value violates unique constraint') ||
                                   errorMessage.includes('orders_order_number_key');
        
        if (isDuplicateKeyError && attempt < maxRetries - 1) {
          // Race condition - spróbuj ponownie z nowym numerem
          console.warn(`⚠️ OrderService: Duplicate order number detected (attempt ${attempt + 1}/${maxRetries}), retrying...`);
          lastError = error instanceof Error ? error : new Error(errorMessage);
          
          // Krótkie opóźnienie przed ponowną próbą
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
          continue;
        }
        
        // Jeśli to nie jest błąd duplikatu lub wyczerpaliśmy próby, rzuć błąd
        console.error('❌ OrderService: Error in createOrder:', error);
        throw error;
      }
    }
    
    // Jeśli wszystkie próby się nie powiodły
    throw lastError || new Error('Failed to create order after multiple retries');
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
      
      // Używamy productId z koszyka (UUID wygenerowany w konfiguratorze)
      // Dla matów: UUID jest generowany w konfiguratorze za pomocą crypto.randomUUID()
      // Dla akcesoriów: UUID pochodzi z bazy danych
      let productId: string | null = null;
      
      if (item.productType === 'mat') {
        // Maty mają UUID wygenerowany w konfiguratorze (jak w starym konfiguratorze)
        productId = item.productId || null;
        if (!productId) {
          // Fallback: jeśli nie ma UUID, wygeneruj nowy (nie powinno się zdarzyć)
          console.warn('🛒 OrderService: Mat bez productId, generuję nowy UUID');
          productId = randomUUID();
        }
        console.log('🛒 OrderService: Mat detected, using productId:', productId);
      } else if (item.productType === 'accessory') {
        // Akcesoria wymagają UUID z bazy danych
        productId = item.productId || null;
        if (!productId) {
          throw new Error(`productId jest wymagany dla akcesoriów (produkt: ${item.productName})`);
        }
        // Walidacja formatu UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(productId)) {
          throw new Error(`productId dla akcesorium musi być prawidłowym UUID (otrzymano: ${productId})`);
        }
        console.log('🛒 OrderService: Accessory detected, using productId:', productId);
      }
      
      const orderItem = {
        order_id: orderId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.subtotal,
        product_type: item.productType,
        product_id: productId, // UUID dla wszystkich produktów (maty: generowany w konfiguratorze, akcesoria: z bazy danych)
        product_name: item.productName,
        product_sku: item.productSku,
        product_image: item.productImage,
        configuration: item.configuration
      };
      
      console.log('🛒 OrderService: Prepared order item:', {
        product_type: orderItem.product_type,
        product_id: orderItem.product_id,
        product_name: orderItem.product_name
      });
      
      return orderItem;
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
        const available = await this.accessoryService.checkAvailability(
          item.productId,
          item.quantity
        );
        
        if (!available) {
          throw new Error(`Product ${item.productName} is not available`);
        }
        continue
      }

      if (item.productType !== 'mat') continue

      const parsedConfig = MatConfigurationSchema.safeParse(item.configuration)
      if (!parsedConfig.success) {
        throw new Error('Nieprawidłowa konfiguracja dywaników w zamówieniu')
      }

      const validatedConfiguration = await revalidateMatItemPrice(
        item.configuration,
        item.unitPrice,
      )

      item.configuration = validatedConfiguration
      item.unitPrice = validatedConfiguration.pricing.totalPrice
      item.subtotal = validatedConfiguration.pricing.totalPrice * item.quantity
    }
  }

  /**
   * Oblicz ceny zamówienia
   */
  private static readonly FREE_SHIPPING_THRESHOLD = 637
  private static readonly SHIPPING_COST = 27

  private async calculateOrderPricing(items: any[], discountCode?: string, discountAmount?: number) {
    let subtotal = 0;
    
    for (const item of items) {
      if (item.productType === 'mat') {
        subtotal += item.unitPrice * item.quantity;
      } else {
        subtotal += item.subtotal;
      }
    }
    
    const shippingCost = subtotal >= OrderService.FREE_SHIPPING_THRESHOLD ? 0 : OrderService.SHIPPING_COST;
    const tax = 0; // VAT wyłączony
    const discount = discountAmount || 0;
    const total = subtotal + shippingCost - discount;
    
    console.log('💰 OrderService.calculateOrderPricing:', { subtotal, shippingCost, discount, total });
    
    return { subtotal, shippingCost, tax, discount, total };
  }

  /**
   * Generuj unikalny numer zamówienia
   * 
   * Używa retry logic aby uniknąć race condition przy równoczesnych żądaniach.
   * Jeśli numer już istnieje, próbuje ponownie z kolejnym numerem.
   */
  private async generateOrderNumber(maxRetries: number = 5): Promise<string> {
    const year = new Date().getFullYear();
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const count = await this.repository.countOrdersThisYear();
      const number = String(count + 1 + attempt).padStart(6, '0');
      const orderNumber = `ORD-${year}-${number}`;
      
      // Sprawdź czy numer już istnieje
      const existingOrder = await this.repository.findByOrderNumber(orderNumber);
      if (!existingOrder) {
        return orderNumber;
      }
      
      // Jeśli istnieje, spróbuj kolejny numer
      console.warn(`⚠️ OrderService: Order number ${orderNumber} already exists, trying next number...`);
    }
    
    // Jeśli wszystkie próby się nie powiodły, użyj timestamp jako fallback
    const timestamp = Date.now();
    return `ORD-${year}-${String(timestamp).slice(-6)}`;
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
      const syncDecision = resolveBitrixPaymentSyncDecision(status);
      const orderForSync = await this.getOrderById(orderId);

      // Po udanej płatności promuj porzucone koszyki do etapu opłaconego PRZED sync zamówienia
      let promotedDealId: string | undefined
      if (status === 'paid' && orderForSync) {
        const customerEmail =
          orderForSync.customer &&
          typeof orderForSync.customer === 'object' &&
          'email' in orderForSync.customer
            ? String((orderForSync.customer as { email?: string }).email || '')
            : ''

        if (customerEmail) {
          const conversion = await convertAbandonedCartsOnPaid({
            email: customerEmail,
            orderId: orderForSync.id,
            orderNumber: orderForSync.orderNumber,
            order: orderForSync,
          })
          promotedDealId = conversion.promotedDealIds[0]
        }
      }

      if (bitrix24Config.enabled && bitrix24Config.autoSyncOrders && syncDecision.shouldSync) {
        try {
          console.log('🔍 OrderService: Order after update (before sync):', {
            id: orderForSync?.id,
            orderNumber: orderForSync?.orderNumber,
            status: orderForSync?.status,
            paymentStatus: orderForSync?.paymentStatus,
            createIfMissing: syncDecision.createIfMissing,
            preferredDealId: promotedDealId,
            itemsCount: orderForSync?.items?.length || 0,
            hasItems: !!orderForSync?.items,
            itemsDetails: orderForSync?.items?.map(item => ({
              productType: item.productType,
              productName: item.productName,
              hasConfiguration: !!item.configuration,
              configurationKeys: item.configuration ? Object.keys(item.configuration) : []
            })) || []
          });
          
          if (orderForSync) {
            console.log('🔄 OrderService: Starting Bitrix24 sync for updated order...');
            await this.syncOrderToBitrix24(orderForSync, {
              createIfMissing: syncDecision.createIfMissing,
              preferredDealId: promotedDealId,
            });
            console.log('✅ OrderService: Payment status synced to Bitrix24');
          } else {
            console.error('❌ OrderService: Order not found after update, cannot sync');
          }
        } catch (error) {
          console.error('❌ OrderService: Failed to sync payment status to Bitrix24:', error);
        }
      } else if (!syncDecision.shouldSync) {
        console.log('⚠️ OrderService: Skipping Bitrix24 sync for payment status:', status);
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
  private async syncOrderToBitrix24(
    order: Order,
    options: BitrixOrderSyncOptions = {}
  ): Promise<void> {
    const createIfMissing = options.createIfMissing ?? true

    try {
      console.log('🔄 OrderService: Starting Bitrix24 sync for order:', {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createIfMissing,
        total: order.total
      });

      console.log('✅ OrderService: Proceeding with sync for order:', {
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        status: order.status,
        createIfMissing,
      });

      // Sprawdź czy deal już istnieje — przed kontaktem, żeby failed bez deala nic nie tworzył
      let existingDeal = await dealService.findByOrderNumber(order.orderNumber);

      // Prefer deal promoted from abandoned cart when ORIGIN_ID was not yet rewritten to order number
      if (!existingDeal && options.preferredDealId) {
        existingDeal = await dealService.getDeal(options.preferredDealId)
        if (existingDeal) {
          console.log('📋 OrderService: Using preferred deal from abandoned-cart promotion:', {
            dealId: existingDeal.id,
            orderNumber: order.orderNumber,
          })
        }
      }

      if (!existingDeal && !createIfMissing) {
        console.log('⚠️ OrderService: Skipping Bitrix deal create for unpaid/failed order:', {
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          status: order.status,
        })
        return
      }

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

      // 2. Aktualizuj istniejący deal
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

        await this.attachDealProductsAndContact(existingDeal.id, order, contactId)

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

      await this.attachDealProductsAndContact(dealResult.id, order, contactId)

      console.log('✅ OrderService: Order synced to Bitrix24 successfully:', {
        orderNumber: order.orderNumber,
        contactId: contactId || 'none',
        dealId: dealResult.id,
        productsCount: mapOrderToDealProductRows(order).length
      });

    } catch (error) {
      console.error('❌ OrderService: Failed to sync order to Bitrix24:', error);
      throw error;
    }
  }

  private async attachDealProductsAndContact(
    dealId: string,
    order: Order,
    contactId?: string
  ): Promise<void> {
    if (contactId) {
      const linkResult = await dealService.linkContact(dealId, contactId)
      if (!linkResult.success) {
        console.warn('⚠️ OrderService: Failed to link contact to deal:', linkResult.error)
      }
    }

    const dealProducts = mapOrderToDealProductRows(order)
    if (dealProducts.length === 0) {
      return
    }

    const productResult = await dealService.addProductsToDeal(dealId, dealProducts)
    if (!productResult.success) {
      console.warn('⚠️ OrderService: Failed to add products to deal:', productResult.error)
      return
    }

    console.log('✅ OrderService: Products added to deal successfully')
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