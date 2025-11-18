import { z } from 'zod';

export const CustomerDataSchema = z.object({
  name: z.string().min(1, 'Imię i nazwisko jest wymagane'),
  email: z.string().email('Nieprawidłowy adres email'),
  phone: z.string().min(9, 'Numer telefonu musi mieć co najmniej 9 cyfr'),
  company: z.string().optional()
});

export const AddressDataSchema = z.object({
  street: z.string().min(1, 'Ulica jest wymagana'),
  city: z.string().min(1, 'Miasto jest wymagane'),
  postalCode: z.string().regex(/^\d{2}-\d{3}$/, 'Nieprawidłowy kod pocztowy (format: XX-XXX)'),
  country: z.string().min(1, 'Kraj jest wymagany')
});

// Bazowy schema bez refine (używany do CreateOrderItemSchema)
const OrderItemBaseSchema = z.object({
  id: z.string().uuid(),
  quantity: z.number().int().positive('Ilość musi być większa od 0'),
  unitPrice: z.number().positive('Cena jednostkowa musi być większa od 0'),
  subtotal: z.number().positive('Wartość pozycji musi być większa od 0'),
  productType: z.enum(['accessory', 'mat'], {
    errorMap: () => ({ message: 'Typ produktu musi być "accessory" lub "mat"' })
  }),
  productId: z.string().uuid('Nieprawidłowy ID produktu').nullable().optional(),
  productName: z.string().min(1, 'Nazwa produktu jest wymagana'),
  productSku: z.string().optional(),
  productImage: z.string().url().optional(),
  configuration: z.any().optional(), // JSONB for mat configuration
  orderId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const OrderItemSchema = OrderItemBaseSchema.refine(
  (data) => {
    // Dla akcesoriów productId jest wymagany (UUID)
    // Dla matów productId może być null (produkty konfigurowane)
    if (data.productType === 'accessory') {
      return data.productId !== null && data.productId !== undefined;
    }
    return true; // Dla matów productId może być null
  },
  {
    message: 'productId jest wymagany dla akcesoriów',
    path: ['productId']
  }
);

export const OrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().min(1, 'Numer zamówienia jest wymagany'),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']),
  paymentMethod: z.string().optional(),
  trackingNumber: z.string().optional(),
  customer: CustomerDataSchema,
  shippingAddress: AddressDataSchema,
  billingAddress: AddressDataSchema.optional(),
  subtotal: z.number().min(0, 'Wartość netto nie może być ujemna'),
  shippingCost: z.number().min(0, 'Koszt dostawy nie może być ujemny'),
  tax: z.number().min(0, 'Podatek nie może być ujemny'),
  discount: z.number().min(0, 'Rabat nie może być ujemny'),
  total: z.number().positive('Całkowita wartość musi być większa od 0'),
  notes: z.string().optional(),
  shippedAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  items: z.array(OrderItemSchema),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CreateOrderItemSchema = OrderItemBaseSchema.omit({
  id: true,
  orderId: true,
  createdAt: true,
  updatedAt: true
}).refine(
  (data) => {
    // Dla akcesoriów productId jest wymagany (UUID)
    // Dla matów productId może być null (produkty konfigurowane)
    if (data.productType === 'accessory') {
      return data.productId !== null && data.productId !== undefined;
    }
    return true; // Dla matów productId może być null
  },
  {
    message: 'productId jest wymagany dla akcesoriów',
    path: ['productId']
  }
);

export const CreateOrderSchema = z.object({
  customer: CustomerDataSchema,
  shippingAddress: AddressDataSchema,
  billingAddress: AddressDataSchema.optional(),
  paymentMethod: z.string().min(1, 'Metoda płatności jest wymagana'),
  notes: z.string().optional(),
  items: z.array(CreateOrderItemSchema).min(1, 'Zamówienie musi zawierać co najmniej jedną pozycję')
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  trackingNumber: z.string().optional()
});

export type CustomerDataInput = z.infer<typeof CustomerDataSchema>;
export type AddressDataInput = z.infer<typeof AddressDataSchema>;
export type OrderItemInput = z.infer<typeof OrderItemSchema>;
export type OrderInput = z.infer<typeof OrderSchema>;
export type CreateOrderItemInput = z.infer<typeof CreateOrderItemSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
