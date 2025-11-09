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
import { useCart } from '@/hooks/useCart.new';
import { useOrder } from '@/hooks/useOrder.new';
import { CreateOrderDTO } from '@/lib/types/order-new';
import { PricingService } from '@/lib/services/PricingService';
import { debugLog } from '@/lib/config/features';
import { useAbandonedCartHeartbeat } from '@/hooks/useAbandonedCartHeartbeat';
import { HybridSessionManager } from '@/lib/utils/hybrid-session-manager';
import { useTracking, createInitiateCheckoutData } from '@/lib/tracking';
import { motion } from 'framer-motion';

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
  
  // Metoda płatności - tylko Przelewy24
  paymentMethod: z.literal("p24", {
    required_error: "Wybierz metodę płatności"
  }),
  
  // Zgody
  termsAccepted: z.boolean().refine(val => val === true, "Musisz zaakceptować regulamin"),
  marketingAccepted: z.boolean(),
  
  // Notatki
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

/**
 * Nowy Checkout Section używający V2 backendu
 * 
 * Różnice względem starej wersji:
 * - Używa useCart.new.ts (V2)
 * - Używa useOrder.new.ts (V2) 
 * - Tworzy zamówienia przez API /api/orders
 * - Używa nowego formatu danych CreateOrderDTO
 * - Używa PricingService do obliczania cen
 */
