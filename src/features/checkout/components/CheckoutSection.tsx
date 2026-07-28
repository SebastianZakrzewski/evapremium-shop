"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Star,
  Truck,
  CreditCard,
  Check,
  CreditCard as PaymentIcon,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from '@/features/shopping-cart/hooks/useCart';
import { isMatCartConfiguration } from '@/lib/types/cart-new';
import { useOrder } from '@/features/orders/hooks/useOrder';
import { CreateOrderDTO } from '@/lib/types/order-new';
import { PricingService } from '@/lib/services/PricingService';
import { debugLog } from '@/lib/config/features';
import { useAbandonedCartHeartbeat } from '@/features/shopping-cart/hooks/useAbandonedCartHeartbeat';
import { HybridSessionManager } from '@/lib/utils/hybrid-session-manager';
import { useTracking, createInitiateCheckoutData } from '@/lib/tracking';
import { motion } from 'framer-motion';
import { getColorInfo } from '@/lib/color-mapping';
import { paymentsApi } from '@/lib/api';
import {
  isPaynowCheckoutEnabled,
  getClientPaymentProviderLabel,
} from '@/lib/config/payment-provider';
import type { MatConfiguration } from '@/features/vehicle-catalog/model/matConfiguration';
import {
  getMatConfigurationLabelContext,
  getMatProductSubtitleLabel,
  getMatSetVariantLabel,
  getMatTypeLabel,
  isSinglePriceSetType,
} from '@/shared/mat-set-labels';

