"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { useOrder } from '@/hooks/useOrder.new';
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
  const { createOrder, isLoading: orderLoading, error: orderError } = useOrder();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  // Redirect jeśli koszyk pusty
  useEffect(() => {
    if (itemCount === 0 && !orderSuccess) {
      debugLog('CheckoutSection: Empty cart, redirecting to home');
      router.push('/');
    }
  }, [itemCount, orderSuccess, router]);

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      console.error('Cannot submit empty cart');
      return;
    }

    setIsSubmitting(true);
    debugLog('CheckoutSection: Submitting order', data);

    try {
      // Przygotuj dane zamówienia w nowym formacie
      const orderData: CreateOrderDTO = {
        customer: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
        },
        shippingAddress: {
          street: data.street,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country,
        },
        billingAddress: sameAsShipping ? undefined : {
          street: data.billingStreet!,
          city: data.billingCity!,
          postalCode: data.billingPostalCode!,
          country: data.billingCountry!,
        },
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        items: items.map(item => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          productType: item.productType,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          productImage: item.productImage,
          configuration: item.configuration,
        }))
      };

      // Utwórz zamówienie
      const order = await createOrder(orderData);
      
      debugLog('CheckoutSection: Order created successfully', order);
      
      // Wyczyść koszyk
      clearCart();
      
      // Pokaż sukces
      setOrderNumber(order.orderNumber);
      setOrderSuccess(true);
      
    } catch (error) {
      console.error('CheckoutSection: Error creating order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Strona sukcesu
  if (orderSuccess && orderNumber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Zamówienie zostało złożone!
              </h1>
              
              <p className="text-lg text-gray-600 mb-6">
                Dziękujemy za zakup. Twoje zamówienie zostało przyjęte do realizacji.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Numer zamówienia:</p>
                <p className="text-xl font-bold text-gray-900">{orderNumber}</p>
              </div>
              
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/">
                    Powrót do strony głównej
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finalizacja zamówienia
          </h1>
          <p className="text-gray-600">
            Uzupełnij dane, aby dokończyć zakup
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-500'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Dane kontaktowe */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Dane kontaktowe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Imię *</Label>
                        <Input
                          id="firstName"
                          {...register("firstName")}
                          className={errors.firstName ? "border-red-500" : ""}
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="lastName">Nazwisko *</Label>
                        <Input
                          id="lastName"
                          {...register("lastName")}
                          className={errors.lastName ? "border-red-500" : ""}
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefon *</Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Adres */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Adres wysyłkowy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="street">Ulica i numer *</Label>
                      <Input
                        id="street"
                        {...register("street")}
                        className={errors.street ? "border-red-500" : ""}
                      />
                      {errors.street && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.street.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="postalCode">Kod pocztowy *</Label>
                        <Input
                          id="postalCode"
                          {...register("postalCode")}
                          className={errors.postalCode ? "border-red-500" : ""}
                        />
                        {errors.postalCode && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.postalCode.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor="city">Miasto *</Label>
                        <Input
                          id="city"
                          {...register("city")}
                          className={errors.city ? "border-red-500" : ""}
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="country">Kraj *</Label>
                      <Input
                        id="country"
                        {...register("country")}
                        className={errors.country ? "border-red-500" : ""}
                      />
                      {errors.country && (
                        <p className="text-red-500 text-sm mt-1">
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Metoda płatności
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => setValue("paymentMethod", value as any)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Karta płatnicza
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="transfer" id="transfer" />
                        <Label htmlFor="transfer" className="flex items-center">
                          <Truck className="w-4 h-4 mr-2" />
                          Przelew bankowy
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="blik" id="blik" />
                        <Label htmlFor="blik" className="flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          BLIK
                        </Label>
                      </div>
                    </RadioGroup>

                    {errors.paymentMethod && (
                      <p className="text-red-500 text-sm">
                        {errors.paymentMethod.message}
                      </p>
                    )}

                    <div>
                      <Label htmlFor="notes">Notatki (opcjonalnie)</Label>
                      <textarea
                        id="notes"
                        {...register("notes")}
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                        rows={3}
                        placeholder="Dodatkowe informacje do zamówienia..."
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="termsAccepted"
                          {...register("termsAccepted")}
                        />
                        <Label htmlFor="termsAccepted" className="text-sm">
                          Akceptuję <Link href="/regulamin" className="text-blue-600 hover:underline">regulamin</Link> *
                        </Label>
                      </div>
                      {errors.termsAccepted && (
                        <p className="text-red-500 text-sm">
                          {errors.termsAccepted.message}
                        </p>
                      )}

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="marketingAccepted"
                          {...register("marketingAccepted")}
                        />
                        <Label htmlFor="marketingAccepted" className="text-sm">
                          Chcę otrzymywać informacje o nowościach i promocjach
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Wstecz
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isValid}
                  >
                    Dalej
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || orderLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting || orderLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Podsumowanie zamówienia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-gray-500">Ilość: {item.quantity}</p>
                        </div>
                        <p className="font-medium">
                          {PricingService.formatPrice(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Suma częściowa:</span>
                      <span>{PricingService.formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dostawa:</span>
                      <span>Gratis</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Razem:</span>
                      <span>{PricingService.formatPrice(total)}</span>
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
