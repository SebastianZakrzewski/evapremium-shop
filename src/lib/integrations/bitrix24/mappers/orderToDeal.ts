/**
 * Order to Bitrix24 Deal Mapper
 * 
 * Maps EVA Website Order data to Bitrix24 Deal format
 */

import { Bitrix24Deal } from '@/lib/types/bitrix';
import { Order } from '@/lib/types/order-new';

export interface OrderToDealMappingOptions {
  contactId?: string;
  stageId?: string;
  currencyId?: string;
}

/**
 * Map Order to Bitrix24 Deal
 */
export function mapOrderToDeal(
  order: Order,
  contactId?: string,
  options: OrderToDealMappingOptions = {}
): Bitrix24Deal {
  const customer = order.customer as any; // Type assertion for JSON field
  const shippingAddress = order.shippingAddress as any; // Type assertion for JSON field

  // Extract car details from first mat item
  const carDetails = extractCarDetails(order);
  
  // Build deal data
  const deal: Bitrix24Deal = {
    TITLE: `Zamówienie ${order.orderNumber}`,
    STAGE_ID: options.stageId || 'NEW',
    OPPORTUNITY: Number(order.total),
    CURRENCY_ID: options.currencyId || 'PLN',
    CONTACT_ID: contactId,
    COMMENTS: buildDealComments(order),
    // Custom fields for EVA Website integration
    UF_CRM_ORDER_NUMBER: order.orderNumber,
    UF_CRM_PAYMENT_METHOD: order.paymentMethod || 'Nieznana',
    UF_CRM_PAYMENT_STATUS: order.paymentStatus || 'pending',
    UF_CRM_CAR_BRAND: carDetails.brand,
    UF_CRM_CAR_MODEL: carDetails.model,
    UF_CRM_CAR_YEAR: carDetails.year,
    UF_CRM_PRODUCT_TYPE: extractProductTypes(order),
    UF_CRM_PRODUCT_COLOR: extractProductColors(order),
    UF_CRM_SHIPPING_METHOD: extractShippingMethod(order),
    UF_CRM_ORDER_DATE: order.createdAt.toISOString().split('T')[0],
    UF_CRM_ORDER_SOURCE: 'EVA Website',
  };

  // Remove undefined values
  return removeUndefinedValues(deal);
}

/**
 * Extract car details from order items
 */
function extractCarDetails(order: Order): {
  brand?: string;
  model?: string;
  year?: string;
  body?: string;
} {
  if (!order.items || order.items.length === 0) {
    return {};
  }

  // Look for mat items with car configuration
  const matItem = order.items.find(item => 
    item.productType === 'mat' && item.configuration
  );

  if (matItem && matItem.configuration) {
    const config = matItem.configuration as any;
    if (config.carDetails) {
      return {
        brand: config.carDetails.brand,
        model: config.carDetails.model,
        year: config.carDetails.year,
        body: config.carDetails.body,
      };
    }
  }

  return {};
}

/**
 * Extract product types from order items
 */
function extractProductTypes(order: Order): string {
  if (!order.items || order.items.length === 0) {
    return '';
  }

  const types = order.items.map(item => {
    if (item.productType === 'mat') {
      return 'Dywaniki samochodowe';
    } else if (item.productType === 'accessory') {
      return 'Akcesoria';
    }
    return item.productType;
  });

  return [...new Set(types)].join(', ');
}

/**
 * Extract product colors from order items
 */
function extractProductColors(order: Order): string {
  if (!order.items || order.items.length === 0) {
    return '';
  }

  const colors: string[] = [];

  order.items.forEach(item => {
    if (item.configuration) {
      const config = item.configuration as any;
      if (config.materialColor) {
        colors.push(`Materiał: ${config.materialColor}`);
      }
      if (config.borderColor) {
        colors.push(`Obszycie: ${config.borderColor}`);
      }
    }
  });

  return colors.join(', ');
}

/**
 * Extract shipping method from order
 */
function extractShippingMethod(order: Order): string {
  const shipping = order.shippingAddress as any;
  return shipping?.method || shipping?.methodName || 'Nieznana';
}

/**
 * Build deal comments from order data
 */
