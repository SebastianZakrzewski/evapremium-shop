"use client";

import React, { useEffect, useState } from "react";
import { X, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart.new";
import { CartItem } from "@/components/cart/CartItem";
import { PricingService } from "@/lib/services/PricingService";
import { debugLog } from "@/lib/config/features";
import { Button } from "@/components/ui/button";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Nowy Cart Modal używający V2 backendu
 * 
 * Różnice względem starej wersji:
 * - Używa useCart.new.ts (V2)
 * - Używa nowego komponentu CartItem
 * - Wyświetla polimorficzne produkty (dywaniki + akcesoria)
 * - Używa PricingService do formatowania cen
 */
export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const router = useRouter();
  const { 
    cart,
    items, 
    total, 
    itemCount, 
    isLoading, 
    error,
    removeFromCart, 
    updateQuantity,
    clearCart 
  } = useCart();

  // Stan kodu rabatowego - tylko do wyświetlania (kod wprowadzany tylko w checkout)
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      // Cart will be updated automatically via useCart hook
    };

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
    };
  }, []);

  // Załaduj zapisany kod rabatowy z localStorage przy otwarciu modala
  useEffect(() => {
    if (isOpen) {
      const savedDiscountCode = localStorage.getItem('discountCode');
      const savedDiscountAmount = localStorage.getItem('discountAmount');
      if (savedDiscountCode && savedDiscountAmount) {
        // Sprawdź czy kod jest nadal ważny
        const validation = PricingService.validateDiscountCode(savedDiscountCode, cart.subtotal);
        if (validation.isValid && Math.abs(validation.discountAmount - parseFloat(savedDiscountAmount)) < 0.01) {
          setDiscountCode(savedDiscountCode);
          setDiscountApplied(true);
          setDiscountAmount(parseFloat(savedDiscountAmount));
        } else {
          // Kod nie jest już ważny, usuń z localStorage
          localStorage.removeItem('discountCode');
          localStorage.removeItem('discountAmount');
        }
      }
    }
  }, [isOpen, cart.subtotal]);

  const handleCheckout = () => {
    onClose(); // Zamknij modal koszyka
    router.push('/checkout'); // Przekieruj do strony checkout
  };

  const handleContinueShopping = () => {
    onClose(); // Zamknij modal i kontynuuj zakupy
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await updateQuantity(itemId, quantity);
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Modal */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-neutral-950 border-l border-neutral-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 className="text-2xl font-bold text-white">
            Koszyk {itemCount > 0 && `(${itemCount})`}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}

            {error && (
              <div className="text-red-400 text-center py-4">
                Błąd: {error}
              </div>
            )}

            {!isLoading && !error && items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="h-16 w-16 text-neutral-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Twój koszyk jest pusty
                </h3>
                <p className="text-neutral-400 mb-6">
                  Dodaj produkty do koszyka, aby je zobaczyć tutaj
                </p>
                <button
                  onClick={handleContinueShopping}
                  className="px-6 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Kontynuuj zakupy
                </button>
              </div>
            )}

            {!isLoading && !error && items.length > 0 && (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onRemove={handleRemoveItem}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer - tylko gdy są produkty */}
          {!isLoading && !error && items.length > 0 && (
            <div className="border-t border-neutral-800 p-6 space-y-4">
              {/* Podsumowanie */}
              <div className="space-y-2">
                <div className="flex justify-between text-neutral-300">
                  <span>Dywaniki:</span>
                  <span>{PricingService.formatPrice(cart.subtotal)}</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-green-400 text-sm">
                    <span>Zniżka ({discountCode}):</span>
                    <span>-{PricingService.formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-white border-t border-neutral-700 pt-2">
                  <span>Razem:</span>
                  <span>{PricingService.formatPrice(discountApplied ? cart.subtotal - discountAmount : total)}</span>
                </div>
              </div>

              {/* Przyciski */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/25"
                >
                  Przejdź do kasy
                </button>
                
                <button
                  onClick={handleContinueShopping}
                  className="w-full border border-neutral-600 text-white py-3 px-6 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Kontynuuj zakupy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
