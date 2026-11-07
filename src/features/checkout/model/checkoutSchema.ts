import { z } from "zod"

export const checkoutSchema = z.object({
  firstName: z.string().min(2, "Imię musi mieć minimum 2 znaki"),
  lastName: z.string().min(2, "Nazwisko musi mieć minimum 2 znaki"),
  email: z.string().email("Nieprawidłowy adres email"),
  phone: z.string().min(9, "Nieprawidłowy numer telefonu"),
  street: z.string().min(5, "Ulica musi mieć minimum 5 znaków"),
  postalCode: z.string().min(5, "Nieprawidłowy kod pocztowy"),
  city: z.string().min(2, "Miasto musi mieć minimum 2 znaki"),
  country: z.string().min(2, "Kraj musi mieć minimum 2 znaki"),
  sameAsShipping: z.boolean(),
  billingStreet: z.string().optional(),
  billingPostalCode: z.string().optional(),
  billingCity: z.string().optional(),
  billingCountry: z.string().optional(),
  nip: z.string()
    .optional()
    .refine(
      (val) => !val || val.trim() === '' || /^\d{10}$/.test(val.replace(/[\s-]/g, '')),
      { message: "NIP musi składać się z 10 cyfr" }
    )
    .transform((val) => {
      const cleaned = val?.replace(/[\s-]/g, '')
      return cleaned && cleaned.length === 10 ? cleaned : undefined
    }),
  paymentMethod: z.enum(['p24', 'paynow'], {
    error: "Wybierz metodę płatności"
  }),
  termsAccepted: z.boolean().refine(val => val === true, "Musisz zaakceptować regulamin"),
  marketingAccepted: z.boolean(),
  notes: z.string().optional(),
  discountCode: z.string().optional(),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>
