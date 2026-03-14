export type AbandonedCartStatus = 'pending' | 'processing' | 'exported' | 'converted' | 'discarded';

export interface AbandonedCartSnapshotContact {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  taxId?: string; // NIP na fakturę
}

export interface AbandonedCartSnapshotCar {
  make?: string;
  model?: string;
  year?: string | number;
  bodyType?: string;
}

export interface AbandonedCartSnapshotConfiguration {
  variant?: number | string;
  setType?: number | string;
  cellShape?: number | string;
  materialColor?: number | string;
  trimColor?: number | string;
}

export interface AbandonedCartItem {
  productId?: string;
  productName?: string;
  productType?: string;
  quantity?: number;
  price?: number;
  currency?: string;
}

export interface AbandonedCartSnapshotAddress {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface AbandonedCartRecord {
  id: string;
  session_id: string;
  status: AbandonedCartStatus;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  expire_at: string;
  utm: Record<string, unknown>;
  contact: AbandonedCartSnapshotContact;
  address?: AbandonedCartSnapshotAddress;
  car: AbandonedCartSnapshotCar;
  configuration: AbandonedCartSnapshotConfiguration;
  items: AbandonedCartItem[];
  currency: string;
  total_amount: number;
  ip?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
  bitrix_deal_id?: string | null;
  bitrix_category_id?: number | null;
  bitrix_stage_id?: string | null;
}

export interface AbandonedCartUpsertInput {
  sessionId: string;
  stage: 'checkout_step2' | 'checkout_step3';
  cartHasItems: boolean;
  utm?: Record<string, unknown>;
  contact?: AbandonedCartSnapshotContact;
  address?: AbandonedCartSnapshotAddress;
  car?: AbandonedCartSnapshotCar;
  configuration?: AbandonedCartSnapshotConfiguration;
  items?: AbandonedCartItem[];
  currency?: string;
  totalAmount?: number;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}


