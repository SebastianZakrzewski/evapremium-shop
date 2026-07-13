import { z } from 'zod';
import {
  AccessoryConfigurationSchema,
  MatConfigurationSchema,
} from '@/features/vehicle-catalog/model/matConfiguration';

const CartItemConfigurationSchema = z.union([
  MatConfigurationSchema,
  AccessoryConfigurationSchema,
]);

export const CartItemSchema = z.object({
  id: z.string().min(1, 'ID pozycji jest wymagane'),
  quantity: z.number().int().positive('Ilość musi być większa od 0'),
  unitPrice: z.number().positive('Cena jednostkowa musi być większa od 0'),
  subtotal: z.number().positive('Wartość pozycji musi być większa od 0'),
  productType: z.enum(['accessory', 'mat'], {
    errorMap: () => ({ message: 'Typ produktu musi być "accessory" lub "mat"' })
  }),
  productId: z.string().min(1, 'ID produktu jest wymagane'),
  productName: z.string().min(1, 'Nazwa produktu jest wymagana'),
  productSku: z.string().optional(),
  productImage: z.string().url().optional(),
  configuration: CartItemConfigurationSchema.optional()
});

export const CartSchema = z.object({
  items: z.array(CartItemSchema).default([]),
  subtotal: z.number().min(0, 'Wartość netto nie może być ujemna'),
  shippingCost: z.number().min(0, 'Koszt dostawy nie może być ujemny'),
  tax: z.number().min(0, 'Podatek nie może być ujemny'),
  discount: z.number().min(0, 'Rabat nie może być ujemny'),
  total: z.number().min(0, 'Całkowita wartość nie może być ujemna'),
  itemCount: z.number().int().min(0, 'Liczba pozycji nie może być ujemna')
});

export const AddToCartSchema = z.object({
  productType: z.enum(['accessory', 'mat'], {
    errorMap: () => ({ message: 'Typ produktu musi być "accessory" lub "mat"' })
  }),
  productId: z.string().min(1, 'ID produktu jest wymagane'),
  quantity: z.number().int().positive('Ilość musi być większa od 0'),
  configuration: CartItemConfigurationSchema.optional()
});

export const UpdateCartItemSchema = z.object({
  itemId: z.string().min(1, 'ID pozycji jest wymagane'),
  quantity: z.number().int().positive('Ilość musi być większa od 0')
});

export const CartActionSchema = z.object({
  action: z.enum(['add', 'remove', 'update', 'clear'], {
    errorMap: () => ({ message: 'Akcja musi być: add, remove, update, lub clear' })
  }),
  cart: CartSchema,
  itemId: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  productType: z.enum(['accessory', 'mat']).optional(),
  productId: z.string().optional(),
  configuration: CartItemConfigurationSchema.optional()
});

export type CartItemInput = z.infer<typeof CartItemSchema>;
export type CartInput = z.infer<typeof CartSchema>;
export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;
export type CartActionInput = z.infer<typeof CartActionSchema>;
