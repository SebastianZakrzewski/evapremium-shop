/**
 * Order to Bitrix24 Contact Mapper
 * 
 * Maps EVA Website Order data to Bitrix24 Contact format
 */

import { Bitrix24Contact } from '@/lib/types/bitrix';
import { Order } from '@/lib/types/order-new';

export interface OrderToContactMappingOptions {
  sourceId?: string;
  sourceDescription?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

/**
 * Map Order to Bitrix24 Contact
 */
export function mapOrderToContact(
  order: Order, 
  options: OrderToContactMappingOptions = {}
): Bitrix24Contact {
  const customer = order.customer as any; // Type assertion for JSON field
  const shippingAddress = order.shippingAddress as any; // Type assertion for JSON field

  // Extract name parts
  const fullName = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Build contact data
  const contact: Bitrix24Contact = {
    NAME: firstName || 'Klient',
    LAST_NAME: lastName,
    EMAIL: customer.email ? [{
      VALUE: customer.email,
      VALUE_TYPE: 'WORK'
    }] : undefined,
    PHONE: customer.phone ? [{
      VALUE: customer.phone,
      VALUE_TYPE: 'WORK'
    }] : undefined,
    ADDRESS: shippingAddress?.street || shippingAddress?.address,
    ADDRESS_CITY: shippingAddress?.city,
    ADDRESS_POSTAL_CODE: shippingAddress?.postalCode,
    ADDRESS_COUNTRY: shippingAddress?.country || 'Polska',
    COMPANY_TITLE: customer.company || undefined,
    COMMENTS: buildContactComments(order),
    SOURCE_ID: options.sourceId || 'WEB',
    SOURCE_DESCRIPTION: options.sourceDescription || 'EVA Website',
    UTM_SOURCE: options.utmSource,
    UTM_MEDIUM: options.utmMedium,
    UTM_CAMPAIGN: options.utmCampaign,
  };

  // Remove undefined values
  return removeUndefinedValues(contact);
}

/**
 * Build contact comments from order data
 */
function buildContactComments(order: Order): string {
  const comments: string[] = [];
  
  comments.push(`Zamówienie: ${order.orderNumber}`);
  comments.push(`Data: ${order.createdAt.toISOString().split('T')[0]}`);
  comments.push(`Wartość: ${order.total} PLN`);
  
  if (order.paymentMethod) {
    comments.push(`Płatność: ${order.paymentMethod}`);
  }
  
  if (order.notes) {
    comments.push(`Uwagi: ${order.notes}`);
  }

  // Add product information
  if (order.items && order.items.length > 0) {
    comments.push('\nProdukty:');
    order.items.forEach((item, index) => {
      comments.push(`${index + 1}. ${item.productName} (${item.quantity}x)`);
      if (item.configuration) {
        const config = item.configuration as any;
        if (config.carDetails) {
          const car = config.carDetails;
          comments.push(`   Samochód: ${car.brand} ${car.model} ${car.year || ''} ${car.body || ''}`);
        }
        if (config.setType) {
          comments.push(`   Typ zestawu: ${config.setType}`);
        }
        if (config.materialColor) {
          comments.push(`   Kolor materiału: ${config.materialColor}`);
        }
        if (config.borderColor) {
          comments.push(`   Kolor obszycia: ${config.borderColor}`);
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
    if (value !== undefined) {
      result[key as keyof T] = value;
    }
  }
  
  return result;
}

/**
 * Extract UTM parameters from order metadata
 */
export function extractUtmParameters(order: Order): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  const metadata = order as any; // Type assertion for potential metadata field
  
  return {
    utmSource: metadata.utmSource || metadata.utm_source,
    utmMedium: metadata.utmMedium || metadata.utm_medium,
    utmCampaign: metadata.utmCampaign || metadata.utm_campaign,
  };
}

/**
 * Create contact title from order data
 */
export function createContactTitle(order: Order): string {
  const customer = order.customer as any;
  const name = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
  
  if (customer.company) {
    return `${name} (${customer.company})`;
  }
  
  return name || `Klient ${order.orderNumber}`;
}
