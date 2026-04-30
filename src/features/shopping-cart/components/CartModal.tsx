"use client";

import React, { useEffect, useState, memo, useMemo, useCallback } from "react";
import { X, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "../hooks/useCart";
import { CartItem } from "./CartItem";
import { PricingService } from "@/lib/services/PricingService";
import { debugLog } from "@/lib/config/features";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Cart Modal używający V2 backendu
 * 
 * Funkcjonalności:
 * - Używa useCart hook
 * - Używa nowego komponentu CartItem
 * - Wyświetla polimorficzne produkty (dywaniki + akcesoria)
 * - Używa PricingService do formatowania cen
 */
function CartModal({ isOpen, onClose }: CartModalProps) {
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

  // Stan kodu rabatowego
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountSource, setDiscountSource] = useState<string | null>(null);

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
      const savedDiscountSource = localStorage.getItem('discountSource');
      
      if (savedDiscountCode && savedDiscountAmount) {
        // Sprawdź czy kod jest nadal ważny
        const validation = PricingService.validateDiscountCode(savedDiscountCode, cart.subtotal);
        if (validation.isValid && Math.abs(validation.discountAmount - parseFloat(savedDiscountAmount)) < 0.01) {
          setDiscountCode(savedDiscountCode);
          setDiscountApplied(true);
          setDiscountAmount(parseFloat(savedDiscountAmount));
          setDiscountError(null);
          setDiscountSource(savedDiscountSource);
        } else {
          // Kod nie jest już ważny, usuń z localStorage
          localStorage.removeItem('discountCode');
          localStorage.removeItem('discountAmount');
          localStorage.removeItem('discountSource');
          setDiscountCode('');
          setDiscountApplied(false);
          setDiscountAmount(0);
          setDiscountSource(null);
          setDiscountError(null);
        }
      } else {
        // Resetuj stan jeśli nie ma kodu w localStorage
        setDiscountCode('');
        setDiscountApplied(false);
        setDiscountAmount(0);
        setDiscountError(null);
        setDiscountSource(null);
      }
    }
  }, [isOpen, cart.subtotal]);

  // Resetuj kod rabatowy jeśli subtotal zmienił się znacząco (np. produkt usunięty)
  useEffect(() => {
    if (discountApplied && cart.subtotal > 0) {
      const validation = PricingService.validateDiscountCode(discountCode, cart.subtotal);
      if (!validation.isValid) {
        // Kod przestał być ważny, usuń go
        localStorage.removeItem('discountCode');
        localStorage.removeItem('discountAmount');
        localStorage.removeItem('discountSource');
        setDiscountCode('');
        setDiscountApplied(false);
        setDiscountAmount(0);
        setDiscountSource(null);
        setDiscountError('Kod rabatowy przestał być ważny po zmianie zawartości koszyka');
      }
    }
  }, [cart.subtotal, discountApplied, discountCode]);

  // Synchronizuj discountSource z localStorage
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const source = localStorage.getItem('discountSource');
      setDiscountSource(source);
    }
  }, [isOpen, discountApplied]);

  // Sprawdź czy kod został wprowadzony w checkout (zapobieganie duplikacji)
  const isDiscountFromCheckout = discountSource === 'checkout';

  const handleCheckout = useCallback(() => {
    onClose(); // Zamknij modal koszyka
    router.push('/checkout'); // Przekieruj do strony checkout
  }, [onClose, router]);

  const handleContinueShopping = useCallback(() => {
    onClose(); // Zamknij modal i kontynuuj zakupy
  }, [onClose]);

  const handleRemoveItem = useCallback(async (itemId: string) => {
    try {
      await removeFromCart(itemId);
    } catch (err) {
      console.error('Error removing item:', err);
    }
  }, [removeFromCart]);

  const handleUpdateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      await updateQuantity(itemId, quantity);
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  }, [updateQuantity]);

  // Funkcja do zastosowania kodu rabatowego
  const applyDiscountCode = () => {
    if (!discountCode.trim()) {
      setDiscountError('Wprowadź kod rabatowy');
      return;
    }

    // Sprawdź czy kod nie został już wprowadzony w checkout
    if (isDiscountFromCheckout) {
      setDiscountError('Kod rabatowy został już wprowadzony w sekcji checkout');
      return;
    }

    const validation = PricingService.validateDiscountCode(discountCode.trim(), cart.subtotal);
    
    if (validation.isValid) {
      setDiscountApplied(true);
      setDiscountAmount(validation.discountAmount);
      setDiscountError(null);
      
      // Zapisz do localStorage z flagą źródła
      localStorage.setItem('discountCode', discountCode.trim());
      localStorage.setItem('discountAmount', validation.discountAmount.toString());
      localStorage.setItem('discountSource', 'cart');
      setDiscountSource('cart');
      
      console.log('✅ CartModal: Discount code applied', {
        code: discountCode.trim(),
        amount: validation.discountAmount,
        subtotal: cart.subtotal
      });
    } else {
      setDiscountApplied(false);
      setDiscountAmount(0);
      setDiscountError(validation.message || 'Nieprawidłowy kod rabatowy');
    }
  };

  // Reset zniżki gdy kod się zmienia
  const handleDiscountCodeChange = (value: string) => {
    setDiscountCode(value);
    if (discountApplied) {
      setDiscountApplied(false);
      setDiscountAmount(0);
      setDiscountError(null);
      // Usuń z localStorage jeśli użytkownik zmienia kod
      if (typeof window !== 'undefined') {
        const currentSource = localStorage.getItem('discountSource');
        if (currentSource === 'cart') {
          localStorage.removeItem('discountCode');
          localStorage.removeItem('discountAmount');
          localStorage.removeItem('discountSource');
          setDiscountSource(null);
        }
      }
    }
  };

  // Oblicz finalną cenę z uwzględnieniem zniżki
  const finalTotal = useMemo(() => {
    return discountApplied && discountAmount > 0
      ? Math.max(0, cart.subtotal - discountAmount)
      : total;
  }, [discountApplied, discountAmount, cart.subtotal, total]);

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
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-black border-l border-white/5 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-white/5">
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
        <div className="flex flex-col flex-1 min-h-0">
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
                  className="px-6 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
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
            <div className="flex-shrink-0 border-t border-white/5 p-6 space-y-4 bg-black">
              {/* Discount Code Input */}
              <div className="space-y-2">
                <Label className="text-white text-sm font-medium">Kod rabatowy</Label>
                <div className="flex space-x-2">
                  <Input 
                    value={discountCode}
                    onChange={(e) => handleDiscountCodeChange(e.target.value)}
                    placeholder=""
                    className={`min-h-[40px] h-10 bg-neutral-600/40 border-neutral-600 text-white placeholder:text-gray-300 focus:border-red-500 focus:ring-red-500/30 rounded-lg text-sm ${
                      discountError ? 'border-red-500' : discountApplied ? 'border-green-500' : ''
                    }`}
                    disabled={discountApplied || isDiscountFromCheckout}
                  />
                  <Button 
                    type="button"
                    onClick={applyDiscountCode}
                    disabled={discountApplied || !discountCode.trim() || isDiscountFromCheckout}
                    className="h-10 bg-red-600 border-red-500 text-white hover:bg-red-700 rounded-lg px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {discountApplied ? '✓' : 'Zastosuj'}
                  </Button>
                </div>
                {discountError && (
                  <p className="text-red-400 text-xs">{discountError}</p>
                )}
                {isDiscountFromCheckout && (
                  <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-2">
                    <p className="text-blue-400 text-xs font-medium">
                      Kod rabatowy został wprowadzony w sekcji checkout
                    </p>
                  </div>
                )}
                {discountApplied && !isDiscountFromCheckout && (
                  <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-2">
                    <p className="text-green-400 text-xs font-medium">
                      ✓ Kod zastosowany! Zniżka: -{PricingService.formatPrice(discountAmount)}
                    </p>
                  </div>
                )}
              </div>

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
                  <span>{PricingService.formatPrice(finalTotal)}</span>
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
                  className="w-full border border-neutral-600 text-white py-3 px-6 rounded-lg hover:bg-white/5 transition-colors"
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

export default memo(CartModal);
