import { z } from 'zod';

// ===========================================
// BITRIX24 VALIDATION SCHEMAS
// ===========================================

export const Bitrix24ContactSchema = z.object({
  NAME: z.string().min(1, 'Name is required'),
  LAST_NAME: z.string().optional(),
  EMAIL: z.array(z.object({
    VALUE: z.string().email('Invalid email format'),
    VALUE_TYPE: z.string().default('WORK')
  })).optional(),
  PHONE: z.array(z.object({
    VALUE: z.string().min(1, 'Phone number is required'),
    VALUE_TYPE: z.string().default('WORK')
  })).optional(),
  ADDRESS: z.string().optional(),
  ADDRESS_CITY: z.string().optional(),
  ADDRESS_POSTAL_CODE: z.string().optional(),
  ADDRESS_COUNTRY: z.string().optional(),
  COMPANY_TITLE: z.string().optional(),
  COMMENTS: z.string().optional(),
  SOURCE_ID: z.string().optional(),
  SOURCE_DESCRIPTION: z.string().optional(),
  UTM_SOURCE: z.string().optional(),
  UTM_MEDIUM: z.string().optional(),
  UTM_CAMPAIGN: z.string().optional(),
});

export const Bitrix24DealSchema = z.object({
  TITLE: z.string().min(1, 'Deal title is required'),
  STAGE_ID: z.string().min(1, 'Stage ID is required'),
  OPPORTUNITY: z.number().positive('Opportunity must be positive'),
  CURRENCY_ID: z.string().default('PLN'),
  CONTACT_ID: z.string().optional(),
  COMMENTS: z.string().optional(),
  // Custom fields
  UF_CRM_ORDER_NUMBER: z.string().optional(),
  UF_CRM_PAYMENT_METHOD: z.string().optional(),
  UF_CRM_PAYMENT_STATUS: z.string().optional(),
  UF_CRM_CAR_BRAND: z.string().optional(),
  UF_CRM_CAR_MODEL: z.string().optional(),
  UF_CRM_CAR_YEAR: z.string().optional(),
  UF_CRM_PRODUCT_TYPE: z.string().optional(),
  UF_CRM_PRODUCT_COLOR: z.string().optional(),
  UF_CRM_SHIPPING_METHOD: z.string().optional(),
  UF_CRM_ORDER_DATE: z.string().optional(),
  UF_CRM_ORDER_SOURCE: z.string().optional(),
});

export const Bitrix24LeadSchema = z.object({
  TITLE: z.string().min(1, 'Lead title is required'),
  NAME: z.string().min(1, 'Name is required'),
  LAST_NAME: z.string().optional(),
  EMAIL: z.array(z.object({
    VALUE: z.string().email('Invalid email format'),
    VALUE_TYPE: z.string().default('WORK')
  })).optional(),
  PHONE: z.array(z.object({
    VALUE: z.string().min(1, 'Phone number is required'),
    VALUE_TYPE: z.string().default('WORK')
  })).optional(),
  SOURCE_ID: z.string().optional(),
  STATUS_ID: z.string().optional(),
  COMMENTS: z.string().optional(),
  COMPANY_TITLE: z.string().optional(),
  UTM_SOURCE: z.string().optional(),
  UTM_MEDIUM: z.string().optional(),
  UTM_CAMPAIGN: z.string().optional(),
});

export const Bitrix24ProductSchema = z.object({
  PRODUCT_NAME: z.string().min(1, 'Product name is required'),
  PRICE: z.number().positive('Price must be positive'),
  CURRENCY_ID: z.string().default('PLN'),
  QUANTITY: z.number().positive('Quantity must be positive'),
  MEASURE_CODE: z.string().optional(),
  MEASURE_NAME: z.string().optional(),
});

export const Bitrix24DealProductSchema = z.object({
  PRODUCT_ID: z.string().min(1, 'Product ID is required'),
  QUANTITY: z.number().positive('Quantity must be positive'),
  PRICE: z.number().positive('Price must be positive'),
  DISCOUNT_TYPE_ID: z.number().optional(),
  DISCOUNT_RATE: z.number().optional(),
  DISCOUNT_SUM: z.number().optional(),
});

// ===========================================
// API RESPONSE VALIDATION
// ===========================================

export const Bitrix24ApiResponseSchema = z.object({
  result: z.any().optional(),
  error: z.object({
    error: z.string(),
    error_description: z.string(),
    error_uri: z.string().optional(),
  }).optional(),
  next: z.number().optional(),
  total: z.number().optional(),
  time: z.object({
    start: z.number(),
    finish: z.number(),
    duration: z.number(),
    processing: z.number(),
    date_start: z.string(),
    date_finish: z.string(),
  }).optional(),
});

export const Bitrix24WebhookEventSchema = z.object({
  event: z.string(),
  data: z.object({
    FIELDS: z.record(z.any()),
  }).and(z.record(z.any())),
  ts: z.number(),
  auth: z.object({
    domain: z.string(),
    client_endpoint: z.string(),
    server_endpoint: z.string(),
  }),
});

// ===========================================
// VALIDATION HELPERS
// ===========================================

export function validateBitrix24Contact(data: unknown) {
  return Bitrix24ContactSchema.parse(data);
}

export function validateBitrix24Deal(data: unknown) {
  return Bitrix24DealSchema.parse(data);
}

export function validateBitrix24Lead(data: unknown) {
  return Bitrix24LeadSchema.parse(data);
}

export function validateBitrix24Product(data: unknown) {
  return Bitrix24ProductSchema.parse(data);
}

export function validateBitrix24DealProduct(data: unknown) {
  return Bitrix24DealProductSchema.parse(data);
}

export function validateBitrix24ApiResponse(data: unknown) {
  return Bitrix24ApiResponseSchema.parse(data);
}

export function validateBitrix24WebhookEvent(data: unknown) {
  return Bitrix24WebhookEventSchema.parse(data);
}

// ===========================================
// TYPE EXPORTS
// ===========================================

export type Bitrix24ContactInput = z.infer<typeof Bitrix24ContactSchema>;
export type Bitrix24DealInput = z.infer<typeof Bitrix24DealSchema>;
export type Bitrix24LeadInput = z.infer<typeof Bitrix24LeadSchema>;
export type Bitrix24ProductInput = z.infer<typeof Bitrix24ProductSchema>;
export type Bitrix24DealProductInput = z.infer<typeof Bitrix24DealProductSchema>;
export type Bitrix24ApiResponseType = z.infer<typeof Bitrix24ApiResponseSchema>;
export type Bitrix24WebhookEventType = z.infer<typeof Bitrix24WebhookEventSchema>;
