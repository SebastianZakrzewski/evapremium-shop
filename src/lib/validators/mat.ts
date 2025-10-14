import { z } from 'zod';

export const MatSchema = z.object({
  id: z.string().uuid(),
  carBrandSlug: z.string().min(1, 'Marka samochodu jest wymagana'),
  carModelSlug: z.string().min(1, 'Model samochodu jest wymagany'),
  generation: z.string().optional(),
  bodyType: z.string().optional(),
  yearFrom: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  yearTo: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  basePrice: z.number().positive('Cena bazowa musi być większa od 0'),
  availableSetTypes: z.array(z.string()).min(1, 'Dostępne typy zestawów są wymagane'),
  availableCellTypes: z.array(z.string()).min(1, 'Dostępne typy komórek są wymagane'),
  availableColors: z.array(z.string()).min(1, 'Dostępne kolory są wymagane'),
  availableEdgeColors: z.array(z.string()).min(1, 'Dostępne kolory obszycia są wymagane'),
  hasHeelPad: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
}).refine(
  (data) => !data.yearFrom || !data.yearTo || data.yearFrom <= data.yearTo,
  {
    message: 'Rok początkowy nie może być większy od końcowego',
    path: ['yearFrom']
  }
);

export const MatConfigurationSchema = z.object({
  carDetails: z.object({
    brand: z.string().min(1, 'Marka jest wymagana'),
    model: z.string().min(1, 'Model jest wymagany'),
    generation: z.string().optional(),
    bodyType: z.string().optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1)
  }),
  setType: z.string().min(1, 'Typ zestawu jest wymagany'),
  cellType: z.string().min(1, 'Typ komórek jest wymagany'),
  materialColor: z.string().min(1, 'Kolor materiału jest wymagany'),
  edgeColor: z.string().min(1, 'Kolor obszycia jest wymagany'),
  heelPad: z.enum(['yes', 'no']).default('no')
});

export const CreateMatSchema = z.object({
  carBrandSlug: z.string().min(1, 'Marka samochodu jest wymagana'),
  carModelSlug: z.string().min(1, 'Model samochodu jest wymagany'),
  generation: z.string().optional(),
  bodyType: z.string().optional(),
  yearFrom: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  yearTo: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  basePrice: z.number().positive('Cena bazowa musi być większa od 0'),
  availableSetTypes: z.array(z.string()).min(1, 'Dostępne typy zestawów są wymagane'),
  availableCellTypes: z.array(z.string()).min(1, 'Dostępne typy komórek są wymagane'),
  availableColors: z.array(z.string()).min(1, 'Dostępne kolory są wymagane'),
  availableEdgeColors: z.array(z.string()).min(1, 'Dostępne kolory obszycia są wymagane'),
  hasHeelPad: z.boolean().default(false),
  isActive: z.boolean().default(true)
}).refine(
  (data) => !data.yearFrom || !data.yearTo || data.yearFrom <= data.yearTo,
  {
    message: 'Rok początkowy nie może być większy od końcowego',
    path: ['yearFrom']
  }
);

export const UpdateMatSchema = z.object({
  id: z.string().uuid(),
  carBrandSlug: z.string().min(1, 'Marka samochodu jest wymagana').optional(),
  carModelSlug: z.string().min(1, 'Model samochodu jest wymagany').optional(),
  generation: z.string().optional(),
  bodyType: z.string().optional(),
  yearFrom: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  yearTo: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  basePrice: z.number().positive('Cena bazowa musi być większa od 0').optional(),
  availableSetTypes: z.array(z.string()).min(1, 'Dostępne typy zestawów są wymagane').optional(),
  availableCellTypes: z.array(z.string()).min(1, 'Dostępne typy komórek są wymagane').optional(),
  availableColors: z.array(z.string()).min(1, 'Dostępne kolory są wymagane').optional(),
  availableEdgeColors: z.array(z.string()).min(1, 'Dostępne kolory obszycia są wymagane').optional(),
  hasHeelPad: z.boolean().optional(),
  isActive: z.boolean().optional()
});

export const MatFiltersSchema = z.object({
  carBrandSlug: z.string().optional(),
  carModelSlug: z.string().optional(),
  generation: z.string().optional(),
  bodyType: z.string().optional(),
  yearFrom: z.number().int().optional(),
  yearTo: z.number().int().optional(),
  isActive: z.boolean().optional(),
  orderBy: z.enum(['basePrice', 'createdAt']).optional(),
  orderDirection: z.enum(['asc', 'desc']).optional()
});

export type MatInput = z.infer<typeof MatSchema>;
export type MatConfigurationInput = z.infer<typeof MatConfigurationSchema>;
export type CreateMatInput = z.infer<typeof CreateMatSchema>;
export type UpdateMatInput = z.infer<typeof UpdateMatSchema>;
export type MatFiltersInput = z.infer<typeof MatFiltersSchema>;