// Schema walidacji - zaktualizowany dla nowego formatu
const checkoutSchema = z.object({
  // Dane kontaktowe
  firstName: z.string().min(2, "Imię musi mieć minimum 2 znaki"),
  lastName: z.string().min(2, "Nazwisko musi mieć minimum 2 znaki"),
  email: z.string().email("Nieprawidłowy adres email"),
  phone: z.string().min(9, "Nieprawidłowy numer telefonu"),
  
  // Adres wysyłkowy
  street: z.string().min(5, "Ulica musi mieć minimum 5 znaków"),
  postalCode: z.string().min(5, "Nieprawidłowy kod pocztowy"),
  city: z.string().min(2, "Miasto musi mieć minimum 2 znaki"),
  country: z.string().min(2, "Kraj musi mieć minimum 2 znaki"),
  
  // Dane do faktury
  sameAsShipping: z.boolean(),
  billingStreet: z.string().optional(),
  billingPostalCode: z.string().optional(),
  billingCity: z.string().optional(),
  billingCountry: z.string().optional(),
  /** NIP (opcjonalnie) - polski numer identyfikacji podatkowej, 10 cyfr */
  nip: z.string()
    .optional()
    .refine(
      (val) => !val || val.trim() === '' || /^\d{10}$/.test(val.replace(/[\s-]/g, '')),
      { message: "NIP musi składać się z 10 cyfr" }
    )
    .transform((val) => {
      const cleaned = val?.replace(/[\s-]/g, '');
      return cleaned && cleaned.length === 10 ? cleaned : undefined;
    }),
  
  // Metoda płatności
  paymentMethod: z.enum(['p24', 'paynow'], {
    required_error: "Wybierz metodę płatności"
  }),
  
  // Zgody
  termsAccepted: z.boolean().refine(val => val === true, "Musisz zaakceptować regulamin"),
  marketingAccepted: z.boolean(),
  
  // Notatki
  notes: z.string().optional(),
  
  // Kod rabatowy (opcjonalny)
  discountCode: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

/**
 * Checkout Section używający V2 backendu
 * 
 * Funkcjonalności:
 * - Używa useCart hook
 * - Używa useOrder hook
 * - Tworzy zamówienia przez API /api/orders
 * - Używa nowego formatu danych CreateOrderDTO
 * - Używa PricingService do obliczania cen
 */
export default function CheckoutSection() {
  const router = useRouter();
  const paynowCheckoutEnabled = isPaynowCheckoutEnabled();
  const checkoutPaymentMethod = paynowCheckoutEnabled ? 'paynow' : 'p24';
  const checkoutPaymentLabel = getClientPaymentProviderLabel();
  const { items, cart, total, itemCount, clearCart, refreshCart } = useCart();
  const { createOrder, saveOrder, isLoading: orderLoading, error: orderError } = useOrder();
  const { trackInitiateCheckout, trackAddPaymentInfo, createInitiateCheckoutData: createInitiateCheckout } = useTracking();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountSource, setDiscountSource] = useState<string | null>(null);
  const [priorityStartAt, setPriorityStartAt] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(15 * 60 * 1000);
  // Heartbeat (przeniesiony niżej po zainicjalizowaniu formularza, aby dołączyć dane kontaktowe)
  const sessionId = typeof window !== 'undefined' ? HybridSessionManager.getSessionId() : '';

  // Hook useCart automatycznie ładuje koszyk z localStorage przy mount
  // Nie trzeba wywoływać refreshCart() - może powodować konflikty

  // Priority window countdown (15 minutes) - active on step 2
  // Start/reset countdown when entering step 2
  useEffect(() => {
    if (currentStep !== 2) return;

    const KEY = 'checkout_priority_start_at';
    const start = Date.now();
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(KEY, String(start));
    }
    setPriorityStartAt(start);

    const total = 15 * 60 * 1000;
    const update = () => {
      const nowTs = Date.now();
      const deadline = start + total;
      const remaining = Math.max(0, deadline - nowTs);
      setRemainingMs(remaining);
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => clearInterval(id);
  }, [currentStep]);

  // Reset countdown if cart items change on step 2 (e.g., dodano nowy produkt)
  useEffect(() => {
    if (currentStep !== 2) return;
    const KEY = 'checkout_priority_start_at';
    const start = Date.now();
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(KEY, String(start));
    }
    setPriorityStartAt(start);
    setRemainingMs(15 * 60 * 1000);
  }, [itemCount, currentStep]);

  const totalMs = 15 * 60 * 1000;
  const progress = Math.max(0, Math.min(1, remainingMs / totalMs));
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000)
    .toString()
    .padStart(2, '0');

  // Reset visual state on step 1: keep full bar and 15:00 static
  useEffect(() => {
    if (currentStep < 2) {
      setRemainingMs(totalMs);
    }
  }, [currentStep]);

  // Track InitiateCheckout przy pierwszym renderze gdy koszyk nie jest pusty
  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    // Sprawdź czy event nie został już wysłany dla tego checkoutu (deduplikacja)
    const cacheKey = 'initiatecheckout_sent';
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      return;
    }

    try {
      const initiateCheckoutData = createInitiateCheckout(items, total);
      trackInitiateCheckout(initiateCheckoutData);

      // Zapisz w cache (ważność: sesja)
      sessionStorage.setItem(cacheKey, Date.now().toString());
    } catch (error) {
      console.error('[Tracking] Error tracking InitiateCheckout:', error);
    }
  }, [items, total, trackInitiateCheckout, createInitiateCheckout]);

  // Heartbeat na krokach 2 (adres) i 3 (płatność): 15 min okno, interwał 30s
  const cartHasItems = items.length > 0;
  
  // Get sessionId dynamically in buildPayload to ensure it's always current
  useAbandonedCartHeartbeat((currentStep === 2 || currentStep === 3) && cartHasItems, () => {
    const currentSessionId = typeof window !== 'undefined' ? HybridSessionManager.getSessionId() : '';
    
    if (!currentSessionId || currentSessionId.length < 8) {
      console.warn('[CheckoutSection] Invalid sessionId for heartbeat', { sessionId: currentSessionId });
    }
    
    // Get address data from form
    const watchedValues = watch();
    const addressData = {
      street: watchedValues.street,
      city: watchedValues.city,
      postalCode: watchedValues.postalCode,
      country: watchedValues.country,
    };
    
    // Find first mat item to extract car and configuration
    const firstMatItem = items.find(item => item.productType === 'mat');
    const matConfig = isMatCartConfiguration(firstMatItem?.configuration)
      ? firstMatItem.configuration
      : undefined
    const carData = matConfig?.carDetails ? {
      make: matConfig.carDetails.brand,
      model: matConfig.carDetails.model,
      year: matConfig.carDetails.year,
      bodyType: matConfig.carDetails.bodyType,
    } : undefined;

    const configurationData = matConfig ? {
      variant: matConfig.setVariant,
      setType: matConfig.setType,
      cellShape: matConfig.cellType,
      materialColor: matConfig.materialColor,
      trimColor: matConfig.edgeColor,
    } : undefined;
    
    return {
      sessionId: currentSessionId,
      stage: currentStep === 2 ? 'checkout_step2' : 'checkout_step3',
      cartHasItems: items.length > 0,
      contact: {
        firstName: contactFirstName,
        lastName: contactLastName,
        email: contactEmail,
        phone: contactPhone,
        ...(contactNip && { taxId: contactNip }),
      },
      address: addressData.street || addressData.city ? addressData : undefined, // Only include if at least street or city is filled
      car: carData,
      configuration: configurationData,
      items: items.map(i => ({ 
        productId: i.productId, 
        productName: i.productName,
        productType: i.productType,
        quantity: i.quantity, 
        price: i.unitPrice, 
        currency: 'PLN',
        configuration: i.configuration, // Include full configuration for each item
      })),
      currency: 'PLN',
      totalAmount: finalTotal,
      metadata: { checkoutStep: currentStep },
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };
  }, { intervalMs: 30000 });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isValid }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "Polska",
      sameAsShipping: true,
      paymentMethod: checkoutPaymentMethod,
      termsAccepted: false,
      marketingAccepted: false,
    }
  });

  const sameAsShipping = watch("sameAsShipping");
  const paymentMethod = watch("paymentMethod");
  const contactFirstName = watch("firstName");
  const contactLastName = watch("lastName");
  const contactEmail = watch("email");
  const contactPhone = watch("phone");
  const contactNip = watch("nip");

  // Załaduj zapisany kod rabatowy z localStorage przy załadowaniu checkout
  // Musi być po inicjalizacji formularza, aby mieć dostęp do setValue
  useEffect(() => {
    // Nie ładuj jeśli kod już został zastosowany
    if (discountApplied) {
      return;
    }

    const savedDiscountCode = localStorage.getItem('discountCode');
    const savedDiscountAmount = localStorage.getItem('discountAmount');
    const discountSource = localStorage.getItem('discountSource');
    
    if (savedDiscountCode && savedDiscountAmount) {
      // Użyj cart.subtotal jako głównego źródła (tak jak w cart-modal)
      // Fallback do obliczenia z items tylko jeśli cart.subtotal jest 0 lub undefined
      const calculatedFromItems = items.reduce((sum, item) => {
        return sum + (item.subtotal || (item.unitPrice * item.quantity) || 0);
      }, 0);
      
      const currentSubtotal = (cart.subtotal && cart.subtotal > 0) 
        ? cart.subtotal 
        : (calculatedFromItems > 0 ? calculatedFromItems : 0);
      
      // Jeśli subtotal jest jeszcze 0, poczekaj na załadowanie danych
      if (currentSubtotal === 0) {
        return;
      }
      
      const savedAmount = parseFloat(savedDiscountAmount);
      
      // Sprawdź czy kod jest nadal ważny (sprawdzamy tylko czy kod istnieje i subtotal >= minAmount)
      const validation = PricingService.validateDiscountCode(savedDiscountCode, currentSubtotal);
      
      // Jeśli kod jest ważny, zastosuj zapisaną kwotę zniżki (nawet jeśli różni się o kilka groszy przez zaokrąglenia)
      if (validation.isValid && savedAmount > 0) {
        setDiscountCode(savedDiscountCode);
        setDiscountApplied(true);
        // Użyj zapisanej kwoty zniżki z localStorage (to jest ta sama kwota która była w koszyku)
        setDiscountAmount(savedAmount);
        setValue('discountCode', savedDiscountCode);
        setDiscountSource(discountSource);
        console.log('✅ CheckoutSection: Discount code loaded from localStorage', {
          code: savedDiscountCode,
          savedAmount,
          calculatedAmount: validation.discountAmount,
          subtotal: currentSubtotal,
          source: discountSource
        });
      } else {
        // Kod nie jest już ważny, usuń z localStorage
        console.log('❌ CheckoutSection: Discount code invalid, removing from localStorage', {
          code: savedDiscountCode,
          validation,
          currentSubtotal,
          savedAmount
        });
        localStorage.removeItem('discountCode');
        localStorage.removeItem('discountAmount');
        localStorage.removeItem('discountSource');
        setDiscountSource(null);
        setDiscountSource(null);
      }
    }
  }, [items, cart.subtotal, discountApplied, setValue]);

  // Dodatkowe zabezpieczenie: ponownie załaduj kod rabatowy gdy cart.subtotal będzie dostępne
  // To jest fallback na wypadek gdyby pierwszy useEffect nie zadziałał (np. gdy cart.subtotal był jeszcze 0)
  useEffect(() => {
    // Nie ładuj jeśli kod już został zastosowany
    if (discountApplied) {
      return;
    }

    // Nie ładuj jeśli cart.subtotal jest jeszcze 0 lub undefined
    if (!cart.subtotal || cart.subtotal === 0) {
      return;
    }

    const savedDiscountCode = localStorage.getItem('discountCode');
    const savedDiscountAmount = localStorage.getItem('discountAmount');
    const discountSource = localStorage.getItem('discountSource');
    
    if (savedDiscountCode && savedDiscountAmount) {
      const savedAmount = parseFloat(savedDiscountAmount);
      
      // Sprawdź czy kod jest nadal ważny używając cart.subtotal
      const validation = PricingService.validateDiscountCode(savedDiscountCode, cart.subtotal);
      
      // Jeśli kod jest ważny, zastosuj zapisaną kwotę zniżki
      if (validation.isValid && savedAmount > 0) {
        setDiscountCode(savedDiscountCode);
        setDiscountApplied(true);
        setDiscountAmount(savedAmount);
        setValue('discountCode', savedDiscountCode);
        setDiscountSource(discountSource);
        console.log('✅ CheckoutSection: Discount code loaded from localStorage (fallback)', {
          code: savedDiscountCode,
          savedAmount,
          calculatedAmount: validation.discountAmount,
          subtotal: cart.subtotal,
          source: discountSource
        });
      }
    }
  }, [cart.subtotal, discountApplied, setValue]);

  // Synchronizuj discountSource z localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const source = localStorage.getItem('discountSource');
      setDiscountSource(source);
    }
  }, [discountApplied]);

  // Sprawdź czy kod został wprowadzony w cart (zapobieganie duplikacji)
  const isDiscountFromCart = discountSource === 'cart';

  // Oblicz subtotal i total z uwzględnieniem zniżki
  // Używamy cart.subtotal i cart.total jako głównego źródła (tak jak w cart-modal)
  // Obliczamy z items tylko jako fallback jeśli cart.subtotal jest 0 lub undefined
  const calculatedSubtotal = items.length > 0 
    ? items.reduce((sum, item) => {
        // Użyj item.subtotal jeśli jest dostępne, w przeciwnym razie oblicz z unitPrice * quantity
        const itemSubtotal = item.subtotal || (item.unitPrice * item.quantity) || 0;
        return sum + itemSubtotal;
      }, 0)
    : 0;
  
  // Używamy cart.subtotal jako głównego źródła (tak jak w cart-modal)
  // Fallback do obliczonej wartości tylko jeśli cart.subtotal jest 0 lub undefined
  const subtotal = (cart.subtotal && cart.subtotal > 0) 
    ? cart.subtotal 
    : (calculatedSubtotal > 0 ? calculatedSubtotal : 0);
  
  // FinalTotal uwzględnia zniżkę z kodu rabatowego
  // Jeśli jest zniżka, zawsze obliczamy subtotal - discountAmount (tak jak w cart-modal)
  // W przeciwnym razie używamy cart.total jako głównego źródła, z fallbackiem do subtotal
  const finalTotal = discountApplied && discountAmount > 0
    ? Math.max(0, subtotal - discountAmount) // Upewnij się że nie jest ujemne
    : (cart.total && cart.total > 0 ? cart.total : subtotal);

  // Debug: loguj wartości cen
  useEffect(() => {
    const savedDiscountCode = localStorage.getItem('discountCode');
    const savedDiscountAmount = localStorage.getItem('discountAmount');
    const calculatedFinalTotal = discountApplied && discountAmount > 0 
      ? Math.max(0, subtotal - discountAmount) 
      : finalTotal;
    
    console.log('💰 CheckoutSection: Price calculation', {
      itemsCount: items.length,
      calculatedSubtotal,
      cartSubtotal: cart.subtotal,
      cartTotal: cart.total,
      subtotal,
      finalTotal,
      calculatedFinalTotal,
      discountApplied,
      discountAmount,
      discountCode,
      'localStorage.discountCode': savedDiscountCode,
      'localStorage.discountAmount': savedDiscountAmount,
      'shouldApplyDiscount': discountApplied && discountAmount > 0
    });
    
    // Ostrzeżenie jeśli kod rabatowy jest w localStorage ale nie został zastosowany
    if (savedDiscountCode && savedDiscountAmount && !discountApplied) {
      console.warn('⚠️ CheckoutSection: Discount code found in localStorage but not applied!', {
        code: savedDiscountCode,
        amount: savedDiscountAmount,
        subtotal,
        cartSubtotal: cart.subtotal
      });
    }
  }, [items.length, calculatedSubtotal, cart.subtotal, cart.total, subtotal, finalTotal, discountApplied, discountAmount, discountCode]);

  // Funkcja do zastosowania kodu rabatowego
  const applyDiscountCode = () => {
    if (!discountCode.trim()) {
      setDiscountError('Wprowadź kod rabatowy');
      return;
    }

    // Sprawdź czy kod nie został już wprowadzony w cart
    if (isDiscountFromCart) {
      setDiscountError('Kod rabatowy został już wprowadzony w koszyku');
      return;
    }

    const validation = PricingService.validateDiscountCode(discountCode.trim(), subtotal);
    
    if (validation.isValid) {
      setDiscountApplied(true);
      setDiscountAmount(validation.discountAmount);
      setDiscountError(null);
      setValue('discountCode', discountCode.trim());
      
      // Zapisz do localStorage z flagą źródła
      localStorage.setItem('discountCode', discountCode.trim());
      localStorage.setItem('discountAmount', validation.discountAmount.toString());
      localStorage.setItem('discountSource', 'checkout');
      setDiscountSource('checkout');
      
      console.log('✅ CheckoutSection: Discount code applied', {
        code: discountCode.trim(),
        amount: validation.discountAmount,
        subtotal: subtotal
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
        if (currentSource === 'checkout') {
          localStorage.removeItem('discountCode');
          localStorage.removeItem('discountAmount');
          localStorage.removeItem('discountSource');
          setDiscountSource(null);
        }
      }
    }
  };

  // Redirect jeśli koszyk pusty (z opóźnieniem żeby dać czas na załadowanie)
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🛒 CheckoutSection: itemCount:', itemCount, 'orderSuccess:', orderSuccess);
      if (itemCount === 0 && !orderSuccess) {
        console.log('🛒 CheckoutSection: Empty cart, redirecting to home');
        debugLog('CheckoutSection: Empty cart, redirecting to home');
        router.push('/');
      }
    }, 1000); // 1 sekunda opóźnienia

    return () => clearTimeout(timer);
  }, [itemCount, orderSuccess, router]);

  // Sprawdź walidację dla aktualnego kroku
  const isCurrentStepValid = () => {
    const watchedValues = watch();
    console.log('🛒 CheckoutSection: Checking step validation, currentStep:', currentStep);
    console.log('🛒 CheckoutSection: watchedValues:', watchedValues);
    console.log('🛒 CheckoutSection: form errors:', errors);
    console.log('🛒 CheckoutSection: form isValid:', isValid);
    
    switch (currentStep) {
      case 1:
        // Dane kontaktowe
        const step1Valid = watchedValues.firstName && 
               watchedValues.lastName && 
               watchedValues.email && 
               watchedValues.phone;
        console.log('🛒 CheckoutSection: Step 1 validation:', step1Valid);
        return step1Valid;
      case 2:
        // Adres
        const step2Valid = watchedValues.street && 
               watchedValues.city && 
               watchedValues.postalCode && 
               watchedValues.country;
        console.log('🛒 CheckoutSection: Step 2 validation:', step2Valid);
        return step2Valid;
      case 3:
        // Płatność
        const step3Valid = watchedValues.paymentMethod && 
               watchedValues.termsAccepted;
        console.log('🛒 CheckoutSection: Step 3 validation:', step3Valid);
        return step3Valid;
      default:
        return false;
    }
  };

  const nextStep = () => {
    console.log('🛒 CheckoutSection: nextStep called, currentStep:', currentStep, 'isValid:', isValid);
    console.log('🛒 CheckoutSection: form errors:', errors);
    console.log('🛒 CheckoutSection: isCurrentStepValid:', isCurrentStepValid());
    
    if (currentStep < 3 && isCurrentStepValid()) {
      setCurrentStep(currentStep + 1);
    } else if (!isCurrentStepValid()) {
      console.log('🛒 CheckoutSection: Current step validation failed');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    console.log('🛒 CheckoutSection: onSubmit called with data:', data);
    console.log('🛒 CheckoutSection: items.length:', items.length);
    console.log('🛒 CheckoutSection: form isValid:', isValid);
    console.log('🛒 CheckoutSection: form errors:', errors);
    
    if (items.length === 0) {
      console.error('❌ Cannot submit empty cart');
      return;
    }

    console.log('🛒 CheckoutSection: Starting order submission...');
    setIsSubmitting(true);
    debugLog('CheckoutSection: Submitting order', data);

    try {
      console.log('🛒 CheckoutSection: Preparing customer data...');
      // Przygotuj dane w starym formacie dla kompatybilności
      const customerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.street,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
      };
      console.log('🛒 CheckoutSection: customerData:', customerData);

      const shippingData = {
        method: 'standard',
        methodName: 'Standardowa dostawa',
        cost: 0,
        estimatedDelivery: '2-3 dni robocze',
      };
      console.log('🛒 CheckoutSection: shippingData:', shippingData);

      const paymentData = {
        method: data.paymentMethod,
        methodName: 'Przelew Bankowy (Przelewy24)',
      };
      console.log('🛒 CheckoutSection: paymentData:', paymentData);

      console.log('🛒 CheckoutSection: Converting cart items...');
      // Konwertuj items z nowego formatu na stary format
      const cartProducts = items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        name: item.productName,
        image: item.productImage || "/images/products/placeholder.png",
        pricing: {
          basePrice: item.unitPrice,
          totalPrice: item.subtotal,
          modifiers: 0
        },
        configuration: item.configuration,
        carDetails: isMatCartConfiguration(item.configuration)
          ? item.configuration.carDetails
          : {},
        status: 'cached' as const,
        createdAt: new Date(),
        // Dodaj brakujące pola dla kompatybilności
        productType: item.productType,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        productImage: item.productImage,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      }));
      console.log('🛒 CheckoutSection: cartProducts:', cartProducts);

      console.log('🛒 CheckoutSection: Calling createOrder...');
      
      // Track AddPaymentInfo przed utworzeniem zamówienia
      try {
        const addPaymentInfoData = {
          content_name: 'Payment Info Added',
          content_category: 'checkout' as const,
          value: finalTotal,
          currency: 'PLN',
          payment_method: data.paymentMethod,
          contents: items.map(item => ({
            id: item.productId,
            quantity: item.quantity,
            item_price: item.unitPrice,
            item_name: item.productName,
            item_category: item.productType === 'mat' ? 'car_mats' : 'accessories',
            item_brand: isMatCartConfiguration(item.configuration)
              ? item.configuration.carDetails.brand
              : 'EvaPremium',
            item_variant: item.productSku,
          })),
        };
        trackAddPaymentInfo(addPaymentInfoData);
      } catch (error) {
        console.error('[Tracking] Error tracking AddPaymentInfo:', error);
      }
      
      // Przygotuj dane zamówienia w nowym formacie
      const orderData: CreateOrderDTO = {
        customer: {
          name: `${customerData.firstName} ${customerData.lastName}`,
          email: customerData.email,
          phone: customerData.phone,
          ...(data.nip && { taxId: data.nip })
        },
        shippingAddress: {
          street: customerData.address,
          city: customerData.city,
          postalCode: customerData.postalCode,
          country: customerData.country
        },
        paymentMethod: paymentData.method,
        discountCode: discountApplied ? discountCode : undefined,
        discountAmount: discountApplied ? discountAmount : undefined,
        items: cartProducts.map(item => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          productType: item.productType,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          productImage: item.productImage,
          configuration: item.configuration
        }))
      };
      
      // Utwórz zamówienie
      const order = await createOrder(orderData);
      console.log('🛒 CheckoutSection: createOrder completed, order:', order);
      
      debugLog('CheckoutSection: Order created successfully', order);
      
      console.log('🔄 Order created successfully:', order.id);

      // Sprawdź metodę płatności
      if (data.paymentMethod === 'paynow') {
        try {
          console.log('🔄 Starting Paynow payment registration via API endpoint...');
          const result = await paymentsApi.registerPaynowPayment(order.id);

          if (typeof window !== 'undefined') {
            sessionStorage.setItem('pending_order_id', order.id);
          }

          clearCart();

          if (result.paymentUrl) {
            window.location.href = result.paymentUrl;
          } else {
            throw new Error('Brak URL płatności w odpowiedzi');
          }
          return;
        } catch (error) {
          console.error('❌ Paynow payment error:', error);
          setErrorMessage(`Błąd płatności: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
          return;
        }
      }

      if (data.paymentMethod === 'p24') {
        try {
          console.log('🔄 Starting P24 payment registration via API endpoint...');
          console.log('🔍 P24 API Debug Info:');
          console.log('🔍 Order ID:', order.id);
          console.log('🔍 Order Total:', order.total);
          console.log('🔍 Customer Email:', data.email);
          console.log('🔍 Payment Method:', data.paymentMethod);
          
          // Wywołaj API endpoint dla rejestracji płatności P24
          const result = await paymentsApi.registerP24Payment(order.id);
          
          console.log('✅ P24 payment registered via API endpoint:', result.paymentUrl);
          
          // Zapisz orderId w sessionStorage przed przekierowaniem do P24
          // P24 może nie przekazać parametrów w URL, więc potrzebujemy fallback
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('pending_order_id', order.id);
            console.log('💾 Saved orderId to sessionStorage:', order.id);
          }
          
          // Wyczyść koszyk po udanej rejestracji
          clearCart();
          
          // Przekieruj do P24
          if (result.paymentUrl) {
            window.location.href = result.paymentUrl;
          } else {
            throw new Error('Brak URL płatności w odpowiedzi');
          }
          return;
        
        } catch (error) {
          console.error('❌ P24 payment error:', error);
          setErrorMessage(`Błąd płatności: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
          return;
        }
      } else {
        // Dla innych metod płatności - wyczyść koszyk i przekieruj do sukcesu
        clearCart();
        console.log('🔄 Redirecting to success page...');
        window.location.href = `/payment/success?orderId=${order.id}`;
        return;
      }
      
      // Pokaż sukces (tylko jeśli nie było przekierowania)
      setOrderNumber(order.id);
      setOrderSuccess(true);
      
    } catch (error) {
      console.error('❌ CheckoutSection: Error creating order:', error);
      console.error('❌ CheckoutSection: Error details:', error);
      alert('Wystąpił błąd podczas składania zamówienia. Sprawdź konsolę przeglądarki.');
    } finally {
      console.log('🛒 CheckoutSection: Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  // Strona sukcesu
  if (orderSuccess && orderNumber) {
    return (
      <div className="min-h-screen bg-black py-12 relative overflow-hidden">
        {/* Animowane tło z gradientem - ciemniejszy motyw */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-800/10"></div>
        
        {/* Animowane cząsteczki - więcej czerwieni */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-2 h-2 bg-red-600 rounded-full animate-float-hover"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-red-500 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-700 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-60 left-1/3 w-1 h-1 bg-red-500 rounded-full animate-float-hover" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute bottom-60 right-1/4 w-1.5 h-1.5 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.8s'}}></div>
        </div>

        <div className="max-w-2xl mx-auto px-4 relative z-10">
          <Card className="text-center bg-[#111] backdrop-blur border-white/5 shadow-2xl">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500/30">
                <Check className="w-8 h-8 text-red-500" />
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                Zamówienie zostało złożone!
              </h1>
              
              <p className="text-gray-400 mb-6">
                Dziękujemy za zakup. Twoje zamówienie zostało przyjęte do realizacji.
              </p>
              
              <div className="bg-white/5 border border-white/5 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400 mb-1">Numer zamówienia:</p>
                <p className="text-xl font-bold text-red-400">{orderNumber}</p>
              </div>
              
              <div className="space-y-3">
                <Button asChild className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105">
                  <Link href="/">
                    Powrót do strony głównej
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white">
                  <Link href={`/order/${orderNumber}`}>
                    Zobacz szczegóły zamówienia
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 relative overflow-hidden pb-safe">
      {/* Animowane tło z gradientem - ciemniejszy motyw */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-800/10"></div>
      
      {/* Animowane cząsteczki - więcej czerwieni */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-600 rounded-full animate-float-hover"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-red-500 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-700 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-red-500 rounded-full animate-float-hover" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-60 right-1/4 w-1.5 h-1.5 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.8s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header z większym spacing */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
            Finalizacja zamówienia
          </h1>
          <p className="text-gray-400 text-lg">
            Uzupełnij dane, aby dokończyć zakup
          </p>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mt-6"></div>
        </div>

        {/* Progress Steps - Sticky on mobile - ciemniejszy motyw */}
        <div className="sticky top-0 z-20 bg-black/95 backdrop-blur border-b border-red-900/30 mb-8 -mx-6 px-6 py-4 pt-safe">
          <div className="flex items-center justify-center">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className={`flex items-center justify-center min-w-[48px] min-h-[48px] w-12 h-12 rounded-full border-2 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation ${
                currentStep >= step 
                  ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/50' 
                  : 'border-red-800/50 text-gray-400 bg-black/80 hover:border-red-600/70 hover:bg-red-900/20'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                  currentStep > step ? 'bg-red-600' : 'bg-red-800/30'
                }`} />
              )}
            </React.Fragment>
          ))}
          </div>
          <div className="mt-4 max-w-3xl mx-auto">
            <div className="flex items-center justify-between text-xs text-neutral-300 mb-2">
              <span>
                {currentStep >= 2
                  ? 'Jeśli złożysz i opłacisz zamówienie w ciągu 15 minut, otrzymasz priorytet w kolejce produkcyjnej i szybszą realizację.'
                  : 'Przejdź do kroku 2, aby włączyć 15‑minutowy priorytet produkcyjny i szybszą realizację.'}
              </span>
              <span>Pozostało: {currentStep >= 2 ? `${minutes}:${seconds}` : '15:00'}</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
              {currentStep >= 2 ? (
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ ease: 'linear', duration: 0.9 }}
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500" />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-3 gap-8 xl:gap-12">
          {/* Form */}
          <div className="lg:col-span-3 xl:col-span-2">
            <form 
              id="checkout-form"
              onSubmit={handleSubmit(
                (data) => {
                  console.log('🛒 CheckoutSection: onSubmit called with valid data:', data);
                  onSubmit(data);
                },
                (errors) => {
                  console.log('🛒 CheckoutSection: Form validation failed with errors:', errors);
                  console.log('🛒 CheckoutSection: Please fix the form errors before submitting');
                }
              )} 
              className="space-y-8"
            >
              {/* Step 1: Dane kontaktowe */}
              {currentStep === 1 && (
                <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 backdrop-blur border-white/10 shadow-2xl hover:shadow-xl transition-all duration-300">
                  <CardHeader className="border-l-4 border-red-500 px-4 md:px-8 py-4 md:py-6">
                    <CardTitle className="flex items-center text-white text-lg md:text-xl">
                      <CreditCard className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-red-500" />
                      Dane kontaktowe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 md:space-y-6 px-4 md:px-8 pb-6 md:pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-neutral-200 font-medium text-base">Imię *</Label>
                        <Input
                          id="firstName"
                          {...register("firstName")}
                          className={`min-h-[48px] h-12 bg-neutral-600/40 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/30 text-base ${
                            errors.firstName ? "border-red-500 bg-red-900/20" : ""
                          }`}
                        />
                        {errors.firstName && (
                          <p className="text-red-400 text-sm mt-2">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-neutral-200 font-medium text-base">Nazwisko *</Label>
                        <Input
                          id="lastName"
                          {...register("lastName")}
                          className={`min-h-[48px] h-12 bg-neutral-600/40 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/30 text-base ${
                            errors.lastName ? "border-red-500 bg-red-900/20" : ""
                          }`}
                        />
                        {errors.lastName && (
                          <p className="text-red-400 text-sm mt-2">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-neutral-200 font-medium text-base">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className={`min-h-[48px] h-12 bg-neutral-600/40 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/30 text-base ${
                          errors.email ? "border-red-500 bg-red-900/20" : ""
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-2">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-neutral-200 font-medium text-base">Telefon *</Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        className={`min-h-[48px] h-12 bg-neutral-600/40 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/30 text-base ${
                          errors.phone ? "border-red-500 bg-red-900/20" : ""
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-sm mt-2">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Adres */}
              {currentStep === 2 && (
                <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 backdrop-blur border-white/10 shadow-2xl hover:shadow-xl transition-all duration-300">
                  <CardHeader className="border-l-4 border-red-500 px-4 md:px-8 py-4 md:py-6">
                    <CardTitle className="flex items-center text-white text-lg md:text-xl">
                      <Truck className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-red-500" />
                      Adres wysyłkowy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 md:space-y-6 px-4 md:px-8 pb-6 md:pb-8">
                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-neutral-200 font-medium text-base">Ulica i numer *</Label>
                      <Input
                        id="street"
                        {...register("street")}
                        className={`min-h-[48px] h-12 bg-neutral-600/40 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/30 text-base ${
                          errors.street ? "border-red-500 bg-red-900/20" : ""
                        }`}
                      />
                      {errors.street && (
                        <p className="text-red-400 text-sm mt-2">
                          {errors.street.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode" className="text-neutral-200 font-medium text-base">Kod pocztowy *</Label>
                        <Input
                          id="postalCode"
                          {...register("postalCode")}
                          className={`min-h-[48px] h-12 bg-neutral-600/40 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/30 text-base ${
                            errors.postalCode ? "border-red-500 bg-red-900/20" : ""
                          }`}
                        />
                        {errors.postalCode && (
                          <p className="text-red-400 text-sm mt-2">
                            {errors.postalCode.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="city" className="text-neutral-200 font-medium text-base">Miasto *</Label>
                        <Input
                          id="city"
                          {...register("city")}
                          className={`min-h-[48px] h-12 bg-neutral-600/40 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/30 text-base ${
                            errors.city ? "border-red-500 bg-red-900/20" : ""
                          }`}
                        />
                        {errors.city && (
                          <p className="text-red-400 text-sm mt-2">
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-neutral-200 font-medium text-base">Kraj *</Label>
                      <Input
                        id="country"
                        {...register("country")}
                        className={`min-h-[48px] h-12 bg-neutral-600/40 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/30 text-base ${
                          errors.country ? "border-red-500 bg-red-900/20" : ""
                        }`}
                      />
                      {errors.country && (
                        <p className="text-red-400 text-sm mt-2">
                          {errors.country.message}
                        </p>
                      )}
                    </div>

                    {/* Billing address */}
                    <div className="pt-4 border-t">
                      <div className="space-y-4 mb-4">
                        <div className="space-y-2">
                          <Label htmlFor="nip" className="text-neutral-200 font-medium text-base">
                            NIP na fakturę (opcjonalnie)
                          </Label>
                          <Input
                            id="nip"
                            {...register("nip")}
                            placeholder="np. 1234567890"
                            maxLength={13}
                            className={`min-h-[48px] h-12 bg-neutral-600/40 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/30 text-base ${
                              errors.nip ? "border-red-500 bg-red-900/20" : ""
                            }`}
                          />
                          {errors.nip && (
                            <p className="text-red-400 text-sm mt-2">
                              {errors.nip.message}
                            </p>
                          )}
                          <p className="text-neutral-400 text-xs">
                            Wpisz NIP, jeśli potrzebujesz faktury VAT na firmę
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mb-4">
                        <Checkbox
                          id="sameAsShipping"
                          checked={sameAsShipping}
                          onCheckedChange={(checked) => setValue("sameAsShipping", !!checked)}
                        />
                        <Label htmlFor="sameAsShipping" className="text-neutral-200">
                          Adres do faktury taki sam jak adres wysyłkowy
                        </Label>
                      </div>

                      {!sameAsShipping && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-neutral-200">Adres do faktury</h4>
                          <div>
                            <Label htmlFor="billingStreet" className="text-neutral-200">Ulica i numer *</Label>
                            <Input
                              id="billingStreet"
                              {...register("billingStreet")}
                              className={`min-h-[48px] h-12 bg-neutral-600/40 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/30 text-base ${
                                errors.billingStreet ? "border-red-500 bg-red-900/20" : ""
                              }`}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="billingPostalCode" className="text-neutral-200">Kod pocztowy *</Label>
                              <Input
                                id="billingPostalCode"
                                {...register("billingPostalCode")}
                                className={`min-h-[48px] h-12 bg-neutral-600/40 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/30 text-base ${
                                  errors.billingPostalCode ? "border-red-500 bg-red-900/20" : ""
                                }`}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label htmlFor="billingCity" className="text-neutral-200">Miasto *</Label>
                              <Input
                                id="billingCity"
                                {...register("billingCity")}
                                className={`min-h-[48px] h-12 bg-neutral-600/40 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/30 text-base ${
                                  errors.billingCity ? "border-red-500 bg-red-900/20" : ""
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Płatność */}
              {currentStep === 3 && (
                <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 backdrop-blur border-white/10 shadow-2xl hover:shadow-xl transition-all duration-300">
                  <CardHeader className="border-l-4 border-red-500 px-4 md:px-8 py-4 md:py-6">
                    <CardTitle className="flex items-center text-white text-lg md:text-xl">
                      <CreditCard className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-red-500" />
                      Metoda płatności
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 md:space-y-8 px-4 md:px-8 pb-6 md:pb-8">
                    <div className="space-y-4">
                      <div
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 md:p-6 rounded-lg border transition-all duration-300 cursor-pointer border-red-500 bg-red-900/30"
                        onClick={() => setValue("paymentMethod", checkoutPaymentMethod)}
                      >
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-red-500 bg-red-500 flex-shrink-0">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1 cursor-pointer w-full">
                          <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-red-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0 w-full">
                            <div className="font-medium text-base text-white mb-1">
                              {checkoutPaymentLabel}
                            </div>
                            <div className="text-xs md:text-sm text-gray-400 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
                              <span className="whitespace-normal">Karty, BLIK, przelewy, Apple Pay, Google Pay</span>
                              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                <Image
                                  src="/formy_platnosci/visa.png"
                                  alt="Visa"
                                  width={32}
                                  height={20}
                                  className="object-contain md:w-10 md:h-[26px]"
                                />
                                <Image
                                  src="/formy_platnosci/mastercard.png"
                                  alt="Mastercard"
                                  width={32}
                                  height={20}
                                  className="object-contain md:w-10 md:h-[26px]"
                                />
                                <Image
                                  src="/formy_platnosci/blik.png"
                                  alt="BLIK"
                                  width={32}
                                  height={20}
                                  className="object-contain md:w-10 md:h-[26px]"
                                />
                                <Image
                                  src="/formy_platnosci/apple.jpg"
                                  alt="Apple Pay"
                                  width={32}
                                  height={20}
                                  className="object-contain md:w-10 md:h-[26px]"
                                />
                                <Image
                                  src="/formy_platnosci/google.png"
                                  alt="Google Pay"
                                  width={32}
                                  height={20}
                                  className="object-contain md:w-10 md:h-[26px]"
                                />
                              </div>
                            </div>
                          </div>
                          <Check className="w-5 h-5 text-red-400 flex-shrink-0 sm:ml-auto" />
                        </div>
                      </div>
                    </div>

                    {errors.paymentMethod && (
                      <p className="text-red-400 text-sm">
                        {errors.paymentMethod.message}
                      </p>
                    )}

                    {errorMessage && (
                      <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <p className="text-red-400 text-sm">{errorMessage}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="notes" className="text-neutral-300 font-medium">Notatki (opcjonalnie)</Label>
                      <textarea
                        id="notes"
                        {...register("notes")}
                        className="w-full p-3 bg-neutral-600/40 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/30 rounded-lg resize-none"
                        rows={3}
                        placeholder="Dodatkowe informacje do zamówienia..."
                      />
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <Controller
                          name="termsAccepted"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id="termsAccepted"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-white/10 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                            />
                          )}
                        />
                        <Label htmlFor="termsAccepted" className="text-sm text-neutral-300 leading-relaxed">
                          Akceptuję <Link href="/regulamin" className="text-red-400 hover:text-red-300 hover:underline">regulamin</Link> *
                        </Label>
                      </div>
                      {errors.termsAccepted && (
                        <p className="text-red-400 text-sm">
                          {errors.termsAccepted.message}
                        </p>
                      )}

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="marketingAccepted"
                          {...register("marketingAccepted")}
                          className="border-white/10 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <Label htmlFor="marketingAccepted" className="text-sm text-neutral-300 leading-relaxed">
                          Chcę otrzymywać informacje o nowościach i promocjach
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {orderError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">
                    Błąd: {orderError}
                  </p>
                </div>
              )}

              {/* Navigation - Desktop only (pod formularzem) */}
              <div className="hidden lg:block mt-8">
                <div className="flex flex-row justify-between items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 px-8 py-4 text-base"
                  >
                    <ArrowLeft className="w-5 h-5 mr-3" />
                    Wstecz
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!isCurrentStepValid()}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-10 py-4 text-base"
                    >
                      Dalej
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      form="checkout-form"
                      disabled={isSubmitting || orderLoading}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-10 py-4 text-base"
                      onClick={() => {
                        console.log('🛒 CheckoutSection: Submit button clicked (desktop)');
                        console.log('🛒 CheckoutSection: isSubmitting:', isSubmitting);
                        console.log('🛒 CheckoutSection: orderLoading:', orderLoading);
                        console.log('🛒 CheckoutSection: disabled:', isSubmitting || orderLoading);
                      }}
                    >
                      {isSubmitting || orderLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                          Przetwarzanie...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 mr-3" />
                          Zapłać teraz
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2 xl:col-span-1 flex flex-col">
            <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 backdrop-blur border-white/10 shadow-2xl hover:shadow-xl transition-all duration-300">
              <CardHeader className="border-b border-white/10 px-4 md:px-6 py-3 md:py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg text-white">Podsumowanie zamówienia</CardTitle>
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-4">
                <div className="space-y-3 md:space-y-4">
                  {/* Items */}
                  <div className="space-y-2 md:space-y-3">
                    {items.map((item, index) => {
                      const matConfig = isMatCartConfiguration(item.configuration)
                        ? item.configuration
                        : null
                      return (
                      <div key={item.id} className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/10 rounded-lg p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                        {/* Header z nazwą produktu */}
                        <div className="flex items-start justify-between mb-2 md:mb-3">
                          <div className="flex-1">
                            <h3 className="text-base md:text-lg font-bold text-white mb-1">
                              {item.productType === 'mat' ? 'Dywaniki samochodowe' : item.productName}
                            </h3>
                            
                            {/* Szczegóły samochodu */}
                            {matConfig?.carDetails && (
                              <div className="text-xs md:text-sm text-neutral-300">
                                <p className="font-medium">
                                  {matConfig.carDetails.brand} {matConfig.carDetails.model}
                                  {matConfig.carDetails.generation && ` ${matConfig.carDetails.generation}`}
                                  {matConfig.carDetails.year && ` (${matConfig.carDetails.year})`}
                                </p>
                                {matConfig.carDetails.bodyType && (
                                  <p className="text-xs text-neutral-400 capitalize mt-0.5">
                                    {matConfig.carDetails.bodyType}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Obraz produktu */}
                          <div className="ml-2 md:ml-3 flex-shrink-0">
                            <div className="w-10 h-10 md:w-14 md:h-14 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                              {item.productImage ? (
                                <img 
                                  src={item.productImage} 
                                  alt={item.productName}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="text-neutral-400 text-xs text-center">
                                  {item.productType === 'mat' ? '🚗' : '📦'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Konfiguracja dywaników */}
                        {matConfig && (
                          <div className="mb-2 md:mb-3">
                            <div className="grid grid-cols-1 gap-2">
                              {matConfig.setVariant && (
                                <div className="flex items-center justify-between py-1.5 px-2.5 bg-white/5 rounded-lg">
                                  <span className="text-xs md:text-sm text-neutral-300">Zestaw:</span>
                                  <span className="text-xs md:text-sm font-medium text-white text-right">
                                    {getMatSetVariantLabel(
                                      getMatConfigurationLabelContext(
                                        matConfig as MatConfiguration,
                                      ),
                                    )}
                                    {isSinglePriceSetType(matConfig.setType) && (
                                      <span className="block text-[10px] md:text-xs text-neutral-400 mt-0.5">
                                        {getMatProductSubtitleLabel(
                                          getMatConfigurationLabelContext(
                                            matConfig as MatConfiguration,
                                          ),
                                        )}
                                      </span>
                                    )}
                                    {!isSinglePriceSetType(matConfig.setType) &&
                                      matConfig.setVariant === 'front' && (
                                      <span className="block text-[10px] md:text-xs text-neutral-400 mt-0.5">(przód)</span>
                                    )}
                                    {!isSinglePriceSetType(matConfig.setType) &&
                                      matConfig.setVariant === 'basic' && (
                                      <span className="block text-[10px] md:text-xs text-neutral-400 mt-0.5">(przód + tył)</span>
                                    )}
                                    {!isSinglePriceSetType(matConfig.setType) &&
                                      matConfig.setVariant === 'premium' && (
                                      <span className="block text-[10px] md:text-xs text-neutral-400 mt-0.5">(przód + tył + bagażnik)</span>
                                    )}
                                  </span>
                                </div>
                              )}

                              {matConfig.setType && !isSinglePriceSetType(matConfig.setType) && (
                                <div className="flex items-center justify-between py-1.5 px-2.5 bg-white/5 rounded-lg">
                                  <span className="text-xs md:text-sm text-neutral-300">Typ:</span>
                                  <span className="text-xs md:text-sm font-medium text-white">
                                    {getMatTypeLabel(matConfig.setType)}
                                  </span>
                                </div>
                              )}

                              {matConfig.cellType && (
                                <div className="flex items-center justify-between py-1.5 px-2.5 bg-white/5 rounded-lg">
                                  <span className="text-xs md:text-sm text-neutral-300">Struktura:</span>
                                  <span className="text-xs md:text-sm font-medium text-white">
                                    {matConfig.cellType === 'diamonds' ? 'Romby' :
                                     matConfig.cellType === 'honey' ? 'Plaster miodu' :
                                     matConfig.cellType}
                                  </span>
                                </div>
                              )}

                              {(matConfig.materialColor || matConfig.edgeColor) && (
                                <div className="flex items-center justify-between py-1.5 px-2.5 bg-white/5 rounded-lg">
                                  <span className="text-xs md:text-sm text-neutral-300">Kolor:</span>
                                  <span className="text-xs md:text-sm font-medium text-white text-right">
                                    {matConfig.materialColor && (
                                      <span>{getColorInfo(matConfig.materialColor).name}</span>
                                    )}
                                    {matConfig.materialColor && matConfig.edgeColor && (
                                      <span className="mx-1">+</span>
                                    )}
                                    {matConfig.edgeColor && (
                                      <span className="text-neutral-400">{getColorInfo(matConfig.edgeColor).name} obszycie</span>
                                    )}
                                  </span>
                                </div>
                              )}

                              {matConfig.heelPad === 'yes' && (
                                <div className="flex items-center justify-between py-1.5 px-2.5 bg-orange-900/20 border border-orange-700/30 rounded-lg">
                                  <span className="text-xs md:text-sm text-orange-300">Dodatki:</span>
                                  <span className="text-xs md:text-sm font-medium text-orange-200">
                                    Ochraniacze pod piętę
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Footer z ilością i ceną */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                          <div className="flex items-center space-x-2">
                            <span className="text-neutral-300 text-xs md:text-sm">Ilość:</span>
                            <span className="w-7 text-center font-semibold text-white text-base md:text-lg bg-white/5 rounded px-1.5 py-0.5">
                              {item.quantity}
                            </span>
                          </div>

                          <div className="text-right">
                            <p className="text-lg md:text-xl font-bold text-white">
                              {PricingService.formatPrice(item.subtotal)}
                            </p>
                            <p className="text-xs md:text-sm text-neutral-400">
                              {PricingService.formatPrice(item.unitPrice)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>

                  <Separator className="bg-white/10 my-2 md:my-3" />

                  {/* Discount Code */}
                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-white text-sm md:text-base font-medium">Kod rabatowy</Label>
                    <div className="flex space-x-2">
                      <Input 
                        value={discountCode}
                        onChange={(e) => handleDiscountCodeChange(e.target.value)}
                        placeholder=""
                        className={`min-h-[40px] h-10 md:h-11 bg-neutral-600/40 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/30 rounded-lg text-sm md:text-base ${
                          discountError ? 'border-red-500' : discountApplied ? 'border-green-500' : ''
                        }`}
                        disabled={discountApplied || isDiscountFromCart}
                      />
                      <Button 
                        type="button"
                        onClick={applyDiscountCode}
                        disabled={discountApplied || !discountCode.trim() || isDiscountFromCart}
                        className="h-10 md:h-11 bg-red-600 border-red-500 text-white hover:bg-red-700 rounded-lg px-4 md:px-5 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {discountApplied ? '✓' : 'Zastosuj'}
                      </Button>
                    </div>
                    {discountError && (
                      <p className="text-red-400 text-xs md:text-sm">{discountError}</p>
                    )}
                    {isDiscountFromCart && (
                      <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-2 md:p-2.5">
                        <p className="text-blue-400 text-xs md:text-sm font-medium">
                          Kod rabatowy został wprowadzony w koszyku
                        </p>
                      </div>
                    )}
                    {discountApplied && !isDiscountFromCart && (
                      <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-2 md:p-2.5">
                        <p className="text-green-400 text-xs md:text-sm font-medium">
                          ✓ Kod zastosowany! Zniżka: -{PricingService.formatPrice(discountAmount)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 md:space-y-3 pt-2 md:pt-3">
                    <div className="pt-2 md:pt-3 border-t border-white/10 bg-white/5 p-3 md:p-4 rounded-lg space-y-1.5 md:space-y-2">
                      <div className="flex justify-between items-center text-neutral-300">
                        <span className="text-sm md:text-base">Wartość produktów:</span>
                        <span className="text-sm md:text-base">
                          {PricingService.formatPrice(subtotal || cart.subtotal || 0)}
                        </span>
                      </div>
                      {discountApplied && (
                        <div className="flex justify-between items-center text-green-400">
                          <span className="text-sm md:text-base">Zniżka ({discountCode}):</span>
                          <span className="text-sm md:text-base font-semibold">-{PricingService.formatPrice(discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-white/10">
                        <span className="text-neutral-300 text-xs md:text-sm">Razem do zapłaty</span>
                        <div className="text-right">
                          <span className="text-white font-bold text-2xl md:text-3xl">
                            {PricingService.formatPrice(
                              discountApplied && discountAmount > 0 
                                ? Math.max(0, subtotal - discountAmount)
                                : (finalTotal > 0 ? finalTotal : (subtotal > 0 ? subtotal : 0))
                            )}
                            {' '}
                            <span className="text-neutral-300 text-xs md:text-sm font-normal">PLN</span>
                          </span>
                        </div>
                      </div>
                      {discountApplied && (
                        <p className="text-green-400 text-xs md:text-sm mt-2 mb-2 px-2 py-1.5">
                          Oszczędzasz {PricingService.formatPrice(discountAmount)}!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation - Pod podsumowaniem zamówienia (tylko mobile) */}
            <div className="lg:hidden mt-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 px-4 sm:px-8 lg:px-8 py-3 sm:py-4 lg:py-4 text-sm sm:text-base lg:text-base w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 mr-2 sm:mr-3 lg:mr-3" />
                  Wstecz
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isCurrentStepValid()}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-6 sm:px-10 lg:px-10 py-3 sm:py-4 lg:py-4 text-sm sm:text-base lg:text-base w-full sm:w-auto"
                  >
                    Dalej
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 ml-2 sm:ml-3 lg:ml-3" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting || orderLoading}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-6 sm:px-10 lg:px-10 py-3 sm:py-4 lg:py-4 text-sm sm:text-base lg:text-base w-full sm:w-auto"
                    onClick={() => {
                      console.log('🛒 CheckoutSection: Submit button clicked');
                      console.log('🛒 CheckoutSection: isSubmitting:', isSubmitting);
                      console.log('🛒 CheckoutSection: orderLoading:', orderLoading);
                      console.log('🛒 CheckoutSection: disabled:', isSubmitting || orderLoading);
                    }}
                  >
                    {isSubmitting || orderLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 border-b-2 border-white mr-2 sm:mr-3 lg:mr-3" />
                        Przetwarzanie...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 mr-2 sm:mr-3 lg:mr-3" />
                        Zapłać teraz
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
