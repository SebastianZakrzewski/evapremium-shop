/**
 * Bitrix24 Deal Service
 * 
 * Handles deal operations in Bitrix24 CRM
 */

import { Bitrix24Client } from '../client';
import { bitrix24Config } from '../config';
import type { AbandonedCartRecord, AbandonedCartItem } from '@/lib/types/abandonedCart';
import { stageMappingService } from './StageMappingService';
import { contactService } from './ContactService';
import { Bitrix24Deal, Bitrix24DealProduct, Bitrix24ApiResponse } from '@/lib/types/bitrix';
import { validateBitrix24Deal, validateBitrix24DealProduct } from '@/lib/validators/bitrix24';

export interface DealSearchResult {
  id: string;
  title: string;
  stageId: string;
  opportunity: number;
  currencyId: string;
  contactId?: string;
  orderNumber?: string;
  paymentStatus?: string;
  categoryId?: number;
}

export interface CreateDealOptions {
  stageId?: string;
  currencyId?: string;
  contactId?: string;
}

export interface UpdateDealStageOptions {
  stageId: string;
  comment?: string;
}

export class DealService {
  private client: Bitrix24Client;
  private abandonedCache?: { categoryId: number; stageId: string };

  constructor(client?: Bitrix24Client) {
    this.client = client || new Bitrix24Client();
  }

  /**
   * Resolve abandoned carts category and stage (with in-memory cache)
   */
  private async resolveAbandonedCategoryAndStage(): Promise<{ categoryId: number; stageId: string }> {
    if (this.abandonedCache) return this.abandonedCache;

    // Prefer explicit IDs from env
    const cfg = bitrix24Config.abandoned;
    if (cfg.categoryId && cfg.stageId) {
      this.abandonedCache = { categoryId: cfg.categoryId, stageId: cfg.stageId };
      return this.abandonedCache;
    }

    // Resolve category by name
    const categoriesResp = await this.client.get('crm.dealcategory.list');
    const categories = categoriesResp.result || [];

    const categoryName = cfg.categoryName || 'Leady z Reklam';
    const category = categories.find((c: any) => String(c.NAME).toLowerCase() === categoryName.toLowerCase());
    if (!category) {
      throw new Error(`Bitrix24: Nie znaleziono kategorii "${categoryName}"`);
    }
    const categoryId = Number(category.ID);

    // Resolve stage by name within category
    const stagesResp = await this.client.get('crm.dealcategory.stage.list');
    const stages = (stagesResp.result || []).filter((s: any) => Number(s.CATEGORY_ID) === categoryId);
    const stageName = cfg.stageName || 'Porzucone Koszyki';
    const stage = stages.find((s: any) => String(s.NAME).toLowerCase() === stageName.toLowerCase());
    if (!stage) {
      throw new Error(`Bitrix24: Nie znaleziono etapu "${stageName}" w kategorii ${categoryName}`);
    }

    this.abandonedCache = { categoryId, stageId: String(stage.STATUS_ID) };
    return this.abandonedCache;
  }

