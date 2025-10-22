// Typy dla integracji z API Bitrix24

export interface BitrixResponse {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
}

// ===========================================
// BITRIX24 API TYPES
// ===========================================

export interface Bitrix24Contact {
  ID?: string;
  NAME: string;
  LAST_NAME?: string;
  EMAIL?: Array<{ VALUE: string; VALUE_TYPE: string }>;
  PHONE?: Array<{ VALUE: string; VALUE_TYPE: string }>;
  ADDRESS?: string;
  ADDRESS_CITY?: string;
  ADDRESS_POSTAL_CODE?: string;
  ADDRESS_COUNTRY?: string;
  COMPANY_TITLE?: string;
  COMMENTS?: string;
  SOURCE_ID?: string;
  SOURCE_DESCRIPTION?: string;
  UTM_SOURCE?: string;
  UTM_MEDIUM?: string;
  UTM_CAMPAIGN?: string;
}

export interface Bitrix24Deal {
  ID?: string;
  TITLE: string;
  STAGE_ID: string;
  OPPORTUNITY: number;
  CURRENCY_ID: string;
  CONTACT_ID?: string;
  COMMENTS?: string;
  // Custom fields for EVA Website integration - zaktualizowane na podstawie rzeczywistych pól Bitrix24
  
  // Podstawowe informacje o zamówieniu
  UF_CRM_ORDER_NUMBER?: string;
  UF_CRM_PAYMENT_METHOD?: string;
  UF_CRM_PAYMENT_STATUS?: string;
  UF_CRM_ORDER_DATE?: string;
  UF_CRM_ORDER_SOURCE?: string;
  
  // Sekcja AUTO - informacje o samochodzie
  UF_CRM_1760788285332?: string;        // Marka samochodu
  UF_CRM_1760788302371?: string;        // Model samochodu
  UF_CRM_1760788317619?: number;        // Rok samochodu (double)
  UF_CRM_1760788343011?: string;        // Typ nadwozia
  
  // Sekcja komplet - informacje o produkcie (wartości enum)
  UF_CRM_1757024835301?: number;        // Wariant kompletu
  UF_CRM_1757024931236?: number;        // Rodzaj kompletu
  UF_CRM_1757025126670?: number;        // Kształt komórek
  UF_CRM_1757177134448?: number;        // Kolor materiału
  UF_CRM_1757177281489?: number;        // Kolor obszycia
  
  // Dodatkowe informacje
  UF_CRM_SHIPPING_METHOD?: string;
  
  // Pozwala na dynamiczne dodawanie pól
  [key: string]: any;
}

export interface Bitrix24Lead {
  ID?: string;
  TITLE: string;
  NAME: string;
  LAST_NAME?: string;
  EMAIL?: Array<{ VALUE: string; VALUE_TYPE: string }>;
  PHONE?: Array<{ VALUE: string; VALUE_TYPE: string }>;
  SOURCE_ID?: string;
  STATUS_ID?: string;
  COMMENTS?: string;
  COMPANY_TITLE?: string;
  UTM_SOURCE?: string;
  UTM_MEDIUM?: string;
  UTM_CAMPAIGN?: string;
  // Dodatkowe niestandardowe pola dla leadów
  UF_CRM_LEAD_CUSTOM_1?: string;
  UF_CRM_LEAD_CUSTOM_2?: string;
  UF_CRM_LEAD_CUSTOM_3?: string;
  UF_CRM_LEAD_CUSTOM_4?: string;
  UF_CRM_LEAD_CUSTOM_5?: string;
  // Możesz dodać więcej pól według potrzeb
  [key: string]: any; // Pozwala na dynamiczne dodawanie pól
}

export interface Bitrix24Product {
  ID?: string;
  PRODUCT_NAME: string;
  PRICE: number;
  CURRENCY_ID: string;
  QUANTITY: number;
  MEASURE_CODE?: string;
  MEASURE_NAME?: string;
}

export interface Bitrix24DealProduct {
  PRODUCT_ID: string;
  QUANTITY: number;
  PRICE: number;
  DISCOUNT_TYPE_ID?: number;
  DISCOUNT_RATE?: number;
  DISCOUNT_SUM?: number;
}

// ===========================================
// API RESPONSE TYPES
// ===========================================

export interface Bitrix24ApiResponse<T = any> {
  result?: T;
  error?: {
    error: string;
    error_description: string;
    error_uri?: string;
  };
  next?: number;
  total?: number;
  time?: {
    start: number;
    finish: number;
    duration: number;
    processing: number;
    date_start: string;
    date_finish: string;
  };
}

export interface Bitrix24BatchResponse {
  result: {
    [key: string]: Bitrix24ApiResponse;
  };
  error?: {
    error: string;
    error_description: string;
  };
}

// ===========================================
// WEBHOOK TYPES
// ===========================================

export interface Bitrix24WebhookEvent {
  event: string;
  data: {
    FIELDS: Record<string, any>;
    [key: string]: any;
  };
  ts: number;
  auth: {
    domain: string;
    client_endpoint: string;
    server_endpoint: string;
  };
}

// ===========================================
// MAPPING TYPES
// ===========================================

export interface OrderToContactMapping {
  order: any; // Order type from the system
  contact: Bitrix24Contact;
}

export interface OrderToDealMapping {
  order: any; // Order type from the system
  deal: Bitrix24Deal;
  contactId: string;
}

export interface FormToLeadMapping {
  formData: any; // Form data from contact forms
  lead: Bitrix24Lead;
}

export interface BitrixOrder {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  carDetails: {
    brand: string;
    model: string;
    year: string;
    body: string;
    trans: string;
  };
  productDetails: {
    type: string;
    color: string;
    texture: string;
    variant: string;
    edgeColor: string;
    image: string;
  };
  shipping: {
    method: string;
    methodName: string;
    cost: number;
    estimatedDelivery: string;
  };
  payment: {
    method: string;
    methodName: string;
  };
  company: {
    name: string;
    nip: string;
    isInvoice: boolean;
  };
  pricing: {
    subtotal: number;
    shippingCost: number;
    discountAmount: number;
    totalAmount: number;
  };
  additional: {
    termsAccepted: boolean;
    newsletter: boolean;
    discountCode: string;
    discountApplied: boolean;
    notes: string;
  };
  metadata: {
    orderId: string;
    orderDate: Date;
    source: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
  };
  contactId?: string;
} 