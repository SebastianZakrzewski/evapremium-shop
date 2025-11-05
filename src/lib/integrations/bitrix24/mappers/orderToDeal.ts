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
  console.log('🔍 mapOrderToDeal: Starting mapping for order:', {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    itemsCount: order.items?.length || 0,
    contactId,
    options
  });

  const customer = order.customer as any; // Type assertion for JSON field
  const shippingAddress = order.shippingAddress as any; // Type assertion for JSON field

  // Log order items details
  console.log('🔍 mapOrderToDeal: Order items:', order.items?.map(item => ({
    productType: item.productType,
    productName: item.productName,
    hasConfiguration: !!item.configuration,
    configuration: item.configuration
  })) || 'No items');

  // Extract car details from first mat item
  const carDetails = extractCarDetails(order);
  console.log('🔍 mapOrderToDeal: Extracted car details:', carDetails);
  
  // Extract product details
  const productVariant = extractProductVariant(order);
  const productType = extractProductType(order);
  const setType = extractSetType(order);
  const cellShape = extractCellShape(order);
  const materialColor = extractMaterialColor(order);
  const trimColor = extractTrimColor(order);
  
  // Walidacja - sprawdź czy order ma items typu 'mat'
  const hasMatItems = order.items?.some(item => item.productType === 'mat');
  if (!hasMatItems) {
    console.warn('⚠️ mapOrderToDeal: Order has no mat items, using default values for product fields');
  }
  
  console.log('🔍 mapOrderToDeal: Extracted product details:', {
    productVariant,
    productType,
    setType,
    cellShape,
    materialColor,
    trimColor,
    hasMatItems,
    itemsCount: order.items?.length || 0,
    matItemsCount: order.items?.filter(item => item.productType === 'mat').length || 0
  });
  
  // Build deal data
  const deal: Bitrix24Deal = {
    TITLE: `Zamówienie ${order.orderNumber}`,
    STAGE_ID: options.stageId || 'NEW',
    OPPORTUNITY: Number(order.total),
    CURRENCY_ID: options.currencyId || 'PLN',
    CONTACT_ID: contactId,
    CATEGORY_ID: 0, // Deale / Zamówienia ze strony opłacone
    
    // ✅ POLA IDENTYFIKACYJNE - dodane na podstawie analizy deala
    ORIGINATOR_ID: 'EVA Website',
    ORIGIN_ID: order.orderNumber, // Numer zamówienia
    SOURCE_ID: 'WEB',
    SOURCE_DESCRIPTION: 'EVA Website',
    COMMENTS: buildDealComments(order),
    
    // ✅ POLA NIESTANDARDOWE ZAMÓWIENIA - dodane na podstawie analizy deala
    UF_CRM_ORDER_NUMBER: order.orderNumber,        // Numer zamówienia
    UF_CRM_PAYMENT_STATUS: order.paymentStatus,    // Status płatności
    UF_CRM_PAYMENT_METHOD: order.paymentMethod,    // Metoda płatności
    UF_CRM_ORDER_DATE: order.createdAt.toISOString().split('T')[0], // Data zamówienia
    UF_CRM_ORDER_SOURCE: "EVA Website",            // Źródło zamówienia
    
    // ✅ POLA SAMOCHODU - działają poprawnie
    UF_CRM_1760788285332: carDetails.brand,        // Marka samochodu
    UF_CRM_1760788302371: carDetails.model,        // Model samochodu
    UF_CRM_1760788317619: carDetails.year ? Number(carDetails.year) : undefined, // Rok samochodu (double)
    UF_CRM_1760788343011: carDetails.body,         // Typ nadwozia
    
    // ✅ POLA PRODUKTU - działają poprawnie (wartości enum)
    UF_CRM_1757024835301: setType,           // Rodzaj kompletu (setType)
    UF_CRM_1757024931236: productVariant,    // Wariant kompletu (setVariant)
    UF_CRM_1757025126670: cellShape,         // Kształt komórek
    UF_CRM_1757177134448: materialColor,     // Kolor materiału
    UF_CRM_1757177281489: trimColor,         // Kolor obszycia
    
    // ✅ DODATKOWE INFORMACJE
    UF_CRM_SHIPPING_METHOD: extractShippingMethod(order),
  };

  console.log('🔍 mapOrderToDeal: Built deal object before removing undefined values:', deal);

  // Remove undefined values
  const cleanedDeal = removeUndefinedValues(deal);
  console.log('🔍 mapOrderToDeal: Final deal object after cleaning:', cleanedDeal);
  
  return cleanedDeal;
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
  console.log('🔍 extractCarDetails: Starting extraction for order:', order.orderNumber);
  
  if (!order.items || order.items.length === 0) {
    console.log('🔍 extractCarDetails: No items found in order');
    return {};
  }

  console.log('🔍 extractCarDetails: Looking for mat items with configuration...');
  
  // Look for mat items with car configuration
  const matItem = order.items.find(item => 
    item.productType === 'mat' && item.configuration
  );

  if (!matItem) {
    console.log('🔍 extractCarDetails: No mat items with configuration found');
    return {};
  }

  console.log('🔍 extractCarDetails: Found mat item:', {
    productName: matItem.productName,
    hasConfiguration: !!matItem.configuration,
    configuration: matItem.configuration
  });

  if (matItem.configuration) {
    const config = matItem.configuration as any;
    console.log('🔍 extractCarDetails: Configuration object:', config);
    console.log('🔍 extractCarDetails: Configuration keys:', Object.keys(config));
    console.log('🔍 extractCarDetails: Has carDetails?', !!config.carDetails);
    
    if (config.carDetails) {
      console.log('🔍 extractCarDetails: carDetails object:', config.carDetails);
      console.log('🔍 extractCarDetails: carDetails keys:', Object.keys(config.carDetails));
      
      const carDetails = {
        brand: config.carDetails.brand,
        model: config.carDetails.model,
        year: config.carDetails.year,
        body: config.carDetails.bodyType, // Naprawione: bodyType zamiast body
      };
      console.log('🔍 extractCarDetails: Extracted car details:', carDetails);
      console.log('🔍 extractCarDetails: Car details validation:', {
        hasBrand: !!carDetails.brand,
        hasModel: !!carDetails.model,
        hasYear: !!carDetails.year,
        hasBody: !!carDetails.body,
        brandValue: carDetails.brand,
        modelValue: carDetails.model,
        yearValue: carDetails.year,
        bodyValue: carDetails.body
      });
      return carDetails;
    } else {
      console.log('🔍 extractCarDetails: No carDetails found in configuration');
      console.log('🔍 extractCarDetails: Available configuration keys:', Object.keys(config));
    }
  }

  console.log('🔍 extractCarDetails: Returning empty car details');
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
      if (config.edgeColor) {
        colors.push(`Obszycie: ${config.edgeColor}`);
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
  
  // Safe date formatting - handle missing createdAt
  if (order.createdAt && order.createdAt instanceof Date && !isNaN(order.createdAt.getTime())) {
    comments.push(`Data: ${order.createdAt.toISOString().split('T')[0]}`);
  } else {
    // Fallback to current date if createdAt is missing or invalid
    const fallbackDate = new Date().toISOString().split('T')[0];
    comments.push(`Data: ${fallbackDate}`);
    console.warn('⚠️ buildDealComments: order.createdAt is missing or invalid, using current date');
  }
  
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
          comments.push(`   Samochód: ${car.brand} ${car.model} ${car.year || ''} ${car.bodyType || ''}`);
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
        if (config.edgeColor) {
          comments.push(`   Kolor obszycia: ${config.edgeColor}`);
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
  const removedFields: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    // Keep the field if:
    // - value is not undefined
    // - value is not an empty string (except for some special cases)
    // - value is 0 (for numeric fields like year)
    // - value is false (for boolean fields)
    const shouldKeep = value !== undefined && 
                      (value !== '' || key.includes('SHIPPING_METHOD')) && // Keep shipping method even if empty
                      value !== null;
    
    if (shouldKeep) {
      result[key as keyof T] = value;
    } else {
      removedFields.push(`${key}: ${value}`);
    }
  }
  
  if (removedFields.length > 0) {
    console.log('🔍 removeUndefinedValues: Removed fields:', removedFields);
  } else {
    console.log('🔍 removeUndefinedValues: No fields removed');
  }
  
  console.log('🔍 removeUndefinedValues: Final field count:', {
    original: Object.keys(obj).length,
    cleaned: Object.keys(result).length,
    removed: removedFields.length
  });
  
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
  console.log('🔍 extractProductVariant: Starting extraction for order:', order.orderNumber);
  
  // Mapowanie wariantu produktu na ID enum w Bitrix24
  const variantMap: Record<string, number> = {
    'front': 270,      // Przód
    'basic': 274,      // Przód + Tył
    'premium': 276,    // Przód + Tył + Bagażnik
    'complete': 272,   // Tył (jako fallback dla complete)
  };
  
  const firstItem = order.items?.[0];
  if (!firstItem) {
    console.log('🔍 extractProductVariant: No items found, using default value');
    return 274; // Domyślnie "Przód + Tył"
  }
  
  // Sprawdź czy item jest typu 'mat' i ma configuration
  if (firstItem.productType !== 'mat' || !firstItem.configuration) {
    console.log('🔍 extractProductVariant: Item is not mat or has no configuration, using default value');
    return 274; // Domyślnie "Przód + Tył"
  }
  
  const variant = (firstItem.configuration as any)?.setVariant || 'basic';
  const result = variantMap[variant] || 274; // Domyślnie "Przód + Tył"
  
  console.log('🔍 extractProductVariant: Result:', {
    firstItemProductType: firstItem.productType,
    hasConfiguration: !!firstItem.configuration,
    variant,
    result,
    mappedValue: variantMap[variant] ? `${variant} -> ${result}` : `${variant} -> default (274)`
  });
  
  return result;
}

