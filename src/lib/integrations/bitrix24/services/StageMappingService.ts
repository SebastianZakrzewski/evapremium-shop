import { bitrix24Config } from '../config';
import { Bitrix24Client } from '../client';

export type StageContextType = 'abandoned_cart' | 'order' | 'lead' | 'chat';

export interface StageResolveOptions {
  type: StageContextType;
  orderStatus?: string;
  paymentStatus?: string;
}

interface StageResult {
  categoryId?: number;
  stageId: string;
}

export class StageMappingService {
  private client: Bitrix24Client;
  private cache: { 
    abandoned?: { categoryId: number; stageId: string };
    chat?: { categoryId: number; stageId: string };
  } = {};

  constructor(client?: Bitrix24Client) {
    this.client = client || new Bitrix24Client();
  }

  async resolveStage(options: StageResolveOptions): Promise<StageResult> {
    switch (options.type) {
      case 'abandoned_cart':
        return await this.resolveAbandonedCartStage();
      case 'order':
        return this.resolveOrderStage(options.orderStatus, options.paymentStatus);
      case 'chat':
        return await this.resolveChatStage();
      case 'lead':
      default:
        return { stageId: 'NEW' };
    }
  }
  /**
   * Maps order and payment statuses to corresponding Bitrix24 deal stages
   * 
   * @param orderStatus - Current status of the order (e.g. 'cancelled', 'delivered', etc.)
   * @param paymentStatus - Current payment status (e.g. 'failed', 'paid', etc.)
   * @returns StageResult containing the mapped Bitrix24 stage ID
   * 
   * Stage mapping logic:
   * 1. Payment status takes precedence:
   *    - failed/refunded -> LOSE
   *    - paid -> UC_DMBNNJ (In Progress)
   * 
   * 2. Order status mapping:
   *    - cancelled -> LOSE
   *    - delivered -> WON  
   *    - confirmed/processing/shipped -> UC_DMBNNJ (In Progress)
   * 
   * 3. Default: NEW for unknown statuses
   */
  private resolveOrderStage(orderStatus?: string, paymentStatus?: string): StageResult {
    // First check payment status as it takes precedence
    const paymentStageMap: Record<string, string> = {
      failed: 'LOSE',
      refunded: 'LOSE',
      paid: 'UC_DMBNNJ'
    };
    if (paymentStatus && paymentStatus in paymentStageMap) {
      return { stageId: paymentStageMap[paymentStatus] };
    }

    // Then check order status
    const orderStageMap: Record<string, string> = {
      cancelled: 'LOSE',
      delivered: 'WON',
      confirmed: 'UC_DMBNNJ',
      processing: 'UC_DMBNNJ', 
      shipped: 'UC_DMBNNJ'
    };
    if (orderStatus && orderStatus in orderStageMap) {
      return { stageId: orderStageMap[orderStatus] };
    }

    // Default stage for new/unknown status
    return { stageId: 'NEW' };
  }

  private async resolveAbandonedCartStage(): Promise<StageResult> {
    if (this.cache.abandoned) return this.cache.abandoned;

    const envCategoryId = process.env.BITRIX24_ABANDONED_CATEGORY_ID ? Number(process.env.BITRIX24_ABANDONED_CATEGORY_ID) : undefined;
    const envStageId = process.env.BITRIX24_ABANDONED_STAGE_ID || undefined;
    if (envCategoryId && envStageId) {
      this.cache.abandoned = { categoryId: envCategoryId, stageId: envStageId };
      return this.cache.abandoned;
    }

    // fallback: auto-resolve by name
    const categoriesResp = await this.client.get('crm.dealcategory.list');
    const categories = categoriesResp.result || [];
    const category = categories.find((c: any) => String(c.NAME).toLowerCase() === 'leady z reklam');
    if (!category) throw new Error('StageMappingService: Kategoria "Leady z Reklam" nie znaleziona');
    const categoryId = Number(category.ID);

    const statusesResp = await this.client.post('crm.status.list', { filter: { ENTITY_ID: `DEAL_STAGE_${categoryId}` } });
    const statuses = statusesResp.result || [];
    const stage = statuses.find((s: any) => String(s.NAME).toLowerCase() === 'porzucone koszyki');
    if (!stage) throw new Error('StageMappingService: Etap "Porzucone Koszyki" nie znaleziony');
    const stageId = String(stage.STATUS_ID);

    this.cache.abandoned = { categoryId, stageId };
    return this.cache.abandoned;
  }

  /**
   * Resolves chat stage ("Czaty ze strony") in "Leady z Reklam" category
   * Uses the same category as abandoned carts
   */
  private async resolveChatStage(): Promise<StageResult> {
    if (this.cache.chat) return this.cache.chat;

    // Use the same category as abandoned carts
    const abandonedStage = await this.resolveAbandonedCartStage();
    const categoryId = abandonedStage.categoryId;
    
    if (!categoryId) {
      throw new Error('StageMappingService: Nie można określić kategorii dla czatów');
    }

    // Check for environment variable first
    const envStageId = process.env.BITRIX24_CHAT_STAGE_ID;
    if (envStageId) {
      this.cache.chat = { categoryId, stageId: envStageId };
      return this.cache.chat;
    }

    // Fallback: auto-resolve by name
    const statusesResp = await this.client.post('crm.status.list', { 
      filter: { ENTITY_ID: `DEAL_STAGE_${categoryId}` } 
    });
    const statuses = statusesResp.result || [];
    const stage = statuses.find((s: any) => 
      String(s.NAME).toLowerCase() === 'czaty ze strony'
    );
    
    if (!stage) {
      throw new Error('StageMappingService: Etap "Czaty ze strony" nie znaleziony w kategorii "Leady z Reklam"');
    }
    
    const stageId = String(stage.STATUS_ID);
    this.cache.chat = { categoryId, stageId };
    return this.cache.chat;
  }
}

export const stageMappingService = new StageMappingService();


