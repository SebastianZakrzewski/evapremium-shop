import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderService } from '../OrderService';
import { Product } from '../../types/product';
import { CustomerData, ShippingData, PaymentData, OrderStatus } from '../../types/order';

// Mock Supabase
const mockSupabaseInsert = vi.fn();
const mockSupabaseSelect = vi.fn();

vi.mock('../../database/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      insert: mockSupabaseInsert,
      select: mockSupabaseSelect,
    })),
  },
  TABLES: {
    ORDERS: 'orders',
  },
}));

describe('OrderService', () => {
  let mockProduct: Product;
  let mockCustomerData: CustomerData;
  let mockShippingData: ShippingData;
  let mockPaymentData: PaymentData;

  beforeEach(() => {
    vi.clearAllMocks();

    mockProduct = {
      id: 'product-123',
      sessionId: 'session-123',
      configuration: {
        setType: '3d-with-rims',
        cellType: 'diamonds',
        setVariant: 'basic',
        materialColor: 'black',
        edgeColor: 'red',
        heelPad: 'tak'
      },
      pricing: {
        basePrice: 219,
        modifiers: 39,
        totalPrice: 258
      },
      status: 'cached',
      createdAt: new Date()
    };

    mockCustomerData = {
      firstName: 'Jan',
      lastName: 'Kowalski',
      email: 'jan.kowalski@example.com',
      phone: '+48123456789',
      address: 'ul. Testowa 123',
      city: 'Warszawa',
      postalCode: '00-001',
      country: 'Polska'
    };

    mockShippingData = {
      method: 'courier',
      methodName: 'Kurier DPD',
      cost: 15,
      estimatedDelivery: '2-3 dni robocze'
    };

    mockPaymentData = {
      method: 'card',
      methodName: 'Karta kredytowa'
    };
  });

  describe('createOrder', () => {
    it('should create order with correct structure', () => {
      const order = OrderService.createOrder(
        [mockProduct],
        mockCustomerData,
        mockShippingData,
        mockPaymentData
      );

      expect(order).toBeDefined();
      expect(order.id).toBeDefined();
      expect(order.sessionId).toBe('session-123');
      expect(order.product).toEqual(mockProduct);
      expect(order.customer).toEqual(mockCustomerData);
      expect(order.shipping).toEqual(mockShippingData);
      expect(order.payment).toEqual(mockPaymentData);
      expect(order.status).toBe('pending');
      expect(order.createdAt).toBeInstanceOf(Date);
      expect(order.updatedAt).toBeInstanceOf(Date);
    });

    it('should calculate correct pricing', () => {
      const order = OrderService.createOrder(
        [mockProduct],
        mockCustomerData,
        mockShippingData,
        mockPaymentData
      );

      expect(order.pricing.subtotal).toBe(258);
      expect(order.pricing.shippingCost).toBe(15);
      expect(order.pricing.discountAmount).toBe(0);
      expect(order.pricing.totalAmount).toBe(273);
    });

    it('should handle multiple products in cart', () => {
      const secondProduct = {
        ...mockProduct,
        id: 'product-456',
        pricing: { ...mockProduct.pricing, totalPrice: 200 }
      };

      const order = OrderService.createOrder(
        [mockProduct, secondProduct],
        mockCustomerData,
        mockShippingData,
        mockPaymentData
      );

      expect(order.pricing.subtotal).toBe(458); // 258 + 200
      expect(order.pricing.totalAmount).toBe(473); // 458 + 15
    });

    it('should apply discount when provided', () => {
      const order = OrderService.createOrder(
        [mockProduct],
        mockCustomerData,
        mockShippingData,
        mockPaymentData,
        { discountAmount: 25 }
      );

      expect(order.pricing.discountAmount).toBe(25);
      expect(order.pricing.totalAmount).toBe(248); // 258 + 15 - 25
    });

    it('should include company data when provided', () => {
      const companyData = {
        name: 'Firma Testowa',
        nip: '1234567890',
        isInvoice: true
      };

      const order = OrderService.createOrder(
        [mockProduct],
        mockCustomerData,
        mockShippingData,
        mockPaymentData,
        undefined,
        companyData
      );

      expect(order.company).toEqual(companyData);
    });
  });

  describe('saveOrderToSupabase', () => {
    it('should save order to Supabase successfully', async () => {
      const mockOrder = {
        id: 'order-123',
        sessionId: 'session-123',
        product: mockProduct,
        customer: mockCustomerData,
        shipping: mockShippingData,
        payment: mockPaymentData,
        pricing: {
          subtotal: 258,
          shippingCost: 15,
          discountAmount: 0,
          totalAmount: 273
        },
        status: 'pending' as OrderStatus,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockSupabaseInsert.mockReturnValue({
        data: [mockOrder],
        error: null
      });

      const result = await OrderService.saveOrderToSupabase(mockOrder);

      expect(mockSupabaseInsert).toHaveBeenCalledWith({
        id: mockOrder.id,
        session_id: mockOrder.sessionId,
        product: mockOrder.product,
        customer: mockOrder.customer,
        shipping: mockOrder.shipping,
        payment: mockOrder.payment,
        company: mockOrder.company,
        pricing: mockOrder.pricing,
        status: mockOrder.status,
        created_at: mockOrder.createdAt,
        updated_at: mockOrder.updatedAt
      });

      expect(result).toEqual(mockOrder);
    });

    it('should throw error when Supabase save fails', async () => {
      const mockOrder = {
        id: 'order-123',
        sessionId: 'session-123',
        product: mockProduct,
        customer: mockCustomerData,
        shipping: mockShippingData,
        payment: mockPaymentData,
        pricing: {
          subtotal: 258,
          shippingCost: 15,
          discountAmount: 0,
          totalAmount: 273
        },
        status: 'pending' as OrderStatus,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockSupabaseInsert.mockReturnValue({
        data: null,
        error: { message: 'Database error' }
      });

      await expect(OrderService.saveOrderToSupabase(mockOrder))
        .rejects.toThrow('Failed to save order to Supabase: Database error');
    });
  });

  describe('getOrder', () => {
    it('should retrieve order from Supabase', async () => {
      const mockOrder = {
        id: 'order-123',
        session_id: 'session-123',
        product: mockProduct,
        customer: mockCustomerData,
        shipping: mockShippingData,
        payment: mockPaymentData,
        pricing: {
          subtotal: 258,
          shippingCost: 15,
          discountAmount: 0,
          totalAmount: 273
        },
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockSupabaseSelect.mockReturnValue({
        data: [mockOrder],
        error: null
      });

      const result = await OrderService.getOrder('order-123');

      expect(mockSupabaseSelect).toHaveBeenCalledWith().eq('id', 'order-123');
      expect(result).toBeDefined();
      expect(result.id).toBe('order-123');
    });

    it('should return null when order not found', async () => {
      mockSupabaseSelect.mockReturnValue({
        data: [],
        error: null
      });

      const result = await OrderService.getOrder('non-existent');

      expect(result).toBeNull();
    });

    it('should throw error when Supabase query fails', async () => {
      mockSupabaseSelect.mockReturnValue({
        data: null,
        error: { message: 'Query error' }
      });

      await expect(OrderService.getOrder('order-123'))
        .rejects.toThrow('Failed to retrieve order from Supabase: Query error');
    });
  });
});
