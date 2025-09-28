import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartService } from '../CartService';
import { Product } from '../../types/product';

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

describe('CartService', () => {
  const mockSessionId = 'test-session-123';
  let mockProduct: Product;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockProduct = {
      id: 'product-123',
      sessionId: mockSessionId,
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
  });

  describe('addProductToCart', () => {
    it('should add product to cart in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);

      CartService.addProductToCart(mockProduct);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `cart-${mockSessionId}`,
        expect.stringContaining('product-123')
      );
    });

    it('should add product to existing cart', () => {
      const existingCart = JSON.stringify([mockProduct]);
      localStorageMock.getItem.mockReturnValue(existingCart);

      const newProduct = { ...mockProduct, id: 'product-456' };
      CartService.addProductToCart(newProduct);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `cart-${mockSessionId}`,
        expect.stringContaining('product-123')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `cart-${mockSessionId}`,
        expect.stringContaining('product-456')
      );
    });

    it('should increment quantity for existing product', () => {
      const existingCart = JSON.stringify([{ ...mockProduct, quantity: 1 }]);
      localStorageMock.getItem.mockReturnValue(existingCart);

      CartService.addProductToCart(mockProduct);

      const setItemCall = localStorageMock.setItem.mock.calls[0];
      const cartData = JSON.parse(setItemCall[1]);
      const product = cartData.find((p: any) => p.id === 'product-123');
      
      expect(product.quantity).toBe(2);
    });
  });

  describe('getCartProducts', () => {
    it('should return empty array when no cart exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const products = CartService.getCartProducts(mockSessionId);

      expect(products).toEqual([]);
    });

    it('should return products from localStorage', () => {
      const cartData = JSON.stringify([mockProduct]);
      localStorageMock.getItem.mockReturnValue(cartData);

      const products = CartService.getCartProducts(mockSessionId);

      expect(products).toEqual([mockProduct]);
    });

    it('should return empty array for invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const products = CartService.getCartProducts(mockSessionId);

      expect(products).toEqual([]);
    });
  });

  describe('removeProductFromCart', () => {
    it('should remove product from cart', () => {
      const cartData = JSON.stringify([mockProduct, { ...mockProduct, id: 'product-456' }]);
      localStorageMock.getItem.mockReturnValue(cartData);

      CartService.removeProductFromCart('product-123');

      const setItemCall = localStorageMock.setItem.mock.calls[0];
      const updatedCart = JSON.parse(setItemCall[1]);
      
      expect(updatedCart).toHaveLength(1);
      expect(updatedCart[0].id).toBe('product-456');
    });

    it('should handle removing non-existent product', () => {
      const cartData = JSON.stringify([mockProduct]);
      localStorageMock.getItem.mockReturnValue(cartData);

      CartService.removeProductFromCart('non-existent');

      const setItemCall = localStorageMock.setItem.mock.calls[0];
      const updatedCart = JSON.parse(setItemCall[1]);
      
      expect(updatedCart).toEqual([mockProduct]);
    });
  });

  describe('clearCart', () => {
    it('should clear cart from localStorage', () => {
      CartService.clearCart(mockSessionId);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(`cart-${mockSessionId}`);
    });
  });

  describe('getCartTotal', () => {
    it('should calculate total for empty cart', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const total = CartService.getCartTotal(mockSessionId);

      expect(total).toBe(0);
    });

    it('should calculate total for cart with products', () => {
      const cartData = JSON.stringify([
        { ...mockProduct, quantity: 1 },
        { ...mockProduct, id: 'product-456', quantity: 2, pricing: { ...mockProduct.pricing, totalPrice: 200 } }
      ]);
      localStorageMock.getItem.mockReturnValue(cartData);

      const total = CartService.getCartTotal(mockSessionId);

      expect(total).toBe(258 + (200 * 2)); // 258 + 400 = 658
    });
  });

  describe('updateProductQuantity', () => {
    it('should update product quantity', () => {
      const cartData = JSON.stringify([{ ...mockProduct, quantity: 1 }]);
      localStorageMock.getItem.mockReturnValue(cartData);

      CartService.updateProductQuantity('product-123', 3);

      const setItemCall = localStorageMock.setItem.mock.calls[0];
      const updatedCart = JSON.parse(setItemCall[1]);
      const product = updatedCart.find((p: any) => p.id === 'product-123');
      
      expect(product.quantity).toBe(3);
    });

    it('should remove product when quantity is 0', () => {
      const cartData = JSON.stringify([{ ...mockProduct, quantity: 1 }]);
      localStorageMock.getItem.mockReturnValue(cartData);

      CartService.updateProductQuantity('product-123', 0);

      const setItemCall = localStorageMock.setItem.mock.calls[0];
      const updatedCart = JSON.parse(setItemCall[1]);
      
      expect(updatedCart).toHaveLength(0);
    });
  });
});
