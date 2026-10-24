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
  CreditCard,
  Check,
  CreditCard as PaymentIcon,
  CheckCircle,
  AlertCircle,
  Lock,
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
import { paymentsApi, abandonedCartsApi } from '@/lib/api';
import { markPaymentRedirect } from '@/features/checkout/lib/paymentRedirectFlag';
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

const paymentMarks = [
  { src: "/formy_platnosci/blik.png", alt: "BLIK" },
  { src: "/formy_platnosci/visa.png", alt: "Visa" },
  { src: "/formy_platnosci/mastercard.png", alt: "Mastercard" },
  { src: "/formy_platnosci/apple.jpg", alt: "Apple Pay" },
  { src: "/formy_platnosci/google.png", alt: "Google Pay" },
  { src: "/formy_platnosci/american.svg", alt: "American Express" },
] as const;

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

  const cartHasItems = items.length > 0;

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

  // Heartbeat na krokach 2 (adres) i 3 (płatność): 15 min okno, interwał 30s
  useAbandonedCartHeartbeat((currentStep === 2 || currentStep === 3) && cartHasItems, () => {
    const currentSessionId = typeof window !== 'undefined' ? HybridSessionManager.getSessionId() : '';

    if (!currentSessionId || currentSessionId.length < 8) {
      console.warn('[CheckoutSection] Invalid sessionId for heartbeat', { sessionId: currentSessionId });
    }

    const watchedValues = watch();
    const addressData = {
      street: watchedValues.street,
      city: watchedValues.city,
      postalCode: watchedValues.postalCode,
      country: watchedValues.country,
    };

    const firstMatItem = items.find(item => item.productType === 'mat');
    const matConfig = isMatCartConfiguration(firstMatItem?.configuration)
      ? firstMatItem.configuration
      : undefined
    const carData = matConfig?.carDetails ? {
      make: matConfig.carDetails.brand,
      model: matConfig.carDetails.model,
      year: matConfig.carDetails.year,
      bodyType: matConfig.carDetails.bodyType,
      gearbox: matConfig.carDetails.gearbox,
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
      address: addressData.street || addressData.city ? addressData : undefined,
      car: carData,
      configuration: configurationData,
      items: items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        productType: i.productType,
        quantity: i.quantity,
        price: i.unitPrice,
        currency: 'PLN',
        configuration: i.configuration,
      })),
      currency: 'PLN',
      totalAmount: finalTotal,
      metadata: { checkoutStep: currentStep },
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };
  }, { intervalMs: 30000 });

  // Snapshot pending abandoned cart before clearCart kills heartbeat listeners
  const persistPaymentRedirectCartSnapshot = async (
    orderId: string,
    formData: CheckoutFormData
  ) => {
    const sessionId =
      typeof window !== 'undefined' ? HybridSessionManager.getSessionId() : ''
    if (!sessionId || sessionId.length < 8 || items.length === 0) return

    const firstMatItem = items.find((item) => item.productType === 'mat')
    const matConfig = isMatCartConfiguration(firstMatItem?.configuration)
      ? firstMatItem.configuration
      : undefined

    await abandonedCartsApi.persistPaymentRedirectSnapshot({
      sessionId,
      stage: 'checkout_step3',
      cartHasItems: true,
      orderId,
      contact: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        ...(formData.nip && { taxId: formData.nip }),
      },
      address: {
        street: formData.street,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
      },
      car: matConfig?.carDetails
        ? {
            make: matConfig.carDetails.brand,
            model: matConfig.carDetails.model,
            year: matConfig.carDetails.year,
            bodyType: matConfig.carDetails.bodyType,
            gearbox: matConfig.carDetails.gearbox,
          }
        : undefined,
      configuration: matConfig
        ? {
            variant: matConfig.setVariant,
            setType: matConfig.setType,
            cellShape: matConfig.cellType,
            materialColor: matConfig.materialColor,
            trimColor: matConfig.edgeColor,
          }
        : undefined,
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        productType: i.productType,
        quantity: i.quantity,
        price: i.unitPrice,
        currency: 'PLN',
        configuration: i.configuration,
      })),
      currency: 'PLN',
      totalAmount: finalTotal,
      metadata: { checkoutStep: 3, orderId },
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    })
  }

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
            markPaymentRedirect(order.id);
          }

          // Keep pending abandoned-cart snapshot for PayNow ABANDONED → Bitrix export
          await persistPaymentRedirectCartSnapshot(order.id, data);

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
            markPaymentRedirect(order.id);
            console.log('💾 Saved orderId to sessionStorage:', order.id);
          }

          await persistPaymentRedirectCartSnapshot(order.id, data);
          
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

  const stepLabels = ["Kontakt", "Dostawa", "Płatność"];

  // Strona sukcesu
  if (orderSuccess && orderNumber) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-20">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-white/45">
            EVA Premium
          </p>
          <h1 className="text-4xl font-medium tracking-tight text-white md:text-5xl">
            Zamówienie przyjęte.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/55">
            Dziękujemy. Zaczynamy realizację, a potwierdzenie wyślemy na podany adres e-mail.
          </p>
          <div className="mt-10 flex items-baseline justify-between border-y border-white/10 py-5">
            <span className="text-sm text-white/45">Numer zamówienia</span>
            <span className="text-sm font-medium tracking-tight text-white">{orderNumber}</span>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-12 rounded-full bg-red-600 px-8 text-white shadow-none hover:bg-red-500">
              <Link href="/">Strona główna</Link>
            </Button>
            <Button variant="outline" asChild className="h-12 rounded-full border-0 bg-[#2c2c2e] px-8 text-white shadow-none hover:bg-[#3a3a3c]">
              <Link href={`/order/${orderNumber}`}>Szczegóły zamówienia</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-safe text-white">
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-16">
        <div className="mb-10 flex flex-col gap-8 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-white/40">
              Zamówienie
            </p>
            <h1 className="text-4xl font-medium tracking-tight text-white md:text-5xl">
              Finalizacja.
            </h1>
            <p className="mt-3 max-w-md text-base leading-relaxed text-white/50">
              Kilka danych i możesz opłacić zamówienie.
            </p>
          </div>
          <ol className="flex items-center gap-3 text-sm">
            {stepLabels.map((label, index) => {
              const step = index + 1;
              const active = currentStep === step;
              const done = currentStep > step;
              return (
                <li key={label} className="flex items-center gap-3">
                  <span className={active ? "font-medium text-red-500" : done ? "text-white/70" : "text-white/35"}>
                    {label}
                  </span>
                  {step < 3 && <span className={`h-px w-6 ${done ? "bg-red-600" : "bg-white/15"}`} aria-hidden="true" />}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mb-10 rounded-2xl bg-[#1c1c1e] px-5 py-4">
          <div className="flex items-baseline justify-between gap-6 text-sm">
            <p className="max-w-2xl text-white/50">
              {currentStep >= 2
                ? "Opłać zamówienie w ciągu 15 minut, a trafi na początek kolejki produkcyjnej."
                : "Priorytet produkcyjny włącza się na kroku dostawy i trwa 15 minut."}
            </p>
            <p className="shrink-0 tabular-nums text-white">
              {currentStep >= 2 ? `${minutes}:${seconds}` : "15:00"}
            </p>
          </div>
          <div className="mt-3 h-px w-full bg-white/10">
            {currentStep >= 2 ? (
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ ease: "linear", duration: 0.9 }}
                className="h-px bg-red-600"
              />
            ) : (
              <div className="h-px w-full bg-white/25" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-5 xl:grid-cols-3 xl:gap-16">
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
                <Card className="rounded-2xl border border-white/[0.08] bg-[#1c1c1e] shadow-none">
                  <CardHeader className="border-0 px-5 pb-0 pt-7 md:px-8">
                    <CardTitle className="text-xl font-medium tracking-tight text-white">
                      Dane kontaktowe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 px-5 pb-8 pt-6 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium text-white/55">Imię *</Label>
                        <Input
                          id="firstName"
                          {...register("firstName")}
                          className={`h-12 min-h-12 rounded-xl border-0 bg-black/40 text-[15px] text-white shadow-none placeholder:text-white/35 focus-visible:ring-1 focus-visible:ring-red-500/70 focus-visible:ring-offset-0 ${
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
                        <Label htmlFor="lastName" className="text-sm font-medium text-white/55">Nazwisko *</Label>
                        <Input
                          id="lastName"
                          {...register("lastName")}
                          className={`h-12 min-h-12 rounded-xl border-0 bg-black/40 text-[15px] text-white shadow-none placeholder:text-white/35 focus-visible:ring-1 focus-visible:ring-red-500/70 focus-visible:ring-offset-0 ${
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
                      <Label htmlFor="email" className="text-sm font-medium text-white/55">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className={`h-12 min-h-12 rounded-xl border-0 bg-black/40 text-[15px] text-white shadow-none placeholder:text-white/35 focus-visible:ring-1 focus-visible:ring-red-500/70 focus-visible:ring-offset-0 ${
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
                      <Label htmlFor="phone" className="text-sm font-medium text-white/55">Telefon *</Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        className={`h-12 min-h-12 rounded-xl border-0 bg-black/40 text-[15px] text-white shadow-none placeholder:text-white/35 focus-visible:ring-1 focus-visible:ring-red-500/70 focus-visible:ring-offset-0 ${
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
                <Card className="rounded-2xl border border-white/[0.08] bg-[#1c1c1e] shadow-none">
                  <CardHeader className="border-0 px-5 pb-0 pt-7 md:px-8">
                    <CardTitle className="text-xl font-medium tracking-tight text-white">
                      Adres wysyłkowy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 px-5 pb-8 pt-6 md:px-8">
                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-sm font-medium text-white/55">Ulica i numer *</Label>
                      <Input
                        id="street"
                        {...register("street")}
                        className={`h-12 min-h-12 rounded-xl border-0 bg-black/40 text-[15px] text-white shadow-none placeholder:text-white/35 focus-visible:ring-1 focus-visible:ring-red-500/70 focus-visible:ring-offset-0 ${
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
                        <Label htmlFor="postalCode" className="text-sm font-medium text-white/55">Kod pocztowy *</Label>
                        <Input
                          id="postalCode"
                          {...register("postalCode")}
                          className={`h-12 min-h-12 rounded-xl border-0 bg-black/40 text-[15px] text-white shadow-none placeholder:text-white/35 focus-visible:ring-1 focus-visible:ring-red-500/70 focus-visible:ring-offset-0 ${
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
                        <Label htmlFor="city" className="text-sm font-medium text-white/55">Miasto *</Label>
                        <Input
                          id="city"
                          {...register("city")}
                          className={`h-12 min-h-12 rounded-xl border-0 bg-black/40 text-[15px] text-white shadow-none placeholder:text-white/35 focus-visible:ring-1 focus-visible:ring-red-500/70 focus-visible:ring-offset-0 ${
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
                      <Label htmlFor="country" className="text-sm font-medium text-white/55">Kraj *</Label>
                      <Input
                        id="country"
                        {...register("country")}
                        className={`h-12 min-h-12 rounded-xl border-0 bg-black/40 text-[15px] text-white shadow-none placeholder:text-white/35 focus-visible:ring-1 focus-visible:ring-red-500/70 focus-visible:ring-offset-0 ${
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
                          <Label htmlFor="nip" className="text-sm font-medium text-white/55">
                            NIP na fakturę (opcjonalnie)
                          </Label>
                          <Input
                            id="nip"
                            {...register("nip")}
                            placeholder="np. 1234567890"
                            maxLength={13}
                            className={`h-12 min-h-12 rounded-xl border-0 bg-black/40 text-[15px] text-white shadow-none placeholder:text-white/35 focus-visible:ring-1 focus-visible:ring-red-500/70 focus-visible:ring-offset-0 ${
                              errors.nip ? "border-red-500 bg-red-900/20" : ""
                            }`}
                          />
                          {errors.nip && (
                            <p className="text-red-400 text-sm mt-2">
                              {errors.nip.message}
                            </p>
                          )}
                          <p className="text-white/40 text-xs">
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
                        <Label htmlFor="sameAsShipping" className="text-white/70">
                          Adres do faktury taki sam jak adres wysyłkowy
                        </Label>
                      </div>

                      {!sameAsShipping && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-white/70">Adres do faktury</h4>
                          <div>
                            <Label htmlFor="billingStreet" className="text-white/70">Ulica i numer *</Label>
                            <Input
                              id="billingStreet"
                              {...register("billingStreet")}
                              className={`h-12 min-h-12 rounded-xl border-0 bg-black/40 text-[15px] text-white shadow-none placeholder:text-white/35 focus-visible:ring-1 focus-visible:ring-red-500/70 focus-visible:ring-offset-0 ${
                                errors.billingStreet ? "border-red-500 bg-red-900/20" : ""
                              }`}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="billingPostalCode" className="text-white/70">Kod pocztowy *</Label>
                              <Input
                                id="billingPostalCode"
                                {...register("billingPostalCode")}
                                className={`h-12 min-h-12 rounded-xl border-0 bg-black/40 text-[15px] text-white shadow-none placeholder:text-white/35 focus-visible:ring-1 focus-visible:ring-red-500/70 focus-visible:ring-offset-0 ${
                                  errors.billingPostalCode ? "border-red-500 bg-red-900/20" : ""
                                }`}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label htmlFor="billingCity" className="text-white/70">Miasto *</Label>
                              <Input
                                id="billingCity"
                                {...register("billingCity")}
                                className={`h-12 min-h-12 rounded-xl border-0 bg-black/40 text-[15px] text-white shadow-none placeholder:text-white/35 focus-visible:ring-1 focus-visible:ring-red-500/70 focus-visible:ring-offset-0 ${
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
                <Card className="rounded-2xl border border-white/[0.08] bg-[#1c1c1e] shadow-none">
                  <CardHeader className="border-0 px-5 pb-0 pt-7 md:px-8">
                    <CardTitle className="text-xl font-medium tracking-tight text-white">
                      Płatność
                    </CardTitle>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/50">
                      Numer karty wpisujesz dopiero na stronie {checkoutPaymentLabel}. Sklep go nie widzi i nie zapisuje.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6 px-5 pb-8 pt-6 md:px-8">
                    <input type="hidden" {...register("paymentMethod")} />
                    <div className="rounded-2xl bg-[#2c2c2e] p-5">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
                          Operator płatności
                        </p>
                        <p className="mt-1 text-lg font-medium tracking-tight text-white">
                          {checkoutPaymentLabel}
                        </p>
                      </div>
                      <p className="mt-3 max-w-md text-sm leading-relaxed text-white/50">
                        BLIK, karta, Apple Pay, Google Pay albo szybki przelew. Sposób wybierzesz na następnym ekranie.
                      </p>
                      <ul className="mt-5 flex flex-wrap gap-2">
                        {paymentMarks.map((mark) => (
                          <li
                            key={mark.alt}
                            className="flex h-10 w-[4.5rem] items-center justify-center rounded-lg bg-white px-2"
                          >
                            <Image
                              src={mark.src}
                              alt={mark.alt}
                              width={56}
                              height={28}
                              className="h-6 w-auto object-contain"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>

                    <ul className="grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-3">
                      <li>
                        <Lock className="mb-2 h-4 w-4 text-white/40" />
                        <p className="text-sm font-medium text-white">Szyfrowane połączenie</p>
                        <p className="mt-1 text-xs leading-relaxed text-white/45">
                          Płatność idzie bezpośrednio do operatora.
                        </p>
                      </li>
                      <li>
                        <CreditCard className="mb-2 h-4 w-4 text-white/40" />
                        <p className="text-sm font-medium text-white">Bez formularza karty</p>
                        <p className="mt-1 text-xs leading-relaxed text-white/45">
                          Na tej stronie nie prosimy o numer ani kod CVV.
                        </p>
                      </li>
                      <li>
                        <Check className="mb-2 h-4 w-4 text-white/40" />
                        <p className="text-sm font-medium text-white">Potwierdzenie e-mail</p>
                        <p className="mt-1 text-xs leading-relaxed text-white/45">
                          Po opłaceniu wyślemy podsumowanie zamówienia.
                        </p>
                      </li>
                    </ul>

                    {errors.paymentMethod && (
                      <p className="text-red-400 text-sm">
                        {errors.paymentMethod.message}
                      </p>
                    )}

                    {errorMessage && (
                      <div className="mt-4 rounded-2xl border border-white/15 p-4">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-white/70" />
                          <p className="text-sm text-white/80">{errorMessage}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="notes" className="text-white/55 font-medium">Notatki (opcjonalnie)</Label>
                      <textarea
                        id="notes"
                        {...register("notes")}
                        className="w-full resize-none rounded-xl border-0 bg-black/40 p-3 text-[15px] text-white placeholder:text-white/35 outline-none ring-1 ring-transparent focus:ring-red-500/70"
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
                              className="border-white/20 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:text-white"
                            />
                          )}
                        />
                        <Label htmlFor="termsAccepted" className="text-sm text-white/55 leading-relaxed">
                          Akceptuję <Link href="/regulamin" className="text-red-500 hover:text-red-400">regulamin</Link> *
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
                          className="border-white/20 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:text-white"
                        />
                        <Label htmlFor="marketingAccepted" className="text-sm text-white/55 leading-relaxed">
                          Chcę otrzymywać informacje o nowościach i promocjach
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {orderError && (
                <div className="rounded-2xl border border-white/15 p-4">
                  <p className="text-sm text-white/80">
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
                    className="h-12 rounded-full border-0 bg-[#2c2c2e] px-8 text-[15px] font-medium text-white shadow-none hover:bg-[#3a3a3c] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="w-5 h-5 mr-3" />
                    Wstecz
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!isCurrentStepValid()}
                      className="rounded-full bg-red-600 text-white shadow-none hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40 px-10 py-4 text-base"
                    >
                      Dalej
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      form="checkout-form"
                      disabled={isSubmitting || orderLoading}
                      className="rounded-full bg-red-600 text-white shadow-none hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40 px-10 py-4 text-base"
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
                          Przejdź do płatności
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="flex flex-col lg:sticky lg:top-8 lg:col-span-2 xl:col-span-1">
            <Card className="rounded-2xl border border-white/[0.08] bg-[#1c1c1e] shadow-none">
              <CardHeader className="border-0 px-5 pb-0 pt-7 md:px-7">
                <CardTitle className="text-xl font-medium tracking-tight text-white">Podsumowanie</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-7 pt-5 md:px-7">
                <div className="space-y-3 md:space-y-4">
                  {/* Items */}
                  <div className="space-y-2 md:space-y-3">
                    {items.map((item, index) => {
                      const matConfig = isMatCartConfiguration(item.configuration)
                        ? item.configuration
                        : null
                      return (
                      <div key={item.id} className="border-b border-white/10 pb-5 last:border-b-0">
                        {/* Header z nazwą produktu */}
                        <div className="flex items-start justify-between mb-2 md:mb-3">
                          <div className="flex-1">
                            <h3 className="mb-1 text-[15px] font-medium tracking-tight text-white">
                              {item.productType === 'mat' ? 'Dywaniki samochodowe' : item.productName}
                            </h3>
                            
                            {/* Szczegóły samochodu */}
                            {matConfig?.carDetails && (
                              <div className="text-xs md:text-sm text-white/55">
                                <p className="font-medium">
                                  {matConfig.carDetails.brand} {matConfig.carDetails.model}
                                  {matConfig.carDetails.generation && ` ${matConfig.carDetails.generation}`}
                                  {matConfig.carDetails.year && ` (${matConfig.carDetails.year})`}
                                </p>
                                {matConfig.carDetails.bodyType && (
                                  <p className="text-xs text-white/40 capitalize mt-0.5">
                                    {matConfig.carDetails.bodyType}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Obraz produktu */}
                          <div className="ml-2 md:ml-3 flex-shrink-0">
                            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-black/35">
                              {item.productImage ? (
                                <img 
                                  src={item.productImage} 
                                  alt={item.productName}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="text-white/40 text-xs text-center">
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
                                <div className="flex items-center justify-between border-b border-white/10 py-2.5">
                                  <span className="text-xs md:text-sm text-white/55">Zestaw:</span>
                                  <span className="text-xs md:text-sm font-medium text-white text-right">
                                    {getMatSetVariantLabel(
                                      getMatConfigurationLabelContext(
                                        matConfig as MatConfiguration,
                                      ),
                                    )}
                                    {isSinglePriceSetType(matConfig.setType) && (
                                      <span className="block text-[10px] md:text-xs text-white/40 mt-0.5">
                                        {getMatProductSubtitleLabel(
                                          getMatConfigurationLabelContext(
                                            matConfig as MatConfiguration,
                                          ),
                                        )}
                                      </span>
                                    )}
                                    {!isSinglePriceSetType(matConfig.setType) &&
                                      matConfig.setVariant === 'front' && (
                                      <span className="block text-[10px] md:text-xs text-white/40 mt-0.5">(przód)</span>
                                    )}
                                    {!isSinglePriceSetType(matConfig.setType) &&
                                      matConfig.setVariant === 'basic' && (
                                      <span className="block text-[10px] md:text-xs text-white/40 mt-0.5">(przód + tył)</span>
                                    )}
                                    {!isSinglePriceSetType(matConfig.setType) &&
                                      matConfig.setVariant === 'premium' && (
                                      <span className="block text-[10px] md:text-xs text-white/40 mt-0.5">(przód + tył + bagażnik)</span>
                                    )}
                                  </span>
                                </div>
                              )}

                              {matConfig.setType && !isSinglePriceSetType(matConfig.setType) && (
                                <div className="flex items-center justify-between border-b border-white/10 py-2.5">
                                  <span className="text-xs md:text-sm text-white/55">Typ:</span>
                                  <span className="text-xs md:text-sm font-medium text-white">
                                    {getMatTypeLabel(matConfig.setType)}
                                  </span>
                                </div>
                              )}

                              {matConfig.cellType && (
                                <div className="flex items-center justify-between border-b border-white/10 py-2.5">
                                  <span className="text-xs md:text-sm text-white/55">Struktura:</span>
                                  <span className="text-xs md:text-sm font-medium text-white">
                                    {matConfig.cellType === 'diamonds' ? 'Romby' :
                                     matConfig.cellType === 'honey' ? 'Plaster miodu' :
                                     matConfig.cellType}
                                  </span>
                                </div>
                              )}

                              {(matConfig.materialColor || matConfig.edgeColor) && (
                                <div className="flex items-center justify-between border-b border-white/10 py-2.5">
                                  <span className="text-xs md:text-sm text-white/55">Kolor:</span>
                                  <span className="text-xs md:text-sm font-medium text-white text-right">
                                    {matConfig.materialColor && (
                                      <span>{getColorInfo(matConfig.materialColor).name}</span>
                                    )}
                                    {matConfig.materialColor && matConfig.edgeColor && (
                                      <span className="mx-1">+</span>
                                    )}
                                    {matConfig.edgeColor && (
                                      <span className="text-white/40">{getColorInfo(matConfig.edgeColor).name} obszycie</span>
                                    )}
                                  </span>
                                </div>
                              )}

                              {matConfig.heelPad === 'yes' && (
                                <div className="flex items-center justify-between border-b border-white/10 py-2.5">
                                  <span className="text-xs text-white/45 md:text-sm">Dodatki:</span>
                                  <span className="text-xs font-medium text-white md:text-sm">
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
                            <span className="text-white/55 text-xs md:text-sm">Ilość:</span>
                            <span className="rounded-full bg-black/40 px-2.5 py-0.5 text-center text-sm font-medium text-white">
                              {item.quantity}
                            </span>
                          </div>

                          <div className="text-right">
                            <p className="text-base font-medium tracking-tight text-white">
                              {PricingService.formatPrice(item.subtotal)}
                            </p>
                            <p className="text-xs md:text-sm text-white/40">
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
                        className={`h-11 min-h-11 rounded-xl border-0 bg-black/40 text-sm text-white shadow-none placeholder:text-white/35 focus-visible:ring-1 focus-visible:ring-red-500/70 focus-visible:ring-offset-0 ${
                          discountError ? "border-white/70" : discountApplied ? "border-white/50" : ""
                        }`}
                        disabled={discountApplied || isDiscountFromCart}
                      />
                      <Button 
                        type="button"
                        onClick={applyDiscountCode}
                        disabled={discountApplied || !discountCode.trim() || isDiscountFromCart}
                        className="h-11 rounded-full bg-red-600 px-5 text-sm font-medium text-white shadow-none hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {discountApplied ? '✓' : 'Zastosuj'}
                      </Button>
                    </div>
                    {discountError && (
                      <p className="text-red-400 text-xs md:text-sm">{discountError}</p>
                    )}
                    {isDiscountFromCart && (
                      <p className="text-sm text-white/50">
                        Kod rabatowy został wprowadzony w koszyku.
                      </p>
                    )}
                    {discountApplied && !isDiscountFromCart && (
                      <p className="text-sm text-white/70">
                        Zniżka {PricingService.formatPrice(discountAmount)}
                      </p>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 md:space-y-3 pt-2 md:pt-3">
                    <div className="space-y-3 border-t border-white/10 pt-5">
                      <div className="flex justify-between items-center text-white/55">
                        <span className="text-sm md:text-base">Wartość produktów:</span>
                        <span className="text-sm md:text-base">
                          {PricingService.formatPrice(subtotal || cart.subtotal || 0)}
                        </span>
                      </div>
                      {discountApplied && (
                        <div className="flex items-center justify-between text-white">
                          <span className="text-sm md:text-base">Zniżka ({discountCode}):</span>
                          <span className="text-sm md:text-base font-semibold">-{PricingService.formatPrice(discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-white/10">
                        <span className="text-white/55 text-xs md:text-sm">Razem do zapłaty</span>
                        <div className="text-right">
                          <span className="text-3xl font-medium tracking-tight text-white">
                            {PricingService.formatPrice(
                              discountApplied && discountAmount > 0 
                                ? Math.max(0, subtotal - discountAmount)
                                : (finalTotal > 0 ? finalTotal : (subtotal > 0 ? subtotal : 0))
                            )}
                            {' '}
                            <span className="text-white/55 text-xs md:text-sm font-normal">PLN</span>
                          </span>
                        </div>
                      </div>
                      {discountApplied && (
                        <p className="text-sm text-white/50">
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
                  className="h-12 w-full rounded-full border-0 bg-[#2c2c2e] px-6 text-[15px] font-medium text-white shadow-none hover:bg-[#3a3a3c] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 mr-2 sm:mr-3 lg:mr-3" />
                  Wstecz
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isCurrentStepValid()}
                    className="rounded-full bg-red-600 text-white shadow-none hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40 px-6 sm:px-10 lg:px-10 py-3 sm:py-4 lg:py-4 text-sm sm:text-base lg:text-base w-full sm:w-auto"
                  >
                    Dalej
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 ml-2 sm:ml-3 lg:ml-3" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting || orderLoading}
                    className="rounded-full bg-red-600 text-white shadow-none hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40 px-6 sm:px-10 lg:px-10 py-3 sm:py-4 lg:py-4 text-sm sm:text-base lg:text-base w-full sm:w-auto"
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
                        Przejdź do płatności
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
