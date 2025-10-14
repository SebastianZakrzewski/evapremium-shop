/**
 * Przykłady użycia backend serwisów
 * 
 * Ten plik pokazuje jak używać nowych serwisów backendowych
 * w aplikacji EVA website.
 */

import { AccessoryService } from '@/lib/services/AccessoryService';
import { MatService } from '@/lib/services/MatService';
import { OrderService } from '@/lib/services/OrderService';
import { CartService } from '@/lib/services/CartService';
import { PricingService } from '@/lib/services/PricingService';

// ===========================================
// PRZYKŁAD 1: Pobieranie akcesoriów
// ===========================================

export async function getAccessoriesExample() {
  const accessoryService = new AccessoryService();
  
  try {
    // Pobierz wszystkie akcesoria
    const allAccessories = await accessoryService.getAccessories();
    console.log('Wszystkie akcesoria:', allAccessories);
    
    // Pobierz akcesoria według kategorii
    const organizers = await accessoryService.getAccessoriesByCategory('organizery');
    console.log('Organizery:', organizers);
    
    // Pobierz pojedyncze akcesorium
    const accessory = await accessoryService.getAccessoryBySlug('organizer-bagaznikowy');
    console.log('Organizer:', accessory);
    
    // Sprawdź dostępność
    const isAvailable = await accessoryService.checkAvailability(accessory!.id, 2);
    console.log('Dostępność:', isAvailable);
    
  } catch (error) {
    console.error('Błąd pobierania akcesoriów:', error);
  }
}

// ===========================================
// PRZYKŁAD 2: Pobieranie dywaników
// ===========================================

export async function getMatsExample() {
  const matService = new MatService();
  
  try {
    // Znajdź dywaniki dla konkretnego auta
    const mat = await matService.findMatForCar({
      brandSlug: 'bmw',
      modelSlug: '3-series',
      generation: 'F30',
      bodyType: 'sedan'
    });
    
    if (mat) {
      console.log('Znalezione dywaniki:', mat);
      
      // Pobierz dostępne typy nadwozia
      const bodyTypes = await matService.getAvailableBodyTypes('bmw', '3-series');
      console.log('Dostępne typy nadwozia:', bodyTypes);
      
      // Pobierz dostępne generacje
      const generations = await matService.getAvailableGenerations('bmw', '3-series');
      console.log('Dostępne generacje:', generations);
    }
    
  } catch (error) {
    console.error('Błąd pobierania dywaników:', error);
  }
}

// ===========================================
// PRZYKŁAD 3: Konfiguracja dywaników
// ===========================================

export async function configureMatsExample() {
  const matService = new MatService();
  
  try {
    // Znajdź dywaniki
    const mat = await matService.findMatForCar({
      brandSlug: 'bmw',
      modelSlug: '3-series',
      generation: 'F30',
      bodyType: 'sedan'
    });
    
    if (!mat) {
      throw new Error('Dywaniki nie znalezione');
    }
    
    // Konfiguracja dywaników
    const configuration = {
      carDetails: {
        brand: 'BMW',
        model: '3 Series',
        generation: 'F30',
        bodyType: 'sedan',
        year: 2015
      },
      setType: 'premium',
      cellType: 'diamonds',
      materialColor: 'black',
      edgeColor: 'gray',
      heelPad: 'yes' as const
    };
    
    // Waliduj konfigurację
    const isValid = matService.validateConfiguration(mat, configuration);
    console.log('Konfiguracja poprawna:', isValid);
    
    // Oblicz cenę
    const price = matService.calculatePrice(mat, configuration);
    console.log('Cena dywaników:', price);
    
  } catch (error) {
    console.error('Błąd konfiguracji dywaników:', error);
  }
}

// ===========================================
// PRZYKŁAD 4: Zarządzanie koszykiem
// ===========================================

export async function cartManagementExample() {
  const cartService = new CartService();
  
  try {
    // Pusty koszyk
    let cart = cartService.clearCart();
    console.log('Pusty koszyk:', cart);
    
    // Dodaj akcesorium do koszyka
    cart = await cartService.addToCart(cart, {
      productType: 'accessory',
      productId: 'accessory-uuid',
      quantity: 1
    });
    console.log('Koszyk z akcesorium:', cart);
    
    // Dodaj dywaniki do koszyka
    cart = await cartService.addToCart(cart, {
      productType: 'mat',
      productId: 'mat-uuid',
      quantity: 1,
      configuration: {
        carDetails: {
          brand: 'BMW',
          model: '3 Series',
          generation: 'F30',
          bodyType: 'sedan',
          year: 2015
        },
        setType: 'premium',
        cellType: 'diamonds',
        materialColor: 'black',
        edgeColor: 'gray',
        heelPad: 'yes'
      }
    });
    console.log('Koszyk z dywanikami:', cart);
    
    // Zaktualizuj ilość
    cart = await cartService.updateQuantity(cart, cart.items[0].id, 2);
    console.log('Koszyk po aktualizacji:', cart);
    
    // Pobierz podsumowanie
    const summary = cartService.getCartSummary(cart);
    console.log('Podsumowanie koszyka:', summary);
    
  } catch (error) {
    console.error('Błąd zarządzania koszykiem:', error);
  }
}

// ===========================================
// PRZYKŁAD 5: Tworzenie zamówienia
// ===========================================