  /**
   * Build deal payload from abandoned cart
   */
  async createDealForAbandonedCart(cart: AbandonedCartRecord): Promise<{ id: string; success: boolean; error?: string }> {
    const { categoryId, stageId } = await stageMappingService.resolveStage({ type: 'abandoned_cart' });

    // 1. Create or find contact
    let contactId: string | null = null;
    try {
      const contactResult = await contactService.createOrFindContactFromAbandonedCart(cart);
      if (contactResult.id) {
        contactId = contactResult.id;
        console.log('[DealService] Contact resolved for abandoned cart', { 
          contactId, 
          created: contactResult.created 
        });
      } else {
        console.warn('[DealService] Could not create/find contact for abandoned cart', contactResult.error);
      }
    } catch (error) {
      console.error('[DealService] Error creating/finding contact for abandoned cart', error);
      // Continue without contact - deal will still be created
    }

    // 2. Build deal title
    const titleParts: string[] = ['[Porzucony koszyk]'];
    if (cart.car?.make) titleParts.push(String(cart.car.make));
    if (cart.car?.model) titleParts.push(String(cart.car.model));
    const title = titleParts.join(' ');

    // 3. Build comments with product details
    const commentsLines: string[] = [];
    
    // Add contact information
    if (cart.contact) {
      const c = cart.contact;
      if (c.firstName || c.lastName) {
        commentsLines.push(`Kontakt: ${c.firstName || ''} ${c.lastName || ''}`.trim());
      }
      if (c.email) commentsLines.push(`Email: ${c.email}`);
      if (c.phone) commentsLines.push(`Telefon: ${c.phone}`);
    }

    // Add car information
    if (cart.car) {
      const carParts: string[] = [];
      if (cart.car.make) carParts.push(cart.car.make);
      if (cart.car.model) carParts.push(cart.car.model);
      if (cart.car.year) carParts.push(String(cart.car.year));
      if (cart.car.bodyType) carParts.push(cart.car.bodyType);
      if (carParts.length > 0) {
        commentsLines.push(`Samochód: ${carParts.join(' ')}`);
      }
    }

    // Add product details
    if (cart.items && cart.items.length > 0) {
      commentsLines.push('--- Produkty ---');
      cart.items.forEach((item, index) => {
        const itemLines: string[] = [];
        itemLines.push(`${index + 1}. ${item.productName || 'Produkt'}`);
        if (item.quantity) itemLines.push(`Ilość: ${item.quantity}`);
        if (item.price) itemLines.push(`Cena: ${item.price} ${item.currency || 'PLN'}`);
        if (item.productType) itemLines.push(`Typ: ${item.productType}`);
        commentsLines.push(itemLines.join(', '));
      });
      commentsLines.push('---');
    }

    // Add configuration details
    if (cart.configuration) {
      const c = cart.configuration;
      commentsLines.push(`Konfiguracja: variant=${String(c.variant ?? '')}, setType=${String(c.setType ?? '')}, cellShape=${String(c.cellShape ?? '')}`);
      commentsLines.push(`Kolory: material=${String(c.materialColor ?? '')}, trim=${String(c.trimColor ?? '')}`);
    }

    // Add UTM and session
    if (cart.utm && Object.keys(cart.utm).length > 0) {
      commentsLines.push(`UTM: ${JSON.stringify(cart.utm)}`);
    }
    commentsLines.push(`Session: ${cart.session_id}`);
    commentsLines.push(`Wartość całkowita: ${cart.total_amount || 0} ${cart.currency || 'PLN'}`);

    const deal: Bitrix24Deal = {
      TITLE: title,
      STAGE_ID: stageId,
      CATEGORY_ID: categoryId,
      OPPORTUNITY: Number(cart.total_amount || 0),
      CURRENCY_ID: cart.currency || 'PLN',
      SOURCE_ID: 'WEB',
      SOURCE_DESCRIPTION: 'EVA Website',
      ORIGINATOR_ID: 'EVA Website',
      ORIGIN_ID: cart.id,
      COMMENTS: commentsLines.join('\n'),
      CONTACT_ID: contactId || undefined, // Add contact if available
    } as any;

    // 4. Create deal
    const dealResult = await this.createDeal(deal, { 
      stageId,
      contactId: contactId || undefined,
    });

    if (!dealResult.success || !dealResult.id) {
      return dealResult;
    }

    // 5. Add products to deal
    if (cart.items && cart.items.length > 0) {
      try {
        const products = this.mapAbandonedCartItemsToDealProducts(cart.items);
        if (products.length > 0) {
          const productResult = await this.addProductsToDeal(dealResult.id, products);
          if (!productResult.success) {
            console.warn('[DealService] Failed to add products to deal, but deal was created', {
              dealId: dealResult.id,
              error: productResult.error
            });
          }
        }
      } catch (error) {
        console.error('[DealService] Error adding products to deal', error);
        // Don't fail the whole operation if products fail to add
      }
    }

    // 6. Link contact if not already linked (double-check)
    if (contactId) {
      try {
        // Contact is already set in CONTACT_ID above, but ensure it's linked
        const linkResult = await this.linkContact(dealResult.id, contactId);
        if (!linkResult.success) {
          console.warn('[DealService] Failed to link contact to deal, but deal was created', {
            dealId: dealResult.id,
            contactId,
            error: linkResult.error
          });
        }
      } catch (error) {
        console.warn('[DealService] Error linking contact to deal', { dealId: dealResult.id, contactId, error });
      }
    }

    return dealResult;
  }

