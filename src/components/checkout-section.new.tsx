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
        // Dane kontaktowe - tylko email jest wymagany w nowym układzie
        const step1Valid = watchedValues.email;
        console.log('🛒 CheckoutSection: Step 1 validation:', step1Valid);
        return step1Valid;
      case 2:
        // Adres - sprawdź czy są wypełnione podstawowe pola
        const step2Valid = watchedValues.firstName && 
               watchedValues.lastName;
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
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="text-center bg-gray-800 border-gray-700">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-gray-900" />
              </div>
              
              <h1 className="text-2xl font-semibold text-white mb-4">
                Zamówienie zostało złożone!
              </h1>
              
              <p className="text-gray-400 mb-6">
                Dziękujemy za zakup. Twoje zamówienie zostało przyjęte do realizacji.
              </p>
              
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400 mb-1">Numer zamówienia:</p>
                <p className="text-xl font-bold text-white">{orderNumber}</p>
              </div>
              
              <div className="space-y-3">
                <Button asChild className="w-full bg-white text-gray-900 hover:bg-gray-100 rounded-lg font-medium">
                  <Link href="/">
                    Powrót do strony głównej
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg">
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
    <div className="min-h-screen bg-gray-900 py-8">
      {/* Subtelny wzór heksagonalny w tle */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header - bardziej minimalistyczny */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-semibold text-white mb-2">
            Finalizacja zamówienia
          </h1>
        </div>

        {/* Progress Steps - uproszczone */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= step 
                  ? 'bg-white text-gray-900' 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-px mx-3 ${
                  currentStep > step ? 'bg-white' : 'bg-gray-700'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            )} className="space-y-6">
              {/* Step 1: Dane kontaktowe */}
              {currentStep === 1 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">
                      Kontakt
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="email" className="text-white text-sm font-medium">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-white focus:ring-0 rounded-lg mt-1"
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="marketingAccepted"
                        {...register("marketingAccepted")}
                        className="border-gray-600 data-[state=checked]:bg-white data-[state=checked]:border-white"
                      />
                      <Label htmlFor="marketingAccepted" className="text-gray-300 text-sm">
                        Chcę otrzymywać informacje o statusie zamówienia oraz wyjątkowe oferty i rabaty
                      </Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-white text-sm font-medium">Imię</Label>
                        <Input
                          id="firstName"
                          {...register("firstName")}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-white focus:ring-0 rounded-lg mt-1"
                        />
                        {errors.firstName && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="lastName" className="text-white text-sm font-medium">Nazwisko</Label>
                        <Input
                          id="lastName"
                          {...register("lastName")}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-white focus:ring-0 rounded-lg mt-1"
                        />
                        {errors.lastName && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Adres */}
              {currentStep === 2 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">
                      Dostawa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="country" className="text-white text-sm font-medium">Kraj/region</Label>
                      <Input
                        id="country"
                        {...register("country")}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-white focus:ring-0 rounded-lg mt-1"
                        value="Polska"
                        readOnly
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-white text-sm font-medium">Imię</Label>
                        <Input
                          id="firstName"
                          {...register("firstName")}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-white focus:ring-0 rounded-lg mt-1"
                        />
                        {errors.firstName && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="lastName" className="text-white text-sm font-medium">Nazwisko</Label>
                        <Input
                          id="lastName"
                          {...register("lastName")}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-white focus:ring-0 rounded-lg mt-1"
                        />
                        {errors.lastName && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="companyName" className="text-white text-sm font-medium">Firma (opcjonalnie)</Label>
                      <Input
                        id="companyName"
                        {...register("companyName")}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-white focus:ring-0 rounded-lg mt-1"
                        placeholder="Nazwa firmy"
                      />
                    </div>

                    <div>
                      <Label htmlFor="street" className="text-white text-sm font-medium">Adres</Label>
                      <Input
                        id="street"
                        {...register("street")}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-white focus:ring-0 rounded-lg mt-1"
                      />
                      {errors.street && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.street.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="nip" className="text-white text-sm font-medium">NIP</Label>
                      <Input
                        id="nip"
                        {...register("nip")}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-white focus:ring-0 rounded-lg mt-1"
                        placeholder="Numer NIP (opcjonalnie)"
                      />
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
                <Card className="bg-black/40 backdrop-blur border-gray-800 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
                  <CardHeader className="border-l-4 border-red-500">
                    <CardTitle className="flex items-center text-white">
                      <CreditCard className="w-5 h-5 mr-2 text-red-400" />
                      Metoda płatności
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => setValue("paymentMethod", value as any)}
                      className="space-y-4"
                    >
                      <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                        paymentMethod === "card" 
                          ? 'border-red-500 bg-red-900/20' 
                          : 'bg-gray-900/30 border-gray-700 hover:border-red-500/50'
                      }`}
                      onClick={() => setValue("paymentMethod", "card")}>
                        <RadioGroupItem value="card" id="card" className={paymentMethod === "card" ? 'border-red-500' : ''} />
                        <Label htmlFor="card" className="flex items-center space-x-3 flex-1 cursor-pointer">
                          <CreditCard className={`w-5 h-5 ${paymentMethod === "card" ? 'text-red-400' : 'text-gray-400'}`} />
                          <div>
                            <div className={`font-medium ${paymentMethod === "card" ? 'text-white' : 'text-gray-300'}`}>
                              Karta płatnicza
                            </div>
                            <div className={`text-sm ${paymentMethod === "card" ? 'text-gray-400' : 'text-gray-500'}`}>
                              Visa, Mastercard, American Express
                            </div>
                          </div>
                          {paymentMethod === "card" && (
                            <Check className="w-4 h-4 text-red-400 ml-auto" />
                          )}
                        </Label>
                      </div>
                      
                      <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                        paymentMethod === "transfer" 
                          ? 'border-red-500 bg-red-900/20' 
                          : 'bg-gray-900/30 border-gray-700 hover:border-red-500/50'
                      }`}
                      onClick={() => setValue("paymentMethod", "transfer")}>
                        <RadioGroupItem value="transfer" id="transfer" className={paymentMethod === "transfer" ? 'border-red-500' : ''} />
                        <Label htmlFor="transfer" className="flex items-center space-x-3 flex-1 cursor-pointer">
                          <Truck className={`w-5 h-5 ${paymentMethod === "transfer" ? 'text-red-400' : 'text-gray-400'}`} />
                          <div>
                            <div className={`font-medium ${paymentMethod === "transfer" ? 'text-white' : 'text-gray-300'}`}>
                              Przelew bankowy
                            </div>
                            <div className={`text-sm ${paymentMethod === "transfer" ? 'text-gray-400' : 'text-gray-500'}`}>
                              Przelew online lub tradycyjny
                            </div>
                          </div>
                          {paymentMethod === "transfer" && (
                            <Check className="w-4 h-4 text-red-400 ml-auto" />
                          )}
                        </Label>
                      </div>
                      
                      <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                        paymentMethod === "blik" 
                          ? 'border-red-500 bg-red-900/20' 
                          : 'bg-gray-900/30 border-gray-700 hover:border-red-500/50'
                      }`}
                      onClick={() => setValue("paymentMethod", "blik")}>
                        <RadioGroupItem value="blik" id="blik" className={paymentMethod === "blik" ? 'border-red-500' : ''} />
                        <Label htmlFor="blik" className="flex items-center space-x-3 flex-1 cursor-pointer">
                          <Shield className={`w-5 h-5 ${paymentMethod === "blik" ? 'text-red-400' : 'text-gray-400'}`} />
                          <div>
                            <div className={`font-medium ${paymentMethod === "blik" ? 'text-white' : 'text-gray-300'}`}>
                              BLIK
                            </div>
                            <div className={`text-sm ${paymentMethod === "blik" ? 'text-gray-400' : 'text-gray-500'}`}>
                              Płatność przez aplikację bankową
                            </div>
                          </div>
                          {paymentMethod === "blik" && (
                            <Check className="w-4 h-4 text-red-400 ml-auto" />
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

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Controller
                          name="termsAccepted"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id="termsAccepted"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-gray-700 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                            />
                          )}
                        />
                        <Label htmlFor="termsAccepted" className="text-sm text-gray-300">
                          Akceptuję <Link href="/regulamin" className="text-red-400 hover:text-red-300 hover:underline">regulamin</Link> *
                        </Label>
                      </div>
                      {errors.termsAccepted && (
                        <p className="text-red-400 text-sm">
                          {errors.termsAccepted.message}
                        </p>
                      )}

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="marketingAccepted"
                          {...register("marketingAccepted")}
                          className="border-gray-700 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <Label htmlFor="marketingAccepted" className="text-sm text-gray-400">
                          Chcę otrzymywać informacje o nowościach i promocjach
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Wstecz
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isCurrentStepValid()}
                    className="bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium"
                  >
                    Dalej
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || orderLoading}
                    className="bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium"
                    onClick={() => {
                      console.log('🛒 CheckoutSection: Submit button clicked');
                      console.log('🛒 CheckoutSection: isSubmitting:', isSubmitting);
                      console.log('🛒 CheckoutSection: orderLoading:', orderLoading);
                      console.log('🛒 CheckoutSection: disabled:', isSubmitting || orderLoading);
                    }}
                  >
                    {isSubmitting || orderLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />
                        Przetwarzanie...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
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
            <Card className="sticky top-4 bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Items */}
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={item.id} className="flex space-x-3">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center">
                            {item.productImage ? (
                              <img 
                                src={item.productImage} 
                                alt={item.productName}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
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
                                <p className="text-gray-400 text-xs">
                                  {item.configuration.carDetails.bodyType}
                                </p>
                              )}
                              {item.configuration.materialColor && (
                                <p className="text-gray-400 text-xs">
                                  Kolor: {item.configuration.materialColor}
                                </p>
                              )}
                              {item.configuration.borderColor && (
                                <p className="text-gray-400 text-xs">
                                  Obszycie: {item.configuration.borderColor}
                                </p>
                              )}
                            </div>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-gray-400 text-xs">Ilość: {item.quantity}</span>
                            <span className="text-white font-semibold text-sm">
                              {PricingService.formatPrice(item.subtotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-gray-700" />

                  {/* Discount Code */}
                  <div className="space-y-2">
                    <Label className="text-white text-sm font-medium">Kod rabatowy</Label>
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Wprowadź kod"
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-white focus:ring-0 rounded-lg"
                      />
                      <Button 
                        type="button"
                        className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 rounded-lg px-4"
                      >
                        Zastosuj
                      </Button>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Suma częściowa - pozycje: {items.length}</span>
                      <span className="text-white font-medium">{PricingService.formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Wysyłka</span>
                      <span className="text-white font-medium">27,00 zł</span>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold text-lg">Razem do zapłaty</span>
                        <span className="text-white font-bold text-xl">
                          PLN {PricingService.formatPrice(total + 27)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
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