function buildDealComments(order: Order): string {
  const comments: string[] = [];
  
  comments.push(`Zamówienie: ${order.orderNumber}`);
  comments.push(`Data: ${order.createdAt.toISOString().split('T')[0]}`);
  comments.push(`Wartość: ${order.total} PLN`);
  comments.push(`Status płatności: ${order.paymentStatus}`);
  
  if (order.paymentMethod) {
    comments.push(`Metoda płatności: ${order.paymentMethod}`);
  }
  
  if (order.trackingNumber) {
    comments.push(`Numer śledzenia: ${order.trackingNumber}`);
  }
  
  if (order.notes) {
    comments.push(`Uwagi: ${order.notes}`);
  }

  // Add customer information
  const customer = order.customer as any;
  comments.push(`\nKlient: ${customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim()}`);
  if (customer.email) {
    comments.push(`Email: ${customer.email}`);
  }
  if (customer.phone) {
    comments.push(`Telefon: ${customer.phone}`);
  }

  // Add shipping address
  const shippingAddress = order.shippingAddress as any;
  if (shippingAddress) {
    comments.push(`\nAdres dostawy:`);
    if (shippingAddress.street || shippingAddress.address) {
      comments.push(`${shippingAddress.street || shippingAddress.address}`);
    }
    if (shippingAddress.city) {
      comments.push(`${shippingAddress.postalCode || ''} ${shippingAddress.city}`.trim());
    }
    if (shippingAddress.country) {
      comments.push(shippingAddress.country);
    }
  }

  // Add product details
  if (order.items && order.items.length > 0) {
    comments.push('\nProdukty:');
    order.items.forEach((item, index) => {
      comments.push(`${index + 1}. ${item.productName} (${item.quantity}x) - ${item.subtotal} PLN`);
      
      if (item.configuration) {
        const config = item.configuration as any;
        if (config.carDetails) {
          const car = config.carDetails;
          comments.push(`   Samochód: ${car.brand} ${car.model} ${car.year || ''} ${car.body || ''}`);
        }
        if (config.setType) {
          comments.push(`   Typ zestawu: ${config.setType}`);
        }
        if (config.cellType) {
          comments.push(`   Struktura komórek: ${config.cellType}`);
        }
        if (config.materialColor) {
          comments.push(`   Kolor materiału: ${config.materialColor}`);
        }
        if (config.borderColor) {
          comments.push(`   Kolor obszycia: ${config.borderColor}`);
        }
        if (config.heelPad) {
          comments.push(`   Podkładka pod pięty: ${config.heelPad ? 'Tak' : 'Nie'}`);
        }
      }
    });
  }

  return comments.join('\n');
}

/**
 * Remove undefined values from object
 */
function removeUndefinedValues<T extends Record<string, any>>(obj: T): T {
  const result = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== '') {
      result[key as keyof T] = value;
    }
  }
  
  return result;
}

/**
 * Create deal products for Bitrix24
 */
export function createDealProducts(order: Order): Array<{
  PRODUCT_NAME: string;
  PRICE: number;
  QUANTITY: number;
  CURRENCY_ID: string;
}> {
  if (!order.items || order.items.length === 0) {
    return [];
  }

  return order.items.map(item => ({
    PRODUCT_NAME: item.productName,
    PRICE: Number(item.unitPrice),
    QUANTITY: item.quantity,
    CURRENCY_ID: 'PLN',
  }));
}

/**
 * Get deal stage based on order status
 */
export function getDealStageFromOrderStatus(orderStatus: string): string {
  const stageMap: Record<string, string> = {
    'pending': 'NEW',
    'confirmed': 'PREPARATION',
    'processing': 'PREPARATION',
    'shipped': 'PREPARATION',
    'delivered': 'WON',
    'cancelled': 'LOSE',
  };

  return stageMap[orderStatus] || 'NEW';
}

/**
 * Get deal stage based on payment status
 */
export function getDealStageFromPaymentStatus(paymentStatus: string): string {
  const stageMap: Record<string, string> = {
    'pending': 'NEW',
    'paid': 'PREPARATION',
    'failed': 'LOSE',
    'refunded': 'LOSE',
  };

  return stageMap[paymentStatus] || 'NEW';
}
