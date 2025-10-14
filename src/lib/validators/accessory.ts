import { z } from 'zod';

export const AccessoryCategorySchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Nazwa kategorii jest wymagana'),
  slug: z.string().min(1, 'Slug jest wymagany'),
  description: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  parentId: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const AccessorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nazwa akcesorium jest wymagana'),
  slug: z.string().min(1, 'Slug jest wymagany'),
  description: z.string().optional(),
  price: z.number().positive('Cena musi być większa od 0'),
  sku: z.string().min(1, 'SKU jest wymagany'),
  imageSrc: z.string().url().optional(),
  features: z.array(z.string()).default([]),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().int().min(0).optional(),
  isActive: z.boolean().default(true),
  rating: z.number().min(1).max(5).optional(),
  reviewCount: z.number().int().min(0).default(0),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive()
  }).optional(),
  categoryId: z.number().int().positive('Kategoria jest wymagana'),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CreateAccessorySchema = AccessorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewCount: true
});

export const UpdateAccessorySchema = CreateAccessorySchema.partial().extend({
  id: z.string().uuid()
});

export const AccessoryFiltersSchema = z.object({
  categories: z.array(z.string()).optional(),
  inStock: z.boolean().optional(),
  priceRange: z.tuple([z.number(), z.number()]).optional(),
  orderBy: z.enum(['name', 'price', 'rating', 'createdAt']).optional(),
  orderDirection: z.enum(['asc', 'desc']).optional()
});

export type AccessoryCategoryInput = z.infer<typeof AccessoryCategorySchema>;
export type AccessoryInput = z.infer<typeof AccessorySchema>;
export type CreateAccessoryInput = z.infer<typeof CreateAccessorySchema>;
export type UpdateAccessoryInput = z.infer<typeof UpdateAccessorySchema>;
export type AccessoryFiltersInput = z.infer<typeof AccessoryFiltersSchema>;
