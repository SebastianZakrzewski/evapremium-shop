import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfiguratorService } from '../ConfiguratorService';
import { CartService } from '../CartService';
import { OrderService } from '../OrderService';
import { ConfigurationData, Product } from '../../types/product';
import { CustomerData, ShippingData, PaymentData } from '../../types/order';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

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

describe('Integration Test: Configurator → Cart → Order', () => {
  const mockSessionId = 'test-session-123';
  let mockConfiguration: ConfigurationData;
  let mockCustomerData: CustomerData;
  let mockShippingData: ShippingData;
  let mockPaymentData: PaymentData;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);

    mockConfiguration = {
      setType: '3d-with-rims',
      cellType: 'diamonds',
      setVariant: 'basic',
      materialColor: 'black',
      edgeColor: 'red',
      heelPad: 'tak',
      carDetails: {
        brand: 'BMW',
        model: 'X5',
        year: '2023'
      }
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

  describe('Complete Flow: Configurator → Cart → Order', () => {
    it('should complete full flow from configuration to order creation', async () => {
      // KROK 1: Konfigurator tworzy produkt
      console.log('🔄 Step 1: Creating product from configuration...');
      const product = ConfiguratorService.createProductFromConfiguration(mockConfiguration);
      
      expect(product).toBeDefined();
      expect(product.id).toBeDefined();
      expect(product.configuration).toEqual({
        setType: '3d-with-rims',
        cellType: 'diamonds',
        setVariant: 'basic',
        materialColor: 'black',
        edgeColor: 'red',
        heelPad: 'tak'
      });
      expect(product.status).toBe('cached');
      console.log('✅ Product created:', product.id);

      // KROK 2: Dodaj produkt do koszyka
      console.log('🔄 Step 2: Adding product to cart...');
      CartService.addProductToCart(product);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `cart-${mockSessionId}`,
        expect.stringContaining(product.id)
      );
      console.log('✅ Product added to cart');

      // KROK 3: Pobierz produkty z koszyka
      console.log('🔄 Step 3: Retrieving products from cart...');
      const cartProducts = CartService.getCartProducts(mockSessionId);
      
      expect(cartProducts).toHaveLength(1);
      expect(cartProducts[0].id).toBe(product.id);
      console.log('✅ Cart products retrieved:', cartProducts.length);

      // KROK 4: Utwórz zamówienie
      console.log('🔄 Step 4: Creating order...');
      const order = OrderService.createOrder(
        cartProducts,
        mockCustomerData,
        mockShippingData,
        mockPaymentData
      );
      
      expect(order).toBeDefined();
      expect(order.id).toBeDefined();
      expect(order.product).toEqual(product);
      expect(order.customer).toEqual(mockCustomerData);
      expect(order.shipping).toEqual(mockShippingData);
      expect(order.payment).toEqual(mockPaymentData);
      expect(order.status).toBe('pending');
      console.log('✅ Order created:', order.id);

      // KROK 5: Zapisz zamówienie do Supabase
      console.log('🔄 Step 5: Saving order to Supabase...');
      mockSupabaseInsert.mockReturnValue({
        data: [order],
        error: null
      });

      const savedOrder = await OrderService.saveOrderToSupabase(order);
      
      expect(mockSupabaseInsert).toHaveBeenCalledWith({
        id: order.id,
        session_id: order.sessionId,
        product: order.product,
        customer: order.customer,
        shipping: order.shipping,
        payment: order.payment,
        company: order.company,
        pricing: order.pricing,
        status: order.status,
        created_at: order.createdAt,
        updated_at: order.updatedAt
      });
      expect(savedOrder).toEqual(order);
      console.log('✅ Order saved to Supabase');

      // KROK 6: Wyczyść koszyk
      console.log('🔄 Step 6: Clearing cart...');
      CartService.clearCart(mockSessionId);
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(`cart-${mockSessionId}`);
      console.log('✅ Cart cleared');

      // KROK 7: Sprawdź czy koszyk jest pusty
      console.log('🔄 Step 7: Verifying empty cart...');
      const emptyCartProducts = CartService.getCartProducts(mockSessionId);
      
      expect(emptyCartProducts).toHaveLength(0);
      console.log('✅ Cart is empty');

      console.log('🎉 Complete flow test passed!');
    });

    it('should handle multiple products in cart', async () => {
      // Utwórz dwa różne produkty
      const product1 = ConfiguratorService.createProductFromConfiguration(mockConfiguration);
      
      const config2 = { ...mockConfiguration, materialColor: 'white' };
      const product2 = ConfiguratorService.createProductFromConfiguration(config2);

      // Dodaj oba do koszyka
      CartService.addProductToCart(product1);
      CartService.addProductToCart(product2);

      // Pobierz produkty z koszyka
      const cartProducts = CartService.getCartProducts(mockSessionId);
      expect(cartProducts).toHaveLength(2);

      // Utwórz zamówienie z wieloma produktami
      const order = OrderService.createOrder(
        cartProducts,
        mockCustomerData,
        mockShippingData,
        mockPaymentData
      );

      // Sprawdź czy cena jest poprawnie obliczona
      const expectedSubtotal = product1.pricing.totalPrice + product2.pricing.totalPrice;
      expect(order.pricing.subtotal).toBe(expectedSubtotal);
      expect(order.pricing.totalAmount).toBe(expectedSubtotal + mockShippingData.cost);
    });

    it('should handle cart operations correctly', () => {
      const product = ConfiguratorService.createProductFromConfiguration(mockConfiguration);
      
      // Dodaj produkt
      CartService.addProductToCart(product);
      expect(CartService.getCartProducts(mockSessionId)).toHaveLength(1);

      // Dodaj ten sam produkt ponownie (powinien zwiększyć quantity)
      CartService.addProductToCart(product);
      const cartItems = JSON.parse(localStorageMock.setItem.mock.calls[1][1]);
      expect(cartItems[0].quantity).toBe(2);

      // Usuń produkt
      CartService.removeProductFromCart(product.id);
      expect(CartService.getCartProducts(mockSessionId)).toHaveLength(0);

      // Sprawdź total
      expect(CartService.getCartTotal(mockSessionId)).toBe(0);
    });

    it('should handle order creation with discount', async () => {
      const product = ConfiguratorService.createProductFromConfiguration(mockConfiguration);
      CartService.addProductToCart(product);
      const cartProducts = CartService.getCartProducts(mockSessionId);

      const order = OrderService.createOrder(
        cartProducts,
        mockCustomerData,
        mockShippingData,
        mockPaymentData,
        { discountAmount: 50 }
      );

      expect(order.pricing.discountAmount).toBe(50);
      expect(order.pricing.totalAmount).toBe(
        product.pricing.totalPrice + mockShippingData.cost - 50
      );
    });

    it('should handle order creation with company data', async () => {
      const product = ConfiguratorService.createProductFromConfiguration(mockConfiguration);
      CartService.addProductToCart(product);
      const cartProducts = CartService.getCartProducts(mockSessionId);

      const companyData = {
        name: 'Firma Testowa',
        nip: '1234567890',
        isInvoice: true
      };

      const order = OrderService.createOrder(
        cartProducts,
        mockCustomerData,
        mockShippingData,
        mockPaymentData,
        {},
        companyData
      );

      expect(order.company).toEqual(companyData);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty cart in order creation', () => {
      expect(() => {
        OrderService.createOrder(
          [],
          mockCustomerData,
          mockShippingData,
          mockPaymentData
        );
      }).toThrow('Cannot create order with empty cart');
    });

    it('should handle invalid configuration', () => {
      const invalidConfig = { ...mockConfiguration, setType: '' };
      
      expect(() => {
        ConfiguratorService.createProductFromConfiguration(invalidConfig);
      }).toThrow('Invalid configuration data');
    });

    it('should handle Supabase save error', async () => {
      const product = ConfiguratorService.createProductFromConfiguration(mockConfiguration);
      const order = OrderService.createOrder(
        [product],
        mockCustomerData,
        mockShippingData,
        mockPaymentData
      );

      mockSupabaseInsert.mockReturnValue({
        data: null,
        error: { message: 'Database error' }
      });

      await expect(OrderService.saveOrderToSupabase(order))
        .rejects.toThrow('Failed to save order to Supabase: Database error');
    });
  });
});