  /**
   * Map abandoned cart items to Bitrix24 deal products
   */
  private mapAbandonedCartItemsToDealProducts(items: AbandonedCartItem[]): Bitrix24DealProduct[] {
    return items
      .filter(item => item && (item.productName || item.productId))
      .map(item => ({
        PRODUCT_ID: item.productId || item.productName || 'Produkt', // Bitrix24 uses PRODUCT_ID, can be name if product doesn't exist in catalog
        QUANTITY: item.quantity || 1,
        PRICE: Number(item.price || 0),
      }));
  }

  /**
   * Create a new deal in Bitrix24
   */
  async createDeal(
    dealData: Bitrix24Deal,
    options: CreateDealOptions = {}
  ): Promise<{ id: string; success: boolean; error?: string }> {
    try {
      // Validate deal data
      const validatedData = validateBitrix24Deal(dealData);

      // Add options to deal data (nie nadpisuj CATEGORY_ID jeżeli został podany)
      const enrichedData = {
        ...validatedData,
        STAGE_ID: options.stageId || validatedData.STAGE_ID,
        CURRENCY_ID: options.currencyId || validatedData.CURRENCY_ID,
        CONTACT_ID: options.contactId || validatedData.CONTACT_ID,
        CATEGORY_ID: validatedData.CATEGORY_ID, // respektuj kategorię z payloadu
      } as typeof validatedData;

      console.log('💼 Creating Bitrix24 deal:', { 
        title: enrichedData.TITLE, 
        opportunity: enrichedData.OPPORTUNITY,
        stageId: enrichedData.STAGE_ID,
        optionsStageId: options.stageId,
        validatedStageId: validatedData.STAGE_ID,
        categoryId: enrichedData.CATEGORY_ID || 'not set',
        currencyId: enrichedData.CURRENCY_ID,
        contactId: enrichedData.CONTACT_ID
      });

      console.log('🔍 DealService: Full enrichedData object before sending to Bitrix24:', JSON.stringify(enrichedData, null, 2));

      console.log('🔍 STAGE_ID analysis:', {
        'options.stageId': options.stageId,
        'validatedData.STAGE_ID': validatedData.STAGE_ID,
        'enrichedData.STAGE_ID': enrichedData.STAGE_ID,
        'STAGE_ID !== NEW': enrichedData.STAGE_ID !== 'NEW',
        'STAGE_ID && STAGE_ID !== NEW': enrichedData.STAGE_ID && enrichedData.STAGE_ID !== 'NEW'
      });

      // ✅ ZMIANA: Utwórz deal bezpośrednio z STAGE_ID w ciele żądania
      console.log('💼 Creating deal with STAGE_ID:', enrichedData.STAGE_ID);
      
      const response = await this.client.post<{ id: string }>('crm.deal.add', {
        fields: enrichedData // ← Zawiera STAGE_ID
      });
      
      console.log('🔍 DealService: Bitrix24 API response:', {
        success: !response.error,
        error: response.error,
        result: response.result,
        fullResponse: JSON.stringify(response, null, 2)
      });
      
      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      // Bitrix24 returns deal ID directly as result, not as result.id
      const dealId = response.result;
      if (!dealId) {
        throw new Error('No deal ID returned from Bitrix24');
      }

      console.log('✅ Deal created successfully with stage:', { 
        id: dealId, 
        title: enrichedData.TITLE,
        stageId: enrichedData.STAGE_ID 
      });

      return {
        id: String(dealId), // Convert to string for consistency
        success: true,
      };

    } catch (error) {
      console.error('❌ Failed to create deal:', error);
      return {
        id: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update an existing deal in Bitrix24
   */
  async updateDeal(
    dealId: string,
    dealData: Partial<Bitrix24Deal>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('💼 Updating Bitrix24 deal:', { id: dealId });

      const response = await this.client.post<{ id: string }>('crm.deal.update', {
        id: dealId,
        fields: dealData,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      console.log('✅ Deal updated successfully:', { id: dealId });

      return {
        success: true,
      };

    } catch (error) {
      console.error('❌ Failed to update deal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update deal stage
   */
  async updateDealStage(
    dealId: string,
    options: UpdateDealStageOptions
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('💼 DealService: Updating deal stage:', { 
        id: dealId, 
        stageId: options.stageId,
        comment: options.comment 
      });

      // Najpierw pobierz aktualny deal aby sprawdzić kategorię
      const currentDeal = await this.getDeal(dealId);
      if (!currentDeal) {
        throw new Error(`Deal not found: ${dealId}`);
      }

      console.log('🔍 DealService: Current deal info:', {
        id: dealId,
        currentStageId: currentDeal.stageId,
        currentCategoryId: currentDeal.categoryId,
        targetStageId: options.stageId
      });

      const updateFields: any = {
        STAGE_ID: options.stageId
      };

      if (options.comment) {
        updateFields.COMMENTS = options.comment;
      }

      console.log('📤 DealService: Sending update request to Bitrix24:', {
        dealId,
        fields: updateFields
      });

      const response = await this.client.post('crm.deal.update', {
        id: dealId,
        fields: updateFields,
      });

      console.log('📥 DealService: Bitrix24 API response:', {
        dealId,
        hasError: !!response.error,
        error: response.error,
        result: response.result
      });

      if (response.error) {
        const errorMessage = response.error.error_description || response.error.error || 'Unknown error';
        console.error('❌ DealService: Bitrix24 API Error:', {
          dealId,
          stageId: options.stageId,
          error: response.error,
          errorMessage
        });
        throw new Error(`Bitrix24 API Error: ${errorMessage}`);
      }

      // Zweryfikuj że stage został zaktualizowany
      const updatedDeal = await this.getDeal(dealId);
      if (updatedDeal && updatedDeal.stageId !== options.stageId) {
        console.warn('⚠️ DealService: Stage verification failed:', {
          dealId,
          expectedStageId: options.stageId,
          actualStageId: updatedDeal.stageId
        });
      }

      console.log('✅ DealService: Deal stage updated successfully:', { 
        id: dealId, 
        stageId: options.stageId,
        verifiedStageId: updatedDeal?.stageId
      });

      return {
        success: true,
      };

    } catch (error) {
      console.error('❌ DealService: Failed to update deal stage:', {
        dealId,
        stageId: options.stageId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Add products to deal
   */
  async addProductsToDeal(
    dealId: string,
    products: Bitrix24DealProduct[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('💼 Adding products to deal:', { id: dealId, productCount: products.length });

      // Validate products
      const validatedProducts = products.map(product => validateBitrix24DealProduct(product));

      // Use batch request to add all products
      const commands: Record<string, { method: string; data: any }> = {};
      
      validatedProducts.forEach((product, index) => {
        commands[`product_${index}`] = {
          method: 'crm.deal.productrows.set',
          data: {
            id: dealId,
            rows: [product],
          },
        };
      });

      const response = await this.client.batch(commands);

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      // Check if any product addition failed
      const results = response.result || {};
      const failedProducts = Object.entries(results).filter(([_, result]: [string, any]) => result.error);

      if (failedProducts.length > 0) {
        console.warn('⚠️ Some products failed to add:', failedProducts);
      }

      console.log('✅ Products added to deal successfully:', { id: dealId, productCount: products.length });

      return {
        success: true,
      };

    } catch (error) {
      console.error('❌ Failed to add products to deal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Link contact to deal
   */
  async linkContact(
    dealId: string,
    contactId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('💼 Linking contact to deal:', { dealId, contactId });

      const response = await this.client.post('crm.deal.update', {
        id: dealId,
        fields: {
          CONTACT_ID: contactId,
        },
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      console.log('✅ Contact linked to deal successfully:', { dealId, contactId });

      return {
        success: true,
      };

    } catch (error) {
      console.error('❌ Failed to link contact to deal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Find deal by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<DealSearchResult | null> {
    try {
      console.log('🔍 Searching deal by order number:', orderNumber);

      const response = await this.client.get('crm.deal.list', {
        filter: {
          'ORIGIN_ID': orderNumber,
          'CATEGORY_ID': 0, // Search only in "Deale" category (ID: 0)
        },
        select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID', 'CONTACT_ID', 'ORIGIN_ID', 'ORIGINATOR_ID', 'CATEGORY_ID'],
        start: 0,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      const deals = response.result || [];
      if (deals.length === 0) {
        console.log('💼 No deal found with order number:', orderNumber);
        return null;
      }

      const deal = deals[0];
      const result: DealSearchResult = {
        id: deal.ID,
        title: deal.TITLE,
        stageId: deal.STAGE_ID,
        opportunity: deal.OPPORTUNITY,
        currencyId: deal.CURRENCY_ID,
        contactId: deal.CONTACT_ID,
        orderNumber: deal.ORIGIN_ID,
        paymentStatus: 'paid', // Jeśli deal istnieje, oznacza że zamówienie było opłacone
        categoryId: deal.CATEGORY_ID ? Number(deal.CATEGORY_ID) : undefined,
      };

      console.log('✅ Deal found by order number:', { 
        id: result.id, 
        title: result.title, 
        stageId: result.stageId,
        categoryId: result.categoryId || 'unknown'
      });

      return result;

    } catch (error) {
      console.error('❌ Failed to find deal by order number:', error);
      return null;
    }
  }

  /**
   * Get deal by ID
   */
  async getDeal(dealId: string): Promise<DealSearchResult | null> {
    try {
      console.log('🔍 Getting deal by ID:', dealId);

      const response = await this.client.get('crm.deal.get', {
        id: dealId,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      const deal = response.result;
      if (!deal) {
        console.log('💼 Deal not found:', dealId);
        return null;
      }

      const result: DealSearchResult = {
        id: deal.ID,
        title: deal.TITLE,
        stageId: deal.STAGE_ID,
        opportunity: deal.OPPORTUNITY,
        currencyId: deal.CURRENCY_ID,
        contactId: deal.CONTACT_ID,
        orderNumber: deal.UF_CRM_ORDER_NUMBER,
        paymentStatus: deal.UF_CRM_PAYMENT_STATUS,
        categoryId: deal.CATEGORY_ID ? Number(deal.CATEGORY_ID) : undefined,
      };

      console.log('✅ Deal retrieved:', { 
        id: result.id, 
        title: result.title,
        stageId: result.stageId,
        categoryId: result.categoryId
      });

      return result;

    } catch (error) {
      console.error('❌ Failed to get deal:', error);
      return null;
    }
  }

  /**
   * Get deals by contact ID
   */
  async getDealsByContact(contactId: string): Promise<DealSearchResult[]> {
    try {
      console.log('🔍 Getting deals by contact ID:', contactId);

      const response = await this.client.get('crm.deal.list', {
        filter: {
          'CONTACT_ID': contactId,
        },
        select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID', 'CONTACT_ID', 'UF_CRM_ORDER_NUMBER', 'UF_CRM_PAYMENT_STATUS'],
        start: 0,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      const deals = response.result || [];
      const results: DealSearchResult[] = deals.map((deal: any) => ({
        id: deal.ID,
        title: deal.TITLE,
        stageId: deal.STAGE_ID,
        opportunity: deal.OPPORTUNITY,
        currencyId: deal.CURRENCY_ID,
        contactId: deal.CONTACT_ID,
        orderNumber: deal.UF_CRM_ORDER_NUMBER,
        paymentStatus: deal.UF_CRM_PAYMENT_STATUS,
      }));

      console.log('✅ Found deals by contact:', { count: results.length, contactId });

      return results;

    } catch (error) {
      console.error('❌ Failed to get deals by contact:', error);
      return [];
    }
  }

  /**
   * Get deal stages
   */
  async getDealStages(): Promise<Array<{ id: string; name: string; sort: number }>> {
    try {
      console.log('🔍 Getting deal stages');

      const response = await this.client.get('crm.dealcategory.stage.list');

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      const stages = response.result || [];
      const results = stages.map((stage: any) => ({
        id: stage.STATUS_ID,
        name: stage.NAME,
        sort: stage.SORT,
      }));

      console.log('✅ Retrieved deal stages:', { count: results.length });

      return results;

    } catch (error) {
      console.error('❌ Failed to get deal stages:', error);
      return [];
    }
  }

  /**
   * Delete deal by ID
   */
  async deleteDeal(dealId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Deleting deal:', dealId);

      const response = await this.client.post('crm.deal.delete', {
        id: dealId,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      console.log('✅ Deal deleted successfully:', dealId);

      return {
        success: true,
      };

    } catch (error) {
      console.error('❌ Failed to delete deal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const dealService = new DealService();
