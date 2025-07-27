"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { HybridSessionManager } from '@/lib/utils/hybrid-session-manager';

interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: string;
  quantity: number;
  image: string;
  configuration?: any; // Dane konfiguracji z configuratora
}

interface SessionContextType {
  sessionId: string;
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: number) => void;
  updateCartItemQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  userPreferences: any;
  updateUserPreferences: (preferences: any) => void;
  isSessionValid: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Generuj sessionId
  const sessionId = useMemo(() => HybridSessionManager.getSessionId(), []);
  
  // Stan koszyka
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Stan preferencji użytkownika
  const [userPreferences, setUserPreferences] = useState<any>({});
  
  // Sprawdź czy sesja jest ważna
  const isSessionValid = useMemo(() => HybridSessionManager.isValidSession(sessionId), [sessionId]);

  // Oblicz liczbę przedmiotów w koszyku
  const cartCount = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]
  );

  // Oblicz całkowitą wartość koszyka
  const cartTotal = useMemo(() => 
    cartItems.reduce((sum, item) => {
      const price = parseInt(item.price.replace(/[^\d]/g, ''));
      return sum + (price * item.quantity);
    }, 0), [cartItems]
  );

  // Załaduj dane z sesji przy starcie
  useEffect(() => {
    if (isSessionValid) {
      // Załaduj koszyk
      const savedCart = HybridSessionManager.getOrderData(sessionId)?.cart || [];
      if (savedCart.length > 0) {
        setCartItems(savedCart);
        console.log('🛒 Załadowano koszyk z sesji:', savedCart);
      }

      // Załaduj preferencje
      const savedPreferences = HybridSessionManager.getConfigData(sessionId)?.preferences || {};
      if (Object.keys(savedPreferences).length > 0) {
        setUserPreferences(savedPreferences);
        console.log('⚙️ Załadowano preferencje z sesji:', savedPreferences);
      }
    }
  }, [sessionId, isSessionValid]);

  // Zapisz koszyk do sesji przy każdej zmianie
  useEffect(() => {
    if (isSessionValid && cartItems.length > 0) {
      const cartData = {
        cart: cartItems,
        lastUpdated: new Date().toISOString()
      };
      HybridSessionManager.saveOrderData(sessionId, cartData);
      console.log('💾 Zapisano koszyk do sesji:', cartItems);
    }
  }, [cartItems, sessionId, isSessionValid]);

  // Zapisz preferencje do sesji przy każdej zmianie
  useEffect(() => {
    if (isSessionValid && Object.keys(userPreferences).length > 0) {
      const preferencesData = {
        preferences: userPreferences,
        lastUpdated: new Date().toISOString()
      };
      HybridSessionManager.saveConfigData(sessionId, preferencesData);
      console.log('💾 Zapisano preferencje do sesji:', userPreferences);
    }
  }, [userPreferences, sessionId, isSessionValid]);

  // Funkcje do zarządzania koszykiem
  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        // Zwiększ ilość jeśli przedmiot już istnieje
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      } else {
        // Dodaj nowy przedmiot
        return [...prev, item];
      }
    });
  };

  const removeFromCart = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateCartItemQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Funkcja do aktualizacji preferencji
  const updateUserPreferences = (preferences: any) => {
    setUserPreferences((prev: any) => ({ ...prev, ...preferences }));
  };

  const value: SessionContextType = {
    sessionId,
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    userPreferences,
    updateUserPreferences,
    isSessionValid,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
} 