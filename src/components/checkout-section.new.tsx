"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  Shield,
  RotateCcw,
  Star,
  Truck,
  CreditCard,
  Check,
  CreditCard as PaymentIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from '@/hooks/useCart.new';
import { useOrder } from '@/hooks/useOrder';
import { CreateOrderDTO } from '@/lib/types/order-new';
import { PricingService } from '@/lib/services/PricingService';
import { debugLog } from '@/lib/config/features';

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
  
  // Metoda płatności
  paymentMethod: z.enum(["card", "transfer", "blik"], {
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
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

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
      paymentMethod: "card",
      termsAccepted: false,
      marketingAccepted: false,
    }
  });

  const sameAsShipping = watch("sameAsShipping");
  const paymentMethod = watch("paymentMethod");

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
        methodName: data.paymentMethod === 'card' ? 'Karta kredytowa' : 
                   data.paymentMethod === 'transfer' ? 'Przelew bankowy' : 
                   data.paymentMethod === 'blik' ? 'BLIK' : 'Pobranie',
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
      // Utwórz zamówienie
      const order = await createOrder(cartProducts, customerData, shippingData, paymentData);
      console.log('🛒 CheckoutSection: createOrder completed, order:', order);
      
      debugLog('CheckoutSection: Order created successfully', order);
      
      // Wyczyść koszyk
      clearCart();
      
      // Pokaż sukces
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
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 py-12 relative overflow-hidden">
        {/* Animowane tło z gradientem */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-slate-900 to-red-800/5"></div>
        
        {/* Animowane cząsteczki */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
        </div>

        <div className="max-w-2xl mx-auto px-4 relative z-10">
          <Card className="text-center bg-slate-800/40 backdrop-blur border-slate-700 shadow-2xl">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500/30">
                <Check className="w-8 h-8 text-red-500" />
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                Zamówienie zostało złożone!
              </h1>
              
              <p className="text-slate-400 mb-6">
                Dziękujemy za zakup. Twoje zamówienie zostało przyjęte do realizacji.
              </p>
              
              <div className="bg-slate-900/50 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-400 mb-1">Numer zamówienia:</p>
                <p className="text-xl font-bold text-red-400">{orderNumber}</p>
              </div>
              
              <div className="space-y-3">
                <Button asChild className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105">
                  <Link href="/">
                    Powrót do strony głównej
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 py-12 relative overflow-hidden">
      {/* Animowane tło z gradientem */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-slate-900 to-red-800/5"></div>
      
      {/* Animowane cząsteczki */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Header z większym spacing */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
            Finalizacja zamówienia
          </h1>
          <p className="text-slate-300 text-lg">
            Uzupełnij dane, aby dokończyć zakup
          </p>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mt-6"></div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 hover:scale-105 ${
                currentStep >= step 
                  ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/30' 
                  : 'border-slate-600 text-slate-400 bg-slate-800/50 hover:border-red-500/50'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                  currentStep > step ? 'bg-red-600' : 'bg-slate-700'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
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
                <Card className="bg-slate-800/40 backdrop-blur border-slate-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
                  <CardHeader className="border-l-4 border-red-500 px-8 py-6">
                    <CardTitle className="flex items-center text-white text-xl">
                      <Shield className="w-6 h-6 mr-3 text-red-400" />
                      Dane kontaktowe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 px-8 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-slate-200 font-medium text-base">Imię *</Label>
                        <Input
                          id="firstName"
                          {...register("firstName")}
                          className={`h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-red-500 focus:ring-red-500/20 text-base ${
                            errors.firstName ? "border-red-500 bg-red-900/10" : ""
                          }`}
                        />
                        {errors.firstName && (
                          <p className="text-red-400 text-sm mt-2">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-slate-200 font-medium text-base">Nazwisko *</Label>
                        <Input
                          id="lastName"
                          {...register("lastName")}
                          className={`h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-red-500 focus:ring-red-500/20 text-base ${
                            errors.lastName ? "border-red-500 bg-red-900/10" : ""
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
                      <Label htmlFor="email" className="text-slate-200 font-medium text-base">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className={`h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-red-500 focus:ring-red-500/20 text-base ${
                          errors.email ? "border-red-500 bg-red-900/10" : ""
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-2">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-200 font-medium text-base">Telefon *</Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        className={`h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-red-500 focus:ring-red-500/20 text-base ${
                          errors.phone ? "border-red-500 bg-red-900/10" : ""
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
                <Card className="bg-slate-800/40 backdrop-blur border-slate-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
                  <CardHeader className="border-l-4 border-red-500 px-8 py-6">
                    <CardTitle className="flex items-center text-white text-xl">
                      <Truck className="w-6 h-6 mr-3 text-red-400" />
                      Adres wysyłkowy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 px-8 pb-8">
                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-slate-200 font-medium text-base">Ulica i numer *</Label>
                      <Input
                        id="street"
                        {...register("street")}
                        className={`h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-red-500 focus:ring-red-500/20 text-base ${
                          errors.street ? "border-red-500 bg-red-900/10" : ""
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
                        <Label htmlFor="postalCode" className="text-slate-200 font-medium text-base">Kod pocztowy *</Label>
                        <Input
                          id="postalCode"
                          {...register("postalCode")}
                          className={`h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-red-500 focus:ring-red-500/20 text-base ${
                            errors.postalCode ? "border-red-500 bg-red-900/10" : ""
                          }`}
                        />
                        {errors.postalCode && (
                          <p className="text-red-400 text-sm mt-2">
                            {errors.postalCode.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="city" className="text-slate-200 font-medium text-base">Miasto *</Label>
                        <Input
                          id="city"
                          {...register("city")}
                          className={`h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-red-500 focus:ring-red-500/20 text-base ${
                            errors.city ? "border-red-500 bg-red-900/10" : ""
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
                      <Label htmlFor="country" className="text-slate-200 font-medium text-base">Kraj *</Label>
                      <Input
                        id="country"
                        {...register("country")}
                        className={`h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-red-500 focus:ring-red-500/20 text-base ${
                          errors.country ? "border-red-500 bg-red-900/10" : ""
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
                        <Label htmlFor="sameAsShipping">
                          Adres do faktury taki sam jak adres wysyłkowy
                        </Label>
                      </div>

                      {!sameAsShipping && (
                        <div className="space-y-4">
                          <h4 className="font-medium">Adres do faktury</h4>
                          <div>
                            <Label htmlFor="billingStreet">Ulica i numer *</Label>
                            <Input
                              id="billingStreet"
                              {...register("billingStreet")}
                              className={errors.billingStreet ? "border-red-500" : ""}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="billingPostalCode">Kod pocztowy *</Label>
                              <Input
                                id="billingPostalCode"
                                {...register("billingPostalCode")}
                                className={errors.billingPostalCode ? "border-red-500" : ""}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label htmlFor="billingCity">Miasto *</Label>
                              <Input
                                id="billingCity"
                                {...register("billingCity")}
                                className={errors.billingCity ? "border-red-500" : ""}
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
                <Card className="bg-slate-800/40 backdrop-blur border-slate-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
                  <CardHeader className="border-l-4 border-red-500 px-8 py-6">
                    <CardTitle className="flex items-center text-white text-xl">
                      <CreditCard className="w-6 h-6 mr-3 text-red-400" />
                      Metoda płatności
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8 px-8 pb-8">
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => setValue("paymentMethod", value as any)}
                      className="space-y-4"
                    >
                      <div className={`flex items-center space-x-4 p-6 rounded-lg border transition-all duration-300 cursor-pointer ${
                        paymentMethod === "card" 
                          ? 'border-red-500 bg-red-900/20' 
                          : 'bg-slate-900/30 border-slate-600 hover:border-red-500/50'
                      }`}
                      onClick={() => setValue("paymentMethod", "card")}>
                        <RadioGroupItem value="card" id="card" className={paymentMethod === "card" ? 'border-red-500' : ''} />
                        <Label htmlFor="card" className="flex items-center space-x-4 flex-1 cursor-pointer">
                          <CreditCard className={`w-6 h-6 ${paymentMethod === "card" ? 'text-red-400' : 'text-slate-400'}`} />
                          <div>
                            <div className={`font-medium text-base ${paymentMethod === "card" ? 'text-white' : 'text-slate-200'}`}>
                              Karta płatnicza
                            </div>
                            <div className={`text-sm ${paymentMethod === "card" ? 'text-slate-400' : 'text-slate-500'}`}>
                              Visa, Mastercard, American Express
                            </div>
                          </div>
                          {paymentMethod === "card" && (
                            <Check className="w-5 h-5 text-red-400 ml-auto" />
                          )}
                        </Label>
                      </div>
                      
                      <div className={`flex items-center space-x-4 p-6 rounded-lg border transition-all duration-300 cursor-pointer ${
                        paymentMethod === "transfer" 
                          ? 'border-red-500 bg-red-900/20' 
                          : 'bg-slate-900/30 border-slate-600 hover:border-red-500/50'
                      }`}
                      onClick={() => setValue("paymentMethod", "transfer")}>
                        <RadioGroupItem value="transfer" id="transfer" className={paymentMethod === "transfer" ? 'border-red-500' : ''} />
                        <Label htmlFor="transfer" className="flex items-center space-x-4 flex-1 cursor-pointer">
                          <Truck className={`w-6 h-6 ${paymentMethod === "transfer" ? 'text-red-400' : 'text-slate-400'}`} />
                          <div>
                            <div className={`font-medium text-base ${paymentMethod === "transfer" ? 'text-white' : 'text-slate-200'}`}>
                              Przelew bankowy
                            </div>
                            <div className={`text-sm ${paymentMethod === "transfer" ? 'text-slate-400' : 'text-slate-500'}`}>
                              Przelew online lub tradycyjny
                            </div>
                          </div>
                          {paymentMethod === "transfer" && (
                            <Check className="w-5 h-5 text-red-400 ml-auto" />
                          )}
                        </Label>
                      </div>
                      
                      <div className={`flex items-center space-x-4 p-6 rounded-lg border transition-all duration-300 cursor-pointer ${
                        paymentMethod === "blik" 
                          ? 'border-red-500 bg-red-900/20' 
                          : 'bg-slate-900/30 border-slate-600 hover:border-red-500/50'
                      }`}
                      onClick={() => setValue("paymentMethod", "blik")}>
                        <RadioGroupItem value="blik" id="blik" className={paymentMethod === "blik" ? 'border-red-500' : ''} />
                        <Label htmlFor="blik" className="flex items-center space-x-4 flex-1 cursor-pointer">
                          <Shield className={`w-6 h-6 ${paymentMethod === "blik" ? 'text-red-400' : 'text-slate-400'}`} />
                          <div>
                            <div className={`font-medium text-base ${paymentMethod === "blik" ? 'text-white' : 'text-slate-200'}`}>
                              BLIK
                            </div>
                            <div className={`text-sm ${paymentMethod === "blik" ? 'text-slate-400' : 'text-slate-500'}`}>
                              Płatność przez aplikację bankową
                            </div>
                          </div>
                          {paymentMethod === "blik" && (
                            <Check className="w-5 h-5 text-red-400 ml-auto" />
                          )}
                        </Label>
                      </div>
                    </RadioGroup>

                    {errors.paymentMethod && (
                      <p className="text-red-400 text-sm">
                        {errors.paymentMethod.message}
                      </p>
                    )}

                    <div>
                      <Label htmlFor="notes" className="text-gray-300 font-medium">Notatki (opcjonalnie)</Label>
                      <textarea
                        id="notes"
                        {...register("notes")}
                        className="w-full p-3 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20 rounded-lg resize-none"
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
                              className="border-slate-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                            />
                          )}
                        />
                        <Label htmlFor="termsAccepted" className="text-sm text-slate-300 leading-relaxed">
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
                          className="border-slate-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <Label htmlFor="marketingAccepted" className="text-sm text-slate-300 leading-relaxed">
                          Chcę otrzymywać informacje o nowościach i promocjach
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 px-8 py-4 text-base"
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
                    disabled={isSubmitting || orderLoading}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-10 py-4 text-base"
                    onClick={() => {
                      console.log('🛒 CheckoutSection: Submit button clicked');
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
                        Złóż zamówienie
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
          <div className="lg:col-span-1">
            <Card className="sticky top-4 bg-slate-800/40 backdrop-blur border-slate-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
              <CardHeader className="border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white">Podsumowanie zamówienia</CardTitle>
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Items */}
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={item.id} className="flex space-x-3">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-slate-700 rounded-lg border border-slate-600 flex items-center justify-center">
                            {item.productImage ? (
                              <img 
                                src={item.productImage} 
                                alt={item.productName}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {index + 1}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium leading-tight">
                            {item.productName}
                          </p>
                          {item.configuration && (
                            <div className="mt-1 space-y-1">
                              {item.configuration.carDetails?.bodyType && (
                                <p className="text-slate-400 text-xs">
                                  {item.configuration.carDetails.bodyType}
                                </p>
                              )}
                              {item.configuration.materialColor && (
                                <p className="text-slate-400 text-xs">
                                  Kolor: {item.configuration.materialColor}
                                </p>
                              )}
                              {item.configuration.borderColor && (
                                <p className="text-slate-400 text-xs">
                                  Obszycie: {item.configuration.borderColor}
                                </p>
                              )}
                            </div>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-slate-400 text-xs">Ilość: {item.quantity}</span>
                            <span className="text-white font-semibold text-sm">
                              {PricingService.formatPrice(item.subtotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-slate-700" />

                  {/* Discount Code */}
                  <div className="space-y-2">
                    <Label className="text-white text-sm font-medium">Kod rabatowy</Label>
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Wprowadź kod"
                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-red-500 focus:ring-red-500/20 rounded-lg"
                      />
                      <Button 
                        type="button"
                        className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 rounded-lg px-4"
                      >
                        Zastosuj
                      </Button>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Suma częściowa - pozycje: {items.length}</span>
                      <span className="text-white font-medium">{PricingService.formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Wysyłka</span>
                      <span className="text-white font-medium">27,00 zł</span>
                    </div>
                    
                    <div className="pt-2 border-t border-slate-700">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold text-lg">Razem do zapłaty</span>
                        <span className="text-white font-bold text-xl">
                          PLN {PricingService.formatPrice(total + 27)}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mt-1">
                        W tym podatki: {((total + 27) * 0.23).toFixed(2)} zł
                      </p>
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
