"use client";

import React, { useEffect, useState } from "react";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart.new";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity } = useCart();
  const [isClosing, setIsClosing] = useState(false);

  // Obsługa zamykania z animacją
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  // Reset isClosing gdy modal się otwiera
  useEffect(() => {
    if (isOpen) setIsClosing(false);
  }, [isOpen]);

  const handleCheckout = () => {
    handleClose();
    setTimeout(() => router.push('/checkout'), 300);
  };

  const handleContinueShopping = () => {
    handleClose();
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
          isOpen && !isClosing ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal Panel */}
      <div 
        className={`
          relative w-full max-w-md h-full bg-black/90 backdrop-blur-xl border-l border-white/10 shadow-2xl 
          transform transition-transform duration-300 ease-out pointer-events-auto flex flex-col
          ${isOpen && !isClosing ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-white tracking-wide">Twój Koszyk</h2>
            <span className="bg-white/10 text-white text-xs font-bold px-2 py-1 rounded-full border border-white/10">
              {cart.itemCount}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white group"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center border border-white/5 shadow-inner">
                <ShoppingBag className="w-10 h-10 text-gray-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Twój koszyk jest pusty</h3>
                <p className="text-gray-400 max-w-[250px] mx-auto">
                  Wygląda na to, że nie dodałeś jeszcze żadnych produktów.
                </p>
              </div>
              <Button 
                variant="premium" 
                onClick={handleContinueShopping}
                className="mt-4"
              >
                Rozpocznij zakupy
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.items.map((item) => (
                <div 
                  key={item.id} 
                  className="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl p-4 transition-all duration-300 animate-fade-in"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 bg-black rounded-xl overflow-hidden flex-shrink-0 border border-white/10 relative">
                      {item.productImage ? (
                        <Image 
                          src={item.productImage} 
                          alt={item.productName}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                          <span className="text-2xl">📦</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-white leading-tight line-clamp-2">
                            {item.productName}
                          </h3>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-500 hover:text-red-500 transition-colors p-1"
                            aria-label="Usuń produkt"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {item.productType === 'accessory' ? 'Akcesoria' : 'Dywaniki'}
                        </p>
                      </div>

                      <div className="flex items-end justify-between mt-2">
                        <div className="flex items-center bg-black/40 rounded-lg border border-white/10 p-1">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-white">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-400 line-through">
                            {(item.unitPrice * 1.2).toLocaleString('pl-PL')} zł
                          </p>
                          <p className="text-lg font-bold text-red-500">
                            {item.unitPrice.toLocaleString('pl-PL')} zł
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-md">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Suma częściowa</span>
                <span>{cart.subtotal.toLocaleString('pl-PL')} zł</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Dostawa</span>
                <span className="text-green-400 font-medium">Darmowa</span>
              </div>
              <div className="flex justify-between items-end pt-3 border-t border-white/10">
                <span className="text-white font-medium">Do zapłaty</span>
                <span className="text-3xl font-bold text-white tracking-tight">
                  {cart.total.toLocaleString('pl-PL')} <span className="text-lg font-normal text-gray-400">PLN</span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleCheckout}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-900/30 rounded-xl"
              >
                <span className="flex items-center gap-2">
                  Przejdź do kasy
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
              <Button 
                variant="ghost"
                onClick={handleContinueShopping}
                className="w-full text-gray-400 hover:text-white hover:bg-white/5"
              >
                Kontynuuj zakupy
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