/**
 * Extract product type (enum value)
 */
function extractProductType(order: Order): number | undefined {
  console.log('🔍 extractProductType: Starting extraction for order:', order.orderNumber);
  
  // Mapowanie typu produktu na ID enum w Bitrix24
  const typeMap: Record<string, number> = {
    'mat': 274,        // Dywaniki samochodowe
    'accessory': 276,  // Akcesoria
  };
  
  const firstItem = order.items?.[0];
  if (!firstItem) {
    console.log('🔍 extractProductType: No items found');
    return undefined;
  }
  
  const result = typeMap[firstItem.productType] || 274; // Domyślnie 274
  
  console.log('🔍 extractProductType: Result:', {
    firstItemProductType: firstItem.productType,
    result
  });
  
  return result;
}

/**
 * Extract set type (enum value)
 */
function extractSetType(order: Order): number | undefined {
  console.log('🔍 extractSetType: Starting extraction for order:', order.orderNumber);
  
  // Mapowanie typu zestawu na ID enum w Bitrix24
  const setTypeMap: Record<string, number> = {
    '3d-with-rims': 264,  // 3D EVAPREMIUM
    'classic': 266,       // Klasyczne EVAPREMIUM
  };
  
  const firstItem = order.items?.[0];
  if (!firstItem) {
    console.log('🔍 extractSetType: No items found, using default value');
    return 264; // Domyślnie "3D EVAPREMIUM"
  }
  
  // Sprawdź czy item jest typu 'mat' i ma configuration
  if (firstItem.productType !== 'mat' || !firstItem.configuration) {
    console.log('🔍 extractSetType: Item is not mat or has no configuration, using default value');
    return 264; // Domyślnie "3D EVAPREMIUM"
  }
  
  const config = firstItem.configuration as any;
  const setType = config.setType || '3d-with-rims';
  const result = setTypeMap[setType] || 264; // Domyślnie "3D EVAPREMIUM"
  
  console.log('🔍 extractSetType: Result:', {
    firstItemProductType: firstItem.productType,
    hasConfiguration: !!firstItem.configuration,
    setType,
    result,
    mappedValue: setTypeMap[setType] ? `${setType} -> ${result}` : `${setType} -> default (264)`
  });
  
  return result;
}

