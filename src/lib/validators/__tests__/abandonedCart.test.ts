import { describe, it, expect } from 'vitest';
import { abandonedCartUpsertInputSchema } from '@/lib/validators/abandonedCart';

describe('abandonedCartUpsertInputSchema', () => {
  it('validates minimal valid payload', () => {
    const input = {
      sessionId: 'sess_1234567890',
      stage: 'checkout_step2',
      cartHasItems: true,
      totalAmount: 0,
    };
    const parsed = abandonedCartUpsertInputSchema.parse(input);
    expect(parsed.sessionId).toBe(input.sessionId);
  });

  it('sanitizes invalid email instead of rejecting payload', () => {
    const input = {
      sessionId: 'sess_1234567890',
      stage: 'checkout_step2',
      cartHasItems: true,
      contact: { email: 'not-an-email' },
    };
    const parsed = abandonedCartUpsertInputSchema.parse(input);
    expect(parsed.contact).toBeUndefined();
  });

  it('accepts full snapshot', () => {
    const input = {
      sessionId: 'sess_abcdefghi',
      stage: 'checkout_step3',
      cartHasItems: true,
      utm: { source: 'ads' },
      contact: { email: 'a@b.com', phone: '+48123456789' },
      car: { make: 'BMW', model: 'X5', year: 2020, bodyType: 'SUV' },
      configuration: { variant: 1, setType: 2, cellShape: 3, materialColor: 4, trimColor: 5 },
      items: [{ productId: 'p1', productName: 'Mat', productType: 'mat', quantity: 1, price: 199, currency: 'PLN' }],
      currency: 'PLN',
      totalAmount: 199,
      ip: '127.0.0.1',
      userAgent: 'UA',
      metadata: { a: 1 },
    };
    const parsed = abandonedCartUpsertInputSchema.parse(input);
    expect(parsed.currency).toBe('PLN');
    expect(parsed.items?.length).toBe(1);
  });
});
