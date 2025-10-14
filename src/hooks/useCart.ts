import { useState, useEffect } from 'react';
import { Accessory } from '@/lib/types/accessory';

export interface CartItem {
  accessory: Accessory;
  quantity: number;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export function useCart() {
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalPrice: 0
  });

  // Ładuj koszyk z localStorage przy inicjalizacji
  useEffect(() => {
    const savedCart = localStorage.getItem('eva-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Konwertuj addedAt z string na Date
        const cartWithDates = {
          ...parsedCart,
          items: parsedCart.items.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }))
        };
        setCart(cartWithDates);
      } catch (error) {
        console.error('Błąd ładowania koszyka z localStorage:', error);
      }
    }
  }, []);

  // Zapisz koszyk do localStorage przy każdej zmianie
  useEffect(() => {
    localStorage.setItem('eva-cart', JSON.stringify(cart));
  }, [cart]);

  // Dodaj produkt do koszyka
  const addToCart = (accessory: Accessory, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        item => item.accessory.id === accessory.id
      );

      let newItems: CartItem[];

      if (existingItemIndex > -1) {
        // Produkt już istnieje w koszyku - zwiększ ilość
        newItems = prevCart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Nowy produkt - dodaj do koszyka
        const newItem: CartItem = {
          accessory,
          quantity,
          addedAt: new Date()
        };
        newItems = [...prevCart.items, newItem];
      }

      // Oblicz nowe sumy
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce(
        (sum, item) => sum + (item.accessory.price * item.quantity),
        0
      );

      return {
        items: newItems,
        totalItems,
        totalPrice
      };
    });
  };

  // Usuń produkt z koszyka
  const removeFromCart = (accessoryId: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(
        item => item.accessory.id !== accessoryId
      );

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce(
        (sum, item) => sum + (item.accessory.price * item.quantity),
        0
      );

      return {
        items: newItems,
        totalItems,
        totalPrice
      };
    });
  };

  // Zaktualizuj ilość produktu w koszyku
  const updateQuantity = (accessoryId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(accessoryId);
      return;
    }

    setCart(prevCart => {
      const newItems = prevCart.items.map(item =>
        item.accessory.id === accessoryId
          ? { ...item, quantity }
          : item
      );

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce(
        (sum, item) => sum + (item.accessory.price * item.quantity),
        0
      );

      return {
        items: newItems,
        totalItems,
        totalPrice
      };
    });
  };

  // Wyczyść cały koszyk
  const clearCart = () => {
    setCart({
      items: [],
      totalItems: 0,
      totalPrice: 0
    });
  };

  // Sprawdź czy produkt jest w koszyku
  const isInCart = (accessoryId: string): boolean => {
    return cart.items.some(item => item.accessory.id === accessoryId);
  };

  // Pobierz ilość produktu w koszyku
  const getQuantity = (accessoryId: string): number => {
    const item = cart.items.find(item => item.accessory.id === accessoryId);
    return item ? item.quantity : 0;
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getQuantity
  };
}