/**
 * Extract cell shape (enum value)
 */
function extractCellShape(order: Order): number | undefined {
  console.log('🔍 extractCellShape: Starting extraction for order:', order.orderNumber);
  
  // Mapowanie kształtu komórek na ID enum w Bitrix24
  const shapeMap: Record<string, number> = {
    'diamonds': 278,   // Romby
    'honey': 280,      // Plaster miodu
  };
  
  const firstItem = order.items?.[0];
  if (!firstItem) {
    console.log('🔍 extractCellShape: No items found');
    return undefined;
  }
  
  const shape = (firstItem.configuration as any)?.cellType || 'diamonds';
  const result = shapeMap[shape] || 278; // Domyślnie 278
  
  console.log('🔍 extractCellShape: Result:', {
    firstItemProductType: firstItem.productType,
    configuration: firstItem.configuration,
    shape,
    result
  });
  
  return result;
}

/**
 * Extract material color (enum value)
 */
function extractMaterialColor(order: Order): number | undefined {
  console.log('🔍 extractMaterialColor: Starting extraction for order:', order.orderNumber);
  
  // Mapowanie koloru materiału na ID enum w Bitrix24
  const colorMap: Record<string, number> = {
    'blue': 358,       // Niebieski
    'black': 360,      // Czarny
    'gray': 362,       // Szary
    'brown': 364,      // Brązowy
    'beige': 366,      // Beżowy
  };
  
  const firstItem = order.items?.[0];
  if (!firstItem || !firstItem.configuration) {
    console.log('🔍 extractMaterialColor: No items or configuration found');
    return undefined;
  }
  
  const config = firstItem.configuration as any;
  const materialColor = config.materialColor || 'black';
  const result = colorMap[materialColor] || 358; // Domyślnie blue
  
  console.log('🔍 extractMaterialColor: Result:', {
    firstItemProductType: firstItem.productType,
    configuration: firstItem.configuration,
    materialColor,
    result
  });
  
  return result;
}

/**
 * Extract trim color (enum value)
 */
function extractTrimColor(order: Order): number | undefined {
  console.log('🔍 extractTrimColor: Starting extraction for order:', order.orderNumber);
  
  // Mapowanie koloru obszycia na ID enum w Bitrix24
  const trimColorMap: Record<string, number> = {
    'blue': 368,       // Niebieski
    'black': 370,      // Czarny
    'gray': 372,       // Szary
    'brown': 374,      // Brązowy
    'beige': 376,      // Beżowy
  };
  
  const firstItem = order.items?.[0];
  if (!firstItem || !firstItem.configuration) {
    console.log('🔍 extractTrimColor: No items or configuration found');
    return undefined;
  }
  
  const config = firstItem.configuration as any;
  const trimColor = config.edgeColor || 'black';
  const result = trimColorMap[trimColor] || 370; // Domyślnie black
  
  console.log('🔍 extractTrimColor: Result:', {
    firstItemProductType: firstItem.productType,
    configuration: firstItem.configuration,
    trimColor,
    result
  });
  
  return result;
}