export default function CheckoutSectionNew() {
  const router = useRouter();
  const { items, total, itemCount, clearCart } = useCart();
  const { createOrder, saveOrder, isLoading: orderLoading, error: orderError } = useOrder();
  const { trackInitiateCheckout, trackAddPaymentInfo, createInitiateCheckoutData: createInitiateCheckout } = useTracking();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [priorityStartAt, setPriorityStartAt] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(15 * 60 * 1000);
  // Heartbeat (przeniesiony niżej po zainicjalizowaniu formularza, aby dołączyć dane kontaktowe)
  const sessionId = typeof window !== 'undefined' ? HybridSessionManager.getSessionId() : '';

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
    
    return {
      sessionId: currentSessionId,
      stage: currentStep === 2 ? 'checkout_step2' : 'checkout_step3',
      cartHasItems: items.length > 0,
      contact: {
        firstName: contactFirstName,
        lastName: contactLastName,
        email: contactEmail,
        phone: contactPhone,
      },
      address: addressData.street || addressData.city ? addressData : undefined, // Only include if at least street or city is filled
      items: items.map(i => ({ 
        productId: i.productId, 
        productName: i.productName, 
        quantity: i.quantity, 
        price: i.unitPrice, 
        currency: 'PLN' 
      })),
      currency: 'PLN',
      totalAmount: total,
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
      paymentMethod: "p24",
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
        carDetails: item.configuration?.carDetails || {},
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
          value: total,
          currency: 'PLN',
          payment_method: data.paymentMethod,
          contents: items.map(item => ({
            id: item.productId,
            quantity: item.quantity,
            item_price: item.unitPrice,
            item_name: item.productName,
            item_category: item.productType === 'mat' ? 'car_mats' : 'accessories',
            item_brand: item.configuration?.carDetails?.brand || 'EvaPremium',
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
          phone: customerData.phone
        },
        shippingAddress: {
          street: customerData.address,
          city: customerData.city,
          postalCode: customerData.postalCode,
          country: customerData.country
        },
        paymentMethod: paymentData.method,
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
      if (data.paymentMethod === 'p24') {
        try {
          console.log('🔄 Starting P24 payment registration via API endpoint...');
          console.log('🔍 P24 API Debug Info:');
          console.log('🔍 Order ID:', order.id);
          console.log('🔍 Order Total:', order.total);
          console.log('🔍 Customer Email:', data.email);
          console.log('🔍 Payment Method:', data.paymentMethod);
          
          // Wywołaj API endpoint dla rejestracji płatności P24
          const response = await fetch('/api/payments/p24/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order.id })
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
          }
         
          if (!result.success) {
            throw new Error(result.error || 'Błąd rejestracji płatności');
          }

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
          <Card className="text-center bg-gray-900 backdrop-blur border-gray-700 shadow-2xl">
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
              
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400 mb-1">Numer zamówienia:</p>
                <p className="text-xl font-bold text-red-400">{orderNumber}</p>
              </div>
              
              <div className="space-y-3">
                <Button asChild className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105">
                  <Link href="/">
                    Powrót do strony głównej
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
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
          <p className="text-gray-300 text-lg">
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
                  : 'border-red-800/50 text-gray-500 bg-black/80 hover:border-red-600/70 hover:bg-red-900/20'
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
            <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
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
            <form onSubmit={handleSubmit(
              (data) => {
                console.log('🛒 CheckoutSection: onSubmit called with valid data:', data);
                onSubmit(data);
              },
              (errors) => {
                console.log('🛒 CheckoutSection: Form validation failed with errors:', errors);
                console.log('🛒 CheckoutSection: Please fix the form errors before submitting');
              }
            )} className="space-y-8">
              {/* Step 1: Dane kontaktowe */}
              {currentStep === 1 && (
                <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 backdrop-blur border-neutral-700 shadow-2xl hover:shadow-xl transition-all duration-300">
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
                          className={`min-h-[48px] h-12 bg-gray-600/40 border-gray-500 text-white placeholder:text-gray-300 focus:border-red-500 focus:ring-red-500/30 text-base ${
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
                          className={`min-h-[48px] h-12 bg-gray-600/40 border-gray-500 text-white placeholder:text-gray-300 focus:border-red-500 focus:ring-red-500/30 text-base ${
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
                        className={`min-h-[48px] h-12 bg-gray-600/40 border-gray-500 text-white placeholder:text-gray-300 focus:border-red-500 focus:ring-red-500/30 text-base ${
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
                        className={`min-h-[48px] h-12 bg-gray-600/40 border-gray-500 text-white placeholder:text-gray-300 focus:border-red-500 focus:ring-red-500/30 text-base ${
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
                <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 backdrop-blur border-neutral-700 shadow-2xl hover:shadow-xl transition-all duration-300">
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
                        className={`min-h-[48px] h-12 bg-gray-600/40 border-gray-500 text-white placeholder:text-gray-300 focus:border-red-500 focus:ring-red-500/30 text-base ${
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
                          className={`min-h-[48px] h-12 bg-gray-600/40 border-gray-500 text-white placeholder:text-gray-300 focus:border-red-500 focus:ring-red-500/30 text-base ${
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
                          className={`min-h-[48px] h-12 bg-gray-600/40 border-gray-500 text-white placeholder:text-gray-300 focus:border-red-500 focus:ring-red-500/30 text-base ${
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
                        className={`min-h-[48px] h-12 bg-gray-600/40 border-gray-500 text-white placeholder:text-gray-300 focus:border-red-500 focus:ring-red-500/30 text-base ${
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
                              className={`min-h-[48px] h-12 bg-gray-600/40 border-gray-500 text-white placeholder:text-gray-300 focus:border-red-500 focus:ring-red-500/30 text-base ${
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
                                className={`min-h-[48px] h-12 bg-gray-600/40 border-gray-500 text-white placeholder:text-gray-300 focus:border-red-500 focus:ring-red-500/30 text-base ${
                                  errors.billingPostalCode ? "border-red-500 bg-red-900/20" : ""
                                }`}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label htmlFor="billingCity" className="text-neutral-200">Miasto *</Label>
                              <Input
                                id="billingCity"
                                {...register("billingCity")}
                                className={`min-h-[48px] h-12 bg-gray-600/40 border-gray-500 text-white placeholder:text-gray-300 focus:border-red-500 focus:ring-red-500/30 text-base ${
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
                <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 backdrop-blur border-neutral-700 shadow-2xl hover:shadow-xl transition-all duration-300">
                  <CardHeader className="border-l-4 border-red-500 px-4 md:px-8 py-4 md:py-6">
                    <CardTitle className="flex items-center text-white text-lg md:text-xl">
                      <CreditCard className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-red-500" />
                      Metoda płatności
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 md:space-y-8 px-4 md:px-8 pb-6 md:pb-8">
                    <div className="space-y-4">
                      <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 md:p-6 rounded-lg border transition-all duration-300 cursor-pointer border-red-500 bg-red-900/30`}
                      onClick={() => setValue("paymentMethod", "p24")}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center border-red-500 bg-red-500 flex-shrink-0`}>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1 cursor-pointer w-full">
                          <CreditCard className={`w-5 h-5 md:w-6 md:h-6 text-red-400 flex-shrink-0`} />
                          <div className="flex-1 min-w-0 w-full">
                            <div className={`font-medium text-base text-white mb-1`}>
                              Przelewy24
                            </div>
                            <div className={`text-xs md:text-sm text-gray-400 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2`}>
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
                        className="w-full p-3 bg-gray-600/40 border-gray-500 text-white placeholder:text-gray-300 focus:border-red-500 focus:ring-red-500/30 rounded-lg resize-none"
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
                              className="border-neutral-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
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
                          className="border-neutral-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <Label htmlFor="marketingAccepted" className="text-sm text-neutral-300 leading-relaxed">
                          Chcę otrzymywać informacje o nowościach i promocjach
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-6 md:pt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-base w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  Wstecz
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isCurrentStepValid()}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-base w-full sm:w-auto"
                  >
                    Dalej
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || orderLoading}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-base w-full sm:w-auto"
                    onClick={() => {
                      console.log('🛒 CheckoutSection: Submit button clicked');
                      console.log('🛒 CheckoutSection: isSubmitting:', isSubmitting);
                      console.log('🛒 CheckoutSection: orderLoading:', orderLoading);
                      console.log('🛒 CheckoutSection: disabled:', isSubmitting || orderLoading);
                    }}
                  >
                    {isSubmitting || orderLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2 sm:mr-3" />
                        Przetwarzanie...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                        Zapłać teraz
                      </>
                    )}
                  </Button>
                )}
              </div>

              {orderError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">
                    Błąd: {orderError}
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2 xl:col-span-1">
            <Card className="sticky top-0 md:top-4 bg-gradient-to-br from-neutral-900 to-neutral-800 backdrop-blur border-neutral-700 shadow-2xl hover:shadow-xl transition-all duration-300 max-h-[calc(100vh-100px)] md:max-h-none overflow-y-auto md:overflow-visible">
              <CardHeader className="border-b border-neutral-700 px-4 md:px-8 py-4 md:py-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg md:text-xl text-white">Podsumowanie zamówienia</CardTitle>
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-8">
                <div className="space-y-8">
                  {/* Items */}
                  <div className="space-y-6">
                    {items.map((item, index) => (
                      <div key={item.id} className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                        {/* Header z nazwą produktu */}
                        <div className="flex items-start justify-between mb-3 md:mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                              {item.productType === 'mat' ? 'Dywaniki samochodowe' : item.productName}
                            </h3>
                            
                            {/* Szczegóły samochodu */}
                            {item.configuration?.carDetails && (
                              <div className="text-sm text-neutral-300">
                                <p className="font-medium">
                                  {item.configuration.carDetails.brand} {item.configuration.carDetails.model}
                                  {item.configuration.carDetails.generation && ` ${item.configuration.carDetails.generation}`}
                                  {item.configuration.carDetails.year && ` (${item.configuration.carDetails.year})`}
                                </p>
                                {item.configuration.carDetails.bodyType && (
                                  <p className="text-xs text-neutral-400 capitalize mt-1">
                                    {item.configuration.carDetails.bodyType}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Obraz produktu */}
                          <div className="ml-3 md:ml-4 flex-shrink-0">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-neutral-700 rounded-lg flex items-center justify-center overflow-hidden">
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
                        {item.configuration && item.productType === 'mat' && (
                          <div className="mb-4">
                            <div className="grid grid-cols-1 gap-3">
                              {/* Wariant zestawu */}
                              {item.configuration.setVariant && (
                                <div className="flex items-center justify-between py-2 px-3 bg-neutral-800 rounded-lg">
                                  <span className="text-sm text-neutral-300">Zestaw:</span>
                                  <span className="text-sm font-medium text-white">
                                    {item.configuration.setVariant === 'front' ? 'Starter (przód)' :
                                     item.configuration.setVariant === 'basic' ? 'Podstawowy (przód + tył)' :
                                     item.configuration.setVariant === 'premium' ? 'Premium (przód + tył + bagażnik)' :
                                     item.configuration.setVariant === 'complete' ? 'Mata do bagażnika' :
                                     item.configuration.setVariant}
                                  </span>
                                </div>
                              )}

                              {/* Typ dywaników */}
                              {item.configuration.setType && (
                                <div className="flex items-center justify-between py-2 px-3 bg-neutral-800 rounded-lg">
                                  <span className="text-sm text-neutral-300">Typ:</span>
                                  <span className="text-sm font-medium text-white">
                                    {item.configuration.setType === '3d-with-rims' ? '3D z rantami' :
                                     item.configuration.setType === 'classic' ? '3D bez rantów' :
                                     item.configuration.setType}
                                  </span>
                                </div>
                              )}

                              {/* Struktura komórek */}
                              {item.configuration.cellType && (
                                <div className="flex items-center justify-between py-2 px-3 bg-neutral-800 rounded-lg">
                                  <span className="text-sm text-neutral-300">Struktura:</span>
                                  <span className="text-sm font-medium text-white">
                                    {item.configuration.cellType === 'diamonds' ? 'Romby' :
                                     item.configuration.cellType === 'honey' ? 'Plaster miodu' :
                                     item.configuration.cellType}
                                  </span>
                                </div>
                              )}

                              {/* Kolory */}
                              {(item.configuration.materialColor || item.configuration.edgeColor) && (
                                <div className="flex items-center justify-between py-2 px-3 bg-neutral-800 rounded-lg">
                                  <span className="text-sm text-neutral-300">Kolor:</span>
                                  <span className="text-sm font-medium text-white">
                                    {item.configuration.materialColor} + {item.configuration.edgeColor} obszycie
                                  </span>
                                </div>
                              )}

                              {/* Ochraniacze pięt */}
                              {item.configuration.heelPad === 'yes' && (
                                <div className="flex items-center justify-between py-2 px-3 bg-orange-900/20 border border-orange-700/30 rounded-lg">
                                  <span className="text-sm text-orange-300">Dodatki:</span>
                                  <span className="text-sm font-medium text-orange-200">
                                    Ochraniacze pod piętę
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Footer z ilością i ceną */}
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-700">
                          <div className="flex items-center space-x-3">
                            <span className="text-neutral-300 text-sm">Ilość:</span>
                            <span className="w-8 text-center font-semibold text-white text-lg bg-neutral-800 rounded px-2 py-1">
                              {item.quantity}
                            </span>
                          </div>

                          <div className="text-right">
                            <p className="text-xl font-bold text-white">
                              {PricingService.formatPrice(item.subtotal)}
                            </p>
                            <p className="text-sm text-neutral-400">
                              {PricingService.formatPrice(item.unitPrice)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-neutral-700 my-6" />

                  {/* Discount Code */}
                  <div className="space-y-4">
                    <Label className="text-white text-base font-medium">Kod rabatowy</Label>
                    <div className="flex space-x-3">
                      <Input 
                        placeholder="Wprowadź kod"
                        className="min-h-[48px] h-12 bg-gray-600/40 border-gray-500 text-white placeholder:text-gray-300 focus:border-red-500 focus:ring-red-500/30 rounded-lg text-base"
                      />
                      <Button 
                        type="button"
                        className="h-12 bg-red-600 border-red-500 text-white hover:bg-red-700 rounded-lg px-6 text-base"
                      >
                        Zastosuj
                      </Button>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="space-y-5 pt-6">
                    <div className="pt-6 border-t border-neutral-700 bg-neutral-800/40 p-6 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold text-2xl">Razem do zapłaty</span>
                        <span className="text-white font-bold text-3xl">
                          {total.toFixed(2).replace('.', ',')} <span className="text-xl font-normal">PLN</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
