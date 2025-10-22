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
    // Custom fields for EVA Website integration - zaktualizowane na podstawie rzeczywistych pól Bitrix24
    
    // Podstawowe informacje o zamówieniu - używamy istniejących pól
    ORIGINATOR_ID: 'EVA Website',
    ORIGIN_ID: order.orderNumber, // Numer zamówienia
    SOURCE_ID: 'WEB',
    SOURCE_DESCRIPTION: 'EVA Website',
    COMMENTS: buildDealComments(order),
    
    // Sekcja AUTO - informacje o samochodzie
    UF_CRM_1760788285332: carDetails.brand,        // Marka samochodu
    UF_CRM_1760788302371: carDetails.model,        // Model samochodu
    UF_CRM_1760788317619: carDetails.year ? Number(carDetails.year) : undefined, // Rok samochodu (double)
    UF_CRM_1760788343011: carDetails.body,         // Typ nadwozia
    
    // Sekcja komplet - informacje o produkcie (wartości enum)
    UF_CRM_1757024835301: extractProductVariant(order),    // Wariant kompletu
    UF_CRM_1757024931236: extractProductType(order),       // Rodzaj kompletu
    UF_CRM_1757025126670: extractCellShape(order),         // Kształt komórek
    UF_CRM_1757177134448: extractMaterialColor(order),     // Kolor materiału
    UF_CRM_1757177281489: extractTrimColor(order),         // Kolor obszycia
    
    // Dodatkowe informacje
    UF_CRM_SHIPPING_METHOD: extractShippingMethod(order),
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
 * Extract product variant (enum value)
 */
function extractProductVariant(order: Order): number | undefined {
  // Mapowanie wariantu produktu na ID enum w Bitrix24
  // Przykład: jeśli order ma wariant "premium", zwróć 264
  const variantMap: Record<string, number> = {
    'standard': 264,
    'premium': 264,
    'luxury': 264,
  };
  
  const firstItem = order.items?.[0];
  if (!firstItem) return undefined;
  
  const variant = (firstItem.configuration as any)?.variant || 'standard';
  return variantMap[variant] || 264; // Domyślnie 264
}

/**
 * Extract product type (enum value)
 */
function extractProductType(order: Order): number | undefined {
  // Mapowanie typu produktu na ID enum w Bitrix24
  const typeMap: Record<string, number> = {
    'mat': 274,
    'accessory': 274,
  };
  
  const firstItem = order.items?.[0];
  if (!firstItem) return undefined;
  
  return typeMap[firstItem.productType] || 274; // Domyślnie 274
}

/**
 * Extract cell shape (enum value)
 */
function extractCellShape(order: Order): number | undefined {
  // Mapowanie kształtu komórek na ID enum w Bitrix24
  const shapeMap: Record<string, number> = {
    'standard': 278,
    'premium': 278,
    'luxury': 278,
  };
  
  const firstItem = order.items?.[0];
  if (!firstItem) return undefined;
  
  const shape = (firstItem.configuration as any)?.cellShape || 'standard';
  return shapeMap[shape] || 278; // Domyślnie 278
}

/**
 * Extract material color (enum value)
 */
function extractMaterialColor(order: Order): number | undefined {
  // Mapowanie koloru materiału na ID enum w Bitrix24
  const colorMap: Record<string, number> = {
    'black': 358,
    'gray': 358,
    'brown': 358,
    'beige': 358,
  };
  
  const firstItem = order.items?.[0];
  if (!firstItem || !firstItem.configuration) return undefined;
  
  const config = firstItem.configuration as any;
  const materialColor = config.materialColor || 'black';
  return colorMap[materialColor] || 358; // Domyślnie 358
}

/**
 * Extract trim color (enum value)
 */
function extractTrimColor(order: Order): number | undefined {
  // Mapowanie koloru obszycia na ID enum w Bitrix24
  const trimColorMap: Record<string, number> = {
    'black': 362,
    'gray': 362,
    'brown': 362,
    'beige': 362,
  };
  
  const firstItem = order.items?.[0];
  if (!firstItem || !firstItem.configuration) return undefined;
  
  const config = firstItem.configuration as any;
  const trimColor = config.borderColor || 'black';
  return trimColorMap[trimColor] || 362; // Domyślnie 362
}
