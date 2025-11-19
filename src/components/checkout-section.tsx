"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HybridSessionManager } from "@/lib/utils/hybrid-session-manager"
import { useCart } from '@/hooks/useCart.new';
import { useOrder } from '@/hooks/useOrder';
import { CustomerData, ShippingData, PaymentData } from '@/lib/types/order';
import { Product } from '@/lib/types/product';
import { CartItem } from '@/lib/types/cart-new';

// Schema walidacji
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
  companyName: z.string().optional(),
  nip: z.string().optional(),
  
  // Metoda dostawy i płatności
  shippingMethod: z.string().min(1, "Wybierz metodę dostawy"),
  paymentMethod: z.string().min(1, "Wybierz metodę płatności"),
  
  // Checkboxy
  termsAccepted: z.boolean().refine(val => val === true, "Musisz zaakceptować regulamin"),
  newsletter: z.boolean(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

// Dane produktu (placeholder)
const productData = {
  name: "Dywaniki EVA do BMW 3 E90 2007 – komplet z bagażnikiem",
  image: "/images/products/bmw.png",
  price: 299.99,
  quantity: 1,
}

// Metody dostawy
const shippingMethods = [
  {
    id: "dpd",
    name: "Kurier DPD",
    price: 14.99,
    description: "Dostawa w ciągu 1-2 dni roboczych",
    icon: Truck,
  },
  {
    id: "inpost",
    name: "Paczkomat InPost",
    price: 12.99,
    description: "Dostawa w ciągu 2-3 dni roboczych",
    icon: Truck,
  },
  {
    id: "pickup",
    name: "Odbiór osobisty",
    price: 0,
    description: "Odbiór w naszym salonie",
    icon: Truck,
  },
]

// Metody płatności - wszystkie przez Przelewy24
const paymentMethods = [
  {
    id: "p24",
    name: "Przelew Bankowy",
    description: "Karty, BLIK, przelewy, Apple Pay, Google Pay",
    icon: CreditCard,
  },
]

// Kroki checkout
const checkoutSteps = [
  { id: 1, title: "Dane kontaktowe", completed: false, description: "Podstawowe informacje" },
  { id: 2, title: "Adres dostawy", completed: false, description: "Gdzie dostarczyć" },
  { id: 3, title: "Dostawa & Płatność", completed: false, description: "Jak i czym płacić" },
  { id: 4, title: "Potwierdzenie", completed: false, description: "Sprawdź i zamów" },
]

export function CheckoutSection() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(false)
  const [discountCode, setDiscountCode] = useState("")
  const [discountApplied, setDiscountApplied] = useState(false)
  const [isMobileSummaryVisible, setIsMobileSummaryVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [configuratorDictionary, setConfiguratorDictionary] = useState<any>(null)
  
  // Nowe hooki
  const { items: cartItems, clearCart } = useCart();
  const { createOrder, saveOrder, isLoading: orderLoading, error: orderError } = useOrder();

  // Odczytywanie danych ze słownika konfiguratora używając HybridSessionManager
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const sessionIdParam = urlParams.get('sessionId')
      
      if (sessionIdParam && HybridSessionManager.isValidSession(sessionIdParam)) {
        // Pobierz dane z HybridSessionManager
        const savedDictionary = HybridSessionManager.getOrderData(sessionIdParam)
        if (savedDictionary) {
          setConfiguratorDictionary(savedDictionary)
          console.log('📋 Odczytywanie danych ze słownika konfiguratora:', savedDictionary)
          console.log('🆔 Session ID:', sessionIdParam)
        }
      } else {
        // Fallback - odczytaj z URL (stara metoda)
        const orderDataParam = urlParams.get('orderData')
        if (orderDataParam) {
          try {
            const decodedData = JSON.parse(decodeURIComponent(orderDataParam))
            setConfiguratorDictionary(decodedData)
            console.log('📋 Odczytywanie danych ze słownika konfiguratora (fallback):', decodedData)
          } catch (error) {
            console.error('❌ Błąd podczas odczytywania danych zamówienia:', error)
          }
        }
      }
    }
  }, [])
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, touchedFields, isValid },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      sameAsShipping: true,
      termsAccepted: false,
      newsletter: false,
      paymentMethod: 'p24', // Domyślnie P24 (jedyna opcja)
    },
    mode: "onBlur", // Lepsze UX - walidacja przy blur
  })

  // Wymuś ustawienie paymentMethod na p24 natychmiast
  React.useEffect(() => {
    console.log('🔄 Force setting paymentMethod to p24')
    setValue('paymentMethod', 'p24')
    // Wyczyść localStorage z starymi danymi płatności
    try {
      const savedData = localStorage.getItem('checkout-data')
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        if (parsedData.paymentMethod && parsedData.paymentMethod !== 'p24') {
          console.log('🧹 Force cleaning old paymentMethod from localStorage:', parsedData.paymentMethod)
          delete parsedData.paymentMethod
          localStorage.setItem('checkout-data', JSON.stringify(parsedData))
        }
      }
    } catch (error) {
      console.log('Error cleaning localStorage:', error)
    }
  }, [])

  const sameAsShipping = watch("sameAsShipping")
  const selectedShipping = watch("shippingMethod")
  const shippingCost = 0 // Wysyłka darmowa - nie doliczamy kosztu
  
  // Oblicz total na podstawie koszyka
  const cartTotal = cartItems.reduce((sum, product) => sum + product.subtotal, 0);
  const subtotal = cartTotal;
  const total = subtotal // Bez kosztu wysyłki

  // Watch all form fields for real-time validation
  const watchedFields = watch()
  
  // Debug log dla paymentMethod
  useEffect(() => {
    console.log('🔄 Payment method changed:', watchedFields.paymentMethod);
  }, [watchedFields.paymentMethod])

  // Ustaw paymentMethod na P24 (jedyna opcja) - na początku
  useEffect(() => {
    console.log('🔄 Setting paymentMethod to p24')
    setValue('paymentMethod', 'p24')
    // Wyczyść localStorage z starymi danymi płatności
    const savedData = localStorage.getItem('checkout-data')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        if (parsedData.paymentMethod && parsedData.paymentMethod !== 'p24') {
          console.log('🧹 Cleaning old paymentMethod from localStorage:', parsedData.paymentMethod)
          delete parsedData.paymentMethod
          localStorage.setItem('checkout-data', JSON.stringify(parsedData))
        }
      } catch (error) {
        console.log('Error cleaning localStorage:', error)
      }
    }
  }, [setValue])

  // Auto-save functionality
  useEffect(() => {
    const savedData = localStorage.getItem('checkout-data')
    if (savedData && currentStep === 1) {
      try {
        const parsedData = JSON.parse(savedData)
        console.log('🔄 Loading data from localStorage:', parsedData)
        Object.keys(parsedData).forEach(key => {
          // Nie nadpisuj paymentMethod jeśli jest tylko jedna opcja (P24)
          if (key !== 'paymentMethod') {
            console.log('🔄 Setting field from localStorage:', key, parsedData[key])
            setValue(key as keyof CheckoutFormData, parsedData[key])
          } else {
            console.log('🔄 Skipping paymentMethod from localStorage:', parsedData[key])
          }
        })
        // Wymuś ustawienie paymentMethod na p24 po załadowaniu danych
        console.log('🔄 Force setting paymentMethod to p24 after localStorage load')
        setValue('paymentMethod', 'p24')
      } catch (error) {
        console.log('No saved data found')
      }
    }
  }, [setValue, currentStep])

  // Save data on every change
  useEffect(() => {
    const dataToSave = {
      firstName: watchedFields.firstName || '',
      lastName: watchedFields.lastName || '',
      email: watchedFields.email || '',
      phone: watchedFields.phone || '',
      street: watchedFields.street || '',
      postalCode: watchedFields.postalCode || '',
      city: watchedFields.city || '',
      country: watchedFields.country || '',
      sameAsShipping: watchedFields.sameAsShipping,
      companyName: watchedFields.companyName || '',
      nip: watchedFields.nip || '',
      shippingMethod: watchedFields.shippingMethod || '',
      paymentMethod: watchedFields.paymentMethod || '',
      termsAccepted: watchedFields.termsAccepted,
      newsletter: watchedFields.newsletter,
    }
    localStorage.setItem('checkout-data', JSON.stringify(dataToSave))
  }, [watchedFields])

  // Helper function to determine field border color
  const getFieldBorderColor = (fieldName: keyof CheckoutFormData) => {
    const fieldError = errors[fieldName]
    
    if (fieldError) {
      return "border-red-500" // Error state
    }
    
    return "border-gray-700" // Default state
  }

  // Helper function to determine field focus color
  const getFieldFocusColor = (fieldName: keyof CheckoutFormData) => {
    const fieldError = errors[fieldName]
    
    if (fieldError) {
      return "focus:border-red-500 focus:ring-red-500/20"
    }
    
    return "focus:border-red-500 focus:ring-red-500/20"
  }

  // Check if step is completed
  const isStepCompleted = (step: number) => {
    switch (step) {
      case 1:
        return !!(watchedFields.firstName && watchedFields.lastName && watchedFields.email && watchedFields.phone && !errors.firstName && !errors.lastName && !errors.email && !errors.phone)
      case 2:
        return !!(watchedFields.street && watchedFields.postalCode && watchedFields.city && watchedFields.country && !errors.street && !errors.postalCode && !errors.city && !errors.country)
      case 3:
        return !!(watchedFields.shippingMethod && watchedFields.paymentMethod && watchedFields.termsAccepted && !errors.shippingMethod && !errors.paymentMethod && !errors.termsAccepted)
      default:
        return false
    }
  }

  // Navigation functions
  const nextStep = async () => {
    if (currentStep < 4) {
      const fieldsToValidate = getFieldsForStep(currentStep)
      const isValid = await trigger(fieldsToValidate)
      
      if (isValid) {
        setCurrentStep(currentStep + 1)
        // Scroll to top on mobile
        if (window.innerWidth < 1024) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && event.ctrlKey) {
        event.preventDefault()
        if (currentStep < 4) {
          nextStep()
        } else {
          // Handle form submission
          const form = document.querySelector('form')
          if (form) {
            form.requestSubmit()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [currentStep])

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      // Scroll to top on mobile
      if (window.innerWidth < 1024) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const getFieldsForStep = (step: number): (keyof CheckoutFormData)[] => {
    switch (step) {
      case 1:
        return ['firstName', 'lastName', 'email', 'phone']
      case 2:
        return ['street', 'postalCode', 'city', 'country']
      case 3:
        return ['shippingMethod', 'paymentMethod', 'termsAccepted']
      default:
        return []
    }
  }

  const onSubmit = async (data: CheckoutFormData) => {
    console.log('🚀 onSubmit called with data:', data);
    console.log('🚀 Payment method in onSubmit:', data.paymentMethod);
    console.log('🚀 Current watched payment method:', watchedFields.paymentMethod);
    console.log('🚀 cartItems:', cartItems);
    setIsLoading(true)
    setErrorMessage("")
    
    try {
      // Sprawdź czy są produkty w koszyku
      if (cartItems.length === 0) {
        console.log('❌ Cart is empty');
        setErrorMessage("Koszyk jest pusty. Dodaj produkty przed złożeniem zamówienia.");
        return;
      }

      // Przygotuj dane klienta
      const customerData: CustomerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.street,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country || 'Polska'
      };

      // Przygotuj dane dostawy
      const selectedShipping = shippingMethods.find(m => m.id === data.shippingMethod);
      const shippingData: ShippingData = {
        method: data.shippingMethod,
        methodName: selectedShipping?.name || '',
        cost: 0, // Wysyłka darmowa - nie doliczamy kosztu
        estimatedDelivery: selectedShipping?.description || ''
      };

      // Przygotuj dane płatności
      const paymentData: PaymentData = {
        method: data.paymentMethod,
        methodName: 'Przelew Bankowy (Przelewy24)'
      };

      // Utwórz i zapisz zamówienie (createOrder już zapisuje do bazy)
      const savedOrder = await createOrder(
        cartItems,
        customerData,
        shippingData,
        paymentData
      );

      console.log('🔄 Order created successfully:', savedOrder.id);

      // Integracja z Przelewy24
      console.log('🔄 Payment method:', data.paymentMethod);
      if (data.paymentMethod === 'p24') {
        try {
          console.log('🔄 Starting P24 payment registration via API endpoint...');
          
          // Wywołaj API endpoint dla rejestracji płatności P24
          const response = await fetch('/api/payments/p24/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: savedOrder.id })
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
          }

          if (!result.success) {
            throw new Error(result.error || 'Błąd rejestracji płatności');
          }

          console.log('✅ P24 payment registered via API endpoint:', result.paymentUrl);
          
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
        console.log('❌ Payment method is not p24:', data.paymentMethod);
        setErrorMessage(`Nieprawidłowa metoda płatności: ${data.paymentMethod}`);
        return;
      }

      // Fallback - nie powinno się zdarzyć
      console.log('⚠️ Unknown payment method:', data.paymentMethod);
      setErrorMessage('Nieznana metoda płatności');

      // Aktualizuj słownik z danymi klienta (stara logika - do usunięcia w przyszłości)
      if (configuratorDictionary) {
        const updatedDictionary = {
          ...configuratorDictionary,
          customer: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            address: data.street,
            city: data.city,
            postalCode: data.postalCode,
            country: data.country || 'Polska',
            isComplete: true,
          },
          shipping: {
            method: data.shippingMethod,
            methodName: shippingMethods.find(m => m.id === data.shippingMethod)?.name || '',
            cost: 0, // Wysyłka darmowa - nie doliczamy kosztu
            estimatedDelivery: shippingMethods.find(m => m.id === data.shippingMethod)?.description || '',
            isComplete: true,
          },
          payment: {
            method: data.paymentMethod,
            methodName: data.paymentMethod === 'p24' ? 'Przelew Bankowy (P24)' : 
                       data.paymentMethod === 'card' ? 'Karta kredytowa' : 
                       data.paymentMethod === 'transfer' ? 'Przelew bankowy' : 
                       data.paymentMethod === 'blik' ? 'BLIK' : 'Pobranie',
            isComplete: true,
          },
          company: {
            name: data.companyName || '',
            nip: data.nip || '',
            isInvoice: !data.sameAsShipping,
            isComplete: !data.sameAsShipping ? !!(data.companyName && data.nip) : true,
          },
          additional: {
            termsAccepted: data.termsAccepted,
            newsletter: data.newsletter,
            discountCode: discountCode,
            discountApplied: discountApplied,
            discountAmount: discountApplied ? (total * 0.1) : 0,
            notes: '',
          },
          metadata: {
            ...configuratorDictionary.metadata,
            orderFinalized: true,
            lastUpdated: new Date(),
          }
        };
        
        setConfiguratorDictionary(updatedDictionary);
        console.log('📋 Finalny słownik z danymi klienta:', updatedDictionary);
        
        // Zapisz dane używając HybridSessionManager
        const sessionIdParam = new URLSearchParams(window.location.search).get('sessionId');
        if (sessionIdParam && HybridSessionManager.isValidSession(sessionIdParam as string)) {
          await HybridSessionManager.saveData(sessionIdParam as string, updatedDictionary, 'order');
          console.log('💾 Zapisano dane zamówienia w HybridSessionManager');
        }
        
        // Tutaj można wysłać dane do Bitrix24
        // await sendOrderToBitrix(updatedDictionary);
      }
      
      // Symulacja procesu płatności
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log("Dane zamówienia:", data)
      // Clear saved data after successful submission
      localStorage.removeItem('checkout-data')
      
      // Pokaż potwierdzenie
      setShowConfirmation(true)
    } catch (error) {
      setErrorMessage("Wystąpił błąd podczas przetwarzania płatności. Spróbuj ponownie.")
    } finally {
      setIsLoading(false)
    }
  }

  const applyDiscountCode = () => {
    if (discountCode.toLowerCase() === "welcome10") {
      setDiscountApplied(true)
      alert("Kod rabatowy został zastosowany! (10% zniżki)")
    } else {
      alert("Nieprawidłowy kod rabatowy")
    }
  }

  // Progress indicator component
  const ProgressIndicator = () => (
    <div className="mb-4 md:mb-6 sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-neutral-800 pb-4 md:pb-6 -mx-4 px-4 md:-mx-6 md:px-6">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {checkoutSteps.map((step, index) => {
          const isActive = currentStep === step.id
          const isCompleted = isStepCompleted(step.id)
          
          return (
            <div key={step.id} className="flex items-center group">
              <div className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 relative
                  ${isActive ? 'bg-red-600 text-white' : 
                    isCompleted ? 'bg-green-600 text-white' : 
                    'bg-gray-700 text-gray-400'}
                `}>
                  <span className="text-sm font-bold">{step.id}</span>
                </div>
                <div className="text-center mt-2">
                  <span className={`
                    text-sm font-medium block transition-colors
                    ${isActive ? 'text-white' : 
                      isCompleted ? 'text-green-400' : 
                      'text-gray-400'}
                  `}>
                    {step.title}
                  </span>
                </div>
              </div>
              {index < checkoutSteps.length - 1 && (
                <div className={`
                  w-16 h-0.5 mx-4 transition-all duration-300
                  ${isCompleted ? 'bg-green-600' : 'bg-gray-700'}
                `} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  // Ekran potwierdzenia
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-black py-8 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-black/40 backdrop-blur border-gray-800 shadow-2xl rounded-2xl p-8 animate-bounce-in">
            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl font-bold">✓</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Zamówienie złożone!
            </h1>
            <p className="text-gray-300 text-lg mb-6">
              Dziękujemy za zakup. Potwierdzenie zostało wysłane na adres <span className="text-red-400 font-medium">{watchedFields.email}</span>
            </p>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg p-6 border border-green-500/30">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <p className="text-white font-bold text-lg">Numer zamówienia: #EVA-{Date.now().toString().slice(-6)}</p>
                </div>
                <p className="text-green-300 text-sm">Szacowany czas dostawy: 2-3 dni robocze</p>
                <p className="text-green-300 text-sm mt-1">Śledzenie przesyłki zostanie wysłane SMS-em</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Wróć do sklepu
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.print()}
                  className="border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                >
                  Drukuj potwierdzenie
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-400" aria-label="Nawigacja">
            <Link href="/" className="hover:text-red-400 transition-colors">
              Strona główna
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-600">/</span>
            <span className="text-red-400">
              Finalizacja zamówienia
            </span>
          </nav>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Finalizacja zamówienia
          </h1>
          <p className="text-gray-300 text-lg">
            Krok {currentStep} z {checkoutSteps.length} • Prawie gotowe!
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator />

        <form onSubmit={handleSubmit(
          (data) => {
            console.log('📝 Form submitted with valid data:', data);
            onSubmit(data);
          },
          (errors) => {
            console.log('❌ Form validation errors:', errors);
          }
        )} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formularz klienta */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Step 1: Dane kontaktowe */}
            {currentStep === 1 && (
              <Card className="bg-black/40 backdrop-blur border-gray-800 shadow-2xl hover:shadow-red-500/10 transition-all duration-300 animate-slide-in-left">
                <CardHeader className="border-b border-gray-800">
                  <CardTitle className="text-xl text-white">
                    Dane kontaktowe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-5 pt-4 md:pt-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-300">Imię *</Label>
                      <Input
                        id="firstName"
                        {...register("firstName")}
                        placeholder="Jan"
                        aria-label="Imię"
                        aria-describedby={errors.firstName ? "firstName-error" : undefined}
                        className={`bg-gray-900/50 text-white placeholder-gray-400 transition-all duration-300 ${getFieldBorderColor("firstName")} ${getFieldFocusColor("firstName")}`}
                      />
                      {errors.firstName && (
                        <p id="firstName-error" className="text-red-400 text-sm mt-1" role="alert">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-300">Nazwisko *</Label>
                      <Input
                        id="lastName"
                        {...register("lastName")}
                        placeholder="Kowalski"
                        className={`bg-gray-900/50 text-white placeholder-gray-400 transition-all duration-300 ${getFieldBorderColor("lastName")} ${getFieldFocusColor("lastName")}`}
                      />
                      {errors.lastName && (
                        <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="jan.kowalski@example.com"
                        className={`bg-gray-900/50 text-white placeholder-gray-400 transition-all duration-300 ${getFieldBorderColor("email")} ${getFieldFocusColor("email")}`}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-300">Telefon *</Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        placeholder="+48 123 456 789"
                        className={`bg-gray-900/50 text-white placeholder-gray-400 transition-all duration-300 ${getFieldBorderColor("phone")} ${getFieldFocusColor("phone")}`}
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Adres wysyłkowy */}
            {currentStep === 2 && (
              <Card className="bg-black/40 backdrop-blur border-gray-800 shadow-2xl hover:shadow-red-500/10 transition-all duration-300 animate-slide-in-right">
                <CardHeader className="border-b border-gray-800">
                  <CardTitle className="text-xl text-white">
                    Adres wysyłkowy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-5 pt-4 md:pt-5">
                  <div className="space-y-2">
                    <Label htmlFor="street" className="text-gray-300">Ulica i numer *</Label>
                    <Input
                      id="street"
                      {...register("street")}
                      placeholder="ul. Przykładowa 123"
                      className={`bg-gray-900/50 text-white placeholder-gray-400 transition-all duration-300 ${getFieldBorderColor("street")} ${getFieldFocusColor("street")}`}
                    />
                    {errors.street && (
                      <p className="text-red-400 text-sm mt-1">{errors.street.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-gray-300">Kod pocztowy *</Label>
                      <Input
                        id="postalCode"
                        {...register("postalCode")}
                        placeholder="00-000"
                        className={`bg-gray-900/50 text-white placeholder-gray-400 transition-all duration-300 ${getFieldBorderColor("postalCode")} ${getFieldFocusColor("postalCode")}`}
                      />
                      {errors.postalCode && (
                        <p className="text-red-400 text-sm mt-1">{errors.postalCode.message}</p>
                      )}
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="city" className="text-gray-300">Miasto *</Label>
                      <Input
                        id="city"
                        {...register("city")}
                        placeholder="Warszawa"
                        className={`bg-gray-900/50 text-white placeholder-gray-400 transition-all duration-300 ${getFieldBorderColor("city")} ${getFieldFocusColor("city")}`}
                      />
                      {errors.city && (
                        <p className="text-red-400 text-sm mt-1">{errors.city.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-gray-300">Kraj *</Label>
                    <Input
                      id="country"
                      {...register("country")}
                      placeholder="Polska"
                      className={`bg-gray-900/50 text-white placeholder-gray-400 transition-all duration-300 ${getFieldBorderColor("country")} ${getFieldFocusColor("country")}`}
                    />
                    {errors.country && (
                      <p className="text-red-400 text-sm mt-1">{errors.country.message}</p>
                    )}
                  </div>

                  {/* Dane do faktury */}
                  <div className="pt-6 border-t border-gray-700">
                    <CardTitle className="text-lg text-white mb-4">
                      Dane do faktury
                    </CardTitle>
                    <div className="flex items-center space-x-3 p-4 bg-gray-900/30 rounded-lg border border-gray-700">
                      <Checkbox
                        id="sameAsShipping"
                        checked={sameAsShipping}
                        onCheckedChange={(checked) => setValue("sameAsShipping", checked as boolean)}
                        className="border-gray-600 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                      />
                      <Label htmlFor="sameAsShipping" className="text-gray-300 cursor-pointer">
                        📋 Dane do faktury są takie same jak adres wysyłkowy
                      </Label>
                    </div>
                    
                    {!sameAsShipping && (
                      <div className="space-y-4 md:space-y-5 pt-3 md:pt-4 animate-fade-in">
                        <div className="space-y-2">
                          <Label htmlFor="companyName" className="text-gray-300">🏢 Nazwa firmy</Label>
                          <Input
                            id="companyName"
                            {...register("companyName")}
                            placeholder="Nazwa firmy (opcjonalnie)"
                            className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20 transition-all duration-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nip" className="text-gray-300">📄 NIP</Label>
                          <Input
                            id="nip"
                            {...register("nip")}
                            placeholder="NIP (opcjonalnie)"
                            className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20 transition-all duration-300"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Dostawa i płatność */}
            {currentStep === 3 && (
              <div className="space-y-4 md:space-y-6 animate-scale-in">
                {/* Metoda dostawy */}
                <Card className="bg-black/40 backdrop-blur border-gray-800 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
                  <CardHeader className="border-b border-gray-800">
                                      <CardTitle className="text-xl text-white">
                    Metoda dostawy
                  </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <RadioGroup
                      value={watch("shippingMethod")}
                      onValueChange={(value) => setValue("shippingMethod", value)}
                      className="space-y-4"
                    >
                      {shippingMethods.map((method) => {
                        const Icon = method.icon
                        return (
                          <div key={method.id} className="flex items-center space-x-4 p-4 bg-gray-900/30 border border-gray-700 rounded-lg hover:bg-gray-800/50 hover:border-red-500/50 transition-all duration-300 group">
                            <RadioGroupItem value={method.id} id={method.id} className="border-gray-600 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500" />
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                                <Icon className="h-5 w-5 text-red-400" />
                              </div>
                              <div className="flex-1">
                                <Label htmlFor={method.id} className="text-base font-medium cursor-pointer text-white">
                                  {method.name}
                                </Label>
                                <p className="text-sm text-gray-400">{method.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-white">
                                Darmowa
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </RadioGroup>
                    {errors.shippingMethod && (
                      <p className="text-red-400 text-sm mt-2">{errors.shippingMethod.message}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Metoda płatności */}
                <Card className="bg-black/40 backdrop-blur border-gray-800 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
                  <CardHeader className="border-b border-gray-800">
                                      <CardTitle className="text-xl text-white flex items-center gap-3">
                    <PaymentIcon className="h-6 w-6 text-red-400" />
                    💳 Metoda płatności
                  </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <RadioGroup
                      value={watch("paymentMethod")}
                      onValueChange={(value) => setValue("paymentMethod", value)}
                      className="space-y-4"
                    >
                      {paymentMethods.map((method) => {
                        const Icon = method.icon
                        return (
                          <div key={method.id} className="flex items-center space-x-4 p-4 bg-gray-900/30 border border-gray-700 rounded-lg hover:bg-gray-800/50 hover:border-red-500/50 transition-all duration-300 group">
                            <RadioGroupItem value={method.id} id={`payment-${method.id}`} className="border-gray-600 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500" />
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                                <Icon className="h-5 w-5 text-red-400" />
                              </div>
                              <div>
                                <Label htmlFor={`payment-${method.id}`} className="text-base font-medium cursor-pointer text-white">
                                  {method.name}
                                </Label>
                                <p className="text-sm text-gray-400">{method.description}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </RadioGroup>
                    {errors.paymentMethod && (
                      <p className="text-red-400 text-sm mt-2">{errors.paymentMethod.message}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Checkboxy */}
                <Card className="bg-black/40 backdrop-blur border-gray-800 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
                  <CardContent className="space-y-4 md:space-y-5 pt-4 md:pt-5">
                    <div className="flex items-start space-x-3 p-4 bg-gray-900/30 rounded-lg border border-gray-700">
                      <Checkbox
                        id="termsAccepted"
                        checked={watch("termsAccepted")}
                        onCheckedChange={(checked) => setValue("termsAccepted", checked as boolean)}
                        className="border-gray-600 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 mt-1"
                      />
                      <div className="space-y-2">
                        <Label htmlFor="termsAccepted" className="text-sm text-gray-300">
                          ✅ Akceptuję{" "}
                          <a href="/regulamin" className="text-red-400 hover:text-red-300 underline transition-colors">
                            regulamin
                          </a>{" "}
                          i{" "}
                          <a href="/polityka-prywatnosci" className="text-red-400 hover:text-red-300 underline transition-colors">
                            politykę prywatności
                          </a>{" "}
                          *
                        </Label>
                        {errors.termsAccepted && (
                          <p className="text-red-400 text-sm">{errors.termsAccepted.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-gray-900/30 rounded-lg border border-gray-700">
                      <Checkbox
                        id="newsletter"
                        checked={watch("newsletter")}
                        onCheckedChange={(checked) => setValue("newsletter", checked as boolean)}
                        className="border-gray-600 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 mt-1"
                      />
                      <Label htmlFor="newsletter" className="text-sm text-gray-300">
                        📧 Zapisz mnie do newslettera (📢 otrzymasz informacje o nowościach i promocjach)
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Podsumowanie */}
            {currentStep === 4 && (
              <div className="space-y-4 md:space-y-5 animate-bounce-in">
                <Card className="bg-black/40 backdrop-blur border-gray-800 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
                  <CardHeader className="border-b border-gray-800">
                                      <CardTitle className="text-xl text-white">
                    Podsumowanie zamówienia
                  </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4 md:space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                          <h4 className="text-white font-semibold mb-3">
                            Dane kontaktowe
                          </h4>
                          <div className="text-gray-300 text-sm space-y-1">
                            <p className="font-medium">{watchedFields.firstName} {watchedFields.lastName}</p>
                            <p>{watchedFields.email}</p>
                            <p>{watchedFields.phone}</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentStep(1)}
                            className="mt-3 border-gray-600 text-gray-300 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
                          >
                            ✏️ Edytuj
                          </Button>
                        </div>
                        <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                          <h4 className="text-white font-semibold mb-3">
                            Adres dostawy
                          </h4>
                          <div className="text-gray-300 text-sm space-y-1">
                            <p className="font-medium">{watchedFields.street}</p>
                            <p>{watchedFields.postalCode} {watchedFields.city}</p>
                            <p>{watchedFields.country}</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentStep(2)}
                            className="mt-3 border-gray-600 text-gray-300 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
                          >
                            ✏️ Edytuj
                          </Button>
                        </div>
                      </div>
                      <Separator className="bg-gray-700" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Truck className="h-4 w-4 text-red-400" />
                            🚚 Metoda dostawy
                          </h4>
                          <div className="text-gray-300 text-sm">
                            <p className="font-medium">{shippingMethods.find(m => m.id === watchedFields.shippingMethod)?.name}</p>
                            <p className="text-gray-400">{shippingMethods.find(m => m.id === watchedFields.shippingMethod)?.description}</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentStep(3)}
                            className="mt-3 border-gray-600 text-gray-300 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
                          >
                            Edytuj
                          </Button>
                        </div>
                        <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-red-400" />
                            💳 Metoda płatności
                          </h4>
                          <div className="text-gray-300 text-sm">
                            <p className="font-medium">{paymentMethods.find(m => m.id === watchedFields.paymentMethod)?.name}</p>
                            <p className="text-gray-400">{paymentMethods.find(m => m.id === watchedFields.paymentMethod)?.description}</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentStep(3)}
                            className="mt-3 border-gray-600 text-gray-300 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
                          >
                            ✏️ Edytuj
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Final confirmation card */}
                <Card className="bg-gradient-to-r from-red-900/20 to-red-800/20 backdrop-blur border-red-500/30 shadow-2xl hover:shadow-red-500/20 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Check className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">🎯 Wszystko gotowe!</h3>
                      <p className="text-gray-300 mb-4">
                        👀 Sprawdź powyższe dane i kliknij &quot;Zapłać teraz&quot; aby sfinalizować zamówienie.
                      </p>
                      <div className="bg-black/30 rounded-lg p-4 border border-gray-700">
                        <p className="text-white font-medium">💰 Łączna kwota do zapłaty:</p>
                        <p className="text-3xl font-bold text-red-400">
                          {discountApplied ? (total * 0.9).toFixed(2) : total.toFixed(2)} zł
                        </p>
                        {discountApplied && (
                          <p className="text-green-400 text-sm mt-1">🎉 Oszczędzasz {(total * 0.1).toFixed(2)} zł!</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Error message */}
            {errorMessage && (
              <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded-lg animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">!</span>
                  </div>
                  <p className="text-red-400 text-sm font-medium">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-6">
              <div className="flex space-x-4">
                <Button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ← Wstecz
                </Button>
                
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white transition-all duration-300"
                  >
                    ❌ Anuluj zamówienie
                  </Button>
                )}
              </div>
              
              {currentStep < 4 ? (
                <div className="relative group">
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Przetwarzanie...
                      </>
                    ) : (
                                          <>
                      Dalej →
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                    )}
                  </Button>
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                    Ctrl + Enter
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    onClick={() => console.log('🔘 Submit button clicked')}
                    className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white border-0 shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Przetwarzanie płatności...
                      </>
                    ) : (
                                          <>
                      💳 Zapłać teraz
                      <CreditCard className="w-4 h-4 ml-2" />
                    </>
                    )}
                  </Button>
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                    Ctrl + Enter
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Podsumowanie zamówienia - Desktop */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              {/* Mobile floating summary */}
              <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
                <Card className="bg-black/90 backdrop-blur border-gray-800 shadow-2xl">
                  <CardHeader 
                    className="cursor-pointer border-b border-gray-800 pb-2"
                    onClick={() => setIsMobileSummaryVisible(!isMobileSummaryVisible)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-sm font-bold">{currentStep}</span>
                        </div>
                        <div>
                          <CardTitle className="text-sm text-white">Podsumowanie zamówienia</CardTitle>
                          <p className="text-xs text-gray-400">Krok {currentStep} z {checkoutSteps.length}</p>
                          <p className="text-sm font-semibold text-red-400">{discountApplied ? (total * 0.9).toFixed(2) : total.toFixed(2)} zł</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        {isMobileSummaryVisible ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {isMobileSummaryVisible && (
                    <CardContent className="pt-2 animate-fade-in">
                      <OrderSummaryContent 
                        cartProducts={cartItems}
                        shippingCost={shippingCost}
                        total={total}
                        discountCode={discountCode}
                        setDiscountCode={setDiscountCode}
                        applyDiscountCode={applyDiscountCode}
                        discountApplied={discountApplied}
                      />
                    </CardContent>
                  )}
                </Card>
              </div>

              {/* Desktop fixed summary */}
              <div className="hidden lg:block">
                <Card className="bg-black/40 backdrop-blur border-gray-800 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
                  <CardHeader className="border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-white">Podsumowanie zamówienia</CardTitle>
                      <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <OrderSummaryContent 
                      cartProducts={cartItems}
                      shippingCost={shippingCost}
                      total={total}
                      discountCode={discountCode}
                      setDiscountCode={setDiscountCode}
                      applyDiscountCode={applyDiscountCode}
                      discountApplied={discountApplied}
                    />
                  </CardContent>
                </Card>

                {/* Trust elements */}
                <div className="mt-6 space-y-4">
                  <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg border border-gray-700 p-4 hover:border-red-500/50 transition-all duration-300 group">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                        <Shield className="h-5 w-5 text-red-400" />
                      </div>
                      <span className="text-white font-medium">🛡️ Bezpieczne płatności</span>
                    </div>
                    <p className="text-gray-400 text-sm">🔒 Szyfrowanie SSL 256-bit, certyfikat bezpieczeństwa</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg border border-gray-700 p-4 hover:border-red-500/50 transition-all duration-300 group">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                        <RotateCcw className="h-5 w-5 text-red-400" />
                      </div>
                      <span className="text-white font-medium">🔄 30 dni na zwrot</span>
                    </div>
                    <p className="text-gray-400 text-sm">💯 Pełny zwrot pieniędzy bez podania przyczyny</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg border border-gray-700 p-4 hover:border-red-500/50 transition-all duration-300 group">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                        <Star className="h-5 w-5 text-red-400" />
                      </div>
                      <span className="text-white font-medium">⭐ 4.9/5 - Opinie klientów</span>
                    </div>
                    <p className="text-gray-400 text-sm">👥 Ponad 10,000 zadowolonych klientów</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg border border-gray-700 p-4 hover:border-red-500/50 transition-all duration-300 group">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                        <Truck className="h-5 w-5 text-red-400" />
                      </div>
                      <span className="text-white font-medium">🚚 Szybka dostawa</span>
                    </div>
                    <p className="text-gray-400 text-sm">⚡ Dostawa w ciągu 24-48h w całej Polsce</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// Komponent podsumowania zamówienia
interface OrderSummaryContentProps {
  cartProducts: CartItem[]
  shippingCost: number
  total: number
  discountCode: string
  setDiscountCode: (code: string) => void
  applyDiscountCode: () => void
  discountApplied: boolean
}

function OrderSummaryContent({
  cartProducts: cartItems,
  shippingCost,
  total,
  discountCode,
  setDiscountCode,
  applyDiscountCode,
  discountApplied
}: OrderSummaryContentProps) {
  return (
    <div className="space-y-6">
      {/* Produkty */}
      {cartItems.map((product, index) => (
        <div key={product.id || index} className="flex space-x-4 p-4 bg-gradient-to-r from-gray-900/40 to-gray-800/40 rounded-lg border border-gray-700 hover:border-red-500/50 transition-all duration-300 group">
          <div className="relative">
            <img
              src={product.productImage || "/images/products/bmw.png"}
              alt={product.productName}
              className="w-16 h-16 object-cover rounded-lg border border-gray-600 group-hover:border-red-500 transition-colors"
            />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">1</span>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm text-white group-hover:text-red-400 transition-colors">{product.productName}</h4>
            <p className="text-gray-400 text-sm">Wysokiej jakości EVA</p>
            <p className="font-semibold text-white text-lg">{product.subtotal.toFixed(2)} zł</p>
          </div>
        </div>
      ))}

      <Separator className="bg-gray-700" />

      {/* Kod rabatowy */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="discountCode" className="text-sm text-gray-300">Kod rabatowy</Label>
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
        </div>
        <div className="flex space-x-2">
          <Input
            id="discountCode"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="np. WELCOME10"
            className="flex-1 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20"
          />
          <Button 
            type="button" 
            onClick={applyDiscountCode}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
          >
            ✅ Zastosuj
          </Button>
        </div>
        {discountApplied && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
            <p className="text-green-400 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" />
              🎉 Kod rabatowy zastosowany! (10% zniżki)
            </p>
          </div>
        )}
      </div>

      <Separator className="bg-gray-700" />

      {/* Podsumowanie kosztów */}
      <div className="space-y-4">
        <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Wartość produktów:</span>
              <span className="text-white font-medium">{cartItems.reduce((sum, product) => sum + product.subtotal, 0).toFixed(2)} zł</span>
            </div>
            {discountApplied && (
              <div className="flex justify-between text-sm text-red-400 bg-red-900/20 rounded-lg p-2">
                <span>Zniżka (10%):</span>
                <span className="font-medium">-{(total * 0.1).toFixed(2)} zł</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-lg p-4 border border-red-500/30">
          <div className="flex justify-between items-center">
            <span className="text-white font-semibold text-lg">Łącznie:</span>
            <span className="text-red-400 font-bold text-2xl">
              {discountApplied ? (total * 0.9).toFixed(2) : total.toFixed(2)} zł
            </span>
          </div>
          {discountApplied && (
            <p className="text-red-300 text-sm mt-1">Oszczędzasz {(total * 0.1).toFixed(2)} zł!</p>
          )}
        </div>
      </div>
    </div>
  )
} 