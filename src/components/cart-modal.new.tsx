"use client";

import React, { useEffect } from "react";
import { X, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart.new";
import { CartItem } from "@/components/cart/CartItem";
import { PricingService } from "@/lib/services/PricingService";
import { debugLog } from "@/lib/config/features";

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
    items, 
    total, 
    itemCount, 
    isLoading, 
    error,
    removeFromCart, 
    updateQuantity,
    clearCart 
  } = useCart();

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
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-black border-l border-neutral-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
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
                  <span>Suma częściowa:</span>
                  <span>{PricingService.formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Dostawa:</span>
                  <span>Gratis</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white border-t border-neutral-700 pt-2">
                  <span>Razem:</span>
                  <span>{PricingService.formatPrice(total)}</span>
                </div>
              </div>

              {/* Przyciski */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-white text-black py-3 px-6 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
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
