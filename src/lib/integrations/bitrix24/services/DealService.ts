/**
 * Bitrix24 Deal Service
 * 
 * Handles deal operations in Bitrix24 CRM
 */

import { Bitrix24Client } from '../client';
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

  constructor(client?: Bitrix24Client) {
    this.client = client || new Bitrix24Client();
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

      // Add options to deal data
      const enrichedData = {
        ...validatedData,
        STAGE_ID: options.stageId || validatedData.STAGE_ID,
        CURRENCY_ID: options.currencyId || validatedData.CURRENCY_ID,
        CONTACT_ID: options.contactId || validatedData.CONTACT_ID,
        CATEGORY_ID: 0, // Deale / Zamówienia ze strony opłacone
      };

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
      console.log('💼 Updating deal stage:', { id: dealId, stageId: options.stageId });

      const updateFields: any = {
        STAGE_ID: options.stageId
      };

      if (options.comment) {
        updateFields.COMMENTS = options.comment;
      }

      const response = await this.client.post('crm.deal.update', {
        id: dealId,
        fields: updateFields,
      });

      if (response.error) {
        throw new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`);
      }

      console.log('✅ Deal stage updated successfully:', { id: dealId, stageId: options.stageId });

      return {
        success: true,
      };

    } catch (error) {
      console.error('❌ Failed to update deal stage:', error);
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
      };

      console.log('✅ Deal found by order number:', { 
        id: result.id, 
        title: result.title, 
        stageId: result.stageId,
        categoryId: deal.CATEGORY_ID || 'unknown'
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
      };

      console.log('✅ Deal retrieved:', { id: result.id, title: result.title });

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
