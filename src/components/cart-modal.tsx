"use client";

import React from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: string;
  quantity: number;
  image: string;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const router = useRouter();

  // Przykładowe dane koszyka - później można zastąpić stanem globalnym
  const cartItems: CartItem[] = [
    {
      id: 1,
      name: "A4",
      brand: "Audi",
      price: "180,000 PLN",
      quantity: 1,
      image: "/images/products/audi.jpg"
    },
    {
      id: 2,
      name: "X5",
      brand: "BMW",
      price: "320,000 PLN",
      quantity: 2,
      image: "/images/products/bmw.png"
    }
  ];

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => {
    const price = parseInt(item.price.replace(/[^\d]/g, ''));
    return sum + (price * item.quantity);
  }, 0);

  const handleCheckout = () => {
    onClose(); // Zamknij modal koszyka
    router.push('/checkout'); // Przekieruj do strony checkout
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
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-black border-l border-neutral-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 className="text-2xl font-bold text-white">Koszyk</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-white/70 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-neutral-800 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Koszyk jest pusty</h3>
                <p className="text-neutral-400">Dodaj produkty do koszyka, aby rozpocząć zakupy.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{item.brand} {item.name}</h3>
                      <p className="text-sm text-neutral-400">{item.price}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button className="w-6 h-6 bg-neutral-800 border border-neutral-700 rounded flex items-center justify-center text-sm font-medium hover:bg-neutral-700 transition-colors text-white">
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
                        <button className="w-6 h-6 bg-neutral-800 border border-neutral-700 rounded flex items-center justify-center text-sm font-medium hover:bg-neutral-700 transition-colors text-white">
                          +
                        </button>
                      </div>
                    </div>
                    <button className="text-red-500 hover:text-red-400 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-neutral-800 p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-white">Razem ({totalItems} produktów):</span>
                <span className="text-2xl font-bold text-white">{totalPrice.toLocaleString()} PLN</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-red-600 text-white py-5 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg"
              >
                Przejdź do kasy
              </button>
              <button className="w-full bg-white text-black py-5 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg border border-neutral-700 mt-3">
                Realizuj zakup
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 