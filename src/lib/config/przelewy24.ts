import { z } from 'zod';

// Schema walidacji zmiennych środowiskowych Przelewy24
const przelewy24ConfigSchema = z.object({
  P24_MERCHANT_ID: z.string().min(1, 'P24_MERCHANT_ID is required'),
  P24_POS_ID: z.string().min(1, 'P24_POS_ID is required'),
  P24_API_KEY: z.string().min(1, 'P24_API_KEY is required'),
  P24_CRC_KEY: z.string().min(1, 'P24_CRC_KEY is required'),
  P24_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
  P24_WEBHOOK_SECRET: z.string().optional(),
});

// Walidacja i eksport konfiguracji
const config = przelewy24ConfigSchema.parse({
  P24_MERCHANT_ID: process.env.P24_MERCHANT_ID || 'ef0b16e0',
  P24_POS_ID: process.env.P24_POS_ID || 'ef0b16e0',
  P24_API_KEY: process.env.P24_API_KEY || '1522d8628486e9e78a320967921470bc',
  P24_CRC_KEY: process.env.P24_CRC_KEY || 'c99c68557cffe9f8',
  P24_ENVIRONMENT: process.env.P24_ENVIRONMENT || 'sandbox',
  P24_WEBHOOK_SECRET: process.env.P24_WEBHOOK_SECRET || 'test_webhook_secret',
});

// Debug: sprawdź czy dane są prawidłowo ładowane
console.log('🔧 P24 Config Debug:', {
  P24_MERCHANT_ID: process.env.P24_MERCHANT_ID ? 'LOADED' : 'FALLBACK',
  P24_POS_ID: process.env.P24_POS_ID ? 'LOADED' : 'FALLBACK',
  P24_API_KEY: process.env.P24_API_KEY ? 'LOADED' : 'FALLBACK',
  P24_CRC_KEY: process.env.P24_CRC_KEY ? 'LOADED' : 'FALLBACK',
  P24_ENVIRONMENT: process.env.P24_ENVIRONMENT ? 'LOADED' : 'FALLBACK',
});

// URL-e API w zależności od środowiska
export const P24_URLS = {
  sandbox: 'https://sandbox.przelewy24.pl',
  production: 'https://secure.przelewy24.pl',
} as const;

export const P24_CONFIG = {
  merchantId: parseInt(config.P24_MERCHANT_ID, 16), // Hex string -> decimal
  posId: parseInt(config.P24_POS_ID, 16), // Hex string -> decimal
  apiKey: config.P24_API_KEY,
  crcKey: config.P24_CRC_KEY,
  environment: config.P24_ENVIRONMENT,
  webhookSecret: config.P24_WEBHOOK_SECRET,
  baseUrl: P24_URLS[config.P24_ENVIRONMENT],
} as const;

// Typy dla konfiguracji
export type Przelewy24Config = typeof P24_CONFIG;
export type Przelewy24Environment = keyof typeof P24_URLS;
