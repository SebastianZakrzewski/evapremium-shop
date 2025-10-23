import { bitrix24Config } from '../config';
import { Bitrix24Client } from '../client';

export type StageContextType = 'abandoned_cart' | 'order' | 'lead';

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
  private cache: { abandoned?: { categoryId: number; stageId: string } } = {};

  constructor(client?: Bitrix24Client) {
    this.client = client || new Bitrix24Client();
  }

  async resolveStage(options: StageResolveOptions): Promise<StageResult> {
    switch (options.type) {
      case 'abandoned_cart':
        return await this.resolveAbandonedCartStage();
      case 'order':
        return this.resolveOrderStage(options.orderStatus, options.paymentStatus);
      case 'lead':
      default:
        return { stageId: 'NEW' };
    }
  }

  private resolveOrderStage(orderStatus?: string, paymentStatus?: string): StageResult {
    // zachowuje obecną logikę mapowania z OrderService
    if (paymentStatus === 'paid') {
      switch (orderStatus) {
        case 'delivered':
          return { stageId: 'WON' };
        case 'cancelled':
          return { stageId: 'LOSE' };
        case 'pending':
        case 'confirmed':
        case 'processing':
        case 'shipped':
        default:
          return { stageId: 'UC_DMBNNJ' };
      }
    }
    if (paymentStatus === 'failed' || paymentStatus === 'refunded') {
      return { stageId: 'LOSE' };
    }
    switch (orderStatus) {
      case 'pending':
        return { stageId: 'NEW' };
      case 'confirmed':
      case 'processing':
      case 'shipped':
        return { stageId: 'UC_DMBNNJ' };
      case 'delivered':
        return { stageId: 'WON' };
      case 'cancelled':
        return { stageId: 'LOSE' };
      default:
        return { stageId: 'NEW' };
    }
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
}

export const stageMappingService = new StageMappingService();