export async function createOrderExample() {
  const orderService = new OrderService();
  
  try {
    // Dane zamówienia
    const orderData = {
      customer: {
        name: 'Jan Kowalski',
        email: 'jan@example.com',
        phone: '123456789',
        company: 'Firma Sp. z o.o.'
      },
      shippingAddress: {
        street: 'ul. Przykładowa 1',
        city: 'Warszawa',
        postalCode: '00-001',
        country: 'Polska'
      },
      billingAddress: {
        street: 'ul. Przykładowa 1',
        city: 'Warszawa',
        postalCode: '00-001',
        country: 'Polska'
      },
      paymentMethod: 'card',
      notes: 'Proszę o kontakt telefoniczny',
      items: [
        {
          quantity: 1,
          unitPrice: 149.99,
          subtotal: 149.99,
          productType: 'accessory' as const,
          productId: 'accessory-uuid',
          productName: 'Organizer Bagażnikowy',
          productSku: 'ORG-001',
          productImage: 'https://example.com/image.jpg'
        },
        {
          quantity: 1,
          unitPrice: 449.99,
          subtotal: 449.99,
          productType: 'mat' as const,
          productId: 'mat-uuid',
          productName: 'Dywaniki BMW 3 Series F30',
          productSku: 'MAT-BMW-3-F30',
          configuration: {
            carDetails: {
              brand: 'BMW',
              model: '3 Series',
              generation: 'F30',
              bodyType: 'sedan',
              year: 2015
            },
            setType: 'premium',
            cellType: 'diamonds',
            materialColor: 'black',
            edgeColor: 'gray',
            heelPad: 'yes'
          }
        }
      ]
    };
    
    // Utwórz zamówienie
    const order = await orderService.createOrder(orderData);
    console.log('Utworzone zamówienie:', order);
    
    // Pobierz zamówienie po numerze
    const retrievedOrder = await orderService.getOrderByNumber(order.orderNumber);
    console.log('Pobrane zamówienie:', retrievedOrder);
    
    // Zaktualizuj status zamówienia
    const updatedOrder = await orderService.updateOrderStatus(
      order.id,
      'processing'
    );
    console.log('Zaktualizowane zamówienie:', updatedOrder);
    
  } catch (error) {
    console.error('Błąd tworzenia zamówienia:', error);
  }
}

// ===========================================
// PRZYKŁAD 6: Obliczanie cen
// ===========================================

export function pricingExample() {
  // Oblicz koszt dostawy
  const shippingCost = PricingService.calculateShippingCost(250);
  console.log('Koszt dostawy dla 250 PLN:', shippingCost);
  
  const freeShippingCost = PricingService.calculateShippingCost(350);
  console.log('Koszt dostawy dla 350 PLN (darmowa dostawa):', freeShippingCost);
  
  // Oblicz podatek
  const tax = PricingService.calculateTax(300);
  console.log('Podatek od 300 PLN:', tax);
  
  // Oblicz cenę dywaników
  const matPrice = PricingService.calculateMatPrice(299.99, {
    setType: 'premium',
    cellType: 'diamonds',
    heelPad: 'yes'
  });
  console.log('Cena dywaników z konfiguracją:', matPrice);
  
  // Oblicz cenę zestawu
  const setPrice = PricingService.calculateSetVariantPrice(
    'premium',
    '3d-with-rims',
    300
  );
  console.log('Cena zestawu premium 3D z rantami:', setPrice);
  
  // Waliduj kod rabatowy
  const discount = PricingService.validateDiscountCode('WELCOME10', 150);
  console.log('Walidacja kodu rabatowego:', discount);
  
  // Formatuj cenę
  const formattedPrice = PricingService.formatPrice(299.99);
  console.log('Sformatowana cena:', formattedPrice);
}

// ===========================================
// PRZYKŁAD 7: Pobieranie zamówień klienta
// ===========================================

export async function getCustomerOrdersExample() {
  const orderService = new OrderService();
  
  try {
    // Pobierz zamówienia klienta
    const orders = await orderService.getCustomerOrders('jan@example.com');
    console.log('Zamówienia klienta:', orders);
    
    // Pobierz zamówienia według statusu
    const pendingOrders = await orderService.getOrdersByStatus('pending');
    console.log('Oczekujące zamówienia:', pendingOrders);
    
    // Pobierz statystyki zamówień
    const stats = await orderService.getOrderStats();
    console.log('Statystyki zamówień:', stats);
    
  } catch (error) {
    console.error('Błąd pobierania zamówień:', error);
  }
}

// ===========================================
// PRZYKŁAD 8: Użycie w komponencie React
// ===========================================

export function useBackendServices() {
  const accessoryService = new AccessoryService();
  const matService = new MatService();
  const cartService = new CartService();
  const orderService = new OrderService();
  
  return {
    accessoryService,
    matService,
    cartService,
    orderService
  };
}

// ===========================================
// PRZYKŁAD 9: Obsługa błędów
// ===========================================

export async function errorHandlingExample() {
  const accessoryService = new AccessoryService();
  
  try {
    // Próba pobrania nieistniejącego akcesorium
    const accessory = await accessoryService.getAccessoryById('non-existent-id');
    
    if (!accessory) {
      console.log('Akcesorium nie znalezione');
      return;
    }
    
  } catch (error) {
    if (error instanceof Error) {
      console.error('Błąd:', error.message);
    } else {
      console.error('Nieznany błąd:', error);
    }
  }
}

// ===========================================
// PRZYKŁAD 10: Testowanie serwisów
// ===========================================

export async function testServicesExample() {
  console.log('=== Testowanie serwisów backendowych ===');
  
  try {
    await getAccessoriesExample();
    await getMatsExample();
    await configureMatsExample();
    await cartManagementExample();
    await createOrderExample();
    await getCustomerOrdersExample();
    pricingExample();
    errorHandlingExample();
    
    console.log('=== Wszystkie testy zakończone ===');
  } catch (error) {
    console.error('Błąd podczas testowania:', error);
  }
}

// Uruchom testy (tylko w środowisku Node.js)
if (typeof window === 'undefined') {
  testServicesExample();
}
